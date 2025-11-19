/**
 * Axis-Aligned Bounding Box (AABB) class
 *
 * An AABB is defined by minimum and maximum corner points.
 * The box is aligned with the coordinate axes.
 *
 * Provides operations for:
 * - Containment testing
 * - Intersection testing
 * - Ray intersection
 * - Volume and surface area
 * - Merging and expanding
 */

import { Point3D } from './point3d';

export class AABB {
  constructor(
    public readonly min: Point3D,
    public readonly max: Point3D
  ) {
    if (min.x > max.x || min.y > max.y || min.z > max.z) {
      throw new Error('AABB min must be less than or equal to max in all dimensions');
    }
  }

  /**
   * Create an AABB from a center point and half-extents
   *
   * @param center Center point
   * @param halfExtents Half-extents in each dimension
   * @returns New AABB
   *
   * @example
   * const aabb = AABB.fromCenterAndHalfExtents(
   *   new Point3D(0, 0, 0),
   *   new Point3D(5, 5, 5)
   * ); // AABB from (-5,-5,-5) to (5,5,5)
   */
  static fromCenterAndHalfExtents(center: Point3D, halfExtents: Point3D): AABB {
    return new AABB(
      center.subtract(halfExtents),
      center.add(halfExtents)
    );
  }

  /**
   * Create an AABB from a set of points
   *
   * @param points Array of points
   * @returns Bounding AABB
   *
   * @example
   * const points = [
   *   new Point3D(0, 0, 0),
   *   new Point3D(10, 5, 3)
   * ];
   * AABB.fromPoints(points);
   */
  static fromPoints(points: Point3D[]): AABB {
    if (points.length === 0) {
      throw new Error('Cannot create AABB from empty point set');
    }

    let minX = points[0].x;
    let minY = points[0].y;
    let minZ = points[0].z;
    let maxX = points[0].x;
    let maxY = points[0].y;
    let maxZ = points[0].z;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      minZ = Math.min(minZ, point.z);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
      maxZ = Math.max(maxZ, point.z);
    }

