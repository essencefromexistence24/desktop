"use client";

import {
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalSpaceBetween,
  AlignStartHorizontal,
  ChevronDown,
  Flag,
  Maximize2,
  MoveRight,
  Pause,
  Play,
  Rows3,
  Scissors,
  Search,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  StretchHorizontal,
  Target,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatTime } from "@/lib/editor/factory";
import type {
  TimelineAlignmentMode,
  TimelineDurationDistributionMode,
  TimelineMarker,
} from "@/lib/editor/types";

export type TimelineFilter =
  "all" | "grouped" | "missing" | "media" | "text" | "review" | "notes";

const timelineSnapIntervals = [0.05, 0.1, 0.25, 0.5, 1, 2];
const timelineFilters: Array<{ value: TimelineFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "grouped", label: "Groups" },
  { value: "missing", label: "Missing" },
  { value: "media", label: "Media" },
  { value: "text", label: "Text" },
  { value: "review", label: "Review" },
  { value: "notes", label: "Notes" },
];

type TimelineCommandBarProps = {
  isPlaying: boolean;
  canSplitSelection: boolean;
  canAlignSelection: boolean;
  canDistributeSelection: boolean;
  sortedMarkersLength: number;
  selectedMarker: TimelineMarker | null;
  timelineQuery: string;
  timelineFilter: TimelineFilter;
  timelineZoom: number;
  minTimelineZoom: number;
  maxTimelineZoom: number;
  trackHeight: number;
  minTrackHeight: number;
  maxTrackHeight: number;
  currentTime: number;
  projectDuration: number;
  snapInterval: number;
  rippleMode: boolean;
  onTogglePlayback: () => void;
  onSplitSelectedLayers: () => void;
  onAddMarker: () => void;
  onGoToMarker: (direction: -1 | 1) => void;
  onAlignSelectedLayers: (mode: TimelineAlignmentMode) => number;
  onDistributeSelectedLayerDurations: (
    mode: TimelineDurationDistributionMode,
  ) => number;
  onUpdateMarker: (
    markerId: string,
    patch: Partial<Pick<TimelineMarker, "time" | "label" | "color">>,
  ) => void;
  onRemoveMarker: (markerId: string) => void;
  onTimelineQueryChange: (query: string) => void;
  onTimelineFilterChange: (filter: TimelineFilter) => void;
  onTimelineZoomChange: (nextZoom: number) => void;
  onTrackHeightChange: (nextHeight: number) => void;
  onCurrentTimeChange: (time: number) => void;
  onSnapIntervalChange: (seconds: number) => void;
  onRippleModeChange: (enabled: boolean) => void;
};

