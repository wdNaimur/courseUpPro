import type { CourseMetadata } from "../../types/course";
import HomePageCoursesSection from "./HomePageCoursesSection";
import HomePageMetadataSection from "./HomePageMetadataSection";
import HomePageSearchSection from "./HomePageSearchSection";
import HomePageTrustSection from "./HomePageTrustSection";
import HomePageWorkflowSection from "./HomePageWorkflowSection";

type HomePageContentSectionsProps = {
  appName: string;
  filteredCourses: CourseMetadata[];
  onAddCourse: () => void;
  onCourseClick: (course: CourseMetadata) => void | Promise<void>;
  onOpenDashboard: () => void;
  onSearchQueryChange: (value: string) => void;
  searchQuery: string;
};

export default function HomePageContentSections({
  appName,
  filteredCourses,
  onAddCourse,
  onCourseClick,
  onOpenDashboard,
  onSearchQueryChange,
  searchQuery,
}: HomePageContentSectionsProps) {
  return (
    <>
      <HomePageSearchSection
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onAddCourse={onAddCourse}
      />
      <HomePageCoursesSection
        appName={appName}
        filteredCourses={filteredCourses}
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
