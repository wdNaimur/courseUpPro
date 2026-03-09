import React, { useState, useEffect, useRef, useCallback } from "react";
import { PlayCircle, ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import type { LessonVideo } from "../../types/course";

type VideoDisplayProps = {
  activeLesson: LessonVideo | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCompleteAndContinue: () => void;
  onPreviousLesson: () => void;
  hasNextLesson: boolean;
  hasPreviousLesson: boolean;
  formatLessonMeta: (lesson: LessonVideo) => string;
  nextLessonTitle?: string;
};

export default function VideoDisplay({
  activeLesson,
  videoRef,
  onCompleteAndContinue,
  onPreviousLesson,
  hasNextLesson,
  hasPreviousLesson,
  formatLessonMeta,
  nextLessonTitle,
}: VideoDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(false);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);

  const handlePlayNextNow = useCallback(() => {
    setShowAutoPlay(false);
    onCompleteAndContinue();
  }, [onCompleteAndContinue]);

  const cancelAutoPlay = useCallback(() => {
    setShowAutoPlay(false);
  }, []);

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
  
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);
  
        // Listen for video end
        useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (hasNextLesson) {
        setShowAutoPlay(true);
        setCountdown(5);
      }
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [videoRef, hasNextLesson, activeLesson]);

  // Handle countdown
  useEffect(() => {
    if (showAutoPlay && countdown > 0) {
      autoPlayTimerRef.current = window.setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showAutoPlay && countdown === 0) {
      setTimeout(() => {
        handlePlayNextNow();
      }, 0);
    }

    return () => {
      if (autoPlayTimerRef.current)
        window.clearTimeout(autoPlayTimerRef.current);
    };
  }, [showAutoPlay, countdown, handlePlayNextNow]);

  const handleMouseMove = () => {
    setShowOverlays(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (isFullscreen) setShowOverlays(false);
    }, 2500);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling full-screen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (!activeLesson) {
    return (
      <section className="flex h-full items-center justify-center p-4 md:p-12">
        <div className="grid max-w-2xl place-items-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-12 text-center shadow-2xl shadow-black/20">
          <div className="rounded-full bg-violet-600/20 p-6">
            <PlayCircle className="h-16 w-16 text-violet-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Ready to start learning?
          </h2>
          <p className="text-lg leading-relaxed text-slate-400">
            Select a lesson from the sidebar to begin.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 p-4 md:p-8">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isFullscreen && setShowOverlays(false)}
        onDoubleClick={toggleFullscreen}
        className={[
          "group relative overflow-hidden bg-black shadow-2xl shadow-black/40 transition-all",
          isFullscreen
            ? "h-screen w-screen rounded-none"
            : "rounded-3xl border border-slate-800",
        ].join(" ")}
      >
        <div
          className={[
            "w-full bg-black flex items-center justify-center",
            isFullscreen ? "h-full" : "aspect-video",
          ].join(" ")}
        >
          <video
            ref={videoRef}
            controls
            controlsList="nodownload"
            preload="metadata"
            className="h-full w-full max-h-full"
          />
        </div>

        {/* Udemy-style Auto-play Overlay */}
        {showAutoPlay && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-all duration-500">
            <button
              onClick={cancelAutoPlay}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="flex flex-col items-center text-center p-6 max-w-md min-w-md">
              <span className="text-violet-400 font-bold uppercase tracking-[0.2em] text-xs mb-4">
                Up Next
              </span>
              <h3 className="text-white text-2xl font-black mb-8 line-clamp-2">
                {nextLessonTitle}
              </h3>

              <div className="relative h-24 w-24 mb-8">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * countdown) / 5}
                    className="text-violet-500 transition-all duration-1000 linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">
                  {countdown}
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <button
                  onClick={cancelAutoPlay}
                  className="flex-1 rounded-xl bg-slate-800 py-4 font-bold text-white hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlayNextNow}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Play Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Overlays */}
        {!showAutoPlay && (
          <div
            className={[
              "pointer-events-none absolute inset-0 z-50 flex items-center justify-between px-4 md:px-12 transition-opacity duration-300",
              showOverlays || !isFullscreen ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                onPreviousLesson();
              }}
              disabled={!hasPreviousLesson}
              className={[
                "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 active:scale-90 disabled:opacity-0 md:h-16 md:w-16",
                !isFullscreen && "hidden group-hover:flex",
              ].join(" ")}
              title="Previous Lesson"
            >
              <ChevronLeft className="h-6 w-6 md:h-10 md:w-10" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                onCompleteAndContinue();
              }}
              disabled={!hasNextLesson}
              className={[
                "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/90 text-white shadow-2xl transition-all hover:bg-violet-500 active:scale-90 disabled:opacity-0 md:h-16 md:w-16",
                !isFullscreen && "hidden group-hover:flex",
              ].join(" ")}
              title="Complete & Next"
            >
              <ChevronRight className="h-6 w-6 md:h-10 md:w-10" />
            </button>
          </div>
        )}
      </div>

      {/* Lesson Info Card */}
      {!isFullscreen && (
        <div className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black leading-tight text-white md:text-3xl">
                {activeLesson.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span className="rounded-full bg-slate-800 px-3 py-1">
                  {formatLessonMeta(activeLesson)}
                </span>
                <span className="text-slate-600">•</span>
                <span className="truncate max-w-[300px]">
                  {activeLesson.file.name}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
              File Path
            </h4>
            <p className="font-mono text-sm text-slate-400">
              {activeLesson.path}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
