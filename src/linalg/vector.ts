/**
 * Vector class for mathematical vector operations
 * Supports arbitrary dimensions with comprehensive linear algebra operations
 */
export class Vector {
  private components: number[];

  /**
   * Creates a new Vector
   * @param components - Array of numbers representing vector components
   * @example
   * const v = new Vector([1, 2, 3]);
   * const v2 = Vector.fromComponents(1, 2, 3);
   */
  constructor(components: number[]) {
    if (components.length === 0) {
      throw new Error('Vector must have at least one component');
    }
    this.components = [...components];
  }

  /**
   * Creates a vector from individual components
   * @param components - Individual number components
   */
  static fromComponents(...components: number[]): Vector {
    return new Vector(components);
  }

  /**
   * Creates a zero vector of specified dimension
   * @param dimension - The dimension of the zero vector
   */
  static zero(dimension: number): Vector {
    if (dimension < 1) {
      throw new Error('Dimension must be at least 1');
    }
    return new Vector(new Array(dimension).fill(0));
  }

  /**
   * Creates a unit vector along a specific axis
   * @param dimension - Total dimension of the vector
   * @param axis - The axis index (0-based) to be set to 1
   */
  static unit(dimension: number, axis: number): Vector {
    if (dimension < 1) {
      throw new Error('Dimension must be at least 1');
    }
    if (axis < 0 || axis >= dimension) {
      throw new Error(`Axis must be between 0 and ${dimension - 1}`);
    }
    const components = new Array(dimension).fill(0);
    components[axis] = 1;
    return new Vector(components);
  }

  /**
   * Gets the dimension of the vector
   */
  get dimension(): number {
    return this.components.length;
  }

  /**
   * Gets a copy of the components array
   */
  toArray(): number[] {
    return [...this.components];
  }

  /**
   * Gets a specific component by index
   * @param index - The index (0-based)
   */
  get(index: number): number {
    if (index < 0 || index >= this.components.length) {
      throw new Error(`Index ${index} out of bounds`);
    }
    return this.components[index];
  }

  /**
   * Sets a specific component by index
   * @param index - The index (0-based)
   * @param value - The value to set
   */
  set(index: number, value: number): void {
    if (index < 0 || index >= this.components.length) {
      throw new Error(`Index ${index} out of bounds`);
    }
    this.components[index] = value;
  }

  /**
   * Computes the magnitude (length) of the vector
   * √(x₁² + x₂² + ... + xₙ²)
   */
  magnitude(): number {
    return Math.sqrt(this.components.reduce((sum, c) => sum + c * c, 0));
  }

  /**
   * Computes the squared magnitude (avoids square root for performance)
   * x₁² + x₂² + ... + xₙ²
   */
  magnitudeSquared(): number {
    return this.components.reduce((sum, c) => sum + c * c, 0);
  }

  /**
   * Returns a normalized (unit) vector in the same direction
   * For zero vectors, returns a zero vector
   */
  normalize(): Vector {
    const mag = this.magnitude();
    if (mag === 0) {
      return Vector.zero(this.dimension);
    }
    return this.scale(1 / mag);
  }

