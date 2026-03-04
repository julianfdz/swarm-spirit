import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, RefreshCw, Save, Clock, Calendar, Pause, Play, XCircle, List } from "lucide-react";

const API_URL = import.meta.env.VITE_NETHERNET_API_URL || "https://nethernet-api.buhosuite.com/api/v1";

const DB_FIELDS_META = [
  { key: "id", label: "ID", editable: false },
  { key: "type", label: "Topic", editable: true },
  { key: "label", label: "Label", editable: true },
  { key: "status", label: "Status", editable: false },
  { key: "priority", label: "Priority", editable: true, type: "select", options: ["critical", "high", "medium", "low"] },
  { key: "retries", label: "Retries", editable: false },
  { key: "max_retries", label: "Max Retries", editable: true, type: "number" },
  { key: "method", label: "Method", editable: true },
  { key: "source", label: "Source", editable: true },
  { key: "swarm_id", label: "Swarm ID", editable: false },
  { key: "daemon_id", label: "Daemon ID", editable: false },
  { key: "host_id", label: "Host ID", editable: false },
  { key: "locked_by", label: "Locked By", editable: false },
  { key: "correlation_id", label: "Correlation ID", editable: false },
  { key: "error", label: "Error", editable: false },
  { key: "claimed_at", label: "Claimed At", editable: false },
  { key: "created_at", label: "Created At", editable: false },
  { key: "updated_at", label: "Updated At", editable: false },
];

const SCHEDULE_FIELDS = [
  { key: "is_template", label: "Template", editable: false },
  { key: "schedule_type", label: "Schedule Type", editable: false },
  { key: "schedule_value", label: "Schedule Value", editable: true },
  { key: "next_run_at", label: "Next Run At", editable: false },
  { key: "last_run_at", label: "Last Run At", editable: false },
];

const getHostToken = async (): Promise<string | null> => {
  const { data: hosts } = await supabase.from("netherhosts").select("id, token");
  return hosts?.find((h) => h.token)?.token ?? null;
};

