"use client";

import { newId } from "@/lib/friday/utils";

export type FileNode = {
  id: string;
  name: string;
  kind: "file" | "folder";
  parentId: string | null;
  children?: string[];
  content?: string;
  language?: string;
  updatedAt: number;
};

export type FileSystemState = {
  nodes: Record<string, FileNode>;
  rootIds: string[];
};

const INITIAL_FILES: Array<Omit<FileNode, "id" | "updatedAt">> = [
  { kind: "folder", name: "src", parentId: null, children: [] },
  { kind: "folder", name: "public", parentId: null, children: [] },
  { kind: "folder", name: ".git", parentId: null, children: [] },
  {
    kind: "file",
    name: "package.json",
    parentId: null,
    language: "json",
    content: `{
  "name": "vercel-chat",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}`,
  },
  {
    kind: "file",
    name: "tsconfig.json",
    parentId: null,
    language: "json",
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
  },
  {
    kind: "file",
    name: "README.md",
    parentId: null,
    language: "markdown",
    content: `# Vercel Chat

An animated AI chat workspace built with Next.js, Tailwind, and Motion.

## Features
- Five right-side panels (Files, Terminal, Browser, Chat, Review)
- Magnetic model picker with ULTRA mode
- Monaco code editor
- Real file system with create / edit / delete
- Vercel light & dark themes
`,
  },
  {
    kind: "file",
    name: "next.config.ts",
    parentId: null,
    language: "typescript",
    content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`,
  },
  { kind: "folder", name: "components", parentId: "src", children: [] },
  { kind: "folder", name: "lib", parentId: "src", children: [] },
  { kind: "folder", name: "app", parentId: "src", children: [] },
  {
    kind: "file",
    name: "globals.css",
    parentId: "src",
    language: "css",
    content: `@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
}

body {
  background: var(--background);
  color: var(--foreground);
}
`,
  },
  {
    kind: "file",
    name: "layout.tsx",
    parentId: "src/app",
    language: "typescript",
    content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vercel Chat",
  description: "AI chat workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
  },
  {
    kind: "file",
    name: "page.tsx",
    parentId: "src/app",
    language: "typescript",
    content: `import { ChatShell } from "@/components/chat/chat-shell";

export default function HomePage() {
  return <ChatShell />;
}
`,
  },
  {
    kind: "file",
    name: "utils.ts",
    parentId: "src/lib",
    language: "typescript",
    content: `export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
`,
  },
  {
    kind: "file",
    name: "chat-shell.tsx",
    parentId: "src/components",
    language: "typescript",
    content: `"use client";

import { motion, AnimatePresence } from "motion/react";

export function ChatShell() {
  return <div>Hello world</div>;
}
`,
  },
];

function buildInitial(): FileSystemState {
  const nodes: Record<string, FileNode> = {};
  const rootIds: string[] = [];
  for (const f of INITIAL_FILES.filter((f) => f.kind === "folder")) {
    const id = newId();
    nodes[id] = { ...f, id, updatedAt: Date.now() } as FileNode;
  }
  for (const f of INITIAL_FILES.filter((f) => f.kind === "file")) {
    const id = newId();
    nodes[id] = { ...f, id, updatedAt: Date.now() } as FileNode;
  }
  for (const f of INITIAL_FILES) {
    if (f.parentId === null) {
      const id = Object.keys(nodes).find(
        (k) => nodes[k].name === f.name && nodes[k].parentId === null,
      );
      if (id) rootIds.push(id);
    } else {
      const parent = Object.values(nodes).find((n) => n.kind === "folder" && n.name === f.parentId);
      if (parent) {
        const id = Object.keys(nodes).find(
          (k) => nodes[k].name === f.name && nodes[k].parentId === parent.id,
        );
        if (id) parent.children?.push(id);
      }
    }
  }
  return { nodes, rootIds };
}

const STORAGE_KEY = "vercel-chat-files-v1";

export function loadFileSystem(): FileSystemState {
  if (typeof window === "undefined") return buildInitial();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitial();
    const parsed = JSON.parse(raw) as FileSystemState;
    if (!parsed?.nodes) return buildInitial();
    return parsed;
  } catch {
    return buildInitial();
  }
}

export function saveFileSystem(state: FileSystemState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export function getChildren(state: FileSystemState, parentId: string | null): FileNode[] {
  const ids = parentId === null ? state.rootIds : (state.nodes[parentId]?.children ?? []);
  return ids.map((id) => state.nodes[id]).filter(Boolean);
}

export function findByPath(state: FileSystemState, path: string[]): FileNode | null {
  let current: FileNode | null = null;
  let children = state.rootIds.map((id) => state.nodes[id]).filter(Boolean);
  for (const seg of path) {
    current = children.find((c) => c.name === seg) ?? null;
    if (!current) return null;
    if (current.kind === "folder") {
      children = (current.children ?? []).map((id) => state.nodes[id]).filter(Boolean);
    } else {
      children = [];
    }
  }
  return current;
}

export function getPath(state: FileSystemState, id: string): string[] {
  const path: string[] = [];
  let current: FileNode | undefined = state.nodes[id];
  while (current) {
    path.unshift(current.name);
    if (!current.parentId) break;
    current = state.nodes[current.parentId];
  }
  return path;
}
