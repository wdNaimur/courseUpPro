import type { ReactNode } from "react";

type PlayerSidebarLayoutProps = {
  isSidebarVisible: boolean;
  onCloseSidebar: () => void;
  sidebar: ReactNode;
  content: ReactNode;
};

export default function PlayerSidebarLayout({
  isSidebarVisible,
  onCloseSidebar,
  sidebar,
  content,
}: PlayerSidebarLayoutProps) {
  return (
    <main className="relative flex flex-1 overflow-hidden lg:flex-row">
      {isSidebarVisible && (
        <div
          className="fixed inset-0 z-[80] bg-[var(--theme-overlay)]/70 lg:hidden"
          onClick={(event) => {
            event.stopPropagation();
            onCloseSidebar();
          }}
        />
      )}

      <div
        className={[
          "theme-player-drawer fixed inset-x-0 bottom-0 z-[90] max-h-[72vh] overflow-y-auto rounded-t-[1.8rem] border border-b-0 border-[var(--theme-border)] transition-transform duration-300 scrollbar-thin scrollbar-track-transparent lg:order-2 lg:static lg:z-auto lg:max-h-none lg:rounded-none lg:border-0 lg:border-l lg:transition-[width,opacity] lg:duration-300",
          isSidebarVisible
            ? "translate-y-0 lg:w-[360px] lg:opacity-100"
            : "translate-y-full pointer-events-none lg:w-0 lg:overflow-hidden lg:opacity-0",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-white/15 lg:hidden" />
        <div className="lg:h-full lg:w-[360px]">{sidebar}</div>
      </div>

      <div
        className={[
          "min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent lg:order-1",
          isSidebarVisible ? "pointer-events-none lg:pointer-events-auto" : "",
        ].join(" ")}
      >
        {content}
      </div>
    </main>
  );
}
