import React, { useRef, useState } from "react";
import { FolderOpen, Plus, Search } from "lucide-react";
import type { CourseMetadata } from "../types/course";
import CourseCard from "../components/home/CourseCard";
import {
  buildCourseKey,
  getCourseFolderName,
  getRelativePath,
  isVideoFile,
} from "../utils/course-helpers";
import { db } from "../utils/db";
import { scanDirectory, verifyPermission } from "../utils/file-system";

type HomePageProps = {
  onCourseSelect: (courseMetadata: CourseMetadata, files: File[]) => void;
  filesCache: Record<string, File[]>;
  onPlayFromCache: (courseId: string) => boolean;
};

export default function HomePage({ onCourseSelect, filesCache, onPlayFromCache }: HomePageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [courses, setCourses] = useState<CourseMetadata[]>(() => {
    const saved = localStorage.getItem("local-course-player::courses");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to load saved courses", e);
      }
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const saveCourses = (newCourses: CourseMetadata[]) => {
    setCourses(newCourses);
    localStorage.setItem("local-course-player::courses", JSON.stringify(newCourses));
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (window.confirm("Remove this course from your list? (Progress will be kept)")) {
      const updated = courses.filter((c) => c.id !== courseId);
      saveCourses(updated);
      await db.removeHandle(courseId);
    }
  };

  const processAndSelect = async (videoFiles: File[], allFiles: File[], handle?: FileSystemDirectoryHandle) => {
    const folderName = getCourseFolderName(videoFiles);
    
    const mappedLessons = videoFiles
      .map((file) => ({
        id: getRelativePath(file),
        path: getRelativePath(file),
      }))
      .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: 'base' }));

    const courseKey = buildCourseKey(folderName, mappedLessons as unknown as Parameters<typeof buildCourseKey>[1]);

    let thumbnailBase64 = "";
    const thumbnailFile = allFiles.find(f => f.name.toLowerCase() === "thumbnail.png");
    if (thumbnailFile) {
      thumbnailBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(thumbnailFile);
      });
    }

    const newCourse: CourseMetadata = {
      id: courseKey,
      title: folderName,
      thumbnail: thumbnailBase64,
      path: videoFiles[0].webkitRelativePath?.split('/')[0] || folderName,
      lastPlayedAt: Date.now(),
      lessonCount: videoFiles.length,
      hasHandle: !!handle
    };

    if (handle) {
      await db.saveHandle(courseKey, handle);
    }

    const existingIndex = courses.findIndex(c => c.id === courseKey);
    let updatedCourses: CourseMetadata[];
    if (existingIndex > -1) {
      updatedCourses = [...courses];
      updatedCourses[existingIndex] = newCourse;
    } else {
      updatedCourses = [newCourse, ...courses];
    }
    
    saveCourses(updatedCourses);
    onCourseSelect(newCourse, videoFiles);
  };

  const handleAddCourse = async () => {
    // Try File System Access API first
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-expect-error File System Access API
        const handle = await window.showDirectoryPicker();
        setIsScanning(true);
        const allFiles = await scanDirectory(handle);
        const videoFiles = allFiles.filter(isVideoFile);
        
        if (videoFiles.length === 0) {
          window.alert("No video files found in selected folder.");
          return;
        }
        
        await processAndSelect(videoFiles, allFiles, handle);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
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

  const handleLegacyFolderPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            const allFiles = await scanDirectory(handle);
            const videoFiles = allFiles.filter(isVideoFile);
            onCourseSelect(metadata, videoFiles);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to restore handle", err);
      }
    }

    // Fallback if handle fails or doesn't exist
    if (window.confirm(`Open folder for "${metadata.title}" to continue learning?`)) {
      if ('showDirectoryPicker' in window) {
        handleAddCourse();
      } else {
        fileInputRef.current?.click();
      }
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 px-4 py-8 md:px-12 lg:px-24">
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
            <p className="text-lg font-bold text-white text-center">Scanning your files...<br/><span className="text-sm font-normal text-slate-400">This may take a moment for large folders</span></p>
          </div>
        </div>
      )}

      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">My Local Courses</h1>
          <p className="text-slate-400">Manage and play your locally stored video courses seamlessly.</p>
        </div>

        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            // @ts-expect-error webkitdirectory is supported in the browser
            webkitdirectory=""
            className="hidden"
            onChange={handleLegacyFolderPick}
          />
          <button
            onClick={handleAddCourse}
            className="flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500 hover:-translate-y-1 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Add New Course
          </button>
        </div>
      </header>

      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search your courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 py-4 pl-14 pr-6 text-slate-100 placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
        />
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onSelect={handleCourseClick}
              onRemove={handleRemoveCourse}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <div className="rounded-full bg-slate-900 p-8 mb-6">
            <FolderOpen className="h-16 w-16 text-slate-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-300 mb-3">No courses added yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Click the "Add New Course" button to select a folder from your computer and start learning.
          </p>
          <button
            onClick={handleAddCourse}
            className="rounded-full border border-slate-700 px-8 py-3 font-semibold text-slate-300 hover:border-slate-500 transition-colors"
          >
            Select a folder
          </button>
        </div>
      )}
    </div>
  );
}
