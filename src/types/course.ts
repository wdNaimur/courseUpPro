export type LessonVideo = {
  id: string;
  displayIndex: number;
  title: string;
  file: File;
  path: string;
  folderLabel: string;
  folderParts: string[];
  duration: number;
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
  priority?: string;
  path: string;
  lastPlayedAt: number;
  lessonCount: number;
  totalDuration?: number;
  hasHandle?: boolean;
};
