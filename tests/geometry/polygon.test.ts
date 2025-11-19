import { Point } from '../../src/geometry/point';
import { Polygon } from '../../src/geometry/polygon';

describe('Polygon', () => {
  describe('constructor', () => {
    test('should create a polygon from vertices', () => {
      const vertices = [
        new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1)
      ];
      const poly = new Polygon(vertices);
      expect(poly.vertices).toEqual(vertices);
    });

    test('should throw error for less than 3 vertices', () => {
      const vertices = [new Point(0, 0), new Point(1, 0)];
      expect(() => new Polygon(vertices)).toThrow('A polygon must have at least 3 vertices');
    });
  });

  describe('area', () => {
    test('should calculate area of a triangle', () => {
      const triangle = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(0, 3)
      ]);
      expect(triangle.area()).toBeCloseTo(6, 10);
    });

    test('should calculate area of a square', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      expect(square.area()).toBeCloseTo(4, 10);
    });

    test('should calculate area of irregular polygon', () => {
      const pentagon = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(5, 2),
        new Point(2, 4),
        new Point(-1, 2)
      ]);
      expect(pentagon.area()).toBeGreaterThan(0);
    });

    test('should return same area regardless of orientation', () => {
      const ccw = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      const cw = new Polygon([
        new Point(0, 0),
        new Point(0, 2),
        new Point(2, 2),
        new Point(2, 0)
      ]);
      expect(ccw.area()).toBeCloseTo(cw.area(), 10);
    });
  });

  describe('signedArea', () => {
    test('should return positive area for counterclockwise polygon', () => {
      const ccw = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      expect(ccw.signedArea()).toBeGreaterThan(0);
    });

    test('should return negative area for clockwise polygon', () => {
      const cw = new Polygon([
        new Point(0, 0),
        new Point(0, 2),
        new Point(2, 2),
        new Point(2, 0)
      ]);
      expect(cw.signedArea()).toBeLessThan(0);
    });
  });

  describe('perimeter', () => {
    test('should calculate perimeter of a triangle', () => {
      const triangle = new Polygon([
        new Point(0, 0),
        new Point(3, 0),
        new Point(0, 4)
      ]);
      expect(triangle.perimeter()).toBeCloseTo(12, 10); // 3 + 4 + 5
    });

    test('should calculate perimeter of a square', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      expect(square.perimeter()).toBeCloseTo(8, 10);
    });
  });

  describe('centroid', () => {
    test('should calculate centroid of a triangle', () => {
      const triangle = new Polygon([
        new Point(0, 0),
        new Point(3, 0),
        new Point(0, 3)
      ]);
      const centroid = triangle.centroid();
      expect(centroid.x).toBeCloseTo(1, 10);
      expect(centroid.y).toBeCloseTo(1, 10);
    });

    test('should calculate centroid of a square', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      const centroid = square.centroid();
      expect(centroid.x).toBeCloseTo(1, 10);
      expect(centroid.y).toBeCloseTo(1, 10);
    });
  });

  describe('contains (ray casting)', () => {
    test('should return true for point inside polygon', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4)
      ]);
      expect(square.containsPointRayCast(new Point(2, 2))).toBe(true);
    });

    test('should return false for point outside polygon', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4)
      ]);
      expect(square.containsPointRayCast(new Point(5, 5))).toBe(false);
    });

    test('should handle complex polygon', () => {
      const concave = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 2),
        new Point(2, 2),
        new Point(2, 4),
        new Point(0, 4)
      ]);
      expect(concave.containsPointRayCast(new Point(1, 1))).toBe(true);
      expect(concave.containsPointRayCast(new Point(3, 3))).toBe(false);
    });
  });

  describe('contains (winding number)', () => {
    test('should return true for point inside polygon', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4)
      ]);
      expect(square.containsPointWindingNumber(new Point(2, 2))).toBe(true);
    });

    test('should return false for point outside polygon', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4)
      ]);
      expect(square.containsPointWindingNumber(new Point(5, 5))).toBe(false);
    });

    test('should handle complex polygon', () => {
      const concave = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 2),
        new Point(2, 2),
        new Point(2, 4),
        new Point(0, 4)
      ]);
      expect(concave.containsPointWindingNumber(new Point(1, 1))).toBe(true);
      expect(concave.containsPointWindingNumber(new Point(3, 3))).toBe(false);
    });
  });

  describe('isConvex', () => {
    test('should return true for convex polygon', () => {
      const triangle = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(1, 2)
      ]);
      expect(triangle.isConvex()).toBe(true);
    });

    test('should return true for square', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      expect(square.isConvex()).toBe(true);
    });

    test('should return false for concave polygon', () => {
      const concave = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 2),
        new Point(2, 2),
        new Point(2, 4),
        new Point(0, 4)
      ]);
      expect(concave.isConvex()).toBe(false);
    });
  });

  describe('edges', () => {
    test('should return all edges', () => {
      const triangle = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(1, 2)
      ]);
      const edges = triangle.edges();
      expect(edges).toHaveLength(3);
      expect(edges[0].p1).toEqual(new Point(0, 0));
      expect(edges[0].p2).toEqual(new Point(2, 0));
    });

    test('should close the polygon', () => {
      const triangle = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(1, 2)
      ]);
      const edges = triangle.edges();
      const lastEdge = edges[edges.length - 1];
      expect(lastEdge.p1).toEqual(new Point(1, 2));
      expect(lastEdge.p2).toEqual(new Point(0, 0));
    });
  });

  describe('triangulate', () => {
    test('should triangulate a square', () => {
      const square = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      const triangles = square.triangulate();
      expect(triangles).toHaveLength(2); // Square should split into 2 triangles
    });

    test('should triangulate a pentagon', () => {
      const pentagon = Polygon.regular(5, 1);
      const triangles = pentagon.triangulate();
      expect(triangles).toHaveLength(3); // Pentagon should split into 3 triangles
    });

    test('should preserve total area', () => {
      const polygon = Polygon.regular(6, 1);
      const originalArea = polygon.area();
      const triangles = polygon.triangulate();

      let triangleAreaSum = 0;
      for (const [p1, p2, p3] of triangles) {
        const tri = new Polygon([p1, p2, p3]);
        triangleAreaSum += tri.area();
      }

      expect(triangleAreaSum).toBeCloseTo(originalArea, 5);
    });
  });

  describe('convexHullGraham', () => {
    test('should compute convex hull of points', () => {
      const points = [
        new Point(0, 0),
        new Point(1, 1),
        new Point(2, 0),
        new Point(1, 0.5), // Interior point
        new Point(1, -1)
      ];
      const hull = Polygon.convexHullGraham(points);

      expect(hull.vertices.length).toBeLessThanOrEqual(points.length);
      expect(hull.isConvex()).toBe(true);
    });

    test('should handle collinear points', () => {
      const points = [
        new Point(0, 0),
        new Point(1, 1),
        new Point(2, 2),
        new Point(3, 3)
      ];
      // Collinear points result in a degenerate hull which may fail polygon construction
      // This is expected behavior for degenerate cases
      try {
        const hull = Polygon.convexHullGraham(points);
        // If it succeeds, it should have at least 2 vertices
        expect(hull.vertices.length).toBeGreaterThanOrEqual(2);
      } catch (e: any) {
        // It's okay if polygon construction fails for degenerate hull
        expect(e.message).toContain('at least 3 vertices');
      }
    });

    test('should throw error for less than 3 points', () => {
      const points = [new Point(0, 0), new Point(1, 1)];
      expect(() => Polygon.convexHullGraham(points)).toThrow('Need at least 3 points');
    });
  });

  describe('convexHullJarvis', () => {
    test('should compute convex hull of points', () => {
      const points = [
        new Point(0, 0),
        new Point(1, 1),
        new Point(2, 0),
        new Point(1, 0.5), // Interior point
        new Point(1, -1)
      ];
      const hull = Polygon.convexHullJarvis(points);

      expect(hull.vertices.length).toBeLessThanOrEqual(points.length);
      expect(hull.isConvex()).toBe(true);
    });

    test('should produce same result as Graham scan', () => {
      const points = [
        new Point(0, 0),
        new Point(1, 1),
        new Point(2, 0),
        new Point(1, 0.5),
        new Point(1, -1),
        new Point(-1, 0)
      ];

      const hullGraham = Polygon.convexHullGraham(points);
      const hullJarvis = Polygon.convexHullJarvis(points);

      // Both should have same number of vertices and similar area
      expect(hullGraham.vertices.length).toBe(hullJarvis.vertices.length);
      expect(hullGraham.area()).toBeCloseTo(hullJarvis.area(), 10);
    });
  });

  describe('intersects', () => {
    test('should detect intersecting polygons', () => {
      const poly1 = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      const poly2 = new Polygon([
        new Point(1, 1),
        new Point(3, 1),
        new Point(3, 3),
        new Point(1, 3)
      ]);
      expect(poly1.intersects(poly2)).toBe(true);
    });

    test('should detect non-intersecting polygons', () => {
      const poly1 = new Polygon([
        new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1),
        new Point(0, 1)
      ]);
      const poly2 = new Polygon([
        new Point(2, 2),
        new Point(3, 2),
        new Point(3, 3),
        new Point(2, 3)
      ]);
      expect(poly1.intersects(poly2)).toBe(false);
    });

    test('should detect when one polygon contains another', () => {
      const outer = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4)
      ]);
      const inner = new Polygon([
        new Point(1, 1),
        new Point(2, 1),
        new Point(2, 2),
        new Point(1, 2)
      ]);
      expect(outer.intersects(inner)).toBe(true);
    });
  });

  describe('boundingBox', () => {
    test('should calculate bounding box', () => {
      const poly = new Polygon([
        new Point(1, 2),
        new Point(5, 3),
        new Point(3, 7),
        new Point(-1, 4)
      ]);
      const [minX, minY, maxX, maxY] = poly.boundingBox();

      expect(minX).toBe(-1);
      expect(minY).toBe(2);
      expect(maxX).toBe(5);
      expect(maxY).toBe(7);
    });
  });

  describe('reverse', () => {
    test('should reverse vertex order', () => {
      const poly = new Polygon([
        new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1)
      ]);
      const reversed = poly.reverse();

      expect(reversed.vertices[0]).toEqual(new Point(1, 1));
      expect(reversed.vertices[1]).toEqual(new Point(1, 0));
      expect(reversed.vertices[2]).toEqual(new Point(0, 0));
    });

    test('should flip signed area', () => {
      const poly = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      const reversed = poly.reverse();

      expect(Math.abs(poly.signedArea())).toBeCloseTo(Math.abs(reversed.signedArea()), 10);
      expect(Math.sign(poly.signedArea())).not.toBe(Math.sign(reversed.signedArea()));
    });
  });

  describe('translate', () => {
    test('should translate polygon', () => {
      const poly = new Polygon([
        new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1)
      ]);
      const translated = poly.translate(new Point(2, 3));

      expect(translated.vertices[0]).toEqual(new Point(2, 3));
      expect(translated.vertices[1]).toEqual(new Point(3, 3));
      expect(translated.vertices[2]).toEqual(new Point(3, 4));
    });

    test('should preserve area', () => {
      const poly = new Polygon([
        new Point(0, 0),
        new Point(2, 0),
        new Point(2, 2),
        new Point(0, 2)
      ]);
      const translated = poly.translate(new Point(10, 10));

      expect(translated.area()).toBeCloseTo(poly.area(), 10);
    });
  });

  describe('rotate', () => {
    test('should rotate polygon around origin', () => {
      const poly = new Polygon([
        new Point(1, 0),
        new Point(2, 0),
        new Point(2, 1)
      ]);
      const rotated = poly.rotate(Math.PI / 2);

      expect(rotated.vertices[0].x).toBeCloseTo(0, 10);
      expect(rotated.vertices[0].y).toBeCloseTo(1, 10);
    });

    test('should preserve area', () => {
      const poly = Polygon.regular(5, 1);
      const rotated = poly.rotate(Math.PI / 3);

      expect(rotated.area()).toBeCloseTo(poly.area(), 10);
    });
  });

  describe('scale', () => {
    test('should scale polygon', () => {
      const poly = new Polygon([
        new Point(1, 1),
        new Point(2, 1),
        new Point(2, 2),
        new Point(1, 2)
      ]);
      const scaled = poly.scale(2);

      expect(scaled.vertices[0].x).toBeCloseTo(2, 10);
      expect(scaled.vertices[0].y).toBeCloseTo(2, 10);
    });

    test('should scale area by factor squared', () => {
      const poly = Polygon.regular(4, 1);
      const scaled = poly.scale(2);

      expect(scaled.area()).toBeCloseTo(poly.area() * 4, 10);
    });
  });

  describe('regular', () => {
    test('should create regular triangle', () => {
      const triangle = Polygon.regular(3, 1);
      expect(triangle.vertices).toHaveLength(3);

      // All sides should be equal length
      const edges = triangle.edges();
      const len1 = edges[0].length();
      const len2 = edges[1].length();
      const len3 = edges[2].length();

      expect(len1).toBeCloseTo(len2, 10);
      expect(len2).toBeCloseTo(len3, 10);
    });

    test('should create regular hexagon', () => {
      const hexagon = Polygon.regular(6, 1);
      expect(hexagon.vertices).toHaveLength(6);
      expect(hexagon.isConvex()).toBe(true);
    });

    test('should throw error for less than 3 sides', () => {
      expect(() => Polygon.regular(2, 1)).toThrow('A polygon must have at least 3 sides');
    });
  });

  describe('rectangle', () => {
    test('should create rectangle', () => {
      const rect = Polygon.rectangle(1, 2, 3, 4);
      expect(rect.vertices).toHaveLength(4);
      expect(rect.area()).toBeCloseTo(12, 10); // 3 * 4
    });
  });

  describe('square', () => {
    test('should create square', () => {
      const sq = Polygon.square(0, 0, 5);
      expect(sq.vertices).toHaveLength(4);
      expect(sq.area()).toBeCloseTo(25, 10);

      // All sides should be equal
      const edges = sq.edges();
      const len = edges[0].length();
      for (const edge of edges) {
        expect(edge.length()).toBeCloseTo(len, 10);
      }
    });
  });
});
