import type { FolderNode, LessonVideo } from "../../types/course";
import FolderAccordion from "./FolderAccordion";

type CourseSidebarProps = {
  courseTitle: string;
  courseSubtitle: string;
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
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
  totalLessons,
  progressPercent,
  folderTree,
  activeLessonId,
  getAccordionOpen,
  setAccordionOpen,
  getLessonCompletion,
  onSelectLesson,
  onToggleComplete,
  formatLessonMeta,
}: CourseSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col border-slate-800 bg-slate-900/50 lg:border-r">
      <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900/80 p-5">
        <div>
          <h2 className="text-[17px] font-black leading-tight text-white">{courseTitle}</h2>
          <p className="mt-1.5 text-xs font-medium text-slate-500">{courseSubtitle}</p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{progressPercent}% Complete</span>
            <span>{completedCount} / {totalLessons}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-950">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
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
            <p className="text-sm font-medium text-slate-500">No lessons found in this folder.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
