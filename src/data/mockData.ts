import daemonScraper from "@/assets/daemon-scraper.png";
import daemonWriter from "@/assets/daemon-writer.png";
import daemonPublisher from "@/assets/daemon-publisher.png";
import daemonProgrammer from "@/assets/daemon-programmer.png";
import daemonAnalyst from "@/assets/daemon-analyst.png";
import daemonSupport from "@/assets/daemon-support.png";
import daemonSocial from "@/assets/daemon-social.png";
import daemonScheduler from "@/assets/daemon-scheduler.png";

export type DaemonStatus = "running" | "sleeping" | "error";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

export interface ChatMessage {
  role: "user" | "daemon";
  message: string;
  timestamp: string;
}

export interface Daemon {
  id: string;
  name: string;
  role: string;
  status: DaemonStatus;
  avatar: string;
  prompt: string;
  structuredOutput: string | null; // JSON schema string or null
  lastRun: string;
  logs: LogEntry[];
  chat: ChatMessage[];
}

export interface Swarm {
  id: string;
  name: string;
  description: string;
  daemonCount: number;
  activeCount: number;
  daemons: Daemon[];
}

const scraperLogs: LogEntry[] = [
  { timestamp: "2026-02-19 10:42:01", level: "info", message: "Iniciando ciclo de scraping..." },
  { timestamp: "2026-02-19 10:42:03", level: "info", message: "Conectando a RSS feed: laverdad.es/murcia" },
  { timestamp: "2026-02-19 10:42:05", level: "info", message: "Feed parseado: 24 artículos encontrados" },
  { timestamp: "2026-02-19 10:42:06", level: "info", message: "Filtrando por relevancia para Alcantarilla..." },
  { timestamp: "2026-02-19 10:42:07", level: "info", message: "3 artículos relevantes detectados (score > 0.7)" },
  { timestamp: "2026-02-19 10:42:08", level: "info", message: "Conectando a murcia-diario.com..." },
  { timestamp: "2026-02-19 10:42:10", level: "warn", message: "Timeout parcial en murcia-diario.com, reintentando..." },
  { timestamp: "2026-02-19 10:42:12", level: "info", message: "Reintento exitoso. 18 artículos obtenidos." },
  { timestamp: "2026-02-19 10:42:13", level: "info", message: "1 artículo relevante adicional detectado." },
  { timestamp: "2026-02-19 10:42:14", level: "info", message: "Total: 4 noticias relevantes enviadas al redactor." },
  { timestamp: "2026-02-19 10:42:15", level: "info", message: "Ciclo completado. Próximo en 30 min." },
];

const writerLogs: LogEntry[] = [
  { timestamp: "2026-02-19 10:43:00", level: "info", message: "Recibidas 4 noticias en crudo del scraper." },
  { timestamp: "2026-02-19 10:43:02", level: "info", message: "Procesando noticia 1/4: 'Obras en Calle Mayor de Alcantarilla'" },
  { timestamp: "2026-02-19 10:43:08", level: "info", message: "Artículo generado: 420 palabras, SEO score: 87" },
  { timestamp: "2026-02-19 10:43:10", level: "info", message: "Procesando noticia 2/4: 'Festival de primavera 2026'" },
  { timestamp: "2026-02-19 10:43:15", level: "info", message: "Artículo generado: 380 palabras, SEO score: 91" },
  { timestamp: "2026-02-19 10:43:17", level: "info", message: "Procesando noticia 3/4..." },
  { timestamp: "2026-02-19 10:43:22", level: "info", message: "Artículo generado: 510 palabras, SEO score: 84" },
  { timestamp: "2026-02-19 10:43:24", level: "info", message: "Procesando noticia 4/4..." },
  { timestamp: "2026-02-19 10:43:30", level: "info", message: "Artículo generado: 350 palabras, SEO score: 89" },
  { timestamp: "2026-02-19 10:43:31", level: "info", message: "4 artículos enviados al publicador." },
];

