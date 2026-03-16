import { Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import type { ImportedLesson } from "../../types/course";
import { tokens } from "../../theme/tokens";

type VideoPlayerProps = {
  courseTitle: string;
  lesson: ImportedLesson | null;
  onPlaybackSave?: (positionSeconds: number, durationSeconds: number) => void | Promise<void>;
};

export function VideoPlayer({
  courseTitle,
  lesson,
  onPlaybackSave,
}: VideoPlayerProps) {
  const player = useVideoPlayer(lesson?.mediaUri ?? null, (instance) => {
    instance.loop = false;
  });

  if (!lesson) {
    return (
      <View
        style={{
          minHeight: 220,
          borderRadius: tokens.radius.lg,
          backgroundColor: tokens.colors.card,
          borderColor: tokens.colors.border,
          borderWidth: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: tokens.spacing.lg,
        }}
      >
        <Text style={{ color: tokens.colors.text, fontSize: 16, fontWeight: "700" }}>
          Select a lesson to start playing
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: tokens.spacing.sm }}>
      <View
        style={{
          overflow: "hidden",
          borderRadius: tokens.radius.lg,
          borderColor: tokens.colors.border,
          borderWidth: 1,
          backgroundColor: "#000000",
        }}
      >
        <VideoView
          style={{ width: "100%", aspectRatio: 16 / 9 }}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls
          onPlaybackStatusUpdate={(status) => {
            if ("currentTime" in status && "duration" in status && onPlaybackSave) {
              void onPlaybackSave(status.currentTime, status.duration ?? 0);
            }
          }}
        />
      </View>
      <Text style={{ color: tokens.colors.text, fontSize: 18, fontWeight: "700" }}>
        {lesson.title}
      </Text>
      <Text style={{ color: tokens.colors.muted, fontSize: 13 }}>
        {courseTitle} • {lesson.folderLabel}
      </Text>
    </View>
  );
}
