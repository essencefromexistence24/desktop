import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import type { DropPosition, SVGLogo } from "./types";

interface DraggableLogoProps {
  logo: SVGLogo;
  overId: string | null;
  dropPosition: DropPosition;
  onRemoveLogo: (logoId: number) => void;
  onRenameLogo: (logoId: number, newTitle: string) => void;
}

export function DraggableLogo({
  logo,
  overId,
  dropPosition,
  onRemoveLogo,
  onRenameLogo,
}: DraggableLogoProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(logo.title);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: `logo-${logo.id}`,
      data: { type: "logo", logo },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const LogoComponent = logo.component;

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={cn(
            "bg-background/90 hover:bg-accent relative flex h-16 cursor-grab items-center justify-center transition-colors active:cursor-grabbing rounded-md bg-secondary border",
            isDragging && "opacity-50",
            isOver && "ring-2 ring-primary",
          )}
          title={logo.title}
        >
          <LogoComponent className="h-6 w-6" />
          {overId === `logo-${logo.id}` && dropPosition === "before" && (
            <div className="absolute -left-1 top-0 bottom-0 z-100 flex flex-col items-center pointer-events-none">
              <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
              <div className="bg-primary w-0.5 flex-1" />
            </div>
          )}
          {overId === `logo-${logo.id}` && dropPosition === "after" && (
            <div className="absolute -right-1 top-0 bottom-0 z-100 flex flex-col items-center pointer-events-none">
              <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
              <div className="bg-primary w-0.5 flex-1" />
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
                setNewTitle(logo.title);
                setRenameDialogOpen(true);
              }}
              className="text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Rename
            </ContextMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Quick Access</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (newTitle.trim()) {
                      onRenameLogo(logo.id, newTitle.trim());
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
                    onRenameLogo(logo.id, newTitle.trim());
                    setRenameDialogOpen(false);
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="border-border my-1 border-t" />
        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogTrigger asChild>
            <ContextMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setRemoveDialogOpen(true);
              }}
              className="text-destructive focus:bg-accent focus:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </ContextMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Quick Access</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{logo.title}" from your quick access?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onRemoveLogo(logo.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ContextMenuContent>
    </ContextMenu>
  );
}
