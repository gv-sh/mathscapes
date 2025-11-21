/**
 * Graph Centrality Measures
 *
 * This module provides various centrality measures for analyzing node importance
 * in graphs. Centrality measures help identify the most influential nodes.
 */

import { Graph } from './graph';

/**
 * Result of centrality computation
 */
export interface CentralityResult {
  /** Centrality value for each vertex */
  centrality: number[];
  /** Vertex with highest centrality */
  maxVertex: number;
  /** Maximum centrality value */
  maxValue: number;
}

/**
 * Computes degree centrality for all vertices
 *
 * Degree centrality is the simplest measure: the number of edges connected to a vertex.
 * For directed graphs, uses out-degree by default.
 *
 * Time complexity: O(V)
 * Space complexity: O(V)
 *
 * @param graph - The input graph
 * @param normalized - Whether to normalize values to [0, 1] (default: true)
 * @returns Centrality values for each vertex
 *
 * @example
 * ```ts
 * const g = new Graph(5);
 * g.addEdge(0, 1);
 * g.addEdge(0, 2);
 * g.addEdge(1, 2);
 * const result = degreeCentrality(g);
 * // result.centrality[0] = 2 (highest degree)
 * ```
 */
export function degreeCentrality(
  graph: Graph,
  normalized: boolean = true
): CentralityResult {
  const n = graph.getNumVertices();
  const centrality: number[] = [];

  for (let v = 0; v < n; v++) {
    centrality[v] = graph.getDegree(v);
  }

  // Normalize if requested
  if (normalized && n > 1) {
    const maxDegree = n - 1;
    for (let v = 0; v < n; v++) {
      centrality[v] /= maxDegree;
    }
  }

  // Find max
  let maxVertex = 0;
  let maxValue = centrality[0];
  for (let v = 1; v < n; v++) {
    if (centrality[v] > maxValue) {
      maxValue = centrality[v];
      maxVertex = v;
    }
  }

  return { centrality, maxVertex, maxValue };
}

/**
 * Computes betweenness centrality for all vertices
 *
 * Betweenness centrality measures how often a node appears on shortest paths
 * between other nodes. High betweenness indicates a node is a bridge between
 * different parts of the network.
 *
 * Uses Brandes' algorithm for efficient computation.
 *
 * Time complexity: O(V × E) for unweighted graphs
 * Space complexity: O(V + E)
 *
 * @param graph - The input graph
 * @param normalized - Whether to normalize values to [0, 1] (default: true)
 * @returns Centrality values for each vertex
 *
 * @example
 * ```ts
 * const g = new Graph(5);
 * g.addEdge(0, 2);
 * g.addEdge(1, 2);
 * g.addEdge(2, 3);
 * g.addEdge(2, 4);
 * const result = betweennessCentrality(g);
 * // result.centrality[2] is highest (vertex 2 is a bridge)
 * ```
 */
export function betweennessCentrality(
  graph: Graph,
  normalized: boolean = true
): CentralityResult {
  const n = graph.getNumVertices();
  const centrality: number[] = Array(n).fill(0);

  // Brandes' algorithm
  for (let s = 0; s < n; s++) {
    const stack: number[] = [];
    const predecessors: number[][] = Array(n)
      .fill(0)
      .map(() => []);
    const sigma: number[] = Array(n).fill(0);
    const distance: number[] = Array(n).fill(-1);
    const delta: number[] = Array(n).fill(0);

    sigma[s] = 1;
    distance[s] = 0;

    // BFS to find shortest paths
    const queue: number[] = [s];
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);

      for (const w of graph.getNeighbors(v)) {
        // First time we see w?
        if (distance[w] < 0) {
          queue.push(w);
          distance[w] = distance[v] + 1;
        }

        // Shortest path to w via v?
        if (distance[w] === distance[v] + 1) {
          sigma[w] += sigma[v];
          predecessors[w].push(v);
        }
      }
    }

    // Accumulation: back-propagation of dependencies
    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of predecessors[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      }
      if (w !== s) {
        centrality[w] += delta[w];
      }
    }
  }

  // Normalize
  if (normalized && n > 2) {
    // For undirected graphs: divide by 2 (each path counted twice)
    const factor = graph.isDirected() ? (n - 1) * (n - 2) : (n - 1) * (n - 2) / 2;
    for (let v = 0; v < n; v++) {
      centrality[v] /= factor;
    }
  } else if (!graph.isDirected()) {
    // Even without normalization, divide by 2 for undirected
    for (let v = 0; v < n; v++) {
      centrality[v] /= 2;
    }
  }

  // Find max
  let maxVertex = 0;
  let maxValue = centrality[0];
  for (let v = 1; v < n; v++) {
    if (centrality[v] > maxValue) {
      maxValue = centrality[v];
      maxVertex = v;
    }
  }

  return { centrality, maxVertex, maxValue };
}

