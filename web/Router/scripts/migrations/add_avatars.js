const fs = require("fs");
let c = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

c = c.replace(
  'import { ZenSidebar } from "./zen-sidebar"',
  'import { ZenSidebar } from "./zen-sidebar"\nimport { Friday } from "@/components/friday"\nimport { HelloGlow } from "@/components/hello-glow"\nimport { PixelCircle } from "@/components/pixel-circle"\nimport { EyesStage } from "@/components/eyes/eyes-stage"',
);

const targetBlock =
  '<div className="w-full max-w-3xl text-[15px] leading-relaxed text-foreground/80">';
const replaceWith = `${targetBlock}
                {/* Zen Avatars and Stuffs */}
                <div className="flex flex-col items-center justify-center w-full gap-4 mt-8 mb-4">
                  <Friday />
                  <div className="flex flex-row items-center justify-center gap-8">
                    <HelloGlow>
                      <PixelCircle image="/logo.svg" />
                    </HelloGlow>
                    <EyesStage />
                  </div>
                </div>
`;

c = c.replace(targetBlock, replaceWith);
fs.writeFileSync("src/features/dx/components/dx-chat.tsx", c);
