import { Graph } from '../../src/graph/graph';
import {
  bfs,
  dfs,
  dfsIterative,
  topologicalSort,
  topologicalSortDFS,
  hasCycle,
  connectedComponents,
  isBipartite,
} from '../../src/graph/traversal';

describe('Graph Traversal', () => {
  describe('BFS', () => {
    it('should traverse graph in BFS order', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 4);

      const order = bfs(g, 0);
      expect(order).toHaveLength(5);
      expect(order[0]).toBe(0);
      // Level 1: 1 and 2 should come before level 2
      expect(order.indexOf(1)).toBeLessThan(order.indexOf(3));
      expect(order.indexOf(2)).toBeLessThan(order.indexOf(4));
    });

    it('should call callback for each vertex', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      const visited: number[] = [];
      bfs(g, 0, (v) => visited.push(v));

      expect(visited).toEqual([0, 1, 2]);
    });

    it('should handle disconnected components', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(2, 3);

      const order = bfs(g, 0);
      expect(order).toHaveLength(2);
      expect(order).toContain(0);
      expect(order).toContain(1);
      expect(order).not.toContain(2);
    });
  });

  describe('DFS', () => {
    it('should traverse graph in DFS order', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 3);
      g.addEdge(1, 4);

      const order = dfs(g, 0);
      expect(order).toHaveLength(5);
      expect(order[0]).toBe(0);
    });

    it('should call callback for each vertex', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);

      const visited: number[] = [];
      dfs(g, 0, (v) => visited.push(v));

      expect(visited).toEqual([0, 1, 2]);
    });

    it('should handle linear path', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);

      const order = dfs(g, 0);
      expect(order).toEqual([0, 1, 2, 3]);
    });
  });

  describe('DFS Iterative', () => {
    it('should produce same result as recursive DFS', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 4);

      const recursiveOrder = dfs(g, 0);
      const iterativeOrder = dfsIterative(g, 0);

      expect(iterativeOrder).toHaveLength(recursiveOrder.length);
      expect(new Set(iterativeOrder)).toEqual(new Set(recursiveOrder));
    });
  });

  describe('Topological Sort', () => {
    it('should produce valid topological ordering', () => {
      const g = new Graph(6, { directed: true });
      g.addEdge(5, 2);
      g.addEdge(5, 0);
      g.addEdge(4, 0);
      g.addEdge(4, 1);
      g.addEdge(2, 3);
      g.addEdge(3, 1);

      const order = topologicalSort(g);
      expect(order).not.toBeNull();
      expect(order).toHaveLength(6);

      // Verify all edges go from earlier to later in order
      const position = new Map(order!.map((v, i) => [v, i]));
      expect(position.get(5)!).toBeLessThan(position.get(2)!);
      expect(position.get(5)!).toBeLessThan(position.get(0)!);
      expect(position.get(4)!).toBeLessThan(position.get(0)!);
      expect(position.get(4)!).toBeLessThan(position.get(1)!);
      expect(position.get(2)!).toBeLessThan(position.get(3)!);
      expect(position.get(3)!).toBeLessThan(position.get(1)!);
    });

    it('should return null for cyclic graph', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 0);

      const order = topologicalSort(g);
      expect(order).toBeNull();
    });

    it('should throw error for undirected graph', () => {
      const g = new Graph(3);
      expect(() => topologicalSort(g)).toThrow();
    });

    it('should handle single vertex', () => {
      const g = new Graph(1, { directed: true });
      const order = topologicalSort(g);
      expect(order).toEqual([0]);
    });
  });

  describe('Topological Sort DFS', () => {
    it('should produce valid topological ordering', () => {
      const g = new Graph(6, { directed: true });
      g.addEdge(5, 2);
      g.addEdge(5, 0);
      g.addEdge(4, 0);
      g.addEdge(4, 1);
      g.addEdge(2, 3);
      g.addEdge(3, 1);

      const order = topologicalSortDFS(g);
      expect(order).not.toBeNull();
      expect(order).toHaveLength(6);

      // Verify all edges go from earlier to later in order
      const position = new Map(order!.map((v, i) => [v, i]));
      expect(position.get(5)!).toBeLessThan(position.get(2)!);
      expect(position.get(2)!).toBeLessThan(position.get(3)!);
    });

    it('should return null for cyclic graph', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 0);

      const order = topologicalSortDFS(g);
      expect(order).toBeNull();
    });
  });

  describe('Cycle Detection', () => {
    it('should detect cycle in directed graph', () => {
      const g = new Graph(3, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 0);

      expect(hasCycle(g)).toBe(true);
    });

    it('should detect no cycle in DAG', () => {
      const g = new Graph(4, { directed: true });
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);

      expect(hasCycle(g)).toBe(false);
    });

    it('should detect cycle in undirected graph', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 0);

      expect(hasCycle(g)).toBe(true);
    });

    it('should detect no cycle in tree', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 3);

      expect(hasCycle(g)).toBe(false);
    });

    it('should handle self-loop', () => {
      const g = new Graph(2, { directed: true });
      g.addEdge(0, 0);

      expect(hasCycle(g)).toBe(true);
    });

    it('should handle empty graph', () => {
      const g = new Graph(5);
      expect(hasCycle(g)).toBe(false);
    });
  });

  describe('Connected Components', () => {
    it('should find all connected components', () => {
      const g = new Graph(6);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(3, 4);

      const components = connectedComponents(g);
      expect(components).toHaveLength(3);

      // Component sizes
      const sizes = components.map((c) => c.length).sort();
      expect(sizes).toEqual([1, 2, 3]);
    });

    it('should handle fully connected graph', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 0);

      const components = connectedComponents(g);
      expect(components).toHaveLength(1);
      expect(components[0]).toHaveLength(4);
    });

    it('should handle completely disconnected graph', () => {
      const g = new Graph(5);

      const components = connectedComponents(g);
      expect(components).toHaveLength(5);
      components.forEach((c) => expect(c).toHaveLength(1));
    });

    it('should throw error for directed graph', () => {
      const g = new Graph(3, { directed: true });
      expect(() => connectedComponents(g)).toThrow();
    });
  });

  describe('Bipartite Check', () => {
    it('should identify bipartite graph', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 0);

      expect(isBipartite(g)).toBe(true);
    });

    it('should identify non-bipartite graph', () => {
      const g = new Graph(3);
      g.addEdge(0, 1);
      g.addEdge(1, 2);
      g.addEdge(2, 0);

      expect(isBipartite(g)).toBe(false);
    });

    it('should handle tree (always bipartite)', () => {
      const g = new Graph(4);
      g.addEdge(0, 1);
      g.addEdge(0, 2);
      g.addEdge(1, 3);

      expect(isBipartite(g)).toBe(true);
    });

    it('should handle complete bipartite graph K(2,3)', () => {
      const g = new Graph(5);
      // Set A: {0, 1}, Set B: {2, 3, 4}
      g.addEdge(0, 2);
      g.addEdge(0, 3);
      g.addEdge(0, 4);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(1, 4);

      expect(isBipartite(g)).toBe(true);
    });

    it('should handle disconnected graph', () => {
      const g = new Graph(5);
      g.addEdge(0, 1);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      g.addEdge(4, 2); // Triangle in second component

      expect(isBipartite(g)).toBe(false);
    });

    it('should handle empty graph', () => {
      const g = new Graph(5);
      expect(isBipartite(g)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single vertex', () => {
      const g = new Graph(1);
      expect(bfs(g, 0)).toEqual([0]);
      expect(dfs(g, 0)).toEqual([0]);
      expect(isBipartite(g)).toBe(true);
      expect(hasCycle(g)).toBe(false);
    });

    it('should handle two vertices with edge', () => {
      const g = new Graph(2);
      g.addEdge(0, 1);

      expect(bfs(g, 0)).toEqual([0, 1]);
      expect(isBipartite(g)).toBe(true);
      expect(hasCycle(g)).toBe(false);
    });
  });
});
