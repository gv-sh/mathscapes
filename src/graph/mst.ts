/**
 * Minimum Spanning Tree Algorithms
 *
 * This module provides algorithms for finding minimum spanning trees in graphs:
 * - Kruskal's algorithm (greedy, uses Union-Find)
 * - Prim's algorithm (greedy, uses priority queue)
 */

import { Graph, Edge } from './graph';

/**
 * Result of a minimum spanning tree computation
 */
export interface MSTResult {
  edges: Edge[];
  totalWeight: number;
}

/**
 * Union-Find (Disjoint Set Union) data structure
 *
 * Efficient data structure for tracking connected components.
 * Used in Kruskal's algorithm to detect cycles.
 *
 * Operations:
 * - find(x): Find the root/representative of x's set
 * - union(x, y): Merge the sets containing x and y
 *
 * Both operations run in nearly O(1) time with path compression and union by rank.
 */
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }

  /**
   * Finds the root of the set containing x (with path compression)
   *
   * @param x - Element to find
   * @returns Root of the set
   */
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  /**
   * Merges the sets containing x and y (with union by rank)
   *
   * @param x - First element
   * @param y - Second element
   * @returns True if elements were in different sets (union performed)
   */
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Already in same set
    }

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    return true;
  }
}

/**
 * Kruskal's algorithm for finding minimum spanning tree
 *
 * Greedy algorithm that builds MST by repeatedly adding the smallest edge
 * that doesn't create a cycle.
 *
 * Algorithm:
 * 1. Sort all edges by weight (ascending)
 * 2. Initialize Union-Find structure
 * 3. For each edge in sorted order:
 *    - If edge connects different components, add it to MST
 *    - Otherwise, skip it (would create cycle)
 * 4. Stop when MST has V-1 edges
 *
 * Time complexity: O(E log E) due to sorting
 * Space complexity: O(V + E)
 *
 * @param graph - The undirected, weighted graph
 * @returns MST result containing edges and total weight
 * @throws Error if graph is directed or disconnected
 *
 * @example
 * ```ts
 * const g = new Graph(4, { weighted: true });
 * g.addEdge(0, 1, 10);
 * g.addEdge(0, 2, 6);
 * g.addEdge(0, 3, 5);
 * g.addEdge(1, 3, 15);
 * g.addEdge(2, 3, 4);
 * const mst = kruskal(g);
 * // mst.totalWeight = 19
 * // mst.edges = [{from: 2, to: 3, weight: 4}, {from: 0, to: 3, weight: 5}, ...]
 * ```
 */
export function kruskal(graph: Graph): MSTResult {
  if (graph.isDirected()) {
    throw new Error("Kruskal's algorithm requires an undirected graph");
  }

  const n = graph.getNumVertices();
  const edges = graph.toEdgeList();

  // Sort edges by weight (ascending)
  edges.sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));

  const uf = new UnionFind(n);
  const mstEdges: Edge[] = [];
  let totalWeight = 0;

  for (const edge of edges) {
    // If edge connects different components, add to MST
    if (uf.union(edge.from, edge.to)) {
      mstEdges.push(edge);
      totalWeight += edge.weight ?? 1;

      // MST complete when we have V-1 edges
      if (mstEdges.length === n - 1) {
        break;
      }
    }
  }

  // Check if graph is connected
  if (mstEdges.length !== n - 1) {
    throw new Error('Graph is not connected');
  }

  return { edges: mstEdges, totalWeight };
}

/**
 * Priority queue element for Prim's algorithm
 */
interface PrimPQElement {
  vertex: number;
  weight: number;
  from: number;
}

/**
 * Simple priority queue for Prim's algorithm
 */
class PrimPriorityQueue {
  private heap: PrimPQElement[];

  constructor() {
    this.heap = [];
  }

