/**
 * Multivariate Optimization Algorithms
 *
 * Numerical methods for finding minima (or maxima) of multi-variable functions.
 * These algorithms are essential for machine learning, engineering optimization,
 * operations research, and scientific computing.
 *
 * Applications:
 * - Machine learning (training neural networks, parameter estimation)
 * - Engineering design optimization
 * - Portfolio optimization in finance
 * - Resource allocation and logistics
 * - Inverse problems and curve fitting
 *
 * Note: All algorithms find minima. To find maxima, minimize the negative of your function.
 *
 * References:
 * - Nocedal & Wright, "Numerical Optimization" (2006)
 * - Press et al., "Numerical Recipes" (2007)
 * - Gill, Murray & Wright, "Practical Optimization" (1981)
 * - Boyd & Vandenberghe, "Convex Optimization" (2004)
 */

/**
 * Vector type for optimization
 */
export type Vector = number[];

/**
 * Matrix type (2D array)
 */
export type Matrix = number[][];

/**
 * Objective function type (takes a vector, returns a scalar)
 */
export type ObjectiveFunction = (x: Vector) => number;

/**
 * Gradient function type (takes a vector, returns gradient vector)
 */
export type GradientFunction = (x: Vector) => Vector;

/**
 * Hessian function type (takes a vector, returns Hessian matrix)
 */
export type HessianFunction = (x: Vector) => Matrix;

/**
 * Constraint function type (returns value ≤ 0 for feasible points)
 */
export type ConstraintFunction = (x: Vector) => number;

/**
 * Options for multivariate optimization algorithms
 */
export interface MultivariateOptimizeOptions {
    /** Maximum number of iterations */
    maxIterations?: number;
    /** Convergence tolerance for function value */
    tolerance?: number;
    /** Convergence tolerance for gradient norm */
    gradientTolerance?: number;
    /** Step size for numerical gradient approximation */
    stepSize?: number;
    /** Learning rate (for gradient-based methods) */
    learningRate?: number;
    /** Momentum coefficient (for momentum-based methods) */
    momentum?: number;
    /** History size for L-BFGS */
    historySize?: number;
    /** Initial temperature for simulated annealing */
    temperature?: number;
    /** Cooling rate for simulated annealing */
    coolingRate?: number;
    /** Population size for genetic algorithm */
    populationSize?: number;
    /** Mutation rate for genetic algorithm */
    mutationRate?: number;
    /** Crossover rate for genetic algorithm */
    crossoverRate?: number;
    /** Penalty coefficient for constrained optimization */
    penaltyCoefficient?: number;
    /** Bounds for variables [min, max] */
    bounds?: [number, number][];
}

/**
 * Result from a multivariate optimization algorithm
 */
export interface MultivariateOptimizeResult {
    /** The minimizer (x vector at minimum) */
    x: Vector;
    /** The minimum value (f(x) at minimum) */
    fx: number;
    /** Number of iterations taken */
    iterations: number;
    /** Whether the algorithm converged */
    converged: boolean;
    /** Number of function evaluations */
    functionEvaluations?: number;
    /** Final gradient norm (for gradient-based methods) */
    gradientNorm?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Compute the Euclidean norm (L2 norm) of a vector
 */
function norm(v: Vector): number {
    return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Compute dot product of two vectors
 */
function dot(a: Vector, b: Vector): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have same length');
    }
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

/**
 * Add two vectors: a + b
 */
function add(a: Vector, b: Vector): Vector {
    if (a.length !== b.length) {
        throw new Error('Vectors must have same length');
    }
    return a.map((val, i) => val + b[i]);
}

/**
 * Subtract two vectors: a - b
 */
function subtract(a: Vector, b: Vector): Vector {
    if (a.length !== b.length) {
        throw new Error('Vectors must have same length');
    }
    return a.map((val, i) => val - b[i]);
}

/**
 * Multiply vector by scalar: s * v
 */
function scale(s: number, v: Vector): Vector {
    return v.map(val => s * val);
}

/**
 * Matrix-vector multiplication: A * v
 */
function matmul(A: Matrix, v: Vector): Vector {
    if (A[0].length !== v.length) {
        throw new Error('Matrix columns must match vector length');
    }
    return A.map(row => dot(row, v));
}

/**
 * Approximate gradient using finite differences (central differences)
 */
function approximateGradient(
    f: ObjectiveFunction,
    x: Vector,
    h: number = 1e-8
): Vector {
    const n = x.length;
    const grad = new Array(n);

    for (let i = 0; i < n; i++) {
        const xPlus = [...x];
        const xMinus = [...x];
        xPlus[i] += h;
        xMinus[i] -= h;
        grad[i] = (f(xPlus) - f(xMinus)) / (2 * h);
    }

    return grad;
}

/**
 * Approximate Hessian using finite differences
 */
function approximateHessian(
    f: ObjectiveFunction,
    x: Vector,
    h: number = 1e-5
): Matrix {
    const n = x.length;
    const hess: Matrix = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const xpp = [...x];
            const xpm = [...x];
            const xmp = [...x];
            const xmm = [...x];

            xpp[i] += h;
            xpp[j] += h;

            xpm[i] += h;
            xpm[j] -= h;

            xmp[i] -= h;
            xmp[j] += h;

            xmm[i] -= h;
            xmm[j] -= h;

            hess[i][j] = (f(xpp) - f(xpm) - f(xmp) + f(xmm)) / (4 * h * h);
        }
    }

    return hess;
}

