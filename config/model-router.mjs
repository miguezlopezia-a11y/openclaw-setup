// OpenClaw Model Router v3
// Default: claude-sonnet-4-6 (set in openclaw.json)
// Haiku: solo para mensajes cortos y claramente triviales

const HAIKU = 'anthropic/claude-haiku-4-5-20251001';

const SIMPLE_PATTERNS = [
  /^(hola|hello|hi|ok|sí|no|gracias|thanks|buenas|bye|chao|adios)[\s!.]*$/i,
  /^(qué hora es|qué día es|cómo estás|qué tal)[\s?]*$/i,
];

const TRIVIAL_MAX_CHARS = 60;

export default async function modelRouter(event) {
  const prompt = (event.prompt ?? '').trim();

  // Only downgrade to Haiku for very short, trivially simple messages
  if (
    prompt.length <= TRIVIAL_MAX_CHARS &&
    SIMPLE_PATTERNS.some(p => p.test(prompt))
  ) {
    return { modelOverride: HAIKU };
  }
  // Everything else: Sonnet 4.6 (default in openclaw.json)
}
