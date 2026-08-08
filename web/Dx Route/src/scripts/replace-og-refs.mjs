import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const files = [
  "src/app/(preview)/preview/[name]/page.tsx",
  "src/app/(app)/(pages)/testimonials/page.tsx",
  "src/app/(app)/(pages)/sponsors/page.tsx",
  "src/app/(app)/(pages)/components/page.tsx",
  "src/app/(app)/(pages)/blog/page.tsx",
  "src/app/(app)/(docs)/components/[slug]/page.tsx",
  "src/app/(app)/(docs)/blog/[slug]/page.tsx",
  "src/app/(app)/(blocks)/components/showcase/page.tsx",
  "src/app/(app)/(blocks)/blocks/(view)/[category]/[name]/page.tsx",
  "src/app/(app)/(blocks)/blocks/(list)/[category]/page.tsx",
  "src/app/(app)/(blocks)/blocks/(list)/page.tsx",
];

// Match template literals: `/og/simple?title=${...}&description=${...}`
const re =
  /`\/og\/simple\?title=\$\{encodeURIComponent\([^)]+\)\}&description=\$\{encodeURIComponent\([^)]+\)\}`/g;

// Match absoluteUrl wrapping
const reAbsolute =
  /absoluteUrl\(`\/og\/simple\?title=\$\{encodeURIComponent\([^)]+\)\}&description=\$\{encodeURIComponent\([^)]+\)\}`\)/g;

let count = 0;
for (const filePath of files) {
  const fullPath = join(root, filePath);
  let content = readFileSync(fullPath, "utf-8");

  // First replace absoluteUrl(...) patterns
  let modified = content.replace(reAbsolute, '"/og/default.png"');
  // Then replace direct template literals
  modified = modified.replace(re, '"/og/default.png"');

  if (modified !== content) {
    writeFileSync(fullPath, modified, "utf-8");
    const matches = (content.match(re) || []).length + (content.match(reAbsolute) || []).length;
    console.log(`UPDATED: ${filePath} (${matches} occurrence(s))`);
    count++;
  } else {
    console.log(`SKIP: ${filePath}`);
  }
}
console.log(`\nTotal files updated: ${count}`);