/**
 * Solve linear system Ax = b using Gaussian elimination with partial pivoting
 */
function solveLinearSystem(A: Matrix, b: Vector): Vector {
    const n = A.length;
    // Create augmented matrix [A | b]
    const aug: Matrix = A.map((row, i) => [...row, b[i]]);

    // Forward elimination with partial pivoting
    for (let k = 0; k < n; k++) {
        // Find pivot
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(aug[i][k]) > Math.abs(aug[maxRow][k])) {
                maxRow = i;
            }
        }

        // Swap rows
        [aug[k], aug[maxRow]] = [aug[maxRow], aug[k]];

        // Check for singular matrix
        if (Math.abs(aug[k][k]) < 1e-15) {
            throw new Error('Matrix is singular or nearly singular');
        }

        // Eliminate
        for (let i = k + 1; i < n; i++) {
            const factor = aug[i][k] / aug[k][k];
            for (let j = k; j <= n; j++) {
                aug[i][j] -= factor * aug[k][j];
            }
        }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = aug[i][n];
        for (let j = i + 1; j < n; j++) {
            sum -= aug[i][j] * x[j];
        }
        x[i] = sum / aug[i][i];
    }

    return x;
}

/**
 * Create identity matrix
 */
function identityMatrix(n: number): Matrix {
    return Array(n).fill(0).map((_, i) =>
        Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    );
}

/**
 * Line search using backtracking (Armijo condition)
 */
function lineSearch(
    f: ObjectiveFunction,
    x: Vector,
    direction: Vector,
    grad: Vector,
    alpha: number = 1.0,
    rho: number = 0.5,
    c: number = 1e-4
): number {
    const fx = f(x);
    const slope = dot(grad, direction);

    // If direction is not a descent direction, return small step
    if (slope >= 0) {
        return 1e-10;
    }

    let currentAlpha = alpha;
    let iterations = 0;
    const maxIterations = 50;

    while (iterations < maxIterations) {
        const xNew = add(x, scale(currentAlpha, direction));
        const fxNew = f(xNew);

        // Check Armijo condition: f(x + α*d) ≤ f(x) + c*α*∇f·d
        if (fxNew <= fx + c * currentAlpha * slope) {
            return currentAlpha;
        }

        currentAlpha *= rho;
        iterations++;
    }

    return currentAlpha;
}

// ============================================================================
// Gradient-Based Methods
// ============================================================================

/**
 * Gradient Descent with Momentum and Nesterov Acceleration
 *
 * Finds a local minimum of f(x) using gradient descent with optional momentum.
 * Supports both classical momentum and Nesterov accelerated gradient (NAG).
 *
 * Algorithm (with momentum):
 * v_{t+1} = β*v_t - α*∇f(x_t)
 * x_{t+1} = x_t + v_{t+1}
 *
 * Algorithm (Nesterov):
 * v_{t+1} = β*v_t - α*∇f(x_t + β*v_t)
 * x_{t+1} = x_t + v_{t+1}
 *
 * Momentum helps accelerate convergence and dampen oscillations.
 * Nesterov momentum provides better convergence properties.
 *
 * Pros:
 * - Simple and widely used
 * - Momentum accelerates convergence
 * - Works well for non-convex functions
 * - Forms basis for many ML optimizers
 *
 * Cons:
 * - Requires tuning learning rate and momentum
 * - Can be slow to converge without momentum
 * - Only finds local minima
 *
 * Convergence: Linear for convex functions with appropriate parameters
 *
 * @param f Objective function to minimize
 * @param grad Gradient function (optional; uses finite differences if not provided)
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize Rosenbrock function: f(x,y) = (1-x)^2 + 100*(y-x^2)^2
 * const result = gradientDescentMultivariate(
 *   ([x, y]) => (1 - x) ** 2 + 100 * (y - x ** 2) ** 2,
 *   ([x, y]) => [-2 * (1 - x) - 400 * x * (y - x ** 2), 200 * (y - x ** 2)],
 *   [0, 0],
 *   { learningRate: 0.001, momentum: 0.9, maxIterations: 10000 }
 * );
 */
export function gradientDescentMultivariate(
    f: ObjectiveFunction,
    grad?: GradientFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions & { nesterov?: boolean } = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 10000,
        tolerance = 1e-10,
        gradientTolerance = 1e-8,
        learningRate = 0.01,
        momentum = 0,
        stepSize = 1e-8,
        nesterov = false,
    } = options;

    const gradient = grad ?? ((x: Vector) => approximateGradient(f, x, stepSize));

    let x = [...x0];
    let fx = f(x);
    let velocity = x0.map(() => 0);
    let iterations = 0;
    let functionEvaluations = 1;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        // Compute gradient (at lookahead position for Nesterov)
        const evalPoint = nesterov ? add(x, scale(momentum, velocity)) : x;
        const g = gradient(evalPoint);
        functionEvaluations++;

        const gradNorm = norm(g);

        // Check convergence
        if (gradNorm < gradientTolerance) {
            return { x, fx, iterations, converged: true, functionEvaluations, gradientNorm: gradNorm };
        }

        // Update velocity with momentum
        velocity = add(scale(momentum, velocity), scale(-learningRate, g));

        // Update position
        const xNew = add(x, velocity);
        const fxNew = f(xNew);
        functionEvaluations++;

        // Check convergence based on function value change
        if (Math.abs(fxNew - fx) < tolerance && norm(subtract(xNew, x)) < tolerance) {
            return {
                x: xNew,
                fx: fxNew,
                iterations,
                converged: true,
                functionEvaluations,
                gradientNorm: gradNorm,
            };
        }

        x = xNew;
        fx = fxNew;
    }

    const finalGradNorm = norm(gradient(x));
    return { x, fx, iterations, converged: false, functionEvaluations, gradientNorm: finalGradNorm };
}

