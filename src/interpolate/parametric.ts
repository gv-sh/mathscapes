/**
 * Parametric Curves Module
 *
 * Provides tools for working with parametric curves, including arc length calculation,
 * point at distance, curvature, and torsion.
 *
 * A parametric curve is defined by functions:
 * - 2D: r(t) = (x(t), y(t))
 * - 3D: r(t) = (x(t), y(t), z(t))
 *
 * Applications:
 * - Computer graphics and animation
 * - Robotics and path planning
 * - Physics simulations
 * - CAD/CAM systems
 *
 * References:
 * - "Differential Geometry of Curves and Surfaces" by Manfredo P. do Carmo
 * - "Computer Graphics: Principles and Practice" by Foley et al.
 */

import { Point2D, Point3D } from './bezier';

/**
 * Parametric curve function in 2D
 */
export type ParametricCurve2D = (t: number) => Point2D;

/**
 * Parametric curve function in 3D
 */
export type ParametricCurve3D = (t: number) => Point3D;

/**
 * Calculate arc length of a 2D parametric curve using adaptive Simpson's rule
 *
 * Arc length formula: L = ∫√(x'(t)² + y'(t)²) dt
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param tolerance - Tolerance for adaptive integration (default: 1e-6)
 * @returns Arc length
 *
 * @example
 * ```typescript
 * // Circle of radius 1: r(t) = (cos(t), sin(t))
 * const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
 * const circumference = arcLength2D(circle, 0, 2 * Math.PI); // ≈ 6.283
 * ```
 */
export function arcLength2D(
    curve: ParametricCurve2D,
    t0: number,
    t1: number,
    tolerance: number = 1e-6
): number {
    const derivative = (t: number): number => {
        const h = 1e-6;
        const p1 = curve(t - h);
        const p2 = curve(t + h);
        const dx = (p2.x - p1.x) / (2 * h);
        const dy = (p2.y - p1.y) / (2 * h);
        return Math.sqrt(dx * dx + dy * dy);
    };

    return adaptiveSimpson(derivative, t0, t1, tolerance);
}

/**
 * Calculate arc length of a 3D parametric curve using adaptive Simpson's rule
 *
 * Arc length formula: L = ∫√(x'(t)² + y'(t)² + z'(t)²) dt
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param tolerance - Tolerance for adaptive integration (default: 1e-6)
 * @returns Arc length
 *
 * @example
 * ```typescript
 * // Helix: r(t) = (cos(t), sin(t), t)
 * const helix = (t: number) => ({ x: Math.cos(t), y: Math.sin(t), z: t });
 * const length = arcLength3D(helix, 0, 2 * Math.PI);
 * ```
 */
