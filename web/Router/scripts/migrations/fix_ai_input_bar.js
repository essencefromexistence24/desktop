const fs = require("fs");
let content = fs.readFileSync("src/components/chat/ai-input-bar.tsx", "utf8");

// Update placeholder color
content = content.replace(
  "placeholder:text-muted-foreground min-h-px max-h-[120px] resize-none border-0 bg-transparent px-4 py-2 text-sm leading-tight focus-visible:ring-0",
  "placeholder:text-muted-foreground/50 min-h-px max-h-[120px] resize-none border-0 bg-transparent px-4 py-2 text-sm leading-tight focus-visible:ring-0",
);

// Remove container border
content = content.replace(
  '"bg-background/10 backdrop-blur-xl border-white/10 relative w-full rounded-2xl border shadow-lg transition-all duration-200"',
  '"bg-background/10 backdrop-blur-xl relative w-full rounded-2xl shadow-lg transition-all duration-200"',
);

// Remove focus border and rings
content = content.replace(
  'isFocused && "ring-2 ring-ring/30 shadow-2xl border-white/20 bg-background/20"',
  'isFocused && "shadow-2xl bg-background/20"',
);

// Remove bottom bar border
content = content.replace(
  '"border-white/10 flex items-center justify-between gap-3 border-t bg-background/5 backdrop-blur-md px-4 py-2.5 rounded-b-2xl"',
  '"flex items-center justify-between gap-3 bg-background/5 backdrop-blur-md px-4 py-2.5 rounded-b-2xl"',
);

fs.writeFileSync("src/components/chat/ai-input-bar.tsx", content);
console.log("Updated ai-input-bar.tsx");
