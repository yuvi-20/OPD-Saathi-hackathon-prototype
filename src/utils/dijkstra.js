import { PLACES, GRAPH_EDGES } from '../data/hospital.js';

/**
 * Dijkstra's shortest path algorithm over the hospital navigation graph.
 * @param {string} startNodeId - Starting place ID
 * @param {string} endNodeId - Destination place ID
 * @param {boolean} avoidStairs - When true, stairs edges are strictly forbidden
 * @returns {Array<string> | null} - Array of place IDs along the shortest path, or null if unreachable
 */
export function findShortestPath(startNodeId, endNodeId, avoidStairs = false) {
  if (!startNodeId || !endNodeId || !PLACES[startNodeId] || !PLACES[endNodeId]) {
    return null;
  }
  if (startNodeId === endNodeId) {
    return [startNodeId];
  }

  // Build adjacency list
  const adjacency = {};
  Object.keys(PLACES).forEach(id => {
    adjacency[id] = [];
  });

  GRAPH_EDGES.forEach(edge => {
    // If avoidStairs is true, filter out any edges that use stairs or touch a stair node
    if (avoidStairs) {
      if (edge.hasStairs || edge.from.includes('stairs') || edge.to.includes('stairs')) {
        return;
      }
    }
    // Bidirectional edges
    if (adjacency[edge.from] && adjacency[edge.to]) {
      adjacency[edge.from].push({ node: edge.to, distance: edge.distance, hasStairs: edge.hasStairs });
      adjacency[edge.to].push({ node: edge.from, distance: edge.distance, hasStairs: edge.hasStairs });
    }
  });

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(PLACES));

  Object.keys(PLACES).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentNode = null;
    let smallestDistance = Infinity;
    unvisited.forEach(node => {
      if (distances[node] < smallestDistance) {
        smallestDistance = distances[node];
        currentNode = node;
      }
    });

    if (currentNode === null || smallestDistance === Infinity) {
      break; // Unreachable
    }

    if (currentNode === endNodeId) {
      break; // Reached target
    }

    unvisited.delete(currentNode);

    // Check neighbors
    const neighbors = adjacency[currentNode] || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.node)) continue;
      const alt = distances[currentNode] + neighbor.distance;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = currentNode;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let curr = endNodeId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  // If path doesn't start at startNodeId, no valid path was found
  if (path[0] !== startNodeId) {
    return null;
  }

  return path;
}

/**
 * Calculates total walking distance in meters for a path
 */
export function calculatePathDistance(path) {
  if (!path || path.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = GRAPH_EDGES.find(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    total += edge ? edge.distance : 10;
  }
  return total;
}

/**
 * Generates rich, localized, step-by-step turn-by-turn directions with landmarks
 */
export function generateStepDirections(path, lang = 'hi') {
  if (!path || path.length === 0) return [];
  if (path.length === 1) {
    const p = PLACES[path[0]];
    const name = p[`name_${lang}`] || p.name_en;
    if (lang === 'hi') return [`आप पहले से ही ${name} पर हैं।`];
    if (lang === 'ta') return [`நீங்கள் ஏற்கனவே ${name}-ல் உள்ளீர்கள்.`];
    return [`You are already at ${name}.`];
  }

  const steps = [];

  for (let i = 0; i < path.length - 1; i++) {
    const currId = path[i];
    const nextId = path[i + 1];
    const currPlace = PLACES[currId];
    const nextPlace = PLACES[nextId];

    const currName = currPlace[`name_${lang}`] || currPlace.name_en;
    const nextName = nextPlace[`name_${lang}`] || nextPlace.name_en;
    const landmark = nextPlace[`landmark_${lang}`] || nextPlace.landmark_en;

    const edge = GRAPH_EDGES.find(
      e => (e.from === currId && e.to === nextId) || (e.from === nextId && e.to === currId)
    );
    const dist = edge ? edge.distance : 10;
    const isStairs = edge ? edge.hasStairs : false;

    // Floor transition check
    if (currPlace.floor !== nextPlace.floor) {
      const targetFloorName = getFloorName(nextPlace.floor, lang);
      if (isStairs) {
        if (lang === 'hi') {
          steps.push(`सीढ़ियों का उपयोग करके ${targetFloorName} पर जाएं। (${dist} मीटर)`);
        } else if (lang === 'ta') {
          steps.push(`படிகள் வழியாக ${targetFloorName}-க்கு செல்லவும். (${dist} மீ)`);
        } else {
          steps.push(`Take the stairs to ${targetFloorName}. (${dist}m)`);
        }
      } else if (currId.includes('lift') || nextId.includes('lift')) {
        if (lang === 'hi') {
          steps.push(`लिफ्ट में जाएं और बटन दबाकर ${targetFloorName} पर पहुंचें।`);
        } else if (lang === 'ta') {
          steps.push(`லிஃப்டில் ஏறி ${targetFloorName}-க்கு செல்லவும்.`);
        } else {
          steps.push(`Take the passenger lift to ${targetFloorName}.`);
        }
      } else if (currId.includes('ramp') || nextId.includes('ramp')) {
        if (lang === 'hi') {
          steps.push(`सुलभ ढलान वाले रैंप से होते हुए ${targetFloorName} पर जाएं। (${dist} मीटर)`);
        } else if (lang === 'ta') {
          steps.push(`சாய்வுப்பாதை வழியாக ${targetFloorName}-க்கு செல்லவும். (${dist} மீ)`);
        } else {
          steps.push(`Walk up the gradual accessible ramp to ${targetFloorName}. (${dist}m)`);
        }
      }
    } else {
      // Normal corridor step with landmark
      if (lang === 'hi') {
        steps.push(`${currName} से आगे बढ़ें और ${nextName} की ओर जाएं (${dist} मीटर)। पहचान: ${landmark}`);
      } else if (lang === 'ta') {
        steps.push(`${currName}-லிருந்து ${nextName}-க்கு செல்லவும் (${dist} மீ). அடையாளம்: ${landmark}`);
      } else {
        steps.push(`From ${currName}, walk towards ${nextName} (${dist}m). Landmark: ${landmark}`);
      }
    }
  }

  // Final destination arrival step
  const finalPlace = PLACES[path[path.length - 1]];
  const finalName = finalPlace[`name_${lang}`] || finalPlace.name_en;
  const finalLandmark = finalPlace[`landmark_${lang}`] || finalPlace.landmark_en;

  if (lang === 'hi') {
    steps.push(`आप ${finalName} पहुंच गए हैं। (${finalLandmark})`);
  } else if (lang === 'ta') {
    steps.push(`நீங்கள் ${finalName}-ஐ அடைந்துவிட்டீர்கள். (${finalLandmark})`);
  } else {
    steps.push(`You have reached your destination: ${finalName}. (${finalLandmark})`);
  }

  return steps;
}

function getFloorName(floorNum, lang) {
  if (floorNum === 0) {
    if (lang === 'hi') return 'ग्राउंड फ्लोर (भू-तल)';
    if (lang === 'ta') return 'தரைத்தளம்';
    return 'Ground Floor';
  } else if (floorNum === 1) {
    if (lang === 'hi') return 'प्रथम तल (मंजिल 1)';
    if (lang === 'ta') return 'முதல் தளம்';
    return 'First Floor';
  } else if (floorNum === 2) {
    if (lang === 'hi') return 'द्वितीय तल (मंजिल 2 - वार्ड)';
    if (lang === 'ta') return 'இரண்டாம் தளம் (வார்டுகள்)';
    return 'Second Floor (Wards)';
  }
  return `Floor ${floorNum}`;
}
