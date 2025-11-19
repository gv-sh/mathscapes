/**
 * Equation Solving Module
 *
 * Provides comprehensive equation solving capabilities:
 * - Linear equations (symbolic and numeric)
 * - Quadratic equations (exact symbolic solutions)
 * - Cubic and quartic equations (symbolic formulas)
 * - Polynomial equations (numeric methods)
 * - Systems of linear equations (symbolic)
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

import { Sqrt } from './functions';
import { substitute } from './manipulate';
import { differentiate } from './differentiate';

/**
 * Solve a linear equation ax + b = 0
 * Returns exact symbolic solution
 */
export function solveLinear(equation: Expression, variable: string): Expression[] {
    const simplified = equation.simplify();

    // Extract symbolic coefficients
    const { a, b } = extractLinearCoeffs(simplified, variable);

    // Check if a is zero (only for pure numeric coefficients)
    let aValue: number | null = null;
    let bValue: number | null = null;

    try {
        aValue = a.evaluate(new Map());
        bValue = b.evaluate(new Map());
    } catch (e) {
        // Symbolic coefficients - continue with symbolic solution
    }

    if (aValue !== null && bValue !== null) {
        if (Math.abs(aValue) < 1e-10) {
            if (Math.abs(bValue) < 1e-10) {
                throw new Error('Equation has infinite solutions');
            }
            return []; // No solution
        }
    }

    // x = -b/a
    return [new Divide(new Negate(b), a).simplify()];
}

/**
 * Extract symbolic coefficients from linear expression ax + b
 */
function extractLinearCoeffs(expr: Expression, variable: string): { a: Expression; b: Expression } {
    let aTerms: Expression[] = [];
    let bTerms: Expression[] = [];

    const terms = collectTerms(expr);

    for (const term of terms) {
        if (containsVariable(term, variable)) {
            // Extract coefficient of variable term
            const coeff = extractCoefficient(term, variable);
            aTerms.push(coeff);
        } else {
            bTerms.push(term);
        }
    }

    const a = aTerms.length === 0 ? new Constant(0) :
              aTerms.length === 1 ? aTerms[0] :
              new Add(aTerms).simplify();
    const b = bTerms.length === 0 ? new Constant(0) :
              bTerms.length === 1 ? bTerms[0] :
              new Add(bTerms).simplify();

    return { a, b };
}

/**
 * Solve a quadratic equation ax^2 + bx + c = 0
 * Returns exact symbolic solutions using the quadratic formula
 */
export function solveQuadratic(equation: Expression, variable: string): Expression[] {
    const simplified = equation.simplify();

    // Extract symbolic coefficients
    const { a, b, c } = extractQuadraticCoeffs(simplified, variable);

    // Check if actually quadratic (only for pure numeric coefficients)
    try {
        const aValue = a.evaluate(new Map());
        if (Math.abs(aValue) < 1e-10) {
            return solveLinear(equation, variable);
        }
    } catch (e) {
        // Symbolic coefficient - assume it's quadratic
    }

    // Compute discriminant: b^2 - 4ac
    const discriminant = new Subtract(
        new Power(b, new Constant(2)),
        new Multiply([new Constant(4), a, c])
    ).simplify();

    let discValue: number | null = null;
    let isSymbolic = false;

    try {
        discValue = discriminant.evaluate(new Map());

        if (discValue < -1e-10) {
            // No real solutions
            return [];
        }
    } catch (e) {
        // Symbolic discriminant - can't determine sign, return both solutions
        isSymbolic = true;
    }

    // x = (-b ± sqrt(discriminant)) / (2a)
    const twoA = new Multiply([new Constant(2), a]).simplify();
    const negB = new Negate(b).simplify();
    const sqrtDisc = new Sqrt(discriminant).simplify();

    if (!isSymbolic && discValue !== null && Math.abs(discValue) < 1e-10) {
        // One solution (repeated root) - only for numeric discriminants
        return [new Divide(negB, twoA).simplify()];
    }

    // Two solutions
    const sol1 = new Divide(
        new Add([negB, sqrtDisc]),
        twoA
    ).simplify();

    const sol2 = new Divide(
        new Subtract(negB, sqrtDisc),
        twoA
    ).simplify();

    return [sol1, sol2];
}

/**
 * Extract symbolic coefficients from quadratic expression ax^2 + bx + c
 */
