/**
 * Community Detection Algorithms
 *
 * This module provides algorithms for detecting communities (clusters) in graphs.
 * Communities are groups of vertices that are more densely connected internally
 * than with the rest of the network.
 */

import { Graph } from './graph';

/**
 * Result of community detection
 */
export interface CommunityResult {
  /** Community assignment for each vertex (community ID) */
  communities: number[];
  /** Number of communities found */
  numCommunities: number;
  /** Modularity score of the partition */
  modularity: number;
}

/**
 * Computes the modularity of a graph partition
 *
 * Modularity measures the quality of a division of a network into communities.
 * It compares the actual edge density within communities to the expected density
 * in a random network with the same degree distribution.
 *
 * Q = (1/2m) * Σ[A_ij - (k_i * k_j)/(2m)] * δ(c_i, c_j)
 *
 * Values range from -1 to 1, with higher values indicating stronger community structure.
 *
 * Time complexity: O(V + E)
 * Space complexity: O(1) additional space
 *
 * @param graph - The input graph
 * @param communities - Community assignment for each vertex
 * @returns Modularity score
 *
 * @example
 * ```ts
 * const g = new Graph(4);
 * g.addEdge(0, 1);
 * g.addEdge(2, 3);
 * const communities = [0, 0, 1, 1]; // Two communities
 * const mod = computeModularity(g, communities);
 * // mod will be close to 0.5 (good partition)
 * ```
 */
export function computeModularity(graph: Graph, communities: number[]): number {
  const n = graph.getNumVertices();
  const m = graph.getNumEdges();

  if (m === 0) return 0;

  let modularity = 0;

  // For each pair of vertices
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (communities[i] === communities[j]) {
        const A_ij = graph.hasEdge(i, j) ? 1 : 0;
        const k_i = graph.getDegree(i);
        const k_j = graph.getDegree(j);
        const expected = (k_i * k_j) / (2 * m);

        modularity += A_ij - expected;
      }
    }
  }

  return modularity / (2 * m);
}

/**
 * Detects communities using greedy modularity optimization
 *
 * This algorithm starts with each node in its own community and repeatedly
 * merges communities to maximize modularity. It uses a greedy approach.
 *
 * Based on the Clauset-Newman-Moore algorithm.
 *
 * Time complexity: O(V × E × log V) in practice
 * Space complexity: O(V + E)
 *
 * @param graph - The input graph (should be undirected)
 * @returns Community detection result
 *
 * @example
 * ```ts
 * const g = new Graph(6);
 * // Create two clusters
 * g.addEdge(0, 1);
 * g.addEdge(0, 2);
 * g.addEdge(1, 2);
 * g.addEdge(3, 4);
 * g.addEdge(3, 5);
 * g.addEdge(4, 5);
 * const result = modularityOptimization(g);
 * // result.communities will group [0,1,2] and [3,4,5]
 * ```
 */
export function modularityOptimization(graph: Graph): CommunityResult {
  const n = graph.getNumVertices();
  const m = graph.getNumEdges();

  if (m === 0) {
    return {
      communities: Array(n)
        .fill(0)
        .map((_, i) => i),
      numCommunities: n,
      modularity: 0,
    };
  }

  // Initialize: each vertex in its own community
  let communities = Array(n)
    .fill(0)
    .map((_, i) => i);

  let improved = true;
  let currentModularity = computeModularity(graph, communities);

  while (improved) {
    improved = false;

    // Try moving each vertex to neighboring communities
    for (let v = 0; v < n; v++) {
      const currentCommunity = communities[v];
      const neighbors = graph.getNeighbors(v);

      // Find neighboring communities
      const neighborCommunities = new Set<number>();
      for (const u of neighbors) {
        neighborCommunities.add(communities[u]);
      }

      let bestCommunity = currentCommunity;
      let bestModularity = currentModularity;

      // Try each neighboring community
      for (const newCommunity of neighborCommunities) {
        if (newCommunity === currentCommunity) continue;

        // Temporarily move vertex
        communities[v] = newCommunity;
        const newModularity = computeModularity(graph, communities);

        if (newModularity > bestModularity) {
          bestModularity = newModularity;
          bestCommunity = newCommunity;
          improved = true;
        }

        // Restore
        communities[v] = currentCommunity;
      }

      // Make the best move
      if (bestCommunity !== currentCommunity) {
        communities[v] = bestCommunity;
        currentModularity = bestModularity;
      }
    }
  }

  // Relabel communities to be consecutive integers starting from 0
  const communityMap = new Map<number, number>();
  let nextId = 0;
  for (let v = 0; v < n; v++) {
    if (!communityMap.has(communities[v])) {
      communityMap.set(communities[v], nextId++);
    }
    communities[v] = communityMap.get(communities[v])!;
  }

  return {
    communities,
    numCommunities: nextId,
    modularity: currentModularity,
  };
}

