#!/bin/sh
# =====================================================
# VOTA Real-Time ADB Bridge (Mobile Shell / Termux)
# Live Dashboard: __SERVER_URL__
# =====================================================

SERVER_URL="__SERVER_URL__"
REPORT_URL="${SERVER_URL}/api/bridge/report"
RESULT_URL="${SERVER_URL}/api/bridge/result"

echo "====================================================="
echo "  VOTA Real-Time ADB Engine (Mobile / Termux)        "
echo "  Live Dashboard: ${SERVER_URL}                      "
echo "====================================================="

# Check ADB availability
ADB_CMD="adb"
if ! command -v adb >/dev/null 2>&1; then
    if [ -x "./adb" ]; then
        ADB_CMD="./adb"
    elif [ -x "$PREFIX/bin/adb" ]; then
        ADB_CMD="$PREFIX/bin/adb"
    else
        echo ""
        echo "[!] Perintah 'adb' belum ditemukan di terminal ini."
        if command -v pkg >/dev/null 2>&1; then
            echo "[*] Mendeteksi Termux. Memasang android-tools & curl otomatis..."
            pkg install -y android-tools curl
            ADB_CMD="adb"
        else
            echo "[!] Silakan pasang paket android-tools (adb) dan curl di terminal Anda."
            echo "    Contoh (Termux): pkg install android-tools curl"
            exit 1
        fi
    fi
fi

if ! command -v curl >/dev/null 2>&1; then
    if command -v pkg >/dev/null 2>&1; then
        pkg install -y curl
    else
        echo "[!] Perintah 'curl' wajib tersedia untuk mengirimkan data ke VOTA."
        exit 1
    fi
fi

echo "[OK] ADB & Curl terdeteksi! Memulai sinkronisasi real-time..."

DEVICE_SERIAL=""
DEVICE_BRAND=""
DEVICE_MODEL=""
DEVICE_VERSION=""
PREV_CPU_STAT=""
TARGET_DEV=""

resolve_device() {
    # 1. Cek daftar devices
    DEVS_OUT=$($ADB_CMD devices 2>/dev/null)
    
    # Cek device yang authorized
    AUTH_DEV=$(echo "$DEVS_OUT" | grep -E "\s+device$" | head -n 1 | awk '{print $1}' | tr -d '\r')
    if [ -n "$AUTH_DEV" ]; then
        TARGET_DEV="$AUTH_DEV"
        
        # Ambil Serial Riil (ro.serialno)
        SN=$($ADB_CMD -s "$TARGET_DEV" shell getprop ro.serialno < /dev/null 2>/dev/null | tr -d '\r')
        [ -z "$SN" ] || [ "$SN" = "unknown" ] && SN=$($ADB_CMD -s "$TARGET_DEV" shell getprop ro.boot.serialno < /dev/null 2>/dev/null | tr -d '\r')
        [ -z "$SN" ] || [ "$SN" = "unknown" ] && SN="$TARGET_DEV"
        DEVICE_SERIAL="$SN"

        B=$($ADB_CMD -s "$TARGET_DEV" shell getprop ro.product.brand < /dev/null 2>/dev/null | tr -d '\r')
        M=$($ADB_CMD -s "$TARGET_DEV" shell getprop ro.product.model < /dev/null 2>/dev/null | tr -d '\r')
        V=$($ADB_CMD -s "$TARGET_DEV" shell getprop ro.build.version.release < /dev/null 2>/dev/null | tr -d '\r')

        [ -n "$B" ] && DEVICE_BRAND="$B" || DEVICE_BRAND="Redmi"
        [ -n "$M" ] && DEVICE_MODEL="$M" || DEVICE_MODEL="24040RN64Y"
        [ -n "$V" ] && DEVICE_VERSION="$V" || DEVICE_VERSION="16"
        return 0
    fi

    # Cek apakah ada device unauthorized
    UNAUTH_DEV=$(echo "$DEVS_OUT" | grep -E "\s+unauthorized$" | head -n 1 | awk '{print $1}' | tr -d '\r')
    if [ -n "$UNAUTH_DEV" ]; then
        echo "[!] STATUS: UNAUTHORIZED pada $UNAUTH_DEV!"
        echo "    👉 LIHAT LAYAR HP ATAU TARIK NOTIFIKASI DARI ATAS KE BAWAH:"
        echo "       Tekan 'IZINKAN' pada pop-up Debugging USB (centang 'Selalu izinkan')."
        $ADB_CMD reconnect < /dev/null 2>/dev/null || true
        return 2
    fi

    # Cek jika offline
    if echo "$DEVS_OUT" | grep -q "\soffline"; then
        echo "[!] Perangkat offline. Mencoba reconnect..."
        $ADB_CMD reconnect < /dev/null 2>/dev/null || true
        return 3
    fi

    # Belum ada koneksi sama sekali, coba auto-connect loopback
    $ADB_CMD connect 127.0.0.1:5555 < /dev/null >/dev/null 2>&1
    echo "[WAITING] Mencoba menyambungkan ke 127.0.0.1:5555..."
    return 1
}

