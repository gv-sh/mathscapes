/**
 * Numerical Integration (Quadrature) Module
 *
 * This module provides a comprehensive suite of numerical integration methods
 * for approximating definite integrals. These methods are essential for scientific
 * computing, physics simulations, statistics, and engineering applications.
 *
 * @module numeric/integrate
 */

/**
 * Options for numerical integration methods
 */
export interface IntegrateOptions {
    /**
     * Maximum number of function evaluations (for adaptive methods)
     * @default 10000
     */
    maxEvaluations?: number;

    /**
     * Absolute tolerance for convergence
     * @default 1e-10
     */
    absTol?: number;

    /**
     * Relative tolerance for convergence
     * @default 1e-10
     */
    relTol?: number;

    /**
     * Number of subintervals (for non-adaptive methods)
     * @default 1000
     */
    n?: number;
}

/**
 * Result of numerical integration
 */
export interface IntegrateResult {
    /** Approximated integral value */
    value: number;

    /** Number of function evaluations used */
    evaluations: number;

    /** Estimated error (if available) */
    error?: number;

    /** Whether the method converged */
    converged?: boolean;
}

/**
 * Options for Monte Carlo integration
 */
export interface MonteCarloOptions {
    /**
     * Number of random samples
     * @default 10000
     */
    samples?: number;

    /**
     * Random seed for reproducibility
     */
    seed?: number;
}

/**
 * Trapezoidal Rule
 *
 * Approximates the integral using the trapezoidal rule, which connects
 * consecutive function values with straight lines.
 *
 * Formula: ∫[a,b] f(x)dx ≈ h/2 * [f(a) + 2∑f(xᵢ) + f(b)]
 * where h = (b-a)/n
 *
 * Time complexity: O(n)
 * Error: O(h²) where h = (b-a)/n
 *
 * @param f - Function to integrate
 * @param a - Lower bound
 * @param b - Upper bound
 * @param options - Integration options
 * @returns Integration result
 *
 * @example
 * ```typescript
 * // Integrate x² from 0 to 1
 * const result = trapezoidal(x => x * x, 0, 1, { n: 1000 });
 * console.log(result.value); // ≈ 0.333... (exact: 1/3)
 * ```
 */
export function trapezoidal(
    f: (x: number) => number,
    a: number,
    b: number,
    options: IntegrateOptions = {}
): IntegrateResult {
    const n = options.n ?? 1000;
    const h = (b - a) / n;

    let sum = (f(a) + f(b)) / 2;
    let evaluations = 2;

    for (let i = 1; i < n; i++) {
        sum += f(a + i * h);
        evaluations++;
    }

    return {
        value: h * sum,
        evaluations,
    };
}

/**
 * Simpson's Rule
 *
 * Approximates the integral using quadratic polynomials (parabolas) through
 * consecutive triplets of points.
 *
 * Formula: ∫[a,b] f(x)dx ≈ h/3 * [f(a) + 4∑f(x₂ᵢ₊₁) + 2∑f(x₂ᵢ) + f(b)]
 * where h = (b-a)/n, n must be even
 *
 * Time complexity: O(n)
 * Error: O(h⁴) where h = (b-a)/n
 *
 * @param f - Function to integrate
 * @param a - Lower bound
 * @param b - Upper bound
 * @param options - Integration options
 * @returns Integration result
 *
 * @example
 * ```typescript
 * // Integrate sin(x) from 0 to π
 * const result = simpson(Math.sin, 0, Math.PI, { n: 100 });
 * console.log(result.value); // ≈ 2.0
 * ```
 */
export function simpson(
    f: (x: number) => number,
    a: number,
    b: number,
    options: IntegrateOptions = {}
): IntegrateResult {
    let n = options.n ?? 1000;

    // Simpson's rule requires an even number of intervals
    if (n % 2 !== 0) {
        n++;
    }

    const h = (b - a) / n;
    let sum = f(a) + f(b);
    let evaluations = 2;

    // Add odd-indexed points (multiplied by 4)
    for (let i = 1; i < n; i += 2) {
        sum += 4 * f(a + i * h);
        evaluations++;
    }

    // Add even-indexed points (multiplied by 2)
    for (let i = 2; i < n; i += 2) {
        sum += 2 * f(a + i * h);
        evaluations++;
    }

    return {
        value: (h / 3) * sum,
        evaluations,
    };
}

