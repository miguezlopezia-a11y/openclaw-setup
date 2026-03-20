# Skills de Redes Sociales y Growth — MaiA
> Instalados via ClawHub | 20 marzo 2026 | Para uso como Growth Partner

## Resumen de instalacion

19 skills instalados en `/opt/moltbot/skills/`. Capacidades cubiertas:
- Analisis de perfiles y competidores
- Extraccion de metricas de engagement
- Monitorizacion de palabras clave, hashtags y tendencias
- Analisis de contenido y estrategia
- Seguimiento de resenas y reputacion online

---

## REDES SOCIALES

### 1. instagram-analyzer
**Proposito:** Analizar perfiles y posts de Instagram con metricas de engagement, Reels y exportacion de datos.

**Requisitos:**
- python3, chromium, playwright, beautifulsoup4, lxml
- No requiere API key (scraping etico via browser automation)

**Capacidades:**
- Analisis de perfiles: seguidores, seguidos, ratio engagement
- Metricas de posts: likes, comentarios, views en Reels
- Comparacion de competidores
- Exportacion JSON/CSV

**Uso con MaiA:**
```
"Analiza el perfil de Instagram de @competidor"
"Extrae las metricas de engagement de este perfil"
"Compara el engagement de estas dos cuentas"
"Analiza los Reels mas virales de @marca"
```

---

### 2. youtube-analytics
**Proposito:** Toolkit completo de analitica YouTube via YouTube Data API v3.

**Requisitos:**
- `YOUTUBE_API_KEY` — Google Cloud Console, YouTube Data API v3 habilitada
- Node.js (npm install en skills/youtube-analytics/scripts/)

**Capacidades:**
- Estadisticas de canal: suscriptores, vistas, videos
- Analisis de video: rendimiento, engagement, comentarios
- Comparacion de canales competidores
- Busqueda y analisis de tendencias
- Videos recientes y uploads de un canal

**Configuracion:**
```bash
cd /opt/moltbot/skills/youtube-analytics/scripts && npm install
# Anadir a /opt/moltbot/.env:
# YOUTUBE_API_KEY=tu_clave_aqui
```

**Uso con MaiA:**
```
"Analiza el canal de YouTube de @competidor"
"Que videos estan trending en mi nicho"
"Compara el rendimiento de estos dos canales"
"Cuantos suscriptores tiene este canal"
```

---

### 3. tiktok-growth
**Proposito:** Generador de estrategia de contenido y scripts virales para TikTok.

**Requisitos:** Ninguno (solo razonamiento de IA)

**Capacidades:**
- Scripts optimizados para el algoritmo TikTok
- Formulas de hooks virales
- Estrategia de crecimiento por nicho
- Estructura de videos: hook, desarrollo, CTA
- Analisis de que funciona en cada nicho

**Uso con MaiA:**
```
"Crea un script viral de TikTok para [negocio/nicho]"
"Que tipo de contenido funciona en TikTok para restaurantes"
"Dame 5 ideas de videos TikTok para esta marca"
"Genera un hook viral para este producto"
```

---

### 4. tiktok-crawling
**Proposito:** Descarga y analisis de contenido TikTok via yt-dlp.

**Requisitos:**
```bash
pip install yt-dlp
# ffmpeg para post-procesado
```

**Capacidades:**
- Descargar videos individuales de TikTok
- Descargar perfil completo de un creador
- Extraer metadata: vistas, likes, comentarios, hashtags
- Analizar contenido de competidores

**Uso con MaiA:**
```
"Descarga los videos virales de @competidor en TikTok"
"Analiza el contenido de este perfil TikTok"
"Extrae los hashtags que usa esta cuenta"
```

---

### 5. linkedin-api
**Proposito:** Integracion LinkedIn via OAuth gestionado por Maton.ai.

**Requisitos:**
- `MATON_API_KEY` — registrar en maton.ai para OAuth gestionado

