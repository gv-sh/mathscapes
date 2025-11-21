/**
 * Shortest Path Algorithms
 *
 * This module provides algorithms for finding shortest paths in graphs:
 * - Dijkstra's algorithm (single-source, non-negative weights)
 * - Bellman-Ford algorithm (single-source, handles negative weights)
 * - Floyd-Warshall algorithm (all-pairs shortest paths)
 * - A* pathfinding (heuristic-based search)
 */

import { Graph } from './graph';

/**
 * Result of a shortest path computation
 */
export interface ShortestPathResult {
  distances: number[];
  predecessors: (number | null)[];
}

/**
 * Priority queue element for Dijkstra's algorithm
 */
interface PQElement {
  vertex: number;
  distance: number;
}

/**
 * Simple priority queue implementation using binary heap
 */
class PriorityQueue {
  private heap: PQElement[];

  constructor() {
    this.heap = [];
  }

  push(element: PQElement): void {
    this.heap.push(element);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): PQElement | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].distance >= this.heap[parentIndex].distance) break;

      [this.heap[index], this.heap[parentIndex]] = [
        this.heap[parentIndex],
        this.heap[index],
      ];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].distance < this.heap[smallest].distance
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].distance < this.heap[smallest].distance
      ) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }
}

/**
 * Dijkstra's algorithm for single-source shortest paths
 *
 * Finds shortest paths from a source vertex to all other vertices in a graph
 * with non-negative edge weights. Uses a priority queue for efficiency.
 *
 * Algorithm:
 * 1. Initialize distances to infinity, except source = 0
 * 2. Use priority queue to always process closest unvisited vertex
 * 3. Relax edges: if distance through current vertex is shorter, update
 * 4. Repeat until all vertices processed
 *
 * Time complexity: O((V + E) log V) with binary heap
 * Space complexity: O(V)
 *
 * @param graph - The graph (must have non-negative weights)
 * @param source - Source vertex
 * @returns Object containing distances and predecessors arrays
 *
 * @example
 * ```ts
 * const g = new Graph(5, { weighted: true });
 * g.addEdge(0, 1, 4);
 * g.addEdge(0, 2, 1);
 * g.addEdge(2, 1, 2);
 * g.addEdge(1, 3, 1);
 * g.addEdge(2, 3, 5);
 * const result = dijkstra(g, 0);
 * // result.distances = [0, 3, 1, 4, Infinity]
 * ```
 */
export function dijkstra(graph: Graph, source: number): ShortestPathResult {
  const n = graph.getNumVertices();
  const distances = new Array(n).fill(Infinity);
  const predecessors: (number | null)[] = new Array(n).fill(null);
  const visited = new Set<number>();

  distances[source] = 0;
  const pq = new PriorityQueue();
  pq.push({ vertex: source, distance: 0 });

  while (!pq.isEmpty()) {
    const current = pq.pop()!;
    const vertex = current.vertex;

    if (visited.has(vertex)) continue;
    visited.add(vertex);

    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;

      const weight = graph.getWeight(vertex, neighbor) ?? 1;
      const newDistance = distances[vertex] + weight;

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        predecessors[neighbor] = vertex;
        pq.push({ vertex: neighbor, distance: newDistance });
      }
    }
  }

  return { distances, predecessors };
}

/**
 * Bellman-Ford algorithm for single-source shortest paths
 *
 * Finds shortest paths from a source vertex to all other vertices.
 * Can handle negative edge weights and detect negative cycles.
 *
 * Algorithm:
 * 1. Initialize distances to infinity, except source = 0
 * 2. Relax all edges V-1 times
 * 3. Check for negative cycles by attempting one more relaxation
 *
 * Time complexity: O(V × E)
 * Space complexity: O(V)
 *
 * @param graph - The graph (can have negative weights)
 * @param source - Source vertex
 * @returns Object containing distances and predecessors, or null if negative cycle exists
 *
 * @example
 * ```ts
 * const g = new Graph(5, { directed: true, weighted: true });
 * g.addEdge(0, 1, -1);
 * g.addEdge(0, 2, 4);
 * g.addEdge(1, 2, 3);
 * g.addEdge(1, 3, 2);
 * g.addEdge(1, 4, 2);
 * const result = bellmanFord(g, 0);
 * ```
 */