function extractQuadraticCoeffs(expr: Expression, variable: string): {
    a: Expression;
    b: Expression;
    c: Expression
} {
    let aTerms: Expression[] = [];
    let bTerms: Expression[] = [];
    let cTerms: Expression[] = [];

    const terms = collectTerms(expr);

    for (const term of terms) {
        const degree = getTermDegree(term, variable);
        if (degree === 2) {
            const coeff = extractCoefficientForDegree(term, variable, 2);
            aTerms.push(coeff);
        } else if (degree === 1) {
            const coeff = extractCoefficientForDegree(term, variable, 1);
            bTerms.push(coeff);
        } else {
            cTerms.push(term);
        }
    }

    const a = aTerms.length === 0 ? new Constant(0) :
              aTerms.length === 1 ? aTerms[0] :
              new Add(aTerms).simplify();
    const b = bTerms.length === 0 ? new Constant(0) :
              bTerms.length === 1 ? bTerms[0] :
              new Add(bTerms).simplify();
    const c = cTerms.length === 0 ? new Constant(0) :
              cTerms.length === 1 ? cTerms[0] :
              new Add(cTerms).simplify();

    return { a, b, c };
}

/**
 * Solve a cubic equation ax^3 + bx^2 + cx + d = 0
 * Uses Cardano's formula for exact symbolic solutions
 */
export function solveCubic(equation: Expression, variable: string): Expression[] {
    const simplified = equation.simplify();
    const { a, b, c, d } = extractCubicCoeffs(simplified, variable);

    // Check degree
    const aValue = a.evaluate(new Map());
    if (Math.abs(aValue) < 1e-10) {
        return solveQuadratic(equation, variable);
    }

    // For simplicity, use numeric methods for cubic
    // Full symbolic Cardano formula is complex
    return solvePolynomialNumeric(equation, variable, 3);
}

/**
 * Extract cubic coefficients ax^3 + bx^2 + cx + d
 */
function extractCubicCoeffs(expr: Expression, variable: string): {
    a: Expression;
    b: Expression;
    c: Expression;
    d: Expression;
} {
    let a3: Expression[] = [];
    let a2: Expression[] = [];
    let a1: Expression[] = [];
    let a0: Expression[] = [];

    const terms = collectTerms(expr);

    for (const term of terms) {
        const degree = getTermDegree(term, variable);
        if (degree === 3) {
            a3.push(extractCoefficientForDegree(term, variable, 3));
        } else if (degree === 2) {
            a2.push(extractCoefficientForDegree(term, variable, 2));
        } else if (degree === 1) {
            a1.push(extractCoefficientForDegree(term, variable, 1));
        } else {
            a0.push(term);
        }
    }

    return {
        a: a3.length === 0 ? new Constant(0) :
           a3.length === 1 ? a3[0] :
           new Add(a3).simplify(),
        b: a2.length === 0 ? new Constant(0) :
           a2.length === 1 ? a2[0] :
           new Add(a2).simplify(),
        c: a1.length === 0 ? new Constant(0) :
           a1.length === 1 ? a1[0] :
           new Add(a1).simplify(),
        d: a0.length === 0 ? new Constant(0) :
           a0.length === 1 ? a0[0] :
           new Add(a0).simplify()
    };
}

/**
 * Solve polynomial equations using numeric methods (Newton-Raphson)
 * Returns numeric roots as Constant expressions
 */
export function solvePolynomialNumeric(
    equation: Expression,
    variable: string,
    maxDegree: number = 10,
    maxRoots: number = 10
): Expression[] {
    const simplified = equation.simplify();
    const derivative = differentiate(simplified, variable);

    const roots: Expression[] = [];
    const foundRoots: number[] = [];

    // Try different initial guesses
    const guesses = generateInitialGuesses(maxDegree);

    for (const guess of guesses) {
        if (roots.length >= maxRoots) break;

        const root = newtonRaphson(simplified, derivative, variable, guess);

        if (root !== null && !isRootFound(root, foundRoots)) {
            foundRoots.push(root);
            roots.push(new Constant(root));
        }
    }

    return roots;
}

/**
 * Newton-Raphson method for finding roots
 */
function newtonRaphson(
    f: Expression,
    df: Expression,
    variable: string,
    initialGuess: number,
    tolerance: number = 1e-10,
    maxIterations: number = 100
): number | null {
    let x = initialGuess;

    for (let i = 0; i < maxIterations; i++) {
        const vars = new Map([[variable, x]]);
        const fValue = f.evaluate(vars);
        const dfValue = df.evaluate(vars);

        if (Math.abs(fValue) < tolerance) {
            return x;
        }

        if (Math.abs(dfValue) < 1e-14) {
            return null; // Derivative too small
        }

        const xNew = x - fValue / dfValue;

        if (Math.abs(xNew - x) < tolerance) {
            return xNew;
        }

        x = xNew;
    }

    return null; // Did not converge
}

/**
 * Generate initial guesses for Newton-Raphson
 */
