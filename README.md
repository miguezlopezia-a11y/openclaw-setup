# MaiA — OpenClaw/Moltbot Setup Completo

> **MaiA** es un asistente de IA personal desplegado en un servidor Hetzner,
> accesible via Telegram y navegador web, potenciado por Claude (Anthropic).

## Servidor

| Campo | Valor |
|-------|-------|
| IP | `204.168.163.167` |
| OS | Ubuntu 24.04 |
| RAM | 7.6 GB |
| Disco | 150 GB |
| Swap | 2 GB (añadido para estabilidad) |
| Usuario | `root` |

## Arquitectura

```
Usuario Telegram
       │
       ▼
api.telegram.org
       │ polling
       ▼
┌─────────────────────────────────┐
│  Servidor Hetzner 204.168.163.167│
│                                 │
│  ┌──────────────┐               │
│  │ nginx:443/80 │  ← HTTPS      │
│  └──────┬───────┘               │
│         │ proxy_pass            │
│  ┌──────▼──────────────────┐    │
│  │ openclaw-gateway:18789  │    │
│  │  ├── model-router hook  │    │
│  │  ├── Telegram plugin    │    │
│  │  └── Claude API client  │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌──────────────────────────┐   │
│  │ n8n + PostgreSQL         │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

## Acceso Web

- HTTPS: `https://204.168.163.167` (certificado autofirmado — acepta la advertencia)
- HTTP redirige automáticamente a HTTPS

## Instalación inicial

```bash
pip install paramiko
python install_openclaw.py
```

El script instala Docker, clona OpenClaw/Moltbot y lo arranca. Ver `install_openclaw.py`.

## Configuración

### Variables de entorno (`/opt/moltbot/.env`)

```env
OPENCLAW_CONFIG_DIR=/root/.openclaw
OPENCLAW_WORKSPACE_DIR=/root/.openclaw/workspace
OPENCLAW_GATEWAY_PORT=18789
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
OPENCLAW_GATEWAY_TOKEN=YOUR_TOKEN
```

### Config principal (`/root/.openclaw/openclaw.json`)

```json
{
  "meta": {
    "lastTouchedVersion": "2026.3.14",
    "lastTouchedAt": "2026-03-19T12:00:00.000Z"
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-haiku-4-5-20251001",
        "fallbacks": [
          "anthropic/claude-sonnet-4-20250514"
        ]
      },
      "models": {
        "anthropic/claude-sonnet-4-20250514": {}
      },
      "compaction": {
        "mode": "safeguard"
      },
      "humanDelay": {
        "mode": "custom",
        "minMs": 1500,
        "maxMs": 4000
      },
      "maxConcurrent": 1,
      "subagents": {
        "maxConcurrent": 1
      }
    }
  },
  "tools": {},
  "commands": {
    "native": "auto",
    "nativeSkills": "auto",
    "restart": true,
    "ownerDisplay": "raw"
  },
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "before_agent_start",
          "module": "hooks/model-router.mjs"
        }
      ]
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "pairing",
      "allowFrom": [
        1653734374
      ],
      "groupPolicy": "open",
      "streaming": "partial"
    }
  },
  "gateway": {
    "mode": "local",
    "bind": "lan",
    "controlUi": {
      "allowedOrigins": [
        "http://localhost:18789",
        "http://127.0.0.1:18789",
        "http://204.168.163.167:18789",
        "https://204.168.163.167"
      ]
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  }
}
```

## Routing automático de modelos (`hooks/model-router.mjs`)

OpenClaw selecciona el modelo según la complejidad de la tarea:

| Tarea | Modelo | Cuándo |
|-------|--------|--------|
| Conversación, preguntas, saludos | **Haiku 4.5** (default) | Mensajes < 400 chars sin patrones complejos |
| Código, análisis, planificación | **Sonnet 4** | Patrones técnicos o mensajes largos |

**Patrones que activan Sonnet:** `code`, `debug`, `function`, `class`, `script`, `implement`, `algorithm`, `api`, `database`, `sql`, `architect`, `design`, `plan`, `strategy`, `roadmap`, `analyze`, `diagnose`, `specification`, `formula`, `statistics`...

