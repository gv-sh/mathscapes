/**
 * Graph Theory Module - Graph Representations
 *
 * This module provides various graph representations and basic operations.
 * Supports both directed and undirected graphs with weighted edges.
 */

/**
 * Represents an edge in a graph
 */
export interface Edge {
  from: number;
  to: number;
  weight?: number;
}

/**
 * Options for creating a graph
 */
export interface GraphOptions {
  directed?: boolean;
  weighted?: boolean;
}

/**
 * Graph class with multiple internal representations
 *
 * Supports:
 * - Adjacency list (memory efficient, fast neighbor queries)
 * - Adjacency matrix (fast edge lookups)
 * - Edge list (simple representation)
 * - Incidence matrix (useful for certain algorithms)
 *
 * @example
 * ```ts
 * // Create an undirected graph with 5 vertices
 * const g = new Graph(5, { directed: false });
 * g.addEdge(0, 1);
 * g.addEdge(1, 2);
 * g.addEdge(2, 3);
 * ```
 */
export class Graph {
  private numVertices: number;
  private directed: boolean;
  private weighted: boolean;
  private adjList: Map<number, Map<number, number>>; // vertex -> (neighbor -> weight)
  private edges: Edge[];

  /**
   * Creates a new graph
   *
   * @param numVertices - Number of vertices in the graph
   * @param options - Graph configuration options
   */
  constructor(numVertices: number, options: GraphOptions = {}) {
    if (numVertices < 0) {
      throw new Error('Number of vertices must be non-negative');
    }

    this.numVertices = numVertices;
    this.directed = options.directed ?? false;
    this.weighted = options.weighted ?? false;
    this.adjList = new Map();
    this.edges = [];

    // Initialize adjacency list
    for (let i = 0; i < numVertices; i++) {
      this.adjList.set(i, new Map());
    }
  }

  /**
   * Adds an edge to the graph
   *
   * @param from - Source vertex
   * @param to - Destination vertex
   * @param weight - Edge weight (default: 1)
   *
   * @example
   * ```ts
   * const g = new Graph(3);
   * g.addEdge(0, 1, 5); // Add edge from 0 to 1 with weight 5
   * ```
   */
  addEdge(from: number, to: number, weight: number = 1): void {
    this.validateVertex(from);
    this.validateVertex(to);

    // Add to adjacency list
    this.adjList.get(from)!.set(to, weight);
    if (!this.directed) {
      this.adjList.get(to)!.set(from, weight);
    }

    // Add to edge list
    this.edges.push({ from, to, weight });
    if (!this.directed && from !== to) {
      this.edges.push({ from: to, to: from, weight });
    }
  }

  /**
   * Removes an edge from the graph
   *
   * @param from - Source vertex
   * @param to - Destination vertex
   */
  removeEdge(from: number, to: number): void {
    this.validateVertex(from);
    this.validateVertex(to);

    this.adjList.get(from)!.delete(to);
    if (!this.directed) {
      this.adjList.get(to)!.delete(from);
    }

    // Remove from edge list
    this.edges = this.edges.filter(
      (e) => !(e.from === from && e.to === to)
    );
    if (!this.directed) {
      this.edges = this.edges.filter(
        (e) => !(e.from === to && e.to === from)
      );
    }
  }

  /**
   * Checks if an edge exists between two vertices
   *
   * @param from - Source vertex
   * @param to - Destination vertex
   * @returns True if edge exists
   */
  hasEdge(from: number, to: number): boolean {
    this.validateVertex(from);
    this.validateVertex(to);
    return this.adjList.get(from)!.has(to);
  }

  /**
   * Gets the weight of an edge
   *
   * @param from - Source vertex
   * @param to - Destination vertex
   * @returns Edge weight or undefined if edge doesn't exist
   */
  getWeight(from: number, to: number): number | undefined {
    this.validateVertex(from);
    this.validateVertex(to);
    return this.adjList.get(from)!.get(to);
  }

  /**
   * Gets all neighbors of a vertex
   *
   * @param vertex - The vertex
   * @returns Array of neighbor vertices
   */
  getNeighbors(vertex: number): number[] {
    this.validateVertex(vertex);
    return Array.from(this.adjList.get(vertex)!.keys());
  }

  /**
   * Gets the degree of a vertex (number of edges)
   *
   * @param vertex - The vertex
   * @returns Degree of the vertex
   */
  getDegree(vertex: number): number {
    this.validateVertex(vertex);
    return this.adjList.get(vertex)!.size;
  }

  /**
   * Gets the in-degree of a vertex (for directed graphs)
   *
   * @param vertex - The vertex
   * @returns In-degree of the vertex
   */
  getInDegree(vertex: number): number {
    this.validateVertex(vertex);
    let inDegree = 0;
    for (let i = 0; i < this.numVertices; i++) {
      if (this.adjList.get(i)!.has(vertex)) {
        inDegree++;
      }
    }
    return inDegree;
  }

  /**
   * Gets the out-degree of a vertex (for directed graphs)
   *
   * @param vertex - The vertex
   * @returns Out-degree of the vertex
   */
  getOutDegree(vertex: number): number {
    return this.getDegree(vertex);
  }

