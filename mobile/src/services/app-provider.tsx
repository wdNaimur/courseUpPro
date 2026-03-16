import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { ImportedCourse, PickedCourseAsset } from "../types/course";
import { initializeDatabase } from "../storage/database";
import { listCourses, saveCourse } from "../storage/course-repository";
import { createCourseFromAssets } from "../features/courses/create-course";

type AppContextValue = {
  courses: ImportedCourse[];
  isReady: boolean;
  banner: string | null;
  dismissBanner: () => void;
  reloadCourses: () => Promise<void>;
  importPickedAssets: (assets: PickedCourseAsset[]) => Promise<ImportedCourse | null>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [courses, setCourses] = useState<ImportedCourse[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const reloadCourses = async () => {
    const nextCourses = await listCourses();
    setCourses(nextCourses);
  };

  useEffect(() => {
    const bootstrap = async () => {
      await initializeDatabase();
      await reloadCourses();
      setIsReady(true);
    };

    void bootstrap().catch((error: unknown) => {
      setBanner(error instanceof Error ? error.message : "Failed to initialize app.");
      setIsReady(true);
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      courses,
      isReady,
      banner,
      dismissBanner: () => setBanner(null),
      reloadCourses,
      importPickedAssets: async (assets) => {
        try {
          const course = await createCourseFromAssets(assets, courses);
          await saveCourse(course);
          await reloadCourses();
          return course;
        } catch (error) {
          setBanner(error instanceof Error ? error.message : "Import failed.");
          return null;
        }
      },
    }),
    [banner, courses, isReady],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider.");
  }

  return context;
}
