import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, ScrollText } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

interface Log {
  id: string;
  level: string;
  source: string;
  source_id: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_id: string;
}

const levelColor: Record<string, string> = {
  debug: "bg-muted text-muted-foreground",
  info: "bg-primary/20 text-primary",
  warning: "bg-[hsl(var(--neon-warning))/0.2] text-[hsl(var(--neon-warning))]",
  error: "bg-destructive/20 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

export default function AdminView() {
  const isAdmin = useIsAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const [p, l] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      if (p.data) setProfiles(p.data);
      if (l.data) setLogs(l.data as Log[]);
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/swarms" replace />;

  return (
    <div className="space-y-6 p-6">
      <h1 className="font-mono-cyber text-xl text-foreground neon-text">Panel de Administración</h1>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2 font-mono-cyber text-xs">
            <Users className="h-4 w-4" /> Usuarios
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 font-mono-cyber text-xs">
            <ScrollText className="h-4 w-4" /> Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {loading ? (
            <p className="text-muted-foreground text-sm">Cargando...</p>
          ) : (
            <div className="rounded-lg border border-border overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="font-mono-cyber text-xs text-muted-foreground">
                    <th className="text-left p-3">Username</th>
                    <th className="text-left p-3">Phone</th>
                    <th className="text-left p-3">Creado</th>
                    <th className="text-left p-3">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono-cyber">{p.username}</td>
                      <td className="p-3 text-muted-foreground">{p.phone ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-muted-foreground text-xs font-mono-cyber">{p.id.slice(0, 8)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs">
          {loading ? (
            <p className="text-muted-foreground text-sm">Cargando...</p>
          ) : (
            <div className="rounded-lg border border-border overflow-auto max-h-[70vh]">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr className="font-mono-cyber text-xs text-muted-foreground">
                    <th className="text-left p-3">Nivel</th>
                    <th className="text-left p-3">Fuente</th>
                    <th className="text-left p-3">Mensaje</th>
                    <th className="text-left p-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <Badge variant="outline" className={`font-mono-cyber text-[10px] ${levelColor[l.level] ?? ""}`}>
                          {l.level.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono-cyber text-xs">{l.source}</td>
                      <td className="p-3 text-muted-foreground max-w-md truncate">{l.message}</td>
                      <td className="p-3 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
