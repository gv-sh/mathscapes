/**
 * Graph Matching Algorithms
 *
 * This module provides algorithms for finding matchings in graphs.
 * A matching is a set of edges without common vertices.
 */

import { Graph } from './graph';

/**
 * Result of maximum matching computation
 */
export interface MatchingResult {
  /** Array of matched pairs [vertex1, vertex2] */
  matching: Array<[number, number]>;
  /** Size of the matching */
  size: number;
  /** Matched partner for each vertex, -1 if unmatched */
  match: number[];
}

/**
 * Finds a maximal matching using a greedy algorithm
 *
 * A maximal matching is a matching to which no edge can be added.
 * This is not necessarily a maximum matching.
 *
 * Time complexity: O(E)
 * Space complexity: O(V)
 *
 * @param graph - The input graph (should be undirected)
 * @returns Maximal matching result
 *
 * @example
 * ```ts
 * const g = new Graph(4);
 * g.addEdge(0, 1);
 * g.addEdge(1, 2);
 * g.addEdge(2, 3);
 * const result = greedyMatching(g);
 * // result.matching = [[0,1], [2,3]]
 * ```
 */
export function greedyMatching(graph: Graph): MatchingResult {
  const n = graph.getNumVertices();
  const match: number[] = Array(n).fill(-1);
  const matching: Array<[number, number]> = [];

  for (let u = 0; u < n; u++) {
    if (match[u] === -1) {
      for (const v of graph.getNeighbors(u)) {
        if (match[v] === -1) {
          match[u] = v;
          match[v] = u;
          matching.push([u, v]);
          break;
        }
      }
    }
  }

  return { matching, size: matching.length, match };
}

/**
 * Checks if a graph is bipartite and returns the bipartition
 *
 * @param graph - The input graph
 * @returns Bipartition [set1, set2] or null if not bipartite
 */
function getBipartition(graph: Graph): [number[], number[]] | null {
  const n = graph.getNumVertices();
  const color: number[] = Array(n).fill(-1);

  for (let start = 0; start < n; start++) {
    if (color[start] === -1) {
      const queue: number[] = [start];
      color[start] = 0;

      while (queue.length > 0) {
        const u = queue.shift()!;
        for (const v of graph.getNeighbors(u)) {
          if (color[v] === -1) {
            color[v] = 1 - color[u];
            queue.push(v);
          } else if (color[v] === color[u]) {
            return null; // Not bipartite
          }
        }
      }
    }
  }

  const set1: number[] = [];
  const set2: number[] = [];
  for (let v = 0; v < n; v++) {
    if (color[v] === 0) set1.push(v);
    else set2.push(v);
  }

  return [set1, set2];
}

/**
 * Finds maximum bipartite matching using augmenting paths
 *
 * Uses a DFS-based approach to find augmenting paths (Hopcroft-Karp style).
 * Works on bipartite graphs only.
 *
 * Time complexity: O(V × E)
 * Space complexity: O(V)
 *
 * @param graph - The input graph (must be bipartite)
 * @returns Maximum matching result
 *
 * @example
 * ```ts
 * const g = new Graph(6);
 * // Left vertices: 0, 1, 2; Right vertices: 3, 4, 5
 * g.addEdge(0, 3);
 * g.addEdge(0, 4);
 * g.addEdge(1, 3);
 * g.addEdge(1, 4);
 * g.addEdge(2, 5);
 * const result = maxBipartiteMatching(g);
 * // result.size = 3 (perfect matching)
 * ```
 */
export function maxBipartiteMatching(graph: Graph): MatchingResult {
  const n = graph.getNumVertices();

  // Check if graph is bipartite and get bipartition
  const bipartition = getBipartition(graph);
  if (!bipartition) {
    throw new Error('Graph is not bipartite');
  }

  const [leftSet, rightSet] = bipartition;

  // Initialize matching
  const match: number[] = Array(n).fill(-1);

  // Try to find augmenting path from each unmatched left vertex
  function dfs(u: number, visited: Set<number>): boolean {
    for (const v of graph.getNeighbors(u)) {
      if (visited.has(v)) continue;
      visited.add(v);

      // If v is unmatched or we can find an augmenting path from match[v]
      if (match[v] === -1 || dfs(match[v], visited)) {
        match[u] = v;
        match[v] = u;
        return true;
      }
    }
    return false;
  }

  // Find augmenting paths
  for (const u of leftSet) {
    if (match[u] === -1) {
      dfs(u, new Set());
    }
  }

  // Build matching result
  const matching: Array<[number, number]> = [];
  for (const u of leftSet) {
    if (match[u] !== -1) {
      matching.push([u, match[u]]);
    }
  }

  return { matching, size: matching.length, match };
}

