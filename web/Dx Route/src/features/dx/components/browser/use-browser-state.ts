import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../chat-hooks";
import { COLORS } from "./constants";
import { DEFAULT_LOGOS } from "./default-logos";
import type { SVGLogo, Tab, TabFolder, Workspace } from "./types";
import { getLogoComponentForTab } from "./utils";

const DEFAULT_LOGO_COMPONENT_BY_ID = new Map<
  number,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
>(DEFAULT_LOGOS.map((l) => [l.id, l.component]));

function resolveLogoComponent(logo: {
  id: number;
  title: string;
}): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  const fromDefault = DEFAULT_LOGO_COMPONENT_BY_ID.get(logo.id);
  if (fromDefault) return fromDefault;
  return getLogoComponentForTab({
    id: "",
    title: logo.title,
    url: "",
    workspaceId: "",
    folderId: null,
  });
}

export function useBrowserState() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useLocalStorage("dx-active-workspace", "1");
  const [activeTab, setActiveTab] = useLocalStorage("dx-active-tab", "1");
  const [spaceCollapsed, setSpaceCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [archivesOpen, setArchivesOpen] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [workspaceScrollPosition, setWorkspaceScrollPosition] = useState(0);

  const [workspaceEditMode, setWorkspaceEditMode] = useState<
    | {
        workspaceId: string;
        currentName: string;
        currentIcon: { type: "emoji" | "icon" | "dot"; value: string };
      }
    | undefined
  >(undefined);

  const [rawLogos, setRawLogos] = useLocalStorage<{ id: number; title: string }[]>(
    "dx-logos",
    DEFAULT_LOGOS,
  );

  const logos: SVGLogo[] = useMemo(
    () =>
      rawLogos.map((raw) => ({
        ...raw,
        component: resolveLogoComponent(raw),
      })),
    [rawLogos],
  );

  const [workspaces, setWorkspaces] = useLocalStorage<Workspace[]>("dx-workspaces", [
    {
      id: "1",
      name: "Space 1",
      color: "hsl(var(--chart-1))",
      icon: { type: "dot", value: "" },
    },
  ]);

  const [folders, setFolders] = useLocalStorage<TabFolder[]>("dx-folders", []);

  const [looseTabs, setLooseTabs] = useLocalStorage<Tab[]>("dx-loose-tabs", []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleCreateWorkspace(workspace: {
    name: string;
    icon: { type: "emoji" | "icon" | "dot"; value: string };
    color: string;
  }): void {
    const workspaceName = workspace.name.trim() || `Workspace ${workspaces.length + 1}`;
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: workspaceName,
      color: workspace.color,
      icon: workspace.icon,
    };
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspace(newWorkspace.id);
  }

  function handleUpdateWorkspace(
    workspaceId: string,
    updates: {
      name?: string;
      icon?: { type: "emoji" | "icon" | "dot"; value: string };
    },
  ): void {
    setWorkspaces(
      workspaces.map((w) =>
        w.id === workspaceId
          ? {
              ...w,
              ...(updates.name && { name: updates.name }),
              ...(updates.icon && { icon: updates.icon }),
            }
          : w,
      ),
    );
  }

  return {
    sidebarExpanded,
    setSidebarExpanded,
    activeWorkspace,
    setActiveWorkspace,
    activeTab,
    setActiveTab,
    spaceCollapsed,
    setSpaceCollapsed,
    commandOpen,
    setCommandOpen,
    isMounted,
    archivesOpen,
    setArchivesOpen,
    plusMenuOpen,
    setPlusMenuOpen,
    workspaceDialogOpen,
    setWorkspaceDialogOpen,
    mediaPlaying,
    setMediaPlaying,
    workspaceScrollPosition,
    setWorkspaceScrollPosition,
    workspaceEditMode,
    setWorkspaceEditMode,
    logos,
    setLogos: setRawLogos,
    workspaces,
    setWorkspaces,
    folders,
    setFolders,
    looseTabs,
    setLooseTabs,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    COLORS,
  };
}
