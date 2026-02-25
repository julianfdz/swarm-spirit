import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Network, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = "login" | "register";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username, phone },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Cuenta creada",
          description: "Revisa tu correo para confirmar tu cuenta.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/swarms");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono-cyber";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background pixel-grid px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg neon-border bg-card">
            <Network className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-mono-cyber text-2xl tracking-wider text-foreground">
            Nether<span className="text-primary neon-text">Net</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-border">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 font-mono-cyber text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors ${
                mode === m
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="mb-1 block font-mono-cyber text-[10px] uppercase tracking-wider text-muted-foreground">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="daemon_master"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block font-mono-cyber text-[10px] uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block font-mono-cyber text-[10px] uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block font-mono-cyber text-[10px] uppercase tracking-wider text-muted-foreground">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-2.5 font-mono-cyber text-sm text-primary-foreground transition-all hover:neon-glow disabled:opacity-50"
          >
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "Entrar →"
              : "Crear cuenta →"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-6 block w-full text-center font-mono-cyber text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Login;
