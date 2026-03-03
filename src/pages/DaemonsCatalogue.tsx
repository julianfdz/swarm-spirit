import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Server, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Daemon = Tables<"daemons">;
type HostDaemon = Tables<"host_daemons">;

interface HostDaemonWithHost extends HostDaemon {
  netherhosts?: { name: string } | null;
  daemons?: { name: string } | null;
}

const DaemonsCatalogue = () => {
  const [daemons, setDaemons] = useState<Daemon[]>([]);
  const [hostDaemons, setHostDaemons] = useState<HostDaemonWithHost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: d }, { data: hd }] = await Promise.all([
      supabase.from("daemons").select("*").is("deleted_at", null).order("updated_at", { ascending: false }),
      supabase.from("host_daemons").select("*, netherhosts(name), daemons(name)").order("updated_at", { ascending: false }),
    ]);
    setDaemons(d ?? []);
    setHostDaemons((hd as HostDaemonWithHost[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const statusColor = (s: string) => {
    if (s === "running") return "border-neon-success/40 text-neon-success";
    if (s === "stopped" || s === "error") return "border-destructive/40 text-destructive";
    return "text-muted-foreground";
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono-cyber text-2xl tracking-wide text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Catálogo de Daemons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todos tus daemons registrados y sus despliegues en hosts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} className="gap-1.5 font-mono-cyber text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refrescar
        </Button>
      </div>

      <Tabs defaultValue="daemons" className="w-full">
        <TabsList className="w-full justify-start bg-card border border-border">
          <TabsTrigger value="daemons" className="gap-1.5 font-mono-cyber text-xs">
            <Bot className="h-3.5 w-3.5" /> Daemons
            {daemons.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[9px] font-mono-cyber">{daemons.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="host_daemons" className="gap-1.5 font-mono-cyber text-xs">
            <Server className="h-3.5 w-3.5" /> Host Daemons
            {hostDaemons.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[9px] font-mono-cyber">{hostDaemons.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Daemons Tab */}
        <TabsContent value="daemons">
          <div className="rounded-lg neon-border bg-card p-6 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
              </div>
            ) : daemons.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No tienes daemons registrados.</p>
            ) : (
              <div className="space-y-2">
                {daemons.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-md bg-background/50 px-4 py-3 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-md border border-primary/20 bg-primary/5 p-2 shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono-cyber text-xs text-foreground truncate">{d.name}</p>
                        {d.description && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{d.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="font-mono-cyber text-[10px] gap-1">
                        {d.visibility === "public" ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                        {d.visibility}
                      </Badge>
                      <span className="font-mono-cyber text-[9px] text-muted-foreground">{new Date(d.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Host Daemons Tab */}
        <TabsContent value="host_daemons">
          <div className="rounded-lg neon-border bg-card p-6 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
              </div>
            ) : hostDaemons.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No hay daemons desplegados en ningún host.</p>
            ) : (
              <div className="space-y-2">
                {hostDaemons.map((hd) => (
                  <div key={hd.id} className="flex items-center justify-between rounded-md bg-background/50 px-4 py-3 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${hd.status === "running" ? "bg-neon-success" : hd.status === "stopped" ? "bg-destructive" : "bg-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="font-mono-cyber text-xs text-foreground truncate">
                          {hd.daemon_ref ?? hd.daemons?.name ?? hd.daemon_id}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          Host: {hd.netherhosts?.name ?? hd.host_id}
                          {hd.version && ` · v${hd.version}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`font-mono-cyber text-[10px] ${statusColor(hd.status)}`}>
                        {hd.status}
                      </Badge>
                      {hd.disabled && <Badge variant="destructive" className="font-mono-cyber text-[10px]">disabled</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default DaemonsCatalogue;
