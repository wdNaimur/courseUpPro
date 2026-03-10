import { useRef, useState } from "react";
import {
  AlertTriangle,
  FolderOpen,
  Plus,
  Search,
  Sparkles,
  Library,
  Clock3,
} from "lucide-react";
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

type PendingCourseImport = {
  courseKey: string;
  folderName: string;
  thumbnail: string;
  path: string;
  lessonCount: number;
  hasHandle: boolean;
  videoFiles: File[];
  handle?: FileSystemDirectoryHandle;
};

const DEFAULT_COURSE_PRIORITY = "Standard";
const APP_NAME = "CourseUp";

function normalizeCourseMetadata(course: CourseMetadata): CourseMetadata {
  return {
    ...course,
    priority: course.priority?.trim() || DEFAULT_COURSE_PRIORITY,
  };
}

export default function HomePage({ onCourseSelect, filesCache, onPlayFromCache }: HomePageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [courses, setCourses] = useState<CourseMetadata[]>(() => {
    const saved = localStorage.getItem("local-course-player::courses");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
          ? parsed.map((course) => normalizeCourseMetadata(course))
          : [];
      } catch (e) {
        console.error("Failed to load saved courses", e);
      }
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [courseIdToDelete, setCourseIdToDelete] = useState<string | null>(null);
  const [priorityDraft, setPriorityDraft] = useState(DEFAULT_COURSE_PRIORITY);
  const [courseIdToEditPriority, setCourseIdToEditPriority] = useState<string | null>(null);
  const [pendingCourseImport, setPendingCourseImport] = useState<PendingCourseImport | null>(null);

  const saveCourses = (newCourses: CourseMetadata[]) => {
    const normalizedCourses = newCourses.map((course) =>
      normalizeCourseMetadata(course),
    );
    setCourses(normalizedCourses);
    localStorage.setItem("local-course-player::courses", JSON.stringify(normalizedCourses));
  };

  const handleRequestRemoveCourse = (courseId: string) => {
    setCourseIdToDelete(courseId);
  };

  const handleConfirmRemoveCourse = async () => {
    if (!courseIdToDelete) return;

    const updated = courses.filter((c) => c.id !== courseIdToDelete);
    saveCourses(updated);
    localStorage.removeItem(courseIdToDelete);
    await db.removeHandle(courseIdToDelete);
    setCourseIdToDelete(null);
  };

  const handleCancelRemoveCourse = () => {
    setCourseIdToDelete(null);
  };

  const closePriorityDialog = () => {
    setPendingCourseImport(null);
    setCourseIdToEditPriority(null);
    setPriorityDraft(DEFAULT_COURSE_PRIORITY);
  };

  const handleRequestEditPriority = (courseId: string) => {
    const course = courses.find((entry) => entry.id === courseId);
    if (!course) return;

    setCourseIdToEditPriority(courseId);
    setPendingCourseImport(null);
    setPriorityDraft(course.priority || DEFAULT_COURSE_PRIORITY);
  };

  const handleConfirmPriority = () => {
    const normalizedPriority = priorityDraft.trim() || DEFAULT_COURSE_PRIORITY;

    if (pendingCourseImport) {
      const newCourse: CourseMetadata = {
        id: pendingCourseImport.courseKey,
        title: pendingCourseImport.folderName,
        thumbnail: pendingCourseImport.thumbnail,
        priority: normalizedPriority,
        path: pendingCourseImport.path,
        lastPlayedAt: Date.now(),
        lessonCount: pendingCourseImport.lessonCount,
        hasHandle: pendingCourseImport.hasHandle,
      };

      const existingIndex = courses.findIndex((course) => course.id === newCourse.id);
      const updatedCourses =
        existingIndex > -1
          ? courses.map((course, index) => (index === existingIndex ? newCourse : course))
          : [newCourse, ...courses];

      saveCourses(updatedCourses);
      onCourseSelect(newCourse, pendingCourseImport.videoFiles);
      closePriorityDialog();
      return;
    }

    if (courseIdToEditPriority) {
      saveCourses(
        courses.map((course) =>
          course.id === courseIdToEditPriority
            ? { ...course, priority: normalizedPriority }
            : course,
        ),
      );
    }

    closePriorityDialog();
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

    if (handle) {
      await db.saveHandle(courseKey, handle);
    }

    setCourseIdToEditPriority(null);
    setPriorityDraft(priority);
    setPendingCourseImport({
      courseKey,
      folderName,
      thumbnail: thumbnailBase64,
      path: videoFiles[0].webkitRelativePath?.split('/')[0] || folderName,
      lessonCount: videoFiles.length,
      hasHandle: !!handle,
      videoFiles,
      handle,
    });
  };

  const handleAddCourse = async () => {
    // Try File System Access API first
    if ('showDirectoryPicker' in window) {
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
            const allFiles = await scanDirectory(handle, handle.name);
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

  const courseToDelete = courses.find((course) => course.id === courseIdToDelete) || null;
  const cachedCourseCount = Object.keys(filesCache).length;
  const recentCourse = courses
    .slice()
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)[0] || null;

  return (
    <div className="h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.10),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#111827_100%)] px-4 py-6 text-slate-100 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent md:px-10 lg:px-16">
      {courseToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-[2rem] p-6">
            <div className="mb-5 flex items-start gap-4">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Delete course?</h3>
                <p className="mt-1 text-sm text-slate-400">
                  This will remove <span className="font-semibold text-slate-200">{courseToDelete.title}</span> from your list and delete its saved progress.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelRemoveCourse}
                className="glass-button flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoveCourse}
                className="glass-button-danger flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {(pendingCourseImport || courseIdToEditPriority) && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-[2rem] p-6">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
                Course priority
              </p>
              <h3 className="text-2xl font-black text-white">
                {pendingCourseImport ? "Set priority before adding" : "Edit course priority"}
              </h3>
              <p className="text-sm leading-6 text-slate-300">
                Choose how this course should be labeled in your library. You can use values like
                `High`, `Medium`, `Low`, `Focus`, or anything else that fits your workflow.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                Priority label
              </label>
              <input
                type="text"
                value={priorityDraft}
                onChange={(event) => setPriorityDraft(event.target.value)}
                placeholder={DEFAULT_COURSE_PRIORITY}
                className="w-full rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm font-semibold text-slate-100 placeholder:text-slate-500 focus:border-violet-500/40 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
              />
              <div className="flex flex-wrap gap-2">
                {["High", "Medium", "Low", "Focus", DEFAULT_COURSE_PRIORITY].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPriorityDraft(option)}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition",
                      priorityDraft === option
                        ? "glass-button-primary"
                        : "glass-button",
                    ].join(" ")}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closePriorityDialog}
                className="glass-button flex-1 rounded-2xl px-4 py-3 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPriority}
                className="glass-button-primary flex-1 rounded-2xl px-4 py-3 text-sm font-bold"
              >
                {pendingCourseImport ? "Save and open" : "Save priority"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel flex flex-col items-center gap-4 rounded-[2rem] px-10 py-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
            <p className="text-lg font-bold text-white text-center">Scanning your files...<br/><span className="text-sm font-normal text-slate-400">This may take a moment for large folders</span></p>
          </div>
        </div>
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

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8">
        <header className="glass-panel relative overflow-hidden rounded-[2rem] px-6 py-7 md:px-8 md:py-8">
          <div className="absolute -left-10 top-0 h-36 w-36 rounded-full bg-violet-500/16 blur-3xl" />
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/8 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)] xl:items-end">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                {APP_NAME}
              </div>

              <div className="space-y-3">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl">
                  {APP_NAME} keeps your course folders tidy, playable, and easy to revisit.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  A local-first course shelf for people who want quick playback, saved progress, and cleaner organization without uploading anything.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                    <Library className="h-3.5 w-3.5" />
                    Courses
                  </div>
                  <p className="mt-3 text-3xl font-black text-white">{courses.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                    <Clock3 className="h-3.5 w-3.5" />
                    Cached
                  </div>
                  <p className="mt-3 text-3xl font-black text-white">{cachedCourseCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                    <FolderOpen className="h-3.5 w-3.5" />
                    Last opened
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-bold text-white/85">
                    {recentCourse ? recentCourse.title : "No course yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-black/18 p-4 md:p-5">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
                  Quick start
                </p>
                <h2 className="text-2xl font-black text-white">
                  Add a course to {APP_NAME}
                </h2>
                <p className="text-sm leading-6 text-slate-300">
                  Pick a local folder, set its priority, and keep it ready in your library.
                </p>
              </div>

              <button
                onClick={handleAddCourse}
                className="glass-button-primary flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold text-white hover:-translate-y-1"
              >
                <Plus className="h-5 w-5" />
                Add New Course
              </button>

              <p className="text-xs leading-6 text-slate-400">
                Works best with folders that contain lesson videos plus optional `thumbnail.png` and `priority.txt` files.
              </p>
            </div>
          </div>
        </header>

        <section className="glass-panel rounded-[2rem] p-4 md:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/18 py-4 pl-14 pr-6 text-slate-100 placeholder:text-slate-500 focus:border-violet-500/40 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-slate-300">
              <span className="font-bold text-white">{filteredCourses.length}</span>
              <span>{filteredCourses.length === 1 ? "course" : "courses"} shown</span>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white md:text-2xl">Your library</h2>
              <p className="mt-1 text-sm text-slate-400">
                Open a course, adjust its priority, or jump back into your latest lessons.
              </p>
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onSelect={handleCourseClick}
                  onRemove={handleRequestRemoveCourse}
                  onEditPriority={handleRequestEditPriority}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel flex flex-col items-center justify-center rounded-[2rem] px-6 py-20 text-center">
              <div className="mb-6 rounded-full border border-white/10 bg-black/18 p-7">
                <FolderOpen className="h-14 w-14 text-slate-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-100">No courses added yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
                Add a local course folder to start building your {APP_NAME} library and track progress lesson by lesson.
              </p>
              <button
                onClick={handleAddCourse}
                className="glass-button mt-8 rounded-full px-8 py-3 font-semibold text-slate-100"
              >
                Select a folder
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
