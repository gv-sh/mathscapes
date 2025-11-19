/**
 * Constrained Optimization Algorithms
 *
 * Methods for optimizing functions subject to constraints.
 * Essential for real-world optimization problems where solutions
 * must satisfy certain requirements or limitations.
 *
 * Applications:
 * - Resource allocation with budgets
 * - Engineering design with physical constraints
 * - Portfolio optimization with risk limits
 * - Production planning with capacity constraints
 * - Machine learning with regularization
 *
 * References:
 * - Nocedal & Wright, "Numerical Optimization" (2006)
 * - Boyd & Vandenberghe, "Convex Optimization" (2004)
 * - Bertsekas, "Nonlinear Programming" (1999)
 * - Dantzig, "Linear Programming and Extensions" (1963)
 */

import type {
    Vector,
    Matrix,
    ObjectiveFunction,
    GradientFunction,
    ConstraintFunction,
    MultivariateOptimizeOptions,
    MultivariateOptimizeResult,
} from './multivariate-optimize';

import { gradientDescentMultivariate, bfgs } from './multivariate-optimize';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Compute the Euclidean norm of a vector
 */
function norm(v: Vector): number {
    return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Add two vectors
 */
function add(a: Vector, b: Vector): Vector {
    return a.map((val, i) => val + b[i]);
}

/**
 * Subtract two vectors
 */
function subtract(a: Vector, b: Vector): Vector {
    return a.map((val, i) => val - b[i]);
}

/**
 * Multiply vector by scalar
 */
function scale(s: number, v: Vector): Vector {
    return v.map(val => s * val);
}

/**
 * Dot product
 */
function dot(a: Vector, b: Vector): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

/**
 * Approximate gradient using finite differences
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

// ============================================================================
// Constrained Optimization Methods
// ============================================================================

/**
 * Options for constrained optimization
 */
export interface ConstrainedOptimizeOptions extends MultivariateOptimizeOptions {
    /** Lagrange multiplier initial guess */
    lambda0?: Vector;
    /** Penalty coefficient */
    penaltyCoefficient?: number;
    /** Penalty increase factor */
    penaltyIncreaseFactor?: number;
    /** Inner iteration limit */
    innerIterations?: number;
}

/**
 * Result from constrained optimization
 */
export interface ConstrainedOptimizeResult extends MultivariateOptimizeResult {
    /** Lagrange multipliers (if applicable) */
    lambda?: Vector;
    /** Constraint violations */
    constraintViolations?: number[];
}

/**
 * Lagrange Multipliers Method (Equality Constraints)
 *
 * Solves optimization problems with equality constraints using
 * the method of Lagrange multipliers. Finds points where the
 * gradient of the objective is a linear combination of constraint gradients.
 *
 * Problem formulation:
 * minimize f(x)
 * subject to h_i(x) = 0 for i = 1, ..., m
 *
 * Lagrangian: L(x, λ) = f(x) + Σ λ_i * h_i(x)
 *
 * Optimality conditions (KKT conditions):
 * ∇f(x) + Σ λ_i * ∇h_i(x) = 0
 * h_i(x) = 0 for all i
 *
 * Algorithm:
 * Solve the system of equations for both x and λ using Newton's method
 * applied to the KKT conditions.
 *
 * Pros:
 * - Theoretically elegant and exact
 * - Provides Lagrange multipliers (shadow prices)
 * - Fast convergence when well-conditioned
 *
 * Cons:
 * - Requires constraint gradients
 * - Only handles equality constraints
 * - May fail if constraints are ill-conditioned
 * - Requires solving large system of equations
 *
 * @param f Objective function to minimize
 * @param grad Gradient of objective (optional)
 * @param equalityConstraints Array of equality constraint functions h_i(x) = 0
 * @param equalityGradients Array of constraint gradients (optional)
 * @param x0 Initial guess for x
 * @param options Algorithm options
 * @returns Optimization result with Lagrange multipliers
 *
 * @example
 * // Minimize x^2 + y^2 subject to x + y = 1
 * const result = lagrangeMultipliers(
 *   ([x, y]) => x**2 + y**2,
 *   ([x, y]) => [2*x, 2*y],
 *   [([x, y]) => x + y - 1],
 *   [([x, y]) => [1, 1]],
 *   [0, 0]
 * );
 * // Result: x = [0.5, 0.5], f = 0.5
 */
export function lagrangeMultipliers(
    f: ObjectiveFunction,
    grad: GradientFunction | undefined,
    equalityConstraints: ConstraintFunction[],
    equalityGradients?: GradientFunction[],
    x0: Vector = [0, 0],
    options: ConstrainedOptimizeOptions = {}
): ConstrainedOptimizeResult {
    const {
        maxIterations = 100,
        tolerance = 1e-10,
        gradientTolerance = 1e-8,
        stepSize = 1e-8,
    } = options;

    const n = x0.length;
    const m = equalityConstraints.length;

    const gradient = grad ?? ((x: Vector) => approximateGradient(f, x, stepSize));
    const constraintGrads = equalityGradients ?? equalityConstraints.map(
        h => (x: Vector) => approximateGradient(h, x, stepSize)
    );

    // Initial guess: x and lambda
    let x = [...x0];
    let lambda = options.lambda0 ?? Array(m).fill(0);

    let iterations = 0;
    let functionEvaluations = 0;

    for (iterations = 1; iterations <= maxIterations; iterations++) {
        // Evaluate objective gradient and constraints
        const g = gradient(x);
        const h = equalityConstraints.map(hi => hi(x));
        const dhList = constraintGrads.map(dh => dh(x));

        functionEvaluations += 1 + m;

        // Check KKT conditions
        // Condition 1: ∇f(x) + Σ λ_i * ∇h_i(x) = 0
        const gradLagrangian = [...g];
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                gradLagrangian[j] += lambda[i] * dhList[i][j];
            }
        }

        const kktGradNorm = norm(gradLagrangian);
        const kktConstraintNorm = norm(h);

        // Check convergence
        if (kktGradNorm < gradientTolerance && kktConstraintNorm < tolerance) {
            return {
                x,
                fx: f(x),
                iterations,
                converged: true,
                lambda,
                constraintViolations: h,
                functionEvaluations,
                gradientNorm: kktGradNorm,
            };
        }

        // Build Jacobian of KKT system
        // System: [H  A^T] [Δx]   = -[∇L]
        //         [A   0 ] [Δλ]      [h ]
        // where H is Hessian of Lagrangian, A is Jacobian of constraints

        // For simplicity, approximate Hessian with identity (quasi-Newton)
        const systemSize = n + m;
        const A: Matrix = Array(systemSize).fill(0).map(() => Array(systemSize).fill(0));
        const b: Vector = Array(systemSize).fill(0);

        // Top-left: approximated Hessian (use identity for simplicity)
        for (let i = 0; i < n; i++) {
            A[i][i] = 1;
        }

        // Top-right and bottom-left: constraint Jacobian
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                A[j][n + i] = dhList[i][j];
                A[n + i][j] = dhList[i][j];
            }
        }

        // Right-hand side
        for (let i = 0; i < n; i++) {
            b[i] = -gradLagrangian[i];
        }
        for (let i = 0; i < m; i++) {
            b[n + i] = -h[i];
        }

        // Solve linear system (simplified Gaussian elimination)
        const delta = solveLinearSystem(A, b);

        // Update x and lambda
        const deltaX = delta.slice(0, n);
        const deltaLambda = delta.slice(n);

        x = add(x, deltaX);
        lambda = add(lambda, deltaLambda);

        // Check if step is too small
        if (norm(deltaX) < tolerance) {
            const fx = f(x);
            return {
                x,
                fx,
                iterations,
                converged: kktGradNorm < gradientTolerance && kktConstraintNorm < tolerance,
                lambda,
                constraintViolations: h,
                functionEvaluations,
                gradientNorm: kktGradNorm,
            };
        }
    }

    const fx = f(x);
    const finalH = equalityConstraints.map(hi => hi(x));
    const finalGradLagrangian = gradient(x);
    for (let i = 0; i < m; i++) {
        const dh = constraintGrads[i](x);
        for (let j = 0; j < n; j++) {
            finalGradLagrangian[j] += lambda[i] * dh[j];
        }
    }

    return {
        x,
        fx,
        iterations,
        converged: false,
        lambda,
        constraintViolations: finalH,
        functionEvaluations,
        gradientNorm: norm(finalGradLagrangian),
    };
}