const publisherLogs: LogEntry[] = [
  { timestamp: "2026-02-19 10:44:00", level: "info", message: "Recibidos 4 artículos del redactor." },
  { timestamp: "2026-02-19 10:44:01", level: "info", message: "Verificando duplicados en BBDD..." },
  { timestamp: "2026-02-19 10:44:02", level: "info", message: "0 duplicados encontrados." },
  { timestamp: "2026-02-19 10:44:03", level: "info", message: "Generando slug: obras-calle-mayor-alcantarilla-2026" },
  { timestamp: "2026-02-19 10:44:04", level: "info", message: "Insertado en BBDD: artículo #1247" },
  { timestamp: "2026-02-19 10:44:05", level: "info", message: "Programado para publicación: 11:00 AM" },
  { timestamp: "2026-02-19 10:44:08", level: "info", message: "3 artículos más procesados y programados." },
  { timestamp: "2026-02-19 10:44:09", level: "info", message: "Notificación enviada a Telegram." },
];

const devLogs: LogEntry[] = [
  { timestamp: "2026-02-19 08:00:00", level: "info", message: "Ciclo de mantenimiento iniciado." },
  { timestamp: "2026-02-19 08:00:05", level: "info", message: "Health check: sitio web OK (200, 340ms)" },
  { timestamp: "2026-02-19 08:00:10", level: "info", message: "Verificando logs del servidor..." },
  { timestamp: "2026-02-19 08:00:12", level: "warn", message: "2 warnings de memoria detectados en las últimas 6h." },
  { timestamp: "2026-02-19 08:00:15", level: "info", message: "Revisando dependencias..." },
  { timestamp: "2026-02-19 08:00:18", level: "info", message: "Todas las dependencias up-to-date." },
  { timestamp: "2026-02-19 08:00:20", level: "info", message: "Ciclo completado. Próximo en 6h." },
];

const supportLogs: LogEntry[] = [
  { timestamp: "2026-02-19 10:50:01", level: "info", message: "Ticket #892 recibido: 'No puedo acceder a mi cuenta'" },
  { timestamp: "2026-02-19 10:50:03", level: "info", message: "Clasificación: urgencia MEDIA, tema: AUTH" },
  { timestamp: "2026-02-19 10:50:05", level: "info", message: "Respuesta enviada con instrucciones de reset." },
  { timestamp: "2026-02-19 10:51:00", level: "info", message: "Ticket #893 recibido: 'Precio del plan enterprise'" },
  { timestamp: "2026-02-19 10:51:02", level: "info", message: "Clasificación: urgencia BAJA, tema: SALES" },
  { timestamp: "2026-02-19 10:51:03", level: "info", message: "Escalado a equipo de ventas." },
];

const analystLogs: LogEntry[] = [
  { timestamp: "2026-02-19 09:00:00", level: "info", message: "Generando reporte diario de tickets..." },
  { timestamp: "2026-02-19 09:00:05", level: "info", message: "127 tickets procesados en las últimas 24h." },
  { timestamp: "2026-02-19 09:00:08", level: "warn", message: "Tendencia detectada: +40% tickets sobre facturación." },
  { timestamp: "2026-02-19 09:00:10", level: "info", message: "Reporte enviado al canal #ops-reports." },
];

const schedulerLogs: LogEntry[] = [
  { timestamp: "2026-02-18 06:00:00", level: "info", message: "Calculando turnos para hoy..." },
  { timestamp: "2026-02-18 06:00:05", level: "info", message: "Volumen esperado: 140 tickets (basado en histórico)." },
  { timestamp: "2026-02-18 06:00:08", level: "info", message: "Turnos asignados: 3 agentes mañana, 2 tarde, 1 noche." },
  { timestamp: "2026-02-18 06:00:10", level: "info", message: "Notificaciones enviadas al equipo." },
];

const socialLogs: LogEntry[] = [
  { timestamp: "2026-02-19 10:00:00", level: "info", message: "Generando post para Twitter..." },
  { timestamp: "2026-02-19 10:00:05", level: "info", message: "Copy generado: 'Descubre las novedades de esta semana 🚀'" },
  { timestamp: "2026-02-19 10:00:08", level: "info", message: "Programado para publicación: 12:00 PM" },
  { timestamp: "2026-02-19 10:15:00", level: "info", message: "Generando contenido Instagram..." },
  { timestamp: "2026-02-19 10:15:05", level: "info", message: "Caption + 5 hashtags generados." },
];

