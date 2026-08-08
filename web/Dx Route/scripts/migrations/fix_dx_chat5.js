const fs = require("fs");
const f = "src/features/dx/components/dx-chat.tsx";
let content = fs.readFileSync(f, "utf8");

// Remove WelcomeScreen import
content = content.replace(
  /import \{ WelcomeScreen \} from "@\/components\/screens\/welcome-screen"\r?\n/,
  "",
);

// Remove WelcomeScreen component usage
const welcomeScreenUsage = `<div className="w-full max-w-none">
                  <WelcomeScreen sidebarExpanded={!sidebarCollapsed} />
                </div>`;
content = content.replace(welcomeScreenUsage, "");

// Center the chat input box when no messages
const inputDivSearch =
  'className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background/95 to-transparent px-3 pt-20 pb-4 md:px-6 md:pb-6"';
const inputDivReplacement =
  'className={cn("pointer-events-none absolute right-0 left-0 z-20 flex flex-col items-center px-3 md:px-6", messages.length === 0 ? "top-1/2 -translate-y-1/2 justify-center" : "bottom-0 justify-end bg-gradient-to-t from-background via-background/95 to-transparent pt-20 pb-4 md:pb-6")}';
content = content.replace(inputDivSearch, inputDivReplacement);

fs.writeFileSync(f, content);
console.log("Successfully updated dx-chat.tsx to remove WelcomeScreen and center chat input");
