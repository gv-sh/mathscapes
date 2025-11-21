import { Graph } from '../../src/graph/graph';
import {
  degreeCentrality,
  betweennessCentrality,
  closenessCentrality,
  pageRank,
  eigenvectorCentrality,
} from '../../src/graph/centrality';

describe('Centrality Measures', () => {
  describe('degreeCentrality', () => {
    it('should compute degree centrality for simple graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(1, 2);

      const result = degreeCentrality(g, false);
      expect(result.centrality[0]).toBe(3); // vertex 0 has degree 3
      expect(result.maxVertex).toBe(0);
    });

    it('should normalize degree centrality', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(0, 4);

      const result = degreeCentrality(g, true);
      expect(result.centrality[0]).toBeCloseTo(1.0); // normalized to 1
      expect(result.centrality[1]).toBeCloseTo(0.25); // 1/4
    });

    it('should handle directed graphs', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(0, 2);

      const result = degreeCentrality(g, false);
      expect(result.centrality[0]).toBe(2); // out-degree
      expect(result.centrality[1]).toBe(0);
    });

    it('should handle empty graph', () => {
      const g = new Graph(3);
      const result = degreeCentrality(g);
      expect(result.maxValue).toBe(0);
    });
  });

  describe('betweennessCentrality', () => {
    it('should compute betweenness centrality for path graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);

      const result = betweennessCentrality(g, false);
      // Middle vertices have higher betweenness
      expect(result.centrality[2]).toBeGreaterThan(result.centrality[0]);
      expect(result.centrality[2]).toBeGreaterThan(result.centrality[4]);
    });

    it('should identify bridge vertices', () => {
      const g = new Graph(5);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(2, 4);

      const result = betweennessCentrality(g);
      // Vertex 2 is a bridge
      expect(result.maxVertex).toBe(2);
    });

    it('should handle star graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(0, 4);

      const result = betweennessCentrality(g);
      // Center has highest betweenness
      expect(result.maxVertex).toBe(0);
    });

    it('should handle complete graph', () => {
      const g = new Graph(4);
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          g.addEdge(i, j);
        }
      }

      const result = betweennessCentrality(g, true);
      // All vertices have equal betweenness in complete graph
      for (let i = 0; i < 4; i++) {
        expect(result.centrality[i]).toBeCloseTo(0);
      }
    });
  });

  describe('closenessCentrality', () => {
    it('should compute closeness centrality for path graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);

      const result = closenessCentrality(g);
      // Middle vertex has highest closeness
      expect(result.maxVertex).toBe(2);
    });

    it('should compute closeness for star graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(0, 4);

      const result = closenessCentrality(g);
      // Center has highest closeness
      expect(result.maxVertex).toBe(0);
    });

    it('should handle disconnected graph', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(2, 3);

      const result = closenessCentrality(g);
      // Should not crash
      expect(result.centrality.length).toBe(4);
    });

    it('should handle isolated vertex', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      // Vertex 2 is isolated

      const result = closenessCentrality(g);
      expect(result.centrality[2]).toBe(0);
    });
  });

  describe('pageRank', () => {
    it('should compute PageRank for simple directed graph', () => {
      const g = new Graph(4, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 0);
      g.addEdge(1, 3);

      const result = pageRank(g);
      // All ranks should sum to approximately 1
      const sum = result.centrality.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 2);
    });

    it('should handle different damping factors', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 0);

      const result1 = pageRank(g, { dampingFactor: 0.85 });
      const result2 = pageRank(g, { dampingFactor: 0.5 });

      // Results should be different
      expect(result1.centrality[0]).not.toBeCloseTo(result2.centrality[0]);
    });

    it('should converge within max iterations', () => {
      const g = new Graph(4, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);

      const result = pageRank(g, { maxIterations: 10 });
      expect(result.centrality.length).toBe(4);
    });

    it('should handle dangling nodes', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      // Vertex 2 has no outgoing edges (dangling)

      const result = pageRank(g);
      const sum = result.centrality.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 2);
    });

    it('should handle graph with cycle', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 0);

      const result = pageRank(g);
      // In a cycle, all vertices should have equal PageRank
      expect(result.centrality[0]).toBeCloseTo(result.centrality[1], 2);
      expect(result.centrality[1]).toBeCloseTo(result.centrality[2], 2);
    });
  });

  describe('eigenvectorCentrality', () => {
    it('should compute eigenvector centrality for simple graph', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 0);

      const result = eigenvectorCentrality(g);
      // All vertices in cycle should have equal centrality
      for (let i = 0; i < 3; i++) {
        expect(result.centrality[i]).toBeCloseTo(result.centrality[i + 1], 2);
      }
    });

    it('should handle star graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(0, 4);

      const result = eigenvectorCentrality(g);
      // Center should have highest eigenvector centrality
      expect(result.maxVertex).toBe(0);
    });

    it('should handle disconnected graph', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(2, 3);

      const result = eigenvectorCentrality(g);
      expect(result.centrality.length).toBe(4);
    });

    it('should handle graph with no edges', () => {
      const g = new Graph(3);

      const result = eigenvectorCentrality(g);
      expect(result.maxValue).toBe(0);
    });

    it('should converge for complex graph', () => {
      const g = new Graph(6);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      g.addEdge(3, 5);

      const result = eigenvectorCentrality(g);
      // Vertex 3 should have high centrality (connected to many important nodes)
      expect(result.centrality[3]).toBeGreaterThan(result.centrality[0]);
    });
  });
});
