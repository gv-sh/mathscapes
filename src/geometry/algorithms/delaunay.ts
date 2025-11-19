/**
 * Delaunay Triangulation
 *
 * Implements the Bowyer-Watson algorithm for 2D Delaunay triangulation.
 * The Delaunay triangulation maximizes the minimum angle of all triangles,
 * avoiding skinny triangles.
 *
 * Properties:
 * - No point is inside the circumcircle of any triangle
 * - Maximizes the minimum angle
 * - Unique for a given point set (except degenerate cases)
 */

import { Point } from '../point';

interface DelaunayTriangle {
  vertices: [Point, Point, Point];
  circumcenter: Point;
  circumradiusSquared: number;
}

interface DelaunayEdge {
  a: Point;
  b: Point;
}

export class DelaunayTriangulation {
  public readonly triangles: DelaunayTriangle[];

  constructor(triangles: DelaunayTriangle[]) {
    this.triangles = triangles;
  }

  /**
   * Compute Delaunay triangulation of a set of points using Bowyer-Watson algorithm
   *
   * @param points Array of points to triangulate
   * @returns Delaunay triangulation
   *
   * @example
   * const points = [
   *   new Point(0, 0),
   *   new Point(1, 0),
   *   new Point(0.5, 1)
   * ];
   * const triangulation = DelaunayTriangulation.triangulate(points);
   */
  static triangulate(points: Point[]): DelaunayTriangulation {
    if (points.length < 3) {
      throw new Error('Need at least 3 points for triangulation');
    }

    // Create super-triangle that contains all points
    const superTriangle = this.createSuperTriangle(points);
    const triangles: DelaunayTriangle[] = [superTriangle];

    // Add points one at a time
    for (const point of points) {
      // Find all triangles whose circumcircle contains the point
      const badTriangles: DelaunayTriangle[] = [];
      for (const triangle of triangles) {
        if (this.inCircumcircle(point, triangle)) {
          badTriangles.push(triangle);
        }
      }

      // Find the boundary of the polygonal hole
      const polygon: DelaunayEdge[] = [];
      for (const triangle of badTriangles) {
        const edges = [
          { a: triangle.vertices[0], b: triangle.vertices[1] },
          { a: triangle.vertices[1], b: triangle.vertices[2] },
          { a: triangle.vertices[2], b: triangle.vertices[0] },
        ];

        for (const edge of edges) {
          // Check if this edge is shared with another bad triangle
          let isShared = false;
          for (const otherTriangle of badTriangles) {
            if (triangle === otherTriangle) continue;

            const otherEdges = [
              { a: otherTriangle.vertices[0], b: otherTriangle.vertices[1] },
              { a: otherTriangle.vertices[1], b: otherTriangle.vertices[2] },
              { a: otherTriangle.vertices[2], b: otherTriangle.vertices[0] },
            ];

            for (const otherEdge of otherEdges) {
              if (this.edgesEqual(edge, otherEdge)) {
                isShared = true;
                break;
              }
            }
            if (isShared) break;
          }

          if (!isShared) {
            polygon.push(edge);
          }
        }
      }

      // Remove bad triangles
      for (const badTriangle of badTriangles) {
        const index = triangles.indexOf(badTriangle);
        if (index !== -1) {
          triangles.splice(index, 1);
        }
      }

      // Create new triangles from the polygon edges to the point
      for (const edge of polygon) {
        const newTriangle = this.createTriangle(edge.a, edge.b, point);
        if (newTriangle) {
          triangles.push(newTriangle);
        }
      }
    }

    // Remove triangles that share vertices with the super-triangle
    const superVertices = superTriangle.vertices;
    const finalTriangles = triangles.filter(
      (triangle) =>
        !triangle.vertices.some((v) =>
          superVertices.some((sv) => this.pointsEqual(v, sv))
        )
    );

    return new DelaunayTriangulation(finalTriangles);
  }

  /**
   * Create a super-triangle that contains all points
   */
  private static createSuperTriangle(points: Point[]): DelaunayTriangle {
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    const dx = maxX - minX;
    const dy = maxY - minY;
    const deltaMax = Math.max(dx, dy);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const p1 = new Point(midX - 20 * deltaMax, midY - deltaMax);
    const p2 = new Point(midX, midY + 20 * deltaMax);
    const p3 = new Point(midX + 20 * deltaMax, midY - deltaMax);

    return this.createTriangle(p1, p2, p3)!;
  }

  /**
   * Create a triangle with its circumcircle
   */
  private static createTriangle(
    a: Point,
    b: Point,
    c: Point
  ): DelaunayTriangle | null {
    const circumcircle = this.computeCircumcircle(a, b, c);
    if (!circumcircle) {
      return null;
    }

    return {
      vertices: [a, b, c],
      circumcenter: circumcircle.center,
      circumradiusSquared: circumcircle.radiusSquared,
    };
  }

