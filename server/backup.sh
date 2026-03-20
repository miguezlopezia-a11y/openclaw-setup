#!/bin/bash
# backup.sh - Backup nocturno de configuracion a GitHub
# Tokens y configuracion en /etc/maia-backup.conf (no incluido en git)

CONF=/etc/maia-backup.conf
if [ ! -f "$CONF" ]; then echo "[$STAMP] ERROR: $CONF no encontrado" >> "$LOG"; exit 1; fi
source $CONF

BACKUP_DIR="/opt/openclaw-backup"
REPO="https://${GH_TOKEN}@github.com/${GH_REPO}.git"
STAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG="/var/log/openclaw-backup.log"

send_msg() {
    curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
        --data-urlencode "chat_id=${TG_CHAT}" \
        --data-urlencode "text=$1" \
        -m 10 > /dev/null 2>&1
}

echo "[$STAMP] Iniciando backup..." >> "$LOG"

[ ! -d "$BACKUP_DIR/.git" ] && git clone "$REPO" "$BACKUP_DIR" >> "$LOG" 2>&1

cd "$BACKUP_DIR"
git config user.email "backup@maia.auto"
git config user.name "MaiA Backup"
git remote set-url origin "$REPO"
git fetch origin >> "$LOG" 2>&1
git reset --hard origin/main >> "$LOG" 2>&1 || git reset --hard origin/master >> "$LOG" 2>&1

mkdir -p config server
cp /root/.openclaw/openclaw.json config/openclaw.json
sed -i "s/\"apiKey\": \"sk-ant-[^\"]*\"/\"apiKey\": \"REDACTED\"/g" config/openclaw.json
cp /opt/openclaw-ssl/nginx.conf config/nginx.conf
cp /root/.openclaw/workspace/hooks/model-router.mjs config/model-router.mjs
cp /opt/moltbot/docker-compose.yml config/docker-compose.yml

# backup.sh sin tokens para el repo
sed 's|GH_TOKEN="${GH_TOKEN_PLACEHOLDER}"
cp /opt/moltbot/watchdog.sh server/watchdog.sh

# .env template sin secrets
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
