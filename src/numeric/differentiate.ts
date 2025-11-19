/**
 * Numerical Differentiation Module
 *
 * This module provides numerical methods for approximating derivatives
 * of functions. These methods are essential when analytical derivatives
 * are unavailable or difficult to compute.
 *
 * @module numeric/differentiate
 */

/**
 * Options for numerical differentiation
 */
export interface DifferentiateOptions {
    /**
     * Step size for finite differences
     * @default 1e-5
     */
    h?: number;

    /**
     * Order of derivative (1, 2, 3, etc.)
     * @default 1
     */
    order?: number;

    /**
     * Method to use: 'forward', 'backward', 'central'
     * @default 'central'
     */
    method?: 'forward' | 'backward' | 'central';
}

/**
 * Options for Richardson extrapolation
 */
export interface RichardsonOptions {
    /**
     * Initial step size
     * @default 0.1
     */
    h?: number;

    /**
     * Number of refinement levels
     * @default 4
     */
    levels?: number;

    /**
     * Step size reduction factor
     * @default 2
     */
    factor?: number;
}

/**
 * Result of numerical differentiation
 */
export interface DifferentiateResult {
    /** Approximated derivative value */
    value: number;

    /** Estimated error (if available) */
    error?: number;

    /** Number of function evaluations used */
    evaluations: number;
}

/**
 * Forward Difference
 *
 * Approximates the derivative using forward differences.
 * Uses values of f at x and x+h.
 *
 * Formula: f'(x) ≈ [f(x+h) - f(x)] / h
 *
 * Error: O(h)
 * Evaluations: 2 per call
 *
 * Less accurate than central differences but useful when
 * backward evaluation is not possible (e.g., at boundaries).
 *
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate derivative
 * @param h - Step size
 * @returns Approximated derivative value
 *
 * @example
 * ```typescript
 * // Derivative of x² at x=2
 * const df = forwardDifference(x => x * x, 2, 1e-5);
 * console.log(df); // ≈ 4.0
 * ```
 */
export function forwardDifference(
    f: (x: number) => number,
    x: number,
    h: number = 1e-5
): number {
    return (f(x + h) - f(x)) / h;
}

/**
 * Backward Difference
 *
 * Approximates the derivative using backward differences.
 * Uses values of f at x and x-h.
 *
 * Formula: f'(x) ≈ [f(x) - f(x-h)] / h
 *
 * Error: O(h)
 * Evaluations: 2 per call
 *
 * Similar accuracy to forward difference. Useful at right boundaries
 * or when forward evaluation is not possible.
 *
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate derivative
 * @param h - Step size
 * @returns Approximated derivative value
 *
 * @example
 * ```typescript
 * // Derivative of sin(x) at x=π/2
 * const df = backwardDifference(Math.sin, Math.PI / 2, 1e-5);
 * console.log(df); // ≈ 0.0
 * ```
 */
export function backwardDifference(
    f: (x: number) => number,
    x: number,
    h: number = 1e-5
): number {
    return (f(x) - f(x - h)) / h;
}

/**
 * Central Difference
 *
 * Approximates the derivative using central differences.
 * Uses symmetric evaluation around the point.
 *
 * Formula: f'(x) ≈ [f(x+h) - f(x-h)] / (2h)
 *
 * Error: O(h²)
 * Evaluations: 2 per call
 *
 * More accurate than forward/backward differences with the same
 * step size. This is the recommended method when function can be
 * evaluated on both sides.
 *
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate derivative
 * @param h - Step size
 * @returns Approximated derivative value
 *
 * @example
 * ```typescript
 * // Derivative of e^x at x=0
 * const df = centralDifference(Math.exp, 0, 1e-5);
 * console.log(df); // ≈ 1.0
 * ```
 */
export function centralDifference(
    f: (x: number) => number,
    x: number,
    h: number = 1e-5
): number {
    return (f(x + h) - f(x - h)) / (2 * h);
}

