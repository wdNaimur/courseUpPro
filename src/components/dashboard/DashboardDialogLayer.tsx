import type { ChangeEvent } from "react";
import type { CourseMetadata } from "../../types/course";
import DashboardDeleteDialog from "./DashboardDeleteDialog";
import DashboardEditDialog from "./DashboardEditDialog";

type DashboardDialogLayerProps = {
  courseToDelete: CourseMetadata | null;
  courseToEdit: CourseMetadata | null;
  defaultCoursePriority: string;
  priorityDraft: string;
  thumbnailDraft: string;
  titleDraft: string;
  onCancelDelete: () => void;
  onCancelEdit: () => void;
  onConfirmDelete: () => void | Promise<void>;
  onConfirmEdit: () => void | Promise<void>;
  onPriorityDraftChange: (value: string) => void;
  onThumbnailClear: () => void;
  onThumbnailSelect: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onTitleDraftChange: (value: string) => void;
};

export default function DashboardDialogLayer({
  courseToDelete,
  courseToEdit,
  defaultCoursePriority,
  priorityDraft,
  thumbnailDraft,
  titleDraft,
  onCancelDelete,
  onCancelEdit,
  onConfirmDelete,
  onConfirmEdit,
  onPriorityDraftChange,
  onThumbnailClear,
  onThumbnailSelect,
  onTitleDraftChange,
}: DashboardDialogLayerProps) {
  return (
    <>
      {courseToDelete && (
        <DashboardDeleteDialog
          course={courseToDelete}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      )}

      {courseToEdit && (
        <DashboardEditDialog
          course={courseToEdit}
          defaultCoursePriority={defaultCoursePriority}
          titleDraft={titleDraft}
          priorityDraft={priorityDraft}
          thumbnailDraft={thumbnailDraft}
          onTitleDraftChange={onTitleDraftChange}
          onPriorityDraftChange={onPriorityDraftChange}
          onThumbnailSelect={onThumbnailSelect}
          onThumbnailClear={onThumbnailClear}
          onCancel={onCancelEdit}
          onConfirm={onConfirmEdit}
        />
      )}
    </>
  );
}
