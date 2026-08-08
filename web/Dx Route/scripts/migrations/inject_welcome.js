const fs = require("fs");
let c = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

c = c.replace(
  'import { HistoryItem, SidebarItem, SidebarSubItem } from "./dx-chat-sidebar"\nimport { ZenSidebar } from "./zen-sidebar"',
  'import { HistoryItem, SidebarItem, SidebarSubItem } from "./dx-chat-sidebar"\nimport { ZenSidebar } from "./zen-sidebar"\nimport { WelcomeScreen } from "@/components/screens/welcome-screen"',
);

const originalEmptyState = `{messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="mb-4 rounded-2xl bg-muted/50 p-4">
                      <MessageSquarePlus className="size-10 text-muted-foreground/40" />
                    </div>`;

const newEmptyState = `{messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-8 pb-16 text-center w-full max-w-none">
                    <WelcomeScreen sidebarExpanded={!sidebarCollapsed} />
                    <div className="mt-8 mb-4 rounded-2xl bg-muted/50 p-4">
                      <MessageSquarePlus className="size-10 text-muted-foreground/40" />
                    </div>`;

c = c.replace(originalEmptyState, newEmptyState);
fs.writeFileSync("src/features/dx/components/dx-chat.tsx", c);
