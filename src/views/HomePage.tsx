import { useRef, useState } from "react";
import type { CourseMetadata } from "../types/course";
import HomePageCoursesSection from "../components/home/HomePageCoursesSection";
import HomePageMetadataSection from "../components/home/HomePageMetadataSection";
import HomePagePriorityDialog from "../components/home/HomePagePriorityDialog";
import HomePageSearchSection from "../components/home/HomePageSearchSection";
import HomePageTrustSection from "../components/home/HomePageTrustSection";
import HomePageWorkflowSection from "../components/home/HomePageWorkflowSection";
import {
  buildCourseKey,
  getCourseFolderName,
  getRelativePath,
  isVideoFile,
} from "../utils/course-helpers";
import { db } from "../utils/db";
import {
  createLessonDurationMap,
  readVideoDurations,
  type LessonDurationMap,
} from "../utils/duration";
import {
  readHandleFileText,
  scanDirectory,
  verifyPermission,
  verifyReadWritePermission,
  writeHandleTextFile,
} from "../utils/file-system";

type HomePageProps = {
  courses: CourseMetadata[];
  onSaveCourses: (courses: CourseMetadata[]) => void;
  onCourseSelect: (
    courseMetadata: CourseMetadata,
    files: File[],
    lessonDurations?: LessonDurationMap,
  ) => void;
  filesCache: Record<
    string,
    { files: File[]; lessonDurations?: LessonDurationMap }
  >;
  onPlayFromCache: (courseId: string) => boolean;
  onPrimeCourseDurations: (courseId: string, files: File[]) => void;
  onOpenDashboard: () => void;
};

type PendingCourseImport = {
  courseKey: string;
  folderName: string;
  thumbnail: string;
  path: string;
  lessonCount: number;
  totalDuration: number;
  hasHandle: boolean;
  videoFiles: File[];
  lessonDurations?: LessonDurationMap;
  handle?: FileSystemDirectoryHandle;
};

const DEFAULT_COURSE_PRIORITY = "Standard";
const APP_NAME = "CourseUp";

