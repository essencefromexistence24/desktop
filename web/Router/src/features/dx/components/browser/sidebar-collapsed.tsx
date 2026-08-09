"use client";

import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Cog,
  Folder,
  MessageSquare,
  Plus,
  Search,
  Snowflake,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ArchivedChatsList } from "./archived-chats";
import type { Tab, TabFolder, Workspace } from "./types";
import { WorkspaceIcon } from "./workspace-icon";

interface SidebarCollapsedProps {
  workspaces: Workspace[];
  activeWorkspace: string;
  visibleWorkspaces: Workspace[];
  canScrollLeft: boolean;
  canScrollRight: boolean;
  archivesOpen: boolean;
  plusMenuOpen: boolean;
  onSetActiveWorkspace: (id: string) => void;
  onSetarchivesOpen: (open: boolean) => void;
  onSetPlusMenuOpen: (open: boolean) => void;
  onStartScrolling: (direction: "left" | "right") => void;
  onStopScrolling: () => void;
  onCreateWorkspace: () => void;
  onOpenWorkspaceDialog: () => void;
  onCreateFolder: () => void;
  onAddNewTab: () => void;
  folders?: TabFolder[];
  activeWorkspaceTabs?: Tab[];
  activeTab?: string;
  onSetActiveTab?: (id: string) => void;
  onSetCommandOpen?: (open: boolean) => void;
  onSetSettingsOpen?: (open: boolean) => void;
  onRenameWorkspace?: () => void;
  onEditWorkspaceIcon?: () => void;
  onUnloadSpace?: () => void;
  onDeleteSpace?: () => void;
}

