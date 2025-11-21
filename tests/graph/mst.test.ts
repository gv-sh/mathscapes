import { Graph } from '../../src/graph/graph';
import {
  kruskal,
  prim,
  isSpanningTree,
  secondBestMST,
} from '../../src/graph/mst';

describe('Minimum Spanning Tree', () => {
  describe('Kruskal', () => {
    it('should find minimum spanning tree', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 6);
      g.addEdge(0, 3, 5);
      g.addEdge(1, 3, 15);
      g.addEdge(2, 3, 4);

      const mst = kruskal(g);
      expect(mst.edges).toHaveLength(3); // MST has V-1 edges
      expect(mst.totalWeight).toBe(19); // 4 + 5 + 10
    });

    it('should include correct edges', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 2);
      g.addEdge(2, 3, 3);
      g.addEdge(0, 3, 10);

      const mst = kruskal(g);
      const weights = mst.edges.map((e) => e.weight).sort();
      expect(weights).toEqual([1, 2, 3]);
    });

    it('should handle complete graph', () => {
      const g = new Graph(4, { weighted: true });
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          g.addEdge(i, j, i + j);
        }
      }

      const mst = kruskal(g);
      expect(mst.edges).toHaveLength(3);
    });

    it('should throw error for disconnected graph', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(2, 3, 1);

      expect(() => kruskal(g)).toThrow();
    });

    it('should throw error for directed graph', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);

      expect(() => kruskal(g)).toThrow();
    });

    it('should handle single edge', () => {
      const g = new Graph(2, { weighted: true });
      g.addEdge(0, 1, 5);

      const mst = kruskal(g);
      expect(mst.edges).toHaveLength(1);
      expect(mst.totalWeight).toBe(5);
    });
  });

  describe('Prim', () => {
    it('should find minimum spanning tree', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 6);
      g.addEdge(0, 3, 5);
      g.addEdge(1, 3, 15);
      g.addEdge(2, 3, 4);

      const mst = prim(g);
      expect(mst.edges).toHaveLength(3);
      expect(mst.totalWeight).toBe(19);
    });

    it('should produce same result as Kruskal', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 2);
      g.addEdge(0, 3, 6);
      g.addEdge(1, 2, 3);
      g.addEdge(1, 3, 8);
      g.addEdge(1, 4, 5);
      g.addEdge(2, 4, 7);
      g.addEdge(3, 4, 9);

      const mstKruskal = kruskal(g);
      const mstPrim = prim(g);

      expect(mstPrim.totalWeight).toBe(mstKruskal.totalWeight);
      expect(mstPrim.edges).toHaveLength(mstKruskal.edges.length);
    });

    it('should work with different start vertices', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 2);
      g.addEdge(2, 3, 3);
      g.addEdge(0, 3, 10);

      const mst0 = prim(g, 0);
      const mst2 = prim(g, 2);

      expect(mst0.totalWeight).toBe(mst2.totalWeight);
    });

    it('should throw error for disconnected graph', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(2, 3, 1);

      expect(() => prim(g)).toThrow();
    });

    it('should throw error for directed graph', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);

      expect(() => prim(g)).toThrow();
    });
  });

  describe('Is Spanning Tree', () => {
    it('should validate a spanning tree', () => {
      const g = new Graph(4);
      const edges = [
        { from: 0, to: 1, weight: 1 },
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 3, weight: 1 },
      ];

      expect(isSpanningTree(g, edges)).toBe(true);
    });

    it('should reject edges with cycle', () => {
      const g = new Graph(4);
      const edges = [
        { from: 0, to: 1, weight: 1 },
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 3, weight: 1 },
        { from: 3, to: 0, weight: 1 },
      ];

      expect(isSpanningTree(g, edges)).toBe(false);
    });

    it('should reject disconnected edges', () => {
      const g = new Graph(4);
      const edges = [
        { from: 0, to: 1, weight: 1 },
        { from: 2, to: 3, weight: 1 },
      ];

      expect(isSpanningTree(g, edges)).toBe(false);
    });

    it('should reject too few edges', () => {
      const g = new Graph(4);
      const edges = [
        { from: 0, to: 1, weight: 1 },
        { from: 1, to: 2, weight: 1 },
      ];

      expect(isSpanningTree(g, edges)).toBe(false);
    });
  });

  describe('Second Best MST', () => {
    it('should find second best MST', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(0, 2, 2);
      g.addEdge(1, 2, 3);
      g.addEdge(1, 3, 4);
      g.addEdge(2, 3, 5);

      const bestMST = kruskal(g);
      const secondBest = secondBestMST(g);

      expect(secondBest).not.toBeNull();
      expect(secondBest!.totalWeight).toBeGreaterThan(bestMST.totalWeight);
    });

    it('should return null if no second MST exists', () => {
      const g = new Graph(2, { weighted: true });
      g.addEdge(0, 1, 1);

      const secondBest = secondBestMST(g);
      // For 2 vertices with one edge, removing it makes graph disconnected
      expect(secondBest).toBeNull();
    });

    it('should handle graph with unique second-best MST', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(0, 2, 2);
      g.addEdge(1, 3, 3);
      g.addEdge(2, 3, 4);
      g.addEdge(1, 2, 5);

      const bestMST = kruskal(g);
      const secondBest = secondBestMST(g);

      expect(bestMST.totalWeight).toBe(6); // 1+2+3
      expect(secondBest).not.toBeNull();
      expect(secondBest!.totalWeight).toBeGreaterThan(bestMST.totalWeight);
      expect(secondBest!.edges).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum graph (2 vertices)', () => {
      const g = new Graph(2, { weighted: true });
      g.addEdge(0, 1, 1);

      const mstKruskal = kruskal(g);
      const mstPrim = prim(g);

      expect(mstKruskal.totalWeight).toBe(1);
      expect(mstPrim.totalWeight).toBe(1);
    });

    it('should handle graph with equal weights', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(0, 2, 1);
      g.addEdge(0, 3, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(1, 3, 1);
      g.addEdge(2, 3, 1);

      const mst = kruskal(g);
      expect(mst.edges).toHaveLength(3);
      expect(mst.totalWeight).toBe(3);
    });

    it('should handle linear graph', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 2);
      g.addEdge(2, 3, 3);
      g.addEdge(3, 4, 4);

      const mst = kruskal(g);
      expect(mst.totalWeight).toBe(10);
    });

    it('should handle star graph', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(0, 2, 2);
      g.addEdge(0, 3, 3);
      g.addEdge(0, 4, 4);

      const mst = kruskal(g);
      expect(mst.totalWeight).toBe(10);
      // All edges should connect to center (0)
      const hasCenter = mst.edges.every((e) => e.from === 0 || e.to === 0);
      expect(hasCenter).toBe(true);
    });

    it('should handle complete graph K5', () => {
      const g = new Graph(5, { weighted: true });
      let weight = 1;
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          g.addEdge(i, j, weight++);
        }
      }

      const mst = kruskal(g);
      expect(mst.edges).toHaveLength(4);
      // Should select 4 smallest edges: 1, 2, 3, 4
      expect(mst.totalWeight).toBe(10);
    });
  });

  describe('Real-world Example', () => {
    it('should solve classic textbook example', () => {
      // Example from many algorithms textbooks
      const g = new Graph(9, { weighted: true });
      g.addEdge(0, 1, 4);
      g.addEdge(0, 7, 8);
      g.addEdge(1, 2, 8);
      g.addEdge(1, 7, 11);
      g.addEdge(2, 3, 7);
      g.addEdge(2, 8, 2);
      g.addEdge(2, 5, 4);
      g.addEdge(3, 4, 9);
      g.addEdge(3, 5, 14);
      g.addEdge(4, 5, 10);
      g.addEdge(5, 6, 2);
      g.addEdge(6, 7, 1);
      g.addEdge(6, 8, 6);
      g.addEdge(7, 8, 7);

      const mstKruskal = kruskal(g);
      const mstPrim = prim(g);

      expect(mstKruskal.totalWeight).toBe(37);
      expect(mstPrim.totalWeight).toBe(37);
      expect(mstKruskal.edges).toHaveLength(8);
      expect(mstPrim.edges).toHaveLength(8);
    });
  });
});
