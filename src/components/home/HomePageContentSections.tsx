import type { CourseMetadata } from "../../types/course";
import HomePageCoursesSection from "./HomePageCoursesSection";
import HomePageMetadataSection from "./HomePageMetadataSection";
import HomePageSearchSection from "./HomePageSearchSection";
import HomePageTrustSection from "./HomePageTrustSection";
import HomePageWorkflowSection from "./HomePageWorkflowSection";

type HomePageContentSectionsProps = {
  appName: string;
  filteredCourses: CourseMetadata[];
  isAddingCourse: boolean;
  onAddCourse: () => void;
  onCourseClick: (course: CourseMetadata) => void | Promise<void>;
  onOpenDashboard: () => void;
  onSearchQueryChange: (value: string) => void;
  searchQuery: string;
};

export default function HomePageContentSections({
  appName,
  filteredCourses,
  isAddingCourse,
  onAddCourse,
  onCourseClick,
  onOpenDashboard,
  onSearchQueryChange,
  searchQuery,
}: HomePageContentSectionsProps) {
  return (
    <>
      <HomePageSearchSection
        isAddingCourse={isAddingCourse}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onAddCourse={onAddCourse}
      />
      <HomePageCoursesSection
        appName={appName}
        filteredCourses={filteredCourses}
        isAddingCourse={isAddingCourse}
        onCourseClick={onCourseClick}
        onAddCourse={onAddCourse}
        onOpenDashboard={onOpenDashboard}
      />
      <HomePageWorkflowSection />
      <HomePageMetadataSection />
      <HomePageTrustSection />
    </>
  );
}
