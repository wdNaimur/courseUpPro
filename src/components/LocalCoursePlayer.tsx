import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle, ChevronRight } from "lucide-react";
import type { LessonVideo } from "../types/course";
import {
  buildCourseKey,
  createFolderTree,
  formatLessonMeta,
  getCourseFolderName,
  getRelativePath,
  isVideoFile,
  normalizeTitle,
  stripSharedWrapperFolder,
} from "../utils/course-helpers";
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
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>(
    {},
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const hasInitialized = useRef(false);

  const activeLesson = useMemo(
    () => lessonVideos.find((lesson) => lesson.id === activeLessonId) ?? null,
    [lessonVideos, activeLessonId],
  );

  const folderTree = useMemo(
    () => createFolderTree(lessonVideos),
    [lessonVideos],
  );

  const completedCount = useMemo(
    () =>
      lessonVideos.filter((lesson) => Boolean(progressMap[lesson.id])).length,
    [lessonVideos, progressMap],
  );

  const progressPercent = lessonVideos.length
    ? Math.round((completedCount / lessonVideos.length) * 100)
    : 0;

  const isCurrentLessonCompleted = activeLessonId
    ? Boolean(progressMap[activeLessonId])
    : false;
  const hasNextLesson =
    lessonVideos.findIndex((l) => l.id === activeLessonId) <
    lessonVideos.length - 1;

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, activeLessonId]);

  useEffect(() => {
    if (!activeCourseKey) return;
    localStorage.setItem(activeCourseKey, JSON.stringify(progressMap));
  }, [activeCourseKey, progressMap]);

  useEffect(() => {
    if (!activeLesson || !videoRef.current) return;

    const nextUrl = URL.createObjectURL(activeLesson.file);
    videoRef.current.src = nextUrl;
    videoRef.current.play().catch(() => {
      return;
    });

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [activeLesson]);

  const getLessonCompletion = (lessonId: string) =>
    Boolean(progressMap[lessonId]);

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
    setProgressMap((previousState) => ({
      ...previousState,
      [lessonId]: checked,
    }));
  };

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

  const processFiles = React.useCallback((files: File[]) => {
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
          ? folderParts.join(" / ")
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

    const normalizedLessons = stripSharedWrapperFolder(mappedLessons, folderName);

    const courseKey = buildCourseKey(folderName, normalizedLessons);

    setLessonVideos(normalizedLessons);
    setActiveCourseKey(courseKey);
    setCourseTitle(folderName);
    setCourseSubtitle(
      `${normalizedLessons.length} lesson video${normalizedLessons.length > 1 ? "s" : ""} found in this course folder.`,
    );

    try {
      const savedProgress = JSON.parse(localStorage.getItem(courseKey) || "{}");
      setProgressMap(savedProgress);
    } catch {
      setProgressMap({});
    }

    setAccordionState({});

    const firstIncompleteLesson = normalizedLessons.find(
      (lesson) =>
        !JSON.parse(localStorage.getItem(courseKey) || "{}")[lesson.id],
    );

    const firstLessonToOpen = firstIncompleteLesson || normalizedLessons[0];

    if (firstLessonToOpen) {
      setActiveLessonId(firstLessonToOpen.id);
      openLessonFolders(firstLessonToOpen);
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
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <header className="z-20 shrink-0 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-violet-500 hover:text-white active:scale-95"
              >
                <ArrowLeft className="h-4 w-4 text-violet-400" />
                Back to Courses
              </button>
            )}
            <div className="hidden h-6 w-px bg-slate-800 md:block"></div>
            <p className="hidden max-w-[300px] text-xs font-bold uppercase tracking-wider text-slate-400 md:block">
              {courseTitle}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 shadow-sm transition hover:border-slate-700">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Speed
              </span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="bg-transparent text-sm font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="0.5" className="bg-slate-900 text-slate-200">
                  0.5x
                </option>
                <option value="0.75" className="bg-slate-900 text-slate-200">
                  0.75x
                </option>
                <option value="1" className="bg-slate-900 text-slate-200">
                  1.0x
                </option>
                <option value="1.25" className="bg-slate-900 text-slate-200">
                  1.25x
                </option>
                <option value="1.5" className="bg-slate-900 text-slate-200">
                  1.5x
                </option>
                <option value="1.75" className="bg-slate-900 text-slate-200">
                  1.75x
                </option>
                <option value="2" className="bg-slate-900 text-slate-200">
                  2.0x
                </option>
              </select>
            </div>

            <button
              onClick={handleCompleteAndContinue}
              disabled={!hasNextLesson && isCurrentLessonCompleted}
              className={[
                "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                isCurrentLessonCompleted
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/20",
              ].join(" ")}
            >
              {isCurrentLessonCompleted ? (
                <>
                  <ChevronRight className="h-4 w-4" />
                  Next Lesson
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete & Continue
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="h-full w-[360px] shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
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

        <div className="h-full flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <VideoDisplay
            key={activeLessonId}
            activeLesson={activeLesson}
            videoRef={videoRef}
            onCompleteAndContinue={handleCompleteAndContinue}
            onPreviousLesson={handlePreviousLesson}
            hasNextLesson={hasNextLesson}
            hasPreviousLesson={hasPreviousLesson}
            formatLessonMeta={formatLessonMeta}
            nextLessonTitle={nextLessonTitle}
          />
        </div>
      </main>
    </div>
  );
}
