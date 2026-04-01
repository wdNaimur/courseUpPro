import { ArrowLeft } from "lucide-react";

type DashboardHeaderSectionProps = {
  coursesCount: number;
  onBack: () => void;
};

export default function DashboardHeaderSection({
  coursesCount,
  onBack,
}: DashboardHeaderSectionProps) {
  return (
    <header className="editorial-panel rounded-[2.25rem] px-5 py-6 md:px-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <button
            type="button"
            onClick={onBack}
            className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to library
          </button>
          <div>
            <p className="section-label">Library dashboard</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--theme-text)] md:text-5xl">
              Manage your course catalog
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--theme-text-muted)] md:text-base">
              This view is for maintenance tasks only: edit labels, clean up old
              courses, and keep the main library screen focused on opening
              content.
            </p>
          </div>
        </div>

        <div className="theme-soft-panel grid gap-3 rounded-[1.6rem] p-4 lg:min-w-[260px]">
          <p className="section-label">Dashboard stats</p>
          <p className="text-4xl font-black tracking-[-0.05em] text-[var(--theme-text)]">
            {coursesCount}
          </p>
          <p className="text-sm text-[var(--theme-text-muted)]">
            Total courses currently indexed in your local library.
          </p>
        </div>
      </div>
    </header>
  );
}
