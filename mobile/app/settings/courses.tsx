import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "../../src/components/ui/Screen";
import { CourseManagementScreen } from "../../src/components/courses/CourseManagementScreen";
import { CourseMetadataForm } from "../../src/components/courses/CourseMetadataForm";
import { useAppContext } from "../../src/services/app-provider";
import type { ImportedCourse } from "../../src/types/course";
import { pickAndStoreThumbnail } from "../../src/features/courses/store-thumbnail";
import { updateStoredCourseMetadata } from "../../src/features/courses/update-course-metadata";

export default function CourseSettingsRoute() {
  const { courses, reloadCourses } = useAppContext();
  const [selectedCourse, setSelectedCourse] = useState<ImportedCourse | null>(courses[0] ?? null);
  const [title, setTitle] = useState(selectedCourse?.title ?? "");
  const [priority, setPriority] = useState(selectedCourse?.priority ?? "Standard");
  const [thumbnailUri, setThumbnailUri] = useState<string | null | undefined>(
    selectedCourse?.thumbnailUri,
  );

  const handleSelectCourse = (course: ImportedCourse) => {
    setSelectedCourse(course);
    setTitle(course.title);
    setPriority(course.priority);
    setThumbnailUri(course.thumbnailUri);
  };

  const handlePickThumbnail = async () => {
    if (!selectedCourse) {
      return;
    }

    const nextThumbnailUri = await pickAndStoreThumbnail(selectedCourse.id);
    if (nextThumbnailUri) {
      setThumbnailUri(nextThumbnailUri);
    }
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      return;
    }

    await updateStoredCourseMetadata(selectedCourse, {
      title,
      priority,
      thumbnailUri,
    });
    await reloadCourses();
  };

  return (
    <Screen>
      <Text style={{ color: "#F8FAFC", fontSize: 28, fontWeight: "800" }}>
        Manage course metadata
      </Text>
      <CourseManagementScreen courses={courses} onSelectCourse={handleSelectCourse} />
      {selectedCourse ? (
        <CourseMetadataForm
          title={title}
          priority={priority}
          thumbnailUri={thumbnailUri}
          onChangeTitle={setTitle}
          onChangePriority={setPriority}
          onPickThumbnail={handlePickThumbnail}
          onSubmit={handleSave}
        />
      ) : null}
    </Screen>
  );
}
