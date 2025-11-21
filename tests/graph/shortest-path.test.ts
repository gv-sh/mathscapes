import { Graph } from '../../src/graph/graph';
import {
  dijkstra,
  bellmanFord,
  floydWarshall,
  aStar,
  shortestPath,
  allShortestPaths,
  reconstructPath,
} from '../../src/graph/shortest-path';

describe('Shortest Path Algorithms', () => {
  describe('Dijkstra', () => {
    it('should find shortest paths from source', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 4);
      g.addEdge(0, 2, 1);
      g.addEdge(2, 1, 2);
      g.addEdge(1, 3, 1);
      g.addEdge(2, 3, 5);
      g.addEdge(3, 4, 3);

      const result = dijkstra(g, 0);
      expect(result.distances[0]).toBe(0);
      expect(result.distances[1]).toBe(3);
      expect(result.distances[2]).toBe(1);
      expect(result.distances[3]).toBe(4);
      expect(result.distances[4]).toBe(7);
    });

    it('should handle unreachable vertices', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(3, 4, 1);

      const result = dijkstra(g, 0);
      expect(result.distances[0]).toBe(0);
      expect(result.distances[1]).toBe(1);
      expect(result.distances[2]).toBe(2);
      expect(result.distances[3]).toBe(Infinity);
      expect(result.distances[4]).toBe(Infinity);
    });

    it('should compute correct predecessors', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(2, 3, 1);

      const result = dijkstra(g, 0);
      expect(result.predecessors[0]).toBeNull();
      expect(result.predecessors[1]).toBe(0);
      expect(result.predecessors[2]).toBe(1);
      expect(result.predecessors[3]).toBe(2);
    });

    it('should handle single vertex', () => {
      const g = new Graph(1);
      const result = dijkstra(g, 0);
      expect(result.distances[0]).toBe(0);
    });

    it('should work with directed graphs', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 5);
      g.addEdge(1, 2, 3);
      g.addEdge(0, 2, 10);

      const result = dijkstra(g, 0);
      expect(result.distances[2]).toBe(8); // 0->1->2 is shorter than 0->2
    });
  });

  describe('Bellman-Ford', () => {
    it('should handle negative weights', () => {
      const g = new Graph(5, { directed: true, weighted: true });
      g.addEdge(0, 1, -1);
      g.addEdge(0, 2, 4);
      g.addEdge(1, 2, 3);
      g.addEdge(1, 3, 2);
      g.addEdge(1, 4, 2);
      g.addEdge(3, 2, 5);
      g.addEdge(3, 1, 1);
      g.addEdge(4, 3, -3);

      const result = bellmanFord(g, 0);
      expect(result).not.toBeNull();
      expect(result!.distances[0]).toBe(0);
      expect(result!.distances[1]).toBe(-1);
      expect(result!.distances[4]).toBe(1);
    });

    it('should detect negative cycles', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, -3);
      g.addEdge(2, 0, 1);

      const result = bellmanFord(g, 0);
      expect(result).toBeNull();
    });

    it('should work with positive weights', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 2);
      g.addEdge(2, 3, 3);

      const result = bellmanFord(g, 0);
      expect(result).not.toBeNull();
      expect(result!.distances[0]).toBe(0);
      expect(result!.distances[1]).toBe(1);
      expect(result!.distances[2]).toBe(3);
      expect(result!.distances[3]).toBe(6);
    });

    it('should handle unreachable vertices', () => {
      const g = new Graph(5, { directed: true, weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(3, 4, 1);

      const result = bellmanFord(g, 0);
      expect(result).not.toBeNull();
      expect(result!.distances[3]).toBe(Infinity);
      expect(result!.distances[4]).toBe(Infinity);
    });
  });

  describe('Floyd-Warshall', () => {
    it('should compute all-pairs shortest paths', () => {
      const g = new Graph(4, { directed: true, weighted: true });
      g.addEdge(0, 1, 3);
      g.addEdge(0, 3, 7);
      g.addEdge(1, 2, 2);
      g.addEdge(2, 3, 1);

      const dist = floydWarshall(g);
      expect(dist[0][0]).toBe(0);
      expect(dist[0][1]).toBe(3);
      expect(dist[0][2]).toBe(5);
      expect(dist[0][3]).toBe(6);
    });

    it('should handle negative weights', () => {
      const g = new Graph(3, { directed: true, weighted: true });
      g.addEdge(0, 1, 4);
      g.addEdge(0, 2, 5);
      g.addEdge(1, 2, -2);

      const dist = floydWarshall(g);
      expect(dist[0][2]).toBe(2); // 0->1->2 with cost 4-2=2
    });

    it('should handle disconnected vertices', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(2, 3, 1);

      const dist = floydWarshall(g);
      expect(dist[0][1]).toBe(1);
      expect(dist[0][2]).toBe(Infinity);
      expect(dist[0][3]).toBe(Infinity);
    });

    it('should work with undirected graphs', () => {
      const g = new Graph(3, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 2);

      const dist = floydWarshall(g);
      expect(dist[0][2]).toBe(3);
      expect(dist[2][0]).toBe(3);
    });
  });

  describe('A* Pathfinding', () => {
    it('should find shortest path with zero heuristic', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(2, 4, 1);
      g.addEdge(0, 3, 1);
      g.addEdge(3, 4, 5);

      const heuristic = () => 0; // Zero heuristic = Dijkstra
      const path = aStar(g, 0, 4, heuristic);

      expect(path).not.toBeNull();
      expect(path).toEqual([0, 1, 2, 4]);
    });

    it('should find shortest path with admissible heuristic', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(2, 4, 1);
      g.addEdge(0, 3, 1);
      g.addEdge(3, 4, 5);

      // Simple heuristic: difference in vertex numbers
      const heuristic = (v: number, goal: number) => Math.abs(goal - v);
      const path = aStar(g, 0, 4, heuristic);

      expect(path).not.toBeNull();
      expect(path![0]).toBe(0);
      expect(path![path!.length - 1]).toBe(4);
    });

    it('should return null for unreachable goal', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(2, 3, 1);

      const heuristic = () => 0;
      const path = aStar(g, 0, 3, heuristic);

      expect(path).toBeNull();
    });

    it('should handle source equals goal', () => {
      const g = new Graph(3);
      const heuristic = () => 0;
      const path = aStar(g, 0, 0, heuristic);

      expect(path).toEqual([0]);
    });
  });

  describe('Reconstruct Path', () => {
    it('should reconstruct path from predecessors', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(2, 3, 1);

      const result = dijkstra(g, 0);
      const path = reconstructPath(result.predecessors, 0, 3);

      expect(path).toEqual([0, 1, 2, 3]);
    });

    it('should return null for unreachable target', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(2, 3, 1);

      const result = dijkstra(g, 0);
      const path = reconstructPath(result.predecessors, 0, 3);

      expect(path).toBeNull();
    });

    it('should handle source equals target', () => {
      const g = new Graph(3);
      const result = dijkstra(g, 0);
      const path = reconstructPath(result.predecessors, 0, 0);

      expect(path).toEqual([0]);
    });
  });

  describe('Shortest Path (convenience function)', () => {
    it('should find shortest path between two vertices', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 4);
      g.addEdge(0, 2, 1);
      g.addEdge(2, 3, 5);
      g.addEdge(1, 3, 2);

      const path = shortestPath(g, 0, 3);
      expect(path).not.toBeNull();
      expect(path![0]).toBe(0);
      expect(path![path!.length - 1]).toBe(3);
    });

    it('should return null for unreachable target', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(3, 4, 1);

      const path = shortestPath(g, 0, 4);
      expect(path).toBeNull();
    });
  });

  describe('All Shortest Paths', () => {
    it('should find paths to all reachable vertices', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(2, 3, 1);

      const paths = allShortestPaths(g, 0);
      expect(paths.size).toBe(4);
      expect(paths.get(0)).toEqual([0]);
      expect(paths.get(1)).toEqual([0, 1]);
      expect(paths.get(2)).toEqual([0, 1, 2]);
      expect(paths.get(3)).toEqual([0, 1, 2, 3]);
    });

    it('should handle disconnected graph', () => {
      const g = new Graph(5, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(2, 3, 1);

      const paths = allShortestPaths(g, 0);
      expect(paths.size).toBe(2); // Only 0 and 1 reachable
      expect(paths.has(2)).toBe(false);
      expect(paths.has(3)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle graph with one edge', () => {
      const g = new Graph(2, { weighted: true });
      g.addEdge(0, 1, 5);

      const result = dijkstra(g, 0);
      expect(result.distances[1]).toBe(5);
    });

    it('should handle complete graph', () => {
      const g = new Graph(4, { weighted: true });
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          g.addEdge(i, j, 1);
        }
      }

      const result = dijkstra(g, 0);
      expect(result.distances[3]).toBe(1); // Direct edge
    });

    it('should handle multiple paths with same length', () => {
      const g = new Graph(4, { weighted: true });
      g.addEdge(0, 1, 1);
      g.addEdge(0, 2, 1);
      g.addEdge(1, 3, 1);
      g.addEdge(2, 3, 1);

      const result = dijkstra(g, 0);
      expect(result.distances[3]).toBe(2);
    });
  });
});
