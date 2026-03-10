import type { FolderNode, LessonVideo } from "../types/course";

const supportedVideoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

function stripFileExtension(value: string) {
  return value.replace(/\.(mp4|webm|ogg|mov|m4v)$/i, "");
}

export function isVideoFile(file: File) {
  const fileName = (file.name || "").toLowerCase();
  const mimeType = (file.type || "").toLowerCase();

  return (
    mimeType.startsWith("video/") ||
    supportedVideoExtensions.some((extension) => fileName.endsWith(extension))
  );
}

export function getRelativePath(file: File) {
  return (
    (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
    file.name
  );
}

export function getCourseFolderName(files: File[]) {
  if (files.length === 0) return "Local Course";
  const firstPath = getRelativePath(files[0]);
  return firstPath.includes("/") ? firstPath.split("/")[0] : "Local Course";
}

export function normalizeTitle(rawText: string) {
  return stripFileExtension(rawText)
    .replace(
      /^\s*\d+(?:[._-]\d+)*\s*(?:[._-]|\s)+(?:section|chapter|lesson|lecture|module|part|unit)\s*(?:\([^)]+\))?\s*/i,
      "",
    )
    .replace(/^\s*\d+(?:[._-]\d+)*\s*(?:[._-]|\s)+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSectionTitle(rawText: string) {
  const withoutExtension = stripFileExtension(rawText).trim();
  const sectionMatch = withoutExtension.match(
    /^\s*(\d+(?:[._-]\d+)*)\s*(?:[._-]|\s)+(section|chapter|lesson|lecture|module|part|unit)\s*(?:\(([^)]+)\))?\s+(.+)$/i,
  );

  if (sectionMatch) {
    const [, rawNumber, , rawVariant, rawTitle] = sectionMatch;
    const normalizedNumber = rawNumber.replace(/[._-]+/g, ".");
    const variant = rawVariant ? ` (${rawVariant.trim()})` : "";
    const title = normalizeTitle(rawTitle);
    return `Section ${normalizedNumber}${variant}: ${title}`;
  }

  const leadingNumberMatch = withoutExtension.match(
    /^\s*(\d+(?:[._-]\d+)*)\s*(?:[._-]|\s)+(.+)$/,
  );

  if (leadingNumberMatch) {
    const [, rawNumber, rawTitle] = leadingNumberMatch;
    const normalizedNumber = rawNumber.replace(/[._-]+/g, ".");
    return `Section ${normalizedNumber}: ${normalizeTitle(rawTitle)}`;
  }

  return normalizeTitle(rawText);
}

function formatFolderLabel(folderParts: string[]) {
  return folderParts.length
    ? folderParts.map((part) => normalizeSectionTitle(part)).join(" / ")
    : "Main section";
}

export function buildCourseKey(folderName: string, lessons: LessonVideo[]) {
  const signature = lessons.map((lesson) => lesson.path).join("|");
  return `local-course-progress::${folderName}::${signature}`;
}

function normalizeFolderKey(value: string) {
  return value.trim().toLowerCase();
}

export function stripSharedWrapperFolder(
  lessons: LessonVideo[],
  courseFolderName: string,
) {
  if (!lessons.length) return lessons;

  const wrapperCandidate = lessons[0].folderParts[0];
  if (!wrapperCandidate) return lessons;

  const normalizedCourseFolderName = normalizeFolderKey(courseFolderName);
  const normalizedWrapperCandidate = normalizeFolderKey(wrapperCandidate);

  const matchesCourseFolderName =
    normalizedWrapperCandidate === normalizedCourseFolderName;
  if (!matchesCourseFolderName) return lessons;

  const hasSharedWrapper = lessons.every(
    (lesson) =>
      lesson.folderParts.length >= 1 &&
      normalizeFolderKey(lesson.folderParts[0]) === normalizedWrapperCandidate,
  );

  if (!hasSharedWrapper) return lessons;

  return lessons.map((lesson) => {
    const normalizedFolderParts = lesson.folderParts.slice(1);
    return {
      ...lesson,
      folderParts: normalizedFolderParts,
      folderLabel: formatFolderLabel(normalizedFolderParts),
    };
  });
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
