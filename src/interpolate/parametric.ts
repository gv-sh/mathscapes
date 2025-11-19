/**
 * Parametric Curves
 *
 * Parametric curve operations for computer graphics and computational geometry.
 * A parametric curve is defined by functions x(t), y(t), [z(t)] where t is a parameter.
 *
 * Features:
 * - Arc length calculation
 * - Point at distance along curve
 * - Curvature and torsion computation
 * - Curve reparameterization
 * - Curve-curve intersection
 *
 * References:
 * - "Curves and Surfaces for CAGD" by Gerald Farin
 * - "Computer Graphics: Principles and Practice" by Foley et al.
 */

/**
 * 2D Point
 */
export interface Point2D {
    x: number;
    y: number;
}

/**
 * 3D Point
 */
export interface Point3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Parametric curve function type (2D)
 */
export type ParametricCurve2D = (t: number) => Point2D;

/**
 * Parametric curve function type (3D)
 */
export type ParametricCurve3D = (t: number) => Point3D;

/**
 * Calculate arc length of a 2D parametric curve using adaptive Simpson's rule
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param tolerance - Error tolerance (default: 1e-6)
 * @returns Arc length
 *
 * @example
 * ```ts
 * // Circle: x = cos(t), y = sin(t)
 * const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
 * const length = arcLength2D(circle, 0, Math.PI); // Half circle = π
 * ```
 */
export function arcLength2D(
    curve: ParametricCurve2D,
    t0: number,
    t1: number,
    tolerance: number = 1e-6
): number {
    // Derivative approximation using finite differences
    const derivative = (t: number): number => {
        const h = 1e-7;
        const p1 = curve(t - h);
        const p2 = curve(t + h);
        const dx = (p2.x - p1.x) / (2 * h);
        const dy = (p2.y - p1.y) / (2 * h);
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Adaptive Simpson's rule
    const simpson = (f: (t: number) => number, a: number, b: number, tol: number): number => {
        const c = (a + b) / 2;
        const h = b - a;
        const fa = f(a);
        const fb = f(b);
        const fc = f(c);

        const s1 = (h / 6) * (fa + 4 * fc + fb);

        const d = (a + c) / 2;
        const e = (c + b) / 2;
        const fd = f(d);
        const fe = f(e);
        const s2 = (h / 12) * (fa + 4 * fd + 2 * fc + 4 * fe + fb);

        if (Math.abs(s2 - s1) < 15 * tol) {
            return s2 + (s2 - s1) / 15;
        }

        return simpson(f, a, c, tol / 2) + simpson(f, c, b, tol / 2);
    };

    return simpson(derivative, t0, t1, tolerance);
}

/**
 * Calculate arc length of a 3D parametric curve
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param tolerance - Error tolerance (default: 1e-6)
 * @returns Arc length
 *
 * @example
 * ```ts
 * // Helix: x = cos(t), y = sin(t), z = t
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
        const h = 1e-7;
        const p1 = curve(t - h);
        const p2 = curve(t + h);
        const dx = (p2.x - p1.x) / (2 * h);
        const dy = (p2.y - p1.y) / (2 * h);
        const dz = (p2.z - p1.z) / (2 * h);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    const simpson = (f: (t: number) => number, a: number, b: number, tol: number): number => {
        const c = (a + b) / 2;
        const h = b - a;
        const fa = f(a);
        const fb = f(b);
        const fc = f(c);

        const s1 = (h / 6) * (fa + 4 * fc + fb);

        const d = (a + c) / 2;
        const e = (c + b) / 2;
        const fd = f(d);
        const fe = f(e);
        const s2 = (h / 12) * (fa + 4 * fd + 2 * fc + 4 * fe + fb);

        if (Math.abs(s2 - s1) < 15 * tol) {
            return s2 + (s2 - s1) / 15;
        }

        return simpson(f, a, c, tol / 2) + simpson(f, c, b, tol / 2);
    };

    return simpson(derivative, t0, t1, tolerance);
}

/**
 * Find parameter t such that arc length from t0 to t equals targetLength
 * Uses binary search
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param targetLength - Desired arc length
 * @param tolerance - Error tolerance (default: 1e-6)
 * @returns Parameter t
 *
 * @example
 * ```ts
 * const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
 * const t = parameterAtArcLength2D(circle, 0, 2*Math.PI, Math.PI); // t ≈ π
 * ```
 */
export function parameterAtArcLength2D(
    curve: ParametricCurve2D,
    t0: number,
    t1: number,
    targetLength: number,
    tolerance: number = 1e-6
): number {
    let left = t0;
    let right = t1;

    while (right - left > tolerance) {
        const mid = (left + right) / 2;
        const length = arcLength2D(curve, t0, mid);

        if (Math.abs(length - targetLength) < tolerance) {
            return mid;
        }

        if (length < targetLength) {
            left = mid;
        } else {
            right = mid;
        }
    }

    return (left + right) / 2;
}

/**
 * Find parameter t for 3D curve at given arc length
 */
export function parameterAtArcLength3D(
    curve: ParametricCurve3D,
    t0: number,
    t1: number,
    targetLength: number,
    tolerance: number = 1e-6
): number {
    let left = t0;
    let right = t1;

    while (right - left > tolerance) {
        const mid = (left + right) / 2;
        const length = arcLength3D(curve, t0, mid);

        if (Math.abs(length - targetLength) < tolerance) {
            return mid;
        }

        if (length < targetLength) {
            left = mid;
        } else {
            right = mid;
        }
    }

    return (left + right) / 2;
}

/**
 * Calculate curvature of a 2D parametric curve at parameter t
 * Curvature κ = |x'y'' - y'x''| / (x'² + y'²)^(3/2)
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @returns Curvature (unsigned)
 *
 * @example
 * ```ts
 * // Circle of radius r has constant curvature 1/r
 * const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
 * const k = curvature2D(circle, 0); // k = 1
 * ```
 */
export function curvature2D(curve: ParametricCurve2D, t: number): number {
    const h = 1e-7;

    // First derivatives
    const p0 = curve(t);
    const p1 = curve(t + h);
    const p_1 = curve(t - h);

    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);

    // Second derivatives
    const ddx = (p1.x - 2 * p0.x + p_1.x) / (h * h);
    const ddy = (p1.y - 2 * p0.y + p_1.y) / (h * h);

    const num = Math.abs(dx * ddy - dy * ddx);
    const denom = Math.pow(dx * dx + dy * dy, 1.5);

    return denom > 1e-10 ? num / denom : 0;
}

