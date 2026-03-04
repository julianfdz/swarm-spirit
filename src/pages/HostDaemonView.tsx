import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Bot, Eye, EyeOff, Server, Hash, Globe, Clock, Calendar,
  Link as LinkIcon, RefreshCw, Loader2, ScanSearch, Play, Square, RotateCw, Send,
} from "lucide-react";
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

type HostDaemon = Tables<"host_daemons"> & {
  netherhosts?: { name: string; host_url: string | null } | null;
};

type Tab = "info" | "sigil" | "capabilities" | "urls" | "status";

// Simple in-memory cache for avatar URLs
const avatarCache = new Map<string, string>();

const HostDaemonView = () => {
  const { daemonId } = useParams<{ daemonId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [daemon, setDaemon] = useState<HostDaemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("info");
  const [sigilData, setSigilData] = useState<Record<string, unknown> | null>(null);
  const [sigilLoading, setSigilLoading] = useState(false);
  const [cachedAvatarSrc, setCachedAvatarSrc] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Fetch daemon data
  useEffect(() => {
    if (!daemonId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("host_daemons")
        .select("*, netherhosts(name, host_url)")
        .eq("id", daemonId)
        .single();
      if (error || !data) {
        setDaemon(null);
      } else {
        setDaemon(data as HostDaemon);
      }
      setLoading(false);
    })();
  }, [daemonId]);

  // Resolve avatar_url (may be relative to host)
  const resolvedAvatarUrl = useMemo(() => {
    if (!daemon?.avatar_url) return null;
    const raw = daemon.avatar_url;
    // Already absolute
    if (/^https?:\/\//i.test(raw)) return raw;
    // Relative path → prepend host_url
    const hostBase = daemon.netherhosts?.host_url?.replace(/\/+$/, "") ?? "";
    const full = hostBase ? `${hostBase}${raw.startsWith("/") ? "" : "/"}${raw}` : null;
    return full ? encodeURI(decodeURI(full)) : null;
  }, [daemon?.avatar_url, daemon?.netherhosts?.host_url]);

  // Avatar: fetch from avatar_url, cache as blob URL
  useEffect(() => {
    if (!daemon) return;
    const url = resolvedAvatarUrl;
    if (!url) { setCachedAvatarSrc(null); return; }

    // Check cache
    if (avatarCache.has(url)) {
      setCachedAvatarSrc(avatarCache.get(url)!);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        avatarCache.set(url, blobUrl);
        if (!cancelled) setCachedAvatarSrc(blobUrl);
      } catch {
        if (!cancelled) setAvatarError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [resolvedAvatarUrl]);

  // Determine final avatar source
  const avatarSrc = cachedAvatarSrc ?? null;
  const isVideo = resolvedAvatarUrl
    ? /\.(mp4|webm|mov|ogg)(\?|$)/i.test(resolvedAvatarUrl)
    : false;
  const placeholderSrc = useMemo(
    () => placeholders[Math.abs((daemonId ?? "").charCodeAt(0)) % placeholders.length],
    [daemonId]
  );

  const scanSigil = async () => {
    if (!daemon?.sigil_url) {
      toast({ title: "Sin sigil_url", description: "Este daemon no tiene una URL de sigil configurada.", variant: "destructive" });
      return;
    }
    setSigilLoading(true);
    try {
      const res = await fetch(daemon.sigil_url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSigilData(json);
      toast({ title: "Sigil escaneado", description: "Se ha obtenido la definición del daemon correctamente." });
    } catch (err: any) {
      toast({ title: "Error al escanear sigil", description: err.message, variant: "destructive" });
    } finally {
      setSigilLoading(false);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const statusStyles: Record<string, string> = {
    running: "bg-neon-success/15 text-neon-success",
    stopped: "bg-neon-error/15 text-neon-error",
    unknown: "bg-muted text-muted-foreground",
  };

  const statusDot: Record<string, string> = {
    running: "bg-neon-success animate-pulse-neon",
    stopped: "bg-neon-error",
    unknown: "bg-muted-foreground",
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Info" },
    { key: "capabilities", label: "Capabilities" },
    { key: "urls", label: "URLs" },
    { key: "sigil", label: "Sigil" },
    { key: "status", label: "Estado" },
  ];

  if (loading) {
    return (
      <div className="flex h-full flex-col md:flex-row overflow-hidden">
        <div className="flex shrink-0 items-center justify-center border-b border-border bg-card p-8 md:w-1/3 md:border-b-0 md:border-r">
          <Skeleton className="h-48 w-48 rounded-sm md:h-64 md:w-64" />
        </div>
        <div className="flex flex-1 flex-col p-6 md:p-10 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!daemon) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <p className="font-mono-cyber text-muted-foreground">Daemon no encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      {/* Left: Avatar */}
      <div className="flex shrink-0 items-center justify-center border-b border-border bg-card p-8 md:w-1/3 md:border-b-0 md:border-r">
        {avatarSrc && !avatarError ? (
          isVideo ? (
            <video
              src={avatarSrc}
              className="h-48 w-48 rounded-sm object-cover md:h-64 md:w-64"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={avatarSrc}
              alt={daemon.name}
              className="h-48 w-48 rounded-sm object-cover md:h-64 md:w-64"
              onError={() => setAvatarError(true)}
            />
          )
        ) : (
          <img
            src={placeholderSrc}
            alt={daemon.name}
            className="h-48 w-48 rounded-sm object-cover md:h-64 md:w-64"
          />
        )}
      </div>

      {/* Right: Info */}
      <div className="flex flex-1 flex-col p-6 md:p-10 overflow-hidden">
        <button
          onClick={() => navigate("/daemons")}
          className="mb-6 self-start font-mono-cyber text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Volver al catálogo
        </button>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">{daemon.name}</h2>
          <span className={`rounded-full px-2 py-0.5 font-mono-cyber text-[10px] uppercase tracking-wider ${statusStyles[daemon.status] ?? statusStyles.unknown}`}>
            {daemon.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{daemon.description || "Sin descripción"}</p>
        <p className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
          <Server className="h-3 w-3" />
          {daemon.netherhosts?.name ?? daemon.host_id}
          {daemon.version && <> · v{daemon.version}</>}
          · Actualizado {formatDate(daemon.updated_at)}
        </p>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-2 font-mono-cyber text-xs tracking-wide transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoBlock icon={<Hash className="h-3.5 w-3.5" />} label="ID" value={daemon.id} mono />
                <InfoBlock icon={<Hash className="h-3.5 w-3.5" />} label="Host ID" value={daemon.host_id} mono />
                <InfoBlock icon={<Globe className="h-3.5 w-3.5" />} label="Daemon Ref" value={daemon.daemon_ref ?? "—"} mono />
                <InfoBlock icon={<Hash className="h-3.5 w-3.5" />} label="Version" value={daemon.version ?? "—"} />
                <InfoBlock
                  icon={daemon.visibility === "public" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  label="Visibilidad"
                  value={daemon.visibility}
                />
                <InfoBlock icon={<Calendar className="h-3.5 w-3.5" />} label="Actualizado" value={formatDate(daemon.updated_at)} />
                {daemon.last_seen_at && (
                  <InfoBlock icon={<Clock className="h-3.5 w-3.5" />} label="Último contacto" value={formatDate(daemon.last_seen_at)} />
                )}
              </div>

              {/* Host info */}
              <div className="rounded-md neon-border bg-card p-4">
                <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-primary">Host</span>
                <div className="mt-1 space-y-1">
                  <p className="font-mono-cyber text-xs text-foreground/80 flex items-center gap-1.5">
                    <Server className="h-3 w-3 text-muted-foreground" />
                    {daemon.netherhosts?.name ?? "—"}
                  </p>
                  {daemon.netherhosts?.host_url && (
                    <p className="font-mono-cyber text-[10px] text-muted-foreground break-all">{daemon.netherhosts.host_url}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "capabilities" && (
            <div>
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">Capabilities</h3>
              {daemon.capabilities && Object.keys(daemon.capabilities as object).length > 0 ? (
                <div className="rounded-md neon-border bg-card p-4 overflow-x-auto">
                  <pre className="font-mono-cyber text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {JSON.stringify(daemon.capabilities, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="rounded-md neon-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground italic">Sin capabilities configuradas</p>
                </div>
              )}

              {/* sigil_json stored in DB */}
              {daemon.sigil_json && (
                <>
                  <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3 mt-6">Sigil JSON (almacenado)</h3>
                  <div className="rounded-md neon-border bg-card p-4 overflow-x-auto">
                    <pre className="font-mono-cyber text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
                      {JSON.stringify(daemon.sigil_json, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "urls" && (
            <div className="space-y-3">
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-3">Service URLs</h3>
              <div className="rounded-md neon-border bg-card p-4 space-y-3">
                <UrlRow label="Invoke" url={daemon.invoke_url} />
                <UrlRow label="Status" url={daemon.status_url} />
                <UrlRow label="Sigil" url={daemon.sigil_url} />
                <UrlRow label="MCP" url={daemon.mcp_url} />
                <UrlRow label="Avatar" url={daemon.avatar_url} />
              </div>
            </div>
          )}

          {tab === "sigil" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary">Sigil · Agent Blueprint</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Escanea el endpoint sigil_url del daemon para obtener su definición completa en tiempo real.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scanSigil}
                  disabled={sigilLoading || !daemon.sigil_url}
                  className="gap-1.5 font-mono-cyber text-xs"
                >
                  {sigilLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5" />}
                  Scan Sigil
                </Button>
              </div>

              {!daemon.sigil_url && (
                <div className="rounded-md neon-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    Este daemon no tiene sigil_url configurada. No se puede escanear su definición remotamente.
                  </p>
                </div>
              )}

              {sigilData && (
                <div className="rounded-md neon-border bg-card p-4 overflow-x-auto">
                  <pre className="font-mono-cyber text-xs leading-relaxed text-foreground/80 whitespace-pre">
                    {JSON.stringify(sigilData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Fallback: show stored sigil_json if no scan yet */}
              {!sigilData && daemon.sigil_json && (
                <>
                  <p className="text-xs text-muted-foreground mb-3 italic">Mostrando sigil_json almacenado en base de datos:</p>
                  <div className="rounded-md neon-border bg-card p-4 overflow-x-auto">
                    <pre className="font-mono-cyber text-xs leading-relaxed text-foreground/80 whitespace-pre">
                      {JSON.stringify(daemon.sigil_json, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "status" && (
            <div>
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-primary mb-4">Estado actual</h3>
              <div className="rounded-md neon-border bg-card p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-3 w-3 rounded-full ${statusDot[daemon.status] ?? statusDot.unknown}`} />
                  <span className="font-mono-cyber text-lg text-foreground uppercase tracking-wide">{daemon.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Último contacto</span>
                    <p className="font-mono-cyber text-foreground">{formatDate(daemon.last_seen_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Host</span>
                    <p className="font-mono-cyber text-foreground">{daemon.netherhosts?.name ?? daemon.host_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Disabled</span>
                    <p className="font-mono-cyber text-foreground">{daemon.disabled ? "Sí" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visibilidad</span>
                    <p className="font-mono-cyber text-foreground">{daemon.visibility}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
    <span className="font-mono-cyber text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
    {url ? (
      <span className="font-mono-cyber text-xs text-foreground/80 break-all">{url}</span>
    ) : (
      <span className="text-xs text-muted-foreground italic">—</span>
    )}
  </div>
);

export default HostDaemonView;
