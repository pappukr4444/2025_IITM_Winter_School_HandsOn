#!/usr/bin/env node
// runNodes.js — detects server folders (nodes/server-1, server-2, ...)
// and launches each in a separate macOS Terminal tab using "node index.js <PORT>".

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Root of the project (folder containing nodes/)
const projectRoot = __dirname;

// Folder where generated servers live
const nodesRoot = path.join(projectRoot, "nodes");

// Ensure nodes/ exists
if (!fs.existsSync(nodesRoot)) {
  console.error("❌ 'nodes' folder not found. Did you run createServers.js?");
  process.exit(1);
}

// Look for server-* folders inside nodes/
const servers = fs.readdirSync(nodesRoot).filter((folder) => {
  const full = path.join(nodesRoot, folder);
  return folder.startsWith("server-") && fs.lstatSync(full).isDirectory();
});

if (servers.length === 0) {
  console.error("❌ No server-* folders found inside 'nodes'.");
  process.exit(1);
}

console.log(`🚀 Found ${servers.length} servers in ${nodesRoot}.\nLaunching...`);

const commands = [];

servers.forEach((serverName) => {
  const serverPath = path.join(nodesRoot, serverName);
  const indexFile = path.join(serverPath, "index.js");

  if (!fs.existsSync(indexFile)) {
    console.log(`⚠️ Skipping ${serverName}, no index.js found.`);
    return;
  }

  // Extract number from "server-3" → 3
  const match = serverName.match(/(\d+)$/);
  if (!match) {
    console.log(`⚠️ Skipping ${serverName}, cannot extract server number.`);
    return;
  }

  const num = Number(match[1]);

  // Assign port: server-1 => 3001, server-2 => 3002, etc.
  const PORT = 3000 + num;

  const safePath = serverPath.replace(/"/g, '\\"');
  const command = `cd "${safePath}" && node index.js ${PORT}`;

  commands.push(command);
});

// macOS Terminal spawn logic
function launch(commands) {
  if (process.platform !== "darwin") {
    console.log("⚠️ This script only auto-opens Terminal on macOS.");
    console.log("Run these commands manually:\n");
    console.log(commands.join("\n"));
    return;
  }

  let script = `
    tell application "Terminal"
      activate
      do script "${commands[0].replace(/"/g, '\\"')}"
  `;

  for (let i = 1; i < commands.length; i++) {
    script += `
      delay 0.2
      do script "${commands[i].replace(/"/g, '\\"')}"
    `;
  }

  script += `
    end tell
  `;

  // Escape quotes properly to run in shell
  exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
}

// Launch Terminal tabs
launch(commands);

console.log("\n✨ All servers launched in separate terminals from /nodes!");
