import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Plus, Clock, Calendar, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  swarmId: string;
}

const scheduleLabel = (type: string | null, value: string | null) => {
  if (!type || !value) return "—";
  if (type === "cron") return value;
  if (type === "interval") return `Every ${value}`;
  if (type === "once") return `Once: ${value}`;
  return value;
};

const statusConfig: Record<string, { label: string; class: string; dotClass: string }> = {
  scheduled: { label: "Active", class: "bg-neon-success/15 text-neon-success", dotClass: "bg-neon-success" },
  cancelled: { label: "Paused", class: "bg-neon-warning/15 text-neon-warning", dotClass: "bg-neon-warning" },
  pending: { label: "Pending", class: "bg-primary/15 text-primary", dotClass: "bg-primary" },
};

const fallbackStatus = { label: "Unknown", class: "bg-muted/15 text-muted-foreground", dotClass: "bg-muted-foreground" };

const JobsList = ({ swarmId }: Props) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("swarm_id", swarmId)
      .eq("is_template", true)
      .order("created_at", { ascending: false })
      .limit(100);
    setJobs(data ?? []);
    setLoading(false);
  }, [swarmId]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary">Scheduled Jobs</h3>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {loading ? "Cargando..." : `${jobs.length} jobs`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            className="rounded border border-border p-1.5 text-muted-foreground hover:text-primary transition-colors"
            title="Refrescar"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button
            variant="outline"
            size="sm"
            className="font-mono-cyber text-[10px] uppercase gap-1"
            onClick={() => navigate(`/swarms/${swarmId}/tasks/new?scheduled=true&back=${encodeURIComponent(`/swarms/${swarmId}?tab=jobs`)}`)}
          >
            <Plus className="h-3 w-3" /> Nuevo Job
          </Button>
        </div>
      </div>

      {!loading && jobs.length === 0 && (
        <div className="text-center py-12 border border-border rounded-md bg-card">
          <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No hay jobs programados en este swarm.</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Crea uno para automatizar tareas recurrentes.</p>
        </div>
      )}

      <div className="space-y-1">
        {jobs.map((job) => {
          const sc = statusConfig[job.status] || fallbackStatus;
          const isActive = job.status === "scheduled";
          return (
            <div
              key={job.id}
              onClick={() => navigate(`/tasks/${job.id}?back=/swarms/${swarmId}?tab=jobs`)}
              className="rounded-md border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-2 px-3 py-2.5">
                {/* Status indicator */}
                <div className={`h-2 w-2 rounded-full shrink-0 ${sc.dotClass} ${isActive ? "animate-pulse" : ""}`} />

                {/* Status badge */}
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono-cyber text-[9px] uppercase ${sc.class}`}>
                  {sc.label}
                </span>

                {/* Label */}
                <span className="font-mono-cyber text-[11px] text-foreground truncate min-w-0">
                  {job.label}
                </span>

                <div className="ml-auto flex items-center gap-3 shrink-0">
                  {/* Schedule info */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="font-mono-cyber text-[9px]">
                      {scheduleLabel(job.schedule_type, job.schedule_value)}
                    </span>
                  </div>

                  {/* Next run */}
                  {job.next_run_at && (
                    <div className="hidden sm:flex items-center gap-1 text-primary/70">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono-cyber text-[9px]">
                        {new Date(job.next_run_at).toLocaleString("es-ES", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}

                  {/* Type */}
                  <span className="font-mono-cyber text-[9px] text-muted-foreground/60">
                    {job.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobsList;
