export type TaskStatus = "pending" | "in_progress" | "failed" | "completed" | "dlq";
export type TaskPriority = "critical" | "high" | "medium" | "low";

export interface PoolTask {
  id: string;
  type: string;
  label: string;
  status: TaskStatus;
  priority: TaskPriority;
  retries: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  lockedBy: string | null; // daemon id holding the lease
  lockedByName: string | null;
  correlationId: string | null;
  error: string | null;
  // For the visual pool - position offsets (percentage-based)
  poolX: number;
  poolY: number;
}

function task(
  id: string, type: string, label: string, status: TaskStatus,
  priority: TaskPriority, retries: number, maxRetries: number,
  lockedBy: string | null, lockedByName: string | null,
  correlationId: string | null, error: string | null,
  createdAt: string, updatedAt: string,
): PoolTask {
  return {
    id, type, label, status, priority, retries, maxRetries,
    createdAt, updatedAt, lockedBy, lockedByName, correlationId, error,
    poolX: Math.random() * 80 + 5,
    poolY: Math.random() * 70 + 10,
  };
}

export const diarioTasks: PoolTask[] = [
  task("t-001", "news.scrape", "Scrape La Verdad RSS", "in_progress", "high", 0, 3,
    "scraper-noticias", "scraper-noticias", "corr-a1b2c3", null,
    "2026-02-19 10:40:00", "2026-02-19 10:42:01"),
  task("t-002", "news.scrape", "Scrape Murcia Diario", "completed", "high", 1, 3,
    null, null, "corr-a1b2c3", null,
    "2026-02-19 10:40:00", "2026-02-19 10:42:12"),
  task("t-003", "article.write", "Redactar: Obras Calle Mayor", "in_progress", "medium", 0, 3,
    "redactor-articulos", "redactor-articulos", "corr-a1b2c3", null,
    "2026-02-19 10:42:14", "2026-02-19 10:43:02"),
  task("t-004", "article.write", "Redactar: Festival primavera", "pending", "medium", 0, 3,
    null, null, "corr-d4e5f6", null,
    "2026-02-19 10:55:00", "2026-02-19 10:55:00"),
  task("t-005", "publish.insert", "Publicar artículo #1247", "in_progress", "high", 0, 3,
    "publicador-bbdd", "publicador-bbdd", "corr-a1b2c3", null,
    "2026-02-19 10:44:00", "2026-02-19 10:44:03"),
  task("t-006", "publish.notify", "Notificar Telegram", "pending", "low", 0, 3,
    null, null, "corr-a1b2c3", null,
    "2026-02-19 10:44:09", "2026-02-19 10:44:09"),
  task("t-007", "news.scrape", "Scrape 20 Minutos", "failed", "high", 3, 3,
    null, null, "corr-g7h8i9", "Connection timeout after 30s",
    "2026-02-19 10:50:00", "2026-02-19 10:52:30"),
  task("t-008", "article.write", "Redactar: Corte de agua", "failed", "medium", 2, 3,
    null, null, "corr-g7h8i9", "Token limit exceeded on GPT-4o",
    "2026-02-19 10:53:00", "2026-02-19 10:55:10"),
  task("t-009", "dev.healthcheck", "Health check sitio web", "pending", "low", 0, 3,
    null, null, null, null,
    "2026-02-19 14:00:00", "2026-02-19 14:00:00"),
  task("t-010", "publish.insert", "Publicar artículo #1248", "pending", "medium", 0, 3,
    null, null, "corr-d4e5f6", null,
    "2026-02-19 11:00:00", "2026-02-19 11:00:00"),
  task("t-011", "news.filter", "Filtrar relevancia batch", "in_progress", "critical", 0, 3,
    "scraper-noticias", "scraper-noticias", "corr-j1k2l3", null,
    "2026-02-19 11:25:00", "2026-02-19 11:25:05"),
  task("t-012", "article.seo", "SEO score artículo #1247", "completed", "medium", 0, 3,
    null, null, "corr-a1b2c3", null,
    "2026-02-19 10:43:08", "2026-02-19 10:43:08"),
  task("t-013", "publish.schedule", "Programar publicación tarde", "pending", "low", 0, 3,
    null, null, "corr-d4e5f6", null,
    "2026-02-19 11:10:00", "2026-02-19 11:10:00"),
  task("t-014", "article.write", "Redactar: Nueva línea bus", "dlq", "high", 3, 3,
    null, null, "corr-g7h8i9", "Persistent failure: source content empty after 3 retries",
    "2026-02-19 10:30:00", "2026-02-19 10:45:00"),
];

export const customerOpsTasks: PoolTask[] = [
  task("t-c01", "ticket.respond", "Responder ticket #892", "in_progress", "high", 0, 3,
    "soporte-chat", "soporte-chat", "corr-t892", null,
    "2026-02-19 10:50:01", "2026-02-19 10:50:03"),
  task("t-c02", "ticket.classify", "Clasificar ticket #893", "completed", "medium", 0, 3,
    null, null, "corr-t893", null,
    "2026-02-19 10:51:00", "2026-02-19 10:51:02"),
  task("t-c03", "ticket.escalate", "Escalar a ventas #893", "pending", "low", 0, 3,
    null, null, "corr-t893", null,
    "2026-02-19 10:51:03", "2026-02-19 10:51:03"),
  task("t-c04", "analytics.report", "Generar reporte diario", "in_progress", "medium", 0, 3,
    "analista-tickets", "analista-tickets", "corr-rpt01", null,
    "2026-02-19 09:00:00", "2026-02-19 09:00:05"),
  task("t-c05", "schedule.compute", "Calcular turnos mañana", "pending", "high", 0, 3,
    null, null, null, null,
    "2026-02-19 06:00:00", "2026-02-19 06:00:00"),
];

export const socialHiveTasks: PoolTask[] = [
  task("t-s01", "social.generate", "Post Twitter semanal", "completed", "medium", 0, 3,
    null, null, "corr-tw01", null,
    "2026-02-19 10:00:00", "2026-02-19 10:00:05"),
  task("t-s02", "social.schedule", "Programar post 12:00", "in_progress", "medium", 0, 3,
    "content-creator", "content-creator", "corr-tw01", null,
    "2026-02-19 10:00:08", "2026-02-19 10:00:08"),
  task("t-s03", "social.generate", "Contenido Instagram", "pending", "medium", 0, 3,
    null, null, "corr-ig01", null,
    "2026-02-19 10:15:00", "2026-02-19 10:15:00"),
  task("t-s04", "moderation.scan", "Escanear comentarios", "failed", "high", 2, 3,
    null, null, "corr-mod01", "Twitter API rate limit (429)",
    "2026-02-19 09:30:00", "2026-02-19 09:35:00"),
  task("t-s05", "moderation.scan", "Retry escaneo comments", "dlq", "high", 3, 3,
    null, null, "corr-mod01", "Rate limit persistent. Manual intervention required.",
    "2026-02-19 09:35:01", "2026-02-19 09:40:00"),
];

export function getTasksForSwarm(swarmId: string): PoolTask[] {
  switch (swarmId) {
    case "diario-ia-alcantarilla": return diarioTasks;
    case "customer-ops": return customerOpsTasks;
    case "social-media-hive": return socialHiveTasks;
    default: return [];
  }
}
