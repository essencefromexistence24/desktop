"use client";

import { FolderPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mediaFilters,
  type MediaFilter,
} from "@/features/editor/components/media-filters";
import type { MediaCollection } from "@/lib/editor/types";

type MediaBinCollectionControlsProps = {
  mediaFilter: MediaFilter;
  collectionName: string;
  activeCollectionId: string;
  activeCollection: MediaCollection | undefined;
  mediaCollections: MediaCollection[];
  onMediaFilterChange: (filter: MediaFilter) => void;
  onCollectionNameChange: (name: string) => void;
  onAddCollection: () => void;
  onActiveCollectionChange: (collectionId: string) => void;
  onRemoveActiveCollection: () => void;
};

export function MediaBinCollectionControls({
  mediaFilter,
  collectionName,
  activeCollectionId,
  activeCollection,
  mediaCollections,
  onMediaFilterChange,
  onCollectionNameChange,
  onAddCollection,
  onActiveCollectionChange,
  onRemoveActiveCollection,
}: MediaBinCollectionControlsProps) {
  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-2 overflow-hidden overflow-x-hidden rounded-md border border-border bg-background p-2 shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="text-xs font-semibold">Collections</span>
        <span className="text-[11px] text-muted-foreground">
          {mediaCollections.length} sets
        </span>
      </div>
      <div className="flex min-w-0 flex-wrap gap-1 overflow-hidden">
        {mediaFilters.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={mediaFilter === filter.value ? "default" : "outline"}
            className="h-7 px-1 text-xs"
            onClick={() => onMediaFilterChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      <div className="grid min-w-0 grid-cols-[1fr_auto] gap-2 overflow-hidden">
        <Input
          className="h-8 min-w-0"
          value={collectionName}
          onChange={(event) => onCollectionNameChange(event.target.value)}
          placeholder="New collection"
          onKeyDown={(event) => {
            if (event.key === "Enter") onAddCollection();
          }}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={onAddCollection}
        >
          <FolderPlus className="size-4" />
        </Button>
      </div>
      <div className="grid min-w-0 grid-cols-[1fr_auto] gap-2 overflow-hidden">
        <Select
          value={activeCollectionId}
          onValueChange={onActiveCollectionChange}
        >
          <SelectTrigger className="h-8 min-w-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            {mediaCollections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name} ({collection.assetIds.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="outline"
          className="size-8"
          onClick={onRemoveActiveCollection}
          disabled={!activeCollection}
          aria-label="Remove active collection"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
