import { Check, CheckCircle2, Circle, Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "../../../theme/context/ThemeContext";
import { THEME_PRESETS, ACCENT_COLOR_OPTIONS } from "../../../theme/config/themes";

export default function AppearanceCategoryView() {
  const { themeConfig, setPreset, setAccentColor } = useTheme();

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Section 1: Theme Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.2em]">
            Theme Presets
          </span>
          <span className="text-xs text-[var(--theme-text-muted)] font-semibold">
            {THEME_PRESETS.find((p) => p.id === themeConfig.presetId)?.name || "Default"}
          </span>
        </div>

        <div className="grid gap-2.5 p-0.5">
          {THEME_PRESETS.map((preset) => {
            const isSelected = themeConfig.presetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setPreset(preset.id)}
                className={[
                  "group flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all border",
                  isSelected
                    ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/15 ring-1 ring-[var(--theme-accent)]/50 shadow-lg shadow-[var(--theme-accent)]/10"
                    : "border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_40%,transparent)] hover:border-[var(--theme-border-strong)] hover:bg-[color:color-mix(in_srgb,var(--theme-panel)_70%,transparent)]",
                ].join(" ")}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="shrink-0 text-[var(--theme-accent)]">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 fill-[var(--theme-accent)] text-white" />
                    ) : (
                      <Circle className="h-5 w-5 opacity-40 group-hover:opacity-75" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: preset.bg }}
                      />
                      <p className="text-sm font-bold truncate text-[var(--theme-text)]">
                        {preset.name}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--theme-text-muted)] font-medium truncate">
                      {preset.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 rounded-full bg-black/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--theme-text-muted)]">
                    {preset.isDark ? (
                      <Moon className="h-3 w-3 text-violet-400" />
                    ) : (
                      <Sun className="h-3 w-3 text-amber-500" />
                    )}
                    <span>{preset.isDark ? "Dark" : "Light"}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Custom Accent Color Swatches */}
      <div className="space-y-3 pt-1 border-t border-[var(--theme-border)]">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] theme-label-soft">
          <Sparkles className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
          <span>Accent Color Swatches</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {ACCENT_COLOR_OPTIONS.map((accent) => {
            const isSelected = themeConfig.accentId === accent.id;
            return (
              <button
                key={accent.id}
                type="button"
                onClick={() => setAccentColor(accent.id)}
                className={[
                  "flex items-center gap-2.5 rounded-2xl p-3 text-xs font-bold transition-all border text-left",
                  isSelected
                    ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/15 text-[var(--theme-text)] ring-1 ring-[var(--theme-accent)]/50"
                    : "border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_40%,transparent)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-black/5",
                ].join(" ")}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full shadow-sm"
                  style={{ backgroundColor: accent.hex }}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                </span>
                <span className="truncate">{accent.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