/**
 * Solve linear system using Gaussian elimination
 */
function solveLinearSystem(A: Matrix, b: Vector): Vector {
    const n = A.length;
    const aug: Matrix = A.map((row, i) => [...row, b[i]]);

    // Forward elimination with partial pivoting
    for (let k = 0; k < n; k++) {
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(aug[i][k]) > Math.abs(aug[maxRow][k])) {
                maxRow = i;
            }
        }

        [aug[k], aug[maxRow]] = [aug[maxRow], aug[k]];

        if (Math.abs(aug[k][k]) < 1e-15) {
            // Singular or nearly singular - use small value
            aug[k][k] = 1e-10;
        }

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
 * Penalty Method
 *
 * Converts constrained optimization to unconstrained by adding
 * penalty terms for constraint violations.
 *
 * Problem formulation:
 * minimize f(x)
 * subject to g_i(x) ≤ 0 (inequality constraints)
 *            h_j(x) = 0 (equality constraints)
 *
 * Penalty function:
 * P(x, μ) = f(x) + μ * [Σ max(0, g_i(x))² + Σ h_j(x)²]
 *
 * Algorithm:
 * 1. Start with small penalty coefficient μ
 * 2. Minimize penalty function P(x, μ)
 * 3. Increase μ and repeat
 * 4. Continue until constraints are satisfied
 *
 * Pros:
 * - Simple to implement
 * - Handles both equality and inequality constraints
 * - Can use any unconstrained optimizer
 * - No need for constraint gradients
 *
 * Cons:
 * - Can be ill-conditioned for large penalties
 * - May not find exact solution (approximate)
 * - Requires many iterations with increasing penalty
 * - Solution may violate constraints slightly
 *
 * Convergence: Solution approaches constrained optimum as μ → ∞
 *
 * @param f Objective function to minimize
 * @param inequalityConstraints Array of inequality constraints g_i(x) ≤ 0
 * @param equalityConstraints Array of equality constraints h_j(x) = 0
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize x^2 + y^2 subject to x + y ≥ 1 (i.e., 1 - x - y ≤ 0)
 * const result = penaltyMethod(
 *   ([x, y]) => x**2 + y**2,
 *   [([x, y]) => 1 - x - y],
 *   [],
 *   [0, 0]
 * );
 */
