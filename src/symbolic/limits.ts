/**
 * Symbolic Limits Module
 *
 * Provides symbolic limit computation including:
 * - Basic limits
 * - One-sided limits
 * - Limits at infinity
 * - L'Hôpital's rule for indeterminate forms
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
    Sqrt,
    Abs
} from './functions';

import { substitute } from './manipulate';
import { differentiate } from './differentiate';

export type LimitDirection = 'both' | 'left' | 'right';

/**
 * Compute the limit of an expression as variable approaches a point
 * @param expr - The expression
 * @param variable - The variable
 * @param point - The point to approach (can be Infinity, -Infinity, or finite value)
 * @param direction - Direction to approach from ('both', 'left', 'right')
 * @returns The limit value or undefined if limit doesn't exist
 */
export function limit(
    expr: Expression,
    variable: string,
    point: number | Expression,
    direction: LimitDirection = 'both'
): Expression | undefined {
    const simplified = expr.simplify();

    // Handle infinity
    if (point === Infinity || point === -Infinity) {
        return limitAtInfinity(simplified, variable, point);
    }

    const pointExpr = typeof point === 'number' ? new Constant(point) : point;
    const pointValue = pointExpr.evaluate(new Map());

    // Try direct substitution first
    try {
        const result = substitute(simplified, variable, pointExpr);
        const value = result.evaluate(new Map());

        if (isFinite(value) && !isNaN(value)) {
            return result.simplify();
        }
    } catch (e) {
        // Continue to other methods
    }

    // Check for indeterminate forms
    const form = getIndeterminateForm(simplified, variable, pointValue);

    if (form === '0/0' || form === '∞/∞') {
        // Apply L'Hôpital's rule
        return lhopital(simplified, variable, pointValue, direction);
    }

    // Try numeric approximation
    return numericLimit(simplified, variable, pointValue, direction);
}

/**
 * Compute limit at infinity
 */
export function limitAtInfinity(
    expr: Expression,
    variable: string,
    point: number // Infinity or -Infinity
): Expression | undefined {
    const simplified = expr.simplify();

    // For rational functions, analyze degrees
    if (simplified instanceof Divide) {
        return limitRationalAtInfinity(simplified, variable, point);
    }

    // For polynomials
    const degree = getPolynomialDegree(simplified, variable);
    if (degree >= 0) {
        const leadingCoeff = getLeadingCoefficient(simplified, variable, degree);
        if (degree === 0) {
            return leadingCoeff;
        }
        // For positive degree, limit depends on sign of leading coefficient and direction
        const coeffValue = leadingCoeff.evaluate(new Map());
        if (point === Infinity) {
            return degree % 2 === 0
                ? new Constant(coeffValue > 0 ? Infinity : -Infinity)
                : new Constant(coeffValue * Infinity);
        } else {
            return degree % 2 === 0
                ? new Constant(coeffValue > 0 ? Infinity : -Infinity)
                : new Constant(-coeffValue * Infinity);
        }
    }

    // Try numeric approximation
    try {
        const value = expr.evaluate(new Map([[variable, point === Infinity ? 1e10 : -1e10]]));
        if (isFinite(value)) {
            return new Constant(value);
        }
    } catch (e) {
        // Continue
    }

    return undefined;
}

/**
 * Limit of rational function at infinity
 */
function limitRationalAtInfinity(
    expr: Divide,
    variable: string,
    point: number
): Expression | undefined {
    const numDegree = getPolynomialDegree(expr.numerator, variable);
    const denDegree = getPolynomialDegree(expr.denominator, variable);

    if (numDegree < denDegree) {
        // Numerator grows slower than denominator
        return new Constant(0);
    }

    if (numDegree === denDegree) {
        // Same degree - ratio of leading coefficients
        const numLeading = getLeadingCoefficient(expr.numerator, variable, numDegree);
        const denLeading = getLeadingCoefficient(expr.denominator, variable, denDegree);
        return new Divide(numLeading, denLeading).simplify();
    }

    // numDegree > denDegree - limit is infinity
    const numLeading = getLeadingCoefficient(expr.numerator, variable, numDegree);
    const denLeading = getLeadingCoefficient(expr.denominator, variable, denDegree);
    const coeffRatio = new Divide(numLeading, denLeading).evaluate(new Map());

    const sign = point === Infinity
        ? (numDegree - denDegree) % 2 === 0 ? Math.sign(coeffRatio) : Math.sign(coeffRatio)
        : (numDegree - denDegree) % 2 === 0 ? Math.sign(coeffRatio) : -Math.sign(coeffRatio);

    return new Constant(sign * Infinity);
}

/**
 * Apply L'Hôpital's rule for indeterminate forms 0/0 or ∞/∞
 */
