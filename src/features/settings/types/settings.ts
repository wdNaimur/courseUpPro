export type CustomAspectRatio = {
  id: string;
  label: string;      // e.g. "1:1 Square" or "9:16 Mobile"
  ratioValue: string; // e.g. "1/1", "9/16", "3/2"
  desc?: string;
  isSystem?: boolean;
};

export type OffsetPreset = {
  id: string;
  name: string;
  startOffset: number; // duration in seconds from start of video
  endOffset: number;   // duration in seconds from end of video
  isSystem?: boolean;
};

export type PlayerSettings = {
  activePresetId: string;
  startOffset: number; // active duration in seconds from start of video
  endOffset: number;   // active duration in seconds from end of video
  aspectRatio: string; // active aspect ratio id/value (e.g. "16:9", "4:3", "cover", "contain", "custom-1:1")
  customPresets: OffsetPreset[];
  customAspectRatios?: CustomAspectRatio[];
};

export type SettingsCategoryId = "presets" | "aspect";

export type SettingsCategorySchema = {
  id: SettingsCategoryId;
  label: string;
  subtitle: string;
  iconName: "SlidersHorizontal" | "Monitor";
  badgeColorClass: string;
  iconColorClass: string;
  getSummary: (settings: PlayerSettings) => string;
};
