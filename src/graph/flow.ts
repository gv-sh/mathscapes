/**
 * Network Flow Algorithms
 *
 * This module provides algorithms for solving maximum flow and minimum cut problems
 * in flow networks. These are fundamental problems in graph theory with applications
 * in network optimization, matching, and scheduling.
 */

import { Graph } from './graph';

/**
 * Result of maximum flow computation
 */
export interface MaxFlowResult {
  /** Maximum flow value */
  maxFlow: number;
  /** Flow on each edge: flow[from][to] = flow amount */
  flow: Map<number, Map<number, number>>;
  /** Residual graph after computing max flow */
  residualGraph: Graph;
}

/**
 * Result of minimum cut computation
 */
export interface MinCutResult {
  /** Minimum cut value (equals max flow) */
  cutValue: number;
  /** Vertices in source side of the cut */
  sourceSet: number[];
  /** Vertices in sink side of the cut */
  sinkSet: number[];
  /** Edges in the minimum cut */
  cutEdges: Array<{ from: number; to: number; capacity: number }>;
}

/**
 * Creates a residual graph for flow algorithms
 *
 * @param graph - The original graph (capacities)
 * @param flow - Current flow
 * @returns Residual graph
 */
function createResidualGraph(
  graph: Graph,
  flow: Map<number, Map<number, number>>
): Graph {
  const n = graph.getNumVertices();
  const residual = new Graph(n, { directed: true, weighted: true });

  for (let u = 0; u < n; u++) {
    for (const v of graph.getNeighbors(u)) {
      const capacity = graph.getWeight(u, v) ?? 0;
      const currentFlow = flow.get(u)?.get(v) ?? 0;

      // Forward edge (remaining capacity)
      const remainingCapacity = capacity - currentFlow;
      if (remainingCapacity > 0) {
        residual.addEdge(u, v, remainingCapacity);
      }

      // Backward edge (flow that can be pushed back)
      if (currentFlow > 0) {
        residual.addEdge(v, u, currentFlow);
      }
    }
  }

  return residual;
}

/**
 * Finds an augmenting path using BFS (Edmonds-Karp algorithm)
 *
 * @param residual - Residual graph
 * @param source - Source vertex
 * @param sink - Sink vertex
 * @returns Parent array for path reconstruction, or null if no path exists
 */
function bfsAugmentingPath(
  residual: Graph,
  source: number,
  sink: number
): number[] | null {
  const n = residual.getNumVertices();
  const parent: number[] = Array(n).fill(-1);
  const visited: boolean[] = Array(n).fill(false);

  const queue: number[] = [source];
  visited[source] = true;

  while (queue.length > 0) {
    const u = queue.shift()!;

    if (u === sink) {
      return parent;
    }

    for (const v of residual.getNeighbors(u)) {
      if (!visited[v]) {
        visited[v] = true;
        parent[v] = u;
        queue.push(v);
      }
    }
  }

  return null;
}

/**
 * Finds an augmenting path using DFS
 *
 * @param residual - Residual graph
 * @param source - Source vertex
 * @param sink - Sink vertex
 * @returns Parent array for path reconstruction, or null if no path exists
 */
function dfsAugmentingPath(
  residual: Graph,
  source: number,
  sink: number
): number[] | null {
  const n = residual.getNumVertices();
  const parent: number[] = Array(n).fill(-1);
  const visited: boolean[] = Array(n).fill(false);

  function dfs(u: number): boolean {
    if (u === sink) return true;
    visited[u] = true;

    for (const v of residual.getNeighbors(u)) {
      if (!visited[v]) {
        parent[v] = u;
        if (dfs(v)) return true;
      }
    }

    return false;
  }

  if (dfs(source)) {
    return parent;
  }

  return null;
}

