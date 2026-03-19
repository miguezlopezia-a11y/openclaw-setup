# OpenClaw Setup

Scripts y hooks para instalar y configurar [OpenClaw](https://github.com/moltbot/moltbot) (MaiA) con Docker en Ubuntu 24.04.

## Servidor

| Campo | Valor |
|---|---|
| IP | `204.168.163.167` |
| Usuario | `root` |
| OS | Ubuntu 24.04 |
| Panel | Hetzner Cloud |

---

## Instalación

### Requisitos locales

- Python 3.x
- `pip install paramiko`

### Ejecutar

```bash
python install_openclaw.py
```

El script conecta al servidor por SSH, pide la contraseña de forma segura y ejecuta automáticamente:

1. `apt-get update && upgrade`
2. Instalación de Docker Engine + Compose
3. Habilitación de Docker al inicio
4. Clonado del repositorio OpenClaw en `/opt/moltbot`
5. Apertura del puerto 18789 en UFW
6. Ejecución de `docker-setup.sh` (modo non-interactive)

---

## Acceso a la interfaz web

La interfaz está disponible en **HTTPS** gracias a un nginx con certificado self-signed:

```
https://204.168.163.167
```

Al entrar por primera vez el navegador mostrará un aviso de certificado no confiable — aceptar la excepción una vez.

### Token de autenticación

```
f96ca4384aa65d6e46c7a5c51bcbd05e2133730d2c72e0a64fa82ea5456133ee
```

También disponible en el servidor:

```bash
grep OPENCLAW_GATEWAY_TOKEN /opt/moltbot/.env
```

### Emparejamiento de dispositivo

OpenClaw requiere emparejar cada navegador nuevo. Desde el servidor:

```bash
cd /opt/moltbot
docker compose run --rm -T openclaw-cli devices list
docker compose run --rm -T openclaw-cli devices approve <request-id>
```

---

## Infraestructura Docker

| Contenedor | Puerto | Descripción |
|---|---|---|
| `moltbot-openclaw-gateway-1` | 18789, 18790 | Gateway principal de OpenClaw |
| `openclaw-https` | 80, 443 | nginx reverse proxy con SSL |

El certificado self-signed está en `/opt/openclaw-ssl/` y es válido 1 año.

---

## Canal de Telegram

Bot configurado en modo polling.

| Campo | Valor |
|---|---|
| Token | En `/opt/moltbot/.env` como `TELEGRAM_BOT_TOKEN` |
| dmPolicy | `pairing` |
| allowFrom | `1653734374` |
| groupPolicy | `open` |

---

## Modelo de IA

| Campo | Valor |
|---|---|
| Proveedor | Anthropic |
| API Key | En `/opt/moltbot/.env` como `ANTHROPIC_API_KEY` |
| Modelo primario | `claude-haiku-4-5-20251001` |
| Modelo fallback | `claude-sonnet-4-20250514` |

---

## Routing automático de modelos

El archivo `hooks/model-router.mjs` implementa selección automática de modelo según la complejidad de cada mensaje.

### Cómo funciona

El hook se ejecuta antes de cada turno del agente (`before_agent_start`) y analiza el mensaje del usuario:

| Condición | Modelo elegido |
|---|---|
| Mensaje ≤ 280 caracteres sin palabras clave | **Haiku 4.5** — rápido y económico |
| Mensaje > 280 caracteres | **Sonnet 4.6** |
| Código: `code`, `debug`, `function`, `class`, `sql`, `api`... | **Sonnet 4.6** |
| Arquitectura: `architect`, `design`, `system`, `framework`... | **Sonnet 4.6** |
| Planificación: `plan`, `strategy`, `roadmap`, `workflow`... | **Sonnet 4.6** |
| Análisis: `analyze`, `compare`, `evaluate`, `diagnose`... | **Sonnet 4.6** |
| Error de rate limit o context overflow en Haiku | **Sonnet 4.6** (fallback automático) |

### Despliegue del hook

El archivo debe estar en el workspace del agente:

```
/root/.openclaw/workspace/hooks/model-router.mjs
```

Configuración en `openclaw.json`:

```json
{
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
  }
}
```

Para actualizar el hook en el servidor:

```bash
scp hooks/model-router.mjs root@204.168.163.167:/root/.openclaw/workspace/hooks/
cd /opt/moltbot && docker compose restart openclaw-gateway
```

---

## Configuración de rate limiting

Para evitar superar los límites de la API de Anthropic:

| Parámetro | Valor |
|---|---|
| `agents.defaults.maxConcurrent` | `1` |
| `agents.defaults.subagents.maxConcurrent` | `1` |
| `agents.defaults.humanDelay` | `3000–8000 ms` |

---

## Comandos útiles en el servidor

```bash
# Ver logs del gateway en tiempo real
cd /opt/moltbot && docker compose logs -f openclaw-gateway

# Reiniciar gateway
cd /opt/moltbot && docker compose restart openclaw-gateway

# Estado de canales
cd /opt/moltbot && docker compose run --rm -T openclaw-cli channels status

# Ver/editar configuración
cd /opt/moltbot && docker compose run --rm -T openclaw-cli config file

# Listar dispositivos emparejados
cd /opt/moltbot && docker compose run --rm -T openclaw-cli devices list
```