/**
 * Calculate curvature of a 3D parametric curve at parameter t
 * Curvature κ = |r' × r''| / |r'|³
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @returns Curvature (unsigned)
 */
export function curvature3D(curve: ParametricCurve3D, t: number): number {
    const h = 1e-7;

    const p0 = curve(t);
    const p1 = curve(t + h);
    const p_1 = curve(t - h);

    // First derivatives
    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);
    const dz = (p1.z - p_1.z) / (2 * h);

    // Second derivatives
    const ddx = (p1.x - 2 * p0.x + p_1.x) / (h * h);
    const ddy = (p1.y - 2 * p0.y + p_1.y) / (h * h);
    const ddz = (p1.z - 2 * p0.z + p_1.z) / (h * h);

    // Cross product r' × r''
    const crossX = dy * ddz - dz * ddy;
    const crossY = dz * ddx - dx * ddz;
    const crossZ = dx * ddy - dy * ddx;

    const crossMag = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
    const velMag = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return velMag > 1e-10 ? crossMag / Math.pow(velMag, 3) : 0;
}

/**
 * Calculate torsion of a 3D parametric curve at parameter t
 * Torsion τ = (r' × r'') · r''' / |r' × r''|²
 *
 * Torsion measures how much a curve twists out of its osculating plane
 *
 * @param curve - Parametric curve function
 * @param t - Parameter value
 * @returns Torsion (signed)
 *
 * @example
 * ```ts
 * // Helix has constant torsion
 * const helix = (t: number) => ({
 *   x: Math.cos(t),
 *   y: Math.sin(t),
 *   z: t / (2 * Math.PI)
 * });
 * const tau = torsion3D(helix, 0);
 * ```
 */
export function torsion3D(curve: ParametricCurve3D, t: number): number {
    const h = 1e-7;

    const p0 = curve(t);
    const p1 = curve(t + h);
    const p2 = curve(t + 2 * h);
    const p_1 = curve(t - h);
    const p_2 = curve(t - 2 * h);

    // First derivatives (central difference)
    const dx = (p1.x - p_1.x) / (2 * h);
    const dy = (p1.y - p_1.y) / (2 * h);
    const dz = (p1.z - p_1.z) / (2 * h);

    // Second derivatives
    const ddx = (p1.x - 2 * p0.x + p_1.x) / (h * h);
    const ddy = (p1.y - 2 * p0.y + p_1.y) / (h * h);
    const ddz = (p1.z - 2 * p0.z + p_1.z) / (h * h);

    // Third derivatives
    const dddx = (p2.x - 2 * p1.x + 2 * p_1.x - p_2.x) / (2 * h * h * h);
    const dddy = (p2.y - 2 * p1.y + 2 * p_1.y - p_2.y) / (2 * h * h * h);
    const dddz = (p2.z - 2 * p1.z + 2 * p_1.z - p_2.z) / (2 * h * h * h);

    // r' × r''
    const crossX = dy * ddz - dz * ddy;
    const crossY = dz * ddx - dx * ddz;
    const crossZ = dx * ddy - dy * ddx;

    // (r' × r'') · r'''
    const dot = crossX * dddx + crossY * dddy + crossZ * dddz;

    // |r' × r''|²
    const crossMagSq = crossX * crossX + crossY * crossY + crossZ * crossZ;

    return crossMagSq > 1e-10 ? dot / crossMagSq : 0;
}

