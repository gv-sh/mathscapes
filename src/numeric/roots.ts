/**
 * Root Finding Algorithms
 *
 * Numerical methods for finding zeros of real and complex-valued functions.
 * These algorithms are fundamental in numerical analysis and scientific computing.
 *
 * Applications:
 * - Solving nonlinear equations
 * - Finding equilibrium points in simulations
 * - Optimization (finding critical points)
 * - Signal processing (finding zero crossings)
 * - Engineering design and analysis
 *
 * References:
 * - Press et al., "Numerical Recipes" (2007)
 * - Burden & Faires, "Numerical Analysis" (2015)
 */

import { Complex } from '../core/complex';

/**
 * Options for root finding algorithms
 */
export interface RootOptions {
    /** Maximum number of iterations */
    maxIterations?: number;
    /** Convergence tolerance */
    tolerance?: number;
    /** Initial guess (for iterative methods) */
    initialGuess?: number;
}

/**
 * Result from a root finding algorithm
 */
export interface RootResult {
    /** The root (solution) */
    root: number;
    /** Number of iterations taken */
    iterations: number;
    /** Final function value at the root */
    fValue: number;
    /** Whether the algorithm converged */
    converged: boolean;
}

/**
 * Bisection Method
 *
 * Finds a root of f(x) = 0 in the interval [a, b] using the bisection method.
 * The function must satisfy f(a) * f(b) < 0 (opposite signs at endpoints).
 *
 * Algorithm:
 * 1. Start with interval [a, b] where f(a) and f(b) have opposite signs
 * 2. Compute midpoint c = (a + b) / 2
 * 3. If f(c) is close to zero, return c
 * 4. If f(a) and f(c) have opposite signs, set b = c; otherwise set a = c
 * 5. Repeat until convergence
 *
 * Pros:
 * - Always converges if f is continuous and f(a) * f(b) < 0
 * - Simple and robust
 * - Guaranteed error bound: |error| ≤ (b - a) / 2^n after n iterations
 *
 * Cons:
 * - Slow convergence (linear)
 * - Requires bracketing interval
 *
 * Time Complexity: O(log((b-a)/ε)) where ε is the tolerance
 *
 * @param f Function to find root of
 * @param a Left endpoint of bracketing interval
 * @param b Right endpoint of bracketing interval
 * @param options Algorithm options
 * @returns Root finding result
 *
 * @example
 * // Find root of x^2 - 2 (sqrt(2))
 * const result = bisection(x => x * x - 2, 0, 2);
 * console.log(result.root); // ≈ 1.414213562373095
 */
export function bisection(
    f: (x: number) => number,
    a: number,
    b: number,
    options: RootOptions = {}
): RootResult {
    const { maxIterations = 100, tolerance = 1e-10 } = options;

    let fa = f(a);
    let fb = f(b);

    // Check if interval brackets a root
    if (fa * fb > 0) {
        throw new Error('Function must have opposite signs at endpoints a and b');
    }

    // Check if either endpoint is already a root
    if (Math.abs(fa) < tolerance) {
        return { root: a, iterations: 0, fValue: fa, converged: true };
    }
    if (Math.abs(fb) < tolerance) {
        return { root: b, iterations: 0, fValue: fb, converged: true };
    }

    let iterations = 0;
    let c = a;
    let fc = fa;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        // Compute midpoint
        c = (a + b) / 2;
        fc = f(c);

        // Check convergence
        if (Math.abs(fc) < tolerance || Math.abs(b - a) / 2 < tolerance) {
            return { root: c, iterations, fValue: fc, converged: true };
        }

        // Update interval
        if (fa * fc < 0) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }
    }

    return { root: c, iterations, fValue: fc, converged: false };
}

/**
 * Newton-Raphson Method
 *
 * Finds a root of f(x) = 0 using Newton's method (also called Newton-Raphson).
 * Requires both the function and its derivative.
 *
 * Algorithm:
 * Starting from an initial guess x₀, iterate:
 * x_{n+1} = x_n - f(x_n) / f'(x_n)
 *
 * Geometric interpretation: Find where the tangent line at x_n crosses the x-axis.
 *
 * Pros:
 * - Quadratic convergence near the root (very fast)
 * - Doesn't require bracketing interval
 *
 * Cons:
 * - Requires derivative
 * - May diverge if initial guess is poor
 * - Fails if derivative is zero or near-zero
 * - May oscillate or converge to wrong root
 *
 * Time Complexity: O(log log(1/ε)) iterations typically (quadratic convergence)
 *
 * @param f Function to find root of
 * @param df Derivative of f
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Root finding result
 *
 * @example
 * // Find root of x^2 - 2 (sqrt(2))
 * const result = newtonRaphson(
 *   x => x * x - 2,
 *   x => 2 * x,
 *   1.0
 * );
 * console.log(result.root); // ≈ 1.414213562373095
 */
