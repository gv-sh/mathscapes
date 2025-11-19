/**
 * Univariate Optimization Algorithms
 *
 * Numerical methods for finding minima (or maxima) of single-variable functions.
 * These algorithms are fundamental in optimization theory and computational science.
 *
 * Applications:
 * - Machine learning (loss minimization)
 * - Engineering design optimization
 * - Resource allocation
 * - Parameter tuning
 * - Economic modeling
 *
 * Note: All algorithms find minima. To find maxima, minimize the negative of your function.
 *
 * References:
 * - Press et al., "Numerical Recipes" (2007)
 * - Nocedal & Wright, "Numerical Optimization" (2006)
 * - Brent, R.P., "Algorithms for Minimization without Derivatives" (1973)
 */

/**
 * Options for optimization algorithms
 */
export interface OptimizeOptions {
    /** Maximum number of iterations */
    maxIterations?: number;
    /** Convergence tolerance */
    tolerance?: number;
    /** Step size for gradient approximation (if needed) */
    stepSize?: number;
    /** Learning rate for gradient descent */
    learningRate?: number;
}

/**
 * Result from an optimization algorithm
 */
export interface OptimizeResult {
    /** The minimizer (x value at minimum) */
    x: number;
    /** The minimum value (f(x) at minimum) */
    fx: number;
    /** Number of iterations taken */
    iterations: number;
    /** Whether the algorithm converged */
    converged: boolean;
}

/**
 * Golden ratio constant φ = (1 + √5) / 2 ≈ 1.618
 * Reciprocal of golden ratio: 1/φ = 2 - φ ≈ 0.618
 */
const PHI = (1 + Math.sqrt(5)) / 2;
const INVPHI = 1 / PHI; // 2 - PHI also works, but let's be explicit

/**
 * Golden Section Search
 *
 * Finds the minimum of a unimodal function f(x) in the interval [a, b].
 * Uses the golden ratio to progressively narrow the search interval.
 *
 * Algorithm:
 * 1. Start with interval [a, b]
 * 2. Choose two interior points using golden ratio: c = b - (b-a)/φ and d = a + (b-a)/φ
 * 3. If f(c) < f(d), the minimum is in [a, d]; otherwise it's in [c, b]
 * 4. Repeat with the new interval
 *
 * The golden ratio ensures optimal reduction of the search interval at each step.
 *
 * Pros:
 * - Simple and robust
 * - Doesn't require derivatives
 * - Guaranteed convergence for unimodal functions
 * - Only one new function evaluation per iteration (reuses previous values)
 *
 * Cons:
 * - Linear convergence (slower than methods using derivatives)
 * - Requires bracketing interval
 * - Only works for unimodal functions
 *
 * Convergence: Linear with ratio 1/φ ≈ 0.618
 * Time Complexity: O(log((b-a)/ε)) where ε is the tolerance
 *
 * @param f Function to minimize
 * @param a Left endpoint of interval
 * @param b Right endpoint of interval
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize (x - 2)^2, which has minimum at x = 2
 * const result = goldenSection(x => (x - 2) ** 2, 0, 4);
 * console.log(result.x); // ≈ 2.0
 * console.log(result.fx); // ≈ 0.0
 */
export function goldenSection(
    f: (x: number) => number,
    a: number,
    b: number,
    options: OptimizeOptions = {}
): OptimizeResult {
    const { maxIterations = 100, tolerance = 1e-10 } = options;

    if (a >= b) {
        throw new Error('Invalid interval: a must be less than b');
    }

    // Initial points using golden ratio
    let c = a + (1 - INVPHI) * (b - a);
    let d = a + INVPHI * (b - a);
    let fc = f(c);
    let fd = f(d);
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        if (Math.abs(b - a) < tolerance) {
            // Return the better of c or d
            if (fc < fd) {
                return { x: c, fx: fc, iterations, converged: true };
            } else {
                return { x: d, fx: fd, iterations, converged: true };
            }
        }

        if (fc < fd) {
            // Minimum is in [a, d]
            b = d;
            d = c;
            fd = fc;
            c = a + (1 - INVPHI) * (b - a);
            fc = f(c);
        } else {
            // Minimum is in [c, b]
            a = c;
            c = d;
            fc = fd;
            d = a + INVPHI * (b - a);
            fd = f(d);
        }
    }

    // Return the better of c or d
    if (fc < fd) {
        return { x: c, fx: fc, iterations, converged: false };
    } else {
        return { x: d, fx: fd, iterations, converged: false };
    }
}