const TaskDetailView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("back") || "/swarms";

  const [dbTask, setDbTask] = useState<Record<string, any> | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [loadingApi, setLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [payloadStr, setPayloadStr] = useState("{}");
  const [resultStr, setResultStr] = useState("null");
  const [childTasks, setChildTasks] = useState<any[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!taskId) return;
    setLoadingDb(true);
    const { data } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();
    setDbTask(data);
    setEditedFields({});
    if (data) {
      setPayloadStr(data.payload ? JSON.stringify(data.payload, null, 2) : "{}");
      setResultStr(data.result ? JSON.stringify(data.result, null, 2) : "null");
    }
    setLoadingDb(false);

    // Fetch API response
    setLoadingApi(true);
    setApiError(null);
    setApiResponse(null);
    try {
      const token = await getHostToken();
      if (!token) { setApiError("No hay host con token"); setLoadingApi(false); return; }
      const res = await fetch(`${API_URL}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) setApiError(`HTTP ${res.status}: ${await res.text()}`);
      else setApiResponse(JSON.stringify(await res.json(), null, 2));
    } catch (e: any) {
      setApiError(e.message);
    } finally {
      setLoadingApi(false);
    }

    // Fetch child executions if template
    if (data?.is_template) {
      setLoadingChildren(true);
      try {
        const token = await getHostToken();
        if (token) {
          const res = await fetch(`${API_URL}/tasks?correlation_id=${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const json = await res.json();
            setChildTasks(Array.isArray(json) ? json : json.tasks ?? json.data ?? []);
          }
        }
      } catch { /* ignore */ }
      setLoadingChildren(false);
    }
  };

  useEffect(() => { fetchAll(); }, [taskId]);

  const handleFieldChange = (key: string, value: any) => {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  };

  const getFieldValue = (key: string) => {
    if (key in editedFields) return editedFields[key];
    return dbTask?.[key] ?? "";
  };

  const hasChanges = Object.keys(editedFields).length > 0 || (dbTask && payloadStr !== JSON.stringify(dbTask.payload, null, 2));

  const patchViaApi = async (body: Record<string, any>) => {
    const token = await getHostToken();
    if (!token) { toast({ title: "Sin token", variant: "destructive" }); return false; }
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      toast({ title: "Error API", description: err, variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!taskId || !dbTask) return;
    setSaving(true);

    const updates: Record<string, any> = { ...editedFields };

    if (payloadStr !== JSON.stringify(dbTask.payload, null, 2)) {
      try {
        updates.payload = JSON.parse(payloadStr);
      } catch {
        toast({ title: "Payload inválido", variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    if (Object.keys(updates).length === 0) { setSaving(false); return; }

    // Try API first, then always persist to Supabase directly
    let apiOk = false;
    try {
      apiOk = await patchViaApi(updates);
    } catch { /* API may be unavailable */ }

    // Always update Supabase DB directly to ensure persistence
    const { error: dbError } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId);

    if (dbError) {
      toast({ title: "Error guardando en BD", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Task actualizada", description: apiOk ? "Sincronizado con API y BD" : "Guardado en BD (API no disponible)" });
    }

    await fetchAll();
    setSaving(false);
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    let body: Record<string, any> = {};
    if (action === "pause") body = { status: "cancelled" };
    else if (action === "resume") body = { status: "scheduled" };
    else if (action === "cancel") body = { status: "cancelled" };

    const ok = await patchViaApi(body);
    if (ok) {
      toast({ title: action === "pause" ? "Template pausado" : action === "resume" ? "Template reactivado" : "Task cancelada" });
      fetchAll();
    }
    setActionLoading(null);
  };

  const isScheduled = dbTask?.is_template || dbTask?.schedule_type;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 md:px-12">
      <button onClick={() => navigate(backTo)} className="mb-6 font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Volver
      </button>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-mono-cyber text-xl tracking-wide text-foreground">Task Detail</h2>
          {dbTask && (
            <p className="mt-1 text-sm text-muted-foreground font-mono-cyber">
              {dbTask.label} <span className="text-muted-foreground/50">· {dbTask.id?.slice(0, 8)}…</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} className="font-mono-cyber text-[10px] uppercase gap-1">
            <RefreshCw className={`h-3 w-3 ${loadingDb || loadingApi ? "animate-spin" : ""}`} /> Refrescar
          </Button>
          {hasChanges && (
            <Button size="sm" onClick={handleSave} disabled={saving} className="font-mono-cyber text-[10px] uppercase gap-1">
              <Save className="h-3 w-3" /> {saving ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </div>

      {loadingDb ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />)}
        </div>
      ) : !dbTask ? (
        <p className="font-mono-cyber text-sm text-destructive">No se encontró la task en BBDD</p>
      ) : (
        <div className="space-y-6">
          {/* Status banner */}
          <div className={`rounded-lg border p-4 flex items-center justify-between ${
            dbTask.status === "completed" ? "border-neon-success/30 bg-neon-success/5" :
            dbTask.status === "failed" || dbTask.status === "dlq" ? "border-neon-error/30 bg-neon-error/5" :
            dbTask.status === "in_progress" ? "border-primary/30 bg-primary/5" :
            dbTask.status === "scheduled" ? "border-neon-warning/30 bg-neon-warning/5" :
            "border-border bg-card"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${
                dbTask.status === "completed" ? "bg-neon-success" :
                dbTask.status === "failed" || dbTask.status === "dlq" ? "bg-neon-error" :
                dbTask.status === "in_progress" ? "bg-primary" :
                dbTask.status === "scheduled" ? "bg-neon-warning" :
                "bg-muted-foreground"
              }`} />
              <span className="font-mono-cyber text-sm uppercase tracking-wider">{dbTask.status}</span>
              {isScheduled && (
                <span className="flex items-center gap-1 rounded-full bg-neon-warning/15 px-2 py-0.5 font-mono-cyber text-[10px] text-neon-warning">
                  <Clock className="h-3 w-3" /> Scheduled
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-cyber text-[10px] text-muted-foreground">
                Retries: {dbTask.retries}/{dbTask.max_retries}
              </span>
              {/* Template actions */}
              {isScheduled && dbTask.status === "scheduled" && (
                <Button variant="outline" size="sm" onClick={() => handleAction("pause")} disabled={!!actionLoading} className="font-mono-cyber text-[10px] uppercase gap-1 border-neon-warning/30 text-neon-warning hover:bg-neon-warning/10">
                  <Pause className="h-3 w-3" /> Pausar
                </Button>
              )}
              {isScheduled && dbTask.status === "cancelled" && (
                <Button variant="outline" size="sm" onClick={() => handleAction("resume")} disabled={!!actionLoading} className="font-mono-cyber text-[10px] uppercase gap-1 border-neon-success/30 text-neon-success hover:bg-neon-success/10">
                  <Play className="h-3 w-3" /> Reactivar
                </Button>
              )}
              {!isScheduled && (dbTask.status === "pending" || dbTask.status === "in_progress") && (
                <Button variant="outline" size="sm" onClick={() => handleAction("cancel")} disabled={!!actionLoading} className="font-mono-cyber text-[10px] uppercase gap-1 border-neon-error/30 text-neon-error hover:bg-neon-error/10">
                  <XCircle className="h-3 w-3" /> Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* DB Fields */}
          <section className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary/70">Campos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DB_FIELDS_META.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">{f.label}</Label>
                  {f.editable ? (
                    f.type === "select" ? (
                      <Select value={String(getFieldValue(f.key))} onValueChange={(v) => handleFieldChange(f.key, v)}>
                        <SelectTrigger className="font-mono-cyber text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {f.options!.map((o) => <SelectItem key={o} value={o} className="font-mono-cyber text-xs uppercase">{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={String(getFieldValue(f.key) ?? "")}
                        onChange={(e) => handleFieldChange(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                        type={f.type || "text"}
                        className="font-mono-cyber text-xs"
                      />
                    )
                  ) : (
                    <div className="rounded border border-border bg-background/50 px-2 py-1.5">
                      <p className="font-mono-cyber text-[11px] text-foreground break-all">
                        {dbTask[f.key] != null ? String(dbTask[f.key]) : <span className="text-muted-foreground/40">null</span>}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Schedule fields */}
          {isScheduled && (
            <section className="rounded-lg border border-neon-warning/20 bg-neon-warning/5 p-6 space-y-4">
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-neon-warning/70 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Programación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SCHEDULE_FIELDS.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">{f.label}</Label>
                    {f.editable ? (
                      <Input
                        value={String(getFieldValue(f.key) ?? "")}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        className="font-mono-cyber text-xs"
                      />
                    ) : (
                      <div className="rounded border border-border bg-background/50 px-2 py-1.5">
                        <p className="font-mono-cyber text-[11px] text-foreground break-all">
                          {dbTask[f.key] != null ? String(dbTask[f.key]) : <span className="text-muted-foreground/40">null</span>}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Child executions (for templates) */}
          {isScheduled && (
            <section className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary/70 flex items-center gap-2">
                <List className="h-3.5 w-3.5" /> Ejecuciones ({childTasks.length})
              </h3>
              {loadingChildren ? (
                <div className="h-12 rounded-md bg-muted animate-pulse" />
              ) : childTasks.length === 0 ? (
                <p className="font-mono-cyber text-[11px] text-muted-foreground">No hay ejecuciones registradas aún.</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {childTasks.map((child: any, i: number) => (
                    <button
                      key={child.id || i}
                      onClick={() => navigate(`/tasks/${child.id}?back=/tasks/${taskId}`)}
                      className="w-full flex items-center gap-3 rounded-md border border-border bg-background/50 px-3 py-2 text-left hover:border-primary/30 transition-colors"
                    >
                      <div className={`h-2 w-2 rounded-full shrink-0 ${
                        child.status === "completed" ? "bg-neon-success" :
                        child.status === "failed" || child.status === "dlq" ? "bg-neon-error" :
                        child.status === "in_progress" ? "bg-primary" :
                        "bg-muted-foreground"
                      }`} />
                      <span className="font-mono-cyber text-[10px] text-muted-foreground">{child.id?.slice(0, 8)}…</span>
                      <span className="font-mono-cyber text-[10px] uppercase">{child.status}</span>
                      <span className="font-mono-cyber text-[10px] text-muted-foreground ml-auto">{child.created_at?.slice(0, 19)?.replace("T", " ")}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Payload */}
          <section className="rounded-lg border border-border bg-card p-6 space-y-3">
            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary/70">Payload</h3>
            <Textarea
              value={payloadStr}
              onChange={(e) => setPayloadStr(e.target.value)}
              className="font-mono-cyber text-[11px] min-h-[120px] resize-y"
            />
          </section>

          {/* Result (read-only) */}
          <section className="rounded-lg border border-border bg-card p-6 space-y-3">
            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary/70">Result</h3>
            <pre className="rounded border border-border bg-background/50 px-3 py-2 font-mono-cyber text-[10px] text-foreground overflow-x-auto max-h-60 whitespace-pre-wrap">
              {resultStr}
            </pre>
          </section>

          {/* Error */}
          {dbTask.error && (
            <section className="rounded-lg border border-neon-error/20 bg-neon-error/5 p-6 space-y-3">
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-neon-error/70">Error</h3>
              <pre className="font-mono-cyber text-[11px] text-neon-error whitespace-pre-wrap">{dbTask.error}</pre>
            </section>
          )}

          {/* API Response */}
          <section className="rounded-lg border border-border bg-card p-6 space-y-3">
            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary/70">
              API Response <span className="text-muted-foreground/40 font-normal">GET /tasks/{taskId?.slice(0, 8)}…</span>
            </h3>
            {loadingApi ? (
              <div className="h-16 rounded-md bg-muted animate-pulse" />
            ) : apiError ? (
              <pre className="rounded border border-neon-error/20 bg-neon-error/5 px-3 py-2 font-mono-cyber text-[10px] text-neon-error whitespace-pre-wrap">{apiError}</pre>
            ) : apiResponse ? (
              <pre className="rounded border border-border bg-background/50 px-3 py-2 font-mono-cyber text-[10px] text-foreground overflow-x-auto max-h-72 whitespace-pre-wrap">{apiResponse}</pre>
            ) : null}
          </section>
        </div>
      )}
    </main>
  );
};

export default TaskDetailView;
