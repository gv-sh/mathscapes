/**
 * 3D Sphere class for sphere operations
 *
 * A sphere is defined by a center point and a radius.
 * Provides operations for:
 * - Point-sphere distance and containment
 * - Sphere-sphere intersection
 * - Ray-sphere intersection
 * - Closest point on surface
 * - Volume and surface area
 */

import { Point3D } from './point3d';

export class Sphere {
  constructor(
    public readonly center: Point3D,
    public readonly radius: number
  ) {
    if (radius < 0) {
      throw new Error('Sphere radius must be non-negative');
    }
  }

  /**
   * Calculate the volume of the sphere
   * Formula: (4/3)πr³
   *
   * @returns Volume
   *
   * @example
   * const sphere = new Sphere(new Point3D(0, 0, 0), 2);
   * sphere.volume(); // ≈ 33.51
   */
  volume(): number {
    return (4 / 3) * Math.PI * Math.pow(this.radius, 3);
  }

  /**
   * Calculate the surface area of the sphere
   * Formula: 4πr²
   *
   * @returns Surface area
   *
   * @example
   * const sphere = new Sphere(new Point3D(0, 0, 0), 2);
   * sphere.surfaceArea(); // ≈ 50.27
   */
  surfaceArea(): number {
    return 4 * Math.PI * this.radius * this.radius;
  }

  /**
   * Check if a point is inside the sphere
   *
   * @param point The point to check
   * @param epsilon Tolerance for boundary (default: 1e-10)
   * @returns True if point is inside or on the sphere
   *
   * @example
   * const sphere = new Sphere(new Point3D(0, 0, 0), 5);
   * sphere.containsPoint(new Point3D(3, 0, 0)); // true
   * sphere.containsPoint(new Point3D(6, 0, 0)); // false
   */
  containsPoint(point: Point3D, epsilon = 1e-10): boolean {
    const distanceSquared = this.center.distanceSquaredTo(point);
    return distanceSquared <= this.radius * this.radius + epsilon;
  }

  /**
   * Calculate distance from sphere surface to a point
   * Returns negative if point is inside
   *
   * @param point The point
   * @returns Distance (negative if inside)
   *
   * @example
   * const sphere = new Sphere(new Point3D(0, 0, 0), 5);
   * sphere.distanceToPoint(new Point3D(10, 0, 0)); // 5
   * sphere.distanceToPoint(new Point3D(2, 0, 0)); // -3
   */
  distanceToPoint(point: Point3D): number {
    return this.center.distanceTo(point) - this.radius;
  }

  /**
   * Find the closest point on the sphere surface to a given point
   *
   * @param point The point
   * @returns Closest point on sphere surface
   *
   * @example
   * const sphere = new Sphere(new Point3D(0, 0, 0), 5);
   * sphere.closestPointTo(new Point3D(10, 0, 0)); // Point3D(5, 0, 0)
   */
  closestPointTo(point: Point3D): Point3D {
    const direction = point.subtract(this.center);
    const distance = direction.magnitude();

    if (distance === 0) {
      // Point is at center, return any point on surface
      return this.center.add(new Point3D(this.radius, 0, 0));
    }

    return this.center.add(direction.scale(this.radius / distance));
  }

  /**
   * Check if this sphere intersects another sphere
   *
   * @param other The other sphere
   * @returns True if spheres intersect or touch
   *
   * @example
   * const s1 = new Sphere(new Point3D(0, 0, 0), 5);
   * const s2 = new Sphere(new Point3D(8, 0, 0), 5);
   * s1.intersectsSphere(s2); // true
   */
  intersectsSphere(other: Sphere): boolean {
    const distance = this.center.distanceTo(other.center);
    return distance <= this.radius + other.radius;
  }

  /**
   * Find the intersection circle of two spheres
   *
   * @param other The other sphere
   * @returns Object with center and radius of intersection circle, or null if no intersection
   *
   * @example
   * const s1 = new Sphere(new Point3D(0, 0, 0), 5);
   * const s2 = new Sphere(new Point3D(6, 0, 0), 5);
   * s1.intersectSphere(s2); // { center: Point3D(3, 0, 0), radius: 4 }
   */
  intersectSphere(other: Sphere): { center: Point3D; radius: number } | null {
    const d = this.center.distanceTo(other.center);

    // No intersection
    if (d > this.radius + other.radius || d < Math.abs(this.radius - other.radius)) {
      return null;
    }

    // Spheres are identical
    if (d === 0 && this.radius === other.radius) {
      return null;
    }

    // Calculate intersection circle
    // Using formula: a = (r1² - r2² + d²) / (2d)
    const a = (this.radius * this.radius - other.radius * other.radius + d * d) / (2 * d);
    const h = Math.sqrt(this.radius * this.radius - a * a);

    // Center of intersection circle
    const direction = other.center.subtract(this.center).normalize();
    const center = this.center.add(direction.scale(a));

    return { center, radius: h };
  }