export default function HomePage({
  courses,
  onSaveCourses,
  onCourseSelect,
  filesCache,
  onPlayFromCache,
  onPrimeCourseDurations,
  onOpenDashboard,
}: HomePageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setIsScanning] = useState(false);
  const [priorityDraft, setPriorityDraft] = useState(DEFAULT_COURSE_PRIORITY);
  const [pendingCourseImport, setPendingCourseImport] =
    useState<PendingCourseImport | null>(null);

  const closePriorityDialog = () => {
    setPendingCourseImport(null);
    setPriorityDraft(DEFAULT_COURSE_PRIORITY);
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
    onSaveCourses(updatedCourses);
    onCourseSelect(
      newCourse,
      pendingCourseImport.videoFiles,
      pendingCourseImport.lessonDurations,
    );
    if (!pendingCourseImport.lessonDurations) {
      onPrimeCourseDurations(
        pendingCourseImport.courseKey,
        pendingCourseImport.videoFiles,
      );
    }

    if (pendingCourseImport.handle) {
      void verifyReadWritePermission(pendingCourseImport.handle)
        .then((hasPermission) => {
          if (!hasPermission) {
            return;
          }

          return writeHandleTextFile(
            pendingCourseImport.handle!,
            "priority.txt",
            normalizedPriority,
          );
        })
        .catch((error) => {
          console.error("Failed to persist course priority file", error);
        });
    }
  };

  const processAndSelect = async (
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

    let priority = DEFAULT_COURSE_PRIORITY;
    const priorityFile = allFiles.find(
      (file) => file.name.toLowerCase() === "priority.txt",
    );
    if (priorityFile) {
      priority = await priorityFile
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

    setPriorityDraft(priority);
    setPendingCourseImport({
      courseKey,
      folderName: courseTitle,
      thumbnail: thumbnailBase64,
      path: videoFiles[0].webkitRelativePath?.split("/")[0] || folderName,
      lessonCount: videoFiles.length,
      totalDuration: 0,
      hasHandle: !!handle,
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

  const ensureCourseDuration = async (
    course: CourseMetadata,
    videoFiles: File[],
    lessonDurations?: LessonDurationMap,
  ) => {
    if (typeof course.totalDuration === "number" && course.totalDuration > 0) {
      return;
    }

    const totalDuration = lessonDurations
      ? Object.values(lessonDurations).reduce(
          (sum, duration) => sum + duration,
          0,
        )
      : (await readVideoDurations(videoFiles)).reduce(
          (sum, duration) => sum + duration,
          0,
        );

    onSaveCourses(
      courses.map((entry) =>
        entry.id === course.id ? { ...entry, totalDuration } : entry,
      ),
    );
  };

  const handleAddCourse = async () => {
    if ("showDirectoryPicker" in window) {
      try {
        // @ts-expect-error File System Access API
        const handle = await window.showDirectoryPicker();
        setIsScanning(true);
        const allFiles = await scanDirectory(handle, handle.name);
        const videoFiles = allFiles.filter(isVideoFile);

        if (videoFiles.length === 0) {
          window.alert("No video files found in selected folder.");
          return;
        }

        await processAndSelect(videoFiles, allFiles, handle);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
          fileInputRef.current?.click();
        }
      } finally {
        setIsScanning(false);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleLegacyFolderPick = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    const videoFiles = selectedFiles.filter(isVideoFile);

    if (!videoFiles.length) {
      window.alert("No video files were found in the selected folder.");
      return;
    }

    await processAndSelect(videoFiles, selectedFiles);
  };

  const handleCourseClick = async (metadata: CourseMetadata) => {
    if (filesCache[metadata.id]) {
      await ensureCourseDuration(
        metadata,
        filesCache[metadata.id].files,
        filesCache[metadata.id].lessonDurations,
      );
      onPlayFromCache(metadata.id);
      return;
    }

    if (metadata.hasHandle) {
      try {
        const handle = await db.getHandle(metadata.id);
        if (handle) {
          const hasPermission = await verifyPermission(handle);
          if (hasPermission) {
            setIsScanning(true);
            const allFiles = await scanDirectory(handle, handle.name);
            const videoFiles = allFiles.filter(isVideoFile);
            onCourseSelect(metadata, videoFiles);
            onPrimeCourseDurations(metadata.id, videoFiles);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to restore handle", err);
      } finally {
        setIsScanning(false);
      }
    }

    if (
      window.confirm(
        `Open folder for "${metadata.title}" to continue learning?`,
      )
    ) {
      if ("showDirectoryPicker" in window) {
        void handleAddCourse();
      } else {
        fileInputRef.current?.click();
      }
    }
  };

  const filteredCourses = courses
    .filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);

  return (
    <div className="app-shell h-screen overflow-y-auto px-4 py-6 text-[var(--theme-text)] scrollbar-thin scrollbar-track-transparent md:px-8 lg:px-14">
      {pendingCourseImport && (
        <HomePagePriorityDialog
          defaultCoursePriority={DEFAULT_COURSE_PRIORITY}
          priorityDraft={priorityDraft}
          onPriorityDraftChange={setPriorityDraft}
          onClose={closePriorityDialog}
          onConfirm={handleConfirmPriority}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        // @ts-expect-error webkitdirectory is supported in the browser
        webkitdirectory=""
        className="hidden"
        onChange={handleLegacyFolderPick}
      />

      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-8 pb-10">
        <HomePageSearchSection
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onAddCourse={handleAddCourse}
        />
        <HomePageCoursesSection
          appName={APP_NAME}
          filteredCourses={filteredCourses}
          onCourseClick={handleCourseClick}
          onAddCourse={handleAddCourse}
          onOpenDashboard={onOpenDashboard}
        />
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <HomePageWorkflowSection />
          <HomePageMetadataSection />
        </section>
        <HomePageTrustSection />
      </div>
    </div>
  );
}
