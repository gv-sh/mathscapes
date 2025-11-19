/**
 * 3D Plane class for plane operations
 *
 * A plane is defined by a point and a normal vector, or by the equation ax + by + cz + d = 0
 * Provides operations for:
 * - Point-plane distance
 * - Projection onto plane
 * - Line-plane intersection
 * - Plane-plane intersection
 * - Point reflection
 */

import { Point3D } from './point3d';

export class Plane {
  public readonly normal: Point3D;
  public readonly d: number;

  /**
   * Create a plane from a normal vector and a point on the plane
   *
   * @param normal Normal vector (will be normalized)
   * @param point A point on the plane
   */
  constructor(normal: Point3D, point: Point3D) {
    this.normal = normal.normalize();
    // d = -normal · point
    this.d = -this.normal.dot(point);
  }

  /**
   * Create a plane from a point and normal vector
   *
   * @param point A point on the plane
   * @param normal Normal vector
   * @returns New plane
   *
   * @example
   * const plane = Plane.fromPointAndNormal(
   *   new Point3D(0, 0, 0),
   *   new Point3D(0, 0, 1)
   * ); // XY plane
   */
  static fromPointAndNormal(point: Point3D, normal: Point3D): Plane {
    return new Plane(normal, point);
  }

  /**
   * Create a plane from three points
   * Formula: normal = (p2 - p1) × (p3 - p1)
   *
   * @param p1 First point
   * @param p2 Second point
   * @param p3 Third point
   * @returns New plane, or null if points are collinear
   *
   * @example
   * const plane = Plane.fromThreePoints(
   *   new Point3D(0, 0, 0),
   *   new Point3D(1, 0, 0),
   *   new Point3D(0, 1, 0)
   * ); // XY plane
   */
  static fromThreePoints(p1: Point3D, p2: Point3D, p3: Point3D): Plane | null {
    const v1 = p2.subtract(p1);
    const v2 = p3.subtract(p1);
    const normal = v1.cross(v2);

    if (normal.magnitudeSquared() < 1e-10) {
      return null; // Points are collinear
    }

    return new Plane(normal, p1);
  }

  /**
   * Create a plane from coefficients ax + by + cz + d = 0
   *
   * @param a Coefficient of x
   * @param b Coefficient of y
   * @param c Coefficient of z
   * @param d Constant term
   * @returns New plane
   *
   * @example
   * const plane = Plane.fromCoefficients(0, 0, 1, 0); // XY plane
   */
  static fromCoefficients(a: number, b: number, c: number, d: number): Plane {
    const normal = new Point3D(a, b, c);
    const normalMag = normal.magnitude();

    if (normalMag === 0) {
      throw new Error('Invalid plane coefficients: normal vector cannot be zero');
    }

    // Find a point on the plane
    // If a ≠ 0, use (-d/a, 0, 0)
    // If b ≠ 0, use (0, -d/b, 0)
    // If c ≠ 0, use (0, 0, -d/c)
    let point: Point3D;
    if (Math.abs(a) > 1e-10) {
      point = new Point3D(-d / a, 0, 0);
    } else if (Math.abs(b) > 1e-10) {
      point = new Point3D(0, -d / b, 0);
    } else {
      point = new Point3D(0, 0, -d / c);
    }

    return new Plane(normal, point);
  }

  /**
   * Calculate signed distance from a point to the plane
   * Formula: (normal · point + d) / |normal|
   * Positive if point is on the side the normal points to
   *
   * @param point The point
   * @returns Signed distance
   *
   * @example
   * const plane = Plane.fromPointAndNormal(
   *   new Point3D(0, 0, 0),
   *   new Point3D(0, 0, 1)
   * );
   * plane.signedDistanceToPoint(new Point3D(0, 0, 5)); // 5
   */
  signedDistanceToPoint(point: Point3D): number {
    return this.normal.dot(point) + this.d;
  }

  /**
   * Calculate absolute distance from a point to the plane
   *
   * @param point The point
   * @returns Absolute distance
   *
   * @example
   * const plane = Plane.fromPointAndNormal(
   *   new Point3D(0, 0, 0),
   *   new Point3D(0, 0, 1)
   * );
   * plane.distanceToPoint(new Point3D(0, 0, -5)); // 5
   */
  distanceToPoint(point: Point3D): number {
    return Math.abs(this.signedDistanceToPoint(point));
  }

  /**
   * Project a point onto the plane
   * Formula: point - normal * signedDistance
   *
   * @param point The point to project
   * @returns Projected point on the plane
   *
   * @example
   * const plane = Plane.fromPointAndNormal(
   *   new Point3D(0, 0, 0),
   *   new Point3D(0, 0, 1)
   * );
   * plane.projectPoint(new Point3D(3, 4, 5)); // Point3D(3, 4, 0)
   */
  projectPoint(point: Point3D): Point3D {
    const distance = this.signedDistanceToPoint(point);
    return point.subtract(this.normal.scale(distance));
  }

  /**
   * Reflect a point across the plane
   * Formula: point - 2 * normal * signedDistance
   *
   * @param point The point to reflect
   * @returns Reflected point
   *
   * @example
   * const plane = Plane.fromPointAndNormal(
   *   new Point3D(0, 0, 0),
   *   new Point3D(0, 0, 1)
   * );
   * plane.reflectPoint(new Point3D(0, 0, 5)); // Point3D(0, 0, -5)
   */
  reflectPoint(point: Point3D): Point3D {
    const distance = this.signedDistanceToPoint(point);
    return point.subtract(this.normal.scale(2 * distance));
  }

