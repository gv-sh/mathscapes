/**
 * Boolean Operations on 2D Polygons
 *
 * Implements boolean operations using the Greiner-Hormann algorithm:
 * - Union: Combine two polygons
 * - Intersection: Find the overlapping region
 * - Difference: Subtract one polygon from another
 *
 * Note: Works on simple (non-self-intersecting) polygons
 */

import { Point } from '../point';
import { Polygon } from '../polygon';

interface Vertex {
  point: Point;
  next: Vertex | null;
  prev: Vertex | null;
  intersect: boolean;
  entry: boolean;
  visited: boolean;
  neighbor: Vertex | null;
  alpha: number;
}

export class BooleanOperations {
  /**
   * Compute the union of two polygons
   *
   * @param poly1 First polygon
   * @param poly2 Second polygon
   * @returns Array of result polygons (may be multiple disjoint polygons)
   *
   * @example
   * const rect1 = Polygon.fromPoints([
   *   new Point(0, 0), new Point(2, 0),
   *   new Point(2, 2), new Point(0, 2)
   * ]);
   * const rect2 = Polygon.fromPoints([
   *   new Point(1, 1), new Point(3, 1),
   *   new Point(3, 3), new Point(1, 3)
   * ]);
   * BooleanOperations.union(rect1, rect2);
   */
  static union(poly1: Polygon, poly2: Polygon): Polygon[] {
    return this.compute(poly1, poly2, 'union');
  }

  /**
   * Compute the intersection of two polygons
   *
   * @param poly1 First polygon
   * @param poly2 Second polygon
   * @returns Array of result polygons
   *
   * @example
   * const rect1 = Polygon.fromPoints([
   *   new Point(0, 0), new Point(2, 0),
   *   new Point(2, 2), new Point(0, 2)
   * ]);
   * const rect2 = Polygon.fromPoints([
   *   new Point(1, 1), new Point(3, 1),
   *   new Point(3, 3), new Point(1, 3)
   * ]);
   * BooleanOperations.intersection(rect1, rect2);
   */
  static intersection(poly1: Polygon, poly2: Polygon): Polygon[] {
    return this.compute(poly1, poly2, 'intersection');
  }

  /**
   * Compute the difference of two polygons (poly1 - poly2)
   *
   * @param poly1 First polygon (subject)
   * @param poly2 Second polygon (to subtract)
   * @returns Array of result polygons
   *
   * @example
   * const rect1 = Polygon.fromPoints([
   *   new Point(0, 0), new Point(2, 0),
   *   new Point(2, 2), new Point(0, 2)
   * ]);
   * const rect2 = Polygon.fromPoints([
   *   new Point(1, 1), new Point(3, 1),
   *   new Point(3, 3), new Point(1, 3)
   * ]);
   * BooleanOperations.difference(rect1, rect2);
   */
  static difference(poly1: Polygon, poly2: Polygon): Polygon[] {
    return this.compute(poly1, poly2, 'difference');
  }

  /**
   * Core algorithm for boolean operations
   */
  private static compute(
    poly1: Polygon,
    poly2: Polygon,
    operation: 'union' | 'intersection' | 'difference'
  ): Polygon[] {
    // Build vertex lists
    const vertices1 = this.buildVertexList(poly1);
    const vertices2 = this.buildVertexList(poly2);

    // Find intersections
    this.findIntersections(vertices1, vertices2);

    // Mark entry/exit points
    if (operation === 'union') {
      this.markEntryExit(vertices1, poly2, false);
      this.markEntryExit(vertices2, poly1, false);
    } else if (operation === 'intersection') {
      this.markEntryExit(vertices1, poly2, true);
      this.markEntryExit(vertices2, poly1, true);
    } else {
      // difference
      this.markEntryExit(vertices1, poly2, false);
      this.markEntryExit(vertices2, poly1, true);
    }

    // Build result polygons
    return this.buildResultPolygons(vertices1);
  }

