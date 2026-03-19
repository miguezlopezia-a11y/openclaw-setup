#!/bin/bash
# NOTA: Reemplaza ${GH_TOKEN} con tu GitHub Personal Access Token
# o usa: export GH_TOKEN=ghp_xxxx antes de ejecutar
# backup.sh - Backup nocturno de configuracion a GitHub
BACKUP_DIR="/opt/openclaw-backup"
REPO="https://${GH_TOKEN}@github.com/miguezlopezia-a11y/openclaw-setup.git"
TG_TOKEN="8764001365:AAH0OgAax-8gjzcUXO4RrLLo-dXMM5lg4vo"
TG_CHAT="1653734374"
STAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG="/var/log/openclaw-backup.log"

send_msg() {
    curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
        --data-urlencode "chat_id=${TG_CHAT}" \
        --data-urlencode "text=$1" \
        --data-urlencode "parse_mode=HTML" -m 10 > /dev/null 2>&1
}

echo "[$STAMP] Iniciando backup..." >> "$LOG"

if [ ! -d "$BACKUP_DIR/.git" ]; then
    git clone "$REPO" "$BACKUP_DIR" >> "$LOG" 2>&1 || { send_msg "Backup fallido: no se pudo clonar"; exit 1; }
fi

cd "$BACKUP_DIR"
git config user.email "backup@maia.auto"
git config user.name "MaiA Backup"
git fetch origin >> "$LOG" 2>&1
git reset --hard origin/main >> "$LOG" 2>&1 || git reset --hard origin/master >> "$LOG" 2>&1

mkdir -p config server
cp /root/.openclaw/openclaw.json config/openclaw.json
sed -i "s/\"apiKey\": \"sk-ant-[^\"]*\"/\"apiKey\": \"REDACTED\"/g" config/openclaw.json
cp /opt/openclaw-ssl/nginx.conf config/nginx.conf
cp /root/.openclaw/workspace/hooks/model-router.mjs config/model-router.mjs
cp /opt/moltbot/docker-compose.yml config/docker-compose.yml
cp /opt/moltbot/watchdog.sh server/watchdog.sh
cp /opt/moltbot/backup.sh server/backup.sh
sed -e 's|ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=YOUR_KEY_HERE|'
    -e 's|TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE|'
    -e 's|OPENCLAW_GATEWAY_TOKEN=.*|OPENCLAW_GATEWAY_TOKEN=YOUR_TOKEN_HERE|'
    /opt/moltbot/.env > config/.env.template

git add -A
git diff --staged --quiet && { echo "[$STAMP] Sin cambios" >> "$LOG"; exit 0; }
git commit -m "backup: $STAMP" >> "$LOG" 2>&1
if git push origin HEAD:main >> "$LOG" 2>&1; then
    echo "[$STAMP] Backup OK" >> "$LOG"
    send_msg "Backup MaiA completado: $STAMP"
else
    echo "[$STAMP] ERROR push" >> "$LOG"
    send_msg "Backup MaiA fallido - error push GitHub"
fi
