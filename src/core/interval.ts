/**
 * Interval class for interval arithmetic
 * Represents intervals on the real number line with various boundary types
 */

export enum BoundaryType {
  OPEN = 'OPEN',           // (a, b) - neither endpoint included
  CLOSED = 'CLOSED',       // [a, b] - both endpoints included
  LEFT_OPEN = 'LEFT_OPEN',   // (a, b] - left open, right closed
  RIGHT_OPEN = 'RIGHT_OPEN'  // [a, b) - left closed, right open
}

export class Interval {
  private lowerBound: number;
  private upperBound: number;
  private boundaryType: BoundaryType;

  /**
   * Creates a new Interval
   * @param lower - Lower bound
   * @param upper - Upper bound
   * @param type - Boundary type (default: CLOSED)
   */
  constructor(lower: number, upper: number, type: BoundaryType = BoundaryType.CLOSED) {
    if (lower > upper) {
      throw new Error(`Lower bound ${lower} cannot be greater than upper bound ${upper}`);
    }
    this.lowerBound = lower;
    this.upperBound = upper;
    this.boundaryType = type;
  }

  /**
   * Creates a closed interval [a, b]
   */
  static closed(lower: number, upper: number): Interval {
    return new Interval(lower, upper, BoundaryType.CLOSED);
  }

  /**
   * Creates an open interval (a, b)
   */
  static open(lower: number, upper: number): Interval {
    return new Interval(lower, upper, BoundaryType.OPEN);
  }

  /**
   * Creates a left-open interval (a, b]
   */
  static leftOpen(lower: number, upper: number): Interval {
    return new Interval(lower, upper, BoundaryType.LEFT_OPEN);
  }

  /**
   * Creates a right-open interval [a, b)
   */
  static rightOpen(lower: number, upper: number): Interval {
    return new Interval(lower, upper, BoundaryType.RIGHT_OPEN);
  }

  /**
   * Gets the lower bound
   */
  get lower(): number {
    return this.lowerBound;
  }

  /**
   * Gets the upper bound
   */
  get upper(): number {
    return this.upperBound;
  }

  /**
   * Gets the boundary type
   */
  get type(): BoundaryType {
    return this.boundaryType;
  }

  /**
   * Checks if lower bound is included
   */
  isLowerIncluded(): boolean {
    return this.boundaryType === BoundaryType.CLOSED ||
           this.boundaryType === BoundaryType.RIGHT_OPEN;
  }

  /**
   * Checks if upper bound is included
   */
  isUpperIncluded(): boolean {
    return this.boundaryType === BoundaryType.CLOSED ||
           this.boundaryType === BoundaryType.LEFT_OPEN;
  }

  /**
   * Gets the width (length) of the interval
   */
  width(): number {
    return this.upperBound - this.lowerBound;
  }

  /**
   * Gets the midpoint of the interval
   */
  midpoint(): number {
    return (this.lowerBound + this.upperBound) / 2;
  }

  /**
   * Checks if a value is contained in the interval
   * @param value - The value to check
   */
  contains(value: number): boolean {
    if (value < this.lowerBound || value > this.upperBound) {
      return false;
    }

    if (value === this.lowerBound) {
      return this.isLowerIncluded();
    }

    if (value === this.upperBound) {
      return this.isUpperIncluded();
    }

    return true; // value is strictly between bounds
  }

  /**
   * Checks if this interval completely contains another interval
   * @param other - The other interval
   */
  containsInterval(other: Interval): boolean {
    // Check lower bound
    const lowerOk =
      other.lowerBound > this.lowerBound ||
      (other.lowerBound === this.lowerBound &&
       (this.isLowerIncluded() || !other.isLowerIncluded()));

    // Check upper bound
    const upperOk =
      other.upperBound < this.upperBound ||
      (other.upperBound === this.upperBound &&
       (this.isUpperIncluded() || !other.isUpperIncluded()));

    return lowerOk && upperOk;
  }

  /**
   * Checks if this interval overlaps with another interval
   * @param other - The other interval
   */
  overlaps(other: Interval): boolean {
    const intersection = this.intersection(other);
    return intersection !== null && !intersection.isEmpty();
  }

  /**
   * Checks if the interval is empty (lower = upper and both bounds excluded)
   */
  isEmpty(): boolean {
    return this.lowerBound === this.upperBound &&
           this.boundaryType === BoundaryType.OPEN;
  }