  /**
   * Adds another vector to this vector
   * @param other - The vector to add
   */
  add(other: Vector): Vector {
    if (this.dimension !== other.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${other.dimension}`);
    }
    return new Vector(this.components.map((c, i) => c + other.components[i]));
  }

  /**
   * Subtracts another vector from this vector
   * @param other - The vector to subtract
   */
  subtract(other: Vector): Vector {
    if (this.dimension !== other.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${other.dimension}`);
    }
    return new Vector(this.components.map((c, i) => c - other.components[i]));
  }

  /**
   * Scales the vector by a scalar value
   * @param scalar - The scalar multiplier
   */
  scale(scalar: number): Vector {
    return new Vector(this.components.map(c => c * scalar));
  }

  /**
   * Computes the dot product with another vector
   * a · b = a₁b₁ + a₂b₂ + ... + aₙbₙ
   * @param other - The other vector
   */
  dot(other: Vector): number {
    if (this.dimension !== other.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${other.dimension}`);
    }
    return this.components.reduce((sum, c, i) => sum + c * other.components[i], 0);
  }

  /**
   * Computes the cross product with another vector (3D only)
   * a × b = (a₂b₃ - a₃b₂, a₃b₁ - a₁b₃, a₁b₂ - a₂b₁)
   * @param other - The other vector (must be 3D)
   */
  cross(other: Vector): Vector {
    if (this.dimension !== 3 || other.dimension !== 3) {
      throw new Error('Cross product is only defined for 3D vectors');
    }
    const [a1, a2, a3] = this.components;
    const [b1, b2, b3] = other.components;
    return new Vector([
      a2 * b3 - a3 * b2,
      a3 * b1 - a1 * b3,
      a1 * b2 - a2 * b1
    ]);
  }

  /**
   * Computes the angle between this vector and another (in radians)
   * θ = arccos((a · b) / (|a| |b|))
   * @param other - The other vector
   */
  angleTo(other: Vector): number {
    if (this.dimension !== other.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${other.dimension}`);
    }
    const magProduct = this.magnitude() * other.magnitude();
    if (magProduct === 0) {
      throw new Error('Cannot compute angle with zero vector');
    }
    const cosAngle = this.dot(other) / magProduct;
    // Clamp to handle floating point errors
    return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  }

  /**
   * Projects this vector onto another vector
   * proj_b(a) = ((a · b) / (b · b)) * b
   * @param onto - The vector to project onto
   */
  projectOnto(onto: Vector): Vector {
    if (this.dimension !== onto.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${onto.dimension}`);
    }
    const ontoMagSq = onto.magnitudeSquared();
    if (ontoMagSq === 0) {
      throw new Error('Cannot project onto zero vector');
    }
    const scalar = this.dot(onto) / ontoMagSq;
    return onto.scale(scalar);
  }

  /**
   * Computes the rejection of this vector from another vector
   * rej_b(a) = a - proj_b(a)
   * @param from - The vector to reject from
   */
  rejectFrom(from: Vector): Vector {
    return this.subtract(this.projectOnto(from));
  }

  /**
   * Reflects this vector across a normal vector
   * r = v - 2(v · n)n (assumes n is normalized)
   * @param normal - The normal vector to reflect across (should be normalized)
   */
  reflect(normal: Vector): Vector {
    if (this.dimension !== normal.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${normal.dimension}`);
    }
    const dotProduct = this.dot(normal);
    return this.subtract(normal.scale(2 * dotProduct));
  }

  /**
   * Linear interpolation between this vector and another
   * lerp(a, b, t) = a + t(b - a) = (1 - t)a + tb
   * @param other - The target vector
   * @param t - Interpolation parameter (0 returns this, 1 returns other)
   */
  lerp(other: Vector, t: number): Vector {
    if (this.dimension !== other.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${other.dimension}`);
    }
    return new Vector(
      this.components.map((c, i) => c + t * (other.components[i] - c))
    );
  }

  /**
   * Spherical linear interpolation between this vector and another
   * Interpolates along the great circle path on a sphere
   * @param other - The target vector
   * @param t - Interpolation parameter (0 returns this, 1 returns other)
   */
  slerp(other: Vector, t: number): Vector {
    if (this.dimension !== other.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${other.dimension}`);
    }

    const dot = this.normalize().dot(other.normalize());

    // If vectors are very close, use linear interpolation
    if (Math.abs(dot) > 0.9995) {
      return this.lerp(other, t).normalize();
    }

    const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
    const sinTheta = Math.sin(theta);

    const w1 = Math.sin((1 - t) * theta) / sinTheta;
    const w2 = Math.sin(t * theta) / sinTheta;

    return new Vector(
      this.components.map((c, i) => w1 * c + w2 * other.components[i])
    );
  }

  /**
   * Checks if this vector equals another vector (within tolerance)
   * @param other - The other vector
   * @param tolerance - The tolerance for comparison (default: 1e-10)
   */
  equals(other: Vector, tolerance: number = 1e-10): boolean {
    if (this.dimension !== other.dimension) {
      return false;
    }
    return this.components.every((c, i) => Math.abs(c - other.components[i]) < tolerance);
  }

  /**
   * Returns a string representation of the vector
   */
  toString(): string {
    return `Vector([${this.components.join(', ')}])`;
  }

  /**
   * Creates a copy of this vector
   */
  clone(): Vector {
    return new Vector(this.components);
  }

  /**
   * Negates all components of the vector
   */
  negate(): Vector {
    return new Vector(this.components.map(c => -c));
  }

  /**
   * Returns the component-wise absolute value
   */
  abs(): Vector {
    return new Vector(this.components.map(c => Math.abs(c)));
  }

  /**
   * Applies a function to each component
   * @param fn - The function to apply
   */
  map(fn: (value: number, index: number) => number): Vector {
    return new Vector(this.components.map(fn));
  }

  /**
   * Gets the minimum component value
   */
  min(): number {
    return Math.min(...this.components);
  }

  /**
   * Gets the maximum component value
   */
  max(): number {
    return Math.max(...this.components);
  }

  /**
   * Computes component-wise minimum with another vector
   * @param other - The other vector
   */
  componentMin(other: Vector): Vector {
    if (this.dimension !== other.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${other.dimension}`);
    }
    return new Vector(this.components.map((c, i) => Math.min(c, other.components[i])));
  }

  /**
   * Computes component-wise maximum with another vector
   * @param other - The other vector
   */
  componentMax(other: Vector): Vector {
    if (this.dimension !== other.dimension) {
      throw new Error(`Vector dimensions must match: ${this.dimension} vs ${other.dimension}`);
    }
    return new Vector(this.components.map((c, i) => Math.max(c, other.components[i])));
  }
}
