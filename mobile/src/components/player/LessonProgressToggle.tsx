import { Pressable, Text } from "react-native";
import { tokens } from "../../theme/tokens";

type LessonProgressToggleProps = {
  completed: boolean;
  onToggle: () => void;
};

export function LessonProgressToggle({
  completed,
  onToggle,
}: LessonProgressToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        backgroundColor: completed ? tokens.colors.accent : tokens.colors.card,
        borderColor: tokens.colors.border,
        borderWidth: 1,
        borderRadius: tokens.radius.md,
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          color: completed ? "#02111E" : tokens.colors.text,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {completed ? "Completed" : "Mark complete"}
      </Text>
    </Pressable>
  );
}
