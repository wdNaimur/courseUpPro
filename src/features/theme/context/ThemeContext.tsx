import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AccentColorId, ThemeConfig, ThemePresetId } from "../types/theme";
import {
  THEME_PRESETS,
  ACCENT_COLOR_OPTIONS,
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEY,
} from "../config/themes";

type ThemeContextType = {
  themeConfig: ThemeConfig;
  setPreset: (presetId: ThemePresetId) => void;
  setAccentColor: (accentId: AccentColorId) => void;
  setBlurIntensity: (blur: ThemeConfig["blurIntensity"]) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    if (typeof localStorage === "undefined") return DEFAULT_THEME_CONFIG;
    try {
      const raw = localStorage.getItem(THEME_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          presetId: parsed?.presetId || DEFAULT_THEME_CONFIG.presetId,
          accentId: parsed?.accentId || DEFAULT_THEME_CONFIG.accentId,
          blurIntensity: parsed?.blurIntensity || DEFAULT_THEME_CONFIG.blurIntensity,
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_THEME_CONFIG;
  });

  const applyThemeToDOM = useCallback((config: ThemeConfig) => {
    if (typeof document === "undefined") return;

    const preset = THEME_PRESETS.find((p) => p.id === config.presetId) || THEME_PRESETS[0];
    const accent = ACCENT_COLOR_OPTIONS.find((a) => a.id === config.accentId) || ACCENT_COLOR_OPTIONS[0];

    const root = document.documentElement;

    root.dataset.theme = preset.id;
    root.dataset.isDark = String(preset.isDark);

    if (preset.id === "light") {
      root.style.setProperty("--theme-bg", "#f8fafc");
      root.style.setProperty("--theme-bg-alt", "#f1f5f9");
      root.style.setProperty("--theme-panel", "#ffffff");
      root.style.setProperty("--theme-panel-strong", "#ffffff");
      root.style.setProperty("--theme-panel-soft", "#f8fafc");
      root.style.setProperty("--theme-overlay", "rgba(248, 250, 252, 0.88)");
      root.style.setProperty("--theme-border", "rgba(0, 0, 0, 0.08)");
      root.style.setProperty("--theme-border-strong", "rgba(0, 0, 0, 0.16)");
      root.style.setProperty("--theme-text", "#0f172a");
      root.style.setProperty("--theme-text-soft", "#1e293b");
      root.style.setProperty("--theme-text-muted", "#475569");
      root.style.setProperty("--theme-text-faint", "#64748b");
    } else {
      root.style.setProperty("--theme-bg", preset.bg);
      root.style.setProperty("--theme-bg-alt", preset.bg);
      root.style.setProperty("--theme-panel", preset.panel);
      root.style.setProperty("--theme-panel-strong", preset.panel);
      root.style.setProperty("--theme-panel-soft", preset.panel);
      root.style.setProperty("--theme-overlay", "rgba(0, 0, 0, 0.84)");
      root.style.setProperty("--theme-border", preset.border);
      root.style.setProperty("--theme-border-strong", preset.border);
      root.style.setProperty("--theme-text", "#f8fafc");
      root.style.setProperty("--theme-text-soft", "#cbd5e1");
      root.style.setProperty("--theme-text-muted", "#94a3b8");
      root.style.setProperty("--theme-text-faint", "#64748b");
    }

    // Dynamic accent color tokens
    root.style.setProperty("--theme-accent", accent.hex);
    root.style.setProperty("--theme-accent-strong", accent.hex);
    root.style.setProperty("--theme-accent-warm", accent.hex);
    root.style.setProperty("--theme-accent-soft", preset.id === "light" ? "#1e1b4b" : accent.softHex);

    // Dynamic glow and slider color tokens
    root.style.setProperty("--theme-accent-glow-soft", `color-mix(in srgb, ${accent.hex} 16%, transparent)`);
    root.style.setProperty("--theme-accent-glow-medium", `color-mix(in srgb, ${accent.hex} 24%, transparent)`);
    root.style.setProperty("--theme-accent-glow-strong", `color-mix(in srgb, ${accent.hex} 45%, transparent)`);
    root.style.setProperty("--theme-player-primary-shadow", `color-mix(in srgb, ${accent.hex} 30%, transparent)`);
    root.style.setProperty("--theme-slider-progress", accent.hex);
    root.style.setProperty("--theme-slider-volume", preset.id === "light" ? "#1e1b4b" : accent.softHex);
  }, []);

  useEffect(() => {
    applyThemeToDOM(themeConfig);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeConfig));
      } catch (e) {
        console.error("Failed to save theme config", e);
      }
    }
  }, [themeConfig, applyThemeToDOM]);

  const setPreset = (presetId: ThemePresetId) => {
    setThemeConfig((prev) => ({ ...prev, presetId }));
  };

  const setAccentColor = (accentId: AccentColorId) => {
    setThemeConfig((prev) => ({ ...prev, accentId }));
  };

  const setBlurIntensity = (blurIntensity: ThemeConfig["blurIntensity"]) => {
    setThemeConfig((prev) => ({ ...prev, blurIntensity }));
  };

  return (
    <ThemeContext.Provider
      value={{
        themeConfig,
        setPreset,
        setAccentColor,
        setBlurIntensity,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
