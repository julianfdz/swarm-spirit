export interface StreamEvent {
  id: string;
  type: string;
  timestamp: string;
  sourceDaemonId: string;
  sourceDaemonName: string;
  correlationId: string;
  status: "ok" | "error";
  payload: Record<string, unknown>;
}

// Correlation traces — each array is a full pipeline trace
const correlationTraces: Record<string, string[]> = {
  "corr-a1b2c3": [
    "news.feed_fetched",
    "news.items_found",
    "article.draft_created",
    "article.seo_scored",
    "article.ready_for_publish",
    "publish.slug_generated",
    "publish.db_inserted",
    "publish.scheduled",
    "publish.telegram_notified",
  ],
  "corr-d4e5f6": [
    "news.feed_fetched",
    "news.items_found",
    "article.draft_created",
    "article.seo_scored",
    "article.ready_for_publish",
    "publish.slug_generated",
    "publish.db_inserted",
    "publish.scheduled",
  ],
  "corr-g7h8i9": [
    "news.feed_fetched",
    "news.items_found",
    "article.draft_created",
    "article.seo_scored",
    "article.error_generation",
  ],
  "corr-j1k2l3": [
    "news.feed_fetched",
    "news.items_found",
    "article.draft_created",
    "article.seo_scored",
    "article.ready_for_publish",
    "publish.slug_generated",
    "publish.db_inserted",
    "publish.scheduled",
    "publish.telegram_notified",
  ],
};

const daemonMap: Record<string, { id: string; name: string }> = {
  "news.": { id: "scraper-noticias", name: "scraper-noticias" },
  "article.": { id: "redactor-articulos", name: "redactor-articulos" },
  "publish.": { id: "publicador-bbdd", name: "publicador-bbdd" },
  "dev.": { id: "dev-mantenimiento", name: "dev-mantenimiento" },
};

function getDaemon(type: string) {
  for (const prefix of Object.keys(daemonMap)) {
    if (type.startsWith(prefix)) return daemonMap[prefix];
  }
  return { id: "unknown", name: "unknown" };
}

const payloads: Record<string, Record<string, unknown>> = {
  "news.feed_fetched": { source: "laverdad.es/murcia", articles_raw: 24, duration_ms: 2100 },
  "news.items_found": { relevant_count: 4, threshold: 0.7, sources: ["La Verdad", "Murcia Diario"] },
  "article.draft_created": { title: "Obras en Calle Mayor de Alcantarilla", words: 420 },
  "article.seo_scored": { score: 87, keywords: ["alcantarilla", "obras", "calle mayor"] },
  "article.ready_for_publish": { article_id: null, format: "html", images: 0 },
  "article.error_generation": { error: "Token limit exceeded", retry: false },
  "publish.slug_generated": { slug: "obras-calle-mayor-alcantarilla-2026" },
  "publish.db_inserted": { article_id: 1247, table: "articles" },
  "publish.scheduled": { scheduled_at: "2026-02-19T11:00:00Z" },
  "publish.telegram_notified": { channel: "@diarioalcantarilla", success: true },
};

let eventCounter = 0;
function makeEvent(type: string, corrId: string, baseTime: Date, offsetMinutes: number): StreamEvent {
  const daemon = getDaemon(type);
  const ts = new Date(baseTime.getTime() + offsetMinutes * 60000);
  eventCounter++;
  return {
    id: `evt-${eventCounter.toString().padStart(4, "0")}`,
    type,
    timestamp: ts.toISOString().replace("T", " ").slice(0, 19),
    sourceDaemonId: daemon.id,
    sourceDaemonName: daemon.name,
    correlationId: corrId,
    status: type.includes("error") ? "error" : "ok",
    payload: { ...payloads[type] || {}, correlation_id: corrId },
  };
}

function generateEventsForCorrelation(corrId: string, baseTime: Date): StreamEvent[] {
  const types = correlationTraces[corrId] || [];
  return types.map((type, i) => makeEvent(type, corrId, baseTime, i * 1.5));
}

// Build full event list for the "diario-ia-alcantarilla" swarm
const base = new Date("2026-02-19T10:40:00Z");
export const diarioEvents: StreamEvent[] = [
  ...generateEventsForCorrelation("corr-a1b2c3", base),
  ...generateEventsForCorrelation("corr-d4e5f6", new Date(base.getTime() + 15 * 60000)),
  ...generateEventsForCorrelation("corr-g7h8i9", new Date(base.getTime() + 30 * 60000)),
  ...generateEventsForCorrelation("corr-j1k2l3", new Date(base.getTime() + 45 * 60000)),
].sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // newest first