export function arcLength3D(
    curve: ParametricCurve3D,
    t0: number,
    t1: number,
    tolerance: number = 1e-6
): number {
    const derivative = (t: number): number => {
        const h = 1e-6;
        const p1 = curve(t - h);
        const p2 = curve(t + h);
        const dx = (p2.x - p1.x) / (2 * h);
        const dy = (p2.y - p1.y) / (2 * h);
        const dz = (p2.z - p1.z) / (2 * h);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    return adaptiveSimpson(derivative, t0, t1, tolerance);
}

/**
 * Find parameter t for a given arc length along a 2D curve
 * Uses bisection method for robustness
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param targetLength - Target arc length from t0
 * @param tolerance - Tolerance for bisection (default: 1e-6)
 * @returns Parameter t corresponding to target length
 *
 * @example
 * ```typescript
 * const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
 * const t = parameterAtLength2D(circle, 0, 2 * Math.PI, Math.PI); // t ≈ π
 * ```
 */
export function parameterAtLength2D(
    curve: ParametricCurve2D,
    t0: number,
    t1: number,
    targetLength: number,
    tolerance: number = 1e-6
): number {
    const totalLength = arcLength2D(curve, t0, t1);

    if (targetLength <= 0) return t0;
    if (targetLength >= totalLength) return t1;

    // Bisection method
    let tMin = t0;
    let tMax = t1;

    while (tMax - tMin > tolerance) {
        const tMid = (tMin + tMax) / 2;
        const length = arcLength2D(curve, t0, tMid);

        if (length < targetLength) {
            tMin = tMid;
        } else {
            tMax = tMid;
        }
    }

    return (tMin + tMax) / 2;
}

/**
 * Find parameter t for a given arc length along a 3D curve
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param targetLength - Target arc length from t0
 * @param tolerance - Tolerance for bisection (default: 1e-6)
 * @returns Parameter t corresponding to target length
 */
export function parameterAtLength3D(
    curve: ParametricCurve3D,
    t0: number,
    t1: number,
    targetLength: number,
    tolerance: number = 1e-6
): number {
    const totalLength = arcLength3D(curve, t0, t1);

    if (targetLength <= 0) return t0;
    if (targetLength >= totalLength) return t1;

    // Bisection method
    let tMin = t0;
    let tMax = t1;

    while (tMax - tMin > tolerance) {
        const tMid = (tMin + tMax) / 2;
        const length = arcLength3D(curve, t0, tMid);

        if (length < targetLength) {
            tMin = tMid;
        } else {
            tMax = tMid;
        }
    }

    return (tMin + tMax) / 2;
}

/**
 * Get point at specified distance along a 2D curve
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param distance - Distance along curve from t0
 * @param tolerance - Tolerance for parameter search (default: 1e-6)
 * @returns Point at specified distance
 *
 * @example
 * ```typescript
 * const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
 * const point = pointAtDistance2D(circle, 0, 2 * Math.PI, Math.PI);
 * // Point halfway around the circle
 * ```
 */
export function pointAtDistance2D(
    curve: ParametricCurve2D,
    t0: number,
    t1: number,
    distance: number,
    tolerance: number = 1e-6
): Point2D {
    const t = parameterAtLength2D(curve, t0, t1, distance, tolerance);
    return curve(t);
}

/**
 * Get point at specified distance along a 3D curve
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param distance - Distance along curve from t0
 * @param tolerance - Tolerance for parameter search (default: 1e-6)
 * @returns Point at specified distance
 */
export function pointAtDistance3D(
    curve: ParametricCurve3D,
    t0: number,
    t1: number,
    distance: number,
    tolerance: number = 1e-6
): Point3D {
    const t = parameterAtLength3D(curve, t0, t1, distance, tolerance);
    return curve(t);
}

/**
 * Calculate curvature of a 2D parametric curve at parameter t
 *
 * Curvature formula: κ = |x'y'' - y'x''| / (x'² + y'²)^(3/2)
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @param h - Step size for numerical differentiation (default: 1e-6)
 * @returns Curvature value (unsigned)
 *
 * @example
 * ```typescript
 * const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
 * const k = curvature2D(circle, 0); // k = 1 for unit circle
 * ```
 */
export function curvature2D(
    curve: ParametricCurve2D,
    t: number,
    h: number = 1e-6
): number {
    // First derivatives
    const p0 = curve(t);
    const p1 = curve(t + h);
    const p_1 = curve(t - h);

    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);

    // Second derivatives
    const ddx = (p1.x - 2 * p0.x + p_1.x) / (h * h);
    const ddy = (p1.y - 2 * p0.y + p_1.y) / (h * h);

    const numerator = Math.abs(dx * ddy - dy * ddx);
    const denominator = Math.pow(dx * dx + dy * dy, 1.5);

    return denominator > 1e-10 ? numerator / denominator : 0;
}

/**
 * Calculate signed curvature of a 2D parametric curve at parameter t
 * Positive for counter-clockwise curves, negative for clockwise
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @param h - Step size for numerical differentiation (default: 1e-6)
 * @returns Signed curvature value
 */
export function signedCurvature2D(
    curve: ParametricCurve2D,
    t: number,
    h: number = 1e-6
): number {
    // First derivatives
    const p0 = curve(t);
    const p1 = curve(t + h);
    const p_1 = curve(t - h);

    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);

    // Second derivatives
    const ddx = (p1.x - 2 * p0.x + p_1.x) / (h * h);
    const ddy = (p1.y - 2 * p0.y + p_1.y) / (h * h);

    const numerator = dx * ddy - dy * ddx;
    const denominator = Math.pow(dx * dx + dy * dy, 1.5);

    return denominator > 1e-10 ? numerator / denominator : 0;
}

/**
 * Calculate curvature of a 3D parametric curve at parameter t
 *
 * Curvature formula: κ = |r' × r''| / |r'|³
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @param h - Step size for numerical differentiation (default: 1e-6)
 * @returns Curvature value
 *
 * @example
 * ```typescript
 * const helix = (t: number) => ({ x: Math.cos(t), y: Math.sin(t), z: t });
 * const k = curvature3D(helix, 0);
 * ```
 */
export function curvature3D(
    curve: ParametricCurve3D,
    t: number,
    h: number = 1e-6
): number {
    // First derivatives (r')
    const p0 = curve(t);
    const p1 = curve(t + h);
    const p_1 = curve(t - h);

    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);
    const dz = (p1.z - p_1.z) / (2 * h);

    // Second derivatives (r'')
    const ddx = (p1.x - 2 * p0.x + p_1.x) / (h * h);
    const ddy = (p1.y - 2 * p0.y + p_1.y) / (h * h);
    const ddz = (p1.z - 2 * p0.z + p_1.z) / (h * h);

    // Cross product r' × r''
    const crossX = dy * ddz - dz * ddy;
    const crossY = dz * ddx - dx * ddz;
    const crossZ = dx * ddy - dy * ddx;

    const crossMagnitude = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
    const velocityMagnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return velocityMagnitude > 1e-10 ? crossMagnitude / Math.pow(velocityMagnitude, 3) : 0;
}

