import * as DocumentPicker from "expo-document-picker";
import { copyAssetToAppStorage } from "../../services/file-access";

export async function pickAndStoreThumbnail(courseId: string) {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const safeName = asset.name ? asset.name.replace(/\s+/g, "-") : "thumbnail.jpg";
  return copyAssetToAppStorage(asset.uri, `${courseId}-${safeName}`);
}