export function SidebarCollapsed({
  workspaces,
  activeWorkspace,
  visibleWorkspaces,
  canScrollLeft,
  canScrollRight,
  archivesOpen,
  plusMenuOpen,
  onSetActiveWorkspace,
  onSetarchivesOpen,
  onSetPlusMenuOpen,
  onStartScrolling,
  onStopScrolling,
  onCreateWorkspace,
  onOpenWorkspaceDialog,
  onCreateFolder,
  onAddNewTab,
  folders = [],
  activeWorkspaceTabs = [],
  activeTab = "",
  onSetActiveTab,
  onSetCommandOpen,
  onSetSettingsOpen,
  onRenameWorkspace,
  onEditWorkspaceIcon,
  onUnloadSpace,
  onDeleteSpace,
}: SidebarCollapsedProps) {
  const _activeWorkspaceObj = workspaces.find((w) => w.id === activeWorkspace) || workspaces[0];

  return (
    <motion.div className="flex flex-1 flex-col items-center py-2 h-full">
      <div className="flex flex-col items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
          onClick={() => onSetCommandOpen?.(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
          onClick={() => onAddNewTab?.()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 w-full px-2">
        <div className="flex flex-col items-center gap-2">
          {folders.map((folder) => (
            <HoverCard key={folder.id}>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Folder className="h-4 w-4 shrink-0" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="right" className="w-48 border-border bg-card p-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium mb-1 border-b border-border pb-1">
                    {folder.name}
                  </span>
                  {folder.tabs && folder.tabs.length > 0 ? (
                    folder.tabs.map((tab) => (
                      <div
                        key={tab.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground truncate"
                      >
                        <MessageSquare className="h-3 w-3 shrink-0" />
                        <span className="truncate">{tab.title}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Empty</span>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
          {activeWorkspaceTabs.map((tab) => (
            <HoverCard key={tab.id}>
              <HoverCardTrigger asChild>
                <Button
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    activeTab === tab.id ? "bg-accent" : "text-muted-foreground",
                  )}
                  onClick={() => onSetActiveTab?.(tab.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="right" className="w-auto border-border bg-card p-2">
                <span className="text-sm font-medium">{tab.title}</span>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </ScrollArea>

      <div className="relative mt-auto flex flex-col items-center pt-3 pb-3 border-border border-t w-full">
        {canScrollLeft && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onMouseDown={() => onStartScrolling("left")}
            onMouseUp={onStopScrolling}
            onMouseLeave={onStopScrolling}
            onTouchStart={() => onStartScrolling("left")}
            onTouchEnd={onStopScrolling}
            className="bg-background text-primary z-50 mb-1 flex h-8 w-8 items-center justify-center rounded-full border"
            aria-label="Scroll workspaces up"
          >
            <ChevronLeft className="h-4 w-4 rotate-90" />
          </motion.button>
        )}

        <div className="flex max-h-[240px] flex-col items-center overflow-hidden">
          {visibleWorkspaces.map((workspace) => (
            <ContextMenu key={workspace.id}>
              <ContextMenuTrigger asChild>
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    layout: {
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 },
                  }}
                  onClick={() => onSetActiveWorkspace(workspace.id)}
                  className={cn(
                    "group flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                    activeWorkspace === workspace.id && "scale-110",
                  )}
                  title={workspace.name}
                  aria-label={`Switch to ${workspace.name} workspace`}
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.95 }}
                  drag
                  dragConstraints={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                  }}
                  dragElastic={0.2}
                >
                  <WorkspaceIcon
                    workspace={workspace}
                    isActive={activeWorkspace === workspace.id}
                  />
                </motion.button>
              </ContextMenuTrigger>
              <ContextMenuContent className="border-border bg-card w-56">
                <ContextMenuItem
                  onClick={onRenameWorkspace}
                  className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Change Name
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={onEditWorkspaceIcon}
                  className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Change Icon
                </ContextMenuItem>
                <ContextMenuItem className="text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Edit Theme
                </ContextMenuItem>
                <ContextMenuItem className="text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Set Profile
                  <ChevronRight className="ml-auto h-4 w-4" />
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={onUnloadSpace}
                  className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Unload Space
                </ContextMenuItem>
                <div className="border-border my-1 border-t" />
                <ContextMenuItem className="text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="mr-2 h-4 w-4 flex items-center justify-center shrink-0">✓</div>
                  <span className="max-w-[75%] truncate">{workspace.name}</span>
                </ContextMenuItem>
                {workspaces
                  .filter((w) => w.id !== workspace.id)
                  .map((w) => (
                    <ContextMenuItem
                      key={w.id}
                      onClick={() => onSetActiveWorkspace(w.id)}
                      className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="mr-2 h-4 w-4 flex items-center justify-center shrink-0">
                        <WorkspaceIcon workspace={w} isActive={false} />
                      </div>
                      <span className="max-w-[75%] truncate">{w.name}</span>
                    </ContextMenuItem>
                  ))}
                <div className="border-border my-1 border-t" />
                <ContextMenuItem className="text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  Reorder Spaces
                </ContextMenuItem>
                <div className="border-border my-1 border-t" />
                <ContextMenuItem
                  onClick={onOpenWorkspaceDialog}
                  className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Create Space
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={onDeleteSpace}
                  className="text-destructive focus:bg-accent focus:text-destructive"
                >
                  Delete Space
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>

        {canScrollRight && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onMouseDown={() => onStartScrolling("right")}
            onMouseUp={onStopScrolling}
            onMouseLeave={onStopScrolling}
            onTouchStart={() => onStartScrolling("right")}
            onTouchEnd={onStopScrolling}
            className="bg-background text-primary z-50 mt-1 flex h-8 w-8 items-center justify-center rounded-full border"
            aria-label="Scroll workspaces down"
          >
            <ChevronRight className="h-4 w-4 rotate-90" />
          </motion.button>
        )}
      </div>

      <div className="border-border flex flex-col items-center gap-2 border-t pt-3">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.1}
            >
              <Popover open={archivesOpen} onOpenChange={onSetarchivesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetarchivesOpen(true);
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="right" className="border-border bg-card w-80 p-4">
                  <ArchivedChatsList onClose={() => onSetarchivesOpen(false)} />
                </PopoverContent>
              </Popover>
            </motion.div>
          </ContextMenuTrigger>
          <ContextMenuContent className="border-border bg-card">
            <ContextMenuItem
              className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              onClick={() => onSetarchivesOpen(true)}
            >
              Open Archived Chats
            </ContextMenuItem>
            <ContextMenuItem
              className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              onClick={() => {
                try {
                  const raw = localStorage.getItem("dx-conversations");
                  if (raw) {
                    const convs = (JSON.parse(raw) as any[]).map((c: any) => ({
                      ...c,
                      archived: false,
                    }));
                    localStorage.setItem("dx-conversations", JSON.stringify(convs));
                  }
                } catch {}
                onSetarchivesOpen(false);
              }}
            >
              Clear Archive
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
          onClick={() => onSetSettingsOpen?.(true)}
        >
          <Cog className="h-4 w-4" />
        </Button>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.5,
          }}
        >
          <div className="flex bg-background/50 backdrop-blur-md rounded-md overflow-hidden ring-1 ring-border/50">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8 rounded-none border-r border-border/50"
              onClick={(e) => {
                e.stopPropagation();
                onCreateWorkspace();
              }}
              title="Create Space"
            >
              <Snowflake className="h-4 w-4" />
            </Button>
            {/* <DropdownMenu open={plusMenuOpen} onOpenChange={onSetPlusMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-4 rounded-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={5}
                className="border-border bg-card w-56"
              >
                <DropdownMenuItem
                  onClick={() => {
                    onCreateFolder();
                    onSetPlusMenuOpen(false);
                  }}
                  className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Create Folder
                </DropdownMenuItem>
                <div className="border-border my-1 border-t" />
                <DropdownMenuItem className="text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <Folder className="mr-2 h-4 w-4" />
                  Live Folder
                  <ChevronRight className="ml-auto h-4 w-4" />
                </DropdownMenuItem>
                <div className="border-border my-1 border-t" />
                <DropdownMenuItem
                  onClick={() => {
                    onOpenWorkspaceDialog();
                    onSetPlusMenuOpen(false);
                  }}
                  className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Create Space
                </DropdownMenuItem>
                <div className="border-border my-1 border-t" />
                <DropdownMenuItem className="text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <Columns2 className="mr-2 h-4 w-4" />
                  New Split
                </DropdownMenuItem>
                <div className="border-border my-1 border-t" />
                <DropdownMenuItem
                  onClick={() => {
                    onAddNewTab();
                    onSetPlusMenuOpen(false);
                  }}
                  className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