export function penaltyMethod(
    f: ObjectiveFunction,
    inequalityConstraints: ConstraintFunction[] = [],
    equalityConstraints: ConstraintFunction[] = [],
    x0: Vector = [0, 0],
    options: ConstrainedOptimizeOptions = {}
): ConstrainedOptimizeResult {
    const {
        maxIterations = 10,
        penaltyCoefficient = 1.0,
        penaltyIncreaseFactor = 10,
        innerIterations = 1000,
        tolerance = 1e-10,
    } = options;

    let mu = penaltyCoefficient;
    let x = [...x0];
    let fx = f(x);
    let totalIterations = 0;
    let functionEvaluations = 1;

    for (let outerIter = 0; outerIter < maxIterations; outerIter++) {
        // Define penalty function
        const penaltyFunc = (xCurrent: Vector): number => {
            const fVal = f(xCurrent);
            let penalty = 0;

            // Inequality constraints: penalize max(0, g_i(x))²
            for (const g of inequalityConstraints) {
                const gVal = g(xCurrent);
                if (gVal > 0) {
                    penalty += gVal * gVal;
                }
            }

            // Equality constraints: penalize h_j(x)²
            for (const h of equalityConstraints) {
                const hVal = h(xCurrent);
                penalty += hVal * hVal;
            }

            return fVal + mu * penalty;
        };

        // Minimize penalty function using BFGS
        const result = bfgs(
            penaltyFunc,
            undefined,
            x,
            { maxIterations: innerIterations, tolerance }
        );

        x = result.x;
        fx = f(x);
        totalIterations += result.iterations;
        functionEvaluations += result.functionEvaluations ?? 0;

        // Check constraint satisfaction
        let maxViolation = 0;
        const violations: number[] = [];

        for (const g of inequalityConstraints) {
            const gVal = g(x);
            violations.push(gVal);
            if (gVal > 0) {
                maxViolation = Math.max(maxViolation, gVal);
            }
        }

        for (const h of equalityConstraints) {
            const hVal = h(x);
            violations.push(hVal);
            maxViolation = Math.max(maxViolation, Math.abs(hVal));
        }

        // Check convergence
        if (maxViolation < tolerance) {
            return {
                x,
                fx,
                iterations: totalIterations,
                converged: true,
                constraintViolations: violations,
                functionEvaluations,
            };
        }

        // Increase penalty
        mu *= penaltyIncreaseFactor;
    }

    // Compute final violations
    const finalViolations: number[] = [];
    for (const g of inequalityConstraints) {
        finalViolations.push(g(x));
    }
    for (const h of equalityConstraints) {
        finalViolations.push(h(x));
    }

    return {
        x,
        fx,
        iterations: totalIterations,
        converged: false,
        constraintViolations: finalViolations,
        functionEvaluations,
    };
}

