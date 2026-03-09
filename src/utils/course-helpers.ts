import type { FolderNode, LessonVideo } from "../types/course";

const supportedVideoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

export function isVideoFile(file: File) {
  const fileName = (file.name || "").toLowerCase();
  const mimeType = (file.type || "").toLowerCase();

  return (
    mimeType.startsWith("video/") ||
    supportedVideoExtensions.some((extension) => fileName.endsWith(extension))
  );
}

export function getRelativePath(file: File) {
  return (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
}

export function getCourseFolderName(files: File[]) {
  if (files.length === 0) return "Local Course";
  const firstPath = getRelativePath(files[0]);
  return firstPath.includes("/") ? firstPath.split("/")[0] : "Local Course";
}

export function normalizeTitle(rawText: string) {
  return rawText
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildCourseKey(folderName: string, lessons: LessonVideo[]) {
  const signature = lessons.map((lesson) => lesson.path).join("|");
  return `local-course-progress::${folderName}::${signature}`;
}

export function createFolderTree(lessons: LessonVideo[]) {
  const root: FolderNode = { folders: {}, lessons: [] };

  lessons.forEach((lesson) => {
    let currentNode = root;

    lesson.folderParts.forEach((folderPart) => {
      if (!currentNode.folders[folderPart]) {
        currentNode.folders[folderPart] = {
          folders: {},
          lessons: [],
          name: folderPart,
        };
      }

      currentNode = currentNode.folders[folderPart];
    });

    currentNode.lessons.push(lesson);
  });

  return root;
}

export function countLessonsInNode(node: FolderNode): number {
  let total = node.lessons.length;

  Object.values(node.folders).forEach((folderNode) => {
    total += countLessonsInNode(folderNode);
  });

  return total;
}

export function formatLessonMeta(lesson: LessonVideo) {
  const parts: string[] = [];

  if (lesson.folderLabel) {
    parts.push(lesson.folderLabel);
  }

  parts.push(`Lesson ${lesson.displayIndex}`);
  return parts.join(" • ");
}
