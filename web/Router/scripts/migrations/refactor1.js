const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

// 1. Move utils to lib/utils
const utilsDir = path.join(srcDir, "utils");
const libUtilsDir = path.join(srcDir, "lib", "utils");

if (fs.existsSync(utilsDir)) {
  if (!fs.existsSync(libUtilsDir)) {
    fs.mkdirSync(libUtilsDir, { recursive: true });
  }
  const files = fs.readdirSync(utilsDir);
  for (const file of files) {
    fs.renameSync(path.join(utilsDir, file), path.join(libUtilsDir, file));
  }
  try {
    fs.rmdirSync(utilsDir);
  } catch (_e) {}
}

// 2. Move lib/hooks to hooks
const libHooksDir = path.join(srcDir, "lib", "hooks");
const hooksDir = path.join(srcDir, "hooks");

if (fs.existsSync(libHooksDir)) {
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }
  const files = fs.readdirSync(libHooksDir);
  for (const file of files) {
    fs.renameSync(path.join(libHooksDir, file), path.join(hooksDir, file));
  }
  try {
    fs.rmdirSync(libHooksDir);
  } catch (_e) {}
}

// 3. Update imports globally
function walkSync(dir, callback) {
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

    // Replace "@/utils/..." with "@/lib/utils/..."
    content = content.replace(/(['"])@\/utils\//g, "$1@/lib/utils/");

    // Replace "@/lib/hooks/..." with "@/hooks/..."
    content = content.replace(/(['"])@\/lib\/hooks\//g, "$1@/hooks/");

    if (content !== original) {
      fs.writeFileSync(filepath, content, "utf8");
      modifiedFiles++;
    }
  }
});
console.log(`Step 1 and 2 complete. Modified ${modifiedFiles} files.`);