LAST_INTERVAL_MS=2000
CONNECTED_NOTIFIED=0

while true; do
    START_MS=$(date +%s%3N 2>/dev/null)
    [ -z "$START_MS" ] || [ ${#START_MS} -lt 12 ] && START_MS=$(($(date +%s) * 1000))

    resolve_device
    STATUS_CODE=$?

    if [ $STATUS_CODE -eq 0 ] && [ -n "$TARGET_DEV" ]; then
        if [ $CONNECTED_NOTIFIED -eq 0 ]; then
            echo "[DEVICE CONNECTED] ${DEVICE_BRAND} ${DEVICE_MODEL} (${DEVICE_SERIAL}) Android ${DEVICE_VERSION} via ${TARGET_DEV}"
            CONNECTED_NOTIFIED=1
        fi
        RUN_SHELL="$ADB_CMD -s $TARGET_DEV shell"
    else
        RUN_SHELL=""
        CONNECTED_NOTIFIED=0
    fi

    # 1. Battery Info
    BATT_LEVEL="null"
    BATT_TEMP="null"
    BATT_STATUS="\"Discharging\""
    BATT_HEALTH="\"Good\""
    BATT_VOLT="null"

    if [ -n "$RUN_SHELL" ]; then
        BATT_RAW=$($RUN_SHELL dumpsys battery < /dev/null 2>/dev/null)
        RAW_LEVEL=$(echo "$BATT_RAW" | grep -E "^\s*level:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        BATT_SCALE=$(echo "$BATT_RAW" | grep -E "^\s*scale:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        BATT_TEMP_RAW=$(echo "$BATT_RAW" | grep -E "^\s*temperature:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        BATT_STATUS_RAW=$(echo "$BATT_RAW" | grep -E "^\s*status:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        BATT_HEALTH_RAW=$(echo "$BATT_RAW" | grep -E "^\s*health:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        BATT_VOLT_RAW=$(echo "$BATT_RAW" | grep -E "^\s*voltage:" | head -n 1 | awk '{print $2}' | tr -d '\r')

        if [ -n "$RAW_LEVEL" ]; then
            if [ -n "$BATT_SCALE" ] && [ "$BATT_SCALE" -gt 0 ]; then
                BATT_LEVEL=$(( (RAW_LEVEL * 100) / BATT_SCALE ))
            else
                BATT_LEVEL=$RAW_LEVEL
            fi
        fi

        if [ -n "$BATT_TEMP_RAW" ]; then
            BATT_TEMP=$(awk "BEGIN {printf \"%.1f\", $BATT_TEMP_RAW / 10.0}")
        fi

        case "$BATT_STATUS_RAW" in
            2) BATT_STATUS="\"Charging\"" ;;
            3) BATT_STATUS="\"Discharging\"" ;;
            4) BATT_STATUS="\"Not charging\"" ;;
            5) BATT_STATUS="\"Full\"" ;;
        esac

        case "$BATT_HEALTH_RAW" in
            2) BATT_HEALTH="\"Good\"" ;;
            3) BATT_HEALTH="\"Overheat\"" ;;
            4) BATT_HEALTH="\"Dead\"" ;;
            5) BATT_HEALTH="\"Over voltage\"" ;;
            6) BATT_HEALTH="\"Unspecified failure\"" ;;
            7) BATT_HEALTH="\"Cold\"" ;;
        esac

        [ -n "$BATT_VOLT_RAW" ] && BATT_VOLT="$BATT_VOLT_RAW"
    fi

    # 2. RAM Info
    TOTAL_KB=""
    AVAIL_KB=""
    FREE_KB=""
    BUFF_KB=""
    CACHED_KB=""
    SWAP_TOTAL_KB=""
    SWAP_FREE_KB=""

    if [ -n "$RUN_SHELL" ]; then
        MEM_RAW=$($RUN_SHELL cat /proc/meminfo < /dev/null 2>/dev/null)
    elif [ -r "/proc/meminfo" ]; then
        # Fallback langsung dari Linux kernel lokal HP
        MEM_RAW=$(cat /proc/meminfo 2>/dev/null)
    fi

    if [ -n "$MEM_RAW" ]; then
        TOTAL_KB=$(echo "$MEM_RAW" | grep "MemTotal:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        AVAIL_KB=$(echo "$MEM_RAW" | grep "MemAvailable:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        FREE_KB=$(echo "$MEM_RAW" | grep "MemFree:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        BUFF_KB=$(echo "$MEM_RAW" | grep "Buffers:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        CACHED_KB=$(echo "$MEM_RAW" | grep -E "^Cached:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        SWAP_TOTAL_KB=$(echo "$MEM_RAW" | grep "SwapTotal:" | head -n 1 | awk '{print $2}' | tr -d '\r')
        SWAP_FREE_KB=$(echo "$MEM_RAW" | grep "SwapFree:" | head -n 1 | awk '{print $2}' | tr -d '\r')
    fi

    RAM_PCT="null"
    if [ -n "$TOTAL_KB" ] && [ -n "$AVAIL_KB" ] && [ "$TOTAL_KB" -gt 0 ]; then
        RAM_PCT=$(( ((TOTAL_KB - AVAIL_KB) * 100) / TOTAL_KB ))
    fi
    [ -z "$TOTAL_KB" ] && TOTAL_KB="null"
    [ -z "$AVAIL_KB" ] && AVAIL_KB="null"
    [ -z "$FREE_KB" ] && FREE_KB="null"
    [ -z "$BUFF_KB" ] && BUFF_KB="null"
    [ -z "$CACHED_KB" ] && CACHED_KB="null"
    [ -z "$SWAP_TOTAL_KB" ] && SWAP_TOTAL_KB="null"
    [ -z "$SWAP_FREE_KB" ] && SWAP_FREE_KB="null"

    # 3. Storage Info (/data)
    DF_LINE=""
    if [ -n "$RUN_SHELL" ]; then
        DF_LINE=$($RUN_SHELL df -k /data < /dev/null 2>/dev/null | tail -n 1)
    elif command -v df >/dev/null 2>&1; then
        DF_LINE=$(df -k /data 2>/dev/null | tail -n 1)
    fi

    ST_TOTAL_RAW=$(echo "$DF_LINE" | awk '{print $2}' | tr -d '\r')
    ST_USED_RAW=$(echo "$DF_LINE" | awk '{print $3}' | tr -d '\r')
    ST_FREE_RAW=$(echo "$DF_LINE" | awk '{print $4}' | tr -d '\r')
    ST_PCT_RAW=$(echo "$DF_LINE" | awk '{print $5}' | tr -d '%\r')

    ST_TOTAL="null"
    ST_USED="null"
    ST_FREE="null"
    ST_PCT="null"
    if [ -n "$ST_TOTAL_RAW" ] && [ -n "$ST_FREE_RAW" ]; then
        ST_TOTAL=$(awk "BEGIN {printf \"%.2f\", $ST_TOTAL_RAW / 1048576.0}")
        ST_USED=$(awk "BEGIN {printf \"%.2f\", $ST_USED_RAW / 1048576.0}")
        ST_FREE=$(awk "BEGIN {printf \"%.2f\", $ST_FREE_RAW / 1048576.0}")
        ST_PCT=$ST_PCT_RAW
    fi

    # 4. CPU Percent (Delta from /proc/stat)
    STAT_NOW=""
    if [ -n "$RUN_SHELL" ]; then
        STAT_NOW=$($RUN_SHELL cat /proc/stat < /dev/null 2>/dev/null | grep -E "^cpu\s" | head -n 1)
    elif [ -r "/proc/stat" ]; then
        STAT_NOW=$(cat /proc/stat 2>/dev/null | grep -E "^cpu\s" | head -n 1)
    fi

    CPU_PCT="null"
    if [ -n "$STAT_NOW" ] && [ -n "$PREV_CPU_STAT" ]; then
        CPU_PCT=$(awk -v prev="$PREV_CPU_STAT" -v curr="$STAT_NOW" 'BEGIN {
            split(prev, p);
            split(curr, c);
            p_total = 0; for (i = 2; i <= length(p); i++) p_total += p[i];
            c_total = 0; for (i = 2; i <= length(c); i++) c_total += c[i];
            p_idle = p[5] + (length(p) >= 6 ? p[6] : 0);
            c_idle = c[5] + (length(c) >= 6 ? c[6] : 0);
            d_total = c_total - p_total;
            d_idle = c_idle - p_idle;
            if (d_total > 0) {
                u = ((d_total - d_idle) / d_total) * 100.0;
                if (u < 0) u = 0;
                if (u > 100) u = 100;
                printf "%.1f", u;
            }
        }')
    fi
    PREV_CPU_STAT="$STAT_NOW"
    [ -z "$CPU_PCT" ] && CPU_PCT="null"

    DEV_JSON_ID="null"
    DEV_JSON_BRAND="\"Android\""
    DEV_JSON_MODEL="\"Device\""
    DEV_JSON_VER="null"
    if [ -n "$DEVICE_SERIAL" ]; then
        DEV_JSON_ID="\"$DEVICE_SERIAL\""
        DEV_JSON_BRAND="\"$DEVICE_BRAND\""
        DEV_JSON_MODEL="\"$DEVICE_MODEL\""
        DEV_JSON_VER="\"$DEVICE_VERSION\""
    fi

    DEV_STATUS="waiting"
    [ -n "$TARGET_DEV" ] && DEV_STATUS="connected"

    # Construct Payload
    PAYLOAD=$(cat <<EOF
{
  "device": {
    "status": "$DEV_STATUS",
    "id": $DEV_JSON_ID,
    "brand": $DEV_JSON_BRAND,
    "model": $DEV_JSON_MODEL,
    "androidVersion": $DEV_JSON_VER,
    "battery": $BATT_LEVEL,
    "batteryTemp": $BATT_TEMP,
    "batteryStatus": $BATT_STATUS,
    "batteryHealth": $BATT_HEALTH,
    "batteryVoltage": $BATT_VOLT,
    "cpuPercent": $CPU_PCT,
    "actualIntervalMs": $LAST_INTERVAL_MS,
    "bridgeType": "hp_only"
  },
  "ram": {
    "totalKb": $TOTAL_KB,
    "availableKb": $AVAIL_KB,
    "freeKb": $FREE_KB,
    "buffersKb": $BUFF_KB,
    "cachedKb": $CACHED_KB,
    "swapTotalKb": $SWAP_TOTAL_KB,
    "swapFreeKb": $SWAP_FREE_KB,
    "usedPercentage": $RAM_PCT
  },
  "storage": {
    "total": $ST_TOTAL,
    "used": $ST_USED,
    "free": $ST_FREE,
    "usagePercentage": $ST_PCT
  }
}
EOF
)

    # Post to Server
    RESP=$(curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$REPORT_URL" --max-time 5 < /dev/null)

    # Execute pending commands if any
    CMD_IDS=$(echo "$RESP" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$CMD_IDS" ]; then
        echo "$RESP" | grep -o '{"id":"[^"]*","command":"[^"]*"' | while read -r item; do
            C_ID=$(echo "$item" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
            C_CMD=$(echo "$item" | grep -o '"command":"[^"]*"' | cut -d'"' -f4)
            if [ -n "$C_ID" ] && [ -n "$C_CMD" ]; then
                if [ "$C_CMD" = "disconnect" ] || [ "$C_CMD" = "adb disconnect" ]; then
                    echo ""
                    echo "====================================================="
                    echo "[DISCONNECT] Perintah pemutusan ADB diterima dari Web!"
                    echo "[DISCONNECT] Memutuskan sambungan dan menghentikan bridge..."
                    echo "====================================================="
                    $ADB_CMD disconnect < /dev/null 2>/dev/null || true
                    [ -n "$TARGET_DEV" ] && $ADB_CMD disconnect "$TARGET_DEV" < /dev/null 2>/dev/null || true
                    CMD_RES_PAYLOAD="{\"id\":\"$C_ID\",\"command\":\"$C_CMD\",\"output\":\"Disconnected cleanly\",\"success\":true}"
                    curl -s -X POST -H "Content-Type: application/json" -d "$CMD_RES_PAYLOAD" "$RESULT_URL" --max-time 5 < /dev/null >/dev/null 2>&1 || true
                    exit 0
                fi
                if [ -n "$RUN_SHELL" ]; then
                    echo "[EXEC] Menjalankan: $C_CMD"
                    CMD_OUT=$($RUN_SHELL "$C_CMD" < /dev/null 2>&1)
                    CMD_RES_PAYLOAD=$(cat <<RESEOF
{"id":"$C_ID","command":"$C_CMD","output":"$CMD_OUT","success":true}
RESEOF
)
                    curl -s -X POST -H "Content-Type: application/json" -d "$CMD_RES_PAYLOAD" "$RESULT_URL" --max-time 5 < /dev/null >/dev/null 2>&1
                fi
            fi
        done
    fi

    # Log line
    RAM_STR="N/A"
    [ "$AVAIL_KB" != "null" ] && [ -n "$AVAIL_KB" ] && RAM_STR=$(awk "BEGIN {printf \"%.2f GB\", $AVAIL_KB / 1048576.0}")
    ST_STR="N/A"
    [ "$ST_FREE" != "null" ] && [ -n "$ST_FREE" ] && ST_STR="${ST_FREE} GB"
    BATT_STR="N/A"
    [ "$BATT_LEVEL" != "null" ] && [ -n "$BATT_LEVEL" ] && BATT_STR="${BATT_LEVEL}%"
    INTERVAL_STR=$(awk "BEGIN {printf \"%.1f\", $LAST_INTERVAL_MS / 1000.0}")
    NOW=$(date +%T)
    echo "[$NOW] [LIVE-SYNC] RAM Bebas: $RAM_STR | Storage Bebas: $ST_STR | Baterai: $BATT_STR | Interval Riil: ${INTERVAL_STR}s"

    END_MS=$(date +%s%3N 2>/dev/null)
    [ -z "$END_MS" ] || [ ${#END_MS} -lt 12 ] && END_MS=$(($(date +%s) * 1000))
    WORK_MS=$((END_MS - START_MS))
    [ $WORK_MS -lt 0 ] && WORK_MS=500

    SLEEP_SEC=1
    if [ $WORK_MS -lt 2000 ]; then
        REMAINING_MS=$((2000 - WORK_MS))
        LAST_INTERVAL_MS=2000
        SLEEP_SEC=$(awk "BEGIN {printf \"%.2f\", $REMAINING_MS / 1000.0}")
    else
        LAST_INTERVAL_MS=$((WORK_MS + 500))
        SLEEP_SEC=0.5
    fi

    sleep "$SLEEP_SEC"
done
