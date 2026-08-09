const fs = require("fs");
let c = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

c = c.replace(
  /<div className="mb-4 rounded-2xl bg-muted\/50 p-4 mt-8">\s*<MessageSquarePlus className="size-10 text-muted-foreground\/40" \/>\s*<\/div>\s*<div className="mt-4/,
  '<div className="mb-4 rounded-2xl bg-muted/50 p-4 mt-8">\n                      <MessageSquarePlus className="size-10 text-muted-foreground/40" />\n                    </div>\n                    {modelLoading && modelProgress ? (\n                      <>\n                        <h2 className="mb-1 text-xl font-bold text-foreground">\n                          Loading {MODEL_OPTIONS[selectedModel].name}\n                        </h2>\n                        <div className="mt-4',
);

fs.writeFileSync("src/features/dx/components/dx-chat.tsx", c);
