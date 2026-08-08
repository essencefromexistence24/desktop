const fs = require("fs");
let content = fs.readFileSync("src/components/screens/welcome-screen.tsx", "utf8");

// Remove AIInputBar and its wrapper div
const aiInputBarRegex = /\{\/\*\s*Fixed AI Chat Input.*?<\/div>\s*<\/div>\s*<\/>/s;
content = content.replace(aiInputBarRegex, "</>");

fs.writeFileSync("src/components/screens/welcome-screen.tsx", content);
console.log("Removed AIInputBar from welcome-screen.tsx");
