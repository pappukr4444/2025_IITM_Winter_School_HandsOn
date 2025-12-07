# 🚀 Multi-Server Node Environment

This project allows you to:

- Create multiple independent Node.js server copies (`server-1`, `server-2`, `server-3`, …)
- Automatically install dependencies for each
- Run all servers at once, each in its **own Terminal window/tab**
- Assign each server a **unique port automatically**

This is useful for simulation, distributed systems, peer-to-peer networks, blockchain testing, etc.

---

## 📌 Requirements

- Node.js installed  
- macOS (required for auto-opening terminal windows)  
- Basic knowledge of using:
  - Finder / File Explorer  
  - Terminal  
  - Node commands  

---

## 🧭 Steps to Set Up

### 1️⃣ Create the Project Folder
Create a folder (e.g., `multi-server`) and open it in Terminal.

### 2️⃣ Create the Template Server
Inside the main folder, create a subfolder named `template-server`.

### 3️⃣ Add index.js
Inside `template-server`, create an `index.js` file for a simple express server.

### 4️⃣ Add package.json
Add a `package.json` file inside `template-server` with express as a dependency.

### 5️⃣ Install Dependencies
Run `npm install` from inside the `template-server` folder, then return to the main folder.

### 6️⃣ Create createServers.js (Generator Script)
In the `multi-server` folder, create a generator script to duplicate `template-server` into multiple server copies (`server-1`, `server-2`, etc.) and install dependencies for each.

### 7️⃣ Generate Servers
Run `node createServers.js unt>` to generate multiple independent servers.

### 8️⃣ Create runNodes.js (Auto-Runner)
Create a script to automatically open and launch all generated servers in macOS Terminal windows/tabs.

### 9️⃣ Make Runner Executable (Optional)
Use `chmod +x runNodes.js` to make the runner script directly executable.

### 🔟 Run All Servers
Execute the script with `./runNodes.js` or `node runNodes.js`.  
Each server will launch in its own terminal window/tab.

### 🔍 Check Servers
Open browser tabs for:
- http://localhost:3001  
- http://localhost:3002  
- http://localhost:3003  

### 🛑 Stop Servers
Press `CTRL + C` inside each terminal tab to stop the servers.

---

## 🎉 Done!
You now have a multi-node environment that automatically creates and runs multiple independent Node.js servers.

Want a stop-all script too?  
👇 Just ask!