/**
 * Computes the maximum flow in a network using the Ford-Fulkerson method
 *
 * The Ford-Fulkerson method repeatedly finds augmenting paths and pushes flow
 * along them until no more paths exist. This implementation uses BFS to find
 * augmenting paths (Edmonds-Karp algorithm), which guarantees O(V × E²) time.
 *
 * Time complexity: O(V × E²) with BFS, O(E × max_flow) with DFS
 * Space complexity: O(V + E)
 *
 * @param graph - The flow network (edge weights are capacities, must be directed)
 * @param source - Source vertex
 * @param sink - Sink vertex
 * @param useBFS - Whether to use BFS (true) or DFS (false) for finding paths
 * @returns Maximum flow result
 *
 * @example
 * ```ts
 * const g = new Graph(6, { directed: true, weighted: true });
 * g.addEdge(0, 1, 16);
 * g.addEdge(0, 2, 13);
 * g.addEdge(1, 3, 12);
 * g.addEdge(2, 1, 4);
 * g.addEdge(2, 4, 14);
 * g.addEdge(3, 2, 9);
 * g.addEdge(3, 5, 20);
 * g.addEdge(4, 3, 7);
 * g.addEdge(4, 5, 4);
 * const result = fordFulkerson(g, 0, 5);
 * // result.maxFlow = 23
 * ```
 */
export function fordFulkerson(
  graph: Graph,
  source: number,
  sink: number,
  useBFS: boolean = true
): MaxFlowResult {
  const n = graph.getNumVertices();

  if (!graph.isDirected()) {
    throw new Error('Flow network must be a directed graph');
  }

  // Initialize flow to zero
  const flow = new Map<number, Map<number, number>>();
  for (let u = 0; u < n; u++) {
    flow.set(u, new Map());
    for (const v of graph.getNeighbors(u)) {
      flow.get(u)!.set(v, 0);
    }
  }

  let maxFlow = 0;

  while (true) {
    // Create residual graph
    const residual = createResidualGraph(graph, flow);

    // Find augmenting path
    const parent = useBFS
      ? bfsAugmentingPath(residual, source, sink)
      : dfsAugmentingPath(residual, source, sink);

    if (!parent) break; // No more augmenting paths

    // Find minimum residual capacity along the path
    let pathFlow = Infinity;
    let v = sink;
    while (v !== source) {
      const u = parent[v];
      const capacity = residual.getWeight(u, v) ?? 0;
      pathFlow = Math.min(pathFlow, capacity);
      v = u;
    }

    // Update flow along the path
    v = sink;
    while (v !== source) {
      const u = parent[v];

      // Check if this is a forward edge in the original graph
      if (graph.hasEdge(u, v)) {
        const currentFlow = flow.get(u)?.get(v) ?? 0;
        flow.get(u)!.set(v, currentFlow + pathFlow);
      } else {
        // Backward edge: reduce flow
        const currentFlow = flow.get(v)?.get(u) ?? 0;
        flow.get(v)!.set(u, currentFlow - pathFlow);
      }

      v = u;
    }

    maxFlow += pathFlow;
  }

  return {
    maxFlow,
    flow,
    residualGraph: createResidualGraph(graph, flow),
  };
}

/**
 * Computes the maximum flow using the Edmonds-Karp algorithm
 *
 * This is the Ford-Fulkerson method with BFS for finding augmenting paths.
 * It guarantees polynomial time complexity.
 *
 * Time complexity: O(V × E²)
 * Space complexity: O(V + E)
 *
 * @param graph - The flow network (edge weights are capacities)
 * @param source - Source vertex
 * @param sink - Sink vertex
 * @returns Maximum flow result
 *
 * @example
 * ```ts
 * const g = new Graph(4, { directed: true, weighted: true });
 * g.addEdge(0, 1, 10);
 * g.addEdge(0, 2, 10);
 * g.addEdge(1, 3, 10);
 * g.addEdge(2, 3, 10);
 * const result = edmondsKarp(g, 0, 3);
 * // result.maxFlow = 20
 * ```
 */
