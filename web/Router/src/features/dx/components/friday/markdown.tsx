"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  RefreshIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@/components/friday-icons";
import { cn } from "@/lib/friday/utils";

export { PlateMarkdown } from "@/features/dx/components/friday/plate-viewer";

type MessageActionsProps = {
  content: string;
  onRegenerate?: () => void;
};

export function MessageActions({ content, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-2 flex items-center gap-1"
    >
      <ActionButton onClick={copy} label={copied ? "Copied" : "Copy"} active={copied}>
        <AnimateIcon swapped={copied}>
          <CopyIcon className="h-3.5 w-3.5" />
          <CheckIcon className="h-3.5 w-3.5" />
        </AnimateIcon>
      </ActionButton>
      <ActionButton
        onClick={() => setLiked((p) => (p === "up" ? null : "up"))}
        label="Good response"
        active={liked === "up"}
      >
        <ThumbsUpIcon className="h-3.5 w-3.5" />
      </ActionButton>
      <ActionButton
        onClick={() => setLiked((p) => (p === "down" ? null : "down"))}
        label="Bad response"
        active={liked === "down"}
      >
        <ThumbsDownIcon className="h-3.5 w-3.5" />
      </ActionButton>
      {onRegenerate && (
        <ActionButton onClick={onRegenerate} label="Regenerate">
          <RefreshIcon className="h-3.5 w-3.5" />
        </ActionButton>
      )}
    </motion.div>
  );
}

function ActionButton({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
        active && "bg-surface-2 text-foreground",
      )}
    >
      {children}
    </motion.button>
  );
}

function AnimateIcon({
  children,
  swapped,
}: {
  children: [React.ReactNode, React.ReactNode];
  swapped: boolean;
}) {
  return (
    <span className="relative grid h-3.5 w-3.5 place-items-center">
      <motion.span
        animate={{
          opacity: swapped ? 0 : 1,
          scale: swapped ? 0.6 : 1,
          rotate: swapped ? -90 : 0,
        }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 grid place-items-center"
      >
        {children[0]}
      </motion.span>
      <motion.span
        animate={{
          opacity: swapped ? 1 : 0,
          scale: swapped ? 1 : 0.6,
          rotate: swapped ? 0 : 90,
        }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 grid place-items-center"
      >
        {children[1]}
      </motion.span>
    </span>
  );
}

export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-foreground-muted" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-foreground-muted" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-foreground-muted" />
    </div>
  );
}

export function Cursor() {
  return (
    <motion.span
      aria-hidden
      className="ml-0.5 inline-block h-4 w-[1.5px] -mb-0.5 bg-foreground"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}