const metricsLogs: LogEntry[] = [
  { timestamp: "2026-02-19 07:00:00", level: "info", message: "Recopilando métricas semanales..." },
  { timestamp: "2026-02-19 07:00:10", level: "info", message: "Twitter: +12% engagement, +340 followers" },
  { timestamp: "2026-02-19 07:00:12", level: "info", message: "Instagram: -5% reach, +180 followers" },
  { timestamp: "2026-02-19 07:00:15", level: "info", message: "Reporte generado y enviado." },
];

const modLogs: LogEntry[] = [
  { timestamp: "2026-02-19 09:30:00", level: "info", message: "Iniciando monitorización de comentarios..." },
  { timestamp: "2026-02-19 09:30:05", level: "info", message: "Escaneando 42 nuevos comentarios..." },
  { timestamp: "2026-02-19 09:30:08", level: "warn", message: "2 comentarios marcados como posible spam." },
  { timestamp: "2026-02-19 09:35:00", level: "error", message: "Error: Twitter API rate limit exceeded (429)" },
  { timestamp: "2026-02-19 09:35:01", level: "error", message: "Daemon detenido. Requiere intervención manual." },
];

const scraperChat: ChatMessage[] = [
  { role: "user", timestamp: "10:30", message: "¿Cuántas noticias has encontrado en el último ciclo?" },
  { role: "daemon", timestamp: "10:30", message: "En el último ciclo he encontrado 24 artículos en total, de los cuales 4 pasaron el filtro de relevancia para Alcantarilla (score > 0.7). Las fuentes fueron La Verdad (2), Murcia Diario (1) y 20 Minutos Murcia (1)." },
  { role: "user", timestamp: "10:31", message: "¿Puedes bajar el threshold de relevancia a 0.5?" },
  { role: "daemon", timestamp: "10:31", message: "Entendido. Ajusto el relevance_score threshold a 0.5. Con ese umbral, el último ciclo habría devuelto 9 noticias en lugar de 4. ¿Confirmo el cambio?" },
  { role: "user", timestamp: "10:32", message: "Sí, confirma." },
  { role: "daemon", timestamp: "10:32", message: "Threshold actualizado a 0.5. Se aplicará en el próximo ciclo (en ~18 min)." },
];

const writerChat: ChatMessage[] = [
  { role: "user", timestamp: "10:35", message: "¿Qué tono estás usando para los artículos?" },
  { role: "daemon", timestamp: "10:35", message: "Estoy usando un tono periodístico neutro, cercano y local. Evito sensacionalismo y priorizo claridad. Los artículos tienen entre 300-600 palabras con titular SEO optimizado." },
  { role: "user", timestamp: "10:36", message: "Perfecto, sigue así." },
];

const publisherChat: ChatMessage[] = [
  { role: "user", timestamp: "10:40", message: "¿Cuántos artículos has publicado hoy?" },
  { role: "daemon", timestamp: "10:40", message: "Hoy he publicado 12 artículos. 8 programados por la mañana y 4 para la franja de tarde (14:00-18:00). No se detectaron duplicados." },
];

const devChat: ChatMessage[] = [
  { role: "user", timestamp: "08:05", message: "¿Algún problema detectado?" },
  { role: "daemon", timestamp: "08:05", message: "He detectado 2 warnings de memoria en las últimas 6 horas pero nada crítico. El sitio responde en 340ms de media. Todas las dependencias están actualizadas." },
  { role: "user", timestamp: "08:06", message: "Monitoriza la memoria más de cerca." },
  { role: "daemon", timestamp: "08:06", message: "Entendido. Incremento la frecuencia de checks de memoria a cada 30 minutos y estableceré una alerta si supera el 80% de uso." },
];

const defaultChat: ChatMessage[] = [
  { role: "user", timestamp: "09:00", message: "¿Todo bien?" },
  { role: "daemon", timestamp: "09:00", message: "Operando con normalidad. Sin incidencias." },
];

