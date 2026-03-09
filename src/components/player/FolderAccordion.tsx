import { ChevronRight, Video } from "lucide-react";
import type { FolderNode, LessonVideo } from "../../types/course";
import { countLessonsInNode } from "../../utils/course-helpers";
import LessonItem from "./LessonItem";

type FolderAccordionProps = {
  node: FolderNode;
  parentKey?: string;
  depth?: number;
  activeLessonId: string | null;
  getAccordionOpen: (folderKey: string, defaultState?: boolean) => boolean;
  setAccordionOpen: (folderKey: string, isOpen: boolean) => void;
  getLessonCompletion: (lessonId: string) => boolean;
  onSelectLesson: (lessonId: string) => void;
  onToggleComplete: (lessonId: string, checked: boolean) => void;
  formatLessonMeta: (lesson: LessonVideo) => string;
};

function countCompletedInNode(
  node: FolderNode,
  getLessonCompletion: (id: string) => boolean,
): number {
  let count = node.lessons.filter((l) => getLessonCompletion(l.id)).length;
  Object.values(node.folders).forEach((child) => {
    count += countCompletedInNode(child, getLessonCompletion);
  });
  return count;
}

export default function FolderAccordion({
  node,
  parentKey = "",
  depth = 0,
  activeLessonId,
  getAccordionOpen,
  setAccordionOpen,
  getLessonCompletion,
  onSelectLesson,
  onToggleComplete,
  formatLessonMeta,
}: FolderAccordionProps) {
  const folderEntries = Object.entries(node.folders).sort(
    (firstEntry, secondEntry) =>
      firstEntry[0].localeCompare(secondEntry[0], undefined, {
        numeric: true,
        sensitivity: "base",
      }),
  );

  return (
    <div className="flex flex-col border-t border-slate-800/60">
      {folderEntries.map(([folderName, folderNode]) => {
        const folderKey = parentKey ? `${parentKey}/${folderName}` : folderName;
        const isOpen = getAccordionOpen(folderKey, false);
        const totalLessons = countLessonsInNode(folderNode);
        const completedLessons = countCompletedInNode(
          folderNode,
          getLessonCompletion,
        );

        return (
          <div
            key={folderKey}
            className="border-b border-slate-800/60 transition-colors"
          >
            <button
              type="button"
              onClick={() => setAccordionOpen(folderKey, !isOpen)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-slate-800/30"
              aria-expanded={isOpen}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-bold text-slate-100 md:text-[15px]">
                  {folderName}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {completedLessons} / {totalLessons} lessons
                </span>
              </div>

              <ChevronRight
                className={[
                  "h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200",
                  isOpen ? "rotate-90" : "rotate-0",
                ].join(" ")}
              />
            </button>

            {isOpen ? (
              <div
                className={[
                  "flex flex-col gap-1 bg-slate-950/30 p-2",
                  depth > 0 ? "ml-3 border-l border-slate-800/60 pl-3" : "",
                ].join(" ")}
              >
                <FolderAccordion
                  node={folderNode}
                  parentKey={folderKey}
                  depth={depth + 1}
                  activeLessonId={activeLessonId}
                  getAccordionOpen={getAccordionOpen}
                  setAccordionOpen={setAccordionOpen}
                  getLessonCompletion={getLessonCompletion}
                  onSelectLesson={onSelectLesson}
                  onToggleComplete={onToggleComplete}
                  formatLessonMeta={formatLessonMeta}
                />

                {folderNode.lessons
                  .slice()
                  .sort((firstLesson, secondLesson) =>
                    firstLesson.path.localeCompare(
                      secondLesson.path,
                      undefined,
                      {
                        numeric: true,
                        sensitivity: "base",
                      },
                    ),
                  )
                  .map((lesson) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      isActive={lesson.id === activeLessonId}
                      isCompleted={getLessonCompletion(lesson.id)}
                      onSelect={onSelectLesson}
                      onToggleComplete={onToggleComplete}
                      formatLessonMeta={formatLessonMeta}
                    />
                  ))}
              </div>
            ) : null}
          </div>
        );
      })}

      {depth === 0 && node.lessons.length ? (
        <div className="border-b border-slate-800/60 bg-slate-900/20">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[15px] font-bold text-slate-100">
                Main section
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {node.lessons.filter((l) => getLessonCompletion(l.id)).length} /{" "}
                {node.lessons.length} lessons
              </span>
            </div>
            <Video className="h-4 w-4 shrink-0 text-slate-600" />
          </div>

          <div className="flex flex-col gap-1 p-2">
            {node.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isActive={lesson.id === activeLessonId}
                isCompleted={getLessonCompletion(lesson.id)}
                onSelect={onSelectLesson}
                onToggleComplete={onToggleComplete}
                formatLessonMeta={formatLessonMeta}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
