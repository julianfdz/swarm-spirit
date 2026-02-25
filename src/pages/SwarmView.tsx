import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { swarms, Daemon } from "@/data/mockData";
import EventStream from "@/components/EventStream";
import TaskPool from "@/components/TaskPool";

type SwarmTab = "daemons" | "event-stream" | "task-pool";

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
  const [tab, setTab] = useState<SwarmTab>("daemons");

  const swarm = swarms.find((s) => s.id === swarmId);

  if (!swarm) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <p className="font-mono-cyber text-muted-foreground">Swarm not found</p>
      </div>
    );
  }

  const tabs: { key: SwarmTab; label: string }[] = [
    { key: "daemons", label: "Daemons" },
    { key: "event-stream", label: "Event Stream" },
    { key: "task-pool", label: "Task Pool" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
      <button
        onClick={() => navigate("/swarms")}
        className="mb-6 font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        ← Volver a swarms
      </button>

      <div className="mb-6">
        <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{swarm.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{swarm.description}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 font-mono-cyber text-xs uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Daemons Grid */}
      {tab === "daemons" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {swarm.daemons.map((daemon) => (
            <button
              key={daemon.id}
              onClick={() => navigate(`/swarms/${swarmId}/daemon/${daemon.id}`)}
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
      )}

      {/* Event Stream */}
      {tab === "event-stream" && <EventStream swarmId={swarmId!} />}

      {/* Task Pool */}
      {tab === "task-pool" && <TaskPool swarmId={swarmId!} />}
    </main>
  );
};

export default SwarmView;