/**
 * Romberg Integration
 *
 * Uses Richardson extrapolation on the trapezoidal rule to achieve
 * higher-order accuracy. Successively refines the estimate by doubling
 * the number of intervals and extrapolating.
 *
 * Time complexity: O(n log n)
 * Error: Can achieve very high accuracy with proper refinement
 *
 * @param f - Function to integrate
 * @param a - Lower bound
 * @param b - Upper bound
 * @param options - Integration options
 * @returns Integration result
 *
 * @example
 * ```typescript
 * // Integrate e^x from 0 to 1
 * const result = romberg(Math.exp, 0, 1, { absTol: 1e-12 });
 * console.log(result.value); // ≈ 1.718281828... (exact: e - 1)
 * ```
 */
export function romberg(
    f: (x: number) => number,
    a: number,
    b: number,
    options: IntegrateOptions = {}
): IntegrateResult {
    const maxIterations = 20;
    const absTol = options.absTol ?? 1e-10;
    const relTol = options.relTol ?? 1e-10;

    const R: number[][] = Array.from({ length: maxIterations }, () => []);
    let evaluations = 0;

    // First approximation (single trapezoid)
    R[0][0] = ((b - a) / 2) * (f(a) + f(b));
    evaluations += 2;

    for (let i = 1; i < maxIterations; i++) {
        // Trapezoidal approximation with 2^i intervals
        const h = (b - a) / Math.pow(2, i);
        let sum = 0;

        for (let k = 1; k <= Math.pow(2, i - 1); k++) {
            sum += f(a + (2 * k - 1) * h);
            evaluations++;
        }

        R[i][0] = R[i - 1][0] / 2 + h * sum;

        // Richardson extrapolation
        for (let j = 1; j <= i; j++) {
            const pow4j = Math.pow(4, j);
            R[i][j] = (pow4j * R[i][j - 1] - R[i - 1][j - 1]) / (pow4j - 1);
        }

        // Check convergence
        if (i > 0) {
            const error = Math.abs(R[i][i] - R[i - 1][i - 1]);
            const value = R[i][i];

            if (
                error < absTol ||
                (Math.abs(value) > 0 && error / Math.abs(value) < relTol)
            ) {
                return {
                    value,
                    evaluations,
                    error,
                    converged: true,
                };
            }
        }
    }

    return {
        value: R[maxIterations - 1][maxIterations - 1],
        evaluations,
        converged: false,
    };
}

/**
 * Gauss-Legendre quadrature nodes and weights
 * Pre-computed for efficiency
 */
const GAUSS_LEGENDRE_NODES: { [key: number]: { nodes: number[]; weights: number[] } } = {
    2: {
        nodes: [-0.5773502691896257, 0.5773502691896257],
        weights: [1.0, 1.0],
    },
    3: {
        nodes: [-0.7745966692414834, 0.0, 0.7745966692414834],
        weights: [0.5555555555555556, 0.8888888888888888, 0.5555555555555556],
    },
    4: {
        nodes: [
            -0.8611363115940526,
            -0.3399810435848563,
            0.3399810435848563,
            0.8611363115940526,
        ],
        weights: [
            0.3478548451374538,
            0.6521451548625461,
            0.6521451548625461,
            0.3478548451374538,
        ],
    },
    5: {
        nodes: [
            -0.906179845938664,
            -0.5384693101056831,
            0.0,
            0.5384693101056831,
            0.906179845938664,
        ],
        weights: [
            0.23692688505618908,
            0.47862867049936647,
            0.5688888888888889,
            0.47862867049936647,
            0.23692688505618908,
        ],
    },
};

/**
 * Gaussian Quadrature (Gauss-Legendre)
 *
 * Uses optimal node placement and weights to achieve high accuracy
 * with fewer function evaluations. For smooth functions, this is often
 * more efficient than Newton-Cotes formulas.
 *
 * An n-point Gaussian quadrature is exact for polynomials of degree 2n-1.
 *
 * Time complexity: O(n)
 * Error: Exponentially decreasing with n for smooth functions
 *
 * @param f - Function to integrate
 * @param a - Lower bound
 * @param b - Upper bound
 * @param n - Number of quadrature points (2, 3, 4, or 5)
 * @returns Integration result
 *
 * @example
 * ```typescript
 * // Integrate x³ from -1 to 1 (exact with n=2)
 * const result = gaussLegendre(x => x ** 3, -1, 1, 2);
 * console.log(result.value); // 0 (exact)
 * ```
 */
