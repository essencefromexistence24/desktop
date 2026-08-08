"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createEngine, detectCapabilities } from "../lib";
import type { LLMChatOptions, LLMEngine, LLMEngineCapabilities, LLMEngineType } from "../types";

export interface UseLLMEngineResult {
  capabilities: LLMEngineCapabilities | null;
  engineType: LLMEngineType | null;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: (modelId: string, forceEngine?: LLMEngineType) => Promise<void>;
  chat: (options: LLMChatOptions) => Promise<string | undefined>;
  unload: () => Promise<void>;
}

export function useLLMEngine(): UseLLMEngineResult {
  const [capabilities, setCapabilities] = useState<LLMEngineCapabilities | null>(null);
  const [engineType, setEngineType] = useState<LLMEngineType | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<LLMEngine | null>(null);

  useEffect(() => {
    detectCapabilities().then(setCapabilities);
  }, []);

  const load = useCallback(async (modelId: string, forceEngine?: LLMEngineType) => {
    setLoading(true);
    setError(null);
    try {
      const engine = await createEngine(forceEngine);
      engineRef.current = engine;
      setEngineType(engine.type);
      await engine.load(modelId);
      setLoaded(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load model";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const chat = useCallback(async (options: LLMChatOptions): Promise<string | undefined> => {
    if (!engineRef.current) {
      throw new Error("Engine not loaded");
    }
    const result = await engineRef.current.chat(options);
    return result?.message;
  }, []);

  const unload = useCallback(async () => {
    await engineRef.current?.exit();
    engineRef.current = null;
    setLoaded(false);
    setEngineType(null);
  }, []);

  return {
    capabilities,
    engineType,
    loaded,
    loading,
    error,
    load,
    chat,
    unload,
  };
}