/**
 * Second Derivative (Central Difference)
 *
 * Approximates the second derivative using central differences.
 *
 * Formula: f''(x) ≈ [f(x+h) - 2f(x) + f(x-h)] / h²
 *
 * Error: O(h²)
 * Evaluations: 3 per call
 *
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate second derivative
 * @param h - Step size
 * @returns Approximated second derivative value
 *
 * @example
 * ```typescript
 * // Second derivative of x² at x=2
 * const d2f = secondDerivative(x => x * x, 2, 1e-5);
 * console.log(d2f); // ≈ 2.0
 * ```
 */
export function secondDerivative(
    f: (x: number) => number,
    x: number,
    h: number = 1e-5
): number {
    return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}

/**
 * Higher-Order Central Difference (First Derivative)
 *
 * More accurate central difference using 5 points.
 *
 * Formula: f'(x) ≈ [-f(x+2h) + 8f(x+h) - 8f(x-h) + f(x-2h)] / (12h)
 *
 * Error: O(h⁴)
 * Evaluations: 4 per call
 *
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate derivative
 * @param h - Step size
 * @returns Approximated derivative value
 */
export function centralDifference5Point(
    f: (x: number) => number,
    x: number,
    h: number = 1e-5
): number {
    return (
        (-f(x + 2 * h) + 8 * f(x + h) - 8 * f(x - h) + f(x - 2 * h)) / (12 * h)
    );
}

/**
 * General Numerical Derivative
 *
 * Computes numerical derivative with configurable options.
 * Supports forward, backward, and central differences.
 *
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate derivative
 * @param options - Differentiation options
 * @returns Derivative result
 *
 * @example
 * ```typescript
 * const result = derivative(Math.sin, Math.PI / 4, {
 *   method: 'central',
 *   h: 1e-6
 * });
 * console.log(result.value); // ≈ 0.707... (exact: √2/2)
 * ```
 */
export function derivative(
    f: (x: number) => number,
    x: number,
    options: DifferentiateOptions = {}
): DifferentiateResult {
    const h = options.h ?? 1e-5;
    const method = options.method ?? 'central';
    const order = options.order ?? 1;

    if (order === 1) {
        let value: number;
        let evaluations: number;

        switch (method) {
            case 'forward':
                value = forwardDifference(f, x, h);
                evaluations = 2;
                break;
            case 'backward':
                value = backwardDifference(f, x, h);
                evaluations = 2;
                break;
            case 'central':
            default:
                value = centralDifference(f, x, h);
                evaluations = 2;
                break;
        }

        return { value, evaluations };
    } else if (order === 2) {
        const value = secondDerivative(f, x, h);
        return { value, evaluations: 3 };
    } else {
        // Higher-order derivatives using finite differences recursively
        const df = (t: number) => derivative(f, t, { ...options, order: order - 1 }).value;
        const value = centralDifference(df, x, h);
        return { value, evaluations: 2 * Math.pow(2, order - 1) };
    }
}

/**
 * Richardson Extrapolation
 *
 * Improves the accuracy of finite difference approximations through
 * repeated refinement and extrapolation. Uses multiple step sizes
 * to eliminate lower-order error terms.
 *
 * The method computes derivatives with successively smaller step sizes
 * and then extrapolates to h=0 using polynomial extrapolation.
 *
 * Error: O(h^(2*levels))
 * Evaluations: O(2^levels)
 *
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate derivative
 * @param options - Richardson extrapolation options
 * @returns Derivative result with error estimate
 *
 * @example
 * ```typescript
 * const result = richardson(Math.exp, 1, { levels: 5 });
 * console.log(result.value); // ≈ e (very accurate)
 * console.log(result.error); // Very small error
 * ```
 */
