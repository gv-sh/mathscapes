/**
 * 2D Line and Line Segment operations
 *
 * Provides:
 * - Line and segment intersection detection
 * - Distance calculations
 * - Parallel/perpendicular tests
 * - Various line equation forms
 */

import { Point } from './point';

/**
 * Represents an infinite line in 2D space
 */
export class Line {
  /**
   * Create a line from two points
   *
   * @param p1 First point on the line
   * @param p2 Second point on the line
   */
  constructor(
    public readonly p1: Point,
    public readonly p2: Point
  ) {
    if (p1.equals(p2)) {
      throw new Error('Cannot create a line from two identical points');
    }
  }

  /**
   * Create a line from slope-intercept form: y = mx + b
   *
   * @param slope Line slope (m)
   * @param intercept Y-intercept (b)
   * @returns Line
   *
   * @example
   * Line.fromSlopeIntercept(2, 3); // y = 2x + 3
   */
  static fromSlopeIntercept(slope: number, intercept: number): Line {
    // Use two points on the line
    const p1 = new Point(0, intercept);
    const p2 = new Point(1, slope + intercept);
    return new Line(p1, p2);
  }

  /**
   * Create a line from point-slope form: y - y₁ = m(x - x₁)
   *
   * @param point A point on the line
   * @param slope Line slope
   * @returns Line
   */
  static fromPointSlope(point: Point, slope: number): Line {
    // Use the given point and another point one unit away
    const p2 = new Point(point.x + 1, point.y + slope);
    return new Line(point, p2);
  }

  /**
   * Create a line from general form: ax + by + c = 0
   *
   * @param a Coefficient of x
   * @param b Coefficient of y
   * @param c Constant term
   * @returns Line
   */
  static fromGeneralForm(a: number, b: number, c: number): Line {
    if (a === 0 && b === 0) {
      throw new Error('Invalid line equation: a and b cannot both be zero');
    }

    // Find two points on the line
    let p1: Point, p2: Point;

    if (b !== 0) {
      // Use x = 0 and x = 1
      p1 = new Point(0, -c / b);
      p2 = new Point(1, -(a + c) / b);
    } else {
      // Vertical line: x = -c/a
      const x = -c / a;
      p1 = new Point(x, 0);
      p2 = new Point(x, 1);
    }

    return new Line(p1, p2);
  }

  /**
   * Get the slope of this line
   * Returns Infinity for vertical lines
   *
   * @returns Slope
   */
  slope(): number {
    const dx = this.p2.x - this.p1.x;
    if (Math.abs(dx) < 1e-10) {
      return Infinity;
    }
    return (this.p2.y - this.p1.y) / dx;
  }

  /**
   * Get the y-intercept of this line
   * Returns null for vertical lines
   *
   * @returns Y-intercept or null for vertical lines
   */
  yIntercept(): number | null {
    const m = this.slope();
    if (!isFinite(m)) {
      return null;
    }
    return this.p1.y - m * this.p1.x;
  }

  /**
   * Get the x-intercept of this line
   * Returns null for horizontal lines
   *
   * @returns X-intercept or null for horizontal lines
   */
  xIntercept(): number | null {
    const m = this.slope();
    if (m === 0) {
      return null;
    }
    if (!isFinite(m)) {
      return this.p1.x;
    }
    const b = this.yIntercept()!;
    return -b / m;
  }

  /**
   * Get the general form coefficients: ax + by + c = 0
   *
   * @returns [a, b, c] coefficients
   */
  generalForm(): [number, number, number] {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;

    // Use the cross product form
    const a = dy;
    const b = -dx;
    const c = -(a * this.p1.x + b * this.p1.y);

    return [a, b, c];
  }

  /**
   * Check if this line is parallel to another line
   *
   * @param other The other line
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if lines are parallel
   */
  isParallelTo(other: Line, epsilon: number = 1e-10): boolean {
    const m1 = this.slope();
    const m2 = other.slope();

    // Both vertical
    if (!isFinite(m1) && !isFinite(m2)) {
      return true;
    }

    // One vertical, one not
    if (!isFinite(m1) || !isFinite(m2)) {
      return false;
    }

    return Math.abs(m1 - m2) < epsilon;
  }

