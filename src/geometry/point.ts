/**
 * 2D Point class with comprehensive geometric operations
 *
 * Provides operations for:
 * - Distance calculation
 * - Midpoint computation
 * - Rotation around origin or arbitrary point
 * - Reflection across lines
 * - Polar/Cartesian coordinate conversion
 */

export class Point {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  /**
   * Calculate Euclidean distance to another point
   * Formula: √((x₂ - x₁)² + (y₂ - y₁)²)
   *
   * @param other The other point
   * @returns Euclidean distance
   *
   * @example
   * const p1 = new Point(0, 0);
   * const p2 = new Point(3, 4);
   * p1.distanceTo(p2); // 5
   */
  distanceTo(other: Point): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate Manhattan distance to another point
   * Formula: |x₂ - x₁| + |y₂ - y₁|
   *
   * @param other The other point
   * @returns Manhattan distance
   */
  manhattanDistanceTo(other: Point): number {
    return Math.abs(other.x - this.x) + Math.abs(other.y - this.y);
  }

  /**
   * Calculate squared Euclidean distance (avoids sqrt for efficiency)
   * Formula: (x₂ - x₁)² + (y₂ - y₁)²
   *
   * @param other The other point
   * @returns Squared Euclidean distance
   */
  distanceSquaredTo(other: Point): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return dx * dx + dy * dy;
  }

  /**
   * Find the midpoint between this point and another
   * Formula: ((x₁ + x₂)/2, (y₁ + y₂)/2)
   *
   * @param other The other point
   * @returns Midpoint
   *
   * @example
   * const p1 = new Point(0, 0);
   * const p2 = new Point(4, 6);
   * p1.midpoint(p2); // Point(2, 3)
   */
  midpoint(other: Point): Point {
    return new Point(
      (this.x + other.x) / 2,
      (this.y + other.y) / 2
    );
  }

  /**
   * Rotate this point around the origin by an angle
   *
   * @param angle Rotation angle in radians (counterclockwise)
   * @returns Rotated point
   *
   * @example
   * const p = new Point(1, 0);
   * p.rotate(Math.PI / 2); // Point(0, 1) approximately
   */
  rotate(angle: number): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Point(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  /**
   * Rotate this point around an arbitrary center point
   *
   * @param angle Rotation angle in radians (counterclockwise)
   * @param center Center of rotation
   * @returns Rotated point
   *
   * @example
   * const p = new Point(2, 0);
   * const center = new Point(1, 0);
   * p.rotateAround(Math.PI / 2, center); // Point(1, 1) approximately
   */
  rotateAround(angle: number, center: Point): Point {
    // Translate to origin, rotate, translate back
    const translated = this.subtract(center);
    const rotated = translated.rotate(angle);
    return rotated.add(center);
  }

  /**
   * Reflect this point across the x-axis
   * Formula: (x, -y)
   *
   * @returns Reflected point
   */
  reflectX(): Point {
    return new Point(this.x, -this.y);
  }

  /**
   * Reflect this point across the y-axis
   * Formula: (-x, y)
   *
   * @returns Reflected point
   */
  reflectY(): Point {
    return new Point(-this.x, this.y);
  }

  /**
   * Reflect this point across the origin
   * Formula: (-x, -y)
   *
   * @returns Reflected point
   */
  reflectOrigin(): Point {
    return new Point(-this.x, -this.y);
  }

  /**
   * Reflect this point across a line defined by y = mx + b
   *
   * @param slope Line slope (m)
   * @param intercept Y-intercept (b)
   * @returns Reflected point
   */
  reflectAcrossLine(slope: number, intercept: number): Point {
    // Handle vertical line (infinite slope) separately
    if (!isFinite(slope)) {
      // For vertical line x = intercept, reflect across x = intercept
      return new Point(2 * intercept - this.x, this.y);
    }

    // Handle horizontal line (slope = 0)
    if (slope === 0) {
      // For horizontal line y = b, reflect across y = b
      return new Point(this.x, 2 * intercept - this.y);
    }

    // For line y = mx + b, use general form: ax + by + c = 0
    // where a = m, b = -1, c = intercept becomes -mx + y - intercept = 0
    // or equivalently: mx - y + intercept = 0, so a = m, b = -1, c = intercept
    const a = slope;
    const b = -1;
    const c = intercept;

    // Reflection formula: P' = P - 2 * ((a*x + b*y + c) / (a² + b²)) * (a, b)
    const factor = 2 * (a * this.x + b * this.y + c) / (a * a + b * b);

    return new Point(
      this.x - factor * a,
      this.y - factor * b
    );
  }

  /**
   * Reflect this point across an arbitrary line defined by two points
   *
   * @param p1 First point on the line
   * @param p2 Second point on the line
   * @returns Reflected point
   */
  reflectAcrossTwoPoints(p1: Point, p2: Point): Point {
    // Handle vertical line
    if (Math.abs(p2.x - p1.x) < 1e-10) {
      return new Point(2 * p1.x - this.x, this.y);
    }

    const slope = (p2.y - p1.y) / (p2.x - p1.x);
    const intercept = p1.y - slope * p1.x;
    return this.reflectAcrossLine(slope, intercept);
  }

  /**
   * Convert Cartesian coordinates to polar coordinates
   * Returns [r, θ] where r is the radius and θ is the angle in radians
   *
   * @returns [radius, angle] Polar coordinates
   *
   * @example
   * const p = new Point(1, 1);
   * p.toPolar(); // [√2, π/4] approximately [1.414, 0.785]
   */
  toPolar(): [number, number] {
    const r = Math.sqrt(this.x * this.x + this.y * this.y);
    const theta = Math.atan2(this.y, this.x);
    return [r, theta];
  }

  /**
   * Create a point from polar coordinates
   *
   * @param r Radius (distance from origin)
   * @param theta Angle in radians
   * @returns Point in Cartesian coordinates
   *
   * @example
   * Point.fromPolar(1, Math.PI / 2); // Point(0, 1) approximately
   */
  static fromPolar(r: number, theta: number): Point {
    return new Point(
      r * Math.cos(theta),
      r * Math.sin(theta)
    );
  }

  /**
   * Add another point (vector addition)
   *
   * @param other The other point
   * @returns Sum point
   */
  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract another point (vector subtraction)
   *
   * @param other The other point
   * @returns Difference point
   */
  subtract(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y);
  }

  /**
   * Scale this point by a scalar factor
   *
   * @param factor Scaling factor
   * @returns Scaled point
   */
  scale(factor: number): Point {
    return new Point(this.x * factor, this.y * factor);
  }

  /**
   * Compute the dot product with another point (treating as vectors)
   *
   * @param other The other point
   * @returns Dot product
   */
  dot(other: Point): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Compute the cross product magnitude with another point (treating as 2D vectors)
   * Returns the z-component of the 3D cross product (x₁y₂ - x₂y₁)
   * Positive if other is counterclockwise from this, negative if clockwise
   *
   * @param other The other point
   * @returns Cross product magnitude (z-component)
   */
  cross(other: Point): number {
    return this.x * other.y - this.y * other.x;
  }

  /**
   * Get the magnitude (length) of this point as a vector
   *
   * @returns Magnitude
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize this point (create a unit vector in the same direction)
   *
   * @returns Normalized point
   * @throws Error if the point is at the origin (zero magnitude)
   */
  normalize(): Point {
    const mag = this.magnitude();
    if (mag === 0) {
      throw new Error('Cannot normalize a zero-length vector');
    }
    return new Point(this.x / mag, this.y / mag);
  }

  /**
   * Linear interpolation between this point and another
   *
   * @param other The other point
   * @param t Interpolation parameter (0 = this point, 1 = other point)
   * @returns Interpolated point
   */
  lerp(other: Point, t: number): Point {
    return new Point(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t
    );
  }

  /**
   * Check if this point equals another point (within floating-point tolerance)
   *
   * @param other The other point
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if points are equal within tolerance
   */
  equals(other: Point, epsilon: number = 1e-10): boolean {
    return Math.abs(this.x - other.x) < epsilon &&
           Math.abs(this.y - other.y) < epsilon;
  }

  /**
   * Create a copy of this point
   *
   * @returns New point with same coordinates
   */
  clone(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `Point(${this.x}, ${this.y})`;
  }

  /**
   * Convert to array [x, y]
   *
   * @returns Array representation
   */
  toArray(): [number, number] {
    return [this.x, this.y];
  }

  /**
   * Create a point from an array [x, y]
   *
   * @param arr Array with x and y coordinates
   * @returns Point
   */
  static fromArray(arr: [number, number]): Point {
    return new Point(arr[0], arr[1]);
  }

  /**
   * Get the angle of this point relative to the positive x-axis
   *
   * @returns Angle in radians [-π, π]
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Get the angle from this point to another point
   *
   * @param other The other point
   * @returns Angle in radians [-π, π]
   */
  angleTo(other: Point): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  /**
   * Project this point onto another vector
   *
   * @param onto The vector to project onto
   * @returns Projected point
   */
  projectOnto(onto: Point): Point {
    const mag2 = onto.dot(onto);
    if (mag2 === 0) {
      throw new Error('Cannot project onto a zero-length vector');
    }
    const scalar = this.dot(onto) / mag2;
    return onto.scale(scalar);
  }
}
