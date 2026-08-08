"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { ChevronDownIcon, PenToolIcon } from "@/components/friday-icons";
import type { Message } from "@/features/dx/components/friday/types";
import {
  Cursor,
  MessageActions,
  PlateMarkdown,
  ThinkingDots,
} from "@/features/dx/components/friday/markdown";

export type MessageSection = {
  id: string;
  label: string;
  messageId: string;
  preview: string;
};

type MessageListProps = {
  messages: Message[];
  streamingId?: string | null;
  onRegenerate?: () => void;
  onSectionsChange?: (sections: MessageSection[]) => void;
};

export function MessageList({
  messages,
  streamingId,
  onRegenerate,
  onSectionsChange,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamingId]);

  useEffect(() => {
    if (!onSectionsChange) return;
    const sections: MessageSection[] = messages
      .filter((m) => m.role === "assistant" && m.content)
      .map((m, i) => {
        const headingMatch = m.content.match(/^#{1,4}\s+(.+?)$/m);
        const boldMatch = m.content.match(/^\*\*(.+?)\*\*/m);
        const label = (headingMatch?.[1] ?? boldMatch?.[1] ?? `Message ${i + 1}`)
          .slice(0, 40)
          .replace(/[*_`]/g, "");
        const preview = m.content.replace(/[*_`#>\-\[\]]/g, "").slice(0, 160);
        return { id: m.id, label, messageId: m.id, preview };
      });
    onSectionsChange(sections);
  }, [messages, onSectionsChange]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-12 md:px-20">
      <AnimatePresence initial={false}>
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            isStreaming={streamingId === m.id}
            isLast={i === messages.length - 1}
            onRegenerate={m.role === "assistant" ? onRegenerate : undefined}
          />
        ))}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  );
}

export function EmptyState({ onPrompt }: { onPrompt: (text: string) => void }) {
  const cards = [
    {
      title: "Create",
      desc: "a sleek landing page with Tailwind",
      tone: "from-foreground/15 to-foreground/5",
    },
    {
      title: "Write",
      desc: "a debounce hook in TypeScript",
      tone: "from-foreground/15 to-foreground/5",
    },
    {
      title: "Explain",
      desc: "React Server Components simply",
      tone: "from-foreground/15 to-foreground/5",
    },
    {
      title: "Brainstorm",
      desc: "names for a developer tool",
      tone: "from-foreground/15 to-foreground/5",
    },
  ];

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-4 text-center sm:px-6">
      <motion.div initial={{ scale: 0.6, opacity: 0, y: 12 }} className="relative mb-5">
        <motion.div
          className="absolute inset-0 rounded-2xl bg-foreground/10 opacity-50 blur-2xl"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 12, 0],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-background shadow-xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M12 3v3M12 18v3M5 12H2M22 12h-3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-balance bg-gradient-to-br from-foreground to-foreground-muted bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl"
      >
        How can I help you today?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-2 max-w-md text-balance text-[13.5px] text-muted-foreground"
      >
        Ask anything &mdash; code, design, writing, or just chat. I&apos;ll respond in real time.
      </motion.p>

      <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {cards.map((c, i) => (
          <motion.button
            key={c.title}
            onClick={() => onPrompt(`${c.title} ${c.desc}`)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15 + i * 0.05,
              type: "spring",
              stiffness: 300,
              damping: 26,
            }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface p-3.5 text-left shadow-sm transition-colors hover:bg-surface-2"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-foreground/10 text-foreground">
              <span className="text-base">&diams;</span>
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-foreground">
                {c.title} <span className="font-normal text-muted-foreground">{c.desc}</span>
              </div>
            </div>
            <motion.div
              className="ml-auto text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
  isLast,
  onRegenerate,
}: {
  message: Message;
  isStreaming?: boolean;
  isLast?: boolean;
  onRegenerate?: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      data-section-id={message.id}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="group/message w-full py-6"
    >
      {isUser ? (
        <div className="flex justify-end">
          <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl bg-bubble-user px-4 py-2.5 text-[14.5px] leading-relaxed text-bubble-user-fg shadow-sm">
            {message.content}
          </div>
        </div>
      ) : (
        <div className="relative">
          {!isLast && (
            <div className="hidden lg:flex absolute -top-3 right-0 items-center gap-1 bg-surface-1 px-2 py-1 rounded-md text-[11px] text-foreground-muted cursor-pointer hover:bg-surface-2 transition-colors">
              <PenToolIcon className="h-3 w-3" />
              Open in
              <ChevronDownIcon className="h-3 w-3" />
            </div>
          )}
          <div className="text-[14px] sm:text-[15px] leading-relaxed text-foreground-muted">
            {message.content ? (
              <>
                <PlateMarkdown markdown={message.content} />
                {isStreaming && <Cursor />}
              </>
            ) : (
              <ThinkingDots />
            )}
          </div>
          {!isStreaming && message.content && (
            <MessageActions content={message.content} onRegenerate={onRegenerate} />
          )}
        </div>
      )}
    </motion.div>
  );
}
