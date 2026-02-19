import { useParams, useNavigate } from "react-router-dom";
import { swarms, Daemon } from "@/data/mockData";

const statusBadge = (status: Daemon["status"]) => {
  const styles = {
    running: "bg-neon-success/15 text-neon-success",
    sleeping: "bg-neon-warning/15 text-neon-warning",
    error: "bg-neon-error/15 text-neon-error",
  };
  const labels = { running: "Running", sleeping: "Sleeping", error: "Error" };
  return (
    <span className={`rounded-full px-2 py-0.5 font-mono-cyber text-[10px] uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const SwarmView = () => {
  const { swarmId } = useParams();
  const navigate = useNavigate();

  const swarm = swarms.find((s) => s.id === swarmId);

  if (!swarm) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <p className="font-mono-cyber text-muted-foreground">Swarm not found</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
      <button
        onClick={() => navigate("/app")}
        className="mb-6 font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        ← Volver a swarms
      </button>

      <div className="mb-8">
        <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{swarm.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{swarm.description}</p>
      </div>

      {/* Daemon Grid - no gap, like cells */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {swarm.daemons.map((daemon) => (
          <button
            key={daemon.id}
            onClick={() => navigate(`/app/swarm/${swarmId}/daemon/${daemon.id}`)}
            className="group relative flex flex-col items-center border border-border bg-card p-4 transition-all hover:neon-glow hover:z-10"
          >
            <img
              src={daemon.avatar}
              alt={daemon.name}
              className="mb-3 h-24 w-24 rounded-sm object-cover"
            />
            {statusBadge(daemon.status)}
            <h4 className="mt-2 font-mono-cyber text-xs tracking-wide text-foreground group-hover:text-primary transition-colors text-center">
              {daemon.name}
            </h4>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{daemon.role}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{daemon.lastRun}</p>
          </button>
        ))}
      </div>
    </main>
  );
};

export default SwarmView;
