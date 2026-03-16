import { Pressable, Text, TextInput, View } from "react-native";
import { tokens } from "../../theme/tokens";

type CourseMetadataFormProps = {
  title: string;
  priority: string;
  thumbnailUri?: string | null;
  onChangeTitle: (value: string) => void;
  onChangePriority: (value: string) => void;
  onPickThumbnail: () => void;
  onSubmit: () => void;
};

export function CourseMetadataForm({
  title,
  priority,
  thumbnailUri,
  onChangeTitle,
  onChangePriority,
  onPickThumbnail,
  onSubmit,
}: CourseMetadataFormProps) {
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Course title"
        placeholderTextColor={tokens.colors.muted}
        style={{
          backgroundColor: tokens.colors.card,
          color: tokens.colors.text,
          borderWidth: 1,
          borderColor: tokens.colors.border,
          borderRadius: tokens.radius.md,
          padding: tokens.spacing.md,
        }}
      />
      <TextInput
        value={priority}
        onChangeText={onChangePriority}
        placeholder="Priority"
        placeholderTextColor={tokens.colors.muted}
        style={{
          backgroundColor: tokens.colors.card,
          color: tokens.colors.text,
          borderWidth: 1,
          borderColor: tokens.colors.border,
          borderRadius: tokens.radius.md,
          padding: tokens.spacing.md,
        }}
      />
      <Pressable
        onPress={onPickThumbnail}
        style={{
          backgroundColor: tokens.colors.card,
          borderWidth: 1,
          borderColor: tokens.colors.border,
          borderRadius: tokens.radius.md,
          padding: tokens.spacing.md,
        }}
      >
        <Text style={{ color: tokens.colors.text, textAlign: "center", fontWeight: "700" }}>
          {thumbnailUri ? "Replace thumbnail" : "Choose thumbnail"}
        </Text>
      </Pressable>
      <Pressable
        onPress={onSubmit}
        style={{
          backgroundColor: tokens.colors.accent,
          borderRadius: tokens.radius.md,
          padding: tokens.spacing.md,
        }}
      >
        <Text style={{ color: "#02111E", textAlign: "center", fontWeight: "800" }}>
          Save changes
        </Text>
      </Pressable>
    </View>
  );
}