/**
 * Brent's Method for Optimization
 *
 * Finds the minimum of a function f(x) in the interval [a, b] using Brent's method.
 * Combines golden section search with parabolic interpolation for fast convergence.
 *
 * Algorithm:
 * - Uses parabolic interpolation when the function is approximately quadratic
 * - Falls back to golden section search when parabolic interpolation is unreliable
 * - Maintains bracketing interval for guaranteed convergence
 *
 * Pros:
 * - Combines speed of parabolic interpolation with reliability of golden section
 * - Doesn't require derivatives
 * - Superlinear convergence (typically)
 * - One of the best general-purpose optimizers without derivatives
 * - More robust than pure parabolic interpolation
 *
 * Cons:
 * - More complex than golden section search
 * - Requires bracketing interval
 * - Only works for unimodal functions
 *
 * Convergence: Superlinear (order ≈ 1.3-1.6 typically)
 *
 * Reference: Brent, R.P. (1973). "Algorithms for Minimization without Derivatives"
 *
 * @param f Function to minimize
 * @param a Left endpoint of interval
 * @param b Right endpoint of interval
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize (x - 2)^2, which has minimum at x = 2
 * const result = brentOptimize(x => (x - 2) ** 2, 0, 4);
 * console.log(result.x); // ≈ 2.0
 * console.log(result.fx); // ≈ 0.0
 */
export function brentOptimize(
    f: (x: number) => number,
    a: number,
    b: number,
    options: OptimizeOptions = {}
): OptimizeResult {
    const { maxIterations = 100, tolerance = 1e-10 } = options;

    if (a >= b) {
        throw new Error('Invalid interval: a must be less than b');
    }

    const CGOLD = 1 - INVPHI; // Complement of golden ratio
    const ZEPS = 1e-10; // Small number to prevent division by zero

    // Initialize
    let x = a + INVPHI * (b - a); // Golden section point
    let w = x;
    let v = x;
    let fx = f(x);
    let fw = fx;
    let fv = fx;
    let e = 0; // Distance moved on step before last
    let d = 0; // Distance moved on last step
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const xm = (a + b) / 2;
        const tol1 = tolerance * Math.abs(x) + ZEPS;
        const tol2 = 2 * tol1;

        // Check convergence
        if (Math.abs(x - xm) <= tol2 - 0.5 * (b - a)) {
            return { x, fx, iterations, converged: true };
        }

        let u = 0; // Trial point

        // Try parabolic interpolation
        if (Math.abs(e) > tol1) {
            // Fit parabola through x, v, w
            const r = (x - w) * (fx - fv);
            let q = (x - v) * (fx - fw);
            let p = (x - v) * q - (x - w) * r;
            q = 2 * (q - r);

            if (q > 0) {
                p = -p;
            } else {
                q = -q;
            }

            const etemp = e;
            e = d;

            // Check if parabolic interpolation is acceptable
            if (
                Math.abs(p) < Math.abs(0.5 * q * etemp) &&
                p > q * (a - x) &&
                p < q * (b - x)
            ) {
                // Take parabolic step
                d = p / q;
                u = x + d;

                // Don't evaluate too close to a or b
                if (u - a < tol2 || b - u < tol2) {
                    d = x < xm ? tol1 : -tol1;
                }
            } else {
                // Fall back to golden section
                e = x >= xm ? a - x : b - x;
                d = CGOLD * e;
            }
        } else {
            // Use golden section
            e = x >= xm ? a - x : b - x;
            d = CGOLD * e;
        }

        // Evaluate at trial point
        u = Math.abs(d) >= tol1 ? x + d : x + (d >= 0 ? tol1 : -tol1);
        const fu = f(u);

        // Update points
        if (fu <= fx) {
            if (u >= x) {
                a = x;
            } else {
                b = x;
            }
            v = w;
            fv = fw;
            w = x;
            fw = fx;
            x = u;
            fx = fu;
        } else {
            if (u < x) {
                a = u;
            } else {
                b = u;
            }
            if (fu <= fw || w === x) {
                v = w;
                fv = fw;
                w = u;
                fw = fu;
            } else if (fu <= fv || v === x || v === w) {
                v = u;
                fv = fu;
            }
        }
    }

    return { x, fx, iterations, converged: false };
}

/**
 * Gradient Descent (1D)
 *
 * Finds a local minimum of f(x) using gradient descent (steepest descent).
 * Iteratively moves in the direction opposite to the gradient.
 *
 * Algorithm:
 * Starting from an initial guess x₀, iterate:
 * x_{n+1} = x_n - α * f'(x_n)
 * where α is the learning rate.
 *
 * Pros:
 * - Simple and intuitive
 * - Can handle non-smooth functions (with finite differences)
 * - Easy to implement and understand
 * - Forms basis for many ML optimization algorithms
 *
 * Cons:
 * - Only finds local minima
 * - Convergence speed depends critically on learning rate
 * - Linear convergence (slow near minimum)
 * - Requires derivative or finite difference approximation
 *
 * Convergence: Linear (geometric)
 *
 * @param f Function to minimize
 * @param df Derivative of f (optional; will use finite differences if not provided)
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize (x - 2)^2, which has minimum at x = 2
 * const result = gradientDescent(
 *   x => (x - 2) ** 2,
 *   x => 2 * (x - 2),
 *   0,
 *   { learningRate: 0.1 }
 * );
 * console.log(result.x); // ≈ 2.0
 */