  /**
   * Find intersection line with another plane
   *
   * @param other The other plane
   * @returns Object with point on line and direction, or null if planes are parallel
   *
   * @example
   * const p1 = Plane.fromPointAndNormal(new Point3D(0, 0, 0), new Point3D(0, 0, 1));
   * const p2 = Plane.fromPointAndNormal(new Point3D(0, 0, 0), new Point3D(0, 1, 0));
   * p1.intersectPlane(p2); // { point: Point3D(0, 0, 0), direction: Point3D(1, 0, 0) }
   */
  intersectPlane(other: Plane): { point: Point3D; direction: Point3D } | null {
    const direction = this.normal.cross(other.normal);

    // Planes are parallel
    if (direction.magnitudeSquared() < 1e-10) {
      return null;
    }

    // Find a point on the line of intersection
    // We solve for a point where one coordinate is 0
    const n1 = this.normal;
    const n2 = other.normal;
    const d1 = this.d;
    const d2 = other.d;

    // Try to find a point with z = 0
    const det = n1.x * n2.y - n1.y * n2.x;
    if (Math.abs(det) > 1e-10) {
      const x = (-d1 * n2.y + d2 * n1.y) / det;
      const y = (-n1.x * d2 + n2.x * d1) / det;
      return { point: new Point3D(x, y, 0), direction: direction.normalize() };
    }

    // Try to find a point with y = 0
    const det2 = n1.x * n2.z - n1.z * n2.x;
    if (Math.abs(det2) > 1e-10) {
      const x = (-d1 * n2.z + d2 * n1.z) / det2;
      const z = (-n1.x * d2 + n2.x * d1) / det2;
      return { point: new Point3D(x, 0, z), direction: direction.normalize() };
    }

    // Try to find a point with x = 0
    const det3 = n1.y * n2.z - n1.z * n2.y;
    if (Math.abs(det3) > 1e-10) {
      const y = (-d1 * n2.z + d2 * n1.z) / det3;
      const z = (-n1.y * d2 + n2.y * d1) / det3;
      return { point: new Point3D(0, y, z), direction: direction.normalize() };
    }

    return null;
  }

  /**
   * Find intersection of three planes
   *
   * @param p1 First plane
   * @param p2 Second plane
   * @param p3 Third plane
   * @returns Intersection point, or null if no unique intersection
   *
   * @example
   * const px = Plane.fromPointAndNormal(new Point3D(1, 0, 0), new Point3D(1, 0, 0));
   * const py = Plane.fromPointAndNormal(new Point3D(0, 2, 0), new Point3D(0, 1, 0));
   * const pz = Plane.fromPointAndNormal(new Point3D(0, 0, 3), new Point3D(0, 0, 1));
   * Plane.intersectThreePlanes(px, py, pz); // Point3D(1, 2, 3)
   */
  static intersectThreePlanes(p1: Plane, p2: Plane, p3: Plane): Point3D | null {
    const n1 = p1.normal;
    const n2 = p2.normal;
    const n3 = p3.normal;

    const det = n1.dot(n2.cross(n3));

    // Planes don't intersect at a unique point
    if (Math.abs(det) < 1e-10) {
      return null;
    }

    // Using Cramer's rule
    const point = n2.cross(n3).scale(-p1.d)
      .add(n3.cross(n1).scale(-p2.d))
      .add(n1.cross(n2).scale(-p3.d))
      .scale(1 / det);

    return point;
  }

  /**
   * Check if a point lies on the plane
   *
   * @param point The point
   * @param epsilon Tolerance (default: 1e-10)
   * @returns True if point is on the plane
   */
  containsPoint(point: Point3D, epsilon = 1e-10): boolean {
    return Math.abs(this.signedDistanceToPoint(point)) < epsilon;
  }

  /**
   * Check if this plane is parallel to another
   *
   * @param other The other plane
   * @param epsilon Tolerance (default: 1e-10)
   * @returns True if planes are parallel
   */
  isParallelTo(other: Plane, epsilon = 1e-10): boolean {
    const cross = this.normal.cross(other.normal);
    return cross.magnitudeSquared() < epsilon * epsilon;
  }

  /**
   * Check if this plane equals another
   *
   * @param other The other plane
   * @param epsilon Tolerance (default: 1e-10)
   * @returns True if planes are equal
   */
  equals(other: Plane, epsilon = 1e-10): boolean {
    return (
      this.normal.equals(other.normal, epsilon) &&
      Math.abs(this.d - other.d) < epsilon
    );
  }

  /**
   * Get a point on the plane
   *
   * @returns A point on the plane
   */
  getPoint(): Point3D {
    // Find a point on the plane using the normal and d
    if (Math.abs(this.normal.x) > 1e-10) {
      return new Point3D(-this.d / this.normal.x, 0, 0);
    } else if (Math.abs(this.normal.y) > 1e-10) {
      return new Point3D(0, -this.d / this.normal.y, 0);
    } else {
      return new Point3D(0, 0, -this.d / this.normal.z);
    }
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `Plane(${this.normal.x}x + ${this.normal.y}y + ${this.normal.z}z + ${this.d} = 0)`;
  }

  /**
   * Create the XY plane (z = 0)
   *
   * @returns XY plane
   */
  static xyPlane(): Plane {
    return new Plane(new Point3D(0, 0, 1), new Point3D(0, 0, 0));
  }

  /**
   * Create the XZ plane (y = 0)
   *
   * @returns XZ plane
   */
  static xzPlane(): Plane {
    return new Plane(new Point3D(0, 1, 0), new Point3D(0, 0, 0));
  }

  /**
   * Create the YZ plane (x = 0)
   *
   * @returns YZ plane
   */
  static yzPlane(): Plane {
    return new Plane(new Point3D(1, 0, 0), new Point3D(0, 0, 0));
  }
}
