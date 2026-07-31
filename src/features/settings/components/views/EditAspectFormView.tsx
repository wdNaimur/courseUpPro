import { Monitor, Save } from "lucide-react";

type QuickRatioPreset = {
  label: string;
  width: number;
  height: number;
};

type EditAspectFormViewProps = {
  editingAspectId: string | null;
  draftRatioLabel: string;
  draftWidth: number;
  draftHeight: number;
  quickRatioPresets: QuickRatioPreset[];
  setDraftRatioLabel: (val: string) => void;
  setDraftWidth: (val: number) => void;
  setDraftHeight: (val: number) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function EditAspectFormView({
  editingAspectId,
  draftRatioLabel,
  draftWidth,
  draftHeight,
  quickRatioPresets,
  setDraftRatioLabel,
  setDraftWidth,
  setDraftHeight,
  onCancel,
  onSave,
}: EditAspectFormViewProps) {
  return (
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
          {quickRatioPresets.map((item) => (
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
          onClick={onCancel}
          className="glass-button rounded-2xl px-5 py-2.5 text-xs font-bold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="glass-button-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold"
        >
          <Save className="h-4 w-4" />
          {editingAspectId ? "Update Ratio" : "Save & Select Ratio"}
        </button>
      </div>
    </div>
  );
}
