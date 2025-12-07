// node-template/index.js
const express = require('express');
const cors = require('cors');

const graph = require('../../framework/helper_modules/graph.js');
const protocol = require('../../framework/protocol.js');

const app = express();

// PORT from CLI
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
global.glb_floodingData = [];

// --- Leader election state ---
global.glb_myValue = null;            // this node's election number (from UI or random)
global.glb_maxSeenValue = null;       // best seen so far
global.glb_leaderID = null;           // owner of best value
global.glb_round = 0;
global.glb_maxRounds = 2;             // >= graph diameter
global.glb_electionStarted = false;   // has this node started participating?

// --- Global data: values per node ---
// e.g. { N1: 202, N2: 3339, ... }
global.glb_valuesByNode = {};

// Logs helper
function addLog(message) {
  const logEntry = `[${global.glb_nodeID}] ${new Date().toISOString()} - ${message}`;
  console.log(logEntry);
  global.glb_floodingLogs.push(logEntry);
}

// // Helper: pretty-print global values map
// function logAllNodeValues() {
//   const parts = [];
//   for (const [nodeID, value] of Object.entries(global.glb_valuesByNode)) {
//     parts.push(`${nodeID}:${value}`);
//   }
//   addLog(`All node values => ${parts.join(', ')}`);
// }


// Helper: pretty-print global values map + find max
function logAllNodeValues() {
  const parts = [];
  for (const [nodeID, value] of Object.entries(global.glb_valuesByNode)) {
    parts.push(`${nodeID}:${value}`);
  }
  
  // Find maximum value and its owner
  let maxValue = -Infinity;
  let maxNodeID = null;
  for (const [nodeID, value] of Object.entries(global.glb_valuesByNode)) {
    if (value > maxValue) {
      maxValue = value;
      maxNodeID = nodeID;
    }
  }
  
  const allValues = `All node values => ${parts.join(', ')}`;
  const leaderElected = `Computed leader = ${maxNodeID} (maxValue = ${maxValue})`
  addLog(`All node values => ${parts.join(', ')}`);
  addLog(`Computed leader = ${maxNodeID} (maxValue = ${maxValue})`);


  return({allValues, leaderElected})
  
}





// --- Helper: ensure this node has an election value ---
function ensureMyValue(givenValue = null) {
  if (global.glb_myValue !== null) {
    return; // already set
  }
  if (givenValue !== null && !Number.isNaN(givenValue)) {
    global.glb_myValue = Number(givenValue);
  } else {
    global.glb_myValue = Math.floor(Math.random() * 10000);
  }
  global.glb_maxSeenValue = global.glb_myValue;
  global.glb_leaderID = global.glb_nodeID;

  // store own value in global map
  global.glb_valuesByNode[global.glb_nodeID] = global.glb_myValue;

  addLog(`My election value set to ${global.glb_myValue}`);
}

// --- Helper to send an election message via flooding ---
function sendElectionMessage(round) {
  const msg = {
    type: "ELECTION",
    from: global.glb_nodeID,
    round,
    value: global.glb_myValue,        // ONLY send my own value
    owner: global.glb_nodeID          // owner is always myself
  };
  addLog(
    `Sending ELECTION (round=${round}, value=${msg.value}, owner=${msg.owner})`
  );
  protocol.floodingAlgorithm(global.glb_nodeID, msg);
}

// --- Routes ---

app.post('/api/flooding', (req, res) => {
  addLog(`POST /api/flooding received: ${JSON.stringify(req.body)}`);

  const msg = req.body;

  // optional generic data logging
  if (msg.data) {
    global.glb_floodingData.push(msg.data);
  }

  // 1) UI trigger: START_ELECTION
  if (msg.type === "START_ELECTION") {
    // only allow starting once at this node
    if (!global.glb_electionStarted) {
      ensureMyValue(msg.value !== undefined ? msg.value : null);
      global.glb_electionStarted = true;
      global.glb_round = 0;
      sendElectionMessage(1);
    }
    return res.json({ node: global.glb_nodeID, started: true, value: global.glb_myValue });
  }

  // 2) Normal handling of ELECTION messages - NO maxSeenValue updates!
  if (msg.type === "ELECTION") {
    // If this node hasn't joined yet, generate its number *once* as soon as it hears an election
    if (!global.glb_electionStarted) {
      ensureMyValue(null);  // random
      global.glb_electionStarted = true;
      global.glb_round = 0;
    }

    // record the owner's value in the global map
    if (msg.owner && msg.value !== undefined) {
      global.glb_valuesByNode[msg.owner] = msg.value;
    }

    // REMOVED: No more maxSeenValue updates or leaderID changes

    // Advance round
    if (msg.round > global.glb_round) {
      global.glb_round = msg.round;
    }

    // // Continue flooding if still in election window
    // if (global.glb_round < global.glb_maxRounds) {
    //   sendElectionMessage(global.glb_round + 1);
    // } else {
    //   // before declaring leader, print the global list
    //   logAllNodeValues();
    //   addLog(
    //     `Election completed at node. Final leader=${global.glb_leaderID}, maxValue=${global.glb_maxSeenValue}`
    //   );
    // }


    // Continue flooding if still in election window
    if (global.glb_round < global.glb_maxRounds) {
      sendElectionMessage(global.glb_round + 1);
    } else {
      // ✅ Run this only once per node per election
      if (!global.glb_electionCompleted) {
        global.glb_electionCompleted = true;

        setTimeout(() => {
          // before declaring leader, print the global list
          logAllNodeValues();
          // addLog(
          //   `Election completed at node. Final leader=${global.glb_leaderID}, maxValue=${global.glb_maxSeenValue}`
          // );
        }, 5000);
      }
    }

    return res.json({ node: global.glb_nodeID, election: true });
  }

  // 3) Fallback: any other messages use generic flooding
  protocol.floodingAlgorithm(global.glb_nodeID, msg);
  res.json({ [PORT]: msg });
});


app.get('/api/leader', (req, res) => {

  const get_logAllNodeValues = logAllNodeValues();

  // console.log(get_logAllNodeValues);

  res.send(get_logAllNodeValues);

});


app.get('/api/flooding-logs', (req, res) => {
  res.json({ node: global.glb_nodeID, logs: global.glb_floodingLogs });
});

app.get('/api/flooding-results', (req, res) => {
  res.json({ node: global.glb_nodeID, data: global.glb_floodingData });
});

app.get('/api/status', (req, res) => {
  res.json({
    node: global.glb_nodeID,
    port: PORT,
    running: true,
    received: global.glb_floodingData.length > 0,
    myValue: global.glb_myValue,
    maxSeenValue: global.glb_maxSeenValue,
    leaderID: global.glb_leaderID,
    round: global.glb_round,
    maxRounds: global.glb_maxRounds,
    electionStarted: global.glb_electionStarted,
    valuesByNode: global.glb_valuesByNode
  });
});

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