export function bellmanFord(
  graph: Graph,
  source: number
): ShortestPathResult | null {
  const n = graph.getNumVertices();
  const distances = new Array(n).fill(Infinity);
  const predecessors: (number | null)[] = new Array(n).fill(null);

  distances[source] = 0;

  // Relax edges V-1 times
  for (let i = 0; i < n - 1; i++) {
    const edges = graph.toEdgeList();
    for (const edge of edges) {
      if (distances[edge.from] !== Infinity) {
        const newDistance = distances[edge.from] + (edge.weight ?? 1);
        if (newDistance < distances[edge.to]) {
          distances[edge.to] = newDistance;
          predecessors[edge.to] = edge.from;
        }
      }
    }
  }

  // Check for negative cycles
  const edges = graph.toEdgeList();
  for (const edge of edges) {
    if (distances[edge.from] !== Infinity) {
      const newDistance = distances[edge.from] + (edge.weight ?? 1);
      if (newDistance < distances[edge.to]) {
        return null; // Negative cycle detected
      }
    }
  }

  return { distances, predecessors };
}

/**
 * Floyd-Warshall algorithm for all-pairs shortest paths
 *
 * Finds shortest paths between all pairs of vertices. Can handle negative
 * edge weights but not negative cycles.
 *
 * Algorithm uses dynamic programming:
 * dist[i][j][k] = shortest path from i to j using vertices 0..k as intermediates
 *
 * Time complexity: O(V³)
 * Space complexity: O(V²)
 *
 * @param graph - The graph
 * @returns 2D array where result[i][j] is the shortest distance from i to j
 *
 * @example
 * ```ts
 * const g = new Graph(4, { directed: true, weighted: true });
 * g.addEdge(0, 1, 3);
 * g.addEdge(0, 3, 7);
 * g.addEdge(1, 0, 8);
 * g.addEdge(1, 2, 2);
 * g.addEdge(2, 0, 5);
 * g.addEdge(2, 3, 1);
 * g.addEdge(3, 0, 2);
 * const distances = floydWarshall(g);
 * ```
 */
export function floydWarshall(graph: Graph): number[][] {
  const n = graph.getNumVertices();
  const dist: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(Infinity));

  // Initialize distances
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
  }

  // Add edge weights
  const edges = graph.toEdgeList();
  for (const edge of edges) {
    dist[edge.from][edge.to] = edge.weight ?? 1;
    if (!graph.isDirected()) {
      dist[edge.to][edge.from] = edge.weight ?? 1;
    }
  }

  // Floyd-Warshall algorithm
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  return dist;
}

/**
 * Heuristic function for A* algorithm
 * Estimates the cost from current vertex to goal
 */
export type HeuristicFunction = (vertex: number, goal: number) => number;

/**
 * A* pathfinding algorithm
 *
 * Finds the shortest path from source to goal using a heuristic function
 * to guide the search. The heuristic must be admissible (never overestimate).
 *
 * Algorithm:
 * 1. Maintain f(n) = g(n) + h(n) where:
 *    - g(n) = actual cost from start to n
 *    - h(n) = heuristic estimate from n to goal
 * 2. Always expand vertex with lowest f(n)
 * 3. Stop when goal is reached
 *
 * Time complexity: O(E) in worst case, much better with good heuristic
 * Space complexity: O(V)
 *
 * @param graph - The graph
 * @param source - Source vertex
 * @param goal - Goal vertex
 * @param heuristic - Heuristic function h(v, goal)
 * @returns Path from source to goal, or null if no path exists
 *
 * @example
 * ```ts
 * // For grid graphs, Manhattan distance is a good heuristic
 * const heuristic = (v: number, goal: number) => {
 *   // Calculate Manhattan distance based on grid positions
 *   return Math.abs(v - goal);
 * };
 * const path = aStar(graph, 0, 10, heuristic);
 * ```
 */
