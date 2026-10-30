# VOTA Realtime ADB Bridge (Python)
import subprocess, time, json, urllib.request, re

SERVER_URL = "__SERVER_URL__"
REPORT_URL = f"{SERVER_URL}/api/bridge/report"
RESULT_URL = f"{SERVER_URL}/api/bridge/result"

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

serial = run_adb("get-serialno") or "android-device"
brand = run_adb("shell getprop ro.product.brand") or "Android"
model = run_adb("shell getprop ro.product.model") or "Device"
version = run_adb("shell getprop ro.build.version.release") or "14"

print(f"Connected to {brand} {model} ({serial})")

while True:
    try:
        batt = run_adb("shell dumpsys battery")
        level_m = re.search(r"level:\s*(\d+)", batt)
        temp_m = re.search(r"temperature:\s*(\d+)", batt)
        level = int(level_m.group(1)) if level_m else 80
        temp = round(int(temp_m.group(1))/10.0, 1) if temp_m else 30.0

        mem = run_adb("shell cat /proc/meminfo")
        total_m = re.search(r"MemTotal:\s*(\d+)", mem)
        avail_m = re.search(r"MemAvailable:\s*(\d+)", mem)
        total_kb = int(total_m.group(1)) if total_m else 8000000
        avail_kb = int(avail_m.group(1)) if avail_m else 4000000

        df = run_adb("shell df -k /data | tail -n 1").split()
        st_total = round(int(df[1])/1048576, 1) if len(df) >= 4 else 108.0
        st_free = round(int(df[3])/1048576, 1) if len(df) >= 4 else 3.8
        st_used = round(st_total - st_free, 1)
        st_pct = round((st_used / st_total) * 100)

        payload = {
            "device": {"id": serial, "brand": brand, "model": model, "androidVersion": version, "battery": level, "batteryTemp": temp, "batteryStatus": "Active"},
            "ram": {"totalKb": total_kb, "availableKb": avail_kb, "usedPercentage": round(((total_kb - avail_kb)/total_kb)*100)},
            "storage": {"total": st_total, "used": st_used, "free": st_free, "usagePercentage": st_pct}
        }

        req = urllib.request.Request(REPORT_URL, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for cmd in data.get("pendingCommands", []):
                print(f"Executing: {cmd['command']}")
                out = run_adb(f"shell {cmd['command']}")
                r_payload = {"id": cmd["id"], "command": cmd["command"], "output": out, "success": True}
                r_req = urllib.request.Request(RESULT_URL, data=json.dumps(r_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                urllib.request.urlopen(r_req, timeout=5)

        print(f"[{time.strftime('%H:%M:%S')}] Synced: Battery={level}% ({temp}C) RAM_Avail={round(avail_kb/1048576,1)}GB Free_Storage={st_free}GB")
    except Exception as e:
        print(f"Sync error: {e}")
    time.sleep(2)
