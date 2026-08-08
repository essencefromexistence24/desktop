"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  ChevronRightIcon,
  CopyIcon,
  CornerDownRightIcon,
  FileTextIcon,
  FolderIcon,
  GitBranchIcon,
  GlobeIcon,
  MessageSquareIcon,
  PenToolIcon,
  PlusIcon,
  TerminalIcon,
  XIcon,
} from "@/components/friday-icons";
import { cn } from "@/lib/friday/utils";
import { FilesPanel } from "@/features/dx/components/friday/files-panel";
import type { FileSystemState } from "@/lib/friday/file-system";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/friday-ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/friday-ui/tooltip";

export type RightPaneTab = "menu" | "files" | "terminal" | "browser" | "chat" | "review";

type RightPaneProps = {
  tab: RightPaneTab;
  setTab: (t: RightPaneTab) => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  fileSystem: FileSystemState;
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystemState>>;
  activeFile: string | null;
  setActiveFile: (id: string | null) => void;
};

const SOURCES = [
  {
    name: "Adaptive Learning-Based Document Image Inpainting.pdf",
    pages: 16,
    size: "2.4 MB",
    modified: "2025-06-12",
    topic: "ALDII method for handwritten Chinese text inpainting",
  },
  {
    name: "s00521-024-10206-1 (1).pdf",
    pages: 28,
    size: "5.1 MB",
    modified: "2025-05-20",
    topic: "Survey on document image enhancement techniques",
  },
  {
    name: "Spatial Context-Based Self-Supervised Learning.pdf",
    pages: 12,
    size: "1.8 MB",
    modified: "2025-04-08",
    topic: "Self-supervised spatial features for OCR",
  },
  {
    name: "s41598-024-67738-8.pdf",
    pages: 22,
    size: "3.6 MB",
    modified: "2025-03-15",
    topic: "Neural rendering for document restoration",
  },
];

const CHATS = [
  {
    id: 1,
    title: "Initial HTR architecture",
    preview: "Discussing Vision Transformers vs CNNs for HTR.",
    time: "2h ago",
    messages: 8,
    model: "deepseek-v4-flash-free",
  },
  {
    id: 2,
    title: "Dataset queries",
    preview: "Can you summarize CASIA-HWDB dataset sizes?",
    time: "3h ago",
    messages: 5,
    model: "deepseek-v4-flash-free",
  },
  {
    id: 3,
    title: "Best 5 papers",
    preview: "For your thesis topic, these 5 work best.",
    time: "1d ago",
    messages: 12,
    model: "MiMo",
  },
  {
    id: 4,
    title: "Performance metrics",
    preview: "Comparing ALDII accuracy drops under 20% / 40% masks.",
    time: "2d ago",
    messages: 6,
    model: "deepseek-v4-flash-free",
  },
  {
    id: 5,
    title: "Limitation analysis",
    preview: "What are the computational bottlenecks in section 13?",
    time: "3d ago",
    messages: 9,
    model: "MiMo",
  },
];

const REVIEWS = [
  {
    id: 1,
    title: "Section 11 \u2014 Dataset",
    status: "approved" as const,
    note: "Numbers verified against pp. 5, 11.",
    reviewer: "Auto-review",
    time: "2h ago",
    details:
      "CASIA-HWDB 1.1 and 2.1 datasets confirmed. Training: 47,767 samples. Testing: 11,935 samples. Text-line: 9,878 train / 3,865 test after filtering.",
  },
  {
    id: 2,
    title: "Section 12 \u2014 Final Result",
    status: "pending" as const,
    note: "Awaiting citation cross-check.",
    reviewer: "Pending",
    time: "1h ago",
    details:
      "Accuracy claims need verification against original paper tables. 93.44% single-character accuracy without masking requires source confirmation.",
  },
  {
    id: 3,
    title: "Section 13 \u2014 Limitations",
    status: "changes" as const,
    note: "Add note on larger text-image processing cost.",
    reviewer: "Manual review",
    time: "30m ago",
    details:
      "Missing: computational cost comparison with baseline. Need FLOPs/latency numbers. Also missing: discussion of text-detection dependency as preprocessing bottleneck.",
  },
  {
    id: 4,
    title: "Section 14 \u2014 Summary",
    status: "approved" as const,
    note: "Reads cleanly. Ship it.",
    reviewer: "Auto-review",
    time: "45m ago",
    details:
      "Summary accurately captures all key findings: ALDII method, 93.44% accuracy, text-line improvements, computational limitations. No hallucinated facts detected.",
  },
];

