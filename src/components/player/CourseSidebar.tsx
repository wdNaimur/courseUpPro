import type { FolderNode, LessonVideo } from "../../types/course";
import { formatDurationCompact } from "../../utils/duration";
import FolderAccordion from "./FolderAccordion";

type CourseSidebarProps = {
  courseTitle: string;
  courseSubtitle: string;
  completedCount: number;
  completedDuration: number;
  totalLessons: number;
  progressPercent: number;
  totalDuration: number;
  folderTree: FolderNode;
  activeLessonId: string | null;
  getAccordionOpen: (folderKey: string, defaultState?: boolean) => boolean;
  setAccordionOpen: (folderKey: string, isOpen: boolean) => void;
  getLessonCompletion: (lessonId: string) => boolean;
  onSelectLesson: (lessonId: string) => void;
  onToggleComplete: (lessonId: string, checked: boolean) => void;
  formatLessonMeta: (lesson: LessonVideo) => string;
};

export default function CourseSidebar({
  courseTitle,
  courseSubtitle,
  completedCount,
  completedDuration,
  totalLessons,
  progressPercent,
  totalDuration,
  folderTree,
  activeLessonId,
  getAccordionOpen,
  setAccordionOpen,
  getLessonCompletion,
  onSelectLesson,
  onToggleComplete,
  formatLessonMeta,
}: CourseSidebarProps) {
  const totalDurationLabel = formatDurationCompact(totalDuration);
  const completedDurationLabel = formatDurationCompact(completedDuration);

  return (
    <aside className="theme-sidebar-shell flex min-h-0 flex-col border-[var(--theme-border)] lg:border-r">
      <div className="glass-panel m-2 mb-0 flex flex-col gap-4 rounded-3xl p-5">
        <div>
          <h2 className="text-[17px] font-black leading-tight text-[var(--theme-text)]">
            {courseTitle}
          </h2>
          <p className="mt-1.5 text-xs font-medium text-[var(--theme-text-faint)]">
            {courseSubtitle}
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
            <span>{progressPercent}% Complete</span>
            {totalDurationLabel ? <span>{totalDurationLabel}</span> : <span />}
          </div>
          <div className="text-[11px] font-medium text-[var(--theme-text-faint)]">
            {completedCount} / {totalLessons} lessons completed
            {completedDurationLabel ? ` · ${completedDurationLabel} completed` : ""}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--theme-bg)]">
            <div
              className="theme-accent-progress h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="m-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
        {totalLessons > 0 ? (
          <FolderAccordion
            node={folderTree}
            activeLessonId={activeLessonId}
            getAccordionOpen={getAccordionOpen}
            setAccordionOpen={setAccordionOpen}
            getLessonCompletion={getLessonCompletion}
            onSelectLesson={onSelectLesson}
            onToggleComplete={onToggleComplete}
            formatLessonMeta={formatLessonMeta}
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-[var(--theme-text-faint)]">
              No lessons found in this folder.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
