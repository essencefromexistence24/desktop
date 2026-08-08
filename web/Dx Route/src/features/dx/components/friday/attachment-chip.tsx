"use client";

import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "@/components/friday-icons";
import { cn } from "@/lib/friday/utils";

export type Attachment = {
  id: string;
  kind: "image" | "file" | "code" | "audio" | "video" | "url";
  name: string;
  meta?: string;
  preview?: string;
  language?: string;
};

const ICON_FOR: Record<Attachment["kind"], string> = {
  image: "\uD83D\uDDBC",
  file: "\uD83D\uDCC4",
  code: "\u2328",
  audio: "\uD83C\uDFB5",
  video: "\uD83C\uDFAC",
  url: "\uD83D\uDD17",
};

const COLOR_FOR: Record<Attachment["kind"], string> = {
  image: "from-pink-500/20 to-rose-500/20 text-rose-500",
  file: "from-blue-500/20 to-cyan-500/20 text-blue-500",
  code: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
  audio: "from-purple-500/20 to-fuchsia-500/20 text-purple-500",
  video: "from-amber-500/20 to-orange-500/20 text-amber-500",
  url: "from-sky-500/20 to-indigo-500/20 text-sky-500",
};

export function AttachmentChips({
  attachments,
  onRemove,
}: {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {attachments.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap gap-1.5 pb-2 pt-1">
            {attachments.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className={cn(
                  "group/chip relative flex items-center gap-1.5 rounded-lg border border-border bg-surface pl-1.5 pr-1 py-1 text-[12px] text-foreground shadow-sm",
                )}
              >
                {a.preview ? (
                  <img src={a.preview} alt={a.name} className="h-5 w-5 rounded object-cover" />
                ) : (
                  <div
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded bg-gradient-to-br text-[10px]",
                      COLOR_FOR[a.kind],
                    )}
                  >
                    {ICON_FOR[a.kind]}
                  </div>
                )}
                <span className="font-medium max-w-[120px] truncate">{a.name}</span>
                {a.meta && <span className="text-[10px] text-muted-foreground">{a.meta}</span>}
                <motion.button
                  type="button"
                  onClick={() => onRemove(a.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="grid h-4 w-4 place-items-center rounded text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  aria-label="Remove attachment"
                >
                  <XIcon className="h-3 w-3" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