/**
 * Conjugate Gradient Method
 *
 * Finds the minimum of f(x) using the conjugate gradient method.
 * More efficient than steepest descent for quadratic functions and
 * often converges faster for general smooth functions.
 *
 * Algorithm:
 * 1. Start with initial point x₀, direction d₀ = -∇f(x₀)
 * 2. Perform line search along d_k to find α_k
 * 3. Update: x_{k+1} = x_k + α_k * d_k
 * 4. Compute new direction using Fletcher-Reeves formula:
 *    β_k = ||∇f(x_{k+1})||² / ||∇f(x_k)||²
 *    d_{k+1} = -∇f(x_{k+1}) + β_k * d_k
 *
 * Pros:
 * - Faster convergence than gradient descent
 * - Doesn't require Hessian matrix
 * - Memory efficient (only stores two vectors)
 * - Optimal for quadratic functions (converges in n steps)
 *
 * Cons:
 * - Requires line search
 * - Can lose conjugacy for non-quadratic functions
 * - Requires gradient computation
 *
 * Convergence: Superlinear for quadratic functions, typically faster than gradient descent
 *
 * @param f Objective function to minimize
 * @param grad Gradient function (optional; uses finite differences if not provided)
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize quadratic function
 * const result = conjugateGradient(
 *   x => x[0]**2 + x[1]**2,
 *   x => [2*x[0], 2*x[1]],
 *   [5, 5]
 * );
 */
export function conjugateGradient(
    f: ObjectiveFunction,
    grad?: GradientFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 1000,
        tolerance = 1e-10,
        gradientTolerance = 1e-8,
        stepSize = 1e-8,
    } = options;

    const gradient = grad ?? ((x: Vector) => approximateGradient(f, x, stepSize));

    let x = [...x0];
    let fx = f(x);
    let g = gradient(x);
    let d = scale(-1, g); // Initial search direction
    let iterations = 0;
    let functionEvaluations = 1;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const gradNorm = norm(g);

        // Check convergence
        if (gradNorm < gradientTolerance) {
            return { x, fx, iterations, converged: true, functionEvaluations, gradientNorm: gradNorm };
        }

        // Line search to find step size
        const alpha = lineSearch(f, x, d, g);
        functionEvaluations += 10; // Approximate line search evaluations

        // Update position
        const xNew = add(x, scale(alpha, d));
        const fxNew = f(xNew);
        functionEvaluations++;

        // Check convergence
        if (Math.abs(fxNew - fx) < tolerance && norm(subtract(xNew, x)) < tolerance) {
            const finalGradNorm = norm(gradient(xNew));
            return {
                x: xNew,
                fx: fxNew,
                iterations,
                converged: true,
                functionEvaluations,
                gradientNorm: finalGradNorm,
            };
        }

        // Compute new gradient
        const gNew = gradient(xNew);
        functionEvaluations++;

        // Fletcher-Reeves formula for beta
        const beta = dot(gNew, gNew) / dot(g, g);

        // Compute new search direction
        d = add(scale(-1, gNew), scale(beta, d));

        // Update for next iteration
        x = xNew;
        fx = fxNew;
        g = gNew;

        // Restart if not making progress (reset to steepest descent)
        if (iterations % x0.length === 0) {
            d = scale(-1, g);
        }
    }

    const finalGradNorm = norm(gradient(x));
    return { x, fx, iterations, converged: false, functionEvaluations, gradientNorm: finalGradNorm };
}

/**
 * BFGS (Broyden-Fletcher-Goldfarb-Shanno) Method
 *
 * Quasi-Newton method that builds an approximation to the Hessian matrix
 * using gradient information from previous iterations.
 *
 * Algorithm:
 * 1. Start with identity matrix as Hessian approximation B₀ = I
 * 2. Compute search direction: d_k = -B_k^{-1} * ∇f(x_k)
 * 3. Line search to find step size α_k
 * 4. Update: x_{k+1} = x_k + α_k * d_k
 * 5. Update Hessian approximation using BFGS formula
 *
 * Pros:
 * - Superlinear convergence (faster than conjugate gradient)
 * - Doesn't require explicit Hessian computation
 * - More robust than Newton's method
 * - Often the best general-purpose optimizer
 *
 * Cons:
 * - Requires O(n²) memory for Hessian approximation
 * - More complex than gradient descent
 * - Requires gradient computation
 *
 * Convergence: Superlinear
 *
 * @param f Objective function to minimize
 * @param grad Gradient function (optional; uses finite differences if not provided)
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize Rosenbrock function
 * const result = bfgs(
 *   ([x, y]) => (1 - x) ** 2 + 100 * (y - x ** 2) ** 2,
 *   undefined,
 *   [-1, -1]
 * );
 */
