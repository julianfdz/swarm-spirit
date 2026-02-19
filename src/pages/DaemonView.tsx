import { useParams, useNavigate } from "react-router-dom";
import { swarms } from "@/data/mockData";
import { Network } from "lucide-react";

const DaemonView = () => {
  const { swarmId, daemonId } = useParams();
  const navigate = useNavigate();

  const swarm = swarms.find((s) => s.id === swarmId);
  const daemon = swarm?.daemons.find((d) => d.id === daemonId);

  if (!swarm || !daemon) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono-cyber text-muted-foreground">Daemon not found</p>
      </div>
    );
  }

  const statusStyles = {
    running: "bg-neon-success/15 text-neon-success",
    sleeping: "bg-neon-warning/15 text-neon-warning",
    error: "bg-neon-error/15 text-neon-error",
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
      <div className="flex-1 p-6 md:p-10">
        <button
          onClick={() => navigate(`/app/swarm/${swarmId}`)}
          className="mb-6 font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Volver al swarm
        </button>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{daemon.name}</h2>
          <span className={`rounded-full px-2 py-0.5 font-mono-cyber text-[10px] uppercase tracking-wider ${statusStyles[daemon.status]}`}>
            {daemon.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-8">{daemon.role} · Last run: {daemon.lastRun}</p>

        <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">System Prompt</h3>
        <div className="rounded-md neon-border bg-card p-5 max-h-[60vh] overflow-y-auto">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {daemon.prompt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DaemonView;
