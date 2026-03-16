import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { ImportedCourse } from "../../types/course";
import { pickCourseSource } from "../../features/import/pick-course-source";
import { useAppContext } from "../../services/app-provider";
import { tokens } from "../../theme/tokens";
import { Screen } from "../ui/Screen";
import { CourseCard } from "./CourseCard";
import { ImportEmptyState } from "./ImportEmptyState";
import { ImportStatusBanner } from "./ImportStatusBanner";

export function CourseLibraryScreen() {
  const router = useRouter();
  const { banner, courses, dismissBanner, importPickedAssets, isReady } = useAppContext();

  const handleOpenCourse = (course: ImportedCourse) => {
    router.push(`/course/${encodeURIComponent(course.id)}`);
  };

  const handleImport = async () => {
    const assets = await pickCourseSource();
    if (!assets.length) {
      return;
    }

    const imported = await importPickedAssets(assets);
    if (imported) {
      router.push(`/course/${encodeURIComponent(imported.id)}`);
    }
  };

  if (!isReady) {
    return (
      <Screen contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={tokens.colors.accentSoft} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: tokens.spacing.sm }}>
        <Text style={{ color: tokens.colors.text, fontSize: 32, fontWeight: "800" }}>
          CourseUp Mobile
        </Text>
        <Text style={{ color: tokens.colors.muted, fontSize: 15, lineHeight: 22 }}>
          Keep the web app intact and reopen your downloaded courses offline on mobile.
        </Text>
      </View>

      {banner ? <ImportStatusBanner message={banner} onDismiss={dismissBanner} /> : null}

      <Pressable
        onPress={handleImport}
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

      {courses.length === 0 ? (
        <ImportEmptyState onImport={handleImport} />
      ) : (
        <View style={{ gap: tokens.spacing.md }}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onPress={handleOpenCourse} />
          ))}
        </View>
      )}
    </Screen>
  );
}
