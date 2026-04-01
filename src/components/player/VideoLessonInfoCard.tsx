import type { LessonVideo } from "../../types/course";

type VideoLessonInfoCardProps = {
  activeLesson: LessonVideo;
  formatLessonMeta: (lesson: LessonVideo) => string;
};

export default function VideoLessonInfoCard({
  activeLesson,
  formatLessonMeta,
}: VideoLessonInfoCardProps) {
  return (
    <div className="theme-panel-surface grid gap-6 rounded-3xl border border-[var(--theme-border)] p-6 md:p-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black leading-tight text-[var(--theme-text)] md:text-3xl">
            {activeLesson.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--theme-text-muted)]">
            <span className="rounded-full bg-[var(--theme-panel-soft)] px-3 py-1">
              {formatLessonMeta(activeLesson)}
            </span>
            <span className="text-[var(--theme-text-faint)]">&bull;</span>
            <span className="max-w-[300px] truncate">{activeLesson.file.name}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--theme-border)] pt-6">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--theme-text-faint)]">
          File Path
        </h4>
        <p className="font-mono text-sm text-[var(--theme-text-muted)]">
          {activeLesson.path}
        </p>
      </div>
    </div>
  );
}
