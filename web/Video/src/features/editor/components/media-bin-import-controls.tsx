"use client";

import type { ChangeEvent, RefObject } from "react";
import { FolderOpen, Link2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MediaBinImportControlsProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  reconnectInputRef: RefObject<HTMLInputElement | null>;
  batchReconnectInputRef: RefObject<HTMLInputElement | null>;
  isImporting: boolean;
  canImportDesktopFiles: boolean;
  favoriteAssetCount: number;
  missingAssetCount: number;
  totalAssetCount: number;
  onFiles: (event: ChangeEvent<HTMLInputElement>) => void;
  onReconnectMissingMedia: (event: ChangeEvent<HTMLInputElement>) => void;
  onReconnectMissingMediaBatch: (event: ChangeEvent<HTMLInputElement>) => void;
  onImportDesktopFiles: () => void;
  onOpenSelfHostedImport: () => void;
};

export function MediaBinImportControls({
  inputRef,
  reconnectInputRef,
  batchReconnectInputRef,
  isImporting,
  canImportDesktopFiles,
  favoriteAssetCount,
  missingAssetCount,
  totalAssetCount,
  onFiles,
  onReconnectMissingMedia,
  onReconnectMissingMediaBatch,
  onImportDesktopFiles,
  onOpenSelfHostedImport,
}: MediaBinImportControlsProps) {
  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-2 overflow-hidden rounded-md border border-border bg-background p-2 shadow-sm">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 overflow-hidden">
        <h2 className="shrink-0 text-sm font-semibold tracking-tight">Media</h2>
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1 overflow-hidden">
          {favoriteAssetCount > 0 ? (
            <Badge variant="outline" className="max-w-full min-w-0 truncate">
              {favoriteAssetCount}{" "}
              {favoriteAssetCount === 1 ? "favorite" : "favorites"}
            </Badge>
          ) : null}
          {missingAssetCount > 0 ? (
            <Badge variant="destructive" className="max-w-full truncate">
              {missingAssetCount} missing
            </Badge>
          ) : null}
          <Badge variant="secondary" className="max-w-full truncate">
            {totalAssetCount}
          </Badge>
        </div>
      </div>
      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept="video/*,image/*,audio/*,.gif"
        aria-label="Import media files"
        onChange={onFiles}
      />
      <input
        ref={reconnectInputRef}
        hidden
        type="file"
        accept="video/*,image/*,audio/*,.gif"
        aria-label="Reconnect selected media file"
        onChange={onReconnectMissingMedia}
      />
      <input
        ref={batchReconnectInputRef}
        hidden
        multiple
        type="file"
        accept="video/*,image/*,audio/*,.gif"
        aria-label="Batch reconnect missing media files"
        onChange={onReconnectMissingMediaBatch}
      />
      <div className="grid w-full max-w-full min-w-0 grid-cols-3 gap-1 overflow-hidden">
        <Button
          size="sm"
          className="min-w-0 w-full max-w-full overflow-hidden px-1.5 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={isImporting}
          aria-label="Import media files"
        >
          <Upload className="size-3.5 shrink-0" />
          <span className="truncate">Import</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="min-w-0 w-full max-w-full overflow-hidden px-1.5 text-xs"
          onClick={onImportDesktopFiles}
          disabled={isImporting || !canImportDesktopFiles}
          aria-label="Import desktop media files"
        >
          <FolderOpen className="size-3.5 shrink-0" />
          <span className="truncate">Desktop</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="min-w-0 w-full max-w-full overflow-hidden px-1.5 text-xs"
          onClick={onOpenSelfHostedImport}
          disabled={isImporting}
          aria-label="Import media from URL"
        >
          <Link2 className="size-3.5 shrink-0" />
          <span className="truncate">URL</span>
        </Button>
      </div>
      <p className="w-full max-w-full min-w-0 truncate text-[11px] text-muted-foreground">
        Import respects sidebar width — drag to resize
      </p>
    </div>
  );
}
