import { parseImportedCourse } from "../import/import-course";
import { validateImportSelection } from "../import/validate-import";
import type { ImportedCourse, PickedCourseAsset } from "../../types/course";

export async function createCourseFromAssets(
  assets: PickedCourseAsset[],
  existingCourses: ImportedCourse[],
) {
  const validAssets = validateImportSelection(assets, existingCourses);
  return parseImportedCourse(validAssets);
}