  /**
   * Check if this line is perpendicular to another line
   *
   * @param other The other line
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if lines are perpendicular
   */
  isPerpendicularTo(other: Line, epsilon: number = 1e-10): boolean {
    const m1 = this.slope();
    const m2 = other.slope();

    // One vertical, one horizontal
    if (!isFinite(m1) && m2 === 0) {
      return true;
    }
    if (m1 === 0 && !isFinite(m2)) {
      return true;
    }

    // Neither vertical
    if (isFinite(m1) && isFinite(m2)) {
      return Math.abs(m1 * m2 + 1) < epsilon;
    }

    return false;
  }

  /**
   * Find the intersection point of this line with another line
   *
   * @param other The other line
   * @returns Intersection point or null if lines are parallel
   */
  intersect(other: Line): Point | null {
    const [a1, b1, c1] = this.generalForm();
    const [a2, b2, c2] = other.generalForm();

    const det = a1 * b2 - a2 * b1;

    // Lines are parallel or coincident
    if (Math.abs(det) < 1e-10) {
      return null;
    }

    const x = (b1 * c2 - b2 * c1) / det;
    const y = (a2 * c1 - a1 * c2) / det;

    return new Point(x, y);
  }

  /**
   * Calculate the distance from a point to this line
   * Uses the formula: |ax + by + c| / √(a² + b²)
   *
   * @param point The point
   * @returns Distance from point to line
   */
  distanceToPoint(point: Point): number {
    const [a, b, c] = this.generalForm();
    return Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);
  }

  /**
   * Find the closest point on this line to a given point
   *
   * @param point The point
   * @returns Closest point on the line
   */
  closestPoint(point: Point): Point {
    const [a, b, c] = this.generalForm();

    // Handle vertical line
    if (Math.abs(b) < 1e-10) {
      return new Point(-c / a, point.y);
    }

    // Handle horizontal line
    if (Math.abs(a) < 1e-10) {
      return new Point(point.x, -c / b);
    }

    // General case: find perpendicular from point to line
    // Perpendicular line has slope -1/m = -b/a
    const perpSlope = b / a;
    const perpLine = Line.fromPointSlope(point, perpSlope);

    return this.intersect(perpLine)!;
  }

  /**
   * Check if a point lies on this line
   *
   * @param point The point to check
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if point is on the line
   */
  contains(point: Point, epsilon: number = 1e-10): boolean {
    return this.distanceToPoint(point) < epsilon;
  }

  /**
   * Get the direction vector of this line (normalized)
   *
   * @returns Direction vector
   */
  direction(): Point {
    return this.p2.subtract(this.p1).normalize();
  }

  /**
   * Get the normal vector to this line (perpendicular, normalized)
   *
   * @returns Normal vector
   */
  normal(): Point {
    const dir = this.direction();
    return new Point(-dir.y, dir.x);
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    const [a, b, c] = this.generalForm();
    return `Line(${a.toFixed(2)}x + ${b.toFixed(2)}y + ${c.toFixed(2)} = 0)`;
  }
}

/**
 * Represents a line segment (finite portion of a line)
 */
export class Segment {
  /**
   * Create a line segment from two endpoints
   *
   * @param p1 First endpoint
   * @param p2 Second endpoint
   */
  constructor(
    public readonly p1: Point,
    public readonly p2: Point
  ) {
    if (p1.equals(p2)) {
      throw new Error('Cannot create a segment from two identical points');
    }
  }

  /**
   * Get the length of this segment
   *
   * @returns Segment length
   */
  length(): number {
    return this.p1.distanceTo(this.p2);
  }

  /**
   * Get the midpoint of this segment
   *
   * @returns Midpoint
   */
  midpoint(): Point {
    return this.p1.midpoint(this.p2);
  }

  /**
   * Get the infinite line containing this segment
   *
   * @returns Line
   */
  toLine(): Line {
    return new Line(this.p1, this.p2);
  }

  /**
   * Check if a point lies on this segment
   *
   * @param point The point to check
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if point is on the segment
   */
  contains(point: Point, epsilon: number = 1e-10): boolean {
    // Check if point is on the line
    const line = this.toLine();
    if (!line.contains(point, epsilon)) {
      return false;
    }

    // Check if point is between endpoints
    const minX = Math.min(this.p1.x, this.p2.x) - epsilon;
    const maxX = Math.max(this.p1.x, this.p2.x) + epsilon;
    const minY = Math.min(this.p1.y, this.p2.y) - epsilon;
    const maxY = Math.max(this.p1.y, this.p2.y) + epsilon;

    return point.x >= minX && point.x <= maxX &&
           point.y >= minY && point.y <= maxY;
  }