  /**
   * Calculate the union volume of two spheres (volume covered by either sphere)
   *
   * @param other The other sphere
   * @returns Union volume
   */
  unionVolume(other: Sphere): number {
    const d = this.center.distanceTo(other.center);

    // One sphere contains the other
    if (d <= Math.abs(this.radius - other.radius)) {
      return Math.max(this.volume(), other.volume());
    }

    // No intersection
    if (d >= this.radius + other.radius) {
      return this.volume() + other.volume();
    }

    // Partial intersection - use formula for spherical cap volumes
    const r1 = this.radius;
    const r2 = other.radius;

    const h1 = (r1 + r2 - d) * (d + r1 - r2) / (2 * d);
    const h2 = (r1 + r2 - d) * (d + r2 - r1) / (2 * d);

    const cap1 = Math.PI * h1 * h1 * (r1 - h1 / 3);
    const cap2 = Math.PI * h2 * h2 * (r2 - h2 / 3);

    return this.volume() + other.volume() - cap1 - cap2;
  }

  /**
   * Calculate the intersection volume of two spheres
   *
   * @param other The other sphere
   * @returns Intersection volume
   */
  intersectionVolume(other: Sphere): number {
    const d = this.center.distanceTo(other.center);

    // One sphere contains the other
    if (d <= Math.abs(this.radius - other.radius)) {
      return Math.min(this.volume(), other.volume());
    }

    // No intersection
    if (d >= this.radius + other.radius) {
      return 0;
    }

    // Partial intersection - sum of two spherical caps
    const r1 = this.radius;
    const r2 = other.radius;

    const h1 = (r1 + r2 - d) * (d + r1 - r2) / (2 * d);
    const h2 = (r1 + r2 - d) * (d + r2 - r1) / (2 * d);

    const cap1 = Math.PI * h1 * h1 * (r1 - h1 / 3);
    const cap2 = Math.PI * h2 * h2 * (r2 - h2 / 3);

    return cap1 + cap2;
  }

  /**
   * Create a bounding sphere from a set of points
   *
   * @param points Array of points
   * @returns Bounding sphere (using Ritter's algorithm)
   *
   * @example
   * const points = [
   *   new Point3D(0, 0, 0),
   *   new Point3D(10, 0, 0),
   *   new Point3D(0, 10, 0)
   * ];
   * Sphere.fromPoints(points);
   */
  static fromPoints(points: Point3D[]): Sphere {
    if (points.length === 0) {
      throw new Error('Cannot create bounding sphere from empty point set');
    }

    if (points.length === 1) {
      return new Sphere(points[0], 0);
    }

    // Ritter's bounding sphere algorithm
    // Find initial sphere using two farthest points
    let maxDist = 0;
    let p1 = points[0];
    let p2 = points[0];

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].distanceSquaredTo(points[j]);
        if (dist > maxDist) {
          maxDist = dist;
          p1 = points[i];
          p2 = points[j];
        }
      }
    }

    let center = p1.midpoint(p2);
    let radius = Math.sqrt(maxDist) / 2;

    // Expand sphere to include all points
    for (const point of points) {
      const dist = center.distanceTo(point);
      if (dist > radius) {
        const newRadius = (radius + dist) / 2;
        const offset = newRadius - radius;
        const direction = point.subtract(center).normalize();
        center = center.add(direction.scale(offset));
        radius = newRadius;
      }
    }

    return new Sphere(center, radius);
  }

  /**
   * Check if this sphere equals another
   *
   * @param other The other sphere
   * @param epsilon Tolerance (default: 1e-10)
   * @returns True if spheres are equal
   */
  equals(other: Sphere, epsilon = 1e-10): boolean {
    return (
      this.center.equals(other.center, epsilon) &&
      Math.abs(this.radius - other.radius) < epsilon
    );
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `Sphere(center: ${this.center}, radius: ${this.radius})`;
  }

  /**
   * Create a unit sphere at origin
   *
   * @returns Unit sphere
   */
  static unit(): Sphere {
    return new Sphere(Point3D.origin(), 1);
  }
}