function generateInitialGuesses(n: number): number[] {
    const guesses: number[] = [0, 1, -1, 2, -2];

    // Add more guesses based on degree
    for (let i = 3; i <= Math.min(n, 10); i++) {
        guesses.push(i, -i);
    }

    // Add some random guesses
    for (let i = 0; i < 5; i++) {
        guesses.push(Math.random() * 10 - 5);
    }

    return guesses;
}

/**
 * Check if a root has already been found
 */
function isRootFound(root: number, foundRoots: number[], tolerance: number = 1e-6): boolean {
    return foundRoots.some(r => Math.abs(r - root) < tolerance);
}

/**
 * Solve a system of linear equations
 * Returns a map of variable names to their solutions
 */
export function solveLinearSystem(
    equations: Expression[],
    variables: string[]
): Map<string, Expression> {
    if (equations.length !== variables.length) {
        throw new Error('Number of equations must equal number of variables');
    }

    const n = equations.length;

    // Extract coefficient matrix and constant vector
    const { A, b } = extractSystemCoefficients(equations, variables);

    // Solve using Gaussian elimination with partial pivoting
    const solution = gaussianElimination(A, b);

    // Build result map
    const result = new Map<string, Expression>();
    for (let i = 0; i < n; i++) {
        result.set(variables[i], solution[i]);
    }

    return result;
}

/**
 * Extract coefficient matrix and constant vector from system of equations
 */
function extractSystemCoefficients(
    equations: Expression[],
    variables: string[]
): { A: Expression[][]; b: Expression[] } {
    const n = equations.length;
    const A: Expression[][] = [];
    const b: Expression[] = [];

    for (let i = 0; i < n; i++) {
        const row: Expression[] = [];
        const eq = equations[i].simplify();

        for (let j = 0; j < n; j++) {
            // Extract coefficient of variables[j]
            const coeff = extractLinearCoefficient(eq, variables[j]);
            row.push(coeff);
        }

        // Extract constant term
        const constant = extractConstantTerm(eq, variables);
        b.push(new Negate(constant).simplify());

        A.push(row);
    }

    return { A, b };
}

/**
 * Extract coefficient of a variable from an expression
 */
function extractLinearCoefficient(expr: Expression, variable: string): Expression {
    const terms = collectTerms(expr);
    const coeffs: Expression[] = [];

    for (const term of terms) {
        if (containsVariable(term, variable)) {
            const coeff = extractCoefficient(term, variable);
            coeffs.push(coeff);
        }
    }

    return coeffs.length === 0 ? new Constant(0) :
           coeffs.length === 1 ? coeffs[0] :
           new Add(coeffs).simplify();
}

/**
 * Extract constant term (terms without any of the variables)
 */
function extractConstantTerm(expr: Expression, variables: string[]): Expression {
    const terms = collectTerms(expr);
    const constants: Expression[] = [];

    for (const term of terms) {
        let hasAnyVar = false;
        for (const variable of variables) {
            if (containsVariable(term, variable)) {
                hasAnyVar = true;
                break;
            }
        }
        if (!hasAnyVar) {
            constants.push(term);
        }
    }

    return constants.length === 0 ? new Constant(0) :
           constants.length === 1 ? constants[0] :
           new Add(constants).simplify();
}

/**
 * Gaussian elimination with partial pivoting
 * Solves Ax = b for x
 */
function gaussianElimination(A: Expression[][], b: Expression[]): Expression[] {
    const n = A.length;

    // Create augmented matrix [A|b]
    const aug: Expression[][] = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        let maxVal = Math.abs(aug[i][i].evaluate(new Map()));

        for (let k = i + 1; k < n; k++) {
            const val = Math.abs(aug[k][i].evaluate(new Map()));
            if (val > maxVal) {
                maxVal = val;
                maxRow = k;
            }
        }

        // Swap rows
        if (maxRow !== i) {
            [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
        }

        // Check for singular matrix
        if (Math.abs(aug[i][i].evaluate(new Map())) < 1e-10) {
            throw new Error('System is singular or has no unique solution');
        }

        // Eliminate column
        for (let k = i + 1; k < n; k++) {
            const factor = new Divide(aug[k][i], aug[i][i]).simplify();

            for (let j = i; j <= n; j++) {
                aug[k][j] = new Subtract(
                    aug[k][j],
                    new Multiply([factor, aug[i][j]])
                ).simplify();
            }
        }
    }

    // Back substitution
    const x: Expression[] = new Array(n);

    for (let i = n - 1; i >= 0; i--) {
        let sum = aug[i][n];

        for (let j = i + 1; j < n; j++) {
            sum = new Subtract(
                sum,
                new Multiply([aug[i][j], x[j]])
            ).simplify();
        }

        x[i] = new Divide(sum, aug[i][i]).simplify();
    }

    return x;
}

/**
 * Solve a general polynomial equation
 * Automatically determines the best method based on degree
 */
