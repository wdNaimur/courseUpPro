import { Pressable, Text, View } from "react-native";
import type { ImportedCourse } from "../../types/course";
import { tokens } from "../../theme/tokens";

type CourseManagementScreenProps = {
  courses: ImportedCourse[];
  onSelectCourse: (course: ImportedCourse) => void;
};

export function CourseManagementScreen({
  courses,
  onSelectCourse,
}: CourseManagementScreenProps) {
  return (
    <View style={{ gap: tokens.spacing.md }}>
      {courses.map((course) => (
        <Pressable
          key={course.id}
          onPress={() => onSelectCourse(course)}
          style={{
            padding: tokens.spacing.md,
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.colors.card,
            borderWidth: 1,
            borderColor: tokens.colors.border,
          }}
        >
          <Text style={{ color: tokens.colors.text, fontWeight: "700", fontSize: 16 }}>
            {course.title}
          </Text>
          <Text style={{ color: tokens.colors.muted, marginTop: 4 }}>
            {course.priority}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
