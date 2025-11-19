/**
 * Series Expansion Module
 *
 * Provides series expansion capabilities including:
 * - Taylor series expansion
 * - Maclaurin series (Taylor series at 0)
 * - Power series operations (addition, multiplication, composition)
 * - Common series expansions (sin, cos, exp, ln, etc.)
 */

import {
    Expression,
    Constant,
    Variable,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Negate
} from './expression';

import {
    Sin,
    Cos,
    Tan,
    Exp,
    Ln,
    Sqrt
} from './functions';

import { substitute } from './manipulate';
import { differentiate, nthDerivative } from './differentiate';

/**
 * Compute the Taylor series expansion of an expression
 * @param expr - The expression to expand
 * @param variable - The variable to expand with respect to
 * @param center - The point to expand around (a in Taylor series)
 * @param order - The number of terms (order of approximation)
 * @returns Taylor series as an expression
 */
export function taylorSeries(
    expr: Expression,
    variable: string,
    center: number | Expression,
    order: number
): Expression {
    const centerExpr = typeof center === 'number' ? new Constant(center) : center;
    const centerValue = centerExpr.evaluate(new Map());

    const terms: Expression[] = [];

    // Compute f(a), f'(a), f''(a), ..., f^(n)(a)
    for (let n = 0; n <= order; n++) {
        // Compute n-th derivative
        const derivative = n === 0 ? expr : nthDerivative(expr, variable, n);

        // Evaluate at center point
        const derivativeAtCenter = substitute(derivative, variable, centerExpr);
        const value = derivativeAtCenter.evaluate(new Map());

        // Skip zero terms
        if (Math.abs(value) < 1e-14) {
            continue;
        }

        // Compute (x - a)^n / n!
        const factorial = computeFactorial(n);

        const xMinusA = new Subtract(
            new Variable(variable),
            centerExpr
        ).simplify();

        let term: Expression;

        if (n === 0) {
            term = derivativeAtCenter;
        } else {
            const coefficient = new Divide(
                derivativeAtCenter,
                new Constant(factorial)
            ).simplify();

            const power = new Power(xMinusA, new Constant(n)).simplify();

            term = new Multiply([coefficient, power]).simplify();
        }

        terms.push(term);
    }

    return terms.length === 0 ? new Constant(0) :
           terms.length === 1 ? terms[0] :
           new Add(terms).simplify();
}

/**
 * Compute the Maclaurin series (Taylor series centered at 0)
 * @param expr - The expression to expand
 * @param variable - The variable to expand with respect to
 * @param order - The number of terms
 * @returns Maclaurin series as an expression
 */
export function maclaurinSeries(
    expr: Expression,
    variable: string,
    order: number
): Expression {
    return taylorSeries(expr, variable, 0, order);
}

/**
 * Get coefficients of a power series expansion
 * Returns array where index i contains the coefficient of x^i
 * @param expr - The expression to expand
 * @param variable - The variable
 * @param center - The expansion point
 * @param order - The number of terms
 * @returns Array of coefficients
 */
export function powerSeriesCoefficients(
    expr: Expression,
    variable: string,
    center: number | Expression,
    order: number
): Expression[] {
    const coeffs: Expression[] = [];
    const centerExpr = typeof center === 'number' ? new Constant(center) : center;

    for (let n = 0; n <= order; n++) {
        const derivative = n === 0 ? expr : nthDerivative(expr, variable, n);
        const derivativeAtCenter = substitute(derivative, variable, centerExpr);
        const factorial = computeFactorial(n);

        coeffs.push(new Divide(derivativeAtCenter, new Constant(factorial)).simplify());
    }

    return coeffs;
}

/**
 * Add two power series
 * @param coeffs1 - Coefficients of first series
 * @param coeffs2 - Coefficients of second series
 * @returns Coefficients of sum
 */
export function addPowerSeries(coeffs1: Expression[], coeffs2: Expression[]): Expression[] {
    const maxLen = Math.max(coeffs1.length, coeffs2.length);
    const result: Expression[] = [];

    for (let i = 0; i < maxLen; i++) {
        const c1 = i < coeffs1.length ? coeffs1[i] : new Constant(0);
        const c2 = i < coeffs2.length ? coeffs2[i] : new Constant(0);
        result.push(new Add([c1, c2]).simplify());
    }

    return result;
}

/**
 * Multiply two power series (Cauchy product)
 * @param coeffs1 - Coefficients of first series
 * @param coeffs2 - Coefficients of second series
 * @returns Coefficients of product
 */
export function multiplyPowerSeries(coeffs1: Expression[], coeffs2: Expression[]): Expression[] {
    const n = coeffs1.length;
    const m = coeffs2.length;
    const result: Expression[] = [];

    for (let k = 0; k < n + m - 1; k++) {
        const terms: Expression[] = [];

        for (let i = 0; i <= k; i++) {
            if (i < n && k - i < m) {
                terms.push(new Multiply([coeffs1[i], coeffs2[k - i]]).simplify());
            }
        }

        result.push(terms.length > 0 ? new Add(terms).simplify() : new Constant(0));
    }

    return result;
}