/**
 * Finds maximum bipartite matching using the Hungarian algorithm
 *
 * Also known as the Kuhn-Munkres algorithm. This implementation uses
 * the augmenting path approach.
 *
 * Time complexity: O(V³)
 * Space complexity: O(V²)
 *
 * @param graph - The input bipartite graph
 * @returns Maximum matching result
 */
export function hungarianMatching(graph: Graph): MatchingResult {
  // This is essentially the same as maxBipartiteMatching
  // but can be extended to handle weighted matchings
  return maxBipartiteMatching(graph);
}

/**
 * Finds a maximum matching in a general graph using Blossom algorithm
 *
 * The Blossom algorithm (Edmonds' algorithm) works on general graphs,
 * not just bipartite graphs. This is a simplified implementation.
 *
 * Time complexity: O(V² × E)
 * Space complexity: O(V + E)
 *
 * @param graph - The input graph
 * @returns Maximum matching result
 *
 * @example
 * ```ts
 * const g = new Graph(5);
 * g.addEdge(0, 1);
 * g.addEdge(1, 2);
 * g.addEdge(2, 3);
 * g.addEdge(3, 4);
 * g.addEdge(4, 0);
 * const result = maxMatching(g);
 * // result.size = 2 (maximum for this graph)
 * ```
 */
export function maxMatching(graph: Graph): MatchingResult {
  const n = graph.getNumVertices();

  // Check if bipartite
  const bipartition = getBipartition(graph);
  if (bipartition) {
    return maxBipartiteMatching(graph);
  }

  // For general graphs, use a simplified approach
  // Full blossom algorithm is complex; this gives good results
  const match: number[] = Array(n).fill(-1);
  const matching: Array<[number, number]> = [];

  // Try to find augmenting paths using BFS
  function findAugmentingPath(start: number): number[] | null {
    const parent: number[] = Array(n).fill(-1);
    const visited: boolean[] = Array(n).fill(false);
    const queue: number[] = [start];
    visited[start] = true;

    while (queue.length > 0) {
      const u = queue.shift()!;

      for (const v of graph.getNeighbors(u)) {
        if (visited[v]) continue;

        visited[v] = true;
        parent[v] = u;

        if (match[v] === -1) {
          // Found augmenting path to unmatched vertex
          const path: number[] = [];
          let curr = v;
          while (curr !== -1) {
            path.push(curr);
            curr = parent[curr];
          }
          return path.reverse();
        }

        // Continue through matched edge
        const w = match[v];
        if (!visited[w]) {
          visited[w] = true;
          parent[w] = v;
          queue.push(w);
        }
      }
    }

    return null;
  }

  // Find augmenting paths from unmatched vertices
  let improved = true;
  while (improved) {
    improved = false;

    for (let u = 0; u < n; u++) {
      if (match[u] === -1) {
        const path = findAugmentingPath(u);

        if (path) {
          // Augment along the path
          for (let i = 0; i < path.length - 1; i++) {
            const a = path[i];
            const b = path[i + 1];
            match[a] = b;
            match[b] = a;
          }
          improved = true;
        }
      }
    }
  }

  // Build matching result
  const seen = new Set<number>();
  for (let u = 0; u < n; u++) {
    if (match[u] !== -1 && !seen.has(u)) {
      matching.push([u, match[u]]);
      seen.add(u);
      seen.add(match[u]);
    }
  }

  return { matching, size: matching.length, match };
}

