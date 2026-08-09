const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

const moves = [
  // Step 3
  { from: "components/chat", to: "features/dx/components/chat" },
  { from: "components/screens", to: "features/dx/components/screens" },
  { from: "components/browser", to: "features/dx/components/browser" },
  // Step 4
  {
    from: "components/daikanoid",
    to: "features/portfolio/components/daikanoid",
  },
  {
    from: "components/animated-icons",
    to: "features/portfolio/components/animated-icons",
  },
  { from: "components/eyes", to: "features/portfolio/components/eyes" },
  // Step 5
  { from: "components/react-bits", to: "components/vendor/react-bits" },
  { from: "components/kibo-ui", to: "components/vendor/kibo-ui" },
];

for (const move of moves) {
  const fromPath = path.join(srcDir, move.from);
  const toPath = path.join(srcDir, move.to);

  if (fs.existsSync(fromPath)) {
    if (!fs.existsSync(toPath)) {
      fs.mkdirSync(path.dirname(toPath), { recursive: true });
      // Copy instead of rename to bypass some locks
      fs.cpSync(fromPath, toPath, { recursive: true });
    }
  }
}

// Handle duck-follower duplicate
const duckFollowerDup = path.join(srcDir, "components", "duck-follower");
if (fs.existsSync(duckFollowerDup)) {
  try {
    fs.rmSync(duckFollowerDup, { recursive: true, force: true });
  } catch (_e) {}
}

function walkSync(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath, callback);
    } else {
      callback(filepath);
    }
  }
}

let modifiedFiles = 0;
walkSync(srcDir, (filepath) => {
  if (/\.(ts|tsx|js|jsx|mdx)$/.test(filepath)) {
    let content = fs.readFileSync(filepath, "utf8");
    const original = content;

    // Update imports based on moves
    content = content.replace(/(['"])@\/components\/chat\b/g, "$1@/features/dx/components/chat");
    content = content.replace(
      /(['"])@\/components\/screens\b/g,
      "$1@/features/dx/components/screens",
    );
    content = content.replace(
      /(['"])@\/components\/browser\b/g,
      "$1@/features/dx/components/browser",
    );

    content = content.replace(
      /(['"])@\/components\/daikanoid\b/g,
      "$1@/features/portfolio/components/daikanoid",
    );
    content = content.replace(
      /(['"])@\/components\/animated-icons\b/g,
      "$1@/features/portfolio/components/animated-icons",
    );
    content = content.replace(
      /(['"])@\/components\/eyes\b/g,
      "$1@/features/portfolio/components/eyes",
    );

    content = content.replace(
      /(['"])@\/components\/duck-follower\b/g,
      "$1@/features/portfolio/components/duck-follower",
    );

    content = content.replace(
      /(['"])@\/components\/react-bits\b/g,
      "$1@/components/vendor/react-bits",
    );
    content = content.replace(/(['"])@\/components\/kibo-ui\b/g, "$1@/components/vendor/kibo-ui");

    if (content !== original) {
      fs.writeFileSync(filepath, content, "utf8");
      modifiedFiles++;
    }
  }
});

// Delete old ones
for (const move of moves) {
  const fromPath = path.join(srcDir, move.from);
  try {
    fs.rmSync(fromPath, { recursive: true, force: true });
  } catch (_e) {}
}

console.log(`Step 3, 4, 5 complete. Modified ${modifiedFiles} files.`);
