"use client";

import { useEffect, useRef } from "react";

import { useEditorStore } from "@/features/editor/state/editor-store";
import type { TimelineLayer } from "@/lib/editor/types";

export function useCoalescedLayerEdit(layerId: string | null) {
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const pushHistorySnapshot = useEditorStore((state) => state.pushHistorySnapshot);
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    sessionStartedRef.current = false;
  }, [layerId]);

  const update = (patch: Partial<TimelineLayer>) => {
    if (!layerId) return;

    if (!sessionStartedRef.current) {
      pushHistorySnapshot();
      sessionStartedRef.current = true;
    }

    updateLayer(layerId, patch, { history: false });
  };

  const endSession = () => {
    sessionStartedRef.current = false;
  };

  return { update, endSession };
}
