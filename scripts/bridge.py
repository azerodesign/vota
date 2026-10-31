# VOTA Realtime ADB Bridge (Python)
import subprocess, time, json, urllib.request, re, sys

SERVER_URL = "__SERVER_URL__"
KEY = sys.argv[1] if len(sys.argv) > 1 else ("__DEFAULT_KEY__" if "__DEFAULT_KEY__" != "__" + "DEFAULT_KEY__" else "")
REPORT_URL = f"{SERVER_URL}/api/bridge/report" + (f"?key={KEY}" if KEY else "")
RESULT_URL = f"{SERVER_URL}/api/bridge/result" + (f"?key={KEY}" if KEY else "")

def run_adb(cmd):
    try:
        p = subprocess.run(f"adb {cmd}", shell=True, capture_output=True, text=True, timeout=5)
        return p.stdout.strip()
    except Exception as e:
        return ""

print("==================================================")
print(" VOTA Real-Time ADB Engine (Python)               ")
print(f" Live Dashboard: {SERVER_URL}                    ")
print("==================================================")

device_info = None

def get_device_info():
    raw_serial = run_adb("get-serialno")
    for line in raw_serial.splitlines():
        s = line.strip()
        if s and not s.startswith("*") and s != "unknown":
            brand = run_adb("shell getprop ro.product.brand") or "Android"
            model = run_adb("shell getprop ro.product.model") or "Device"
            version = run_adb("shell getprop ro.build.version.release") or "Unknown"
            return {"serial": s, "brand": brand, "model": model, "version": version}
    return None

last_interval_ms = 2000
prev_cpu_stat = None

