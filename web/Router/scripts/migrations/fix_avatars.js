const fs = require("fs");
let c = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

c = c.replace(
  'import { WelcomeScreen } from "@/components/screens/welcome-screen"',
  'import { AvatarShowcase } from "@/components/avatar-showcase"',
);

const welcomeRegex =
  /<WelcomeScreen sidebarExpanded=\{!sidebarCollapsed\} \/>\s*\{messages\.length === 0 \? \(/;
c = c.replace(
  welcomeRegex,
  "{messages.length === 0 ? (\n                  <>\n                    <AvatarShowcase sidebarWidth={!sidebarCollapsed ? 360 : 56} />\n",
);

c = c.replace(
  /<MessageSquarePlus className="size-10 text-muted-foreground\/40" \/>\s*<\/div>/,
  '<MessageSquarePlus className="size-10 text-muted-foreground/40" />\n                    </div>\n                  </>',
);

fs.writeFileSync("src/features/dx/components/dx-chat.tsx", c);
