# Skills instalados en MaiA (OpenClaw)

> Actualizado: 2026-03-20

## Skills instalados via ClawHub CLI

Instalados en `/opt/moltbot/skills/` con `clawhub install --workdir /opt/moltbot`.

| Skill | Version | Descripcion |
|---|---|---|
| google-workspace-mcp | 1.0.0 | Gmail, Calendar, Drive, Docs, Sheets sin Google Cloud Console |
| google-calendar | 0.1.0 | Google Calendar API: listar, crear, actualizar, borrar eventos |
| google-sheets-api | 1.0.3 | CLI para leer/escribir Sheets, batch, formato y gestion de hojas |
| imap-smtp-email | 0.0.10 | Leer y enviar email via IMAP/SMTP con adjuntos |
| pdf-extract | 1.0.0 | Extrae texto de PDFs localmente (reduce llamadas a API) |
| cron-scheduling | 1.0.0 | Gestion de cron jobs y systemd timers con timezone y retry |
| openclaw-auto-updater | 1.0.0 | Actualizacion automatica de OpenClaw y skills via cron |
| flexible-database-design | 1.0.0 | SQLite flexible para cache y knowledge base local |

## Skills pre-instalados (repo moltbot)

gog, gdrive, github, discord, slack, notion, trello, searxng, summarize, nano-pdf, coding-agent, skill-creator, clawhub, blogwatcher, blucli, canvas, gemini, gh-issues, gifgrep, healthcheck, himalaya, imsg, mcporter, model-usage, node-connect, obsidian, openai-image-gen, openai-whisper, openai-whisper-api, oracle, peekaboo, sag, session-logs, sherpa-onnx-tts, songsee, spotify-player, tmux, video-frames, voice-call, wacli, weather, xurl

## Estrategias para reducir llamadas a API

1. **Model router** (hooks/model-router.mjs): Haiku para mensajes simples, Sonnet solo cuando necesario
2. **flexible-database-design**: cache local SQLite para datos frecuentes
3. **pdf-extract**: procesamiento local de PDFs antes de enviar al LLM
4. **searxng**: busqueda web sin API externa (instancia local)

## Google Service Account configurado

- Proyecto: maia-drive-490720
- SA: maia-drive-reader@maia-drive-490720.iam.gserviceaccount.com
- Credenciales: /root/.openclaw/gdrive/credentials.json

Para Calendar/Sheets/Gmail agregar scopes en Google Cloud Console:
- https://www.googleapis.com/auth/calendar
- https://www.googleapis.com/auth/spreadsheets
- https://www.googleapis.com/auth/gmail.modify

## Comandos utiles

```bash
# Buscar skills
clawhub search "descripcion"

# Instalar
cd /opt/moltbot && clawhub install <slug> --workdir /opt/moltbot --no-input

# Actualizar todos
cd /opt/moltbot && clawhub update --all --workdir /opt/moltbot --no-input --force

# Listar instalados
cd /opt/moltbot && clawhub list --workdir /opt/moltbot
```
