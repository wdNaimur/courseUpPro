import { Check, Play, FileVideo } from "lucide-react";
import type { LessonVideo } from "../../types/course";
import { formatDurationClock } from "../../utils/duration";

type LessonItemProps = {
  lesson: LessonVideo;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: (lessonId: string) => void;
  onToggleComplete: (lessonId: string, checked: boolean) => void;
  formatLessonMeta: (lesson: LessonVideo) => string;
};

export default function LessonItem({
  lesson,
  isActive,
  isCompleted,
  onSelect,
  onToggleComplete,
}: LessonItemProps) {
  const canToggleComplete = isCompleted || isActive;
  const durationLabel = formatDurationClock(lesson.duration);

  return (
    <article
      onClick={() => onSelect(lesson.id)}
      className={[
        "group flex w-full min-w-0 items-center gap-3 rounded-2xl border p-2.5 transition-all cursor-pointer select-none backdrop-blur-md",
        isActive
          ? "border-[color:color-mix(in_srgb,var(--theme-accent-soft)_24%,transparent)] bg-[color:color-mix(in_srgb,var(--theme-accent)_18%,transparent)] shadow-[0_18px_40px_rgba(215,96,59,0.18)]"
          : "border-[var(--theme-border)] bg-white/6 hover:border-[var(--theme-border-strong)] hover:bg-white/10",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all",
          isActive
            ? "border-[color:color-mix(in_srgb,var(--theme-accent-soft)_34%,transparent)] bg-[var(--theme-accent)] text-white"
            : "border-[var(--theme-border)] bg-black/20 text-[var(--theme-text-faint)]",
        ].join(" ")}
      >
        {isActive ? (
          <Play className="h-3 w-3 fill-current" />
        ) : (
          <FileVideo className="h-3 w-3 opacity-40" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={[
            "text-[12px] font-semibold tracking-tight transition-colors",
            isActive ? "text-[var(--theme-text)]" : "text-[var(--theme-text-soft)]",
          ].join(" ")}
        >
          {lesson.title}
        </span>
        <div className="flex items-center justify-between gap-3 text-[9px] font-medium opacity-60 text-[var(--theme-text-faint)]">
          <span>Lesson {lesson.displayIndex}</span>
          {durationLabel ? <span className="shrink-0">{durationLabel}</span> : null}
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (!canToggleComplete) return;
          onToggleComplete(lesson.id, !isCompleted);
        }}
        disabled={!canToggleComplete}
        className={[
          "flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full p-0 disabled:!cursor-pointer",
          isCompleted ? "glass-button-primary" : "glass-button",
          !canToggleComplete && "opacity-45",
        ].join(" ")}
      >
        <Check
          className={[
            "h-3.5 w-3.5 translate-x-[0.5px]",
            isCompleted ? "opacity-100 text-[var(--theme-accent-soft)]" : "opacity-40",
          ].join(" ")}
        />
      </button>
    </article>
  );
}
