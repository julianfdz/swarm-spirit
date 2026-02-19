import { useState, useMemo } from "react";
import { getTasksForSwarm, PoolTask, TaskStatus, TaskPriority } from "@/data/taskPoolData";
import { RotateCw, X, CornerDownLeft, Skull, ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  swarmId: string;
}

type ViewMode = "list" | "pool";
type StatusFilter = "all" | TaskStatus;

const statusConfig: Record<TaskStatus, { label: string; class: string; dotClass: string }> = {
  pending: { label: "Pending", class: "bg-neon-warning/15 text-neon-warning", dotClass: "bg-neon-warning" },
  in_progress: { label: "In Progress", class: "bg-primary/15 text-primary", dotClass: "bg-primary" },
  completed: { label: "Done", class: "bg-neon-success/15 text-neon-success", dotClass: "bg-neon-success" },
  failed: { label: "Failed", class: "bg-neon-error/15 text-neon-error", dotClass: "bg-neon-error" },
  dlq: { label: "DLQ", class: "bg-accent/15 text-accent", dotClass: "bg-accent" },
};

const priorityConfig: Record<TaskPriority, { label: string; class: string }> = {
  critical: { label: "CRIT", class: "text-neon-error border-neon-error/40" },
  high: { label: "HIGH", class: "text-neon-warning border-neon-warning/40" },
  medium: { label: "MED", class: "text-muted-foreground border-border" },
  low: { label: "LOW", class: "text-muted-foreground/60 border-border/60" },
};

// Pixel-art pool tag colors based on task type prefix
function getPoolTagColor(type: string, status: TaskStatus): string {
  if (status === "failed" || status === "dlq") return "border-neon-error/60 bg-neon-error/10 text-neon-error";
  if (status === "in_progress") return "border-primary/60 bg-primary/10 text-primary";
  const prefix = type.split(".")[0];
  switch (prefix) {
    case "news": return "border-neon-success/50 bg-neon-success/8 text-neon-success";
    case "article": return "border-neon-warning/50 bg-neon-warning/8 text-neon-warning";
    case "publish": return "border-accent/50 bg-accent/8 text-accent";
    default: return "border-border bg-card text-muted-foreground";
  }
}