  /**
   * Computes the intersection with another interval
   * @param other - The other interval
   */
  intersection(other: Interval): Interval | null {
    const newLower = Math.max(this.lowerBound, other.lowerBound);
    const newUpper = Math.min(this.upperBound, other.upperBound);

    // Check if intervals don't overlap
    if (newLower > newUpper) {
      return null; // Empty intersection
    }

    // Determine boundary types for the intersection
    let lowerIncluded = true;
    let upperIncluded = true;

    if (newLower === this.lowerBound && newLower === other.lowerBound) {
      lowerIncluded = this.isLowerIncluded() && other.isLowerIncluded();
    } else if (newLower === this.lowerBound) {
      lowerIncluded = this.isLowerIncluded();
    } else {
      lowerIncluded = other.isLowerIncluded();
    }

    if (newUpper === this.upperBound && newUpper === other.upperBound) {
      upperIncluded = this.isUpperIncluded() && other.isUpperIncluded();
    } else if (newUpper === this.upperBound) {
      upperIncluded = this.isUpperIncluded();
    } else {
      upperIncluded = other.isUpperIncluded();
    }

    // Check for empty interval
    if (newLower === newUpper && (!lowerIncluded || !upperIncluded)) {
      return null;
    }

    // Determine boundary type
    let type: BoundaryType;
    if (lowerIncluded && upperIncluded) {
      type = BoundaryType.CLOSED;
    } else if (!lowerIncluded && !upperIncluded) {
      type = BoundaryType.OPEN;
    } else if (!lowerIncluded && upperIncluded) {
      type = BoundaryType.LEFT_OPEN;
    } else {
      type = BoundaryType.RIGHT_OPEN;
    }

    return new Interval(newLower, newUpper, type);
  }

  /**
   * Computes the union with another interval (if possible)
   * Returns null if intervals are disjoint
   * @param other - The other interval
   */
  union(other: Interval): Interval | null {
    // Check if intervals overlap or are adjacent
    if (!this.overlaps(other) && !this.isAdjacentTo(other)) {
      return null; // Cannot form a single interval
    }

    const newLower = Math.min(this.lowerBound, other.lowerBound);
    const newUpper = Math.max(this.upperBound, other.upperBound);

    // Determine boundary types for the union
    let lowerIncluded = true;
    let upperIncluded = true;

    if (newLower === this.lowerBound && newLower === other.lowerBound) {
      lowerIncluded = this.isLowerIncluded() || other.isLowerIncluded();
    } else if (newLower === this.lowerBound) {
      lowerIncluded = this.isLowerIncluded();
    } else {
      lowerIncluded = other.isLowerIncluded();
    }

    if (newUpper === this.upperBound && newUpper === other.upperBound) {
      upperIncluded = this.isUpperIncluded() || other.isUpperIncluded();
    } else if (newUpper === this.upperBound) {
      upperIncluded = this.isUpperIncluded();
    } else {
      upperIncluded = other.isUpperIncluded();
    }

    // Determine boundary type
    let type: BoundaryType;
    if (lowerIncluded && upperIncluded) {
      type = BoundaryType.CLOSED;
    } else if (!lowerIncluded && !upperIncluded) {
      type = BoundaryType.OPEN;
    } else if (!lowerIncluded && upperIncluded) {
      type = BoundaryType.LEFT_OPEN;
    } else {
      type = BoundaryType.RIGHT_OPEN;
    }

    return new Interval(newLower, newUpper, type);
  }

  /**
   * Checks if this interval is adjacent to another interval
   * @param other - The other interval
   */
  isAdjacentTo(other: Interval): boolean {
    // Check if upper bound of one equals lower bound of the other
    if (this.upperBound === other.lowerBound) {
      // At least one bound must be included for adjacency
      return this.isUpperIncluded() || other.isLowerIncluded();
    }
    if (this.lowerBound === other.upperBound) {
      return this.isLowerIncluded() || other.isUpperIncluded();
    }
    return false;
  }

  /**
   * Checks if two intervals are equal
   * @param other - The other interval
   */
  equals(other: Interval): boolean {
    return this.lowerBound === other.lowerBound &&
           this.upperBound === other.upperBound &&
           this.boundaryType === other.boundaryType;
  }

  /**
   * Addition of intervals (Minkowski sum)
   * [a, b] + [c, d] = [a + c, b + d]
   * @param other - The interval to add
   */
  add(other: Interval): Interval {
    const newLower = this.lowerBound + other.lowerBound;
    const newUpper = this.upperBound + other.upperBound;

    // Result is closed if both operands have the same boundary at that end
    const lowerIncluded = this.isLowerIncluded() && other.isLowerIncluded();
    const upperIncluded = this.isUpperIncluded() && other.isUpperIncluded();

    let type: BoundaryType;
    if (lowerIncluded && upperIncluded) {
      type = BoundaryType.CLOSED;
    } else if (!lowerIncluded && !upperIncluded) {
      type = BoundaryType.OPEN;
    } else if (!lowerIncluded && upperIncluded) {
      type = BoundaryType.LEFT_OPEN;
    } else {
      type = BoundaryType.RIGHT_OPEN;
    }

    return new Interval(newLower, newUpper, type);
  }

