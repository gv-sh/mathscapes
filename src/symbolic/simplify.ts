/**
 * Advanced Simplification
 *
 * Provides advanced simplification capabilities including:
 * - Algebraic simplification (combine like terms, collect coefficients)
 * - Trigonometric identities
 * - Logarithm and exponential simplification
 * - Rationalization
 * - Expression expansion and factoring
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
    Log,
    Sqrt
} from './functions';

/**
 * Perform algebraic simplification - combine like terms
 * @param expr - The expression to simplify
 * @returns Simplified expression
 */
export function algebraicSimplify(expr: Expression): Expression {
    // First, expand the expression
    const expanded = expand(expr);

    // Then, collect like terms
    return collectLikeTerms(expanded);
}

/**
 * Collect like terms in an expression
 * E.g., 2x + 3x + 5 -> 5x + 5
 */
export function collectLikeTerms(expr: Expression): Expression {
    const simplified = expr.simplify();

    if (!(simplified instanceof Add)) {
        return simplified;
    }

    // Group terms by their variable part
    const termGroups = new Map<string, Expression[]>();

    for (const term of simplified.terms) {
        const key = getTermKey(term);
        if (!termGroups.has(key)) {
            termGroups.set(key, []);
        }
        termGroups.get(key)!.push(term);
    }

    // Combine coefficients for each group
    const combinedTerms: Expression[] = [];

    for (const [key, terms] of termGroups) {
        if (terms.length === 1) {
            combinedTerms.push(terms[0]);
        } else {
            // Extract coefficients and combine
            const coefficients: number[] = [];
            let variablePart: Expression | null = null;

            for (const term of terms) {
                const { coefficient, variable } = extractCoefficientAndVariable(term);
                coefficients.push(coefficient);
                if (variablePart === null) {
                    variablePart = variable;
                }
            }

            const totalCoeff = coefficients.reduce((a, b) => a + b, 0);
            if (totalCoeff !== 0) {
                if (variablePart === null || variablePart instanceof Constant) {
                    combinedTerms.push(new Constant(totalCoeff));
                } else if (totalCoeff === 1) {
                    combinedTerms.push(variablePart);
                } else {
                    combinedTerms.push(new Multiply([new Constant(totalCoeff), variablePart]));
                }
            }
        }
    }

    if (combinedTerms.length === 0) {
        return new Constant(0);
    }
    if (combinedTerms.length === 1) {
        return combinedTerms[0];
    }
    return new Add(combinedTerms).simplify();
}

/**
 * Get a key representing the variable part of a term (for grouping)
 */
function getTermKey(term: Expression): string {
    const { variable } = extractCoefficientAndVariable(term);
    return variable.toString();
}

/**
 * Extract coefficient and variable part from a term
 */
function extractCoefficientAndVariable(term: Expression): { coefficient: number; variable: Expression } {
    if (term instanceof Constant) {
        return { coefficient: term.value, variable: new Constant(1) };
    }

    if (term instanceof Variable) {
        return { coefficient: 1, variable: term };
    }

    if (term instanceof Multiply) {
        let coefficient = 1;
        const variableFactors: Expression[] = [];

        for (const factor of term.factors) {
            if (factor instanceof Constant) {
                coefficient *= factor.value;
            } else {
                variableFactors.push(factor);
            }
        }

        const variable = variableFactors.length === 0 ? new Constant(1) :
            variableFactors.length === 1 ? variableFactors[0] :
                new Multiply(variableFactors);

        return { coefficient, variable };
    }

    if (term instanceof Negate) {
        const inner = extractCoefficientAndVariable(term.operand);
        return { coefficient: -inner.coefficient, variable: inner.variable };
    }

    return { coefficient: 1, variable: term };
}

/**
 * Expand an expression (distribute multiplication over addition)
 * E.g., (x + 2)(x + 3) -> x^2 + 5x + 6
 */
export function expand(expr: Expression): Expression {
    if (expr instanceof Constant || expr instanceof Variable) {
        return expr;
    }

    if (expr instanceof Add) {
        return new Add(expr.terms.map(t => expand(t))).simplify();
    }

    if (expr instanceof Subtract) {
        return new Subtract(expand(expr.left), expand(expr.right)).simplify();
    }

    if (expr instanceof Negate) {
        return new Negate(expand(expr.operand)).simplify();
    }

    if (expr instanceof Multiply) {
        // Expand each factor first
        const expandedFactors = expr.factors.map(f => expand(f));

        // Distribute multiplication over addition
        let result: Expression = expandedFactors[0];

        for (let i = 1; i < expandedFactors.length; i++) {
            result = multiplyAndExpand(result, expandedFactors[i]);
        }

        return result.simplify();
    }

    if (expr instanceof Power) {
        const base = expand(expr.base);
        const exp = expand(expr.exponent);

        // Expand (a+b)^n for small integer n
        if (exp instanceof Constant && Number.isInteger(exp.value) && exp.value > 0 && exp.value <= 4) {
            let result: Expression = base;
            for (let i = 1; i < exp.value; i++) {
                result = multiplyAndExpand(result, base);
            }
            return result.simplify();
        }

        return new Power(base, exp).simplify();
    }

    if (expr instanceof Divide) {
        return new Divide(expand(expr.numerator), expand(expr.denominator)).simplify();
    }

    // For functions, expand their arguments
    if (expr instanceof Sin || expr instanceof Cos || expr instanceof Tan ||
        expr instanceof Exp || expr instanceof Ln || expr instanceof Sqrt) {
        const constructor = expr.constructor as any;
        return new constructor(expand((expr as any).argument)).simplify();
    }

    return expr;
}

