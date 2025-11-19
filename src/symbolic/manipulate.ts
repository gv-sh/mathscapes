/**
 * Expression Manipulation
 *
 * Provides capabilities for manipulating expressions including:
 * - Variable substitution
 * - Solving equations (linear, quadratic, simple cases)
 * - Partial fraction decomposition
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

import { Polynomial } from './polynomial';

/**
 * Substitute a value for a variable in an expression
 * @param expr - The expression
 * @param variable - The variable name to substitute
 * @param value - The value to substitute (can be expression or number)
 * @returns New expression with substitution applied
 */
export function substitute(expr: Expression, variable: string, value: Expression | number): Expression {
    const valueExpr = typeof value === 'number' ? new Constant(value) : value;

    if (expr instanceof Constant) {
        return expr.clone();
    }

    if (expr instanceof Variable) {
        return expr.name === variable ? valueExpr.clone() : expr.clone();
    }

    if (expr instanceof Add) {
        return new Add(expr.terms.map(t => substitute(t, variable, valueExpr))).simplify();
    }

    if (expr instanceof Subtract) {
        return new Subtract(
            substitute(expr.left, variable, valueExpr),
            substitute(expr.right, variable, valueExpr)
        ).simplify();
    }

    if (expr instanceof Multiply) {
        return new Multiply(expr.factors.map(f => substitute(f, variable, valueExpr))).simplify();
    }

    if (expr instanceof Divide) {
        return new Divide(
            substitute(expr.numerator, variable, valueExpr),
            substitute(expr.denominator, variable, valueExpr)
        ).simplify();
    }

    if (expr instanceof Power) {
        return new Power(
            substitute(expr.base, variable, valueExpr),
            substitute(expr.exponent, variable, valueExpr)
        ).simplify();
    }

    if (expr instanceof Negate) {
        return new Negate(substitute(expr.operand, variable, valueExpr)).simplify();
    }

    // Handle functions
    if (expr instanceof Sin) {
        return new Sin(substitute(expr.argument, variable, valueExpr)).simplify();
    }

    if (expr instanceof Cos) {
        return new Cos(substitute(expr.argument, variable, valueExpr)).simplify();
    }

    if (expr instanceof Tan) {
        return new Tan(substitute(expr.argument, variable, valueExpr)).simplify();
    }

    if (expr instanceof Exp) {
        return new Exp(substitute(expr.argument, variable, valueExpr)).simplify();
    }

    if (expr instanceof Ln) {
        return new Ln(substitute(expr.argument, variable, valueExpr)).simplify();
    }

    if (expr instanceof Sqrt) {
        return new Sqrt(substitute(expr.argument, variable, valueExpr)).simplify();
    }

    throw new Error(`Unknown expression type for substitution: ${(expr.constructor as any).name}`);
}

/**
 * Substitute multiple variables at once
 * @param expr - The expression
 * @param substitutions - Map of variable names to their values
 * @returns New expression with all substitutions applied
 */
export function substituteMultiple(
    expr: Expression,
    substitutions: Map<string, Expression | number>
): Expression {
    let result = expr;
    for (const [variable, value] of substitutions) {
        result = substitute(result, variable, value);
    }
    return result.simplify();
}

/**
 * Solve an equation for a variable
 * Supports linear and quadratic equations in standard forms
 * @param equation - The equation (expression = 0)
 * @param variable - The variable to solve for
 * @returns Array of solutions
 */
export function solve(equation: Expression, variable: string): Expression[] {
    // Move everything to one side (already assumed to be = 0)
    const simplified = equation.simplify();

    // Try to identify the equation type
    const degree = getDegree(simplified, variable);

    if (degree === 0) {
        // No variable present - either always true or always false
        if (simplified instanceof Constant) {
            if (Math.abs(simplified.value) < 1e-10) {
                // 0 = 0, infinite solutions
                throw new Error('Equation has infinite solutions');
            } else {
                // constant = 0, no solutions (e.g., 5 = 0)
                return [];
            }
        }
        // If it's not a constant but has degree 0, it doesn't contain the variable
        // This might be an expression with other variables
        throw new Error(`Expression does not contain variable '${variable}'`);
    }

    if (degree === 1) {
        // Linear equation: ax + b = 0 => x = -b/a
        return solveLinear(simplified, variable);
    }

    if (degree === 2) {
        // Quadratic equation: ax^2 + bx + c = 0
        return solveQuadratic(simplified, variable);
    }

    throw new Error(`Cannot solve equation of degree ${degree}`);
}

