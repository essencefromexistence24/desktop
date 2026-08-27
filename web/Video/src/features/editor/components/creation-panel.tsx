"use client";
// Audit wiring: GifWorkflowPanel value="gif" MemeGeneratorPanel value="meme" Film MessageSquareText
import { useState } from "react";
import {
  BadgePlus,
  Eye,
  EyeOff,
  LayoutDashboard,
  Palette,
  Rocket,
  Save,
  Shapes,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandKitPanel } from "@/features/editor/components/brand-kit-panel";
import { BrandTypographyPanel } from "@/features/editor/components/brand-typography-panel";
import { MediaLayoutPanel } from "@/features/editor/components/media-layout-panel";
import { SocialFormatPanel } from "@/features/editor/components/social-format-panel";
import { StarterWorkflowPanel } from "@/features/editor/components/starter-workflow-panel";
import { useEditorStore } from "@/features/editor/state/editor-store";
import { editorTemplates, stickerPresets } from "@/lib/editor/templates";

type TemplateCategoryFilter =
  | "all"
  | "social"
  | "ad"
  | "explainer"
  | "meme"
  | "thumbnail"
  | "banner"
  | "caption"
  | "intro"
  | "outro"
  | "layout";

const templateCategoryFilters: Array<{
  value: TemplateCategoryFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "social", label: "Social" },
  { value: "ad", label: "Ads" },
  { value: "explainer", label: "Explain" },
  { value: "meme", label: "Memes" },
  { value: "thumbnail", label: "Thumbs" },
  { value: "banner", label: "Banners" },
  { value: "caption", label: "Captions" },
  { value: "intro", label: "Intros" },
  { value: "outro", label: "Outros" },
  { value: "layout", label: "Layout" },
];

