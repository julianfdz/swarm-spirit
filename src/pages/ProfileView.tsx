import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

interface Profile {
  username: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username, avatar_url, phone, created_at, updated_at")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  if (!profile) return <p className="p-6 text-muted-foreground text-sm">Cargando perfil...</p>;

  return (
    <div className="p-6 max-w-lg space-y-6">
      <h1 className="font-mono-cyber text-xl text-foreground neon-text flex items-center gap-2">
        <User className="h-5 w-5 text-primary" /> Mi Perfil
      </h1>

      <div className="rounded-lg border border-border neon-border p-6 space-y-4 bg-card">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full border-2 border-primary" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <p className="font-mono-cyber text-lg text-foreground">{profile.username}</p>
            <p className="text-muted-foreground text-xs">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Teléfono</span>
            <span className="font-mono-cyber">{profile.phone ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Miembro desde</span>
            <span className="font-mono-cyber">{new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última actualización</span>
            <span className="font-mono-cyber">{new Date(profile.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