  /**
   * Build a circular doubly-linked list of vertices
   */
  private static buildVertexList(polygon: Polygon): Vertex[] {
    const points = polygon.vertices;
    const vertices: Vertex[] = [];

    for (let i = 0; i < points.length; i++) {
      vertices.push({
        point: points[i],
        next: null,
        prev: null,
        intersect: false,
        entry: false,
        visited: false,
        neighbor: null,
        alpha: 0,
      });
    }

    // Link vertices
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].next = vertices[(i + 1) % vertices.length];
      vertices[i].prev = vertices[(i - 1 + vertices.length) % vertices.length];
    }

    return vertices;
  }

  /**
   * Find all intersections between two vertex lists
   */
  private static findIntersections(vertices1: Vertex[], vertices2: Vertex[]): void {
    for (let i = 0; i < vertices1.length; i++) {
      const v1 = vertices1[i];
      const v1Next = v1.next!;

      for (let j = 0; j < vertices2.length; j++) {
        const v2 = vertices2[j];
        const v2Next = v2.next!;

        const intersection = this.lineSegmentIntersection(
          v1.point,
          v1Next.point,
          v2.point,
          v2Next.point
        );

        if (intersection) {
          // Create intersection vertices
          const iv1: Vertex = {
            point: intersection.point,
            next: v1Next,
            prev: v1,
            intersect: true,
            entry: false,
            visited: false,
            neighbor: null,
            alpha: intersection.alpha1,
          };

          const iv2: Vertex = {
            point: intersection.point,
            next: v2Next,
            prev: v2,
            intersect: true,
            entry: false,
            visited: false,
            neighbor: null,
            alpha: intersection.alpha2,
          };

          // Link neighbors
          iv1.neighbor = iv2;
          iv2.neighbor = iv1;

          // Insert into lists
          v1.next = iv1;
          v1Next.prev = iv1;
          vertices1.splice(i + 1, 0, iv1);

          v2.next = iv2;
          v2Next.prev = iv2;
          vertices2.splice(j + 1, 0, iv2);
        }
      }
    }
  }

  /**
   * Find intersection point of two line segments
   */
  private static lineSegmentIntersection(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point
  ): { point: Point; alpha1: number; alpha2: number } | null {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (Math.abs(denom) < 1e-10) {
      return null; // Parallel or coincident
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
      const x = x1 + t * (x2 - x1);
      const y = y1 + t * (y2 - y1);
      return {
        point: new Point(x, y),
        alpha1: t,
        alpha2: u,
      };
    }

    return null;
  }

  /**
   * Mark entry and exit points
   */
  private static markEntryExit(vertices: Vertex[], otherPoly: Polygon, forIntersection: boolean): void {
    let status: boolean | null = null;

    for (const vertex of vertices) {
      if (vertex.intersect) {
        vertex.entry = status === null ? forIntersection : !status;
        status = vertex.entry;
      } else {
        // Check if non-intersection vertex is inside the other polygon
        const inside = otherPoly.contains(vertex.point);
        if (status === null) {
          status = forIntersection ? inside : !inside;
        }
      }
    }
  }

  /**
   * Build result polygons by traversing the vertex lists
   */
  private static buildResultPolygons(vertices: Vertex[]): Polygon[] {
    const polygons: Polygon[] = [];

    // Find an unvisited intersection vertex
    let current = vertices.find((v) => v.intersect && !v.visited);

    while (current) {
      const points: Point[] = [];

      do {
        current.visited = true;
        points.push(current.point);

        if (current.entry) {
          // Follow subject polygon
          do {
            current = current.next!;
          } while (!current.intersect);
        } else {
          // Follow clip polygon
          do {
            current = current.next!;
          } while (!current.intersect);
        }

        // Jump to neighbor polygon
        current = current.neighbor!;
      } while (!current.visited);

      if (points.length >= 3) {
        polygons.push(new Polygon(points));
      }

      // Find next unvisited intersection
      current = vertices.find((v) => v.intersect && !v.visited);
    }

    return polygons;
  }
}

/**
 * Check if a point is inside a polygon using ray casting
 *
 * @param point The point to test
 * @param polygon The polygon
 * @returns True if point is inside
 */
function pointInPolygon(point: Point, polygon: Polygon): boolean {
  return polygon.contains(point);
}
