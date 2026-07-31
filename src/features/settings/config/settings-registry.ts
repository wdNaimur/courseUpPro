import type { SettingsCategorySchema } from "../types/settings";
import { formatPresetSummary, getAllAspectRatios } from "../utils/player-settings";

export const SETTINGS_REGISTRY: SettingsCategorySchema[] = [
  {
    id: "presets",
    label: "Presets & Offsets",
    subtitle: "Configured offset rules & custom presets",
    iconName: "SlidersHorizontal",
    badgeColorClass: "bg-blue-500/15 text-blue-400",
    iconColorClass: "text-blue-400",
    getSummary: (settings) => formatPresetSummary(settings.startOffset, settings.endOffset),
  },
  {
    id: "aspect",
    label: "Player & Display",
    subtitle: "Aspect ratio and video framing preferences",
    iconName: "Monitor",
    badgeColorClass: "bg-cyan-500/15 text-cyan-400",
    iconColorClass: "text-cyan-400",
    getSummary: (settings) => {
      const all = getAllAspectRatios(settings.customAspectRatios || []);
      const matched = all.find(
        (r) => r.id === settings.aspectRatio || r.ratioValue === settings.aspectRatio,
      );
      return matched
        ? `Aspect ratio: ${matched.label}`
        : `Aspect ratio: ${settings.aspectRatio || "16:9"}`;
    },
  },
];
