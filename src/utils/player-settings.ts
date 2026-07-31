import type { OffsetPreset, PlayerSettings } from "../types/settings";

export const PLAYER_SETTINGS_STORAGE_KEY = "local-course-player::video-settings";

export const SYSTEM_PRESETS: OffsetPreset[] = [
  { id: "off", name: "Default (0s)", startOffset: 0, endOffset: 0, isSystem: true },
];

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  activePresetId: "off",
  startOffset: 0,
  endOffset: 0,
  customPresets: [],
};

export function getAllPresets(customPresets: OffsetPreset[] = []): OffsetPreset[] {
  return [...SYSTEM_PRESETS, ...customPresets];
}

export function readPlayerSettings(): PlayerSettings {
  if (typeof localStorage === "undefined") {
    return DEFAULT_PLAYER_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(PLAYER_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_SETTINGS;
    const parsed = JSON.parse(raw);

    const customPresets: OffsetPreset[] = Array.isArray(parsed?.customPresets)
      ? parsed.customPresets.map((p: Record<string, unknown>, index: number) => ({
          id: String(p?.id || `custom-${index}`),
          name: String(p?.name || "Custom Preset"),
          startOffset: Math.max(0, Number(p?.startOffset) || 0),
          endOffset: Math.max(0, Number(p?.endOffset) || 0),
          isSystem: false,
        }))
      : [];

    const startOffset = Math.max(0, Number(parsed?.startOffset) || 0);
    const endOffset = Math.max(0, Number(parsed?.endOffset) || 0);
    const activePresetId = typeof parsed?.activePresetId === "string" ? parsed.activePresetId : "off";

    return {
      activePresetId,
      startOffset,
      endOffset,
      customPresets,
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
  if (seconds <= 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export function formatPresetSummary(start: number, end: number): string {
  if (start === 0 && end === 0) return "Disabled (0s)";
  return `+${formatOffsetDuration(start)} / -${formatOffsetDuration(end)}`;
}
