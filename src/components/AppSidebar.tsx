import { Network, LogOut, PanelLeft, Settings, Server, Shield, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

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
  { title: "Hosts", url: "/hosts", icon: Server },
  { title: "Swarms", url: "/swarms", icon: Network },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isAdmin = useIsAdmin();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
      collapsed ? "justify-center px-0" : ""
    } ${
      isActive
        ? "bg-primary text-primary-foreground neon-glow"
        : "text-foreground hover:bg-muted"
    }`;

  const footerBtnClass = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-foreground hover:bg-muted ${
    collapsed ? "justify-center px-0" : ""
  }`;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2 px-1"}`}>
          <Network className="h-5 w-5 shrink-0 text-primary" />
          {!collapsed && (
            <span className="font-mono-cyber text-sm tracking-wider text-foreground">NetherNet</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url} end className={navLinkClass}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="font-mono-cyber text-xs">{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}

              {isAdmin && (
                <SidebarMenuItem>
                  <NavLink to="/admin" end className={navLinkClass}>
                    <Shield className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="font-mono-cyber text-xs">Admin</span>}
                  </NavLink>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 space-y-1">
        <NavLink to="/profile" end className={navLinkClass}>
          <User className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-mono-cyber text-xs">Perfil</span>}
        </NavLink>

        <button onClick={toggleSidebar} className={footerBtnClass}>
          <PanelLeft className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-mono-cyber text-xs">Colapsar</span>}
        </button>

        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className={footerBtnClass}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-mono-cyber text-xs">Cerrar sesión</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
