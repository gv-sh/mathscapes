import { DelaunayTriangulation } from '../../../src/geometry/algorithms/delaunay';
import { Point } from '../../../src/geometry/point';

describe('DelaunayTriangulation', () => {
  describe('triangulate', () => {
    it('should triangulate 3 points', () => {
      const points = [
        new Point(0, 0),
        new Point(1, 0),
        new Point(0.5, 1),
      ];
      const triangulation = DelaunayTriangulation.triangulate(points);
      expect(triangulation.triangles.length).toBe(1);
    });

    it('should triangulate 4 points (square)', () => {
      const points = [
        new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1),
        new Point(0, 1),
      ];
      const triangulation = DelaunayTriangulation.triangulate(points);
      expect(triangulation.triangles.length).toBe(2);
    });

    it('should throw error for less than 3 points', () => {
      const points = [new Point(0, 0), new Point(1, 1)];
      expect(() => DelaunayTriangulation.triangulate(points)).toThrow();
    });

    it('should triangulate random points', () => {
      const points: Point[] = [];
      for (let i = 0; i < 10; i++) {
        points.push(new Point(Math.random() * 100, Math.random() * 100));
      }
      const triangulation = DelaunayTriangulation.triangulate(points);
      expect(triangulation.triangles.length).toBeGreaterThan(0);
    });
  });

  describe('getEdges', () => {
    it('should return unique edges', () => {
      const points = [
        new Point(0, 0),
        new Point(1, 0),
        new Point(0.5, 1),
      ];
      const triangulation = DelaunayTriangulation.triangulate(points);
      const edges = triangulation.getEdges();
      expect(edges.length).toBe(3);
    });
  });

  describe('getVertices', () => {
    it('should return unique vertices', () => {
      const points = [
        new Point(0, 0),
        new Point(1, 0),
        new Point(0.5, 1),
      ];
      const triangulation = DelaunayTriangulation.triangulate(points);
      const vertices = triangulation.getVertices();
      expect(vertices.length).toBe(3);
    });
  });
});
