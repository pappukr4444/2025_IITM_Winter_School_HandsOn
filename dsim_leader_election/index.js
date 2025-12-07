const express = require('express');
const cors = require('cors');
const graph = require('./helper_modules/graph.js');
const protocol = require('./protocol.js');

const app = express();

const PORT = Number(process.argv[2]);
if (!PORT) {
  console.error("Usage: node index.js <PORT>");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// --- Initialize node context ---
const myNodeID = graph.findCurrentNodeByPORT(PORT);
if (!myNodeID || myNodeID.startsWith("check")) {
  console.error("Invalid or unmatched NodeID for port", PORT);
  process.exit(1);
}
global.glb_nodeID = myNodeID;
protocol.setNodeContext(myNodeID);

console.log(`Node started at ID=${myNodeID}, PORT=${PORT}`);

// --- Global storage ---
global.glb_floodingLogs = [];
global.glb_floodingData = [];  // Store all messages as an array

// Helper to add logs
function addLog(message) {
  const logEntry = `[${global.glb_nodeID}] ${new Date().toISOString()} - ${message}`;
  console.log(logEntry);
  global.glb_floodingLogs.push(logEntry);
}

// --- Routes ---

// Flooding receive endpoint
app.post('/api/flooding', (req, res) => {
  addLog(`POST /api/flooding received: ${JSON.stringify(req.body)}`);

  if (!global.glb_nodeID || typeof global.glb_nodeID !== 'string') {
    return res.status(500).json({ error: 'Invalid node id. Cannot process request.' });
  }

  // Save all data for verification
  if (req.body.data) {
    global.glb_floodingData.push(req.body.data);
  }

  protocol.floodingAlgorithm(global.glb_nodeID, req.body);

  res.json({ [PORT]: req.body });
});

// Logs API
app.get('/api/flooding-logs', (req, res) => {
  res.json({ node: global.glb_nodeID, logs: global.glb_floodingLogs });
});

// Results API
app.get('/api/flooding-results', (req, res) => {
  res.json({ node: global.glb_nodeID, data: global.glb_floodingData });
});

// Status API
app.get('/api/status', (req, res) => {
  res.json({
    node: global.glb_nodeID,
    port: PORT,
    running: true,
    received: global.glb_floodingData.length > 0
  });
});

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});


// /Users/kumarchandan/Desktop/SimBFT_Flooding/runMultipleTests/