  push(element: PrimPQElement): void {
    this.heap.push(element);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): PrimPQElement | undefined {
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
      if (this.heap[index].weight >= this.heap[parentIndex].weight) break;

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
        this.heap[leftChild].weight < this.heap[smallest].weight
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].weight < this.heap[smallest].weight
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
 * Prim's algorithm for finding minimum spanning tree
 *
 * Greedy algorithm that builds MST by starting from a single vertex and
 * repeatedly adding the minimum weight edge that connects a new vertex to the tree.
 *
 * Algorithm:
 * 1. Start with arbitrary vertex in MST
 * 2. Maintain priority queue of edges from MST to non-MST vertices
 * 3. Repeatedly:
 *    - Extract minimum weight edge from queue
 *    - Add corresponding vertex to MST
 *    - Add all edges from new vertex to queue
 * 4. Stop when all vertices are in MST
 *
 * Time complexity: O((V + E) log V) with binary heap
 * Space complexity: O(V + E)
 *
 * @param graph - The undirected, weighted graph
 * @param start - Starting vertex (default: 0)
 * @returns MST result containing edges and total weight
 * @throws Error if graph is directed or disconnected
 *
 * @example
 * ```ts
 * const g = new Graph(4, { weighted: true });
 * g.addEdge(0, 1, 10);
 * g.addEdge(0, 2, 6);
 * g.addEdge(0, 3, 5);
 * g.addEdge(1, 3, 15);
 * g.addEdge(2, 3, 4);
 * const mst = prim(g);
 * // mst.totalWeight = 19
 * ```
 */
export function prim(graph: Graph, start: number = 0): MSTResult {
  if (graph.isDirected()) {
    throw new Error("Prim's algorithm requires an undirected graph");
  }

  const n = graph.getNumVertices();
  const inMST = new Set<number>();
  const mstEdges: Edge[] = [];
  let totalWeight = 0;

  const pq = new PrimPriorityQueue();
  inMST.add(start);

  // Add all edges from start vertex
  const neighbors = graph.getNeighbors(start);
  for (const neighbor of neighbors) {
    const weight = graph.getWeight(start, neighbor) ?? 1;
    pq.push({ vertex: neighbor, weight, from: start });
  }

  while (!pq.isEmpty() && inMST.size < n) {
    const edge = pq.pop()!;

    // Skip if vertex already in MST
    if (inMST.has(edge.vertex)) continue;

    // Add vertex to MST
    inMST.add(edge.vertex);
    mstEdges.push({
      from: edge.from,
      to: edge.vertex,
      weight: edge.weight,
    });
    totalWeight += edge.weight;

    // Add edges from newly added vertex
    const neighbors = graph.getNeighbors(edge.vertex);
    for (const neighbor of neighbors) {
      if (!inMST.has(neighbor)) {
        const weight = graph.getWeight(edge.vertex, neighbor) ?? 1;
        pq.push({ vertex: neighbor, weight, from: edge.vertex });
      }
    }
  }

  // Check if graph is connected
  if (inMST.size !== n) {
    throw new Error('Graph is not connected');
  }

  return { edges: mstEdges, totalWeight };
}

/**
 * Finds all minimum spanning trees in a graph
 *
 * Note: A graph can have multiple MSTs if there are edges with equal weights.
 * This function uses Kruskal's algorithm and explores all valid orderings
 * of equal-weight edges.
 *
 * Warning: Can be exponential in worst case if many edges have equal weights.
 *
 * @param graph - The undirected, weighted graph
 * @returns Array of all possible MSTs
 */
export function allMinimumSpanningTrees(graph: Graph): MSTResult[] {
  if (graph.isDirected()) {
    throw new Error('MST requires an undirected graph');
  }

  const n = graph.getNumVertices();
  const edges = graph.toEdgeList();

  // Sort edges by weight
  edges.sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));

  // Group edges by weight
  const edgeGroups: Edge[][] = [];
  let currentWeight = -Infinity;
  let currentGroup: Edge[] = [];

  for (const edge of edges) {
    const weight = edge.weight ?? 1;
    if (weight !== currentWeight) {
      if (currentGroup.length > 0) {
        edgeGroups.push(currentGroup);
      }
      currentGroup = [edge];
      currentWeight = weight;
    } else {
      currentGroup.push(edge);
    }
  }
  if (currentGroup.length > 0) {
    edgeGroups.push(currentGroup);
  }

  // Find all MSTs by trying different orderings of equal-weight edges
  const results: MSTResult[] = [];
  const visited = new Set<string>();

  function findMSTs(
    groupIndex: number,
    uf: UnionFind,
    mstEdges: Edge[],
    totalWeight: number
  ): void {
    if (mstEdges.length === n - 1) {
      // Found a complete MST
      const key = mstEdges
        .map((e) => `${e.from}-${e.to}`)
        .sort()
        .join(',');
      if (!visited.has(key)) {
        visited.add(key);
        results.push({ edges: [...mstEdges], totalWeight });
      }
      return;
    }

    if (groupIndex >= edgeGroups.length) return;

    const group = edgeGroups[groupIndex];

    // Try adding edges from current group
    for (const edge of group) {
      const ufCopy = new UnionFind(n);
      // Copy union-find state
      for (let i = 0; i < mstEdges.length; i++) {
        ufCopy.union(mstEdges[i].from, mstEdges[i].to);
      }

      if (ufCopy.union(edge.from, edge.to)) {
        findMSTs(
          groupIndex,
          ufCopy,
          [...mstEdges, edge],
          totalWeight + (edge.weight ?? 1)
        );
      }
    }

    // Move to next group
    findMSTs(groupIndex + 1, uf, mstEdges, totalWeight);
  }

  findMSTs(0, new UnionFind(n), [], 0);
  return results;
}

