/**
 * 2D Polygon operations
 *
 * Provides:
 * - Area calculation (Shoelace formula)
 * - Centroid and perimeter computation
 * - Point-in-polygon tests (ray casting, winding number)
 * - Convex hull algorithms (Graham scan, Jarvis march)
 * - Polygon intersection
 * - Triangulation (ear clipping)
 */

import { Point } from './point';
import { Segment } from './line';

/**
 * Represents a polygon as an ordered list of vertices
 */
export class Polygon {
  /**
   * Create a polygon from a list of vertices
   * Vertices should be in order (clockwise or counterclockwise)
   *
   * @param vertices Array of vertices
   */
  constructor(public readonly vertices: Point[]) {
    if (vertices.length < 3) {
      throw new Error('A polygon must have at least 3 vertices');
    }
  }

  /**
   * Calculate the area of this polygon using the Shoelace formula
   * Also known as the surveyor's formula
   *
   * Formula: Area = ½|Σ(x_i * y_{i+1} - x_{i+1} * y_i)|
   *
   * @returns Polygon area (always positive)
   *
   * @example
   * const triangle = new Polygon([
   *   new Point(0, 0),
   *   new Point(4, 0),
   *   new Point(0, 3)
   * ]);
   * triangle.area(); // 6
   */
  area(): number {
    let sum = 0;
    const n = this.vertices.length;

    for (let i = 0; i < n; i++) {
      const curr = this.vertices[i];
      const next = this.vertices[(i + 1) % n];
      sum += curr.x * next.y - next.x * curr.y;
    }

    return Math.abs(sum) / 2;
  }

  /**
   * Calculate the signed area of this polygon
   * Positive for counterclockwise orientation, negative for clockwise
   *
   * @returns Signed area
   */
  signedArea(): number {
    let sum = 0;
    const n = this.vertices.length;

    for (let i = 0; i < n; i++) {
      const curr = this.vertices[i];
      const next = this.vertices[(i + 1) % n];
      sum += curr.x * next.y - next.x * curr.y;
    }

    return sum / 2;
  }

  /**
   * Calculate the perimeter of this polygon
   *
   * @returns Perimeter length
   */
  perimeter(): number {
    let sum = 0;
    const n = this.vertices.length;

    for (let i = 0; i < n; i++) {
      const curr = this.vertices[i];
      const next = this.vertices[(i + 1) % n];
      sum += curr.distanceTo(next);
    }

    return sum;
  }

  /**
   * Calculate the centroid (center of mass) of this polygon
   * For a uniform density polygon
   *
   * @returns Centroid point
   */
  centroid(): Point {
    let cx = 0;
    let cy = 0;
    const n = this.vertices.length;
    const area = this.signedArea();

    for (let i = 0; i < n; i++) {
      const curr = this.vertices[i];
      const next = this.vertices[(i + 1) % n];
      const cross = curr.x * next.y - next.x * curr.y;

      cx += (curr.x + next.x) * cross;
      cy += (curr.y + next.y) * cross;
    }

    const factor = 1 / (6 * area);
    return new Point(cx * factor, cy * factor);
  }

  /**
   * Check if a point is inside this polygon using ray casting algorithm
   * Casts a ray from the point to infinity and counts intersections
   *
   * @param point The point to test
   * @returns True if point is inside the polygon
   */
  containsPointRayCast(point: Point): boolean {
    let inside = false;
    const n = this.vertices.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const vi = this.vertices[i];
      const vj = this.vertices[j];

      // Check if point is within the y-bounds of this edge
      if ((vi.y > point.y) !== (vj.y > point.y)) {
        // Calculate x-coordinate of intersection
        const slope = (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x;

        if (point.x < slope) {
          inside = !inside;
        }
      }
    }

    return inside;
  }

  /**
   * Check if a point is inside this polygon using winding number algorithm
   * More robust than ray casting for points on edges
   *
   * @param point The point to test
   * @returns True if point is inside the polygon
   */
  containsPointWindingNumber(point: Point): boolean {
    let windingNumber = 0;
    const n = this.vertices.length;

    for (let i = 0; i < n; i++) {
      const curr = this.vertices[i];
      const next = this.vertices[(i + 1) % n];

      if (curr.y <= point.y) {
        if (next.y > point.y) {
          // Upward crossing
          const cross = (next.x - curr.x) * (point.y - curr.y) -
                       (point.x - curr.x) * (next.y - curr.y);
          if (cross > 0) {
            windingNumber++;
          }
        }
      } else {
        if (next.y <= point.y) {
          // Downward crossing
          const cross = (next.x - curr.x) * (point.y - curr.y) -
                       (point.x - curr.x) * (next.y - curr.y);
          if (cross < 0) {
            windingNumber--;
          }
        }
      }
    }

    return windingNumber !== 0;
  }