/**
 * Compose power series: f(g(x)) where both f and g are power series
 * @param fCoeffs - Coefficients of outer function f
 * @param gCoeffs - Coefficients of inner function g
 * @param order - Maximum order to compute
 * @returns Coefficients of composition
 */
export function composePowerSeries(
    fCoeffs: Expression[],
    gCoeffs: Expression[],
    order: number
): Expression[] {
    // f(g(x)) = f_0 + f_1*g(x) + f_2*g(x)^2 + ...
    const result: Expression[] = new Array(order + 1).fill(null).map(() => new Constant(0));

    // Start with constant term
    result[0] = fCoeffs[0];

    // Compute powers of g(x)
    const gPowers: Expression[][] = [
        [new Constant(1)], // g^0 = 1
        gCoeffs.slice(0, order + 1) // g^1 = g
    ];

    // Compute higher powers of g
    for (let i = 2; i < fCoeffs.length; i++) {
        gPowers[i] = multiplyPowerSeries(gPowers[i - 1], gCoeffs).slice(0, order + 1);
    }

    // Combine: f(g(x)) = sum of f_i * g^i
    for (let i = 1; i < fCoeffs.length && i < gPowers.length; i++) {
        for (let j = 0; j <= order && j < gPowers[i].length; j++) {
            result[j] = new Add([
                result[j],
                new Multiply([fCoeffs[i], gPowers[i][j]])
            ]).simplify();
        }
    }

    return result;
}

/**
 * Convert power series coefficients to an expression
 * @param coeffs - Array of coefficients
 * @param variable - The variable name
 * @param center - The center point
 * @returns Expression representing the series
 */
export function powerSeriesToExpression(
    coeffs: Expression[],
    variable: string,
    center: number | Expression = 0
): Expression {
    const centerExpr = typeof center === 'number' ? new Constant(center) : center;
    const terms: Expression[] = [];

    for (let i = 0; i < coeffs.length; i++) {
        if (coeffs[i] instanceof Constant && Math.abs(coeffs[i].evaluate(new Map())) < 1e-14) {
            continue; // Skip zero coefficients
        }

        if (i === 0) {
            terms.push(coeffs[i]);
        } else {
            const xMinusA = new Subtract(
                new Variable(variable),
                centerExpr
            ).simplify();

            const power = i === 1 ? xMinusA : new Power(xMinusA, new Constant(i)).simplify();
            terms.push(new Multiply([coeffs[i], power]).simplify());
        }
    }

    return terms.length === 0 ? new Constant(0) :
           terms.length === 1 ? terms[0] :
           new Add(terms).simplify();
}

/**
 * Get the common Maclaurin series for sin(x)
 * sin(x) = x - x^3/3! + x^5/5! - x^7/7! + ...
 */
export function sinSeries(variable: string, order: number): Expression {
    const terms: Expression[] = [];
    const x = new Variable(variable);

    for (let n = 0; n <= order; n++) {
        const k = 2 * n + 1;
        if (k > order * 2 + 1) break;

        const factorial = computeFactorial(k);
        const sign = n % 2 === 0 ? 1 : -1;
        const coefficient = new Constant(sign / factorial);
        const power = new Power(x, new Constant(k));

        terms.push(new Multiply([coefficient, power]).simplify());
    }

    return new Add(terms).simplify();
}

/**
 * Get the common Maclaurin series for cos(x)
 * cos(x) = 1 - x^2/2! + x^4/4! - x^6/6! + ...
 */
export function cosSeries(variable: string, order: number): Expression {
    const terms: Expression[] = [];
    const x = new Variable(variable);

    for (let n = 0; n <= order; n++) {
        const k = 2 * n;
        if (k > order * 2) break;

        const factorial = computeFactorial(k);
        const sign = n % 2 === 0 ? 1 : -1;
        const coefficient = new Constant(sign / factorial);

        if (k === 0) {
            terms.push(coefficient);
        } else {
            const power = new Power(x, new Constant(k));
            terms.push(new Multiply([coefficient, power]).simplify());
        }
    }

    return new Add(terms).simplify();
}

/**
 * Get the common Maclaurin series for exp(x)
 * exp(x) = 1 + x + x^2/2! + x^3/3! + ...
 */
export function expSeries(variable: string, order: number): Expression {
    const terms: Expression[] = [];
    const x = new Variable(variable);

    for (let n = 0; n <= order; n++) {
        const factorial = computeFactorial(n);
        const coefficient = new Constant(1 / factorial);

        if (n === 0) {
            terms.push(coefficient);
        } else {
            const power = new Power(x, new Constant(n));
            terms.push(new Multiply([coefficient, power]).simplify());
        }
    }

    return new Add(terms).simplify();
}

/**
 * Get the common Maclaurin series for ln(1 + x)
 * ln(1 + x) = x - x^2/2 + x^3/3 - x^4/4 + ...
 */