  /**
   * Compute the circumcircle of a triangle
   */
  private static computeCircumcircle(
    a: Point,
    b: Point,
    c: Point
  ): { center: Point; radiusSquared: number } | null {
    const ax = a.x;
    const ay = a.y;
    const bx = b.x;
    const by = b.y;
    const cx = c.x;
    const cy = c.y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

    if (Math.abs(d) < 1e-10) {
      return null; // Points are collinear
    }

    const ux =
      ((ax * ax + ay * ay) * (by - cy) +
        (bx * bx + by * by) * (cy - ay) +
        (cx * cx + cy * cy) * (ay - by)) /
      d;
    const uy =
      ((ax * ax + ay * ay) * (cx - bx) +
        (bx * bx + by * by) * (ax - cx) +
        (cx * cx + cy * cy) * (bx - ax)) /
      d;

    const center = new Point(ux, uy);
    const radiusSquared = center.distanceSquaredTo(a);

    return { center, radiusSquared };
  }

  /**
   * Check if a point is inside the circumcircle of a triangle
   */
  private static inCircumcircle(point: Point, triangle: DelaunayTriangle): boolean {
    const distanceSquared = triangle.circumcenter.distanceSquaredTo(point);
    return distanceSquared < triangle.circumradiusSquared - 1e-10;
  }

  /**
   * Check if two edges are equal (regardless of direction)
   */
  private static edgesEqual(edge1: DelaunayEdge, edge2: DelaunayEdge): boolean {
    return (
      (this.pointsEqual(edge1.a, edge2.a) && this.pointsEqual(edge1.b, edge2.b)) ||
      (this.pointsEqual(edge1.a, edge2.b) && this.pointsEqual(edge1.b, edge2.a))
    );
  }

  /**
   * Check if two points are equal
   */
  private static pointsEqual(p1: Point, p2: Point): boolean {
    return p1.equals(p2);
  }

  /**
   * Get all edges in the triangulation
   *
   * @returns Array of edges (deduplicated)
   */
  getEdges(): DelaunayEdge[] {
    const edgeSet = new Set<string>();
    const edges: DelaunayEdge[] = [];

    for (const triangle of this.triangles) {
      const triangleEdges = [
        { a: triangle.vertices[0], b: triangle.vertices[1] },
        { a: triangle.vertices[1], b: triangle.vertices[2] },
        { a: triangle.vertices[2], b: triangle.vertices[0] },
      ];

      for (const edge of triangleEdges) {
        const key1 = `${edge.a.x},${edge.a.y}-${edge.b.x},${edge.b.y}`;
        const key2 = `${edge.b.x},${edge.b.y}-${edge.a.x},${edge.a.y}`;

        if (!edgeSet.has(key1) && !edgeSet.has(key2)) {
          edgeSet.add(key1);
          edges.push(edge);
        }
      }
    }

    return edges;
  }

  /**
   * Get all unique vertices in the triangulation
   *
   * @returns Array of vertices
   */
  getVertices(): Point[] {
    const vertexSet = new Set<string>();
    const vertices: Point[] = [];

    for (const triangle of this.triangles) {
      for (const vertex of triangle.vertices) {
        const key = `${vertex.x},${vertex.y}`;
        if (!vertexSet.has(key)) {
          vertexSet.add(key);
          vertices.push(vertex);
        }
      }
    }

    return vertices;
  }

  /**
   * Find the triangle containing a point
   *
   * @param point The point to search for
   * @returns Triangle containing the point, or null if not found
   */
  findTriangle(point: Point): DelaunayTriangle | null {
    for (const triangle of this.triangles) {
      if (this.pointInTriangle(point, triangle)) {
        return triangle;
      }
    }
    return null;
  }

  /**
   * Check if a point is inside a triangle using barycentric coordinates
   */
  private pointInTriangle(point: Point, triangle: DelaunayTriangle): boolean {
    const [a, b, c] = triangle.vertices;

    const v0 = new Point(c.x - a.x, c.y - a.y);
    const v1 = new Point(b.x - a.x, b.y - a.y);
    const v2 = new Point(point.x - a.x, point.y - a.y);

    const dot00 = v0.x * v0.x + v0.y * v0.y;
    const dot01 = v0.x * v1.x + v0.y * v1.y;
    const dot02 = v0.x * v2.x + v0.y * v2.y;
    const dot11 = v1.x * v1.x + v1.y * v1.y;
    const dot12 = v1.x * v2.x + v1.y * v2.y;

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return u >= -1e-10 && v >= -1e-10 && u + v <= 1 + 1e-10;
  }
}
