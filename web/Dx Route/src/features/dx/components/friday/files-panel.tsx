"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CodeIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  GitBranchIcon,
  PlusIcon,
  XIcon,
} from "@/components/friday-icons";
import {
  type FileNode,
  type FileSystemState,
  getChildren,
  getPath,
} from "@/lib/friday/file-system";
import { cn, newId } from "@/lib/friday/utils";
import { useFridayTheme } from "@/components/friday-theme-provider";

type FilesPanelProps = {
  state: FileSystemState;
  setState: React.Dispatch<React.SetStateAction<FileSystemState>>;
  activeFile: string | null;
  setActiveFile: (id: string | null) => void;
};

export function FilesPanel({ state, setState, activeFile, setActiveFile }: FilesPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      className="h-full flex w-full"
    >
      <FileTree
        state={state}
        setState={setState}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <FileTabs state={state} activeFile={activeFile} setActiveFile={setActiveFile} />
        <div className="flex-1 min-h-0">
          {activeFile ? (
            <CodeEditor key={activeFile} file={state.nodes[activeFile]} theme={"vs-dark"} />
          ) : (
            <EmptyEditor />
          )}
        </div>
        <StatusBar state={state} activeFile={activeFile} />
      </div>
    </motion.div>
  );
}

function FileTree({ state, setState, activeFile, setActiveFile }: FilesPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    root: true,
  });

  const root = useMemo(() => getChildren(state, null), [state]);

  const toggle = (id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const createFile = (parentId: string | null) => {
    const id = newId();
    const node: FileNode = {
      id,
      name: "untitled.ts",
      kind: "file",
      parentId,
      content: "// New file\n",
      language: "typescript",
      updatedAt: Date.now(),
    };
    setState((prev) => {
      const next: FileSystemState = {
        ...prev,
        nodes: { ...prev.nodes, [id]: node },
      };
      if (parentId === null) {
        next.rootIds = [...prev.rootIds, id];
      } else {
        const parent = prev.nodes[parentId];
        if (parent) {
          next.nodes[parentId] = {
            ...parent,
            children: [...(parent.children ?? []), id],
          };
        }
      }
      return next;
    });
    if (parentId) {
      setExpanded((p) => ({ ...p, [parentId]: true }));
    }
    setActiveFile(id);
  };

  return (
    <div className="w-56 shrink-0 border-r border-border bg-surface-1 flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <FolderIcon className="h-3 w-3" />
        Explorer
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => createFile(null)}
          className="ml-auto grid h-5 w-5 place-items-center rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground"
          aria-label="New file"
        >
          <PlusIcon className="h-3 w-3" />
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto p-1 custom-scrollbar text-[13px]">
        {root.map((n) => (
          <TreeNode
            key={n.id}
            node={n}
            state={state}
            depth={0}
            expanded={expanded}
            toggle={toggle}
            setExpanded={setExpanded}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            setState={setState}
            createFile={createFile}
          />
        ))}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  state,
  depth,
  expanded,
  toggle,
  setExpanded,
  activeFile,
  setActiveFile,
  setState,
  createFile,
}: {
  node: FileNode;
  state: FileSystemState;
  depth: number;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activeFile: string | null;
  setActiveFile: (id: string | null) => void;
  setState: React.Dispatch<React.SetStateAction<FileSystemState>>;
  createFile: (parentId: string | null) => void;
}) {
  const isOpen = expanded[node.id];
  const isActive = activeFile === node.id;
  const children = node.kind === "folder" ? getChildren(state, node.id) : [];

  return (
    <>
      <motion.div
        layout
        whileHover={{ x: 1 }}
        onClick={() => {
          if (node.kind === "folder") {
            toggle(node.id);
          } else {
            setActiveFile(node.id);
          }
        }}
        className={cn(
          "group/row flex items-center gap-1 px-1 py-1 rounded cursor-pointer transition-colors text-[12.5px]",
          isActive ? "bg-surface-2 text-foreground" : "text-foreground-muted hover:bg-surface-2",
        )}
        style={{ paddingLeft: 6 + depth * 12 }}
      >
        {node.kind === "folder" ? (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="text-muted-foreground"
          >
            <ChevronRightIcon className="h-3 w-3" />
          </motion.span>
        ) : (
          <span className="w-3" />
        )}
        {node.kind === "folder" ? (
          isOpen ? (
            <FolderOpenIcon className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <FolderIcon className="h-3.5 w-3.5 text-amber-500" />
          )
        ) : (
          <FileIcon name={node.name} />
        )}
        <span className="truncate flex-1">{node.name}</span>
        {node.kind === "folder" && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              createFile(node.id);
              setExpanded((p) => ({ ...p, [node.id]: true }));
            }}
            className="opacity-0 group-hover/row:opacity-100 grid h-4 w-4 place-items-center rounded text-muted-foreground hover:bg-surface hover:text-foreground"
            aria-label="New file in folder"
          >
            <PlusIcon className="h-3 w-3" />
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence initial={false}>
        {node.kind === "folder" && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {children.map((c) => (
              <TreeNode
                key={c.id}
                node={c}
                state={state}
                depth={depth + 1}
                expanded={expanded}
                toggle={toggle}
                setExpanded={setExpanded}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
                setState={setState}
                createFile={createFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const color =
    {
      ts: "text-blue-500",
      tsx: "text-blue-500",
      js: "text-amber-500",
      jsx: "text-amber-500",
      json: "text-amber-500",
      css: "text-pink-500",
      html: "text-orange-500",
      md: "text-zinc-500",
      py: "text-emerald-500",
      yaml: "text-emerald-500",
      yml: "text-emerald-500",
    }[ext] ?? "text-zinc-400";
  return <CodeIcon className={cn("h-3.5 w-3.5", color)} />;
}

function FileTabs({
  state,
  activeFile,
  setActiveFile,
}: {
  state: FileSystemState;
  activeFile: string | null;
  setActiveFile: (id: string | null) => void;
}) {
  if (!activeFile) return null;
  const file = state.nodes[activeFile];
  if (!file) return null;
  const path = getPath(state, file.id).join("/");
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-surface-1">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface text-[12px] text-foreground border border-border shadow-sm">
        <FileIcon name={file.name} />
        <span className="font-medium">{file.name}</span>
        <span className="text-muted-foreground font-mono text-[10.5px] ml-1.5">{path}</span>
        <button
          onClick={() => setActiveFile(null)}
          className="ml-1 grid h-4 w-4 place-items-center rounded text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          aria-label="Close tab"
        >
          <XIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function CodeEditor({ file, theme }: { file: FileNode; theme: string }) {
  const { resolvedTheme } = useFridayTheme();
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <Editor
      height="100%"
      theme={editorTheme}
      path={file.name}
      language={file.language ?? "plaintext"}
      value={file.content ?? ""}
      onMount={onMount}
      options={{
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.6,
        minimap: { enabled: true, scale: 1, renderCharacters: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: "all",
        bracketPairColorization: { enabled: true },
        automaticLayout: true,
        wordWrap: "on",
        fontLigatures: true,
        guides: { indentation: true, highlightActiveIndentation: true },
      }}
    />
  );
}

function EmptyEditor() {
  return (
    <div className="h-full grid place-items-center text-muted-foreground">
      <div className="text-center">
        <CodeIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <div className="text-[13px]">Select a file to start editing</div>
      </div>
    </div>
  );
}

function StatusBar({
  state,
  activeFile,
}: {
  state: FileSystemState;
  activeFile: string | null;
}) {
  const file = activeFile ? state.nodes[activeFile] : null;
  return (
    <div className="h-6 border-t border-border bg-surface-1 px-3 flex items-center gap-3 text-[10.5px] text-muted-foreground font-mono">
      <span className="flex items-center gap-1">
        <GitBranchIcon className="h-3 w-3" /> main
      </span>
      {file && (
        <>
          <span>UTF-8</span>
          <span>LF</span>
          <span className="ml-auto uppercase">{file.language ?? "plaintext"}</span>
        </>
      )}
    </div>
  );
}
