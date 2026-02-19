import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { swarms, Daemon } from "@/data/mockData";
import { ArrowLeft, Network, X } from "lucide-react";

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
  const [selectedDaemon, setSelectedDaemon] = useState<Daemon | null>(null);

  const swarm = swarms.find((s) => s.id === swarmId);

  if (!swarm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono-cyber text-muted-foreground">Swarm not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pixel-grid">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-primary" />
          <span className="font-mono-cyber text-lg tracking-wider text-foreground">NetherNet</span>
        </div>
        <button
          onClick={() => navigate("/app")}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono-cyber text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Swarms
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
        <div className="mb-8">
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{swarm.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{swarm.description}</p>
        </div>

        {/* Daemon Grid - no gap, like cells */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {swarm.daemons.map((daemon) => (
            <button
              key={daemon.id}
              onClick={() => setSelectedDaemon(daemon)}
              className="group relative flex flex-col items-center border border-border bg-card p-4 transition-all hover:neon-glow hover:z-10"
            >
              <img
                src={daemon.avatar}
                alt={daemon.name}
                className="mb-3 h-24 w-24 rounded-sm object-cover"
                style={{ imageRendering: "auto" }}
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

      {/* Daemon Detail Modal */}
      {selectedDaemon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg neon-border bg-background p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedDaemon.avatar} alt={selectedDaemon.name} className="h-14 w-14 rounded-sm object-cover" />
                <div>
                  <h3 className="font-mono-cyber text-base tracking-wide text-foreground">{selectedDaemon.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedDaemon.role}</p>
                  <div className="mt-1">{statusBadge(selectedDaemon.status)}</div>
                </div>
              </div>
              <button onClick={() => setSelectedDaemon(null)} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6">
              <h4 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-2">System Prompt</h4>
              <div className="rounded-md bg-card neon-border p-4 max-h-60 overflow-y-auto">
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {selectedDaemon.prompt}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono-cyber text-[10px] text-muted-foreground">
                Last run: {selectedDaemon.lastRun}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwarmView;
