import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { swarms } from "@/data/mockData";
import { Network, ArrowLeft } from "lucide-react";

const statusColor = (active: number, total: number) => {
  if (active === total) return "bg-neon-success";
  if (active > 0) return "bg-neon-warning";
  return "bg-neon-error";
};

const AppDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pixel-grid">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-primary" />
          <span className="font-mono-cyber text-lg tracking-wider text-foreground">NetherNet</span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono-cyber text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Logout
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
        <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">Swarms</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tus enjambres de daemons activos</p>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {swarms.map((swarm) => (
            <button
              key={swarm.id}
              onClick={() => navigate(`/app/swarm/${swarm.id}`)}
              className="group rounded-lg neon-border bg-card p-5 text-left transition-all hover:neon-glow"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono-cyber text-sm tracking-wide text-foreground group-hover:text-primary transition-colors">
                  {swarm.name}
                </h3>
                <span className={`h-2.5 w-2.5 rounded-full ${statusColor(swarm.activeCount, swarm.daemonCount)}`} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {swarm.description}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="font-mono-cyber text-xs text-primary">{swarm.activeCount}/{swarm.daemonCount} activos</span>
                <span className="text-xs text-muted-foreground">→</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;