export function lnOnePlusSeries(variable: string, order: number): Expression {
    const terms: Expression[] = [];
    const x = new Variable(variable);

    for (let n = 1; n <= order; n++) {
        const sign = n % 2 === 1 ? 1 : -1;
        const coefficient = new Constant(sign / n);
        const power = new Power(x, new Constant(n));

        terms.push(new Multiply([coefficient, power]).simplify());
    }

    return new Add(terms).simplify();
}

/**
 * Get the binomial series for (1 + x)^α
 * (1 + x)^α = 1 + αx + α(α-1)x^2/2! + α(α-1)(α-2)x^3/3! + ...
 */
export function binomialSeries(
    variable: string,
    alpha: number | Expression,
    order: number
): Expression {
    const terms: Expression[] = [];
    const x = new Variable(variable);
    const alphaExpr = typeof alpha === 'number' ? new Constant(alpha) : alpha;

    // First term is always 1
    terms.push(new Constant(1));

    // Compute subsequent terms
    let coefficient = alphaExpr;

    for (let n = 1; n <= order; n++) {
        const factorial = computeFactorial(n);
        const coeff = new Divide(coefficient, new Constant(factorial)).simplify();
        const power = new Power(x, new Constant(n));

        terms.push(new Multiply([coeff, power]).simplify());

        // Update coefficient: multiply by (α - n)
        coefficient = new Multiply([
            coefficient,
            new Subtract(alphaExpr, new Constant(n))
        ]).simplify();
    }

    return new Add(terms).simplify();
}

/**
 * Get the geometric series
 * 1/(1-x) = 1 + x + x^2 + x^3 + ... (for |x| < 1)
 */
export function geometricSeries(variable: string, order: number): Expression {
    const terms: Expression[] = [];
    const x = new Variable(variable);

    for (let n = 0; n <= order; n++) {
        if (n === 0) {
            terms.push(new Constant(1));
        } else {
            terms.push(new Power(x, new Constant(n)));
        }
    }

    return new Add(terms).simplify();
}

/**
 * Differentiate a power series term by term
 * @param coeffs - Coefficients of the series
 * @returns Coefficients of the derivative
 */
export function differentiatePowerSeries(coeffs: Expression[]): Expression[] {
    if (coeffs.length <= 1) {
        return [new Constant(0)];
    }

    const result: Expression[] = [];

    for (let i = 1; i < coeffs.length; i++) {
        result.push(new Multiply([new Constant(i), coeffs[i]]).simplify());
    }

    return result;
}

/**
 * Integrate a power series term by term
 * @param coeffs - Coefficients of the series
 * @param constantTerm - The constant of integration (coefficient of x^0)
 * @returns Coefficients of the integral
 */
export function integratePowerSeries(
    coeffs: Expression[],
    constantTerm: Expression = new Constant(0)
): Expression[] {
    const result: Expression[] = [constantTerm];

    for (let i = 0; i < coeffs.length; i++) {
        result.push(new Divide(coeffs[i], new Constant(i + 1)).simplify());
    }

    return result;
}

/**
 * Evaluate a power series at a specific point
 * @param coeffs - Coefficients of the series
 * @param variable - The variable name
 * @param center - The center of the series
 * @param point - The point to evaluate at
 * @returns Numerical value
 */
export function evaluatePowerSeries(
    coeffs: Expression[],
    variable: string,
    center: number | Expression,
    point: number
): number {
    const centerValue = typeof center === 'number' ? center : center.evaluate(new Map());
    const delta = point - centerValue;

    let result = 0;
    let power = 1;

    for (let i = 0; i < coeffs.length; i++) {
        const coeffValue = coeffs[i].evaluate(new Map());
        result += coeffValue * power;
        power *= delta;
    }

    return result;
}

/**
 * Find the radius of convergence of a power series (using ratio test)
 * @param coeffs - Coefficients of the series
 * @returns Radius of convergence (may be Infinity)
 */
export function radiusOfConvergence(coeffs: Expression[]): number {
    // Ratio test: R = lim |a_n / a_{n+1}|
    const n = coeffs.length;

    if (n < 2) {
        return Infinity;
    }

    const ratios: number[] = [];

    for (let i = 0; i < n - 1; i++) {
        const an = Math.abs(coeffs[i].evaluate(new Map()));
        const an1 = Math.abs(coeffs[i + 1].evaluate(new Map()));

        if (an1 > 1e-14) {
            ratios.push(an / an1);
        }
    }

    if (ratios.length === 0) {
        return Infinity;
    }

    // Take the limit (approximate with last few values)
    const last5 = ratios.slice(-5);
    const avg = last5.reduce((a, b) => a + b, 0) / last5.length;

    return avg;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compute factorial
 */
function computeFactorial(n: number): number {
    if (n < 0) {
        throw new Error('Factorial not defined for negative numbers');
    }
    if (n === 0 || n === 1) {
        return 1;
    }

    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}