export function lhopital(
    expr: Expression,
    variable: string,
    point: number,
    direction: LimitDirection = 'both',
    maxIterations: number = 5
): Expression | undefined {
    let current = expr.simplify();

    for (let i = 0; i < maxIterations; i++) {
        // Check if it's a fraction
        if (!(current instanceof Divide)) {
            // Try to evaluate directly
            try {
                const result = substitute(current, variable, new Constant(point));
                return result.simplify();
            } catch (e) {
                return undefined;
            }
        }

        const numerator = current.numerator;
        const denominator = current.denominator;

        // Check for indeterminate form
        const form = getIndeterminateFormFraction(numerator, denominator, variable, point);

        if (form !== '0/0' && form !== '∞/∞') {
            // Not indeterminate, try direct evaluation
            try {
                const result = substitute(current, variable, new Constant(point));
                const value = result.evaluate(new Map());
                if (isFinite(value) && !isNaN(value)) {
                    return result.simplify();
                }
            } catch (e) {
                return numericLimit(current, variable, point, direction);
            }
        }

        // Apply L'Hôpital's rule: differentiate numerator and denominator
        const numDerivative = differentiate(numerator, variable);
        const denDerivative = differentiate(denominator, variable);

        current = new Divide(numDerivative, denDerivative).simplify();

        // Try to evaluate the new expression
        try {
            const result = substitute(current, variable, new Constant(point));
            const value = result.evaluate(new Map());

            if (isFinite(value) && !isNaN(value)) {
                return result.simplify();
            }
        } catch (e) {
            // Continue to next iteration
        }
    }

    // If we've exhausted iterations, try numeric approximation
    return numericLimit(current, variable, point, direction);
}

/**
 * Compute limit numerically using sequential approximation
 */
function numericLimit(
    expr: Expression,
    variable: string,
    point: number,
    direction: LimitDirection,
    tolerance: number = 1e-10
): Expression | undefined {
    const steps = [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001];
    const values: number[] = [];

    for (const step of steps) {
        try {
            let testPoint: number;

            if (direction === 'left') {
                testPoint = point - step;
            } else if (direction === 'right') {
                testPoint = point + step;
            } else {
                // Try from both sides and see if they agree
                const leftValue = expr.evaluate(new Map([[variable, point - step]]));
                const rightValue = expr.evaluate(new Map([[variable, point + step]]));

                if (Math.abs(leftValue - rightValue) < tolerance) {
                    testPoint = point + step;
                } else {
                    return undefined; // Limit doesn't exist
                }
            }

            const value = expr.evaluate(new Map([[variable, testPoint]]));

            if (isFinite(value) && !isNaN(value)) {
                values.push(value);
            }
        } catch (e) {
            continue;
        }
    }

    if (values.length >= 3) {
        // Check if values are converging
        const last3 = values.slice(-3);
        const avg = last3.reduce((a, b) => a + b, 0) / 3;
        const variance = last3.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / 3;

        if (variance < tolerance) {
            return new Constant(avg);
        }
    }

    return undefined;
}

/**
 * Determine the indeterminate form of an expression at a point
 */
function getIndeterminateForm(expr: Expression, variable: string, point: number): string | null {
    if (expr instanceof Divide) {
        return getIndeterminateFormFraction(expr.numerator, expr.denominator, variable, point);
    }
    return null;
}

/**
 * Determine indeterminate form for a fraction
 */
function getIndeterminateFormFraction(
    numerator: Expression,
    denominator: Expression,
    variable: string,
    point: number
): string | null {
    try {
        const numValue = substitute(numerator, variable, new Constant(point)).evaluate(new Map());
        const denValue = substitute(denominator, variable, new Constant(point)).evaluate(new Map());

        if (Math.abs(numValue) < 1e-10 && Math.abs(denValue) < 1e-10) {
            return '0/0';
        }

        if (!isFinite(numValue) && !isFinite(denValue)) {
            return '∞/∞';
        }
    } catch (e) {
        // Error evaluating - likely a division by zero or similar
    }

    return null;
}

/**
 * Get the degree of a polynomial expression
 */
function getPolynomialDegree(expr: Expression, variable: string): number {
    if (expr instanceof Constant) {
        return 0;
    }

    if (expr instanceof Variable) {
        return expr.name === variable ? 1 : 0;
    }

    if (expr instanceof Add || expr instanceof Subtract) {
        const terms = expr instanceof Add
            ? expr.terms
            : [expr.left, expr.right];
        return Math.max(...terms.map(t => getPolynomialDegree(t, variable)));
    }

    if (expr instanceof Multiply) {
        return expr.factors.reduce((sum, f) => sum + getPolynomialDegree(f, variable), 0);
    }

    if (expr instanceof Power) {
        if (expr.base instanceof Variable && expr.base.name === variable) {
            if (expr.exponent instanceof Constant) {
                return expr.exponent.value;
            }
        }
        return 0;
    }

    if (expr instanceof Negate) {
        return getPolynomialDegree(expr.operand, variable);
    }

    return -1; // Not a polynomial
}

