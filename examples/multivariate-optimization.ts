/**
 * Multivariate Optimization Examples
 *
 * Demonstrates various multivariate optimization algorithms on classic test functions.
 * These examples show how to use gradient-based, gradient-free, and constrained
 * optimization methods from the mathscapes library.
 */

import {
    gradientDescentMultivariate,
    conjugateGradient,
    bfgs,
    lbfgs,
    newtonMultivariate,
    nelderMead,
    powell,
    simulatedAnnealing,
    geneticAlgorithm,
    lagrangeMultipliers,
    penaltyMethod,
    augmentedLagrangian,
    simplexMethod,
    projectedGradientDescent,
    type Vector,
} from '../src/numeric';

// ============================================================================
// Classic Test Functions
// ============================================================================

/**
 * Rosenbrock function (also known as "banana function")
 * Global minimum at (1, 1) with f(1, 1) = 0
 * Non-convex with a narrow curved valley
 */
function rosenbrock(x: Vector): number {
    const [x1, x2] = x;
    return (1 - x1) ** 2 + 100 * (x2 - x1 ** 2) ** 2;
}

function rosenbrockGradient(x: Vector): Vector {
    const [x1, x2] = x;
    return [
        -2 * (1 - x1) - 400 * x1 * (x2 - x1 ** 2),
        200 * (x2 - x1 ** 2),
    ];
}

function rosenbrockHessian(x: Vector): number[][] {
    const [x1, x2] = x;
    return [
        [2 - 400 * (x2 - 3 * x1 ** 2), -400 * x1],
        [-400 * x1, 200],
    ];
}

/**
 * Sphere function (simple quadratic)
 * Global minimum at origin with f(0, 0, ..., 0) = 0
 * Convex and easy to optimize
 */
function sphere(x: Vector): number {
    return x.reduce((sum, xi) => sum + xi ** 2, 0);
}

function sphereGradient(x: Vector): Vector {
    return x.map(xi => 2 * xi);
}

/**
 * Rastrigin function (highly multimodal)
 * Global minimum at origin with f(0, 0, ..., 0) = 0
 * Many local minima, challenging for gradient-based methods
 */
function rastrigin(x: Vector): number {
    const n = x.length;
    return 10 * n + x.reduce((sum, xi) => sum + xi ** 2 - 10 * Math.cos(2 * Math.PI * xi), 0);
}

/**
 * Beale function
 * Global minimum at (3, 0.5) with f(3, 0.5) = 0
 * Non-convex with challenging landscape
 */
function beale(x: Vector): number {
    const [x1, x2] = x;
    return (
        (1.5 - x1 + x1 * x2) ** 2 +
        (2.25 - x1 + x1 * x2 ** 2) ** 2 +
        (2.625 - x1 + x1 * x2 ** 3) ** 2
    );
}

/**
 * Ackley function (highly multimodal)
 * Global minimum at origin with f(0, 0) = 0
 * Many local minima
 */
function ackley(x: Vector): number {
    const n = x.length;
    const sum1 = x.reduce((s, xi) => s + xi ** 2, 0);
    const sum2 = x.reduce((s, xi) => s + Math.cos(2 * Math.PI * xi), 0);
    return -20 * Math.exp(-0.2 * Math.sqrt(sum1 / n)) - Math.exp(sum2 / n) + 20 + Math.E;
}

// ============================================================================
// Gradient-Based Methods Examples
// ============================================================================

const LINE = '================================================================================';
const DASH_LINE = '--------------------------------------------------------------------------------';

console.log(LINE);
console.log('GRADIENT-BASED OPTIMIZATION METHODS');
console.log(LINE);

console.log('\n--- 1. Gradient Descent (with Momentum) on Rosenbrock ---');
const gdResult = gradientDescentMultivariate(
    rosenbrock,
    rosenbrockGradient,
    [0, 0],
    { learningRate: 0.001, momentum: 0.9, maxIterations: 10000 }
);
console.log(`Result: x = [${gdResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${gdResult.fx.toExponential(4)}`);
console.log(`Iterations: ${gdResult.iterations}, Converged: ${gdResult.converged}`);

console.log('\n--- 2. Gradient Descent (Nesterov) on Rosenbrock ---');
const nesterovResult = gradientDescentMultivariate(
    rosenbrock,
    rosenbrockGradient,
    [0, 0],
    { learningRate: 0.001, momentum: 0.9, nesterov: true, maxIterations: 10000 }
);
console.log(`Result: x = [${nesterovResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${nesterovResult.fx.toExponential(4)}`);
console.log(`Iterations: ${nesterovResult.iterations}, Converged: ${nesterovResult.converged}`);

console.log('\n--- 3. Conjugate Gradient on Rosenbrock ---');
const cgResult = conjugateGradient(rosenbrock, rosenbrockGradient, [0, 0]);
console.log(`Result: x = [${cgResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${cgResult.fx.toExponential(4)}`);
console.log(`Iterations: ${cgResult.iterations}, Converged: ${cgResult.converged}`);