**Override a Haiku:** `hola`, `gracias`, `ok`, `resume`, `traduce`, `rapido`, `breve`...

Ver código completo en `hooks/model-router.mjs`.

## Estabilidad

### Swap (2 GB)
El servidor no tenía swap. Se añadió para prevenir OOM kills:
```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
sysctl vm.swappiness=10
```

### Docker restart policies
Todos los contenedores tienen `restart: unless-stopped` — se reinician solos tras reboot o crash.

### Watchdog (`server/watchdog.sh`)
Ejecutado cada 5 minutos por cron:
- Verifica que `moltbot-openclaw-gateway-1` y `openclaw-https` estén `running`
- Verifica que el gateway responda en `/healthz`
- Reinicia automáticamente si algo falla
- Envía alerta por Telegram si hay problemas
- Log en `/var/log/openclaw-watchdog.log`

## Seguridad

### UFW Firewall
| Puerto | Acceso |
|--------|--------|
| 22/tcp | Abierto (SSH) |
| 80/tcp | Abierto (redirect a HTTPS) |
| 443/tcp | Abierto (HTTPS) |
| 5678/tcp | Abierto (n8n) |
| 18789/tcp | **Solo red Docker** (nginx proxy interno) |

### fail2ban
Activo para SSH — bloquea IPs con demasiados intentos de login fallidos.

### nginx hardening (`config/nginx.conf`)
- TLS 1.2 + 1.3 únicamente
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `X-XSS-Protection`
- Rate limiting: 10 req/min por IP en endpoints HTTP
- Gzip compresión habilitada
- `server_tokens off` (oculta versión de nginx)

## Backups automáticos (`server/backup.sh`)

Ejecutado **cada noche a las 02:00** via cron.

Guarda en este repositorio (rama `main`):
- `config/openclaw.json` — configuración principal (API key redactada)
- `config/nginx.conf` — configuración nginx
- `config/model-router.mjs` — hook de routing de modelos
- `config/docker-compose.yml` — servicios Docker
- `config/.env.template` — plantilla de variables de entorno
- `server/watchdog.sh` — script de monitorización
- `server/backup.sh` — este script

Envía confirmación/error por Telegram al completar.

## Cron jobs

```
# MaiA / OpenClaw - tareas automaticas
*/5 * * * * /opt/moltbot/watchdog.sh
0 2 * * * /opt/moltbot/backup.sh
0 3 * * 0 cd /opt/moltbot && docker compose pull openclaw-gateway && docker compose up -d

```

## Telegram

- **Bot:** `@Pratnerbot`
- **Plugin:** `telegram` habilitado en OpenClaw
- **dmPolicy:** `pairing` — solo usuarios aprobados
- **allowFrom:** `[1653734374]`
- **Token:** configurado via `TELEGRAM_BOT_TOKEN` en `.env`

## API Anthropic

- **Modelo primario:** `claude-haiku-4-5-20251001`
- **Modelo fallback:** `claude-sonnet-4-20250514`
- **Selección automática:** vía hook `model-router.mjs`
- **Rate limits:** `maxConcurrent: 1`, `subagents.maxConcurrent: 1`
- **humanDelay:** 1.5–4 segundos (anti-rate-limit)
- **API key:** en `ANTHROPIC_API_KEY` (.env) y `auth-profiles.json`

