import React, { createContext, useContext, useState, useEffect } from "react";
import type { CustomAspectRatio, OffsetPreset, PlayerSettings } from "../types/settings";
import { readPlayerSettings, savePlayerSettings, DEFAULT_PLAYER_SETTINGS } from "../utils/player-settings";

type SettingsContextType = {
  settings: PlayerSettings;
  updateSettings: (newSettings: PlayerSettings) => void;
  selectPreset: (preset: OffsetPreset) => void;
  savePreset: (draft: { name: string; startOffset: number; endOffset: number }, editingId?: string | null) => void;
  deletePreset: (presetId: string) => void;
  selectAspectRatio: (ratioId: string) => void;
  saveAspectRatio: (draft: { label: string; width: number; height: number }, editingId?: string | null) => void;
  deleteAspectRatio: (ratioId: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
  initialSettings,
  onSettingsChange,
  children,
}: {
  initialSettings?: PlayerSettings;
  onSettingsChange?: (settings: PlayerSettings) => void;
  children: React.ReactNode;
}) {
  const [settings, setSettingsState] = useState<PlayerSettings>(
    initialSettings || readPlayerSettings() || DEFAULT_PLAYER_SETTINGS,
  );

  useEffect(() => {
    if (initialSettings) {
      setSettingsState(initialSettings);
    }
  }, [initialSettings]);

  const updateSettings = (nextSettings: PlayerSettings) => {
    setSettingsState(nextSettings);
    savePlayerSettings(nextSettings);
    if (onSettingsChange) {
      onSettingsChange(nextSettings);
    }
  };

  const selectPreset = (preset: OffsetPreset) => {
    updateSettings({
      ...settings,
      activePresetId: preset.id,
      startOffset: preset.startOffset,
      endOffset: preset.endOffset,
    });
  };

  const savePreset = (
    draft: { name: string; startOffset: number; endOffset: number },
    editingId?: string | null,
  ) => {
    const name = draft.name.trim() || "Custom Preset";
    const start = Math.max(0, draft.startOffset);
    const end = Math.max(0, draft.endOffset);
    const currentCustoms = settings.customPresets || [];

    let nextCustomPresets: OffsetPreset[];
    let targetPresetId: string;

    if (editingId) {
      targetPresetId = editingId;
      nextCustomPresets = currentCustoms.map((p) =>
        p.id === editingId ? { ...p, name, startOffset: start, endOffset: end } : p,
      );
    } else {
      targetPresetId = `custom-${Date.now()}`;
      const newPreset: OffsetPreset = {
        id: targetPresetId,
        name,
        startOffset: start,
        endOffset: end,
        isSystem: false,
      };
      nextCustomPresets = [...currentCustoms, newPreset];
    }

    updateSettings({
      ...settings,
      activePresetId: targetPresetId,
      startOffset: start,
      endOffset: end,
      customPresets: nextCustomPresets,
    });
  };

  const deletePreset = (presetId: string) => {
    const currentCustoms = settings.customPresets || [];
    const nextCustomPresets = currentCustoms.filter((p) => p.id !== presetId);

    let nextActiveId = settings.activePresetId;
    let nextStart = settings.startOffset;
    let nextEnd = settings.endOffset;

    if (settings.activePresetId === presetId) {
      nextActiveId = "off";
      nextStart = 0;
      nextEnd = 0;
    }

    updateSettings({
      ...settings,
      activePresetId: nextActiveId,
      startOffset: nextStart,
      endOffset: nextEnd,
      customPresets: nextCustomPresets,
    });
  };

  const selectAspectRatio = (ratioId: string) => {
    updateSettings({
      ...settings,
      aspectRatio: ratioId,
    });
  };

  const saveAspectRatio = (
    draft: { label: string; width: number; height: number },
    editingId?: string | null,
  ) => {
    const w = Math.max(1, Math.floor(draft.width || 1));
    const h = Math.max(1, Math.floor(draft.height || 1));
    const label = draft.label.trim() || `${w}:${h} Custom`;
    const ratioValue = `${w}/${h}`;
    const currentRatios = settings.customAspectRatios || [];

    let nextCustomRatios: CustomAspectRatio[];
    let targetRatioId: string;

    if (editingId) {
      targetRatioId = editingId;
      nextCustomRatios = currentRatios.map((r) =>
        r.id === editingId ? { ...r, label, ratioValue, desc: `${w}:${h} custom ratio` } : r,
      );
    } else {
      targetRatioId = `custom-ratio-${Date.now()}`;
      const newRatio: CustomAspectRatio = {
        id: targetRatioId,
        label,
        ratioValue,
        desc: `${w}:${h} custom ratio`,
        isSystem: false,
      };
      nextCustomRatios = [...currentRatios, newRatio];
    }

    updateSettings({
      ...settings,
      aspectRatio: targetRatioId,
      customAspectRatios: nextCustomRatios,
    });
  };

  const deleteAspectRatio = (ratioId: string) => {
    const currentRatios = settings.customAspectRatios || [];
    const nextCustomRatios = currentRatios.filter((r) => r.id !== ratioId);

    let nextRatio = settings.aspectRatio;
    if (settings.aspectRatio === ratioId) {
      nextRatio = "16:9";
    }

    updateSettings({
      ...settings,
      aspectRatio: nextRatio,
      customAspectRatios: nextCustomRatios,
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        selectPreset,
        savePreset,
        deletePreset,
        selectAspectRatio,
        saveAspectRatio,
        deleteAspectRatio,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsSystem() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsSystem must be used within a SettingsProvider");
  }
  return context;
}
