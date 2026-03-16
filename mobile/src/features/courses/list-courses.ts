import { listCourses } from "../../storage/course-repository";

export async function listStoredCourses() {
  return listCourses();
}