/**
 * Get the degree of a polynomial expression in a variable
 */
function getDegree(expr: Expression, variable: string): number {
    if (expr instanceof Constant) {
        return 0;
    }

    if (expr instanceof Variable) {
        return expr.name === variable ? 1 : 0;
    }

    if (expr instanceof Add || expr instanceof Subtract) {
        const terms = expr instanceof Add ? expr.terms : [expr.left, expr.right];
        return Math.max(...terms.map(t => getDegree(t, variable)));
    }

    if (expr instanceof Multiply) {
        return expr.factors.reduce((sum, f) => sum + getDegree(f, variable), 0);
    }

    if (expr instanceof Negate) {
        return getDegree(expr.operand, variable);
    }

    if (expr instanceof Power) {
        if (expr.base instanceof Variable && expr.base.name === variable) {
            if (expr.exponent instanceof Constant) {
                return expr.exponent.value;
            }
        }
        return 0; // Can't determine for complex powers
    }

    if (expr instanceof Divide) {
        // x/2 has degree 1 in x, 1/x has degree -1
        const numDegree = getDegree(expr.numerator, variable);
        const denomDegree = getDegree(expr.denominator, variable);
        return numDegree - denomDegree;
    }

    return 0;
}

/**
 * Solve a linear equation ax + b = 0
 */
function solveLinear(expr: Expression, variable: string): Expression[] {
    // Extract coefficients: ax + b = 0
    const { a, b } = extractLinearCoefficients(expr, variable);

    if (a === 0) {
        if (b === 0) {
            throw new Error('Equation has infinite solutions');
        }
        return [];
    }

    // x = -b/a
    return [new Divide(new Constant(-b), new Constant(a)).simplify()];
}

/**
 * Extract coefficients from linear expression ax + b
 */
function extractLinearCoefficients(expr: Expression, variable: string): { a: number; b: number } {
    const expanded = expr.simplify();

    let a = 0;
    let b = 0;

    if (expanded instanceof Add) {
        for (const term of expanded.terms) {
            const { coeff, hasVar } = analyzeTerm(term, variable);
            if (hasVar) {
                a += coeff;
            } else {
                b += coeff;
            }
        }
    } else if (expanded instanceof Subtract) {
        // Handle a - b as a + (-b)
        const leftAnalysis = analyzeTerm(expanded.left, variable);
        const rightAnalysis = analyzeTerm(expanded.right, variable);

        if (leftAnalysis.hasVar) {
            a += leftAnalysis.coeff;
        } else {
            b += leftAnalysis.coeff;
        }

        if (rightAnalysis.hasVar) {
            a -= rightAnalysis.coeff;
        } else {
            b -= rightAnalysis.coeff;
        }
    } else {
        const { coeff, hasVar } = analyzeTerm(expanded, variable);
        if (hasVar) {
            a = coeff;
        } else {
            b = coeff;
        }
    }

    return { a, b };
}

/**
 * Solve a quadratic equation ax^2 + bx + c = 0
 */
function solveQuadratic(expr: Expression, variable: string): Expression[] {
    const { a, b, c } = extractQuadraticCoefficients(expr, variable);

    if (a === 0) {
        // Not actually quadratic, solve as linear
        return solveLinear(expr, variable);
    }

    // Discriminant: b^2 - 4ac
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
        // No real solutions
        return [];
    }

    if (discriminant === 0) {
        // One solution: x = -b/(2a)
        return [new Divide(
            new Constant(-b),
            new Constant(2 * a)
        ).simplify()];
    }

    // Two solutions: x = (-b ± sqrt(discriminant))/(2a)
    const sqrtDisc = new Sqrt(new Constant(discriminant));
    const twoA = new Constant(2 * a);
    const negB = new Constant(-b);

    const solution1 = new Divide(
        new Add([negB, sqrtDisc]),
        twoA
    ).simplify();

    const solution2 = new Divide(
        new Subtract(negB, sqrtDisc),
        twoA
    ).simplify();

    return [solution1, solution2];
}