console.log('\n--- 4. BFGS on Rosenbrock ---');
const bfgsResult = bfgs(rosenbrock, rosenbrockGradient, [-1, -1]);
console.log(`Result: x = [${bfgsResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${bfgsResult.fx.toExponential(4)}`);
console.log(`Iterations: ${bfgsResult.iterations}, Converged: ${bfgsResult.converged}`);

console.log('\n--- 5. L-BFGS on High-Dimensional Sphere ---');
const highDimInitial: number[] = [];
for (let i = 0; i < 50; i++) {
    highDimInitial.push(5);
}
const lbfgsResult = lbfgs(sphere, sphereGradient, highDimInitial, { historySize: 10 });
console.log(`Result (first 5 dims): x = [${lbfgsResult.x.slice(0, 5).map(v => v.toFixed(4)).join(', ')}, ...]`);
console.log(`f(x) = ${lbfgsResult.fx.toExponential(4)}`);
console.log(`Iterations: ${lbfgsResult.iterations}, Converged: ${lbfgsResult.converged}`);

console.log('\n--- 6. Newton\'s Method on Sphere ---');
const sphereHessian = (x: Vector) => {
    const n = x.length;
    const hess: number[][] = [];
    for (let i = 0; i < n; i++) {
        const row: number[] = [];
        for (let j = 0; j < n; j++) {
            row.push(i === j ? 2 : 0);
        }
        hess.push(row);
    }
    return hess;
};
const newtonResult = newtonMultivariate(sphere, sphereGradient, sphereHessian, [3, 4]);
console.log(`Result: x = [${newtonResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${newtonResult.fx.toExponential(4)}`);
console.log(`Iterations: ${newtonResult.iterations}, Converged: ${newtonResult.converged}`);

// ============================================================================
// Gradient-Free Methods Examples
// ============================================================================

console.log('\n' + LINE);
console.log('GRADIENT-FREE OPTIMIZATION METHODS');
console.log(LINE);

console.log('\n--- 7. Nelder-Mead Simplex on Rosenbrock ---');
const nmResult = nelderMead(rosenbrock, [0, 0]);
console.log(`Result: x = [${nmResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${nmResult.fx.toExponential(4)}`);
console.log(`Iterations: ${nmResult.iterations}, Converged: ${nmResult.converged}`);

console.log('\n--- 8. Powell\'s Method on Beale ---');
const powellResult = powell(beale, [1, 1]);
console.log(`Result: x = [${powellResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${powellResult.fx.toExponential(4)}`);
console.log(`Expected minimum at (3, 0.5)`);
console.log(`Iterations: ${powellResult.iterations}, Converged: ${powellResult.converged}`);

console.log('\n--- 9. Simulated Annealing on Rastrigin (multimodal) ---');
const saResult = simulatedAnnealing(
    rastrigin,
    [5, 5],
    { temperature: 10, coolingRate: 0.95, maxIterations: 5000, bounds: [[-5.12, 5.12], [-5.12, 5.12]] }
);
console.log(`Result: x = [${saResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${saResult.fx.toFixed(4)}`);
console.log(`Expected minimum at (0, 0) with f = 0`);
console.log(`Iterations: ${saResult.iterations}`);

console.log('\n--- 10. Genetic Algorithm on Ackley (highly multimodal) ---');
const gaResult = geneticAlgorithm(
    ackley,
    [0, 0],
    {
        populationSize: 50,
        maxIterations: 100,
        mutationRate: 0.1,
        crossoverRate: 0.8,
        bounds: [[-5, 5], [-5, 5]],
    }
);
console.log(`Result: x = [${gaResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${gaResult.fx.toFixed(4)}`);
console.log(`Expected minimum at (0, 0) with f ≈ 0`);
console.log(`Iterations: ${gaResult.iterations}`);

// ============================================================================
// Constrained Optimization Examples
// ============================================================================

console.log('\n' + LINE);
console.log('CONSTRAINED OPTIMIZATION METHODS');
console.log(LINE);