export function TimelineCommandBar({
  isPlaying,
  canSplitSelection,
  canAlignSelection,
  canDistributeSelection,
  sortedMarkersLength,
  selectedMarker,
  timelineQuery,
  timelineFilter,
  timelineZoom,
  minTimelineZoom,
  maxTimelineZoom,
  trackHeight,
  minTrackHeight,
  maxTrackHeight,
  currentTime,
  projectDuration,
  snapInterval,
  rippleMode,
  onTogglePlayback,
  onSplitSelectedLayers,
  onAddMarker,
  onGoToMarker,
  onAlignSelectedLayers,
  onDistributeSelectedLayerDurations,
  onUpdateMarker,
  onRemoveMarker,
  onTimelineQueryChange,
  onTimelineFilterChange,
  onTimelineZoomChange,
  onTrackHeightChange,
  onCurrentTimeChange,
  onSnapIntervalChange,
  onRippleModeChange,
}: TimelineCommandBarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-1.5 overflow-hidden border-b border-border bg-card px-2">
      {/* Primary: playback */}
      <Button
        size="icon"
        variant="outline"
        className="size-8 shrink-0"
        onClick={onTogglePlayback}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />

      {/* Primary: scrubber — only truly essential transport */}
      <span className="hidden shrink-0 font-mono text-xs tabular-nums sm:inline">
        {formatTime(currentTime)}
      </span>
      <Slider
        className="min-w-0 flex-1"
        value={[currentTime]}
        min={0}
        max={Math.max(projectDuration, 1)}
        step={0.05}
        onValueChange={([value]) => onCurrentTimeChange(value ?? 0)}
        aria-label="Scrub timeline"
      />
      <Badge
        variant="secondary"
        className="hidden shrink-0 font-mono text-xs sm:inline-flex"
      >
        {projectDuration.toFixed(1)}s
      </Badge>
      {/* mobile time: shown only when scrubber collapses a bit */}
      <span className="shrink-0 font-mono text-xs tabular-nums sm:hidden">
        {formatTime(currentTime)}
      </span>

      {/* Right: categorized overflow menus — no horizontal scroll, ever */}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {/* Edit: Split / Align / Distribute / Ripple */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 px-2 text-xs"
            >
              <Scissors className="size-3.5" />
              <span className="hidden sm:inline">Edit</span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Clip editing</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={onSplitSelectedLayers}
              disabled={!canSplitSelection}
            >
              <Scissors className="size-4" />
              Split at playhead
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Align selection</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => onAlignSelectedLayers("start")}
              disabled={!canAlignSelection}
            >
              <AlignStartHorizontal className="size-4" />
              Align to start
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onAlignSelectedLayers("center")}
              disabled={!canAlignSelection}
            >
              <AlignCenterHorizontal className="size-4" />
              Align to center
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onAlignSelectedLayers("end")}
              disabled={!canAlignSelection}
            >
              <AlignEndHorizontal className="size-4" />
              Align to end
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onAlignSelectedLayers("playhead")}
              disabled={!canAlignSelection}
            >
              <Target className="size-4" />
              Align to playhead
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Distribute</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => onDistributeSelectedLayerDurations("equal")}
              disabled={!canDistributeSelection}
            >
              <StretchHorizontal className="size-4" />
              Equal durations
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                onDistributeSelectedLayerDurations("fill-selection")
              }
              disabled={!canDistributeSelection}
            >
              <AlignHorizontalSpaceBetween className="size-4" />
              Fill selection span
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div
              className="flex items-center justify-between gap-2 px-2 py-1.5"
              onClick={(e) => e.preventDefault()}
              onPointerDown={(e) => e.preventDefault()}
            >
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <MoveRight className="size-3.5 text-muted-foreground" />
                Ripple edit
              </span>
              <Switch
                checked={rippleMode}
                onCheckedChange={onRippleModeChange}
                aria-label="Ripple move mode"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Markers */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 px-2 text-xs"
            >
              <Flag className="size-3.5" />
              <span className="hidden sm:inline">Markers</span>
              {sortedMarkersLength > 0 ? (
                <Badge
                  variant="secondary"
                  className="hidden h-4 px-1 text-[10px] sm:inline-flex"
                >
                  {sortedMarkersLength}
                </Badge>
              ) : null}
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Markers</DropdownMenuLabel>
            <DropdownMenuItem onSelect={onAddMarker}>
              <Flag className="size-4" />
              Add marker at playhead
            </DropdownMenuItem>
            <div className="flex items-center gap-1 px-1 py-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 gap-1 text-xs"
                disabled={sortedMarkersLength === 0}
                onClick={() => onGoToMarker(-1)}
              >
                <SkipBack className="size-3.5" />
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 gap-1 text-xs"
                disabled={sortedMarkersLength === 0}
                onClick={() => onGoToMarker(1)}
              >
                Next
                <SkipForward className="size-3.5" />
              </Button>
            </div>
            {selectedMarker ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Selected marker</DropdownMenuLabel>
                <div
                  className="space-y-2 p-2"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Input
                    className="h-7 text-xs"
                    value={selectedMarker.label}
                    onChange={(event) =>
                      onUpdateMarker(selectedMarker.id, {
                        label: event.target.value,
                      })
                    }
                    placeholder="Marker label"
                    aria-label="Marker label"
                  />
                  <div className="flex items-center gap-1.5">
                    <Input
                      className="h-7 flex-1 text-xs"
                      type="number"
                      min={0}
                      max={projectDuration}
                      step={0.05}
                      value={selectedMarker.time}
                      onChange={(event) =>
                        onUpdateMarker(selectedMarker.id, {
                          time: event.currentTarget.valueAsNumber,
                        })
                      }
                      aria-label="Marker time"
                    />
                    <Input
                      className="h-7 w-10 p-1"
                      type="color"
                      value={selectedMarker.color}
                      onChange={(event) =>
                        onUpdateMarker(selectedMarker.id, {
                          color: event.target.value,
                        })
                      }
                      aria-label="Marker color"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0"
                      onClick={() => onRemoveMarker(selectedMarker.id)}
                      aria-label="Remove marker"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View: zoom, track height, search, filters, snap */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 px-2 text-xs"
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">View</span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Timeline view</DropdownMenuLabel>
            <div
              className="flex items-center gap-1 px-2 py-1"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                size="icon"
                variant="outline"
                className="size-7"
                onClick={() =>
                  onTimelineZoomChange(
                    Math.max(minTimelineZoom, timelineZoom - 0.25),
                  )
                }
                disabled={timelineZoom <= minTimelineZoom}
                aria-label="Zoom out"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => onTimelineZoomChange(1)}
                aria-label="Fit timeline"
              >
                <Maximize2 className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-7"
                onClick={() =>
                  onTimelineZoomChange(
                    Math.min(maxTimelineZoom, timelineZoom + 0.25),
                  )
                }
                disabled={timelineZoom >= maxTimelineZoom}
                aria-label="Zoom in"
              >
                <ZoomIn className="size-3.5" />
              </Button>
              <Badge variant="outline" className="ml-auto text-xs">
                {Math.round(timelineZoom * 100)}%
              </Badge>
            </div>
            <div
              className="flex items-center gap-2 px-2 py-1"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Rows3 className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs">Row height</span>
              <Slider
                className="flex-1"
                value={[trackHeight]}
                min={minTrackHeight}
                max={maxTrackHeight}
                step={4}
                onValueChange={([value]) => onTrackHeightChange(value ?? 40)}
                aria-label="Track height"
              />
            </div>
            <DropdownMenuSeparator />
            <div
              className="space-y-2 p-2"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5">
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
                <Input
                  className="h-7 flex-1 text-xs"
                  value={timelineQuery}
                  onChange={(event) =>
                    onTimelineQueryChange(event.target.value)
                  }
                  placeholder="Find layers"
                  aria-label="Find layers"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {timelineFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    size="sm"
                    variant={
                      timelineFilter === filter.value ? "default" : "outline"
                    }
                    className="h-6 px-2 text-xs"
                    onClick={() => onTimelineFilterChange(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
            <DropdownMenuSeparator />
            <div
              className="flex items-center gap-2 px-2 py-1"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <span className="text-xs font-medium">Snap</span>
              <Select
                value={String(snapInterval)}
                onValueChange={(value) => onSnapIntervalChange(Number(value))}
              >
                <SelectTrigger className="ml-auto h-7 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timelineSnapIntervals.map((interval) => (
                    <SelectItem
                      key={interval}
                      value={String(interval)}
                      className="text-xs"
                    >
                      Snap {interval}s
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
