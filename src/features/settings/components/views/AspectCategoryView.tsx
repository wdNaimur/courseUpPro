import React from "react";
import { Plus, CheckCircle2, Circle, Pencil, Trash2, Info } from "lucide-react";
import type { CustomAspectRatio, PlayerSettings } from "../../types/settings";
import { getAllAspectRatios } from "../../utils/player-settings";

type AspectCategoryViewProps = {
  settings: PlayerSettings;
  onSelectAspectRatio: (ratioId: string) => void;
  onOpenCreate: () => void;
  onEditAspect: (ratio: CustomAspectRatio, e: React.MouseEvent) => void;
  onDeleteAspect: (ratioId: string, e: React.MouseEvent) => void;
};

export default function AspectCategoryView({
  settings,
  onSelectAspectRatio,
  onOpenCreate,
  onEditAspect,
  onDeleteAspect,
}: AspectCategoryViewProps) {
  const allAspectRatios = getAllAspectRatios(settings.customAspectRatios || []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between min-h-[32px]">
        <span className="theme-label-soft text-[11px] font-bold uppercase tracking-[0.2em]">
          Aspect Ratio Options
        </span>
        <button
          type="button"
          onClick={onOpenCreate}
          className="glass-button flex h-8 w-8 items-center justify-center rounded-xl text-[var(--theme-text)] hover:bg-[var(--theme-accent)]/15 hover:text-[var(--theme-accent-soft)] transition-all"
          title="Create custom aspect ratio"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2.5 p-0.5">
        {allAspectRatios.map((option) => {
          const isSelected =
            settings.aspectRatio === option.id ||
            settings.aspectRatio === option.ratioValue;
          return (
            <div
              key={option.id}
              onClick={() => onSelectAspectRatio(option.id)}
              className={[
                "group flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all border",
                isSelected
                  ? "border-[var(--theme-accent-soft)] bg-[var(--theme-accent)]/15 ring-1 ring-[var(--theme-accent-soft)]/50 shadow-lg shadow-[var(--theme-accent)]/10"
                  : "border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_40%,transparent)] hover:border-[var(--theme-border-strong,#555)] hover:bg-[color:color-mix(in_srgb,var(--theme-panel)_70%,transparent)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <div className="shrink-0 text-[var(--theme-accent-soft)]">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 fill-[var(--theme-accent)] text-black" />
                  ) : (
                    <Circle className="h-5 w-5 opacity-40 group-hover:opacity-75" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={[
                        "text-sm font-bold truncate",
                        isSelected ? "text-white" : "text-[var(--theme-text)]",
                      ].join(" ")}
                    >
                      {option.label}
                    </p>
                    {option.isSystem && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--theme-text-muted)] shrink-0">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--theme-text-muted)] font-medium truncate">
                    {option.desc || `${option.ratioValue} ratio`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-bold shrink-0",
                    isSelected
                      ? "bg-[var(--theme-accent)] text-black"
                      : "bg-white/5 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]",
                  ].join(" ")}
                >
                  {option.ratioValue === "cover"
                    ? "Fill"
                    : option.ratioValue === "contain"
                    ? "Fit"
                    : option.ratioValue}
                </span>

                {!option.isSystem && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => onEditAspect(option, e)}
                      className="glass-button flex h-7 w-7 items-center justify-center rounded-xl text-[var(--theme-accent-soft)] opacity-70 hover:opacity-100 hover:bg-[var(--theme-accent)]/15 shrink-0"
                      title="Edit aspect ratio"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => onDeleteAspect(option.id, e)}
                      className="glass-button flex h-7 w-7 items-center justify-center rounded-xl text-red-400 opacity-60 hover:opacity-100 hover:bg-red-500/20 shrink-0"
                      title="Delete custom aspect ratio"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[var(--theme-border)] bg-[color:color-mix(in_srgb,var(--theme-panel)_30%,transparent)] p-4 text-xs flex items-start gap-3 text-[var(--theme-text-muted)]">
        <Info className="h-4 w-4 text-[var(--theme-accent-soft)] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Select <strong className="text-white">Fill / Cover</strong> to stretch video edge-to-edge or <strong className="text-white">Fit / Contain</strong> to preserve exact video dimensions.
        </p>
      </div>
    </div>
  );
}
