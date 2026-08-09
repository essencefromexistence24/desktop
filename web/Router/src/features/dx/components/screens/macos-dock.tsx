"use client";

import { LayoutGrid, Plus } from "lucide-react";
import { Dock, DockIcon } from "@/components/ui/dock";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getIconForScreen } from "./dock-icons";
import type { Screen } from "./types";

interface MacOSDockProps {
  screens: Screen[];
  activeScreenId: string;
  onScreenChange: (screenId: string) => void;
  onAddScreen: () => void;
  onToggleViewMode: () => void;
  sidebarExpanded: boolean;
}

export function MacOSDock({
  screens,
  activeScreenId,
  onScreenChange,
  onAddScreen,
  onToggleViewMode,
  sidebarExpanded,
}: MacOSDockProps) {
  const sidebarWidth = sidebarExpanded ? 360 : 56;

  return (
    <div className="pointer-events-auto">
      <Dock iconMagnification={48} iconDistance={140}>
        {screens.map((screen) => {
          const Icon = getIconForScreen(screen);
          const isActive = screen.id === activeScreenId;
          return (
            <DockIcon
              key={screen.id}
              className={cn("transition-all", isActive ? "bg-background! text-primary!" : "")}
              onClick={() => onScreenChange(screen.id)}
            >
              <Icon className="h-4 w-4" />
            </DockIcon>
          );
        })}

        <Separator orientation="vertical" className="h-[50%] py-2 my-auto bg-border/50" />

        <DockIcon onClick={onAddScreen}>
          <Plus className="h-4 w-4" />
        </DockIcon>
        <DockIcon onClick={onToggleViewMode}>
          <LayoutGrid className="h-4 w-4" />
        </DockIcon>
      </Dock>
    </div>
  );
}