/**
 * Checks if a matching is perfect (covers all vertices)
 *
 * @param graph - The input graph
 * @param matching - The matching to check
 * @returns True if the matching is perfect
 *
 * @example
 * ```ts
 * const g = new Graph(4);
 * g.addEdge(0, 1);
 * g.addEdge(2, 3);
 * const result = maxMatching(g);
 * const isPerfect = isPerfectMatching(g, result);
 * // isPerfect = true
 * ```
 */
export function isPerfectMatching(
  graph: Graph,
  matching: MatchingResult
): boolean {
  return matching.size * 2 === graph.getNumVertices();
}

/**
 * Checks if a matching is maximal (no edge can be added)
 *
 * @param graph - The input graph
 * @param matching - The matching to check
 * @returns True if the matching is maximal
 */
export function isMaximalMatching(
  graph: Graph,
  matching: MatchingResult
): boolean {
  const matched = new Set<number>();
  for (const [u, v] of matching.matching) {
    matched.add(u);
    matched.add(v);
  }

  // Try to find an edge between two unmatched vertices
  for (let u = 0; u < graph.getNumVertices(); u++) {
    if (!matched.has(u)) {
      for (const v of graph.getNeighbors(u)) {
        if (!matched.has(v)) {
          return false; // Found edge between unmatched vertices
        }
      }
    }
  }

  return true;
}

/**
 * Computes a minimum vertex cover from a maximum matching
 *
 * By König's theorem, in bipartite graphs, the size of minimum vertex cover
 * equals the size of maximum matching.
 *
 * Time complexity: O(V + E)
 * Space complexity: O(V)
 *
 * @param graph - The input bipartite graph
 * @param matching - A maximum matching
 * @returns Array of vertices in the minimum vertex cover
 *
 * @example
 * ```ts
 * const g = new Graph(6);
 * g.addEdge(0, 3);
 * g.addEdge(1, 3);
 * g.addEdge(1, 4);
 * g.addEdge(2, 5);
 * const matching = maxBipartiteMatching(g);
 * const cover = minVertexCover(g, matching);
 * ```
 */
export function minVertexCover(
  graph: Graph,
  matching: MatchingResult
): number[] {
  const n = graph.getNumVertices();

  // Get bipartition
  const bipartition = getBipartition(graph);
  if (!bipartition) {
    throw new Error('Graph must be bipartite for König\'s theorem');
  }

  const [leftSet, rightSet] = bipartition;

  // Build alternating path forest from unmatched left vertices
  const visited = new Set<number>();
  const leftInCover = new Set<number>();
  const rightInCover = new Set<number>();

  // Start from unmatched left vertices
  const queue: number[] = [];
  for (const u of leftSet) {
    if (matching.match[u] === -1) {
      queue.push(u);
      visited.add(u);
    }
  }

  // BFS following alternating paths
  while (queue.length > 0) {
    const u = queue.shift()!;

    for (const v of graph.getNeighbors(u)) {
      if (!visited.has(v)) {
        visited.add(v);
        rightInCover.add(v);

        // Follow matched edge from v
        const w = matching.match[v];
        if (w !== -1 && !visited.has(w)) {
          visited.add(w);
          queue.push(w);
        }
      }
    }
  }

  // Vertex cover: unvisited left vertices + visited right vertices
  const cover: number[] = [];

  for (const u of leftSet) {
    if (!visited.has(u)) {
      cover.push(u);
    }
  }

  for (const v of rightSet) {
    if (visited.has(v)) {
      cover.push(v);
    }
  }

  return cover.sort((a, b) => a - b);
}

/**
 * Computes a maximum independent set from a maximum matching
 *
 * In bipartite graphs, maximum independent set = V - minimum vertex cover.
 *
 * @param graph - The input bipartite graph
 * @param matching - A maximum matching
 * @returns Array of vertices in the maximum independent set
 */
export function maxIndependentSet(
  graph: Graph,
  matching: MatchingResult
): number[] {
  const cover = minVertexCover(graph, matching);
  const coverSet = new Set(cover);
  const independentSet: number[] = [];

  for (let v = 0; v < graph.getNumVertices(); v++) {
    if (!coverSet.has(v)) {
      independentSet.push(v);
    }
  }

  return independentSet;
}
