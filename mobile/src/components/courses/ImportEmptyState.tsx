import { Pressable, Text } from "react-native";
import { EmptyState } from "../ui/EmptyState";
import { tokens } from "../../theme/tokens";

type ImportEmptyStateProps = {
  onImport: () => void;
};

export function ImportEmptyState({ onImport }: ImportEmptyStateProps) {
  return (
    <>
      <EmptyState
        title="No courses imported yet"
        description="Pick downloaded lesson videos from your device to start building your offline library."
      />
      <Pressable
        onPress={onImport}
        style={{
          backgroundColor: tokens.colors.accent,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: tokens.radius.md,
        }}
      >
        <Text style={{ color: "#02111E", fontWeight: "800", textAlign: "center" }}>
          Import course files
        </Text>
      </Pressable>
    </>
  );
}