export function newtonRaphson(
    f: (x: number) => number,
    df: (x: number) => number,
    x0: number,
    options: RootOptions = {}
): RootResult {
    const { maxIterations = 100, tolerance = 1e-10 } = options;

    let x = x0;
    let fx = f(x);
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const dfx = df(x);

        // Check for zero derivative
        if (Math.abs(dfx) < 1e-15) {
            throw new Error('Derivative is zero or near-zero; Newton-Raphson method fails');
        }

        // Newton-Raphson update
        const xNew = x - fx / dfx;
        fx = f(xNew);

        // Check convergence
        if (Math.abs(fx) < tolerance || Math.abs(xNew - x) < tolerance) {
            return { root: xNew, iterations, fValue: fx, converged: true };
        }

        x = xNew;
    }

    return { root: x, iterations, fValue: fx, converged: false };
}

/**
 * Secant Method
 *
 * Finds a root of f(x) = 0 using the secant method.
 * Similar to Newton-Raphson but approximates the derivative using finite differences.
 *
 * Algorithm:
 * Starting from two initial guesses x₀ and x₁, iterate:
 * x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))
 *
 * Geometric interpretation: Find where the secant line through (x_{n-1}, f(x_{n-1}))
 * and (x_n, f(x_n)) crosses the x-axis.
 *
 * Pros:
 * - Doesn't require derivative
 * - Superlinear convergence (order ≈ 1.618, the golden ratio!)
 * - Faster than bisection, simpler than Newton-Raphson
 *
 * Cons:
 * - May diverge if initial guesses are poor
 * - Slightly slower convergence than Newton-Raphson
 * - May fail if f(x_n) ≈ f(x_{n-1})
 *
 * Time Complexity: O(log(1/ε)^1.618) iterations typically
 *
 * @param f Function to find root of
 * @param x0 First initial guess
 * @param x1 Second initial guess
 * @param options Algorithm options
 * @returns Root finding result
 *
 * @example
 * // Find root of x^2 - 2 (sqrt(2))
 * const result = secant(x => x * x - 2, 1.0, 2.0);
 * console.log(result.root); // ≈ 1.414213562373095
 */
export function secant(
    f: (x: number) => number,
    x0: number,
    x1: number,
    options: RootOptions = {}
): RootResult {
    const { maxIterations = 100, tolerance = 1e-10 } = options;

    let xPrev = x0;
    let x = x1;
    let fPrev = f(xPrev);
    let fx = f(x);
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        // Check for zero denominator
        if (Math.abs(fx - fPrev) < 1e-15) {
            throw new Error('Denominator is zero or near-zero; secant method fails');
        }

        // Secant method update
        const xNew = x - fx * (x - xPrev) / (fx - fPrev);
        const fNew = f(xNew);

        // Check convergence
        if (Math.abs(fNew) < tolerance || Math.abs(xNew - x) < tolerance) {
            return { root: xNew, iterations, fValue: fNew, converged: true };
        }

        // Update for next iteration
        xPrev = x;
        fPrev = fx;
        x = xNew;
        fx = fNew;
    }

    return { root: x, iterations, fValue: fx, converged: false };
}

/**
 * Brent's Method
 *
 * Finds a root of f(x) = 0 using Brent's method, a hybrid algorithm combining
 * bisection, secant, and inverse quadratic interpolation.
 *
 * Algorithm:
 * - Uses inverse quadratic interpolation when possible (fast)
 * - Falls back to secant method when quadratic interpolation is unreliable
 * - Falls back to bisection when secant is unreliable or slow
 * - Maintains bracketing interval for guaranteed convergence
 *
 * Pros:
 * - Combines speed of secant/inverse quadratic with reliability of bisection
 * - Guaranteed to converge (like bisection)
 * - Usually converges much faster than bisection
 * - Considered one of the best general-purpose root finders
 * - Doesn't require derivative
 *
 * Cons:
 * - More complex implementation
 * - Requires bracketing interval
 *
 * Convergence: Superlinear (typically order 1.618-1.839)
 *
 * Reference: Brent, R.P. (1973). "Algorithms for Minimization without Derivatives"
 *
 * @param f Function to find root of
 * @param a Left endpoint of bracketing interval
 * @param b Right endpoint of bracketing interval
 * @param options Algorithm options
 * @returns Root finding result
 *
 * @example
 * // Find root of x^2 - 2 (sqrt(2))
 * const result = brent(x => x * x - 2, 0, 2);
 * console.log(result.root); // ≈ 1.414213562373095
 */
