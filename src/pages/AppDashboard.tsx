import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { swarms as mockSwarms } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Network, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Swarm = Tables<"swarms">;

const AppDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [swarms, setSwarms] = useState<Swarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchSwarms = async () => {
    const { data } = await supabase
      .from("swarms")
      .select("*")
      .order("created_at", { ascending: false });
    setSwarms(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSwarms();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setCreating(true);
    const { error } = await supabase.from("swarms").insert({
      name: name.trim(),
      description: description.trim() || null,
      user_id: user.id,
    });
    setCreating(false);
    if (error) {
      toast.error("Error al crear el swarm");
      return;
    }
    toast.success("Swarm creado");
    setName("");
    setDescription("");
    setDialogOpen(false);
    fetchSwarms();
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">Swarms</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tus enjambres de daemons activos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5 font-mono-cyber text-xs">
          <Plus className="h-4 w-4" /> Nuevo Swarm
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : swarms.length === 0 ? (
        <div className="mt-16 text-center">
          <Network className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No tienes swarms todavía.</p>
          <Button variant="outline" className="mt-4 gap-1.5 font-mono-cyber text-xs" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Crear tu primer swarm
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {swarms.map((swarm) => (
            <button
              key={swarm.id}
              onClick={() => navigate(`/swarms/${swarm.id}`)}
              className="group rounded-lg neon-border bg-card p-5 text-left transition-all hover:neon-glow"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono-cyber text-sm tracking-wide text-foreground group-hover:text-primary transition-colors">
                  {swarm.name}
                </h3>
              </div>
              {swarm.description && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {swarm.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-mono-cyber">
                  {new Date(swarm.created_at).toLocaleDateString()}
                </span>
                <span className="text-xs text-muted-foreground">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mock Swarms */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-mono-cyber text-xs tracking-wide text-muted-foreground uppercase">Mockup / Demo</h3>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {mockSwarms.map((swarm) => {
            const statusColor =
              swarm.activeCount === swarm.daemonCount ? "bg-neon-success" :
              swarm.activeCount > 0 ? "bg-neon-warning" : "bg-neon-error";
            return (
              <button
                key={swarm.id}
                onClick={() => navigate(`/swarms/${swarm.id}`)}
                className="group relative rounded-lg neon-border bg-card p-5 text-left transition-all hover:neon-glow opacity-70"
              >
                <Badge variant="secondary" className="absolute top-2 right-2 font-mono-cyber text-[9px] gap-1">
                  <FlaskConical className="h-2.5 w-2.5" /> mockup
                </Badge>
                <div className="flex items-center justify-between">
                  <h3 className="font-mono-cyber text-sm tracking-wide text-foreground group-hover:text-primary transition-colors">
                    {swarm.name}
                  </h3>
                  <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {swarm.description}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="font-mono-cyber text-xs text-primary">{swarm.activeCount}/{swarm.daemonCount} activos</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono-cyber tracking-wide">Nuevo Swarm</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Crea un nuevo enjambre para organizar tus daemons.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nombre</label>
              <Input
                placeholder="Mi Swarm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-mono-cyber text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Descripción (opcional)</label>
              <Textarea
                placeholder="Describe el propósito de este swarm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || creating} className="gap-1.5 font-mono-cyber text-xs">
              {creating ? "Creando..." : "Crear Swarm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AppDashboard;
