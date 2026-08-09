"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Archive, Edit2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DropPosition, Tab } from "./types";

interface DraggableTabProps {
  tab: Tab;
  activeTab: string;
  overId: string | null;
  dropPosition: DropPosition;
  onSetActiveTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onAddNewTab: () => void;
  onCreateFolder: () => void;
  onRenameTab?: (tabId: string, newTitle: string) => void;
  onArchiveTab?: (tabId: string) => void;
}

export function DraggableTab({
  tab,
  activeTab,
  overId,
  dropPosition,
  onSetActiveTab,
  onCloseTab,
  onAddNewTab,
  onCreateFolder,
  onRenameTab,
  onArchiveTab,
}: DraggableTabProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(tab.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
    data: { type: "tab", tab },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={cn(
            "group/item relative flex h-9 w-full overflow-hidden cursor-grab items-center gap-2 rounded-md px-2 text-sm select-none active:cursor-grabbing transition-colors",
            activeTab === tab.id
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            isDragging && "opacity-50",
          )}
          onClick={() => onSetActiveTab(tab.id)}
        >
          <div className="bg-destructive h-4 w-4 shrink-0 rounded-sm" />
          <span className="min-w-0 flex-1 truncate pr-6 text-xs">{tab.title}</span>
          <button
            className="absolute right-2 flex h-3 w-3 shrink-0 cursor-pointer items-center justify-center opacity-0 transition-opacity group-hover/item:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(tab.id);
            }}
          >
            <X className="h-3 w-3" />
          </button>
          {overId === tab.id && dropPosition === "before" && (
            <div className="absolute -top-1 left-0 right-0 z-[1000000000000000000000000] flex items-center">
              <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
              <div className="bg-primary h-0.5 flex-1" />
            </div>
          )}
          {overId === tab.id && dropPosition === "after" && (
            <div className="absolute -bottom-1 left-0 right-0 z-[1000000000000000000000000] flex items-center">
              <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
              <div className="bg-primary h-0.5 flex-1" />
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="border-border bg-card w-56">
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogTrigger asChild>
            <ContextMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setNewTitle(tab.title);
                setRenameDialogOpen(true);
              }}
              className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Rename Chat
            </ContextMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Chat</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (newTitle.trim()) {
                      onRenameTab?.(tab.id, newTitle.trim());
                      setRenameDialogOpen(false);
                    }
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newTitle.trim()) {
                    onRenameTab?.(tab.id, newTitle.trim());
                    setRenameDialogOpen(false);
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ContextMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onArchiveTab?.(tab.id) || onCloseTab(tab.id);
          }}
          className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive Chat
        </ContextMenuItem>

        <div className="border-border my-1 border-t" />
        <ContextMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onAddNewTab();
          }}
          className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          New Chat Below
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onCreateFolder();
          }}
          className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          New Folder
        </ContextMenuItem>
        <div className="border-border my-1 border-t" />
        <ContextMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          Mute Chat
        </ContextMenuItem>
        <div className="border-border my-1 border-t" />
        <ContextMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onCloseTab(tab.id);
          }}
          className="text-destructive focus:bg-accent focus:text-destructive"
        >
          <X className="mr-2 h-4 w-4" />
          Delete Chat
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
