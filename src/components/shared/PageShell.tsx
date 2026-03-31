import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  maxWidthClassName?: string;
};

const DEFAULT_MAX_WIDTH = "max-w-[1520px]";

export default function PageShell({
  children,
  maxWidthClassName = DEFAULT_MAX_WIDTH,
}: PageShellProps) {
  return (
    <div className="app-shell h-screen overflow-y-auto px-4 py-6 text-[var(--theme-text)] scrollbar-thin scrollbar-track-transparent md:px-8 lg:px-14">
      <div className={`mx-auto flex w-full flex-col gap-8 pb-10 ${maxWidthClassName}`}>
        {children}
      </div>
    </div>
  );
}
