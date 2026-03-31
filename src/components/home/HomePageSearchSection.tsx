import { Plus, Search } from "lucide-react";

type HomePageSearchSectionProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onAddCourse: () => void;
};

export default function HomePageSearchSection({
  searchQuery,
  onSearchQueryChange,
  onAddCourse,
}: HomePageSearchSectionProps) {
  return (
    <section className="fade-in-up [animation-delay:260ms] flex items-center justify-between gap-10">
      <h1 className="text-5xl font-black tracking-[-0.03em] text-[var(--theme-text)]">
        CourseUp
      </h1>

      <div className="editorial-panel fade-in-up rounded-[2rem] p-4 md:p-5 [animation-delay:160ms] w-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
              <Search className="h-5 w-5 text-[var(--theme-text-faint)]" />
            </div>
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="theme-field w-full rounded-[1.4rem] py-4 pl-14 pr-6 transition-all"
            />
          </div>
          <button
            onClick={onAddCourse}
            className="glass-button-primary elastic-lift inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full px-6 py-3.5 font-bold text-white lg:self-auto"
          >
            <Plus className="h-5 w-5" />
            Add New Course
          </button>
        </div>
      </div>
    </section>
  );
}