/**
 * Computes closeness centrality for all vertices
 *
 * Closeness centrality measures how close a node is to all other nodes in the
 * network. It's the inverse of the average shortest path distance to all other nodes.
 *
 * Time complexity: O(V × E) using BFS
 * Space complexity: O(V)
 *
 * @param graph - The input graph
 * @param normalized - Whether to normalize values to [0, 1] (default: true)
 * @returns Centrality values for each vertex
 *
 * @example
 * ```ts
 * const g = new Graph(5);
 * g.addEdge(0, 1);
 * g.addEdge(1, 2);
 * g.addEdge(2, 3);
 * g.addEdge(3, 4);
 * const result = closenessCentrality(g);
 * // result.centrality[2] is highest (center of the path)
 * ```
 */
export function closenessCentrality(
  graph: Graph,
  normalized: boolean = true
): CentralityResult {
  const n = graph.getNumVertices();
  const centrality: number[] = [];

  for (let source = 0; source < n; source++) {
    // BFS to compute distances
    const distance: number[] = Array(n).fill(-1);
    distance[source] = 0;
    const queue: number[] = [source];

    while (queue.length > 0) {
      const v = queue.shift()!;
      for (const w of graph.getNeighbors(v)) {
        if (distance[w] < 0) {
          distance[w] = distance[v] + 1;
          queue.push(w);
        }
      }
    }

    // Compute closeness
    let totalDistance = 0;
    let reachable = 0;
    for (let v = 0; v < n; v++) {
      if (v !== source && distance[v] > 0) {
        totalDistance += distance[v];
        reachable++;
      }
    }

    if (reachable === 0) {
      centrality[source] = 0;
    } else {
      // Closeness = (n-1) / sum of distances
      if (normalized && n > 1) {
        // Normalized: multiply by (reachable / (n-1))
        centrality[source] = reachable / totalDistance * (reachable / (n - 1));
      } else {
        centrality[source] = reachable / totalDistance;
      }
    }
  }

  // Find max
  let maxVertex = 0;
  let maxValue = centrality[0];
  for (let v = 1; v < n; v++) {
    if (centrality[v] > maxValue) {
      maxValue = centrality[v];
      maxVertex = v;
    }
  }

  return { centrality, maxVertex, maxValue };
}

/**
 * Options for PageRank computation
 */
export interface PageRankOptions {
  /** Damping factor (default: 0.85) */
  dampingFactor?: number;
  /** Maximum number of iterations (default: 100) */
  maxIterations?: number;
  /** Convergence tolerance (default: 1e-6) */
  tolerance?: number;
}

/**
 * Computes PageRank centrality for all vertices
 *
 * PageRank is Google's algorithm for ranking web pages. It models a random surfer
 * who follows links with probability d (damping factor) and jumps to a random page
 * with probability (1-d).
 *
 * Time complexity: O(k × E) where k is number of iterations
 * Space complexity: O(V)
 *
 * @param graph - The input graph (should be directed)
 * @param options - PageRank options
 * @returns Centrality values for each vertex
 *
 * @example
 * ```ts
 * const g = new Graph(4, { directed: true });
 * g.addEdge(0, 1);
 * g.addEdge(1, 2);
 * g.addEdge(2, 0);
 * g.addEdge(1, 3);
 * const result = pageRank(g);
 * // Higher PageRank for nodes with more incoming links
 * ```
 */
