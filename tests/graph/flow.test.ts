import { Graph } from '../../src/graph/graph';
import {
  fordFulkerson,
  edmondsKarp,
  minCut,
  dinic,
  circulation,
} from '../../src/graph/flow';

describe('Flow Algorithms', () => {
  describe('fordFulkerson', () => {
    it('should compute max flow in simple network', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 10);
      g.addEdge(1, 3, 10);
      g.addEdge(2, 3, 10);

      const result = fordFulkerson(g, 0, 3);
      expect(result.maxFlow).toBe(20);
    });

    it('should handle network with bottleneck', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 100);
      g.addEdge(1, 2, 1);
      g.addEdge(2, 3, 100);

      const result = fordFulkerson(g, 0, 3);
      expect(result.maxFlow).toBe(1); // Bottleneck at edge 1->2
    });

    it('should compute max flow in complex network', () => {
      const g = new Graph(6, { directed: true, weighted: true });
      g.addEdge(0, 1, 16);
      g.addEdge(0, 2, 13);
      g.addEdge(1, 3, 12);
      g.addEdge(2, 1, 4);
      g.addEdge(2, 4, 14);
      g.addEdge(3, 2, 9);
      g.addEdge(3, 5, 20);
      g.addEdge(4, 3, 7);
      g.addEdge(4, 5, 4);

      const result = fordFulkerson(g, 0, 5);
      expect(result.maxFlow).toBe(23);
    });

    it('should return zero flow when no path exists', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(2, 3, 10);
      // No path from 0 to 3

      const result = fordFulkerson(g, 0, 3);
      expect(result.maxFlow).toBe(0);
    });

    it('should handle single edge', () => {
      const g = new Graph(2, { directed: true, weighted: true });
      g.addEdge(0, 1, 5);

      const result = fordFulkerson(g, 0, 1);
      expect(result.maxFlow).toBe(5);
    });

    it('should work with BFS (Edmonds-Karp)', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 5);
      g.addEdge(1, 2, 15);
      g.addEdge(1, 3, 10);
      g.addEdge(2, 3, 10);

      const result = fordFulkerson(g, 0, 3, true);
      expect(result.maxFlow).toBe(15);
    });

    it('should work with DFS', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 5);
      g.addEdge(1, 2, 15);
      g.addEdge(1, 3, 10);
      g.addEdge(2, 3, 10);

      const result = fordFulkerson(g, 0, 3, false);
      expect(result.maxFlow).toBe(15);
    });

    it('should throw error for undirected graph', () => {
      const g = new Graph(3, { directed: false, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(1, 2, 10);

      expect(() => fordFulkerson(g, 0, 2)).toThrow();
    });
  });

  describe('edmondsKarp', () => {
    it('should compute max flow using BFS', () => {
      const g = new Graph(6, { directed: true, weighted: true });
      g.addEdge(0, 1, 16);
      g.addEdge(0, 2, 13);
      g.addEdge(1, 3, 12);
      g.addEdge(2, 1, 4);
      g.addEdge(2, 4, 14);
      g.addEdge(3, 2, 9);
      g.addEdge(3, 5, 20);
      g.addEdge(4, 3, 7);
      g.addEdge(4, 5, 4);

      const result = edmondsKarp(g, 0, 5);
      expect(result.maxFlow).toBe(23);
    });

    it('should handle parallel edges', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(1, 2, 5);
      g.addEdge(1, 2, 5); // Parallel edge

      const result = edmondsKarp(g, 0, 2);
      expect(result.maxFlow).toBe(10);
    });

    it('should handle unit capacities', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(0, 2, 1);
      g.addEdge(1, 3, 1);
      g.addEdge(2, 3, 1);

      const result = edmondsKarp(g, 0, 3);
      expect(result.maxFlow).toBe(2);
    });
  });

  describe('minCut', () => {
    it('should compute min cut equal to max flow', () => {
      const g = new Graph(6, { directed: true, weighted: true });
      g.addEdge(0, 1, 16);
      g.addEdge(0, 2, 13);
      g.addEdge(1, 3, 12);
      g.addEdge(2, 1, 4);
      g.addEdge(2, 4, 14);
      g.addEdge(3, 2, 9);
      g.addEdge(3, 5, 20);
      g.addEdge(4, 3, 7);
      g.addEdge(4, 5, 4);

      const result = minCut(g, 0, 5);

      expect(result.cutValue).toBe(23);
      expect(result.sourceSet.length + result.sinkSet.length).toBe(6);
      expect(result.sourceSet).toContain(0);
      expect(result.sinkSet).toContain(5);
    });

    it('should find cut edges', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 10);
      g.addEdge(1, 3, 10);
      g.addEdge(2, 3, 10);

      const result = minCut(g, 0, 3);

      // Cut edges should have total capacity = max flow
      const totalCapacity = result.cutEdges.reduce(
        (sum, edge) => sum + edge.capacity,
        0
      );
      expect(totalCapacity).toBe(result.cutValue);
    });

    it('should handle single bottleneck edge', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 100);
      g.addEdge(1, 2, 5);

      const result = minCut(g, 0, 2);

      expect(result.cutValue).toBe(5);
      expect(result.cutEdges.length).toBe(1);
      expect(result.cutEdges[0].from).toBe(1);
      expect(result.cutEdges[0].to).toBe(2);
    });

    it('should partition vertices correctly', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(1, 2, 1);
      g.addEdge(2, 3, 10);

      const result = minCut(g, 0, 3);

      // Bottleneck edge 1->2 should separate source and sink sets
      expect(result.sourceSet).toContain(0);
      expect(result.sourceSet).toContain(1);
      expect(result.sinkSet).toContain(2);
      expect(result.sinkSet).toContain(3);
    });
  });

  describe('dinic', () => {
    it('should compute max flow efficiently', () => {
      const g = new Graph(6, { directed: true, weighted: true });
      g.addEdge(0, 1, 16);
      g.addEdge(0, 2, 13);
      g.addEdge(1, 3, 12);
      g.addEdge(2, 1, 4);
      g.addEdge(2, 4, 14);
      g.addEdge(3, 2, 9);
      g.addEdge(3, 5, 20);
      g.addEdge(4, 3, 7);
      g.addEdge(4, 5, 4);

      const result = dinic(g, 0, 5);
      expect(result.maxFlow).toBe(23);
    });

    it('should handle bipartite matching as max flow', () => {
      // Convert bipartite matching to flow problem
      const g = new Graph(6, { directed: true, weighted: true });
      // Source to left vertices
      g.addEdge(0, 1, 1);
      g.addEdge(0, 2, 1);
      // Left to right vertices
      g.addEdge(1, 3, 1);
      g.addEdge(1, 4, 1);
      g.addEdge(2, 4, 1);
      // Right vertices to sink
      g.addEdge(3, 5, 1);
      g.addEdge(4, 5, 1);

      const result = dinic(g, 0, 5);
      expect(result.maxFlow).toBe(2);
    });

    it('should handle unit capacity network', () => {
      const g = new Graph(5, { directed: true, weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(0, 2, 1);
      g.addEdge(1, 3, 1);
      g.addEdge(2, 3, 1);
      g.addEdge(3, 4, 1);

      const result = dinic(g, 0, 4);
      expect(result.maxFlow).toBe(1);
    });

    it('should match Ford-Fulkerson result', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 5);
      g.addEdge(1, 2, 15);
      g.addEdge(1, 3, 10);
      g.addEdge(2, 3, 10);

      const resultDinic = dinic(g, 0, 3);
      const resultFF = fordFulkerson(g, 0, 3);

      expect(resultDinic.maxFlow).toBe(resultFF.maxFlow);
    });

    it('should throw error for undirected graph', () => {
      const g = new Graph(3, { directed: false, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(1, 2, 10);

      expect(() => dinic(g, 0, 2)).toThrow();
    });
  });

  describe('circulation', () => {
    it('should find feasible circulation', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(1, 2, 10);
      g.addEdge(2, 3, 10);
      g.addEdge(3, 0, 10);

      // Demands: vertex 0 supplies 5, vertex 2 demands 5
      const demands = [-5, 0, 5, 0];

      const result = circulation(g, demands);
      expect(result).not.toBeNull();
    });

    it('should return null for infeasible circulation', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 5);
      g.addEdge(1, 2, 5);

      // Demands: vertex 0 supplies 10, vertex 2 demands 10
      // But capacity is only 5
      const demands = [-10, 0, 10];

      const result = circulation(g, demands);
      expect(result).toBeNull();
    });

    it('should handle balanced demands', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 10);
      g.addEdge(1, 3, 10);
      g.addEdge(2, 3, 10);

      // Balanced: vertex 0 supplies 10, vertex 3 demands 10
      const demands = [-10, 0, 0, 10];

      const result = circulation(g, demands);
      expect(result).not.toBeNull();
    });

    it('should handle multiple sources and sinks', () => {
      const g = new Graph(5, { directed: true, weighted: true });
      g.addEdge(0, 2, 10);
      g.addEdge(1, 2, 10);
      g.addEdge(2, 3, 10);
      g.addEdge(2, 4, 10);

      // Two sources (0, 1) and two sinks (3, 4)
      const demands = [-5, -5, 0, 5, 5];

      const result = circulation(g, demands);
      expect(result).not.toBeNull();
    });

    it('should handle zero demands', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(1, 2, 10);

      const demands = [0, 0, 0];

      const result = circulation(g, demands);
      expect(result).not.toBeNull();
    });
  });

  describe('Flow Conservation', () => {
    it('should satisfy flow conservation at intermediate nodes', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(0, 2, 10);
      g.addEdge(1, 3, 10);
      g.addEdge(2, 3, 10);

      const result = fordFulkerson(g, 0, 3);

      // Check flow conservation at node 1
      let inFlow1 = 0;
      let outFlow1 = 0;
      if (result.flow.get(0)?.has(1)) {
        inFlow1 += result.flow.get(0)!.get(1)!;
      }
      if (result.flow.get(1)?.has(3)) {
        outFlow1 += result.flow.get(1)!.get(3)!;
      }

      expect(inFlow1).toBe(outFlow1);
    });

    it('should respect capacity constraints', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 10);
      g.addEdge(1, 2, 5);

      const result = fordFulkerson(g, 0, 2);

      // Flow on each edge should not exceed capacity
      for (const [from, neighbors] of result.flow) {
        for (const [to, flow] of neighbors) {
          const capacity = g.getWeight(from, to) ?? 0;
          expect(flow).toBeLessThanOrEqual(capacity);
        }
      }
    });
  });
});
