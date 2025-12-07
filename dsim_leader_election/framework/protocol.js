// protocol.js
const graphModule = require('./helper_modules/graph.js');
const broadcastNew = require('./helper_modules/broadcastNew.js'); // must export sendPostRequestsToIPs

// Node context will be set from index.js
let currentNodeID = null;
function setNodeContext(nodeID) {
  currentNodeID = nodeID;
  console.log(`Node context set: ${currentNodeID}`);
}

// Use a Set to track received messages uniquely
if (!global.glb_receivedMessages) global.glb_receivedMessages = new Set();

// Flooding algorithm
function floodingAlgorithm(nodeID, message) {
  if (!nodeID || typeof nodeID !== 'string' || nodeID.startsWith("check")) {
    console.error("Invalid nodeID:", nodeID);
    return;
  }

  // Prepare neighbors
  const neighbors = graphModule.graph.neighbors(nodeID) || [];
  const nbrsData = graphModule.getNeighborIPPort(nodeID);
  if (typeof nbrsData === 'string') {
    console.warn(nbrsData);
    return;
  }
  const nbrsIPs = nbrsData.IPArray;
  const nbrsPorts = nbrsData.PortArray;
  const nbrsEndpoints = neighbors.map(() => 'api/flooding');

  // Use sourceID+data as unique key
  const msgKey = `${message.sourceID || nodeID}-${JSON.stringify(message.data)}`;

  // If this node is the source and message not yet sent
  if (graphModule.graph.node(nodeID).source === true && !global.glb_receivedMessages.has(msgKey)) {
    console.log(`${nodeID}: I am the source. Sending message to all neighbors.`);
    global.glb_receivedMessages.add(msgKey);

    neighbors.forEach((neighbor, idx) => {
      const ip = nbrsIPs[idx];
      const port = nbrsPorts[idx];
      const endpoint = nbrsEndpoints[idx];
      console.log(`Sending message to neighbor ${neighbor} at ${ip}:${port}/${endpoint}`);
      broadcastNew.sendPostRequestsToIPs(message, [ip], [port], [endpoint]);
    });
    return;
  }

  // If not source, forward if first time receiving this message
  if (!global.glb_receivedMessages.has(msgKey)) {
    console.log(`${nodeID}: Received message for the first time. Forwarding to neighbors.`);
    global.glb_receivedMessages.add(msgKey);

    neighbors.forEach((neighbor, idx) => {
      const ip = nbrsIPs[idx];
      const port = nbrsPorts[idx];
      const endpoint = nbrsEndpoints[idx];
      console.log(`Forwarding message to neighbor ${neighbor} at ${ip}:${port}/${endpoint}`);
      broadcastNew.sendPostRequestsToIPs(message, [ip], [port], [endpoint]);
    });
  } else {
    console.log(`${nodeID}: Already received message. Ignoring.`);
  }
}

module.exports = {
  floodingAlgorithm,
  setNodeContext
};
