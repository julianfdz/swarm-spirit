import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { swarms } from "@/data/mockData";
import { CheckCircle, XCircle } from "lucide-react";

const DaemonView = () => {
  const { swarmId, daemonId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"prompting" | "logs">("prompting");

  const swarm = swarms.find((s) => s.id === swarmId);
  const daemon = swarm?.daemons.find((d) => d.id === daemonId);

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

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col md:flex-row">
      {/* Left: Avatar */}
      <div className="flex items-center justify-center border-b border-border bg-card p-8 md:w-1/3 md:border-b-0 md:border-r">
        <img
          src={daemon.avatar}
          alt={daemon.name}
          className="h-48 w-48 rounded-sm object-cover md:h-64 md:w-64"
        />
      </div>

      {/* Right: Info */}
      <div className="flex flex-1 flex-col p-6 md:p-10">
        <button
          onClick={() => navigate(`/app/swarm/${swarmId}`)}
          className="mb-6 self-start font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Volver al swarm
        </button>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{daemon.name}</h2>
          <span className={`rounded-full px-2 py-0.5 font-mono-cyber text-[10px] uppercase tracking-wider ${statusStyles[daemon.status]}`}>
            {daemon.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{daemon.role} · Last run: {daemon.lastRun}</p>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6">
          <button
            onClick={() => setTab("prompting")}
            className={`px-4 py-2 font-mono-cyber text-xs tracking-wide transition-colors border-b-2 -mb-px ${
              tab === "prompting"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Prompting
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`px-4 py-2 font-mono-cyber text-xs tracking-wide transition-colors border-b-2 -mb-px ${
              tab === "logs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Logs
          </button>
        </div>

        {/* Tab Content */}
        {tab === "prompting" && (
          <div className="flex-1 overflow-y-auto">
            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">System Prompt</h3>
            <div className="rounded-md neon-border bg-card p-5 mb-5">
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {daemon.prompt}
              </p>
            </div>

            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">Structured Output</h3>
            <div className="rounded-md neon-border bg-card p-4 flex items-center gap-3">
              {daemon.structuredOutput ? (
                <>
                  <CheckCircle className="h-4 w-4 text-neon-success" />
                  <span className="text-sm text-foreground/80">Activado — Este daemon emite salida JSON estructurada</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No configurado — Salida en texto libre</span>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "logs" && (
          <div className="flex-1 overflow-y-auto rounded-md neon-border bg-card p-4">
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
      </div>
    </div>
  );
};

export default DaemonView;