/**
 * Calculate torsion of a 3D parametric curve at parameter t
 *
 * Torsion measures how much a curve twists out of its osculating plane.
 * Formula: τ = (r' × r'') · r''' / |r' × r''|²
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @param h - Step size for numerical differentiation (default: 1e-5)
 * @returns Torsion value
 *
 * @example
 * ```typescript
 * const helix = (t: number) => ({ x: Math.cos(t), y: Math.sin(t), z: 0.1 * t });
 * const tau = torsion3D(helix, Math.PI / 4);
 * ```
 */
export function torsion3D(
    curve: ParametricCurve3D,
    t: number,
    h: number = 1e-5
): number {
    // First derivatives (r')
    const p0 = curve(t);
    const p1 = curve(t + h);
    const p_1 = curve(t - h);

    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);
    const dz = (p1.z - p_1.z) / (2 * h);

    // Second derivatives (r'')
    const ddx = (p1.x - 2 * p0.x + p_1.x) / (h * h);
    const ddy = (p1.y - 2 * p0.y + p_1.y) / (h * h);
    const ddz = (p1.z - 2 * p0.z + p_1.z) / (h * h);

    // Third derivatives (r''')
    const p2 = curve(t + 2 * h);
    const p_2 = curve(t - 2 * h);
    const dddx = (p2.x - 2 * p1.x + 2 * p_1.x - p_2.x) / (2 * h * h * h);
    const dddy = (p2.y - 2 * p1.y + 2 * p_1.y - p_2.y) / (2 * h * h * h);
    const dddz = (p2.z - 2 * p1.z + 2 * p_1.z - p_2.z) / (2 * h * h * h);

    // Cross product r' × r''
    const crossX = dy * ddz - dz * ddy;
    const crossY = dz * ddx - dx * ddz;
    const crossZ = dx * ddy - dy * ddx;

    const crossMagnitudeSquared = crossX * crossX + crossY * crossY + crossZ * crossZ;

    if (crossMagnitudeSquared < 1e-10) {
        return 0; // Curve is nearly straight
    }

    // Scalar triple product (r' × r'') · r'''
    const tripleProduct = crossX * dddx + crossY * dddy + crossZ * dddz;

    return tripleProduct / crossMagnitudeSquared;
}

/**
 * Find the tangent vector to a 2D curve at parameter t
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @param h - Step size for numerical differentiation (default: 1e-6)
 * @returns Normalized tangent vector
 */
export function tangent2D(
    curve: ParametricCurve2D,
    t: number,
    h: number = 1e-6
): Point2D {
    const p1 = curve(t + h);
    const p_1 = curve(t - h);

    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);

    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude < 1e-10) {
        return { x: 0, y: 0 };
    }

    return {
        x: dx / magnitude,
        y: dy / magnitude
    };
}

/**
 * Find the tangent vector to a 3D curve at parameter t
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @param h - Step size for numerical differentiation (default: 1e-6)
 * @returns Normalized tangent vector
 */
export function tangent3D(
    curve: ParametricCurve3D,
    t: number,
    h: number = 1e-6
): Point3D {
    const p1 = curve(t + h);
    const p_1 = curve(t - h);

    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);
    const dz = (p1.z - p_1.z) / (2 * h);

    const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (magnitude < 1e-10) {
        return { x: 0, y: 0, z: 0 };
    }

    return {
        x: dx / magnitude,
        y: dy / magnitude,
        z: dz / magnitude
    };
}

/**
 * Find the normal vector to a 2D curve at parameter t
 * (perpendicular to the tangent, pointing left)
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @param h - Step size for numerical differentiation (default: 1e-6)
 * @returns Normalized normal vector
 */
export function normal2D(
    curve: ParametricCurve2D,
    t: number,
    h: number = 1e-6
): Point2D {
    const tang = tangent2D(curve, t, h);
    // Rotate 90 degrees counter-clockwise
    return { x: -tang.y, y: tang.x };
}

// Helper function: Adaptive Simpson's rule for numerical integration
function adaptiveSimpson(
    f: (t: number) => number,
    a: number,
    b: number,
    epsilon: number,
    whole?: number,
    m?: number
): number {
    if (whole === undefined) {
        m = (a + b) / 2;
        const fa = f(a);
        const fb = f(b);
        const fm = f(m);
        whole = ((b - a) / 6) * (fa + 4 * fm + fb);
    }

    const mid = m!;
    const lm = (a + mid) / 2;
    const rm = (mid + b) / 2;

    const fLm = f(lm);
    const fMid = f(mid);
    const fRm = f(rm);
    const fa = f(a);
    const fb = f(b);

    const left = ((mid - a) / 6) * (fa + 4 * fLm + fMid);
    const right = ((b - mid) / 6) * (fMid + 4 * fRm + fb);
    const delta = left + right - whole!;

    if (Math.abs(delta) <= 15 * epsilon) {
        return left + right + delta / 15;
    }

    return (
        adaptiveSimpson(f, a, mid, epsilon / 2, left, lm) +
        adaptiveSimpson(f, mid, b, epsilon / 2, right, rm)
    );
}
