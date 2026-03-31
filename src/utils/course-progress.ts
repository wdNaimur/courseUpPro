export type LessonProgress = {
  completed: boolean;
  playbackTime: number;
  duration: number;
  updatedAt: number;
};

export type CourseProgressState = {
  lessons: Record<string, LessonProgress>;
  lastLessonId: string | null;
  playbackSpeed: number;
};

const EMPTY_PROGRESS_STATE: CourseProgressState = {
  lessons: {},
  lastLessonId: null,
  playbackSpeed: 1,
};

function normalizePlaybackSpeed(value: unknown) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0.5 &&
    value <= 2
    ? value
    : 1;
}

function createLessonProgress(partial?: Partial<LessonProgress>): LessonProgress {
  return {
    completed: Boolean(partial?.completed),
    playbackTime:
      typeof partial?.playbackTime === "number" && Number.isFinite(partial.playbackTime)
        ? Math.max(partial.playbackTime, 0)
        : 0,
    duration:
      typeof partial?.duration === "number" && Number.isFinite(partial.duration)
        ? Math.max(partial.duration, 0)
        : 0,
    updatedAt:
      typeof partial?.updatedAt === "number" && Number.isFinite(partial.updatedAt)
        ? partial.updatedAt
        : 0,
  };
}

export function readCourseProgress(rawValue: string | null): CourseProgressState {
  if (!rawValue) {
    return EMPTY_PROGRESS_STATE;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (
      parsed &&
      typeof parsed === "object" &&
      "lessons" in parsed &&
      parsed.lessons &&
      typeof parsed.lessons === "object"
    ) {
      return {
        lessons: Object.fromEntries(
          Object.entries(parsed.lessons).map(([lessonId, lessonProgress]) => [
            lessonId,
            createLessonProgress(
              lessonProgress && typeof lessonProgress === "object"
                ? (lessonProgress as Partial<LessonProgress>)
                : undefined,
            ),
          ]),
        ),
        lastLessonId:
          typeof parsed.lastLessonId === "string" ? parsed.lastLessonId : null,
        playbackSpeed: normalizePlaybackSpeed(parsed.playbackSpeed),
      };
    }

    if (parsed && typeof parsed === "object") {
      return {
        lessons: Object.fromEntries(
          Object.entries(parsed).map(([lessonId, completed]) => [
            lessonId,
            createLessonProgress({ completed: Boolean(completed) }),
          ]),
        ),
        lastLessonId: null,
        playbackSpeed: 1,
      };
    }
  } catch {
    return EMPTY_PROGRESS_STATE;
  }

  return EMPTY_PROGRESS_STATE;
}

export function countCompletedLessons(progressState: CourseProgressState) {
  return Object.values(progressState.lessons).filter(
    (lessonProgress) => lessonProgress.completed,
  ).length;
}

export function getTrackedCourseDuration(progressState: CourseProgressState) {
  return Object.values(progressState.lessons).reduce(
    (total, lessonProgress) => total + lessonProgress.duration,
    0,
  );
}

export function getCompletedCourseDuration(progressState: CourseProgressState) {
  return Object.values(progressState.lessons).reduce(
    (total, lessonProgress) =>
      lessonProgress.completed ? total + lessonProgress.duration : total,
    0,
  );
}

export function isLessonCompleted(
  progressState: CourseProgressState,
  lessonId: string,
) {
  return Boolean(progressState.lessons[lessonId]?.completed);
}

export function getLessonPlaybackTime(
  progressState: CourseProgressState,
  lessonId: string,
) {
  return progressState.lessons[lessonId]?.playbackTime ?? 0;
}

export function updateLessonCompletion(
  progressState: CourseProgressState,
  lessonId: string,
  completed: boolean,
) {
  if (progressState.lessons[lessonId]?.completed === completed) {
    return progressState;
  }

  return {
    ...progressState,
    lessons: {
      ...progressState.lessons,
      [lessonId]: createLessonProgress({
        ...progressState.lessons[lessonId],
        completed,
        updatedAt: Date.now(),
      }),
    },
  };
}

export function updateLessonPlayback(
  progressState: CourseProgressState,
  lessonId: string,
  playbackTime: number,
  duration: number,
) {
  const previousLessonProgress = progressState.lessons[lessonId];
  if (
    previousLessonProgress &&
    Math.abs(previousLessonProgress.playbackTime - playbackTime) < 0.25 &&
    Math.abs(previousLessonProgress.duration - duration) < 0.25
  ) {
    return progressState;
  }

  return {
    ...progressState,
    lessons: {
      ...progressState.lessons,
      [lessonId]: createLessonProgress({
        ...previousLessonProgress,
        playbackTime,
        duration,
        updatedAt: Date.now(),
      }),
    },
  };
}

export function setLastLessonId(
  progressState: CourseProgressState,
  lessonId: string | null,
) {
  if (progressState.lastLessonId === lessonId) {
    return progressState;
  }

  return {
    ...progressState,
    lastLessonId: lessonId,
  };
}

export function setPlaybackSpeed(
  progressState: CourseProgressState,
  playbackSpeed: number,
) {
  const normalizedPlaybackSpeed = normalizePlaybackSpeed(playbackSpeed);
  if (progressState.playbackSpeed === normalizedPlaybackSpeed) {
    return progressState;
  }

  return {
    ...progressState,
    playbackSpeed: normalizedPlaybackSpeed,
  };
}