const scraperSchema = `{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "body": { "type": "string" },
      "source": { "type": "string" },
      "date": { "type": "string", "format": "date-time" },
      "relevance_score": { "type": "number", "min": 0, "max": 1 },
      "url": { "type": "string", "format": "uri" },
      "category": { "type": "string", "enum": ["local", "politica", "deportes", "cultura", "economia"] }
    },
    "required": ["title", "body", "source", "date", "relevance_score"]
  }
}`;

const publisherSchema = `{
  "type": "object",
  "properties": {
    "article_id": { "type": "number" },
    "slug": { "type": "string" },
    "category": { "type": "string" },
    "published_at": { "type": "string", "format": "date-time" },
    "status": { "type": "string", "enum": ["published", "scheduled", "draft"] },
    "telegram_notified": { "type": "boolean" }
  },
  "required": ["article_id", "slug", "status"]
}`;

const analystSchema = `{
  "type": "object",
  "properties": {
    "date": { "type": "string", "format": "date" },
    "total_tickets": { "type": "number" },
    "by_category": { "type": "object" },
    "trends": { "type": "array", "items": { "type": "string" } },
    "recommendations": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["date", "total_tickets", "by_category"]
}`;

const schedulerSchema = `{
  "type": "object",
  "properties": {
    "date": { "type": "string", "format": "date" },
    "expected_volume": { "type": "number" },
    "shifts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "period": { "type": "string", "enum": ["morning", "afternoon", "night"] },
          "agents": { "type": "number" }
        }
      }
    }
  },
  "required": ["date", "shifts"]
}`;

const metricsSchema = `{
  "type": "object",
  "properties": {
    "period": { "type": "string" },
    "platforms": {
      "type": "object",
      "properties": {
        "twitter": { "type": "object" },
        "instagram": { "type": "object" },
        "linkedin": { "type": "object" }
      }
    },
    "overall_engagement_delta": { "type": "string" }
  },
  "required": ["period", "platforms"]
}`;

