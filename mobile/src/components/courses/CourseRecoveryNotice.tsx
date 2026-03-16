import { Text, View } from "react-native";
import { tokens } from "../../theme/tokens";

export function CourseRecoveryNotice() {
  return (
    <View
      style={{
        padding: tokens.spacing.md,
        borderRadius: tokens.radius.md,
        backgroundColor: "#1F172A",
        borderWidth: 1,
        borderColor: "#4C1D95",
      }}
    >
      <Text style={{ color: tokens.colors.text, fontWeight: "700" }}>
        This course source is no longer accessible.
      </Text>
      <Text style={{ color: tokens.colors.muted, marginTop: 4 }}>
        Re-import the course files or restore device access to continue playback.
      </Text>
    </View>
  );
}
