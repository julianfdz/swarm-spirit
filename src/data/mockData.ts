import daemonScraper from "@/assets/daemon-scraper.png";
import daemonWriter from "@/assets/daemon-writer.png";
import daemonPublisher from "@/assets/daemon-publisher.png";
import daemonProgrammer from "@/assets/daemon-programmer.png";
import daemonAnalyst from "@/assets/daemon-analyst.png";
import daemonSupport from "@/assets/daemon-support.png";
import daemonSocial from "@/assets/daemon-social.png";
import daemonScheduler from "@/assets/daemon-scheduler.png";

export type DaemonStatus = "running" | "sleeping" | "error";

export interface Daemon {
  id: string;
  name: string;
  role: string;
  status: DaemonStatus;
  avatar: string;
  prompt: string;
  lastRun: string;
}

export interface Swarm {
  id: string;
  name: string;
  description: string;
  daemonCount: number;
  activeCount: number;
  daemons: Daemon[];
}

export const swarms: Swarm[] = [
  {
    id: "diario-ia-alcantarilla",
    name: "Diario IA de Alcantarilla",
    description: "Periódico digital 100% IA para Alcantarilla. Scraping, redacción, publicación y mantenimiento automatizado.",
    daemonCount: 4,
    activeCount: 3,
    daemons: [
      {
        id: "scraper-noticias",
        name: "scraper-noticias",
        role: "News Scraper",
        status: "running",
        avatar: daemonScraper,
        prompt: "Eres un agente scraper especializado en noticias locales de Alcantarilla, Murcia. Tu trabajo es monitorear fuentes RSS, portales de noticias regionales (La Verdad, Murcia Diario, etc.) y redes sociales locales. Extraes titulares, cuerpo de noticia, fecha y fuente. Filtras por relevancia para Alcantarilla y su comarca. Ejecutas cada 30 minutos. Formato de salida: JSON estructurado con campos title, body, source, date, relevance_score.",
        lastRun: "Hace 12 min",
      },
      {
        id: "redactor-articulos",
        name: "redactor-articulos",
        role: "Article Writer",
        status: "running",
        avatar: daemonWriter,
        prompt: "Eres un periodista digital IA. Recibes noticias en crudo del scraper y las transformas en artículos periodísticos completos en español. Aplicas estilo periodístico neutro, verificas coherencia, añades contexto local cuando es relevante. Generas titular SEO, entradilla, cuerpo del artículo y tags. Longitud objetivo: 300-600 palabras. Tono: profesional, cercano, local.",
        lastRun: "Hace 8 min",
      },
      {
        id: "publicador-bbdd",
        name: "publicador-bbdd",
        role: "Publisher",
        status: "running",
        avatar: daemonPublisher,
        prompt: "Eres el agente publicador. Recibes artículos terminados del redactor y los procesas para publicación. Generas slug SEO, asignas categoría, insertas en la base de datos del CMS. Verificas que no haya duplicados. Programas publicación según horario óptimo de engagement. Notificas al canal de Telegram del periódico con un resumen.",
        lastRun: "Hace 5 min",
      },
      {
        id: "dev-mantenimiento",
        name: "dev-mantenimiento",
        role: "Programmer",
        status: "sleeping",
        avatar: daemonProgrammer,
        prompt: "Eres el daemon programador de mantenimiento del Diario IA. Monitorizas el estado del sitio web, verificas que las páginas cargan correctamente, revisas los logs de error del servidor. Cuando detectas un problema, generas un informe técnico y propones un fix. También te encargas de actualizar dependencias y optimizar queries de la BBDD. Te activas cada 6 horas o ante alertas críticas.",
        lastRun: "Hace 2h",
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
        id: "soporte-chat",
        name: "soporte-chat",
        role: "Support Agent",
        status: "running",
        avatar: daemonSupport,
        prompt: "Eres un agente de soporte al cliente de primer nivel. Respondes consultas frecuentes, clasificas tickets por urgencia y tema, y escalas a humanos cuando es necesario. Tono amable y profesional. Respuesta máxima: 3 párrafos.",
        lastRun: "Hace 1 min",
      },
      {
        id: "analista-tickets",
        name: "analista-tickets",
        role: "Ticket Analyst",
        status: "running",
        avatar: daemonAnalyst,
        prompt: "Analizas todos los tickets de soporte entrantes. Generas reportes diarios de tendencias, detectas problemas recurrentes y propones mejoras al producto basándote en el feedback de los usuarios.",
        lastRun: "Hace 15 min",
      },
      {
        id: "scheduler-turnos",
        name: "scheduler-turnos",
        role: "Scheduler",
        status: "sleeping",
        avatar: daemonScheduler,
        prompt: "Gestionas la programación de turnos del equipo de soporte humano. Optimizas cobertura según volumen histórico de tickets. Te activas cada día a las 6:00 AM.",
        lastRun: "Hace 18h",
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
        id: "content-creator",
        name: "content-creator",
        role: "Content Creator",
        status: "running",
        avatar: daemonSocial,
        prompt: "Creas contenido para redes sociales (Twitter, Instagram, LinkedIn). Adaptas el tono según la plataforma. Generas copies, sugieres hashtags y propones horarios de publicación óptimos.",
        lastRun: "Hace 30 min",
      },
      {
        id: "metrics-watcher",
        name: "metrics-watcher",
        role: "Metrics Analyst",
        status: "sleeping",
        avatar: daemonAnalyst,
        prompt: "Monitorizas métricas de engagement en todas las redes sociales. Generas reportes semanales de rendimiento y propones ajustes de estrategia basados en datos.",
        lastRun: "Hace 3h",
      },
      {
        id: "community-mod",
        name: "community-mod",
        role: "Moderator",
        status: "error",
        avatar: daemonSupport,
        prompt: "Moderas comentarios y mensajes en redes sociales. Detectas spam, contenido ofensivo y trolls. Respondes a menciones relevantes de la marca.",
        lastRun: "Error: API rate limit",
      },
    ],
  },
];
