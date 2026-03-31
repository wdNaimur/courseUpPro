import { useEffect, useRef, useState } from "react";
import LocalCoursePlayer from "./components/LocalCoursePlayer";
import HomePage from "./views/HomePage";
import LibraryDashboard from "./views/LibraryDashboard";
import type { CourseMetadata } from "./types/course";
import { appRoutes, navigateTo, useAppRoute } from "./router";
import { isVideoFile } from "./utils/course-helpers";
import { db } from "./utils/db";
import {
  createLessonDurationMap,
  readVideoDurations,
  type LessonDurationMap,
} from "./utils/duration";
import { scanDirectory, verifyPermission } from "./utils/file-system";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLessonDurations, setSelectedLessonDurations] =
    useState<LessonDurationMap>({});
  const [courseFilesCache, setCourseFilesCache] = useState<
    Record<string, { files: File[]; lessonDurations?: LessonDurationMap }>
  >({});
  const [isRestoringPlayer, setIsRestoringPlayer] = useState(() => {
    return window.location.pathname === appRoutes.player;
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
      if (route !== appRoutes.player) {
        setIsRestoringPlayer(false);
        return;
      }

      if (selectedFiles.length > 0) {
        setIsRestoringPlayer(false);
        return;
      }

      const activeCourseId = localStorage.getItem(APP_ACTIVE_COURSE_KEY);
      if (!activeCourseId) {
        navigateTo(appRoutes.home, { replace: true });
        setIsRestoringPlayer(false);
        return;
      }

      const activeCourse = courses.find((course) => course.id === activeCourseId);
      if (!activeCourse?.hasHandle) {
        navigateTo(appRoutes.home, { replace: true });
        setIsRestoringPlayer(false);
        return;
      }

      try {
        const handle = await db.getHandle(activeCourseId);
        if (!handle) {
          navigateTo(appRoutes.home, { replace: true });
          return;
        }

        const hasPermission = await verifyPermission(handle);
        if (!hasPermission) {
          navigateTo(appRoutes.home, { replace: true });
          return;
        }

        const allFiles = await scanDirectory(handle, handle.name);
        const videoFiles = allFiles.filter(isVideoFile);
        if (!videoFiles.length) {
          navigateTo(appRoutes.home, { replace: true });
          return;
        }

        setCourseFilesCache((previousState) => ({
          ...previousState,
          [activeCourseId]: { files: videoFiles },
        }));
        setSelectedFiles(videoFiles);
        setSelectedLessonDurations({});
        primeCourseDurations(activeCourseId, videoFiles);
      } catch (error) {
        console.error("Failed to restore player view", error);
        navigateTo(appRoutes.home, { replace: true });
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
    navigateTo(appRoutes.player);

    if (!lessonDurations) {
      primeCourseDurations(metadata.id, files);
    }
  };

  const handleBackToHome = () => {
    localStorage.removeItem(APP_ACTIVE_COURSE_KEY);
    setSelectedFiles([]);
    setSelectedLessonDurations({});
    navigateTo(appRoutes.home);
  };

  const handlePlayFromCache = (courseId: string) => {
    const cachedCourse = courseFilesCache[courseId];
    if (cachedCourse) {
      setSelectedFiles(cachedCourse.files);
      setSelectedLessonDurations(cachedCourse.lessonDurations ?? {});
      localStorage.setItem(APP_ACTIVE_COURSE_KEY, courseId);
      navigateTo(appRoutes.player);
      if (!cachedCourse.lessonDurations) {
        primeCourseDurations(courseId, cachedCourse.files);
      }
      return true;
    }
    return false;
  };

  if (route === appRoutes.player) {
    if (isRestoringPlayer) {
      return <PlayerShellSkeleton />;
    }

    return (
      <LocalCoursePlayer
        initialFiles={selectedFiles}
        initialLessonDurations={selectedLessonDurations}
        onBack={handleBackToHome}
      />
    );
  }

  if (route === appRoutes.dashboard) {
    return (
      <LibraryDashboard
        courses={courses}
        onBack={() => navigateTo(appRoutes.home)}
        onSaveCourses={saveCourses}
      />
    );
  }

  return (
    <HomePage
      courses={courses}
      onSaveCourses={saveCourses}
      onCourseSelect={handleCourseSelect}
      filesCache={courseFilesCache}
      onPlayFromCache={handlePlayFromCache}
      onPrimeCourseDurations={primeCourseDurations}
      onOpenDashboard={() => navigateTo(appRoutes.dashboard)}
    />
  );
}
