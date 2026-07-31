import { Play, X } from "lucide-react";

type VideoAutoPlayOverlayProps = {
  countdown: number;
  nextLessonTitle?: string;
  onCancel: () => void;
  onPlayNow: () => void;
};

export default function VideoAutoPlayOverlay({
  countdown,
  nextLessonTitle,
  onCancel,
  onPlayNow,
}: VideoAutoPlayOverlayProps) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[var(--theme-overlay)] backdrop-blur-sm transition-all duration-500">
      <button
        onClick={onCancel}
        className="absolute right-6 top-6 text-[var(--theme-text-faint)] transition-colors hover:text-white"
      >
        <X className="h-8 w-8" />
      </button>

      <div className="flex min-w-md max-w-md flex-col items-center p-6 text-center">
        <span className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--theme-accent-soft)]">
          Up Next
        </span>
        <h3 className="mb-8 line-clamp-2 text-2xl font-black text-white">
          {nextLessonTitle}
        </h3>

        <div className="relative mb-8 h-24 w-24">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-[var(--theme-panel-soft)]"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * countdown) / 5}
              className="text-[var(--theme-accent)] transition-all duration-1000 linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">
            {countdown}
          </div>
        </div>

        <div className="flex w-full gap-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-[var(--theme-panel-soft)] py-4 font-bold text-white transition-colors hover:bg-[var(--theme-panel-strong)]"
          >
            Cancel
          </button>
          <button
            onClick={onPlayNow}
            className="theme-primary-shadow flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--theme-accent)] py-4 font-bold text-white transition-all hover:bg-[var(--theme-accent-strong)]"
          >
            <Play className="h-4 w-4 fill-current" />
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
}
