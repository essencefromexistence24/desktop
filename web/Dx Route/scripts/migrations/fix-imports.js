const fs = require("fs");
const { execSync } = require("child_process");

// Restore base/ui
try {
  execSync("git checkout src/components/base/ui");
} catch (e) {
  console.log("Error checking out base/ui", e);
}

const files = [
  "src/app/(app)/(blocks)/blocks/(view)/[category]/[name]/page.tsx",
  "src/app/(app)/(blocks)/components/showcase/page.tsx",
  "src/app/(app)/(docs)/blog/[slug]/page.tsx",
  "src/app/(app)/(docs)/components/[slug]/page.tsx",
  "src/app/(app)/(docs)/components/sidebar.tsx",
  "src/app/(app)/(pages)/components/page.tsx",
  "src/app/(app)/(pages)/sponsors/page.tsx",
  "src/app/(preview)/components/block-viewer.tsx",
  "src/components/base/collapsible-animated.tsx",
  "src/components/code-block-command.tsx",
  "src/components/collapsible-list.tsx",
  "src/components/component-preview.tsx",
  "src/components/github-stars.tsx",
  "src/components/mdx.tsx",
  "src/components/not-found.tsx",
  "src/components/scroll-to-top.tsx",
  "src/components/toc-inline.tsx",
  "src/components/toc-minimap.tsx",
  "src/features/doc/components/doc-sponsors.tsx",
  "src/features/doc/components/type-table.tsx",
  "src/features/portfolio/components/awards/award-item.tsx",
  "src/features/portfolio/components/blog.tsx",
  "src/features/portfolio/components/components-showcase.tsx",
  "src/features/portfolio/components/components.tsx",
  "src/features/portfolio/components/education/education-item.tsx",
  "src/features/portfolio/components/experiences/experience-position-item.tsx",
  "src/features/portfolio/components/experiences/index.tsx",
  "src/features/portfolio/components/github-contributions/graph.tsx",
  "src/features/portfolio/components/projects/project-item.tsx",
  "src/features/portfolio/components/social-links.tsx",
  "src/features/portfolio/components/sponsors.tsx",
  "src/features/portfolio/components/testimonials.tsx",
  "src/registry/components/code-block-command/code-block-command.tsx",
  "src/registry/transformed/components/code-block-command/code-block-command.tsx",
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  // Get the original content from HEAD
  let headContent = "";
  try {
    headContent = execSync(`git show HEAD:${file}`).toString();
  } catch (_e) {
    continue;
  }

  // Find all base/ui imports in HEAD
  const baseUiRegex = /import\s+.*?\s+from\s+['"]@\/components\/base\/ui\/.*?['"]/g;
  const matches = headContent.match(baseUiRegex);

  if (matches) {
    let currentContent = fs.readFileSync(file, "utf8");

    for (const match of matches) {
      // match is something like: import { Button } from "@/components/base/ui/button"
      // The corrupted version in currentContent is: import { Button } from "@/components/ui/button"
      const corruptedMatch = match.replace("@/components/base/ui/", "@/components/ui/");

      currentContent = currentContent.replace(corruptedMatch, match);
    }

    fs.writeFileSync(file, currentContent, "utf8");
  }
}

console.log("Restored base/ui and reverted imports perfectly.");