export function gradientDescent(
    f: (x: number) => number,
    df?: (x: number) => number,
    x0: number = 0,
    options: OptimizeOptions = {}
): OptimizeResult {
    const {
        maxIterations = 1000,
        tolerance = 1e-10,
        learningRate = 0.01,
        stepSize = 1e-8,
    } = options;

    // If derivative not provided, use finite differences
    const gradient = df ?? ((x: number) => (f(x + stepSize) - f(x - stepSize)) / (2 * stepSize));

    let x = x0;
    let fx = f(x);
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const grad = gradient(x);

        // Gradient descent update
        const xNew = x - learningRate * grad;
        const fxNew = f(xNew);

        // Check convergence
        if (Math.abs(xNew - x) < tolerance || Math.abs(grad) < tolerance) {
            return { x: xNew, fx: fxNew, iterations, converged: true };
        }

        x = xNew;
        fx = fxNew;
    }

    return { x, fx, iterations, converged: false };
}

/**
 * Newton's Method for Optimization
 *
 * Finds a local minimum of f(x) using Newton's method.
 * Uses both first and second derivatives for quadratic convergence.
 *
 * Algorithm:
 * Starting from an initial guess x₀, iterate:
 * x_{n+1} = x_n - f'(x_n) / f''(x_n)
 *
 * This finds where f'(x) = 0, which corresponds to critical points (minima, maxima, or saddle points).
 *
 * Geometric interpretation: Fit a quadratic to f at x_n and jump to its minimum.
 *
 * Pros:
 * - Quadratic convergence near minimum (very fast)
 * - Fewer iterations than gradient descent typically
 * - Optimal for quadratic functions (converges in one step)
 *
 * Cons:
 * - Requires both first and second derivatives
 * - May diverge if initial guess is poor
 * - May converge to maximum or saddle point instead of minimum
 * - Fails if second derivative is zero or near-zero
 * - Expensive if second derivative is costly to compute
 *
 * Convergence: Quadratic (very fast near solution)
 *
 * @param f Function to minimize
 * @param df First derivative of f
 * @param ddf Second derivative of f
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize (x - 2)^2, which has minimum at x = 2
 * const result = newtonOptimize(
 *   x => (x - 2) ** 2,
 *   x => 2 * (x - 2),
 *   x => 2,
 *   0
 * );
 * console.log(result.x); // ≈ 2.0
 */
export function newtonOptimize(
    f: (x: number) => number,
    df: (x: number) => number,
    ddf: (x: number) => number,
    x0: number,
    options: OptimizeOptions = {}
): OptimizeResult {
    const { maxIterations = 100, tolerance = 1e-10 } = options;

    let x = x0;
    let fx = f(x);
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const grad = df(x);
        const hess = ddf(x);

        // Check for zero or negative second derivative
        if (Math.abs(hess) < 1e-15) {
            throw new Error('Second derivative is zero or near-zero; Newton method fails');
        }

        // Newton's method update
        const xNew = x - grad / hess;
        const fxNew = f(xNew);

        // Check convergence
        if (Math.abs(xNew - x) < tolerance || Math.abs(grad) < tolerance) {
            return { x: xNew, fx: fxNew, iterations, converged: true };
        }

        x = xNew;
        fx = fxNew;
    }

    return { x, fx, iterations, converged: false };
}

/**
 * Find maximum of a function using any minimization algorithm
 *
 * Convenience function that finds the maximum of f by minimizing -f.
 *
 * @param f Function to maximize
 * @param minimizer Minimization algorithm to use
 * @param args Arguments to pass to the minimizer (excluding the function)
 * @returns Optimization result (note: fx will be the maximum value, not minimum)
 *
 * @example
 * // Maximize -(x - 2)^2 (which has maximum at x = 2)
 * const result = maximize(
 *   x => -(x - 2) ** 2,
 *   goldenSection,
 *   0, 4
 * );
 * console.log(result.x); // ≈ 2.0
 * console.log(result.fx); // ≈ 0.0
 */
export function maximize(
    f: (x: number) => number,
    minimizer: (f: (x: number) => number, ...args: any[]) => OptimizeResult,
    ...args: any[]
): OptimizeResult {
    const result = minimizer((x: number) => -f(x), ...args);
    return { ...result, fx: -result.fx };
}
