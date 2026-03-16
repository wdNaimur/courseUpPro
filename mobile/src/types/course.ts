export type ImportedLesson = {
  id: string;
  title: string;
  relativePath: string;
  mediaUri: string;
  folderLabel: string;
  folderParts: string[];
  displayIndex: number;
};

export type ImportedCourse = {
  id: string;
  title: string;
  priority: string;
  sourceUri: string;
  sourceType: "directory" | "document-tree" | "file-batch";
  accessStatus: "available" | "unavailable" | "permission_required";
  lessonCount: number;
  thumbnailUri?: string | null;
  lastPlayedAt?: number | null;
  createdAt: number;
  updatedAt: number;
  lessons: ImportedLesson[];
};

export type PickedCourseAsset = {
  id: string;
  name: string;
  uri: string;
  mimeType: string | null;
};
