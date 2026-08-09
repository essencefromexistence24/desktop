const fs = require("fs");
const f = "src/features/dx/components/dx-chat.tsx";
let content = fs.readFileSync(f, "utf8");

if (!content.includes("DockDemo")) {
  content = content.replace(
    'import { VoiceBar } from "./dx-chat-voice"',
    'import { VoiceBar } from "./dx-chat-voice"\nimport { DockDemo } from "@/components/dock"',
  );
}

const emptyState = `<div className="flex flex-col items-center justify-center pt-8 pb-16 text-center w-full max-w-none">
                    <div className="mt-8 mb-4 rounded-2xl bg-muted/50 p-4">
                      <MessageSquarePlus className="size-10 text-muted-foreground/40" />
                    </div>`;

const emptyStateWithDock = `<div className="flex flex-col items-center justify-center pt-8 pb-16 text-center w-full max-w-none">
                    <div className="mb-8 scale-110">
                      <DockDemo />
                    </div>
                    <div className="mt-4 mb-4 rounded-2xl bg-muted/50 p-4">
                      <MessageSquarePlus className="size-10 text-muted-foreground/40" />
                    </div>`;

content = content.replace(emptyState, emptyStateWithDock);
fs.writeFileSync(f, content);
console.log("Successfully updated dx-chat.tsx with DockDemo");
