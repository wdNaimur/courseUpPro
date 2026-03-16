import { saveCourseProgress } from "../../storage/progress-repository";
import {
  setLastLessonId,
  updateLessonCompletion,
  updateLessonPlayback,
} from "../../utils/course-progress";
import type { CourseProgressRecord } from "../../types/progress";

export async function persistLessonPlayback(
  progress: CourseProgressRecord,
  courseId: string,
  lessonId: string,
  playbackPositionSeconds: number,
  durationSeconds: number,
) {
  const next = updateLessonPlayback(
    setLastLessonId(progress, lessonId),
    courseId,
    lessonId,
    playbackPositionSeconds,
    durationSeconds,
  );
  await saveCourseProgress(next);
  return next;
}

export async function persistLessonCompletion(
  progress: CourseProgressRecord,
  courseId: string,
  lessonId: string,
  completed: boolean,
) {
  const next = updateLessonCompletion(progress, courseId, lessonId, completed);
  await saveCourseProgress(next);
  return next;
}
