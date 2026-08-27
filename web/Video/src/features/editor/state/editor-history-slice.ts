"use client";

import { createEditorDocumentSnapshot } from "@/features/editor/state/editor-store-core";
import type { EditorProject } from "@/lib/editor/types";
import type {
  EditorState,
  EditorStoreGet,
  EditorStoreSet,
} from "@/features/editor/state/editor-store-types";

type EditorHistorySlice = Pick<EditorState, "undo" | "redo">;

type EditorHistoryDeps = {
  clamp: (value: number, min: number, max: number) => number;
  normalizeProjectTimeline: (project: EditorProject) => EditorProject;
};

export function createEditorHistorySlice(
  set: EditorStoreSet,
  get: EditorStoreGet,
  deps: EditorHistoryDeps,
): EditorHistorySlice {
  return {
    undo: () => {
      const {
        past,
        project,
        mediaAssets,
        favoriteMediaAssetIds,
        lastRemovedMedia,
        future,
        currentTime,
      } = get();
      const previous = past.at(-1);
      if (!previous) return;
      const normalizedProject = deps.normalizeProjectTimeline(previous.project);
      set({
        project: normalizedProject,
        mediaAssets: previous.mediaAssets,
        favoriteMediaAssetIds: previous.favoriteMediaAssetIds,
        lastRemovedMedia: previous.lastRemovedMedia,
        past: past.slice(0, -1),
        future: [
          createEditorDocumentSnapshot({
            project,
            mediaAssets,
            favoriteMediaAssetIds,
            lastRemovedMedia,
          }),
          ...future,
        ],
        selectedLayerId: null,
        selectedLayerIds: [],
        currentTime: deps.clamp(currentTime, 0, normalizedProject.duration),
      });
    },
    redo: () => {
      const {
        future,
        project,
        mediaAssets,
        favoriteMediaAssetIds,
        lastRemovedMedia,
        past,
        currentTime,
      } = get();
      const next = future[0];
      if (!next) return;
      const normalizedProject = deps.normalizeProjectTimeline(next.project);
      set({
        project: normalizedProject,
        mediaAssets: next.mediaAssets,
        favoriteMediaAssetIds: next.favoriteMediaAssetIds,
        lastRemovedMedia: next.lastRemovedMedia,
        past: [
          ...past,
          createEditorDocumentSnapshot({
            project,
            mediaAssets,
            favoriteMediaAssetIds,
            lastRemovedMedia,
          }),
        ].slice(-40),
        future: future.slice(1),
        selectedLayerId: null,
        selectedLayerIds: [],
        currentTime: deps.clamp(currentTime, 0, normalizedProject.duration),
      });
    },
  };
}
