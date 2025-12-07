const graphlib = require('graphlib');
const Graph = graphlib.Graph;
const fs = require('fs');




// Path to your JSON file
const path = require('path');
const dataPath = path.join(__dirname, 'data.json');
const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));



const N = jsonData.number;


function generateGraph(N) {
  // Node names: N1, N2, ..., Nn
  const nodes = Array.from({ length: N }, (_, i) => `N${i + 1}`);

  // Build adjacency list (complete graph)
  const adjacencyList = {};
  nodes.forEach((node) => {
    adjacencyList[node] = nodes.filter((n) => n !== node);
  });

  return { nodes, adjacencyList };
}

// Example usage:
const { nodes, adjacencyList } = generateGraph(N);




const baseIP = "127.0.0.1";
const basePort = 3001;

// Create a new undirected graph
const graph = new Graph({ directed: false });

// console.log('// Nodes');
nodes.forEach(node => {
  graph.setNode(node);
  // console.log(`graph.setNode('${node}');`);
});

// Track added edges to avoid duplicates (e.g., (A,B) and (B,A))
const addedEdges = new Set();

// console.log('\n// Edges');
for (const [node, neighbors] of Object.entries(adjacencyList)) {
  neighbors.forEach(neighbor => {
    const edgeKey = [node, neighbor].sort().join('-'); // e.g., A-B
    if (!addedEdges.has(edgeKey)) {
      graph.setEdge(node, neighbor);
      // console.log(`graph.setEdge('${node}', '${neighbor}');`);
      addedEdges.add(edgeKey);
    }
  });
}

// Node metadata
// console.log('\n// Node metadata with IP and Port');
const nodeIPsArray = nodes.map((node, index) => {
  return {
    [node]: {
      ip: baseIP,
      port: basePort + index,
      source: index === 0 // first node is source
    }
  };
});



 

////////////// Above is test_gen_graph.js only //////////// like ///


// // Nodes
// graph.setNode('N1');
// graph.setNode('N2');
// graph.setNode('N3');
// graph.setNode('N4');

// // Edges
// graph.setEdge('N1', 'N4');
// graph.setEdge('N1', 'N2');
// graph.setEdge('N2', 'N3');
// graph.setEdge('N3', 'N4');

// // Node metadata with IP and Port
// [
//   { N1: { ip: '127.0.0.1', port: 3001, source: true } },
//   { N2: { ip: '127.0.0.1', port: 3002, source: false } },
//   { N3: { ip: '127.0.0.1', port: 3003, source: false } },
//   { N4: { ip: '127.0.0.1', port: 3004, source: false } }
// ]


//////////////////////////////////////////////////////

// Assign metadata
nodeIPsArray.forEach(nodeObj => {
  const nodeName = Object.keys(nodeObj)[0];
  const { ip, port, source } = nodeObj[nodeName];
  graph.setNode(nodeName, { ip, port, source });
});

// Get neighbor IPs and ports
function getNeighborIPPort(nodeName) {
  if (!nodeName || nodeName === -1) {
    console.warn('Please check the node name passed to getNeighborIPPort');
    return 'Please check the node name passed';
  }

  const neighbors = graph.neighbors(nodeName);

  if (!neighbors || neighbors.length === 0) {
    return `Node ${nodeName} has no neighbors.`;
  }

  let IPArray = [];
  let PortArray = [];

  neighbors.forEach(neighbor => {
    const neighborData = graph.node(neighbor);
    if (neighborData) {
      IPArray.push(neighborData.ip);
      PortArray.push(neighborData.port);
    } else {
      console.warn(`No metadata found for neighbor node ${neighbor}`);
    }
  });

  return { IPArray, PortArray };
}

// Check if IP belongs to a node
function isIPBelongToNode(ipAddress) {
  const nodes = graph.nodes();
  for (const node of nodes) {
    const nodeIP = graph.node(node).ip;
    if (nodeIP === ipAddress) {
      return node;
    }
  }
  return -1;
}

// Get local IPv4 address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

// Find node by local IP
function findCurrentNode() {
  const myIP = getLocalIP();
  for (const node of graph.nodes()) {
    if (graph.node(node).ip === myIP) {
      return node;
    }
  }
  return "check your ip current address matching ip in graph node";
}

// Find node by port (coerces port to number)
function findCurrentNodeByPORT(PORT) {
  if (typeof PORT === 'string') PORT = Number(PORT);

  for (const node of graph.nodes()) {
    const nodePort = graph.node(node).port;
    if (Number(nodePort) === PORT) {
      return node;
    }
  }
  return "check your ip current address matching ip in graph node";
}

module.exports = {
  nodeIPsArray,
  graph,
  getNeighborIPPort,
  isIPBelongToNode,
  getLocalIP,
  findCurrentNode,
  findCurrentNodeByPORT
};
