import type { FolderNode, LessonVideo } from "../types/course";
import { getRelativePath } from "./course-helpers";

export type LessonDurationMap = Record<string, number>;
const DURATION_BATCH_SIZE = 2;

function yieldToMainThread() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

export async function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    const finalize = (duration: number) => {
      cleanup();
      resolve(Number.isFinite(duration) && duration > 0 ? duration : 0);
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => finalize(video.duration);
    video.onerror = () => finalize(0);
    video.src = objectUrl;
  });
}

export async function readVideoDurations(files: File[]) {
  const durations: number[] = [];

  for (let index = 0; index < files.length; index += DURATION_BATCH_SIZE) {
    const batch = files.slice(index, index + DURATION_BATCH_SIZE);
    const batchDurations = await Promise.all(
      batch.map((file) => readVideoDuration(file)),
    );
    durations.push(...batchDurations);

    if (index + DURATION_BATCH_SIZE < files.length) {
      await yieldToMainThread();
    }
  }

  return durations;
}

export function createLessonDurationMap(
  files: File[],
  durations: number[],
): LessonDurationMap {
  return Object.fromEntries(
    files.map((file, index) => [getRelativePath(file), durations[index] ?? 0]),
  );
}

export function formatDurationCompact(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "";
  }

  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${safeSeconds}s`;
}

export function formatDurationClock(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "";
  }

  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function sumLessonDurations(lessons: LessonVideo[]) {
  return lessons.reduce((total, lesson) => total + lesson.duration, 0);
}

export function sumFolderDurations(node: FolderNode): number {
  let total = sumLessonDurations(node.lessons);

  Object.values(node.folders).forEach((childNode) => {
    total += sumFolderDurations(childNode);
  });

  return total;
}
