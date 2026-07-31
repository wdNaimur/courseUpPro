import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Settings,
  X,
  Plus,
  Trash2,
  Play,
  FastForward,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Save,
  Sparkles,
} from "lucide-react";
import type { OffsetPreset, PlayerSettings } from "../../types/settings";
import {
  getAllPresets,
  formatOffsetDuration,
  formatPresetSummary,
} from "../../utils/player-settings";

type PlayerSettingsModalProps = {
  settings: PlayerSettings;
  onClose: () => void;
  onUpdateSettings: (settings: PlayerSettings) => void;
};

const TIME_PRESETS = [0, 5, 10, 15, 30, 60];

export default function PlayerSettingsModal({
  settings,
  onClose,
  onUpdateSettings,
}: PlayerSettingsModalProps) {
  const [activePresetId, setActivePresetId] = useState(settings.activePresetId);
  const [customPresets, setCustomPresets] = useState<OffsetPreset[]>(
    settings.customPresets || [],
  );

  // View state: 'list' (clean radio pill list) or 'create' (detailed offset form)
  const [viewMode, setViewMode] = useState<"list" | "create">("list");

  // Create preset draft state
  const [draftName, setDraftName] = useState("");
  const [draftStart, setDraftStart] = useState(settings.startOffset || 0);
  const [draftEnd, setDraftEnd] = useState(settings.endOffset || 0);

  const allPresets = getAllPresets(customPresets);

  // Select a preset pill on the go
  const handleSelectPreset = (preset: OffsetPreset) => {
    setActivePresetId(preset.id);
    onUpdateSettings({
      ...settings,
      activePresetId: preset.id,
      startOffset: preset.startOffset,
      endOffset: preset.endOffset,
      customPresets,
    });
  };

  // Open creation form
  const handleOpenCreate = () => {
    setDraftName(`Custom Preset ${customPresets.length + 1}`);
    setDraftStart(settings.startOffset || 0);
    setDraftEnd(settings.endOffset || 0);
    setViewMode("create");
  };

  // Save newly created preset
  const handleSaveNewPreset = () => {
    const newPresetName = draftName.trim() || `Preset ${customPresets.length + 1}`;
    const newPreset: OffsetPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName,
      startOffset: Math.max(0, draftStart),
      endOffset: Math.max(0, draftEnd),
      isSystem: false,
    };

    const nextCustomPresets = [...customPresets, newPreset];
    setCustomPresets(nextCustomPresets);
    setActivePresetId(newPreset.id);

    onUpdateSettings({
      activePresetId: newPreset.id,
      startOffset: newPreset.startOffset,
      endOffset: newPreset.endOffset,
      customPresets: nextCustomPresets,
    });

    setViewMode("list");
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
      activePresetId: nextActiveId,
      startOffset: nextStart,
      endOffset: nextEnd,
      customPresets: nextCustomPresets,
    });
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="editorial-panel relative w-full max-w-xl rounded-[2.25rem] p-6 shadow-2xl border border-[var(--theme-border)] transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
          <div className="flex items-center gap-3">
            {viewMode === "create" ? (
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="glass-button flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--theme-text)] hover:scale-105"
                title="Back to Presets"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-accent)]/15 text-[var(--theme-accent-soft)]">
                <Settings className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="section-label">
                {viewMode === "create" ? "Custom Setup" : "Playback Settings"}
              </p>
              <h3 className="text-xl font-black text-[var(--theme-text)]">
                {viewMode === "create" ? "Create New Preset" : "Preset Offsets"}
              </h3>
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-2">
            {viewMode === "list" && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="glass-button-primary inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all hover:scale-105"
                title="Create a custom preset"
              >
                <Plus className="h-4 w-4" />
                <span>Create Preset</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="glass-button flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              title="Close popup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Mode 1: Clean Pill Radio Presets */}
        {viewMode === "list" && (
          <div className="mt-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.2em]">
                Select Active Preset
              </span>
              <span className="text-xs text-[var(--theme-text-muted)] font-semibold">
                Switch instantly on the go
              </span>
            </div>

            {/* Pill shaped radio buttons list */}
            <div className="grid gap-2.5 max-h-[55vh] overflow-y-auto p-1">
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
                    <div className="flex items-center gap-3.5">
                      <div className="shrink-0 text-[var(--theme-accent-soft)]">
                        {isActive ? (
                          <CheckCircle2 className="h-5 w-5 fill-[var(--theme-accent)] text-black" />
                        ) : (
                          <Circle className="h-5 w-5 opacity-40 group-hover:opacity-75" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={[
                              "text-sm font-bold",
                              isActive
                                ? "text-white"
                                : "text-[var(--theme-text)]",
                            ].join(" ")}
                          >
                            {preset.name}
                          </p>
                          {preset.isSystem && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--theme-text-muted)]">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--theme-text-muted)] font-medium">
                          {formatPresetSummary(preset.startOffset, preset.endOffset)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-bold",
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
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                          className="glass-button flex h-7 w-7 items-center justify-center rounded-xl text-red-400 opacity-60 hover:opacity-100 hover:bg-red-500/20"
                          title="Delete custom preset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Summary status footer */}
            <div className="flex items-center justify-between rounded-2xl border border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_30%,transparent)] p-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                <span className="font-semibold text-[var(--theme-text)]">
                  Active Offset Rule:
                </span>
                <span className="font-bold text-[var(--theme-accent-soft)]">
                  {formatPresetSummary(settings.startOffset, settings.endOffset)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="glass-button-primary rounded-xl px-5 py-2 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* View Mode 2: Detailed Creation Form */}
        {viewMode === "create" && (
          <div className="mt-5 space-y-5 max-h-[60vh] overflow-y-auto pr-1">
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
                Duration to skip automatically from the start of every video (intro skip).
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
                <span className="text-xs text-[var(--theme-text-muted)] font-semibold">
                  Custom Seconds:
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setDraftStart(Math.max(0, draftStart - 5))}
                    className="glass-button h-8 px-2.5 rounded-xl text-xs font-bold"
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
                    className="theme-field h-8 w-24 rounded-xl px-3 text-center text-xs font-bold text-[var(--theme-text)]"
                  />
                  <button
                    type="button"
                    onClick={() => setDraftStart(draftStart + 5)}
                    className="glass-button h-8 px-2.5 rounded-xl text-xs font-bold"
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
                Duration from the end time to stop & auto-play the next lesson (outro skip).
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
                <span className="text-xs text-[var(--theme-text-muted)] font-semibold">
                  Custom Seconds:
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setDraftEnd(Math.max(0, draftEnd - 5))}
                    className="glass-button h-8 px-2.5 rounded-xl text-xs font-bold"
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
                    className="theme-field h-8 w-24 rounded-xl px-3 text-center text-xs font-bold text-[var(--theme-text)]"
                  />
                  <button
                    type="button"
                    onClick={() => setDraftEnd(draftEnd + 5)}
                    className="glass-button h-8 px-2.5 rounded-xl text-xs font-bold"
                  >
                    +5s
                  </button>
                </div>
              </div>
            </div>

            {/* Creation Action Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--theme-border)] pt-4">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="glass-button rounded-2xl px-5 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewPreset}
                className="glass-button-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold"
              >
                <Save className="h-4 w-4" />
                Save & Select Preset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
