import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Zap, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { z } from "zod";

const API_URL = import.meta.env.VITE_NETHERNET_API_URL || "https://nethernet-api.buhosuite.com/api/v1";

const METHODS = ["tasks/send", "tasks/sendSubscribe", "tasks/pushNotification"];
const SOURCES = ["nethernet", "manual", "api", "webhook"];
const DAYS = [
  { key: "1", label: "Lun" },
  { key: "2", label: "Mar" },
  { key: "3", label: "Mié" },
  { key: "4", label: "Jue" },
  { key: "5", label: "Vie" },
  { key: "6", label: "Sáb" },
  { key: "0", label: "Dom" },
];

const PRESETS = [
  { label: "Cada hora", cron: "0 * * * *" },
  { label: "Cada 6 horas", cron: "0 */6 * * *" },
  { label: "Diario a las 9:00", cron: "0 9 * * *" },
  { label: "Lun-Vie a las 9:00", cron: "0 9 * * 1-5" },
  { label: "Cada lunes a las 8:00", cron: "0 8 * * 1" },
];

function buildCronFromSimple(days: string[], hour: string, minute: string): string {
  if (days.length === 0 || days.length === 7) return `${minute} ${hour} * * *`;
  return `${minute} ${hour} * * ${days.sort().join(",")}`;
}

function describeSchedule(type: string | null, value: string | null): string {
  if (!type || !value) return "Sin programación";
  if (type === "once") return `Una vez: ${value}`;
  if (type === "interval") return `Cada ${value}`;
  if (type === "cron") return `Cron: ${value}`;
  return value;
}