export function bfgs(
    f: ObjectiveFunction,
    grad?: GradientFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 1000,
        tolerance = 1e-10,
        gradientTolerance = 1e-8,
        stepSize = 1e-8,
    } = options;

    const n = x0.length;
    const gradient = grad ?? ((x: Vector) => approximateGradient(f, x, stepSize));

    let x = [...x0];
    let fx = f(x);
    let g = gradient(x);
    let B = identityMatrix(n); // Hessian approximation (actually B^{-1})
    let iterations = 0;
    let functionEvaluations = 1;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const gradNorm = norm(g);

        // Check convergence
        if (gradNorm < gradientTolerance) {
            return { x, fx, iterations, converged: true, functionEvaluations, gradientNorm: gradNorm };
        }

        // Compute search direction: d = -B * g
        const d = scale(-1, matmul(B, g));

        // Line search
        const alpha = lineSearch(f, x, d, g);
        functionEvaluations += 10;

        // Compute step
        const s = scale(alpha, d);
        const xNew = add(x, s);
        const fxNew = f(xNew);
        functionEvaluations++;

        // Check convergence
        if (Math.abs(fxNew - fx) < tolerance && norm(s) < tolerance) {
            const gNew = gradient(xNew);
            const finalGradNorm = norm(gNew);
            return {
                x: xNew,
                fx: fxNew,
                iterations,
                converged: true,
                functionEvaluations,
                gradientNorm: finalGradNorm,
            };
        }

        // Compute gradient at new point
        const gNew = gradient(xNew);
        functionEvaluations++;

        // Compute gradient difference
        const y = subtract(gNew, g);

        // BFGS update formula (Sherman-Morrison formula)
        const rho = 1 / dot(y, s);

        if (Math.abs(rho) < 1e-15 || !isFinite(rho)) {
            // Reset to identity if update fails
            B = identityMatrix(n);
        } else {
            // BFGS update: B_{k+1} = (I - ρ*s*y^T) * B_k * (I - ρ*y*s^T) + ρ*s*s^T
            const BNew: Matrix = Array(n).fill(0).map(() => Array(n).fill(0));

            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    let val = B[i][j];

                    // Subtract B_k * ρ*y*s^T
                    for (let k = 0; k < n; k++) {
                        val -= rho * B[i][k] * y[k] * s[j];
                    }

                    // Subtract ρ*s*y^T * B_k
                    for (let k = 0; k < n; k++) {
                        val -= rho * s[i] * y[k] * B[k][j];
                    }

                    // Add ρ^2 * s*y^T * B_k * y*s^T
                    for (let k = 0; k < n; k++) {
                        for (let l = 0; l < n; l++) {
                            val += rho * rho * s[i] * y[k] * B[k][l] * y[l] * s[j];
                        }
                    }

                    // Add ρ*s*s^T
                    val += rho * s[i] * s[j];

                    BNew[i][j] = val;
                }
            }

            B = BNew;
        }

        x = xNew;
        fx = fxNew;
        g = gNew;
    }

    const finalGradNorm = norm(gradient(x));
    return { x, fx, iterations, converged: false, functionEvaluations, gradientNorm: finalGradNorm };
}

/**
 * L-BFGS (Limited-memory BFGS) Method
 *
 * Memory-efficient variant of BFGS that stores only a few vectors
 * instead of the full Hessian approximation. Ideal for large-scale problems.
 *
 * Algorithm:
 * - Maintains only the last m (s, y) pairs instead of full Hessian
 * - Computes search direction using two-loop recursion
 * - Uses O(mn) memory instead of O(n²)
 *
 * Pros:
 * - Memory efficient: O(mn) vs O(n²) for BFGS
 * - Suitable for large-scale problems
 * - Similar convergence to BFGS
 * - Widely used in machine learning
 *
 * Cons:
 * - Slightly slower convergence than full BFGS
 * - More complex implementation
 * - Requires gradient computation
 *
 * Convergence: Superlinear (slightly slower than BFGS)
 *
 * @param f Objective function to minimize
 * @param grad Gradient function (optional; uses finite differences if not provided)
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize high-dimensional function
 * const result = lbfgs(
 *   x => x.reduce((sum, xi) => sum + xi**2, 0),
 *   undefined,
 *   Array(100).fill(1),
 *   { historySize: 10 }
 * );
 */
