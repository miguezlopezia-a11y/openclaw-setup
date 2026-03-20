# Mejoras de comunicación MaiA <-> Code

## Mejora 1: Canal de resultados interno

Code escribe cada resultado en `/opt/tasks/results/[timestamp]_[task_id].md`.

MaiA puede consultar resultados con el comando `/resultados`:

```bash
# Ver últimas 5 tareas
for f in $(ls -t /opt/tasks/results/*.md | head -5); do echo "---"; cat "$f"; done

# Ver más reciente
cat $(ls -t /opt/tasks/results/*.md | head -1)
```

**Sin depender de Telegram.** Los archivos persisten hasta borrado manual.

## Mejora 2: Visión multimodal

`openclaw.json` configurado con `agents.defaults.imageModel`:

```json
{
  "agents": {
    "defaults": {
      "imageModel": {
        "primary": "anthropic/claude-sonnet-4-20250514"
      }
    }
  }
}
```

Cuando Pablo envíe una captura de pantalla por Telegram, MaiA la procesará
automáticamente con Sonnet (que soporta visión). El modelo de texto sigue
siendo Haiku para conversaciones normales (ahorro de coste).

## Mejora 3: Notificación en contexto de trabajo

El hook `time-context.mjs` ahora lee `/opt/tasks/pending-notifications.json`
antes de cada respuesta de MaiA:

1. Code completa una tarea → escribe en `pending-notifications.json`
2. Pablo habla con MaiA (cualquier mensaje)
3. Hook inyecta los resultados pendientes en el contexto del turno
4. MaiA los procesa como parte de su memoria de trabajo
5. Hook limpia las notificaciones consumidas

**Resultado:** MaiA ve los resultados de Code en su próxima interacción,
sin que Pablo reenvíe nada. Flujo completamente automático.

## Archivos del sistema

| Archivo | Propósito |
|---|---|
| `/opt/tasks/results/*.md` | Resultados individuales por tarea |
| `/opt/tasks/pending-notifications.json` | Cola de notificaciones para MaiA |
| `/root/.openclaw/workspace/hooks/time-context.mjs` | Hook que inyecta contexto |
| `/root/.openclaw/openclaw.json` | Config con imageModel |
| `/opt/moltbot/skills/resultados/SKILL.md` | Skill /resultados |