export function gaussLegendre(
    f: (x: number) => number,
    a: number,
    b: number,
    n: number = 5
): IntegrateResult {
    if (!GAUSS_LEGENDRE_NODES[n]) {
        throw new Error(
            `Gaussian quadrature with ${n} points not available. Use n = 2, 3, 4, or 5.`
        );
    }

    const { nodes, weights } = GAUSS_LEGENDRE_NODES[n];
    const halfLength = (b - a) / 2;
    const midpoint = (a + b) / 2;

    let sum = 0;
    for (let i = 0; i < n; i++) {
        const x = midpoint + halfLength * nodes[i];
        sum += weights[i] * f(x);
    }

    return {
        value: halfLength * sum,
        evaluations: n,
    };
}

/**
 * Adaptive Quadrature (Adaptive Simpson)
 *
 * Recursively subdivides the integration interval where the function
 * varies rapidly, achieving high accuracy with fewer function evaluations
 * for functions with localized features.
 *
 * Time complexity: O(n log n) in typical cases
 * Error: Controlled by tolerance parameters
 *
 * @param f - Function to integrate
 * @param a - Lower bound
 * @param b - Upper bound
 * @param options - Integration options
 * @returns Integration result
 *
 * @example
 * ```typescript
 * // Integrate a function with a sharp peak
 * const f = (x: number) => 1 / (1 + 100 * (x - 0.5) ** 2);
 * const result = adaptiveQuadrature(f, 0, 1, { absTol: 1e-10 });
 * ```
 */
export function adaptiveQuadrature(
    f: (x: number) => number,
    a: number,
    b: number,
    options: IntegrateOptions = {}
): IntegrateResult {
    const absTol = options.absTol ?? 1e-10;
    const relTol = options.relTol ?? 1e-10;
    const maxEvaluations = options.maxEvaluations ?? 10000;

    let totalEvaluations = 0;

    function adaptiveSimpsonAux(
        a: number,
        b: number,
        fa: number,
        fm: number,
        fb: number,
        S: number,
        depth: number
    ): number {
        const m = (a + b) / 2;
        const lm = (a + m) / 2;
        const rm = (m + b) / 2;

        const flm = f(lm);
        const frm = f(rm);
        totalEvaluations += 2;

        const Sleft = ((m - a) / 6) * (fa + 4 * flm + fm);
        const Sright = ((b - m) / 6) * (fm + 4 * frm + fb);
        const S2 = Sleft + Sright;

        const error = Math.abs(S2 - S);
        const tol = Math.max(absTol, relTol * Math.abs(S2));

        if (depth > 50 || totalEvaluations > maxEvaluations) {
            return S2;
        }

        if (error < 15 * tol) {
            return S2 + (S2 - S) / 15;
        }

        return (
            adaptiveSimpsonAux(a, m, fa, flm, fm, Sleft, depth + 1) +
            adaptiveSimpsonAux(m, b, fm, frm, fb, Sright, depth + 1)
        );
    }

    const m = (a + b) / 2;
    const fa = f(a);
    const fm = f(m);
    const fb = f(b);
    totalEvaluations = 3;

    const S = ((b - a) / 6) * (fa + 4 * fm + fb);
    const value = adaptiveSimpsonAux(a, b, fa, fm, fb, S, 0);

    return {
        value,
        evaluations: totalEvaluations,
        converged: totalEvaluations < maxEvaluations,
    };
}

/**
 * Simple LCG (Linear Congruential Generator) for reproducible randomness
 */
class SimpleRandom {
    private seed: number;

    constructor(seed: number = Date.now()) {
        this.seed = seed;
    }

    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
        return this.seed / 2 ** 32;
    }
}

