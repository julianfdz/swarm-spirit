import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Bot,
  Info,
  FileJson,
  Radar,
  ScanSearch,
  Loader2,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Netherhost = Tables<"netherhosts">;
type HostDaemon = Tables<"host_daemons">;

interface WellKnownData {
  [key: string]: unknown;
}

interface RemoteDaemon {
  id?: string;
  name?: string;
  sigil_url?: string;
  invoke_url?: string;
  status_url?: string;
  [key: string]: unknown;
}

const HostDetail = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [host, setHost] = useState<Netherhost | null>(null);
  const [daemons, setDaemons] = useState<HostDaemon[]>([]);
  const [wellKnown, setWellKnown] = useState<WellKnownData | null>(null);
  const [wellKnownError, setWellKnownError] = useState<string | null>(null);
  const [agentCard, setAgentCard] = useState<WellKnownData | null>(null);
  const [agentCardError, setAgentCardError] = useState<string | null>(null);
  const [remoteDaemons, setRemoteDaemons] = useState<RemoteDaemon[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<"unknown" | "alive" | "dead">("unknown");
  const [healthVersion, setHealthVersion] = useState<string | null>(null);
  const [rescanning, setRescanning] = useState(false);

  const API_URL = import.meta.env.VITE_NETHERNET_API_URL;

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

  const refreshDaemons = useCallback(async () => {
    if (!hostId) return;
    const { data } = await supabase
      .from("host_daemons")
      .select("*")
      .eq("host_id", hostId)
      .order("updated_at", { ascending: false });
    setDaemons(data ?? []);
  }, [hostId]);

  const rescanHost = async () => {
    if (!hostId || !session?.access_token || !API_URL) return;
    setRescanning(true);
    try {
      const res = await fetch(`${API_URL}/hosts/${hostId}/rescan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: "{}",
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({ title: "Scan lanzado", description: "Los daemons se actualizarán en segundos." });
      // Wait a bit then refresh
      setTimeout(() => refreshDaemons(), 3000);
    } catch (err: unknown) {
      toast({ title: "Error al escanear", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
    } finally {
      setRescanning(false);
    }
  };

  const buildUrl = (baseUrl: string, path: string) => {
    const normalized = baseUrl.replace(/\/+$/, "");
    const base = normalized.startsWith("http") ? normalized : `https://${normalized}`;
    return `${base}${path}`;
  };

  const scanHost = async () => {
    if (!host?.host_url) return;
    setScanning(true);
    setWellKnownError(null);
    setAgentCardError(null);
    setHealthStatus("unknown");
    setHealthVersion(null);

    // Health check first
    try {
      const healthUrl = buildUrl(host.host_url, "/api/v1/health");
      const hRes = await fetch(healthUrl, { signal: AbortSignal.timeout(8000) });
      if (!hRes.ok) throw new Error(`HTTP ${hRes.status}`);
      const hJson = await hRes.json();
      const alive = hJson?.ok === true && hJson?.data?.status === "alive";
      setHealthStatus(alive ? "alive" : "dead");
      setHealthVersion(hJson?.data?.version ?? null);
      if (!alive) {
        setScanning(false);
        setScanned(true);
        return; // Host down, skip further scanning
      }
    } catch {
      setHealthStatus("dead");
      setScanning(false);
      setScanned(true);
      return;
    }

    // Fetch netherportal.json
    try {
      const url = buildUrl(host.host_url, "/.well-known/netherportal.json");
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setWellKnown(json);
      const index = Array.isArray(json?.daemon_index) ? json.daemon_index : [];
      setRemoteDaemons(index as RemoteDaemon[]);
    } catch (err: unknown) {
      setWellKnownError(err instanceof Error ? err.message : "No se pudo conectar");
      setRemoteDaemons([]);
    }

    // Fetch agent.json
    try {
      const url = buildUrl(host.host_url, "/.well-known/agent.json");
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAgentCard(await res.json());
    } catch (err: unknown) {
      setAgentCardError(err instanceof Error ? err.message : "No se pudo conectar");
    }

    setScanning(false);
    setScanned(true);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10 md:px-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-lg" />
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
  const heartbeatAgo = host.last_heartbeat ? timeAgo(new Date(host.last_heartbeat)) : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 md:px-12 space-y-6">
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
                isOnline ? "border-neon-success/40 text-neon-success" : "text-muted-foreground"
              }`}
            >
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {healthStatus !== "unknown" && (
              <Badge
                variant="outline"
                className={`gap-1 font-mono-cyber text-xs ${
                  healthStatus === "alive"
                    ? "border-neon-success/40 text-neon-success"
                    : "border-destructive/40 text-destructive"
                }`}
              >
                <span className={`inline-block h-2 w-2 rounded-full ${
                  healthStatus === "alive"
                    ? "bg-neon-success shadow-[0_0_6px_hsl(var(--neon-success))]"
                    : "bg-destructive shadow-[0_0_6px_hsl(var(--destructive))]"
                }`} />
                {healthStatus === "alive" ? `Healthy${healthVersion ? ` v${healthVersion}` : ""}` : "Unreachable"}
              </Badge>
            )}
            {host.host_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={scanHost}
                disabled={scanning}
                className="gap-1.5 font-mono-cyber text-xs border-primary/30 hover:border-primary/60 hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
              >
                <Radar className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
                {scanning ? "Scanning…" : "Scan Host"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full justify-start bg-card border border-border">
          <TabsTrigger value="info" className="gap-1.5 font-mono-cyber text-xs">
            <Info className="h-3.5 w-3.5" /> Info
          </TabsTrigger>
          <TabsTrigger value="daemons" className="gap-1.5 font-mono-cyber text-xs">
            <Bot className="h-3.5 w-3.5" /> Daemons
            {remoteDaemons.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[9px] font-mono-cyber">
                {remoteDaemons.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="a2a" className="gap-1.5 font-mono-cyber text-xs">
            <FileJson className="h-3.5 w-3.5" /> Raw A2A
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info">
          <div className="rounded-lg neon-border bg-card p-6 space-y-4">
            <h2 className="font-mono-cyber text-sm tracking-wide text-foreground/80 uppercase">Información del Host</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow label="ID" value={host.id} mono />
              <InfoRow label="Host URL" value={host.host_url ?? "—"} mono />
              <InfoRow label="Dominio / Cert" value={host.domain_cert ?? "—"} />
              <InfoRow label="Creado" value={new Date(host.created_at).toLocaleString()} />
              <InfoRow
                label="Último heartbeat"
                value={heartbeatAgo ? `${heartbeatAgo} (${new Date(host.last_heartbeat!).toLocaleString()})` : "Nunca"}
                icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
              />
            </div>
          </div>
        </TabsContent>

        {/* Daemons Tab */}
        <TabsContent value="daemons">
          <div className="space-y-6">
            {/* Rescan button */}
            {host.host_url && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Usa <span className="text-primary font-mono-cyber">Rescan</span> para sincronizar los daemons del host desde la API.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rescanHost}
                  disabled={rescanning}
                  className="gap-1.5 font-mono-cyber text-xs border-primary/30 hover:border-primary/60 hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                >
                  {rescanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5" />}
                  {rescanning ? "Escaneando…" : "Rescan Daemons"}
                </Button>
              </div>
            )}

            {/* DB registered daemons */}
            <div className="rounded-lg neon-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-mono-cyber text-sm tracking-wide text-foreground/80 uppercase flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Daemons en Host ({daemons.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={refreshDaemons} className="gap-1 font-mono-cyber text-[10px] h-7">
                  <RefreshCw className="h-3 w-3" /> Refrescar
                </Button>
              </div>
              {daemons.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No hay daemons registrados para este host. Usa <span className="text-primary font-mono-cyber">Rescan</span> para descubrirlos.
                </p>
              ) : (
                <div className="space-y-2">
                  {daemons.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-md bg-background/50 px-4 py-3 border border-border hover:border-primary/30 transition-colors">
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

            {/* Remote daemons from daemon_index */}
            {scanned && remoteDaemons.length > 0 && (
              <div className="rounded-lg neon-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <h2 className="font-mono-cyber text-sm tracking-wide text-foreground/80 uppercase">
                    Remote Daemon Index ({remoteDaemons.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {remoteDaemons.map((rd, i) => (
                    <DaemonMiniCard key={rd.id ?? i} daemon={rd} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Raw A2A Tab */}
        <TabsContent value="a2a">
          <div className="space-y-6">
            {!host.host_url ? (
              <div className="rounded-lg neon-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  Este host no tiene una URL configurada. No se pueden consultar los endpoints A2A.
                </p>
              </div>
            ) : !scanned ? (
              <div className="rounded-lg neon-border bg-card p-6">
                <p className="text-xs text-muted-foreground">
                  Pulsa <span className="text-primary font-mono-cyber">"Scan Host"</span> para consultar los endpoints.
                </p>
              </div>
            ) : (
              <>
                {/* netherportal.json */}
                <EndpointCard
                  title="GET /.well-known/netherportal.json"
                  subtitle="Host index for Pull registration"
                  icon={<Globe className="h-4 w-4 text-primary" />}
                  data={wellKnown}
                  error={wellKnownError}
                />

                {/* agent.json */}
                <EndpointCard
                  title="GET /.well-known/agent.json"
                  subtitle="A2A AgentCard for this host"
                  icon={<FileJson className="h-4 w-4 text-primary" />}
                  data={agentCard}
                  error={agentCardError}
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

/* ── Sub-components ── */

function DaemonMiniCard({ daemon }: { daemon: RemoteDaemon }) {
  const name = daemon.name ?? daemon.id ?? "unknown";
  const id = daemon.id ?? "—";

  return (
    <div className="group relative rounded-lg border border-border bg-background/50 p-4 transition-all hover:border-primary/40 hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-md border border-primary/20 bg-primary/5 p-2">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-mono-cyber text-xs tracking-wide text-foreground truncate">{name}</h4>
          <p className="font-mono-cyber text-[10px] text-muted-foreground mt-0.5 truncate" title={id}>
            {id}
          </p>
          {daemon.sigil_url && (
            <p className="text-[9px] text-primary/50 mt-1 truncate font-mono-cyber" title={daemon.sigil_url}>
              sigil → {daemon.sigil_url}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EndpointCard({
  title,
  subtitle,
  icon,
  data,
  error,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data: WellKnownData | null;
  error: string | null;
}) {
  return (
    <div className="rounded-lg neon-border bg-card p-6 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h3 className="font-mono-cyber text-xs tracking-wide text-foreground">{title}</h3>
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error: {error}</span>
        </div>
      ) : data ? (
        <pre className="overflow-x-auto rounded-md bg-background/50 border border-border p-4 font-mono-cyber text-xs text-foreground leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="text-xs text-muted-foreground py-2">Sin datos.</p>
      )}
    </div>
  );
}

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
