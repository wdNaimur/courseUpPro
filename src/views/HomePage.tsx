import { useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  FolderOpen,
  Plus,
  Search,
  Sparkles,
  Library,
  Clock3,
  HardDriveDownload,
  SlidersHorizontal,
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
  onCourseSelect: (courseMetadata: CourseMetadata, files: File[]) => void;
  filesCache: Record<string, File[]>;
  onPlayFromCache: (courseId: string) => boolean;
  onOpenDashboard: () => void;
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

export default function HomePage({
  courses,
  onSaveCourses,
  onCourseSelect,
  filesCache,
  onPlayFromCache,
  onOpenDashboard,
}: HomePageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [priorityDraft, setPriorityDraft] = useState(DEFAULT_COURSE_PRIORITY);
  const [pendingCourseImport, setPendingCourseImport] = useState<PendingCourseImport | null>(null);

  const closePriorityDialog = () => {
    setPendingCourseImport(null);
    setPriorityDraft(DEFAULT_COURSE_PRIORITY);
  };

  const handleConfirmPriority = async () => {
    const normalizedPriority = priorityDraft.trim() || DEFAULT_COURSE_PRIORITY;

    if (pendingCourseImport) {
      if (pendingCourseImport.handle) {
        try {
          const hasPermission = await verifyReadWritePermission(
            pendingCourseImport.handle,
          );
          if (hasPermission) {
            await writeHandleTextFile(
              pendingCourseImport.handle,
              "priority.txt",
              normalizedPriority,
            );
          }
        } catch (error) {
          console.error("Failed to persist course priority file", error);
        }
      }

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

      onSaveCourses(updatedCourses);
      onCourseSelect(newCourse, pendingCourseImport.videoFiles);
      closePriorityDialog();
      return;
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

  const cachedCourseCount = Object.keys(filesCache).length;
  const recentCourse = courses
    .slice()
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)[0] || null;

  return (
    <div className="app-shell h-screen overflow-y-auto px-4 py-6 text-[var(--theme-text)] scrollbar-thin scrollbar-track-transparent md:px-8 lg:px-14">
      {pendingCourseImport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--theme-overlay)] px-4 backdrop-blur-md">
          <div className="editorial-panel w-full max-w-lg rounded-[2rem] p-6">
            <div className="space-y-2">
              <p className="section-label">
                Course priority
              </p>
              <h3 className="text-2xl font-black text-white">
                Set priority before adding
              </h3>
              <p className="text-sm leading-6 theme-text-soft">
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
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-black/18 px-4 py-3 text-sm font-semibold text-[var(--theme-text)] placeholder:text-[var(--theme-text-faint)] focus:border-[color:color-mix(in_srgb,var(--theme-accent-soft)_35%,transparent)] focus:outline-none focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--theme-accent-soft)_10%,transparent)]"
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
                Save and open
              </button>
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--theme-overlay)] backdrop-blur-md">
          <div className="editorial-panel flex flex-col items-center gap-4 rounded-[2rem] px-10 py-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--theme-accent-warm)] border-t-transparent"></div>
            <p className="text-center text-lg font-bold text-white">Scanning your files...<br/><span className="theme-text-muted text-sm font-normal">This may take a moment for large folders</span></p>
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

      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-8 pb-10">
        <header className="relative overflow-hidden rounded-[2.25rem] border border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-bg)_80%,transparent)] px-5 py-5 shadow-[0_32px_100px_var(--theme-shadow)] md:px-7 md:py-7">
          <div className="absolute inset-x-[15%] top-[-9rem] h-52 rounded-full bg-[color:color-mix(in_srgb,var(--theme-accent-warm)_18%,transparent)] blur-3xl" />
          <div className="absolute -right-10 bottom-8 h-44 w-44 rounded-full bg-[color:color-mix(in_srgb,var(--theme-accent)_18%,transparent)] blur-3xl" />

          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_380px]">
            <section className="editorial-panel fade-in-up overflow-hidden rounded-[2rem] px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--theme-accent-soft)]" />
                    {APP_NAME}
                  </div>

                  <div className="space-y-4">
                    <p className="section-label">Local-first learning library</p>
                    <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-[var(--theme-text)] md:text-6xl xl:text-[5.3rem]">
                      Organize downloaded courses like a curated collection.
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-[var(--theme-text-muted)] md:text-base">
                      Inspired by editorial portfolio layouts rather than generic dashboards: bold hierarchy, fast scanning, and quick access to the course folders you actually use.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAddCourse}
                      className="glass-button-primary flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold text-white hover:-translate-y-1"
                    >
                      <Plus className="h-5 w-5" />
                      Add New Course
                    </button>
                    <div className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                      Progress is stored locally
                    </div>
                    <button
                      onClick={onOpenDashboard}
                      className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white/80"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                      Manage library
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 self-start">
                  <div className="rounded-[1.6rem] border border-[var(--theme-border)] bg-black/18 p-4">
                    <p className="section-label">Library size</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p className="text-5xl font-black tracking-[-0.05em] text-[var(--theme-text)]">{courses.length}</p>
                      <Library className="h-6 w-6 text-[var(--theme-accent-soft)]" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--theme-text-muted)]">
                      Courses indexed and ready to reopen.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-[var(--theme-border)] bg-black/18 p-4">
                    <p className="section-label">Latest return</p>
                    <p className="mt-4 line-clamp-2 text-lg font-black text-[var(--theme-text)]">
                      {recentCourse ? recentCourse.title : "No course yet"}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                      <Clock3 className="h-4 w-4 text-[var(--theme-accent-soft)]" />
                      <span>{cachedCourseCount} cached for this session</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="fade-in-up grid gap-5 [animation-delay:120ms]">
              <div className="editorial-panel rounded-[2rem] p-5 md:p-6">
                <div className="space-y-2">
                  <p className="section-label">Quick start</p>
                  <h2 className="text-3xl font-black leading-tight text-[var(--theme-text)]">
                    Drop in a folder and open it instantly.
                  </h2>
                  <p className="text-sm leading-6 text-[var(--theme-text-soft)]">
                    Best results come from folders that include lesson videos and optional metadata files like `thumbnail.png` and `priority.txt`.
                  </p>
                </div>

                <button
                  onClick={handleAddCourse}
                  className="glass-button-primary mt-6 flex w-full items-center justify-center gap-2 rounded-[1.4rem] px-6 py-4 font-bold text-white hover:-translate-y-1"
                >
                  <HardDriveDownload className="h-5 w-5" />
                  Import Course Folder
                </button>
              </div>

              <div className="editorial-panel rounded-[2rem] p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-label">System fit</p>
                    <p className="mt-2 text-lg font-black text-[var(--theme-text)]">Built for offline playback</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-[var(--theme-accent-soft)]" />
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.04] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Priority labels</p>
                    <p className="mt-1 text-sm text-[var(--theme-text-soft)]">Tag courses with focus level before they enter the library.</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.04] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Reopen flow</p>
                    <p className="mt-1 text-sm text-[var(--theme-text-soft)]">Saved folder handles restore access when the browser allows it.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="editorial-panel fade-in-up rounded-[2rem] p-4 md:p-5 [animation-delay:160ms]">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
                  <Search className="h-5 w-5 text-[var(--theme-text-faint)]" />
                </div>
                <input
                  type="text"
                  placeholder="Search your courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-[1.4rem] border border-[var(--theme-border)] bg-black/18 py-4 pl-14 pr-6 text-[var(--theme-text)] placeholder:text-[var(--theme-text-faint)] focus:border-[color:color-mix(in_srgb,var(--theme-accent-soft)_35%,transparent)] focus:outline-none focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--theme-accent-soft)_10%,transparent)] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 rounded-[1.3rem] border border-[var(--theme-border)] bg-black/18 px-4 py-3 text-sm text-[var(--theme-text-soft)]">
                <span className="font-bold text-white">{filteredCourses.length}</span>
                <span>{filteredCourses.length === 1 ? "course" : "courses"} shown</span>
              </div>
            </div>
          </div>

          <div className="editorial-panel fade-in-up rounded-[2rem] p-5 [animation-delay:220ms]">
            <p className="section-label">Collection status</p>
            <p className="mt-3 text-3xl font-black leading-none tracking-[-0.04em] text-[var(--theme-text)]">
              {cachedCourseCount}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--theme-text-soft)]">
              Courses already cached in memory for immediate replay.
            </p>
          </div>
        </section>

        <section className="fade-in-up [animation-delay:260ms]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="relative">
              <p className="section-label">Your library</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--theme-text)] md:text-4xl">
                Browse the full course wall
              </h2>
              <p className="mt-2 text-sm text-[var(--theme-text-muted)]">
                Open a course or jump back into your latest lessons. Use the dashboard for edit and delete actions.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="glass-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Manage Library
            </button>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelect={handleCourseClick}
                />
              ))}
            </div>
          ) : (
            <div className="editorial-panel flex flex-col items-center justify-center rounded-[2rem] px-6 py-20 text-center">
              <div className="mb-6 rounded-full border border-white/10 bg-black/18 p-7">
                <FolderOpen className="h-14 w-14 text-[var(--theme-text-faint)]" />
              </div>
              <h2 className="text-2xl font-black text-[var(--theme-text)]">No courses added yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--theme-text-muted)]">
                Add a local course folder to start building your {APP_NAME} library and track progress lesson by lesson.
              </p>
              <button
                onClick={handleAddCourse}
                className="glass-button mt-8 rounded-full px-8 py-3 font-semibold text-[var(--theme-text)]"
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
