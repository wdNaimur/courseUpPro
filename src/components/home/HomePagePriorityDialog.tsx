type HomePagePriorityDialogProps = {
  defaultCoursePriority: string;
  priorityDraft: string;
  onPriorityDraftChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function HomePagePriorityDialog({
  defaultCoursePriority,
  priorityDraft,
  onPriorityDraftChange,
  onClose,
  onConfirm,
}: HomePagePriorityDialogProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--theme-overlay)] px-4 backdrop-blur-md">
      <div className="editorial-panel w-full max-w-lg rounded-[2rem] p-6">
        <div className="space-y-2">
          <p className="section-label">Course priority</p>
          <h3 className="text-2xl font-black text-white">
            Set priority before adding
          </h3>
          <p className="text-sm leading-6 theme-text-soft">
            Choose how this course should be labeled in your library. You can
            use values like `High`, `Medium`, `Low`, `Focus`, or anything else
            that fits your workflow.
          </p>
        </div>

        <div className="mt-6 space-y-3">
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
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="glass-button flex-1 rounded-2xl px-4 py-3 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="glass-button-primary flex-1 rounded-2xl px-4 py-3 text-sm font-bold"
          >
            Save and open
          </button>
        </div>
      </div>
    </div>
  );
}
