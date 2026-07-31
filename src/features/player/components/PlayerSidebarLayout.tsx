import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

type PlayerSidebarLayoutProps = {
  isSidebarVisible: boolean;
  onCloseSidebar: () => void;
  sidebar: ReactNode;
  content: ReactNode;
};

const SIDEBAR_WIDTH_STORAGE_KEY = "local-course-player::sidebar-width";
const DEFAULT_SIDEBAR_WIDTH = 360;
const MIN_SIDEBAR_WIDTH = 260;

export default function PlayerSidebarLayout({
  isSidebarVisible,
  onCloseSidebar,
  sidebar,
  content,
}: PlayerSidebarLayoutProps) {
  // Read persisted desktop sidebar width or default 360px
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof localStorage === "undefined") return DEFAULT_SIDEBAR_WIDTH;
    try {
      const saved = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const isDraggingRef = useRef(false);

  // Maximum width constraint for desktop: 45% of viewport width or 600px
  const getMaxWidth = useCallback(() => {
    if (typeof window === "undefined") return 600;
    return Math.min(600, Math.floor(window.innerWidth * 0.45));
  }, []);

  // Save width to localStorage
  const saveWidth = useCallback((width: number) => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(width));
    } catch (e) {
      console.error("Failed to save sidebar width", e);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsResizing(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const handleTouchStart = () => {
    isDraggingRef.current = true;
    setIsResizing(true);
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const maxW = getMaxWidth();
      const calculatedWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxW, calculatedWidth));
      setSidebarWidth(clampedWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !e.touches[0]) return;
      const maxW = getMaxWidth();
      const calculatedWidth = window.innerWidth - e.touches[0].clientX;
      const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxW, calculatedWidth));
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsResizing(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        saveWidth(sidebarWidth);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [getMaxWidth, saveWidth, sidebarWidth]);

  const handleDoubleClickResizer = () => {
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    saveWidth(DEFAULT_SIDEBAR_WIDTH);
  };

  return (
    <main className="relative flex flex-1 overflow-hidden lg:flex-row">
      {/* Mobile Backdrop */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 z-[80] bg-[var(--theme-overlay)]/70 lg:hidden"
          onClick={(event) => {
            event.stopPropagation();
            onCloseSidebar();
          }}
        />
      )}

      {/* Sidebar Panel Container */}
      <div
        style={
          isSidebarVisible
            ? ({ "--sidebar-desktop-w": `${sidebarWidth}px` } as React.CSSProperties)
            : undefined
        }
        className={[
          "theme-player-drawer fixed inset-x-0 bottom-0 z-[90] max-h-[72vh] overflow-y-auto rounded-t-[1.8rem] border border-b-0 border-[var(--theme-border)] transition-transform duration-300 scrollbar-thin scrollbar-track-transparent lg:order-2 lg:static lg:z-auto lg:max-h-none lg:rounded-none lg:border-0 lg:border-l lg:transition-[width,opacity] lg:duration-300",
          isResizing ? "lg:transition-none" : "",
          isSidebarVisible
            ? "translate-y-0 lg:w-[var(--sidebar-desktop-w,360px)] lg:opacity-100"
            : "translate-y-full pointer-events-none lg:w-0 lg:overflow-hidden lg:opacity-0",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Mobile Swipe Handle Indicator */}
        <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-white/15 lg:hidden" />

        {/* Inner Content Wrapper */}
        <div className="lg:h-full lg:w-[var(--sidebar-desktop-w,360px)] relative">
          {/* Desktop Resizer Handle Splitter (Desktop Only) */}
          {isSidebarVisible && (
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onDoubleClick={handleDoubleClickResizer}
              className={[
                "hidden lg:flex absolute -left-1.5 inset-y-0 z-30 w-3 cursor-col-resize items-center justify-center group select-none transition-colors",
                isResizing ? "bg-[var(--theme-accent)]/30" : "hover:bg-[var(--theme-accent)]/20",
              ].join(" ")}
              title="Drag to resize sidebar • Double click to reset"
            >
              <div
                className={[
                  "h-8 w-1 rounded-full transition-all",
                  isResizing
                    ? "bg-[var(--theme-accent-soft)] shadow-md shadow-[var(--theme-accent)]/50 scale-y-125"
                    : "bg-white/20 group-hover:bg-[var(--theme-accent-soft)] group-hover:scale-y-110",
                ].join(" ")}
              />
            </div>
          )}

          {sidebar}
        </div>
      </div>

      {/* Main Content Area (Video Display) */}
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
