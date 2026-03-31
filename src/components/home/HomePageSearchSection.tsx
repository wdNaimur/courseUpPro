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
    <section className="fade-in-up [animation-delay:260ms] flex items-center lg:flex-nowrap flex-wrap justify-between gap-10">
      <div className="flex justify-between items-center w-full">
        <h1 className="inline-block bg-[linear-gradient(135deg,var(--theme-accent-strong)_0%,var(--theme-accent)_55%,var(--theme-accent-soft)_100%)] bg-clip-text pb-1 text-5xl font-black leading-[1.05] tracking-[-0.03em] text-transparent">
          CourseUp
        </h1>
        <button
          onClick={onAddCourse}
          className="glass-button-primary elastic-lift  shrink-0 items-center justify-center gap-2 self-start rounded-full px-6 py-3.5 font-bold text-white lg:self-auto lg:hidden inline-flex"
        >
          <Plus className="h-5 w-5" />
          Add New Course
        </button>
      </div>

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
            className="glass-button-primary elastic-lift  shrink-0 items-center justify-center gap-2 self-start rounded-full px-6 py-3.5 font-bold text-white lg:self-auto lg:inline-flex hidden"
          >
            <Plus className="h-5 w-5" />
            Add New Course
          </button>
        </div>
      </div>
    </section>
  );
}
