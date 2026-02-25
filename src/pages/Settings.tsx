import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

const Settings = () => {
  const { theme } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
      <h2 className="font-mono-cyber text-2xl tracking-wide text-foreground">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">Configuración de la aplicación</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg neon-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono-cyber text-sm tracking-wide text-foreground">Tema</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Actualmente usando el tema <span className="text-primary">{theme === "dark" ? "oscuro" : "claro"}</span>
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
