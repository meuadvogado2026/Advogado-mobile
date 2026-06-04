const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const patches = [
  {
    file: path.join(projectRoot, "node_modules", "@expo", "cli", "build", "src", "utils", "npm.js"),
    find: "await pipeline(stream, transformStream, _tar().default.extract({",
    replace:
      "const tarModule = _tar().default ?? _tar();\n    await pipeline(stream, transformStream, tarModule.extract({"
  },
  {
    file: path.join(projectRoot, "node_modules", "@expo", "cli", "build", "src", "utils", "tar.js"),
    find: "await _tar().default.extract({",
    replace: "const tarModule = _tar().default ?? _tar();\n    await tarModule.extract({"
  }
];

for (const patch of patches) {
  if (!fs.existsSync(patch.file)) {
    continue;
  }

  const source = fs.readFileSync(patch.file, "utf8");
  if (source.includes(patch.replace)) {
    continue;
  }

  if (!source.includes(patch.find)) {
    throw new Error(`Expo CLI tar interop patch target not found: ${patch.file}`);
  }

  fs.writeFileSync(patch.file, source.replace(patch.find, patch.replace));
}
