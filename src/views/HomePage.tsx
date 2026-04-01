import { useState } from "react";
import type { CourseMetadata } from "../types/course";
import HomePageContentSections from "../components/home/HomePageContentSections";
import PageShell from "../components/shared/PageShell";
import { db } from "../utils/db";
import {
  readVideoDurations,
  type LessonDurationMap,
} from "../utils/duration";
import { scanDirectory, verifyPermission } from "../utils/file-system";
import { isVideoFile } from "../utils/course-helpers";

type HomePageProps = {
  courses: CourseMetadata[];
  isAddingCourse: boolean;
  onAddCourse: () => void;
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

const APP_NAME = "CourseUp";

export default function HomePage({
  courses,
  isAddingCourse,
  onAddCourse,
  onSaveCourses,
  onCourseSelect,
  filesCache,
  onPlayFromCache,
  onPrimeCourseDurations,
  onOpenDashboard,
}: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setIsScanning] = useState(false);

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
      void onAddCourse();
    }
  };

  const filteredCourses = courses
    .filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);

  return (
    <PageShell>
      <HomePageContentSections
        appName={APP_NAME}
        filteredCourses={filteredCourses}
        isAddingCourse={isAddingCourse}
        onAddCourse={onAddCourse}
        onCourseClick={handleCourseClick}
        onOpenDashboard={onOpenDashboard}
        onSearchQueryChange={setSearchQuery}
        searchQuery={searchQuery}
      />
    </PageShell>
  );
}
