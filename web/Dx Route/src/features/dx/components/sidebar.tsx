"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Copy, Plus, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceDialog } from "@/components/workspace-dialog";
import { MAX_LOGOS, MAX_VISIBLE_WORKSPACES } from "@/features/dx/components/browser/constants";
import { SidebarCollapsed } from "@/features/dx/components/browser/sidebar-collapsed";
import { SidebarExpanded } from "@/features/dx/components/browser/sidebar-expanded";
import { SidebarHeader } from "@/features/dx/components/browser/sidebar-header";
import type { DropPosition, Tab, TabFolder } from "@/features/dx/components/browser/types";
import { useBrowserState } from "@/features/dx/components/browser/use-browser-state";
import { getLogoComponentForTab } from "@/features/dx/components/browser/utils";
import { WorkspaceIcon } from "@/features/dx/components/browser/workspace-icon";
import { cn } from "@/lib/utils";

export function Sidebar({
  children,
  onNewChat,
  onTabSelect,
  onRenameTab,
  onArchiveTab,
  onOpenSettings,
}: {
  children: React.ReactNode;
  onNewChat?: () => any;
  onTabSelect?: (tabId: string) => void;
  onRenameTab?: (tabId: string, newTitle: string) => void;
  onArchiveTab?: (tabId: string) => void;
  onOpenSettings?: () => void;
}) {
  const state = useBrowserState();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const [logoContainerHovered, setLogoContainerHovered] = useState(false);
  const [isSpaceAreaHovered, setIsSpaceAreaHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<string>("");
  const [renameValue, setRenameValue] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaProgress] = useState(33);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  function scrollWorkspaces(direction: "left" | "right"): void {
    if (direction === "left") {
      state.setWorkspaceScrollPosition((prev) => Math.max(0, prev - 1));
    } else {
      state.setWorkspaceScrollPosition((prev) =>
        Math.min(state.workspaces.length - MAX_VISIBLE_WORKSPACES, prev + 1),
      );
    }
  }

  function startScrolling(direction: "left" | "right"): void {
    scrollWorkspaces(direction);

    scrollIntervalRef.current = setInterval(() => {
      scrollWorkspaces(direction);
    }, 150);
  }

  function stopScrolling(): void {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }

  const visibleWorkspaces = state.workspaces.slice(
    state.workspaceScrollPosition,
    state.workspaceScrollPosition + MAX_VISIBLE_WORKSPACES,
  );
  const canScrollLeft = state.workspaceScrollPosition > 0;
  const canScrollRight =
    state.workspaceScrollPosition < state.workspaces.length - MAX_VISIBLE_WORKSPACES;

  function handleDragStart(event: DragStartEvent): void {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent): void {
    const overId = event.over?.id as string | null;
    setOverId(overId);

    if (!overId || !event.over) {
      setDropPosition(null);
      setLogoContainerHovered(false);
      return;
    }

    const overData = event.over.data.current;
    const activeData = event.active.data.current;

    if (overId === "logo-container" || overData?.type === "logo-container") {
      if (activeData?.type === "tab" || activeData?.type === "folder") {
        setLogoContainerHovered(true);
        setDropPosition(null);
      } else {
        setLogoContainerHovered(false);
        setDropPosition(null);
      }
      return;
    } else {
      setLogoContainerHovered(false);
    }

    if (activeData?.type === "logo") {
      if (overData?.type === "logo") {
        const overRect = event.over.rect;
        const offsetX = event.delta.x;
        if (overRect && offsetX < 0) {
          setDropPosition("before");
        } else {
          setDropPosition("after");
        }
      } else if (overData?.type === "folder") {
        setDropPosition("inside");
      } else if (overData?.type === "tab") {
        const overRect = event.over.rect;
        const offsetY = event.delta.y;
        if (overRect && offsetY < 0) {
          setDropPosition("before");
        } else {
          setDropPosition("after");
        }
      } else {
        setDropPosition(null);
      }
      return;
    }

    if (overData?.type === "folder") {
      if (activeData?.type === "tab") {
        setDropPosition("inside");
      } else if (activeData?.type === "folder") {
        const overRect = event.over.rect;
        const offsetY = event.delta.y;
        if (overRect && offsetY < 0) {
          setDropPosition("before");
        } else {
          setDropPosition("after");
        }
      } else {
        setDropPosition(null);
      }
    } else if (overData?.type === "tab") {
      const overRect = event.over.rect;
      const offsetY = event.delta.y;
      if (overRect && offsetY < 0) {
        setDropPosition("before");
      } else {
        setDropPosition("after");
      }
    } else if (overData?.type === "logo") {
      const overRect = event.over.rect;
      const offsetX = event.delta.x;
      if (overRect && offsetX < 0) {
        setDropPosition("before");
      } else {
        setDropPosition("after");
      }
    } else {
      setDropPosition(null);
    }
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    setDropPosition(null);
    setLogoContainerHovered(false);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;

    // Logo reordering
    if (activeData?.type === "logo" && overData?.type === "logo") {
      const oldIndex = state.logos.findIndex((l) => `logo-${l.id}` === activeId);
      const newIndex = state.logos.findIndex((l) => `logo-${l.id}` === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newLogos = [...state.logos];
        const [removed] = newLogos.splice(oldIndex, 1);
        newLogos.splice(newIndex, 0, removed);
        state.setLogos(newLogos);
      }
      return;
    }

    // Dragging logo out to create a tab
    if (activeData?.type === "logo") {
      const logoId = activeId.replace("logo-", "");
      const logo = state.logos.find((l) => l.id === parseInt(logoId, 10));
      if (!logo) return;

      if (
        overId === "logo-container" ||
        overData?.type === "logo-container" ||
        overData?.type === "logo"
      ) {
        return;
      }

      state.setLogos(state.logos.filter((l) => l.id !== parseInt(logoId, 10)));

      const newTab: Tab = {
        id: Date.now().toString(),
        title: logo.title,
        url: "about:blank",
        workspaceId: state.activeWorkspace,
        folderId: overData?.type === "folder" ? overId : null,
      };

      if (overData?.type === "folder") {
        state.setFolders(
          state.folders.map((f) => (f.id === overId ? { ...f, tabs: [...f.tabs, newTab] } : f)),
        );
      } else {
        state.setLooseTabs([...state.looseTabs, newTab]);
      }
      return;
    }

    // Folder reordering
    if (activeData?.type === "folder" && overData?.type === "folder") {
      const oldIndex = state.folders.findIndex((f) => f.id === activeId);
      const newIndex = state.folders.findIndex((f) => f.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newFolders = [...state.folders];
        const [removed] = newFolders.splice(oldIndex, 1);
        newFolders.splice(newIndex, 0, removed);
        state.setFolders(newFolders);
      }
      return;
    }

    // Drop tab into folder
    if (activeData?.type === "tab" && overData?.type === "folder") {
      let draggedTab = state.looseTabs.find((t) => t.id === activeId);
      let _sourceFolder: TabFolder | undefined;

      if (!draggedTab) {
        for (const folder of state.folders) {
          const tab = folder.tabs.find((t) => t.id === activeId);
          if (tab) {
            draggedTab = tab;
            _sourceFolder = folder;
            // Remove from old folder
            state.setFolders(
              state.folders.map((f) =>
                f.id === folder.id ? { ...f, tabs: f.tabs.filter((t) => t.id !== activeId) } : f,
              ),
            );
            break;
          }
        }
      } else {
        // Remove from loose tabs
        state.setLooseTabs(state.looseTabs.filter((t) => t.id !== activeId));
      }

      if (draggedTab) {
        // Add to target folder and set folderId
        state.setFolders(
          state.folders.map((f) =>
            f.id === overId ? { ...f, tabs: [...f.tabs, { ...draggedTab, folderId: overId }] } : f,
          ),
        );
      }
      return;
    }

    // Reorder loose tabs
    if (activeData?.type === "tab" && overData?.type === "tab") {
      const oldIndex = state.looseTabs.findIndex((t) => t.id === activeId);
      const newIndex = state.looseTabs.findIndex((t) => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newTabs = [...state.looseTabs];
        const [removed] = newTabs.splice(oldIndex, 1);
        newTabs.splice(newIndex, 0, removed);
        state.setLooseTabs(newTabs);
      }
      return;
    }

    // Drop onto logo container - create logo
    if (overId === "logo-container" || overData?.type === "logo-container") {
      if (state.logos.length >= MAX_LOGOS) {
        setAlertMessage("Logo container is full! Maximum 12 items allowed.");
        return;
      }

      if (activeData?.type === "folder") {
        const draggedFolder = state.folders.find((f) => f.id === activeId);
        if (draggedFolder) {
          const newLogo = {
            id: Date.now(),
            title: draggedFolder.name,
            component: getLogoComponentForTab({
              id: "",
              title: draggedFolder.name,
              url: "",
              workspaceId: "",
            }),
          };
          state.setLogos([...state.logos, newLogo]);
          return;
        }
      }

      const draggedTab = state.looseTabs.find((t) => t.id === activeId);
      if (draggedTab) {
        const newLogo = {
          id: Date.now(),
          title: draggedTab.title,
          component: getLogoComponentForTab(draggedTab),
        };
        state.setLogos([...state.logos, newLogo]);
        state.setLooseTabs(state.looseTabs.filter((t) => t.id !== activeId));
      }
      return;
    }
  }

  function addNewTab(): void {
    const newChat = onNewChat?.();
    const newId = newChat?.id || Date.now().toString();
    const newTab: Tab = {
      id: newId,
      title: "New Chat",
      url: "about:blank",
      workspaceId: state.activeWorkspace,
      folderId: null,
    };
    state.setLooseTabs([...state.looseTabs, newTab]);
    state.setActiveTab(newId);
  }

  function createFolder(): void {
    const folderCount = state.folders.filter((f) => f.workspaceId === state.activeWorkspace).length;
    const newFolder: TabFolder = {
      id: `folder-${Date.now()}`,
      name: `Folder ${folderCount + 1}`,
      collapsed: false,
      workspaceId: state.activeWorkspace,
      parentId: null,
      tabs: [],
    };
    state.setFolders([...state.folders, newFolder]);
  }

  function toggleFolder(folderId: string): void {
    state.setFolders(
      state.folders.map((folder) =>
        folder.id === folderId ? { ...folder, collapsed: !folder.collapsed } : folder,
      ),
    );
  }

  function deleteFolder(folderId: string): void {
    const folder = state.folders.find((f) => f.id === folderId);
    if (folder) {
      const folderTabs = folder.tabs.map((tab) => ({ ...tab, folderId: null }));
      state.setLooseTabs([...state.looseTabs, ...folderTabs]);
    }
    state.setFolders(state.folders.filter((f) => f.id !== folderId));
  }

  function closeTab(tabId: string): void {
    state.setLooseTabs(state.looseTabs.filter((tab) => tab.id !== tabId));
    state.setFolders(
      state.folders.map((folder) => ({
        ...folder,
        tabs: folder.tabs.filter((tab) => tab.id !== tabId),
      })),
    );
  }

  function clearAllTabs(): void {
    state.setLooseTabs([]);
  }

  const activeWorkspaceFolders = state.folders.filter(
    (folder) => folder.workspaceId === state.activeWorkspace && !folder.parentId,
  );
  const activeWorkspaceTabs = state.looseTabs.filter(
    (tab) => tab.workspaceId === state.activeWorkspace && !tab.folderId,
  );

  function renderWorkspaceIcon(workspace: any, isActive: boolean) {
    return <WorkspaceIcon workspace={workspace} isActive={isActive} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-background flex h-screen w-screen overflow-hidden">
        <div
          className={cn(
            "group bg-card flex h-full shrink-0 flex-col transition-all duration-200 select-none overflow-x-hidden",
            state.sidebarExpanded ? "w-[360px]" : "w-14",
          )}
        >
          <SidebarHeader
            sidebarExpanded={state.sidebarExpanded}
            onToggleSidebar={() => state.setSidebarExpanded(!state.sidebarExpanded)}
          />

          {!state.sidebarExpanded && (
            <SidebarCollapsed
              workspaces={state.workspaces}
              activeWorkspace={state.activeWorkspace}
              visibleWorkspaces={visibleWorkspaces}
              canScrollLeft={canScrollLeft}
              canScrollRight={canScrollRight}
              archivesOpen={state.archivesOpen}
              plusMenuOpen={state.plusMenuOpen}
              folders={state.folders}
              activeWorkspaceTabs={activeWorkspaceTabs}
              onSetActiveWorkspace={state.setActiveWorkspace}
              onSetarchivesOpen={state.setArchivesOpen}
              onSetPlusMenuOpen={state.setPlusMenuOpen}
              onStartScrolling={startScrolling}
              onStopScrolling={stopScrolling}
              onCreateWorkspace={() =>
                state.handleCreateWorkspace({
                  name: "",
                  icon: { type: "dot", value: "" },
                  color: state.COLORS[state.workspaces.length % state.COLORS.length],
                })
              }
              onOpenWorkspaceDialog={() => state.setWorkspaceDialogOpen(true)}
              onCreateFolder={createFolder}
              onAddNewTab={addNewTab}
              activeTab={state.activeTab}
              onSetCommandOpen={state.setCommandOpen}
              onSetActiveTab={state.setActiveTab}
              onSetSettingsOpen={() => {
                if (onOpenSettings) onOpenSettings();
              }}
              onRenameWorkspace={() => {
                const currentWorkspace = state.workspaces.find(
                  (w) => w.id === state.activeWorkspace,
                );
                setRenameTarget(currentWorkspace?.name || "");
                setRenameValue(currentWorkspace?.name || "");
              }}
              onEditWorkspaceIcon={() => {
                const currentWorkspace = state.workspaces.find(
                  (w) => w.id === state.activeWorkspace,
                );
                if (currentWorkspace) {
                  state.setWorkspaceEditMode({
                    workspaceId: currentWorkspace.id,
                    currentName: currentWorkspace.name,
                    currentIcon: currentWorkspace.icon,
                  });
                  state.setWorkspaceDialogOpen(true);
                }
              }}
              onUnloadSpace={() => {
                state.setFolders(
                  state.folders.filter((f) => f.workspaceId !== state.activeWorkspace),
                );
                state.setLooseTabs(
                  state.looseTabs.filter((t) => t.workspaceId !== state.activeWorkspace),
                );
              }}
              onDeleteSpace={() => {
                if (state.workspaces.length <= 1) {
                  setAlertMessage("Cannot delete the last workspace!");
                  return;
                }
                const currentWorkspace = state.workspaces.find(
                  (w) => w.id === state.activeWorkspace,
                );
                setDeleteTarget(currentWorkspace?.name || "");
              }}
            />
          )}

          <AnimatePresence>
            {state.sidebarExpanded && (
              <SidebarExpanded
                workspaces={state.workspaces}
                activeWorkspace={state.activeWorkspace}
                visibleWorkspaces={visibleWorkspaces}
                canScrollLeft={canScrollLeft}
                canScrollRight={canScrollRight}
                archivesOpen={state.archivesOpen}
                plusMenuOpen={state.plusMenuOpen}
                spaceCollapsed={state.spaceCollapsed}
                isSpaceAreaHovered={isSpaceAreaHovered}
                dropdownOpen={dropdownOpen}
                mediaPlaying={state.mediaPlaying}
                mediaProgress={mediaProgress}
                isMounted={state.isMounted}
                logos={state.logos}
                logoContainerHovered={logoContainerHovered}
                activeWorkspaceFolders={activeWorkspaceFolders}
                activeWorkspaceTabs={activeWorkspaceTabs}
                activeTab={state.activeTab}
                overId={overId}
                dropPosition={dropPosition}
                folders={state.folders}
                onSetActiveWorkspace={state.setActiveWorkspace}
                onSetarchivesOpen={state.setArchivesOpen}
                onSetPlusMenuOpen={state.setPlusMenuOpen}
                onSetSpaceCollapsed={state.setSpaceCollapsed}
                onSetSpaceAreaHovered={setIsSpaceAreaHovered}
                onSetDropdownOpen={setDropdownOpen}
                onSetMediaPlaying={state.setMediaPlaying}
                onStartScrolling={startScrolling}
                onStopScrolling={stopScrolling}
                onCreateWorkspace={() =>
                  state.handleCreateWorkspace({
                    name: "",
                    icon: { type: "dot", value: "" },
                    color: state.COLORS[state.workspaces.length % state.COLORS.length],
                  })
                }
                onOpenWorkspaceDialog={() => state.setWorkspaceDialogOpen(true)}
                onCreateFolder={createFolder}
                onAddNewTab={addNewTab}
                onCollapseAllFolders={() =>
                  state.setFolders(state.folders.map((f) => ({ ...f, collapsed: true })))
                }
                onExpandAllFolders={() =>
                  state.setFolders(state.folders.map((f) => ({ ...f, collapsed: false })))
                }
                onClearAllTabs={clearAllTabs}
                onSetCommandOpen={state.setCommandOpen}
                onRemoveLogo={(logoId) =>
                  state.setLogos(state.logos.filter((l) => l.id !== logoId))
                }
                onRenameLogo={(logoId, newTitle) =>
                  state.setLogos(
                    state.logos.map((l) => (l.id === logoId ? { ...l, title: newTitle } : l)),
                  )
                }
                onSetActiveTab={(id) => {
                  state.setActiveTab(id);
                  onTabSelect?.(id);
                }}
                onCloseTab={closeTab}
                onRenameTab={onRenameTab}
                onArchiveTab={onArchiveTab}
                onToggleFolder={toggleFolder}
                onDeleteFolder={deleteFolder}
                onRenameFolder={(folderId, newName) =>
                  state.setFolders(
                    state.folders.map((f) => (f.id === folderId ? { ...f, name: newName } : f)),
                  )
                }
                onUnloadAllTabs={(folderId) =>
                  state.setFolders(
                    state.folders.map((f) => (f.id === folderId ? { ...f, tabs: [] } : f)),
                  )
                }
                onCreateSubfolder={(parentId) => {
                  const subfolderCount = state.folders.filter(
                    (f) => f.parentId === parentId,
                  ).length;
                  const newSubfolder: TabFolder = {
                    id: `folder-${Date.now()}`,
                    name: `Subfolder ${subfolderCount + 1}`,
                    collapsed: false,
                    workspaceId: state.activeWorkspace,
                    parentId: parentId,
                    tabs: [],
                  };
                  state.setFolders([...state.folders, newSubfolder]);
                }}
                onUnpackFolder={(folderId) => {
                  const folder = state.folders.find((f) => f.id === folderId);
                  if (folder) {
                    const folderTabs = folder.tabs.map((tab) => ({
                      ...tab,
                      folderId: null,
                    }));
                    state.setLooseTabs([...state.looseTabs, ...folderTabs]);
                    deleteFolder(folderId);
                  }
                }}
                onRenameWorkspace={() => {
                  const currentWorkspace = state.workspaces.find(
                    (w) => w.id === state.activeWorkspace,
                  );
                  setRenameTarget(currentWorkspace?.name || "");
                  setRenameValue(currentWorkspace?.name || "");
                }}
                onEditWorkspaceIcon={() => {
                  const currentWorkspace = state.workspaces.find(
                    (w) => w.id === state.activeWorkspace,
                  );
                  if (currentWorkspace) {
                    state.setWorkspaceEditMode({
                      workspaceId: currentWorkspace.id,
                      currentName: currentWorkspace.name,
                      currentIcon: currentWorkspace.icon,
                    });
                    state.setWorkspaceDialogOpen(true);
                  }
                }}
                onUnloadSpace={() => {
                  state.setFolders(
                    state.folders.filter((f) => f.workspaceId !== state.activeWorkspace),
                  );
                  state.setLooseTabs(
                    state.looseTabs.filter((t) => t.workspaceId !== state.activeWorkspace),
                  );
                }}
                onDeleteSpace={() => {
                  if (state.workspaces.length <= 1) {
                    setAlertMessage("Cannot delete the last workspace!");
                    return;
                  }
                  setDeleteTarget(state.activeWorkspace);
                }}
                renderWorkspaceIcon={renderWorkspaceIcon}
                COLORS={state.COLORS}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="flex min-w-0 flex-1 bg-card border-l relative">{children}</div>
      </div>

      <WorkspaceDialog
        open={state.workspaceDialogOpen}
        onOpenChange={(open) => {
          state.setWorkspaceDialogOpen(open);
          if (!open) {
            state.setWorkspaceEditMode(undefined);
          }
        }}
        onCreateWorkspace={state.handleCreateWorkspace}
        editMode={state.workspaceEditMode}
        onUpdateWorkspace={state.handleUpdateWorkspace}
      />

      <Dialog open={state.commandOpen} onOpenChange={state.setCommandOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <VisuallyHidden>
            <DialogTitle>Search and Command Palette</DialogTitle>
          </VisuallyHidden>
          <Command>
            <CommandInput placeholder="Search or enter address..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem
                  onSelect={() => {
                    addNewTab();
                    state.setCommandOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Chat</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    state.setWorkspaceDialogOpen(true);
                    state.setCommandOpen(false);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Create Space</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    clearAllTabs();
                    state.setCommandOpen(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  <span>Clear All Tabs</span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Recent Tabs">
                {activeWorkspaceTabs.slice(0, 5).map((tab) => (
                  <CommandItem
                    key={tab.id}
                    onSelect={() => {
                      state.setActiveTab(tab.id);
                      state.setCommandOpen(false);
                    }}
                  >
                    <div className="bg-destructive mr-2 h-4 w-4 shrink-0 rounded-sm" />
                    <span className="max-w-[75%] truncate">{tab.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Workspaces">
                {state.workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() => {
                      state.setActiveWorkspace(workspace.id);
                      state.setCommandOpen(false);
                    }}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      <WorkspaceIcon
                        workspace={workspace}
                        isActive={state.activeWorkspace === workspace.id}
                      />
                    </div>
                    <span className="max-w-[75%] truncate">{workspace.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <DragOverlay>
        {activeId ? (
          <div className="bg-accent text-accent-foreground flex h-9 items-center gap-2 rounded-md px-2 shadow-lg">
            <div className="bg-destructive h-4 w-4 shrink-0 rounded-sm" />
            <span className="text-xs">
              {state.looseTabs.find((t) => t.id === activeId)?.title || "Dragging..."}
            </span>
          </div>
        ) : null}
      </DragOverlay>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workspace? All tabs and folders will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const id = deleteTarget;
                if (!id) return;
                state.setFolders(state.folders.filter((f) => f.workspaceId !== id));
                state.setLooseTabs(state.looseTabs.filter((t) => t.workspaceId !== id));
                state.setWorkspaces(state.workspaces.filter((w) => w.id !== id));
                const remaining = state.workspaces.filter((w) => w.id !== id);
                if (remaining.length > 0) state.setActiveWorkspace(remaining[0].id);
                setDeleteTarget(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget("")}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && renameValue.trim()) {
                    const currentWorkspace = state.workspaces.find(
                      (w) => w.name === renameTarget || w.id === state.activeWorkspace,
                    );
                    if (currentWorkspace) {
                      state.setWorkspaces(
                        state.workspaces.map((w) =>
                          w.id === currentWorkspace.id ? { ...w, name: renameValue.trim() } : w,
                        ),
                      );
                    }
                    setRenameTarget("");
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget("")}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (renameValue.trim()) {
                  const currentWorkspace = state.workspaces.find(
                    (w) => w.name === renameTarget || w.id === state.activeWorkspace,
                  );
                  if (currentWorkspace) {
                    state.setWorkspaces(
                      state.workspaces.map((w) =>
                        w.id === currentWorkspace.id ? { ...w, name: renameValue.trim() } : w,
                      ),
                    );
                  }
                }
                setRenameTarget("");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!alertMessage} onOpenChange={(open) => !open && setAlertMessage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notice</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertMessage(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
}
