import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
import CourseSidebar from "./player/CourseSidebar";
import VideoDisplay from "./player/VideoDisplay";

type LocalCoursePlayerProps = {
  initialFiles?: File[];
  onBack?: () => void;
};

export default function LocalCoursePlayer({
  initialFiles,
  onBack,
}: LocalCoursePlayerProps) {
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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
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
    if (!activeLesson || !video) return;

    const nextUrl = URL.createObjectURL(activeLesson.file);
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
  }, [activeLesson]);

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
  };

  const handleToggleComplete = (lessonId: string, checked: boolean) => {
    setCourseProgress((previousState) =>
      updateLessonCompletion(previousState, lessonId, checked),
    );
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeLesson) return;

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
          activeLesson.id,
          playbackTime,
          duration,
        ),
      );
    };

    const handleLoadedMetadata = () => {
      const savedPlaybackTime = getLessonPlaybackTime(
        courseProgressRef.current,
        activeLesson.id,
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
  }, [activeLesson, videoRef]);

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

  const processFiles = useCallback((files: File[]) => {
    const videoFiles = files.filter(isVideoFile);

    if (!videoFiles.length) return;

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
  }, []);

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setTimeout(() => {
        processFiles(initialFiles);
      }, 0);
    }
  }, [initialFiles, processFiles]);

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
                <PanelLeftClose className="h-4 w-4 text-[var(--theme-accent-soft)]" />
              ) : (
                <PanelLeftOpen className="h-4 w-4 text-[var(--theme-accent-soft)]" />
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

      <main className="flex flex-1 overflow-hidden">
        {isSidebarVisible && (
          <div className="h-full w-[360px] shrink-0 overflow-y-auto border-r border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_56%,transparent)] scrollbar-thin scrollbar-track-transparent">
            <CourseSidebar
              courseTitle={courseTitle}
              courseSubtitle={courseSubtitle}
              completedCount={completedCount}
              totalLessons={lessonVideos.length}
              progressPercent={progressPercent}
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
        )}

        <div className="h-full flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
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
