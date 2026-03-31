import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { PlayCircle, ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { LessonVideo } from "../../types/course";
import VideoAutoPlayOverlay from "./VideoAutoPlayOverlay";
import VideoLessonInfoCard from "./VideoLessonInfoCard";
import VideoPlaybackControls from "./VideoPlaybackControls";

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
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
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
  playbackSpeed,
  onPlaybackSpeedChange,
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
  const [isFinePointer, setIsFinePointer] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(pointer: fine)").matches;
  });
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
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(pointer: fine)");
    const handlePointerChange = (event: MediaQueryListEvent) => {
      setIsFinePointer(event.matches);
    };

    setIsFinePointer(mediaQuery.matches);
    mediaQuery.addEventListener("change", handlePointerChange);

    return () => {
      mediaQuery.removeEventListener("change", handlePointerChange);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
    const handleVolumeSync = () => {
      setVolume(video.volume);
      setIsMuted(video.muted || video.volume === 0);
    };

    handleLoadedMetadata();
    handleTimeUpdate();
    handleVolumeSync();
    setIsPlaying(!video.paused);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("durationchange", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeSync);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("durationchange", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeSync);
    };
  }, [videoRef, activeLesson]);

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
      if (autoPlayTimerRef.current) {
        window.clearTimeout(autoPlayTimerRef.current);
      }
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

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling full-screen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
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
  }, [videoRef]);

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

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [videoRef]);

  const seekBy = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      const nextTime = Math.min(
        Math.max(video.currentTime + seconds, 0),
        Number.isFinite(video.duration) ? video.duration : video.currentTime,
      );
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [videoRef],
  );

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
    "theme-accent-elevated border text-white shadow-2xl transition active:scale-90";

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
      if (event.code === "Enter" && showAutoPlay) {
        event.preventDefault();
        handlePlayNextNow();
        return;
      }
      if (event.code === "ArrowRight" && event.shiftKey) {
        if (!hasNextLesson) return;
        event.preventDefault();
        onCompleteAndContinue();
        return;
      }
      if (event.code === "ArrowLeft" && event.shiftKey) {
        if (!hasPreviousLesson) return;
        event.preventDefault();
        onPreviousLesson();
        return;
      }
      if (event.code === "ArrowRight") {
        event.preventDefault();
        seekBy(10);
        return;
      }
      if (event.code === "ArrowLeft") {
        event.preventDefault();
        seekBy(-10);
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
  }, [
    activeLesson,
    handlePlayNextNow,
    hasNextLesson,
    hasPreviousLesson,
    onCompleteAndContinue,
    onPreviousLesson,
    seekBy,
    showAutoPlay,
    toggleFullscreen,
    toggleMute,
    togglePlayPause,
  ]);

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isFullscreen) {
      handleMouseMove();
    }

    if (!isFinePointer) {
      return;
    }

    const target = event.target as HTMLElement;
    const isVideoSurface = target.tagName.toLowerCase() === "video";
    if (isVideoSurface) {
      togglePlayPause();
    }
  };

  if (!activeLesson) {
    return (
      <section className="flex min-h-full items-center justify-center p-4 md:p-12">
        <div className="theme-panel-surface-soft grid max-w-2xl place-items-center gap-4 rounded-3xl border border-[var(--theme-border)] p-12 text-center">
          <div className="theme-accent-tint rounded-full p-6">
            <PlayCircle className="h-16 w-16 text-[var(--theme-accent-warm)]" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--theme-text)]">
            Ready to start learning?
          </h2>
          <p className="text-lg leading-relaxed text-[var(--theme-text-muted)]">
            Select a lesson from the sidebar to begin.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 p-2">
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
            : "mx-auto w-full rounded-3xl border border-[var(--theme-border)] md:max-h-[80vh]",
        ].join(" ")}
      >
        <div
          className={[
            "flex w-full items-center justify-center bg-black",
            isFullscreen
              ? "h-full"
              : "aspect-video max-h-[100svh] md:max-h-[80vh]",
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
          <VideoPlaybackControls
            controlButtonClassName={controlButtonClassName}
            currentTime={currentTime}
            duration={duration}
            formatTime={formatTime}
            getRangeBackground={getRangeBackground}
            handleControlsMouseEnter={handleControlsMouseEnter}
            handleControlsMouseLeave={handleControlsMouseLeave}
            isFullscreen={isFullscreen}
            isMuted={isMuted}
            isPlaying={isPlaying}
            onFullscreenToggle={toggleFullscreen}
            onMuteToggle={toggleMute}
            onPlaybackSpeedChange={onPlaybackSpeedChange}
            onSeek={handleSeek}
            onTogglePlayPause={togglePlayPause}
            onVolumeChange={handleVolumeChange}
            playbackSpeed={playbackSpeed}
            showOverlays={showOverlays}
            volume={volume}
          />
        )}

        {showAutoPlay && (
          <VideoAutoPlayOverlay
            countdown={countdown}
            nextLessonTitle={nextLessonTitle}
            onCancel={cancelAutoPlay}
            onPlayNow={handlePlayNextNow}
          />
        )}

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
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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

      {!isFullscreen && (
        <VideoLessonInfoCard
          activeLesson={activeLesson}
          formatLessonMeta={formatLessonMeta}
        />
      )}
    </section>
  );
}