const TAB_DEFS: {
  id: RightPaneTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "files",
    label: "Files",
    icon: <FolderIcon className="h-3.5 w-3.5" />,
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: <TerminalIcon className="h-3.5 w-3.5" />,
  },
  {
    id: "browser",
    label: "Browser",
    icon: <GlobeIcon className="h-3.5 w-3.5" />,
  },
  {
    id: "chat",
    label: "Chat",
    icon: <MessageSquareIcon className="h-3.5 w-3.5" />,
  },
  {
    id: "review",
    label: "Review",
    icon: <PenToolIcon className="h-3.5 w-3.5" />,
  },
];

export function RightPane({
  tab,
  setTab,
  expanded,
  setExpanded,
  fileSystem,
  setFileSystem,
  activeFile,
  setActiveFile,
}: RightPaneProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <AnimatePresence>
        {tab === "menu" && expanded && <FloatingWidget key="floating" />}
      </AnimatePresence>

      <AnimatePresence>
        {tab !== "menu" && expanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: tab === "files" ? 720 : 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="h-full bg-background border-l border-border flex-col shrink-0 overflow-hidden relative z-30 hidden md:flex"
          >
            <div className="h-10 flex items-center bg-surface-1 border-b border-border px-2 shrink-0 overflow-x-auto hide-scrollbar transition-colors gap-1">
              {TAB_DEFS.map((t) => (
                <TabButton
                  key={t.id}
                  active={tab === t.id}
                  onClick={() => setTab(t.id)}
                  icon={t.icon}
                  label={t.label}
                />
              ))}
              <div className="ml-auto flex items-center gap-1">
                <IconBtn
                  icon={<XIcon className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setTab("menu");
                    setExpanded(false);
                  }}
                  ariaLabel="Close"
                />
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden bg-background">
              <AnimatePresence mode="wait">
                {tab === "files" && (
                  <FilesPanel
                    key="files"
                    state={fileSystem}
                    setState={setFileSystem}
                    activeFile={activeFile}
                    setActiveFile={setActiveFile}
                  />
                )}
                {tab === "terminal" && <TerminalView key="terminal" />}
                {tab === "browser" && <BrowserView key="browser" />}
                {tab === "chat" && <ChatsView key="chat" />}
                {tab === "review" && <ReviewView key="review" />}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

function FloatingWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80, y: -40, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, y: -40, scale: 0.92 }}
      transition={{ type: "spring", damping: 22, stiffness: 220 }}
      className="absolute top-16 right-6 w-72 lg:w-80 flex flex-col bg-surface rounded-xl border border-border shadow-2xl overflow-hidden z-30 max-h-[calc(100vh-140px)] pointer-events-auto"
    >
      <div className="p-3 lg:p-4 border-b border-border/60 shrink-0">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2 px-1 tracking-wider">
          Environment
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="hover:text-foreground transition-colors">
                <PlusIcon className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Add environment</TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-0.5">
          <EnvRow
            icon={<FileTextIcon className="h-4 w-4" />}
            label="Changes"
            badge="0"
            hoverContent={
              <div className="p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <FileTextIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium text-foreground leading-tight">
                      Working tree clean
                    </p>
                    <p className="text-[11px] text-muted-foreground">No uncommitted changes</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-surface-2 px-2 py-1.5">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      0
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Added
                    </p>
                  </div>
                  <div className="rounded-md bg-surface-2 px-2 py-1.5">
                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      0
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Modified
                    </p>
                  </div>
                  <div className="rounded-md bg-surface-2 px-2 py-1.5">
                    <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">0</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Deleted
                    </p>
                  </div>
                </div>
              </div>
            }
          />
          <EnvRow
            icon={<TerminalIcon className="h-4 w-4" />}
            label="Local"
            right={<ChevronRightIcon className="h-3.5 w-3.5 -rotate-90" />}
            hoverContent={
              <div className="p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-md bg-surface-2 text-foreground-muted">
                      <TerminalIcon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-medium text-foreground leading-tight">
                        Local server
                      </p>
                      <p className="text-[10.5px] text-muted-foreground font-mono">
                        localhost:3000
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    running
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Started</span>
                    <span className="font-mono text-foreground-muted">2h ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PID</span>
                    <span className="font-mono text-foreground-muted">18472</span>
                  </div>
                </div>
              </div>
            }
          />
          <EnvRow
            icon={<GitBranchIcon className="h-4 w-4" />}
            label="main"
            right={<ChevronRightIcon className="h-3.5 w-3.5 -rotate-90" />}
            hoverContent={
              <div className="p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/10 text-foreground">
                    <GitBranchIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium text-foreground leading-tight">main</p>
                    <p className="text-[10.5px] text-muted-foreground">
                      Active branch \u00B7 synced with origin
                    </p>
                  </div>
                </div>
                <div className="rounded-md border border-border bg-surface-2/60 p-2 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-foreground truncate">
                        feat: add ALDII self-attention block
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-mono">a3f9c12</span>
                        <span>\u00B7</span>
                        <span>2h ago</span>
                        <span>\u00B7</span>
                        <span>lin</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-foreground-muted truncate">
                        fix: page-rank evaluation script
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-mono">7d2b418</span>
                        <span>\u00B7</span>
                        <span>5h ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-foreground-muted truncate">
                        docs: update README with new metrics
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-mono">1e8a04c</span>
                        <span>\u00B7</span>
                        <span>1d ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </div>

      <div className="p-3 lg:p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2 px-1 tracking-wider">
          Sources
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="hover:text-foreground transition-colors">
                <PlusIcon className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Upload a document</TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-1">
          {SOURCES.map((source, i) => (
            <SourceItem key={i} source={source} />
          ))}
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer mt-1 transition-colors rounded-md hover:bg-surface-2">
            <ChevronRightIcon className="h-3.5 w-3.5 -rotate-90" /> View all
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SourceItem({ source }: { source: (typeof SOURCES)[number] }) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="flex items-start gap-2 px-2 py-1.5 hover:bg-surface-2 rounded-md cursor-pointer text-sm text-foreground-muted group transition-colors">
          <div className="mt-0.5 min-w-[16px]">
            <div className="w-4 h-4 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded flex items-center justify-center text-[8px] font-bold">
              PDF
            </div>
          </div>
          <span
            className="truncate group-hover:text-foreground transition-colors"
            title={source.name}
          >
            {source.name}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="left" sideOffset={8} className="w-72 p-0">
        <div className="p-3 space-y-2.5">
          <div className="flex items-start gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
              <FileTextIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-foreground leading-snug truncate">
                {source.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{source.topic}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-surface-2 px-2 py-1.5">
              <p className="text-[11px] font-semibold text-foreground">{source.pages}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Pages</p>
            </div>
            <div className="rounded-md bg-surface-2 px-2 py-1.5">
              <p className="text-[11px] font-semibold text-foreground">{source.size}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Size</p>
            </div>
            <div className="rounded-md bg-surface-2 px-2 py-1.5">
              <p className="text-[11px] font-semibold text-foreground">{source.modified}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Modified</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Click to open in viewer</span>
          <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function EnvRow({
  icon,
  label,
  badge,
  right,
  hoverContent,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  right?: React.ReactNode;
  hoverContent?: React.ReactNode;
}) {
  const row = (
    <div className="flex items-center justify-between px-2 py-1.5 hover:bg-surface-2 rounded-md cursor-pointer text-sm text-foreground-muted group transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      {badge ? (
        <span className="text-xs text-muted-foreground bg-surface-2 px-1.5 rounded">{badge}</span>
      ) : (
        <span className="text-muted-foreground">{right}</span>
      )}
    </div>
  );

  if (hoverContent) {
    return (
      <HoverCard openDelay={150} closeDelay={80}>
        <HoverCardTrigger asChild>{row}</HoverCardTrigger>
        <HoverCardContent side="left" sideOffset={8} className="w-72 p-0">
          {hoverContent}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return row;
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap",
            active
              ? "bg-surface text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {icon}
          {label}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>
        {label} {active ? "(active)" : "panel"}
      </TooltipContent>
    </Tooltip>
  );
}

function IconBtn({
  icon,
  onClick,
  ariaLabel,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={ariaLabel}
          className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
        >
          {icon}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>{ariaLabel}</TooltipContent>
    </Tooltip>
  );
}

function TerminalView() {
  const lines = [
    { time: "15:42:01", prompt: "~/projects/htr", cmd: "git status" },
    { time: "15:42:01", prompt: "~/projects/htr", cmd: "On branch main" },
    { time: "15:42:01", prompt: "~/projects/htr", cmd: "nothing to commit, working tree clean" },
    { time: "15:42:08", prompt: "~/projects/htr", cmd: "python train.py --epochs 12" },
    { time: "15:42:12", prompt: "~/projects/htr", cmd: "Epoch 1/12  loss=2.41  acc=0.32" },
    { time: "15:42:18", prompt: "~/projects/htr", cmd: "Epoch 2/12  loss=1.86  acc=0.58" },
    { time: "15:42:25", prompt: "~/projects/htr", cmd: "Epoch 3/12  loss=1.34  acc=0.71" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      className="h-full flex flex-col font-mono text-sm w-full"
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border text-muted-foreground text-xs bg-surface-1">
        <TerminalIcon className="h-3.5 w-3.5" />
        <span>PowerShell 7.6.2</span>
        <div className="ml-auto flex items-center gap-1">
          <IconBtn
            icon={<CopyIcon className="h-3.5 w-3.5" />}
            onClick={() => navigator.clipboard?.writeText("")}
            ariaLabel="Copy"
          />
        </div>
      </div>
      <div className="p-4 text-foreground-muted flex-1 overflow-y-auto leading-relaxed custom-scrollbar">
        <div className="bg-surface-2 text-foreground px-4 py-2 mb-4 rounded-sm inline-block max-w-full text-xs md:text-sm">
          A new PowerShell stable release is available: v7.6.3
          <br />
          Upgrade now, or check out the release page at:
          <br />
          https://aka.ms/PowerShell-Release?tag=v7.6.3
        </div>
        {lines.map((l, i) => (
          <div key={i} className="text-xs md:text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">{l.time}</span>{" "}
            <span className="text-blue-600 dark:text-blue-400 ml-2">{l.prompt}&gt;</span>{" "}
            <span className="text-foreground">{l.cmd}</span>
          </div>
        ))}
        <div className="mt-2 text-xs md:text-sm">
          <span className="text-emerald-600 dark:text-emerald-400">15:42:30</span>{" "}
          <span className="text-blue-600 dark:text-blue-400 ml-2">~/projects/htr&gt;</span>{" "}
          <motion.span
            aria-hidden
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-1.5 h-3.5 align-middle bg-foreground"
          />
        </div>
      </div>
    </motion.div>
  );
}

function BrowserView() {
  const [url, setUrl] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      className="h-full flex flex-col w-full"
    >
      <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-surface-1">
        <div className="flex gap-0.5">
          <IconBtn
            icon={<ChevronRightIcon className="h-3.5 w-3.5 rotate-180" />}
            onClick={() => {}}
            ariaLabel="Back"
          />
          <IconBtn
            icon={<ChevronRightIcon className="h-3.5 w-3.5" />}
            onClick={() => {}}
            ariaLabel="Forward"
          />
          <IconBtn
            icon={<CornerDownRightIcon className="h-3.5 w-3.5 -rotate-90" />}
            onClick={() => {}}
            ariaLabel="Refresh"
          />
        </div>
        <div className="flex-1 bg-background rounded-md border border-border px-3 py-1 flex items-center shadow-sm">
          <input
            type="text"
            placeholder="Enter a URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-transparent text-xs w-full outline-none text-foreground"
          />
          <CornerDownRightIcon className="h-3 w-3 text-muted-foreground -rotate-90" />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
        <GlobeIcon className="h-10 w-10 mb-3 opacity-30" />
        <h3 className="text-foreground font-medium mb-1 text-sm">Start browsing</h3>
        <p className="text-xs">Enter a URL to open a page</p>
      </div>
    </motion.div>
  );
}

function ChatsView() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      className="h-full flex flex-col w-full"
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-1">
        <MessageSquareIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground flex-1">Recent chats</span>
        <IconBtn
          icon={<PlusIcon className="h-3.5 w-3.5" />}
          onClick={() => {}}
          ariaLabel="New chat"
        />
      </div>
      <div className="p-2 space-y-0.5 flex-1 overflow-y-auto custom-scrollbar">
        {CHATS.map((c) => (
          <ChatItem key={c.id} chat={c} />
        ))}
      </div>
    </motion.div>
  );
}

