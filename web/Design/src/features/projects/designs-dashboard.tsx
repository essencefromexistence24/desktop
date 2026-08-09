"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { designPresets } from "@/features/editor/presets";
import {
  createLocalProject,
  deleteLocalProject,
  duplicateLocalProject,
  listLocalProjects,
  subscribeToLocalProjects,
} from "@/features/editor/local-project-store";
import type { DesignPresetId } from "@/features/editor/types";
import { Copy, ExternalLink, Plus, Trash2, MoreHorizontal } from "lucide-react";

export function DesignsDashboard() {
  const router = useRouter();
  const projects = useSyncExternalStore(
    subscribeToLocalProjects,
    listLocalProjects,
    () => [],
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectPreset, setNewProjectPreset] =
    useState<DesignPresetId>("presentation");

  const openEditor = useCallback(
    (projectId: string) => {
      router.push(`/editor?id=${projectId}`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    const project = createLocalProject({
      name: newProjectName.trim() || undefined,
      presetId: newProjectPreset,
    });

    setIsCreateOpen(false);
    setNewProjectName("");
    openEditor(project.id);
  }, [newProjectName, newProjectPreset, openEditor]);

  const handleDuplicate = useCallback((projectId: string) => {
    duplicateLocalProject(projectId);
  }, []);

  const handleDelete = useCallback(() => {
    if (!pendingDeleteId) return;

    deleteLocalProject(pendingDeleteId);
    setPendingDeleteId(null);
    setIsDeleteOpen(false);
  }, [pendingDeleteId]);

  const selectedPreset = useMemo(
    () => designPresets.find((preset) => preset.id === newProjectPreset),
    [newProjectPreset],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Designs</h1>
            <p className="text-sm text-muted-foreground">
              Your designs live in this browser and stay on this device.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New design
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No designs yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Create your first design to start working on a canvas.
            </CardContent>
            <CardFooter>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                New design
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col overflow-hidden">
                <button
                  type="button"
                  onClick={() => openEditor(project.id)}
                  className="group flex aspect-[4/3] items-center justify-center border-b border-border bg-muted/40 transition-colors hover:bg-muted/70"
                  aria-label={`Open ${project.name}`}
                >
                  {project.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.thumbnail}
                      alt={`Preview of ${project.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-card text-2xl font-bold text-muted-foreground shadow-sm">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                <CardHeader className="pb-2">
                  <CardTitle className="truncate text-base">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2 pb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {project.width} × {project.height}
                    </Badge>
                    <span>{formatUpdatedAt(project.updatedAt)}</span>
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-2 border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditor(project.id)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(project.id)}
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setPendingDeleteId(project.id);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New design</DialogTitle>
            <DialogDescription>
              Pick a starting size and name your design.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="new-design-name">Name</Label>
              <Input
                id="new-design-name"
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                placeholder="Untitled design"
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleCreate();
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-design-preset">Format</Label>
              <Select
                value={newProjectPreset}
                onValueChange={(value) =>
                  setNewProjectPreset(value as DesignPresetId)
                }
              >
                <SelectTrigger id="new-design-preset" className="w-full">
                  <SelectValue placeholder="Choose a format" />
                </SelectTrigger>
                <SelectContent>
                  {designPresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <span className="inline-flex items-center justify-between gap-4">
                        <span>{preset.name}</span>
                        <span className="text-muted-foreground">
                          {preset.width} × {preset.height}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedPreset?.description}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create design</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete design?</DialogTitle>
            <DialogDescription>
              This removes the design from this browser. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
