"use client";

import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArchivedConversation {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  archived?: boolean;
  updatedAt?: number;
}

function loadArchived(): ArchivedConversation[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem("dx-conversations");
    if (!raw) return [];
    const convs: ArchivedConversation[] = JSON.parse(raw) as ArchivedConversation[];
    return convs.filter((c) => c.archived);
  } catch {
    return [];
  }
}

function saveAndReload(updater: (convs: ArchivedConversation[]) => ArchivedConversation[]) {
  try {
    const raw = localStorage.getItem("dx-conversations");
    const convs: ArchivedConversation[] = raw ? (JSON.parse(raw) as ArchivedConversation[]) : [];
    const updated = updater(convs);
    localStorage.setItem("dx-conversations", JSON.stringify(updated));
  } catch {}
}

interface ArchivedChatsListProps {
  onClose: () => void;
}

export function ArchivedChatsList({ onClose }: ArchivedChatsListProps) {
  const [archived, setArchived] = useState<ArchivedConversation[]>([]);

  useEffect(() => {
    setArchived(loadArchived());
  }, []);

  const handleUnarchive = (id: string) => {
    saveAndReload((convs) => convs.map((c) => (c.id === id ? { ...c, archived: false } : c)));
    setArchived((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearAll = () => {
    saveAndReload((convs) => convs.map((c) => ({ ...c, archived: false })));
    setArchived([]);
    onClose();
  };

  if (archived.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">No archived chats.</p>
        <div className="border-border border-t pt-4">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-accent-foreground text-sm underline"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Archived ({archived.length})</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
          onClick={handleClearAll}
        >
          <Trash2 className="h-3 w-3" />
          Clear all
        </Button>
      </div>
      <ScrollArea className="max-h-64">
        <div className="space-y-1">
          {archived.map((conv) => (
            <div
              key={conv.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
            >
              <Archive className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {conv.title || "Untitled"}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                onClick={() => handleUnarchive(conv.id)}
                title="Unarchive"
              >
                <ArchiveRestore className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-border border-t pt-3">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-accent-foreground text-sm underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
