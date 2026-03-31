import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";
import type { LessonVideo } from "../types/course";
import {
  buildCourseKey,
  createFolderTree,
  formatLessonMeta,
  getCourseFolderName,
  getRelativePath,
  isVideoFile,
  normalizeTitle,
  normalizeSectionTitle,
  stripSharedWrapperFolder,
} from "../utils/course-helpers";
import {
  countCompletedLessons,
  getLessonPlaybackTime,
  isLessonCompleted,
  readCourseProgress,
  setPlaybackSpeed as setProgressPlaybackSpeed,
  setLastLessonId,
  updateLessonCompletion,
  updateLessonPlayback,
  type CourseProgressState,
} from "../utils/course-progress";
import type { LessonDurationMap } from "../utils/duration";
import CourseSidebar from "./player/CourseSidebar";
import VideoDisplay from "./player/VideoDisplay";

type LocalCoursePlayerProps = {
  initialFiles?: File[];
  initialLessonDurations?: LessonDurationMap;
  onBack?: () => void;
};

export default function LocalCoursePlayer({
  initialFiles,
  initialLessonDurations,
  onBack,
}: LocalCoursePlayerProps) {
  const isMobileViewport = () => window.innerWidth < 1024;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [lessonVideos, setLessonVideos] = useState<LessonVideo[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeCourseKey, setActiveCourseKey] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("No course selected");
  const [courseSubtitle, setCourseSubtitle] = useState(
    "Choose a folder that contains your lesson videos.",
  );
  const [courseProgress, setCourseProgress] = useState<CourseProgressState>({
    lessons: {},
    lastLessonId: null,
    playbackSpeed: 1,
  });
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>(
    {},
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    return typeof window !== "undefined" ? !isMobileViewport() : true;
  });
  const [isLoadingCourse, setIsLoadingCourse] = useState(() => {
    return Boolean(initialFiles && initialFiles.length > 0);
  });
  const hasInitialized = useRef(false);
  const lastSavedPlaybackTimeRef = useRef(0);
  const playbackSpeedRef = useRef(1);
  const courseProgressRef = useRef<CourseProgressState>({
    lessons: {},
    lastLessonId: null,
    playbackSpeed: 1,
  });

  const applyPlaybackSpeed = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) return;
      video.defaultPlaybackRate = playbackSpeed;
      video.playbackRate = playbackSpeed;
    },
    [playbackSpeed],
  );

  const activeLesson = useMemo(
    () => lessonVideos.find((lesson) => lesson.id === activeLessonId) ?? null,
    [lessonVideos, activeLessonId],
  );
  const activeLessonFile = activeLesson?.file ?? null;

  const folderTree = useMemo(
    () => createFolderTree(lessonVideos),
    [lessonVideos],
  );

  const completedCount = useMemo(
    () => countCompletedLessons(courseProgress),
    [courseProgress],
  );

  const progressPercent = lessonVideos.length
    ? Math.round((completedCount / lessonVideos.length) * 100)
    : 0;
  const totalDuration = useMemo(
    () => lessonVideos.reduce((total, lesson) => total + lesson.duration, 0),
    [lessonVideos],
  );

  const isCurrentLessonCompleted = activeLessonId
    ? isLessonCompleted(courseProgress, activeLessonId)
    : false;
  const hasNextLesson =
    lessonVideos.findIndex((l) => l.id === activeLessonId) <
    lessonVideos.length - 1;

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    setCourseProgress((previousState) =>
      setProgressPlaybackSpeed(previousState, playbackSpeed),
    );
  }, [playbackSpeed]);

  useEffect(() => {
    applyPlaybackSpeed(videoRef.current);
  }, [applyPlaybackSpeed]);

  useEffect(() => {
    if (!activeCourseKey) return;
    localStorage.setItem(activeCourseKey, JSON.stringify(courseProgress));
  }, [activeCourseKey, courseProgress]);

  useEffect(() => {
    courseProgressRef.current = courseProgress;
  }, [courseProgress]);

  useEffect(() => {
    if (!activeLessonId) return;
    setCourseProgress((previousState) =>
      setLastLessonId(previousState, activeLessonId),
    );
  }, [activeLessonId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!activeLessonId || !activeLessonFile || !video) return;

    const nextUrl = URL.createObjectURL(activeLessonFile);
    lastSavedPlaybackTimeRef.current = 0;
    const handleLoadedMetadata = () => {
      applyPlaybackSpeed(video);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.src = nextUrl;
    video.defaultPlaybackRate = playbackSpeedRef.current;
    video.playbackRate = playbackSpeedRef.current;
    video.play().catch(() => {
      return;
    });

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      URL.revokeObjectURL(nextUrl);
    };
  }, [activeLessonFile, activeLessonId, applyPlaybackSpeed]);

  const getLessonCompletion = (lessonId: string) =>
    isLessonCompleted(courseProgress, lessonId);

  const getAccordionOpen = (folderKey: string, defaultState = false) => {
    if (typeof accordionState[folderKey] === "boolean") {
      return accordionState[folderKey];
    }
    return defaultState;
  };

  const handleAccordionOpen = (folderKey: string, isOpen: boolean) => {
    setAccordionState((previousState) => ({
      ...previousState,
      [folderKey]: isOpen,
    }));
  };

  const openLessonFolders = (lesson: LessonVideo) => {
    if (!lesson.folderParts.length) return;

    setAccordionState((previousState) => {
      const nextState = { ...previousState };
      let currentKey = "";

      lesson.folderParts.forEach((folderPart) => {
        currentKey = currentKey ? `${currentKey}/${folderPart}` : folderPart;
        nextState[currentKey] = true;
      });

      return nextState;
    });
  };

  const handleSelectLesson = (lessonId: string) => {
    const nextLesson = lessonVideos.find((lesson) => lesson.id === lessonId);
    if (!nextLesson) return;

    setActiveLessonId(lessonId);
    openLessonFolders(nextLesson);
    if (isMobileViewport()) {
      setIsSidebarVisible(false);
    }
  };

  const handleToggleComplete = (lessonId: string, checked: boolean) => {
    setCourseProgress((previousState) =>
      updateLessonCompletion(previousState, lessonId, checked),
    );
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeLessonId) return;

    const persistPlaybackPosition = () => {
      const playbackTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;

      if (
        Math.abs(playbackTime - lastSavedPlaybackTimeRef.current) < 5 &&
        playbackTime > 0 &&
        playbackTime < duration
      ) {
        return;
      }

      lastSavedPlaybackTimeRef.current = playbackTime;
      setCourseProgress((previousState) =>
        updateLessonPlayback(
          previousState,
          activeLessonId,
          playbackTime,
          duration,
        ),
      );
    };

    const handleLoadedMetadata = () => {
      const savedPlaybackTime = getLessonPlaybackTime(
        courseProgressRef.current,
        activeLessonId,
      );
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const resumeTime =
        savedPlaybackTime > 0 &&
        duration > 0 &&
        savedPlaybackTime < Math.max(duration - 2, 0)
          ? savedPlaybackTime
          : 0;

      if (resumeTime > 0) {
        video.currentTime = resumeTime;
        lastSavedPlaybackTimeRef.current = resumeTime;
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", persistPlaybackPosition);
    video.addEventListener("pause", persistPlaybackPosition);
    video.addEventListener("ended", persistPlaybackPosition);

    return () => {
      persistPlaybackPosition();
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", persistPlaybackPosition);
      video.removeEventListener("pause", persistPlaybackPosition);
      video.removeEventListener("ended", persistPlaybackPosition);
    };
  }, [activeLessonId]);

  const handleCompleteAndContinue = () => {
    if (!activeLessonId) return;
    handleToggleComplete(activeLessonId, true);

    const currentIndex = lessonVideos.findIndex((l) => l.id === activeLessonId);
    if (currentIndex > -1 && currentIndex < lessonVideos.length - 1) {
      const nextLesson = lessonVideos[currentIndex + 1];
      handleSelectLesson(nextLesson.id);
    }
  };

  const handlePreviousLesson = () => {
    if (!activeLessonId) return;
    const currentIndex = lessonVideos.findIndex((l) => l.id === activeLessonId);
    if (currentIndex > 0) {
      const prevLesson = lessonVideos[currentIndex - 1];
      handleSelectLesson(prevLesson.id);
    }
  };

  const hasPreviousLesson = useMemo(() => {
    if (!activeLessonId) return false;
    return lessonVideos.findIndex((l) => l.id === activeLessonId) > 0;
  }, [lessonVideos, activeLessonId]);

  const nextLessonTitle = useMemo(() => {
    const currentIndex = lessonVideos.findIndex((l) => l.id === activeLessonId);
    if (currentIndex > -1 && currentIndex < lessonVideos.length - 1) {
      return lessonVideos[currentIndex + 1].title;
    }
    return undefined;
  }, [lessonVideos, activeLessonId]);

  const processFiles = useCallback(
    async (files: File[], lessonDurations: LessonDurationMap = {}) => {
    const videoFiles = files.filter(isVideoFile);

    if (!videoFiles.length) {
      setIsLoadingCourse(false);
      return;
    }

    try {
      const folderName = getCourseFolderName(videoFiles);

      const mappedLessons = videoFiles
        .map((file, index) => {
          const path = getRelativePath(file);
          const pathParts = path.split("/");
          const fileName = pathParts[pathParts.length - 1];
          const folderParts = pathParts.length > 2 ? pathParts.slice(1, -1) : [];
          const folderLabel = folderParts.length
            ? folderParts.map((part) => normalizeSectionTitle(part)).join(" / ")
            : "Main section";

          return {
            id: path,
            displayIndex: index + 1,
            title: normalizeTitle(fileName) || `Lesson ${index + 1}`,
            file,
            path,
            folderLabel,
            folderParts,
            duration: lessonDurations[path] ?? 0,
          };
        })
        .sort((firstLesson, secondLesson) =>
          firstLesson.path.localeCompare(secondLesson.path, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )
        .map((lesson, index) => ({
          ...lesson,
          displayIndex: index + 1,
        }));

      const normalizedLessons = stripSharedWrapperFolder(
        mappedLessons,
        folderName,
      );

      const courseKey = buildCourseKey(folderName, normalizedLessons);

      setLessonVideos(normalizedLessons);
      setActiveCourseKey(courseKey);
      setCourseTitle(folderName);
      setCourseSubtitle(
        `${normalizedLessons.length} lesson video${normalizedLessons.length > 1 ? "s" : ""} found in this course folder.`,
      );

      try {
        const savedProgress = readCourseProgress(localStorage.getItem(courseKey));
        setCourseProgress(savedProgress);
        setPlaybackSpeed(savedProgress.playbackSpeed);

        const preferredLesson =
          normalizedLessons.find(
            (lesson) => savedProgress.lastLessonId === lesson.id,
          ) ??
          normalizedLessons.find(
            (lesson) => !isLessonCompleted(savedProgress, lesson.id),
          ) ??
          normalizedLessons[0];

        setAccordionState({});

        if (preferredLesson) {
          setActiveLessonId(preferredLesson.id);
          openLessonFolders(preferredLesson);
        }
      } catch {
        setCourseProgress({
          lessons: {},
          lastLessonId: null,
          playbackSpeed: 1,
        });
        setPlaybackSpeed(1);
        setAccordionState({});
        if (normalizedLessons[0]) {
          setActiveLessonId(normalizedLessons[0].id);
          openLessonFolders(normalizedLessons[0]);
        }
      }
    } finally {
      setIsLoadingCourse(false);
    }
  }, []);

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsLoadingCourse(true);
      setTimeout(() => {
        void processFiles(initialFiles, initialLessonDurations);
      }, 0);
    }
  }, [initialFiles, initialLessonDurations, processFiles]);

  useEffect(() => {
    if (!Object.keys(initialLessonDurations ?? {}).length) {
      return;
    }

    setLessonVideos((previousLessons) =>
      previousLessons.map((lesson) => {
        const nextDuration = initialLessonDurations?.[lesson.path] ?? lesson.duration;
        return nextDuration === lesson.duration
          ? lesson
          : {
              ...lesson,
              duration: nextDuration,
            };
      }),
    );
  }, [initialLessonDurations]);

  if (isLoadingCourse) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,var(--theme-bg)_0%,var(--theme-bg)_50%,var(--theme-bg-alt)_100%)] text-[var(--theme-text)]">
        <header className="z-20 shrink-0 border-b border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-bg)_90%,transparent)] backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <div className="skeleton-block h-10 w-10 rounded-2xl" />
              <div className="h-6 w-px bg-[var(--theme-border)]" />
              <div className="hidden md:block skeleton-block h-3.5 w-40" />
            </div>
            {onBack ? (
              <div className="skeleton-block h-10 w-36 rounded-2xl" />
            ) : (
              <div />
            )}
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden">
          <aside className="h-full w-[360px] shrink-0 overflow-hidden border-r border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_56%,transparent)] p-2">
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
                  <div className="flex h-full flex-col justify-between rounded-[1.75rem] border border-[var(--theme-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 md:p-6">
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

              <div className="grid gap-6 rounded-3xl border border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_95%,transparent)] p-6 shadow-2xl shadow-black/20 md:p-8">
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,var(--theme-bg)_0%,var(--theme-bg)_50%,var(--theme-bg-alt)_100%)] text-[var(--theme-text)]">
      <header className="z-20 shrink-0 border-b border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-bg)_90%,transparent)] backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarVisible((previousState) => !previousState)}
              className="glass-button flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--theme-text)]"
              aria-pressed={isSidebarVisible}
              aria-label={isSidebarVisible ? "Hide course sidebar" : "Show course sidebar"}
              title={isSidebarVisible ? "Hide course sidebar" : "Show course sidebar"}
            >
              {isSidebarVisible ? (
                <X className="h-4 w-4 text-[var(--theme-accent-soft)]" />
              ) : (
                <Menu className="h-4 w-4 text-[var(--theme-accent-soft)]" />
              )}
            </button>
            <div className="h-6 w-px bg-[var(--theme-border)]"></div>
            <p className="hidden max-w-[300px] text-xs font-bold uppercase tracking-wider text-[var(--theme-text-faint)] md:block">
              {courseTitle}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="glass-button flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-[var(--theme-text)]"
              >
                <ArrowLeft className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                Back to Courses
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 overflow-hidden lg:flex-row">
        <div
          className={[
            "pointer-events-none absolute inset-0 z-[80] bg-[var(--theme-overlay)]/70 opacity-0 transition-opacity duration-300 lg:hidden",
            isSidebarVisible ? "pointer-events-auto opacity-100" : "",
          ].join(" ")}
          onClick={() => setIsSidebarVisible(false)}
        />

        <div
          className={[
            "fixed inset-x-0 bottom-0 z-[90] max-h-[72vh] overflow-y-auto rounded-t-[1.8rem] border border-b-0 border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_92%,transparent)] shadow-[0_-24px_80px_rgba(0,0,0,0.38)] transition-transform duration-300 scrollbar-thin scrollbar-track-transparent lg:static lg:z-auto lg:max-h-none lg:w-[360px] lg:translate-y-0 lg:overflow-y-auto lg:rounded-none lg:border-0 lg:border-r lg:bg-[color:color-mix(in_srgb,var(--theme-panel)_56%,transparent)] lg:shadow-none",
            isSidebarVisible ? "translate-y-0" : "translate-y-full",
          ].join(" ")}
        >
          <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-white/15 lg:hidden" />
          <div className="lg:h-full">
            <CourseSidebar
              courseTitle={courseTitle}
              courseSubtitle={courseSubtitle}
              completedCount={completedCount}
              totalLessons={lessonVideos.length}
              progressPercent={progressPercent}
              totalDuration={totalDuration}
              folderTree={folderTree}
              activeLessonId={activeLessonId}
              getAccordionOpen={getAccordionOpen}
              setAccordionOpen={handleAccordionOpen}
              getLessonCompletion={getLessonCompletion}
              onSelectLesson={handleSelectLesson}
              onToggleComplete={handleToggleComplete}
              formatLessonMeta={formatLessonMeta}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
          <VideoDisplay
            activeLesson={activeLesson}
            courseTitle={courseTitle}
            videoRef={videoRef}
            onCompleteAndContinue={handleCompleteAndContinue}
            onPreviousLesson={handlePreviousLesson}
            hasNextLesson={hasNextLesson}
            hasPreviousLesson={hasPreviousLesson}
            isCurrentLessonCompleted={isCurrentLessonCompleted}
            formatLessonMeta={formatLessonMeta}
            nextLessonTitle={nextLessonTitle}
            playbackSpeed={playbackSpeed}
            onPlaybackSpeedChange={setPlaybackSpeed}
          />
        </div>
      </main>
    </div>
  );
}