/**
 * Augmented Lagrangian Method (Method of Multipliers)
 *
 * Combines Lagrange multipliers with penalty methods for better
 * convergence. More robust than pure penalty methods.
 *
 * Augmented Lagrangian:
 * L_A(x, λ, μ) = f(x) + Σ λ_i*h_i(x) + (μ/2)*Σ h_i(x)²
 *
 * Algorithm:
 * 1. Minimize augmented Lagrangian with respect to x
 * 2. Update Lagrange multipliers: λ_i := λ_i + μ*h_i(x)
 * 3. Optionally increase penalty μ
 * 4. Repeat until convergence
 *
 * Pros:
 * - Better conditioned than pure penalty method
 * - Doesn't require μ → ∞
 * - Finds exact solution (not approximate)
 * - More robust than Lagrange multipliers alone
 *
 * Cons:
 * - More complex than penalty method
 * - Requires multiple iterations
 * - Only handles equality constraints directly
 *
 * @param f Objective function
 * @param equalityConstraints Equality constraints h_i(x) = 0
 * @param x0 Initial guess
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize x^2 + y^2 subject to x + y = 1
 * const result = augmentedLagrangian(
 *   ([x, y]) => x**2 + y**2,
 *   [([x, y]) => x + y - 1],
 *   [0, 0]
 * );
 */
export function augmentedLagrangian(
    f: ObjectiveFunction,
    equalityConstraints: ConstraintFunction[] = [],
    x0: Vector = [0, 0],
    options: ConstrainedOptimizeOptions = {}
): ConstrainedOptimizeResult {
    const {
        maxIterations = 20,
        penaltyCoefficient = 10.0,
        penaltyIncreaseFactor = 2,
        innerIterations = 1000,
        tolerance = 1e-10,
    } = options;

    const m = equalityConstraints.length;
    let mu = penaltyCoefficient;
    let x = [...x0];
    let lambda = options.lambda0 ?? Array(m).fill(0);
    let fx = f(x);
    let totalIterations = 0;
    let functionEvaluations = 1;

    for (let outerIter = 0; outerIter < maxIterations; outerIter++) {
        // Define augmented Lagrangian
        const augLagrangian = (xCurrent: Vector): number => {
            const fVal = f(xCurrent);
            let augTerm = 0;

            for (let i = 0; i < m; i++) {
                const hVal = equalityConstraints[i](xCurrent);
                augTerm += lambda[i] * hVal + (mu / 2) * hVal * hVal;
            }

            return fVal + augTerm;
        };

        // Minimize augmented Lagrangian
        const result = bfgs(
            augLagrangian,
            undefined,
            x,
            { maxIterations: innerIterations, tolerance }
        );

        x = result.x;
        fx = f(x);
        totalIterations += result.iterations;
        functionEvaluations += result.functionEvaluations ?? 0;

        // Evaluate constraints
        const h = equalityConstraints.map(hi => hi(x));
        const constraintNorm = norm(h);

        // Check convergence
        if (constraintNorm < tolerance) {
            return {
                x,
                fx,
                iterations: totalIterations,
                converged: true,
                lambda,
                constraintViolations: h,
                functionEvaluations,
            };
        }

        // Update Lagrange multipliers
        for (let i = 0; i < m; i++) {
            lambda[i] += mu * h[i];
        }

        // Optionally increase penalty (less aggressive than penalty method)
        if (constraintNorm > 0.25 * (outerIter > 0 ? norm(equalityConstraints.map(hi => hi(x))) : 1)) {
            mu *= penaltyIncreaseFactor;
        }
    }

    const finalH = equalityConstraints.map(hi => hi(x));

    return {
        x,
        fx,
        iterations: totalIterations,
        converged: false,
        lambda,
        constraintViolations: finalH,
        functionEvaluations,
    };
}

