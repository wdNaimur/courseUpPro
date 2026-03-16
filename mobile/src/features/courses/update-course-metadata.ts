import { listCourses, updateCourseMetadata } from "../../storage/course-repository";
import type { ImportedCourse } from "../../types/course";

type MetadataUpdates = {
  title: string;
  priority: string;
  thumbnailUri?: string | null;
};

export async function updateStoredCourseMetadata(
  course: ImportedCourse,
  updates: MetadataUpdates,
) {
  await updateCourseMetadata(course.id, {
    title: updates.title.trim(),
    priority: updates.priority.trim() || "Standard",
    thumbnailUri: updates.thumbnailUri ?? null,
    updatedAt: Date.now(),
  });

  return listCourses();
}
