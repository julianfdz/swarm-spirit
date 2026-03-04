import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_NETHERNET_API_URL || "https://nethernet-api.buhosuite.com/api/v1";

interface Props {
  taskId: string | null; // full UUID
  onClose: () => void;
}

const TaskDetailDialog = ({ taskId, onClose }: Props) => {
  const [dbTask, setDbTask] = useState<Record<string, any> | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    fetchAll();
  }, [taskId]);

  const fetchAll = async () => {
    if (!taskId) return;
    // Fetch DB record
    setLoadingDb(true);
    const { data } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();
    setDbTask(data);
    setLoadingDb(false);

    // Fetch API response using host token
    setLoadingApi(true);
    setApiError(null);
    setApiResponse(null);
    try {
      const { data: hosts } = await supabase.from("netherhosts").select("id, token");
      const host = hosts?.find((h) => h.token);
      if (!host?.token) {
        setApiError("No hay host con token disponible");
        setLoadingApi(false);
        return;
      }
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${host.token}` },
      });
      if (!res.ok) {
        setApiError(`HTTP ${res.status}: ${await res.text()}`);
      } else {
        const json = await res.json();
        setApiResponse(JSON.stringify(json, null, 2));
      }
    } catch (e: any) {
      setApiError(e.message);
    } finally {
      setLoadingApi(false);
    }
  };

  const DB_FIELDS = [
    "id", "type", "label", "status", "priority", "retries", "max_retries",
    "method", "source", "swarm_id", "daemon_id", "host_id", "locked_by",
    "correlation_id", "error", "claimed_at", "created_at", "updated_at",
  ];

  return (
    <Dialog open={!!taskId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono-cyber text-sm tracking-wider text-primary flex items-center gap-2">
            Task Detail
            <button onClick={fetchAll} className="text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className={`h-3 w-3 ${loadingDb || loadingApi ? "animate-spin" : ""}`} />
            </button>
          </DialogTitle>
        </DialogHeader>

        {/* DB Fields */}
        <div className="space-y-3">
          <h4 className="font-mono-cyber text-[10px] uppercase tracking-widest text-primary/60">Campos en BBDD</h4>
          {loadingDb ? (
            <p className="font-mono-cyber text-[10px] text-muted-foreground">Cargando...</p>
          ) : dbTask ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {DB_FIELDS.map((field) => (
                <div key={field} className="rounded border border-border bg-background/50 px-2 py-1.5">
                  <span className="font-mono-cyber text-[9px] uppercase text-muted-foreground">{field}</span>
                  <p className="font-mono-cyber text-[11px] text-foreground break-all mt-0.5">
                    {dbTask[field] != null ? String(dbTask[field]) : <span className="text-muted-foreground/40">null</span>}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono-cyber text-[10px] text-neon-error">No se encontró la task en BBDD</p>
          )}

          {/* Payload & Result (JSON) */}
          {dbTask && (
            <>
              {["payload", "result"].map((field) => (
                <div key={field}>
                  <h4 className="font-mono-cyber text-[10px] uppercase tracking-widest text-primary/60 mb-1">{field}</h4>
                  <pre className="rounded border border-border bg-background/50 px-2 py-1.5 font-mono-cyber text-[10px] text-foreground overflow-x-auto max-h-40 whitespace-pre-wrap">
                    {dbTask[field] != null ? JSON.stringify(dbTask[field], null, 2) : "null"}
                  </pre>
                </div>
              ))}
            </>
          )}

          {/* API Response */}
          <div>
            <h4 className="font-mono-cyber text-[10px] uppercase tracking-widest text-primary/60 mb-1">
              API Response <span className="text-muted-foreground/40">GET /tasks/{taskId?.slice(0, 8)}…</span>
            </h4>
            {loadingApi ? (
              <p className="font-mono-cyber text-[10px] text-muted-foreground">Cargando API...</p>
            ) : apiError ? (
              <pre className="rounded border border-neon-error/20 bg-neon-error/5 px-2 py-1.5 font-mono-cyber text-[10px] text-neon-error whitespace-pre-wrap">
                {apiError}
              </pre>
            ) : apiResponse ? (
              <pre className="rounded border border-border bg-background/50 px-2 py-1.5 font-mono-cyber text-[10px] text-foreground overflow-x-auto max-h-60 whitespace-pre-wrap">
                {apiResponse}
              </pre>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