/**
 * Linear Programming using Simplex Method
 *
 * Solves linear programming problems:
 * minimize c^T * x
 * subject to A * x ≤ b
 *            x ≥ 0
 *
 * The simplex method moves along edges of the feasible polytope
 * to find the optimal vertex.
 *
 * Algorithm:
 * 1. Convert to standard form with slack variables
 * 2. Find initial basic feasible solution
 * 3. Check optimality conditions
 * 4. If not optimal, pivot to adjacent vertex with better objective
 * 5. Repeat until optimal or unbounded
 *
 * Pros:
 * - Efficient for linear problems
 * - Finds exact optimal solution
 * - Detects unboundedness and infeasibility
 * - Well-studied and reliable
 *
 * Cons:
 * - Only for linear objectives and constraints
 * - Worst-case exponential time (rare in practice)
 * - Can require many pivots
 *
 * @param c Objective coefficients (minimize c^T * x)
 * @param A Constraint matrix (A * x ≤ b)
 * @param b Constraint bounds
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize -x - y subject to x + 2y ≤ 4, 2x + y ≤ 6, x,y ≥ 0
 * const result = simplexMethod(
 *   [-1, -1],
 *   [[1, 2], [2, 1]],
 *   [4, 6]
 * );
 * // Result: x = [2, 2], f = -4
 */
export function simplexMethod(
    c: Vector,
    A: Matrix,
    b: Vector,
    options: ConstrainedOptimizeOptions = {}
): ConstrainedOptimizeResult {
    const { maxIterations = 1000 } = options;

    const m = A.length; // Number of constraints
    const n = c.length; // Number of variables

    // Convert to standard form: add slack variables
    // minimize c^T * x
    // subject to A * x + s = b, x ≥ 0, s ≥ 0

    // Construct initial tableau:
    // [A | I | b]
    // [c | 0 | 0]

    const tableau: Matrix = [];

    // Constraint rows
    for (let i = 0; i < m; i++) {
        const row = [...A[i]];
        // Add slack variables (identity matrix)
        for (let j = 0; j < m; j++) {
            row.push(i === j ? 1 : 0);
        }
        row.push(b[i]); // RHS
        tableau.push(row);
    }

    // Objective row (negated for maximization form used in simplex)
    const objRow = [...c.map(val => -val)];
    for (let j = 0; j < m; j++) {
        objRow.push(0);
    }
    objRow.push(0); // Objective value
    tableau.push(objRow);

    // Basic variables (initially slack variables)
    const basic = Array.from({ length: m }, (_, i) => n + i);

    let iterations = 0;

    for (iterations = 0; iterations < maxIterations; iterations++) {
        const lastRow = m; // Objective row index

        // Find entering variable (most negative coefficient in objective row)
        let enteringCol = -1;
        let minCoeff = 0;

        for (let j = 0; j < n + m; j++) {
            if (tableau[lastRow][j] < minCoeff) {
                minCoeff = tableau[lastRow][j];
                enteringCol = j;
            }
        }

        // If no negative coefficients, we're optimal
        if (enteringCol === -1) {
            break;
        }

        // Find leaving variable (minimum ratio test)
        let leavingRow = -1;
        let minRatio = Infinity;

        for (let i = 0; i < m; i++) {
            if (tableau[i][enteringCol] > 1e-10) {
                const ratio = tableau[i][n + m] / tableau[i][enteringCol];
                if (ratio >= 0 && ratio < minRatio) {
                    minRatio = ratio;
                    leavingRow = i;
                }
            }
        }

        // If no leaving variable found, problem is unbounded
        if (leavingRow === -1) {
            return {
                x: Array(n).fill(Infinity),
                fx: -Infinity,
                iterations,
                converged: false,
            };
        }

        // Pivot operation
        const pivot = tableau[leavingRow][enteringCol];

        // Divide pivot row by pivot element
        for (let j = 0; j <= n + m; j++) {
            tableau[leavingRow][j] /= pivot;
        }

        // Eliminate pivot column in other rows
        for (let i = 0; i <= m; i++) {
            if (i !== leavingRow) {
                const factor = tableau[i][enteringCol];
                for (let j = 0; j <= n + m; j++) {
                    tableau[i][j] -= factor * tableau[leavingRow][j];
                }
            }
        }

        // Update basic variables
        basic[leavingRow] = enteringCol;
    }

    // Extract solution
    const x = Array(n).fill(0);
    for (let i = 0; i < m; i++) {
        if (basic[i] < n) {
            x[basic[i]] = tableau[i][n + m];
        }
    }

    const fx = -tableau[m][n + m]; // Negate because we negated c earlier

    return {
        x,
        fx,
        iterations,
        converged: iterations < maxIterations,
    };
}

