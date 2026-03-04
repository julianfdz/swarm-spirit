import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Eye, EyeOff, RefreshCw, Calendar, Clock, Hash, Server, Globe, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

import daemonScraper from "@/assets/daemon-scraper.png";
import daemonWriter from "@/assets/daemon-writer.png";
import daemonPublisher from "@/assets/daemon-publisher.png";
import daemonProgrammer from "@/assets/daemon-programmer.png";
import daemonAnalyst from "@/assets/daemon-analyst.png";
import daemonSupport from "@/assets/daemon-support.png";
import daemonSocial from "@/assets/daemon-social.png";
import daemonScheduler from "@/assets/daemon-scheduler.png";

const mockAvatars = [
  daemonScraper, daemonWriter, daemonPublisher, daemonProgrammer,
  daemonAnalyst, daemonSupport, daemonSocial, daemonScheduler,
];

type HostDaemon = Tables<"host_daemons"> & {
  netherhosts?: { name: string; host_url: string | null } | null;
};

const DaemonsCatalogue = () => {
  const [daemons, setDaemons] = useState<HostDaemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HostDaemon | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("host_daemons")
      .select("*, netherhosts(name, host_url)")
      .eq("disabled", false)
      .order("updated_at", { ascending: false });
    setDaemons((data as HostDaemon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const getAvatar = (index: number) => mockAvatars[index % mockAvatars.length];

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const statusColor = (s: string) =>
    s === "running" ? "bg-neon-success" : s === "stopped" ? "bg-destructive" : "bg-muted-foreground";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono-cyber text-2xl tracking-wide text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Catálogo de Daemons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todos los daemons desplegados en tus hosts. Pulsa en uno para ver su detalle completo.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} className="gap-1.5 font-mono-cyber text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refrescar
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : daemons.length === 0 ? (
        <div className="rounded-lg neon-border bg-card p-12 text-center">
          <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hay daemons registrados en tus hosts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {daemons.map((daemon, i) => (
            <button
              key={daemon.id}
              onClick={() => setSelected(daemon)}
              className="group relative flex flex-col items-center border border-border bg-card p-5 transition-all hover:neon-glow hover:z-10"
            >
              <img src={getAvatar(i)} alt={daemon.name} className="mb-3 h-24 w-24 rounded-sm object-cover" />
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-2 w-2 rounded-full ${statusColor(daemon.status)}`} />
                <Badge variant="outline" className="font-mono-cyber text-[10px] gap-1">
                  {daemon.visibility === "public" ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                  {daemon.visibility}
                </Badge>
              </div>
              <h4 className="font-mono-cyber text-xs tracking-wide text-foreground group-hover:text-primary transition-colors text-center">
                {daemon.name}
              </h4>
              {daemon.description && (
                <p className="mt-1 text-[10px] text-muted-foreground text-center line-clamp-2">{daemon.description}</p>
              )}
              {daemon.netherhosts && (
                <p className="mt-1.5 text-[10px] text-primary/70 font-mono-cyber flex items-center gap-1">
                  <Server className="h-2.5 w-2.5" /> {daemon.netherhosts.name}
                </p>
              )}
              <p className="mt-2 text-[10px] text-muted-foreground">
                {new Date(daemon.updated_at).toLocaleDateString("es-ES")}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <img
                    src={getAvatar(daemons.indexOf(selected))}
                    alt={selected.name}
                    className="h-16 w-16 rounded-sm object-cover shrink-0"
                  />
                  <div>
                    <DialogTitle className="font-mono-cyber text-lg">{selected.name}</DialogTitle>
                    <DialogDescription>{selected.description || "Sin descripción"}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoBlock icon={<Hash className="h-3.5 w-3.5" />} label="ID" value={selected.id} mono />
                  <InfoBlock
                    icon={selected.visibility === "public" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    label="Visibilidad"
                    value={selected.visibility}
                  />
                  <InfoBlock icon={<Calendar className="h-3.5 w-3.5" />} label="Actualizado" value={formatDate(selected.updated_at)} />
                  <InfoBlock
                    icon={<div className={`h-3 w-3 rounded-full ${statusColor(selected.status)}`} />}
                    label="Status"
                    value={selected.status}
                  />
                </div>

                {/* Host info */}
                <div className="rounded-md neon-border bg-card p-4">
                  <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-primary">Host</span>
                  <div className="mt-1 space-y-1">
                    <p className="font-mono-cyber text-xs text-foreground/80 flex items-center gap-1.5">
                      <Server className="h-3 w-3 text-muted-foreground" />
                      {selected.netherhosts?.name ?? selected.host_id}
                    </p>
                    <p className="font-mono-cyber text-[10px] text-muted-foreground break-all">
                      Host ID: {selected.host_id}
                    </p>
                  </div>
                </div>

                {/* Daemon ref & version */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoBlock icon={<Globe className="h-3.5 w-3.5" />} label="Daemon Ref" value={selected.daemon_ref ?? "—"} mono />
                  <InfoBlock icon={<Hash className="h-3.5 w-3.5" />} label="Version" value={selected.version ?? "—"} />
                </div>

                {/* URLs */}
                <div className="rounded-md neon-border bg-card p-4 space-y-2">
                  <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-primary">Service URLs</span>
                  <UrlRow label="Invoke" url={selected.invoke_url} />
                  <UrlRow label="Status" url={selected.status_url} />
                  <UrlRow label="Sigil" url={selected.sigil_url} />
                  <UrlRow label="MCP" url={selected.mcp_url} />
                </div>

                {/* Capabilities */}
                <div className="rounded-md neon-border bg-card p-4">
                  <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-primary">Capabilities</span>
                  {selected.capabilities && Object.keys(selected.capabilities as object).length > 0 ? (
                    <pre className="font-mono-cyber text-xs text-foreground/80 mt-2 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selected.capabilities, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1 italic">Sin capabilities configuradas</p>
                  )}
                </div>

                {/* Last seen */}
                {selected.last_seen_at && (
                  <InfoBlock icon={<Clock className="h-3.5 w-3.5" />} label="Último contacto" value={formatDate(selected.last_seen_at)} />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

const InfoBlock = ({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) => (
  <div className="rounded-md neon-border bg-card p-3">
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-primary">{icon}</span>
      <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
    <p className={`text-xs text-foreground/80 ${mono ? "font-mono-cyber break-all" : ""}`}>{value}</p>
  </div>
);

const UrlRow = ({ label, url }: { label: string; url: string | null }) => (
  <div className="flex items-center gap-2">
    <Link className="h-3 w-3 text-muted-foreground shrink-0" />
    <span className="font-mono-cyber text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
    {url ? (
      <span className="font-mono-cyber text-xs text-foreground/80 break-all">{url}</span>
    ) : (
      <span className="text-xs text-muted-foreground italic">—</span>
    )}
  </div>
);

export default DaemonsCatalogue;
