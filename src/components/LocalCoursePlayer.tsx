import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  getCompletedCourseDuration,
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
import PlayerHeader from "./player/PlayerHeader";
import PlayerLoadingShell from "./player/PlayerLoadingShell";
import PlayerSidebarLayout from "./player/PlayerSidebarLayout";
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

  const applyPlaybackSpeed = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.defaultPlaybackRate = playbackSpeedRef.current;
    video.playbackRate = playbackSpeedRef.current;
  }, []);

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
  const completedDuration = useMemo(
    () =>
      lessonVideos.reduce((total, lesson) => {
        if (!isLessonCompleted(courseProgress, lesson.id)) {
          return total;
        }

        const resolvedDuration =
          lesson.duration || courseProgress.lessons[lesson.id]?.duration || 0;
        return total + resolvedDuration;
      }, 0) || getCompletedCourseDuration(courseProgress),
    [courseProgress, lessonVideos],
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
  }, [applyPlaybackSpeed, playbackSpeed]);

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
    return <PlayerLoadingShell showBackButton={Boolean(onBack)} />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,var(--theme-bg)_0%,var(--theme-bg)_50%,var(--theme-bg-alt)_100%)] text-[var(--theme-text)]">
      <PlayerHeader
        courseTitle={courseTitle}
        isSidebarVisible={isSidebarVisible}
        onBack={onBack}
        onToggleSidebar={() =>
          setIsSidebarVisible((previousState) => !previousState)
        }
      />

      <PlayerSidebarLayout
        isSidebarVisible={isSidebarVisible}
        onCloseSidebar={() => setIsSidebarVisible(false)}
        sidebar={
          <CourseSidebar
            courseTitle={courseTitle}
            courseSubtitle={courseSubtitle}
            completedCount={completedCount}
            completedDuration={completedDuration}
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
        }
        content={
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
        }
      />
    </div>
  );
}
