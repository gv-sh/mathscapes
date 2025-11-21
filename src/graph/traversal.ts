/**
 * Graph Traversal Algorithms
 *
 * This module provides graph traversal algorithms including BFS, DFS,
 * and topological sorting.
 */

import { Graph } from './graph';

/**
 * Performs Breadth-First Search (BFS) traversal from a source vertex
 *
 * BFS explores the graph level by level, visiting all neighbors of a vertex
 * before moving to their neighbors. Uses a queue data structure.
 *
 * Time complexity: O(V + E) where V = vertices, E = edges
 * Space complexity: O(V) for the queue and visited set
 *
 * @param graph - The graph to traverse
 * @param start - Starting vertex
 * @param callback - Optional callback function called for each visited vertex
 * @returns Array of vertices in BFS order
 *
 * @example
 * ```ts
 * const g = new Graph(5);
 * g.addEdge(0, 1);
 * g.addEdge(0, 2);
 * g.addEdge(1, 3);
 * g.addEdge(2, 4);
 * const order = bfs(g, 0);
 * // [0, 1, 2, 3, 4]
 * ```
 */
export function bfs(
  graph: Graph,
  start: number,
  callback?: (vertex: number) => void
): number[] {
  const visited = new Set<number>();
  const result: number[] = [];
  const queue: number[] = [start];

  visited.add(start);

  while (queue.length > 0) {
    const vertex = queue.shift()!;
    result.push(vertex);

    if (callback) {
      callback(vertex);
    }

    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

/**
 * Performs Depth-First Search (DFS) traversal from a source vertex
 *
 * DFS explores as far as possible along each branch before backtracking.
 * Uses recursion (or a stack) for traversal.
 *
 * Time complexity: O(V + E) where V = vertices, E = edges
 * Space complexity: O(V) for the recursion stack and visited set
 *
 * @param graph - The graph to traverse
 * @param start - Starting vertex
 * @param callback - Optional callback function called for each visited vertex
 * @returns Array of vertices in DFS order
 *
 * @example
 * ```ts
 * const g = new Graph(5);
 * g.addEdge(0, 1);
 * g.addEdge(0, 2);
 * g.addEdge(1, 3);
 * g.addEdge(2, 4);
 * const order = dfs(g, 0);
 * // [0, 1, 3, 2, 4] (one possible order)
 * ```
 */
export function dfs(
  graph: Graph,
  start: number,
  callback?: (vertex: number) => void
): number[] {
  const visited = new Set<number>();
  const result: number[] = [];

  function dfsRecursive(vertex: number): void {
    visited.add(vertex);
    result.push(vertex);

    if (callback) {
      callback(vertex);
    }

    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfsRecursive(neighbor);
      }
    }
  }

  dfsRecursive(start);
  return result;
}

/**
 * Performs iterative DFS using a stack instead of recursion
 *
 * @param graph - The graph to traverse
 * @param start - Starting vertex
 * @param callback - Optional callback function called for each visited vertex
 * @returns Array of vertices in DFS order
 */
export function dfsIterative(
  graph: Graph,
  start: number,
  callback?: (vertex: number) => void
): number[] {
  const visited = new Set<number>();
  const result: number[] = [];
  const stack: number[] = [start];

  while (stack.length > 0) {
    const vertex = stack.pop()!;

    if (!visited.has(vertex)) {
      visited.add(vertex);
      result.push(vertex);

      if (callback) {
        callback(vertex);
      }

      const neighbors = graph.getNeighbors(vertex);
      // Push in reverse order to maintain left-to-right traversal
      for (let i = neighbors.length - 1; i >= 0; i--) {
        if (!visited.has(neighbors[i])) {
          stack.push(neighbors[i]);
        }
      }
    }
  }

  return result;
}

/**
 * Performs topological sort on a directed acyclic graph (DAG)
 *
 * Topological sorting produces a linear ordering of vertices such that for every
 * directed edge (u, v), vertex u comes before v in the ordering.
 *
 * Uses Kahn's algorithm (BFS-based approach):
 * 1. Find all vertices with in-degree 0
 * 2. Remove them from graph and add to result
 * 3. Update in-degrees of neighbors
 * 4. Repeat until all vertices are processed
 *
 * Time complexity: O(V + E)
 * Space complexity: O(V)
 *
 * @param graph - The directed graph (must be acyclic)
 * @returns Array of vertices in topological order, or null if graph has a cycle
 *
 * @example
 * ```ts
 * const g = new Graph(6, { directed: true });
 * g.addEdge(5, 2);
 * g.addEdge(5, 0);
 * g.addEdge(4, 0);
 * g.addEdge(4, 1);
 * g.addEdge(2, 3);
 * g.addEdge(3, 1);
 * const order = topologicalSort(g);
 * // [4, 5, 2, 0, 3, 1] (one valid ordering)
 * ```
 */
