/**
 * 3D Ray class for ray casting and intersection operations
 *
 * A ray is defined by an origin point and a direction vector.
 * Provides operations for:
 * - Ray-point distance
 * - Ray-plane intersection
 * - Ray-sphere intersection
 * - Point at distance along ray
 */

import { Point3D } from './point3d';
import { Plane } from './plane';
import { Sphere } from './sphere';

export class Ray {
  public readonly direction: Point3D;

  constructor(
    public readonly origin: Point3D,
    direction: Point3D
  ) {
    // Normalize the direction vector
    this.direction = direction.normalize();
  }

  /**
   * Get a point at a specific distance along the ray
   * Formula: origin + t * direction
   *
   * @param t Distance parameter (t >= 0 for points along the ray)
   * @returns Point at distance t
   *
   * @example
   * const ray = new Ray(new Point3D(0, 0, 0), new Point3D(1, 0, 0));
   * ray.at(5); // Point3D(5, 0, 0)
   */
  at(t: number): Point3D {
    return this.origin.add(this.direction.scale(t));
  }

  /**
   * Calculate the closest point on the ray to a given point
   *
   * @param point The point
   * @returns Closest point on the ray
   *
   * @example
   * const ray = new Ray(new Point3D(0, 0, 0), new Point3D(1, 0, 0));
   * const p = new Point3D(5, 3, 0);
   * ray.closestPointTo(p); // Point3D(5, 0, 0)
   */
  closestPointTo(point: Point3D): Point3D {
    const toPoint = point.subtract(this.origin);
    const t = Math.max(0, toPoint.dot(this.direction));
    return this.at(t);
  }

  /**
   * Calculate the distance from the ray to a point
   *
   * @param point The point
   * @returns Distance from ray to point
   *
   * @example
   * const ray = new Ray(new Point3D(0, 0, 0), new Point3D(1, 0, 0));
   * const p = new Point3D(5, 3, 0);
   * ray.distanceToPoint(p); // 3
   */
  distanceToPoint(point: Point3D): number {
    const closest = this.closestPointTo(point);
    return point.distanceTo(closest);
  }

  /**
   * Find intersection with a plane
   *
   * @param plane The plane to intersect with
   * @returns Intersection point, or null if no intersection (ray parallel to plane)
   *
   * @example
   * const ray = new Ray(new Point3D(0, 0, 5), new Point3D(0, 0, -1));
   * const plane = Plane.fromPointAndNormal(new Point3D(0, 0, 0), new Point3D(0, 0, 1));
   * ray.intersectPlane(plane); // Point3D(0, 0, 0)
   */
  intersectPlane(plane: Plane): Point3D | null {
    const denom = this.direction.dot(plane.normal);

    // Ray is parallel to plane
    if (Math.abs(denom) < 1e-10) {
      return null;
    }

    const t = -plane.signedDistanceToPoint(this.origin) / denom;

    // Intersection is behind the ray origin
    if (t < 0) {
      return null;
    }

    return this.at(t);
  }

  /**
   * Find intersection(s) with a sphere
   *
   * @param sphere The sphere to intersect with
   * @returns Array of intersection points (0, 1, or 2 points)
   *
   * @example
   * const ray = new Ray(new Point3D(-5, 0, 0), new Point3D(1, 0, 0));
   * const sphere = new Sphere(new Point3D(0, 0, 0), 2);
   * ray.intersectSphere(sphere); // [Point3D(-2, 0, 0), Point3D(2, 0, 0)]
   */
  intersectSphere(sphere: Sphere): Point3D[] {
    const oc = this.origin.subtract(sphere.center);
    const a = this.direction.dot(this.direction);
    const b = 2 * oc.dot(this.direction);
    const c = oc.dot(oc) - sphere.radius * sphere.radius;
    const discriminant = b * b - 4 * a * c;

    // No intersection
    if (discriminant < 0) {
      return [];
    }

    // One or two intersections
    const sqrtD = Math.sqrt(discriminant);
    const t1 = (-b - sqrtD) / (2 * a);
    const t2 = (-b + sqrtD) / (2 * a);

    const intersections: Point3D[] = [];

    // Only include intersections in front of the ray origin
    if (t1 >= 0) {
      intersections.push(this.at(t1));
    }
    if (t2 >= 0 && Math.abs(t1 - t2) > 1e-10) {
      intersections.push(this.at(t2));
    }

    return intersections;
  }

  /**
   * Check if the ray intersects a sphere
   *
   * @param sphere The sphere
   * @returns True if the ray intersects the sphere
   */
  intersectsSphere(sphere: Sphere): boolean {
    const oc = this.origin.subtract(sphere.center);
    const a = this.direction.dot(this.direction);
    const b = 2 * oc.dot(this.direction);
    const c = oc.dot(oc) - sphere.radius * sphere.radius;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return false;
    }

    const sqrtD = Math.sqrt(discriminant);
    const t1 = (-b - sqrtD) / (2 * a);
    const t2 = (-b + sqrtD) / (2 * a);

    return t1 >= 0 || t2 >= 0;
  }

  /**
   * Create a ray from two points
   *
   * @param from Origin point
   * @param to Point the ray passes through
   * @returns New ray
   *
   * @example
   * const ray = Ray.fromTwoPoints(
   *   new Point3D(0, 0, 0),
   *   new Point3D(1, 1, 1)
   * );
   */
  static fromTwoPoints(from: Point3D, to: Point3D): Ray {
    return new Ray(from, to.subtract(from));
  }

  /**
   * Check if this ray equals another (with epsilon tolerance)
   *
   * @param other The other ray
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if rays are equal within epsilon
   */
  equals(other: Ray, epsilon = 1e-10): boolean {
    return (
      this.origin.equals(other.origin, epsilon) &&
      this.direction.equals(other.direction, epsilon)
    );
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `Ray(origin: ${this.origin}, direction: ${this.direction})`;
  }
}
