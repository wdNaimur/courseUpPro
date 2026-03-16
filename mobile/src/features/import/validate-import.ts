import type { ImportedCourse, PickedCourseAsset } from "../../types/course";
import { isVideoAsset } from "../../utils/course-helpers";

export function validateImportSelection(
  assets: PickedCourseAsset[],
  existingCourses: ImportedCourse[],
) {
  const videoAssets = assets.filter(isVideoAsset);
  if (!videoAssets.length) {
    throw new Error("No supported video files were found in the selected course.");
  }

  const duplicate = existingCourses.find((course) =>
    videoAssets.every((asset) => course.lessons.some((lesson) => lesson.mediaUri === asset.uri)),
  );

  if (duplicate) {
    throw new Error(`"${duplicate.title}" is already in your library.`);
  }

  return videoAssets;
}
