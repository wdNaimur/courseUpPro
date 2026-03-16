import type { ImportedCourse } from "../../types/course";

export function openCourseSession(course: ImportedCourse) {
  return {
    course,
    initialLesson: course.lessons[0] ?? null,
  };
}
