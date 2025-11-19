/**
 * Curve Fitting Module
 *
 * Provides tools for fitting curves to data points using various methods.
 * Includes polynomial regression, least squares fitting, and spline fitting.
 *
 * Applications:
 * - Data analysis and visualization
 * - Trend analysis and forecasting
 * - Signal processing
 * - Scientific computing
 *
 * References:
 * - "Numerical Recipes" by Press et al.
 * - "Applied Linear Regression" by Weisberg
 * - "A Practical Guide to Splines" by de Boor
 */

import { Point2D } from './bezier';

/**
 * Polynomial regression result
 */
export interface PolynomialFit {
    /** Polynomial coefficients [a0, a1, ..., an] for a0 + a1*x + a2*x² + ... */
    coefficients: number[];
    /** R² coefficient of determination (0 to 1, higher is better) */
    rSquared: number;
    /** Root mean square error */
    rmse: number;
    /** Evaluate the fitted polynomial at x */
    evaluate: (x: number) => number;
}

/**
 * Fit a polynomial of specified degree to data points using least squares
 *
 * Solves the overdetermined system using normal equations:
 * (X^T X) c = X^T y
 *
 * where X is the Vandermonde matrix.
 *
 * @param points - Array of 2D points to fit
 * @param degree - Degree of polynomial (e.g., 1 for linear, 2 for quadratic)
 * @returns Polynomial fit result
 *
 * @example
 * ```typescript
 * const data = [
 *   { x: 0, y: 1 },
 *   { x: 1, y: 2.1 },
 *   { x: 2, y: 3.9 },
 *   { x: 3, y: 6.2 }
 * ];
 * const fit = polynomialRegression(data, 2); // Quadratic fit
 * console.log(fit.evaluate(1.5)); // Interpolate
 * console.log(fit.rSquared); // Quality of fit
 * ```
 */
export function polynomialRegression(points: Point2D[], degree: number): PolynomialFit {
    if (points.length === 0) {
        throw new Error('Need at least one point for polynomial regression');
    }
    if (degree < 0) {
        throw new Error('Polynomial degree must be non-negative');
    }
    if (points.length <= degree) {
        throw new Error(`Need at least ${degree + 1} points for degree ${degree} polynomial`);
    }

    const n = points.length;
    const m = degree + 1;

    // Build Vandermonde matrix X
    const X: number[][] = [];
    const y: number[] = [];

    for (let i = 0; i < n; i++) {
        const row: number[] = [];
        for (let j = 0; j <= degree; j++) {
            row.push(Math.pow(points[i].x, j));
        }
        X.push(row);
        y.push(points[i].y);
    }

    // Solve normal equations: (X^T X) c = X^T y
    const XtX = matrixMultiply(transpose(X), X);
    const Xty = matrixVectorMultiply(transpose(X), y);
    const coefficients = solveLinearSystem(XtX, Xty);

    // Calculate R² and RMSE
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    let ssRes = 0; // Sum of squared residuals
    let ssTot = 0; // Total sum of squares

    for (let i = 0; i < n; i++) {
        const predicted = evaluatePolynomial(coefficients, points[i].x);
        const residual = y[i] - predicted;
        ssRes += residual * residual;
        ssTot += Math.pow(y[i] - yMean, 2);
    }

    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 1;
    const rmse = Math.sqrt(ssRes / n);

    return {
        coefficients,
        rSquared,
        rmse,
        evaluate: (x: number) => evaluatePolynomial(coefficients, x)
    };
}

/**
 * Linear regression (degree 1 polynomial)
 * Fits a line y = mx + b to the data
 *
 * @param points - Array of 2D points
 * @returns Object with slope, intercept, and R²
 *
 * @example
 * ```typescript
 * const data = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }];
 * const { slope, intercept, rSquared } = linearRegression(data);
 * ```
 */
export function linearRegression(points: Point2D[]): {
    slope: number;
    intercept: number;
    rSquared: number;
    rmse: number;
    evaluate: (x: number) => number;
} {
    const fit = polynomialRegression(points, 1);
    return {
        intercept: fit.coefficients[0],
        slope: fit.coefficients[1],
        rSquared: fit.rSquared,
        rmse: fit.rmse,
        evaluate: fit.evaluate
    };
}

/**
 * Weighted least squares polynomial regression
 * Each point has a weight indicating its importance in the fit
 *
 * @param points - Array of 2D points
 * @param weights - Weight for each point (higher = more important)
 * @param degree - Degree of polynomial
 * @returns Polynomial fit result
 *
 * @example
 * ```typescript
 * const data = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 4 }];
 * const weights = [1, 2, 1]; // Middle point is more important
 * const fit = weightedPolynomialRegression(data, weights, 1);
 * ```
 */