/**
 * Get the leading coefficient of a polynomial
 */
function getLeadingCoefficient(expr: Expression, variable: string, degree: number): Expression {
    if (degree === 0) {
        return expr.simplify();
    }

    const terms = collectTerms(expr);
    const leadingTerms: Expression[] = [];

    for (const term of terms) {
        const termDegree = getTermDegree(term, variable);
        if (termDegree === degree) {
            leadingTerms.push(extractCoefficient(term, variable, degree));
        }
    }

    return leadingTerms.length > 0
        ? new Add(leadingTerms).simplify()
        : new Constant(0);
}

/**
 * Collect all terms from an expression
 */
function collectTerms(expr: Expression): Expression[] {
    const terms: Expression[] = [];

    function collect(e: Expression, sign: number = 1) {
        if (e instanceof Add) {
            for (const term of e.terms) {
                collect(term, sign);
            }
        } else if (e instanceof Subtract) {
            collect(e.left, sign);
            collect(e.right, -sign);
        } else if (e instanceof Negate) {
            collect(e.operand, -sign);
        } else {
            if (sign < 0) {
                terms.push(new Negate(e).simplify());
            } else {
                terms.push(e);
            }
        }
    }

    collect(expr);
    return terms;
}

/**
 * Get the degree of a term
 */
function getTermDegree(term: Expression, variable: string): number {
    if (term instanceof Constant) {
        return 0;
    }

    if (term instanceof Variable) {
        return term.name === variable ? 1 : 0;
    }

    if (term instanceof Negate) {
        return getTermDegree(term.operand, variable);
    }

    if (term instanceof Multiply) {
        let degree = 0;
        for (const factor of term.factors) {
            degree += getTermDegree(factor, variable);
        }
        return degree;
    }

    if (term instanceof Power) {
        if (term.base instanceof Variable && term.base.name === variable) {
            if (term.exponent instanceof Constant) {
                return term.exponent.value;
            }
        }
        return 0;
    }

    return 0;
}

/**
 * Extract coefficient of x^degree from a term
 */
function extractCoefficient(term: Expression, variable: string, degree: number): Expression {
    if (degree === 0) {
        return term;
    }

    if (term instanceof Negate) {
        return new Negate(extractCoefficient(term.operand, variable, degree)).simplify();
    }

    if (term instanceof Multiply) {
        const others: Expression[] = [];

        for (const factor of term.factors) {
            if (factor instanceof Variable && factor.name === variable) {
                // Skip it
            } else if (factor instanceof Power &&
                       factor.base instanceof Variable &&
                       (factor.base as Variable).name === variable &&
                       factor.exponent instanceof Constant &&
                       factor.exponent.value === degree) {
                // Skip it
            } else {
                others.push(factor);
            }
        }

        return others.length > 0 ? new Multiply(others).simplify() : new Constant(1);
    }

    if (term instanceof Power &&
        term.base instanceof Variable &&
        term.base.name === variable &&
        term.exponent instanceof Constant &&
        term.exponent.value === degree) {
        return new Constant(1);
    }

    return new Constant(1);
}

/**
 * Compute one-sided limit from the left
 */
export function limitFromLeft(
    expr: Expression,
    variable: string,
    point: number | Expression
): Expression | undefined {
    const pointValue = typeof point === 'number' ? point : point.evaluate(new Map());
    return limit(expr, variable, pointValue, 'left');
}

/**
 * Compute one-sided limit from the right
 */
export function limitFromRight(
    expr: Expression,
    variable: string,
    point: number | Expression
): Expression | undefined {
    const pointValue = typeof point === 'number' ? point : point.evaluate(new Map());
    return limit(expr, variable, pointValue, 'right');
}

/**
 * Check if a limit exists (both one-sided limits exist and are equal)
 */
export function limitExists(
    expr: Expression,
    variable: string,
    point: number | Expression
): boolean {
    const pointValue = typeof point === 'number' ? point : point.evaluate(new Map());

    const leftLimit = limitFromLeft(expr, variable, pointValue);
    const rightLimit = limitFromRight(expr, variable, pointValue);

    if (!leftLimit || !rightLimit) {
        return false;
    }

    const leftValue = leftLimit.evaluate(new Map());
    const rightValue = rightLimit.evaluate(new Map());

    return Math.abs(leftValue - rightValue) < 1e-10;
}
