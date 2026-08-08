const fs = require("fs");
let c = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

c = c.replace(
  'import { HistoryItem, SidebarItem, SidebarSubItem } from "./dx-chat-sidebar"',
  'import { HistoryItem, SidebarItem, SidebarSubItem } from "./dx-chat-sidebar"\nimport { ZenSidebar } from "./zen-sidebar"',
);

const matchStart =
  '<div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">';
const matchEnd = "</motion.aside>";
const startIndex = c.indexOf(matchStart);
const endIndex = c.indexOf(matchEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const toReplace = c.substring(startIndex, endIndex + matchEnd.length);
  c = c.replace(toReplace, "<ZenSidebar>");
}

const endDiv = "</div>\n  )\n}";
c = c.replace(endDiv, "</ZenSidebar>\n  )\n}");

fs.writeFileSync("src/features/dx/components/dx-chat.tsx", c);
