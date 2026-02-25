import { useNavigate } from "react-router-dom";
import { ArrowRight, Cpu, Zap, Network } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pixel-grid">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div>
          <h1 className="font-mono-cyber text-xl tracking-wider text-foreground">
            NetherNet
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => navigate("/login")}
            className="rounded-md bg-primary px-5 py-2 font-mono-cyber text-sm text-primary-foreground transition-all hover:neon-glow"
          >
            Login →
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center px-6 pt-24 pb-32 md:pt-36">
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-lg neon-border bg-card">
          <Network className="h-8 w-8 text-primary animate-pulse-neon" />
        </div>

        <h2 className="font-mono-cyber text-center text-4xl tracking-tight text-foreground md:text-6xl">
          Nether<span className="text-primary neon-text">Net</span>
        </h2>
        <p className="mt-3 font-mono-cyber text-sm tracking-widest text-muted-foreground">
          A NETWORK OF DIGITAL WORKERS
        </p>

        <p className="mt-8 max-w-lg text-center text-lg leading-relaxed text-muted-foreground">
          Gestiona enjambres de agentes IA que trabajan 24/7 como empleados digitales para tu organización.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="group mt-10 flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-mono-cyber text-base text-primary-foreground transition-all hover:neon-glow"
        >
          Entrar al panel
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Features */}
        <div className="mt-24 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: Cpu, title: "Daemons", desc: "Agentes autónomos que ejecutan tareas en segundo plano" },
            { icon: Network, title: "Swarms", desc: "Organiza daemons en enjambres por proyecto o función" },
            { icon: Zap, title: "Always On", desc: "Monitoriza y gestiona tus trabajadores digitales 24/7" },
          ].map((f) => (
            <div key={f.title} className="rounded-lg neon-border bg-card p-6 text-center">
              <f.icon className="mx-auto mb-3 h-6 w-6 text-primary" />
              <h3 className="font-mono-cyber text-sm tracking-wide text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Landing;