// Events for other swarms (smaller set)
export const customerOpsEvents: StreamEvent[] = [
  {
    id: "evt-c001", type: "ticket.received", timestamp: "2026-02-19 10:50:01",
    sourceDaemonId: "soporte-chat", sourceDaemonName: "soporte-chat",
    correlationId: "corr-t892", status: "ok" as const,
    payload: { ticket_id: 892, subject: "No puedo acceder a mi cuenta", urgency: "MEDIA" },
  },
  {
    id: "evt-c002", type: "ticket.classified", timestamp: "2026-02-19 10:50:03",
    sourceDaemonId: "soporte-chat", sourceDaemonName: "soporte-chat",
    correlationId: "corr-t892", status: "ok" as const,
    payload: { category: "AUTH", auto_response: true },
  },
  {
    id: "evt-c003", type: "ticket.responded", timestamp: "2026-02-19 10:50:05",
    sourceDaemonId: "soporte-chat", sourceDaemonName: "soporte-chat",
    correlationId: "corr-t892", status: "ok" as const,
    payload: { response_type: "password_reset_instructions" },
  },
  {
    id: "evt-c004", type: "ticket.received", timestamp: "2026-02-19 10:51:00",
    sourceDaemonId: "soporte-chat", sourceDaemonName: "soporte-chat",
    correlationId: "corr-t893", status: "ok" as const,
    payload: { ticket_id: 893, subject: "Precio del plan enterprise", urgency: "BAJA" },
  },
  {
    id: "evt-c005", type: "ticket.escalated", timestamp: "2026-02-19 10:51:03",
    sourceDaemonId: "soporte-chat", sourceDaemonName: "soporte-chat",
    correlationId: "corr-t893", status: "ok" as const,
    payload: { escalated_to: "sales_team" },
  },
  {
    id: "evt-c006", type: "analytics.report_generated", timestamp: "2026-02-19 09:00:10",
    sourceDaemonId: "analista-tickets", sourceDaemonName: "analista-tickets",
    correlationId: "corr-rpt01", status: "ok" as const,
    payload: { total_tickets: 127, trend: "+40% billing tickets" },
  },
].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

export const socialHiveEvents: StreamEvent[] = [
  {
    id: "evt-s001", type: "social.post_generated", timestamp: "2026-02-19 10:00:05",
    sourceDaemonId: "content-creator", sourceDaemonName: "content-creator",
    correlationId: "corr-tw01", status: "ok" as const,
    payload: { platform: "twitter", copy: "Descubre las novedades de esta semana 🚀" },
  },
  {
    id: "evt-s002", type: "social.post_scheduled", timestamp: "2026-02-19 10:00:08",
    sourceDaemonId: "content-creator", sourceDaemonName: "content-creator",
    correlationId: "corr-tw01", status: "ok" as const,
    payload: { scheduled_at: "2026-02-19T12:00:00Z" },
  },
  {
    id: "evt-s003", type: "social.content_generated", timestamp: "2026-02-19 10:15:05",
    sourceDaemonId: "content-creator", sourceDaemonName: "content-creator",
    correlationId: "corr-ig01", status: "ok" as const,
    payload: { platform: "instagram", hashtags: 5 },
  },
  {
    id: "evt-s004", type: "moderation.scan_complete", timestamp: "2026-02-19 09:30:08",
    sourceDaemonId: "community-mod", sourceDaemonName: "community-mod",
    correlationId: "corr-mod01", status: "ok" as const,
    payload: { comments_scanned: 42, spam_detected: 2 },
  },
  {
    id: "evt-s005", type: "moderation.api_error", timestamp: "2026-02-19 09:35:00",
    sourceDaemonId: "community-mod", sourceDaemonName: "community-mod",
    correlationId: "corr-mod01", status: "error" as const,
    payload: { error: "Twitter API rate limit exceeded (429)", daemon_stopped: true },
  },
].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

export function getEventsForSwarm(swarmId: string): StreamEvent[] {
  switch (swarmId) {
    case "diario-ia-alcantarilla": return diarioEvents;
    case "customer-ops": return customerOpsEvents;
    case "social-media-hive": return socialHiveEvents;
    default: return [];
  }
}
