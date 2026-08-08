const fs = require("fs");
let content = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

const startStr = "{/* Chat Input */}";
const endStr = "</main>";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newChatInput = `{/* Chat Input */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background/95 to-transparent px-3 pt-20 pb-4 md:px-6 md:pb-6">
          <div className="pointer-events-auto relative w-full max-w-3xl mx-auto">
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

  content = content.substring(0, startIndex) + newChatInput + content.substring(endIndex);
  fs.writeFileSync("src/features/dx/components/dx-chat.tsx", content);
  console.log("Replaced Chat Input");
} else {
  console.log("Could not find Chat Input or main end tag");
}