export function edmondsKarp(
  graph: Graph,
  source: number,
  sink: number
): MaxFlowResult {
  return fordFulkerson(graph, source, sink, true);
}

/**
 * Finds the minimum cut in a flow network
 *
 * By the max-flow min-cut theorem, the value of the minimum cut equals the
 * maximum flow. This function first computes max flow, then finds the cut by
 * identifying reachable vertices from the source in the residual graph.
 *
 * Time complexity: O(V × E²) (dominated by max flow computation)
 * Space complexity: O(V + E)
 *
 * @param graph - The flow network (edge weights are capacities)
 * @param source - Source vertex
 * @param sink - Sink vertex
 * @returns Minimum cut result
 *
 * @example
 * ```ts
 * const g = new Graph(6, { directed: true, weighted: true });
 * g.addEdge(0, 1, 16);
 * g.addEdge(0, 2, 13);
 * g.addEdge(1, 3, 12);
 * g.addEdge(2, 4, 14);
 * g.addEdge(3, 5, 20);
 * g.addEdge(4, 5, 4);
 * const result = minCut(g, 0, 5);
 * // result.cutValue = max flow value
 * // result.cutEdges = edges crossing the cut
 * ```
 */
export function minCut(graph: Graph, source: number, sink: number): MinCutResult {
  // Compute max flow
  const flowResult = fordFulkerson(graph, source, sink);

  // Find reachable vertices from source in residual graph
  const n = graph.getNumVertices();
  const reachable: boolean[] = Array(n).fill(false);
  const queue: number[] = [source];
  reachable[source] = true;

  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const v of flowResult.residualGraph.getNeighbors(u)) {
      if (!reachable[v]) {
        reachable[v] = true;
        queue.push(v);
      }
    }
  }

  // Separate vertices into source and sink sets
  const sourceSet: number[] = [];
  const sinkSet: number[] = [];
  for (let v = 0; v < n; v++) {
    if (reachable[v]) {
      sourceSet.push(v);
    } else {
      sinkSet.push(v);
    }
  }

  // Find cut edges (edges from source set to sink set)
  const cutEdges: Array<{ from: number; to: number; capacity: number }> = [];
  for (const u of sourceSet) {
    for (const v of graph.getNeighbors(u)) {
      if (!reachable[v]) {
        cutEdges.push({
          from: u,
          to: v,
          capacity: graph.getWeight(u, v) ?? 0,
        });
      }
    }
  }

  return {
    cutValue: flowResult.maxFlow,
    sourceSet,
    sinkSet,
    cutEdges,
  };
}

/**
 * Computes maximum flow using Dinic's algorithm
 *
 * Dinic's algorithm is more efficient than Ford-Fulkerson for dense graphs.
 * It uses a layered network approach with blocking flows.
 *
 * Time complexity: O(V² × E)
 * Space complexity: O(V + E)
 *
 * @param graph - The flow network (edge weights are capacities)
 * @param source - Source vertex
 * @param sink - Sink vertex
 * @returns Maximum flow result
 *
 * @example
 * ```ts
 * const g = new Graph(4, { directed: true, weighted: true });
 * g.addEdge(0, 1, 10);
 * g.addEdge(1, 2, 1);
 * g.addEdge(0, 2, 10);
 * g.addEdge(2, 3, 10);
 * const result = dinic(g, 0, 3);
 * // result.maxFlow = 11
 * ```
 */
