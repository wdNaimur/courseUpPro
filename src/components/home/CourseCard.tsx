import { Clock3, Trash2 } from "lucide-react";
import type { CourseMetadata } from "../../types/course";
import {
  countCompletedLessons,
  getCompletedCourseDuration,
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
  const completedDuration = getCompletedCourseDuration(progressState);
  const durationLabel = formatDurationCompact(courseDuration);
  const completedDurationLabel = formatDurationCompact(completedDuration);
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
      className="editorial-panel theme-card-hover-accent group relative flex cursor-pointer flex-col overflow-hidden rounded-[2rem] transition-all duration-300 hover:-translate-y-1.5"
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
          <div className="theme-preview-art h-full w-full" />
        )}

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          {onEditPriority ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEditPriority(course.id);
              }}
              className="theme-chip-dark theme-chip-dark-interactive rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
            >
              {priorityLabel}
            </button>
          ) : (
            <span className="theme-chip-dark rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
              {priorityLabel}
            </span>
          )}

          <span className="theme-chip-dark rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
            {progressRatio}%
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-xl font-black leading-tight text-[var(--theme-text)] transition-colors group-hover:text-[var(--theme-accent-soft)]">
          {course.title}
        </h3>

        <div className="theme-soft-panel-strong mt-4 grid gap-3 rounded-[1.5rem] p-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="theme-accent-fill h-full rounded-full transition-all"
              style={{ width: `${progressRatio}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--theme-text-muted)]">
            <span>{completedCount}/{course.lessonCount} lessons completed</span>
            {completedDurationLabel ? (
              <>
                <span className="theme-divider-faint">|</span>
                <span>{completedDurationLabel} completed</span>
              </>
            ) : null}
            {durationLabel ? (
              <>
                <span className="theme-divider-faint">|</span>
                <span>{durationLabel}</span>
              </>
            ) : null}
            <span className="theme-divider-faint">|</span>
            <span>{accessLabel}</span>
          </div>

          <div className="theme-text-contrast-faint flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
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
