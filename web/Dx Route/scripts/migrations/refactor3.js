const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

// 1. Delete base/ui
const baseUiDir = path.join(srcDir, "components", "base", "ui");
if (fs.existsSync(baseUiDir)) {
  fs.rmSync(baseUiDir, { recursive: true, force: true });
}
// Clean up empty base folder if empty
const baseDir = path.join(srcDir, "components", "base");
if (fs.existsSync(baseDir)) {
  try {
    fs.rmdirSync(baseDir);
  } catch (_e) {}
}

// 2. Move hooks/soundcn to lib/soundcn/hooks
const hooksSoundcn = path.join(srcDir, "hooks", "soundcn");
const libSoundcnHooks = path.join(srcDir, "lib", "soundcn", "hooks");

if (fs.existsSync(hooksSoundcn)) {
  if (!fs.existsSync(libSoundcnHooks)) {
    fs.mkdirSync(libSoundcnHooks, { recursive: true });
  }
  const files = fs.readdirSync(hooksSoundcn);
  for (const file of files) {
    fs.renameSync(path.join(hooksSoundcn, file), path.join(libSoundcnHooks, file));
  }
  try {
    fs.rmSync(hooksSoundcn, { recursive: true, force: true });
  } catch (_e) {}
}

// 3. Update imports globally
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
    content = content.replace(/(['"])@\/components\/base\/ui\//g, "$1@/components/ui/");
    content = content.replace(/(['"])@\/hooks\/soundcn\//g, "$1@/lib/soundcn/hooks/");

    if (content !== original) {
      fs.writeFileSync(filepath, content, "utf8");
      modifiedFiles++;
    }
  }
});

console.log(`Final refactor complete. Modified ${modifiedFiles} files.`);
