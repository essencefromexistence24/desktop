const fs = require("fs");
const f = "src/features/dx/components/dx-chat.tsx";
let content = fs.readFileSync(f, "utf8");

// 1. Add Popover import
if (!content.includes("PopoverContent")) {
  content = content.replace(
    "import { Button }",
    'import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";\nimport { Button }',
  );
}

// 2. Replace top right actions
const startMarker = "{/* Top Right Actions */}";
const endMarker = "{/* Chat Scroll Area */}";
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* Settings Pop-up */}
        <div className="absolute top-2 right-1 z-40 md:top-3 md:right-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground bg-background/50 backdrop-blur-md md:bg-transparent">
                <Sliders className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2 flex flex-col gap-1 border-border bg-card">
              <Button variant="ghost" size="sm" className="justify-start"><Download className="size-4 mr-2" /> Export chat</Button>
              <Button variant="ghost" size="sm" className="justify-start"><Share2 className="size-4 mr-2" /> Share link</Button>
              <Button variant="ghost" size="sm" className="justify-start"><Pencil className="size-4 mr-2" /> Edit chat</Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => rightPanel === 'files' ? closeRightPanel() : openRightPanel('files')}><Archive className="size-4 mr-2" /> Files</Button>
              <Separator className="my-1" />
              <Button variant="ghost" size="sm" className="justify-start" onClick={clearMessages}><RotateCcw className="size-4 mr-2" /> Clear chat</Button>
              <Button variant="ghost" size="sm" className="justify-start text-destructive" onClick={() => { if(currentConversationId) deleteConversation(currentConversationId) }}><Trash2 className="size-4 mr-2" /> Delete chat</Button>
            </PopoverContent>
          </Popover>
        </div>

        `;
  content = content.slice(0, startIdx) + replacement + content.slice(endIdx);
}

// 3. Center the chat input box when no messages
const inputDivSearch =
  'className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background/95 to-transparent px-3 pt-20 pb-4 md:px-6 md:pb-6"';
const inputDivReplacement =
  'className={cn("pointer-events-none absolute right-0 left-0 z-20 flex flex-col items-center px-3 md:px-6", messages.length === 0 ? "top-1/2 -translate-y-1/2 justify-center" : "bottom-0 justify-end bg-gradient-to-t from-background via-background/95 to-transparent pt-20 pb-4 md:pb-6")}';
content = content.replace(inputDivSearch, inputDivReplacement);

fs.writeFileSync(f, content);
console.log("Successfully updated dx-chat.tsx");
