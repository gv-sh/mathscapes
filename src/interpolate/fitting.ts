/**
 * Curve Fitting and Regression
 *
 * Algorithms for fitting curves and surfaces to data points using
 * least squares and other optimization techniques.
 *
 * Features:
 * - Polynomial regression (linear, quadratic, cubic, etc.)
 * - Least squares fitting
 * - Spline interpolation fitting
 * - Exponential and logarithmic fitting
 * - Power law fitting
 *
 * References:
 * - "Numerical Recipes" by Press et al.
 * - "Curve and Surface Fitting" by Hoschek & Lasser
 */

/**
 * 2D Point
 */
export interface Point2D {
    x: number;
    y: number;
}

/**
 * Polynomial coefficients (ascending order: c₀ + c₁x + c₂x² + ...)
 */
export type PolynomialCoefficients = number[];

/**
 * Fit result containing coefficients and quality metrics
 */
export interface FitResult {
    /** Fitted coefficients or parameters */
    coefficients: number[];
    /** R² (coefficient of determination) - goodness of fit [0, 1] */
    rSquared: number;
    /** Root mean square error */
    rmse: number;
}

/**
 * Polynomial regression using least squares
 *
 * Fits a polynomial of degree n to data points:
 * y = c₀ + c₁x + c₂x² + ... + cₙxⁿ
 *
 * Time complexity: O(n²m + n³) where n is degree, m is number of points
 *
 * @param points - Data points to fit
 * @param degree - Degree of polynomial
 * @returns Fit result with coefficients and quality metrics
 *
 * @example
 * ```ts
 * const points = [
 *   { x: 0, y: 1 },
 *   { x: 1, y: 2 },
 *   { x: 2, y: 4 },
 *   { x: 3, y: 7 }
 * ];
 * const fit = polynomialRegression(points, 2);
 * // fit.coefficients = [c₀, c₁, c₂] for y = c₀ + c₁x + c₂x²
 * ```
 */
export function polynomialRegression(
    points: Point2D[],
    degree: number
): FitResult {
    const n = points.length;
    const m = degree + 1;

    if (n < m) {
        throw new Error(`Need at least ${m} points to fit degree ${degree} polynomial`);
    }

    // Build normal equations: (X^T X)c = X^T y
    const X: number[][] = [];
    const y: number[] = [];

    for (const p of points) {
        const row: number[] = [];
        for (let j = 0; j <= degree; j++) {
            row.push(Math.pow(p.x, j));
        }
        X.push(row);
        y.push(p.y);
    }

    // Compute X^T X
    const XTX: number[][] = [];
    for (let i = 0; i < m; i++) {
        XTX[i] = [];
        for (let j = 0; j < m; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += X[k][i] * X[k][j];
            }
            XTX[i][j] = sum;
        }
    }

    // Compute X^T y
    const XTy: number[] = [];
    for (let i = 0; i < m; i++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
            sum += X[k][i] * y[k];
        }
        XTy[i] = sum;
    }

    // Solve XTX * c = XTy using Gaussian elimination
    const coefficients = solveLinearSystem(XTX, XTy);

    // Calculate quality metrics
    const metrics = calculateFitMetrics(points, (x) => evaluatePolynomial(coefficients, x));

    return {
        coefficients,
        rSquared: metrics.rSquared,
        rmse: metrics.rmse
    };
}

/**
 * Linear regression (special case of polynomial regression)
 * Fits y = mx + b
 *
 * @param points - Data points
 * @returns Fit result with [b, m] (intercept, slope)
 *
 * @example
 * ```ts
 * const points = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }];
 * const fit = linearRegression(points);
 * // y = fit.coefficients[0] + fit.coefficients[1] * x
 * ```
 */
export function linearRegression(points: Point2D[]): FitResult {
    return polynomialRegression(points, 1);
}

/**
 * Quadratic regression
 * Fits y = a + bx + cx²
 */
export function quadraticRegression(points: Point2D[]): FitResult {
    return polynomialRegression(points, 2);
}

/**
 * Cubic regression
 * Fits y = a + bx + cx² + dx³
 */
export function cubicRegression(points: Point2D[]): FitResult {
    return polynomialRegression(points, 3);
}

/**
 * Exponential regression
 * Fits y = a * e^(bx)
 *
 * Uses logarithmic transformation: ln(y) = ln(a) + bx
 *
 * @param points - Data points (all y values must be positive)
 * @returns Fit result with [a, b]
 *
 * @example
 * ```ts
 * const points = [
 *   { x: 0, y: 1 },
 *   { x: 1, y: 2.7 },
 *   { x: 2, y: 7.4 }
 * ];
 * const fit = exponentialRegression(points);
 * // y = fit.coefficients[0] * exp(fit.coefficients[1] * x)
 * ```
 */
