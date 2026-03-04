import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Eye, EyeOff, RefreshCw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();
  const [daemons, setDaemons] = useState<HostDaemon[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getPlaceholder = (index: number) => mockAvatars[index % mockAvatars.length];

  const resolveAvatarUrl = (d: HostDaemon) => {
    if (!d.avatar_url) return null;
    const raw = d.avatar_url;
    if (/^https?:\/\//i.test(raw)) return raw;
    const hostBase = d.netherhosts?.host_url?.replace(/\/+$/, "") ?? "";
    const full = hostBase ? `${hostBase}${raw.startsWith("/") ? "" : "/"}${raw}` : null;
    return full ? encodeURI(decodeURI(full)) : null;
  };

  const isVideoUrl = (url: string) => /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);

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
              onClick={() => navigate(`/daemons/${daemon.id}`)}
              className="group relative flex flex-col items-center border border-border bg-card p-5 transition-all hover:neon-glow hover:z-10"
            >
              {(() => {
                const avatarUrl = resolveAvatarUrl(daemon);
                if (avatarUrl && isVideoUrl(avatarUrl)) {
                  return (
                    <video
                      src={avatarUrl}
                      className="mb-3 h-24 w-24 rounded-sm object-cover"
                      autoPlay loop muted playsInline
                      onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
                    />
                  );
                }
                return (
                  <img
                    src={avatarUrl ?? getPlaceholder(i)}
                    alt={daemon.name}
                    className="mb-3 h-24 w-24 rounded-sm object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholder(i); }}
                  />
                );
              })()}
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

    </main>
  );
};

export default DaemonsCatalogue;