export function lbfgs(
    f: ObjectiveFunction,
    grad?: GradientFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 1000,
        tolerance = 1e-10,
        gradientTolerance = 1e-8,
        stepSize = 1e-8,
        historySize = 10,
    } = options;

    const m = historySize;
    const gradient = grad ?? ((x: Vector) => approximateGradient(f, x, stepSize));

    let x = [...x0];
    let fx = f(x);
    let g = gradient(x);

    const sHistory: Vector[] = [];
    const yHistory: Vector[] = [];
    const rhoHistory: number[] = [];

    let iterations = 0;
    let functionEvaluations = 1;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const gradNorm = norm(g);

        // Check convergence
        if (gradNorm < gradientTolerance) {
            return { x, fx, iterations, converged: true, functionEvaluations, gradientNorm: gradNorm };
        }

        // Compute search direction using two-loop recursion
        let q = [...g];
        const alpha: number[] = [];

        // First loop (backward)
        for (let i = sHistory.length - 1; i >= 0; i--) {
            const alphaI = rhoHistory[i] * dot(sHistory[i], q);
            alpha[i] = alphaI;
            q = subtract(q, scale(alphaI, yHistory[i]));
        }

        // Initial Hessian approximation: H₀ = γI
        let gamma = 1;
        if (sHistory.length > 0) {
            const lastIdx = sHistory.length - 1;
            gamma = dot(sHistory[lastIdx], yHistory[lastIdx]) /
                    dot(yHistory[lastIdx], yHistory[lastIdx]);
        }

        let r = scale(gamma, q);

        // Second loop (forward)
        for (let i = 0; i < sHistory.length; i++) {
            const beta = rhoHistory[i] * dot(yHistory[i], r);
            r = add(r, scale(alpha[i] - beta, sHistory[i]));
        }

        const d = scale(-1, r);

        // Line search
        const alphaStep = lineSearch(f, x, d, g);
        functionEvaluations += 10;

        // Update position
        const s = scale(alphaStep, d);
        const xNew = add(x, s);
        const fxNew = f(xNew);
        functionEvaluations++;

        // Check convergence
        if (Math.abs(fxNew - fx) < tolerance && norm(s) < tolerance) {
            const gNew = gradient(xNew);
            const finalGradNorm = norm(gNew);
            return {
                x: xNew,
                fx: fxNew,
                iterations,
                converged: true,
                functionEvaluations,
                gradientNorm: finalGradNorm,
            };
        }

        // Compute new gradient
        const gNew = gradient(xNew);
        functionEvaluations++;

        // Compute y and ρ
        const y = subtract(gNew, g);
        const rho = 1 / dot(y, s);

        // Store in history (limited memory)
        if (isFinite(rho) && Math.abs(rho) > 1e-15) {
            sHistory.push(s);
            yHistory.push(y);
            rhoHistory.push(rho);

            // Keep only last m pairs
            if (sHistory.length > m) {
                sHistory.shift();
                yHistory.shift();
                rhoHistory.shift();
            }
        }

        x = xNew;
        fx = fxNew;
        g = gNew;
    }

    const finalGradNorm = norm(gradient(x));
    return { x, fx, iterations, converged: false, functionEvaluations, gradientNorm: finalGradNorm };
}

/**
 * Newton's Method with Hessian
 *
 * Uses both gradient and Hessian (second derivative matrix) for optimization.
 * Quadratic convergence near the solution makes it very fast when applicable.
 *
 * Algorithm:
 * x_{k+1} = x_k - H^{-1}(x_k) * ∇f(x_k)
 * where H is the Hessian matrix
 *
 * Pros:
 * - Quadratic convergence (very fast near solution)
 * - Optimal for quadratic functions
 * - Theoretically elegant
 *
 * Cons:
 * - Requires Hessian computation (expensive)
 * - May diverge if initial guess is poor
 * - Can converge to saddle points or maxima
 * - Requires solving linear system at each iteration
 * - Hessian may not be positive definite
 *
 * Convergence: Quadratic (when Hessian is positive definite and starting point is good)
 *
 * @param f Objective function to minimize
 * @param grad Gradient function
 * @param hess Hessian function
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize quadratic function
 * const result = newtonMultivariate(
 *   x => x[0]**2 + x[1]**2,
 *   x => [2*x[0], 2*x[1]],
 *   x => [[2, 0], [0, 2]],
 *   [5, 5]
 * );
 */
export function newtonMultivariate(
    f: ObjectiveFunction,
    grad?: GradientFunction,
    hess?: HessianFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 100,
        tolerance = 1e-10,
        gradientTolerance = 1e-8,
        stepSize = 1e-8,
    } = options;

    const gradient = grad ?? ((x: Vector) => approximateGradient(f, x, stepSize));
    const hessian = hess ?? ((x: Vector) => approximateHessian(f, x, stepSize));

    let x = [...x0];
    let fx = f(x);
    let iterations = 0;
    let functionEvaluations = 1;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const g = gradient(x);
        const gradNorm = norm(g);

        // Check convergence
        if (gradNorm < gradientTolerance) {
            return { x, fx, iterations, converged: true, functionEvaluations, gradientNorm: gradNorm };
        }

        const H = hessian(x);

        // Solve H * d = -g for search direction d
        let d: Vector;
        try {
            d = solveLinearSystem(H, scale(-1, g));
        } catch (e) {
            // If Hessian is singular, fall back to gradient descent direction
            d = scale(-1, g);
        }

        // Line search (damped Newton's method)
        const alpha = lineSearch(f, x, d, g);
        functionEvaluations += 10;

        // Update
        const xNew = add(x, scale(alpha, d));
        const fxNew = f(xNew);
        functionEvaluations++;

        // Check convergence
        if (Math.abs(fxNew - fx) < tolerance && norm(subtract(xNew, x)) < tolerance) {
            const gNew = gradient(xNew);
            const finalGradNorm = norm(gNew);
            return {
                x: xNew,
                fx: fxNew,
                iterations,
                converged: true,
                functionEvaluations,
                gradientNorm: finalGradNorm,
            };
        }

        x = xNew;
        fx = fxNew;
    }

    const finalGradNorm = norm(gradient(x));
    return { x, fx, iterations, converged: false, functionEvaluations, gradientNorm: finalGradNorm };
}

