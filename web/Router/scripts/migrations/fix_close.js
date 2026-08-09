const fs = require("fs");
let c = fs.readFileSync("src/features/dx/components/dx-chat.tsx", "utf8");

c = c.replace(/<\/div>\r?\n\s*\)\r?\n\}/g, "</ZenSidebar>\n  )\n}");

fs.writeFileSync("src/features/dx/components/dx-chat.tsx", c);
