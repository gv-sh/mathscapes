/**
 * B-Spline and NURBS Implementation
 *
 * B-splines (Basis splines) are a generalization of Bezier curves that provide
 * local control and smooth interpolation. NURBS (Non-Uniform Rational B-Splines)
 * extend B-splines to include rational functions and weights.
 *
 * Features:
 * - Uniform and non-uniform B-splines
 * - Clamped and periodic knot vectors
 * - NURBS curves with weights
 * - 2D and 3D curves
 * - Derivative evaluation
 *
 * References:
 * - "The NURBS Book" by Piegl and Tiller
 * - "Curves and Surfaces for CAGD" by Farin
 */

/**
 * 2D point type
 */
export interface Point2D {
    x: number;
    y: number;
}

/**
 * 3D point type
 */
export interface Point3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Generate a uniform clamped knot vector
 *
 * A clamped knot vector has multiplicity p+1 at the ends,
 * making the curve interpolate the first and last control points.
 *
 * @param n - Number of control points
 * @param p - Degree of the B-spline
 * @returns Knot vector
 *
 * @example
 * ```ts
 * const knots = generateClampedKnotVector(5, 3);
 * // [0, 0, 0, 0, 1, 2, 2, 2, 2]
 * ```
 */
export function generateClampedKnotVector(n: number, p: number): number[] {
    const m = n + p + 1; // Number of knots = n + p + 1
    const knots: number[] = new Array(m);

    // First p+1 knots are 0
    for (let i = 0; i <= p; i++) {
        knots[i] = 0;
    }

    // Middle knots are uniformly spaced
    for (let i = p + 1; i < n; i++) {
        knots[i] = i - p;
    }

    // Last p+1 knots are n-p
    for (let i = n; i < m; i++) {
        knots[i] = n - p;
    }

    return knots;
}

/**
 * Generate a uniform open knot vector
 *
 * @param n - Number of control points
 * @param p - Degree of the B-spline
 * @returns Knot vector
 */
export function generateUniformKnotVector(n: number, p: number): number[] {
    const m = n + p + 1;
    const knots: number[] = new Array(m);

    for (let i = 0; i < m; i++) {
        knots[i] = i;
    }

    return knots;
}

/**
 * Evaluate B-spline basis function N_{i,p}(t)
 * Uses Cox-de Boor recursion formula
 *
 * @param i - Basis function index
 * @param p - Degree
 * @param t - Parameter value
 * @param knots - Knot vector
 * @returns Basis function value
 */
export function basisFunction(i: number, p: number, t: number, knots: number[]): number {
    // Base case: degree 0
    if (p === 0) {
        return (t >= knots[i] && t < knots[i + 1]) ? 1.0 : 0.0;
    }

    // Recursive case
    let left = 0.0;
    let right = 0.0;

    const denom1 = knots[i + p] - knots[i];
    if (denom1 !== 0) {
        left = ((t - knots[i]) / denom1) * basisFunction(i, p - 1, t, knots);
    }

    const denom2 = knots[i + p + 1] - knots[i + 1];
    if (denom2 !== 0) {
        right = ((knots[i + p + 1] - t) / denom2) * basisFunction(i + 1, p - 1, t, knots);
    }

    return left + right;
}

/**
 * Evaluate B-spline curve at parameter t
 *
 * @param t - Parameter value (should be in range [knots[p], knots[n]])
 * @param controlPoints - Array of 1D control points
 * @param p - Degree of the B-spline
 * @param knots - Knot vector (optional, will generate clamped if not provided)
 * @returns Interpolated value
 *
 * @example
 * ```ts
 * const points = [0, 1, 2, 1, 0];
 * const curve = bspline(0.5, points, 2);
 * ```
 */
export function bspline(
    t: number,
    controlPoints: number[],
    p: number,
    knots?: number[]
): number {
    const n = controlPoints.length;

    // Generate default knot vector if not provided
    if (!knots) {
        knots = generateClampedKnotVector(n, p);
    }

    // Clamp t to valid range
    const tMin = knots[p];
    const tMax = knots[n];
    t = Math.max(tMin, Math.min(tMax, t));

    // Handle edge case at end of curve
    if (t === tMax) {
        t = tMax - 1e-10;
    }

    let result = 0;
    for (let i = 0; i < n; i++) {
        const basis = basisFunction(i, p, t, knots);
        result += controlPoints[i] * basis;
    }

    return result;
}