/**
 * Extract coefficients from quadratic expression ax^2 + bx + c
 */
function extractQuadraticCoefficients(expr: Expression, variable: string): { a: number; b: number; c: number } {
    const expanded = expr.simplify();

    let a = 0;
    let b = 0;
    let c = 0;

    if (expanded instanceof Add) {
        for (const term of expanded.terms) {
            const { coeff, degree } = analyzeTermDegree(term, variable);
            if (degree === 2) {
                a += coeff;
            } else if (degree === 1) {
                b += coeff;
            } else {
                c += coeff;
            }
        }
    } else if (expanded instanceof Subtract) {
        // Handle left - right as left + (-right)
        const leftAnalysis = analyzeTermDegree(expanded.left, variable);
        const rightAnalysis = analyzeTermDegree(expanded.right, variable);

        if (leftAnalysis.degree === 2) {
            a += leftAnalysis.coeff;
        } else if (leftAnalysis.degree === 1) {
            b += leftAnalysis.coeff;
        } else {
            c += leftAnalysis.coeff;
        }

        if (rightAnalysis.degree === 2) {
            a -= rightAnalysis.coeff;
        } else if (rightAnalysis.degree === 1) {
            b -= rightAnalysis.coeff;
        } else {
            c -= rightAnalysis.coeff;
        }
    } else {
        const { coeff, degree } = analyzeTermDegree(expanded, variable);
        if (degree === 2) {
            a = coeff;
        } else if (degree === 1) {
            b = coeff;
        } else {
            c = coeff;
        }
    }

    return { a, b, c };
}

/**
 * Analyze a term to get its coefficient and degree
 */
function analyzeTermDegree(term: Expression, variable: string): { coeff: number; degree: number } {
    if (term instanceof Constant) {
        return { coeff: term.value, degree: 0 };
    }

    if (term instanceof Variable) {
        return { coeff: 1, degree: term.name === variable ? 1 : 0 };
    }

    if (term instanceof Multiply) {
        let coeff = 1;
        let degree = 0;

        for (const factor of term.factors) {
            if (factor instanceof Constant) {
                coeff *= factor.value;
            } else if (factor instanceof Variable && factor.name === variable) {
                degree += 1;
            } else if (factor instanceof Power &&
                factor.base instanceof Variable &&
                (factor.base as Variable).name === variable &&
                factor.exponent instanceof Constant) {
                degree += factor.exponent.value;
            }
        }

        return { coeff, degree };
    }

    if (term instanceof Power &&
        term.base instanceof Variable &&
        (term.base as Variable).name === variable &&
        term.exponent instanceof Constant) {
        return { coeff: 1, degree: term.exponent.value };
    }

    if (term instanceof Negate) {
        const inner = analyzeTermDegree(term.operand, variable);
        return { coeff: -inner.coeff, degree: inner.degree };
    }

    if (term instanceof Divide) {
        // Handle x/c as (1/c)*x
        const numAnalysis = analyzeTermDegree(term.numerator, variable);
        const denomVars = term.denominator.getVariables();

        if (!denomVars.has(variable) && term.denominator instanceof Constant) {
            return { coeff: numAnalysis.coeff / term.denominator.value, degree: numAnalysis.degree };
        }
    }

    return { coeff: 0, degree: 0 };
}

/**
 * Analyze a term to check if it contains the variable
 */
