import { useState } from "react";
import { BookOpen, Download, Eye, Upload, User, Clock, Tag } from "lucide-react";

interface GrimoireSigil {
  id: string;
  name: string;
  role: string;
  description: string;
  author: string;
  tags: string[];
  createdAt: string;
  downloads: number;
  sigil: object;
}

const mockGrimoires: GrimoireSigil[] = [
  {
    id: "grim-001",
    name: "Arxiv Harvester",
    role: "Research Scraper",
    description:
      "Daemon especializado en rastrear y extraer papers de Arxiv por categorías. Genera resúmenes estructurados con campos como título, autores, abstract y enlaces. Ideal para pipelines de investigación automatizada.",
    author: "daemon_forge",
    tags: ["scraper", "research", "arxiv", "structured-output"],
    createdAt: "2026-02-28",
    downloads: 142,
    sigil: {
      sigil_version: "1.0.0",
      meta: {
        name: "Arxiv Harvester",
        role: "Research Scraper",
        version: "1.2.0",
        author: "daemon_forge",
        description: "Scrapes Arxiv for papers by category and returns structured summaries.",
        tags: ["scraper", "research", "arxiv"],
      },
      runtime: {
        status: "sleeping",
        schedule: "cron: 0 */6 * * *",
        max_retries: 3,
        timeout_seconds: 90,
        concurrency: 2,
      },
      prompts: {
        system_prompt:
          "You are a research assistant daemon. Your task is to scrape Arxiv for the latest papers in the given categories, extract title, authors, abstract, and PDF link, and return them as a structured JSON array.",
        temperature: 0.3,
        model: "gpt-4o",
        max_tokens: 4096,
      },
      structured_output: {
        enabled: true,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              authors: { type: "array", items: { type: "string" } },
              abstract: { type: "string" },
              pdf_url: { type: "string" },
              category: { type: "string" },
            },
          },
        },
      },
      capabilities: {
        can_chat: false,
        can_stream: false,
        has_memory: false,
        tools: ["web_scraper", "json_parser"],
      },
    },
  },
  {
    id: "grim-002",
    name: "Community Moderator",
    role: "Content Analyst",
    description:
      "Agente de moderación que analiza mensajes en tiempo real, detecta contenido tóxico y genera reportes de moderación. Soporta múltiples idiomas y se integra con webhooks de Discord/Slack.",
    author: "nether_ops",
    tags: ["moderation", "nlp", "discord", "realtime"],
    createdAt: "2026-03-01",
    downloads: 89,
    sigil: {
      sigil_version: "1.0.0",
      meta: {
        name: "Community Moderator",
        role: "Content Analyst",
        version: "2.0.1",
        author: "nether_ops",
        description: "Real-time content moderation daemon for community platforms.",
        tags: ["moderation", "nlp", "discord"],
      },
      runtime: {
        status: "running",
        schedule: "continuous",
        max_retries: 5,
        timeout_seconds: 30,
        concurrency: 4,
      },
      prompts: {
        system_prompt:
          "You are a community moderation daemon. Analyze each incoming message for toxicity, spam, and policy violations. Return a moderation verdict with confidence score and reasoning. Support English and Spanish.",
        temperature: 0.1,
        model: "gpt-4o-mini",
        max_tokens: 1024,
      },
      structured_output: {
        enabled: true,
        schema: {
          type: "object",
          properties: {
            verdict: { type: "string", enum: ["safe", "warn", "block"] },
            confidence: { type: "number" },
            categories: { type: "array", items: { type: "string" } },
            reasoning: { type: "string" },
          },
        },
      },
      capabilities: {
        can_chat: true,
        can_stream: true,
        has_memory: true,
        tools: ["sentiment_analyzer", "webhook_dispatcher"],
      },
    },
  },
];

const Grimoires = () => {
  const [selected, setSelected] = useState<GrimoireSigil | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");

  const handleViewSigil = (g: GrimoireSigil) => {
    setSelected(g);
    setViewMode("detail");
  };

  const handleBack = () => {
    setSelected(null);
    setViewMode("grid");
  };

  const handleCopySigil = (sigil: object) => {
    navigator.clipboard.writeText(JSON.stringify(sigil, null, 2));
  };

  if (viewMode === "detail" && selected) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-10 overflow-y-auto h-full">
        <button
          onClick={handleBack}
          className="self-start font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Volver a Grimorios
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{selected.name}</h2>
          <p className="text-sm text-muted-foreground">{selected.role}</p>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">{selected.description}</p>

        <div className="flex flex-wrap gap-2">
          {selected.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono-cyber text-[10px] uppercase tracking-wider text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono-cyber">
          <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {selected.author}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {selected.createdAt}</span>
          <span className="flex items-center gap-1.5"><Download className="h-3 w-3" /> {selected.downloads}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleCopySigil(selected.sigil)}
            className="flex items-center gap-2 rounded-md neon-border px-4 py-2.5 font-mono-cyber text-xs transition-all hover:neon-glow text-primary"
          >
            <Download className="h-3.5 w-3.5" /> Copiar Sigil JSON
          </button>
        </div>

        <div>
          <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">Sigil · Raw JSON</h3>
          <div className="rounded-md neon-border bg-card p-4 overflow-x-auto max-h-[50vh] overflow-y-auto">
            <pre className="font-mono-cyber text-xs leading-relaxed text-foreground/80 whitespace-pre">
              {JSON.stringify(selected.sigil, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono-cyber text-2xl tracking-wide text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Grimorios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hub comunitario de Sigils — descubre, comparte e importa blueprints de daemons.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-mono-cyber text-xs text-primary-foreground transition-all hover:neon-glow">
          <Upload className="h-3.5 w-3.5" /> Publicar Sigil
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockGrimoires.map((g) => (
          <div
            key={g.id}
            className="group rounded-md neon-border bg-card p-5 flex flex-col gap-3 transition-all hover:neon-glow cursor-pointer"
            onClick={() => handleViewSigil(g)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-mono-cyber text-sm text-foreground group-hover:text-primary transition-colors">
                  {g.name}
                </h3>
                <p className="font-mono-cyber text-[10px] text-muted-foreground uppercase tracking-wider">{g.role}</p>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">{g.description}</p>

            <div className="flex flex-wrap gap-1.5">
              {g.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono-cyber text-[9px] uppercase tracking-wider text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {g.tags.length > 3 && (
                <span className="font-mono-cyber text-[9px] text-muted-foreground">+{g.tags.length - 3}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono-cyber mt-auto pt-2 border-t border-border">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {g.author}</span>
              <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {g.downloads}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grimoires;