export function weightedPolynomialRegression(
    points: Point2D[],
    weights: number[],
    degree: number
): PolynomialFit {
    if (points.length !== weights.length) {
        throw new Error('Number of weights must match number of points');
    }
    if (weights.some(w => w < 0)) {
        throw new Error('Weights must be non-negative');
    }

    const n = points.length;
    const m = degree + 1;

    // Build weighted Vandermonde matrix
    const X: number[][] = [];
    const y: number[] = [];

    for (let i = 0; i < n; i++) {
        const row: number[] = [];
        const w = Math.sqrt(weights[i]);
        for (let j = 0; j <= degree; j++) {
            row.push(w * Math.pow(points[i].x, j));
        }
        X.push(row);
        y.push(w * points[i].y);
    }

    // Solve normal equations
    const XtX = matrixMultiply(transpose(X), X);
    const Xty = matrixVectorMultiply(transpose(X), y);
    const coefficients = solveLinearSystem(XtX, Xty);

    // Calculate weighted R² and RMSE
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const yMean = points.reduce((sum, p, i) => sum + weights[i] * p.y, 0) / totalWeight;

    let ssRes = 0;
    let ssTot = 0;

    for (let i = 0; i < n; i++) {
        const predicted = evaluatePolynomial(coefficients, points[i].x);
        const residual = points[i].y - predicted;
        ssRes += weights[i] * residual * residual;
        ssTot += weights[i] * Math.pow(points[i].y - yMean, 2);
    }

    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 1;
    const rmse = Math.sqrt(ssRes / totalWeight);

    return {
        coefficients,
        rSquared,
        rmse,
        evaluate: (x: number) => evaluatePolynomial(coefficients, x)
    };
}

/**
 * Natural cubic spline interpolation
 * Creates a smooth curve through all points using piecewise cubic polynomials
 *
 * Natural spline: second derivative is zero at endpoints
 *
 * @param points - Array of 2D points (must be sorted by x)
 * @returns Function that evaluates the spline at any x
 *
 * @example
 * ```typescript
 * const data = [
 *   { x: 0, y: 0 },
 *   { x: 1, y: 1 },
 *   { x: 2, y: 0 },
 *   { x: 3, y: 1 }
 * ];
 * const spline = naturalCubicSpline(data);
 * const interpolated = spline(1.5);
 * ```
 */
export function naturalCubicSpline(points: Point2D[]): (x: number) => number {
    if (points.length < 2) {
        throw new Error('Need at least 2 points for spline interpolation');
    }

    // Sort points by x
    const sorted = [...points].sort((a, b) => a.x - b.x);
    const n = sorted.length - 1;

    const x = sorted.map(p => p.x);
    const y = sorted.map(p => p.y);

    // Build tridiagonal system for second derivatives
    const h: number[] = [];
    for (let i = 0; i < n; i++) {
        h[i] = x[i + 1] - x[i];
        if (h[i] <= 0) {
            throw new Error('Points must have distinct x values');
        }
    }

    // Build system Ac = b for second derivatives c
    const A: number[][] = [];
    const b: number[] = [];

    // Natural spline boundary conditions: c[0] = c[n] = 0
    A[0] = [1];
    b[0] = 0;

    for (let i = 1; i < n; i++) {
        const row = new Array(n + 1).fill(0);
        row[i - 1] = h[i - 1];
        row[i] = 2 * (h[i - 1] + h[i]);
        row[i + 1] = h[i];
        A[i] = row;

        b[i] = 3 * ((y[i + 1] - y[i]) / h[i] - (y[i] - y[i - 1]) / h[i - 1]);
    }

    A[n] = new Array(n + 1).fill(0);
    A[n][n] = 1;
    b[n] = 0;

    const c = solveTridiagonal(A, b);

    // Calculate spline coefficients a, b, d for each segment
    const a = y.slice(0, n);
    const splineB: number[] = [];
    const d: number[] = [];

    for (let i = 0; i < n; i++) {
        splineB[i] = (y[i + 1] - y[i]) / h[i] - h[i] * (c[i + 1] + 2 * c[i]) / 3;
        d[i] = (c[i + 1] - c[i]) / (3 * h[i]);
    }

    // Return evaluation function
    return (xVal: number) => {
        // Find the interval
        let i = 0;
        if (xVal >= x[n]) {
            i = n - 1;
        } else {
            while (i < n - 1 && xVal > x[i + 1]) {
                i++;
            }
        }

        // Evaluate cubic polynomial for this segment
        const dx = xVal - x[i];
        return a[i] + splineB[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
    };
}

/**
 * Least squares curve fitting with arbitrary basis functions
 *
 * @param points - Array of 2D points
 * @param basisFunctions - Array of basis functions
 * @returns Coefficients and evaluation function
 *
 * @example
 * ```typescript
 * // Fit a + b*sin(x) + c*cos(x)
 * const basis = [
 *   (x: number) => 1,
 *   (x: number) => Math.sin(x),
 *   (x: number) => Math.cos(x)
 * ];
 * const fit = leastSquaresFit(data, basis);
 * ```
 */
export function leastSquaresFit(
    points: Point2D[],
    basisFunctions: ((x: number) => number)[]
): {
    coefficients: number[];
    rSquared: number;
    rmse: number;
    evaluate: (x: number) => number;
} {
    const n = points.length;
    const m = basisFunctions.length;

    if (n < m) {
        throw new Error(`Need at least ${m} points for ${m} basis functions`);
    }

    // Build design matrix
    const X: number[][] = [];
    const y: number[] = [];

    for (let i = 0; i < n; i++) {
        const row: number[] = [];
        for (let j = 0; j < m; j++) {
            row.push(basisFunctions[j](points[i].x));
        }
        X.push(row);
        y.push(points[i].y);
    }

    // Solve normal equations
    const XtX = matrixMultiply(transpose(X), X);
    const Xty = matrixVectorMultiply(transpose(X), y);
    const coefficients = solveLinearSystem(XtX, Xty);

    // Calculate R² and RMSE
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    let ssRes = 0;
    let ssTot = 0;

    const evaluate = (x: number) => {
        return coefficients.reduce((sum, coeff, i) => sum + coeff * basisFunctions[i](x), 0);
    };

    for (let i = 0; i < n; i++) {
        const predicted = evaluate(points[i].x);
        const residual = y[i] - predicted;
        ssRes += residual * residual;
        ssTot += Math.pow(y[i] - yMean, 2);
    }

    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 1;
    const rmse = Math.sqrt(ssRes / n);

    return {
        coefficients,
        rSquared,
        rmse,
        evaluate
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Evaluate polynomial with given coefficients at x
 * Uses Horner's method for numerical stability
 */
function evaluatePolynomial(coefficients: number[], x: number): number {
    if (coefficients.length === 0) return 0;

    // Horner's method: a0 + x(a1 + x(a2 + x(a3 + ...)))
    let result = coefficients[coefficients.length - 1];
    for (let i = coefficients.length - 2; i >= 0; i--) {
        result = result * x + coefficients[i];
    }
    return result;
}

/**
 * Matrix transpose
 */
function transpose(A: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0]?.length || 0;
    const result: number[][] = [];

    for (let j = 0; j < cols; j++) {
        const row: number[] = [];
        for (let i = 0; i < rows; i++) {
            row.push(A[i][j]);
        }
        result.push(row);
    }

    return result;
}

/**
 * Matrix multiplication
 */
function matrixMultiply(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0]?.length || 0;
    const colsB = B[0]?.length || 0;

    const result: number[][] = [];
    for (let i = 0; i < rowsA; i++) {
        const row: number[] = [];
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            for (let k = 0; k < colsA; k++) {
                sum += A[i][k] * B[k][j];
            }
            row.push(sum);
        }
        result.push(row);
    }

    return result;
}

