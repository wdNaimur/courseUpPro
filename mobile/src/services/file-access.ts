import * as FileSystem from "expo-file-system";

export async function canAccessUri(uri: string) {
  const info = await FileSystem.getInfoAsync(uri, { size: true });
  return info.exists;
}

export async function copyAssetToAppStorage(uri: string, targetFileName: string) {
  const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  if (!directory) {
    throw new Error("App storage directory is unavailable.");
  }

  const destination = `${directory}${targetFileName}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}
