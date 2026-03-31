import { useEffect, useRef, useState } from "react";
import LocalCoursePlayer from "./components/LocalCoursePlayer";
import HomePageCoursePickerInput from "./components/home/HomePageCoursePickerInput";
import HomePageDialogLayer, {
  type PendingCourseImport,
} from "./components/home/HomePageDialogLayer";
import HomePage from "./views/HomePage";
import LibraryDashboard from "./views/LibraryDashboard";
import type { CourseMetadata } from "./types/course";
import {
  appRoutes,
  buildPlayerRoute,
  navigateTo,
  slugifyCourseName,
  useAppRoute,
} from "./router";
import { isVideoFile } from "./utils/course-helpers";
import { db } from "./utils/db";
import {
  createLessonDurationMap,
  readVideoDurations,
  type LessonDurationMap,
} from "./utils/duration";
import {
  readHandleFileText,
  scanDirectory,
  verifyPermission,
  verifyReadWritePermission,
  writeHandleTextFile,
} from "./utils/file-system";
import {
  buildCourseKey,
  getCourseFolderName,
  getRelativePath,
} from "./utils/course-helpers";

const DEFAULT_COURSE_PRIORITY = "Standard";
const APP_ACTIVE_COURSE_KEY = "local-course-player::active-course-id";

function normalizeCourseMetadata(course: CourseMetadata): CourseMetadata {
  return {
    ...course,
    priority: course.priority?.trim() || DEFAULT_COURSE_PRIORITY,
    totalDuration:
      typeof course.totalDuration === "number" &&
      Number.isFinite(course.totalDuration)
        ? Math.max(course.totalDuration, 0)
        : undefined,
  };
}

function PlayerShellSkeleton() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,var(--theme-bg)_0%,var(--theme-bg)_50%,var(--theme-bg-alt)_100%)] text-[var(--theme-text)]">
      <header className="z-20 shrink-0 border-b border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-bg)_90%,transparent)] backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="skeleton-block h-10 w-10 rounded-2xl" />
            <div className="h-6 w-px bg-[var(--theme-border)]" />
            <div className="hidden md:block skeleton-block h-3.5 w-40" />
          </div>
          <div className="skeleton-block h-10 w-36 rounded-2xl" />
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

