import { Plus, Search } from "lucide-react";

type DashboardToolbarSectionProps = {
  filteredCount: number;
  searchQuery: string;
  onAddCourse: () => void;
  onSearchQueryChange: (value: string) => void;
};

export default function DashboardToolbarSection({
  filteredCount,
  searchQuery,
  onAddCourse,
  onSearchQueryChange,
}: DashboardToolbarSectionProps) {
  return (
    <section className="editorial-panel rounded-[2rem] p-4 md:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
            <Search className="h-5 w-5 text-[var(--theme-text-faint)]" />
          </div>
          <input
            type="text"
            placeholder="Search courses to manage..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="theme-field w-full rounded-[1.4rem] py-4 pl-14 pr-6 transition-all"
          />
        </div>

        <button
          type="button"
          onClick={onAddCourse}
          className="glass-button-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          Add New Course
        </button>
      </div>
    </section>
  );
}
