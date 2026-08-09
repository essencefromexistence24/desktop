"use client";

import type { Conversation, Message, ModelId } from "@/features/dx/types";
import { DEFAULT_MODEL_ID_VALUE as DEFAULT_MODEL_ID, getModelConfig } from "@/lib/ai/models-config";
import * as React from "react";
import {
  type CompactionConfig,
  compactMessages,
} from "../../../../packages/ai-core/src/tokens/compaction";
import { type ModelProgress, useModelInference } from "./use-model";

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadConversations(): Conversation[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem("dx-conversations");
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem("dx-conversations", JSON.stringify(conversations));
  } catch {}
}

function loadActiveConversationId(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("dx-active-conversation") ?? null;
}

function saveActiveConversationId(id: string | null) {
  if (typeof localStorage === "undefined") return;
  if (id) {
    localStorage.setItem("dx-active-conversation", id);
  } else {
    localStorage.removeItem("dx-active-conversation");
  }
}

function loadSelectedModel(): ModelId {
  if (typeof localStorage === "undefined") return DEFAULT_MODEL_ID;
  return localStorage.getItem("dx-selected-model") || DEFAULT_MODEL_ID;
}

function saveSelectedModel(id: ModelId) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("dx-selected-model", id);
}

export function useChat() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = React.useState<string | null>(null);
  const [selectedModel, setSelectedModelState] = React.useState<ModelId>(DEFAULT_MODEL_ID);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [modelReady, _setModelReady] = React.useState(true);
  const [modelLoading, setModelLoading] = React.useState(false);
  const [modelProgress, setModelProgress] = React.useState<ModelProgress | null>(null);

  React.useEffect(() => {
    setConversations(loadConversations());

    // Check for slug in URL (e.g., /chat/[spaceId]/[chatId])
    if (typeof window !== "undefined") {
      const pathSegments = window.location.pathname.split("/").filter(Boolean);
      const _spaceId = pathSegments[0] === "chat" && pathSegments[1] ? pathSegments[1] : null;
      const slug = pathSegments[0] === "chat" && pathSegments[2] ? pathSegments[2] : null;

      if (slug) {
        setCurrentConversationId(slug);
        saveActiveConversationId(slug);
      } else {
        setCurrentConversationId(loadActiveConversationId());
      }
    } else {
      setCurrentConversationId(loadActiveConversationId());
    }

    setSelectedModelState(loadSelectedModel());
  }, []);
  const modelInference = useModelInference();
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!selectedModel) return;
    setModelLoading(true);
    setModelProgress(null);
    modelInference
      .loadModel(selectedModel, (p) => setModelProgress(p))
      .finally(() => {
        setModelLoading(false);
      });
  }, [selectedModel]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentConversation = React.useMemo(() => {
    if (!currentConversationId) return null;
    return conversations.find((c) => c.id === currentConversationId) ?? null;
  }, [conversations, currentConversationId]);

  const messages = currentConversation?.messages ?? [];

  const setSelectedModel = React.useCallback((id: ModelId) => {
    setSelectedModelState(id);
    saveSelectedModel(id);
  }, []);

  const updateConversation = React.useCallback(
    (id: string, updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === id ? updater(c) : c));
        saveConversations(next);
        return next;
      });
    },
    [],
  );

  const createNewConversation = React.useCallback(
    (spaceId?: string) => {
      const conv: Conversation = {
        id: createId(),
        title: "New chat",
        messages: [],
        modelId: selectedModel,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        spaceId: spaceId,
      };
      setConversations((prev) => {
        const next = [conv, ...prev];
        saveConversations(next);
        return next;
      });
      setCurrentConversationId(conv.id);
      saveActiveConversationId(conv.id);
      return conv;
    },
    [selectedModel],
  );

  const switchConversation = React.useCallback((id: string) => {
    setCurrentConversationId(id);
    saveActiveConversationId(id);
  }, []);

  const deleteConversation = React.useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConversations(next);
      return next;
    });
    setCurrentConversationId((prev) => {
      if (prev === id) {
        const next = null;
        saveActiveConversationId(next);
        return next;
      }
      return prev;
    });
  }, []);

  const clearMessages = React.useCallback(() => {
    if (!currentConversationId) return;
    updateConversation(currentConversationId, (conv) => ({
      ...conv,
      messages: [],
      updatedAt: Date.now(),
      title: "New chat",
    }));
  }, [currentConversationId, updateConversation]);

  const sendMessage = React.useCallback(
    async (content: string) => {
      let convId = currentConversationId;
      let conv = currentConversation;

      if (!convId || !conv) {
        conv = createNewConversation();
        convId = conv.id;
      }

      const userMessage: Message = {
        id: createId(),
        role: "user",
        content,
        createdAt: Date.now(),
      };

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      updateConversation(convId, (c) => ({
        ...c,
        title: c.title === "New chat" ? content.slice(0, 60) : c.title,
        messages: [...c.messages, userMessage, assistantMessage],
        updatedAt: Date.now(),
      }));

      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      setIsGenerating(true);
      const abortController = new AbortController();
      abortRef.current = abortController;

      const previousMessages = [...(conv?.messages ?? []), userMessage];

      // Apply compaction before sending
      const modelCfg = getModelConfig(selectedModel);
      const ctxLen = modelCfg?.contextLength || 8192;
      const compactionConfig: Partial<CompactionConfig> = {
        enabled: true,
        minMessages: 2,
        contextRatio: 0.4,
      };
      const { messages: compactedMessages, compacted } = compactMessages(
        previousMessages,
        ctxLen,
        compactionConfig,
      );
      const msgsToSend = compacted ? compactedMessages : previousMessages;

      let fullContent = "";

      const startTime = Date.now();
      let tokenCount = 0;

      try {
        await modelInference.generate(
          selectedModel,
          msgsToSend,
          (token) => {
            tokenCount++;
            fullContent += token;
            updateConversation(convId!, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: fullContent } : m,
              ),
              updatedAt: Date.now(),
            }));
          },
          () => {
            const durationMs = Date.now() - startTime;
            const speed =
              durationMs > 0 ? Number(((tokenCount / durationMs) * 1000).toFixed(1)) : 0;

            updateConversation(convId!, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessage.id
                  ? {
                      ...m,
                      content: fullContent,
                      metrics: { speed, durationMs, tokenCount },
                    }
                  : m,
              ),
              updatedAt: Date.now(),
            }));
          },
          (err) => {
            const errorContent = `Error: ${err.message}`;
            updateConversation(convId!, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: errorContent } : m,
              ),
              updatedAt: Date.now(),
            }));
          },
          abortController.signal,
        );
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [
      currentConversationId,
      currentConversation,
      selectedModel,
      createNewConversation,
      updateConversation,
      modelInference,
    ],
  );

  const stopGeneration = React.useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
  }, []);

  React.useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      const first = conversations[0];
      setCurrentConversationId(first.id);
      saveActiveConversationId(first.id);
    }
  }, [conversations, currentConversationId]);

  React.useEffect(() => {
    if (!isGenerating) return;
    return () => {
      abortRef.current?.abort();
    };
  }, [isGenerating]);

  return {
    messages,
    isGenerating,
    selectedModel,
    setSelectedModel,
    conversations,
    currentConversationId,
    sendMessage,
    stopGeneration,
    createNewConversation,
    switchConversation,
    deleteConversation,
    clearMessages,
    updateConversation,
    modelReady,
    modelLoading,
    modelProgress,
    modelError: modelInference.error,
    isMock: modelInference.isMock,
  };
}
