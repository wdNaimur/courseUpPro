import {
  ArrowUpRight,
  Clock3,
  HardDriveDownload,
  Library,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { CourseMetadata } from "../../types/course";

type HomePageHeroSectionProps = {
  appName: string;
  coursesCount: number;
  recentCourse: CourseMetadata | null;
  cachedCourseCount: number;
  onAddCourse: () => void;
  onOpenDashboard: () => void;
};

export default function HomePageHeroSection({
  appName,
  coursesCount,
  recentCourse,
  cachedCourseCount,
  onAddCourse,
  onOpenDashboard,
}: HomePageHeroSectionProps) {
  return (
    <header className="theme-hero-shell relative overflow-hidden rounded-[2.25rem] border border-[var(--theme-border)] px-5 py-5 md:px-7 md:py-7">
      <div className="theme-hero-orb-warm absolute inset-x-[15%] top-[-9rem] h-52 rounded-full blur-3xl" />
      <div className="theme-hero-orb-accent absolute -right-10 bottom-8 h-44 w-44 rounded-full blur-3xl" />

      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_380px]">
        <section className="editorial-panel fade-in-up overflow-hidden rounded-[2rem] px-6 py-6 md:px-8 md:py-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-6">
              <div className="theme-chip-dark inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--theme-accent-soft)]" />
                {appName}
              </div>

              <div className="space-y-4">
                <p className="section-label">Local-first learning library</p>
                <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-[var(--theme-text)] md:text-6xl xl:text-[5.3rem]">
                  Organize downloaded courses like a curated collection.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--theme-text-muted)] md:text-base">
                  Inspired by editorial portfolio layouts rather than generic
                  dashboards: bold hierarchy, fast scanning, and quick access
                  to the course folders you actually use.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onAddCourse}
                  className="glass-button-primary elastic-lift flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold text-white"
                >
                  <HardDriveDownload className="h-5 w-5" />
                  Add New Course
                </button>
                <button
                  onClick={onOpenDashboard}
                  className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white/80"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                  Manage library
                </button>
              </div>
            </div>

            <div className="grid gap-3 self-start">
              <div className="theme-soft-panel rounded-[1.6rem] p-4">
                <p className="section-label">Library size</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-5xl font-black tracking-[-0.05em] text-[var(--theme-text)]">
                    {coursesCount}
                  </p>
                  <Library className="h-6 w-6 text-[var(--theme-accent-soft)]" />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--theme-text-muted)]">
                  Courses indexed and ready to reopen.
                </p>
              </div>
              <div className="theme-soft-panel rounded-[1.6rem] p-4">
                <p className="section-label">Latest return</p>
                <p className="mt-4 line-clamp-2 text-lg font-black text-[var(--theme-text)]">
                  {recentCourse ? recentCourse.title : "No course yet"}
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                  <Clock3 className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                  <span>{cachedCourseCount} cached for this session</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="fade-in-up grid gap-5 [animation-delay:120ms]">
          <div className="editorial-panel rounded-[2rem] p-5 md:p-6">
            <div className="space-y-2">
              <p className="section-label">Quick start</p>
              <h2 className="text-3xl font-black leading-tight text-[var(--theme-text)]">
                Drop in a folder and open it instantly.
              </h2>
              <p className="text-sm leading-6 text-[var(--theme-text-soft)]">
                Best results come from folders that include lesson videos and
                optional metadata files like `thumbnail.png` and `priority.txt`.
              </p>
            </div>

            <button
              onClick={onAddCourse}
              className="glass-button-primary elastic-lift mt-6 flex w-full items-center justify-center gap-2 rounded-[1.4rem] px-6 py-4 font-bold text-white"
            >
              <HardDriveDownload className="h-5 w-5" />
              Import Course Folder
            </button>
          </div>

          <div className="editorial-panel rounded-[2rem] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-label">System fit</p>
                <p className="mt-2 text-lg font-black text-[var(--theme-text)]">
                  Built for offline playback
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-[var(--theme-accent-soft)]" />
            </div>
            <div className="mt-5 grid gap-3">
              <div className="theme-soft-panel-strong rounded-[1.4rem] px-4 py-3">
                <p className="theme-label-muted text-xs uppercase tracking-[0.18em]">
                  Priority labels
                </p>
                <p className="mt-1 text-sm text-[var(--theme-text-soft)]">
                  Tag courses with focus level before they enter the library.
                </p>
              </div>
              <div className="theme-soft-panel-strong rounded-[1.4rem] px-4 py-3">
                <p className="theme-label-muted text-xs uppercase tracking-[0.18em]">
                  Reopen flow
                </p>
                <p className="mt-1 text-sm text-[var(--theme-text-soft)]">
                  Saved folder handles restore access when the browser allows
                  it.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
