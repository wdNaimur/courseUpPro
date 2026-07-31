import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowLeft,
  SlidersHorizontal,
  Monitor,
  ChevronRight,
} from "lucide-react";
import type { CustomAspectRatio, OffsetPreset, PlayerSettings } from "../types/settings";
import { SETTINGS_REGISTRY } from "../config/settings-registry";
import PresetsCategoryView from "./views/PresetsCategoryView";
import AspectCategoryView from "./views/AspectCategoryView";
import EditPresetFormView from "./views/EditPresetFormView";
import EditAspectFormView from "./views/EditAspectFormView";

type SettingsDrawerProps = {
  settings: PlayerSettings;
  onClose: () => void;
  onSelectPreset: (preset: OffsetPreset) => void;
  onSavePreset: (draft: { name: string; startOffset: number; endOffset: number }, editingId?: string | null) => void;
  onDeletePreset: (presetId: string, e: React.MouseEvent) => void;
  onSelectAspectRatio: (ratioId: string) => void;
  onSaveAspectRatio: (draft: { label: string; width: number; height: number }, editingId?: string | null) => void;
  onDeleteAspectRatio: (ratioId: string, e: React.MouseEvent) => void;
};

type ViewState = "menu" | "presets" | "aspect" | "create_preset" | "create_aspect";

const TIME_PRESETS = [0, 5, 10, 15, 30, 60];

const QUICK_RATIO_PRESETS = [
  { label: "1:1 Square", width: 1, height: 1 },
  { label: "9:16 Shorts", width: 9, height: 16 },
  { label: "18:9 Phone", width: 18, height: 9 },
  { label: "3:2 Photo", width: 3, height: 2 },
  { label: "5:4 Classic", width: 5, height: 4 },
];

export default function SettingsDrawer({
  settings,
  onClose,
  onSelectPreset,
  onSavePreset,
  onDeletePreset,
  onSelectAspectRatio,
  onSaveAspectRatio,
  onDeleteAspectRatio,
}: SettingsDrawerProps) {
  const [view, setView] = useState<ViewState>("menu");
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingAspectId, setEditingAspectId] = useState<string | null>(null);

  // Preset Draft State
  const [draftName, setDraftName] = useState("");
  const [draftStart, setDraftStart] = useState(settings.startOffset || 0);
  const [draftEnd, setDraftEnd] = useState(settings.endOffset || 0);

  // Aspect Ratio Draft State
  const [draftRatioLabel, setDraftRatioLabel] = useState("");
  const [draftWidth, setDraftWidth] = useState(1);
  const [draftHeight, setDraftHeight] = useState(1);

  const handleOpenCreatePreset = () => {
    setEditingPresetId(null);
    setDraftName(`Custom Preset ${(settings.customPresets || []).length + 1}`);
    setDraftStart(settings.startOffset || 0);
    setDraftEnd(settings.endOffset || 0);
    setView("create_preset");
  };

  const handleEditPreset = (preset: OffsetPreset, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingPresetId(preset.id);
    setDraftName(preset.name);
    setDraftStart(preset.startOffset);
    setDraftEnd(preset.endOffset);
    setView("create_preset");
  };

  const handleOpenCreateAspect = () => {
    setEditingAspectId(null);
    setDraftRatioLabel(`Custom Ratio ${(settings.customAspectRatios || []).length + 1}`);
    setDraftWidth(1);
    setDraftHeight(1);
    setView("create_aspect");
  };

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

  const handleSavePresetForm = () => {
    onSavePreset(
      { name: draftName, startOffset: draftStart, endOffset: draftEnd },
      editingPresetId,
    );
    setEditingPresetId(null);
    setView("presets");
  };

  const handleSaveAspectForm = () => {
    onSaveAspectRatio(
      { label: draftRatioLabel, width: draftWidth, height: draftHeight },
      editingAspectId,
    );
    setEditingAspectId(null);
    setView("aspect");
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[999998] overflow-hidden">
      {/* Backdrop */}
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
          {/* VIEW 1: DYNAMIC CATEGORY MENU LIST */}
          {view === "menu" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <span className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.2em]">
                Settings Categories
              </span>

              <div className="grid gap-2.5">
                {SETTINGS_REGISTRY.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setView(category.id)}
                    className="group flex w-full items-center justify-between rounded-2xl border border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_40%,transparent)] p-4 text-left transition-all hover:border-[var(--theme-border-strong,#555)] hover:bg-[color:color-mix(in_srgb,var(--theme-panel)_70%,transparent)]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${category.badgeColorClass} group-hover:scale-105 transition-transform`}>
                        {category.iconName === "SlidersHorizontal" ? (
                          <SlidersHorizontal className="h-5 w-5" />
                        ) : (
                          <Monitor className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-[var(--theme-text)] truncate">
                          {category.label}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--theme-text-muted)] truncate">
                          {category.getSummary(settings)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 2: PRESETS CATEGORY VIEW */}
          {view === "presets" && (
            <PresetsCategoryView
              settings={settings}
              onSelectPreset={onSelectPreset}
              onOpenCreate={handleOpenCreatePreset}
              onEditPreset={handleEditPreset}
              onDeletePreset={onDeletePreset}
            />
          )}

          {/* VIEW 3: ASPECT CATEGORY VIEW */}
          {view === "aspect" && (
            <AspectCategoryView
              settings={settings}
              onSelectAspectRatio={onSelectAspectRatio}
              onOpenCreate={handleOpenCreateAspect}
              onEditAspect={handleEditAspect}
              onDeleteAspect={onDeleteAspectRatio}
            />
          )}

          {/* VIEW 4: EDIT PRESET FORM VIEW */}
          {view === "create_preset" && (
            <EditPresetFormView
              editingPresetId={editingPresetId}
              draftName={draftName}
              draftStart={draftStart}
              draftEnd={draftEnd}
              timePresets={TIME_PRESETS}
              setDraftName={setDraftName}
              setDraftStart={setDraftStart}
              setDraftEnd={setDraftEnd}
              onCancel={() => setView("presets")}
              onSave={handleSavePresetForm}
            />
          )}

          {/* VIEW 5: EDIT ASPECT FORM VIEW */}
          {view === "create_aspect" && (
            <EditAspectFormView
              editingAspectId={editingAspectId}
              draftRatioLabel={draftRatioLabel}
              draftWidth={draftWidth}
              draftHeight={draftHeight}
              quickRatioPresets={QUICK_RATIO_PRESETS}
              setDraftRatioLabel={setDraftRatioLabel}
              setDraftWidth={setDraftWidth}
              setDraftHeight={setDraftHeight}
              onCancel={() => setView("aspect")}
              onSave={handleSaveAspectForm}
            />
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