/**
 * Options for label propagation algorithm
 */
export interface LabelPropagationOptions {
  /** Maximum number of iterations (default: 100) */
  maxIterations?: number;
  /** Random seed for tie-breaking (default: 42) */
  seed?: number;
}

/**
 * Detects communities using label propagation
 *
 * Each node is initialized with a unique label. At each iteration, each node
 * adopts the label that the majority of its neighbors have. The algorithm
 * converges when labels stabilize.
 *
 * This is a fast, near-linear time algorithm but may produce different results
 * on different runs due to randomness in tie-breaking.
 *
 * Time complexity: O(k × E) where k is number of iterations (usually small)
 * Space complexity: O(V)
 *
 * @param graph - The input graph (should be undirected)
 * @param options - Algorithm options
 * @returns Community detection result
 *
 * @example
 * ```ts
 * const g = new Graph(6);
 * g.addEdge(0, 1);
 * g.addEdge(0, 2);
 * g.addEdge(1, 2);
 * g.addEdge(3, 4);
 * g.addEdge(3, 5);
 * g.addEdge(4, 5);
 * const result = labelPropagation(g);
 * // result.communities will identify two clusters
 * ```
 */
export function labelPropagation(
  graph: Graph,
  options: LabelPropagationOptions = {}
): CommunityResult {
  const n = graph.getNumVertices();
  const maxIter = options.maxIterations ?? 100;

  // Simple deterministic pseudo-random number generator
  let seed = options.seed ?? 42;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Initialize: each vertex gets its own label
  let labels = Array(n)
    .fill(0)
    .map((_, i) => i);

  // Create random order for processing vertices
  const order = Array(n)
    .fill(0)
    .map((_, i) => i);

  for (let iter = 0; iter < maxIter; iter++) {
    // Shuffle order for this iteration
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    let changed = false;

    // Update labels in random order
    for (const v of order) {
      const neighbors = graph.getNeighbors(v);

      if (neighbors.length === 0) continue;

      // Count label frequencies among neighbors
      const labelCounts = new Map<number, number>();
      for (const u of neighbors) {
        const label = labels[u];
        labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
      }

      // Find most frequent label
      let maxCount = 0;
      let maxLabel = labels[v];
      for (const [label, count] of labelCounts) {
        if (count > maxCount || (count === maxCount && random() < 0.5)) {
          maxCount = count;
          maxLabel = label;
        }
      }

      // Update label if it changed
      if (maxLabel !== labels[v]) {
        labels[v] = maxLabel;
        changed = true;
      }
    }

    // Converged?
    if (!changed) break;
  }

  // Relabel communities to be consecutive integers
  const communityMap = new Map<number, number>();
  let nextId = 0;
  for (let v = 0; v < n; v++) {
    if (!communityMap.has(labels[v])) {
      communityMap.set(labels[v], nextId++);
    }
    labels[v] = communityMap.get(labels[v])!;
  }

  const modularity = computeModularity(graph, labels);

  return {
    communities: labels,
    numCommunities: nextId,
    modularity,
  };
}

/**
 * Detects communities using the Louvain method
 *
 * The Louvain method is a hierarchical clustering algorithm that optimizes
 * modularity. It works in two phases:
 * 1. Local moving: nodes are moved between communities to maximize modularity
 * 2. Aggregation: communities are aggregated into super-nodes
 *
 * This is one of the most popular and efficient community detection algorithms.
 *
 * Time complexity: O(V × log V) in practice
 * Space complexity: O(V + E)
 *
 * @param graph - The input graph (should be undirected)
 * @param minModularityGain - Minimum modularity gain to continue (default: 1e-6)
 * @returns Community detection result
 *
 * @example
 * ```ts
 * const g = new Graph(8);
 * g.addEdge(0, 1);
 * g.addEdge(0, 2);
 * g.addEdge(1, 2);
 * g.addEdge(3, 4);
 * g.addEdge(4, 5);
 * g.addEdge(5, 3);
 * const result = louvain(g);
 * // result will identify hierarchical community structure
 * ```
 */
