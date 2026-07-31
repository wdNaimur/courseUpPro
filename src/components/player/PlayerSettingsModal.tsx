import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Settings,
  X,
  RotateCcw,
  Play,
  SquareCheck,
  FastForward,
  Clock,
} from "lucide-react";
import type { PlayerSettings } from "../../types/settings";
import { formatOffsetDuration } from "../../utils/player-settings";

type PlayerSettingsModalProps = {
  settings: PlayerSettings;
  onClose: () => void;
  onUpdateSettings: (settings: PlayerSettings) => void;
};

const OFFSET_PRESETS = [0, 5, 10, 15, 30, 60];

export default function PlayerSettingsModal({
  settings,
  onClose,
  onUpdateSettings,
}: PlayerSettingsModalProps) {
  const [startOffsetDraft, setStartOffsetDraft] = useState(
    settings.startOffset,
  );
  const [endOffsetDraft, setEndOffsetDraft] = useState(settings.endOffset);

  const handleStartChange = (value: number) => {
    const nextVal = Math.max(0, Math.floor(value || 0));
    setStartOffsetDraft(nextVal);
    onUpdateSettings({
      startOffset: nextVal,
      endOffset: endOffsetDraft,
    });
  };

  const handleEndChange = (value: number) => {
    const nextVal = Math.max(0, Math.floor(value || 0));
    setEndOffsetDraft(nextVal);
    onUpdateSettings({
      startOffset: startOffsetDraft,
      endOffset: nextVal,
    });
  };

  const handleReset = () => {
    setStartOffsetDraft(0);
    setEndOffsetDraft(0);
    onUpdateSettings({
      startOffset: 0,
      endOffset: 0,
    });
  };

  const hasModifiedSettings = startOffsetDraft > 0 || endOffsetDraft > 0;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="editorial-panel relative w-full max-w-xl rounded-[2rem] p-6 shadow-2xl border border-[var(--theme-border)] transform transition-all animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--theme-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-accent)]/15 text-[var(--theme-accent-soft)]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="section-label">Video Player Settings</p>
              <h3 className="text-xl font-black text-[var(--theme-text)]">
                Playback Offsets
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="glass-button flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            title="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Starting Point Section */}
          <div className="theme-soft-panel rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                <label className="text-sm font-bold text-[var(--theme-text)]">
                  Video Starting Point
                </label>
              </div>
              <span className="rounded-full bg-[var(--theme-accent)]/15 px-2.5 py-1 text-xs font-bold text-[var(--theme-accent-soft)]">
                {formatOffsetDuration(startOffsetDraft)}
              </span>
            </div>

            <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
              Set the duration to skip automatically from the start of every
              video (e.g. skip intro logo or intro music).
            </p>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="theme-label-soft text-[10px] font-bold uppercase tracking-[0.18em]">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {OFFSET_PRESETS.map((preset) => (
                  <button
                    key={`start-${preset}`}
                    type="button"
                    onClick={() => handleStartChange(preset)}
                    className={[
                      "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                      startOffsetDraft === preset
                        ? "glass-button-primary scale-105"
                        : "glass-button opacity-80 hover:opacity-100",
                    ].join(" ")}
                  >
                    {preset === 0 ? "Off (0s)" : `${preset}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Custom Input */}
            <div className="pt-1 flex items-center gap-3">
              <span className="text-xs text-[var(--theme-text-muted)] font-semibold shrink-0">
                Custom Seconds:
              </span>
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() =>
                    handleStartChange(Math.max(0, startOffsetDraft - 5))
                  }
                  className="glass-button h-8 px-2.5 rounded-xl text-xs font-bold"
                >
                  -5s
                </button>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={startOffsetDraft}
                  onChange={(e) =>
                    handleStartChange(parseInt(e.target.value, 10) || 0)
                  }
                  className="theme-field h-8 w-24 rounded-xl px-3 text-center text-xs font-bold text-[var(--theme-text)]"
                />
                <button
                  type="button"
                  onClick={() => handleStartChange(startOffsetDraft + 5)}
                  className="glass-button h-8 px-2.5 rounded-xl text-xs font-bold"
                >
                  +5s
                </button>
              </div>
            </div>
          </div>

          {/* Ending Point Section */}
          <div className="theme-soft-panel rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FastForward className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                <label className="text-sm font-bold text-[var(--theme-text)]">
                  Video Ending Point
                </label>
              </div>
              <span className="rounded-full bg-[var(--theme-accent)]/15 px-2.5 py-1 text-xs font-bold text-[var(--theme-accent-soft)]">
                {formatOffsetDuration(endOffsetDraft)}
              </span>
            </div>

            <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
              Set duration from end time to automatically complete video and
              auto-play the next lesson (e.g. skip credits or outro).
            </p>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="theme-label-soft text-[10px] font-bold uppercase tracking-[0.18em]">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {OFFSET_PRESETS.map((preset) => (
                  <button
                    key={`end-${preset}`}
                    type="button"
                    onClick={() => handleEndChange(preset)}
                    className={[
                      "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                      endOffsetDraft === preset
                        ? "glass-button-primary scale-105"
                        : "glass-button opacity-80 hover:opacity-100",
                    ].join(" ")}
                  >
                    {preset === 0 ? "Off (0s)" : `${preset}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Custom Input */}
            <div className="pt-1 flex items-center gap-3">
              <span className="text-xs text-[var(--theme-text-muted)] font-semibold shrink-0">
                Custom Seconds:
              </span>
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() =>
                    handleEndChange(Math.max(0, endOffsetDraft - 5))
                  }
                  className="glass-button h-8 px-2.5 rounded-xl text-xs font-bold"
                >
                  -5s
                </button>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={endOffsetDraft}
                  onChange={(e) =>
                    handleEndChange(parseInt(e.target.value, 10) || 0)
                  }
                  className="theme-field h-8 w-24 rounded-xl px-3 text-center text-xs font-bold text-[var(--theme-text)]"
                />
                <button
                  type="button"
                  onClick={() => handleEndChange(endOffsetDraft + 5)}
                  className="glass-button h-8 px-2.5 rounded-xl text-xs font-bold"
                >
                  +5s
                </button>
              </div>
            </div>
          </div>

          {/* Active Summary card */}
          {hasModifiedSettings && (
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 p-3 text-xs text-[var(--theme-text)]">
              <Clock className="h-4 w-4 text-[var(--theme-accent-soft)] shrink-0" />
              <div className="space-y-0.5">
                <p className="font-bold text-[var(--theme-accent-soft)]">
                  Active Playback Offsets:
                </p>
                <p className="text-[var(--theme-text-muted)]">
                  {startOffsetDraft > 0
                    ? `Skip initial ${startOffsetDraft}s`
                    : "Start at 0s"}
                  {" • "}
                  {endOffsetDraft > 0
                    ? `Finish ${endOffsetDraft}s before video end`
                    : "Play until full end"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--theme-border)] pt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasModifiedSettings}
            className="glass-button inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-[var(--theme-text-muted)] disabled:opacity-40 disabled:cursor-not-allowed hover:text-[var(--theme-text)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Defaults
          </button>

          <button
            type="button"
            onClick={onClose}
            className="glass-button-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-bold"
          >
            <SquareCheck className="h-4 w-4" />
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
