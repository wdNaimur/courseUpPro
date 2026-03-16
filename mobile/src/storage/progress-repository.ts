import { initializeDatabase } from "./database";
import { createEmptyProgress } from "../utils/course-progress";
import type { CourseProgressRecord } from "../types/progress";

export async function getCourseProgress(courseId: string) {
  const db = await initializeDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS course_progress (
      course_id TEXT PRIMARY KEY NOT NULL,
      last_lesson_id TEXT,
      completed_lesson_count INTEGER NOT NULL,
      last_opened_at INTEGER,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      playback_position_seconds REAL NOT NULL,
      duration_seconds REAL NOT NULL,
      completed INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (course_id, lesson_id)
    );
  `);

  const courseRow = await db.getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM course_progress WHERE course_id = ?",
    [courseId],
  );
  const lessonRows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM lesson_progress WHERE course_id = ?",
    [courseId],
  );

  if (!courseRow) {
    return createEmptyProgress(courseId);
  }

  return {
    courseId,
    lastLessonId: courseRow.last_lesson_id ? String(courseRow.last_lesson_id) : null,
    completedLessonCount: Number(courseRow.completed_lesson_count),
    lastOpenedAt: courseRow.last_opened_at ? Number(courseRow.last_opened_at) : null,
    updatedAt: Number(courseRow.updated_at),
    lessons: Object.fromEntries(
      lessonRows.map((row) => [
        String(row.lesson_id),
        {
          courseId,
          lessonId: String(row.lesson_id),
          playbackPositionSeconds: Number(row.playback_position_seconds),
          durationSeconds: Number(row.duration_seconds),
          completed: Boolean(Number(row.completed)),
          updatedAt: Number(row.updated_at),
        },
      ]),
    ),
  } satisfies CourseProgressRecord;
}

export async function saveCourseProgress(progress: CourseProgressRecord) {
  const db = await initializeDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO course_progress
      (course_id, last_lesson_id, completed_lesson_count, last_opened_at, updated_at)
      VALUES (?, ?, ?, ?, ?)`,
    [
      progress.courseId,
      progress.lastLessonId,
      progress.completedLessonCount,
      progress.lastOpenedAt,
      progress.updatedAt,
    ],
  );

  for (const lesson of Object.values(progress.lessons)) {
    await db.runAsync(
      `INSERT OR REPLACE INTO lesson_progress
        (course_id, lesson_id, playback_position_seconds, duration_seconds, completed, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
      [
        lesson.courseId,
        lesson.lessonId,
        lesson.playbackPositionSeconds,
        lesson.durationSeconds,
        lesson.completed ? 1 : 0,
        lesson.updatedAt,
      ],
    );
  }
}