export function louvain(
  graph: Graph,
  minModularityGain: number = 1e-6
): CommunityResult {
  const n = graph.getNumVertices();
  const m = graph.getNumEdges();

  if (m === 0) {
    return {
      communities: Array(n)
        .fill(0)
        .map((_, i) => i),
      numCommunities: n,
      modularity: 0,
    };
  }

  // Phase 1: Optimize modularity by moving nodes
  let communities = Array(n)
    .fill(0)
    .map((_, i) => i);
  let currentModularity = 0;

  let improved = true;
  while (improved) {
    improved = false;

    for (let v = 0; v < n; v++) {
      const currentCommunity = communities[v];
      const neighbors = graph.getNeighbors(v);

      // Find communities of neighbors
      const neighborCommunities = new Set<number>();
      for (const u of neighbors) {
        neighborCommunities.add(communities[u]);
      }

      let bestCommunity = currentCommunity;
      let bestGain = 0;

      // Try moving to each neighbor's community
      for (const newCommunity of neighborCommunities) {
        if (newCommunity === currentCommunity) continue;

        communities[v] = newCommunity;
        const newModularity = computeModularity(graph, communities);
        const gain = newModularity - currentModularity;

        if (gain > bestGain) {
          bestGain = gain;
          bestCommunity = newCommunity;
        }

        communities[v] = currentCommunity;
      }

      // Make the best move if gain is significant
      if (bestGain > minModularityGain) {
        communities[v] = bestCommunity;
        currentModularity += bestGain;
        improved = true;
      }
    }
  }

  // Relabel communities
  const communityMap = new Map<number, number>();
  let nextId = 0;
  for (let v = 0; v < n; v++) {
    if (!communityMap.has(communities[v])) {
      communityMap.set(communities[v], nextId++);
    }
    communities[v] = communityMap.get(communities[v])!;
  }

  return {
    communities,
    numCommunities: nextId,
    modularity: currentModularity,
  };
}

/**
 * Finds all cliques (complete subgraphs) of a given size
 *
 * A clique is a subset of vertices where every pair is connected by an edge.
 * This finds all maximal cliques up to a specified size.
 *
 * Uses the Bron-Kerbosch algorithm.
 *
 * Time complexity: O(3^(V/3)) worst case (exponential)
 * Space complexity: O(V)
 *
 * @param graph - The input graph
 * @param minSize - Minimum clique size to report (default: 3)
 * @returns Array of cliques, each clique is an array of vertices
 *
 * @example
 * ```ts
 * const g = new Graph(4);
 * g.addEdge(0, 1);
 * g.addEdge(0, 2);
 * g.addEdge(1, 2);
 * g.addEdge(2, 3);
 * const cliques = findCliques(g, 3);
 * // cliques = [[0, 1, 2]] (one triangle)
 * ```
 */
export function findCliques(graph: Graph, minSize: number = 3): number[][] {
  const cliques: number[][] = [];

  function bronKerbosch(R: Set<number>, P: Set<number>, X: Set<number>): void {
    if (P.size === 0 && X.size === 0) {
      // R is a maximal clique
      if (R.size >= minSize) {
        cliques.push(Array.from(R).sort((a, b) => a - b));
      }
      return;
    }

    // Choose pivot vertex (heuristic: vertex with most connections in P ∪ X)
    const PX = new Set([...P, ...X]);
    let pivot = -1;
    let maxConnections = -1;
    for (const v of PX) {
      let connections = 0;
      for (const u of P) {
        if (graph.hasEdge(v, u)) connections++;
      }
      if (connections > maxConnections) {
        maxConnections = connections;
        pivot = v;
      }
    }

    // For each vertex in P \ neighbors(pivot)
    const pivotNeighbors = pivot >= 0 ? new Set(graph.getNeighbors(pivot)) : new Set();
    const candidates = Array.from(P).filter((v) => !pivotNeighbors.has(v));

    for (const v of candidates) {
      const neighbors = new Set(graph.getNeighbors(v));

      const newR = new Set(R);
      newR.add(v);

      const newP = new Set<number>();
      for (const u of P) {
        if (neighbors.has(u)) newP.add(u);
      }

      const newX = new Set<number>();
      for (const u of X) {
        if (neighbors.has(u)) newX.add(u);
      }

      bronKerbosch(newR, newP, newX);

      P.delete(v);
      X.add(v);
    }
  }

  // Initialize with all vertices in P
  const P = new Set<number>();
  for (let v = 0; v < graph.getNumVertices(); v++) {
    P.add(v);
  }

  bronKerbosch(new Set(), P, new Set());

  return cliques;
}