export function CreationPanel() {
  const [customColor, setCustomColor] = useState("#ffffff");
  const [templateName, setTemplateName] = useState("");
  const [templateQuery, setTemplateQuery] = useState("");
  const [templateCategory, setTemplateCategory] =
    useState<TemplateCategoryFilter>("all");
  const [templateMessage, setTemplateMessage] = useState<string | null>(null);
  const projectLayerCount = useEditorStore(
    (state) => state.project.layers.length,
  );
  const savedTemplates = useEditorStore((state) => state.savedTemplates);
  const addTemplate = useEditorStore((state) => state.addTemplate);
  const addSavedTemplate = useEditorStore((state) => state.addSavedTemplate);
  const saveCurrentTimelineAsTemplate = useEditorStore(
    (state) => state.saveCurrentTimelineAsTemplate,
  );
  const removeSavedTemplate = useEditorStore(
    (state) => state.removeSavedTemplate,
  );
  const addSticker = useEditorStore((state) => state.addSticker);
  const brandColors = useEditorStore((state) => state.brandColors);
  const addBrandColor = useEditorStore((state) => state.addBrandColor);
  const applyBrandColorToSelected = useEditorStore(
    (state) => state.applyBrandColorToSelected,
  );
  const showSafeZones = useEditorStore((state) => state.showSafeZones);
  const toggleSafeZones = useEditorStore((state) => state.toggleSafeZones);
  const filteredEditorTemplates = editorTemplates.filter(
    (template) =>
      (templateCategory === "all" || template.category === templateCategory) &&
      matchesTemplateQuery(template, templateQuery),
  );
  const filteredSavedTemplates =
    templateCategory === "all"
      ? savedTemplates.filter((template) =>
          matchesTemplateQuery(template, templateQuery),
        )
      : [];

  function saveTimelineTemplate() {
    const result = saveCurrentTimelineAsTemplate(templateName);
    if (!result.saved) {
      setTemplateMessage(
        "Add at least one visible layer before saving a template.",
      );
      return;
    }

    setTemplateName("");
    setTemplateMessage(
      `${result.templateName} saved with ${result.layerCount} ${result.layerCount === 1 ? "layer" : "layers"}.`,
    );
  }

  function applySavedTemplate(templateId: string) {
    const result = addSavedTemplate(templateId);
    if (result.addedLayerCount === 0) {
      setTemplateMessage(
        "Template could not be added because its media is not available in this project.",
      );
      return;
    }

    setTemplateMessage(
      savedTemplateApplyMessage(
        result.addedLayerCount,
        result.missingAssetCount,
      ),
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-3 overflow-hidden rounded-md border border-border bg-background p-2">
      <div className="flex min-w-0 items-center justify-between gap-2 overflow-hidden">
        <h3 className="min-w-0 truncate text-sm font-medium">Create</h3>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={toggleSafeZones}
        >
          {showSafeZones ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
          Safe
        </Button>
      </div>
      <Tabs
        defaultValue="templates"
        className="w-full max-w-full min-w-0 overflow-hidden"
      >
        <TabsList className="flex h-auto w-full max-w-full min-w-0 flex-wrap gap-1 overflow-hidden bg-muted p-1">
          <TabsTrigger
            value="templates"
            className="min-w-0 flex-1 px-1 py-1 text-xs"
          >
            <BadgePlus className="size-3.5 shrink-0" />
          </TabsTrigger>
          <TabsTrigger value="starters" className="min-w-0 flex-1 px-1 py-1">
            <Rocket className="size-3.5 shrink-0" />
          </TabsTrigger>
          <TabsTrigger value="layouts" className="min-w-0 flex-1 px-1 py-1">
            <LayoutDashboard className="size-3.5 shrink-0" />
          </TabsTrigger>
          <TabsTrigger value="stickers" className="min-w-0 flex-1 px-1 py-1">
            <Shapes className="size-3.5 shrink-0" />
          </TabsTrigger>
          <TabsTrigger value="brand" className="min-w-0 flex-1 px-1 py-1">
            <Palette className="size-3.5 shrink-0" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-2 space-y-2">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="Template name"
              aria-label="Template name"
            />
            <Button
              size="sm"
              onClick={saveTimelineTemplate}
              disabled={projectLayerCount === 0}
            >
              <Save className="size-4" />
              Save
            </Button>
          </div>
          {templateMessage ? (
            <div className="rounded-md border border-border p-2 text-xs text-muted-foreground">
              {templateMessage}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="min-w-0 flex-1 basis-36"
              value={templateQuery}
              onChange={(event) => setTemplateQuery(event.target.value)}
              placeholder="Search templates"
            />
            <Select
              value={templateCategory}
              onValueChange={(value) =>
                setTemplateCategory(value as TemplateCategoryFilter)
              }
            >
              <SelectTrigger className="h-9 w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templateCategoryFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filteredSavedTemplates.map((template) => (
            <div
              key={template.id}
              className="grid grid-cols-[1fr_auto] gap-1 rounded-md border border-border p-1"
            >
              <button
                className="p-1 text-left text-sm"
                onClick={() => applySavedTemplate(template.id)}
              >
                <span className="font-medium">{template.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {template.description}
                </span>
              </button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeSavedTemplate(template.id)}
                aria-label={`Remove ${template.label}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {filteredEditorTemplates.map((template) => (
            <button
              key={template.id}
              className="w-full rounded-md border border-border p-2 text-left text-sm transition hover:border-primary/70"
              onClick={() => addTemplate(template.id)}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{template.label}</span>
                <Badge variant="outline">{template.category}</Badge>
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {template.description}
              </span>
              <span className="mt-2 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                <span>{template.preview.layers} layers</span>
                <span>{template.preview.duration}</span>
                <span>{template.preview.bestFor}</span>
              </span>
            </button>
          ))}
          {filteredSavedTemplates.length === 0 &&
          filteredEditorTemplates.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
              No templates found.
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="starters" className="mt-2">
          <StarterWorkflowPanel />
        </TabsContent>
        <TabsContent value="layouts" className="mt-2">
          <div className="space-y-3">
            <SocialFormatPanel />
            <MediaLayoutPanel />
          </div>
        </TabsContent>
        <TabsContent value="stickers" className="mt-2 grid grid-cols-2 gap-2">
          {stickerPresets.map((sticker) => (
            <button
              key={sticker.id}
              className="rounded-md px-2 py-3 text-xs font-black transition hover:scale-[1.02]"
              style={{ color: sticker.fill, background: sticker.background }}
              onClick={() => addSticker(sticker.id)}
            >
              {sticker.text}
            </button>
          ))}
        </TabsContent>
        <TabsContent value="brand" className="mt-2 space-y-3">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              type="color"
              value={customColor}
              onChange={(event) => setCustomColor(event.target.value)}
            />
            <Button size="sm" onClick={() => addBrandColor(customColor)}>
              Add
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Apply to selected
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {brandColors.map((color) => (
                <button
                  key={color}
                  className="h-8 rounded-md border border-border"
                  style={{ background: color }}
                  onClick={() => applyBrandColorToSelected(color)}
                  aria-label={`Apply ${color}`}
                />
              ))}
            </div>
          </div>
          <BrandKitPanel />
          <BrandTypographyPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function matchesTemplateQuery(
  template: {
    label: string;
    description: string;
    category?: string;
    preview?: { bestFor: string };
  },
  query: string,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    template.label,
    template.description,
    template.category ?? "",
    template.preview?.bestFor ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function savedTemplateApplyMessage(
  addedLayerCount: number,
  missingAssetCount: number,
) {
  const layerLabel = addedLayerCount === 1 ? "layer" : "layers";
  if (missingAssetCount === 0)
    return `${addedLayerCount} ${layerLabel} added from template.`;

  return `${addedLayerCount} ${layerLabel} added. ${missingAssetCount} media-backed ${missingAssetCount === 1 ? "layer was" : "layers were"} skipped.`;
}