  /**
   * Subtraction of intervals
   * [a, b] - [c, d] = [a - d, b - c]
   * @param other - The interval to subtract
   */
  subtract(other: Interval): Interval {
    const newLower = this.lowerBound - other.upperBound;
    const newUpper = this.upperBound - other.lowerBound;

    const lowerIncluded = this.isLowerIncluded() && other.isUpperIncluded();
    const upperIncluded = this.isUpperIncluded() && other.isLowerIncluded();

    let type: BoundaryType;
    if (lowerIncluded && upperIncluded) {
      type = BoundaryType.CLOSED;
    } else if (!lowerIncluded && !upperIncluded) {
      type = BoundaryType.OPEN;
    } else if (!lowerIncluded && upperIncluded) {
      type = BoundaryType.LEFT_OPEN;
    } else {
      type = BoundaryType.RIGHT_OPEN;
    }

    return new Interval(newLower, newUpper, type);
  }

  /**
   * Multiplication of intervals
   * Handles all combinations of signs
   * @param other - The interval to multiply
   */
  multiply(other: Interval): Interval {
    const corners = [
      this.lowerBound * other.lowerBound,
      this.lowerBound * other.upperBound,
      this.upperBound * other.lowerBound,
      this.upperBound * other.upperBound
    ];

    const newLower = Math.min(...corners);
    const newUpper = Math.max(...corners);

    // For simplicity, result is closed if both operands are closed
    const type = (this.boundaryType === BoundaryType.CLOSED &&
                  other.boundaryType === BoundaryType.CLOSED)
      ? BoundaryType.CLOSED
      : BoundaryType.OPEN;

    return new Interval(newLower, newUpper, type);
  }

  /**
   * Division of intervals
   * @param other - The interval to divide by
   */
  divide(other: Interval): Interval {
    if (other.contains(0)) {
      throw new Error('Cannot divide by interval containing zero');
    }

    const corners = [
      this.lowerBound / other.lowerBound,
      this.lowerBound / other.upperBound,
      this.upperBound / other.lowerBound,
      this.upperBound / other.upperBound
    ];

    const newLower = Math.min(...corners);
    const newUpper = Math.max(...corners);

    // For simplicity, result is closed if both operands are closed
    const type = (this.boundaryType === BoundaryType.CLOSED &&
                  other.boundaryType === BoundaryType.CLOSED)
      ? BoundaryType.CLOSED
      : BoundaryType.OPEN;

    return new Interval(newLower, newUpper, type);
  }

  /**
   * Scalar multiplication
   * @param scalar - The scalar to multiply by
   */
  scale(scalar: number): Interval {
    if (scalar >= 0) {
      return new Interval(
        this.lowerBound * scalar,
        this.upperBound * scalar,
        this.boundaryType
      );
    } else {
      // Negative scalar reverses the interval
      const lowerIncluded = this.isUpperIncluded();
      const upperIncluded = this.isLowerIncluded();

      let type: BoundaryType;
      if (lowerIncluded && upperIncluded) {
        type = BoundaryType.CLOSED;
      } else if (!lowerIncluded && !upperIncluded) {
        type = BoundaryType.OPEN;
      } else if (!lowerIncluded && upperIncluded) {
        type = BoundaryType.LEFT_OPEN;
      } else {
        type = BoundaryType.RIGHT_OPEN;
      }

      return new Interval(
        this.upperBound * scalar,
        this.lowerBound * scalar,
        type
      );
    }
  }

  /**
   * Returns the absolute value interval
   */
  abs(): Interval {
    if (this.lowerBound >= 0) {
      return this.clone();
    } else if (this.upperBound <= 0) {
      return new Interval(
        -this.upperBound,
        -this.lowerBound,
        this.boundaryType
      );
    } else {
      // Interval contains zero
      return new Interval(
        0,
        Math.max(-this.lowerBound, this.upperBound),
        BoundaryType.CLOSED
      );
    }
  }

  /**
   * Creates a copy of this interval
   */
  clone(): Interval {
    return new Interval(this.lowerBound, this.upperBound, this.boundaryType);
  }

  /**
   * Returns a string representation of the interval
   */
  toString(): string {
    const leftBracket = this.isLowerIncluded() ? '[' : '(';
    const rightBracket = this.isUpperIncluded() ? ']' : ')';
    return `${leftBracket}${this.lowerBound}, ${this.upperBound}${rightBracket}`;
  }

  /**
   * Converts the interval to an array [lower, upper]
   */
  toArray(): [number, number] {
    return [this.lowerBound, this.upperBound];
  }
}
