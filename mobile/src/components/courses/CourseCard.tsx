import { Pressable, Text } from "react-native";
import type { ImportedCourse } from "../../types/course";
import { tokens } from "../../theme/tokens";

type CourseCardProps = {
  course: ImportedCourse;
  onPress: (course: ImportedCourse) => void;
};

export function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <Pressable
      onPress={() => onPress(course)}
      style={{
        backgroundColor: tokens.colors.card,
        borderColor: tokens.colors.border,
        borderWidth: 1,
        borderRadius: tokens.radius.lg,
        padding: tokens.spacing.md,
        gap: tokens.spacing.xs,
      }}
    >
      <Text style={{ color: tokens.colors.text, fontSize: 18, fontWeight: "800" }}>
        {course.title}
      </Text>
      <Text style={{ color: tokens.colors.muted, fontSize: 14 }}>
        {course.lessonCount} lessons • {course.priority}
      </Text>
      <Text style={{ color: tokens.colors.accentSoft, fontSize: 13 }}>
        {course.accessStatus === "available" ? "Ready offline" : "Needs attention"}
      </Text>
    </Pressable>
  );
}
