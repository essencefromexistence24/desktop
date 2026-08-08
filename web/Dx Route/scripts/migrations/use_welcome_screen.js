const fs = require("fs");
let c = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

const importToRemove1 = 'import { Friday } from "@/components/friday"\n';
const importToRemove2 = 'import { HelloGlow } from "@/components/hello-glow"\n';
const importToRemove3 = 'import { PixelCircle } from "@/components/pixel-circle"\n';
const importToRemove4 = 'import { EyesStage } from "@/components/eyes/eyes-stage"\n';

c = c.replace(importToRemove1, "");
c = c.replace(importToRemove2, "");
c = c.replace(importToRemove3, "");
c = c.replace(importToRemove4, "");

c = c.replace(
  'import { ZenSidebar } from "./zen-sidebar"',
  'import { ZenSidebar } from "./zen-sidebar"\nimport { WelcomeScreen } from "@/components/screens/welcome-screen"',
);

const blockToReplaceRegex = /\{\/\* Zen Avatars and Stuffs \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
c = c.replace(blockToReplaceRegex, "<WelcomeScreen sidebarExpanded={!sidebarCollapsed} />");

fs.writeFileSync("src/features/dx/components/dx-chat.tsx", c);
