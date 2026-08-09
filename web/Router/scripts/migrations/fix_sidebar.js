const fs = require("fs");
const f = "src/components/browser/sidebar-header.tsx";
let content = fs.readFileSync(f, "utf8");

if (!content.includes("PopoverContent")) {
  content = content.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";\nimport { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";\nimport { WelcomeScreen } from "@/components/screens/welcome-screen";',
  );
}

const cogBtn = `<Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <Cog className="h-4 w-4" />
            </Button>`;

const popoverCogBtn = `<Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
                >
                  <Cog className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" className="w-[80vw] h-[80vh] p-0 overflow-hidden border-border bg-card">
                <WelcomeScreen sidebarExpanded={sidebarExpanded} />
              </PopoverContent>
            </Popover>`;

content = content.replace(cogBtn, popoverCogBtn);
fs.writeFileSync(f, content);
console.log("Successfully updated sidebar-header.tsx");