/**
 * Projected Gradient Descent
 *
 * Gradient descent with projection onto feasible region.
 * Simple method for handling box constraints (bounds on variables).
 *
 * Algorithm:
 * 1. Take gradient descent step
 * 2. Project result back onto feasible region
 * 3. Repeat until convergence
 *
 * Pros:
 * - Simple to implement
 * - Handles box constraints naturally
 * - No penalty parameters to tune
 *
 * Cons:
 * - Only handles box constraints (not general constraints)
 * - Slower convergence than unconstrained methods
 * - Projection can be expensive for complex constraints
 *
 * @param f Objective function
 * @param grad Gradient function (optional)
 * @param x0 Initial guess
 * @param bounds Bounds [min, max] for each variable
 * @param options Algorithm options
 * @returns Optimization result
 *
 * @example
 * // Minimize x^2 + y^2 subject to 0 ≤ x ≤ 1, 0 ≤ y ≤ 1
 * const result = projectedGradientDescent(
 *   ([x, y]) => (x - 2)**2 + (y - 2)**2,
 *   undefined,
 *   [0.5, 0.5],
 *   [[0, 1], [0, 1]]
 * );
 */
export function projectedGradientDescent(
    f: ObjectiveFunction,
    grad: GradientFunction | undefined,
    x0: Vector,
    bounds: [number, number][],
    options: MultivariateOptimizeOptions = {}
): MultivariateOptimizeResult {
    const {
        maxIterations = 10000,
        tolerance = 1e-10,
        learningRate = 0.01,
        stepSize = 1e-8,
    } = options;

    const gradient = grad ?? ((x: Vector) => approximateGradient(f, x, stepSize));

    let x = [...x0];
    let fx = f(x);
    let functionEvaluations = 1;

    for (let iterations = 1; iterations <= maxIterations; iterations++) {
        const g = gradient(x);
        functionEvaluations++;

        // Gradient descent step
        const xNew = x.map((xi, i) => xi - learningRate * g[i]);

        // Project onto feasible region (box constraints)
        for (let i = 0; i < x.length; i++) {
            const [min, max] = bounds[i];
            xNew[i] = Math.max(min, Math.min(max, xNew[i]));
        }

        const fxNew = f(xNew);
        functionEvaluations++;

        // Check convergence
        if (Math.abs(fxNew - fx) < tolerance && norm(subtract(xNew, x)) < tolerance) {
            return {
                x: xNew,
                fx: fxNew,
                iterations,
                converged: true,
                functionEvaluations,
            };
        }

        x = xNew;
        fx = fxNew;
    }

    return { x, fx, iterations: maxIterations, converged: false, functionEvaluations };
}
