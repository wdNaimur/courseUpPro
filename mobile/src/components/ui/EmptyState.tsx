import { Text, View } from "react-native";
import { tokens } from "../../theme/tokens";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View
      style={{
        padding: tokens.spacing.lg,
        borderRadius: tokens.radius.lg,
        backgroundColor: tokens.colors.card,
        borderWidth: 1,
        borderColor: tokens.colors.border,
        gap: tokens.spacing.sm,
      }}
    >
      <Text style={{ color: tokens.colors.text, fontSize: 22, fontWeight: "800" }}>
        {title}
      </Text>
      <Text style={{ color: tokens.colors.muted, fontSize: 15, lineHeight: 22 }}>
        {description}
      </Text>
    </View>
  );
}
