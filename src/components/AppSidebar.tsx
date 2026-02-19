import { LayoutDashboard, Network, LogOut, PanelLeft, Settings, MessageSquare } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Swarms", url: "/app", icon: Network },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* Header */}
      <SidebarHeader className="p-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2 px-1"}`}>
          <Network className="h-5 w-5 shrink-0 text-primary" />
          {!collapsed && (
            <span className="font-mono-cyber text-sm tracking-wider text-foreground">NetherNet</span>
          )}
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                        collapsed ? "justify-center px-0" : ""
                      } ${
                        isActive
                          ? "bg-primary text-primary-foreground neon-glow"
                          : "text-foreground hover:bg-muted"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="font-mono-cyber text-xs">{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-2 space-y-1">
        <div className={`flex items-center ${collapsed ? "justify-center" : "px-2"}`}>
          <ThemeToggle />
        </div>

        <button
          onClick={toggleSidebar}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-foreground hover:bg-muted ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <PanelLeft className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-mono-cyber text-xs">Colapsar</span>}
        </button>

        <button
          onClick={() => navigate("/")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-foreground hover:bg-muted ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-mono-cyber text-xs">Cerrar sesión</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
