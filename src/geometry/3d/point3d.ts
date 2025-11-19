/**
 * 3D Point class with comprehensive geometric operations
 *
 * Provides operations for:
 * - Distance calculation (Euclidean, Manhattan, squared)
 * - Vector operations (addition, subtraction, scaling, normalization)
 * - Dot and cross products
 * - Rotation and transformation
 * - Spherical/Cartesian coordinate conversion
 */

export class Point3D {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) {}

  /**
   * Calculate Euclidean distance to another point
   * Formula: √((x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²)
   *
   * @param other The other point
   * @returns Euclidean distance
   *
   * @example
   * const p1 = new Point3D(0, 0, 0);
   * const p2 = new Point3D(3, 4, 0);
   * p1.distanceTo(p2); // 5
   */
  distanceTo(other: Point3D): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const dz = other.z - this.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate squared Euclidean distance (avoids sqrt for efficiency)
   * Formula: (x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²
   *
   * @param other The other point
   * @returns Squared Euclidean distance
   */
  distanceSquaredTo(other: Point3D): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const dz = other.z - this.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Calculate Manhattan distance to another point
   * Formula: |x₂ - x₁| + |y₂ - y₁| + |z₂ - z₁|
   *
   * @param other The other point
   * @returns Manhattan distance
   */
  manhattanDistanceTo(other: Point3D): number {
    return Math.abs(other.x - this.x) + Math.abs(other.y - this.y) + Math.abs(other.z - this.z);
  }

  /**
   * Find the midpoint between this point and another
   * Formula: ((x₁ + x₂)/2, (y₁ + y₂)/2, (z₁ + z₂)/2)
   *
   * @param other The other point
   * @returns Midpoint
   *
   * @example
   * const p1 = new Point3D(0, 0, 0);
   * const p2 = new Point3D(4, 6, 8);
   * p1.midpoint(p2); // Point3D(2, 3, 4)
   */
  midpoint(other: Point3D): Point3D {
    return new Point3D(
      (this.x + other.x) / 2,
      (this.y + other.y) / 2,
      (this.z + other.z) / 2
    );
  }

  /**
   * Add another point (vector addition)
   *
   * @param other The other point
   * @returns New point representing the sum
   *
   * @example
   * const p1 = new Point3D(1, 2, 3);
   * const p2 = new Point3D(4, 5, 6);
   * p1.add(p2); // Point3D(5, 7, 9)
   */
  add(other: Point3D): Point3D {
    return new Point3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  /**
   * Subtract another point (vector subtraction)
   *
   * @param other The other point
   * @returns New point representing the difference
   *
   * @example
   * const p1 = new Point3D(5, 7, 9);
   * const p2 = new Point3D(1, 2, 3);
   * p1.subtract(p2); // Point3D(4, 5, 6)
   */
  subtract(other: Point3D): Point3D {
    return new Point3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  /**
   * Multiply by a scalar value
   *
   * @param scalar The scalar value
   * @returns Scaled point
   *
   * @example
   * const p = new Point3D(1, 2, 3);
   * p.scale(2); // Point3D(2, 4, 6)
   */
  scale(scalar: number): Point3D {
    return new Point3D(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * Calculate the magnitude (length) of the vector from origin to this point
   * Formula: √(x² + y² + z²)
   *
   * @returns Magnitude
   *
   * @example
   * const p = new Point3D(3, 4, 0);
   * p.magnitude(); // 5
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Calculate the squared magnitude (avoids sqrt for efficiency)
   * Formula: x² + y² + z²
   *
   * @returns Squared magnitude
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Normalize the vector (make it unit length)
   *
   * @returns Normalized point (unit vector)
   *
   * @example
   * const p = new Point3D(3, 4, 0);
   * p.normalize(); // Point3D(0.6, 0.8, 0)
   */
  normalize(): Point3D {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Point3D(0, 0, 0);
    }
    return new Point3D(this.x / mag, this.y / mag, this.z / mag);
  }

  /**
   * Calculate dot product with another point
   * Formula: x₁·x₂ + y₁·y₂ + z₁·z₂
   *
   * @param other The other point
   * @returns Dot product
   *
   * @example
   * const p1 = new Point3D(1, 0, 0);
   * const p2 = new Point3D(0, 1, 0);
   * p1.dot(p2); // 0
   */
  dot(other: Point3D): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  /**
   * Calculate cross product with another point
   * Formula: (y₁z₂ - z₁y₂, z₁x₂ - x₁z₂, x₁y₂ - y₁x₂)
   *
   * @param other The other point
   * @returns Cross product vector
   *
   * @example
   * const p1 = new Point3D(1, 0, 0);
   * const p2 = new Point3D(0, 1, 0);
   * p1.cross(p2); // Point3D(0, 0, 1)
   */
  cross(other: Point3D): Point3D {
    return new Point3D(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  /**
   * Calculate the angle between this vector and another (in radians)
   * Formula: arccos((a·b) / (|a||b|))
   *
   * @param other The other point
   * @returns Angle in radians
   *
   * @example
   * const p1 = new Point3D(1, 0, 0);
   * const p2 = new Point3D(0, 1, 0);
   * p1.angleTo(p2); // π/2
   */
  angleTo(other: Point3D): number {
    const dotProduct = this.dot(other);
    const magnitudes = this.magnitude() * other.magnitude();
    if (magnitudes === 0) {
      return 0;
    }
    return Math.acos(Math.max(-1, Math.min(1, dotProduct / magnitudes)));
  }

  /**
   * Project this vector onto another vector
   *
   * @param other The vector to project onto
   * @returns Projected vector
   *
   * @example
   * const p1 = new Point3D(3, 4, 0);
   * const p2 = new Point3D(1, 0, 0);
   * p1.projectOnto(p2); // Point3D(3, 0, 0)
   */
  projectOnto(other: Point3D): Point3D {
    const otherMagSquared = other.magnitudeSquared();
    if (otherMagSquared === 0) {
      return new Point3D(0, 0, 0);
    }
    const scalar = this.dot(other) / otherMagSquared;
    return other.scale(scalar);
  }

  /**
   * Linear interpolation between this point and another
   *
   * @param other The other point
   * @param t Interpolation parameter (0 = this point, 1 = other point)
   * @returns Interpolated point
   *
   * @example
   * const p1 = new Point3D(0, 0, 0);
   * const p2 = new Point3D(10, 10, 10);
   * p1.lerp(p2, 0.5); // Point3D(5, 5, 5)
   */
  lerp(other: Point3D, t: number): Point3D {
    return new Point3D(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t,
      this.z + (other.z - this.z) * t
    );
  }

  /**
   * Rotate around the X axis
   *
   * @param angle Rotation angle in radians
   * @returns Rotated point
   *
   * @example
   * const p = new Point3D(0, 1, 0);
   * p.rotateX(Math.PI / 2); // Point3D(0, 0, 1) approximately
   */
  rotateX(angle: number): Point3D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Point3D(
      this.x,
      this.y * cos - this.z * sin,
      this.y * sin + this.z * cos
    );
  }

  /**
   * Rotate around the Y axis
   *
   * @param angle Rotation angle in radians
   * @returns Rotated point
   *
   * @example
   * const p = new Point3D(1, 0, 0);
   * p.rotateY(Math.PI / 2); // Point3D(0, 0, -1) approximately
   */
  rotateY(angle: number): Point3D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Point3D(
      this.x * cos + this.z * sin,
      this.y,
      -this.x * sin + this.z * cos
    );
  }

  /**
   * Rotate around the Z axis
   *
   * @param angle Rotation angle in radians
   * @returns Rotated point
   *
   * @example
   * const p = new Point3D(1, 0, 0);
   * p.rotateZ(Math.PI / 2); // Point3D(0, 1, 0) approximately
   */
  rotateZ(angle: number): Point3D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Point3D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos,
      this.z
    );
  }

  /**
   * Create a Point3D from spherical coordinates
   * Formula: (r·sin(θ)·cos(φ), r·sin(θ)·sin(φ), r·cos(θ))
   *
   * @param r Radius (distance from origin)
   * @param theta Polar angle (angle from z-axis) in radians
   * @param phi Azimuthal angle (angle in xy-plane from x-axis) in radians
   * @returns Point3D in Cartesian coordinates
   *
   * @example
   * Point3D.fromSpherical(1, Math.PI / 2, 0); // Point3D(1, 0, 0)
   */
  static fromSpherical(r: number, theta: number, phi: number): Point3D {
    const sinTheta = Math.sin(theta);
    return new Point3D(
      r * sinTheta * Math.cos(phi),
      r * sinTheta * Math.sin(phi),
      r * Math.cos(theta)
    );
  }

  /**
   * Convert to spherical coordinates
   *
   * @returns Object with r (radius), theta (polar angle), phi (azimuthal angle)
   *
   * @example
   * const p = new Point3D(1, 0, 0);
   * p.toSpherical(); // { r: 1, theta: π/2, phi: 0 }
   */
  toSpherical(): { r: number; theta: number; phi: number } {
    const r = this.magnitude();
    const theta = r === 0 ? 0 : Math.acos(this.z / r);
    const phi = Math.atan2(this.y, this.x);
    return { r, theta, phi };
  }

  /**
   * Check if this point equals another (with epsilon tolerance)
   *
   * @param other The other point
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if points are equal within epsilon
   */
  equals(other: Point3D, epsilon = 1e-10): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `Point3D(${this.x}, ${this.y}, ${this.z})`;
  }

  /**
   * Create origin point (0, 0, 0)
   *
   * @returns Origin point
   */
  static origin(): Point3D {
    return new Point3D(0, 0, 0);
  }

  /**
   * Create unit vector along X axis
   *
   * @returns Point3D(1, 0, 0)
   */
  static unitX(): Point3D {
    return new Point3D(1, 0, 0);
  }

  /**
   * Create unit vector along Y axis
   *
   * @returns Point3D(0, 1, 0)
   */
  static unitY(): Point3D {
    return new Point3D(0, 1, 0);
  }

  /**
   * Create unit vector along Z axis
   *
   * @returns Point3D(0, 0, 1)
   */
  static unitZ(): Point3D {
    return new Point3D(0, 0, 1);
  }
}
