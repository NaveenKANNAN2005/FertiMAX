import { readdirSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import process from "node:process";

const rootDir = process.cwd();
const ignoredDirs = new Set(["node_modules"]);
const jsFiles = [];

const collectJsFiles = (dirPath) => {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        collectJsFiles(path.join(dirPath, entry.name));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      jsFiles.push(path.join(dirPath, entry.name));
    }
  }
};

collectJsFiles(rootDir);

for (const filePath of jsFiles) {
  execFileSync(process.execPath, ["--check", filePath], {
    stdio: "inherit",
  });
}

console.log(`Verified ${jsFiles.length} backend JavaScript files.`);
