"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircleIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  MicIcon,
  PlusIcon,
  StopIcon,
  XIcon,
} from "@/components/friday-icons";
import { cn, newId } from "@/lib/friday/utils";
import { playClickSound, playUltraSound } from "@/lib/friday/sound";
import { AttachmentChips, type Attachment } from "@/features/dx/components/friday/attachment-chip";
import {
  MentionMenu,
  PlusMenu,
  SlashMenu,
  type SlashCommand,
} from "@/features/dx/components/friday/input-popovers";
import { getAllModels, TIER_LABELS_LIST, type ZenModel, type ModelTier } from "@/lib/friday/models";
import { ScrollArea } from "@/components/friday-ui/scroll-area";
import { Badge } from "@/components/friday-ui/badge";
import { Avatar, AvatarFallback } from "@/components/friday-ui/avatar";
import { Input } from "@/components/friday-ui/input";

const ALL_MODELS = getAllModels();

type ChatInputProps = {
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop?: () => void;
  streaming?: boolean;
  model: ZenModel;
  onModelChange: (m: ZenModel) => void;
  onMenuOpenChange?: (open: boolean) => void;
};

const MAX_HEIGHT = 220;
const ACCESS_COLORS: Record<string, string> = {
  full: "text-[#f97316] hover:bg-[#f97316]/10",
  limited: "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
  read: "text-blue-600 dark:text-blue-400 hover:bg-blue-500/10",
};