**Capacidades:**
- Publicar posts en LinkedIn (texto, imagenes, links)
- Gestionar perfil y organizacion
- Acceso a LinkedIn Ads
- Upload de media
- Ad Library (analisis de publicidad de competidores)

**Configuracion:**
```bash
# Anadir a /opt/moltbot/.env:
# MATON_API_KEY=tu_clave_maton
```

**Uso con MaiA:**
```
"Publica este articulo en LinkedIn"
"Analiza el perfil de LinkedIn de [empresa]"
"Que anuncios esta publicando [competidor] en LinkedIn"
"Gestiona los posts de LinkedIn de este mes"
```

---

### 6. x-twitter
**Proposito:** Interaccion completa con Twitter/X via twclaw CLI.

**Requisitos:**
- `TWITTER_BEARER_TOKEN` — Twitter Developer Portal (lectura)
- `TWITTER_API_KEY` + `TWITTER_API_SECRET` — para escritura (post, like, RT)
- npm install -g twclaw

**Capacidades:**
- Leer tweets, hilos, replies
- Buscar por keywords o hashtags
- Ver tweets y perfil de cualquier usuario
- Postear, dar like, retweetear
- Timeline propio y menciones

**Configuracion:**
```bash
npm install -g twclaw
# Anadir a /opt/moltbot/.env:
# TWITTER_BEARER_TOKEN=tu_bearer_token
```

**Uso con MaiA:**
```
"Busca tweets sobre [keyword] en los ultimos 7 dias"
"Que esta publicando @competidor en Twitter"
"Monitoriza el hashtag #[tema]"
"Analiza el engagement de los tweets de @marca"
```

---

### 7. facebook-page-manager
**Proposito:** Gestion de Facebook Pages via Meta Graph API.

**Requisitos:**
- Meta App con Facebook Login configurado
- `FB_APP_ID`, `FB_APP_SECRET` en .env

**Capacidades:**
- Listar todas las Pages que gestiona el usuario
- Publicar contenido (texto, fotos, links)
- Listar posts de la Page
- Gestionar comentarios (listar, responder, ocultar, eliminar)

**Configuracion:**
```bash
cd /opt/moltbot/skills/facebook-page-manager/scripts && npm install
# Seguir setup en skills/facebook-page-manager/SKILL.md
```

**Uso con MaiA:**
```
"Publica esta noticia en la Facebook Page de [cliente]"
"Muestra los ultimos 10 posts de la Page"
"Responde a los comentarios pendientes de [Page]"
"Analiza el engagement de los posts de este mes"
```

---

### 8. facebook
**Proposito:** Facebook Graph API para workflows de Pages.

**Requisitos:** Meta App token (`FB_PAGE_TOKEN`)

**Capacidades:**
- Posting en Pages (texto, imagenes, links)
- Lectura de comentarios
- Gestion basica de Pages

---

### 9. pinterest
**Proposito:** Busqueda y exploracion de contenido Pinterest con envio de imagenes por Telegram.

**Requisitos:** Ninguno (acceso publico)

**Capacidades:**
- Buscar pins por tema o keyword
- Ver detalles de pins
- Enviar imagenes directamente por Telegram
- Inspiracion visual para contenido

**Uso con MaiA:**
```
"Busca inspiracion en Pinterest para [nicho/estetica]"
"Que contenido visual esta trending en Pinterest sobre [tema]"
"Encuentra ideas de diseno para [tipo de negocio]"
```

---

## GOOGLE

### 10. google-maps-reviews-api-skill
**Proposito:** Extraccion automatica de resenas de Google Maps via API.

**Requisitos:** Google Maps Reviews API key

**Capacidades:**
- Extraer todas las resenas de un negocio en Google Maps
- Filtrar por fecha, valoracion o palabras clave
- Analisis de sentimiento de resenas
- Comparacion de resenas con competidores

