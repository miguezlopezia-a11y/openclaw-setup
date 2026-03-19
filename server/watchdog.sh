#!/bin/bash
# watchdog.sh - Monitoriza contenedores y alerta via Telegram
TG_TOKEN="8764001365:AAH0OgAax-8gjzcUXO4RrLLo-dXMM5lg4vo"
TG_CHAT="1653734374"
LOG="/var/log/openclaw-watchdog.log"
STAMP=$(date '+%Y-%m-%d %H:%M:%S')

send_alert() {
    curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
        --data-urlencode "chat_id=${TG_CHAT}" \
        --data-urlencode "text=$1" \
        --data-urlencode "parse_mode=HTML" -m 10 > /dev/null 2>&1
}

check_container() {
    local name=$1
    local status=$(docker inspect --format="{{.State.Status}}" "$name" 2>/dev/null)
    local health=$(docker inspect --format="{{.State.Health.Status}}" "$name" 2>/dev/null || echo none)
    if [ "$status" != "running" ]; then
        echo "[$STAMP] ALERTA: $name caido (status=$status)" >> "$LOG"
        send_alert "MaiA: Contenedor $name caido ($status). Reiniciando..."
        docker start "$name" 2>/dev/null || (cd /opt/moltbot && docker compose up -d)
        return 1
    fi
    if [ "$health" = "unhealthy" ]; then
        echo "[$STAMP] ALERTA: $name unhealthy" >> "$LOG"
        send_alert "MaiA: Contenedor $name unhealthy. Reiniciando..."
        docker restart "$name" 2>/dev/null
        return 1
    fi
    return 0
}

ERRORS=0
GW=$(docker ps -a --format "{{.Names}}" | grep -E "openclaw-gateway|moltbot.*gateway" | head -1)
[ -n "$GW" ] && { check_container "$GW" || ERRORS=$((ERRORS+1)); }
check_container "openclaw-https" || ERRORS=$((ERRORS+1))

if ! curl -sf --max-time 5 http://localhost:18789/healthz > /dev/null 2>&1; then
    echo "[$STAMP] ALERTA: gateway no responde en /healthz" >> "$LOG"
    send_alert "MaiA gateway no responde. Reiniciando..."
    cd /opt/moltbot && docker compose restart openclaw-gateway
    ERRORS=$((ERRORS+1))
fi

[ $ERRORS -eq 0 ] && echo "[$STAMP] OK" >> "$LOG"
[ $(stat -c%s "$LOG" 2>/dev/null || echo 0) -gt 5242880 ] && mv "$LOG" "${LOG}.bak"