/**
 * Evaluate 2D B-spline curve at parameter t
 *
 * @param t - Parameter value
 * @param controlPoints - Array of 2D control points
 * @param p - Degree of the B-spline
 * @param knots - Knot vector (optional)
 * @returns Interpolated 2D point
 *
 * @example
 * ```ts
 * const points = [
 *   { x: 0, y: 0 },
 *   { x: 1, y: 2 },
 *   { x: 2, y: 1 },
 *   { x: 3, y: 0 }
 * ];
 * const point = bspline2D(0.5, points, 2);
 * ```
 */
export function bspline2D(
    t: number,
    controlPoints: Point2D[],
    p: number,
    knots?: number[]
): Point2D {
    const n = controlPoints.length;

    if (!knots) {
        knots = generateClampedKnotVector(n, p);
    }

    const tMin = knots[p];
    const tMax = knots[n];
    t = Math.max(tMin, Math.min(tMax, t));

    if (t === tMax) {
        t = tMax - 1e-10;
    }

    let x = 0;
    let y = 0;

    for (let i = 0; i < n; i++) {
        const basis = basisFunction(i, p, t, knots);
        x += controlPoints[i].x * basis;
        y += controlPoints[i].y * basis;
    }

    return { x, y };
}

/**
 * Evaluate 3D B-spline curve at parameter t
 *
 * @param t - Parameter value
 * @param controlPoints - Array of 3D control points
 * @param p - Degree of the B-spline
 * @param knots - Knot vector (optional)
 * @returns Interpolated 3D point
 */
export function bspline3D(
    t: number,
    controlPoints: Point3D[],
    p: number,
    knots?: number[]
): Point3D {
    const n = controlPoints.length;

    if (!knots) {
        knots = generateClampedKnotVector(n, p);
    }

    const tMin = knots[p];
    const tMax = knots[n];
    t = Math.max(tMin, Math.min(tMax, t));

    if (t === tMax) {
        t = tMax - 1e-10;
    }

    let x = 0;
    let y = 0;
    let z = 0;

    for (let i = 0; i < n; i++) {
        const basis = basisFunction(i, p, t, knots);
        x += controlPoints[i].x * basis;
        y += controlPoints[i].y * basis;
        z += controlPoints[i].z * basis;
    }

    return { x, y, z };
}

/**
 * Evaluate NURBS (Non-Uniform Rational B-Spline) curve
 *
 * NURBS extend B-splines by introducing weights, allowing representation
 * of exact conics (circles, ellipses) and providing additional shape control.
 *
 * @param t - Parameter value
 * @param controlPoints - Array of 1D control points
 * @param weights - Weight for each control point
 * @param p - Degree of the NURBS
 * @param knots - Knot vector (optional)
 * @returns Interpolated value
 *
 * @example
 * ```ts
 * const points = [0, 1, 2, 1, 0];
 * const weights = [1, 2, 1, 2, 1]; // Middle points have higher weight
 * const curve = nurbs(0.5, points, weights, 2);
 * ```
 */
export function nurbs(
    t: number,
    controlPoints: number[],
    weights: number[],
    p: number,
    knots?: number[]
): number {
    const n = controlPoints.length;

    if (weights.length !== n) {
        throw new Error('Number of weights must match number of control points');
    }

    if (!knots) {
        knots = generateClampedKnotVector(n, p);
    }

    const tMin = knots[p];
    const tMax = knots[n];
    t = Math.max(tMin, Math.min(tMax, t));

    if (t === tMax) {
        t = tMax - 1e-10;
    }

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
        const basis = basisFunction(i, p, t, knots);
        const weighted = basis * weights[i];
        numerator += controlPoints[i] * weighted;
        denominator += weighted;
    }

    return numerator / denominator;
}

