"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TopBar } from "@/features/dx/components/friday/top-bar";
import { ChatInput } from "@/features/dx/components/friday/chat-input";
import {
  EmptyState,
  MessageList,
  type MessageSection,
} from "@/features/dx/components/friday/message-list";
import { RightPane, type RightPaneTab } from "@/features/dx/components/friday/right-pane";
import { Minimap } from "@/features/dx/components/friday/minimap";
import { streamAssistantReply } from "@/lib/friday/ai";
import { newId } from "@/lib/friday/utils";
import type { Message } from "@/features/dx/components/friday/types";
import { loadFileSystem, saveFileSystem, type FileSystemState } from "@/lib/friday/file-system";
import type { Attachment } from "@/features/dx/components/friday/attachment-chip";
import { getAllModels, type ZenModel } from "@/lib/friday/models";

export function FridayChatShell({
  onModelPickerOpenChange,
}: { onModelPickerOpenChange?: (open: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [rightPane, setRightPane] = useState<RightPaneTab>("menu");
  const [rightPaneExpanded, setRightPaneExpanded] = useState(true);
  const allModels = getAllModels();
  const [model, setModel] = useState<ZenModel>(allModels[0]);
  const [sections, setSections] = useState<MessageSection[]>([]);
  const [fileSystem, setFileSystem] = useState<FileSystemState>(() => loadFileSystem());
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<{ aborted: boolean }>({ aborted: false });

  useEffect(() => {
    if (fileSystem.rootIds.length > 0) saveFileSystem(fileSystem);
  }, [fileSystem]);

  const handleSend = useCallback(
    async (text: string, attachments: Attachment[]) => {
      const attachmentNote =
        attachments.length > 0
          ? `\n\n_Attached: ${attachments
              .map((a) => `${a.name}${a.meta ? ` (${a.meta})` : ""}`)
              .join(", ")}_`
          : "";
      const fullContent = text + attachmentNote;
      const userMsg: Message = {
        id: newId(),
        role: "user",
        content: fullContent,
        createdAt: Date.now(),
      };
      const assistantId = newId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        model: model.id,
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreamingId(assistantId);
      abortRef.current = { aborted: false };

      try {
        for await (const token of streamAssistantReply(fullContent, messages, {
          providerId: model.providerId,
          modelId: model.id,
        })) {
          if (abortRef.current.aborted) break;
          await new Promise<void>((resolve) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)),
            );
            requestAnimationFrame(() => resolve());
          });
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
        );
        setStreamingId(null);
      }
    },
    [model, messages],
  );

  const handleStop = useCallback(() => {
    abortRef.current.aborted = true;
    setStreamingId(null);
  }, []);

  const handleRegenerate = useCallback(async () => {
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;
    const lastUser = messages[lastUserIdx];
    if (!lastUser) return;
    setMessages((prev) => {
      const next = [...prev];
      while (next.length && next[next.length - 1].role !== "user") {
        next.pop();
      }
      return next;
    });
    await handleSend(lastUser.content, []);
  }, [messages, handleSend]);

  return (
    <div className="h-full w-full bg-background text-foreground flex overflow-hidden selection:bg-purple-500/30 selection:text-white transition-colors duration-300">
      <div className="flex h-full w-full overflow-hidden">
        <main className="relative flex h-full min-w-0 flex-1 flex-col">
          <TopBar
            title="Find paper"
            rightPane={rightPane}
            setRightPane={(t) => {
              setRightPane(t);
              if (t !== "menu") setRightPaneExpanded(true);
            }}
          />
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto scrollbar-thin">
            <Minimap sections={sections} scrollContainerRef={scrollRef} />

            {messages.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pb-44 pt-4"
                >
                  <MessageList
                    messages={messages}
                    streamingId={streamingId}
                    onRegenerate={handleRegenerate}
                    onSectionsChange={setSections}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <EmptyState onPrompt={(t: string) => handleSend(t, [])} />
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
            <div className="pointer-events-auto mx-auto w-full max-w-4xl bg-gradient-to-t from-background via-background/95 to-transparent px-2 sm:px-6 pb-4 sm:pb-6 pt-4">
              <ChatInput
                onSend={handleSend}
                onStop={handleStop}
                streaming={!!streamingId}
                model={model}
                onModelChange={setModel}
                onMenuOpenChange={onModelPickerOpenChange}
              />
            </div>
          </div>
        </main>

        <RightPane
          tab={rightPane}
          setTab={setRightPane}
          expanded={rightPaneExpanded}
          setExpanded={setRightPaneExpanded}
          fileSystem={fileSystem}
          setFileSystem={setFileSystem}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
        />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
