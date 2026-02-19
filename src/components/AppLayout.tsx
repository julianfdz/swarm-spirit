import { Outlet, useNavigate } from "react-router-dom";
import { Network, ArrowLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const AppLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pixel-grid">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-primary" />
          <span className="font-mono-cyber text-lg tracking-wider text-foreground">NetherNet</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono-cyber text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Logout
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default AppLayout;