/**
 * Monte Carlo Integration (1D)
 *
 * Uses random sampling to estimate the integral. Particularly useful for
 * high-dimensional integrals or when the integration domain is complex.
 *
 * Formula: ∫[a,b] f(x)dx ≈ (b-a) * (1/N) * ∑f(xᵢ)
 * where xᵢ are uniformly distributed random points in [a,b]
 *
 * Time complexity: O(n)
 * Error: O(1/√n) by Central Limit Theorem
 *
 * @param f - Function to integrate
 * @param a - Lower bound
 * @param b - Upper bound
 * @param options - Monte Carlo options
 * @returns Integration result with error estimate
 *
 * @example
 * ```typescript
 * // Integrate sin(x) from 0 to π
 * const result = monteCarlo(Math.sin, 0, Math.PI, { samples: 100000 });
 * console.log(result.value); // ≈ 2.0
 * console.log(result.error); // Standard error estimate
 * ```
 */
export function monteCarlo(
    f: (x: number) => number,
    a: number,
    b: number,
    options: MonteCarloOptions = {}
): IntegrateResult {
    const samples = options.samples ?? 10000;
    const rng = new SimpleRandom(options.seed);

    let sum = 0;
    let sumSquares = 0;

    for (let i = 0; i < samples; i++) {
        const x = a + (b - a) * rng.next();
        const fx = f(x);
        sum += fx;
        sumSquares += fx * fx;
    }

    const mean = sum / samples;
    const variance = sumSquares / samples - mean * mean;
    const value = (b - a) * mean;
    const error = (b - a) * Math.sqrt(variance / samples);

    return {
        value,
        evaluations: samples,
        error,
        converged: true,
    };
}

/**
 * Monte Carlo Integration (Multi-dimensional)
 *
 * Estimates multi-dimensional integrals using random sampling.
 * Very useful for high-dimensional integrals where deterministic
 * methods become computationally infeasible (curse of dimensionality).
 *
 * Formula: ∫∫...∫ f(x₁,...,xₙ)dx₁...dxₙ ≈ V * (1/N) * ∑f(xᵢ)
 * where V is the volume of the integration domain
 *
 * Time complexity: O(n * d) where d is the dimension
 * Error: O(1/√n) independent of dimension
 *
 * @param f - Function to integrate (takes array of coordinates)
 * @param bounds - Array of [min, max] for each dimension
 * @param options - Monte Carlo options
 * @returns Integration result with error estimate
 *
 * @example
 * ```typescript
 * // Integrate x² + y² over [0,1] × [0,1]
 * const f = ([x, y]: number[]) => x * x + y * y;
 * const result = monteCarloMulti(f, [[0, 1], [0, 1]], { samples: 100000 });
 * console.log(result.value); // ≈ 2/3
 * ```
 */
export function monteCarloMulti(
    f: (point: number[]) => number,
    bounds: [number, number][],
    options: MonteCarloOptions = {}
): IntegrateResult {
    const samples = options.samples ?? 10000;
    const dim = bounds.length;
    const rng = new SimpleRandom(options.seed);

    // Calculate volume of integration domain
    let volume = 1;
    for (const [min, max] of bounds) {
        volume *= max - min;
    }

    let sum = 0;
    let sumSquares = 0;

    for (let i = 0; i < samples; i++) {
        const point: number[] = [];
        for (const [min, max] of bounds) {
            point.push(min + (max - min) * rng.next());
        }

        const fx = f(point);
        sum += fx;
        sumSquares += fx * fx;
    }

    const mean = sum / samples;
    const variance = sumSquares / samples - mean * mean;
    const value = volume * mean;
    const error = volume * Math.sqrt(variance / samples);

    return {
        value,
        evaluations: samples,
        error,
        converged: true,
    };
}

/**
 * Composite Integration
 *
 * Divides the integration interval into subintervals and applies
 * a quadrature rule to each. This is a general framework that can
 * use any of the basic quadrature rules.
 *
 * @param f - Function to integrate
 * @param a - Lower bound
 * @param b - Upper bound
 * @param rule - Quadrature rule to apply to each subinterval
 * @param subintervals - Number of subintervals
 * @returns Integration result
 */
export function composite(
    f: (x: number) => number,
    a: number,
    b: number,
    rule: (f: (x: number) => number, a: number, b: number) => IntegrateResult,
    subintervals: number = 10
): IntegrateResult {
    const h = (b - a) / subintervals;
    let sum = 0;
    let totalEvaluations = 0;

    for (let i = 0; i < subintervals; i++) {
        const ai = a + i * h;
        const bi = ai + h;
        const result = rule(f, ai, bi);
        sum += result.value;
        totalEvaluations += result.evaluations;
    }

    return {
        value: sum,
        evaluations: totalEvaluations,
    };
}