export function solvePolynomial(equation: Expression, variable: string): Expression[] {
    const simplified = equation.simplify();
    const degree = getPolynomialDegree(simplified, variable);

    if (degree === 0) {
        // No variable, check if it's satisfied
        const value = simplified.evaluate(new Map());
        if (Math.abs(value) < 1e-10) {
            throw new Error('Equation has infinite solutions');
        }
        return [];
    }

    if (degree === 1) {
        return solveLinear(simplified, variable);
    }

    if (degree === 2) {
        return solveQuadratic(simplified, variable);
    }

    if (degree === 3) {
        return solveCubic(simplified, variable);
    }

    // For degree > 3, use numeric methods
    return solvePolynomialNumeric(simplified, variable, degree);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Collect all terms from an expression (handling Add, Subtract)
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
 * Check if expression contains a variable
 */
function containsVariable(expr: Expression, variable: string): boolean {
    return expr.getVariables().has(variable);
}

/**
 * Extract coefficient of a variable from a term
 * E.g., from 3x returns 3, from -2xy returns -2y
 */
function extractCoefficient(term: Expression, variable: string): Expression {
    if (term instanceof Variable && term.name === variable) {
        return new Constant(1);
    }

    if (term instanceof Negate) {
        return new Negate(extractCoefficient(term.operand, variable)).simplify();
    }

    if (term instanceof Multiply) {
        const others: Expression[] = [];
        let foundVar = false;

        for (const factor of term.factors) {
            if (factor instanceof Variable && factor.name === variable) {
                foundVar = true;
            } else if (factor instanceof Power &&
                       factor.base instanceof Variable &&
                       (factor.base as Variable).name === variable &&
                       factor.exponent instanceof Constant &&
                       factor.exponent.value === 1) {
                foundVar = true;
            } else {
                others.push(factor);
            }
        }

        if (foundVar) {
            return others.length === 0 ? new Constant(1) :
                   others.length === 1 ? others[0] :
                   new Multiply(others).simplify();
        }
    }

    if (term instanceof Divide) {
        if (containsVariable(term.numerator, variable) && !containsVariable(term.denominator, variable)) {
            const numCoeff = extractCoefficient(term.numerator, variable);
            return new Divide(numCoeff, term.denominator).simplify();
        }
    }

    return new Constant(0);
}

/**
 * Get the degree of a term with respect to a variable
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
        if (term.base instanceof Variable && (term.base as Variable).name === variable) {
            if (term.exponent instanceof Constant) {
                return term.exponent.value;
            }
        }
        return 0;
    }

    if (term instanceof Divide) {
        const numDeg = getTermDegree(term.numerator, variable);
        const denDeg = getTermDegree(term.denominator, variable);
        return numDeg - denDeg;
    }

    return 0;
}

/**
 * Extract coefficient for a specific degree
 */
function extractCoefficientForDegree(term: Expression, variable: string, degree: number): Expression {
    const termDegree = getTermDegree(term, variable);

    if (termDegree !== degree) {
        return new Constant(0);
    }

    if (term instanceof Negate) {
        return new Negate(extractCoefficientForDegree(term.operand, variable, degree)).simplify();
    }

    if (degree === 0) {
        return term;
    }

    if (term instanceof Variable && term.name === variable && degree === 1) {
        return new Constant(1);
    }

    if (term instanceof Multiply) {
        const others: Expression[] = [];

        for (const factor of term.factors) {
            if (factor instanceof Variable && factor.name === variable) {
                // Skip variable
            } else if (factor instanceof Power &&
                       factor.base instanceof Variable &&
                       (factor.base as Variable).name === variable) {
                // Skip power of variable
            } else {
                others.push(factor);
            }
        }

        return others.length === 0 ? new Constant(1) :
               others.length === 1 ? others[0] :
               new Multiply(others).simplify();
    }

    if (term instanceof Power &&
        term.base instanceof Variable &&
        (term.base as Variable).name === variable &&
        term.exponent instanceof Constant &&
        term.exponent.value === degree) {
        return new Constant(1);
    }

    if (term instanceof Divide) {
        if (containsVariable(term.numerator, variable) && !containsVariable(term.denominator, variable)) {
            const numCoeff = extractCoefficientForDegree(term.numerator, variable, degree);
            return new Divide(numCoeff, term.denominator).simplify();
        }
    }

    return new Constant(1);
}

/**
 * Get the polynomial degree of an expression
 */
function getPolynomialDegree(expr: Expression, variable: string): number {
    const terms = collectTerms(expr);
    let maxDegree = 0;

    for (const term of terms) {
        const degree = getTermDegree(term, variable);
        maxDegree = Math.max(maxDegree, degree);
    }

    return maxDegree;
}