  /**
   * Returns the adjacency matrix representation
   *
   * The adjacency matrix A[i][j] = weight if edge (i,j) exists, 0 otherwise.
   * For weighted graphs, contains edge weights. For unweighted, contains 1 or 0.
   *
   * Time complexity: O(V²)
   * Space complexity: O(V²)
   *
   * @returns 2D array representing the adjacency matrix
   *
   * @example
   * ```ts
   * const g = new Graph(3);
   * g.addEdge(0, 1, 5);
   * g.addEdge(1, 2, 3);
   * const matrix = g.toAdjacencyMatrix();
   * // [[0, 5, 0],
   * //  [5, 0, 3],
   * //  [0, 3, 0]]
   * ```
   */
  toAdjacencyMatrix(): number[][] {
    const matrix: number[][] = Array(this.numVertices)
      .fill(0)
      .map(() => Array(this.numVertices).fill(0));

    for (let i = 0; i < this.numVertices; i++) {
      const neighbors = this.adjList.get(i)!;
      for (const [j, weight] of neighbors) {
        matrix[i][j] = weight;
      }
    }

    return matrix;
  }

  /**
   * Returns the adjacency list representation
   *
   * @returns Map from vertex to its neighbors with weights
   */
  toAdjacencyList(): Map<number, Map<number, number>> {
    return new Map(this.adjList);
  }

  /**
   * Returns the edge list representation
   *
   * @returns Array of edges
   */
  toEdgeList(): Edge[] {
    if (this.directed) {
      return [...this.edges];
    }
    // For undirected graphs, only include each edge once
    const seen = new Set<string>();
    return this.edges.filter((e) => {
      const key = e.from < e.to ? `${e.from}-${e.to}` : `${e.to}-${e.from}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Returns the incidence matrix representation
   *
   * The incidence matrix M[i][j] indicates whether vertex i is incident to edge j.
   * For directed graphs: 1 if vertex is source, -1 if target, 0 otherwise.
   * For undirected graphs: 1 if vertex is incident to edge, 0 otherwise.
   *
   * Time complexity: O(V × E)
   * Space complexity: O(V × E)
   *
   * @returns 2D array representing the incidence matrix
   *
   * @example
   * ```ts
   * const g = new Graph(3, { directed: true });
   * g.addEdge(0, 1);
   * g.addEdge(1, 2);
   * const matrix = g.toIncidenceMatrix();
   * // Vertices × Edges matrix
   * ```
   */
  toIncidenceMatrix(): number[][] {
    const edges = this.toEdgeList();
    const matrix: number[][] = Array(this.numVertices)
      .fill(0)
      .map(() => Array(edges.length).fill(0));

    for (let j = 0; j < edges.length; j++) {
      const edge = edges[j];
      if (this.directed) {
        matrix[edge.from][j] = 1; // outgoing edge
        matrix[edge.to][j] = -1; // incoming edge
      } else {
        matrix[edge.from][j] = 1;
        matrix[edge.to][j] = 1;
      }
    }

    return matrix;
  }

  /**
   * Creates a graph from an adjacency matrix
   *
   * @param matrix - Adjacency matrix
   * @param options - Graph options
   * @returns New graph
   */
  static fromAdjacencyMatrix(
    matrix: number[][],
    options: GraphOptions = {}
  ): Graph {
    const n = matrix.length;
    if (matrix.some((row) => row.length !== n)) {
      throw new Error('Adjacency matrix must be square');
    }

    const graph = new Graph(n, options);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] !== 0) {
          // Only add edge once for undirected graphs
          if (!options.directed && i > j) continue;
          graph.addEdge(i, j, matrix[i][j]);
        }
      }
    }

    return graph;
  }

  /**
   * Creates a graph from an edge list
   *
   * @param numVertices - Number of vertices
   * @param edges - Array of edges
   * @param options - Graph options
   * @returns New graph
   */
  static fromEdgeList(
    numVertices: number,
    edges: Edge[],
    options: GraphOptions = {}
  ): Graph {
    const graph = new Graph(numVertices, options);
    for (const edge of edges) {
      graph.addEdge(edge.from, edge.to, edge.weight ?? 1);
    }
    return graph;
  }

  /**
   * Gets the number of vertices in the graph
   *
   * @returns Number of vertices
   */
  getNumVertices(): number {
    return this.numVertices;
  }

  /**
   * Gets the number of edges in the graph
   *
   * @returns Number of edges
   */
  getNumEdges(): number {
    if (this.directed) {
      return this.edges.length;
    }
    return this.edges.length / 2;
  }

  /**
   * Checks if the graph is directed
   *
   * @returns True if directed
   */
  isDirected(): boolean {
    return this.directed;
  }

  /**
   * Checks if the graph is weighted
   *
   * @returns True if weighted
   */
  isWeighted(): boolean {
    return this.weighted;
  }

  /**
   * Validates that a vertex exists
   *
   * @param vertex - Vertex to validate
   */
  private validateVertex(vertex: number): void {
    if (vertex < 0 || vertex >= this.numVertices) {
      throw new Error(
        `Vertex ${vertex} is out of range [0, ${this.numVertices - 1}]`
      );
    }
  }

  /**
   * Clones the graph
   *
   * @returns A new graph with the same structure
   */
  clone(): Graph {
    const cloned = new Graph(this.numVertices, {
      directed: this.directed,
      weighted: this.weighted,
    });

    for (const edge of this.toEdgeList()) {
      cloned.addEdge(edge.from, edge.to, edge.weight);
    }

    return cloned;
  }

  /**
   * Returns a string representation of the graph
   *
   * @returns String representation
   */
  toString(): string {
    let result = `Graph(${this.numVertices} vertices, ${this.getNumEdges()} edges, ${
      this.directed ? 'directed' : 'undirected'
    })\n`;

    for (let i = 0; i < this.numVertices; i++) {
      const neighbors = this.adjList.get(i)!;
      if (neighbors.size > 0) {
        result += `  ${i} -> `;
        const edges = Array.from(neighbors.entries()).map(
          ([neighbor, weight]) =>
            this.weighted ? `${neighbor}(${weight})` : `${neighbor}`
        );
        result += edges.join(', ') + '\n';
      }
    }

    return result;
  }
}