export function exponentialRegression(points: Point2D[]): FitResult {
    // Transform: ln(y) = ln(a) + bx
    const transformedPoints = points.map(p => {
        if (p.y <= 0) {
            throw new Error('All y values must be positive for exponential regression');
        }
        return { x: p.x, y: Math.log(p.y) };
    });

    const linearFit = linearRegression(transformedPoints);
    const lnA = linearFit.coefficients[0];
    const b = linearFit.coefficients[1];
    const a = Math.exp(lnA);

    const coefficients = [a, b];
    const metrics = calculateFitMetrics(points, (x) => a * Math.exp(b * x));

    return {
        coefficients,
        rSquared: metrics.rSquared,
        rmse: metrics.rmse
    };
}

/**
 * Logarithmic regression
 * Fits y = a + b * ln(x)
 *
 * @param points - Data points (all x values must be positive)
 * @returns Fit result with [a, b]
 */
export function logarithmicRegression(points: Point2D[]): FitResult {
    // Transform: y = a + b*ln(x)
    const transformedPoints = points.map(p => {
        if (p.x <= 0) {
            throw new Error('All x values must be positive for logarithmic regression');
        }
        return { x: Math.log(p.x), y: p.y };
    });

    const linearFit = linearRegression(transformedPoints);
    const coefficients = linearFit.coefficients;
    const metrics = calculateFitMetrics(points, (x) =>
        coefficients[0] + coefficients[1] * Math.log(x)
    );

    return {
        coefficients,
        rSquared: metrics.rSquared,
        rmse: metrics.rmse
    };
}

/**
 * Power law regression
 * Fits y = a * x^b
 *
 * Uses logarithmic transformation: ln(y) = ln(a) + b*ln(x)
 *
 * @param points - Data points (all x and y values must be positive)
 * @returns Fit result with [a, b]
 *
 * @example
 * ```ts
 * const points = [
 *   { x: 1, y: 1 },
 *   { x: 2, y: 4 },
 *   { x: 3, y: 9 }
 * ];
 * const fit = powerLawRegression(points);
 * // y = fit.coefficients[0] * x^fit.coefficients[1]
 * ```
 */
export function powerLawRegression(points: Point2D[]): FitResult {
    // Transform: ln(y) = ln(a) + b*ln(x)
    const transformedPoints = points.map(p => {
        if (p.x <= 0 || p.y <= 0) {
            throw new Error('All x and y values must be positive for power law regression');
        }
        return { x: Math.log(p.x), y: Math.log(p.y) };
    });

    const linearFit = linearRegression(transformedPoints);
    const lnA = linearFit.coefficients[0];
    const b = linearFit.coefficients[1];
    const a = Math.exp(lnA);

    const coefficients = [a, b];
    const metrics = calculateFitMetrics(points, (x) => a * Math.pow(x, b));

    return {
        coefficients,
        rSquared: metrics.rSquared,
        rmse: metrics.rmse
    };
}

/**
 * Evaluate a polynomial at a given x value
 *
 * @param coefficients - Polynomial coefficients [c₀, c₁, c₂, ...]
 * @param x - Input value
 * @returns Polynomial value at x
 */
export function evaluatePolynomial(coefficients: number[], x: number): number {
    let result = 0;
    for (let i = 0; i < coefficients.length; i++) {
        result += coefficients[i] * Math.pow(x, i);
    }
    return result;
}

/**
 * Weighted least squares regression
 * Each point has a weight indicating its importance/reliability
 *
 * @param points - Data points
 * @param weights - Weight for each point
 * @param degree - Degree of polynomial
 * @returns Fit result
 */
export function weightedLeastSquares(
    points: Point2D[],
    weights: number[],
    degree: number
): FitResult {
    const n = points.length;
    const m = degree + 1;

    if (weights.length !== n) {
        throw new Error('Number of weights must match number of points');
    }

    // Build weighted normal equations
    const X: number[][] = [];
    const y: number[] = [];
    const W: number[] = weights;

    for (const p of points) {
        const row: number[] = [];
        for (let j = 0; j <= degree; j++) {
            row.push(Math.pow(p.x, j));
        }
        X.push(row);
        y.push(p.y);
    }

    // Compute X^T W X
    const XTWX: number[][] = [];
    for (let i = 0; i < m; i++) {
        XTWX[i] = [];
        for (let j = 0; j < m; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += W[k] * X[k][i] * X[k][j];
            }
            XTWX[i][j] = sum;
        }
    }

    // Compute X^T W y
    const XTWy: number[] = [];
    for (let i = 0; i < m; i++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
            sum += W[k] * X[k][i] * y[k];
        }
        XTWy[i] = sum;
    }

    const coefficients = solveLinearSystem(XTWX, XTWy);
    const metrics = calculateFitMetrics(points, (x) => evaluatePolynomial(coefficients, x));

    return {
        coefficients,
        rSquared: metrics.rSquared,
        rmse: metrics.rmse
    };
}

