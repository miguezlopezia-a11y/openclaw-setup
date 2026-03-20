#!/bin/bash
# watchdog.sh v2 - Monitoriza contenedores MaiA y alerta via Telegram
TG_TOKEN="8764001365:AAH0OgAax-8gjzcUXO4RrLLo-dXMM5lg4vo"
TG_CHAT="1653734374"
LOG="/var/log/openclaw-watchdog.log"
STAMP=$(date '+%Y-%m-%d %H:%M:%S')
ERRORS=0

send_alert() {
    curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
        --data-urlencode "chat_id=${TG_CHAT}" \
        --data-urlencode "text=$1" \
        -m 10 > /dev/null 2>&1
}

check_running() {
    local name=$1
    local status=$(docker inspect --format "{{.State.Status}}" "$name" 2>/dev/null)
    if [ "$status" != "running" ]; then
        echo "[$STAMP] ALERTA: $name no esta running (status=${status:-missing})" >> "$LOG"
        send_alert "MaiA alerta: $name caido. Reiniciando..."
        docker start "$name" 2>/dev/null || (cd /opt/moltbot && docker compose up -d 2>/dev/null)
        ERRORS=$((ERRORS+1))
    fi
}

# Verificar contenedores criticos
GW=$(docker ps -a --format "{{.Names}}" | grep -E "openclaw-gateway|moltbot.*gateway" | head -1)
[ -n "$GW" ] && check_running "$GW"
check_running "openclaw-https"
check_running "moltbot-searxng"

# Verificar que el gateway responde HTTP
if ! curl -sf --max-time 5 http://localhost:18789/healthz > /dev/null 2>&1; then
    echo "[$STAMP] ALERTA: gateway no responde en /healthz" >> "$LOG"
    send_alert "MaiA: gateway no responde. Reiniciando..."
    cd /opt/moltbot && docker compose restart openclaw-gateway 2>/dev/null
    ERRORS=$((ERRORS+1))
fi

# Verificar SearXNG
if ! curl -sf --max-time 5 http://localhost:8080/healthz > /dev/null 2>&1; then
    echo "[$STAMP] ALERTA: searxng no responde" >> "$LOG"
    send_alert "MaiA: SearXNG caido. Reiniciando..."
    docker start moltbot-searxng 2>/dev/null
    ERRORS=$((ERRORS+1))
fi

# Rotar log >5MB
[ $(stat -c%s "$LOG" 2>/dev/null || echo 0) -gt 5242880 ] && mv "$LOG" "${LOG}.bak"

if [ $ERRORS -eq 0 ]; then
    echo "[$STAMP] OK - todos los servicios saludables" >> "$LOG"
fi

exit 0