const TaskCreateView = () => {
  const { swarmId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("back") || (swarmId ? `/swarms/${swarmId}` : "/swarms");

  // Form state
  const [topic, setTopic] = useState("");
  const [label, setLabel] = useState("");
  const [daemonId, setDaemonId] = useState("");
  const [method, setMethod] = useState("tasks/send");
  const [source, setSource] = useState("manual");
  const [payloadStr, setPayloadStr] = useState("{}");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"simple" | "advanced">("simple");
  const [selectedDays, setSelectedDays] = useState<string[]>(["1", "2", "3", "4", "5"]);
  const [scheduleHour, setScheduleHour] = useState("09");
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [cronExpression, setCronExpression] = useState("0 9 * * 1-5");
  const [intervalValue, setIntervalValue] = useState("1h");
  const [scheduleType, setScheduleType] = useState<"cron" | "interval" | "once">("cron");
  const [onceDate, setOnceDate] = useState("");
  const [onceTime, setOnceTime] = useState("09:00");

  // Data
  const [hosts, setHosts] = useState<{ id: string; name: string; token: string | null }[]>([]);
  const [selectedHostId, setSelectedHostId] = useState("");
  const [swarmDaemons, setSwarmDaemons] = useState<{ id: string; name: string; daemon_ref: string | null }[]>([]);
  const [swarmName, setSwarmName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: hostsData } = await supabase.from("netherhosts").select("id, name, token");
      if (hostsData) {
        setHosts(hostsData);
        if (hostsData.length > 0) setSelectedHostId(hostsData[0].id);
      }

      if (swarmId) {
        const { data: swarm } = await supabase.from("swarms").select("name").eq("id", swarmId).maybeSingle();
        if (swarm) setSwarmName(swarm.name);

        const { data: sd } = await supabase
          .from("swarm_daemons")
          .select("daemon_id, host_daemons:daemon_id(id, name, daemon_ref)")
          .eq("swarm_id", swarmId);
        const daemons = (sd ?? []).map((r: any) => r.host_daemons).filter(Boolean);
        setSwarmDaemons(daemons);
      }
    };
    fetchData();
  }, [swarmId]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const getScheduleValue = (): { type: string; value: string } | null => {
    if (!isScheduled) return null;
    if (scheduleType === "cron") {
      const value = scheduleMode === "simple"
        ? buildCronFromSimple(selectedDays, scheduleHour, scheduleMinute)
        : cronExpression;
      return { type: "cron", value };
    }
    if (scheduleType === "interval") return { type: "interval", value: intervalValue };
    if (scheduleType === "once") return { type: "once", value: `${onceDate}T${onceTime}:00` };
    return null;
  };

  const handleSubmit = async () => {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      toast({ title: "Payload inválido", description: "El JSON no es válido", variant: "destructive" });
      return;
    }

    if (!topic.trim() || !label.trim()) {
      toast({ title: "Campos obligatorios", description: "Topic y Label son obligatorios", variant: "destructive" });
      return;
    }

    const selectedHost = hosts.find((h) => h.id === selectedHostId);
    if (!selectedHost?.token) {
      toast({ title: "Sin token", description: "El host seleccionado no tiene token", variant: "destructive" });
      return;
    }

    const schedule = getScheduleValue();

    const body: Record<string, unknown> = {
      topic: topic.trim(),
      label: label.trim(),
      method,
      payload,
      source,
      priority,
      ...(swarmId ? { swarm_id: swarmId } : {}),
      ...(daemonId && daemonId !== "__none__" ? { daemon_id: daemonId } : {}),
      ...(schedule ? {
        schedule_type: schedule.type,
        schedule_value: schedule.value,
      } : {}),
    };

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectedHost.token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }

      toast({ title: "Task creada", description: schedule ? `Programada: ${describeSchedule(schedule.type, schedule.value)}` : `Topic: ${topic}` });
      navigate(backTo);
    } catch (e: any) {
      toast({ title: "Error al crear task", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 md:px-12">
      <button onClick={() => navigate(backTo)} className="mb-6 font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Volver
      </button>

      <div className="mb-8">
        <h2 className="font-mono-cyber text-xl tracking-wide text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Nueva Task
        </h2>
        {swarmName && <p className="mt-1 text-sm text-muted-foreground">Swarm: {swarmName}</p>}
      </div>

      <div className="space-y-8">
        {/* === BASIC INFO === */}
        <section className="rounded-lg border border-border bg-card p-6 space-y-5">
          <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary/70 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Información básica
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Host */}
            <div className="space-y-1.5">
              <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Host (auth) *</Label>
              {hosts.length === 0 ? (
                <p className="font-mono-cyber text-[10px] text-destructive">No hay hosts disponibles</p>
              ) : (
                <Select value={selectedHostId} onValueChange={setSelectedHostId}>
                  <SelectTrigger className="font-mono-cyber text-xs"><SelectValue placeholder="Selecciona host" /></SelectTrigger>
                  <SelectContent>
                    {hosts.map((h) => (
                      <SelectItem key={h.id} value={h.id} className="font-mono-cyber text-xs">{h.name} {h.token ? "" : "(sin token)"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="font-mono-cyber text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["critical", "high", "medium", "low"].map((p) => (
                    <SelectItem key={p} value={p} className="font-mono-cyber text-xs uppercase">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Topic *</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="news.scrape" className="font-mono-cyber text-xs" maxLength={100} />
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Label *</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Scrape La Verdad RSS" className="font-mono-cyber text-xs" maxLength={200} />
          </div>

          {/* Daemon */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Daemon (opcional)</Label>
            {swarmDaemons.length > 0 ? (
              <Select value={daemonId} onValueChange={setDaemonId}>
                <SelectTrigger className="font-mono-cyber text-xs"><SelectValue placeholder="Selecciona daemon" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" className="font-mono-cyber text-xs text-muted-foreground">Ninguno</SelectItem>
                  {swarmDaemons.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="font-mono-cyber text-xs">{d.name} {d.daemon_ref ? `(${d.daemon_ref})` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={daemonId} onChange={(e) => setDaemonId(e.target.value)} placeholder="uuid del daemon" className="font-mono-cyber text-xs" />
            )}
          </div>

          {/* Method + Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="font-mono-cyber text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => <SelectItem key={m} value={m} className="font-mono-cyber text-xs">{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="font-mono-cyber text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => <SelectItem key={s} value={s} className="font-mono-cyber text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payload */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Payload (JSON)</Label>
            <Textarea value={payloadStr} onChange={(e) => setPayloadStr(e.target.value)} placeholder='{"url": "https://..."}' className="font-mono-cyber text-xs min-h-[100px] resize-y" />
          </div>
        </section>

        {/* === SCHEDULING === */}
        <section className="rounded-lg border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary/70 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Programación
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-mono-cyber text-[10px] text-muted-foreground">{isScheduled ? "Activada" : "Desactivada"}</span>
              <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
            </div>
          </div>

          {isScheduled && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Schedule type tabs */}
              <div className="flex gap-1 rounded-md border border-border overflow-hidden">
                {([
                  { key: "cron" as const, label: "Recurrente", icon: <Calendar className="h-3 w-3" /> },
                  { key: "interval" as const, label: "Intervalo", icon: <Clock className="h-3 w-3" /> },
                  { key: "once" as const, label: "Una vez", icon: <Zap className="h-3 w-3" /> },
                ]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setScheduleType(t.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 font-mono-cyber text-[10px] uppercase transition-colors ${
                      scheduleType === t.key ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* CRON type */}
              {scheduleType === "cron" && (
                <div className="space-y-4">
                  {/* Mode toggle */}
                  <div className="flex gap-1 rounded-md border border-border overflow-hidden w-fit">
                    <button onClick={() => setScheduleMode("simple")} className={`px-3 py-1.5 font-mono-cyber text-[10px] uppercase ${scheduleMode === "simple" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                      Simple
                    </button>
                    <button onClick={() => setScheduleMode("advanced")} className={`px-3 py-1.5 font-mono-cyber text-[10px] uppercase ${scheduleMode === "advanced" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                      Avanzado
                    </button>
                  </div>

                  {scheduleMode === "simple" ? (
                    <div className="space-y-4">
                      {/* Day picker */}
                      <div className="space-y-2">
                        <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Días de la semana</Label>
                        <div className="flex gap-1.5">
                          {DAYS.map((d) => (
                            <button
                              key={d.key}
                              onClick={() => toggleDay(d.key)}
                              className={`flex-1 rounded-md border py-2 font-mono-cyber text-[11px] uppercase transition-all ${
                                selectedDays.includes(d.key)
                                  ? "bg-primary/20 border-primary/50 text-primary"
                                  : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedDays(["1","2","3","4","5"])} className="font-mono-cyber text-[9px] text-primary/60 hover:text-primary">Lun-Vie</button>
                          <button onClick={() => setSelectedDays(["0","1","2","3","4","5","6"])} className="font-mono-cyber text-[9px] text-primary/60 hover:text-primary">Todos</button>
                          <button onClick={() => setSelectedDays(["6","0"])} className="font-mono-cyber text-[9px] text-primary/60 hover:text-primary">Fines de semana</button>
                        </div>
                      </div>

                      {/* Time picker */}
                      <div className="space-y-2">
                        <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Hora de ejecución</Label>
                        <div className="flex items-center gap-2">
                          <Select value={scheduleHour} onValueChange={setScheduleHour}>
                            <SelectTrigger className="font-mono-cyber text-xs w-20"><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-48">
                              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                                <SelectItem key={h} value={h} className="font-mono-cyber text-xs">{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="font-mono-cyber text-foreground">:</span>
                          <Select value={scheduleMinute} onValueChange={setScheduleMinute}>
                            <SelectTrigger className="font-mono-cyber text-xs w-20"><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-48">
                              {["00", "15", "30", "45"].map((m) => (
                                <SelectItem key={m} value={m} className="font-mono-cyber text-xs">{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="space-y-2">
                        <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Presets rápidos</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESETS.map((p) => (
                            <button
                              key={p.cron}
                              onClick={() => {
                                setCronExpression(p.cron);
                                // Parse back to simple mode
                                const parts = p.cron.split(" ");
                                setScheduleMinute(parts[0].padStart(2, "0"));
                                setScheduleHour(parts[1].padStart(2, "0"));
                                if (parts[4] === "*") setSelectedDays(["0","1","2","3","4","5","6"]);
                                else setSelectedDays(parts[4].split(",").flatMap(r => {
                                  if (r.includes("-")) {
                                    const [a, b] = r.split("-").map(Number);
                                    return Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
                                  }
                                  return [r];
                                }));
                              }}
                              className="rounded-md border border-border px-2.5 py-1.5 font-mono-cyber text-[10px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="rounded-md bg-background/50 border border-border p-3">
                        <span className="font-mono-cyber text-[10px] text-muted-foreground">Expresión cron resultante: </span>
                        <span className="font-mono-cyber text-xs text-primary">{buildCronFromSimple(selectedDays, scheduleHour, scheduleMinute)}</span>
                      </div>
                    </div>
                  ) : (
                    /* Advanced cron */
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Expresión cron</Label>
                        <Input value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} placeholder="0 9 * * 1-5" className="font-mono-cyber text-xs" />
                        <p className="font-mono-cyber text-[9px] text-muted-foreground">Formato: minuto hora día-mes mes día-semana</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INTERVAL type */}
              {scheduleType === "interval" && (
                <div className="space-y-3">
                  <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Intervalo</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {["5m", "15m", "30m", "1h", "2h", "6h", "12h", "24h"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setIntervalValue(v)}
                        className={`rounded-md border px-3 py-1.5 font-mono-cyber text-[11px] transition-colors ${
                          intervalValue === v ? "bg-primary/20 border-primary/50 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <Input value={intervalValue} onChange={(e) => setIntervalValue(e.target.value)} placeholder="1h30m" className="font-mono-cyber text-xs" />
                </div>
              )}

              {/* ONCE type */}
              {scheduleType === "once" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Fecha</Label>
                    <Input type="date" value={onceDate} onChange={(e) => setOnceDate(e.target.value)} className="font-mono-cyber text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Hora</Label>
                    <Input type="time" value={onceTime} onChange={(e) => setOnceTime(e.target.value)} className="font-mono-cyber text-xs" />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* === SUBMIT === */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(backTo)} className="font-mono-cyber text-xs uppercase">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 font-mono-cyber text-xs uppercase tracking-wider">
            {loading ? "Enviando..." : isScheduled ? "Crear Task Programada" : "Crear Task"}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default TaskCreateView;