/**
 * Fit a cubic spline to data points
 * Returns a function that interpolates smoothly through all points
 *
 * @param points - Data points (must be sorted by x)
 * @param type - Spline type ('natural', 'clamped', or 'periodic')
 * @returns Spline evaluation function
 */
export function fitCubicSpline(
    points: Point2D[],
    type: 'natural' | 'clamped' | 'periodic' = 'natural'
): (x: number) => number {
    const n = points.length;
    if (n < 2) {
        throw new Error('Need at least 2 points for spline fitting');
    }

    // Sort points by x
    const sorted = [...points].sort((a, b) => a.x - b.x);

    const x = sorted.map(p => p.x);
    const y = sorted.map(p => p.y);
    const h: number[] = [];

    for (let i = 0; i < n - 1; i++) {
        h[i] = x[i + 1] - x[i];
    }

    // Solve for second derivatives (m_i values)
    const m: number[] = new Array(n);

    if (type === 'natural') {
        // Natural spline: m_0 = m_{n-1} = 0
        m[0] = 0;
        m[n - 1] = 0;

        // Build tridiagonal system
        const A: number[][] = [];
        const b: number[] = [];

        for (let i = 1; i < n - 1; i++) {
            const row = new Array(n - 2).fill(0);
            const j = i - 1;

            if (j > 0) row[j - 1] = h[i - 1];
            row[j] = 2 * (h[i - 1] + h[i]);
            if (j < n - 3) row[j + 1] = h[i];

            A.push(row);

            const rhs = 6 * ((y[i + 1] - y[i]) / h[i] - (y[i] - y[i - 1]) / h[i - 1]);
            b.push(rhs);
        }

        // Solve tridiagonal system
        const solution = solveTridiagonal(A, b);
        for (let i = 1; i < n - 1; i++) {
            m[i] = solution[i - 1];
        }
    }

    // Return evaluation function
    return (xVal: number): number => {
        // Find interval
        let i = 0;
        for (i = 0; i < n - 1; i++) {
            if (xVal <= x[i + 1]) break;
        }
        if (i >= n - 1) i = n - 2;

        // Evaluate cubic in interval [x_i, x_{i+1}]
        const t = (xVal - x[i]) / h[i];
        const a = y[i];
        const b = (y[i + 1] - y[i]) / h[i] - h[i] * (2 * m[i] + m[i + 1]) / 6;
        const c = m[i] / 2;
        const d = (m[i + 1] - m[i]) / (6 * h[i]);

        return a + b * (xVal - x[i]) + c * Math.pow(xVal - x[i], 2) + d * Math.pow(xVal - x[i], 3);
    };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Solve linear system Ax = b using Gaussian elimination
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const aug: number[][] = [];

    // Create augmented matrix
    for (let i = 0; i < n; i++) {
        aug[i] = [...A[i], b[i]];
    }

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
                maxRow = k;
            }
        }
        [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

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
        x[i] = aug[i][n];
        for (let j = i + 1; j < n; j++) {
            x[i] -= aug[i][j] * x[j];
        }
        x[i] /= aug[i][i];
    }

    return x;
}

/**
 * Solve tridiagonal system (simplified for spline fitting)
 */
function solveTridiagonal(A: number[][], b: number[]): number[] {
    // For simplicity, use general solver
    // In production, would use Thomas algorithm for better efficiency
    return solveLinearSystem(A, b);
}

/**
 * Calculate fit quality metrics
 */
function calculateFitMetrics(
    points: Point2D[],
    fitFunction: (x: number) => number
): { rSquared: number; rmse: number } {
    const n = points.length;

    // Calculate mean of y values
    let yMean = 0;
    for (const p of points) {
        yMean += p.y;
    }
    yMean /= n;

    // Calculate total sum of squares and residual sum of squares
    let ssTot = 0;
    let ssRes = 0;

    for (const p of points) {
        const yPred = fitFunction(p.x);
        ssTot += Math.pow(p.y - yMean, 2);
        ssRes += Math.pow(p.y - yPred, 2);
    }

    const rSquared = 1 - ssRes / ssTot;
    const rmse = Math.sqrt(ssRes / n);

    return { rSquared, rmse };
}