// ============================================================================
// Gradient-Free Methods
// ============================================================================

/**
 * Nelder-Mead Simplex Method
 *
 * Derivative-free optimization using a simplex (n+1 points in n dimensions).
 * At each iteration, reflects, expands, or contracts the simplex to find better points.
 *
 * Algorithm:
 * 1. Start with n+1 points forming a simplex
 * 2. Order points by function value
 * 3. Try reflection of worst point through centroid
 * 4. If reflection is good, try expansion
 * 5. If reflection is bad, try contraction
 * 6. If contraction fails, shrink entire simplex
 *
 * Pros:
 * - Doesn't require derivatives
 * - Simple and robust
 * - Works for non-smooth functions
 * - Good for low-dimensional problems (n < 10)
 *
 * Cons:
 * - Can be slow to converge
 * - Doesn't scale well to high dimensions
 * - No convergence guarantees
 * - Can stagnate on non-smooth functions
 *
 * Convergence: Sublinear (no theoretical guarantees)
 *
 * @param f Objective function to minimize
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize Rosenbrock function without derivatives
 * const result = nelderMead(
 *   ([x, y]) => (1 - x) ** 2 + 100 * (y - x ** 2) ** 2,
 *   [0, 0]
 * );
 */
export function nelderMead(
    f: ObjectiveFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 1000,
        tolerance = 1e-10,
    } = options;

    const n = x0.length;

    // Nelder-Mead parameters
    const alpha = 1.0;  // Reflection coefficient
    const gamma = 2.0;  // Expansion coefficient
    const rho = 0.5;    // Contraction coefficient
    const sigma = 0.5;  // Shrink coefficient

    // Initialize simplex (n+1 vertices in n dimensions)
    const simplex: Vector[] = [x0];
    for (let i = 0; i < n; i++) {
        const vertex = [...x0];
        vertex[i] += x0[i] !== 0 ? 0.05 * x0[i] : 0.00025;
        simplex.push(vertex);
    }

    // Evaluate function at all vertices
    let fValues = simplex.map(v => f(v));
    let functionEvaluations = n + 1;
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        // Sort vertices by function value
        const indices = Array.from({ length: n + 1 }, (_, i) => i)
            .sort((a, b) => fValues[a] - fValues[b]);

        const best = indices[0];
        const worst = indices[n];
        const secondWorst = indices[n - 1];

        // Check convergence (standard deviation of function values)
        const fMean = fValues.reduce((sum, val) => sum + val, 0) / (n + 1);
        const fStd = Math.sqrt(
            fValues.reduce((sum, val) => sum + (val - fMean) ** 2, 0) / (n + 1)
        );

        if (fStd < tolerance) {
            return {
                x: simplex[best],
                fx: fValues[best],
                iterations,
                converged: true,
                functionEvaluations,
            };
        }

        // Compute centroid of all points except worst
        const centroid = Array(n).fill(0);
        for (let i = 0; i < n + 1; i++) {
            if (i !== worst) {
                for (let j = 0; j < n; j++) {
                    centroid[j] += simplex[i][j];
                }
            }
        }
        for (let j = 0; j < n; j++) {
            centroid[j] /= n;
        }

        // Reflection
        const reflected = add(centroid, scale(alpha, subtract(centroid, simplex[worst])));
        const fReflected = f(reflected);
        functionEvaluations++;

        if (fValues[best] <= fReflected && fReflected < fValues[secondWorst]) {
            // Accept reflection
            simplex[worst] = reflected;
            fValues[worst] = fReflected;
        } else if (fReflected < fValues[best]) {
            // Try expansion
            const expanded = add(centroid, scale(gamma, subtract(reflected, centroid)));
            const fExpanded = f(expanded);
            functionEvaluations++;

            if (fExpanded < fReflected) {
                simplex[worst] = expanded;
                fValues[worst] = fExpanded;
            } else {
                simplex[worst] = reflected;
                fValues[worst] = fReflected;
            }
        } else {
            // Contraction
            let contracted: Vector;
            let fContracted: number;

            if (fReflected < fValues[worst]) {
                // Outside contraction
                contracted = add(centroid, scale(rho, subtract(reflected, centroid)));
                fContracted = f(contracted);
                functionEvaluations++;
            } else {
                // Inside contraction
                contracted = add(centroid, scale(rho, subtract(simplex[worst], centroid)));
                fContracted = f(contracted);
                functionEvaluations++;
            }

            if (fContracted < Math.min(fReflected, fValues[worst])) {
                simplex[worst] = contracted;
                fValues[worst] = fContracted;
            } else {
                // Shrink entire simplex toward best point
                for (let i = 0; i < n + 1; i++) {
                    if (i !== best) {
                        simplex[i] = add(simplex[best], scale(sigma, subtract(simplex[i], simplex[best])));
                        fValues[i] = f(simplex[i]);
                        functionEvaluations++;
                    }
                }
            }
        }
    }

    // Return best point found
    const bestIdx = fValues.indexOf(Math.min(...fValues));
    return {
        x: simplex[bestIdx],
        fx: fValues[bestIdx],
        iterations,
        converged: false,
        functionEvaluations,
    };
}

