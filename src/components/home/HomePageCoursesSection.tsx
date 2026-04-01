import { FolderOpen, SlidersHorizontal } from "lucide-react";
import type { CourseMetadata } from "../../types/course";
import CourseCard from "./CourseCard";

type HomePageCoursesSectionProps = {
  appName: string;
  filteredCourses: CourseMetadata[];
  onCourseClick: (course: CourseMetadata) => void;
  onAddCourse: () => void;
  onOpenDashboard: () => void;
};

export default function HomePageCoursesSection({
  appName,
  filteredCourses,
  onCourseClick,
  onAddCourse,
  onOpenDashboard,
}: HomePageCoursesSectionProps) {
  return (
    <section className="fade-in-up [animation-delay:260ms]">
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative">
          <p className="section-label">Library grid</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--theme-text)] md:text-4xl">
            All courses
          </h2>
          <p className="mt-2 text-sm text-[var(--theme-text-muted)]">
            Open a course or jump back into your latest lessons. Use the
            dashboard for edit and delete actions.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDashboard}
          className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Manage Library
        </button>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onCourseClick}
            />
          ))}
        </div>
      ) : (
        <div className="editorial-panel flex flex-col items-center justify-center rounded-[2rem] px-6 py-20 text-center">
          <div className="theme-chip-dark mb-6 rounded-full p-7">
            <FolderOpen className="h-14 w-14 text-[var(--theme-text-faint)]" />
          </div>
          <h2 className="text-2xl font-black text-[var(--theme-text)]">
            No courses added yet
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--theme-text-muted)]">
            Add a local course folder to start building your {appName} library
            and track progress lesson by lesson.
          </p>
          <button
            onClick={onAddCourse}
            className="glass-button mt-8 rounded-full px-8 py-3 font-semibold text-[var(--theme-text)]"
          >
            Select a folder
          </button>
        </div>
      )}
    </section>
  );
}