  /**
   * Default point-in-polygon test (uses ray casting)
   *
   * @param point The point to test
   * @returns True if point is inside the polygon
   */
  contains(point: Point): boolean {
    return this.containsPointRayCast(point);
  }

  /**
   * Check if this polygon is convex
   * A polygon is convex if all interior angles are less than 180°
   *
   * @returns True if the polygon is convex
   */
  isConvex(): boolean {
    const n = this.vertices.length;
    if (n < 3) return false;

    let sign = 0;

    for (let i = 0; i < n; i++) {
      const p1 = this.vertices[i];
      const p2 = this.vertices[(i + 1) % n];
      const p3 = this.vertices[(i + 2) % n];

      const v1 = p2.subtract(p1);
      const v2 = p3.subtract(p2);
      const cross = v1.cross(v2);

      if (cross !== 0) {
        if (sign === 0) {
          sign = cross > 0 ? 1 : -1;
        } else if ((cross > 0 ? 1 : -1) !== sign) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get the edges of this polygon as line segments
   *
   * @returns Array of segments
   */
  edges(): Segment[] {
    const segments: Segment[] = [];
    const n = this.vertices.length;

    for (let i = 0; i < n; i++) {
      const curr = this.vertices[i];
      const next = this.vertices[(i + 1) % n];
      segments.push(new Segment(curr, next));
    }

    return segments;
  }

  /**
   * Triangulate this polygon using the ear clipping algorithm
   * Works for simple polygons (no self-intersections)
   *
   * @returns Array of triangles (each triangle is a 3-element array of points)
   */
  triangulate(): [Point, Point, Point][] {
    const triangles: [Point, Point, Point][] = [];
    const vertices = [...this.vertices];

    // Helper function to check if a triangle contains any other vertex
    const containsVertex = (a: Point, b: Point, c: Point): boolean => {
      const triangle = new Polygon([a, b, c]);
      for (const v of vertices) {
        if (v !== a && v !== b && v !== c) {
          if (triangle.contains(v)) {
            return true;
          }
        }
      }
      return false;
    };

    // Helper function to check if three consecutive vertices form an ear
    const isEar = (i: number): boolean => {
      const n = vertices.length;
      const prev = vertices[(i - 1 + n) % n];
      const curr = vertices[i];
      const next = vertices[(i + 1) % n];

      // Check if the triangle is oriented correctly (counterclockwise)
      const v1 = curr.subtract(prev);
      const v2 = next.subtract(curr);
      if (v1.cross(v2) <= 0) {
        return false;
      }

      // Check if any other vertex is inside this triangle
      return !containsVertex(prev, curr, next);
    };

    // Ear clipping algorithm
    while (vertices.length > 3) {
      let earFound = false;

      for (let i = 0; i < vertices.length; i++) {
        if (isEar(i)) {
          const n = vertices.length;
          const prev = vertices[(i - 1 + n) % n];
          const curr = vertices[i];
          const next = vertices[(i + 1) % n];

          triangles.push([prev, curr, next]);
          vertices.splice(i, 1);
          earFound = true;
          break;
        }
      }

      if (!earFound) {
        // This shouldn't happen for valid simple polygons
        throw new Error('Failed to triangulate polygon - may not be simple');
      }
    }

    // Add the final triangle
    if (vertices.length === 3) {
      triangles.push([vertices[0], vertices[1], vertices[2]]);
    }

    return triangles;
  }

  /**
   * Compute the convex hull of a set of points using Graham's scan algorithm
   * Time complexity: O(n log n)
   *
   * @param points Array of points
   * @returns Polygon representing the convex hull
   */
  static convexHullGraham(points: Point[]): Polygon {
    if (points.length < 3) {
      throw new Error('Need at least 3 points for a convex hull');
    }

    // Find the point with the lowest y-coordinate (and leftmost if tie)
    let pivot = points[0];
    for (const p of points) {
      if (p.y < pivot.y || (p.y === pivot.y && p.x < pivot.x)) {
        pivot = p;
      }
    }

    // Sort points by polar angle with respect to pivot
    const sorted = points
      .filter(p => !p.equals(pivot))
      .sort((a, b) => {
        const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
        const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x);

        if (Math.abs(angleA - angleB) < 1e-10) {
          // If angles are equal, sort by distance
          return pivot.distanceSquaredTo(a) - pivot.distanceSquaredTo(b);
        }

        return angleA - angleB;
      });

    // Graham's scan
    const hull: Point[] = [pivot, sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const p = sorted[i];

      // Remove points that would make a right turn
      while (hull.length >= 2) {
        const a = hull[hull.length - 2];
        const b = hull[hull.length - 1];
        const v1 = b.subtract(a);
        const v2 = p.subtract(b);

        if (v1.cross(v2) > 0) {
          break;
        }
        hull.pop();
      }

      hull.push(p);
    }

    return new Polygon(hull);
  }

  /**
   * Compute the convex hull of a set of points using Jarvis march (gift wrapping)
   * Time complexity: O(nh) where h is the number of hull vertices
   * Better for small hulls
   *
   * @param points Array of points
   * @returns Polygon representing the convex hull
   */
  static convexHullJarvis(points: Point[]): Polygon {
    if (points.length < 3) {
      throw new Error('Need at least 3 points for a convex hull');
    }

    // Find the leftmost point
    let leftmost = points[0];
    for (const p of points) {
      if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) {
        leftmost = p;
      }
    }

    const hull: Point[] = [];
    let current = leftmost;

    do {
      hull.push(current);

      // Find the most counterclockwise point from current
      let next = points[0];
      for (const p of points) {
        if (p === current) continue;

        const v1 = next.subtract(current);
        const v2 = p.subtract(current);
        const cross = v1.cross(v2);

        if (next === current || cross > 0 ||
            (cross === 0 && current.distanceSquaredTo(p) > current.distanceSquaredTo(next))) {
          next = p;
        }
      }

      current = next;
    } while (!current.equals(leftmost));

    return new Polygon(hull);
  }

  /**
   * Check if this polygon intersects another polygon
   * Uses the Separating Axis Theorem (SAT) for convex polygons
   *
   * @param other The other polygon
   * @returns True if polygons intersect
   */
  intersects(other: Polygon): boolean {
    // Simple approach: check if any edges intersect or if one contains the other
    const edges1 = this.edges();
    const edges2 = other.edges();

    // Check edge-edge intersections
    for (const e1 of edges1) {
      for (const e2 of edges2) {
        if (e1.intersects(e2)) {
          return true;
        }
      }
    }

    // Check if one polygon contains a vertex of the other
    if (this.contains(other.vertices[0]) || other.contains(this.vertices[0])) {
      return true;
    }

    return false;
  }

  /**
   * Get the bounding box of this polygon
   *
   * @returns [minX, minY, maxX, maxY]
   */
  boundingBox(): [number, number, number, number] {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const v of this.vertices) {
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      maxX = Math.max(maxX, v.x);
      maxY = Math.max(maxY, v.y);
    }

    return [minX, minY, maxX, maxY];
  }

