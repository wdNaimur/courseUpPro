import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Trash2,
  Play,
  FastForward,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Save,
  SlidersHorizontal,
  Monitor,
  ChevronRight,
  Info,
  Pencil,
} from "lucide-react";
import type { CustomAspectRatio, OffsetPreset, PlayerSettings } from "../../types/settings";
import {
  getAllPresets,
  getAllAspectRatios,
  formatOffsetDuration,
  formatPresetSummary,
} from "../../utils/player-settings";

type PlayerSettingsModalProps = {
  settings: PlayerSettings;
  onClose: () => void;
  onUpdateSettings: (settings: PlayerSettings) => void;
};

type SettingsView = "menu" | "presets" | "aspect" | "create_preset" | "create_aspect";

const TIME_PRESETS = [0, 5, 10, 15, 30, 60];

const QUICK_RATIO_PRESETS = [
  { label: "1:1 Square", width: 1, height: 1 },
  { label: "9:16 Shorts", width: 9, height: 16 },
  { label: "18:9 Phone", width: 18, height: 9 },
  { label: "3:2 Photo", width: 3, height: 2 },
  { label: "5:4 Classic", width: 5, height: 4 },
];

export default function PlayerSettingsModal({
  settings,
  onClose,
  onUpdateSettings,
}: PlayerSettingsModalProps) {
  const [activePresetId, setActivePresetId] = useState(settings.activePresetId);
  const [customPresets, setCustomPresets] = useState<OffsetPreset[]>(
    settings.customPresets || [],
  );
  const [customAspectRatios, setCustomAspectRatios] = useState<CustomAspectRatio[]>(
    settings.customAspectRatios || [],
  );

  // Active view
  const [view, setView] = useState<SettingsView>("menu");

  // Track items being edited
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingAspectId, setEditingAspectId] = useState<string | null>(null);

  // Preset draft state
  const [draftName, setDraftName] = useState("");
  const [draftStart, setDraftStart] = useState(settings.startOffset || 0);
  const [draftEnd, setDraftEnd] = useState(settings.endOffset || 0);

  // Aspect ratio draft state
  const [draftRatioLabel, setDraftRatioLabel] = useState("");
  const [draftWidth, setDraftWidth] = useState(1);
  const [draftHeight, setDraftHeight] = useState(1);

  const allPresets = getAllPresets(customPresets);
  const allAspectRatios = getAllAspectRatios(customAspectRatios);

  // Select a preset pill on the go
  const handleSelectPreset = (preset: OffsetPreset) => {
    setActivePresetId(preset.id);
    onUpdateSettings({
      ...settings,
      activePresetId: preset.id,
      startOffset: preset.startOffset,
      endOffset: preset.endOffset,
      customPresets,
      customAspectRatios,
    });
  };

  // Select aspect ratio on the go
  const handleSelectAspectRatio = (ratioId: string) => {
    onUpdateSettings({
      ...settings,
      aspectRatio: ratioId,
      customAspectRatios,
    });
  };

  // Open creation form inside Presets (New)
  const handleOpenCreatePreset = () => {
    setEditingPresetId(null);
    setDraftName(`Custom Preset ${customPresets.length + 1}`);
    setDraftStart(settings.startOffset || 0);
    setDraftEnd(settings.endOffset || 0);
    setView("create_preset");
  };

  // Open edit form inside Presets
  const handleEditPreset = (preset: OffsetPreset, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingPresetId(preset.id);
    setDraftName(preset.name);
    setDraftStart(preset.startOffset);
    setDraftEnd(preset.endOffset);
    setView("create_preset");
  };

  // Open creation form inside Aspect Ratios (New)
  const handleOpenCreateAspect = () => {
    setEditingAspectId(null);
    setDraftRatioLabel(`Custom Ratio ${customAspectRatios.length + 1}`);
    setDraftWidth(1);
    setDraftHeight(1);
    setView("create_aspect");
  };

  // Open edit form inside Aspect Ratios
  const handleEditAspect = (ratio: CustomAspectRatio, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingAspectId(ratio.id);
    setDraftRatioLabel(ratio.label);

    const parts = ratio.ratioValue.split("/").map((n) => parseInt(n, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setDraftWidth(parts[0]);
      setDraftHeight(parts[1]);
    } else {
      setDraftWidth(1);
      setDraftHeight(1);
    }

    setView("create_aspect");
  };

  // Save preset (creates new or updates existing)
  const handleSavePreset = () => {
    const name = draftName.trim() || `Preset ${customPresets.length + 1}`;
    const start = Math.max(0, draftStart);
    const end = Math.max(0, draftEnd);

    let nextCustomPresets: OffsetPreset[];
    let targetPresetId: string;

    if (editingPresetId) {
      targetPresetId = editingPresetId;
      nextCustomPresets = customPresets.map((p) =>
        p.id === editingPresetId
          ? { ...p, name, startOffset: start, endOffset: end }
          : p,
      );
    } else {
      targetPresetId = `custom-${Date.now()}`;
      const newPreset: OffsetPreset = {
        id: targetPresetId,
        name,
        startOffset: start,
        endOffset: end,
        isSystem: false,
      };
      nextCustomPresets = [...customPresets, newPreset];
    }

    setCustomPresets(nextCustomPresets);
    setActivePresetId(targetPresetId);

    onUpdateSettings({
      ...settings,
      activePresetId: targetPresetId,
      startOffset: start,
      endOffset: end,
      customPresets: nextCustomPresets,
      customAspectRatios,
    });

    setEditingPresetId(null);
    setView("presets");
  };

  // Save aspect ratio (creates new or updates existing)
  const handleSaveAspect = () => {
    const w = Math.max(1, Math.floor(draftWidth || 1));
    const h = Math.max(1, Math.floor(draftHeight || 1));
    const label = draftRatioLabel.trim() || `${w}:${h} Custom`;
    const ratioValue = `${w}/${h}`;

    let nextCustomRatios: CustomAspectRatio[];
    let targetRatioId: string;

    if (editingAspectId) {
      targetRatioId = editingAspectId;
      nextCustomRatios = customAspectRatios.map((r) =>
        r.id === editingAspectId
          ? { ...r, label, ratioValue, desc: `${w}:${h} custom ratio` }
          : r,
      );
    } else {
      targetRatioId = `custom-ratio-${Date.now()}`;
      const newRatio: CustomAspectRatio = {
        id: targetRatioId,
        label,
        ratioValue,
        desc: `${w}:${h} custom ratio`,
        isSystem: false,
      };
      nextCustomRatios = [...customAspectRatios, newRatio];
    }

    setCustomAspectRatios(nextCustomRatios);

    onUpdateSettings({
      ...settings,
      aspectRatio: targetRatioId,
      customAspectRatios: nextCustomRatios,
    });

    setEditingAspectId(null);
    setView("aspect");
  };

  // Delete a custom preset
  const handleDeleteCustomPreset = (presetId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const nextCustomPresets = customPresets.filter((p) => p.id !== presetId);
    setCustomPresets(nextCustomPresets);

    let nextActiveId = activePresetId;
    let nextStart = settings.startOffset;
    let nextEnd = settings.endOffset;

    if (activePresetId === presetId) {
      nextActiveId = "off";
      nextStart = 0;
      nextEnd = 0;
    }

    onUpdateSettings({
      ...settings,
      activePresetId: nextActiveId,
      startOffset: nextStart,
      endOffset: nextEnd,
      customPresets: nextCustomPresets,
      customAspectRatios,
    });
  };

  // Delete a custom aspect ratio
  const handleDeleteCustomAspect = (ratioId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const nextCustomRatios = customAspectRatios.filter((r) => r.id !== ratioId);
    setCustomAspectRatios(nextCustomRatios);

    let nextRatio = settings.aspectRatio;
    if (settings.aspectRatio === ratioId) {
      nextRatio = "16:9";
    }

    onUpdateSettings({
      ...settings,
      aspectRatio: nextRatio,
      customAspectRatios: nextCustomRatios,
    });
  };

  const getActiveRatioLabel = () => {
    const found = allAspectRatios.find(
      (r) => r.id === settings.aspectRatio || r.ratioValue === settings.aspectRatio,
    );
    return found ? found.label : settings.aspectRatio || "16:9";
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[999998] overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Right-Side Off-Canvas Drawer */}
      <div className="fixed inset-y-0 right-0 z-[999999] flex h-full w-full max-w-md flex-col border-l border-[var(--theme-border)] bg-[var(--theme-panel)] p-6 shadow-2xl backdrop-blur-2xl transition-transform animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {view !== "menu" ? (
              <button
                type="button"
                onClick={() =>
                  setView(
                    view === "create_preset"
                      ? "presets"
                      : view === "create_aspect"
                      ? "aspect"
                      : "menu",
                  )
                }
                className="glass-button flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--theme-text)] hover:scale-105"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-accent)]/15 text-[var(--theme-accent-soft)]">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
            )}

            <div>
              <p className="section-label">
                {view === "menu"
                  ? "Player Preferences"
                  : view === "presets"
                  ? "Presets & Offsets"
                  : view === "aspect"
                  ? "Player & Display"
                  : view === "create_preset"
                  ? editingPresetId
                    ? "Edit Preset Setup"
                    : "New Preset Setup"
                  : editingAspectId
                  ? "Edit Aspect Ratio Setup"
                  : "New Aspect Ratio Setup"}
              </p>
              <h3 className="text-xl font-black text-[var(--theme-text)]">
                {view === "menu"
                  ? "Settings"
                  : view === "presets"
                  ? "Presets & Offsets"
                  : view === "aspect"
                  ? "Aspect Ratio"
                  : view === "create_preset"
                  ? editingPresetId
                    ? "Edit Custom Preset"
                    : "Create Custom Preset"
                  : editingAspectId
                  ? "Edit Aspect Ratio"
                  : "Create Aspect Ratio"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="glass-button flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            title="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Detail Views Container */}
        <div className="mt-5 flex-1 flex flex-col justify-between overflow-y-auto pr-1">
          {/* VIEW 1: MAIN SETTINGS MENU LIST (MX Player Style) */}
          {view === "menu" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <span className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.2em]">
                Settings Categories
              </span>

              <div className="grid gap-2.5">
                {/* Category 1: Presets & Offsets */}
                <button
                  type="button"
                  onClick={() => setView("presets")}
                  className="group flex w-full items-center justify-between rounded-2xl border border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_40%,transparent)] p-4 text-left transition-all hover:border-[var(--theme-border-strong,#555)] hover:bg-[color:color-mix(in_srgb,var(--theme-panel)_70%,transparent)]"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-105 transition-transform">
                      <SlidersHorizontal className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-[var(--theme-text)] truncate">
                        Presets & Offsets
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--theme-text-muted)] truncate">
                        {formatPresetSummary(settings.startOffset, settings.endOffset)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Category 2: Player & Display */}
                <button
                  type="button"
                  onClick={() => setView("aspect")}
                  className="group flex w-full items-center justify-between rounded-2xl border border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_40%,transparent)] p-4 text-left transition-all hover:border-[var(--theme-border-strong,#555)] hover:bg-[color:color-mix(in_srgb,var(--theme-panel)_70%,transparent)]"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 group-hover:scale-105 transition-transform">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-[var(--theme-text)] truncate">
                        Player & Display
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--theme-text-muted)] truncate">
                        Aspect ratio: {getActiveRatioLabel()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: PRESETS CATEGORY */}
          {view === "presets" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between min-h-[32px]">
                <span className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.2em]">
                  Available Presets
                </span>
                <button
                  type="button"
                  onClick={handleOpenCreatePreset}
                  className="glass-button flex h-8 w-8 items-center justify-center rounded-xl text-[var(--theme-text)] hover:bg-[var(--theme-accent)]/15 hover:text-[var(--theme-accent-soft)] transition-all"
                  title="Create new preset"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-2.5 p-0.5">
                {allPresets.map((preset) => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={[
                        "group relative flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all duration-200 border",
                        isActive
                          ? "border-[var(--theme-accent-soft)] bg-[var(--theme-accent)]/15 ring-1 ring-[var(--theme-accent-soft)]/50 shadow-lg shadow-[var(--theme-accent)]/10"
                          : "border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_40%,transparent)] hover:border-[var(--theme-border-strong,#555)] hover:bg-[color:color-mix(in_srgb,var(--theme-panel)_70%,transparent)]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <div className="shrink-0 text-[var(--theme-accent-soft)]">
                          {isActive ? (
                            <CheckCircle2 className="h-5 w-5 fill-[var(--theme-accent)] text-black" />
                          ) : (
                            <Circle className="h-5 w-5 opacity-40 group-hover:opacity-75" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={[
                                "text-sm font-bold truncate",
                                isActive ? "text-white" : "text-[var(--theme-text)]",
                              ].join(" ")}
                            >
                              {preset.name}
                            </p>
                            {preset.isSystem && (
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--theme-text-muted)] shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--theme-text-muted)] font-medium truncate">
                            {formatPresetSummary(preset.startOffset, preset.endOffset)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold shrink-0",
                            isActive
                              ? "bg-[var(--theme-accent)] text-black"
                              : "bg-white/5 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]",
                          ].join(" ")}
                        >
                          {preset.startOffset === 0 && preset.endOffset === 0
                            ? "0s"
                            : `${preset.startOffset}s / ${preset.endOffset}s`}
                        </span>

                        {!preset.isSystem && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleEditPreset(preset, e)}
                              className="glass-button flex h-7 w-7 items-center justify-center rounded-xl text-[var(--theme-accent-soft)] opacity-70 hover:opacity-100 hover:bg-[var(--theme-accent)]/15 shrink-0"
                              title="Edit preset"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                              className="glass-button flex h-7 w-7 items-center justify-center rounded-xl text-red-400 opacity-60 hover:opacity-100 hover:bg-red-500/20 shrink-0"
                              title="Delete custom preset"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: ASPECT RATIO CATEGORY */}
          {view === "aspect" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between min-h-[32px]">
                <span className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.2em]">
                  Aspect Ratio Options
                </span>
                <button
                  type="button"
                  onClick={handleOpenCreateAspect}
                  className="glass-button flex h-8 w-8 items-center justify-center rounded-xl text-[var(--theme-text)] hover:bg-[var(--theme-accent)]/15 hover:text-[var(--theme-accent-soft)] transition-all"
                  title="Create custom aspect ratio"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-2.5 p-0.5">
                {allAspectRatios.map((option) => {
                  const isSelected =
                    settings.aspectRatio === option.id ||
                    settings.aspectRatio === option.ratioValue;
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectAspectRatio(option.id)}
                      className={[
                        "group flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all border",
                        isSelected
                          ? "border-[var(--theme-accent-soft)] bg-[var(--theme-accent)]/15 ring-1 ring-[var(--theme-accent-soft)]/50 shadow-lg shadow-[var(--theme-accent)]/10"
                          : "border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_40%,transparent)] hover:border-[var(--theme-border-strong,#555)] hover:bg-[color:color-mix(in_srgb,var(--theme-panel)_70%,transparent)]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <div className="shrink-0 text-[var(--theme-accent-soft)]">
                          {isSelected ? (
                            <CheckCircle2 className="h-5 w-5 fill-[var(--theme-accent)] text-black" />
                          ) : (
                            <Circle className="h-5 w-5 opacity-40 group-hover:opacity-75" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={[
                                "text-sm font-bold truncate",
                                isSelected ? "text-white" : "text-[var(--theme-text)]",
                              ].join(" ")}
                            >
                              {option.label}
                            </p>
                            {option.isSystem && (
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--theme-text-muted)] shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--theme-text-muted)] font-medium truncate">
                            {option.desc || `${option.ratioValue} ratio`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold shrink-0",
                            isSelected
                              ? "bg-[var(--theme-accent)] text-black"
                              : "bg-white/5 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]",
                          ].join(" ")}
                        >
                          {option.ratioValue === "cover"
                            ? "Fill"
                            : option.ratioValue === "contain"
                            ? "Fit"
                            : option.ratioValue}
                        </span>

                        {!option.isSystem && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleEditAspect(option, e)}
                              className="glass-button flex h-7 w-7 items-center justify-center rounded-xl text-[var(--theme-accent-soft)] opacity-70 hover:opacity-100 hover:bg-[var(--theme-accent)]/15 shrink-0"
                              title="Edit aspect ratio"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomAspect(option.id, e)}
                              className="glass-button flex h-7 w-7 items-center justify-center rounded-xl text-red-400 opacity-60 hover:opacity-100 hover:bg-red-500/20 shrink-0"
                              title="Delete custom aspect ratio"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_30%,transparent)] p-4 text-xs flex items-start gap-3 text-[var(--theme-text-muted)]">
                <Info className="h-4 w-4 text-[var(--theme-accent-soft)] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Select <strong className="text-white">Fill / Cover</strong> to stretch video edge-to-edge or <strong className="text-white">Fit / Contain</strong> to preserve exact video dimensions.
                </p>
              </div>
            </div>
          )}

          {/* VIEW 4: CREATE / EDIT CUSTOM PRESET FORM */}
          {view === "create_preset" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Preset Name */}
              <div className="space-y-2">
                <label className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.18em]">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g. React Course Fast-Forward"
                  className="theme-field w-full rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--theme-text)]"
                />
              </div>

              {/* Video Starting Point */}
              <div className="theme-soft-panel rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                    <label className="text-sm font-bold text-[var(--theme-text)]">
                      Video Starting Point
                    </label>
                  </div>
                  <span className="rounded-full bg-[var(--theme-accent)]/15 px-2.5 py-1 text-xs font-bold text-[var(--theme-accent-soft)]">
                    {formatOffsetDuration(draftStart)}
                  </span>
                </div>

                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                  Duration to skip automatically from start of video (intro skip).
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={`create-start-${preset}`}
                      type="button"
                      onClick={() => setDraftStart(preset)}
                      className={[
                        "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                        draftStart === preset
                          ? "glass-button-primary ring-1 ring-[var(--theme-accent-soft)]"
                          : "glass-button opacity-80 hover:opacity-100",
                      ].join(" ")}
                    >
                      {preset === 0 ? "Off (0s)" : `${preset}s`}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-[var(--theme-text-muted)] font-semibold shrink-0">
                    Custom Seconds:
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setDraftStart(Math.max(0, draftStart - 5))}
                      className="glass-button h-9 px-3 rounded-xl text-xs font-bold shrink-0"
                    >
                      -5s
                    </button>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={draftStart}
                      onChange={(e) =>
                        setDraftStart(Math.max(0, parseInt(e.target.value, 10) || 0))
                      }
                      className="theme-field h-9 w-24 rounded-xl px-3 text-center text-xs font-bold text-[var(--theme-text)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setDraftStart(draftStart + 5)}
                      className="glass-button h-9 px-3 rounded-xl text-xs font-bold shrink-0"
                    >
                      +5s
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Ending Point */}
              <div className="theme-soft-panel rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FastForward className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                    <label className="text-sm font-bold text-[var(--theme-text)]">
                      Video Ending Point
                    </label>
                  </div>
                  <span className="rounded-full bg-[var(--theme-accent)]/15 px-2.5 py-1 text-xs font-bold text-[var(--theme-accent-soft)]">
                    {formatOffsetDuration(draftEnd)}
                  </span>
                </div>

                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                  Duration from end time to stop & auto-play next lesson (outro skip).
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={`create-end-${preset}`}
                      type="button"
                      onClick={() => setDraftEnd(preset)}
                      className={[
                        "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                        draftEnd === preset
                          ? "glass-button-primary ring-1 ring-[var(--theme-accent-soft)]"
                          : "glass-button opacity-80 hover:opacity-100",
                      ].join(" ")}
                    >
                      {preset === 0 ? "Off (0s)" : `${preset}s`}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-[var(--theme-text-muted)] font-semibold shrink-0">
                    Custom Seconds:
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setDraftEnd(Math.max(0, draftEnd - 5))}
                      className="glass-button h-9 px-3 rounded-xl text-xs font-bold shrink-0"
                    >
                      -5s
                    </button>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={draftEnd}
                      onChange={(e) =>
                        setDraftEnd(Math.max(0, parseInt(e.target.value, 10) || 0))
                      }
                      className="theme-field h-9 w-24 rounded-xl px-3 text-center text-xs font-bold text-[var(--theme-text)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setDraftEnd(draftEnd + 5)}
                      className="glass-button h-9 px-3 rounded-xl text-xs font-bold shrink-0"
                    >
                      +5s
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView("presets")}
                  className="glass-button rounded-2xl px-5 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreset}
                  className="glass-button-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold"
                >
                  <Save className="h-4 w-4" />
                  {editingPresetId ? "Update Preset" : "Save & Select Preset"}
                </button>
              </div>
            </div>
          )}

          {/* VIEW 5: CREATE / EDIT CUSTOM ASPECT RATIO FORM */}
          {view === "create_aspect" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Ratio Label */}
              <div className="space-y-2">
                <label className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.18em]">
                  Aspect Ratio Label
                </label>
                <input
                  type="text"
                  value={draftRatioLabel}
                  onChange={(e) => setDraftRatioLabel(e.target.value)}
                  placeholder="e.g. 1:1 Square, 9:16 Shorts"
                  className="theme-field w-full rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--theme-text)]"
                />
              </div>

              {/* Quick Ratio Presets */}
              <div className="space-y-2">
                <span className="theme-label-soft text-[10px] font-bold uppercase tracking-[0.18em]">
                  Quick Ratio Suggestions
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_RATIO_PRESETS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setDraftRatioLabel(item.label);
                        setDraftWidth(item.width);
                        setDraftHeight(item.height);
                      }}
                      className="glass-button rounded-xl px-3 py-1.5 text-xs font-bold opacity-85 hover:opacity-100"
                    >
                      {item.label} ({item.width}:{item.height})
                    </button>
                  ))}
                </div>
              </div>

              {/* Width & Height inputs */}
              <div className="theme-soft-panel rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--theme-text)]">
                  <Monitor className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                  <span>Custom Aspect Ratio Dimensions</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--theme-text-muted)] font-semibold">
                      Width Ratio:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={draftWidth}
                      onChange={(e) => setDraftWidth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="theme-field w-full rounded-xl px-3 py-2 text-center text-sm font-bold text-[var(--theme-text)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--theme-text-muted)] font-semibold">
                      Height Ratio:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={draftHeight}
                      onChange={(e) => setDraftHeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="theme-field w-full rounded-xl px-3 py-2 text-center text-sm font-bold text-[var(--theme-text)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-3 text-center text-xs text-[var(--theme-text-muted)]">
                  Computed Ratio: <strong className="text-white">{draftWidth} : {draftHeight}</strong> ({draftWidth}/{draftHeight})
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView("aspect")}
                  className="glass-button rounded-2xl px-5 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAspect}
                  className="glass-button-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold"
                >
                  <Save className="h-4 w-4" />
                  {editingAspectId ? "Update Ratio" : "Save & Select Ratio"}
                </button>
              </div>
            </div>
          )}

          {/* Drawer Footer */}
          <div className="mt-4 border-t border-[var(--theme-border)] pt-4 flex items-center justify-between shrink-0 text-xs">
            <span className="text-[var(--theme-text-muted)] font-semibold">
              Settings persist automatically
            </span>
            <button
              type="button"
              onClick={onClose}
              className="glass-button-primary rounded-xl px-6 py-2.5 text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