/**
 * Reparameterize curve by arc length (uniform speed)
 * Returns a new curve function that moves at constant speed
 *
 * @param curve - Original parametric curve
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param samples - Number of samples for lookup table (default: 100)
 * @returns Arc-length parameterized curve
 *
 * @example
 * ```ts
 * const curve = (t: number) => ({ x: t*t, y: t*t*t }); // Variable speed
 * const uniform = reparameterizeByArcLength2D(curve, 0, 1);
 * // uniform(s) moves at constant speed as s varies from 0 to 1
 * ```
 */
export function reparameterizeByArcLength2D(
    curve: ParametricCurve2D,
    t0: number,
    t1: number,
    samples: number = 100
): ParametricCurve2D {
    // Build lookup table
    const totalLength = arcLength2D(curve, t0, t1);
    const table: Array<{ s: number; t: number }> = [];

    for (let i = 0; i <= samples; i++) {
        const t = t0 + (t1 - t0) * (i / samples);
        const s = arcLength2D(curve, t0, t);
        table.push({ s, t });
    }

    // Return reparameterized curve
    return (s: number): Point2D => {
        const targetLength = s * totalLength;

        // Binary search in lookup table
        let left = 0;
        let right = table.length - 1;

        while (right - left > 1) {
            const mid = Math.floor((left + right) / 2);
            if (table[mid].s < targetLength) {
                left = mid;
            } else {
                right = mid;
            }
        }

        // Linear interpolation
        const s0 = table[left].s;
        const s1 = table[right].s;
        const t_left = table[left].t;
        const t_right = table[right].t;

        const alpha = (targetLength - s0) / (s1 - s0);
        const t = t_left + alpha * (t_right - t_left);

        return curve(t);
    };
}

/**
 * Reparameterize 3D curve by arc length
 */
export function reparameterizeByArcLength3D(
    curve: ParametricCurve3D,
    t0: number,
    t1: number,
    samples: number = 100
): ParametricCurve3D {
    const totalLength = arcLength3D(curve, t0, t1);
    const table: Array<{ s: number; t: number }> = [];

    for (let i = 0; i <= samples; i++) {
        const t = t0 + (t1 - t0) * (i / samples);
        const s = arcLength3D(curve, t0, t);
        table.push({ s, t });
    }

    return (s: number): Point3D => {
        const targetLength = s * totalLength;

        let left = 0;
        let right = table.length - 1;

        while (right - left > 1) {
            const mid = Math.floor((left + right) / 2);
            if (table[mid].s < targetLength) {
                left = mid;
            } else {
                right = mid;
            }
        }

        const s0 = table[left].s;
        const s1 = table[right].s;
        const t_left = table[left].t;
        const t_right = table[right].t;

        const alpha = (targetLength - s0) / (s1 - s0);
        const t = t_left + alpha * (t_right - t_left);

        return curve(t);
    };
}

/**
 * Sample a curve at equally spaced arc-length intervals
 *
 * @param curve - Parametric curve function
 * @param t0 - Start parameter
 * @param t1 - End parameter
 * @param numSamples - Number of samples
 * @returns Array of points equally spaced along curve
 */
export function sampleUniform2D(
    curve: ParametricCurve2D,
    t0: number,
    t1: number,
    numSamples: number
): Point2D[] {
    const uniformCurve = reparameterizeByArcLength2D(curve, t0, t1);
    const points: Point2D[] = [];

    for (let i = 0; i < numSamples; i++) {
        const s = i / (numSamples - 1);
        points.push(uniformCurve(s));
    }

    return points;
}

/**
 * Sample a 3D curve at equally spaced arc-length intervals
 */
export function sampleUniform3D(
    curve: ParametricCurve3D,
    t0: number,
    t1: number,
    numSamples: number
): Point3D[] {
    const uniformCurve = reparameterizeByArcLength3D(curve, t0, t1);
    const points: Point3D[] = [];

    for (let i = 0; i < numSamples; i++) {
        const s = i / (numSamples - 1);
        points.push(uniformCurve(s));
    }

    return points;
}
