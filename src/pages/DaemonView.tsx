import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { swarms, DaemonStatus, SkillCategory } from "@/data/mockData";
import { Play, Square, RotateCw, Send } from "lucide-react";

type Tab = "prompting" | "logs" | "chat" | "skills" | "status" | "sigil";

const DaemonView = () => {
  const { swarmId, daemonId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("prompting");

  const swarm = swarms.find((s) => s.id === swarmId);
  const daemon = swarm?.daemons.find((d) => d.id === daemonId);

  const [localStatus, setLocalStatus] = useState<DaemonStatus>(daemon?.status ?? "sleeping");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(daemon?.chat ?? []);

  if (!swarm || !daemon) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <p className="font-mono-cyber text-muted-foreground">Daemon not found</p>
      </div>
    );
  }

  const statusStyles = {
    running: "bg-neon-success/15 text-neon-success",
    sleeping: "bg-neon-warning/15 text-neon-warning",
    error: "bg-neon-error/15 text-neon-error",
  };

  const logLevelStyles = {
    info: "text-primary",
    warn: "text-neon-warning",
    error: "text-neon-error",
  };

  const skillCategoryMeta: Record<string, { label: string; color: string }> = {
    tool_use:      { label: "Tool Use",      color: "text-neon-success border-neon-success/30 bg-neon-success/10" },
    memory:        { label: "Memory",        color: "text-primary border-primary/30 bg-primary/10" },
    reasoning:     { label: "Reasoning",     color: "text-neon-warning border-neon-warning/30 bg-neon-warning/10" },
    multimodal:    { label: "Multimodal",    color: "text-[hsl(280,80%,70%)] border-[hsl(280,80%,70%)]/30 bg-[hsl(280,80%,70%)]/10" },
    orchestration: { label: "Orchestration", color: "text-neon-error border-neon-error/30 bg-neon-error/10" },
    retrieval:     { label: "Retrieval",     color: "text-[hsl(190,80%,60%)] border-[hsl(190,80%,60%)]/30 bg-[hsl(190,80%,60%)]/10" },
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "prompting", label: "Prompting" },
    { key: "logs", label: "Logs" },
    { key: "chat", label: "Chat" },
    { key: "skills", label: "Skills" },
    { key: "status", label: "Estado" },
    { key: "sigil", label: "Sigil" },
  ];

  const sigil = {
    sigil_version: "1.0.0",
    meta: {
      name: daemon.name,
      id: daemon.id,
      role: daemon.role,
      version: "1.0.0",
      author: "swarm-orchestrator",
      description: `Daemon agent "${daemon.name}" operating as ${daemon.role} within swarm "${swarm.name}".`,
      created_at: "2026-01-15T08:00:00Z",
      updated_at: "2026-02-19T10:00:00Z",
      swarm_id: swarm.id,
      swarm_name: swarm.name,
      tags: [daemon.role.toLowerCase().replace(/\s+/g, "-"), swarm.id],
    },
    runtime: {
      status: localStatus,
      last_run: daemon.lastRun,
      schedule: localStatus === "sleeping" ? "on-demand / triggered" : "continuous",
      max_retries: 3,
      timeout_seconds: 120,
      concurrency: 1,
    },
    prompts: {
      system_prompt: daemon.prompt,
      user_prompt: null,
      temperature: 0.7,
      model: "gpt-4o",
      max_tokens: 2048,
    },
    structured_output: {
      enabled: !!daemon.structuredOutput,
      schema: daemon.structuredOutput ? JSON.parse(daemon.structuredOutput) : null,
    },
    capabilities: {
      can_chat: true,
      can_stream: false,
      has_memory: false,
      tools: [],
    },
    logging: {
      level: "info",
      total_entries: daemon.logs.length,
      last_entry: daemon.logs.length > 0 ? daemon.logs[daemon.logs.length - 1] : null,
    },
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user" as const, timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), message: chatInput };
    const daemonMsg = {
      role: "daemon" as const,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      message: "Recibido. Procesando tu solicitud... [mock response]",
    };
    setChatMessages((prev) => [...prev, userMsg, daemonMsg]);
    setChatInput("");
  };

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      {/* Left: Avatar - fixed */}
      <div className="flex shrink-0 items-center justify-center border-b border-border bg-card p-8 md:w-1/3 md:border-b-0 md:border-r">
        <img src={daemon.avatar} alt={daemon.name} className="h-48 w-48 rounded-sm object-cover md:h-64 md:w-64" />
      </div>

      {/* Right: Info - only this scrolls */}
      <div className="flex flex-1 flex-col p-6 md:p-10 overflow-hidden">
        <button
          onClick={() => navigate(`/swarms/${swarmId}`)}
          className="mb-6 self-start font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Volver al swarm
        </button>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{daemon.name}</h2>
          <span className={`rounded-full px-2 py-0.5 font-mono-cyber text-[10px] uppercase tracking-wider ${statusStyles[localStatus]}`}>
            {localStatus}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{daemon.role} · Last run: {daemon.lastRun}</p>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-2 font-mono-cyber text-xs tracking-wide transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === "prompting" && (
            <div>
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">System Prompt</h3>
              <div className="rounded-md neon-border bg-card p-5 mb-5">
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{daemon.prompt}</p>
              </div>

              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">Structured Output</h3>
              {daemon.structuredOutput ? (
                <div className="rounded-md neon-border bg-card p-4 overflow-x-auto">
                  <pre className="font-mono-cyber text-xs leading-relaxed text-foreground/80">{daemon.structuredOutput}</pre>
                </div>
              ) : (
                <div className="rounded-md neon-border bg-card p-4">
                  <p className="text-sm text-muted-foreground italic">No structured output — Este daemon emite texto libre</p>
                </div>
              )}
            </div>
          )}

          {tab === "logs" && (
            <div className="rounded-md neon-border bg-card p-4">
              <div className="space-y-1">
                {daemon.logs.map((log, i) => (
                  <div key={i} className="flex gap-3 font-mono-cyber text-xs leading-relaxed">
                    <span className="shrink-0 text-muted-foreground">{log.timestamp.split(" ")[1]}</span>
                    <span className={`shrink-0 uppercase w-12 ${logLevelStyles[log.level]}`}>{log.level}</span>
                    <span className="text-foreground/80">{log.message}</span>
                  </div>
                ))}
              </div>
              {daemon.logs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No hay logs disponibles.</p>
              )}
            </div>
          )}

          {tab === "chat" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 rounded-md neon-border bg-card p-4 mb-4 space-y-4 overflow-y-auto max-h-[50vh]">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <span className="font-mono-cyber text-[10px] text-muted-foreground mb-1">
                      {msg.role === "user" ? "Tú" : daemon.name} · {msg.timestamp}
                    </span>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "neon-border bg-background text-foreground/80"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay mensajes aún.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Escribe un mensaje al daemon..."
                  className="flex-1 rounded-md neon-border bg-card px-4 py-2.5 font-mono-cyber text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleSendChat}
                  className="rounded-md bg-primary p-2.5 text-primary-foreground transition-all hover:neon-glow"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {tab === "skills" && (
            <div>
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-1">Skills</h3>
              <p className="text-xs text-muted-foreground mb-5">
                Capacidades IA activas en este daemon. Cada skill representa un mecanismo cognitivo o herramienta que el agente puede invocar durante su ejecución.
              </p>

              {daemon.skills.length === 0 ? (
                <div className="rounded-md neon-border bg-card p-8 text-center">
                  <p className="font-mono-cyber text-xs text-muted-foreground">Este daemon no tiene skills configuradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {daemon.skills.map((skill) => {
                    const meta = skillCategoryMeta[skill.category];
                    return (
                      <div key={skill.id} className="rounded-md neon-border bg-card p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono-cyber text-sm text-foreground">{skill.name}</span>
                            <span className={`rounded border px-2 py-0.5 font-mono-cyber text-[10px] uppercase tracking-wider ${meta.color}`}>
                              {meta.label}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono-cyber text-xs text-muted-foreground">{skill.proficiency}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{skill.description}</p>
                        {/* Proficiency bar */}
                        <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${skill.proficiency}%`, opacity: 0.7 + skill.proficiency * 0.003 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "sigil" && (
            <div>
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">Sigil · Agent Blueprint</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Raw JSON definition of this daemon. The Sigil contains all metadata, runtime config, prompts, and structured output schemas.
              </p>
              <div className="rounded-md neon-border bg-card p-4 overflow-x-auto">
                <pre className="font-mono-cyber text-xs leading-relaxed text-foreground/80 whitespace-pre">
{JSON.stringify(sigil, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {tab === "status" && (
            <div>
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-4">Estado actual</h3>

              <div className="rounded-md neon-border bg-card p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-3 w-3 rounded-full ${
                    localStatus === "running" ? "bg-neon-success animate-pulse-neon" :
                    localStatus === "sleeping" ? "bg-neon-warning" : "bg-neon-error"
                  }`} />
                  <span className="font-mono-cyber text-lg text-foreground uppercase tracking-wide">{localStatus}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Última ejecución</span>
                    <p className="font-mono-cyber text-foreground">{daemon.lastRun}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Swarm</span>
                    <p className="font-mono-cyber text-foreground">{swarm.name}</p>
                  </div>
                </div>
              </div>

              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-4">Controles</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setLocalStatus("running")}
                  disabled={localStatus === "running"}
                  className="flex items-center gap-2 rounded-md neon-border px-4 py-2.5 font-mono-cyber text-xs transition-all hover:neon-glow disabled:opacity-30 disabled:cursor-not-allowed text-neon-success"
                >
                  <Play className="h-3.5 w-3.5" /> Start
                </button>
                <button
                  onClick={() => setLocalStatus("sleeping")}
                  disabled={localStatus === "sleeping"}
                  className="flex items-center gap-2 rounded-md neon-border px-4 py-2.5 font-mono-cyber text-xs transition-all hover:neon-glow disabled:opacity-30 disabled:cursor-not-allowed text-neon-warning"
                >
                  <Square className="h-3.5 w-3.5" /> Stop
                </button>
                <button
                  onClick={() => { setLocalStatus("sleeping"); setTimeout(() => setLocalStatus("running"), 800); }}
                  className="flex items-center gap-2 rounded-md neon-border px-4 py-2.5 font-mono-cyber text-xs transition-all hover:neon-glow text-primary"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Restart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DaemonView;