while True:
    t_start = time.time()
    try:
        if not device_info:
            device_info = get_device_info()
            if device_info:
                print(f"[DEVICE CONNECTED] {device_info['brand']} {device_info['model']} ({device_info['serial']}) Android {device_info['version']}")
            else:
                print("[WAITING] Menunggu otorisasi USB Debugging ponsel...")

        batt = run_adb("shell dumpsys battery")
        level_m = re.search(r"^\s*level:\s*(\d+)", batt, re.MULTILINE)
        scale_m = re.search(r"^\s*scale:\s*(\d+)", batt, re.MULTILINE)
        temp_m = re.search(r"^\s*temperature:\s*(\d+)", batt, re.MULTILINE)
        status_m = re.search(r"^\s*status:\s*(\d+)", batt, re.MULTILINE)
        health_m = re.search(r"^\s*health:\s*(\d+)", batt, re.MULTILINE)
        volt_m = re.search(r"^\s*voltage:\s*(\d+)", batt, re.MULTILINE)

        raw_level = int(level_m.group(1)) if level_m else None
        scale = int(scale_m.group(1)) if scale_m else 100
        level = round((raw_level / scale) * 100) if (raw_level is not None and scale > 0) else raw_level
        temp = round(int(temp_m.group(1)) / 10.0, 1) if temp_m else None
        voltage = int(volt_m.group(1)) if volt_m else None

        status_code = int(status_m.group(1)) if status_m else None
        status_map = {2: "Charging", 3: "Discharging", 4: "Not charging", 5: "Full"}
        b_status = status_map.get(status_code, "Discharging")

        health_code = int(health_m.group(1)) if health_m else 2
        health_map = {2: "Good", 3: "Overheat", 4: "Dead", 5: "Over voltage", 6: "Unspecified failure", 7: "Cold"}
        b_health = health_map.get(health_code, "Good")

        mem = run_adb("shell cat /proc/meminfo")
        total_m = re.search(r"MemTotal:\s*(\d+)", mem)
        avail_m = re.search(r"MemAvailable:\s*(\d+)", mem)
        free_m = re.search(r"MemFree:\s*(\d+)", mem)
        buff_m = re.search(r"Buffers:\s*(\d+)", mem)
        cached_m = re.search(r"^Cached:\s*(\d+)", mem, re.MULTILINE)
        swaptotal_m = re.search(r"SwapTotal:\s*(\d+)", mem)
        swapfree_m = re.search(r"SwapFree:\s*(\d+)", mem)

        total_kb = int(total_m.group(1)) if total_m else None
        avail_kb = int(avail_m.group(1)) if avail_m else None
        free_kb = int(free_m.group(1)) if free_m else None
        buff_kb = int(buff_m.group(1)) if buff_m else None
        cached_kb = int(cached_m.group(1)) if cached_m else None
        swaptotal_kb = int(swaptotal_m.group(1)) if swaptotal_m else None
        swapfree_kb = int(swapfree_m.group(1)) if swapfree_m else None
        ram_pct = round(((total_kb - avail_kb) / total_kb) * 100) if (total_kb and avail_kb) else None

        df_out = run_adb("shell df -k /data | tail -n 1").split()
        st_total = round(int(df_out[1]) / 1048576, 2) if len(df_out) >= 5 else None
        st_used = round(int(df_out[2]) / 1048576, 2) if len(df_out) >= 5 else None
        st_free = round(int(df_out[3]) / 1048576, 2) if len(df_out) >= 5 else None
        st_pct = int(df_out[4].replace("%", "")) if len(df_out) >= 5 else None

        # CPU usage via /proc/stat delta
        cpu_pct = None
        try:
            stat_out = run_adb("shell cat /proc/stat")
            for line in stat_out.splitlines():
                if line.startswith("cpu "):
                    parts = [int(x) for x in line.split()[1:]]
                    total_ticks = sum(parts)
                    idle_ticks = parts[3] + (parts[4] if len(parts) > 4 else 0)
                    if prev_cpu_stat is not None:
                        d_total = total_ticks - prev_cpu_stat[0]
                        d_idle = idle_ticks - prev_cpu_stat[1]
                        if d_total > 0:
                            cpu_pct = round(max(0.0, min(100.0, ((d_total - d_idle) / d_total) * 100.0)), 1)
                    prev_cpu_stat = (total_ticks, idle_ticks)
                    break
        except Exception:
            pass

        if cpu_pct is None:
            try:
                cpu_out = run_adb("shell top -n 1 -m 3 -b")
                cpu_m = re.search(r"(\d+)%\s*cpu", cpu_out)
                if cpu_m:
                    raw_cpu = float(cpu_m.group(1))
                    cpu_pct = round(raw_cpu / 8.0, 1) if raw_cpu > 100 else raw_cpu
            except Exception:
                pass

        payload = {
            "device": {
                "status": "connected" if device_info else "unauthorized",
                "id": device_info["serial"] if device_info else None,
                "brand": device_info["brand"] if device_info else "Android",
                "model": device_info["model"] if device_info else "Device",
                "androidVersion": device_info["version"] if device_info else None,
                "battery": level,
                "batteryTemp": temp,
                "batteryStatus": b_status,
                "batteryHealth": b_health,
                "batteryVoltage": voltage,
                "cpuPercent": cpu_pct,
                "actualIntervalMs": last_interval_ms,
                "bridgeType": "laptop"
            },
            "ram": {
                "totalKb": total_kb,
                "availableKb": avail_kb,
                "freeKb": free_kb,
                "buffersKb": buff_kb,
                "cachedKb": cached_kb,
                "swapTotalKb": swaptotal_kb,
                "swapFreeKb": swapfree_kb,
                "usedPercentage": ram_pct
            },
            "storage": {
                "total": st_total,
                "used": st_used,
                "free": st_free,
                "usagePercentage": st_pct
            }
        }

        req = urllib.request.Request(REPORT_URL, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for cmd in data.get("pendingCommands", []):
                print(f"[EXEC] {cmd['command']}")
                out = run_adb(f"shell {cmd['command']}")
                r_payload = {"id": cmd["id"], "command": cmd["command"], "output": out, "success": True}
                r_req = urllib.request.Request(RESULT_URL, data=json.dumps(r_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                urllib.request.urlopen(r_req, timeout=5)

        avail_str = f"{round(avail_kb/1048576, 2)} GB" if avail_kb else "N/A"
        free_str = f"{st_free} GB" if st_free else "N/A"
        print(f"[{time.strftime('%H:%M:%S')}] [LIVE-SYNC] RAM Bebas: {avail_str} | Storage Bebas: {free_str} | Interval: {round(last_interval_ms/1000, 1)}s")
    except Exception as e:
        print(f"[SYNC ERROR] {e}")
        device_info = None

    elapsed_ms = int((time.time() - t_start) * 1000)
    sleep_sec = max(0.5, (2000 - elapsed_ms) / 1000.0)
    last_interval_ms = int(elapsed_ms + (sleep_sec * 1000))
    time.sleep(sleep_sec)
