"use client";

import type { EditorProject, TimelineLayer } from "@/lib/editor/types";
import type {
  EditorDocumentSnapshot,
  EditorState,
  EditorStoreSet,
} from "@/features/editor/state/editor-store-types";

export type EditorProjectCommit = (mutator: (project: EditorProject) => EditorProject) => void;

export type EditorLayerWriters = {
  addLayer: (layer: TimelineLayer) => void;
  addLayers: (layers: TimelineLayer[]) => void;
};

export function createEditorDocumentSnapshot(
  state: Pick<
    EditorState,
    "project" | "mediaAssets" | "favoriteMediaAssetIds" | "lastRemovedMedia"
  >,
): EditorDocumentSnapshot {
  return {
    project: state.project,
    mediaAssets: state.mediaAssets,
    favoriteMediaAssetIds: state.favoriteMediaAssetIds,
    lastRemovedMedia: state.lastRemovedMedia,
  };
}

export function createEditorProjectCommit(set: EditorStoreSet): EditorProjectCommit {
  return (mutator) => {
    set((state) => ({
      project: mutator(state.project),
      past: [...state.past, createEditorDocumentSnapshot(state)].slice(-40),
      future: [],
    }));
  };
}

export function createEditorLayerWriters(set: EditorStoreSet, commit: EditorProjectCommit): EditorLayerWriters {
  return {
    addLayer: (layer) => {
      commit((project) => ({
        ...project,
        duration: Math.max(project.duration, layer.start + layer.duration),
        layers: [...project.layers, layer],
        updatedAt: new Date().toISOString(),
      }));
      set({ selectedLayerId: layer.id, selectedLayerIds: [layer.id] });
    },
    addLayers: (layers) => {
      if (layers.length === 0) return;

      commit((project) => ({
        ...project,
        duration: Math.max(project.duration, ...layers.map((layer) => layer.start + layer.duration)),
        layers: [...project.layers, ...layers],
        updatedAt: new Date().toISOString(),
      }));

      set({
        selectedLayerId: layers.at(-1)?.id ?? null,
        selectedLayerIds: layers.map((layer) => layer.id),
      });
    },
  };
}