/**
 * Powell's Method
 *
 * Derivative-free optimization that builds conjugate directions through
 * sequential line searches. Efficient for smooth functions.
 *
 * Algorithm:
 * 1. Start with coordinate directions (or custom set)
 * 2. Perform line search along each direction
 * 3. Replace one direction with the overall search direction
 * 4. Repeat until convergence
 *
 * Pros:
 * - Doesn't require derivatives
 * - Fast convergence for smooth functions
 * - Better than coordinate descent
 * - Builds conjugate directions automatically
 *
 * Cons:
 * - Can fail for non-smooth functions
 * - May build linearly dependent directions
 * - Requires many function evaluations
 *
 * Convergence: Quadratic for quadratic functions
 *
 * @param f Objective function to minimize
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * const result = powell(
 *   x => x[0]**2 + x[1]**2,
 *   [5, 5]
 * );
 */
export function powell(
    f: ObjectiveFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 1000,
        tolerance = 1e-10,
    } = options;

    const n = x0.length;

    // Initialize with coordinate directions
    const directions: Vector[] = [];
    for (let i = 0; i < n; i++) {
        const dir = Array(n).fill(0);
        dir[i] = 1;
        directions.push(dir);
    }

    let x = [...x0];
    let fx = f(x);
    let functionEvaluations = 1;
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        const x0Iter = [...x];
        const fx0Iter = fx;

        // Perform line search along each direction
        for (let i = 0; i < n; i++) {
            const dir = directions[i];

            // Simple line search using golden section
            const lineFunc = (alpha: number) => f(add(x, scale(alpha, dir)));

            // Find reasonable bracket
            let bracket = 0.1;
            let alpha = 0;
            let bestFx = fx;

            for (let step = 0; step < 20; step++) {
                const testAlpha = -bracket + step * (2 * bracket) / 19;
                const testFx = lineFunc(testAlpha);
                functionEvaluations++;

                if (testFx < bestFx) {
                    bestFx = testFx;
                    alpha = testAlpha;
                }
            }

            x = add(x, scale(alpha, dir));
            fx = bestFx;
        }

        // Check convergence
        if (Math.abs(fx - fx0Iter) < tolerance && norm(subtract(x, x0Iter)) < tolerance) {
            return { x, fx, iterations, converged: true, functionEvaluations };
        }

        // Add new direction (from x0Iter to x)
        const newDir = subtract(x, x0Iter);
        const newDirNorm = norm(newDir);

        if (newDirNorm > 1e-15) {
            // Replace first direction with new direction
            directions.shift();
            directions.push(scale(1 / newDirNorm, newDir));
        }
    }

    return { x, fx, iterations, converged: false, functionEvaluations };
}

/**
 * Simulated Annealing
 *
 * Probabilistic optimization inspired by metallurgical annealing.
 * Accepts worse solutions with decreasing probability to escape local minima.
 *
 * Algorithm:
 * 1. Start at high temperature T
 * 2. Generate random neighbor
 * 3. Accept if better, or with probability exp(-ΔE/T) if worse
 * 4. Decrease temperature gradually
 * 5. Repeat until convergence
 *
 * Pros:
 * - Can escape local minima
 * - No derivatives needed
 * - Works for discrete and continuous problems
 * - Theoretically guaranteed to find global minimum (with slow cooling)
 *
 * Cons:
 * - Slow convergence
 * - Many parameters to tune
 * - No convergence guarantees with practical cooling schedules
 * - Stochastic (different runs give different results)
 *
 * @param f Objective function to minimize
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * const result = simulatedAnnealing(
 *   x => Math.sin(x[0]) * Math.cos(x[1]) + x[0]**2 + x[1]**2,
 *   [0, 0],
 *   { temperature: 10, coolingRate: 0.95 }
 * );
 */
export function simulatedAnnealing(
    f: ObjectiveFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 10000,
        temperature = 1.0,
        coolingRate = 0.95,
        bounds,
    } = options;

    const n = x0.length;
    let T = temperature;
    let x = [...x0];
    let fx = f(x);

    let xBest = [...x];
    let fxBest = fx;

    let functionEvaluations = 1;
    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        // Generate random neighbor
        const neighbor = x.map((xi, i) => {
            const step = T * (Math.random() * 2 - 1);
            let newVal = xi + step;

            // Apply bounds if provided
            if (bounds && bounds[i]) {
                const [min, max] = bounds[i];
                newVal = Math.max(min, Math.min(max, newVal));
            }

            return newVal;
        });

        const fNeighbor = f(neighbor);
        functionEvaluations++;

        // Compute energy difference
        const deltaE = fNeighbor - fx;

        // Accept or reject
        if (deltaE < 0 || Math.random() < Math.exp(-deltaE / T)) {
            x = neighbor;
            fx = fNeighbor;

            // Update best
            if (fx < fxBest) {
                xBest = [...x];
                fxBest = fx;
            }
        }

        // Cool down
        T *= coolingRate;

        // Check if temperature is too low
        if (T < 1e-10) {
            break;
        }
    }

    return {
        x: xBest,
        fx: fxBest,
        iterations,
        converged: T < 1e-10,
        functionEvaluations,
    };
}

