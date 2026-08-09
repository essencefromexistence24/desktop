const fs = require("fs");

// 1. Fix dx-chat.tsx fallback banner
let dxChat = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");
dxChat = dxChat.replace(
  "{isMock && (",
  '{isMock && !selectedModel.includes("opencode") && !selectedModel.includes("bigpickle") && (',
);
fs.writeFileSync("src/features/dx/components/dx-chat.tsx", dxChat);
console.log("Updated dx-chat.tsx");

// 2. Enhance ai-input-bar.tsx with glassmorphism
let aiInputBar = fs.readFileSync("src/components/chat/ai-input-bar.tsx", "utf8");

// Replace the container styling to be more glassmorphic
aiInputBar = aiInputBar.replace(
  '"bg-background/10 backdrop-blur-xl relative w-full rounded-2xl shadow-lg transition-all duration-200",',
  '"bg-background/30 backdrop-blur-2xl border border-white/10 relative w-full rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden ring-1 ring-white/5",\n        "dark:bg-black/40 dark:border-white/10",',
);

// Focus state
aiInputBar = aiInputBar.replace(
  'isFocused && "shadow-2xl bg-background/20",',
  'isFocused && "shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-background/40 dark:bg-black/50 border-white/20 ring-white/10",',
);

// Bottom bar styling
aiInputBar = aiInputBar.replace(
  '"flex items-center justify-between gap-3 bg-background/5 backdrop-blur-md px-4 py-2.5 rounded-b-2xl"',
  '"flex items-center justify-between gap-3 bg-white/5 dark:bg-black/20 backdrop-blur-md px-4 py-3 border-t border-white/5"',
);

fs.writeFileSync("src/components/chat/ai-input-bar.tsx", aiInputBar);
console.log("Updated ai-input-bar.tsx");
