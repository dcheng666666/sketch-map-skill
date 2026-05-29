import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillSrc = join(__dirname, "..");
const dest = join(skillSrc, "../../.cursor/skills/generate-sketch-map");

mkdirSync(dest, { recursive: true });
mkdirSync(join(dest, "examples"), { recursive: true });
for (const legacy of ["src", "geo", "node_modules", "package-lock.json", "tsconfig.json"]) {
  const p = join(dest, legacy);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

for (const name of ["SKILL.md"]) {
  cpSync(join(skillSrc, name), join(dest, name));
}
cpSync(join(skillSrc, "bin/render-sketch-map.ts"), join(dest, "bin/render-sketch-map.ts"));
cpSync(join(skillSrc, "examples/sample-route.json"), join(dest, "examples/sample-route.json"));

const pkg = {
  name: "generate-sketch-map-skill",
  private: true,
  version: "0.1.0",
  type: "module",
  description: "Cursor Skill: hand-drawn travel-route maps of China",
  scripts: { render: "tsx bin/render-sketch-map.ts" },
  dependencies: {
    "sketch-map-sdk": "^0.1.0",
  },
  devDependencies: {
    "@types/jsdom": "^21.1.7",
    "@types/node": "^24.12.3",
    tsx: "^4.20.3",
    typescript: "~5.6.2",
  },
};

writeFileSync(join(dest, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);

let skillMd = readFileSync(join(dest, "SKILL.md"), "utf8");
skillMd = skillMd.replace(
  /cd \.cursor\/skills\/generate-sketch-map/g,
  "cd apps/cursor-skill",
);
writeFileSync(join(dest, "SKILL.md"), skillMd);

console.log(`Synced skill to ${dest}`);
