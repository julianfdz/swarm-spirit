import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const API_URL = import.meta.env.VITE_NETHERNET_API_URL || "https://nethernet-api.buhosuite.com/api/v1";

const eventSchema = z.object({
  type: z.string().trim().min(1, "Type es obligatorio").max(100),
  message: z.string().trim().max(500).default(""),
  swarm_id: z.string().uuid().optional(),
  source_daemon_id: z.string().uuid().optional(),
  payload: z.record(z.unknown()).default({}),
});

interface Props {
  swarmId?: string;
  onCreated?: () => void;
}

const EmitEventDialog = ({ swarmId, onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [sourceDaemonId, setSourceDaemonId] = useState("");
  const [payloadStr, setPayloadStr] = useState("{}");
  const [hosts, setHosts] = useState<{ id: string; name: string; token: string | null }[]>([]);
  const [selectedHostId, setSelectedHostId] = useState("");

  useEffect(() => {
    if (!open) return;
    supabase.from("netherhosts").select("id, name, token").then(({ data }) => {
      if (data) {
        setHosts(data);
        if (data.length > 0 && !selectedHostId) setSelectedHostId(data[0].id);
      }
    });
  }, [open]);

  const reset = () => {
    setType("");
    setMessage("");
    setSourceDaemonId("");
    setPayloadStr("{}");
  };

  const handleSubmit = async () => {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      toast({ title: "Payload inválido", description: "El JSON del payload no es válido", variant: "destructive" });
      return;
    }

    const raw = {
      type: type.trim(),
      message: message.trim(),
      ...(swarmId ? { swarm_id: swarmId } : {}),
      ...(sourceDaemonId.trim() ? { source_daemon_id: sourceDaemonId.trim() } : {}),
      payload,
    };

    const result = eventSchema.safeParse(raw);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(", ");
      toast({ title: "Validación", description: msg, variant: "destructive" });
      return;
    }

    const selectedHost = hosts.find((h) => h.id === selectedHostId);
    if (!selectedHost?.token) {
      toast({ title: "Sin token", description: "El host seleccionado no tiene token asignado", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${selectedHost.token}`,
        },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }

      toast({ title: "Evento emitido", description: `Type: ${result.data.type}` });
      reset();
      setOpen(false);
      onCreated?.();
    } catch (e: any) {
      toast({ title: "Error al emitir evento", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono-cyber text-[10px] uppercase gap-1">
          <Plus className="h-3 w-3" /> Emitir Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono-cyber text-sm tracking-wider text-primary">Emitir Evento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Host selector */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Host (auth) *</Label>
            {hosts.length === 0 ? (
              <p className="font-mono-cyber text-[10px] text-neon-error">No hay hosts disponibles.</p>
            ) : (
              <Select value={selectedHostId} onValueChange={setSelectedHostId}>
                <SelectTrigger className="font-mono-cyber text-xs h-8">
                  <SelectValue placeholder="Selecciona host" />
                </SelectTrigger>
                <SelectContent>
                  {hosts.map((h) => (
                    <SelectItem key={h.id} value={h.id} className="font-mono-cyber text-xs">
                      {h.name} {h.token ? "" : "(sin token)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Type *</Label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="task.completed"
              className="font-mono-cyber text-xs h-8"
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Message</Label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descripción breve del evento"
              className="font-mono-cyber text-xs h-8"
              maxLength={500}
            />
          </div>

          {/* Swarm ID (read-only) */}
          {swarmId && (
            <div className="space-y-1.5">
              <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Swarm ID</Label>
              <Input value={swarmId} disabled className="font-mono-cyber text-xs h-8 opacity-60" />
            </div>
          )}

          {/* Source Daemon ID */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Source Daemon ID (opcional)</Label>
            <Input
              value={sourceDaemonId}
              onChange={(e) => setSourceDaemonId(e.target.value)}
              placeholder="uuid del daemon"
              className="font-mono-cyber text-xs h-8"
            />
          </div>

          {/* Payload */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Payload (JSON)</Label>
            <Textarea
              value={payloadStr}
              onChange={(e) => setPayloadStr(e.target.value)}
              placeholder='{"key": "value"}'
              className="font-mono-cyber text-xs min-h-[80px] resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full font-mono-cyber text-xs uppercase tracking-wider"
          >
            {loading ? "Enviando..." : "Emitir Evento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmitEventDialog;
