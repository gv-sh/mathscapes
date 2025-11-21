import { Graph } from '../../src/graph/graph';
import {
  greedyMatching,
  maxBipartiteMatching,
  hungarianMatching,
  maxMatching,
  isPerfectMatching,
  isMaximalMatching,
  minVertexCover,
  maxIndependentSet,
} from '../../src/graph/matching';

describe('Graph Matching Algorithms', () => {
  describe('greedyMatching', () => {
    it('should find a maximal matching', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);

      const result = greedyMatching(g);

      expect(result.size).toBe(2);
      expect(result.matching.length).toBe(2);
    });

    it('should handle triangle', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);

      const result = greedyMatching(g);

      expect(result.size).toBe(1);
      expect(isMaximalMatching(g, result)).toBe(true);
    });

    it('should handle complete graph', () => {
      const g = new Graph(4);
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          g.addEdge(i, j);
        }
      }

      const result = greedyMatching(g);

      expect(result.size).toBe(2);
    });

    it('should handle disconnected components', () => {
      const g = new Graph(6);
      g.addEdge(0, 1);
      g.addEdge(2, 3);
      g.addEdge(4, 5);

      const result = greedyMatching(g);

      expect(result.size).toBe(3);
    });

    it('should handle empty graph', () => {
      const g = new Graph(3);
      const result = greedyMatching(g);

      expect(result.size).toBe(0);
      expect(result.matching.length).toBe(0);
    });
  });

  describe('maxBipartiteMatching', () => {
    it('should find maximum matching in bipartite graph', () => {
      const g = new Graph(6);
      // Left: 0, 1, 2; Right: 3, 4, 5
      g.addEdge(0, 3);
      g.addEdge(0, 4);
      g.addEdge(1, 3);
      g.addEdge(1, 4);
      g.addEdge(2, 5);

      const result = maxBipartiteMatching(g);

      expect(result.size).toBe(3);
    });

    it('should find perfect matching', () => {
      const g = new Graph(4);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);

      const result = maxBipartiteMatching(g);

      expect(result.size).toBe(2);
      expect(isPerfectMatching(g, result)).toBe(true);
    });

    it('should handle unbalanced bipartite graph', () => {
      const g = new Graph(5);
      // Left: 0, 1; Right: 2, 3, 4
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(1, 3);
      g.addEdge(1, 4);

      const result = maxBipartiteMatching(g);

      expect(result.size).toBe(2);
    });

    it('should handle complete bipartite graph K(3,3)', () => {
      const g = new Graph(6);
      for (let i = 0; i < 3; i++) {
        for (let j = 3; j < 6; j++) {
          g.addEdge(i, j);
        }
      }

      const result = maxBipartiteMatching(g);

      expect(result.size).toBe(3);
      expect(isPerfectMatching(g, result)).toBe(true);
    });

    it('should throw error for non-bipartite graph', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2); // Triangle is not bipartite

      expect(() => maxBipartiteMatching(g)).toThrow();
    });

    it('should handle bipartite graph with no edges', () => {
      const g = new Graph(4);
      // No edges added

      const result = maxBipartiteMatching(g);
      expect(result.size).toBe(0);
    });
  });

  describe('hungarianMatching', () => {
    it('should find maximum matching', () => {
      const g = new Graph(6);
      g.addEdge(0, 3);
      g.addEdge(0, 4);
      g.addEdge(1, 3);
      g.addEdge(2, 4);
      g.addEdge(2, 5);

      const result = hungarianMatching(g);

      expect(result.size).toBeGreaterThanOrEqual(2);
    });

    it('should match maxBipartiteMatching result', () => {
      const g = new Graph(4);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);

      const result1 = hungarianMatching(g);
      const result2 = maxBipartiteMatching(g);

      expect(result1.size).toBe(result2.size);
    });
  });

  describe('maxMatching', () => {
    it('should find maximum matching in general graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);

      const result = maxMatching(g);

      expect(result.size).toBe(2);
    });

    it('should handle odd cycle', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      g.addEdge(4, 0);

      const result = maxMatching(g);

      expect(result.size).toBe(2); // Maximum for odd cycle
    });

    it('should handle even cycle', () => {
      const g = new Graph(6);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      g.addEdge(4, 5);
      g.addEdge(5, 0);

      const result = maxMatching(g);

      expect(result.size).toBe(3); // Perfect matching for even cycle
    });

    it('should handle petersen graph structure', () => {
      const g = new Graph(5);
      // Pentagon
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      g.addEdge(4, 0);

      const result = maxMatching(g);

      expect(result.size).toBe(2);
    });

    it('should work on bipartite graphs', () => {
      const g = new Graph(6);
      g.addEdge(0, 3);
      g.addEdge(0, 4);
      g.addEdge(1, 3);
      g.addEdge(2, 4);
      g.addEdge(2, 5);

      const result = maxMatching(g);

      expect(result.size).toBeGreaterThanOrEqual(2);
    });

    it('should handle complete graph K4', () => {
      const g = new Graph(4);
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          g.addEdge(i, j);
        }
      }

      const result = maxMatching(g);

      expect(result.size).toBe(2);
      expect(isPerfectMatching(g, result)).toBe(true);
    });
  });

  describe('isPerfectMatching', () => {
    it('should identify perfect matching', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(2, 3);

      const result = greedyMatching(g);

      expect(isPerfectMatching(g, result)).toBe(true);
    });

    it('should identify non-perfect matching', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(2, 3);

      const result = greedyMatching(g);

      expect(isPerfectMatching(g, result)).toBe(false);
    });

    it('should handle empty matching', () => {
      const g = new Graph(3);
      const result = { matching: [], size: 0, match: [-1, -1, -1] };

      expect(isPerfectMatching(g, result)).toBe(false);
    });
  });

  describe('isMaximalMatching', () => {
    it('should identify maximal matching', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      const result = { matching: [[0, 1]], size: 1, match: [1, 0, -1] };

      expect(isMaximalMatching(g, result)).toBe(true);
    });

    it('should identify non-maximal matching', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(2, 3);

      const result = { matching: [[0, 1]], size: 1, match: [1, 0, -1, -1] };

      expect(isMaximalMatching(g, result)).toBe(false); // Can add edge (2,3)
    });

    it('should handle empty matching on non-empty graph', () => {
      const g = new Graph(2);
      g.addEdge(0, 1);

      const result = { matching: [], size: 0, match: [-1, -1] };

      expect(isMaximalMatching(g, result)).toBe(false);
    });

    it('should handle perfect matching', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(2, 3);

      const result = {
        matching: [
          [0, 1],
          [2, 3],
        ],
        size: 2,
        match: [1, 0, 3, 2],
      };

      expect(isMaximalMatching(g, result)).toBe(true);
    });
  });

  describe('minVertexCover', () => {
    it('should find minimum vertex cover in bipartite graph', () => {
      const g = new Graph(6);
      g.addEdge(0, 3);
      g.addEdge(0, 4);
      g.addEdge(1, 3);
      g.addEdge(1, 4);
      g.addEdge(2, 5);

      const matching = maxBipartiteMatching(g);
      const cover = minVertexCover(g, matching);

      // By König's theorem: |min vertex cover| = |max matching|
      expect(cover.length).toBe(matching.size);

      // Verify it's a valid vertex cover
      for (let u = 0; u < 6; u++) {
        for (const v of g.getNeighbors(u)) {
          expect(cover.includes(u) || cover.includes(v)).toBe(true);
        }
      }
    });

    it('should satisfy König\'s theorem', () => {
      const g = new Graph(4);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);

      const matching = maxBipartiteMatching(g);
      const cover = minVertexCover(g, matching);

      expect(cover.length).toBe(matching.size);
    });

    it('should handle complete bipartite graph K(2,3)', () => {
      const g = new Graph(5);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(0, 4);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(1, 4);

      const matching = maxBipartiteMatching(g);
      const cover = minVertexCover(g, matching);

      expect(cover.length).toBe(2); // Can cover with smaller side
    });

    it('should throw error for non-bipartite graph', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 2);

      const matching = greedyMatching(g);

      expect(() => minVertexCover(g, matching)).toThrow();
    });
  });

  describe('maxIndependentSet', () => {
    it('should find maximum independent set', () => {
      const g = new Graph(6);
      g.addEdge(0, 3);
      g.addEdge(0, 4);
      g.addEdge(1, 3);
      g.addEdge(1, 4);
      g.addEdge(2, 5);

      const matching = maxBipartiteMatching(g);
      const independentSet = maxIndependentSet(g, matching);

      // |independent set| + |vertex cover| = |V|
      const cover = minVertexCover(g, matching);
      expect(independentSet.length + cover.length).toBe(6);

      // Verify no edges within independent set
      for (const u of independentSet) {
        for (const v of g.getNeighbors(u)) {
          expect(independentSet.includes(v)).toBe(false);
        }
      }
    });

    it('should complement vertex cover', () => {
      const g = new Graph(4);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);

      const matching = maxBipartiteMatching(g);
      const cover = minVertexCover(g, matching);
      const independentSet = maxIndependentSet(g, matching);

      const coverSet = new Set(cover);
      const indepSet = new Set(independentSet);

      // They should be complements
      expect(coverSet.size + indepSet.size).toBe(4);
      for (const v of cover) {
        expect(indepSet.has(v)).toBe(false);
      }
    });

    it('should handle star graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(0, 4);

      const matching = maxBipartiteMatching(g);
      const independentSet = maxIndependentSet(g, matching);

      // Independent set should be the leaves
      expect(independentSet.length).toBe(4);
      expect(independentSet.includes(0)).toBe(false);
    });
  });

  describe('Matching Properties', () => {
    it('should have valid match array', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(2, 3);

      const result = maxMatching(g);

      // Check symmetry
      for (let v = 0; v < 4; v++) {
        if (result.match[v] !== -1) {
          const u = result.match[v];
          expect(result.match[u]).toBe(v);
        }
      }
    });

    it('should have matching edges in graph', () => {
      const g = new Graph(6);
      g.addEdge(0, 3);
      g.addEdge(1, 4);
      g.addEdge(2, 5);

      const result = maxMatching(g);

      // All matched edges should exist in graph
      for (const [u, v] of result.matching) {
        expect(g.hasEdge(u, v) || g.hasEdge(v, u)).toBe(true);
      }
    });

    it('should not match vertex twice', () => {
      const g = new Graph(5);
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          g.addEdge(i, j);
        }
      }

      const result = maxMatching(g);

      const matched = new Set<number>();
      for (const [u, v] of result.matching) {
        expect(matched.has(u)).toBe(false);
        expect(matched.has(v)).toBe(false);
        matched.add(u);
        matched.add(v);
      }
    });
  });
});