export const swarms: Swarm[] = [
  {
    id: "diario-ia-alcantarilla",
    name: "Diario IA de Alcantarilla",
    description: "Periódico digital 100% IA para Alcantarilla. Scraping, redacción, publicación y mantenimiento automatizado.",
    daemonCount: 4,
    activeCount: 3,
    daemons: [
      {
        id: "scraper-noticias", name: "scraper-noticias", role: "News Scraper",
        status: "running", avatar: daemonScraper,
        structuredOutput: scraperSchema,
        prompt: "Eres un agente scraper especializado en noticias locales de Alcantarilla, Murcia. Tu trabajo es monitorear fuentes RSS, portales de noticias regionales (La Verdad, Murcia Diario, etc.) y redes sociales locales. Extraes titulares, cuerpo de noticia, fecha y fuente. Filtras por relevancia para Alcantarilla y su comarca. Ejecutas cada 30 minutos. Formato de salida: JSON estructurado con campos title, body, source, date, relevance_score.",
        lastRun: "Hace 12 min", logs: scraperLogs, chat: scraperChat,
      },
      {
        id: "redactor-articulos", name: "redactor-articulos", role: "Article Writer",
        status: "running", avatar: daemonWriter,
        structuredOutput: null,
        prompt: "Eres un periodista digital IA. Recibes noticias en crudo del scraper y las transformas en artículos periodísticos completos en español. Aplicas estilo periodístico neutro, verificas coherencia, añades contexto local cuando es relevante. Generas titular SEO, entradilla, cuerpo del artículo y tags. Longitud objetivo: 300-600 palabras. Tono: profesional, cercano, local.",
        lastRun: "Hace 8 min", logs: writerLogs, chat: writerChat,
      },
      {
        id: "publicador-bbdd", name: "publicador-bbdd", role: "Publisher",
        status: "running", avatar: daemonPublisher,
        structuredOutput: publisherSchema,
        prompt: "Eres el agente publicador. Recibes artículos terminados del redactor y los procesas para publicación. Generas slug SEO, asignas categoría, insertas en la base de datos del CMS. Verificas que no haya duplicados. Programas publicación según horario óptimo de engagement. Notificas al canal de Telegram del periódico con un resumen.",
        lastRun: "Hace 5 min", logs: publisherLogs, chat: publisherChat,
      },
      {
        id: "dev-mantenimiento", name: "dev-mantenimiento", role: "Programmer",
        status: "sleeping", avatar: daemonProgrammer,
        structuredOutput: null,
        prompt: "Eres el daemon programador de mantenimiento del Diario IA. Monitorizas el estado del sitio web, verificas que las páginas cargan correctamente, revisas los logs de error del servidor. Cuando detectas un problema, generas un informe técnico y propones un fix. También te encargas de actualizar dependencias y optimizar queries de la BBDD. Te activas cada 6 horas o ante alertas críticas.",
        lastRun: "Hace 2h", logs: devLogs, chat: devChat,
      },
    ],
  },
  {
    id: "customer-ops",
    name: "Customer Ops Squad",
    description: "Equipo de atención al cliente automatizado. Soporte, análisis de tickets y gestión de escalaciones.",
    daemonCount: 3,
    activeCount: 2,
    daemons: [
      {
        id: "soporte-chat", name: "soporte-chat", role: "Support Agent",
        status: "running", avatar: daemonSupport,
        structuredOutput: null,
        prompt: "Eres un agente de soporte al cliente de primer nivel. Respondes consultas frecuentes, clasificas tickets por urgencia y tema, y escalas a humanos cuando es necesario. Tono amable y profesional. Respuesta máxima: 3 párrafos.",
        lastRun: "Hace 1 min", logs: supportLogs, chat: defaultChat,
      },
      {
        id: "analista-tickets", name: "analista-tickets", role: "Ticket Analyst",
        status: "running", avatar: daemonAnalyst,
        structuredOutput: analystSchema,
        prompt: "Analizas todos los tickets de soporte entrantes. Generas reportes diarios de tendencias, detectas problemas recurrentes y propones mejoras al producto basándote en el feedback de los usuarios.",
        lastRun: "Hace 15 min", logs: analystLogs, chat: defaultChat,
      },
      {
        id: "scheduler-turnos", name: "scheduler-turnos", role: "Scheduler",
        status: "sleeping", avatar: daemonScheduler,
        structuredOutput: schedulerSchema,
        prompt: "Gestionas la programación de turnos del equipo de soporte humano. Optimizas cobertura según volumen histórico de tickets. Te activas cada día a las 6:00 AM.",
        lastRun: "Hace 18h", logs: schedulerLogs, chat: defaultChat,
      },
    ],
  },
  {
    id: "social-media-hive",
    name: "Social Media Hive",
    description: "Enjambre de gestión de redes sociales. Creación de contenido, programación y análisis de métricas.",
    daemonCount: 3,
    activeCount: 1,
    daemons: [
      {
        id: "content-creator", name: "content-creator", role: "Content Creator",
        status: "running", avatar: daemonSocial,
        structuredOutput: null,
        prompt: "Creas contenido para redes sociales (Twitter, Instagram, LinkedIn). Adaptas el tono según la plataforma. Generas copies, sugieres hashtags y propones horarios de publicación óptimos.",
        lastRun: "Hace 30 min", logs: socialLogs, chat: defaultChat,
      },
      {
        id: "metrics-watcher", name: "metrics-watcher", role: "Metrics Analyst",
        status: "sleeping", avatar: daemonAnalyst,
        structuredOutput: metricsSchema,
        prompt: "Monitorizas métricas de engagement en todas las redes sociales. Generas reportes semanales de rendimiento y propones ajustes de estrategia basados en datos.",
        lastRun: "Hace 3h", logs: metricsLogs, chat: defaultChat,
      },
      {
        id: "community-mod", name: "community-mod", role: "Moderator",
        status: "error", avatar: daemonSupport,
        structuredOutput: null,
        prompt: "Moderas comentarios y mensajes en redes sociales. Detectas spam, contenido ofensivo y trolls. Respondes a menciones relevantes de la marca.",
        lastRun: "Error: API rate limit", logs: modLogs, chat: defaultChat,
      },
    ],
  },
];