> **Nota:** Claude Pro (claude.ai) y la API de Anthropic son productos independientes.
> OpenClaw requiere una API key de [console.anthropic.com](https://console.anthropic.com).
> Para aumentar límites, añade créditos en Billing → sube de tier automáticamente.

## Comandos útiles en el servidor

```bash
# Estado de contenedores
docker ps

# Logs en tiempo real
docker logs -f moltbot-openclaw-gateway-1

# Reiniciar OpenClaw
cd /opt/moltbot && docker compose restart openclaw-gateway

# Ejecutar watchdog manualmente
/opt/moltbot/watchdog.sh

# Ejecutar backup manualmente
/opt/moltbot/backup.sh

# Ver logs del watchdog
tail -f /var/log/openclaw-watchdog.log

# Ver logs del backup
tail -f /var/log/openclaw-backup.log

# CLI de OpenClaw
cd /opt/moltbot && docker compose run --rm openclaw-cli
```

## Claude Code (CLI local)

Para usar Claude Code con tu cuenta Pro de claude.ai en lugar de API key:

```bash
# 1. Eliminar la API key del entorno
unset ANTHROPIC_API_KEY

# 2. Cerrar sesión actual
# Dentro de Claude Code: /logout

# 3. Volver a abrir Claude Code — abrirá el navegador para OAuth
claude

# 4. Verificar autenticación
# Dentro de Claude Code: /status
```

---
*Documentación generada automáticamente. Última actualización: 2026-03-19*

## SearXNG — Motor de búsqueda interno

SearXNG es un metabuscador de código abierto instalado localmente, accesible por MaiA sin exponer tráfico a servicios externos de logging.

### Acceso
- **Interno (Docker):** `http://searxng:8080` (solo desde la red Docker)
- **Host:** `http://127.0.0.1:8080` (solo local, no público)

### Motores configurados
Google, Bing, DuckDuckGo, Wikipedia, GitHub, StackOverflow, arXiv, Google News

### Uso desde MaiA
```bash
# Búsqueda general
curl -sf "http://searxng:8080/search?q=TU+CONSULTA&format=json" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for r in data.get('results', [])[:5]:
    print(f\"Title: {r.get('title','')}")
    print(f\"URL:   {r.get('url','')}")
    print(f\"Desc:  {r.get('content','')[:200]}")
    print()
"

# Noticias
curl -sf "http://searxng:8080/search?q=TEMA&format=json&categories=news"

# Tech/código
curl -sf "http://searxng:8080/search?q=PREGUNTA&format=json&categories=it"
```

### Configuración
- Archivo: `/opt/searxng/settings.yml`
- Idioma por defecto: español
- Rate limiting: desactivado (uso interno)
- Sin logs de búsqueda

### Docker
Definido en `/opt/moltbot/docker-compose.yml` como servicio `searxng`.
Reinicia automáticamente. Monitorizado por `watchdog.sh`.

## Google Drive — Leer documentos

MaiA puede leer documentos de Google Drive (incluyendo contenido de NotebookLM) usando el skill `gdrive`.

### Autenticación: Service Account

Usa un Service Account de Google Cloud — no requiere OAuth interactivo, ideal para servidor headless.

### Setup (una vez)

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea proyecto nuevo: **"MaiA Drive"**
3. APIs y servicios → Habilitar APIs:
   - Google Drive API
   - Google Docs API
4. IAM → Cuentas de servicio → Crear cuenta (`maia-drive-reader`)
5. En la cuenta creada → Claves → Agregar clave → JSON → Descargar
6. Copiar JSON al servidor:
   ```
   scp credentials.json root@204.168.163.167:/root/.openclaw/gdrive/credentials.json
   ssh root@204.168.163.167 chown 1000:1000 /root/.openclaw/gdrive/credentials.json
   ```
7. Compartir documentos/carpetas de Drive con el email del Service Account (Lector)

### Verificar

```bash
docker exec moltbot-openclaw-gateway-1 node /home/node/.openclaw/gdrive/gdrive.mjs setup
```

### Comandos disponibles para MaiA

```bash
node /home/node/.openclaw/gdrive/gdrive.mjs list               # listar archivos
node /home/node/.openclaw/gdrive/gdrive.mjs read <fileId>      # leer documento
node /home/node/.openclaw/gdrive/gdrive.mjs search <query>     # buscar
node /home/node/.openclaw/gdrive/gdrive.mjs info <fileId>      # metadatos
```

### gog (Google Workspace completo — Gmail, Calendar, Drive, Docs, Sheets)

Binario instalado en `/home/node/.openclaw/bin/gog` (v0.12.0).
Requiere OAuth setup con `client_secret.json` de Google Cloud Console.
