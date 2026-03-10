import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ImagePlus, PencilLine, Search, Trash2 } from "lucide-react";
import type { CourseMetadata } from "../types/course";
import { db } from "../utils/db";
import {
  removeHandleEntryIfExists,
  verifyReadWritePermission,
  writeHandleDataUrlFile,
  writeHandleTextFile,
} from "../utils/file-system";

type LibraryDashboardProps = {
  courses: CourseMetadata[];
  onBack: () => void;
  onSaveCourses: (courses: CourseMetadata[]) => void;
};

const DEFAULT_COURSE_PRIORITY = "Standard";

export default function LibraryDashboard({
  courses,
  onBack,
  onSaveCourses,
}: LibraryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseIdToDelete, setCourseIdToDelete] = useState<string | null>(null);
  const [courseIdToEdit, setCourseIdToEdit] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [priorityDraft, setPriorityDraft] = useState(DEFAULT_COURSE_PRIORITY);
  const [thumbnailDraft, setThumbnailDraft] = useState("");

  const filteredCourses = useMemo(
    () =>
      courses
        .filter((course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt),
    [courses, searchQuery],
  );

  const courseToDelete =
    courses.find((course) => course.id === courseIdToDelete) ?? null;
  const courseToEdit = courses.find((course) => course.id === courseIdToEdit) ?? null;

  const handleRequestEditPriority = (courseId: string) => {
    const course = courses.find((entry) => entry.id === courseId);
    if (!course) return;

    setCourseIdToEdit(courseId);
    setTitleDraft(course.title);
    setPriorityDraft(course.priority || DEFAULT_COURSE_PRIORITY);
    setThumbnailDraft(course.thumbnail || "");
  };

  const handleCloseEditDialog = () => {
    setCourseIdToEdit(null);
    setTitleDraft("");
    setPriorityDraft(DEFAULT_COURSE_PRIORITY);
    setThumbnailDraft("");
  };

  const handleThumbnailSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const isImage = selectedFile.type.startsWith("image/");
    if (!isImage) {
      window.alert("Please choose an image file for the thumbnail.");
      return;
    }

    const thumbnailBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(selectedFile);
    }).catch(() => "");

    if (thumbnailBase64) {
      setThumbnailDraft(thumbnailBase64);
    }
    event.target.value = "";
  };

  const handleConfirmEdit = async () => {
    if (!courseIdToEdit || !courseToEdit) return;

    const normalizedTitle = titleDraft.trim();
    const normalizedPriority = priorityDraft.trim() || DEFAULT_COURSE_PRIORITY;
    if (!normalizedTitle) {
      window.alert("Course title cannot be empty.");
      return;
    }

    if (courseToEdit.hasHandle) {
      try {
        const handle = await db.getHandle(courseToEdit.id);
        if (handle) {
          const hasPermission = await verifyReadWritePermission(handle);
          if (hasPermission) {
            await writeHandleTextFile(
              handle,
              "course.json",
              JSON.stringify({ title: normalizedTitle }, null, 2),
            );
            await writeHandleTextFile(handle, "priority.txt", normalizedPriority);

            if (thumbnailDraft) {
              await writeHandleDataUrlFile(handle, "thumbnail.png", thumbnailDraft);
            } else {
              await removeHandleEntryIfExists(handle, "thumbnail.png");
            }
          }
        }
      } catch (error) {
        console.error("Failed to persist course metadata files", error);
      }
    }

    onSaveCourses(
      courses.map((course) =>
        course.id === courseIdToEdit
          ? {
              ...course,
              title: normalizedTitle,
              priority: normalizedPriority,
              thumbnail: thumbnailDraft || undefined,
            }
          : course,
      ),
    );
    handleCloseEditDialog();
  };

  const handleConfirmRemoveCourse = async () => {
    if (!courseIdToDelete) return;

    onSaveCourses(courses.filter((course) => course.id !== courseIdToDelete));
    localStorage.removeItem(courseIdToDelete);
    await db.removeHandle(courseIdToDelete);
    setCourseIdToDelete(null);
  };

  return (
    <div className="app-shell h-screen overflow-y-auto px-4 py-6 text-[var(--theme-text)] scrollbar-thin scrollbar-track-transparent md:px-8 lg:px-14">
      {courseToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[var(--theme-overlay)] px-4 backdrop-blur-md">
          <div className="editorial-panel w-full max-w-md rounded-[2rem] p-6">
            <div className="mb-5 flex items-start gap-4">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Delete course?</h3>
                <p className="mt-1 text-sm theme-text-muted">
                  This will remove <span className="font-semibold theme-text">{courseToDelete.title}</span> from your library and delete its saved progress.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCourseIdToDelete(null)}
                className="glass-button flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoveCourse}
                className="glass-button-danger flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {courseToEdit && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--theme-overlay)] px-4 backdrop-blur-md">
          <div className="editorial-panel w-full max-w-2xl rounded-[2rem] p-6">
            <div className="space-y-2">
              <p className="section-label">Course settings</p>
              <h3 className="text-2xl font-black text-white">Edit course details</h3>
              <p className="text-sm leading-6 theme-text-soft">
                Update the visual identity and label for <span className="font-semibold text-white">{courseToEdit.title}</span>.
              </p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                  Thumbnail
                </label>
                <div className="overflow-hidden rounded-[1.5rem] border border-[var(--theme-border)] bg-black/18">
                  {thumbnailDraft ? (
                    <img
                      src={thumbnailDraft}
                      alt={`${courseToEdit.title} thumbnail`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full bg-[radial-gradient(circle_at_top_left,_rgba(118,184,168,0.24),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(61,141,122,0.2),_transparent_34%),linear-gradient(145deg,_rgba(15,20,19,0.98),_rgba(34,49,44,0.84))]" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="glass-button inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
                    <ImagePlus className="h-4 w-4" />
                    Upload thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailSelect}
                    />
                  </label>
                  {thumbnailDraft ? (
                    <button
                      type="button"
                      onClick={() => setThumbnailDraft("")}
                      className="glass-button rounded-full px-4 py-2 text-sm font-bold"
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                  Course title
                </label>
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  placeholder="Course title"
                  className="w-full rounded-2xl border border-[var(--theme-border)] bg-black/18 px-4 py-3 text-sm font-semibold text-[var(--theme-text)] placeholder:text-[var(--theme-text-faint)] focus:border-[color:color-mix(in_srgb,var(--theme-accent-soft)_35%,transparent)] focus:outline-none focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--theme-accent-soft)_10%,transparent)]"
                />

                <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                  Priority label
                </label>
                <input
                  type="text"
                  value={priorityDraft}
                  onChange={(event) => setPriorityDraft(event.target.value)}
                  placeholder={DEFAULT_COURSE_PRIORITY}
                  className="w-full rounded-2xl border border-[var(--theme-border)] bg-black/18 px-4 py-3 text-sm font-semibold text-[var(--theme-text)] placeholder:text-[var(--theme-text-faint)] focus:border-[color:color-mix(in_srgb,var(--theme-accent-soft)_35%,transparent)] focus:outline-none focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--theme-accent-soft)_10%,transparent)]"
                />
                <div className="flex flex-wrap gap-2">
                  {["High", "Medium", "Low", "Focus", DEFAULT_COURSE_PRIORITY].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPriorityDraft(option)}
                      className={[
                        "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition",
                        priorityDraft === option ? "glass-button-primary" : "glass-button",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <p className="pt-2 text-sm leading-6 text-[var(--theme-text-muted)]">
                  The uploaded image is stored locally with the course metadata and will immediately update the library cards.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCloseEditDialog}
                className="glass-button flex-1 rounded-2xl px-4 py-3 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEdit}
                className="glass-button-primary flex-1 rounded-2xl px-4 py-3 text-sm font-bold"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-8 pb-10">
        <header className="editorial-panel rounded-[2.25rem] px-5 py-6 md:px-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <button
                type="button"
                onClick={onBack}
                className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to library
              </button>
              <div>
                <p className="section-label">Library dashboard</p>
                <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--theme-text)] md:text-5xl">
                  Manage your course catalog
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--theme-text-muted)] md:text-base">
                  This view is for maintenance tasks only: edit labels, clean up old courses, and keep the main library screen focused on opening content.
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.6rem] border border-[var(--theme-border)] bg-black/18 p-4 lg:min-w-[260px]">
              <p className="section-label">Dashboard stats</p>
              <p className="text-4xl font-black tracking-[-0.05em] text-[var(--theme-text)]">
                {courses.length}
              </p>
              <p className="text-sm text-[var(--theme-text-muted)]">
                Total courses currently indexed in your local library.
              </p>
            </div>
          </div>
        </header>

        <section className="editorial-panel rounded-[2rem] p-4 md:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
                <Search className="h-5 w-5 text-[var(--theme-text-faint)]" />
              </div>
              <input
                type="text"
                placeholder="Search courses to manage..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-[1.4rem] border border-[var(--theme-border)] bg-black/18 py-4 pl-14 pr-6 text-[var(--theme-text)] placeholder:text-[var(--theme-text-faint)] focus:border-[color:color-mix(in_srgb,var(--theme-accent-soft)_35%,transparent)] focus:outline-none focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--theme-accent-soft)_10%,transparent)] transition-all"
              />
            </div>

            <div className="rounded-[1.3rem] border border-[var(--theme-border)] bg-black/18 px-4 py-3 text-sm text-[var(--theme-text-soft)]">
              <span className="font-bold text-white">{filteredCourses.length}</span>{" "}
              {filteredCourses.length === 1 ? "course" : "courses"} in view
            </div>
          </div>
        </section>

        <section className="editorial-panel overflow-hidden rounded-[2rem]">
          {filteredCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--theme-border)] text-left">
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">Course</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">Priority</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">Lessons</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">Access</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b border-[var(--theme-border)] last:border-b-0">
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
                              <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_left,_rgba(118,184,168,0.24),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(61,141,122,0.2),_transparent_34%),linear-gradient(145deg,_rgba(15,20,19,0.98),_rgba(34,49,44,0.84))] p-2">
                                <span className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">
                                  {course.priority || DEFAULT_COURSE_PRIORITY}
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
                          onClick={() => handleRequestEditPriority(course.id)}
                          className="glass-button rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"
                        >
                          {course.priority || DEFAULT_COURSE_PRIORITY}
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
                            onClick={() => handleRequestEditPriority(course.id)}
                            className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                          >
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setCourseIdToDelete(course.id)}
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
              <h2 className="text-2xl font-black text-[var(--theme-text)]">No courses found</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--theme-text-muted)]">
                Adjust your search or head back to the library to import more courses.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
