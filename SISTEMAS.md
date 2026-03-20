# Sistemas permanentes de MaiA

## Sistema 1: NORMAS.md

Archivo de fundamentos operativos cargado en cada sesión.

**Ruta en servidor:** `/opt/moltbot/NORMAS.md`
**Estructura modular:**
- SECCIÓN 1: NORMAS CORE (intocables por MaiA)
- SECCIÓN 2: PRINCIPIOS DE NEGOCIO (editables por Pablo)
- SECCIÓN 3: ESTILO Y COMUNICACIÓN (editables por Pablo)
- SECCIÓN 4: REGLAS OPERATIVAS (editables por Pablo)

**Cargado via hook:** `hooks/time-context.mjs` → `before_agent_start`

## Sistema 2: Contexto temporal automático

Hook que inyecta antes de cada respuesta:
- Fecha y hora actual en Madrid (Europe/Madrid)
- Día de la semana
- Contenido completo de NORMAS.md

**Ruta:** `/root/.openclaw/workspace/hooks/time-context.mjs`

## Sistema 3: Contador de gasto API

Registra tokens consumidos y calcula coste en EUR.

**Archivos:**
- `/opt/tasks/api-cost-tracker.py` — script principal
- `/opt/tasks/api-cost.json` — registro acumulado
- `/opt/moltbot/skills/gasto/SKILL.md` — skill `/gasto`

**Uso:**
```bash
# Ver gasto
python3 /opt/tasks/api-cost-tracker.py --report

# Enviar por Telegram
python3 /opt/tasks/api-cost-tracker.py --report --telegram

# Registrar uso (llamado desde hooks)
python3 /opt/tasks/api-cost-tracker.py --add --input 1000 --output 500 --model anthropic/claude-haiku-4-5-20251001
```

**Precios configurados:**
- Haiku 4.5: $0.80/1M input · $4.00/1M output
- Sonnet 4.x: $3.00/1M input · $15.00/1M output
- Alerta Telegram: cuando gasto total supera $5.00 USD

**Comando MaiA:** `/gasto` → muestra resumen de la sesión actual
