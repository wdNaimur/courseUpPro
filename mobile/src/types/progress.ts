export type LessonProgressRecord = {
  courseId: string;
  lessonId: string;
  playbackPositionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: number;
};

export type CourseProgressRecord = {
  courseId: string;
  lastLessonId: string | null;
  completedLessonCount: number;
  lastOpenedAt: number | null;
  updatedAt: number;
  lessons: Record<string, LessonProgressRecord>;
};