function ChatItem({ chat }: { chat: (typeof CHATS)[number] }) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <motion.div
          whileHover={{ x: 2 }}
          className="flex flex-col gap-0.5 p-2.5 rounded-md hover:bg-surface-2 cursor-pointer transition-colors"
        >
          <div className="text-[13px] font-medium text-foreground truncate">{chat.title}</div>
          <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
            {chat.preview}
          </div>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent side="left" sideOffset={8} className="w-64 p-0">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-medium text-foreground">{chat.title}</p>
            <span className="text-[10px] text-muted-foreground">{chat.time}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{chat.preview}</p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border">
            <span className="flex items-center gap-1">
              <MessageSquareIcon className="h-3 w-3" />
              {chat.messages} messages
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {chat.model}
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function ReviewView() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      className="h-full flex flex-col w-full"
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-1">
        <PenToolIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground flex-1">Review</span>
        <IconBtn
          icon={<PlusIcon className="h-3.5 w-3.5" />}
          onClick={() => {}}
          ariaLabel="Add review"
        />
      </div>
      <div className="p-2 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        {REVIEWS.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
      </div>
    </motion.div>
  );
}

function ReviewItem({ review }: { review: (typeof REVIEWS)[number] }) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="p-3 rounded-md border border-border bg-surface hover:border-border-strong transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                review.status === "approved" &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                review.status === "pending" &&
                  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                review.status === "changes" &&
                  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
              )}
            >
              {review.status}
            </span>
            <span className="text-[12.5px] font-medium text-foreground">{review.title}</span>
          </div>
          <div className="text-[11.5px] text-muted-foreground leading-snug">{review.note}</div>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent side="left" sideOffset={8} className="w-72 p-0">
        <div className="p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                review.status === "approved" &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                review.status === "pending" &&
                  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                review.status === "changes" &&
                  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
              )}
            >
              {review.status}
            </span>
            <span className="text-[10px] text-muted-foreground">{review.time}</span>
          </div>
          <p className="text-[12.5px] font-medium text-foreground">{review.title}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{review.details}</p>
          <div className="flex items-center gap-1.5 pt-1 border-t border-border text-[10px] text-muted-foreground">
            <PenToolIcon className="h-3 w-3" />
            <span>Reviewed by {review.reviewer}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