/**
 * Multiply two expressions and expand the result
 */
function multiplyAndExpand(left: Expression, right: Expression): Expression {
    // If either is an addition, distribute
    if (left instanceof Add) {
        const terms = left.terms.map(t => multiplyAndExpand(t, right));
        return new Add(terms);
    }

    if (right instanceof Add) {
        const terms = right.terms.map(t => multiplyAndExpand(left, t));
        return new Add(terms);
    }

    // Otherwise, just multiply
    return new Multiply([left, right]);
}

/**
 * Factor an expression (limited implementation for simple cases)
 * E.g., x^2 + 5x + 6 -> (x + 2)(x + 3)
 */
export function factor(expr: Expression): Expression {
    // This is a complex operation that requires polynomial factorization
    // For now, implement simple cases like common factor extraction

    const simplified = expr.simplify();

    if (simplified instanceof Add) {
        // Try to find common factors
        const commonFactor = findCommonFactor(simplified.terms);
        if (commonFactor && !(commonFactor instanceof Constant && commonFactor.value === 1)) {
            const factored = simplified.terms.map(term => divideByFactor(term, commonFactor));
            const sum = factored.length === 1 ? factored[0] : new Add(factored);
            return new Multiply([commonFactor, sum]).simplify();
        }
    }

    return simplified;
}

/**
 * Find the common factor among terms
 */
function findCommonFactor(terms: Expression[]): Expression | null {
    if (terms.length === 0) return null;

    // For simplicity, only handle numeric common factors
    const coefficients: number[] = [];

    for (const term of terms) {
        const { coefficient } = extractCoefficientAndVariable(term);
        coefficients.push(Math.abs(coefficient));
    }

    const gcd = coefficients.reduce((a, b) => gcdNumber(a, b));
    if (gcd > 1) {
        return new Constant(gcd);
    }

    return new Constant(1);
}

/**
 * Divide a term by a factor
 */
function divideByFactor(term: Expression, factor: Expression): Expression {
    if (factor instanceof Constant) {
        const { coefficient, variable } = extractCoefficientAndVariable(term);
        const newCoeff = coefficient / factor.value;
        if (newCoeff === 1) {
            return variable;
        }
        if (variable instanceof Constant && variable.value === 1) {
            return new Constant(newCoeff);
        }
        return new Multiply([new Constant(newCoeff), variable]);
    }

    return new Divide(term, factor);
}

/**
 * GCD of two numbers
 */
