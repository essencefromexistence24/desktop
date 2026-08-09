import { nanoid } from "nanoid";

import { createStarterDocument } from "@/features/editor/document-factory";
import { designPresets } from "@/features/editor/presets";
import type {
  DesignPresetId,
  ProjectDetail,
} from "@/features/editor/types";

const LOCAL_PROJECTS_KEY = "essence-canva:local-projects";
const LOCAL_PROJECTS_CHANGED_EVENT = "essence-canva:local-projects-changed";

export type LocalProjectStore = {
  read: (id: string) => ProjectDetail | null;
  save: (project: ProjectDetail) => boolean;
  remove: (id: string) => boolean;
};

export type LocalProjectCreateInput = {
  presetId?: DesignPresetId;
  width?: number;
  height?: number;
  name?: string;
};

let cachedProjects: ProjectDetail[] | null = null;
let cachedRawProjects: string | null = null;

export function listLocalProjects(): ProjectDetail[] {
  if (typeof window === "undefined") return [];

  try {
    const rawProjects = window.localStorage.getItem(LOCAL_PROJECTS_KEY);

    if (rawProjects === cachedRawProjects) {
      return cachedProjects ?? [];
    }

    cachedRawProjects = rawProjects;

    if (!rawProjects) {
      cachedProjects = [];
      return cachedProjects;
    }

    const parsedProjects = JSON.parse(rawProjects) as unknown;

    if (!Array.isArray(parsedProjects)) {
      cachedProjects = [];
      return cachedProjects;
    }

    cachedProjects = parsedProjects
      .filter((value): value is ProjectDetail => isLocalProject(value))
      .sort((first, second) =>
        second.updatedAt.localeCompare(first.updatedAt),
      );

    return cachedProjects;
  } catch {
    return [];
  }
}

export function readLocalProject(id: string): ProjectDetail | null {
  if (typeof window === "undefined" || !id) return null;

  return listLocalProjects().find((project) => project.id === id) ?? null;
}

export function subscribeToLocalProjects(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(LOCAL_PROJECTS_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(LOCAL_PROJECTS_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function notifyLocalProjectsChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(LOCAL_PROJECTS_CHANGED_EVENT));
}

export function saveLocalProject(project: ProjectDetail): boolean {
  if (typeof window === "undefined") return false;

  try {
    const projects = listLocalProjects().filter(
      (item) => item.id !== project.id,
    );

    window.localStorage.setItem(
      LOCAL_PROJECTS_KEY,
      JSON.stringify([project, ...projects]),
    );

    notifyLocalProjectsChanged();

    return true;
  } catch {
    return false;
  }
}

export function deleteLocalProject(id: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const projects = listLocalProjects().filter((project) => project.id !== id);

    window.localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));

    notifyLocalProjectsChanged();

    return true;
  } catch {
    return false;
  }
}

export function createLocalProject(
  input: LocalProjectCreateInput = {},
): ProjectDetail {
  const presetId = input.presetId ?? "presentation";
  const preset = designPresets.find((item) => item.id === presetId);
  const width = input.width ?? preset?.width ?? 1440;
  const height = input.height ?? preset?.height ?? 900;
  const now = new Date().toISOString();
  const document = createStarterDocument({
    width,
    height,
    presetId,
    name: input.name ?? "Page 1",
  });

  return {
    id: nanoid(),
    name: input.name ?? presetName(presetId),
    width,
    height,
    folderId: null,
    sourceProjectId: null,
    variantProfileId: null,
    variantName: null,
    thumbnail: null,
    publicShareId: null,
    editShareId: null,
    editSharePermission: "view",
    approvalStatus: "draft",
    starred: false,
    deletedAt: null,
    updatedAt: now,
    createdAt: now,
    document,
  };
}

export function duplicateLocalProject(id: string): ProjectDetail | null {
  const source = readLocalProject(id);

  if (!source) return null;

  const now = new Date().toISOString();
  const duplicate: ProjectDetail = {
    ...source,
    id: nanoid(),
    name: `${source.name} copy`,
    sourceProjectId: source.id,
    thumbnail: null,
    publicShareId: null,
    editShareId: null,
    updatedAt: now,
    createdAt: now,
    document: structuredClone(source.document),
  };

  saveLocalProject(duplicate);

  return duplicate;
}

export function toLocalProjectStore(): LocalProjectStore {
  return {
    read: readLocalProject,
    save: saveLocalProject,
    remove: deleteLocalProject,
  };
}

function presetName(presetId: DesignPresetId) {
  const labels: Partial<Record<DesignPresetId, string>> = {
    "instagram-post": "Social post",
    presentation: "Presentation",
    document: "Document",
    whiteboard: "Whiteboard",
    poster: "Poster",
    infographic: "Infographic",
    resume: "Resume",
    "business-card": "Business card",
    flyer: "Flyer",
    banner: "Banner",
    spreadsheet: "Spreadsheet",
    website: "Website",
    "email-template": "Email template",
  };

  return labels[presetId] ?? "Untitled design";
}

function isLocalProject(value: unknown): value is ProjectDetail {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.width === "number" &&
    typeof value.height === "number" &&
    typeof value.updatedAt === "string" &&
    isRecord(value.document) &&
    Array.isArray(value.document.pages)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
