// OpenClaw Model Router — auto-selects Haiku or Sonnet based on task complexity
// Haiku  : conversaciones simples, preguntas cortas, consultas rapidas
// Sonnet : codigo, razonamiento complejo, planificacion, analisis detallado

const SONNET = 'anthropic/claude-sonnet-4-20250514';

const COMPLEX_PATTERNS = [
  // Codigo y programacion
  /(cod[eio]|debug|function|class|script|program|implement|algorithm|refactor|api|endpoint|database|sql|query|regex|unittest)/i,
  // Arquitectura y diseno
  /(architect|design|disen|system|infrastructure|module|framework|componente)/i,
  // Planificacion
  /(plan|strateg|roadmap|workflow|pipeline|step.by.step|paso.*paso)/i,
  // Analisis y razonamiento
  /(anali[zs]|reason|razonam|compar|evalua|diagnos|investigat|explica.*detall)/i,
  // Documentacion
  /(document|report|proposal|specification|readme|tutorial)/i,
  // Matematicas
  /(equation|ecuaci|formula|calcul|statistic|estadist|math)/i,
  // Generacion de contenido largo
  /(genera|crea|escribe|write|redacta).{0,30}(articulo|article|essay|informe|report)/i,
];

const LONG_MSG_CHARS = 280;

export default async function modelRouter(event) {
  const prompt = event.prompt ?? '';

  const history = Array.isArray(event.messages)
    ? event.messages
        .filter(m => m && m.role === 'user')
        .slice(-3)
        .map(m => {
          if (typeof m.content === 'string') return m.content;
          if (Array.isArray(m.content))
            return m.content.filter(c => c && c.type === 'text').map(c => c.text || '').join(' ');
          return '';
        })
        .join(' ')
    : '';

  const text = (prompt + ' ' + history).trim();
  const isComplex = text.length > LONG_MSG_CHARS || COMPLEX_PATTERNS.some(p => p.test(text));

  if (isComplex) {
    return { modelOverride: SONNET };
  }
  // Tarea simple: sin override → usa el modelo primario configurado (Haiku)
}
