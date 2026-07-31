import type { PlayerSettings } from "../types/settings";

export const PLAYER_SETTINGS_STORAGE_KEY = "local-course-player::video-settings";

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  startOffset: 0,
  endOffset: 0,
};

export function readPlayerSettings(): PlayerSettings {
  if (typeof localStorage === "undefined") {
    return DEFAULT_PLAYER_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(PLAYER_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      startOffset:
        typeof parsed?.startOffset === "number" && Number.isFinite(parsed.startOffset)
          ? Math.max(0, parsed.startOffset)
          : 0,
      endOffset:
        typeof parsed?.endOffset === "number" && Number.isFinite(parsed.endOffset)
          ? Math.max(0, parsed.endOffset)
          : 0,
    };
  } catch {
    return DEFAULT_PLAYER_SETTINGS;
  }
}

export function savePlayerSettings(settings: PlayerSettings): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PLAYER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save player settings", error);
  }
}

export function formatOffsetDuration(seconds: number): string {
  if (seconds <= 0) return "Disabled (0s)";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}
