import { useState } from "react";
import {
  LayoutDashboard,
  LoaderCircle,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import SettingsDrawer from "../../features/settings/components/SettingsDrawer";
import { useSettingsSystem } from "../../features/settings/context/SettingsContext";

type HomePageSearchSectionProps = {
  isAddingCourse: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onAddCourse: () => void;
  onOpenDashboard: () => void;
};

export default function HomePageSearchSection({
  isAddingCourse,
  searchQuery,
  onSearchQueryChange,
  onAddCourse,
  onOpenDashboard,
}: HomePageSearchSectionProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    settings,
    selectPreset,
    savePreset,
    deletePreset,
    selectAspectRatio,
    saveAspectRatio,
    deleteAspectRatio,
  } = useSettingsSystem();

  const hasActiveSettings = settings.startOffset > 0 || settings.endOffset > 0;

  return (
    <section className="fade-in-up [animation-delay:260ms] flex flex-col gap-6">
      <div className="flex justify-between items-center w-full">
        <h1 className="inline-block bg-[linear-gradient(135deg,var(--theme-accent-strong)_0%,var(--theme-accent)_55%,var(--theme-accent-soft)_100%)] bg-clip-text pb-1 text-5xl font-black leading-[1.05] tracking-[-0.03em] text-transparent">
          CourseUp
        </h1>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="glass-button flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--theme-text)] transition-all hover:scale-105 active:scale-95"
            aria-label="Dashboard"
            title="Manage course library"
          >
            <LayoutDashboard className="h-5 w-5 text-[var(--theme-accent-soft)]" />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={`glass-button relative flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--theme-text)] transition-all hover:scale-105 active:scale-95 ${
              hasActiveSettings
                ? "border-[var(--theme-accent-soft)] bg-[var(--theme-accent)]/15"
                : ""
            }`}
            aria-label="Settings"
            title="Open Settings (Themes, Presets, Display)"
          >
            <Settings className="h-5 w-5 text-[var(--theme-accent-soft)]" />
            {hasActiveSettings && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--theme-accent-soft)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--theme-accent)]"></span>
              </span>
            )}
          </button>

          <button
            onClick={onAddCourse}
            disabled={isAddingCourse}
            className="glass-button-primary elastic-lift shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold text-white disabled:cursor-wait disabled:opacity-75 lg:hidden inline-flex"
          >
            {isAddingCourse ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {isAddingCourse ? "Adding..." : "Add Course"}
          </button>
        </div>
      </div>

      <div className="editorial-panel fade-in-up rounded-[2rem] p-4 md:p-5 [animation-delay:160ms] w-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
              <Search className="h-5 w-5 text-[var(--theme-text-faint)]" />
            </div>
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="theme-field w-full rounded-[1.4rem] py-4 pl-14 pr-6 transition-all"
            />
          </div>
          <button
            onClick={onAddCourse}
            disabled={isAddingCourse}
            className="glass-button-primary elastic-lift shrink-0 items-center justify-center gap-2 self-start rounded-full px-6 py-3.5 font-bold text-white disabled:cursor-wait disabled:opacity-75 lg:self-auto lg:inline-flex hidden"
          >
            {isAddingCourse ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {isAddingCourse ? "Adding Course..." : "Add New Course"}
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsDrawer
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSelectPreset={selectPreset}
          onSavePreset={savePreset}
          onDeletePreset={(id, e) => {
            e.stopPropagation();
            deletePreset(id);
          }}
          onSelectAspectRatio={selectAspectRatio}
          onSaveAspectRatio={saveAspectRatio}
          onDeleteAspectRatio={(id, e) => {
            e.stopPropagation();
            deleteAspectRatio(id);
          }}
        />
      )}
    </section>
  );
}
