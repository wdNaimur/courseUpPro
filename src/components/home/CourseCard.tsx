import { Trash2 } from "lucide-react";
import type { CourseMetadata } from "../../types/course";

type CourseCardProps = {
  course: CourseMetadata;
  onSelect: (course: CourseMetadata) => void;
  onRemove: (courseId: string) => void;
  onEditPriority: (courseId: string) => void;
};

export default function CourseCard({
  course,
  onSelect,
  onRemove,
  onEditPriority,
}: CourseCardProps) {
  const progressPercent = JSON.parse(localStorage.getItem(course.id) || "{}");
  const completedCount = Object.values(progressPercent).filter(Boolean).length;
  const progressRatio = course.lessonCount
    ? Math.round((completedCount / course.lessonCount) * 100)
    : 0;
  const priorityLabel = course.priority || "Standard";
  const lastPlayedLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(course.lastPlayedAt));

  return (
    <div
      className="glass-panel group relative flex flex-col overflow-hidden rounded-[1.75rem] transition-all hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-2xl hover:shadow-violet-500/12 cursor-pointer"
      onClick={() => onSelect(course)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.30),_transparent_38%),linear-gradient(145deg,_rgba(15,23,42,0.92),_rgba(76,29,149,0.78))] p-6 text-left">
            <div className="space-y-2">
              <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                {priorityLabel}
              </span>
            </div>
          </div>
        )}

        {course.thumbnail ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEditPriority(course.id);
            }}
            className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md transition hover:bg-black/40"
          >
            {priorityLabel}
          </button>
        ) : null}
        <div className="absolute right-4 bottom-4 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md -translate-y-1">
          {progressRatio}%
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 text-lg font-black leading-tight text-slate-100 transition-colors group-hover:text-violet-300">
            {course.title}
          </h3>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/16 p-4">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold text-white/85">
              {completedCount} / {course.lessonCount} lessons
            </span>
            <span className="text-white/55">Last opened {lastPlayedLabel}</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-violet-400 to-cyan-300 transition-all"
              style={{ width: `${progressRatio}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEditPriority(course.id);
              }}
              className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/12"
            >
              {priorityLabel}
            </button>
            <span>{course.hasHandle ? "Saved access" : "Manual reopen"}</span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(course.id);
        }}
        className="glass-button absolute top-4 right-4 z-10 rounded-full p-2 text-slate-200 opacity-0 transition-opacity group-hover:opacity-100 hover:border-red-400/35 hover:bg-red-500/18 hover:text-red-100"
        title="Remove course from list"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