  /**
   * Reverse the order of vertices (flip orientation)
   *
   * @returns New polygon with reversed vertices
   */
  reverse(): Polygon {
    return new Polygon([...this.vertices].reverse());
  }

  /**
   * Translate this polygon by a vector
   *
   * @param offset Translation vector
   * @returns Translated polygon
   */
  translate(offset: Point): Polygon {
    return new Polygon(this.vertices.map(v => v.add(offset)));
  }

  /**
   * Rotate this polygon around a point
   *
   * @param angle Rotation angle in radians
   * @param center Center of rotation (default: origin)
   * @returns Rotated polygon
   */
  rotate(angle: number, center: Point = new Point(0, 0)): Polygon {
    return new Polygon(this.vertices.map(v => v.rotateAround(angle, center)));
  }

  /**
   * Scale this polygon by a factor around a point
   *
   * @param factor Scaling factor
   * @param center Center of scaling (default: origin)
   * @returns Scaled polygon
   */
  scale(factor: number, center: Point = new Point(0, 0)): Polygon {
    return new Polygon(this.vertices.map(v => {
      const translated = v.subtract(center);
      const scaled = translated.scale(factor);
      return scaled.add(center);
    }));
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    const vertexStr = this.vertices.map(v => `(${v.x}, ${v.y})`).join(', ');
    return `Polygon[${vertexStr}]`;
  }

  /**
   * Create a regular polygon (all sides equal length)
   *
   * @param sides Number of sides
   * @param radius Radius of the circumscribed circle
   * @param center Center point (default: origin)
   * @param rotation Initial rotation in radians (default: 0)
   * @returns Regular polygon
   */
  static regular(
    sides: number,
    radius: number,
    center: Point = new Point(0, 0),
    rotation: number = 0
  ): Polygon {
    if (sides < 3) {
      throw new Error('A polygon must have at least 3 sides');
    }

    const vertices: Point[] = [];
    const angleStep = (2 * Math.PI) / sides;

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep + rotation;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      vertices.push(new Point(x, y));
    }

    return new Polygon(vertices);
  }

  /**
   * Create a rectangle
   *
   * @param x X-coordinate of top-left corner
   * @param y Y-coordinate of top-left corner
   * @param width Rectangle width
   * @param height Rectangle height
   * @returns Rectangle polygon
   */
  static rectangle(x: number, y: number, width: number, height: number): Polygon {
    return new Polygon([
      new Point(x, y),
      new Point(x + width, y),
      new Point(x + width, y + height),
      new Point(x, y + height)
    ]);
  }

  /**
   * Create a square
   *
   * @param x X-coordinate of top-left corner
   * @param y Y-coordinate of top-left corner
   * @param size Side length
   * @returns Square polygon
   */
  static square(x: number, y: number, size: number): Polygon {
    return Polygon.rectangle(x, y, size, size);
  }
}
