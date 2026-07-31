import type React from "react";
import type { CustomAspectRatio, OffsetPreset, PlayerSettings } from "../types/settings";

export const PLAYER_SETTINGS_STORAGE_KEY = "local-course-player::video-settings";

export const SYSTEM_PRESETS: OffsetPreset[] = [
  { id: "off", name: "Default (0s)", startOffset: 0, endOffset: 0, isSystem: true },
];

export const SYSTEM_ASPECT_RATIOS: CustomAspectRatio[] = [
  { id: "16:9", label: "16:9 Widescreen", ratioValue: "16/9", desc: "Default 16:9 HD widescreen format", isSystem: true },
  { id: "4:3", label: "4:3 Classic TV", ratioValue: "4/3", desc: "Standard 4:3 SD television format", isSystem: true },
  { id: "21:9", label: "21:9 Ultrawide", ratioValue: "21/9", desc: "Ultrawide 21:9 cinematic movie format", isSystem: true },
  { id: "cover", label: "Fill / Cover", ratioValue: "cover", desc: "Expands video to fill frame without black bars", isSystem: true },
  { id: "contain", label: "Fit / Contain", ratioValue: "contain", desc: "Fits entire video preserving natural proportions", isSystem: true },
];

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  activePresetId: "off",
  startOffset: 0,
  endOffset: 0,
  aspectRatio: "16:9",
  customPresets: [],
  customAspectRatios: [],
};

export function getAllPresets(customPresets: OffsetPreset[] = []): OffsetPreset[] {
  return [...SYSTEM_PRESETS, ...customPresets];
}

export function getAllAspectRatios(customAspectRatios: CustomAspectRatio[] = []): CustomAspectRatio[] {
  return [...SYSTEM_ASPECT_RATIOS, ...customAspectRatios];
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

    const customAspectRatios: CustomAspectRatio[] = Array.isArray(parsed?.customAspectRatios)
      ? parsed.customAspectRatios.map((r: Record<string, unknown>, index: number) => ({
          id: String(r?.id || `custom-ratio-${index}`),
          label: String(r?.label || "Custom Ratio"),
          ratioValue: String(r?.ratioValue || "1/1"),
          desc: String(r?.desc || "Custom aspect ratio"),
          isSystem: false,
        }))
      : [];

    const startOffset = Math.max(0, Number(parsed?.startOffset) || 0);
    const endOffset = Math.max(0, Number(parsed?.endOffset) || 0);
    const activePresetId = typeof parsed?.activePresetId === "string" ? parsed.activePresetId : "off";
    const aspectRatio = typeof parsed?.aspectRatio === "string" ? parsed.aspectRatio : "16:9";

    return {
      activePresetId,
      startOffset,
      endOffset,
      aspectRatio,
      customPresets,
      customAspectRatios,
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

export function getAspectRatioStyle(
  aspectRatio: string = "16:9",
  customAspectRatios: CustomAspectRatio[] = [],
): {
  containerClass: string;
  videoClass: string;
  containerStyle?: React.CSSProperties;
} {
  if (aspectRatio === "cover") {
    return { containerClass: "aspect-video", videoClass: "object-cover" };
  }
  if (aspectRatio === "contain") {
    return { containerClass: "aspect-video", videoClass: "object-contain" };
  }
  if (aspectRatio === "4:3") {
    return { containerClass: "aspect-[4/3]", videoClass: "object-contain" };
  }
  if (aspectRatio === "21:9") {
    return { containerClass: "aspect-[21/9]", videoClass: "object-contain" };
  }
  if (aspectRatio === "16:9") {
    return { containerClass: "aspect-video", videoClass: "object-contain" };
  }

  const allRatios = getAllAspectRatios(customAspectRatios);
  const matched = allRatios.find((r) => r.id === aspectRatio || r.ratioValue === aspectRatio);

  if (matched && matched.ratioValue && matched.ratioValue !== "cover" && matched.ratioValue !== "contain") {
    return {
      containerClass: "",
      videoClass: "object-contain",
      containerStyle: { aspectRatio: matched.ratioValue },
    };
  }

  return { containerClass: "aspect-video", videoClass: "object-contain" };
}
