import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AppDashboard from "./pages/AppDashboard";
import SwarmView from "./pages/SwarmView";
import DaemonView from "./pages/DaemonView";
import Grimoires from "./pages/Grimoires";
import DaemonsCatalogue from "./pages/DaemonsCatalogue";
import HostDaemonView from "./pages/HostDaemonView";
import Netherhosts from "./pages/Netherhosts";
import HostDetail from "./pages/HostDetail";
import Settings from "./pages/Settings";
import AdminView from "./pages/AdminView";
import ProfileView from "./pages/ProfileView";
import NotFound from "./pages/NotFound";
import TaskCreateView from "./pages/TaskCreateView";
import TaskDetailView from "./pages/TaskDetailView";
import AppLayout from "./components/AppLayout";
import { GlitchSvgDefs } from "./components/GlitchSvgDefs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <GlitchSvgDefs />
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/hosts" element={<Netherhosts />} />
                <Route path="/hosts/:hostId" element={<HostDetail />} />
                <Route path="/swarms" element={<AppDashboard />} />
                <Route path="/swarms/:swarmId" element={<SwarmView />} />
                <Route path="/swarms/:swarmId/daemon/:daemonId" element={<DaemonView />} />
                <Route path="/swarms/:swarmId/tasks/new" element={<TaskCreateView />} />
                <Route path="/tasks/:taskId" element={<TaskDetailView />} />
                <Route path="/grimoires" element={<Grimoires />} />
                <Route path="/daemons" element={<DaemonsCatalogue />} />
                <Route path="/daemons/:daemonId" element={<HostDaemonView />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<AdminView />} />
                <Route path="/profile" element={<ProfileView />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
