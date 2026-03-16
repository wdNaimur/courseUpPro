import type { CourseProgressRecord, LessonProgressRecord } from "../types/progress";

export function createEmptyProgress(courseId: string): CourseProgressRecord {
  return {
    courseId,
    lastLessonId: null,
    completedLessonCount: 0,
    lastOpenedAt: null,
    updatedAt: Date.now(),
    lessons: {},
  };
}

export function countCompletedLessons(progress: CourseProgressRecord) {
  return Object.values(progress.lessons).filter((entry) => entry.completed).length;
}

export function updateLessonPlayback(
  progress: CourseProgressRecord,
  courseId: string,
  lessonId: string,
  playbackPositionSeconds: number,
  durationSeconds: number,
) {
  const nextLesson: LessonProgressRecord = {
    courseId,
    lessonId,
    playbackPositionSeconds: Math.max(playbackPositionSeconds, 0),
    durationSeconds: Math.max(durationSeconds, 0),
    completed: progress.lessons[lessonId]?.completed ?? false,
    updatedAt: Date.now(),
  };

  return {
    ...progress,
    lessons: {
      ...progress.lessons,
      [lessonId]: nextLesson,
    },
    updatedAt: Date.now(),
  };
}

export function updateLessonCompletion(
  progress: CourseProgressRecord,
  courseId: string,
  lessonId: string,
  completed: boolean,
) {
  const previous = progress.lessons[lessonId];
  const nextLesson: LessonProgressRecord = {
    courseId,
    lessonId,
    playbackPositionSeconds: previous?.playbackPositionSeconds ?? 0,
    durationSeconds: previous?.durationSeconds ?? 0,
    completed,
    updatedAt: Date.now(),
  };

  const next = {
    ...progress,
    lessons: {
      ...progress.lessons,
      [lessonId]: nextLesson,
    },
    updatedAt: Date.now(),
  };

  return {
    ...next,
    completedLessonCount: countCompletedLessons(next),
  };
}

export function setLastLessonId(progress: CourseProgressRecord, lessonId: string | null) {
  return {
    ...progress,
    lastLessonId: lessonId,
    lastOpenedAt: Date.now(),
    updatedAt: Date.now(),
  };
}
