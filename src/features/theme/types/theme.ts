export type ThemePresetId = "midnight" | "oled" | "dracula" | "nordic" | "light";

export type AccentColorId = "emerald" | "indigo" | "cyan" | "amber" | "crimson" | "purple";

export type ThemePreset = {
  id: ThemePresetId;
  name: string;
  desc: string;
  bg: string;
  panel: string;
  border: string;
  accent: string;
  accentSoft: string;
  isDark: boolean;
};

export type AccentColorOption = {
  id: AccentColorId;
  name: string;
  hex: string;
  softHex: string;
};

export type ThemeConfig = {
  presetId: ThemePresetId;
  accentId: AccentColorId;
  customAccentHex?: string;
  blurIntensity: "none" | "subtle" | "standard" | "deep";
};