export function richardson(
    f: (x: number) => number,
    x: number,
    options: RichardsonOptions = {}
): DifferentiateResult {
    const h0 = options.h ?? 0.1;
    const levels = options.levels ?? 4;
    const factor = options.factor ?? 2;

    const D: number[][] = Array.from({ length: levels }, () => []);
    let totalEvaluations = 0;

    // Compute initial estimates with different step sizes
    for (let i = 0; i < levels; i++) {
        const h = h0 / Math.pow(factor, i);
        D[i][0] = centralDifference(f, x, h);
        totalEvaluations += 2;
    }

    // Richardson extrapolation
    for (let j = 1; j < levels; j++) {
        for (let i = j; i < levels; i++) {
            const factorPow = Math.pow(factor, 2 * j);
            D[i][j] = (factorPow * D[i][j - 1] - D[i - 1][j - 1]) / (factorPow - 1);
        }
    }

    // Best estimate is the most refined one
    const value = D[levels - 1][levels - 1];

    // Estimate error from last two refinements
    const error =
        levels > 1 ? Math.abs(D[levels - 1][levels - 1] - D[levels - 2][levels - 2]) : undefined;

    return {
        value,
        error,
        evaluations: totalEvaluations,
    };
}

/**
 * Partial Derivative
 *
 * Computes the partial derivative of a multivariate function
 * with respect to one variable.
 *
 * @param f - Function to differentiate (takes array of variables)
 * @param point - Point at which to evaluate partial derivative
 * @param varIndex - Index of variable to differentiate with respect to
 * @param h - Step size
 * @returns Approximated partial derivative value
 *
 * @example
 * ```typescript
 * // Partial derivative of f(x,y) = x²y with respect to x at (2,3)
 * const f = ([x, y]: number[]) => x * x * y;
 * const df_dx = partial(f, [2, 3], 0);
 * console.log(df_dx); // ≈ 12.0 (exact: 2xy = 2*2*3)
 * ```
 */
export function partial(
    f: (point: number[]) => number,
    point: number[],
    varIndex: number,
    h: number = 1e-5
): number {
    const forward = [...point];
    const backward = [...point];

    forward[varIndex] += h;
    backward[varIndex] -= h;

    return (f(forward) - f(backward)) / (2 * h);
}

/**
 * Gradient (Vector of Partial Derivatives)
 *
 * Computes the gradient (vector of all partial derivatives) of a
 * multivariate function.
 *
 * For f: ℝⁿ → ℝ, the gradient is:
 * ∇f = [∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂xₙ]
 *
 * @param f - Function to differentiate (takes array of variables)
 * @param point - Point at which to evaluate gradient
 * @param h - Step size
 * @returns Gradient vector
 *
 * @example
 * ```typescript
 * // Gradient of f(x,y) = x² + y² at (1,2)
 * const f = ([x, y]: number[]) => x * x + y * y;
 * const grad = gradient(f, [1, 2]);
 * console.log(grad); // ≈ [2, 4]
 * ```
 */
export function gradient(
    f: (point: number[]) => number,
    point: number[],
    h: number = 1e-5
): number[] {
    const n = point.length;
    const grad: number[] = [];

    for (let i = 0; i < n; i++) {
        grad.push(partial(f, point, i, h));
    }

    return grad;
}

/**
 * Jacobian Matrix
 *
 * Computes the Jacobian matrix of a vector-valued function.
 * The Jacobian contains all partial derivatives of all outputs
 * with respect to all inputs.
 *
 * For F: ℝⁿ → ℝᵐ, the Jacobian is an m×n matrix:
 * J[i][j] = ∂fᵢ/∂xⱼ
 *
 * @param F - Vector-valued function (takes array, returns array)
 * @param point - Point at which to evaluate Jacobian
 * @param h - Step size
 * @returns Jacobian matrix
 *
 * @example
 * ```typescript
 * // Jacobian of F(x,y) = [x²y, xy²] at (1,1)
 * const F = ([x, y]: number[]) => [x * x * y, x * y * y];
 * const J = jacobian(F, [1, 1]);
 * // J ≈ [[2, 1], [1, 2]]
 * ```
 */
