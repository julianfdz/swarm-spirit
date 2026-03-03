import { useState, useMemo, useEffect, useCallback } from "react";
import { getEventsForSwarm, StreamEvent } from "@/data/eventStreamData";
import { supabase } from "@/integrations/supabase/client";
import EmitEventDialog from "@/components/EmitEventDialog";
import { ChevronDown, ChevronRight, ArrowLeft, X, RefreshCw } from "lucide-react";

interface Props {
  swarmId: string;
}

const MOCK_SWARM_IDS = ["diario-ia-alcantarilla", "customer-ops", "social-media-hive"];

function dbEventToStreamEvent(e: any): StreamEvent {
  return {
    id: e.id,
    type: e.type || "",
    timestamp: (e.created_at || "").replace("T", " ").slice(0, 19),
    sourceDaemonId: e.source_daemon_id || "",
    sourceDaemonName: e.source_daemon_id?.slice(0, 8) || "—",
    correlationId: e.correlation_id || "",
    status: e.level === "error" ? "error" : "ok",
    payload: e.payload || {},
  };
}

const EventStream = ({ swarmId }: Props) => {
  const isMockSwarm = MOCK_SWARM_IDS.includes(swarmId);
  const mockEvents = useMemo(() => (isMockSwarm ? getEventsForSwarm(swarmId) : []), [swarmId, isMockSwarm]);

  const [dbEvents, setDbEvents] = useState<StreamEvent[]>([]);
  const [loadingDb, setLoadingDb] = useState(!isMockSwarm);

  const fetchDbEvents = useCallback(async () => {
    if (isMockSwarm) return;
    setLoadingDb(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("swarm_id", swarmId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setDbEvents(data.map(dbEventToStreamEvent));
    setLoadingDb(false);
  }, [swarmId, isMockSwarm]);

  useEffect(() => { fetchDbEvents(); }, [fetchDbEvents]);

  const allEvents = isMockSwarm ? mockEvents : dbEvents;

  const [topicFilter, setTopicFilter] = useState("");
  const [expandedPayloads, setExpandedPayloads] = useState<Set<string>>(new Set());
  const [traceCorrelationId, setTraceCorrelationId] = useState<string | null>(null);

  // Extract unique topic prefixes for filter chips
  const topics = useMemo(() => {
    const prefixes = new Set<string>();
    allEvents.forEach((e) => {
      const prefix = e.type.split(".")[0];
      prefixes.add(prefix + ".*");
    });
    return Array.from(prefixes).sort();
  }, [allEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!topicFilter) return allEvents;
    const prefix = topicFilter.replace(".*", ".");
    return allEvents.filter((e) => e.type.startsWith(prefix));
  }, [allEvents, topicFilter]);

  // Trace mode
  const traceEvents = useMemo(() => {
    if (!traceCorrelationId) return [];
    return allEvents
      .filter((e) => e.correlationId === traceCorrelationId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [allEvents, traceCorrelationId]);

  const togglePayload = (id: string) => {
    setExpandedPayloads((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // --- Trace View ---
  if (traceCorrelationId) {
    return (
      <div>
        <button
          onClick={() => setTraceCorrelationId(null)}
          className="mb-4 flex items-center gap-1.5 font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Volver al stream
        </button>

        <div className="mb-4">
          <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary">
            Trace · {traceCorrelationId}
          </h3>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Pipeline timeline — {traceEvents.length} events
          </p>
        </div>

        {/* Timeline */}
        <div className="relative ml-3 border-l border-primary/30 pl-6 space-y-0">
          {traceEvents.map((event, i) => {
            const isError = event.status === "error";
            const isLast = i === traceEvents.length - 1;
            return (
              <div key={event.id} className="relative pb-6 last:pb-0">
                <div
                  className={`absolute -left-[30.5px] top-1 h-3 w-3 rounded-full border-2 ${
                    isError
                      ? "border-neon-error bg-neon-error/20"
                      : isLast
                      ? "border-primary bg-primary/30 animate-pulse-neon"
                      : "border-primary/60 bg-primary/10"
                  }`}
                />
                <div className="neon-border rounded-md bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono-cyber text-xs ${isError ? "text-neon-error" : "text-foreground"}`}>
                      {event.type}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 font-mono-cyber text-[9px] uppercase ${
                      isError ? "bg-neon-error/15 text-neon-error" : "bg-neon-success/15 text-neon-success"
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground font-mono-cyber">
                    <span>{event.timestamp.split(" ")[1]}</span>
                    <span>→ {event.sourceDaemonName}</span>
                  </div>
                  <pre className="mt-2 rounded bg-background/50 p-2 font-mono-cyber text-[10px] leading-relaxed text-foreground/60 overflow-x-auto whitespace-pre">
{JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Stream View ---
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary">Event Stream</h3>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {loadingDb ? "Cargando..." : `${allEvents.length} events`} · click a correlation ID to trace
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isMockSwarm && (
            <button
              onClick={fetchDbEvents}
              className="rounded border border-border p-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="Refrescar"
            >
              <RefreshCw className={`h-3 w-3 ${loadingDb ? "animate-spin" : ""}`} />
            </button>
          )}
          <EmitEventDialog swarmId={swarmId} onCreated={fetchDbEvents} />
        </div>
      </div>

      {/* Topic Filter Chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTopicFilter("")}
          className={`rounded-full px-2.5 py-1 font-mono-cyber text-[10px] uppercase tracking-wider transition-colors ${
            !topicFilter
              ? "bg-primary/20 text-primary neon-border"
              : "bg-card text-muted-foreground border border-border hover:text-foreground"
          }`}
        >
          all
        </button>
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setTopicFilter(topicFilter === topic ? "" : topic)}
            className={`rounded-full px-2.5 py-1 font-mono-cyber text-[10px] uppercase tracking-wider transition-colors ${
              topicFilter === topic
                ? "bg-primary/20 text-primary neon-border"
                : "bg-card text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            {topic}
          </button>
        ))}
        {topicFilter && (
          <button onClick={() => setTopicFilter("")} className="text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Event List */}
      <div className="space-y-1">
        {filteredEvents.map((event) => {
          const isExpanded = expandedPayloads.has(event.id);
          const isError = event.status === "error";
          return (
            <div key={event.id} className="rounded-md border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2">
                <button onClick={() => togglePayload(event.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                <span className={`font-mono-cyber text-[11px] min-w-0 truncate ${isError ? "text-neon-error" : "text-foreground"}`}>
                  {event.type}
                </span>
                <div className="ml-auto flex items-center gap-3 shrink-0">
                  <span className={`rounded-full px-1.5 py-0.5 font-mono-cyber text-[9px] uppercase ${
                    isError ? "bg-neon-error/15 text-neon-error" : "bg-neon-success/15 text-neon-success"
                  }`}>
                    {event.status}
                  </span>
                  <span className="hidden sm:inline font-mono-cyber text-[10px] text-muted-foreground truncate max-w-[100px]">
                    {event.sourceDaemonName}
                  </span>
                  {event.correlationId && (
                    <button
                      onClick={() => setTraceCorrelationId(event.correlationId)}
                      className="font-mono-cyber text-[10px] text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                    >
                      {event.correlationId.slice(0, 12)}
                    </button>
                  )}
                  <span className="font-mono-cyber text-[10px] text-muted-foreground">
                    {event.timestamp.split(" ")[1] || event.timestamp.slice(11, 19)}
                  </span>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-border bg-background/50 px-3 py-2">
                  {event.type && (
                    <p className="font-mono-cyber text-[10px] text-muted-foreground mb-1">
                      Message: {(event as any).message || "—"}
                    </p>
                  )}
                  <pre className="font-mono-cyber text-[10px] leading-relaxed text-foreground/60 overflow-x-auto whitespace-pre">
{JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
        {!loadingDb && allEvents.length === 0 && (
          <p className="text-center py-8 font-mono-cyber text-xs text-muted-foreground">No hay eventos todavía</p>
        )}
      </div>
    </div>
  );
};

export default EventStream;
