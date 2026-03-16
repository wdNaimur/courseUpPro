import * as DocumentPicker from "expo-document-picker";
import type { PickedCourseAsset } from "../../types/course";

export async function pickCourseSource() {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    type: ["video/*"],
    copyToCacheDirectory: false,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map<PickedCourseAsset>((asset, index) => ({
    id: asset.name || `picked-${index}`,
    name: asset.name || `Lesson ${index + 1}`,
    uri: asset.uri,
    mimeType: asset.mimeType || null,
  }));
}
