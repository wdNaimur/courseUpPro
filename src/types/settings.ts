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
  customPresets: OffsetPreset[];
};