export function topologicalSort(graph: Graph): number[] | null {
  if (!graph.isDirected()) {
    throw new Error('Topological sort requires a directed graph');
  }

  const n = graph.getNumVertices();
  const inDegree = new Array(n).fill(0);
  const result: number[] = [];

  // Calculate in-degrees
  for (let i = 0; i < n; i++) {
    inDegree[i] = graph.getInDegree(i);
  }

  // Find all vertices with in-degree 0
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  // Process vertices
  while (queue.length > 0) {
    const vertex = queue.shift()!;
    result.push(vertex);

    // Reduce in-degree of neighbors
    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If all vertices are not processed, graph has a cycle
  if (result.length !== n) {
    return null;
  }

  return result;
}

/**
 * Performs DFS-based topological sort
 *
 * Alternative implementation using DFS with a post-order traversal.
 * Vertices are added to the result in reverse post-order.
 *
 * @param graph - The directed graph (must be acyclic)
 * @returns Array of vertices in topological order, or null if graph has a cycle
 */
export function topologicalSortDFS(graph: Graph): number[] | null {
  if (!graph.isDirected()) {
    throw new Error('Topological sort requires a directed graph');
  }

  const n = graph.getNumVertices();
  const visited = new Set<number>();
  const recursionStack = new Set<number>();
  const result: number[] = [];

  function dfsVisit(vertex: number): boolean {
    visited.add(vertex);
    recursionStack.add(vertex);

    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (!dfsVisit(neighbor)) {
          return false; // Cycle detected
        }
      } else if (recursionStack.has(neighbor)) {
        return false; // Back edge found, cycle detected
      }
    }

    recursionStack.delete(vertex);
    result.push(vertex);
    return true;
  }

  // Visit all vertices
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      if (!dfsVisit(i)) {
        return null; // Cycle detected
      }
    }
  }

  // Reverse to get topological order
  return result.reverse();
}

/**
 * Detects if a graph has a cycle
 *
 * For directed graphs: Uses DFS with recursion stack
 * For undirected graphs: Uses DFS with parent tracking
 *
 * Time complexity: O(V + E)
 * Space complexity: O(V)
 *
 * @param graph - The graph to check
 * @returns True if graph contains a cycle
 *
 * @example
 * ```ts
 * const g = new Graph(3, { directed: true });
 * g.addEdge(0, 1);
 * g.addEdge(1, 2);
 * g.addEdge(2, 0);
 * hasCycle(g); // true
 * ```
 */
export function hasCycle(graph: Graph): boolean {
  const n = graph.getNumVertices();
  const visited = new Set<number>();

  if (graph.isDirected()) {
    const recursionStack = new Set<number>();

    const hasCycleDFS = (vertex: number): boolean => {
      visited.add(vertex);
      recursionStack.add(vertex);

      const neighbors = graph.getNeighbors(vertex);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true; // Back edge found
        }
      }

      recursionStack.delete(vertex);
      return false;
    };

    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) {
        if (hasCycleDFS(i)) {
          return true;
        }
      }
    }
  } else {
    // Undirected graph
    const hasCycleDFS = (vertex: number, parent: number): boolean => {
      visited.add(vertex);

      const neighbors = graph.getNeighbors(vertex);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor, vertex)) {
            return true;
          }
        } else if (neighbor !== parent) {
          return true; // Cycle found
        }
      }

      return false;
    };

    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) {
        if (hasCycleDFS(i, -1)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Finds all connected components in an undirected graph
 *
 * A connected component is a maximal set of vertices such that there is a path
 * between every pair of vertices.
 *
 * Time complexity: O(V + E)
 * Space complexity: O(V)
 *
 * @param graph - The undirected graph
 * @returns Array of components, each component is an array of vertex indices
 *
 * @example
 * ```ts
 * const g = new Graph(5);
 * g.addEdge(0, 1);
 * g.addEdge(2, 3);
 * const components = connectedComponents(g);
 * // [[0, 1], [2, 3], [4]]
 * ```
 */
export function connectedComponents(graph: Graph): number[][] {
  if (graph.isDirected()) {
    throw new Error('Connected components are defined for undirected graphs');
  }

  const n = graph.getNumVertices();
  const visited = new Set<number>();
  const components: number[][] = [];

  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      const component = bfs(graph, i);
      component.forEach((v) => visited.add(v));
      components.push(component);
    }
  }

  return components;
}

/**
 * Checks if a graph is bipartite
 *
 * A graph is bipartite if its vertices can be divided into two disjoint sets
 * such that every edge connects vertices from different sets.
 *
 * Uses BFS with 2-coloring approach.
 *
 * Time complexity: O(V + E)
 * Space complexity: O(V)
 *
 * @param graph - The graph to check
 * @returns True if graph is bipartite
 *
 * @example
 * ```ts
 * const g = new Graph(4);
 * g.addEdge(0, 1);
 * g.addEdge(1, 2);
 * g.addEdge(2, 3);
 * g.addEdge(3, 0);
 * isBipartite(g); // true (0,2 in one set, 1,3 in other)
 * ```
 */
export function isBipartite(graph: Graph): boolean {
  const n = graph.getNumVertices();
  const color = new Array(n).fill(-1);

  for (let start = 0; start < n; start++) {
    if (color[start] === -1) {
      const queue: number[] = [start];
      color[start] = 0;

      while (queue.length > 0) {
        const vertex = queue.shift()!;
        const neighbors = graph.getNeighbors(vertex);

        for (const neighbor of neighbors) {
          if (color[neighbor] === -1) {
            color[neighbor] = 1 - color[vertex];
            queue.push(neighbor);
          } else if (color[neighbor] === color[vertex]) {
            return false; // Same color as neighbor
          }
        }
      }
    }
  }

  return true;
}
