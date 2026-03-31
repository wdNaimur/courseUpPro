import { Expand, Pause, Play, Shrink, Volume2, VolumeX } from "lucide-react";
import type { ChangeEvent } from "react";

type VideoPlaybackControlsProps = {
  controlButtonClassName: string;
  currentTime: number;
  duration: number;
  formatTime: (seconds: number) => string;
  getRangeBackground: (
    value: number,
    max: number,
    filledColor: string,
    baseColor: string,
  ) => string;
  handleControlsMouseEnter: () => void;
  handleControlsMouseLeave: () => void;
  isFullscreen: boolean;
  isMuted: boolean;
  isPlaying: boolean;
  onFullscreenToggle: () => void;
  onMuteToggle: () => void;
  onPlaybackSpeedChange: (speed: number) => void;
  onSeek: (event: ChangeEvent<HTMLInputElement>) => void;
  onTogglePlayPause: () => void;
  onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  playbackSpeed: number;
  showOverlays: boolean;
  volume: number;
};

const PLAYBACK_SPEED_OPTIONS = [
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2,
  2.25,
  2.5,
  2.75,
  3,
];

export default function VideoPlaybackControls({
  controlButtonClassName,
  currentTime,
  duration,
  formatTime,
  getRangeBackground,
  handleControlsMouseEnter,
  handleControlsMouseLeave,
  isFullscreen,
  isMuted,
  isPlaying,
  onFullscreenToggle,
  onMuteToggle,
  onPlaybackSpeedChange,
  onSeek,
  onTogglePlayPause,
  onVolumeChange,
  playbackSpeed,
  showOverlays,
  volume,
}: VideoPlaybackControlsProps) {
  return (
    <div
      onMouseEnter={handleControlsMouseEnter}
      onMouseLeave={handleControlsMouseLeave}
      className={[
        "absolute inset-x-0 bottom-0 z-[55] bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 transition-opacity duration-300 md:px-4",
        isFullscreen ? (showOverlays ? "opacity-100" : "opacity-0") : "opacity-100",
      ].join(" ")}
    >
      <div className="mb-2">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={onSeek}
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
          style={{
            background: getRangeBackground(
              Math.min(currentTime, duration || 0),
              duration || 0,
              "var(--theme-slider-progress)",
              "var(--theme-slider-track)",
            ),
          }}
          className="media-slider h-1.5 w-full cursor-pointer appearance-none rounded-full"
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlayPause}
            onMouseEnter={handleControlsMouseEnter}
            onMouseLeave={handleControlsMouseLeave}
            className={`flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9 ${controlButtonClassName}`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </button>

          <span className="min-w-[94px] text-xs font-semibold text-[var(--theme-text-soft)] md:min-w-[110px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            onClick={onMuteToggle}
            onMouseEnter={handleControlsMouseEnter}
            onMouseLeave={handleControlsMouseLeave}
            className={`flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9 ${controlButtonClassName}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={onVolumeChange}
            onMouseEnter={handleControlsMouseEnter}
            onMouseLeave={handleControlsMouseLeave}
            style={{
              background: getRangeBackground(
                isMuted ? 0 : volume,
                1,
                "var(--theme-slider-volume)",
                "var(--theme-slider-track)",
              ),
            }}
            className="media-slider h-1.5 w-20 cursor-pointer appearance-none rounded-full md:w-28"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 shadow-2xl backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
              Speed
            </span>
            <select
              value={playbackSpeed}
              onChange={(event) => onPlaybackSpeedChange(parseFloat(event.target.value))}
              onMouseEnter={handleControlsMouseEnter}
              onMouseLeave={handleControlsMouseLeave}
              className="min-w-[4.2rem] cursor-pointer bg-transparent text-right text-xs font-bold text-white/85 focus:outline-none md:text-sm"
              title="Playback speed"
            >
              {PLAYBACK_SPEED_OPTIONS.map((speed) => (
                <option
                  key={speed}
                  value={speed}
                  className="bg-[var(--theme-panel)] text-[var(--theme-text-soft)]"
                >
                  {speed.toFixed(speed % 1 === 0 ? 1 : speed * 100 % 10 === 0 ? 1 : 2)}x
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onFullscreenToggle}
            onMouseEnter={handleControlsMouseEnter}
            onMouseLeave={handleControlsMouseLeave}
            className={`flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9 ${controlButtonClassName}`}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
