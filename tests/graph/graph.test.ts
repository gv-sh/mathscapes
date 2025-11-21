import { Graph } from '../../src/graph/graph';

describe('Graph', () => {
  describe('Constructor and Basic Operations', () => {
    it('should create an empty graph', () => {
      const g = new Graph(5);
      expect(g.getNumVertices()).toBe(5);
      expect(g.getNumEdges()).toBe(0);
      expect(g.isDirected()).toBe(false);
    });

    it('should create a directed graph', () => {
      const g = new Graph(3, { directed: true });
      expect(g.isDirected()).toBe(true);
    });

    it('should throw error for negative vertices', () => {
      expect(() => new Graph(-1)).toThrow();
    });
  });

  describe('Edge Operations', () => {
    it('should add edges to undirected graph', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      expect(g.hasEdge(0, 1)).toBe(true);
      expect(g.hasEdge(1, 0)).toBe(true); // Undirected
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.hasEdge(0, 2)).toBe(false);
      expect(g.getNumEdges()).toBe(2);
    });

    it('should add edges to directed graph', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      expect(g.hasEdge(0, 1)).toBe(true);
      expect(g.hasEdge(1, 0)).toBe(false); // Directed
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.getNumEdges()).toBe(2);
    });

    it('should add weighted edges', () => {
      const g = new Graph(3, { weighted: true });
      g.addEdge(0, 1, 5);
      g.addEdge(1, 2, 3);

      expect(g.getWeight(0, 1)).toBe(5);
      expect(g.getWeight(1, 0)).toBe(5); // Undirected
      expect(g.getWeight(1, 2)).toBe(3);
    });

    it('should remove edges', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      g.removeEdge(0, 1);
      expect(g.hasEdge(0, 1)).toBe(false);
      expect(g.hasEdge(1, 0)).toBe(false);
      expect(g.getNumEdges()).toBe(1);
    });

    it('should throw error for invalid vertices', () => {
      const g = new Graph(3);
      expect(() => g.addEdge(0, 5)).toThrow();
      expect(() => g.addEdge(-1, 1)).toThrow();
    });
  });

  describe('Neighbor Operations', () => {
    it('should get neighbors', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);

      const neighbors = g.getNeighbors(0);
      expect(neighbors).toHaveLength(3);
      expect(neighbors).toContain(1);
      expect(neighbors).toContain(2);
      expect(neighbors).toContain(3);
    });

    it('should get degree', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);

      expect(g.getDegree(0)).toBe(3);
      expect(g.getDegree(1)).toBe(1);
    });

    it('should get in-degree and out-degree for directed graph', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);

      expect(g.getOutDegree(0)).toBe(2);
      expect(g.getInDegree(0)).toBe(0);
      expect(g.getInDegree(2)).toBe(2);
    });
  });

  describe('Adjacency Matrix', () => {
    it('should convert to adjacency matrix (unweighted)', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      const matrix = g.toAdjacencyMatrix();
      expect(matrix).toEqual([
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
      ]);
    });

    it('should convert to adjacency matrix (weighted)', () => {
      const g = new Graph(3, { weighted: true });
      g.addEdge(0, 1, 5);
      g.addEdge(1, 2, 3);

      const matrix = g.toAdjacencyMatrix();
      expect(matrix).toEqual([
        [0, 5, 0],
        [5, 0, 3],
        [0, 3, 0],
      ]);
    });

    it('should create graph from adjacency matrix', () => {
      const matrix = [
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
      ];

      const g = Graph.fromAdjacencyMatrix(matrix);
      expect(g.getNumVertices()).toBe(3);
      expect(g.hasEdge(0, 1)).toBe(true);
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.hasEdge(0, 2)).toBe(false);
    });
  });

  describe('Edge List', () => {
    it('should convert to edge list', () => {
      const g = new Graph(3);
      g.addEdge(0, 1, 2);
      g.addEdge(1, 2, 3);

      const edges = g.toEdgeList();
      expect(edges).toHaveLength(2);
      expect(edges.some((e) => e.from === 0 && e.to === 1)).toBe(true);
      expect(edges.some((e) => e.from === 1 && e.to === 2)).toBe(true);
    });

    it('should create graph from edge list', () => {
      const edges = [
        { from: 0, to: 1, weight: 2 },
        { from: 1, to: 2, weight: 3 },
      ];

      const g = Graph.fromEdgeList(3, edges);
      expect(g.getNumVertices()).toBe(3);
      expect(g.getNumEdges()).toBe(2);
      expect(g.getWeight(0, 1)).toBe(2);
      expect(g.getWeight(1, 2)).toBe(3);
    });
  });

  describe('Incidence Matrix', () => {
    it('should convert to incidence matrix (undirected)', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      const matrix = g.toIncidenceMatrix();
      expect(matrix).toHaveLength(3); // 3 vertices
      expect(matrix[0]).toHaveLength(2); // 2 edges

      // Vertex 0 is incident to edge 0
      expect(matrix[0][0]).toBe(1);
      // Vertex 1 is incident to both edges
      expect(matrix[1][0]).toBe(1);
      expect(matrix[1][1]).toBe(1);
      // Vertex 2 is incident to edge 1
      expect(matrix[2][1]).toBe(1);
    });

    it('should convert to incidence matrix (directed)', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      const matrix = g.toIncidenceMatrix();
      expect(matrix).toHaveLength(3);

      // For directed: +1 for source, -1 for target
      expect(matrix[0][0]).toBe(1); // 0 is source of edge 0
      expect(matrix[1][0]).toBe(-1); // 1 is target of edge 0
      expect(matrix[1][1]).toBe(1); // 1 is source of edge 1
      expect(matrix[2][1]).toBe(-1); // 2 is target of edge 1
    });
  });

  describe('Graph Utilities', () => {
    it('should clone a graph', () => {
      const g = new Graph(3);
      g.addEdge(0, 1, 5);
      g.addEdge(1, 2, 3);

      const clone = g.clone();
      expect(clone.getNumVertices()).toBe(3);
      expect(clone.getNumEdges()).toBe(2);
      expect(clone.getWeight(0, 1)).toBe(5);

      // Modify clone shouldn't affect original
      clone.addEdge(0, 2);
      expect(g.hasEdge(0, 2)).toBe(false);
      expect(clone.hasEdge(0, 2)).toBe(true);
    });

    it('should convert to string', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      const str = g.toString();
      expect(str).toContain('3 vertices');
      expect(str).toContain('2 edges');
      expect(str).toContain('undirected');
    });
  });

  describe('Edge Cases', () => {
    it('should handle self-loops', () => {
      const g = new Graph(3);
      g.addEdge(0, 0);

      expect(g.hasEdge(0, 0)).toBe(true);
      expect(g.getDegree(0)).toBe(1);
    });

    it('should handle empty graph', () => {
      const g = new Graph(5);

      expect(g.getNumEdges()).toBe(0);
      expect(g.toAdjacencyMatrix()).toEqual([
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ]);
    });

    it('should handle complete graph', () => {
      const g = new Graph(4);
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          g.addEdge(i, j);
        }
      }

      expect(g.getNumEdges()).toBe(6); // Complete graph K4 has 6 edges
      for (let i = 0; i < 4; i++) {
        expect(g.getDegree(i)).toBe(3);
      }
    });
  });
});
