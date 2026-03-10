import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import {
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Expand,
  Shrink,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { LessonVideo } from "../../types/course";

type VideoDisplayProps = {
  activeLesson: LessonVideo | null;
  courseTitle: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  onCompleteAndContinue: () => void;
  onPreviousLesson: () => void;
  hasNextLesson: boolean;
  hasPreviousLesson: boolean;
  isCurrentLessonCompleted: boolean;
  formatLessonMeta: (lesson: LessonVideo) => string;
  nextLessonTitle?: string;
};

export default function VideoDisplay({
  activeLesson,
  courseTitle,
  videoRef,
  onCompleteAndContinue,
  onPreviousLesson,
  hasNextLesson,
  hasPreviousLesson,
  isCurrentLessonCompleted,
  formatLessonMeta,
  nextLessonTitle,
}: VideoDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(false);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isInteractingWithControls, setIsInteractingWithControls] =
    useState(false);
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);
  const [centerAction, setCenterAction] = useState<"play" | "pause" | null>(
    null,
  );
  const timerRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);
  const centerActionTimerRef = useRef<number | null>(null);
  const pauseOverlayTimerRef = useRef<number | null>(null);

  const clearOverlayTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearPauseOverlayTimer = useCallback(() => {
    if (pauseOverlayTimerRef.current) {
      window.clearTimeout(pauseOverlayTimerRef.current);
      pauseOverlayTimerRef.current = null;
    }
  }, []);

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
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted || video.volume === 0);
    };

    handleLoadedMetadata();
    handleTimeUpdate();
    handleVolumeChange();
    setIsPlaying(!video.paused);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("durationchange", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("durationchange", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [videoRef, activeLesson]);

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

  useEffect(() => {
    return () => {
      clearOverlayTimer();
      clearPauseOverlayTimer();
    };
  }, [clearOverlayTimer, clearPauseOverlayTimer]);

  const handleMouseMove = () => {
    setShowOverlays(true);
    clearOverlayTimer();
    timerRef.current = window.setTimeout(() => {
      if (isFullscreen && !isInteractingWithControls) {
        setShowOverlays(false);
      }
    }, 500);
  };

  const handleControlsMouseEnter = () => {
    setIsInteractingWithControls(true);
    clearOverlayTimer();
    if (isFullscreen) {
      setShowOverlays(true);
    }
  };

  const handleControlsMouseLeave = () => {
    setIsInteractingWithControls(false);
    if (isFullscreen) {
      handleMouseMove();
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      setShowOverlays(true);
    } else {
      clearOverlayTimer();
      clearPauseOverlayTimer();
      setIsInteractingWithControls(false);
      setShowPauseOverlay(false);
      setShowOverlays(false);
    }
  }, [isFullscreen, clearOverlayTimer, clearPauseOverlayTimer]);

  useEffect(() => {
    setShowAutoPlay(false);
    setCountdown(5);
    clearPauseOverlayTimer();
    setShowPauseOverlay(false);
    if (isFullscreen) {
      setShowOverlays(true);
    }
  }, [activeLesson, isFullscreen, clearPauseOverlayTimer]);

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

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        return;
      });
      setCenterAction("play");
      return;
    }
    video.pause();
    setCenterAction("pause");
  };

  useEffect(() => {
    clearPauseOverlayTimer();

    if (!isPlaying) {
      clearOverlayTimer();
      setShowOverlays(true);
      pauseOverlayTimerRef.current = window.setTimeout(() => {
        if (!isInteractingWithControls) {
          setShowPauseOverlay(true);
        }
      }, 3000);
    } else {
      setShowPauseOverlay(false);
    }

    return () => {
      clearPauseOverlayTimer();
    };
  }, [
    isPlaying,
    isInteractingWithControls,
    clearOverlayTimer,
    clearPauseOverlayTimer,
  ]);

  useEffect(() => {
    if (!centerAction) return;
    if (centerActionTimerRef.current) {
      window.clearTimeout(centerActionTimerRef.current);
    }
    centerActionTimerRef.current = window.setTimeout(() => {
      setCenterAction(null);
    }, 450);

    return () => {
      if (centerActionTimerRef.current) {
        window.clearTimeout(centerActionTimerRef.current);
      }
    };
  }, [centerAction]);

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(event.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = Number(event.target.value);
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Math.min(
      Math.max(video.currentTime + seconds, 0),
      Number.isFinite(video.duration) ? video.duration : video.currentTime,
    );
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const getRangeBackground = (
    value: number,
    max: number,
    filledColor: string,
    baseColor: string,
  ) => {
    const safeMax = max > 0 ? max : 1;
    const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100);
    return `linear-gradient(to right, ${filledColor} 0%, ${filledColor} ${percentage}%, ${baseColor} ${percentage}%, ${baseColor} 100%)`;
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const totalSeconds = Math.floor(seconds);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getPauseTitle = (title: string) =>
    title.replace(/^\s*\d+[\s._-]*/, "").trim() || title;

  const controlButtonClassName =
    "border border-white/20 bg-white/12 text-white shadow-2xl backdrop-blur-md transition hover:bg-white/18 active:scale-95";
  const navButtonClassName =
    "border border-white/20 bg-white/12 text-white shadow-2xl backdrop-blur-md transition hover:bg-white/18 active:scale-90";
  const primaryNavButtonClassName =
    "border border-violet-500/40 bg-violet-600/90 text-white shadow-2xl shadow-violet-600/25 transition hover:bg-violet-500 active:scale-90";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeLesson) return;

      const target = event.target as HTMLElement | null;
      const targetTag = target?.tagName?.toLowerCase();
      const isFormControl =
        targetTag === "input" ||
        targetTag === "textarea" ||
        targetTag === "select" ||
        targetTag === "button" ||
        Boolean(target?.isContentEditable);
      if (isFormControl) return;

      if (event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
        return;
      }
      if (event.code === "ArrowRight") {
        event.preventDefault();
        seekBy(5);
        return;
      }
      if (event.code === "ArrowLeft") {
        event.preventDefault();
        seekBy(-5);
        return;
      }
      if (event.code === "KeyM") {
        event.preventDefault();
        toggleMute();
        return;
      }
      if (event.code === "KeyF") {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLesson, isMuted]);

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isFullscreen) {
      handleMouseMove();
    }

    const target = event.target as HTMLElement;
    const isVideoSurface = target.tagName.toLowerCase() === "video";
    if (isVideoSurface) {
      togglePlayPause();
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
        onClick={handleContainerClick}
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
            controls={false}
            preload="metadata"
            className="h-full w-full max-h-full"
          />
        </div>

        {!showAutoPlay && showPauseOverlay && (
          <div className="pointer-events-none absolute inset-0 z-[54] bg-gradient-to-t from-black/72 via-black/18 to-black/58">
            <div className="flex h-full items-center justify-center px-6">
              <button
                onClick={togglePlayPause}
                onMouseEnter={handleControlsMouseEnter}
                onMouseLeave={handleControlsMouseLeave}
                className="pointer-events-auto grid h-24 w-24 place-items-center rounded-full border border-white/20 bg-white/12 text-white shadow-2xl backdrop-blur-md transition hover:bg-white/18 active:scale-95 md:h-28 md:w-28"
                title="Resume playback"
              >
                <Play className="ml-1 h-10 w-10 fill-current md:h-12 md:w-12" />
              </button>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/85 via-black/35 to-transparent px-6 pb-16 pt-6 md:px-10 md:pt-8">
              <div className="max-w-3xl">
                <p className="mt-3 text-sm font-semibold text-white/60 md:text-base">
                  {courseTitle}
                </p>
                <h2 className="mt-3 text-2xl font-black text-white md:text-4xl">
                  {getPauseTitle(activeLesson.title)}
                </h2>
                <p className="mt-3 text-sm font-semibold text-white/65 md:text-base">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!showAutoPlay && (
          <div
            onMouseEnter={handleControlsMouseEnter}
            onMouseLeave={handleControlsMouseLeave}
            className={[
              "absolute inset-x-0 bottom-0 z-[55] bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 transition-opacity duration-300 md:px-4",
              isFullscreen
                ? showOverlays
                  ? "opacity-100"
                  : "opacity-0"
                : "opacity-100",
            ].join(" ")}
          >
            <div className="mb-2">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={handleSeek}
                onMouseEnter={handleControlsMouseEnter}
                onMouseLeave={handleControlsMouseLeave}
                style={{
                  background: getRangeBackground(
                    Math.min(currentTime, duration || 0),
                    duration || 0,
                    "rgba(139, 92, 246, 0.95)",
                    "rgba(100, 116, 139, 0.35)",
                  ),
                }}
                className="media-slider h-1.5 w-full cursor-pointer appearance-none rounded-full"
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  onMouseEnter={handleControlsMouseEnter}
                  onMouseLeave={handleControlsMouseLeave}
                  className={`flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9 ${controlButtonClassName}`}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                </button>

                <span className="min-w-[94px] text-xs font-semibold text-slate-200 md:min-w-[110px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button
                  onClick={toggleMute}
                  onMouseEnter={handleControlsMouseEnter}
                  onMouseLeave={handleControlsMouseLeave}
                  className={`flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9 ${controlButtonClassName}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onMouseEnter={handleControlsMouseEnter}
                  onMouseLeave={handleControlsMouseLeave}
                  style={{
                    background: getRangeBackground(
                      isMuted ? 0 : volume,
                      1,
                      "rgba(248, 250, 252, 0.9)",
                      "rgba(100, 116, 139, 0.35)",
                    ),
                  }}
                  className="media-slider h-1.5 w-20 cursor-pointer appearance-none rounded-full md:w-28"
                />
              </div>

              <button
                onClick={toggleFullscreen}
                onMouseEnter={handleControlsMouseEnter}
                onMouseLeave={handleControlsMouseLeave}
                className={`flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9 ${controlButtonClassName}`}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Shrink className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

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
            onMouseEnter={handleControlsMouseEnter}
            onMouseLeave={handleControlsMouseLeave}
            className={[
              "pointer-events-none absolute inset-0 z-50 flex items-center justify-between px-4 md:px-12 transition-opacity duration-300",
              isFullscreen
                ? showOverlays
                  ? "opacity-100"
                  : "opacity-0"
                : "opacity-100",
            ].join(" ")}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPreviousLesson();
              }}
              onMouseEnter={handleControlsMouseEnter}
              onMouseLeave={handleControlsMouseLeave}
              disabled={!hasPreviousLesson}
              className={[
                `pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-0 md:h-16 md:w-16 ${navButtonClassName}`,
                !isFullscreen && "hidden group-hover:flex",
              ].join(" ")}
              title="Previous Lesson"
            >
              <ChevronLeft className="h-6 w-6 md:h-10 md:w-10" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompleteAndContinue();
              }}
              onMouseEnter={handleControlsMouseEnter}
              onMouseLeave={handleControlsMouseLeave}
              disabled={!hasNextLesson}
              className={[
                `pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-0 md:h-16 md:w-16 ${
                  isCurrentLessonCompleted
                    ? navButtonClassName
                    : primaryNavButtonClassName
                }`,
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
