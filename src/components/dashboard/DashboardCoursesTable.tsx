import { PencilLine, Trash2 } from "lucide-react";
import type { CourseMetadata } from "../../types/course";

type DashboardCoursesTableProps = {
  courses: CourseMetadata[];
  defaultCoursePriority: string;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
};

export default function DashboardCoursesTable({
  courses,
  defaultCoursePriority,
  onEdit,
  onDelete,
}: DashboardCoursesTableProps) {
  return (
    <section className="editorial-panel overflow-hidden rounded-[2rem]">
      {courses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--theme-border)] text-left">
                <th className="theme-label-muted px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em]">
                  Course
                </th>
                <th className="theme-label-muted px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em]">
                  Priority
                </th>
                <th className="theme-label-muted px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em]">
                  Lessons
                </th>
                <th className="theme-label-muted px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em]">
                  Access
                </th>
                <th className="theme-label-muted px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-[var(--theme-border)] last:border-b-0"
                >
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-20 overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-panel)]">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="theme-preview-art flex h-full items-end p-2">
                            <span className="theme-chip-dark rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]">
                              {course.priority || defaultCoursePriority}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-[var(--theme-text)]">
                          {course.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-[var(--theme-text-muted)]">
                          {course.path}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <button
                      type="button"
                      onClick={() => onEdit(course.id)}
                      className="glass-button rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"
                    >
                      {course.priority || defaultCoursePriority}
                    </button>
                  </td>
                  <td className="px-5 py-5 text-sm font-semibold text-[var(--theme-text-soft)]">
                    {course.lessonCount}
                  </td>
                  <td className="px-5 py-5 text-sm text-[var(--theme-text-muted)]">
                    {course.hasHandle ? "Saved access" : "Manual reopen"}
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(course.id)}
                        className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(course.id)}
                        className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-red-100 hover:border-red-400/35 hover:bg-red-500/18"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-20 text-center">
          <h2 className="text-2xl font-black text-[var(--theme-text)]">
            No courses found
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--theme-text-muted)]">
            Adjust your search or head back to the library to import more
            courses.
          </p>
        </div>
      )}
    </section>
  );
}
