import type { CourseMetadata } from "../../types/course";
import DashboardCoursesTable from "./DashboardCoursesTable";
import DashboardHeaderSection from "./DashboardHeaderSection";
import DashboardToolbarSection from "./DashboardToolbarSection";

type DashboardContentSectionsProps = {
  courses: CourseMetadata[];
  coursesCount: number;
  defaultCoursePriority: string;
  isAddingCourse: boolean;
  onAddCourse: () => void;
  onBack: () => void;
  onDeleteCourse: (courseId: string) => void;
  onEditCourse: (courseId: string) => void;
  onSearchQueryChange: (value: string) => void;
  searchQuery: string;
};

export default function DashboardContentSections({
  courses,
  coursesCount,
  defaultCoursePriority,
  isAddingCourse,
  onAddCourse,
  onBack,
  onDeleteCourse,
  onEditCourse,
  onSearchQueryChange,
  searchQuery,
}: DashboardContentSectionsProps) {
  return (
    <>
      <DashboardHeaderSection coursesCount={coursesCount} onBack={onBack} />
      <DashboardToolbarSection
        isAddingCourse={isAddingCourse}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onAddCourse={onAddCourse}
      />
      <DashboardCoursesTable
        courses={courses}
        defaultCoursePriority={defaultCoursePriority}
        onEdit={onEditCourse}
        onDelete={onDeleteCourse}
      />
    </>
  );
}
