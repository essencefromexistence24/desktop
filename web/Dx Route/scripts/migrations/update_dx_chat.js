const fs = require("fs");
let content = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

// 1. Move WelcomeScreen above messages
content = content.replace(
  /\{messages\.length === 0 \? \(\n\s*<div className="flex flex-col items-center justify-center pt-8 pb-16 text-center w-full max-w-none">\n\s*<WelcomeScreen sidebarExpanded=\{!sidebarCollapsed\} \/>/,
  `{/* Moved WelcomeScreen above */}\n                <div className="w-full max-w-none">\n                  <WelcomeScreen sidebarExpanded={!sidebarCollapsed} />\n                </div>\n                {messages.length === 0 ? (\n                  <div className="flex flex-col items-center justify-center pt-8 pb-16 text-center w-full max-w-none">`,
);

// 2. Add AIInputBar import
content = content.replace(
  /import \{ WelcomeScreen \} from "@\/components\/screens\/welcome-screen"/,
  `import { WelcomeScreen } from "@/components/screens/welcome-screen"\nimport { AIInputBar } from "@/components/chat/ai-input-bar"`,
);

// 3. Replace Chat Input
const chatInputRegex =
  /\{\/\* Chat Input \*\/\}\n\s*<div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background\/95 to-transparent px-3 pt-20 pb-4 md:px-6 md:pb-6">[\s\S]*?(?=<\/main>)/;

const newChatInput = `{/* Chat Input */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background/95 to-transparent px-3 pt-20 pb-4 md:px-6 md:pb-6">
          <div className="pointer-events-auto relative w-full max-w-3xl">
            <AIInputBar
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSubmit={handleSend}
              onStop={stopGeneration}
              isGenerating={isGenerating}
              isLoading={!modelReady || modelLoading}
              isVoiceMode={isVoiceMode}
              onVoiceModeChange={setIsVoiceMode}
              selectedModelId={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>
      `;

content = content.replace(chatInputRegex, newChatInput);

fs.writeFileSync("src/features/dx/components/dx-chat.tsx", content);
console.log("Updated dx-chat.tsx");