function gcdNumber(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

/**
 * Apply trigonometric identities to simplify
 */
export function simplifyTrig(expr: Expression): Expression {
    const simplified = expr.simplify();

    // sin^2(x) + cos^2(x) = 1
    if (simplified instanceof Add) {
        for (let i = 0; i < simplified.terms.length; i++) {
            for (let j = i + 1; j < simplified.terms.length; j++) {
                const term1 = simplified.terms[i];
                const term2 = simplified.terms[j];

                // Check for sin^2(x) and cos^2(x) pattern
                if (isPowerOfSin(term1, 2) && isPowerOfCos(term2, 2)) {
                    const sin = (term1 as Power).base as Sin;
                    const cos = (term2 as Power).base as Cos;

                    if (sin.argument.equals(cos.argument)) {
                        // Replace with 1 and remove both terms
                        const newTerms = simplified.terms.filter((_, idx) => idx !== i && idx !== j);
                        newTerms.push(new Constant(1));
                        if (newTerms.length === 1) {
                            return newTerms[0];
                        }
                        return new Add(newTerms).simplify();
                    }
                }

                // Also check reversed order
                if (isPowerOfCos(term1, 2) && isPowerOfSin(term2, 2)) {
                    const cos = (term1 as Power).base as Cos;
                    const sin = (term2 as Power).base as Sin;

                    if (sin.argument.equals(cos.argument)) {
                        const newTerms = simplified.terms.filter((_, idx) => idx !== i && idx !== j);
                        newTerms.push(new Constant(1));
                        if (newTerms.length === 1) {
                            return newTerms[0];
                        }
                        return new Add(newTerms).simplify();
                    }
                }
            }
        }
    }

    // tan(x) = sin(x)/cos(x)
    // More complex transformations would go here

    return simplified;
}

/**
 * Check if expression is sin(x)^n
 */
function isPowerOfSin(expr: Expression, n: number): boolean {
    return expr instanceof Power &&
        expr.base instanceof Sin &&
        expr.exponent instanceof Constant &&
        expr.exponent.value === n;
}

/**
 * Check if expression is cos(x)^n
 */
function isPowerOfCos(expr: Expression, n: number): boolean {
    return expr instanceof Power &&
        expr.base instanceof Cos &&
        expr.exponent instanceof Constant &&
        expr.exponent.value === n;
}

/**
 * Simplify logarithmic and exponential expressions
 */
export function simplifyLogExp(expr: Expression): Expression {
    const simplified = expr.simplify();

    // ln(e^x) = x
    if (simplified instanceof Ln && simplified.argument instanceof Exp) {
        return simplified.argument.argument;
    }

    // e^(ln(x)) = x
    if (simplified instanceof Exp && simplified.argument instanceof Ln) {
        return simplified.argument.argument;
    }

    // ln(a*b) = ln(a) + ln(b)
    if (simplified instanceof Ln && simplified.argument instanceof Multiply) {
        const terms = simplified.argument.factors.map(f => new Ln(f));
        return new Add(terms).simplify();
    }

    // ln(a^b) = b*ln(a)
    if (simplified instanceof Ln && simplified.argument instanceof Power) {
        const base = simplified.argument.base;
        const exp = simplified.argument.exponent;
        return new Multiply([exp, new Ln(base)]).simplify();
    }

    // ln(a/b) = ln(a) - ln(b)
    if (simplified instanceof Ln && simplified.argument instanceof Divide) {
        return new Subtract(
            new Ln(simplified.argument.numerator),
            new Ln(simplified.argument.denominator)
        ).simplify();
    }

    // e^a * e^b = e^(a+b)
    if (simplified instanceof Multiply) {
        const expTerms: Expression[] = [];
        const otherTerms: Expression[] = [];

        for (const factor of simplified.factors) {
            if (factor instanceof Exp) {
                expTerms.push(factor.argument);
            } else {
                otherTerms.push(factor);
            }
        }

        if (expTerms.length > 1) {
            const combinedExp = new Exp(new Add(expTerms));
            if (otherTerms.length === 0) {
                return combinedExp.simplify();
            }
            return new Multiply([...otherTerms, combinedExp]).simplify();
        }
    }

    // Recursively simplify sub-expressions
    if (simplified instanceof Add) {
        return new Add(simplified.terms.map(t => simplifyLogExp(t))).simplify();
    }

    if (simplified instanceof Multiply) {
        return new Multiply(simplified.factors.map(f => simplifyLogExp(f))).simplify();
    }

    return simplified;
}

/**
 * Rationalize the denominator of an expression
 * E.g., 1/sqrt(2) -> sqrt(2)/2
 */
export function rationalize(expr: Expression): Expression {
    if (expr instanceof Divide) {
        const num = expr.numerator;
        const denom = expr.denominator;

        // Handle 1/sqrt(x) -> sqrt(x)/x
        if (denom instanceof Sqrt) {
            const newNum = new Multiply([num, new Sqrt(denom.argument)]);
            const newDenom = denom.argument;
            return new Divide(newNum, newDenom).simplify();
        }

        // Handle a/(b + sqrt(c)) -> rationalize by multiplying by conjugate
        if (denom instanceof Add && denom.terms.length === 2) {
            // Check if one term contains a sqrt
            const hasSqrt = denom.terms.some(t => containsSqrt(t));
            if (hasSqrt) {
                // Multiply by conjugate
                const conjugate = new Subtract(denom.terms[0], denom.terms[1]);
                const newNum = new Multiply([num, conjugate]);
                const newDenom = new Multiply([denom, conjugate]);
                return new Divide(expand(newNum), expand(newDenom)).simplify();
            }
        }

        // Handle a/(b - sqrt(c)) similarly
        if (denom instanceof Subtract) {
            if (containsSqrt(denom.left) || containsSqrt(denom.right)) {
                const conjugate = new Add([denom.left, denom.right]);
                const newNum = new Multiply([num, conjugate]);
                const newDenom = new Multiply([denom, conjugate]);
                return new Divide(expand(newNum), expand(newDenom)).simplify();
            }
        }
    }

    return expr;
}

/**
 * Check if an expression contains a square root
 */
function containsSqrt(expr: Expression): boolean {
    if (expr instanceof Sqrt) {
        return true;
    }

    if (expr instanceof Add) {
        return expr.terms.some(t => containsSqrt(t));
    }

    if (expr instanceof Multiply) {
        return expr.factors.some(f => containsSqrt(f));
    }

    if (expr instanceof Power && expr.exponent instanceof Constant && expr.exponent.value === 0.5) {
        return true;
    }

    return false;
}
