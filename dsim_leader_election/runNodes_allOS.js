#!/usr/bin/env node
// runNodes.js — detects server folders (nodes/server-1, server-2, ...)
// and launches each in a SEPARATE terminal WINDOW (not tabs) using "node index.js <PORT>".
// Supports macOS (Terminal.app) and Linux (gnome-terminal, konsole, xfce4-terminal, etc.).

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");
const { execSync } = require("child_process");

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

console.log(`🚀 Found ${servers.length} servers in ${nodesRoot}.\nLaunching in separate windows...`);

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

  const safePath = serverPath.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  const command = `cd "${safePath}" && node index.js ${PORT}`;

  commands.push(command);
});

// Platform detection and launch logic
function launch(commands) {
  const platform = os.platform();
  
  if (platform === "darwin") {
    // macOS: Each command gets its own Terminal window
    console.log("🍎 macOS detected. Launching separate Terminal windows...");
    
    commands.forEach((cmd, index) => {
      setTimeout(() => {
        exec(`osascript -e 'tell application "Terminal" to do script "${cmd.replace(/"/g, '\\"')}"'`);
      }, index * 200); // Stagger launches
    });
    
  } else if (platform === "linux") {
    // Linux: Separate windows for each command
    console.log("🐧 Linux detected. Launching separate terminal windows...");
    
    // Common Linux terminals (separate windows by default)
    const terminals = [
      { name: "gnome-terminal", cmdBuilder: buildGnomeWindowCmd },
      { name: "konsole", cmdBuilder: buildKonsoleWindowCmd },
      { name: "xfce4-terminal", cmdBuilder: buildXfceWindowCmd },
      { name: "kitty", cmdBuilder: buildKittyWindowCmd },
      { name: "alacritty", cmdBuilder: buildAlacrittyWindowCmd },
      { name: "terminator", cmdBuilder: buildTerminatorWindowCmd },
      { name: "xterm", cmdBuilder: buildXtermWindowCmd }
    ];
    
    let terminalCmdBuilder = null;
    
    for (const term of terminals) {
      if (which(term.name)) {
        console.log(`✅ Using ${term.name} for separate windows...`);
        terminalCmdBuilder = term.cmdBuilder;
        break;
      }
    }
    
    if (!terminalCmdBuilder) {
      console.log("⚠️ No supported terminal found. Run commands manually:\n");
      console.log(commands.join("\n"));
      return;
    }
    
    // Launch each command in separate window with stagger
    commands.forEach((command, index) => {
      setTimeout(() => {
        const fullCmd = terminalCmdBuilder(command);
        exec(fullCmd);
      }, index * 300); // 300ms delay between windows
    });
    
  } else {
    console.log(`⚠️ Unsupported platform: ${platform}`);
    console.log("Run these commands manually:\n");
    console.log(commands.join("\n"));
  }
}

// Linux terminal window command builders (SEPARATE WINDOWS)
function buildGnomeWindowCmd(command) {
  return `gnome-terminal -- bash -c "${command.replace(/"/g, '\\"')}; exec bash"`;
}

function buildKonsoleWindowCmd(command) {
  return `konsole -e bash -c "${command.replace(/"/g, '\\"')}; exec bash"`;
}

function buildXfceWindowCmd(command) {
  return `xfce4-terminal --execute bash -c "${command.replace(/"/g, '\\"')}; exec bash"`;
}

function buildKittyWindowCmd(command) {
  return `kitty -- bash -c "${command.replace(/"/g, '\\"')}; exec bash"`;
}

function buildAlacrittyWindowCmd(command) {
  return `alacritty -e bash -c "${command.replace(/"/g, '\\"')}; exec bash"`;
}

function buildTerminatorWindowCmd(command) {
  return `terminator -e bash -c "${command.replace(/"/g, '\\"')}; exec bash"`;
}

function buildXtermWindowCmd(command) {
  return `xterm -e bash -c "${command.replace(/"/g, '\\"')}; exec bash"`;
}

// Helper: check if command exists
function which(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Launch terminals
launch(commands);

console.log("\n✨ All servers launched in SEPARATE terminal windows!");