export function brent(
    f: (x: number) => number,
    a: number,
    b: number,
    options: RootOptions = {}
): RootResult {
    const { maxIterations = 100, tolerance = 1e-10 } = options;

    let fa = f(a);
    let fb = f(b);

    // Check if interval brackets a root
    if (fa * fb > 0) {
        throw new Error('Function must have opposite signs at endpoints a and b');
    }

    // Check if either endpoint is already a root
    if (Math.abs(fa) < tolerance) {
        return { root: a, iterations: 0, fValue: fa, converged: true };
    }
    if (Math.abs(fb) < tolerance) {
        return { root: b, iterations: 0, fValue: fb, converged: true };
    }

    // Ensure |f(a)| > |f(b)|
    if (Math.abs(fa) < Math.abs(fb)) {
        [a, b] = [b, a];
        [fa, fb] = [fb, fa];
    }

    let c = a;
    let fc = fa;
    let d = 0;
    let s = 0;
    let fs = 0;
    let mflag = true;
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        // Check convergence
        if (Math.abs(fb) < tolerance || Math.abs(b - a) < tolerance) {
            return { root: b, iterations, fValue: fb, converged: true };
        }

        if (Math.abs(fa - fc) > tolerance && Math.abs(fb - fc) > tolerance) {
            // Inverse quadratic interpolation
            s =
                (a * fb * fc) / ((fa - fb) * (fa - fc)) +
                (b * fa * fc) / ((fb - fa) * (fb - fc)) +
                (c * fa * fb) / ((fc - fa) * (fc - fb));
        } else {
            // Secant method
            s = b - fb * (b - a) / (fb - fa);
        }

        // Determine if we should use bisection instead
        const tmp1 = (3 * a + b) / 4;
        const condition1 = !(
            (s > tmp1 && s < b) ||
            (s < tmp1 && s > b)
        );
        const condition2 = mflag && Math.abs(s - b) >= Math.abs(b - c) / 2;
        const condition3 = !mflag && Math.abs(s - b) >= Math.abs(c - d) / 2;
        const condition4 = mflag && Math.abs(b - c) < tolerance;
        const condition5 = !mflag && Math.abs(c - d) < tolerance;

        if (condition1 || condition2 || condition3 || condition4 || condition5) {
            // Use bisection
            s = (a + b) / 2;
            mflag = true;
        } else {
            mflag = false;
        }

        fs = f(s);
        d = c;
        c = b;
        fc = fb;

        if (fa * fs < 0) {
            b = s;
            fb = fs;
        } else {
            a = s;
            fa = fs;
        }

        // Ensure |f(a)| > |f(b)|
        if (Math.abs(fa) < Math.abs(fb)) {
            [a, b] = [b, a];
            [fa, fb] = [fb, fa];
        }
    }

    return { root: b, iterations, fValue: fb, converged: false };
}

/**
 * Options for polynomial root finding
 */
export interface PolynomialRootOptions {
    /** Maximum number of iterations */
    maxIterations?: number;
    /** Convergence tolerance */
    tolerance?: number;
}

/**
 * Durand-Kerner Method (also known as Weierstrass method)
 *
 * Finds all roots of a polynomial simultaneously using the Durand-Kerner algorithm.
 * This is an iterative method that finds all complex roots at once.
 *
 * Algorithm:
 * For polynomial p(z) = a_n*z^n + a_{n-1}*z^{n-1} + ... + a_1*z + a_0
 * Start with n initial guesses and iterate:
 * z_i^{(k+1)} = z_i^{(k)} - p(z_i^{(k)}) / ∏_{j≠i} (z_i^{(k)} - z_j^{(k)})
 *
 * Pros:
 * - Finds all roots simultaneously (complex and real)
 * - Elegant and simple implementation
 * - Cubic convergence when close to solution
 *
 * Cons:
 * - May be slow to converge for polynomials with clustered roots
 * - Requires complex arithmetic
 * - Sensitive to initial guesses
 *
 * Reference: Durand (1960), "Solutions Numériques des Équations Algébriques"
 *
 * @param coefficients Polynomial coefficients [a_0, a_1, ..., a_n] where p(x) = a_n*x^n + ... + a_0
 * @param options Algorithm options
 * @returns Array of complex roots
 *
 * @example
 * // Find roots of x^2 - 1 (roots are 1 and -1)
 * const roots = polynomialRoots([−1, 0, 1]); // coefficients of -1 + 0*x + 1*x^2
 * console.log(roots); // [Complex(1, 0), Complex(-1, 0)]
 *
 * @example
 * // Find roots of x^2 + 1 (roots are i and -i)
 * const roots = polynomialRoots([1, 0, 1]); // coefficients of 1 + 0*x + 1*x^2
 * console.log(roots); // [Complex(0, 1), Complex(0, -1)]
 */
