const fs = require("fs");
const f = "src/features/dx/components/dx-chat.tsx";
let content = fs.readFileSync(f, "utf8");

if (!content.includes("MacOSDock")) {
  content = content.replace(
    'import { AIInputBar } from "@/components/chat/ai-input-bar"',
    `import { getRandomDockIconName } from "@/components/screens/dock-icons"
import { MacOSDock } from "@/components/screens/macos-dock"
import { ScreenCarousel } from "@/components/screens/screen-carousel"
import { ScreenGridDialog } from "@/components/screens/screen-grid-dialog"
import type { Screen } from "@/components/screens/types"
import { AIInputBar } from "@/components/chat/ai-input-bar"`,
  );
}

const hookStart = '  const [settingsTab, setSettingsTab] = React.useState("account")';
const statesToAdd = `
  const [activeScreenId, setActiveScreenId] = React.useState<string>("welcome");
  const [screens, setScreens] = React.useState<Screen[]>([
    { id: "welcome", type: "welcome", title: "Welcome", width: 0, height: 0 },
    { id: "terminal", type: "terminal", title: "Terminal", width: 0, height: 0 },
    { id: "code", type: "code", title: "Code Editor", width: 0, height: 0 },
    { id: "browser", type: "browser", title: "Browser", width: 0, height: 0 },
  ]);
  const [gridOpen, setGridOpen] = React.useState(false);

  const handleScreenResize = (id: string, width: number, height: number) => {
    setScreens((prev) =>
      prev.map((screen) =>
        screen.id === id ? { ...screen, width, height } : screen,
      ),
    );
  };

  const handleAddScreen = () => {
    const number = screens.length + 1;
    const newScreen = {
      id: \`screen-\${Date.now()}\`,
      type: "custom",
      title: \`Screen \${number}\`,
      width: 0,
      height: 0,
      dockIcon: getRandomDockIconName(),
    };
    setScreens((prev) => [...prev, newScreen as Screen]);
    setActiveScreenId(newScreen.id);
  };
`;
if (!content.includes("activeScreenId")) {
  content = content.replace(hookStart, `${hookStart}\n${statesToAdd}`);
}

const _emptyStateWithDock = `<div className="flex flex-col items-center justify-center pt-8 pb-16 text-center w-full max-w-none">
                    <div className="mb-8 scale-110">
                      <DockDemo />
                    </div>
                    <div className="mt-4 mb-4 rounded-2xl bg-muted/50 p-4">
                      <MessageSquarePlus className="size-10 text-muted-foreground/40" />
                    </div>`;

// We'll replace the empty state completely (including the empty state check so we can put it right above)
const messagesContainerSearch = `<div className="w-full max-w-3xl text-[15px] leading-relaxed text-foreground/80">

                {messages.length === 0 ? (`;

const screenSystemJSX = `<div className="w-full max-w-[95vw] xl:max-w-[1200px] text-[15px] leading-relaxed text-foreground/80">
                <div className="w-full max-w-none h-[70vh] min-h-[500px] mb-8 relative rounded-xl overflow-hidden border shadow-lg bg-card mt-16">
                  <MacOSDock
                    screens={screens}
                    activeScreenId={activeScreenId}
                    onScreenChange={setActiveScreenId}
                    onAddScreen={handleAddScreen}
                    onToggleViewMode={() => setGridOpen(true)}
                    sidebarExpanded={!sidebarCollapsed}
                  />
                  <ScreenCarousel
                    activeScreenId={activeScreenId}
                    screens={screens}
                    onScreenChange={setActiveScreenId}
                    onScreenResize={handleScreenResize}
                    onScreensUpdate={setScreens}
                    sidebarExpanded={!sidebarCollapsed}
                  />
                  <ScreenGridDialog
                    open={gridOpen}
                    onOpenChange={setGridOpen}
                    screens={screens}
                    activeScreenId={activeScreenId}
                    onSelectScreen={setActiveScreenId}
                  />
                </div>

                {messages.length === 0 ? (`;

content = content.replace(messagesContainerSearch, screenSystemJSX);

// I should also fix the <DockDemo /> we added earlier in the empty state if it's there.
// The user doesn't seem to want the old DockDemo in the empty state anymore because this is the "screen dock system".
// Actually, let's just leave DockDemo there or remove it. I'll remove it since the new MacOSDock is what they wanted.
content = content.replace(/<div className="mb-8 scale-110">\s*<DockDemo \/>\s*<\/div>/g, "");
// And remove import DockDemo
content = content.replace('import { DockDemo } from "@/components/dock"\n', "");

fs.writeFileSync(f, content);
console.log("Successfully updated dx-chat.tsx with Screen System");
