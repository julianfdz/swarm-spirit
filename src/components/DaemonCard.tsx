import { Cpu, Wrench, Network } from "lucide-react";

interface DaemonCardProps {
  daemon: {
    id: string;
    name: string;
    description?: string | null;
    status?: string;
    avatar_url?: string | null;
    tags?: string[];
    version?: string | null;
    visibility?: string;
    host_name?: string | null;
  };
  onClick: () => void;
  glitchEffect?: boolean;
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

export function DaemonCard({ daemon, onClick, glitchEffect = true }: DaemonCardProps) {
  const status = daemon.status ?? "stopped";
  const avatarSrc = daemon.avatar_url;

  return (
    <div className={`daemon-card ${status}`} onClick={onClick}>
      {/* Scanline sweep */}
      <div className="daemon-card-scan" />

      {/* Corner brackets */}
      <span className="card-corner tl" />
      <span className="card-corner tr" />
      <span className="card-corner bl" />
      <span className="card-corner br" />

      {/* Avatar */}
      <div className={`daemon-card-avatar ${avatarSrc && glitchEffect ? "glitch-avatar" : ""}`}>
        {avatarSrc ? (
          <>
            {isVideo(avatarSrc) ? (
              <video src={avatarSrc} className="glitch-main" autoPlay loop muted playsInline />
            ) : (
              <img src={avatarSrc} alt={daemon.name} className="glitch-main" />
            )}
            {glitchEffect && (
              <>
                {isVideo(avatarSrc) ? (
                  <video src={avatarSrc} className="glitch-r" autoPlay loop muted playsInline />
                ) : (
                  <img src={avatarSrc} alt="" className="glitch-r" />
                )}
                {isVideo(avatarSrc) ? (
                  <video src={avatarSrc} className="glitch-g" autoPlay loop muted playsInline />
                ) : (
                  <img src={avatarSrc} alt="" className="glitch-g" />
                )}
                {isVideo(avatarSrc) ? (
                  <video src={avatarSrc} className="glitch-b" autoPlay loop muted playsInline />
                ) : (
                  <img src={avatarSrc} alt="" className="glitch-b" />
                )}
              </>
            )}
          </>
        ) : (
          <div className="daemon-card-avatar-placeholder">
            <Cpu className="h-10 w-10" />
          </div>
        )}
      </div>

      {/* Header */}
      <div className="daemon-card-header">
        <div style={{ minWidth: 0 }}>
          <div className="daemon-card-name">{daemon.name}</div>
          <div className="daemon-card-id">{daemon.id.slice(0, 12)}…</div>
        </div>
        <span className={`daemon-status-badge ${status}`}>{status}</span>
      </div>

      {/* Description */}
      <div className="daemon-card-desc">
        {daemon.description || <em>No description</em>}
      </div>

      {/* Tags */}
      <div className="daemon-card-badges">
        <span className="daemon-tag">{daemon.version ?? "v?"}</span>
        <span className="daemon-tag">{daemon.visibility ?? "private"}</span>
        {(daemon.tags ?? []).slice(0, 2).map((t) => (
          <span className="daemon-tag" key={t}>{t}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="daemon-card-footer">
        <div className="daemon-card-meta">
          {daemon.host_name && (
            <span className="daemon-card-meta-item">
              <Network className="h-3 w-3" />
              {daemon.host_name}
            </span>
          )}
        </div>
        <Wrench className="h-3 w-3" style={{ color: "var(--text-faint)" }} />
      </div>
    </div>
  );
}
