"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  AtIcon,
  CalendarIcon,
  CameraIcon,
  CodeIcon,
  GlobeIcon,
  HashIcon,
  ImageIcon,
  LinkIcon,
  MessageSquareIcon,
  PaperclipIcon,
  PenToolIcon,
  SparkleIcon,
  TerminalIcon,
  VideoIcon,
} from "@/components/friday-icons";
import { cn } from "@/lib/friday/utils";

export type SlashCommand = {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  group: string;
  keywords?: string[];
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "ask",
    label: "Ask",
    desc: "Ask a question",
    icon: <MessageSquareIcon className="h-4 w-4" />,
    group: "Actions",
    keywords: ["question", "chat"],
  },
  {
    id: "edit",
    label: "Edit",
    desc: "Edit the selected file",
    icon: <PenToolIcon className="h-4 w-4" />,
    group: "Actions",
    keywords: ["change", "update"],
  },
  {
    id: "run",
    label: "Run",
    desc: "Run a command in terminal",
    icon: <TerminalIcon className="h-4 w-4" />,
    group: "Actions",
    keywords: ["terminal", "shell"],
  },
  {
    id: "search",
    label: "Search",
    desc: "Search the web",
    icon: <GlobeIcon className="h-4 w-4" />,
    group: "Actions",
  },
  {
    id: "browse",
    label: "Browse",
    desc: "Open a browser session",
    icon: <GlobeIcon className="h-4 w-4" />,
    group: "Actions",
  },
  {
    id: "image",
    label: "Image",
    desc: "Generate or attach an image",
    icon: <ImageIcon className="h-4 w-4" />,
    group: "Media",
  },
  {
    id: "video",
    label: "Video",
    desc: "Generate a video",
    icon: <VideoIcon className="h-4 w-4" />,
    group: "Media",
  },
  {
    id: "code",
    label: "Code",
    desc: "Open the code editor",
    icon: <CodeIcon className="h-4 w-4" />,
    group: "Tools",
  },
  {
    id: "schedule",
    label: "Schedule",
    desc: "Schedule a task",
    icon: <CalendarIcon className="h-4 w-4" />,
    group: "Tools",
  },
  {
    id: "summary",
    label: "Summary",
    desc: "Summarize the chat",
    icon: <SparkleIcon className="h-4 w-4" />,
    group: "Actions",
  },
  {
    id: "plan",
    label: "Plan",
    desc: "Build a step-by-step plan",
    icon: <HashIcon className="h-4 w-4" />,
    group: "Actions",
  },
  {
    id: "link",
    label: "Link",
    desc: "Paste a URL for context",
    icon: <LinkIcon className="h-4 w-4" />,
    group: "Media",
  },
];

export const PLUGINS: SlashCommand[] = [
  {
    id: "plugin-gh",
    label: "GitHub",
    desc: "Connect to a GitHub repo",
    icon: <CodeIcon className="h-4 w-4" />,
    group: "Plugins",
  },
  {
    id: "plugin-figma",
    label: "Figma",
    desc: "Import from Figma",
    icon: <PenToolIcon className="h-4 w-4" />,
    group: "Plugins",
  },
  {
    id: "plugin-notion",
    label: "Notion",
    desc: "Search Notion docs",
    icon: <HashIcon className="h-4 w-4" />,
    group: "Plugins",
  },
  {
    id: "plugin-slack",
    label: "Slack",
    desc: "Send to Slack",
    icon: <MessageSquareIcon className="h-4 w-4" />,
    group: "Plugins",
  },
];

const TABS: { id: "commands" | "plugins" | "files"; label: string }[] = [
  { id: "commands", label: "Commands" },
  { id: "plugins", label: "Plugins" },
  { id: "files", label: "Files" },
];

type SlashMenuProps = {
  open: boolean;
  query: string;
  onSelect: (cmd: SlashCommand) => void;
  onClose: () => void;
};

export function SlashMenu({ open, query, onSelect, onClose }: SlashMenuProps) {
  const [tab, setTab] = useState<"commands" | "plugins" | "files">("commands");
  const ref = useRef<HTMLDivElement>(null);

  const pool = tab === "commands" ? SLASH_COMMANDS : tab === "plugins" ? PLUGINS : MOCK_FILES;

  const filtered = pool.filter((c) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      c.label.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q) ||
      c.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  });

  if (!open) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[360px] max-w-[92vw] origin-bottom-left overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
    >
      <div className="flex items-center gap-1 px-2 pt-2">
        {TABS.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative px-3 py-1.5 text-[12px] font-medium transition-colors rounded-md",
              tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === t.id && (
              <motion.div
                layoutId="slash-tab"
                className="absolute inset-0 rounded-md bg-surface-2"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </motion.button>
        ))}
        <div className="ml-auto pr-1 text-[10.5px] text-muted-foreground font-mono">
          &uarr;&darr; &crarr;
        </div>
      </div>

      <SlashMenuList
        key={`${tab}-${query}`}
        filtered={filtered}
        onSelect={onSelect}
        onClose={onClose}
      />
    </motion.div>
  );
}