    return new AABB(
      new Point3D(minX, minY, minZ),
      new Point3D(maxX, maxY, maxZ)
    );
  }

  /**
   * Get the center point of the AABB
   *
   * @returns Center point
   */
  center(): Point3D {
    return this.min.midpoint(this.max);
  }

  /**
   * Get the half-extents of the AABB
   *
   * @returns Half-extents vector
   */
  halfExtents(): Point3D {
    return this.max.subtract(this.min).scale(0.5);
  }

  /**
   * Get the size (full extents) of the AABB
   *
   * @returns Size vector
   */
  size(): Point3D {
    return this.max.subtract(this.min);
  }

  /**
   * Calculate the volume of the AABB
   *
   * @returns Volume
   *
   * @example
   * const aabb = new AABB(
   *   new Point3D(0, 0, 0),
   *   new Point3D(2, 3, 4)
   * );
   * aabb.volume(); // 24
   */
  volume(): number {
    const size = this.size();
    return size.x * size.y * size.z;
  }

  /**
   * Calculate the surface area of the AABB
   *
   * @returns Surface area
   */
  surfaceArea(): number {
    const size = this.size();
    return 2 * (size.x * size.y + size.y * size.z + size.z * size.x);
  }

  /**
   * Check if a point is inside the AABB
   *
   * @param point The point to check
   * @param epsilon Tolerance for boundary (default: 1e-10)
   * @returns True if point is inside or on the AABB
   *
   * @example
   * const aabb = new AABB(
   *   new Point3D(0, 0, 0),
   *   new Point3D(10, 10, 10)
   * );
   * aabb.containsPoint(new Point3D(5, 5, 5)); // true
   */
  containsPoint(point: Point3D, epsilon = 1e-10): boolean {
    return (
      point.x >= this.min.x - epsilon &&
      point.x <= this.max.x + epsilon &&
      point.y >= this.min.y - epsilon &&
      point.y <= this.max.y + epsilon &&
      point.z >= this.min.z - epsilon &&
      point.z <= this.max.z + epsilon
    );
  }

  /**
   * Check if this AABB completely contains another AABB
   *
   * @param other The other AABB
   * @param epsilon Tolerance (default: 1e-10)
   * @returns True if this AABB contains the other
   */
  containsAABB(other: AABB, epsilon = 1e-10): boolean {
    return (
      this.min.x <= other.min.x + epsilon &&
      this.min.y <= other.min.y + epsilon &&
      this.min.z <= other.min.z + epsilon &&
      this.max.x >= other.max.x - epsilon &&
      this.max.y >= other.max.y - epsilon &&
      this.max.z >= other.max.z - epsilon
    );
  }

  /**
   * Check if this AABB intersects another AABB
   *
   * @param other The other AABB
   * @returns True if AABBs intersect or touch
   *
   * @example
   * const aabb1 = new AABB(
   *   new Point3D(0, 0, 0),
   *   new Point3D(10, 10, 10)
   * );
   * const aabb2 = new AABB(
   *   new Point3D(5, 5, 5),
   *   new Point3D(15, 15, 15)
   * );
   * aabb1.intersects(aabb2); // true
   */
  intersects(other: AABB): boolean {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y &&
      this.min.z <= other.max.z &&
      this.max.z >= other.min.z
    );
  }

  /**
   * Find the intersection AABB with another AABB
   *
   * @param other The other AABB
   * @returns Intersection AABB, or null if no intersection
   */
  intersection(other: AABB): AABB | null {
    if (!this.intersects(other)) {
      return null;
    }

    return new AABB(
      new Point3D(
        Math.max(this.min.x, other.min.x),
        Math.max(this.min.y, other.min.y),
        Math.max(this.min.z, other.min.z)
      ),
      new Point3D(
        Math.min(this.max.x, other.max.x),
        Math.min(this.max.y, other.max.y),
        Math.min(this.max.z, other.max.z)
      )
    );
  }

  /**
   * Merge this AABB with another to create a bounding AABB
   *
   * @param other The other AABB
   * @returns Merged AABB
   *
   * @example
   * const aabb1 = new AABB(
   *   new Point3D(0, 0, 0),
   *   new Point3D(5, 5, 5)
   * );
   * const aabb2 = new AABB(
   *   new Point3D(3, 3, 3),
   *   new Point3D(8, 8, 8)
   * );
   * aabb1.merge(aabb2); // AABB from (0,0,0) to (8,8,8)
   */
  merge(other: AABB): AABB {
    return new AABB(
      new Point3D(
        Math.min(this.min.x, other.min.x),
        Math.min(this.min.y, other.min.y),
        Math.min(this.min.z, other.min.z)
      ),
      new Point3D(
        Math.max(this.max.x, other.max.x),
        Math.max(this.max.y, other.max.y),
        Math.max(this.max.z, other.max.z)
      )
    );
  }

  /**
   * Expand the AABB to include a point
   *
   * @param point The point
   * @returns Expanded AABB
   */
  expandToInclude(point: Point3D): AABB {
    return new AABB(
      new Point3D(
        Math.min(this.min.x, point.x),
        Math.min(this.min.y, point.y),
        Math.min(this.min.z, point.z)
      ),
      new Point3D(
        Math.max(this.max.x, point.x),
        Math.max(this.max.y, point.y),
        Math.max(this.max.z, point.z)
      )
    );
  }

  /**
   * Expand the AABB by a margin in all directions
   *
   * @param margin The margin to expand by
   * @returns Expanded AABB
   *
   * @example
   * const aabb = new AABB(
   *   new Point3D(0, 0, 0),
   *   new Point3D(10, 10, 10)
   * );
   * aabb.expand(1); // AABB from (-1,-1,-1) to (11,11,11)
   */
  expand(margin: number): AABB {
    const marginVec = new Point3D(margin, margin, margin);
    return new AABB(
      this.min.subtract(marginVec),
      this.max.add(marginVec)
    );
  }

  /**
   * Find the closest point on the AABB to a given point
   *
   * @param point The point
   * @returns Closest point on or in the AABB
   *
   * @example
   * const aabb = new AABB(
   *   new Point3D(0, 0, 0),
   *   new Point3D(10, 10, 10)
   * );
   * aabb.closestPointTo(new Point3D(15, 5, 5)); // Point3D(10, 5, 5)
   */
  closestPointTo(point: Point3D): Point3D {
    return new Point3D(
      Math.max(this.min.x, Math.min(point.x, this.max.x)),
      Math.max(this.min.y, Math.min(point.y, this.max.y)),
      Math.max(this.min.z, Math.min(point.z, this.max.z))
    );
  }

  /**
   * Calculate the distance from the AABB to a point
   *
   * @param point The point
   * @returns Distance (0 if point is inside)
   */
  distanceToPoint(point: Point3D): number {
    const closest = this.closestPointTo(point);
    return point.distanceTo(closest);
  }

  /**
   * Test ray intersection with the AABB
   * Uses the slab method
   *
   * @param rayOrigin Ray origin
   * @param rayDirection Ray direction (should be normalized)
   * @returns Object with hit boolean and distances, or null if no hit
   *
   * @example
   * const aabb = new AABB(
   *   new Point3D(0, 0, 0),
   *   new Point3D(10, 10, 10)
   * );
   * aabb.intersectRay(
   *   new Point3D(-5, 5, 5),
   *   new Point3D(1, 0, 0)
   * ); // { hit: true, tMin: 5, tMax: 15 }
   */
  intersectRay(
    rayOrigin: Point3D,
    rayDirection: Point3D
  ): { hit: boolean; tMin: number; tMax: number } | null {
    let tMin = -Infinity;
    let tMax = Infinity;

    // Check each axis
    for (const axis of ['x', 'y', 'z'] as const) {
      const dirComponent = rayDirection[axis];
      const originComponent = rayOrigin[axis];
      const minComponent = this.min[axis];
      const maxComponent = this.max[axis];

      if (Math.abs(dirComponent) < 1e-10) {
        // Ray is parallel to slab
        if (originComponent < minComponent || originComponent > maxComponent) {
          return { hit: false, tMin: 0, tMax: 0 };
        }
      } else {
        const t1 = (minComponent - originComponent) / dirComponent;
        const t2 = (maxComponent - originComponent) / dirComponent;

        tMin = Math.max(tMin, Math.min(t1, t2));
        tMax = Math.min(tMax, Math.max(t1, t2));

        if (tMin > tMax) {
          return { hit: false, tMin: 0, tMax: 0 };
        }
      }
    }

    // Check if intersection is behind the ray
    if (tMax < 0) {
      return { hit: false, tMin: 0, tMax: 0 };
    }

    return { hit: true, tMin: Math.max(0, tMin), tMax };
  }

  /**
   * Get all 8 corner points of the AABB
   *
   * @returns Array of 8 corner points
   */
  getCorners(): Point3D[] {
    return [
      new Point3D(this.min.x, this.min.y, this.min.z),
      new Point3D(this.max.x, this.min.y, this.min.z),
      new Point3D(this.min.x, this.max.y, this.min.z),
      new Point3D(this.max.x, this.max.y, this.min.z),
      new Point3D(this.min.x, this.min.y, this.max.z),
      new Point3D(this.max.x, this.min.y, this.max.z),
      new Point3D(this.min.x, this.max.y, this.max.z),
      new Point3D(this.max.x, this.max.y, this.max.z),
    ];
  }

  /**
   * Check if this AABB equals another
   *
   * @param other The other AABB
   * @param epsilon Tolerance (default: 1e-10)
   * @returns True if AABBs are equal
   */
  equals(other: AABB, epsilon = 1e-10): boolean {
    return (
      this.min.equals(other.min, epsilon) &&
      this.max.equals(other.max, epsilon)
    );
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `AABB(min: ${this.min}, max: ${this.max})`;
  }
}
