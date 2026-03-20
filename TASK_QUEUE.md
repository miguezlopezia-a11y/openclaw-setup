# Sistema de Cola MaiA <-> Claude Code

## Arquitectura

```
MaiA escribe tarea en /opt/tasks/queue.json
         |
         v (cada 5 min, cron servidor)
/opt/tasks/worker.py
         |
    tipo shell? --> ejecuta en servidor --> resultado en queue.json + Telegram
         |
    tipo claude? --> notifica a Claude Code via Telegram --> Claude ejecuta --> resultado en queue.json
```

## Componentes

### Servidor (permanente, independiente de sesion Claude Code)
- `/opt/tasks/queue.json` — cola de tareas
- `/opt/tasks/worker.py` — worker que procesa tareas shell
- `/opt/tasks/worker.log` — log de ejecucion
- Cron: `*/5 * * * *` (cada 5 minutos)

### Claude Code (sesion activa)
- `~/.claude/task-runner.py` — runner local para tareas tipo `claude`
- Cron interno de sesion: cada 5 minutos

## Formato de tarea

```json
{
  "id": "task_001",
  "status": "pending",
  "type": "shell",
  "description": "Descripcion legible",
  "command": "comando bash a ejecutar",
  "verify_cmd": "comando para verificar resultado (opcional)",
  "timeout": 120,
  "created": "2026-03-20T20:00:00Z",
  "started": null,
  "completed": null,
  "result": null,
  "verified": null,
  "error": null
}
```

## Tipos de tarea

| Tipo | Quien ejecuta | Cuando usar |
|---|---|---|
| `shell` | Worker en servidor | Comandos bash, instalar skills, reiniciar servicios |
| `claude` | Claude Code | Investigacion, codigo complejo, razonamiento |

## Estados

| Estado | Significado |
|---|---|
| `pending` | Esperando ejecucion |
| `running` | En ejecucion |
| `done` | Completada (ver `result`) |
| `error` | Fallida (ver `error`) |
| `pending_claude` | Delegada a Claude Code, esperando |

## Verificacion de resultados

Cada tarea puede incluir `verify_cmd`: un comando que confirma que el resultado es correcto.
El worker ejecuta `verify_cmd` despues de la tarea y marca `verified: true/false`.

## Ejemplo practico

MaiA agrega al queue.json:
```json
{
  "id": "task_002",
  "status": "pending",
  "type": "shell",
  "description": "Instalar skill de Notion",
  "command": "cd /opt/moltbot && clawhub install notion --workdir /opt/moltbot --no-input",
  "verify_cmd": "test -d /opt/moltbot/skills/notion && echo OK",
  "created": "2026-03-20T21:00:00Z"
}
```

5 minutos despues, worker ejecuta, verifica y envia por Telegram:
```
MaiA Worker - COMPLETADO
Tarea: task_002
Desc: Instalar skill de Notion
Resultado: OK. Installed notion -> /opt/moltbot/skills/notion
Verificado: SI
```

## Leer resultados desde MaiA

```bash
cat /opt/tasks/queue.json | python3 -c "
import json, sys
q = json.load(sys.stdin)
for t in q['tasks']:
    print(t['id'], t['status'], t.get('result','')[:80])
"
```

## Seguridad

- Comandos peligrosos bloqueados: `rm -rf /`, `mkfs`, `dd if=/dev/zero`, etc.
- Worker corre como root en servidor privado
- Token Telegram en variable de entorno (no en codigo)
