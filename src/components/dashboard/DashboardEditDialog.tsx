import { ImagePlus } from "lucide-react";
import type { ChangeEvent } from "react";
import type { CourseMetadata } from "../../types/course";

type DashboardEditDialogProps = {
  course: CourseMetadata;
  defaultCoursePriority: string;
  titleDraft: string;
  priorityDraft: string;
  thumbnailDraft: string;
  onTitleDraftChange: (value: string) => void;
  onPriorityDraftChange: (value: string) => void;
  onThumbnailSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onThumbnailClear: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DashboardEditDialog({
  course,
  defaultCoursePriority,
  titleDraft,
  priorityDraft,
  thumbnailDraft,
  onTitleDraftChange,
  onPriorityDraftChange,
  onThumbnailSelect,
  onThumbnailClear,
  onCancel,
  onConfirm,
}: DashboardEditDialogProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--theme-overlay)] px-4 backdrop-blur-md">
      <div className="editorial-panel w-full max-w-2xl rounded-[2rem] p-6">
        <div className="space-y-2">
          <p className="section-label">Course settings</p>
          <h3 className="text-2xl font-black text-white">Edit course details</h3>
          <p className="text-sm leading-6 theme-text-soft">
            Update the visual identity and label for{" "}
            <span className="font-semibold text-white">{course.title}</span>.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3">
            <label className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.22em]">
              Thumbnail
            </label>
            <div className="theme-soft-panel overflow-hidden rounded-[1.5rem]">
              {thumbnailDraft ? (
                <img
                  src={thumbnailDraft}
                  alt={`${course.title} thumbnail`}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="theme-preview-art aspect-[4/3] w-full" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="glass-button inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
                <ImagePlus className="h-4 w-4" />
                Upload thumbnail
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onThumbnailSelect}
                />
              </label>
              {thumbnailDraft ? (
                <button
                  type="button"
                  onClick={onThumbnailClear}
                  className="glass-button rounded-full px-4 py-2 text-sm font-bold"
                >
                  Remove image
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <label className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.22em]">
              Course title
            </label>
            <input
              type="text"
              value={titleDraft}
              onChange={(event) => onTitleDraftChange(event.target.value)}
              placeholder="Course title"
              className="theme-field w-full rounded-2xl px-4 py-3 text-sm font-semibold"
            />

            <label className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.22em]">
              Priority label
            </label>
            <input
              type="text"
              value={priorityDraft}
              onChange={(event) => onPriorityDraftChange(event.target.value)}
              placeholder={defaultCoursePriority}
              className="theme-field w-full rounded-2xl px-4 py-3 text-sm font-semibold"
            />
            <div className="flex flex-wrap gap-2">
              {["High", "Medium", "Low", "Focus", defaultCoursePriority].map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onPriorityDraftChange(option)}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition",
                      priorityDraft === option
                        ? "glass-button-primary"
                        : "glass-button",
                    ].join(" ")}
                  >
                    {option}
                  </button>
                ),
              )}
            </div>
            <p className="pt-2 text-sm leading-6 text-[var(--theme-text-muted)]">
              The uploaded image is stored locally with the course metadata and
              will immediately update the library cards.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="glass-button flex-1 rounded-2xl px-4 py-3 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="glass-button-primary flex-1 rounded-2xl px-4 py-3 text-sm font-bold"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
