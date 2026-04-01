import { ArrowLeft, Menu, X } from "lucide-react";

type PlayerHeaderProps = {
  courseTitle: string;
  isSidebarVisible: boolean;
  onBack?: () => void;
  onToggleSidebar: () => void;
};

export default function PlayerHeader({
  courseTitle,
  isSidebarVisible,
  onBack,
  onToggleSidebar,
}: PlayerHeaderProps) {
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
    </header>
  );
}
