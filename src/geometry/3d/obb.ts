/**
 * Oriented Bounding Box (OBB) class
 *
 * An OBB is defined by a center point, three orthonormal axes, and half-extents along each axis.
 * Unlike AABBs, OBBs can be arbitrarily oriented.
 *
 * Provides operations for:
 * - Containment testing
 * - Intersection testing
 * - Transformation
 * - Volume and surface area
 */

import { Point3D } from './point3d';
import { AABB } from './aabb';

export class OBB {
  public readonly axes: [Point3D, Point3D, Point3D];

  /**
   * Create an OBB
   *
   * @param center Center point
   * @param axes Three orthonormal axes (will be normalized)
   * @param halfExtents Half-extents along each axis
   */
  constructor(
    public readonly center: Point3D,
    axes: [Point3D, Point3D, Point3D],
    public readonly halfExtents: Point3D
  ) {
    // Normalize the axes
    this.axes = [
      axes[0].normalize(),
      axes[1].normalize(),
      axes[2].normalize(),
    ];

    if (halfExtents.x < 0 || halfExtents.y < 0 || halfExtents.z < 0) {
      throw new Error('OBB half-extents must be non-negative');
    }
  }

  /**
   * Create an OBB from an AABB (axis-aligned)
   *
   * @param aabb The AABB
   * @returns New OBB
   */
  static fromAABB(aabb: AABB): OBB {
    return new OBB(
      aabb.center(),
      [Point3D.unitX(), Point3D.unitY(), Point3D.unitZ()],
      aabb.halfExtents()
    );
  }

  /**
   * Create an axis-aligned OBB from center and half-extents
   *
   * @param center Center point
   * @param halfExtents Half-extents
   * @returns New OBB
   */
  static fromCenterAndHalfExtents(center: Point3D, halfExtents: Point3D): OBB {
    return new OBB(
      center,
      [Point3D.unitX(), Point3D.unitY(), Point3D.unitZ()],
      halfExtents
    );
  }

  /**
   * Calculate the volume of the OBB
   *
   * @returns Volume
   */
  volume(): number {
    return 8 * this.halfExtents.x * this.halfExtents.y * this.halfExtents.z;
  }

  /**
   * Calculate the surface area of the OBB
   *
   * @returns Surface area
   */
  surfaceArea(): number {
    const hx = this.halfExtents.x;
    const hy = this.halfExtents.y;
    const hz = this.halfExtents.z;
    return 8 * (hx * hy + hy * hz + hz * hx);
  }

