import type { ImportedLesson, PickedCourseAsset } from "../types/course";

const videoExtensions = [".mp4", ".m4v", ".mov", ".webm", ".ogg"];

function stripFileExtension(value: string) {
  return value.replace(/\.(mp4|m4v|mov|webm|ogg)$/i, "");
}

export function isVideoAsset(asset: PickedCourseAsset) {
  const name = asset.name.toLowerCase();
  const mimeType = (asset.mimeType || "").toLowerCase();

  return (
    mimeType.startsWith("video/") ||
    videoExtensions.some((extension) => name.endsWith(extension))
  );
}

export function normalizeTitle(rawText: string) {
  return stripFileExtension(rawText)
    .replace(/^\s*\d+(?:[._-]\d+)*\s*(?:[._-]|\s)+/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSectionTitle(rawText: string) {
  const value = stripFileExtension(rawText).trim();
  const numbered = value.match(/^\s*(\d+(?:[._-]\d+)*)\s*(?:[._-]|\s)+(.+)$/);

  if (!numbered) {
    return normalizeTitle(value);
  }

  return `Section ${numbered[1].replace(/[._-]+/g, ".")}: ${normalizeTitle(numbered[2])}`;
}

export function buildCourseKey(folderName: string, lessons: ImportedLesson[]) {
  const signature = lessons.map((lesson) => lesson.relativePath).join("|");
  return `courseup-mobile::${folderName}::${signature}`;
}

function groupFolderParts(relativePath: string) {
  const parts = relativePath.split("/").filter(Boolean);
  return parts.length > 1 ? parts.slice(0, -1) : [];
}

function formatFolderLabel(folderParts: string[]) {
  return folderParts.length
    ? folderParts.map((part) => normalizeSectionTitle(part)).join(" / ")
    : "Main section";
}

export function createLessonsFromAssets(assets: PickedCourseAsset[]) {
  return [...assets]
    .filter(isVideoAsset)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map<ImportedLesson>((asset, index) => {
      const relativePath = asset.name;
      const folderParts = groupFolderParts(relativePath);

      return {
        id: relativePath,
        title: normalizeTitle(relativePath) || `Lesson ${index + 1}`,
        relativePath,
        mediaUri: asset.uri,
        folderLabel: formatFolderLabel(folderParts),
        folderParts,
        displayIndex: index + 1,
      };
    });
}
