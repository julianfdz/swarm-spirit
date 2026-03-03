import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const API_URL = import.meta.env.VITE_NETHERNET_API_URL || "https://nethernet-api.buhosuite.com/api/v1";

const taskSchema = z.object({
  topic: z.string().trim().min(1, "Topic es obligatorio").max(100),
  label: z.string().trim().min(1, "Label es obligatorio").max(200),
  swarm_id: z.string().uuid().optional(),
  daemon_id: z.string().uuid().optional(),
  method: z.string().default("tasks/send"),
  payload: z.record(z.unknown()).default({}),
  source: z.string().default("nethernet"),
});

interface Props {
  swarmId?: string;
  onCreated?: () => void;
}

const METHODS = ["tasks/send", "tasks/sendSubscribe", "tasks/pushNotification"];
const SOURCES = ["nethernet", "manual", "api", "webhook"];

const CreateTaskDialog = ({ swarmId, onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [label, setLabel] = useState("");
  const [daemonId, setDaemonId] = useState("");
  const [method, setMethod] = useState("tasks/send");
  const [source, setSource] = useState("manual");
  const [payloadStr, setPayloadStr] = useState("{}");

  const reset = () => {
    setTopic("");
    setLabel("");
    setDaemonId("");
    setMethod("tasks/send");
    setSource("manual");
    setPayloadStr("{}");
  };

  const handleSubmit = async () => {
    // Parse payload
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      toast({ title: "Payload inválido", description: "El JSON del payload no es válido", variant: "destructive" });
      return;
    }

    const raw = {
      topic: topic.trim(),
      label: label.trim(),
      ...(swarmId ? { swarm_id: swarmId } : {}),
      ...(daemonId.trim() ? { daemon_id: daemonId.trim() } : {}),
      method,
      payload,
      source,
    };

    const result = taskSchema.safeParse(raw);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(", ");
      toast({ title: "Validación", description: msg, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }

      toast({ title: "Task creada", description: `Topic: ${result.data.topic}` });
      reset();
      setOpen(false);
      onCreated?.();
    } catch (e: any) {
      toast({ title: "Error al crear task", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono-cyber text-[10px] uppercase gap-1">
          <Plus className="h-3 w-3" /> Nueva Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono-cyber text-sm tracking-wider text-primary">Crear Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Topic (maps to "type" in DB) */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Topic *</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="news.scrape"
              className="font-mono-cyber text-xs h-8"
              maxLength={100}
            />
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Label *</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Scrape La Verdad RSS"
              className="font-mono-cyber text-xs h-8"
              maxLength={200}
            />
          </div>

          {/* Swarm ID (read-only if passed) */}
          {swarmId && (
            <div className="space-y-1.5">
              <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Swarm ID</Label>
              <Input value={swarmId} disabled className="font-mono-cyber text-xs h-8 opacity-60" />
            </div>
          )}

          {/* Daemon ID (optional) */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Daemon ID (opcional)</Label>
            <Input
              value={daemonId}
              onChange={(e) => setDaemonId(e.target.value)}
              placeholder="uuid del daemon"
              className="font-mono-cyber text-xs h-8"
            />
          </div>

          {/* Method + Source row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="font-mono-cyber text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m} className="font-mono-cyber text-xs">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="font-mono-cyber text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s} className="font-mono-cyber text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payload */}
          <div className="space-y-1.5">
            <Label className="font-mono-cyber text-[10px] uppercase text-muted-foreground">Payload (JSON)</Label>
            <Textarea
              value={payloadStr}
              onChange={(e) => setPayloadStr(e.target.value)}
              placeholder='{"url": "https://..."}'
              className="font-mono-cyber text-xs min-h-[80px] resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full font-mono-cyber text-xs uppercase tracking-wider"
          >
            {loading ? "Enviando..." : "Crear Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
