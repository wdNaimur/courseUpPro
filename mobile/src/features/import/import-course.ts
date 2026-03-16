import type { PickedCourseAsset } from "../../types/course";
import { buildCourseKey, createLessonsFromAssets } from "../../utils/course-helpers";

export function parseImportedCourse(assets: PickedCourseAsset[]) {
  const lessons = createLessonsFromAssets(assets);
  const folderName = assets[0]?.name?.split("/")[0] || "Imported Course";
  const timestamp = Date.now();

  return {
    id: buildCourseKey(folderName, lessons),
    title: folderName,
    priority: "Standard",
    sourceUri: assets[0]?.uri || "",
    sourceType: "file-batch" as const,
    accessStatus: "available" as const,
    lessonCount: lessons.length,
    thumbnailUri: null,
    lastPlayedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    lessons,
  };
}
