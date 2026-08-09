"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { EditorWorkspace } from "@/features/editor/components/editor-workspace";
import {
  createLocalProject,
  readLocalProject,
  toLocalProjectStore,
} from "@/features/editor/local-project-store";
import type { ProjectDetail } from "@/features/editor/types";

export function LocalEditorPage() {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const resolvedRef = useRef(false);
  const localStore = useMemo(() => toLocalProjectStore(), []);

  useEffect(() => {
    if (resolvedRef.current) return;

    resolvedRef.current = true;
    const id = new URLSearchParams(window.location.search).get("id");
    const existingProject = id ? readLocalProject(id) : null;
    const activeProject = existingProject ?? createLocalProject();

    setProject(activeProject);
    router.replace(`/editor?id=${activeProject.id}`);
  }, [router]);

  if (!project) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
        Loading design…
      </div>
    );
  }

  return (
    <EditorWorkspace
      project={project}
      assets={[]}
      brandColors={[]}
      brandFonts={[]}
      brandLogos={[]}
      versions={[]}
      comments={[]}
      presence={[]}
      canManageSharing={false}
      canRestoreVersions={false}
      localStore={localStore}
    />
  );
}
