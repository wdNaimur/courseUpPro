import type { LessonDurationMap } from "../../utils/duration";
import HomePagePriorityDialog from "./HomePagePriorityDialog";

type PendingCourseImport = {
  courseKey: string;
  folderName: string;
  thumbnail: string;
  path: string;
  lessonCount: number;
  totalDuration: number;
  hasHandle: boolean;
  videoFiles: File[];
  lessonDurations?: LessonDurationMap;
  handle?: FileSystemDirectoryHandle;
};

type HomePageDialogLayerProps = {
  defaultCoursePriority: string;
  pendingCourseImport: PendingCourseImport | null;
  priorityDraft: string;
  onClosePriorityDialog: () => void;
  onConfirmPriority: () => void;
  onPriorityDraftChange: (value: string) => void;
};

export default function HomePageDialogLayer({
  defaultCoursePriority,
  pendingCourseImport,
  priorityDraft,
  onClosePriorityDialog,
  onConfirmPriority,
  onPriorityDraftChange,
}: HomePageDialogLayerProps) {
  if (!pendingCourseImport) {
    return null;
  }

  return (
    <HomePagePriorityDialog
      defaultCoursePriority={defaultCoursePriority}
      priorityDraft={priorityDraft}
      onPriorityDraftChange={onPriorityDraftChange}
      onClose={onClosePriorityDialog}
      onConfirm={onConfirmPriority}
    />
  );
}

export type { PendingCourseImport };