export function ChatInput({
  onSend,
  onStop,
  streaming,
  model,
  onModelChange,
  onMenuOpenChange,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [access, setAccess] = useState<"full" | "limited" | "read">("full");
  const [plusOpen, setPlusOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [ultraBurst, setUltraBurst] = useState(0);
  const [ultra, setUltra] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef(false);

  const [expanded, setExpanded] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineH = 24;
    const next = Math.min(el.scrollHeight, MAX_HEIGHT);
    el.style.height = next + "px";
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
    const wantsExpand = el.scrollHeight > lineH + 8;
    if (wantsExpand !== expandedRef.current) {
      expandedRef.current = wantsExpand;
      setExpanded(wantsExpand);
    }
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setAccessOpen(false);
        setPlusOpen(false);
        setSlashOpen(false);
        setMentionOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (onMenuOpenChange) onMenuOpenChange(menuOpen);
  }, [menuOpen, onMenuOpenChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cursor = el.selectionStart ?? value.length;
    const before = value.slice(0, cursor);
    const lastSlash = before.lastIndexOf("/");
    const lastAt = before.lastIndexOf("@");
    if (lastSlash >= 0 && /\s|^/.test(before[lastSlash - 1] ?? "")) {
      const query = before.slice(lastSlash + 1);
      if (!query.includes(" ")) {
        setSlashOpen(true);
        setMentionOpen(false);
        return;
      }
    }
    setSlashOpen(false);
    if (lastAt >= 0 && /\s|^/.test(before[lastAt - 1] ?? "")) {
      const query = before.slice(lastAt + 1);
      if (!query.includes(" ")) {
        setMentionOpen(true);
        return;
      }
    }
    setMentionOpen(false);
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text && attachments.length === 0) return;
    onSend(text, attachments);
    setValue("");
    setAttachments([]);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.style.height = "auto";
        el.focus();
      }
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !slashOpen && !mentionOpen) {
      e.preventDefault();
      submit();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const insertAtCursor = (text: string) => {
    const el = ref.current;
    if (!el) {
      setValue((v) => v + text);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + text + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + text.length;
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newAttachments: Attachment[] = [];
    Array.from(files).forEach((f) => {
      const id = newId();
      if (f.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id,
              kind: "image",
              name: f.name,
              meta: `${(f.size / 1024).toFixed(1)} KB`,
              preview: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(f);
      } else {
        const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
        const kind: Attachment["kind"] = [
          "py",
          "ts",
          "tsx",
          "js",
          "json",
          "yaml",
          "yml",
          "md",
        ].includes(ext)
          ? "code"
          : ["mp3", "wav", "ogg"].includes(ext)
            ? "audio"
            : ["mp4", "webm"].includes(ext)
              ? "video"
              : "file";
        newAttachments.push({
          id,
          kind,
          name: f.name,
          meta: `${(f.size / 1024).toFixed(1)} KB`,
        });
      }
    });
    if (newAttachments.length) setAttachments((p) => [...p, ...newAttachments]);
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const images = items.filter((i) => i.type.startsWith("image/"));
    if (images.length) {
      e.preventDefault();
      images.forEach((i) => {
        const f = i.getAsFile();
        if (f) handleFiles({ 0: f, length: 1, item: () => f } as unknown as FileList);
      });
    }
  };

  const handleUltraToggle = () => {
    const next = !ultra;
    setUltra(next);
    if (next) {
      setUltraBurst((b) => b + 1);
      playUltraSound();
    } else {
      playClickSound();
    }
  };

  const [tier, setTier] = useState<ModelTier>("medium");

  const handleTierChange = (t: ModelTier) => {
    setTier(t);
    if (t === "high") {
      if (!ultra) handleUltraToggle();
    } else {
      if (ultra) handleUltraToggle();
      else playClickSound();
    }
  };

  const modelIndex = ALL_MODELS.findIndex((m) => m.id === model.id);
  const tierIndex = TIER_LABELS_LIST.indexOf(tier);

  const modelState: { row: number; col: number; ultra: boolean } = {
    row: modelIndex >= 0 ? modelIndex : 0,
    col: tierIndex >= 0 ? tierIndex : 1,
    ultra,
  };

  const handleSlotChange = (ms: { row: number; col: number; ultra: boolean }) => {
    const m = ALL_MODELS[ms.row];
    if (m) onModelChange(m);
    const t = TIER_LABELS_LIST[ms.col] as ModelTier | undefined;
    if (t) handleTierChange(t);
  };

  const onSlashSelect = (cmd: SlashCommand) => {
    const el = ref.current;
    if (el) {
      const cursor = el.selectionStart ?? value.length;
      const before = value.slice(0, cursor);
      const lastSlash = before.lastIndexOf("/");
      if (lastSlash >= 0) {
        const next = value.slice(0, lastSlash) + value.slice(cursor);
        setValue(next);
        requestAnimationFrame(() => {
          if (el) {
            el.focus();
            el.selectionStart = el.selectionEnd = lastSlash;
          }
        });
      }
    }
    setSlashOpen(false);
    if (cmd.id === "image" || cmd.id === "video" || cmd.id === "upload" || cmd.id === "camera") {
      fileRef.current?.click();
    } else if (cmd.id === "link") {
      insertAtCursor("https://");
    } else if (cmd.id === "schedule") {
      insertAtCursor("[scheduled for \u2026] ");
    } else if (cmd.id === "summary") {
      insertAtCursor("/summary ");
    } else if (cmd.id === "plan") {
      insertAtCursor("/plan ");
    } else if (cmd.id === "edit") {
      insertAtCursor("/edit ");
    } else if (cmd.id === "run") {
      insertAtCursor("/run ");
    }
  };

  const onMentionSelect = (m: { id: string; label: string }) => {
    const el = ref.current;
    if (el) {
      const cursor = el.selectionStart ?? value.length;
      const before = value.slice(0, cursor);
      const lastAt = before.lastIndexOf("@");
      if (lastAt >= 0) {
        const next = value.slice(0, lastAt) + `@${m.label} ` + value.slice(cursor);
        setValue(next);
        requestAnimationFrame(() => {
          if (el) {
            el.focus();
            const pos = lastAt + m.label.length + 2;
            el.selectionStart = el.selectionEnd = pos;
          }
        });
      }
    }
    setMentionOpen(false);
  };

  return (
    <div className="relative w-full">
      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <AnimatePresence>
        {slashOpen && (
          <SlashMenu
            open={slashOpen}
            query={value.slice(value.lastIndexOf("/") + 1)}
            onSelect={onSlashSelect}
            onClose={() => setSlashOpen(false)}
          />
        )}
        {mentionOpen && (
          <MentionMenu
            open={mentionOpen}
            query={value.slice(value.lastIndexOf("@") + 1)}
            onSelect={onMentionSelect}
            onClose={() => setMentionOpen(false)}
          />
        )}
        {plusOpen && (
          <PlusMenu
            open={plusOpen}
            onSelect={(id) => {
              if (id === "upload" || id === "image" || id === "camera" || id === "video") {
                fileRef.current?.click();
              } else if (id === "link") {
                insertAtCursor("https://");
              } else if (id === "schedule") {
                insertAtCursor("[scheduled] ");
              } else if (id === "mention") {
                insertAtCursor("@");
              } else if (id === "plugin") {
                insertAtCursor("/");
              }
            }}
            onClose={() => setPlusOpen(false)}
          />
        )}
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(2px)" }}
            transition={{ duration: 0.2, type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-[calc(100%+8px)] right-2 sm:right-16 z-50 flex items-end gap-2 origin-bottom-right"
          >
            <ModelSlot
              tierLabels={TIER_LABELS_LIST}
              models={ALL_MODELS}
              modelState={modelState}
              onModelChange={handleSlotChange}
              onUltraToggle={handleUltraToggle}
              ultraBurst={ultraBurst}
              onClose={() => setMenuOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recording && (
          <RecordingBar
            onStop={() => {
              setRecording(false);
              playClickSound();
            }}
          />
        )}
      </AnimatePresence>

      <motion.form
        ref={formRef}
        onSubmit={onSubmit}
        layout
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        animate={{
          boxShadow: focused
            ? "0 0 0 4px rgba(168,85,247,0.10), 0 10px 30px -10px rgba(0,0,0,0.18)"
            : "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px -8px rgba(0,0,0,0.10)",
        }}
        className={cn(
          "relative flex w-full flex-col rounded-2xl border bg-surface p-1.5 sm:p-2 transition-colors",
          focused ? "border-border-strong" : "border-border",
        )}
      >
        <AttachmentChips
          attachments={attachments}
          onRemove={(id) => setAttachments((p) => p.filter((a) => a.id !== id))}
        />

        <div className="relative w-full">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder="Ask for follow-up changes \u2014 try /image, @gpt, or paste a file"
            className={cn(
              "scrollbar-thin w-full resize-none bg-transparent px-3 sm:px-4 pt-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed transition-all",
              expanded ? "pb-2" : "pb-0",
            )}
            style={{
              maxHeight: MAX_HEIGHT,
              minHeight: 40,
              height: 40,
            }}
          />
        </div>

        <motion.div
          layout
          className={cn("flex w-full items-center gap-1 sm:gap-2", expanded ? "mt-0.5" : "mt-0")}
        >
          <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setPlusOpen((p) => !p);
                setSlashOpen(false);
                setMentionOpen(false);
              }}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-md transition-colors",
                plusOpen
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
              aria-label="Add to chat"
            >
              {plusOpen ? <XIcon className="h-4 w-4" /> : <PlusIcon className="h-5 w-5" />}
            </motion.button>

            <div className="relative">
              <motion.button
                type="button"
                onClick={() => setAccessOpen((p) => !p)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                  ACCESS_COLORS[access],
                )}
              >
                <AlertCircleIcon className="h-3.5 w-3.5" />
                {access === "full" ? "Full access" : access === "limited" ? "Limited" : "Read-only"}
                <ChevronDownIcon className="h-3 w-3 opacity-60" />
              </motion.button>
              <AnimatePresence>
                {accessOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 w-44 bg-surface border border-border rounded-lg shadow-xl overflow-hidden p-1 z-30"
                  >
                    {(
                      [
                        { id: "full", label: "Full access", desc: "Read, write, run" },
                        { id: "limited", label: "Limited", desc: "Read, suggest edits" },
                        { id: "read", label: "Read-only", desc: "View only" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setAccess(opt.id);
                          setAccessOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md transition-colors flex flex-col hover:bg-surface-2"
                      >
                        <span className="text-[12.5px] font-medium text-foreground flex items-center gap-2">
                          {opt.label}
                          {access === opt.id && (
                            <span className="ml-auto text-accent">{"\u25CF"}</span>
                          )}
                        </span>
                        <span className="text-[10.5px] text-muted-foreground">{opt.desc}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1 sm:gap-2 pr-1 shrink-0">
            <motion.button
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                menuOpen
                  ? "bg-foreground text-background"
                  : "bg-surface-2 text-foreground-muted hover:bg-surface-2",
              )}
            >
              <span className="flex items-center gap-1.5">
                <span className="truncate max-w-[120px]">{model.label}</span>
                <span className="text-[10px] text-muted-foreground">{model.provider}</span>
              </span>
              {model.badge && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {model.badge}
                </span>
              )}
              <ChevronDownIcon className="h-3.5 w-3.5 ml-0.5 opacity-50" />
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                setRecording((r) => !r);
                playClickSound();
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "hidden sm:grid h-9 w-9 place-items-center rounded-full transition-colors",
                recording
                  ? "bg-red-500 text-white"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
              aria-label="Voice input"
            >
              <MicIcon className="h-4 w-4" />
            </motion.button>

            {streaming ? (
              <motion.button
                type="button"
                onClick={onStop}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background shadow-sm"
                aria-label="Stop generating"
              >
                <StopIcon className="h-3.5 w-3.5" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={!value.trim() && attachments.length === 0}
                initial={false}
                animate={{
                  scale: value.trim() || attachments.length > 0 ? 1 : 0.9,
                  opacity: value.trim() || attachments.length > 0 ? 1 : 0.4,
                }}
                whileHover={value.trim() || attachments.length > 0 ? { scale: 1.06 } : undefined}
                whileTap={value.trim() || attachments.length > 0 ? { scale: 0.94 } : undefined}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background shadow-sm shrink-0"
                aria-label="Send message"
              >
                <ArrowUpIcon className="h-4 w-4" strokeWidth={2.5} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.form>
    </div>
  );
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function RecordingBar({ onStop }: { onStop: () => void }) {
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const bars = useMemo(
    () =>
      Array.from({ length: 32 }).map((_, i) => ({
        h1: `${20 + seededRandom(i * 3) * 20}%`,
        h2: `${10 + seededRandom(i * 3 + 1) * 80}%`,
        h3: `${20 + seededRandom(i * 3 + 2) * 20}%`,
        dur: 0.6 + seededRandom(i * 7) * 0.4,
      })),
    [],
  );

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute inset-0 z-30 flex items-center gap-3 rounded-2xl border border-red-500/40 bg-surface/95 p-3 backdrop-blur"
    >
      <motion.div
        className="h-2.5 w-2.5 rounded-full bg-red-500"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <div className="flex-1 flex items-center justify-center gap-0.5 h-8">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            className="w-0.5 rounded-full bg-red-500"
            animate={{
              height: [b.h1, b.h2, b.h3],
            }}
            transition={{
              duration: b.dur,
              repeat: Infinity,
              delay: i * 0.04,
              ease: "easeInOut",
            }}
            style={{ height: "30%" }}
          />
        ))}
      </div>
      <div className="font-mono text-[12px] tabular-nums text-foreground-muted">
        {format(duration)}
      </div>
      <motion.button
        type="button"
        onClick={onStop}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="grid h-9 w-9 place-items-center rounded-full bg-red-500 text-white"
        aria-label="Stop recording"
      >
        <StopIcon className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}

function ModelSlot({
  tierLabels,
  models,
  modelState,
  onModelChange,
  onUltraToggle,
  ultraBurst,
  onClose,
}: {
  tierLabels: readonly string[];
  models: ZenModel[];
  modelState: { row: number; col: number; ultra: boolean };
  onModelChange: (ms: { row: number; col: number; ultra: boolean }) => void;
  onUltraToggle: () => void;
  ultraBurst: number;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free">("all");

  const filtered = useMemo(
    () =>
      models.filter((m) => {
        if (filter === "free" && m.badge !== "Free") return false;
        if (search) {
          const q = search.toLowerCase();
          return m.label.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
        }
        return true;
      }),
    [models, search, filter],
  );

  const uniqueProviders = useMemo(() => {
    const seen = new Set<string>();
    return models.filter((m) => {
      if (seen.has(m.provider)) return false;
      seen.add(m.provider);
      return true;
    });
  }, [models]);

  const ROWS = filtered.length;
  const COLS = tierLabels.length;
  const ROW_HEIGHT = 36;
  const LABEL_W = 120;
  const THUMB = 24;
  const TRACK_H = ROWS * ROW_HEIGHT;

  const [trackW, setTrackW] = useState(COLS * 120);
  const COL_WIDTH = Math.floor(trackW / COLS);

  const cellCX = (c: number) => COL_WIDTH / 2 + c * COL_WIDTH;
  const cellCY = (r: number) => ROW_HEIGHT / 2 + r * ROW_HEIGHT;

  const [drag, setDrag] = useState({ dx: 0, dy: 0 });
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setTrackW(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);

  const activeFilteredIdx = filtered.findIndex((m) => m.id === models[modelState.row]?.id);
  const fRow = activeFilteredIdx >= 0 ? activeFilteredIdx : 0;

  const baseCX = cellCX(modelState.col);
  const baseCY = cellCY(fRow);
  const center = {
    x: Math.max(THUMB / 2, Math.min(trackW - THUMB / 2, baseCX + drag.dx)),
    y: Math.max(THUMB / 2, Math.min(TRACK_H - THUMB / 2, baseCY + drag.dy)),
  };

  const snapToClosest = () => {
    const col = Math.max(0, Math.min(COLS - 1, Math.round((center.x - COL_WIDTH / 2) / COL_WIDTH)));
    const rowInFiltered = Math.max(
      0,
      Math.min(ROWS - 1, Math.round((center.y - ROW_HEIGHT / 2) / ROW_HEIGHT)),
    );
    const origRow = models.findIndex((m) => m.id === filtered[rowInFiltered]?.id);
    setDrag({ dx: 0, dy: 0 });
    if (origRow >= 0) onModelChange({ ...modelState, row: origRow, col });
    playClickSound();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    setDrag({
      dx: e.clientX - dragRef.current.startX,
      dy: e.clientY - dragRef.current.startY,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    snapToClosest();
    dragRef.current = null;
    setDragging(false);
  };

  const onTrackClick = (e: React.MouseEvent) => {
    if (dragging) return;
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rowInFiltered = Math.max(0, Math.min(ROWS - 1, Math.floor(y / ROW_HEIGHT)));
    const col = Math.max(0, Math.min(COLS - 1, Math.round((x - COL_WIDTH / 2) / COL_WIDTH)));
    const origRow = models.findIndex((m) => m.id === filtered[rowInFiltered]?.id);
    if (origRow >= 0) onModelChange({ ...modelState, row: origRow, col });
    playClickSound();
  };

  const selected = models[modelState.row] ?? models[0];
  const selectedTier =
    selected.tiers[tierLabels[modelState.col] as ModelTier] ?? selected.tiers.low;

  return (
    <div
      className="p-4 bg-surface border border-border rounded-xl shadow-2xl w-[92vw] max-w-[580px] select-none"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="pl-6 h-7 text-[11px]"
          />
        </div>
        <Badge
          variant={filter === "free" ? "active" : "default"}
          onClick={() => setFilter(filter === "free" ? "all" : "free")}
        >
          Free
        </Badge>
        <Badge
          variant={filter === "all" ? "active" : "default"}
          onClick={() => setFilter(filter === "all" ? "free" : "all")}
        >
          All
        </Badge>
      </div>

      <div className="mb-2 pb-2 border-b border-border/60">
        <ScrollArea orientation="horizontal" className="w-full -mx-1 px-1">
          <div className="flex gap-1.5 pb-1 w-max">
            {uniqueProviders.map((p) => {
              const isActive = selected.provider === p.provider;
              return (
                <button
                  key={p.provider}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = models.findIndex((m) => m.id === p.id);
                    if (idx >= 0) onModelChange({ ...modelState, row: idx });
                    playClickSound();
                  }}
                  className="shrink-0 snap-center flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors hover:bg-surface-2"
                >
                  <Avatar
                    size="md"
                    className={cn(
                      "transition-all",
                      isActive && "ring-2 ring-chart-2 ring-offset-1 ring-offset-surface",
                    )}
                  >
                    <AvatarFallback
                      className={cn(
                        "flex items-center justify-center bg-transparent",
                        isActive ? "text-chart-2" : "text-muted-foreground",
                      )}
                    >
                      {p.Icon ? (
                        <p.Icon className="h-4 w-4" />
                      ) : (
                        <span
                          className={cn(
                            "text-[11px] font-bold",
                            isActive ? "text-chart-2" : "text-muted-foreground",
                          )}
                        >
                          {p.provider.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "text-[9px] font-medium truncate max-w-[48px]",
                      isActive ? "text-chart-2" : "text-muted-foreground",
                    )}
                  >
                    {p.provider}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-0.5" style={{ paddingLeft: LABEL_W }}>
            {tierLabels.map((tier, i) => (
              <span
                key={tier}
                className={cn(
                  "text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-center transition-colors",
                  i === modelState.col ? "text-chart-2" : "text-muted-foreground",
                )}
                style={{ width: COL_WIDTH }}
              >
                {tier}
              </span>
            ))}
          </div>

          <ScrollArea className="relative" style={{ height: Math.min(TRACK_H, 300) }}>
            <div className="relative" style={{ height: TRACK_H }}>
              {filtered.map((m, rIdx) => {
                const origIdx = models.findIndex((om) => om.id === m.id);
                const isActive = origIdx === modelState.row;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onModelChange({ ...modelState, row: origIdx });
                      playClickSound();
                    }}
                    className={cn(
                      "absolute left-0 flex items-center pr-1 text-[11px] font-medium cursor-pointer pl-1 text-left transition-colors outline-none whitespace-nowrap",
                      isActive ? "text-chart-2" : "text-muted-foreground hover:text-foreground",
                    )}
                    style={{
                      top: rIdx * ROW_HEIGHT,
                      height: ROW_HEIGHT,
                      width: LABEL_W - 6,
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}

              <div
                ref={trackRef}
                onClick={onTrackClick}
                className="absolute overflow-hidden rounded-lg bg-surface-2/50"
                style={{ left: LABEL_W, top: 0, right: 0, height: TRACK_H }}
              >
                <motion.div
                  className="absolute pointer-events-auto h-[3px] bg-chart-2/60 cursor-pointer"
                  style={{ left: 0, top: center.y, width: center.x }}
                  whileHover={{ scaleY: 2.5, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                />

                {filtered.map((_, rIdx) =>
                  tierLabels.map((_, cIdx) => {
                    const origRow = models.findIndex((om) => om.id === filtered[rIdx]?.id);
                    const isActive = modelState.row === origRow && modelState.col === cIdx;
                    return (
                      <button
                        key={`${rIdx}-${cIdx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (origRow >= 0)
                            onModelChange({ ...modelState, row: origRow, col: cIdx });
                          playClickSound();
                        }}
                        className="absolute grid place-items-center outline-none"
                        style={{
                          left: cIdx * COL_WIDTH,
                          top: rIdx * ROW_HEIGHT,
                          width: COL_WIDTH,
                          height: ROW_HEIGHT,
                        }}
                        aria-label={`${filtered[rIdx]?.label} ${tierLabels[cIdx]}`}
                      >
                        <motion.span
                          className={cn(
                            "block w-1.5 h-1.5 rounded-full",
                            isActive ? "bg-chart-2" : "bg-border",
                          )}
                          animate={
                            isActive
                              ? { scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }
                              : { scale: 1, opacity: 1 }
                          }
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        {isActive && (
                          <motion.span
                            className="absolute w-4 h-4 rounded-full border border-chart-2/30"
                            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </button>
                    );
                  }),
                )}

                <motion.div
                  className="absolute z-20"
                  style={{
                    left: center.x - THUMB / 2,
                    top: center.y - THUMB / 2,
                    width: THUMB,
                    height: THUMB,
                    cursor: dragging ? "grabbing" : "grab",
                    transition: dragging
                      ? "none"
                      : "left 0.22s cubic-bezier(.2,.8,.2,1), top 0.22s cubic-bezier(.2,.8,.2,1)",
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  <motion.div
                    className="w-full h-full rounded-full bg-white border border-border-strong grid place-items-center"
                    animate={dragging ? { scale: 1.12 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-chart-2/60" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div
          className="flex flex-col items-center border-l border-border shrink-0"
          style={{ width: 64, height: Math.min(TRACK_H, 300) + 18 }}
        >
          <span className="text-[9px] sm:text-[10px] font-bold text-chart-2 tracking-widest mb-1">
            ULTRA
          </span>
          <div className="flex-1 flex items-center justify-center w-full">
            <UltraButton
              active={modelState.ultra}
              onClick={onUltraToggle}
              burstKey={ultraBurst}
              height={Math.min(TRACK_H, 300) - 24}
            />
          </div>
          {modelState.ultra && (
            <span className="text-[9px] font-semibold text-chart-2 mt-0.5">
              {tierLabels[modelState.col]}
              <span>
                {" "}
                \u00B7{"$"}
                {selectedTier.pricePer1M.toFixed(2)}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
        <div className="flex items-center gap-3 text-[10.5px] text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground/80">
              ${selectedTier.pricePer1M.toFixed(2)}
            </span>
            /1M tokens
          </span>
          <span className="text-border">|</span>
          <span>
            <span className="font-semibold text-foreground/80">
              {(selectedTier.contextWindow / 1000).toFixed(0)}K
            </span>{" "}
            context
          </span>
          <span className="text-border">|</span>
          <span className="truncate max-w-[120px]">{selected.provider}</span>
        </div>
        <div className="flex items-center gap-2">
          {modelState.ultra && (
            <span className="text-[9px] font-bold text-chart-2 uppercase tracking-wider">
              Max: {selected.maxTier}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            \u2715
          </button>
        </div>
      </div>
    </div>
  );
}

function UltraButton({
  active,
  onClick,
  burstKey,
  height,
}: {
  active: boolean;
  onClick: () => void;
  burstKey: number;
  height: number;
}) {
  const ballSize = 24;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "relative rounded-full border transition-colors overflow-hidden cursor-pointer",
        active ? "bg-chart-2/10 border-chart-2/20" : "bg-surface-2 border-border",
      )}
      style={{ width: 28, height }}
      aria-label="Toggle ULTRA"
    >
      <AnimatePresence>{burstKey > 0 && <ThunderBurst key={burstKey} />}</AnimatePresence>

      {active && (
        <motion.div
          className="absolute left-0 right-0 bottom-0 rounded-full"
          style={{
            background:
              "linear-gradient(to top, var(--color-chart-2), color-mix(in oklab, var(--color-chart-2) 60%, transparent))",
          }}
          animate={{ height: "100%" }}
          initial={{ height: "0%" }}
          transition={{ type: "spring", stiffness: 250, damping: 22 }}
        />
      )}

      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-white dark:bg-gradient-to-br dark:from-chart-2/60 dark:to-chart-2/20 rounded-full border border-border grid place-items-center"
        animate={{ top: active ? 0 : height - ballSize }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <ThunderIcon className="h-3 w-3 text-chart-2" />
      </motion.div>

      {active && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 12px color-mix(in oklab, var(--color-chart-2) 40%, transparent)",
              "0 0 24px color-mix(in oklab, var(--color-chart-2) 60%, transparent)",
              "0 0 12px color-mix(in oklab, var(--color-chart-2) 40%, transparent)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

function ThunderBurst() {
  return (
    <>
      <motion.div
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-chart-2/30 pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.3, opacity: 0.7 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        className="absolute inset-0 rounded-full border border-chart-2/20 pointer-events-none"
      />

      <svg viewBox="0 0 80 200" className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M40 0 L34 80 L46 80 L36 200"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.5"
          fill="color-mix(in oklab, var(--color-chart-2) 40%, transparent)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0.6, 0] }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </svg>

      {[
        { x: 10, y: 30 },
        { x: 70, y: 50 },
        { x: 15, y: 150 },
        { x: 65, y: 170 },
        { x: 50, y: 20 },
        { x: 25, y: 100 },
      ].map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 0.55, delay: 0.05 + i * 0.04 }}
          className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] pointer-events-none"
          style={{ left: p.x, top: p.y }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-full bg-chart-2/10 pointer-events-none"
      />
    </>
  );
}

function ThunderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13 2 4 14h6l-2 8 9-12h-6l2-8Z" />
    </svg>
  );
}
