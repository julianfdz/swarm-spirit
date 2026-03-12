import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { swarms as mockSwarms, Daemon } from "@/data/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";
import EventStream from "@/components/EventStream";
import TaskPool from "@/components/TaskPool";
import JobsList from "@/components/JobsList";
import { DaemonCard } from "@/components/DaemonCard";
import type { Tables } from "@/integrations/supabase/types";

import daemonScraper from "@/assets/daemon-scraper.png";
import daemonWriter from "@/assets/daemon-writer.png";
import daemonPublisher from "@/assets/daemon-publisher.png";
import daemonProgrammer from "@/assets/daemon-programmer.png";
import daemonAnalyst from "@/assets/daemon-analyst.png";
import daemonSupport from "@/assets/daemon-support.png";
import daemonSocial from "@/assets/daemon-social.png";
import daemonScheduler from "@/assets/daemon-scheduler.png";

const placeholders = [
  daemonScraper, daemonWriter, daemonPublisher, daemonProgrammer,
  daemonAnalyst, daemonSupport, daemonSocial, daemonScheduler,
];

type SwarmTab = "daemons" | "event-stream" | "task-pool" | "jobs";

type HostDaemon = Tables<"host_daemons"> & {
  netherhosts?: { name: string; host_url: string | null } | null;
};

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

const statusColor = (s: string) => {
  if (s === "running") return "bg-neon-success";
  if (s === "stopped") return "bg-neon-error";
  return "bg-muted-foreground";
};

const resolveAvatarUrl = (d: HostDaemon) => {
  if (!d.avatar_url) return null;
  const raw = d.avatar_url;
  if (/^https?:\/\//i.test(raw)) return raw;
  const hostBase = (d.netherhosts?.host_url ?? "").replace(/\/+$/, "");
  const full = hostBase ? `${hostBase}${raw.startsWith("/") ? "" : "/"}${raw}` : null;
  return full ? encodeURI(decodeURI(full)) : null;
};

const isVideoUrl = (url: string) => /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);

const SwarmView = () => {
  const { swarmId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as SwarmTab) || "daemons";
  const [tab, setTab] = useState<SwarmTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [dbSwarm, setDbSwarm] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [realDaemons, setRealDaemons] = useState<HostDaemon[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const mockSwarm = mockSwarms.find((s) => s.id === swarmId);

  useEffect(() => {
    if (mockSwarm || !swarmId) {
      setLoading(false);
      return;
    }
    const fetchSwarm = async () => {
      const { data } = await supabase
        .from("swarms")
        .select("*")
        .eq("id", swarmId)
        .single();
      setDbSwarm(data);
      setLoading(false);
    };
    fetchSwarm();
  }, [swarmId, mockSwarm]);

  // Fetch real daemons assigned to this swarm
  useEffect(() => {
    if (!swarmId || mockSwarm) return;
    const fetchDaemons = async () => {
      const { data } = await supabase
        .from("swarm_daemons")
        .select("daemon_id, host_daemons:daemon_id(*, netherhosts(name, host_url))")
        .eq("swarm_id", swarmId);
      const daemons = (data ?? [])
        .map((sd: any) => sd.host_daemons)
        .filter(Boolean) as HostDaemon[];
      setRealDaemons(daemons);
    };
    fetchDaemons();
  }, [swarmId, mockSwarm]);

  const swarm = mockSwarm ?? dbSwarm;
  const isMock = !!mockSwarm;

  // Sync edit fields when swarm data loads or dialog opens
  useEffect(() => {
    if (editOpen && swarm) {
      setEditName(swarm.name);
      setEditDesc(swarm.description ?? "");
    }
  }, [editOpen, swarm]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-12 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </main>
    );
  }

  if (!swarm) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <p className="font-mono-cyber text-muted-foreground">Swarm not found</p>
      </div>
    );
  }

  const handleSaveEdit = async () => {
    if (!editName.trim() || isMock) return;
    setSaving(true);
    const { error } = await supabase
      .from("swarms")
      .update({ name: editName.trim(), description: editDesc.trim() || null })
      .eq("id", swarm.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDbSwarm((prev) => prev ? { ...prev, name: editName.trim(), description: editDesc.trim() || null } : prev);
      toast({ title: "Swarm actualizado" });
      setEditOpen(false);
    }
    setSaving(false);
  };

  const tabs: { key: SwarmTab; label: string }[] = [
    { key: "daemons", label: "Daemons" },
    { key: "event-stream", label: "Event Stream" },
    { key: "task-pool", label: "Task Pool" },
    { key: "jobs", label: "Jobs" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12 animate-in fade-in duration-200">
      <button
        onClick={() => navigate("/swarms")}
        className="mb-6 font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        ← Volver a swarms
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{swarm.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{swarm.description}</p>
        </div>
        {!isMock && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5 font-mono-cyber text-xs">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-mono-cyber">Editar Swarm</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="font-mono-cyber text-xs text-muted-foreground mb-1 block">Nombre</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="font-mono-cyber" />
                </div>
                <div>
                  <label className="font-mono-cyber text-xs text-muted-foreground mb-1 block">Descripción</label>
                  <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="font-mono-cyber" />
                </div>
                <Button onClick={handleSaveEdit} disabled={saving || !editName.trim()} className="w-full font-mono-cyber">
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

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

      {/* Mock daemons */}
      {tab === "daemons" && isMock && mockSwarm && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {mockSwarm.daemons.map((daemon) => (
            <button
              key={daemon.id}
              onClick={() => navigate(`/swarms/${swarmId}/daemon/${daemon.id}`)}
              className="group relative flex flex-col items-center border border-border bg-card p-4 transition-all hover:neon-glow hover:z-10"
            >
              <img src={daemon.avatar} alt={daemon.name} className="mb-3 h-24 w-24 rounded-sm object-cover" />
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

      {/* Real daemons from DB */}
      {tab === "daemons" && !isMock && (
        realDaemons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No hay daemons asignados a este swarm todavía.</p>
          </div>
        ) : (
          <div className="daemon-grid">
            {realDaemons.map((daemon) => {
              const avatarUrl = resolveAvatarUrl(daemon);
              return (
                <DaemonCard
                  key={daemon.id}
                  daemon={{
                    id: daemon.id,
                    name: daemon.name,
                    description: daemon.description,
                    status: daemon.status,
                    avatar_url: avatarUrl,
                    version: daemon.version,
                    visibility: daemon.visibility,
                    host_name: daemon.netherhosts?.name ?? null,
                  }}
                  onClick={() => navigate(`/daemons/${daemon.id}`)}
                  glitchEffect={true}
                />
              );
            })}
          </div>
        )
      )}

      {tab === "event-stream" && <EventStream swarmId={swarmId!} />}
      {tab === "task-pool" && <TaskPool swarmId={swarmId!} swarmDaemons={realDaemons.map(d => ({ id: d.id, name: d.name, daemon_ref: d.daemon_ref }))} />}
      {tab === "jobs" && <JobsList swarmId={swarmId!} />}
    </main>
  );
};

export default SwarmView;