const TaskPool = ({ swarmId }: Props) => {
  const allTasks = useMemo(() => getTasksForSwarm(swarmId), [swarmId]);
  const [viewMode, setViewMode] = useState<ViewMode>("pool");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return allTasks;
    return allTasks.filter((t) => t.status === statusFilter);
  }, [allTasks, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allTasks.length };
    allTasks.forEach((t) => { c[t.status] = (c[t.status] || 0) + 1; });
    return c;
  }, [allTasks]);

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: `All (${counts.all || 0})` },
    { key: "pending", label: `Pending (${counts.pending || 0})` },
    { key: "in_progress", label: `Active (${counts.in_progress || 0})` },
    { key: "failed", label: `Failed (${counts.failed || 0})` },
    { key: "dlq", label: `DLQ (${counts.dlq || 0})` },
    { key: "completed", label: `Done (${counts.completed || 0})` },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary">Task Pool</h3>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {allTasks.length} tasks · {counts.in_progress || 0} active · {counts.failed || 0} failed
          </p>
        </div>
        {/* View toggle */}
        <div className="flex gap-1 rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setViewMode("pool")}
            className={`px-3 py-1 font-mono-cyber text-[10px] uppercase transition-colors ${
              viewMode === "pool" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pool
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 font-mono-cyber text-[10px] uppercase transition-colors ${
              viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(statusFilter === f.key ? "all" : f.key)}
            className={`rounded-full px-2.5 py-1 font-mono-cyber text-[10px] uppercase tracking-wider transition-colors ${
              statusFilter === f.key
                ? "bg-primary/20 text-primary neon-border"
                : "bg-card text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ===== POOL VIEW ===== */}
      {viewMode === "pool" && (
        <div className="relative w-full rounded-md neon-border bg-card overflow-hidden" style={{ height: 420 }}>
          {/* Pixel grid background */}
          <div className="absolute inset-0 pixel-grid opacity-60" />

          {/* Scanline effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 h-px bg-primary/10 animate-scan-line" />
          </div>

          {/* Pool label */}
          <div className="absolute top-2 left-3 font-mono-cyber text-[9px] uppercase tracking-widest text-primary/40">
            ▸ task_pool.{swarmId} · live
          </div>

          {/* Floating task tags */}
          {filteredTasks.map((task, i) => {
            const colorClass = getPoolTagColor(task.type, task.status);
            const isActive = task.status === "in_progress";
            const isFailed = task.status === "failed" || task.status === "dlq";
            // Stagger animation
            const animDelay = (i * 0.7) % 5;
            const floatStyle: React.CSSProperties = {
              left: `${task.poolX}%`,
              top: `${task.poolY}%`,
              animation: `float-tag ${3 + (i % 3)}s ease-in-out ${animDelay}s infinite alternate`,
            };

            return (
              <div
                key={task.id}
                className={`absolute cursor-default transition-transform hover:scale-110 hover:z-20 ${isActive ? "z-10" : ""}`}
                style={floatStyle}
              >
                <div
                  className={`rounded border px-2 py-1 font-mono-cyber text-[9px] leading-tight whitespace-nowrap ${colorClass} ${
                    isActive ? "animate-pulse-neon" : ""
                  } ${isFailed ? "line-through decoration-neon-error/40" : ""}`}
                >
                  <span className="opacity-50">{task.id}</span>{" "}
                  {task.type}
                  {task.lockedByName && (
                    <span className="ml-1 text-[8px] opacity-60">⚡{task.lockedByName.slice(0, 8)}</span>
                  )}
                  {task.retries > 0 && (
                    <span className="ml-1 text-[8px] opacity-60">↻{task.retries}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-2 right-3 flex items-center gap-3">
            {(["pending", "in_progress", "failed", "dlq"] as TaskStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${statusConfig[s].dotClass}`} />
                <span className="font-mono-cyber text-[8px] text-muted-foreground/60 uppercase">
                  {statusConfig[s].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== LIST VIEW ===== */}
      {viewMode === "list" && (
        <div className="space-y-1">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTasks.has(task.id);
            const sc = statusConfig[task.status];
            const pc = priorityConfig[task.priority];
            return (
              <div key={task.id} className="rounded-md border border-border bg-card overflow-hidden">
                {/* Main row */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <button onClick={() => toggleExpand(task.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>

                  {/* Status badge */}
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono-cyber text-[9px] uppercase ${sc.class}`}>
                    {sc.label}
                  </span>

                  {/* Priority */}
                  <span className={`shrink-0 rounded border px-1 py-0.5 font-mono-cyber text-[8px] uppercase ${pc.class}`}>
                    {pc.label}
                  </span>

                  {/* Label */}
                  <span className="font-mono-cyber text-[11px] text-foreground truncate min-w-0">
                    {task.label}
                  </span>

                  <div className="ml-auto flex items-center gap-2 shrink-0">
                    {/* Retries */}
                    {task.retries > 0 && (
                      <span className="font-mono-cyber text-[9px] text-muted-foreground">
                        ↻ {task.retries}/{task.maxRetries}
                      </span>
                    )}

                    {/* Locked by */}
                    {task.lockedByName && (
                      <span className="hidden sm:inline font-mono-cyber text-[9px] text-primary/70">
                        ⚡{task.lockedByName}
                      </span>
                    )}

                    {/* Time */}
                    <span className="font-mono-cyber text-[9px] text-muted-foreground">
                      {task.updatedAt.split(" ")[1]}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border bg-background/50 px-3 py-3">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-cyber mb-3">
                      <div><span className="text-muted-foreground">ID:</span> <span className="text-foreground">{task.id}</span></div>
                      <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground">{task.type}</span></div>
                      <div><span className="text-muted-foreground">Created:</span> <span className="text-foreground">{task.createdAt}</span></div>
                      <div><span className="text-muted-foreground">Updated:</span> <span className="text-foreground">{task.updatedAt}</span></div>
                      <div><span className="text-muted-foreground">Correlation:</span> <span className="text-accent">{task.correlationId || "—"}</span></div>
                      <div><span className="text-muted-foreground">Lease:</span> <span className="text-primary">{task.lockedByName || "unlocked"}</span></div>
                    </div>

                    {task.error && (
                      <div className="mb-3 rounded bg-neon-error/5 border border-neon-error/20 px-2 py-1.5">
                        <span className="font-mono-cyber text-[10px] text-neon-error">{task.error}</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {(task.status === "failed" || task.status === "dlq") && (
                        <button className="flex items-center gap-1 rounded border border-primary/30 px-2 py-1 font-mono-cyber text-[9px] uppercase text-primary hover:bg-primary/10 transition-colors">
                          <RotateCw className="h-2.5 w-2.5" /> Retry
                        </button>
                      )}
                      {(task.status === "failed" || task.status === "dlq") && (
                        <button className="flex items-center gap-1 rounded border border-border px-2 py-1 font-mono-cyber text-[9px] uppercase text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                          <CornerDownLeft className="h-2.5 w-2.5" /> Requeue
                        </button>
                      )}
                      {(task.status === "pending" || task.status === "in_progress") && (
                        <button className="flex items-center gap-1 rounded border border-neon-error/30 px-2 py-1 font-mono-cyber text-[9px] uppercase text-neon-error/70 hover:bg-neon-error/10 transition-colors">
                          <X className="h-2.5 w-2.5" /> Cancel
                        </button>
                      )}
                      {task.status === "failed" && (
                        <button className="flex items-center gap-1 rounded border border-accent/30 px-2 py-1 font-mono-cyber text-[9px] uppercase text-accent/70 hover:bg-accent/10 transition-colors">
                          <Skull className="h-2.5 w-2.5" /> Send to DLQ
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskPool;
