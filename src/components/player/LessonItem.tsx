import { CheckCircle2, Play, FileVideo } from "lucide-react";
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
  return (
    <article
      onClick={() => onSelect(lesson.id)}
      className={[
        "group flex w-full min-w-0 items-center gap-2.5 rounded-lg border p-2 transition-all cursor-pointer select-none",
        isActive
          ? "border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/20 shadow-md"
          : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/60",
      ].join(" ")}
    >
      {/* Icon Area */}
      <div
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all",
          isActive
            ? "bg-violet-500 border-violet-400 text-white"
            : "bg-slate-950 border-slate-800 text-slate-500",
        ].join(" ")}
      >
        {isActive ? (
          <Play className="h-3 w-3 fill-current" />
        ) : (
          <FileVideo className="h-3 w-3 opacity-40" />
        )}
      </div>

      {/* Text Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={[
            "text-[12px] font-semibold tracking-tight transition-colors",
            isActive ? "text-white" : "text-slate-300",
            isCompleted && !isActive
              ? "text-slate-500 line-through decoration-slate-700"
              : "",
          ].join(" ")}
        >
          {lesson.title}
        </span>
        <span className="text-[9px] text-slate-500 font-medium opacity-60">
          Lesson {lesson.displayIndex}
        </span>
      </div>

      {/* Checkbox */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleComplete(lesson.id, !isCompleted);
        }}
      >
        <CheckCircle2
          className={[
            "h-3.5 w-3.5",
            isCompleted ? "opacity-100 text-violet-500" : "opacity-40",
          ].join(" ")}
        />
      </button>
    </article>
  );
}
