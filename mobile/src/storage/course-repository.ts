import { initializeDatabase } from "./database";
import type { ImportedCourse, ImportedLesson } from "../types/course";

function mapLessonRow(row: Record<string, unknown>): ImportedLesson {
  return {
    id: String(row.id),
    title: String(row.title),
    relativePath: String(row.relative_path),
    mediaUri: String(row.media_uri),
    folderLabel: String(row.folder_label),
    folderParts: String(row.folder_path).split("/").filter(Boolean),
    displayIndex: Number(row.display_index),
  };
}

export async function listCourses() {
  const db = await initializeDatabase();
  const courseRows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM courses ORDER BY COALESCE(last_played_at, created_at) DESC",
  );

  const courses: ImportedCourse[] = [];

  for (const row of courseRows) {
    const lessonRows = await db.getAllAsync<Record<string, unknown>>(
      "SELECT * FROM lessons WHERE course_id = ? ORDER BY display_index ASC",
      [String(row.id)],
    );

    courses.push({
      id: String(row.id),
      title: String(row.title),
      priority: String(row.priority),
      sourceUri: String(row.source_uri),
      sourceType: row.source_type as ImportedCourse["sourceType"],
      accessStatus: row.access_status as ImportedCourse["accessStatus"],
      lessonCount: Number(row.lesson_count),
      thumbnailUri: row.thumbnail_uri ? String(row.thumbnail_uri) : null,
      lastPlayedAt: row.last_played_at ? Number(row.last_played_at) : null,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
      lessons: lessonRows.map(mapLessonRow),
    });
  }

  return courses;
}

export async function saveCourse(course: ImportedCourse) {
  const db = await initializeDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO courses
      (id, title, priority, source_uri, source_type, access_status, lesson_count, thumbnail_uri, last_played_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      course.id,
      course.title,
      course.priority,
      course.sourceUri,
      course.sourceType,
      course.accessStatus,
      course.lessonCount,
      course.thumbnailUri ?? null,
      course.lastPlayedAt ?? null,
      course.createdAt,
      course.updatedAt,
    ],
  );

  await db.runAsync("DELETE FROM lessons WHERE course_id = ?", [course.id]);

  for (const lesson of course.lessons) {
    await db.runAsync(
      `INSERT INTO lessons
        (id, course_id, title, relative_path, media_uri, folder_label, folder_path, display_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lesson.id,
        course.id,
        lesson.title,
        lesson.relativePath,
        lesson.mediaUri,
        lesson.folderLabel,
        lesson.folderParts.join("/"),
        lesson.displayIndex,
      ],
    );
  }
}

export async function updateCourseMetadata(
  courseId: string,
  updates: Pick<ImportedCourse, "title" | "priority" | "thumbnailUri" | "updatedAt">,
) {
  const db = await initializeDatabase();

  await db.runAsync(
    `UPDATE courses
      SET title = ?, priority = ?, thumbnail_uri = ?, updated_at = ?
      WHERE id = ?`,
    [updates.title, updates.priority, updates.thumbnailUri ?? null, updates.updatedAt, courseId],
  );
}
