import { Text, View } from "react-native";
import { tokens } from "../../theme/tokens";

type ProgressHeaderProps = {
  completedCount: number;
  totalCount: number;
  lastLessonTitle?: string | null;
};

export function ProgressHeader({
  completedCount,
  totalCount,
  lastLessonTitle,
}: ProgressHeaderProps) {
  return (
    <View
      style={{
        padding: tokens.spacing.md,
        borderRadius: tokens.radius.md,
        borderWidth: 1,
        borderColor: tokens.colors.border,
        backgroundColor: tokens.colors.card,
        gap: tokens.spacing.xs,
      }}
    >
      <Text style={{ color: tokens.colors.text, fontSize: 16, fontWeight: "700" }}>
        Progress
      </Text>
      <Text style={{ color: tokens.colors.muted }}>
        {completedCount} of {totalCount} lessons completed
      </Text>
      {lastLessonTitle ? (
        <Text style={{ color: tokens.colors.accentSoft }}>Last opened: {lastLessonTitle}</Text>
      ) : null}
    </View>
  );
}
