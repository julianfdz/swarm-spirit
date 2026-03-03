import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Eye, EyeOff, RefreshCw, X, Calendar, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

// Mock avatars — cycle through available daemon images
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

type Daemon = Tables<"daemons">;

const DaemonsCatalogue = () => {
  const [daemons, setDaemons] = useState<Daemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Daemon | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("daemons")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    setDaemons(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const getAvatar = (index: number) => mockAvatars[index % mockAvatars.length];

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono-cyber text-2xl tracking-wide text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Catálogo de Daemons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todos tus daemons registrados. Pulsa en uno para ver su detalle completo.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} className="gap-1.5 font-mono-cyber text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refrescar
        </Button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : daemons.length === 0 ? (
        <div className="rounded-lg neon-border bg-card p-12 text-center">
          <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No tienes daemons registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {daemons.map((daemon, i) => (
            <button
              key={daemon.id}
              onClick={() => setSelected(daemon)}
              className="group relative flex flex-col items-center border border-border bg-card p-5 transition-all hover:neon-glow hover:z-10"
            >
              <img
                src={getAvatar(i)}
                alt={daemon.name}
                className="mb-3 h-24 w-24 rounded-sm object-cover"
              />
              <Badge variant="outline" className="font-mono-cyber text-[10px] gap-1 mb-2">
                {daemon.visibility === "public" ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                {daemon.visibility}
              </Badge>
              <h4 className="font-mono-cyber text-xs tracking-wide text-foreground group-hover:text-primary transition-colors text-center">
                {daemon.name}
              </h4>
              {daemon.description && (
                <p className="mt-1 text-[10px] text-muted-foreground text-center line-clamp-2">{daemon.description}</p>
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
                  <InfoBlock icon={<Calendar className="h-3.5 w-3.5" />} label="Creado" value={formatDate(selected.created_at)} />
                  <InfoBlock icon={<Clock className="h-3.5 w-3.5" />} label="Actualizado" value={formatDate(selected.updated_at)} />
                </div>

                {/* User ID */}
                <div className="rounded-md neon-border bg-card p-4">
                  <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-primary">User ID</span>
                  <p className="font-mono-cyber text-xs text-foreground/80 mt-1 break-all">{selected.user_id}</p>
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

                {/* Deleted at */}
                {selected.deleted_at && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                    <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-destructive">Eliminado</span>
                    <p className="font-mono-cyber text-xs text-destructive mt-1">{formatDate(selected.deleted_at)}</p>
                  </div>
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

export default DaemonsCatalogue;
