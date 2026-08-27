"use client";

import { useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { Ban, Box, Camera, Circle, Copy, Disc, Lightbulb, Lock, LockOpen, Square, Spotlight, Sun, Torus, Trash2, Triangle, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PrimitiveKind } from "../../types";
import { useEditorStore } from "../../store/editor-store";

export const pendingContextObjectIdRef: { current: string | null } = { current: null };

export type ViewportContextMenuState = {
  x: number;
  y: number;
  objectId: string | null;
};

const MENU_WIDTH = 220;

const primitiveItems: { kind: PrimitiveKind; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { kind: "box", label: "Box", icon: Box },
  { kind: "sphere", label: "Sphere", icon: Circle },
  { kind: "cylinder", label: "Cylinder", icon: Disc },
  { kind: "cone", label: "Cone", icon: Triangle },
  { kind: "torus", label: "Torus", icon: Torus },
  { kind: "plane", label: "Plane", icon: Square },
];

const lightItems: { kind: PrimitiveKind; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { kind: "pointLight", label: "Point Light", icon: Lightbulb },
  { kind: "directionalLight", label: "Directional Light", icon: Sun },
  { kind: "spotLight", label: "Spot Light", icon: Spotlight },
];

function MenuDivider() {
  return <div className="my-1 h-px bg-border" />;
}

function MenuItem({
  destructive = false,
  icon: Icon,
  label,
  onClick,
}: {
  destructive?: boolean;
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
        destructive && "text-destructive",
      )}
      onClick={onClick}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </button>
  );
}

function MenuHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">{children}</div>;
}

export function ViewportContextMenu({ menu, onClose }: { menu: ViewportContextMenuState; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const addObject = useEditorStore((state) => state.addObject);
  const deleteObject = useEditorStore((state) => state.deleteObject);
  const duplicateObject = useEditorStore((state) => state.duplicateObject);
  const objects = useEditorStore((state) => state.document.objects);
  const selectObject = useEditorStore((state) => state.selectObject);
  const updateObject = useEditorStore((state) => state.updateObject);
  const target = menu.objectId ? objects.find((object) => object.id === menu.objectId) : null;

  useEffect(() => {
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const left = Math.max(8, Math.min(menu.x, window.innerWidth - MENU_WIDTH - 8));
  const top = Math.max(8, Math.min(menu.y, window.innerHeight - 360 - 8));

  const handleItemClick = (action: () => void) => {
    return () => {
      action();
      onClose();
    };
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-50 w-[220px] overflow-hidden rounded-md border border-border bg-popover py-1 text-sm text-popover-foreground shadow-lg"
      style={{ left, top }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {target ? (
        <>
          <MenuHeader>{target.name}</MenuHeader>
          <MenuItem icon={Copy} label="Duplicate" onClick={handleItemClick(() => duplicateObject(target.id))} />
          <MenuItem
            icon={target.locked ? LockOpen : Lock}
            label={target.locked ? "Unlock" : "Lock"}
            onClick={handleItemClick(() => updateObject(target.id, (object) => ({ ...object, locked: !object.locked })))}
          />
          <MenuDivider />
          <MenuItem icon={Trash2} destructive label="Delete" onClick={handleItemClick(() => deleteObject(target.id))} />
        </>
      ) : (
        <>
          <MenuHeader>Add object</MenuHeader>
          <div className="grid grid-cols-2 gap-0.5 px-1 py-1">
            {primitiveItems.map((item) => (
              <button
                key={item.kind}
                type="button"
                role="menuitem"
                className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                onClick={handleItemClick(() => addObject(item.kind))}
              >
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
          <MenuDivider />
          <div className="py-1">
            {lightItems.map((item) => (
              <MenuItem key={item.kind} icon={item.icon} label={item.label} onClick={handleItemClick(() => addObject(item.kind))} />
            ))}
            <MenuItem icon={Camera} label="Camera" onClick={handleItemClick(() => addObject("camera"))} />
            <MenuItem icon={Type} label="Text" onClick={handleItemClick(() => addObject("text"))} />
          </div>
          <MenuDivider />
          <MenuItem icon={Ban} label="Select none" onClick={handleItemClick(() => selectObject(null))} />
        </>
      )}
    </div>
  );
}