import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Server, ShieldCheck, ShieldX, Wifi, WifiOff, Plus, Copy, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

type Netherhost = Tables<"netherhosts">;

function generateClaimCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const Netherhosts = () => {
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Netherhost[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [claimExpires, setClaimExpires] = useState<Date | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleGenerateClaim = async () => {
    if (!user) return;
    setGenerating(true);
    const code = generateClaimCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min TTL

    const { error } = await supabase.from("host_claims").insert({
      created_by: user.id,
      code,
      expires_at: expires.toISOString(),
    });

    if (error) {
      toast.error("Error generando claim code");
    } else {
      setClaimCode(code);
      setClaimExpires(expires);
      toast.success("Claim code generado");
    }
    setGenerating(false);
  };

  const copyCode = () => {
    if (claimCode) {
      navigator.clipboard.writeText(claimCode);
      toast.success("Código copiado");
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">Netherhosts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Nodos de host conectados a la red</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setClaimCode(null); setClaimExpires(null); } }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 font-mono-cyber text-xs">
              <Plus className="h-4 w-4" /> Añadir Host
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono-cyber">Claim a Host</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Genera un código de un solo uso y pégalo en tu host para vincularlo a tu cuenta.
              </DialogDescription>
            </DialogHeader>

            {!claimCode ? (
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  El código expira en <strong>10 minutos</strong> y solo puede usarse una vez.
                </p>
                <Button onClick={handleGenerateClaim} disabled={generating} className="w-full gap-2 font-mono-cyber">
                  {generating ? "Generando..." : "Generar Claim Code"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={claimCode}
                    className="font-mono-cyber text-lg tracking-[0.3em] text-center text-primary"
                  />
                  <Button variant="outline" size="icon" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Expira: {claimExpires?.toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ejecuta en tu host: <code className="rounded bg-muted px-1.5 py-0.5 font-mono-cyber text-foreground">netherhost link --claim {claimCode}</code>
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

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
            No hay ningún nodo de host conectado. Usa "Añadir Host" para generar un claim code y vincular un nodo.
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
