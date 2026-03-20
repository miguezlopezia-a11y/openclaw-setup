// OpenClaw Model Router v2 — optimizado para máximo ahorro
// Haiku  : conversaciones, preguntas, tareas simples (default)
// Sonnet : código, razonamiento complejo, planificación, análisis largo

const SONNET = 'anthropic/claude-sonnet-4-20250514';

// Solo usar Sonnet cuando sea claramente necesario
const SONNET_PATTERNS = [
  // Código y programación
  /\b(cod[eio]|debug|function|class|script|program|implement|algorithm|refactor|endpoint|database|sql|query|regex|test|unittest|bug|error|exception)\b/i,
  // Arquitectura
  /\b(architect|design|system|infrastructure|module|framework|component|api|microservice)\b/i,
  // Planificación compleja
  /\b(plan|strateg|roadmap|workflow|pipeline|step.by.step|paso.*paso|hoja.*ruta)\b/i,
  // Análisis profundo (solo si hay contexto largo)
  /\b(analiz[ae]|diagnos|investigat|compar.*detall|evalua.*detall)\b/i,
  // Documentación técnica larga
  /\b(documentation|specification|readme|tutorial|manual)\b/i,
  // Matemáticas avanzadas
  /\b(equation|formula|statistic|calcul.*complex|math.*proof)\b/i,
];

// Palabras que indican tarea simple (fuerzan Haiku aunque el mensaje sea largo)
const SIMPLE_OVERRIDES = [
  /\b(hola|hello|hi|gracias|thanks|ok|sí|no|bien|mal|qué hora|fecha|tiempo|cuánto|cómo estás|qué tal)\b/i,
  /\b(resumen|resume|resume|summary|brief|breve|corto|quick|rápido|fast)\b/i,
  /\b(traduc|translate|traducción)\b/i,
];

// Umbral: mensajes >400 chars SON complejos (era 280, subimos para ahorrar)
const LONG_MSG_CHARS = 400;

export default async function modelRouter(event) {
  const prompt = event.prompt ?? '';

  const history = Array.isArray(event.messages)
    ? event.messages
        .filter(m => m && m.role === 'user')
        .slice(-2)  // Solo últimos 2 mensajes (era 3, reducimos contexto analizado)
        .map(m => {
          if (typeof m.content === 'string') return m.content;
          if (Array.isArray(m.content))
            return m.content.filter(c => c && c.type === 'text').map(c => c.text || '').join(' ');
          return '';
        })
        .join(' ')
    : '';

  const text = (prompt + ' ' + history).trim();

  // Siempre Haiku para saludos/tareas simples
  if (SIMPLE_OVERRIDES.some(p => p.test(text))) {
    return; // Haiku (sin override)
  }

  const isComplex = text.length > LONG_MSG_CHARS || SONNET_PATTERNS.some(p => p.test(text));

  if (isComplex) {
    return { modelOverride: SONNET };
  }
  // Default: Haiku
}
