import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DaemonCard } from "@/components/DaemonCard";
import type { Tables } from "@/integrations/supabase/types";

type HostDaemon = Tables<"host_daemons"> & {
  netherhosts?: { name: string; host_url: string | null } | null;
};

const resolveAvatarUrl = (d: HostDaemon) => {
  if (!d.avatar_url) return null;
  const raw = d.avatar_url;
  if (/^https?:\/\//i.test(raw)) return raw;
  const hostBase = d.netherhosts?.host_url?.replace(/\/+$/, "") ?? "";
  const full = hostBase ? `${hostBase}${raw.startsWith("/") ? "" : "/"}${raw}` : null;
  return full ? encodeURI(decodeURI(full)) : null;
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

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono-cyber text-2xl tracking-wide text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Catálogo de Daemons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todos los daemons desplegados en tus hosts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} className="gap-1.5 font-mono-cyber text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refrescar
        </Button>
      </div>

      {loading ? (
        <div className="daemon-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : daemons.length === 0 ? (
        <div className="rounded-lg neon-border bg-card p-12 text-center">
          <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hay daemons registrados en tus hosts.</p>
        </div>
      ) : (
        <div className="daemon-grid">
          {daemons.map((daemon) => (
            <DaemonCard
              key={daemon.id}
              daemon={{
                id: daemon.id,
                name: daemon.name,
                description: daemon.description,
                status: daemon.status,
                avatar_url: resolveAvatarUrl(daemon),
                version: daemon.version,
                visibility: daemon.visibility,
                host_name: daemon.netherhosts?.name ?? null,
              }}
              onClick={() => navigate(`/daemons/${daemon.id}`)}
              glitchEffect={true}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default DaemonsCatalogue;
