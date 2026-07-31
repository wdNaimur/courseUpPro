import { Play, FastForward, Save } from "lucide-react";
import { formatOffsetDuration } from "../../utils/player-settings";

type EditPresetFormViewProps = {
  editingPresetId: string | null;
  draftName: string;
  draftStart: number;
  draftEnd: number;
  timePresets: number[];
  setDraftName: (val: string) => void;
  setDraftStart: (val: number | ((prev: number) => number)) => void;
  setDraftEnd: (val: number | ((prev: number) => number)) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function EditPresetFormView({
  editingPresetId,
  draftName,
  draftStart,
  draftEnd,
  timePresets,
  setDraftName,
  setDraftStart,
  setDraftEnd,
  onCancel,
  onSave,
}: EditPresetFormViewProps) {
  return (
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
          {timePresets.map((preset) => (
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
              onClick={() => setDraftStart((prev) => Math.max(0, prev - 5))}
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
              onClick={() => setDraftStart((prev) => prev + 5)}
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
          {timePresets.map((preset) => (
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
              onClick={() => setDraftEnd((prev) => Math.max(0, prev - 5))}
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
              onClick={() => setDraftEnd((prev) => prev + 5)}
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
          {editingPresetId ? "Update Preset" : "Save & Select Preset"}
        </button>
      </div>
    </div>
  );
}
