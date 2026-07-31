import type { AccentColorId, AccentColorOption, ThemeConfig, ThemePreset, ThemePresetId } from "../types/theme";

export const THEME_STORAGE_KEY = "local-course-player::theme-config";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    name: "Emerald Cyber",
    desc: "Modern deep emerald cyberpunk dark theme",
    bg: "#07110c",
    panel: "#112219",
    border: "rgba(221, 245, 233, 0.1)",
    accent: "#22c55e",
    accentSoft: "#d7fbe5",
    isDark: true,
  },
  {
    id: "oled",
    name: "OLED Obsidian",
    desc: "Pitch black battery-saving high contrast theme",
    bg: "#000000",
    panel: "#0c0c0c",
    border: "rgba(255, 255, 255, 0.12)",
    accent: "#10b981",
    accentSoft: "#a7f3d0",
    isDark: true,
  },
  {
    id: "dracula",
    name: "Dracula Dusk",
    desc: "Soft dark purple slate with pastel accents",
    bg: "#181825",
    panel: "#1e1e2e",
    border: "rgba(203, 166, 247, 0.15)",
    accent: "#cba6f7",
    accentSoft: "#f5c2e7",
    isDark: true,
  },
  {
    id: "nordic",
    name: "Nordic Frost",
    desc: "Cool arctic blue-gray slate theme",
    bg: "#0f172a",
    panel: "#1e293b",
    border: "rgba(56, 189, 248, 0.15)",
    accent: "#38bdf8",
    accentSoft: "#bae6fd",
    isDark: true,
  },
  {
    id: "light",
    name: "Clean Day (Light)",
    desc: "High-legibility paper light mode for daytime",
    bg: "#f8fafc",
    panel: "#ffffff",
    border: "rgba(0, 0, 0, 0.08)",
    accent: "#4f46e5",
    accentSoft: "#312e81",
    isDark: false,
  },
];

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  { id: "emerald", name: "Emerald", hex: "#22c55e", softHex: "#d7fbe5" },
  { id: "indigo", name: "Indigo", hex: "#6366f1", softHex: "#e0e7ff" },
  { id: "cyan", name: "Cyan", hex: "#06b6d4", softHex: "#cffaff" },
  { id: "amber", name: "Amber", hex: "#f59e0b", softHex: "#fef3c7" },
  { id: "crimson", name: "Rose", hex: "#f43f5e", softHex: "#ffe4e6" },
  { id: "purple", name: "Purple", hex: "#a855f7", softHex: "#f3e8ff" },
];

export const THEMES_BY_ID: Record<ThemePresetId, ThemePreset> = THEME_PRESETS.reduce(
  (acc, theme) => {
    acc[theme.id] = theme;
    return acc;
  },
  {} as Record<ThemePresetId, ThemePreset>,
);

export const ACCENTS_BY_ID: Record<AccentColorId, AccentColorOption> = ACCENT_COLOR_OPTIONS.reduce(
  (acc, accent) => {
    acc[accent.id] = accent;
    return acc;
  },
  {} as Record<AccentColorId, AccentColorOption>,
);

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  presetId: "midnight",
  accentId: "emerald",
  blurIntensity: "standard",
};
