import { useState } from "react";
import LocalCoursePlayer from "./components/LocalCoursePlayer";
import HomePage from "./views/HomePage";
import type { CourseMetadata } from "./types/course";

export default function App() {
  const [view, setView] = useState<'home' | 'player'>('home');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [courseFilesCache, setCourseFilesCache] = useState<Record<string, File[]>>({});

  const handleCourseSelect = (metadata: CourseMetadata, files: File[]) => {
    // Cache the files for this session
    setCourseFilesCache(prev => ({
      ...prev,
      [metadata.id]: files
    }));
    setSelectedFiles(files);
    setView('player');
  };

  const handleBackToHome = () => {
    setView('home');
  };

  const handlePlayFromCache = (courseId: string) => {
    const cachedFiles = courseFilesCache[courseId];
    if (cachedFiles) {
      setSelectedFiles(cachedFiles);
      setView('player');
      return true;
    }
    return false;
  };

  if (view === 'player') {
    return <LocalCoursePlayer initialFiles={selectedFiles} onBack={handleBackToHome} />;
  }

  return (
    <HomePage 
      onCourseSelect={handleCourseSelect} 
      filesCache={courseFilesCache}
      onPlayFromCache={handlePlayFromCache}
    />
  );
}