  /**
   * Calculate the distance from a point to this segment
   *
   * @param point The point
   * @returns Distance from point to segment
   */
  distanceToPoint(point: Point): number {
    const closestPoint = this.closestPoint(point);
    return point.distanceTo(closestPoint);
  }

  /**
   * Find the closest point on this segment to a given point
   *
   * @param point The point
   * @returns Closest point on the segment
   */
  closestPoint(point: Point): Point {
    const line = this.toLine();
    const lineClosest = line.closestPoint(point);

    // Check if the closest point on the line is within the segment
    if (this.contains(lineClosest)) {
      return lineClosest;
    }

    // Otherwise, return the closer endpoint
    const dist1 = point.distanceTo(this.p1);
    const dist2 = point.distanceTo(this.p2);

    return dist1 < dist2 ? this.p1 : this.p2;
  }

  /**
   * Check if this segment intersects another segment
   * Uses the orientation method for robust detection
   *
   * @param other The other segment
   * @returns True if segments intersect
   */
  intersects(other: Segment): boolean {
    return this.intersect(other) !== null;
  }

  /**
   * Find the intersection point of this segment with another segment
   *
   * @param other The other segment
   * @returns Intersection point or null if segments don't intersect
   */
  intersect(other: Segment): Point | null {
    // First check if the infinite lines intersect
    const line1 = this.toLine();
    const line2 = other.toLine();
    const lineIntersection = line1.intersect(line2);

    if (!lineIntersection) {
      return null; // Parallel or coincident lines
    }

    // Check if the intersection point is on both segments
    if (this.contains(lineIntersection) && other.contains(lineIntersection)) {
      return lineIntersection;
    }

    return null;
  }

  /**
   * Check if this segment intersects another segment using the orientation method
   * This is more robust than the algebraic method for edge cases
   *
   * @param other The other segment
   * @returns True if segments intersect
   */
  intersectsOrientation(other: Segment): boolean {
    /**
     * Find orientation of ordered triplet (p, q, r)
     * Returns:
     *   0 -> p, q, r are collinear
     *   1 -> Clockwise
     *   2 -> Counterclockwise
     */
    function orientation(p: Point, q: Point, r: Point): number {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
      if (Math.abs(val) < 1e-10) return 0;
      return val > 0 ? 1 : 2;
    }

    /**
     * Check if point q lies on segment pr (given they are collinear)
     */
    function onSegment(p: Point, q: Point, r: Point): boolean {
      return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
             q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }

    const o1 = orientation(this.p1, this.p2, other.p1);
    const o2 = orientation(this.p1, this.p2, other.p2);
    const o3 = orientation(other.p1, other.p2, this.p1);
    const o4 = orientation(other.p1, other.p2, this.p2);

    // General case
    if (o1 !== o2 && o3 !== o4) {
      return true;
    }

    // Special cases (collinear points)
    if (o1 === 0 && onSegment(this.p1, other.p1, this.p2)) return true;
    if (o2 === 0 && onSegment(this.p1, other.p2, this.p2)) return true;
    if (o3 === 0 && onSegment(other.p1, this.p1, other.p2)) return true;
    if (o4 === 0 && onSegment(other.p1, this.p2, other.p2)) return true;

    return false;
  }

  /**
   * Get the direction vector of this segment (normalized)
   *
   * @returns Direction vector
   */
  direction(): Point {
    return this.p2.subtract(this.p1).normalize();
  }

  /**
   * Get the normal vector to this segment (perpendicular, normalized)
   *
   * @returns Normal vector
   */
  normal(): Point {
    const dir = this.direction();
    return new Point(-dir.y, dir.x);
  }

  /**
   * Interpolate along the segment
   *
   * @param t Parameter (0 = p1, 1 = p2)
   * @returns Point at parameter t
   */
  pointAt(t: number): Point {
    return this.p1.lerp(this.p2, t);
  }

  /**
   * Reverse this segment (swap endpoints)
   *
   * @returns Reversed segment
   */
  reverse(): Segment {
    return new Segment(this.p2, this.p1);
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `Segment(${this.p1.toString()} -> ${this.p2.toString()})`;
  }
}
