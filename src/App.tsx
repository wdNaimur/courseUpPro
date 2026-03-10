import { useState } from "react";
import LocalCoursePlayer from "./components/LocalCoursePlayer";
import HomePage from "./views/HomePage";
import LibraryDashboard from "./views/LibraryDashboard";
import type { CourseMetadata } from "./types/course";

const DEFAULT_COURSE_PRIORITY = "Standard";

function normalizeCourseMetadata(course: CourseMetadata): CourseMetadata {
  return {
    ...course,
    priority: course.priority?.trim() || DEFAULT_COURSE_PRIORITY,
  };
}

export default function App() {
  const [view, setView] = useState<"home" | "player" | "dashboard">("home");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [courseFilesCache, setCourseFilesCache] = useState<Record<string, File[]>>({});
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

  const saveCourses = (newCourses: CourseMetadata[]) => {
    const normalizedCourses = newCourses.map((course) =>
      normalizeCourseMetadata(course),
    );
    setCourses(normalizedCourses);
    localStorage.setItem(
      "local-course-player::courses",
      JSON.stringify(normalizedCourses),
    );
  };

  const handleCourseSelect = (metadata: CourseMetadata, files: File[]) => {
    setCourseFilesCache((prev) => ({
      ...prev,
      [metadata.id]: files,
    }));
    setSelectedFiles(files);
    setView("player");
  };

  const handleBackToHome = () => {
    setView("home");
  };

  const handlePlayFromCache = (courseId: string) => {
    const cachedFiles = courseFilesCache[courseId];
    if (cachedFiles) {
      setSelectedFiles(cachedFiles);
      setView("player");
      return true;
    }
    return false;
  };

  if (view === "player") {
    return <LocalCoursePlayer initialFiles={selectedFiles} onBack={handleBackToHome} />;
  }

  if (view === "dashboard") {
    return (
      <LibraryDashboard
        courses={courses}
        onBack={handleBackToHome}
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
      onOpenDashboard={() => setView("dashboard")}
    />
  );
}