**Uso con MaiA:**
```
"Extrae todas las resenas de [negocio] en Google Maps"
"Que dicen los clientes de [competidor] en Google Maps"
"Analiza el sentimiento de las resenas de este mes"
"Compara las resenas de [negocio A] vs [negocio B]"
```

---

### 11. ai-google-maps-review-dominator
**Proposito:** Sistema automatizado para dominar resenas de Google Maps vs competidores.

**Requisitos:** Google Maps API + configuracion inicial

**Capacidades:**
- Auditoria de resenas propias vs competidores
- Identificacion de clientes insatisfechos pre-abandono
- Sistema de 90 dias para conseguir resenas 5 estrellas
- Respuestas automatizadas a resenas
- Estrategia de outranking de competidores

**Uso con MaiA:**
```
"Auditoria completa de Google Maps de [negocio] vs competidores"
"Crea un plan de 90 dias para mejorar las resenas de [cliente]"
"Que hacen mejor los competidores en Google Maps"
```

---

### 12. google-maps-revenue-estimator
**Proposito:** Estima ingresos de negocios locales via Google Maps para prospecting de clientes.

**Requisitos:** Google Maps scraping (no API)

**Capacidades:**
- Estimar ingresos mensuales de cualquier negocio local
- Ranking de prospectos por presupuesto y crecimiento
- Generar mensajes de outreach personalizados
- Identificar negocios que podrian ser clientes ideales

**Uso con MaiA:**
```
"Estima los ingresos de los restaurantes en [ciudad]"
"Identifica los mejores prospectos para Growth Partner en [zona]"
"Genera un mensaje de outreach para [tipo de negocio]"
```

---

### 13. google-my-business
**Proposito:** Gestion de perfiles de Google Business Profile.

**Requisitos:** Google API + Service Account o OAuth

**Capacidades:**
- Gestionar informacion del negocio (horarios, descripcion, fotos)
- Ver y responder a resenas
- Publicar actualizaciones en el perfil
- Ver estadisticas de busqueda y mapas

**Uso con MaiA:**
```
"Actualiza los horarios de [negocio] en Google Business"
"Publica una oferta en el perfil de Google de [cliente]"
"Cuantas busquedas recibi este mes en Google Maps"
```

---

### 14. google-trends
**Proposito:** Monitorizacion de Google Trends para keywords, mercados y tendencias.

**Requisitos:** Ninguno (acceso publico via pytrends o scraping)

**Capacidades:**
- Trending searches por pais y categoria
- Comparar interes de keywords en el tiempo
- Tendencias por region geografica
- Temas relacionados y queries en ascenso
- Planificacion de contenido basada en tendencias

**Uso con MaiA:**
```
"Que esta trending en Google en Espana esta semana"
"Compara el interes de [keyword A] vs [keyword B] en el ultimo ano"
"Busca tendencias en el sector [hosteleria/restaurantes] en Galicia"
"Que keywords estan subiendo en mi nicho"
```

---

## ANALISIS Y ESTRATEGIA

### 15. seo-competitor-analysis
**Proposito:** Analisis SEO profundo de competidores: keywords, backlinks y estrategia de contenido.

**Requisitos:** Acceso a herramientas SEO (puede usar APIs gratuitas)

**Capacidades:**
- Analisis de keywords de competidores
- Verificacion de backlinks
- Mapeo de estrategia de contenido
- Identificacion de gaps de SEO
- Ranking de palabras clave objetivo

**Uso con MaiA:**
```
"Analiza la estrategia SEO de [competidor.com]"
"Por que keywords rankea [dominio]"
"Que backlinks tiene [competidor] que yo no tengo"
"Encuentra oportunidades de keywords sin explotar en [nicho]"
```

---

### 16. competitor-analysis
**Proposito:** Analisis competitivo SEO general: quien rankea, que hacen, como superarlos.

**Capacidades:**
- Identificar competidores por keyword
- Analizar que hace bien cada competidor
- Estrategia para superar en SEO
- Analisis de contenido competidor