export function aStar(
  graph: Graph,
  source: number,
  goal: number,
  heuristic: HeuristicFunction
): number[] | null {
  const n = graph.getNumVertices();
  const gScore = new Array(n).fill(Infinity); // Actual cost from source
  const fScore = new Array(n).fill(Infinity); // Estimated total cost
  const predecessors: (number | null)[] = new Array(n).fill(null);
  const closedSet = new Set<number>();

  gScore[source] = 0;
  fScore[source] = heuristic(source, goal);

  const openSet = new PriorityQueue();
  openSet.push({ vertex: source, distance: fScore[source] });

  while (!openSet.isEmpty()) {
    const current = openSet.pop()!;
    const vertex = current.vertex;

    if (vertex === goal) {
      // Reconstruct path
      const path: number[] = [];
      let current: number | null = goal;
      while (current !== null) {
        path.unshift(current);
        current = predecessors[current];
      }
      return path;
    }

    if (closedSet.has(vertex)) continue;
    closedSet.add(vertex);

    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor)) continue;

      const weight = graph.getWeight(vertex, neighbor) ?? 1;
      const tentativeGScore = gScore[vertex] + weight;

      if (tentativeGScore < gScore[neighbor]) {
        predecessors[neighbor] = vertex;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, goal);
        openSet.push({ vertex: neighbor, distance: fScore[neighbor] });
      }
    }
  }

  return null; // No path found
}

/**
 * Reconstructs a path from source to target using predecessors array
 *
 * @param predecessors - Predecessors array from shortest path algorithm
 * @param source - Source vertex
 * @param target - Target vertex
 * @returns Path from source to target, or null if no path exists
 *
 * @example
 * ```ts
 * const result = dijkstra(graph, 0);
 * const path = reconstructPath(result.predecessors, 0, 4);
 * // [0, 2, 1, 4]
 * ```
 */
export function reconstructPath(
  predecessors: (number | null)[],
  source: number,
  target: number
): number[] | null {
  if (predecessors[target] === null && target !== source) {
    return null; // No path exists
  }

  const path: number[] = [];
  let current: number | null = target;

  while (current !== null) {
    path.unshift(current);
    if (current === source) break;
    current = predecessors[current];
  }

  return path.length > 0 && path[0] === source ? path : null;
}

/**
 * Finds the shortest path between two vertices using Dijkstra's algorithm
 *
 * Convenience function that combines Dijkstra with path reconstruction.
 *
 * @param graph - The graph
 * @param source - Source vertex
 * @param target - Target vertex
 * @returns Path from source to target, or null if no path exists
 *
 * @example
 * ```ts
 * const g = new Graph(5, { weighted: true });
 * g.addEdge(0, 1, 4);
 * g.addEdge(0, 2, 1);
 * g.addEdge(2, 3, 5);
 * const path = shortestPath(g, 0, 3);
 * // [0, 2, 3]
 * ```
 */
export function shortestPath(
  graph: Graph,
  source: number,
  target: number
): number[] | null {
  const result = dijkstra(graph, source);
  return reconstructPath(result.predecessors, source, target);
}

/**
 * Finds all shortest paths from source to all other vertices
 *
 * @param graph - The graph
 * @param source - Source vertex
 * @returns Map from target vertex to path
 */
export function allShortestPaths(
  graph: Graph,
  source: number
): Map<number, number[]> {
  const result = dijkstra(graph, source);
  const paths = new Map<number, number[]>();

  for (let target = 0; target < graph.getNumVertices(); target++) {
    const path = reconstructPath(result.predecessors, source, target);
    if (path !== null) {
      paths.set(target, path);
    }
  }

  return paths;
}
