import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Server,
  ShieldCheck,
  ShieldX,
  Wifi,
  WifiOff,
  Globe,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Netherhost = Tables<"netherhosts">;
type HostDaemon = Tables<"host_daemons">;

interface WellKnownData {
  [key: string]: unknown;
}

const HostDetail = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const navigate = useNavigate();
  const [host, setHost] = useState<Netherhost | null>(null);
  const [daemons, setDaemons] = useState<HostDaemon[]>([]);
  const [wellKnown, setWellKnown] = useState<WellKnownData | null>(null);
  const [wellKnownError, setWellKnownError] = useState<string | null>(null);
  const [wellKnownLoading, setWellKnownLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hostId) return;

    const fetchHost = async () => {
      const { data } = await supabase
        .from("netherhosts")
        .select("*")
        .eq("id", hostId)
        .single();
      setHost(data);
      setLoading(false);

      if (data?.domain_cert) {
        fetchWellKnown(data.domain_cert);
      }
    };

    const fetchDaemons = async () => {
      const { data } = await supabase
        .from("host_daemons")
        .select("*")
        .eq("host_id", hostId)
        .order("updated_at", { ascending: false });
      setDaemons(data ?? []);
    };

    fetchHost();
    fetchDaemons();
  }, [hostId]);

  const fetchWellKnown = async (domain: string) => {
    setWellKnownLoading(true);
    setWellKnownError(null);
    try {
      const url = domain.startsWith("http")
        ? `${domain}/.well-known/netherhost`
        : `https://${domain}/.well-known/netherhost`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setWellKnown(json);
    } catch (err: unknown) {
      setWellKnownError(err instanceof Error ? err.message : "No se pudo conectar");
    } finally {
      setWellKnownLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10 md:px-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </main>
    );
  }

  if (!host) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10 md:px-12">
        <Button variant="ghost" onClick={() => navigate("/hosts")} className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <div className="text-center py-16">
          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Host no encontrado</p>
        </div>
      </main>
    );
  }

  const isOnline = !!host.last_heartbeat;
  const heartbeatAgo = host.last_heartbeat
    ? timeAgo(new Date(host.last_heartbeat))
    : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 md:px-12 space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/hosts")} className="gap-2 mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Netherhosts
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="rounded-lg neon-border bg-card p-2.5">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-mono-cyber text-xl tracking-wide text-foreground">{host.name}</h1>
              {host.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{host.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {host.verified ? (
              <Badge variant="outline" className="gap-1 border-primary/40 text-primary font-mono-cyber text-xs">
                <ShieldCheck className="h-3 w-3" /> Verificado
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground font-mono-cyber text-xs">
                <ShieldX className="h-3 w-3" /> Sin verificar
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`gap-1 font-mono-cyber text-xs ${
                isOnline
                  ? "border-neon-success/40 text-neon-success"
                  : "text-muted-foreground"
              }`}
            >
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="rounded-lg neon-border bg-card p-6 space-y-4">
        <h2 className="font-mono-cyber text-sm tracking-wide text-foreground/80 uppercase">Información del Host</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="ID" value={host.id} mono />
          <InfoRow label="Dominio / Cert" value={host.domain_cert ?? "—"} />
          <InfoRow label="Creado" value={new Date(host.created_at).toLocaleString()} />
          <InfoRow
            label="Último heartbeat"
            value={heartbeatAgo ? `${heartbeatAgo} (${new Date(host.last_heartbeat!).toLocaleString()})` : "Nunca"}
            icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
          />
        </div>
      </div>

      {/* Daemons */}
      <div className="rounded-lg neon-border bg-card p-6 space-y-4">
        <h2 className="font-mono-cyber text-sm tracking-wide text-foreground/80 uppercase">
          Daemons en este Host ({daemons.length})
        </h2>
        {daemons.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No hay daemons asignados a este host.</p>
        ) : (
          <div className="space-y-2">
            {daemons.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-md bg-background/50 px-4 py-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${d.status === "running" ? "bg-neon-success" : d.status === "stopped" ? "bg-destructive" : "bg-muted-foreground"}`} />
                  <div>
                    <p className="font-mono-cyber text-xs text-foreground">{d.daemon_ref ?? d.daemon_id}</p>
                    {d.version && <p className="text-[10px] text-muted-foreground">v{d.version}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono-cyber text-[10px]">{d.status}</Badge>
                  {d.disabled && <Badge variant="destructive" className="font-mono-cyber text-[10px]">disabled</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Well-known */}
      <div className="rounded-lg neon-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-mono-cyber text-sm tracking-wide text-foreground/80 uppercase">
              .well-known/netherhost
            </h2>
          </div>
          {host.domain_cert && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchWellKnown(host.domain_cert!)}
              disabled={wellKnownLoading}
              className="gap-1.5 font-mono-cyber text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${wellKnownLoading ? "animate-spin" : ""}`} />
              Refrescar
            </Button>
          )}
        </div>

        {!host.domain_cert ? (
          <p className="text-sm text-muted-foreground py-2">
            Este host no tiene un dominio configurado. No se puede consultar el well-known.
          </p>
        ) : wellKnownLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : wellKnownError ? (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Error al consultar well-known: {wellKnownError}</span>
          </div>
        ) : wellKnown ? (
          <pre className="overflow-x-auto rounded-md bg-background/50 border border-border p-4 font-mono-cyber text-xs text-foreground leading-relaxed">
            {JSON.stringify(wellKnown, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            Pulsa "Refrescar" para consultar el endpoint.
          </p>
        )}
      </div>
    </main>
  );
};

function InfoRow({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</p>
      <p className={`text-foreground ${mono ? "font-mono-cyber text-xs break-all" : "text-sm"}`}>{value}</p>
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "hace unos segundos";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default HostDetail;
