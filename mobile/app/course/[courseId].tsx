import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { ImportedLesson } from "../../src/types/course";
import { openCourseSession } from "../../src/features/player/open-course";
import { useAppContext } from "../../src/services/app-provider";
import { Screen } from "../../src/components/ui/Screen";
import { LessonList } from "../../src/components/player/LessonList";
import { VideoPlayer } from "../../src/components/player/VideoPlayer";
import { ProgressHeader } from "../../src/components/player/ProgressHeader";
import { LessonProgressToggle } from "../../src/components/player/LessonProgressToggle";
import { CourseRecoveryNotice } from "../../src/components/courses/CourseRecoveryNotice";
import { countCompletedLessons, createEmptyProgress } from "../../src/utils/course-progress";
import { loadCourseProgress } from "../../src/features/player/load-progress";
import {
  persistLessonCompletion,
  persistLessonPlayback,
} from "../../src/features/player/save-progress";
import { validateCourseAccess } from "../../src/features/courses/validate-course-access";
import type { CourseProgressRecord } from "../../src/types/progress";

export default function CourseRoute() {
  const params = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const { courses } = useAppContext();
  const course = courses.find((entry) => entry.id === params.courseId);
  const session = useMemo(() => (course ? openCourseSession(course) : null), [course]);
  const [activeLesson, setActiveLesson] = useState<ImportedLesson | null>(
    session?.initialLesson ?? null,
  );
  const [progress, setProgress] = useState<CourseProgressRecord | null>(null);
  const [isSourceAccessible, setIsSourceAccessible] = useState(true);

  useEffect(() => {
    if (!course) {
      return;
    }

    void loadCourseProgress(course.id).then(setProgress);
    void validateCourseAccess(course.sourceUri).then(setIsSourceAccessible);
  }, [course]);

  if (!course || !session) {
    return (
      <Screen contentContainerStyle={{ justifyContent: "center" }}>
        <Text style={{ color: "#F8FAFC", fontSize: 20, fontWeight: "700" }}>
          Course not found
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#7DD3FC", marginTop: 16 }}>Back to library</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#7DD3FC", fontSize: 14 }}>Back</Text>
        </Pressable>
        <Text style={{ color: "#F8FAFC", fontSize: 28, fontWeight: "800" }}>
          {course.title}
        </Text>
        <Text style={{ color: "#94A3B8", fontSize: 14 }}>
          {course.lessonCount} lessons • {course.priority}
        </Text>
        {!isSourceAccessible ? <CourseRecoveryNotice /> : null}
        <ProgressHeader
          completedCount={progress ? countCompletedLessons(progress) : 0}
          totalCount={course.lessonCount}
          lastLessonTitle={
            progress?.lastLessonId
              ? course.lessons.find((lesson) => lesson.id === progress.lastLessonId)?.title
              : null
          }
        />
        <VideoPlayer
          courseTitle={course.title}
          lesson={activeLesson}
          onPlaybackSave={async (position, duration) => {
            if (!activeLesson) {
              return;
            }

            const baseProgress = progress ?? createEmptyProgress(course.id);
            const next = await persistLessonPlayback(
              baseProgress,
              course.id,
              activeLesson.id,
              position,
              duration,
            );
            setProgress(next);
          }}
        />
        {activeLesson ? (
          <LessonProgressToggle
            completed={Boolean(progress?.lessons[activeLesson.id]?.completed)}
            onToggle={async () => {
              const baseProgress = progress ?? createEmptyProgress(course.id);
              const next = await persistLessonCompletion(
                baseProgress,
                course.id,
                activeLesson.id,
                !baseProgress.lessons[activeLesson.id]?.completed,
              );
              setProgress(next);
            }}
          />
        ) : null}
        <LessonList
          lessons={course.lessons}
          activeLessonId={activeLesson?.id ?? null}
          onSelectLesson={setActiveLesson}
        />
      </View>
    </Screen>
  );
}