export function dinic(graph: Graph, source: number, sink: number): MaxFlowResult {
  const n = graph.getNumVertices();

  if (!graph.isDirected()) {
    throw new Error('Flow network must be a directed graph');
  }

  // Initialize flow to zero
  const flow = new Map<number, Map<number, number>>();
  for (let u = 0; u < n; u++) {
    flow.set(u, new Map());
    for (const v of graph.getNeighbors(u)) {
      flow.get(u)!.set(v, 0);
    }
  }

  let maxFlow = 0;

  // Build level graph using BFS
  function buildLevelGraph(residual: Graph): number[] | null {
    const level: number[] = Array(n).fill(-1);
    level[source] = 0;
    const queue: number[] = [source];

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const v of residual.getNeighbors(u)) {
        if (level[v] < 0) {
          level[v] = level[u] + 1;
          queue.push(v);
        }
      }
    }

    return level[sink] >= 0 ? level : null;
  }

  // Send flow using DFS with level graph
  function sendFlow(
    residual: Graph,
    level: number[],
    u: number,
    currentFlow: number,
    visited: number[]
  ): number {
    if (u === sink) return currentFlow;

    for (let i = visited[u]; i < residual.getNeighbors(u).length; i++) {
      const v = residual.getNeighbors(u)[i];
      visited[u] = i;

      if (level[v] === level[u] + 1) {
        const capacity = residual.getWeight(u, v) ?? 0;
        const minFlow = Math.min(currentFlow, capacity);

        if (minFlow > 0) {
          const pushed = sendFlow(residual, level, v, minFlow, visited);

          if (pushed > 0) {
            // Update flow
            if (graph.hasEdge(u, v)) {
              const curr = flow.get(u)?.get(v) ?? 0;
              flow.get(u)!.set(v, curr + pushed);
            } else {
              const curr = flow.get(v)?.get(u) ?? 0;
              flow.get(v)!.set(u, curr - pushed);
            }
            return pushed;
          }
        }
      }
    }

    return 0;
  }

  // Main loop
  while (true) {
    const residual = createResidualGraph(graph, flow);
    const level = buildLevelGraph(residual);

    if (!level) break;

    // Send blocking flow
    const visited: number[] = Array(n).fill(0);
    while (true) {
      const pushed = sendFlow(residual, level, source, Infinity, visited);
      if (pushed === 0) break;
      maxFlow += pushed;
    }
  }

  return {
    maxFlow,
    flow,
    residualGraph: createResidualGraph(graph, flow),
  };
}

/**
 * Solves the circulation problem with demands
 *
 * A circulation is a flow that satisfies capacity constraints and demand/supply
 * at each vertex (flow conservation with demands).
 *
 * @param graph - The graph with capacities
 * @param demands - Demand at each vertex (positive = sink, negative = source)
 * @returns Flow if feasible circulation exists, null otherwise
 */
export function circulation(
  graph: Graph,
  demands: number[]
): Map<number, Map<number, number>> | null {
  const n = graph.getNumVertices();

  // Add super source and super sink
  const extendedGraph = new Graph(n + 2, { directed: true, weighted: true });
  const superSource = n;
  const superSink = n + 1;

  // Copy original edges
  for (let u = 0; u < n; u++) {
    for (const v of graph.getNeighbors(u)) {
      const capacity = graph.getWeight(u, v) ?? 0;
      extendedGraph.addEdge(u, v, capacity);
    }
  }

  // Add edges from super source/sink
  let totalSupply = 0;
  for (let v = 0; v < n; v++) {
    if (demands[v] < 0) {
      // Supply node: connect from super source
      extendedGraph.addEdge(superSource, v, -demands[v]);
      totalSupply += -demands[v];
    } else if (demands[v] > 0) {
      // Demand node: connect to super sink
      extendedGraph.addEdge(v, superSink, demands[v]);
    }
  }

  // Compute max flow
  const result = fordFulkerson(extendedGraph, superSource, superSink);

  // Check if all demands are satisfied
  if (result.maxFlow < totalSupply) {
    return null; // No feasible circulation
  }

  // Extract original flow (excluding super source/sink edges)
  const circulation = new Map<number, Map<number, number>>();
  for (let u = 0; u < n; u++) {
    circulation.set(u, new Map());
    for (const v of graph.getNeighbors(u)) {
      const flowValue = result.flow.get(u)?.get(v) ?? 0;
      circulation.get(u)!.set(v, flowValue);
    }
  }

  return circulation;
}
