import { useMemo, useState } from "react";
import type { CourseMetadata } from "../types/course";
import DashboardCoursesTable from "../components/dashboard/DashboardCoursesTable";
import DashboardDeleteDialog from "../components/dashboard/DashboardDeleteDialog";
import DashboardEditDialog from "../components/dashboard/DashboardEditDialog";
import DashboardHeaderSection from "../components/dashboard/DashboardHeaderSection";
import DashboardToolbarSection from "../components/dashboard/DashboardToolbarSection";
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
  onAddCourse: () => void;
  onSaveCourses: (courses: CourseMetadata[]) => void;
};

const DEFAULT_COURSE_PRIORITY = "Standard";

export default function LibraryDashboard({
  courses,
  onBack,
  onAddCourse,
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
  const courseToEdit =
    courses.find((course) => course.id === courseIdToEdit) ?? null;

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
        <DashboardDeleteDialog
          course={courseToDelete}
          onCancel={() => setCourseIdToDelete(null)}
          onConfirm={handleConfirmRemoveCourse}
        />
      )}

      {courseToEdit && (
        <DashboardEditDialog
          course={courseToEdit}
          defaultCoursePriority={DEFAULT_COURSE_PRIORITY}
          titleDraft={titleDraft}
          priorityDraft={priorityDraft}
          thumbnailDraft={thumbnailDraft}
          onTitleDraftChange={setTitleDraft}
          onPriorityDraftChange={setPriorityDraft}
          onThumbnailSelect={handleThumbnailSelect}
          onThumbnailClear={() => setThumbnailDraft("")}
          onCancel={handleCloseEditDialog}
          onConfirm={handleConfirmEdit}
        />
      )}

      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-8 pb-10">
        <DashboardHeaderSection coursesCount={courses.length} onBack={onBack} />
        <DashboardToolbarSection
          filteredCount={filteredCourses.length}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onAddCourse={onAddCourse}
        />
        <DashboardCoursesTable
          courses={filteredCourses}
          defaultCoursePriority={DEFAULT_COURSE_PRIORITY}
          onEdit={handleRequestEditPriority}
          onDelete={setCourseIdToDelete}
        />
      </div>
    </div>
  );
}