console.log('\n--- 11. Lagrange Multipliers: Minimize x² + y² subject to x + y = 1 ---');
const lagrangeResult = lagrangeMultipliers(
    ([x, y]) => x ** 2 + y ** 2,
    ([x, y]) => [2 * x, 2 * y],
    [([x, y]) => x + y - 1],
    [([x, y]) => [1, 1]],
    [0, 0]
);
console.log(`Result: x = [${lagrangeResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${lagrangeResult.fx.toFixed(4)}`);
console.log(`Expected: x = [0.5, 0.5], f = 0.5`);
console.log(`Lagrange multipliers: λ = [${lagrangeResult.lambda?.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`Converged: ${lagrangeResult.converged}`);

console.log('\n--- 12. Penalty Method: Minimize x² + y² subject to x + y ≥ 1 ---');
const penaltyResult = penaltyMethod(
    ([x, y]) => x ** 2 + y ** 2,
    [([x, y]) => 1 - x - y], // Inequality: 1 - x - y ≤ 0  =>  x + y ≥ 1
    [],
    [0, 0],
    { penaltyCoefficient: 1, penaltyIncreaseFactor: 10, maxIterations: 10 }
);
console.log(`Result: x = [${penaltyResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${penaltyResult.fx.toFixed(4)}`);
console.log(`Expected: x ≈ [0.5, 0.5], f ≈ 0.5`);
console.log(`Constraint violations: [${penaltyResult.constraintViolations?.map(v => v.toFixed(6)).join(', ')}]`);

console.log('\n--- 13. Augmented Lagrangian: Minimize (x-2)² + (y-1)² subject to x + y = 3 ---');
const augLagResult = augmentedLagrangian(
    ([x, y]) => (x - 2) ** 2 + (y - 1) ** 2,
    [([x, y]) => x + y - 3],
    [1, 1],
    { penaltyCoefficient: 10, maxIterations: 20 }
);
console.log(`Result: x = [${augLagResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${augLagResult.fx.toFixed(4)}`);
console.log(`Expected: x = [2, 1], f = 0`);
console.log(`Converged: ${augLagResult.converged}`);

console.log('\n--- 14. Linear Programming (Simplex): Minimize -x - y subject to x + 2y ≤ 4, 2x + y ≤ 6, x,y ≥ 0 ---');
const lpResult = simplexMethod(
    [-1, -1], // Objective: minimize -x - y (maximize x + y)
    [
        [1, 2],   // x + 2y ≤ 4
        [2, 1],   // 2x + y ≤ 6
    ],
    [4, 6]
);
console.log(`Result: x = [${lpResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${lpResult.fx.toFixed(4)}`);
console.log(`Expected: x ≈ [1.6, 1.2] or [2, 2], f ≈ -2.8 or -4`);
console.log(`Converged: ${lpResult.converged}`);

console.log('\n--- 15. Projected Gradient Descent: Minimize (x-2)² + (y-2)² subject to 0 ≤ x,y ≤ 1 ---');
const pgdResult = projectedGradientDescent(
    ([x, y]) => (x - 2) ** 2 + (y - 2) ** 2,
    ([x, y]) => [2 * (x - 2), 2 * (y - 2)],
    [0.5, 0.5],
    [[0, 1], [0, 1]],
    { learningRate: 0.1, maxIterations: 1000 }
);
console.log(`Result: x = [${pgdResult.x.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`f(x) = ${pgdResult.fx.toFixed(4)}`);
console.log(`Expected: x = [1, 1], f = 2 (constrained minimum)`);
console.log(`Converged: ${pgdResult.converged}`);

// ============================================================================
// Performance Comparison
// ============================================================================

console.log('\n' + LINE);
console.log('PERFORMANCE COMPARISON ON ROSENBROCK FUNCTION');
console.log(LINE);

const methods = [
    { name: 'Gradient Descent', fn: () => gradientDescentMultivariate(rosenbrock, rosenbrockGradient, [0, 0], { learningRate: 0.001, maxIterations: 10000 }) },
    { name: 'Conjugate Gradient', fn: () => conjugateGradient(rosenbrock, rosenbrockGradient, [0, 0]) },
    { name: 'BFGS', fn: () => bfgs(rosenbrock, rosenbrockGradient, [0, 0]) },
    { name: 'L-BFGS', fn: () => lbfgs(rosenbrock, rosenbrockGradient, [0, 0]) },
    { name: 'Nelder-Mead', fn: () => nelderMead(rosenbrock, [0, 0]) },
    { name: 'Powell', fn: () => powell(rosenbrock, [0, 0]) },
];

console.log('\nMethod                 | Final f(x)    | Iterations | Converged | Func Evals');
console.log(DASH_LINE);

for (const method of methods) {
    const result = method.fn();
    const funcEvals = result.functionEvaluations !== undefined ? String(result.functionEvaluations) : 'N/A';

    // Manual padding for method name (22 chars)
    let methodName = method.name;
    while (methodName.length < 22) {
        methodName += ' ';
    }

    // Manual padding for fx (13 chars)
    let fxStr = result.fx.toExponential(3);
    while (fxStr.length < 13) {
        fxStr += ' ';
    }

    // Manual padding for iterations (10 chars)
    let iterStr = String(result.iterations);
    while (iterStr.length < 10) {
        iterStr += ' ';
    }

    // Manual padding for converged (9 chars)
    let convStr = String(result.converged);
    while (convStr.length < 9) {
        convStr += ' ';
    }

    console.log(`${methodName} | ${fxStr} | ${iterStr} | ${convStr} | ${funcEvals}`);
}

console.log('\n' + LINE);
console.log('Examples completed! All optimization methods demonstrated successfully.');
console.log(LINE);
