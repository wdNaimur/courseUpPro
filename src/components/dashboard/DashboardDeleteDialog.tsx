import { AlertTriangle } from "lucide-react";
import type { CourseMetadata } from "../../types/course";

type DashboardDeleteDialogProps = {
  course: CourseMetadata;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DashboardDeleteDialog({
  course,
  onCancel,
  onConfirm,
}: DashboardDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[var(--theme-overlay)] px-4 backdrop-blur-md">
      <div className="editorial-panel w-full max-w-md rounded-[2rem] p-6">
        <div className="mb-5 flex items-start gap-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Delete course?</h3>
            <p className="mt-1 text-sm theme-text-muted">
              This will remove{" "}
              <span className="font-semibold theme-text">{course.title}</span>{" "}
              from your library and delete its saved progress.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="glass-button flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="glass-button-danger flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold"
          >
            Delete Course
          </button>
        </div>
      </div>
    </div>
  );
}