function SlashMenuList({
  filtered,
  onSelect,
  onClose,
}: {
  filtered: SlashCommand[];
  onSelect: (cmd: SlashCommand) => void;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, Math.max(0, filtered.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      }
      if (e.key === "Enter" && filtered[active]) {
        e.preventDefault();
        onSelect(filtered[active]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, active, onClose, onSelect]);

  return (
    <div className="max-h-[280px] overflow-y-auto p-1 custom-scrollbar">
      {filtered.length === 0 ? (
        <div className="grid place-items-center py-6 text-[12px] text-muted-foreground">
          No results
        </div>
      ) : (
        filtered.map((c, i) => (
          <motion.button
            key={c.id}
            onClick={() => onSelect(c)}
            onMouseEnter={() => setActive(i)}
            whileHover={{ x: 2 }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
              active === i ? "bg-surface-2 text-foreground" : "text-foreground-muted",
            )}
          >
            <div
              className={cn(
                "grid h-7 w-7 place-items-center rounded-md",
                active === i
                  ? "bg-foreground text-background"
                  : "bg-surface-2 text-foreground-muted",
              )}
            >
              {c.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{c.label}</div>
              <div className="truncate text-[11.5px] text-muted-foreground">{c.desc}</div>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {c.group}
            </span>
          </motion.button>
        ))
      )}
    </div>
  );
}

const MOCK_FILES: SlashCommand[] = [
  {
    id: "f1",
    label: "build_htr.py",
    desc: "HTR training script",
    icon: <CodeIcon className="h-4 w-4 text-blue-500" />,
    group: "Files",
  },
  {
    id: "f2",
    label: "train.json",
    desc: "Training config",
    icon: <CodeIcon className="h-4 w-4 text-amber-500" />,
    group: "Files",
  },
  {
    id: "f3",
    label: "config.yaml",
    desc: "App config",
    icon: <CodeIcon className="h-4 w-4 text-emerald-500" />,
    group: "Files",
  },
  {
    id: "f4",
    label: "README.md",
    desc: "Project readme",
    icon: <CodeIcon className="h-4 w-4 text-zinc-500" />,
    group: "Files",
  },
];

const SPECIAL_CHARS: { char: string; name: string; keywords?: string[] }[] = [
  { char: "\u2192", name: "Right arrow", keywords: ["arrow", "to"] },
  { char: "\u2190", name: "Left arrow" },
  { char: "\u2191", name: "Up arrow" },
  { char: "\u2193", name: "Down arrow" },
  { char: "\u2605", name: "Star" },
  { char: "\u2713", name: "Check" },
  { char: "\u2717", name: "Cross" },
  { char: "\u2022", name: "Bullet" },
  { char: "\u00B7", name: "Middle dot" },
  { char: "\u2026", name: "Ellipsis" },
  { char: "\u2014", name: "Em dash" },
  { char: "\u2013", name: "En dash" },
  { char: "\u201C", name: "Left quote" },
  { char: "\u201D", name: "Right quote" },
  { char: "\u2018", name: "Left single quote" },
  { char: "\u2019", name: "Right single quote" },
  { char: "\u00A9", name: "Copyright" },
  { char: "\u00AE", name: "Registered" },
  { char: "\u2122", name: "Trademark" },
  { char: "\u00B0", name: "Degree" },
  { char: "\u00B1", name: "Plus-minus" },
  { char: "\u00D7", name: "Multiply" },
  { char: "\u00F7", name: "Divide" },
  { char: "\u221E", name: "Infinity" },
  { char: "\u2248", name: "Almost equal" },
  { char: "\u2260", name: "Not equal" },
  { char: "\u2264", name: "Less or equal" },
  { char: "\u2265", name: "Greater or equal" },
  { char: "\u2211", name: "Sum" },
  { char: "\u220F", name: "Product" },
  { char: "\u222B", name: "Integral" },
  { char: "\u03C0", name: "Pi" },
  { char: "\u03A3", name: "Sigma" },
];

export function SpecialCharMenu({
  open,
  onSelect,
  onClose,
}: {
  open: boolean;
  onSelect: (c: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");

  const filtered = SPECIAL_CHARS.filter(
    (c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.char.includes(q),
  );

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[320px] max-w-[92vw] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
    >
      <div className="border-b border-border p-2">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search special characters\u2026"
            className="w-full rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-[12px] outline-none focus:border-accent"
          />
        </div>
      </div>
      <SpecialCharList key={q} filtered={filtered} onSelect={onSelect} onClose={onClose} />
    </motion.div>
  );
}

function SpecialCharList({
  filtered,
  onSelect,
  onClose,
}: {
  filtered: { char: string; name: string }[];
  onSelect: (c: string) => void;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, Math.max(0, filtered.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      }
      if (e.key === "Enter" && filtered[active]) {
        e.preventDefault();
        onSelect(filtered[active].char);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, active, onClose, onSelect]);

  return (
    <div className="grid max-h-[280px] grid-cols-6 gap-1 overflow-y-auto p-2 custom-scrollbar">
      {filtered.length === 0 ? (
        <div className="col-span-6 grid place-items-center py-6 text-[12px] text-muted-foreground">
          No results
        </div>
      ) : (
        filtered.map((c, i) => (
          <motion.button
            key={`${c.char}-${i}`}
            onClick={() => onSelect(c.char)}
            onMouseEnter={() => setActive(i)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "relative grid aspect-square place-items-center rounded-md text-lg transition-colors",
              active === i
                ? "bg-foreground text-background"
                : "bg-surface-2 text-foreground hover:bg-surface-2",
            )}
            title={c.name}
          >
            {c.char}
            {active === i && (
              <motion.span
                layoutId="char-tip"
                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background"
              >
                {c.name}
              </motion.span>
            )}
          </motion.button>
        ))
      )}
    </div>
  );
}

const MENTIONS = [
  { id: "gpt", label: "GPT-4o", desc: "OpenAI \u00B7 multimodal" },
  { id: "claude", label: "Claude 3.5", desc: "Anthropic \u00B7 reasoning" },
  { id: "gemini", label: "Gemini 1.5", desc: "Google \u00B7 long context" },
  { id: "llama", label: "Llama 3.1", desc: "Meta \u00B7 open weights" },
  { id: "ultra", label: "ULTRA", desc: "Max effort mode" },
];

export function MentionMenu({
  open,
  query,
  onSelect,
  onClose,
}: {
  open: boolean;
  query: string;
  onSelect: (m: { id: string; label: string }) => void;
  onClose: () => void;
}) {
  const filtered = MENTIONS.filter(
    (m) => !query || m.label.toLowerCase().includes(query.toLowerCase()),
  );

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[280px] max-w-[92vw] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
    >
      <div className="px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        Mention a model
      </div>
      <MentionList key={query} filtered={filtered} onSelect={onSelect} onClose={onClose} />
    </motion.div>
  );
}

function MentionList({
  filtered,
  onSelect,
  onClose,
}: {
  filtered: { id: string; label: string; desc: string }[];
  onSelect: (m: { id: string; label: string }) => void;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, Math.max(0, filtered.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      }
      if (e.key === "Enter" && filtered[active]) {
        e.preventDefault();
        onSelect(filtered[active]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, active, onClose, onSelect]);

  return (
    <div className="p-1 max-h-[260px] overflow-y-auto custom-scrollbar">
      {filtered.map((m, i) => (
        <motion.button
          key={m.id}
          onClick={() => onSelect(m)}
          onMouseEnter={() => setActive(i)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
            active === i
              ? "bg-surface-2 text-foreground"
              : "text-foreground-muted hover:bg-surface-2",
          )}
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-[11px] font-semibold text-foreground">
            {m.label.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{m.label}</div>
            <div className="truncate text-[11px] text-muted-foreground">{m.desc}</div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export const PLUS_MENU_ITEMS = [
  {
    id: "upload",
    label: "Upload files",
    desc: "Attach documents or images",
    icon: <PaperclipIcon className="h-4 w-4" />,
  },
  {
    id: "image",
    label: "Add image",
    desc: "Generate or attach",
    icon: <ImageIcon className="h-4 w-4" />,
  },
  {
    id: "camera",
    label: "Take photo",
    desc: "Use your camera",
    icon: <CameraIcon className="h-4 w-4" />,
  },
  {
    id: "video",
    label: "Add video",
    desc: "Attach or generate",
    icon: <VideoIcon className="h-4 w-4" />,
  },
  {
    id: "link",
    label: "Paste link",
    desc: "Add a URL for context",
    icon: <LinkIcon className="h-4 w-4" />,
  },
  {
    id: "schedule",
    label: "Schedule task",
    desc: "Run later",
    icon: <CalendarIcon className="h-4 w-4" />,
  },
  {
    id: "plugin",
    label: "Add plugin",
    desc: "Extend with a plugin",
    icon: <HashIcon className="h-4 w-4" />,
  },
  {
    id: "mention",
    label: "Mention model",
    desc: "Bring another model in",
    icon: <AtIcon className="h-4 w-4" />,
  },
];

export function PlusMenu({
  open,
  onSelect,
  onClose,
}: {
  open: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[300px] max-w-[92vw] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
    >
      <div className="px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        Add to chat
      </div>
      <div className="grid grid-cols-2 gap-1 p-1">
        {PLUS_MENU_ITEMS.map((it) => (
          <motion.button
            key={it.id}
            onClick={() => {
              onSelect(it.id);
              onClose();
            }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-start gap-1 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-2"
          >
            <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
              {it.icon}
            </div>
            <div className="text-[12.5px] font-medium text-foreground">{it.label}</div>
            <div className="text-[10.5px] text-muted-foreground leading-tight">{it.desc}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
