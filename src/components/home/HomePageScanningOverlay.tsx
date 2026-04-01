export default function HomePageScanningOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--theme-overlay)] backdrop-blur-md">
      <div className="skeleton-panel w-full max-w-2xl rounded-[2rem] p-6 md:p-7">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="skeleton-block h-3.5 w-24" />
            <div className="skeleton-block h-7 w-2/3" />
            <div className="skeleton-block h-4 w-5/6" />
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="theme-soft-panel rounded-[1.6rem] p-4">
              <div className="space-y-3">
                <div className="skeleton-block h-4 w-32" />
                <div className="skeleton-block h-3 w-full rounded-full" />
                <div className="skeleton-block h-3 w-11/12 rounded-full" />
                <div className="skeleton-block h-3 w-4/5 rounded-full" />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="theme-soft-panel rounded-[1.4rem] p-4">
                <div className="skeleton-block h-3 w-20" />
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="skeleton-block h-10 w-16" />
                  <div className="skeleton-block h-6 w-6 rounded-full" />
                </div>
                <div className="mt-3 skeleton-block h-3.5 w-full" />
              </div>
              <div className="theme-soft-panel rounded-[1.4rem] p-4">
                <div className="skeleton-block h-3 w-24" />
                <div className="mt-4 skeleton-block h-5 w-4/5" />
                <div className="mt-3 flex items-center gap-2">
                  <div className="skeleton-block h-4 w-4 rounded-full" />
                  <div className="skeleton-block h-3.5 w-24" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="skeleton-block h-12 rounded-full" />
            <div className="skeleton-block h-12 rounded-full" />
            <div className="skeleton-block h-12 rounded-full" />
            <div className="skeleton-block h-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