/**
 * Evaluate 2D NURBS curve
 *
 * @param t - Parameter value
 * @param controlPoints - Array of 2D control points
 * @param weights - Weight for each control point
 * @param p - Degree of the NURBS
 * @param knots - Knot vector (optional)
 * @returns Interpolated 2D point
 *
 * @example
 * ```ts
 * // Create a circular arc using NURBS
 * const points = [
 *   { x: 1, y: 0 },
 *   { x: 1, y: 1 },
 *   { x: 0, y: 1 }
 * ];
 * const weights = [1, Math.SQRT1_2, 1]; // Special weights for circular arc
 * const arc = nurbs2D(0.5, points, weights, 2);
 * ```
 */
export function nurbs2D(
    t: number,
    controlPoints: Point2D[],
    weights: number[],
    p: number,
    knots?: number[]
): Point2D {
    const n = controlPoints.length;

    if (weights.length !== n) {
        throw new Error('Number of weights must match number of control points');
    }

    if (!knots) {
        knots = generateClampedKnotVector(n, p);
    }

    const tMin = knots[p];
    const tMax = knots[n];
    t = Math.max(tMin, Math.min(tMax, t));

    if (t === tMax) {
        t = tMax - 1e-10;
    }

    let xNum = 0, yNum = 0;
    let denom = 0;

    for (let i = 0; i < n; i++) {
        const basis = basisFunction(i, p, t, knots);
        const weighted = basis * weights[i];
        xNum += controlPoints[i].x * weighted;
        yNum += controlPoints[i].y * weighted;
        denom += weighted;
    }

    return { x: xNum / denom, y: yNum / denom };
}

/**
 * Evaluate 3D NURBS curve
 *
 * @param t - Parameter value
 * @param controlPoints - Array of 3D control points
 * @param weights - Weight for each control point
 * @param p - Degree of the NURBS
 * @param knots - Knot vector (optional)
 * @returns Interpolated 3D point
 */
export function nurbs3D(
    t: number,
    controlPoints: Point3D[],
    weights: number[],
    p: number,
    knots?: number[]
): Point3D {
    const n = controlPoints.length;

    if (weights.length !== n) {
        throw new Error('Number of weights must match number of control points');
    }

    if (!knots) {
        knots = generateClampedKnotVector(n, p);
    }

    const tMin = knots[p];
    const tMax = knots[n];
    t = Math.max(tMin, Math.min(tMax, t));

    if (t === tMax) {
        t = tMax - 1e-10;
    }

    let xNum = 0, yNum = 0, zNum = 0;
    let denom = 0;

    for (let i = 0; i < n; i++) {
        const basis = basisFunction(i, p, t, knots);
        const weighted = basis * weights[i];
        xNum += controlPoints[i].x * weighted;
        yNum += controlPoints[i].y * weighted;
        zNum += controlPoints[i].z * weighted;
        denom += weighted;
    }

    return { x: xNum / denom, y: yNum / denom, z: zNum / denom };
}

/**
 * Evaluate B-spline derivative
 *
 * @param t - Parameter value
 * @param controlPoints - Array of control points
 * @param p - Degree of the B-spline
 * @param knots - Knot vector (optional)
 * @param order - Derivative order (1 for first derivative, 2 for second, etc.)
 * @returns Derivative value
 */
export function bsplineDerivative(
    t: number,
    controlPoints: number[],
    p: number,
    knots?: number[],
    order: number = 1
): number {
    if (order === 0) {
        return bspline(t, controlPoints, p, knots);
    }

    const n = controlPoints.length;
    if (!knots) {
        knots = generateClampedKnotVector(n, p);
    }

    if (p === 0) {
        return 0;
    }

    // Compute control points for derivative curve
    const derivControlPoints: number[] = new Array(n - 1);
    for (let i = 0; i < n - 1; i++) {
        const denom = knots[i + p + 1] - knots[i + 1];
        if (denom !== 0) {
            derivControlPoints[i] = p * (controlPoints[i + 1] - controlPoints[i]) / denom;
        } else {
            derivControlPoints[i] = 0;
        }
    }

    // Recursively compute higher derivatives
    return bsplineDerivative(t, derivControlPoints, p - 1, knots, order - 1);
}
