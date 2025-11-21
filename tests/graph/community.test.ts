import { Graph } from '../../src/graph/graph';
import {
  computeModularity,
  modularityOptimization,
  labelPropagation,
  louvain,
  findCliques,
} from '../../src/graph/community';

describe('Community Detection', () => {
  describe('computeModularity', () => {
    it('should compute modularity for two clear communities', () => {
      const g = new Graph(6);
      // Community 1: 0, 1, 2
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      // Community 2: 3, 4, 5
      g.addEdge(3, 4);
      g.addEdge(3, 5);
      g.addEdge(4, 5);
      // One inter-community edge
      g.addEdge(0, 3);

      const communities = [0, 0, 0, 1, 1, 1];
      const modularity = computeModularity(g, communities);

      // Should be positive for good partition
      expect(modularity).toBeGreaterThan(0);
    });

    it('should give zero modularity for random partition', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 0);

      // All in same community
      const communities = [0, 0, 0, 0];
      const modularity = computeModularity(g, communities);

      expect(modularity).toBeCloseTo(0, 1);
    });

    it('should handle empty graph', () => {
      const g = new Graph(3);
      const communities = [0, 0, 1];
      const modularity = computeModularity(g, communities);
      expect(modularity).toBe(0);
    });

    it('should compute negative modularity for bad partition', () => {
      const g = new Graph(4);
      // Complete graph
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          g.addEdge(i, j);
        }
      }

      // Each vertex in own community (bad for complete graph)
      const communities = [0, 1, 2, 3];
      const modularity = computeModularity(g, communities);

      expect(modularity).toBeLessThan(0);
    });
  });

  describe('modularityOptimization', () => {
    it('should detect two communities', () => {
      const g = new Graph(6);
      // Community 1: 0, 1, 2
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      // Community 2: 3, 4, 5
      g.addEdge(3, 4);
      g.addEdge(3, 5);
      g.addEdge(4, 5);

      const result = modularityOptimization(g);

      // Should find 2 communities
      expect(result.numCommunities).toBeLessThanOrEqual(2);
      // Vertices in same cluster should have same community
      expect(result.communities[0]).toBe(result.communities[1]);
      expect(result.communities[3]).toBe(result.communities[4]);
    });

    it('should handle complete graph', () => {
      const g = new Graph(5);
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          g.addEdge(i, j);
        }
      }

      const result = modularityOptimization(g);
      // Complete graph should be one community
      expect(result.numCommunities).toBe(1);
    });

    it('should handle disconnected components', () => {
      const g = new Graph(6);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(3, 4);
      g.addEdge(4, 5);

      const result = modularityOptimization(g);
      // Should find at least 2 communities
      expect(result.numCommunities).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty graph', () => {
      const g = new Graph(3);
      const result = modularityOptimization(g);
      expect(result.numCommunities).toBe(3);
      expect(result.modularity).toBe(0);
    });
  });

  describe('labelPropagation', () => {
    it('should detect communities in simple graph', () => {
      const g = new Graph(6);
      // Community 1
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      // Community 2
      g.addEdge(3, 4);
      g.addEdge(3, 5);
      g.addEdge(4, 5);

      const result = labelPropagation(g);

      // Should find 2 communities
      expect(result.numCommunities).toBeLessThanOrEqual(2);
      expect(result.modularity).toBeGreaterThan(0);
    });

    it('should handle single vertex graph', () => {
      const g = new Graph(1);
      const result = labelPropagation(g);
      expect(result.numCommunities).toBe(1);
    });

    it('should converge within max iterations', () => {
      const g = new Graph(8);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      g.addEdge(4, 5);
      g.addEdge(5, 6);
      g.addEdge(6, 7);

      const result = labelPropagation(g, { maxIterations: 10 });
      expect(result.communities.length).toBe(8);
    });

    it('should use custom seed', () => {
      const g = new Graph(6);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      g.addEdge(4, 5);

      const result1 = labelPropagation(g, { seed: 42 });
      const result2 = labelPropagation(g, { seed: 42 });

      // Same seed should give same result
      expect(result1.communities).toEqual(result2.communities);
    });

    it('should handle three communities', () => {
      const g = new Graph(9);
      // Community 1
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      // Community 2
      g.addEdge(3, 4);
      g.addEdge(3, 5);
      g.addEdge(4, 5);
      // Community 3
      g.addEdge(6, 7);
      g.addEdge(6, 8);
      g.addEdge(7, 8);

      const result = labelPropagation(g);
      expect(result.numCommunities).toBeLessThanOrEqual(3);
    });
  });

  describe('louvain', () => {
    it('should detect communities using Louvain method', () => {
      const g = new Graph(8);
      // Community 1
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      // Community 2
      g.addEdge(4, 5);
      g.addEdge(4, 6);
      g.addEdge(5, 6);
      g.addEdge(5, 7);
      // Bridge
      g.addEdge(3, 4);

      const result = louvain(g);

      // Should detect communities
      expect(result.numCommunities).toBeGreaterThanOrEqual(2);
      expect(result.modularity).toBeGreaterThanOrEqual(0);
    });

    it('should handle karate club graph structure', () => {
      // Simplified karate club
      const g = new Graph(8);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(4, 5);
      g.addEdge(4, 6);
      g.addEdge(4, 7);
      g.addEdge(5, 6);
      g.addEdge(5, 7);
      g.addEdge(2, 5); // Bridge

      const result = louvain(g);
      expect(result.numCommunities).toBeGreaterThanOrEqual(2);
    });

    it('should handle complete graph', () => {
      const g = new Graph(4);
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          g.addEdge(i, j);
        }
      }

      const result = louvain(g);
      expect(result.numCommunities).toBe(1);
    });

    it('should handle custom modularity gain threshold', () => {
      const g = new Graph(6);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(3, 4);
      g.addEdge(4, 5);

      const result = louvain(g, 0.1);
      expect(result.communities.length).toBe(6);
    });
  });

  describe('findCliques', () => {
    it('should find triangles in graph', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      g.addEdge(2, 3);

      const cliques = findCliques(g, 3);

      // Should find one triangle
      expect(cliques.length).toBe(1);
      expect(cliques[0]).toEqual([0, 1, 2]);
    });

    it('should find all cliques of different sizes', () => {
      const g = new Graph(5);
      // K4 (complete graph on 4 vertices)
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      // Extra vertex
      g.addEdge(3, 4);

      const cliques4 = findCliques(g, 4);
      const cliques3 = findCliques(g, 3);

      // Should find one 4-clique
      expect(cliques4.length).toBe(1);
      // Should find multiple 3-cliques
      expect(cliques3.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle graph with no cliques of given size', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);

      const cliques = findCliques(g, 3);
      expect(cliques.length).toBe(0);
    });

    it('should find multiple separate triangles', () => {
      const g = new Graph(6);
      // Triangle 1
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      // Triangle 2
      g.addEdge(3, 4);
      g.addEdge(3, 5);
      g.addEdge(4, 5);

      const cliques = findCliques(g, 3);
      expect(cliques.length).toBe(2);
    });

    it('should handle empty graph', () => {
      const g = new Graph(3);
      const cliques = findCliques(g, 3);
      expect(cliques.length).toBe(0);
    });

    it('should find K5 (complete graph on 5 vertices)', () => {
      const g = new Graph(5);
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          g.addEdge(i, j);
        }
      }

      const cliques = findCliques(g, 5);
      expect(cliques.length).toBe(1);
      expect(cliques[0].length).toBe(5);
    });

    it('should respect minimum clique size', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);
      g.addEdge(2, 3);

      const cliques2 = findCliques(g, 2);
      const cliques3 = findCliques(g, 3);

      // With minSize=2, should find more cliques than with minSize=3
      expect(cliques2.length).toBeGreaterThanOrEqual(cliques3.length);
    });
  });
});
