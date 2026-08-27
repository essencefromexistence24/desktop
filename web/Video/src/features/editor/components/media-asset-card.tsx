"use client";
// needsReconnect — audit wiring kept, UI shows Missing badge for width
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  FolderMinus,
  FolderPlus,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AudioPreviewButton } from "@/features/editor/components/audio-preview-button";
import { WaveformBars } from "@/features/editor/components/waveform-bars";
import type { MediaAsset, MediaCollection } from "@/lib/editor/types";
import type { MediaHealthAsset } from "@/lib/media/media-health";

type MediaAssetCardProps = {
  asset: MediaAsset;
  assetHealth: MediaHealthAsset | undefined;
  activeCollection: MediaCollection | undefined;
  isFavorite: boolean;
  isInActiveCollection: boolean;
  isImporting: boolean;
  onToggleFavorite: (assetId: string) => void;
  onToggleCollection: (assetId: string) => void;
  onAddLayer: (assetId: string) => void;
  onStartReconnect: (assetId: string) => void;
  onUploadToStorage: (assetId: string) => void;
  onRemove: (assetId: string) => void;
};

export function MediaAssetCard({
  asset,
  assetHealth,
  activeCollection,
  isFavorite,
  isInActiveCollection,
  isImporting,
  onToggleFavorite,
  onToggleCollection,
  onAddLayer,
  onStartReconnect,
  onUploadToStorage,
  onRemove,
}: MediaAssetCardProps) {
  const impactSummary = assetHealth?.impactedLayers.length
    ? assetHealth.impactedLayers
        .slice(0, 2)
        .map((layer) => layer.name)
        .join(", ")
    : null;
  const videoThumb = useVideoThumbnail(asset.objectUrl, asset.type, asset.id);

  return (
    <div
      className="group/card flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-md border border-border bg-background text-left shadow-sm transition hover:border-primary/50 hover:shadow-md"
      onDoubleClick={() => {
        if (asset.objectUrl) onAddLayer(asset.id);
      }}
    >
      {/* Full cover — image/video fills, text at bottom */}
      <div className="relative h-36 w-full shrink-0 overflow-hidden bg-muted">
        {asset.type === "image" && asset.objectUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.objectUrl}
            alt={asset.name}
            className="h-full w-full object-cover"
          />
        ) : asset.type === "video" && videoThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={videoThumb}
            alt={asset.name}
            className="h-full w-full object-cover"
          />
        ) : asset.type === "video" && asset.objectUrl ? (
          <video
            src={asset.objectUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : asset.type === "audio" && asset.objectUrl ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 via-primary/10 to-muted p-3">
            <div className="w-full max-w-full">
              <WaveformBars
                peaks={asset.waveformPeaks}
                className="w-full text-primary"
              />
            </div>
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center bg-muted">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {asset.type}
            </span>
          </div>
        )}
        {/* top-right actions */}
        <div className="absolute right-1 top-1 flex items-center gap-0.5 rounded-full bg-black/45 p-0.5 backdrop-blur">
          {asset.objectUrl ? (
            <span className="flex items-center">
              <AudioPreviewButton asset={asset} />
            </span>
          ) : null}
          <Button
            size="icon"
            variant="ghost"
            className={`size-6 shrink-0 rounded-full text-white hover:bg-white/20 hover:text-white ${isFavorite ? "text-yellow-300" : "text-white/90"}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(asset.id);
            }}
            aria-label={`${isFavorite ? "Unfavorite" : "Favorite"} ${asset.name}`}
          >
            <Star
              className={isFavorite ? "size-3.5 fill-current" : "size-3.5"}
            />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6 shrink-0 rounded-full bg-white text-black hover:bg-white/90"
            onClick={(event) => {
              event.stopPropagation();
              if (asset.objectUrl) onAddLayer(asset.id);
              else onStartReconnect(asset.id);
            }}
            disabled={isImporting && !asset.objectUrl}
            aria-label={
              asset.objectUrl ? `Add ${asset.name}` : `Reconnect ${asset.name}`
            }
          >
            {asset.objectUrl ? (
              <Plus className="size-3.5" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6 shrink-0 rounded-full text-white hover:bg-white/20 hover:text-white"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(asset.id);
            }}
            disabled={isImporting}
            aria-label={`Remove ${asset.name}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
        {/* collection toggle as small pill */}
        {activeCollection ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleCollection(asset.id);
            }}
            className={`absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium backdrop-blur ${isInActiveCollection ? "bg-primary text-primary-foreground" : "bg-black/45 text-white"}`}
          >
            {isInActiveCollection ? "−" : "+"}{" "}
            {activeCollection.name.slice(0, 10)}
          </button>
        ) : null}
        {/* bottom gradient + text */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6">
          <div className="truncate text-xs font-medium leading-tight text-white drop-shadow">
            {asset.name}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/80">
            <span className="rounded bg-white/20 px-1 py-0.5 text-[10px] capitalize backdrop-blur">
              {asset.type}
            </span>
            <span className="truncate">{formatFileSize(asset.size)}</span>
            {asset.duration ? (
              <span className="shrink-0">{formatDuration(asset.duration)}</span>
            ) : null}
          </div>
        </div>
      </div>
      {/* below cover — only for missing, no gap otherwise */}
      {!asset.objectUrl ? (
        <div className="p-2">
          <div className="flex min-w-0 items-start gap-2 overflow-hidden rounded-sm border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 break-words">
              {assetHealth?.isRecoverable
                ? "Media can be recovered from local storage."
                : "Media file needs reconnecting."}
              {impactSummary ? ` Affects ${impactSummary}.` : ""}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function useVideoThumbnail(
  objectUrl: string | undefined,
  type: string,
  id: string,
) {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    if (!objectUrl || type !== "video") {
      setThumb(null);
      return;
    }
    let cancelled = false;
    const video = document.createElement("video");
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    const onLoaded = () => {
      const duration =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : 2;
      const randomTime = duration * 0.15 + Math.random() * duration * 0.7;
      try {
        video.currentTime = Math.min(randomTime, duration - 0.05);
      } catch {
        setThumb(null);
      }
    };
    const onSeeked = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const w = video.videoWidth || 320;
      const h = video.videoHeight || 180;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      try {
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        if (!cancelled) setThumb(dataUrl);
      } catch {
        // crossOrigin taint — fallback to video element
      }
      cleanup();
    };
    const onError = () => {
      if (!cancelled) setThumb(null);
      cleanup();
    };
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [objectUrl, type, id]);
  return thumb;
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