export function jacobian(
    F: (point: number[]) => number[],
    point: number[],
    h: number = 1e-5
): number[][] {
    const n = point.length;
    const m = F(point).length;
    const J: number[][] = Array.from({ length: m }, () => Array(n).fill(0));

    for (let j = 0; j < n; j++) {
        const forward = [...point];
        const backward = [...point];
        forward[j] += h;
        backward[j] -= h;

        const fForward = F(forward);
        const fBackward = F(backward);

        for (let i = 0; i < m; i++) {
            J[i][j] = (fForward[i] - fBackward[i]) / (2 * h);
        }
    }

    return J;
}

/**
 * Hessian Matrix (Matrix of Second Partial Derivatives)
 *
 * Computes the Hessian matrix containing all second-order partial
 * derivatives of a scalar function.
 *
 * For f: ℝⁿ → ℝ, the Hessian is an n×n symmetric matrix:
 * H[i][j] = ∂²f/(∂xᵢ∂xⱼ)
 *
 * @param f - Function to differentiate (takes array of variables)
 * @param point - Point at which to evaluate Hessian
 * @param h - Step size
 * @returns Hessian matrix
 *
 * @example
 * ```typescript
 * // Hessian of f(x,y) = x²y + xy² at (1,1)
 * const f = ([x, y]: number[]) => x * x * y + x * y * y;
 * const H = hessian(f, [1, 1]);
 * // H ≈ [[2, 4], [4, 2]]
 * ```
 */
export function hessian(
    f: (point: number[]) => number,
    point: number[],
    h: number = 1e-5
): number[][] {
    const n = point.length;
    const H: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    // Diagonal elements (second derivatives)
    for (let i = 0; i < n; i++) {
        const forward = [...point];
        const center = [...point];
        const backward = [...point];

        forward[i] += h;
        backward[i] -= h;

        H[i][i] = (f(forward) - 2 * f(center) + f(backward)) / (h * h);
    }

    // Off-diagonal elements (mixed partial derivatives)
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const pp = [...point];
            const pm = [...point];
            const mp = [...point];
            const mm = [...point];

            pp[i] += h;
            pp[j] += h;
            pm[i] += h;
            pm[j] -= h;
            mp[i] -= h;
            mp[j] += h;
            mm[i] -= h;
            mm[j] -= h;

            const value = (f(pp) - f(pm) - f(mp) + f(mm)) / (4 * h * h);
            H[i][j] = value;
            H[j][i] = value; // Hessian is symmetric
        }
    }

    return H;
}

/**
 * Directional Derivative
 *
 * Computes the derivative of a function in a specified direction.
 * The direction vector should be normalized for proper interpretation.
 *
 * Formula: D_v f(x) = ∇f(x) · v
 *
 * @param f - Function to differentiate
 * @param point - Point at which to evaluate
 * @param direction - Direction vector (will be normalized)
 * @param h - Step size
 * @returns Directional derivative value
 *
 * @example
 * ```typescript
 * // Directional derivative of f(x,y) = x² + y² at (1,1) in direction [1,1]
 * const f = ([x, y]: number[]) => x * x + y * y;
 * const dirDeriv = directional(f, [1, 1], [1, 1]);
 * console.log(dirDeriv); // ≈ 2√2
 * ```
 */
export function directional(
    f: (point: number[]) => number,
    point: number[],
    direction: number[],
    h: number = 1e-5
): number {
    // Normalize direction vector
    const norm = Math.sqrt(direction.reduce((sum, d) => sum + d * d, 0));
    const v = direction.map((d) => d / norm);

    // Compute gradient
    const grad = gradient(f, point, h);

    // Dot product
    return grad.reduce((sum, g, i) => sum + g * v[i], 0);
}
