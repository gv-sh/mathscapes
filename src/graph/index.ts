/**
 * Graph Theory Module
 *
 * This module provides comprehensive graph algorithms including:
 * - Graph representations (adjacency matrix, list, edge list, incidence matrix)
 * - Traversal algorithms (BFS, DFS, topological sort)
 * - Shortest path algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall, A*)
 * - Minimum spanning tree algorithms (Kruskal, Prim)
 * - Graph analysis (cycle detection, connected components, bipartiteness)
 * - Centrality measures (degree, betweenness, closeness, PageRank)
 * - Community detection (modularity, label propagation, Louvain)
 * - Network flow (max flow, min cut, Ford-Fulkerson, Dinic)
 * - Graph matching (bipartite matching, max matching, vertex cover)
 */

// Graph data structure
export { Graph, Edge, GraphOptions } from './graph';

// Traversal algorithms
export {
  bfs,
  dfs,
  dfsIterative,
  topologicalSort,
  topologicalSortDFS,
  hasCycle,
  connectedComponents,
  isBipartite,
} from './traversal';

// Shortest path algorithms
export {
  dijkstra,
  bellmanFord,
  floydWarshall,
  aStar,
  shortestPath,
  allShortestPaths,
  reconstructPath,
  ShortestPathResult,
  HeuristicFunction,
} from './shortest-path';

// Minimum spanning tree algorithms
export {
  kruskal,
  prim,
  allMinimumSpanningTrees,
  isSpanningTree,
  secondBestMST,
  MSTResult,
} from './mst';

// Centrality measures
export {
  degreeCentrality,
  betweennessCentrality,
  closenessCentrality,
  pageRank,
  eigenvectorCentrality,
  CentralityResult,
  PageRankOptions,
} from './centrality';

// Community detection
export {
  computeModularity,
  modularityOptimization,
  labelPropagation,
  louvain,
  findCliques,
  CommunityResult,
  LabelPropagationOptions,
} from './community';

// Network flow algorithms
export {
  fordFulkerson,
  edmondsKarp,
  minCut,
  dinic,
  circulation,
  MaxFlowResult,
  MinCutResult,
} from './flow';

// Graph matching algorithms
export {
  greedyMatching,
  maxBipartiteMatching,
  hungarianMatching,
  maxMatching,
  isPerfectMatching,
  isMaximalMatching,
  minVertexCover,
  maxIndependentSet,
  MatchingResult,
} from './matching';
