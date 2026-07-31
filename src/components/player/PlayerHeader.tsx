import { useState } from "react";
import { ArrowLeft, Menu, Settings, X } from "lucide-react";
import type { PlayerSettings } from "../../types/settings";
import PlayerSettingsModal from "./PlayerSettingsModal";

type PlayerHeaderProps = {
  courseTitle: string;
  isSidebarVisible: boolean;
  settings: PlayerSettings;
  onBack?: () => void;
  onToggleSidebar: () => void;
  onUpdateSettings: (settings: PlayerSettings) => void;
};

export default function PlayerHeader({
  courseTitle,
  isSidebarVisible,
  settings,
  onBack,
  onToggleSidebar,
  onUpdateSettings,
}: PlayerHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const hasActiveSettings = settings.startOffset > 0 || settings.endOffset > 0;

  return (
    <header className="theme-header-shell z-20 shrink-0 border-b border-[var(--theme-border)] backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="glass-button flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-[var(--theme-text)]"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--theme-accent-soft)]" />
              Back to Courses
            </button>
          )}
          <div className="h-6 w-px bg-[var(--theme-border)]" />
          <p className="hidden max-w-[300px] text-xs font-bold uppercase tracking-wider text-[var(--theme-text-faint)] md:block">
            {courseTitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`glass-button relative flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--theme-text)] transition-all hover:scale-105 active:scale-95 ${
              hasActiveSettings ? "border-[var(--theme-accent-soft)] bg-[var(--theme-accent)]/15" : ""
            }`}
            aria-label="Video Playback Settings"
            title="Video Playback Settings (Start & End Points)"
          >
            <Settings className={`h-4 w-4 ${hasActiveSettings ? "text-[var(--theme-accent-soft)]" : "text-[var(--theme-accent-soft)] opacity-80"}`} />
            {hasActiveSettings && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--theme-accent-soft)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--theme-accent)]"></span>
              </span>
            )}
          </button>

          <button
            onClick={onToggleSidebar}
            className="glass-button flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--theme-text)]"
            aria-pressed={isSidebarVisible}
            aria-label={isSidebarVisible ? "Hide course sidebar" : "Show course sidebar"}
            title={isSidebarVisible ? "Hide course sidebar" : "Show course sidebar"}
          >
            {isSidebarVisible ? (
              <X className="h-4 w-4 text-[var(--theme-accent-soft)]" />
            ) : (
              <Menu className="h-4 w-4 text-[var(--theme-accent-soft)]" />
            )}
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <PlayerSettingsModal
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateSettings={onUpdateSettings}
        />
      )}
    </header>
  );
}