export default function App() {
  const route = useAppRoute();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLessonDurations, setSelectedLessonDurations] =
    useState<LessonDurationMap>({});
  const [courseFilesCache, setCourseFilesCache] = useState<
    Record<string, { files: File[]; lessonDurations?: LessonDurationMap }>
  >({});
  const [isRestoringPlayer, setIsRestoringPlayer] = useState(() => {
    return window.location.pathname === appRoutes.playerBase ||
      window.location.pathname.startsWith(`${appRoutes.playerBase}/`);
  });
  const [courses, setCourses] = useState<CourseMetadata[]>(() => {
    const saved = localStorage.getItem("local-course-player::courses");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
          ? parsed.map((course) => normalizeCourseMetadata(course))
          : [];
      } catch (error) {
        console.error("Failed to load saved courses", error);
      }
    }
    return [];
  });
  const durationJobsRef = useRef(new Set<string>());
  const [priorityDraft, setPriorityDraft] = useState(DEFAULT_COURSE_PRIORITY);
  const [pendingCourseImport, setPendingCourseImport] =
    useState<PendingCourseImport | null>(null);

  const getPlayerCourseFromSlug = (courseSlug?: string) => {
    if (!courseSlug) {
      return null;
    }

    return (
      courses.find((course) => slugifyCourseName(course.title) === courseSlug) ??
      null
    );
  };

  const persistNormalizedCourses = (nextCourses: CourseMetadata[]) => {
    const normalizedCourses = nextCourses.map((course) =>
      normalizeCourseMetadata(course),
    );
    setCourses(normalizedCourses);
    localStorage.setItem(
      "local-course-player::courses",
      JSON.stringify(normalizedCourses),
    );
  };

  const closePriorityDialog = () => {
    setPendingCourseImport(null);
    setPriorityDraft(DEFAULT_COURSE_PRIORITY);
  };

  const primeCourseDurations = (courseId: string, files: File[]) => {
    const cachedCourse = courseFilesCache[courseId];
    if (cachedCourse?.lessonDurations || durationJobsRef.current.has(courseId)) {
      return;
    }

    durationJobsRef.current.add(courseId);

    void readVideoDurations(files)
      .then((durations) => {
        const lessonDurations = createLessonDurationMap(files, durations);
        const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);

        setCourseFilesCache((previousState) => ({
          ...previousState,
          [courseId]: {
            files,
            lessonDurations,
          },
        }));

        if (localStorage.getItem(APP_ACTIVE_COURSE_KEY) === courseId) {
          setSelectedLessonDurations(lessonDurations);
        }

        setCourses((previousCourses) => {
          const nextCourses = previousCourses.map((course) =>
            course.id === courseId && (!course.totalDuration || course.totalDuration <= 0)
              ? { ...course, totalDuration }
              : course,
          );

          localStorage.setItem(
            "local-course-player::courses",
            JSON.stringify(nextCourses),
          );

          return nextCourses;
        });
      })
      .finally(() => {
        durationJobsRef.current.delete(courseId);
      });
  };

  useEffect(() => {
    const restorePlayerView = async () => {
      if (route.name !== "player") {
        setIsRestoringPlayer(false);
        return;
      }

      const routedCourse = getPlayerCourseFromSlug(route.courseSlug);
      const targetCourseId =
        routedCourse?.id ?? localStorage.getItem(APP_ACTIVE_COURSE_KEY);

      if (!targetCourseId) {
        navigateTo({ name: "home", path: appRoutes.home }, { replace: true });
        setIsRestoringPlayer(false);
        return;
      }

      if (
        selectedFiles.length > 0 &&
        localStorage.getItem(APP_ACTIVE_COURSE_KEY) === targetCourseId
      ) {
        setIsRestoringPlayer(false);
        return;
      }

      const activeCourse = courses.find((course) => course.id === targetCourseId);
      if (!activeCourse?.hasHandle) {
        navigateTo({ name: "home", path: appRoutes.home }, { replace: true });
        setIsRestoringPlayer(false);
        return;
      }

      try {
        const handle = await db.getHandle(targetCourseId);
        if (!handle) {
          navigateTo({ name: "home", path: appRoutes.home }, { replace: true });
          return;
        }

        const hasPermission = await verifyPermission(handle);
        if (!hasPermission) {
          navigateTo({ name: "home", path: appRoutes.home }, { replace: true });
          return;
        }

        const allFiles = await scanDirectory(handle, handle.name);
        const videoFiles = allFiles.filter(isVideoFile);
        if (!videoFiles.length) {
          navigateTo({ name: "home", path: appRoutes.home }, { replace: true });
          return;
        }

        setCourseFilesCache((previousState) => ({
          ...previousState,
          [targetCourseId]: { files: videoFiles },
        }));
        setSelectedFiles(videoFiles);
        setSelectedLessonDurations({});
        localStorage.setItem(APP_ACTIVE_COURSE_KEY, targetCourseId);
        navigateTo(
          { name: "player", path: buildPlayerRoute(activeCourse.title), courseSlug: slugifyCourseName(activeCourse.title) },
          { replace: true },
        );
        primeCourseDurations(targetCourseId, videoFiles);
      } catch (error) {
        console.error("Failed to restore player view", error);
        navigateTo({ name: "home", path: appRoutes.home }, { replace: true });
      } finally {
        setIsRestoringPlayer(false);
      }
    };

    void restorePlayerView();
  }, [courses, route, selectedFiles]);

  const saveCourses = (newCourses: CourseMetadata[]) => {
    persistNormalizedCourses(newCourses);
  };

  const handleCourseSelect = (
    metadata: CourseMetadata,
    files: File[],
    lessonDurations?: LessonDurationMap,
  ) => {
    setCourseFilesCache((prev) => ({
      ...prev,
      [metadata.id]: { files, lessonDurations },
    }));
    setSelectedFiles(files);
    setSelectedLessonDurations(lessonDurations ?? {});
    localStorage.setItem(APP_ACTIVE_COURSE_KEY, metadata.id);
    navigateTo({
      name: "player",
      path: buildPlayerRoute(metadata.title),
      courseSlug: slugifyCourseName(metadata.title),
    });

    if (!lessonDurations) {
      primeCourseDurations(metadata.id, files);
    }
  };

  const handleConfirmPriority = () => {
    const normalizedPriority = priorityDraft.trim() || DEFAULT_COURSE_PRIORITY;

    if (!pendingCourseImport) {
      return;
    }

    const newCourse: CourseMetadata = {
      id: pendingCourseImport.courseKey,
      title: pendingCourseImport.folderName,
      thumbnail: pendingCourseImport.thumbnail,
      priority: normalizedPriority,
      path: pendingCourseImport.path,
      lastPlayedAt: Date.now(),
      lessonCount: pendingCourseImport.lessonCount,
      totalDuration:
        pendingCourseImport.totalDuration > 0
          ? pendingCourseImport.totalDuration
          : undefined,
      hasHandle: pendingCourseImport.hasHandle,
    };

    const existingIndex = courses.findIndex(
      (course) => course.id === newCourse.id,
    );
    const updatedCourses =
      existingIndex > -1
        ? courses.map((course, index) =>
            index === existingIndex ? newCourse : course,
          )
        : [newCourse, ...courses];

    closePriorityDialog();
    saveCourses(updatedCourses);
    handleCourseSelect(
      newCourse,
      pendingCourseImport.videoFiles,
      pendingCourseImport.lessonDurations,
    );

    if (!pendingCourseImport.lessonDurations) {
      primeCourseDurations(
        pendingCourseImport.courseKey,
        pendingCourseImport.videoFiles,
      );
    }

    if (pendingCourseImport.handle) {
      const courseHandle = pendingCourseImport.handle;
      void verifyReadWritePermission(pendingCourseImport.handle)
        .then((hasPermission) => {
          if (!hasPermission) {
            return;
          }

          return writeHandleTextFile(
            courseHandle,
            "priority.txt",
            normalizedPriority,
          );
        })
        .catch((error) => {
          console.error("Failed to persist course priority file", error);
        });
    }
  };

  const processAndSelectCourse = async (
    videoFiles: File[],
    allFiles: File[],
    handle?: FileSystemDirectoryHandle,
  ) => {
    const folderName = getCourseFolderName(videoFiles);

    const mappedLessons = videoFiles
      .map((file) => ({
        id: getRelativePath(file),
        path: getRelativePath(file),
      }))
      .sort((a, b) =>
        a.path.localeCompare(b.path, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );

    const courseKey = buildCourseKey(
      folderName,
      mappedLessons as unknown as Parameters<typeof buildCourseKey>[1],
    );

    let thumbnailBase64 = "";
    const thumbnailFile = allFiles.find(
      (file) => file.name.toLowerCase() === "thumbnail.png",
    );
    if (thumbnailFile) {
      thumbnailBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(thumbnailFile);
      });
    }

    let nextPriority = DEFAULT_COURSE_PRIORITY;
    const priorityFile = allFiles.find(
      (file) => file.name.toLowerCase() === "priority.txt",
    );
    if (priorityFile) {
      nextPriority = await priorityFile
        .text()
        .then((text) => text.trim() || DEFAULT_COURSE_PRIORITY)
        .catch(() => DEFAULT_COURSE_PRIORITY);
    }

    let courseTitle = folderName;
    const courseConfigFile = allFiles.find(
      (file) => file.name.toLowerCase() === "course.json",
    );
    if (courseConfigFile) {
      courseTitle = await courseConfigFile
        .text()
        .then((text) => {
          const parsed = JSON.parse(text) as { title?: string };
          return parsed.title?.trim() || folderName;
        })
        .catch(() => folderName);
    } else if (handle) {
      const courseConfigText = await readHandleFileText(handle, "course.json");
      if (courseConfigText) {
        courseTitle = JSON.parse(courseConfigText).title?.trim() || folderName;
      }
    }

    if (handle) {
      await db.saveHandle(courseKey, handle);
    }

    setPriorityDraft(nextPriority);
    setPendingCourseImport({
      courseKey,
      folderName: courseTitle,
      thumbnail: thumbnailBase64,
      path: videoFiles[0].webkitRelativePath?.split("/")[0] || folderName,
      lessonCount: videoFiles.length,
      totalDuration: 0,
      hasHandle: Boolean(handle),
      videoFiles,
      handle,
    });

    void readVideoDurations(videoFiles).then((durations) => {
      const totalDuration = durations.reduce(
        (sum, duration) => sum + duration,
        0,
      );
      const lessonDurations = createLessonDurationMap(videoFiles, durations);

      setPendingCourseImport((current) =>
        current?.courseKey === courseKey
          ? {
              ...current,
              totalDuration,
              lessonDurations,
            }
          : current,
      );
    });
  };

  const handleAddCourse = async () => {
    if ("showDirectoryPicker" in window) {
      try {
        // @ts-expect-error File System Access API
        const handle = await window.showDirectoryPicker();
        const allFiles = await scanDirectory(handle, handle.name);
        const videoFiles = allFiles.filter(isVideoFile);

        if (videoFiles.length === 0) {
          window.alert("No video files found in selected folder.");
          return;
        }

        await processAndSelectCourse(videoFiles, allFiles, handle);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
          fileInputRef.current?.click();
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleLegacyFolderPick = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFilesList = Array.from(event.target.files || []);
    const videoFiles = selectedFilesList.filter(isVideoFile);

    if (!videoFiles.length) {
      window.alert("No video files were found in the selected folder.");
      return;
    }

    await processAndSelectCourse(videoFiles, selectedFilesList);
    event.target.value = "";
  };

  const handleBackToHome = () => {
    localStorage.removeItem(APP_ACTIVE_COURSE_KEY);
    setSelectedFiles([]);
    setSelectedLessonDurations({});
    navigateTo({ name: "home", path: appRoutes.home });
  };

  const handlePlayFromCache = (courseId: string) => {
    const cachedCourse = courseFilesCache[courseId];
    if (cachedCourse) {
      setSelectedFiles(cachedCourse.files);
      setSelectedLessonDurations(cachedCourse.lessonDurations ?? {});
      localStorage.setItem(APP_ACTIVE_COURSE_KEY, courseId);
      const course = courses.find((entry) => entry.id === courseId);
      navigateTo({
        name: "player",
        path: buildPlayerRoute(course?.title ?? courseId),
        courseSlug: slugifyCourseName(course?.title ?? courseId),
      });
      if (!cachedCourse.lessonDurations) {
        primeCourseDurations(courseId, cachedCourse.files);
      }
      return true;
    }
    return false;
  };

  return (
    <>
      <HomePageDialogLayer
        defaultCoursePriority={DEFAULT_COURSE_PRIORITY}
        pendingCourseImport={pendingCourseImport}
        priorityDraft={priorityDraft}
        onClosePriorityDialog={closePriorityDialog}
        onConfirmPriority={handleConfirmPriority}
        onPriorityDraftChange={setPriorityDraft}
      />

      <HomePageCoursePickerInput
        inputRef={fileInputRef}
        onChange={handleLegacyFolderPick}
      />

      {route.name === "player" ? (
        isRestoringPlayer ? (
          <PlayerShellSkeleton />
        ) : (
          <LocalCoursePlayer
            initialFiles={selectedFiles}
            initialLessonDurations={selectedLessonDurations}
            onBack={handleBackToHome}
          />
        )
      ) : route.name === "dashboard" ? (
        <LibraryDashboard
          courses={courses}
          onBack={() => navigateTo({ name: "home", path: appRoutes.home })}
          onAddCourse={handleAddCourse}
          onSaveCourses={saveCourses}
        />
      ) : (
        <HomePage
          courses={courses}
          onAddCourse={handleAddCourse}
          onSaveCourses={saveCourses}
          onCourseSelect={handleCourseSelect}
          filesCache={courseFilesCache}
          onPlayFromCache={handlePlayFromCache}
          onPrimeCourseDurations={primeCourseDurations}
          onOpenDashboard={() =>
            navigateTo({ name: "dashboard", path: appRoutes.dashboard })
          }
        />
      )}
    </>
  );
}