function analyzeTerm(term: Expression, variable: string): { coeff: number; hasVar: boolean } {
    if (term instanceof Constant) {
        return { coeff: term.value, hasVar: false };
    }

    if (term instanceof Variable) {
        if (term.name === variable) {
            return { coeff: 1, hasVar: true };
        }
        return { coeff: 0, hasVar: false };
    }

    if (term instanceof Multiply) {
        let coeff = 1;
        let hasVar = false;

        for (const factor of term.factors) {
            if (factor instanceof Constant) {
                coeff *= factor.value;
            } else if (factor instanceof Variable && factor.name === variable) {
                hasVar = true;
            }
        }

        return { coeff, hasVar };
    }

    if (term instanceof Negate) {
        const inner = analyzeTerm(term.operand, variable);
        return { coeff: -inner.coeff, hasVar: inner.hasVar };
    }

    if (term instanceof Divide) {
        // Handle x/c as (1/c)*x
        const numAnalysis = analyzeTerm(term.numerator, variable);
        const denomVars = term.denominator.getVariables();

        if (!denomVars.has(variable) && term.denominator instanceof Constant) {
            return { coeff: numAnalysis.coeff / term.denominator.value, hasVar: numAnalysis.hasVar };
        }
    }

    const vars = term.getVariables();
    if (vars.has(variable)) {
        return { coeff: 1, hasVar: true };
    }

    return { coeff: 0, hasVar: false };
}

/**
 * Perform partial fraction decomposition
 * Decomposes a rational function into simpler fractions
 * E.g., (2x+3)/((x+1)(x+2)) -> A/(x+1) + B/(x+2)
 *
 * Limited implementation for simple cases
 */
export function partialFractions(expr: Expression, variable: string): Expression {
    if (!(expr instanceof Divide)) {
        return expr;
    }

    const numerator = expr.numerator;
    const denominator = expr.denominator;

    // Check if denominator is a product
    if (!(denominator instanceof Multiply)) {
        return expr;
    }

    // For now, handle simple case: linear factors only
    // (ax + b) / ((cx + d)(ex + f)) = A/(cx + d) + B/(ex + f)

    if (denominator.factors.length !== 2) {
        throw new Error('Partial fractions: only two factors supported currently');
    }

    const factor1 = denominator.factors[0];
    const factor2 = denominator.factors[1];

    // Check if both factors are linear
    if (getDegree(factor1, variable) !== 1 || getDegree(factor2, variable) !== 1) {
        throw new Error('Partial fractions: only linear factors supported currently');
    }

    // Set up the equation: numerator = A*factor2 + B*factor1
    // We'll solve for A and B by substituting strategic values

    // Strategy: Find roots of denominators and substitute
    const root1 = solveLinear(factor1, variable)[0];
    const root2 = solveLinear(factor2, variable)[0];

    // Evaluate numerator at root1: numerator(root1) = A*factor2(root1)
    const numAtRoot1 = substitute(numerator, variable, root1).evaluate(new Map());
    const factor2AtRoot1 = substitute(factor2, variable, root1).evaluate(new Map());
    const A = numAtRoot1 / factor2AtRoot1;

    // Evaluate numerator at root2: numerator(root2) = B*factor1(root2)
    const numAtRoot2 = substitute(numerator, variable, root2).evaluate(new Map());
    const factor1AtRoot2 = substitute(factor1, variable, root2).evaluate(new Map());
    const B = numAtRoot2 / factor1AtRoot2;

    // Return A/factor1 + B/factor2
    return new Add([
        new Divide(new Constant(A), factor1),
        new Divide(new Constant(B), factor2)
    ]).simplify();
}

/**
 * Isolate a variable on one side of an equation
 * Given an equation expr = 0, try to write it as variable = something
 * @param expr - The equation (assumed to equal 0)
 * @param variable - The variable to isolate
 * @returns Expression representing the solution for the variable
 */
export function isolate(expr: Expression, variable: string): Expression {
    const solutions = solve(expr, variable);
    if (solutions.length === 0) {
        throw new Error('No solution exists');
    }
    if (solutions.length > 1) {
        throw new Error('Multiple solutions exist, use solve() instead');
    }
    return solutions[0];
}
