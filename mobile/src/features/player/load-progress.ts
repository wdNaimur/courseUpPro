import { getCourseProgress } from "../../storage/progress-repository";

export async function loadCourseProgress(courseId: string) {
  return getCourseProgress(courseId);
}
