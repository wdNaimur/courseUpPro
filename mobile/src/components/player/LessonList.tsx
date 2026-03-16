import { Pressable, Text, View } from "react-native";
import type { ImportedLesson } from "../../types/course";
import { tokens } from "../../theme/tokens";

type LessonListProps = {
  lessons: ImportedLesson[];
  activeLessonId: string | null;
  onSelectLesson: (lesson: ImportedLesson) => void;
};

export function LessonList({
  lessons,
  activeLessonId,
  onSelectLesson,
}: LessonListProps) {
  return (
    <View style={{ gap: tokens.spacing.sm }}>
      {lessons.map((lesson) => {
        const isActive = lesson.id === activeLessonId;

        return (
          <Pressable
            key={lesson.id}
            onPress={() => onSelectLesson(lesson)}
            style={{
              padding: tokens.spacing.md,
              borderRadius: tokens.radius.md,
              backgroundColor: isActive ? "#18324A" : tokens.colors.card,
              borderWidth: 1,
              borderColor: isActive ? tokens.colors.accentSoft : tokens.colors.border,
            }}
          >
            <Text style={{ color: tokens.colors.text, fontWeight: "700" }}>
              {lesson.displayIndex}. {lesson.title}
            </Text>
            <Text style={{ color: tokens.colors.muted, marginTop: 4, fontSize: 13 }}>
              {lesson.folderLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
