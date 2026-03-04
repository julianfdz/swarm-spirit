import { useNavigate } from "react-router-dom";
import { ArrowRight, Cpu, Zap, Network, Server, ShieldCheck, Globe, Store, GitBranch, Layers, Clock, Bot, Workflow, Code2, Plug } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-12">
          <h1 className="font-mono-cyber text-lg tracking-wider text-foreground">
            Nether<span className="text-primary">Net</span>
          </h1>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="font-mono-cyber text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Características</a>
            <a href="#hosts" className="font-mono-cyber text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Netherhosts</a>
            <a href="#how" className="font-mono-cyber text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Cómo funciona</a>
            <a href="#marketplace" className="font-mono-cyber text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Marketplace</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => navigate("/login")}
              className="rounded-md bg-primary px-5 py-2 font-mono-cyber text-sm text-primary-foreground transition-all hover:neon-glow"
            >
              Acceder →
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-32 md:pb-36">
        <div className="absolute inset-0 pixel-grid opacity-40" />
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 h-56 w-56 rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono-cyber text-[11px] uppercase tracking-widest text-primary">Orquestación de agentes IA</span>
          </div>

          <h2 className="font-mono-cyber text-4xl leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Tu red de<br />
            <span className="text-primary neon-text">trabajadores digitales</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            NetherNet es la plataforma <strong className="text-foreground">agnóstica y open-source</strong> para
            desplegar, orquestar y monitorizar agentes de IA autónomos. Organiza tus
            daemons en enjambres, define flujos de trabajo y escala tu operación sin fricciones.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="group flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-mono-cyber text-base text-primary-foreground transition-all hover:neon-glow"
            >
              Empezar gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#how"
              className="flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 font-mono-cyber text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30"
            >
              Cómo funciona
            </a>
          </div>

          {/* Trust bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {["Agnóstico a LLMs", "Self-hosted o Cloud", "API REST abierta", "Event-driven"].map((t) => (
              <span key={t} className="font-mono-cyber text-[10px] uppercase tracking-widest text-muted-foreground/60">
                ◆ {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ QUÉ ES NETHERNET ═══════ */}
      <section id="features" className="border-t border-border bg-card/50 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="font-mono-cyber text-[10px] uppercase tracking-[0.2em] text-primary">Plataforma</span>
            <h3 className="mt-3 font-mono-cyber text-3xl tracking-tight text-foreground md:text-4xl">
              Todo lo que necesitas para gestionar agentes IA
            </h3>
            <p className="mt-4 mx-auto max-w-xl text-muted-foreground">
              Desde un solo daemon hasta cientos de agentes trabajando en equipo. NetherNet te da el control total.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bot, title: "Daemons", desc: "Agentes autónomos que ejecutan tareas continuamente. Define su comportamiento con Sigils — esquemas JSON declarativos con prompts, herramientas y salidas estructuradas." },
              { icon: Network, title: "Swarms (Enjambres)", desc: "Agrupa daemons por proyecto o función. Cada enjambre tiene su propio pool de tareas, flujo de eventos y monitorización en tiempo real." },
              { icon: Workflow, title: "Task Pool", desc: "Cola de trabajo inteligente con prioridades, reintentos, DLQ y tareas programadas (cron, interval, one-shot). Los daemons consumen tareas según sus capacidades." },
              { icon: Zap, title: "Event Stream", desc: "Bus de eventos en tiempo real entre daemons. Trazabilidad completa con correlation IDs para seguir el ciclo de vida de cada operación." },
              { icon: GitBranch, title: "Sigils", desc: "Esquemas JSON que definen qué es un daemon: nombre, versión, prompts, herramientas y salidas. Portables, versionables y compartibles entre equipos." },
              { icon: Clock, title: "Jobs Programados", desc: "Programa tareas recurrentes con expresiones cron o intervalos. Cada ejecución genera tareas hijas rastreables automáticamente." },
            ].map((f) => (
              <article key={f.title} className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/30 hover:neon-glow">
                <f.icon className="mb-4 h-6 w-6 text-primary" />
                <h4 className="font-mono-cyber text-sm tracking-wide text-foreground">{f.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ NETHERHOSTS ═══════ */}
      <section id="hosts" className="border-t border-border px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-mono-cyber text-[10px] uppercase tracking-[0.2em] text-primary">Infraestructura</span>
              <h3 className="mt-3 font-mono-cyber text-3xl tracking-tight text-foreground md:text-4xl">
                Netherhosts: tu infraestructura, tus reglas
              </h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Un <strong className="text-foreground">Netherhost</strong> es cualquier servidor — tu portátil, un VPS, un clúster Kubernetes —
                que ejecuta daemons y se conecta a la red NetherNet. Tú decides dónde corren tus agentes.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: Server, text: "Despliega en tu propia infraestructura o usa hosts comunitarios" },
                  { icon: ShieldCheck, text: "Tus datos nunca salen de tus servidores — zero trust by design" },
                  { icon: Globe, text: "Conecta hosts distribuidos geográficamente en una sola red" },
                  { icon: Plug, text: "API REST estándar — integra con cualquier stack tecnológico" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 font-mono-cyber text-[11px] leading-relaxed text-muted-foreground">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-neon-success animate-pulse" />
                <span className="text-neon-success uppercase text-[10px] tracking-wider">Online</span>
                <span className="ml-auto text-[9px] text-muted-foreground/50">netherhost-01.prod</span>
              </div>
              <pre className="overflow-x-auto text-foreground/80">{`{
  "host": "my-server.example.com",
  "daemons": 12,
  "swarms": 3,
  "status": "verified",
  "uptime": "99.97%",
  "tasks_processed": 48291,
  "avg_latency_ms": 42
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CÓMO FUNCIONA ═══════ */}
      <section id="how" className="border-t border-border bg-card/50 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="font-mono-cyber text-[10px] uppercase tracking-[0.2em] text-primary">Workflow</span>
            <h3 className="mt-3 font-mono-cyber text-3xl tracking-tight text-foreground md:text-4xl">
              De cero a enjambre en 4 pasos
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Registra un Host", desc: "Conecta cualquier servidor como Netherhost. Solo necesitas un token y la API." },
              { step: "02", title: "Define tus Daemons", desc: "Crea Sigils JSON con los prompts, herramientas y capacidades de cada agente." },
              { step: "03", title: "Crea un Swarm", desc: "Agrupa daemons en un enjambre. Asígnales tareas y define las reglas de orquestación." },
              { step: "04", title: "Monitoriza y escala", desc: "Observa el event stream, gestiona la task pool y programa jobs recurrentes." },
            ].map((s) => (
              <div key={s.step} className="relative rounded-lg border border-border bg-card p-6">
                <span className="font-mono-cyber text-3xl font-bold text-primary/20">{s.step}</span>
                <h4 className="mt-2 font-mono-cyber text-sm tracking-wide text-foreground">{s.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AGNÓSTICO ═══════ */}
      <section className="border-t border-border px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <span className="font-mono-cyber text-[10px] uppercase tracking-[0.2em] text-primary">Compatible</span>
          <h3 className="mt-3 font-mono-cyber text-3xl tracking-tight text-foreground md:text-4xl">
            Agnóstico a modelos y proveedores
          </h3>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            NetherNet no te ata a ningún LLM ni proveedor cloud. Tus daemons pueden usar OpenAI, Anthropic, Gemini,
            Llama local, Mistral, o cualquier API compatible. Cambia de modelo sin tocar la orquestación.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {["OpenAI", "Anthropic", "Google Gemini", "Llama / Ollama", "Mistral", "Groq", "Custom API"].map((p) => (
              <span key={p} className="rounded-full border border-border bg-card px-4 py-2 font-mono-cyber text-[11px] text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ MARKETPLACE ═══════ */}
      <section id="marketplace" className="border-t border-border bg-card/50 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-mono-cyber text-[10px] uppercase tracking-[0.2em] text-accent">Próximamente</span>
              <h3 className="mt-3 font-mono-cyber text-3xl tracking-tight text-foreground md:text-4xl">
                Marketplace de Daemons y Swarms
              </h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Publica tus daemons para que otros los utilicen o descubre agentes creados por la comunidad.
                Comparte enjambres completos como plantillas preconfiguradas.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: Store, text: "Publica y descubre daemons individuales o enjambres completos" },
                  { icon: Layers, text: "Plantillas de swarm preconfiguradas para casos de uso comunes" },
                  { icon: Code2, text: "Sigils compartibles — importa agentes con un click" },
                  { icon: ShieldCheck, text: "Sistema de reputación y verificación de publishers" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              {[
                { name: "scraper-universal", desc: "Scraper web agnóstico con detección automática de estructura", installs: "2.4k", status: "verified" },
                { name: "redactor-seo", desc: "Redactor de artículos optimizados para SEO con soporte multiidioma", installs: "1.8k", status: "verified" },
                { name: "soporte-multicanal", desc: "Agente de soporte que opera en email, chat y redes sociales", installs: "956", status: "community" },
              ].map((d) => (
                <div key={d.name} className="rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/30">
                  <div className="flex items-center justify-between">
                    <h5 className="font-mono-cyber text-sm text-foreground">{d.name}</h5>
                    <span className={`rounded-full px-2 py-0.5 font-mono-cyber text-[9px] uppercase ${
                      d.status === "verified" ? "bg-neon-success/15 text-neon-success" : "bg-muted text-muted-foreground"
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">{d.desc}</p>
                  <span className="mt-2 inline-block font-mono-cyber text-[10px] text-muted-foreground/60">⬇ {d.installs} installs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA FINAL ═══════ */}
      <section className="border-t border-border px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="font-mono-cyber text-3xl tracking-tight text-foreground md:text-4xl">
            Construye tu ejército de agentes IA
          </h3>
          <p className="mt-4 text-muted-foreground">
            Open-source. Self-hosted. Sin vendor lock-in. Empieza a orquestar tus daemons hoy.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-4 font-mono-cyber text-base text-primary-foreground transition-all hover:neon-glow"
          >
            Crear cuenta gratis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-border bg-card/30 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono-cyber text-xs text-muted-foreground">
            © 2026 NetherNet · A network of digital workers
          </span>
          <div className="flex items-center gap-6">
            <a href="#features" className="font-mono-cyber text-[10px] uppercase text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#hosts" className="font-mono-cyber text-[10px] uppercase text-muted-foreground hover:text-primary transition-colors">Hosts</a>
            <a href="#marketplace" className="font-mono-cyber text-[10px] uppercase text-muted-foreground hover:text-primary transition-colors">Marketplace</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