/**
 * Checks if a set of edges forms a valid spanning tree
 *
 * @param graph - The graph
 * @param edges - Set of edges
 * @returns True if edges form a spanning tree
 */
export function isSpanningTree(graph: Graph, edges: Edge[]): boolean {
  const n = graph.getNumVertices();

  // Must have exactly V-1 edges
  if (edges.length !== n - 1) return false;

  // Must connect all vertices (use Union-Find)
  const uf = new UnionFind(n);
  for (const edge of edges) {
    if (!uf.union(edge.from, edge.to)) {
      return false; // Cycle detected
    }
  }

  // Check if all vertices are connected
  const root = uf.find(0);
  for (let i = 1; i < n; i++) {
    if (uf.find(i) !== root) {
      return false;
    }
  }

  return true;
}

/**
 * Finds the second-best minimum spanning tree
 *
 * The second-best MST has the minimum total weight among all spanning trees
 * that are not the MST.
 *
 * Algorithm:
 * 1. Find the MST using Kruskal or Prim
 * 2. For each edge in MST:
 *    - Remove it and find MST of remaining graph
 *    - Track minimum weight among these alternatives
 *
 * Time complexity: O(V × E log E)
 * Space complexity: O(V + E)
 *
 * @param graph - The undirected, weighted graph
 * @returns Second-best MST, or null if it doesn't exist
 */
export function secondBestMST(graph: Graph): MSTResult | null {
  if (graph.isDirected()) {
    throw new Error('MST requires an undirected graph');
  }

  // Find the best MST
  const bestMST = kruskal(graph);
  let secondBest: MSTResult | null = null;

  // Try removing each edge from the best MST
  for (const removedEdge of bestMST.edges) {
    // Create graph without this edge
    const graphCopy = graph.clone();
    graphCopy.removeEdge(removedEdge.from, removedEdge.to);

    try {
      const mst = kruskal(graphCopy);
      if (
        mst.totalWeight > bestMST.totalWeight &&
        (secondBest === null || mst.totalWeight < secondBest.totalWeight)
      ) {
        secondBest = mst;
      }
    } catch (e) {
      // Graph became disconnected, skip
      continue;
    }
  }

  return secondBest;
}
