import { Pressable, Text, View } from "react-native";
import { tokens } from "../../theme/tokens";

type ImportStatusBannerProps = {
  message: string;
  onDismiss: () => void;
};

export function ImportStatusBanner({
  message,
  onDismiss,
}: ImportStatusBannerProps) {
  return (
    <View
      style={{
        backgroundColor: "#112031",
        borderColor: tokens.colors.border,
        borderWidth: 1,
        borderRadius: tokens.radius.md,
        padding: tokens.spacing.md,
        gap: tokens.spacing.sm,
      }}
    >
      <Text style={{ color: tokens.colors.text, fontSize: 14 }}>{message}</Text>
      <Pressable onPress={onDismiss}>
        <Text style={{ color: tokens.colors.accentSoft, fontWeight: "700" }}>Dismiss</Text>
      </Pressable>
    </View>
  );
}
