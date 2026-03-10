import { Check, Play, FileVideo } from "lucide-react";
import type { LessonVideo } from "../../types/course";

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

  return (
    <article
      onClick={() => onSelect(lesson.id)}
      className={[
        "group flex w-full min-w-0 items-center gap-3 rounded-2xl border p-2.5 transition-all cursor-pointer select-none backdrop-blur-md",
        isActive
          ? "border-violet-400/35 bg-violet-500/18 shadow-[0_18px_40px_rgba(76,29,149,0.25)]"
          : "border-white/10 bg-white/6 hover:border-white/18 hover:bg-white/10",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all",
          isActive
            ? "border-violet-300/50 bg-violet-500/85 text-white"
            : "border-white/10 bg-black/20 text-slate-400",
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
            isActive ? "text-white" : "text-slate-300",
          ].join(" ")}
        >
          {lesson.title}
        </span>
        <span className="text-[9px] text-slate-500 font-medium opacity-60">
          Lesson {lesson.displayIndex}
        </span>
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
            isCompleted ? "opacity-100 text-violet-300" : "opacity-40",
          ].join(" ")}
        />
      </button>
    </article>
  );
}
