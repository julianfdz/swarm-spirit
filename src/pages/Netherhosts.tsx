import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, ShieldCheck, ShieldX, Wifi, WifiOff } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Netherhost = Tables<"netherhosts">;

const Netherhosts = () => {
  const [hosts, setHosts] = useState<Netherhost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHosts = async () => {
      const { data } = await supabase
        .from("netherhosts")
        .select("*")
        .order("created_at", { ascending: false });
      setHosts(data ?? []);
      setLoading(false);
    };
    fetchHosts();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
      <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">Netherhosts</h2>
      <p className="mt-1 text-sm text-muted-foreground">Nodos de host conectados a la red</p>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg neon-border bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : hosts.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-mono-cyber text-lg text-foreground">No se encontraron hosts</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            No hay ningún nodo de host conectado a la red en este momento. Cuando se registren netherhosts aparecerán listados aquí.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hosts.map((host) => (
            <div
              key={host.id}
              className="rounded-lg neon-border bg-card p-5 transition-all hover:neon-glow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  <h3 className="font-mono-cyber text-sm tracking-wide text-foreground">
                    {host.name}
                  </h3>
                </div>
                {host.verified ? (
                  <ShieldCheck className="h-4 w-4 text-neon-success" />
                ) : (
                  <ShieldX className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              {host.description && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {host.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {host.domain_cert && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono-cyber text-[10px] text-primary">
                    {host.domain_cert}
                  </span>
                )}
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono-cyber text-[10px] ${
                  host.last_heartbeat
                    ? "bg-neon-success/15 text-neon-success"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {host.last_heartbeat ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {host.last_heartbeat ? "Online" : "Sin heartbeat"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Netherhosts;