/**
 * Matrix-vector multiplication
 */
function matrixVectorMultiply(A: number[][], v: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < A.length; i++) {
        let sum = 0;
        for (let j = 0; j < v.length; j++) {
            sum += A[i][j] * v[j];
        }
        result.push(sum);
    }
    return result;
}

/**
 * Solve linear system Ax = b using Gaussian elimination with partial pivoting
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;

    // Create augmented matrix [A|b]
    const aug: number[][] = A.map((row, i) => [...row, b[i]]);

    // Forward elimination with partial pivoting
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
                maxRow = k;
            }
        }

        // Swap rows
        [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

        // Check for singular matrix
        if (Math.abs(aug[i][i]) < 1e-10) {
            throw new Error('Matrix is singular or nearly singular');
        }

        // Eliminate column
        for (let k = i + 1; k < n; k++) {
            const factor = aug[k][i] / aug[i][i];
            for (let j = i; j <= n; j++) {
                aug[k][j] -= factor * aug[i][j];
            }
        }
    }

    // Back substitution
    const x: number[] = new Array(n);
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
 * Solve tridiagonal system (for spline interpolation)
 */
function solveTridiagonal(A: number[][], b: number[]): number[] {
    const n = A.length;
    const x = new Array(n);
    const c = new Array(n);
    const d = new Array(n);

    // Extract diagonals
    const lower = new Array(n - 1);
    const diag = new Array(n);
    const upper = new Array(n - 1);

    for (let i = 0; i < n; i++) {
        if (i > 0) lower[i - 1] = A[i][i - 1] || 0;
        diag[i] = A[i][i] || 1;
        if (i < n - 1) upper[i] = A[i][i + 1] || 0;
    }

    // Forward sweep
    c[0] = upper[0] / diag[0];
    d[0] = b[0] / diag[0];

    for (let i = 1; i < n; i++) {
        const denom = diag[i] - lower[i - 1] * c[i - 1];
        if (i < n - 1) {
            c[i] = upper[i] / denom;
        }
        d[i] = (b[i] - lower[i - 1] * d[i - 1]) / denom;
    }

    // Back substitution
    x[n - 1] = d[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        x[i] = d[i] - c[i] * x[i + 1];
    }

    return x;
}