export function pageRank(
  graph: Graph,
  options: PageRankOptions = {}
): CentralityResult {
  const n = graph.getNumVertices();
  const d = options.dampingFactor ?? 0.85;
  const maxIter = options.maxIterations ?? 100;
  const tol = options.tolerance ?? 1e-6;

  // Initialize PageRank values
  let rank: number[] = Array(n).fill(1 / n);
  let newRank: number[] = Array(n).fill(0);

  // Power iteration
  for (let iter = 0; iter < maxIter; iter++) {
    // Reset new ranks
    newRank.fill((1 - d) / n);

    // Distribute rank from each vertex
    for (let v = 0; v < n; v++) {
      const neighbors = graph.getNeighbors(v);
      const outDegree = neighbors.length;

      if (outDegree > 0) {
        const contribution = (d * rank[v]) / outDegree;
        for (const w of neighbors) {
          newRank[w] += contribution;
        }
      } else {
        // Dangling node: distribute to all nodes
        const contribution = (d * rank[v]) / n;
        for (let w = 0; w < n; w++) {
          newRank[w] += contribution;
        }
      }
    }

    // Check convergence
    let diff = 0;
    for (let v = 0; v < n; v++) {
      diff += Math.abs(newRank[v] - rank[v]);
    }

    if (diff < tol) {
      rank = newRank;
      break;
    }

    // Swap arrays
    [rank, newRank] = [newRank, rank];
  }

  // Find max
  let maxVertex = 0;
  let maxValue = rank[0];
  for (let v = 1; v < n; v++) {
    if (rank[v] > maxValue) {
      maxValue = rank[v];
      maxVertex = v;
    }
  }

  return { centrality: rank, maxVertex, maxValue };
}

/**
 * Computes eigenvector centrality for all vertices
 *
 * Eigenvector centrality assigns scores to nodes based on the concept that
 * connections to high-scoring nodes contribute more than connections to low-scoring nodes.
 * It's the principal eigenvector of the adjacency matrix.
 *
 * Uses power iteration method.
 *
 * Time complexity: O(k × E) where k is number of iterations
 * Space complexity: O(V)
 *
 * @param graph - The input graph
 * @param maxIterations - Maximum iterations (default: 100)
 * @param tolerance - Convergence tolerance (default: 1e-6)
 * @returns Centrality values for each vertex
 *
 * @example
 * ```ts
 * const g = new Graph(4);
 * g.addEdge(0, 1);
 * g.addEdge(1, 2);
 * g.addEdge(2, 3);
 * g.addEdge(3, 1);
 * const result = eigenvectorCentrality(g);
 * ```
 */
export function eigenvectorCentrality(
  graph: Graph,
  maxIterations: number = 100,
  tolerance: number = 1e-6
): CentralityResult {
  const n = graph.getNumVertices();

  // Initialize with uniform values
  let x: number[] = Array(n).fill(1 / Math.sqrt(n));
  let newX: number[] = Array(n).fill(0);

  // Power iteration
  for (let iter = 0; iter < maxIterations; iter++) {
    newX.fill(0);

    // Matrix-vector multiplication: Ax
    for (let v = 0; v < n; v++) {
      for (const w of graph.getNeighbors(v)) {
        newX[w] += x[v];
      }
    }

    // Normalize
    let norm = 0;
    for (let v = 0; v < n; v++) {
      norm += newX[v] * newX[v];
    }
    norm = Math.sqrt(norm);

    // Avoid division by zero
    if (norm < 1e-10) {
      // Graph might be disconnected or have no edges
      return {
        centrality: Array(n).fill(0),
        maxVertex: 0,
        maxValue: 0,
      };
    }

    for (let v = 0; v < n; v++) {
      newX[v] /= norm;
    }

    // Check convergence
    let diff = 0;
    for (let v = 0; v < n; v++) {
      diff += Math.abs(newX[v] - x[v]);
    }

    if (diff < tolerance) {
      x = newX;
      break;
    }

    [x, newX] = [newX, x];
  }

  // Ensure all values are non-negative (take absolute value)
  for (let v = 0; v < n; v++) {
    x[v] = Math.abs(x[v]);
  }

  // Find max
  let maxVertex = 0;
  let maxValue = x[0];
  for (let v = 1; v < n; v++) {
    if (x[v] > maxValue) {
      maxValue = x[v];
      maxVertex = v;
    }
  }

  return { centrality: x, maxVertex, maxValue };
}