/**
 * Genetic Algorithm (Basic)
 *
 * Population-based optimization inspired by natural evolution.
 * Maintains a population of solutions and evolves them through
 * selection, crossover, and mutation.
 *
 * Algorithm:
 * 1. Initialize random population
 * 2. Evaluate fitness of each individual
 * 3. Select parents based on fitness
 * 4. Create offspring through crossover
 * 5. Apply mutation
 * 6. Replace population with offspring
 * 7. Repeat until convergence
 *
 * Pros:
 * - Global optimization (explores entire search space)
 * - No derivatives needed
 * - Handles discrete and continuous variables
 * - Parallelizable
 * - Works for non-smooth and discontinuous functions
 *
 * Cons:
 * - Very slow convergence
 * - Many function evaluations
 * - Many parameters to tune
 * - No convergence guarantees
 *
 * @param f Objective function to minimize
 * @param x0 Initial guess (used to infer dimension)
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * const result = geneticAlgorithm(
 *   x => x[0]**2 + x[1]**2,
 *   [0, 0],
 *   { populationSize: 50, bounds: [[-10, 10], [-10, 10]] }
 * );
 */
export function geneticAlgorithm(
    f: ObjectiveFunction,
    x0: Vector = [0, 0],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 100,
        populationSize = 50,
        mutationRate = 0.1,
        crossoverRate = 0.8,
        bounds,
    } = options;

    const n = x0.length;

    // Initialize population
    let population: Vector[] = [];
    for (let i = 0; i < populationSize; i++) {
        const individual = x0.map((xi, j) => {
            if (bounds && bounds[j]) {
                const [min, max] = bounds[j];
                return min + Math.random() * (max - min);
            }
            return xi + (Math.random() * 2 - 1);
        });
        population.push(individual);
    }

    // Evaluate fitness
    let fitness = population.map(ind => f(ind));
    let functionEvaluations = populationSize;

    let iterations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        // Find best individual
        const bestIdx = fitness.indexOf(Math.min(...fitness));
        const best = population[bestIdx];
        const bestFitness = fitness[bestIdx];

        // Create new population through selection and crossover
        const newPopulation: Vector[] = [];

        while (newPopulation.length < populationSize) {
            // Tournament selection (select 2 parents)
            const parent1 = tournamentSelect(population, fitness);
            const parent2 = tournamentSelect(population, fitness);

            let offspring1: Vector;
            let offspring2: Vector;

            // Crossover
            if (Math.random() < crossoverRate) {
                [offspring1, offspring2] = crossover(parent1, parent2);
            } else {
                offspring1 = [...parent1];
                offspring2 = [...parent2];
            }

            // Mutation
            offspring1 = mutate(offspring1, mutationRate, bounds);
            offspring2 = mutate(offspring2, mutationRate, bounds);

            newPopulation.push(offspring1);
            if (newPopulation.length < populationSize) {
                newPopulation.push(offspring2);
            }
        }

        // Elitism: keep best individual
        newPopulation[0] = best;

        // Evaluate new population
        population = newPopulation;
        fitness = population.map(ind => f(ind));
        functionEvaluations += populationSize;
    }

    const bestIdx = fitness.indexOf(Math.min(...fitness));
    return {
        x: population[bestIdx],
        fx: fitness[bestIdx],
        iterations,
        converged: false,
        functionEvaluations,
    };
}

/**
 * Tournament selection for genetic algorithm
 */
function tournamentSelect(population: Vector[], fitness: number[], tournamentSize: number = 3): Vector {
    let bestIdx = Math.floor(Math.random() * population.length);
    let bestFitness = fitness[bestIdx];

    for (let i = 1; i < tournamentSize; i++) {
        const idx = Math.floor(Math.random() * population.length);
        if (fitness[idx] < bestFitness) {
            bestIdx = idx;
            bestFitness = fitness[idx];
        }
    }

    return population[bestIdx];
}

/**
 * Crossover operator (single-point crossover)
 */
function crossover(parent1: Vector, parent2: Vector): [Vector, Vector] {
    const n = parent1.length;
    const point = Math.floor(Math.random() * n);

    const offspring1 = [...parent1.slice(0, point), ...parent2.slice(point)];
    const offspring2 = [...parent2.slice(0, point), ...parent1.slice(point)];

    return [offspring1, offspring2];
}

/**
 * Mutation operator
 */
function mutate(
    individual: Vector,
    mutationRate: number,
    bounds?: [number, number][]
): Vector {
    return individual.map((gene, i) => {
        if (Math.random() < mutationRate) {
            const mutation = (Math.random() * 2 - 1) * 0.5;
            let newGene = gene + mutation;

            if (bounds && bounds[i]) {
                const [min, max] = bounds[i];
                newGene = Math.max(min, Math.min(max, newGene));
            }

            return newGene;
        }
        return gene;
    });
}