export function polynomialRoots(
    coefficients: number[],
    options: PolynomialRootOptions = {}
): Complex[] {
    const { maxIterations = 100, tolerance = 1e-10 } = options;

    // Remove leading zeros
    while (coefficients.length > 1 && Math.abs(coefficients[coefficients.length - 1]) < 1e-15) {
        coefficients.pop();
    }

    const degree = coefficients.length - 1;

    if (degree < 1) {
        throw new Error('Polynomial must have degree at least 1');
    }

    if (degree === 1) {
        // Linear: ax + b = 0 => x = -b/a
        const root = -coefficients[0] / coefficients[1];
        return [new Complex(root, 0)];
    }

    if (degree === 2) {
        // Quadratic: ax^2 + bx + c = 0
        const [c, b, a] = coefficients;
        const discriminant = b * b - 4 * a * c;

        if (discriminant >= 0) {
            const sqrtD = Math.sqrt(discriminant);
            return [
                new Complex((-b + sqrtD) / (2 * a), 0),
                new Complex((-b - sqrtD) / (2 * a), 0),
            ];
        } else {
            const realPart = -b / (2 * a);
            const imagPart = Math.sqrt(-discriminant) / (2 * a);
            return [
                new Complex(realPart, imagPart),
                new Complex(realPart, -imagPart),
            ];
        }
    }

    // For degree >= 3, use Durand-Kerner method
    // Normalize polynomial (make leading coefficient 1)
    const leadingCoef = coefficients[coefficients.length - 1];
    const normalizedCoefs = coefficients.map(c => c / leadingCoef);

    // Initialize roots using Aberth's initial approximations
    // Place them on a circle with radius R
    const R = 1 + Math.max(...normalizedCoefs.slice(0, -1).map(Math.abs));
    const roots: Complex[] = [];

    for (let k = 0; k < degree; k++) {
        const angle = (2 * Math.PI * k) / degree - Math.PI / 2;
        roots.push(new Complex(R * Math.cos(angle), R * Math.sin(angle)));
    }

    // Evaluate polynomial at a complex point
    function evalPoly(z: Complex): Complex {
        let result = new Complex(normalizedCoefs[degree], 0);
        for (let i = degree - 1; i >= 0; i--) {
            result = result.multiply(z).add(new Complex(normalizedCoefs[i], 0));
        }
        return result;
    }

    // Durand-Kerner iteration
    for (let iter = 0; iter < maxIterations; iter++) {
        const newRoots: Complex[] = [];
        let maxChange = 0;

        for (let i = 0; i < degree; i++) {
            const z = roots[i];
            const pz = evalPoly(z);

            // Compute product of differences
            let prod = new Complex(1, 0);
            for (let j = 0; j < degree; j++) {
                if (i !== j) {
                    prod = prod.multiply(z.subtract(roots[j]));
                }
            }

            // Durand-Kerner update
            const correction = pz.divide(prod);
            const newRoot = z.subtract(correction);
            newRoots.push(newRoot);

            // Track maximum change
            const change = correction.magnitude();
            if (change > maxChange) {
                maxChange = change;
            }
        }

        // Update roots
        for (let i = 0; i < degree; i++) {
            roots[i] = newRoots[i];
        }

        // Check convergence
        if (maxChange < tolerance) {
            break;
        }
    }

    // Clean up roots: make very small imaginary parts zero
    return roots.map(root => {
        if (Math.abs(root.imag) < tolerance) {
            return new Complex(root.real, 0);
        }
        return root;
    });
}

/**
 * Find all real roots of a polynomial
 *
 * Convenience function that finds all roots using polynomialRoots and filters
 * for real roots (those with negligible imaginary part).
 *
 * @param coefficients Polynomial coefficients [a_0, a_1, ..., a_n]
 * @param options Algorithm options
 * @returns Array of real roots
 *
 * @example
 * // Find roots of x^2 - 1 (roots are 1 and -1)
 * const roots = polynomialRealRoots([-1, 0, 1]);
 * console.log(roots); // [1, -1] (approximately)
 */
export function polynomialRealRoots(
    coefficients: number[],
    options: PolynomialRootOptions = {}
): number[] {
    const tolerance = options.tolerance ?? 1e-10;
    const allRoots = polynomialRoots(coefficients, options);

    return allRoots
        .filter(root => Math.abs(root.imag) < tolerance)
        .map(root => root.real);
}