**Uso con MaiA:**
```
"Analiza a los competidores de [URL/negocio]"
"Quien rankea primero para [keyword] y por que"
"Que estrategia de contenido usa [competidor]"
```

---

### 17. social-media-agent
**Proposito:** Automatizacion de Twitter/X sin API keys via browser automation.

**Requisitos:** Ninguno (browser automation)

**Capacidades:**
- Automatizar publicaciones en X/Twitter
- Generar contenido optimizado
- Trackear engagement
- Construir audiencia de forma sistematica
- Calendarios de contenido para X

**Uso con MaiA:**
```
"Automatiza la publicacion en Twitter de [cuenta]"
"Genera un calendario de contenido para Twitter este mes"
"Construye una estrategia de audiencia en X para [nicho]"
```

---

### 18. social-media-scheduler
**Proposito:** Planificacion y organizacion de contenido multi-plataforma.

**Capacidades:**
- Calendarios editoriales completos
- Posts optimizados por plataforma
- Planificacion de horarios de publicacion
- Mantenimiento de consistencia de marca

**Uso con MaiA:**
```
"Crea un calendario de contenido para [cliente] para el mes de abril"
"Planifica las publicaciones de esta semana en todas las redes"
"Adapta este contenido para Instagram, Facebook y LinkedIn"
```

---

### 19. marketing-mode
**Proposito:** Suite de 23 skills de marketing combinados: estrategia, psicologia, SEO, conversion y paid growth.

**Requisitos:** Ninguno

**Capacidades:**
- Estrategia de marketing completa
- Copywriting y persuasion
- SEO tecnico y de contenido
- Optimizacion de conversion (CRO)
- Publicidad pagada (Meta Ads, Google Ads)
- Email marketing
- Psicologia del consumidor

**Uso con MaiA:**
```
"Crea una estrategia de marketing completa para [cliente]"
"Escribe copies publicitarios para Meta Ads de [producto]"
"Como optimizo la tasa de conversion de esta landing page"
"Crea un plan de email marketing para [negocio]"
```

---

## CREDENCIALES NECESARIAS

| Skill | Variable de entorno | Como obtener |
|---|---|---|
| youtube-analytics | `YOUTUBE_API_KEY` | console.cloud.google.com |
| linkedin-api | `MATON_API_KEY` | maton.ai |
| x-twitter | `TWITTER_BEARER_TOKEN` | developer.twitter.com |
| facebook-page-manager | `FB_APP_ID`, `FB_APP_SECRET` | developers.facebook.com |
| google-maps-reviews | Google Maps API key | console.cloud.google.com |
| google-my-business | Google OAuth | console.cloud.google.com |

**Skills sin credenciales:** instagram-analyzer, tiktok-growth, tiktok-crawling (yt-dlp), pinterest, google-trends, seo-competitor-analysis, competitor-analysis, social-media-agent, social-media-scheduler, marketing-mode

---

## FLUJO GROWTH PARTNER

Para un cliente nuevo, MaiA ejecuta este flujo:

1. **Auditoria inicial** (sin credenciales)
   - google-trends: keywords y tendencias del sector
   - competitor-analysis: quienes son sus competidores
   - google-maps-revenue-estimator: potencial del mercado local

2. **Analisis de presencia digital** (con credenciales del cliente)
   - instagram-analyzer: metricas actuales del cliente
   - google-maps-reviews-api-skill: estado de su reputacion
   - youtube-analytics: rendimiento del canal (si tiene)

3. **Estrategia de contenido**
   - tiktok-growth: scripts virales para TikTok
   - social-media-scheduler: calendario editorial
   - marketing-mode: estrategia completa

4. **Monitorizacion continua**
   - x-twitter: hashtags y menciones del sector
   - ai-google-maps-review-dominator: sistema de resenas
   - google-trends: tendencias semanales
