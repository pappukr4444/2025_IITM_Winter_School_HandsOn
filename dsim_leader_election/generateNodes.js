// createServers.js
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { execSync } = require("child_process");

// Root of the project (folder containing node-template and this file)
const projectRoot = __dirname;

// Folder where all generated servers will live
const nodesRoot = path.join(projectRoot, "nodes");

// Folder that acts as the template
const TEMPLATE_DIR = path.join(projectRoot, "template/node-template");

// Prefix for generated server folders inside /nodes
// Final paths will be: /nodes/server-1, /nodes/server-2, ...
const OUTPUT_PREFIX = path.join(nodesRoot, "server-");

// Path to data.json that should store the number of servers (n)
// This matches: /Users/pappukumar/Desktop/SimBFT_newMy/framework/helper_modules/data.json
const DATA_JSON_PATH = path.join(
  projectRoot,
  "framework",
  "helper_modules",
  "data.json"
);

// Recursively copy a directory (excluding node_modules)
async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });

  const entries = await fsp.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip node_modules to avoid copying heavy dependencies
    if (entry.name === "node_modules") continue;

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fsp.copyFile(srcPath, destPath);
    }
  }
}

// ⬇️ NEW: update data.json with the current n
async function updateDataJson(n) {
  const dir = path.dirname(DATA_JSON_PATH);

  // Ensure folder exists: /framework/helper_modules
  await fsp.mkdir(dir, { recursive: true });

  const data = {
    number: n,
  };

  await fsp.writeFile(DATA_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log(`📝 Updated ${DATA_JSON_PATH} with number = ${n}`);
}

async function main() {
  const n = parseInt(process.argv[2], 10);

  if (isNaN(n) || n <= 0) {
    console.error("Usage: node createServers.js <number_of_servers>");
    process.exit(1);
  }

  // ✏️ Write n into data.json
  await updateDataJson(n);

  // Check that template exists
  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.error("❌ Template directory not found:", TEMPLATE_DIR);
    process.exit(1);
  }

  // Clean /nodes folder before creating new servers
  if (fs.existsSync(nodesRoot)) {
    console.log(`🧹 Removing existing nodes folder: ${nodesRoot}`);
    fs.rmSync(nodesRoot, { recursive: true, force: true });
  }

  // Recreate empty /nodes folder
  fs.mkdirSync(nodesRoot, { recursive: true });
  console.log(`📁 Created fresh nodes folder: ${nodesRoot}`);

  console.log(`📦 Creating ${n} server folders from template: ${TEMPLATE_DIR}`);

  for (let i = 1; i <= n; i++) {
    const destDir = `${OUTPUT_PREFIX}${i}`; // e.g., /nodes/server-1
    console.log(`\n➡️  Creating folder: ${destDir}`);

    await copyDir(TEMPLATE_DIR, destDir);

    // OPTIONAL but recommended: run npm install in each server folder
    try {
      console.log(`   📥 Running "npm install" in ${destDir} ...`);
      execSync("npm install", { cwd: destDir, stdio: "inherit" });
    } catch (err) {
      console.error(`   ⚠️  npm install failed in ${destDir}:`, err.message);
    }
  }

  console.log("\n✅ All server folders created inside /nodes.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
