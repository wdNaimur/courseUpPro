export type LessonVideo = {
  id: string;
  displayIndex: number;
  title: string;
  file: File;
  path: string;
  folderLabel: string;
  folderParts: string[];
};

export type FolderNode = {
  folders: Record<string, FolderNode>;
  lessons: LessonVideo[];
  name?: string;
};

export type CourseMetadata = {
  id: string;
  title: string;
  thumbnail?: string; // Base64 Data URL
  path: string;
  lastPlayedAt: number;
  lessonCount: number;
  hasHandle?: boolean;
};
