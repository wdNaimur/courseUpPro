import { Clock3, Trash2 } from "lucide-react";
import type { CourseMetadata } from "../../types/course";
import {
  countCompletedLessons,
  getTrackedCourseDuration,
  readCourseProgress,
} from "../../utils/course-progress";
import { formatDurationCompact } from "../../utils/duration";

type CourseCardProps = {
  course: CourseMetadata;
  onSelect: (course: CourseMetadata) => void;
  onRemove?: (courseId: string) => void;
  onEditPriority?: (courseId: string) => void;
};

export default function CourseCard({
  course,
  onSelect,
  onRemove,
  onEditPriority,
}: CourseCardProps) {
  const progressState = readCourseProgress(localStorage.getItem(course.id));
  const completedCount = countCompletedLessons(progressState);
  const courseDuration = course.totalDuration ?? getTrackedCourseDuration(progressState);
  const progressRatio = course.lessonCount
    ? Math.round((completedCount / course.lessonCount) * 100)
    : 0;
  const priorityLabel = course.priority || "Standard";
  const accessLabel = course.hasHandle ? "Saved access" : "Manual reopen";
  const lastPlayedLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(course.lastPlayedAt));

  return (
    <div
      className="editorial-panel group relative flex cursor-pointer flex-col overflow-hidden rounded-[2rem] transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:color-mix(in_srgb,var(--theme-accent-soft)_18%,transparent)] hover:shadow-[0_24px_90px_rgba(61,141,122,0.14)]"
      onClick={() => onSelect(course)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--theme-bg)]">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(118,184,168,0.24),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(61,141,122,0.2),_transparent_34%),linear-gradient(145deg,_rgba(15,20,19,0.98),_rgba(34,49,44,0.84))]" />
        )}

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          {onEditPriority ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEditPriority(course.id);
              }}
              className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md transition hover:bg-black/40"
            >
              {priorityLabel}
            </button>
          ) : (
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
              {priorityLabel}
            </span>
          )}

          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
            {progressRatio}%
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-xl font-black leading-tight text-[var(--theme-text)] transition-colors group-hover:text-[var(--theme-accent-soft)]">
          {course.title}
        </h3>

        <div className="mt-4 grid gap-3 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--theme-accent)] via-[var(--theme-accent-warm)] to-[var(--theme-accent-soft)] transition-all"
              style={{ width: `${progressRatio}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--theme-text-muted)]">
            <span>{completedCount}/{course.lessonCount} lessons completed</span>
            <span className="text-white/25">|</span>
            <span>{formatDurationCompact(courseDuration)}</span>
            <span className="text-white/25">|</span>
            <span>{accessLabel}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
            <Clock3 className="h-3.5 w-3.5 text-[var(--theme-text-faint)]" />
            <span>Opened {lastPlayedLabel}</span>
          </div>
        </div>
      </div>

      {onRemove ? (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onRemove(course.id);
          }}
          className="glass-button absolute right-4 top-4 z-10 rounded-full p-2 text-[var(--theme-text-soft)] opacity-0 transition-opacity group-hover:opacity-100 hover:border-red-400/35 hover:bg-red-500/18 hover:text-red-100"
          title="Remove course from list"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
