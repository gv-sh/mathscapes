/**
 * Bezier Curve Functions
 *
 * Provides Bezier curve interpolation for smooth parametric curves.
 * Bezier curves are fundamental in computer graphics, animation, and design.
 *
 * Applications:
 * - Vector graphics (SVG paths)
 * - Animation easing functions
 * - Font glyph design
 * - CAD/CAM systems
 * - Motion paths
 *
 * Reference: Pierre Bézier, "Numerical Control - Mathematics and Applications" (1972)
 */

/**
 * Point in 2D space
 */
export interface Point2D {
    x: number;
    y: number;
}

/**
 * Point in 3D space
 */
export interface Point3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Calculate binomial coefficient (n choose k)
 * Used in Bernstein polynomial calculation
 */
function binomial(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;

    let result = 1;
    for (let i = 1; i <= k; i++) {
        result *= (n - i + 1) / i;
    }
    return result;
}

/**
 * Bernstein polynomial basis function
 *
 * @param n - Degree of the polynomial
 * @param i - Index of the basis function
 * @param t - Parameter [0, 1]
 * @returns Bernstein polynomial value
 */
export function bernstein(n: number, i: number, t: number): number {
    return binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

/**
 * Linear Bezier curve (degree 1)
 * Simply linear interpolation between two points
 *
 * @param p0 - Start value
 * @param p1 - End value
 * @param t - Parameter [0, 1]
 * @returns Interpolated value
 */
export function linearBezier(p0: number, p1: number, t: number): number {
    return (1 - t) * p0 + t * p1;
}

/**
 * Quadratic Bezier curve (degree 2)
 * Creates a smooth curve through three control points
 *
 * @param p0 - Start point
 * @param p1 - Control point
 * @param p2 - End point
 * @param t - Parameter [0, 1]
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * quadraticBezier(0, 5, 10, 0.5); // Curved path from 0 to 10
 * ```
 */
export function quadraticBezier(p0: number, p1: number, p2: number, t: number): number {
    const u = 1 - t;
    return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

/**
 * Cubic Bezier curve (degree 3)
 * Creates a smooth curve through four control points
 * Most commonly used Bezier curve in graphics
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param t - Parameter [0, 1]
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * cubicBezier(0, 2, 8, 10, 0.5); // S-curve from 0 to 10
 * ```
 */
export function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/**
 * General Bezier curve of arbitrary degree
 * Uses De Casteljau's algorithm for numerical stability
 *
 * @param points - Control points
 * @param t - Parameter [0, 1]
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * bezier([0, 1, 3, 5, 10], 0.5); // 5th degree Bezier
 * ```
 */
export function bezier(points: number[], t: number): number {
    if (points.length === 0) {
        throw new Error('Bezier curve requires at least one control point');
    }
    if (points.length === 1) {
        return points[0];
    }

    // De Casteljau's algorithm
    let temp = [...points];
    const n = points.length - 1;

    for (let j = 1; j <= n; j++) {
        for (let i = 0; i <= n - j; i++) {
            temp[i] = (1 - t) * temp[i] + t * temp[i + 1];
        }
    }

    return temp[0];
}

/**
 * Quadratic Bezier curve in 2D
 *
 * @param p0 - Start point
 * @param p1 - Control point
 * @param p2 - End point
 * @param t - Parameter [0, 1]
 * @returns Interpolated 2D point
 */
export function quadraticBezier2D(p0: Point2D, p1: Point2D, p2: Point2D, t: number): Point2D {
    return {
        x: quadraticBezier(p0.x, p1.x, p2.x, t),
        y: quadraticBezier(p0.y, p1.y, p2.y, t)
    };
}

/**
 * Cubic Bezier curve in 2D
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param t - Parameter [0, 1]
 * @returns Interpolated 2D point
 */
export function cubicBezier2D(p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, t: number): Point2D {
    return {
        x: cubicBezier(p0.x, p1.x, p2.x, p3.x, t),
        y: cubicBezier(p0.y, p1.y, p2.y, p3.y, t)
    };
}

/**
 * General Bezier curve in 2D
 *
 * @param points - Array of 2D control points
 * @param t - Parameter [0, 1]
 * @returns Interpolated 2D point
 */
export function bezier2D(points: Point2D[], t: number): Point2D {
    if (points.length === 0) {
        throw new Error('Bezier curve requires at least one control point');
    }

    return {
        x: bezier(points.map(p => p.x), t),
        y: bezier(points.map(p => p.y), t)
    };
}

/**
 * Cubic Bezier curve in 3D
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param t - Parameter [0, 1]
 * @returns Interpolated 3D point
 */
export function cubicBezier3D(p0: Point3D, p1: Point3D, p2: Point3D, p3: Point3D, t: number): Point3D {
    return {
        x: cubicBezier(p0.x, p1.x, p2.x, p3.x, t),
        y: cubicBezier(p0.y, p1.y, p2.y, p3.y, t),
        z: cubicBezier(p0.z, p1.z, p2.z, p3.z, t)
    };
}

/**
 * General Bezier curve in 3D
 *
 * @param points - Array of 3D control points
 * @param t - Parameter [0, 1]
 * @returns Interpolated 3D point
 */
export function bezier3D(points: Point3D[], t: number): Point3D {
    if (points.length === 0) {
        throw new Error('Bezier curve requires at least one control point');
    }

    return {
        x: bezier(points.map(p => p.x), t),
        y: bezier(points.map(p => p.y), t),
        z: bezier(points.map(p => p.z), t)
    };
}

/**
 * Calculate derivative of cubic Bezier curve
 * Useful for finding tangent vectors
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param t - Parameter [0, 1]
 * @returns Derivative value (tangent)
 */
export function cubicBezierDerivative(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const u = 1 - t;
    return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

/**
 * Calculate second derivative of cubic Bezier curve
 * Useful for finding curvature
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param t - Parameter [0, 1]
 * @returns Second derivative value
 */
export function cubicBezierSecondDerivative(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const u = 1 - t;
    return 6 * u * (p2 - 2 * p1 + p0) + 6 * t * (p3 - 2 * p2 + p1);
}

/**
 * Split a cubic Bezier curve at parameter t
 * Returns two cubic Bezier curves that together form the original
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param t - Split parameter [0, 1]
 * @returns Two sets of control points [left curve, right curve]
 */
export function splitCubicBezier(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
): [[number, number, number, number], [number, number, number, number]] {
    // De Casteljau's algorithm for subdivision
    const p01 = linearBezier(p0, p1, t);
    const p12 = linearBezier(p1, p2, t);
    const p23 = linearBezier(p2, p3, t);

    const p012 = linearBezier(p01, p12, t);
    const p123 = linearBezier(p12, p23, t);

    const p0123 = linearBezier(p012, p123, t);

    return [
        [p0, p01, p012, p0123],
        [p0123, p123, p23, p3]
    ];
}

/**
 * Calculate approximate arc length of cubic Bezier curve
 * Uses adaptive subdivision for accuracy
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param segments - Number of segments for approximation (default: 10)
 * @returns Approximate arc length
 */
export function cubicBezierLength(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    segments: number = 10
): number {
    let length = 0;
    let prevPoint = p0;

    for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const point = cubicBezier(p0, p1, p2, p3, t);
        length += Math.abs(point - prevPoint);
        prevPoint = point;
    }

    return length;
}

/**
 * Find t parameter for a given arc length along cubic Bezier curve
 * Uses binary search for efficiency
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param targetLength - Target arc length
 * @param tolerance - Tolerance for binary search (default: 0.001)
 * @returns Parameter t corresponding to target length
 */
export function cubicBezierParameterAtLength(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    targetLength: number,
    tolerance: number = 0.001
): number {
    const totalLength = cubicBezierLength(p0, p1, p2, p3);

    if (targetLength <= 0) return 0;
    if (targetLength >= totalLength) return 1;

    // Binary search
    let tMin = 0;
    let tMax = 1;

    while (tMax - tMin > tolerance) {
        const tMid = (tMin + tMax) / 2;
        const [left] = splitCubicBezier(p0, p1, p2, p3, tMid);
        const length = cubicBezierLength(left[0], left[1], left[2], left[3]);

        if (length < targetLength) {
            tMin = tMid;
        } else {
            tMax = tMid;
        }
    }

    return (tMin + tMax) / 2;
}

/**
 * Elevate degree of Bezier curve (convert to higher degree)
 * A degree n curve can be represented as a degree n+1 curve
 *
 * @param points - Control points
 * @returns Control points for elevated curve
 */
export function elevateBezierDegree(points: number[]): number[] {
    const n = points.length - 1;
    const elevated: number[] = new Array(n + 2);

    elevated[0] = points[0];
    elevated[n + 1] = points[n];

    for (let i = 1; i <= n; i++) {
        elevated[i] = (i / (n + 1)) * points[i - 1] + (1 - i / (n + 1)) * points[i];
    }

    return elevated;
}
