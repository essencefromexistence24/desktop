"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEditorStore } from "@/features/editor/state/editor-store";
import { restoreBrowserMediaAssets } from "@/lib/media/browser-media-store";
import { restoreTauriMediaAssets } from "@/lib/media/tauri-media";
import { restoreSelfHostedMediaAssets } from "@/lib/media/self-hosted-media";
import {
  recoverMediaAssets,
  type MediaRecoveryAdapter,
} from "@/lib/media/media-recovery";
import {
  loadLocalProject,
  trySaveLocalProject,
} from "@/lib/projects/local-project-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectTopbar } from "@/features/editor/components/project-topbar";
import { ToolRail } from "@/features/editor/components/tool-rail";
import { MediaBin } from "@/features/editor/components/media-bin";
import { PreviewCanvas } from "@/features/editor/components/preview-canvas";
import { InspectorPanel } from "@/features/editor/components/inspector-panel";
import { TimelinePanel } from "@/features/editor/components/timeline-panel";
import { BrandFontLoader } from "@/features/editor/components/brand-font-loader";
import { useEditorShortcuts } from "@/features/editor/hooks/use-editor-shortcuts";
import { usePlaybackClock } from "@/features/editor/hooks/use-playback-clock";
import { preloadFfmpeg } from "@/lib/render/ffmpeg-loader";

const ExportPanel = lazy(() =>
  import("@/features/editor/components/export-panel").then((m) => ({
    default: m.ExportPanel,
  })),
);

type EditorNotice = {
  tone: "default" | "destructive";
  message: string;
};

const missingMediaNotice: EditorNotice = {
  tone: "default",
  message:
    "Use the media panel reconnect controls to relink missing browser, desktop, or hosted source files.",
};

type EditorShellProps = {
  embedded?: boolean;
};

export function EditorShell({ embedded = false }: EditorShellProps) {
  const searchParams = useSearchParams();
  const mediaAssets = useEditorStore((state) => state.mediaAssets);
  const project = useEditorStore((state) => state.project);
  const addMediaAsset = useEditorStore((state) => state.addMediaAsset);
  const loadProject = useEditorStore((state) => state.loadProject);
  const restoreAttemptedRef = useRef(new Set<string>());
  const [notice, setNotice] = useState<EditorNotice | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  usePlaybackClock();
  useEditorShortcuts();
  const visibleNotice =
    notice ??
    (searchParams.get("recovery") === "missing-media"
      ? missingMediaNotice
      : null);

  useEffect(() => {
    let mounted = true;
    const projectId = searchParams.get("project");
    if (!projectId || projectId === project.id) return;

    loadLocalProject(projectId)
      .then((record) => {
        if (!mounted) return;
        if (!record) {
          setNotice({
            tone: "destructive",
            message: "Local project could not be opened.",
          });
          return;
        }

        loadProject(record.project, record.mediaAssets);
        setNotice(null);
      })
      .catch(() => {
        if (mounted) {
          setNotice({
            tone: "destructive",
            message: "Local project could not be opened.",
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [loadProject, project.id, searchParams]);

  useEffect(() => {
    let mounted = true;
    const adapters: MediaRecoveryAdapter[] = [
      {
        source: "browser-indexeddb",
        restore: async (asset) =>
          (await restoreBrowserMediaAssets([asset]))[0] ?? asset,
      },
      {
        source: "tauri-fs",
        restore: async (asset) =>
          (await restoreTauriMediaAssets([asset]))[0] ?? asset,
      },
      {
        source: "self-hosted-url",
        restore: async (asset) =>
          (await restoreSelfHostedMediaAssets([asset]))[0] ?? asset,
      },
    ];

    recoverMediaAssets(
      project.id,
      mediaAssets,
      adapters,
      restoreAttemptedRef.current,
    )
      .then(({ recovered, unavailable }) => {
        if (!mounted) return;
        recovered.forEach(addMediaAsset);

        if (unavailable.length > 0) {
          setNotice({
            tone: "default",
            message:
              "Some media could not be reconnected. Use the media panel to reconnect missing files.",
          });
        }
      })
      .catch(() => {
        if (mounted) {
          setNotice({
            tone: "default",
            message:
              "Some media could not be reconnected. Use the media panel to reconnect missing files.",
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [addMediaAsset, mediaAssets, project.id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void trySaveLocalProject(project, mediaAssets);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [mediaAssets, project]);

  useEffect(() => {
    preloadFfmpeg().catch(() => {});
  }, []);

  return (
    <main
      className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background"
      aria-label="Essence Studio editor"
    >
      <BrandFontLoader />
      <ProjectTopbar
        embedded={embedded}
        onExportClick={() => setExportOpen(true)}
      />
      {visibleNotice ? (
        <div className="border-t border-border bg-card px-3 py-2">
          <Alert variant={visibleNotice.tone} className="rounded-md py-2">
            <AlertCircle className="size-4" />
            <AlertDescription>{visibleNotice.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      <div
        className="flex min-h-0 flex-1 overflow-hidden"
        role="region"
        aria-label="Editor workspace"
      >
        {embedded ? null : <ToolRail />}
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <ResizablePanel
            defaultSize={24}
            minSize={18}
            maxSize={38}
            className="min-w-0"
          >
            <div
              data-editor-region="media-library"
              tabIndex={-1}
              className="flex h-full min-w-0 flex-col overflow-hidden"
            >
              <MediaBin />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={48} minSize={32} className="min-w-0">
            <ResizablePanelGroup
              direction="vertical"
              className="h-full min-h-0"
            >
              <ResizablePanel defaultSize={70} minSize={40} className="min-h-0">
                <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background">
                  <PreviewCanvas showBottomTools={embedded} />
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel
                defaultSize={30}
                minSize={15}
                maxSize={50}
                className="min-h-0"
              >
                <TimelinePanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={28}
            minSize={18}
            maxSize={36}
            className="min-w-0"
          >
            <aside
              className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-l border-border bg-background"
              aria-label="Inspector and assistant"
            >
              <div className="h-full min-h-0 min-w-0 overflow-hidden">
                <InspectorPanel />
              </div>
            </aside>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-h-[90vh] w-full max-w-5xl overflow-hidden p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Export</DialogTitle>
            <DialogDescription>
              Choose preset, check QA, and render.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] w-full max-w-full min-w-0 overflow-hidden px-4 pb-4">
            <Suspense fallback={null}>
              <ExportPanel />
            </Suspense>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </main>
  );
}