  /**
   * Get the 8 corner points of the OBB
   *
   * @returns Array of 8 corner points
   */
  getCorners(): Point3D[] {
    const corners: Point3D[] = [];
    const signs = [
      [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
    ];

    for (const [sx, sy, sz] of signs) {
      const offset = this.axes[0].scale(sx * this.halfExtents.x)
        .add(this.axes[1].scale(sy * this.halfExtents.y))
        .add(this.axes[2].scale(sz * this.halfExtents.z));
      corners.push(this.center.add(offset));
    }

    return corners;
  }

  /**
   * Check if a point is inside the OBB
   *
   * @param point The point to check
   * @param epsilon Tolerance for boundary (default: 1e-10)
   * @returns True if point is inside or on the OBB
   */
  containsPoint(point: Point3D, epsilon = 1e-10): boolean {
    const toPoint = point.subtract(this.center);

    for (let i = 0; i < 3; i++) {
      const distance = Math.abs(toPoint.dot(this.axes[i]));
      const extent = [this.halfExtents.x, this.halfExtents.y, this.halfExtents.z][i];
      if (distance > extent + epsilon) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find the closest point on the OBB to a given point
   *
   * @param point The point
   * @returns Closest point on or in the OBB
   */
  closestPointTo(point: Point3D): Point3D {
    const toPoint = point.subtract(this.center);
    let result = this.center;

    const extents = [this.halfExtents.x, this.halfExtents.y, this.halfExtents.z];

    for (let i = 0; i < 3; i++) {
      const distance = toPoint.dot(this.axes[i]);
      const clampedDistance = Math.max(-extents[i], Math.min(distance, extents[i]));
      result = result.add(this.axes[i].scale(clampedDistance));
    }

    return result;
  }

  /**
   * Calculate the distance from the OBB to a point
   *
   * @param point The point
   * @returns Distance (0 if point is inside)
   */
  distanceToPoint(point: Point3D): number {
    const closest = this.closestPointTo(point);
    return point.distanceTo(closest);
  }

  /**
   * Check if this OBB intersects another OBB using the Separating Axis Theorem (SAT)
   *
   * @param other The other OBB
   * @returns True if OBBs intersect
   */
  intersects(other: OBB): boolean {
    const epsilon = 1e-10;

    // Test axes from this OBB
    for (let i = 0; i < 3; i++) {
      if (!this.overlapOnAxis(this.axes[i], other, epsilon)) {
        return false;
      }
    }

    // Test axes from other OBB
    for (let i = 0; i < 3; i++) {
      if (!this.overlapOnAxis(other.axes[i], other, epsilon)) {
        return false;
      }
    }

    // Test cross products of axes
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const axis = this.axes[i].cross(other.axes[j]);
        if (axis.magnitudeSquared() > epsilon) {
          if (!this.overlapOnAxis(axis.normalize(), other, epsilon)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Helper method to check overlap on a separating axis
   *
   * @param axis The separating axis
   * @param other The other OBB
   * @param epsilon Tolerance
   * @returns True if there is overlap on this axis
   */
  private overlapOnAxis(axis: Point3D, other: OBB, epsilon: number): boolean {
    const [min1, max1] = this.projectOntoAxis(axis);
    const [min2, max2] = other.projectOntoAxis(axis);

    return !(max1 < min2 - epsilon || max2 < min1 - epsilon);
  }

  /**
   * Project the OBB onto an axis
   *
   * @param axis The axis to project onto
   * @returns [min, max] projection interval
   */
  private projectOntoAxis(axis: Point3D): [number, number] {
    const centerProjection = this.center.dot(axis);

    const extents = [this.halfExtents.x, this.halfExtents.y, this.halfExtents.z];
    let radius = 0;

    for (let i = 0; i < 3; i++) {
      radius += extents[i] * Math.abs(this.axes[i].dot(axis));
    }

    return [centerProjection - radius, centerProjection + radius];
  }

  /**
   * Convert to an AABB (bounding box in world space)
   *
   * @returns Bounding AABB
   */
  toAABB(): AABB {
    const corners = this.getCorners();
    return AABB.fromPoints(corners);
  }

  /**
   * Rotate the OBB around the X axis
   *
   * @param angle Rotation angle in radians
   * @returns Rotated OBB
   */
  rotateX(angle: number): OBB {
    return new OBB(
      this.center,
      [
        this.axes[0].rotateX(angle),
        this.axes[1].rotateX(angle),
        this.axes[2].rotateX(angle),
      ],
      this.halfExtents
    );
  }

  /**
   * Rotate the OBB around the Y axis
   *
   * @param angle Rotation angle in radians
   * @returns Rotated OBB
   */
  rotateY(angle: number): OBB {
    return new OBB(
      this.center,
      [
        this.axes[0].rotateY(angle),
        this.axes[1].rotateY(angle),
        this.axes[2].rotateY(angle),
      ],
      this.halfExtents
    );
  }

  /**
   * Rotate the OBB around the Z axis
   *
   * @param angle Rotation angle in radians
   * @returns Rotated OBB
   */
  rotateZ(angle: number): OBB {
    return new OBB(
      this.center,
      [
        this.axes[0].rotateZ(angle),
        this.axes[1].rotateZ(angle),
        this.axes[2].rotateZ(angle),
      ],
      this.halfExtents
    );
  }

  /**
   * Translate the OBB by a vector
   *
   * @param offset Translation vector
   * @returns Translated OBB
   */
  translate(offset: Point3D): OBB {
    return new OBB(
      this.center.add(offset),
      this.axes,
      this.halfExtents
    );
  }

  /**
   * Scale the OBB by a factor
   *
   * @param scale Scale factor
   * @returns Scaled OBB
   */
  scale(scale: number): OBB {
    return new OBB(
      this.center,
      this.axes,
      this.halfExtents.scale(scale)
    );
  }

  /**
   * Check if this OBB equals another
   *
   * @param other The other OBB
   * @param epsilon Tolerance (default: 1e-10)
   * @returns True if OBBs are equal
   */
  equals(other: OBB, epsilon = 1e-10): boolean {
    return (
      this.center.equals(other.center, epsilon) &&
      this.halfExtents.equals(other.halfExtents, epsilon) &&
      this.axes[0].equals(other.axes[0], epsilon) &&
      this.axes[1].equals(other.axes[1], epsilon) &&
      this.axes[2].equals(other.axes[2], epsilon)
    );
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `OBB(center: ${this.center}, halfExtents: ${this.halfExtents})`;
  }
}
