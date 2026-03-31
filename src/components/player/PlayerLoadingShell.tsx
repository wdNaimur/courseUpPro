type PlayerLoadingShellProps = {
  showBackButton: boolean;
};

export default function PlayerLoadingShell({
  showBackButton,
}: PlayerLoadingShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,var(--theme-bg)_0%,var(--theme-bg)_50%,var(--theme-bg-alt)_100%)] text-[var(--theme-text)]">
      <header className="theme-header-shell z-20 shrink-0 border-b border-[var(--theme-border)] backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="skeleton-block h-10 w-10 rounded-2xl" />
            <div className="h-6 w-px bg-[var(--theme-border)]" />
            <div className="hidden md:block skeleton-block h-3.5 w-40" />
          </div>
          {showBackButton ? (
            <div className="skeleton-block h-10 w-36 rounded-2xl" />
          ) : (
            <div />
          )}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="theme-sidebar-shell h-full w-[360px] shrink-0 overflow-hidden border-r border-[var(--theme-border)] p-2">
          <div className="glass-panel flex h-full flex-col rounded-3xl p-5">
            <div className="space-y-3">
              <div className="skeleton-block h-5 w-32" />
              <div className="skeleton-block h-3.5 w-48" />
            </div>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="skeleton-block h-3 w-24" />
                <div className="skeleton-block h-3 w-14" />
              </div>
              <div className="skeleton-block h-3 w-28" />
              <div className="skeleton-block h-1.5 w-full rounded-full" />
            </div>

            <div className="mt-6 flex-1 space-y-3">
              <div className="skeleton-block h-[74px] w-full rounded-2xl" />
              <div className="skeleton-block h-[74px] w-full rounded-2xl" />
              <div className="skeleton-block h-[74px] w-[92%] rounded-2xl" />
              <div className="skeleton-block h-[74px] w-full rounded-2xl" />
              <div className="skeleton-block h-[74px] w-[85%] rounded-2xl" />
            </div>
          </div>
        </aside>

        <div className="h-full flex-1 overflow-hidden p-2">
          <section className="flex h-full flex-col gap-2">
            <div className="group relative overflow-hidden rounded-3xl border border-[var(--theme-border)] bg-black shadow-2xl shadow-black/40">
              <div className="aspect-video w-full bg-black p-4 md:p-5">
                <div className="theme-glass-inset flex h-full flex-col justify-between rounded-[1.75rem] border border-[var(--theme-border)] p-4 md:p-6">
                  <div className="space-y-3">
                    <div className="skeleton-block h-6 w-1/3" />
                    <div className="skeleton-block h-4 w-2/3" />
                  </div>

                  <div className="space-y-4">
                    <div className="skeleton-block h-1.5 w-full rounded-full" />
                    <div className="flex items-center justify-between gap-3 text-white">
                      <div className="flex items-center gap-2">
                        <div className="skeleton-block h-9 w-9 rounded-full" />
                        <div className="skeleton-block h-4 w-28" />
                        <div className="skeleton-block h-9 w-9 rounded-full" />
                        <div className="skeleton-block h-1.5 w-20 rounded-full md:w-28" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="skeleton-block h-9 w-20 rounded-full" />
                        <div className="skeleton-block h-9 w-9 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="theme-panel-surface grid gap-6 rounded-3xl border border-[var(--theme-border)] p-6 md:p-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="skeleton-block h-7 w-2/3" />
                  <div className="flex items-center gap-2">
                    <div className="skeleton-block h-7 w-28 rounded-full" />
                    <div className="skeleton-block h-3 w-2" />
                    <div className="skeleton-block h-4 w-40" />
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--theme-border)] pt-6">
                <div className="skeleton-block mb-3 h-3.5 w-20" />
                <div className="space-y-2">
                  <div className="skeleton-block h-4 w-full rounded-lg" />
                  <div className="skeleton-block h-4 w-5/6 rounded-lg" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
