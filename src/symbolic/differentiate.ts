/**
 * Symbolic Differentiation
 *
 * Provides symbolic differentiation capabilities including:
 * - Basic differentiation rules (power, product, quotient, chain)
 * - Derivatives of elementary functions
 * - Partial derivatives
 * - Higher-order derivatives
 * - Gradient, Jacobian, and Hessian computation
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
    Asin,
    Acos,
    Atan,
    Exp,
    Ln,
    Log,
    Sqrt,
    Abs
} from './functions';

/**
 * Differentiate an expression with respect to a variable
 * @param expr - The expression to differentiate
 * @param variable - The variable to differentiate with respect to
 * @returns The derivative expression
 */
export function differentiate(expr: Expression, variable: string): Expression {
    // Constant rule: d/dx(c) = 0
    if (expr instanceof Constant) {
        return new Constant(0);
    }

    // Variable rule: d/dx(x) = 1, d/dx(y) = 0
    if (expr instanceof Variable) {
        return new Constant(expr.name === variable ? 1 : 0);
    }

    // Sum rule: d/dx(f + g + ...) = f' + g' + ...
    if (expr instanceof Add) {
        const derivatives = expr.terms.map(term => differentiate(term, variable));
        return new Add(derivatives).simplify();
    }

    // Difference rule: d/dx(f - g) = f' - g'
    if (expr instanceof Subtract) {
        return new Subtract(
            differentiate(expr.left, variable),
            differentiate(expr.right, variable)
        ).simplify();
    }

    // Product rule: d/dx(f * g * ...) = f' * g * h * ... + f * g' * h * ... + ...
    if (expr instanceof Multiply) {
        const derivatives: Expression[] = [];
        for (let i = 0; i < expr.factors.length; i++) {
            const terms: Expression[] = [];
            for (let j = 0; j < expr.factors.length; j++) {
                if (i === j) {
                    terms.push(differentiate(expr.factors[j], variable));
                } else {
                    terms.push(expr.factors[j]);
                }
            }
            derivatives.push(new Multiply(terms));
        }
        return new Add(derivatives).simplify();
    }

    // Quotient rule: d/dx(f / g) = (f' * g - f * g') / g^2
    if (expr instanceof Divide) {
        const f = expr.numerator;
        const g = expr.denominator;
        const fPrime = differentiate(f, variable);
        const gPrime = differentiate(g, variable);

        const numerator = new Subtract(
            new Multiply([fPrime, g]),
            new Multiply([f, gPrime])
        );
        const denominator = new Power(g, new Constant(2));

        return new Divide(numerator, denominator).simplify();
    }

    // Power rule and chain rule: d/dx(f^g)
    if (expr instanceof Power) {
        const f = expr.base;
        const g = expr.exponent;

        // Special case: constant exponent (power rule)
        // d/dx(f^n) = n * f^(n-1) * f'
        if (g instanceof Constant) {
            const n = g.value;
            const power = new Power(f, new Constant(n - 1));
            const derivative = new Multiply([
                new Constant(n),
                power,
                differentiate(f, variable)
            ]);
            return derivative.simplify();
        }

        // General case: d/dx(f^g) = f^g * (g' * ln(f) + g * f' / f)
        const fPrime = differentiate(f, variable);
        const gPrime = differentiate(g, variable);

        const term1 = new Multiply([gPrime, new Ln(f)]);
        const term2 = new Divide(
            new Multiply([g, fPrime]),
            f
        );

        const derivative = new Multiply([
            expr,
            new Add([term1, term2])
        ]);

        return derivative.simplify();
    }

    // Negation rule: d/dx(-f) = -f'
    if (expr instanceof Negate) {
        return new Negate(differentiate(expr.operand, variable)).simplify();
    }

    // Trigonometric functions
    if (expr instanceof Sin) {
        // d/dx(sin(f)) = cos(f) * f'
        const fPrime = differentiate(expr.argument, variable);
        return new Multiply([new Cos(expr.argument), fPrime]).simplify();
    }

    if (expr instanceof Cos) {
        // d/dx(cos(f)) = -sin(f) * f'
        const fPrime = differentiate(expr.argument, variable);
        return new Negate(
            new Multiply([new Sin(expr.argument), fPrime])
        ).simplify();
    }

    if (expr instanceof Tan) {
        // d/dx(tan(f)) = sec^2(f) * f' = f' / cos^2(f)
        const fPrime = differentiate(expr.argument, variable);
        const secSquared = new Divide(
            new Constant(1),
            new Power(new Cos(expr.argument), new Constant(2))
        );
        return new Multiply([secSquared, fPrime]).simplify();
    }

    if (expr instanceof Asin) {
        // d/dx(asin(f)) = f' / sqrt(1 - f^2)
        const f = expr.argument;
        const fPrime = differentiate(f, variable);
        const denominator = new Sqrt(
            new Subtract(
                new Constant(1),
                new Power(f, new Constant(2))
            )
        );
        return new Divide(fPrime, denominator).simplify();
    }

    if (expr instanceof Acos) {
        // d/dx(acos(f)) = -f' / sqrt(1 - f^2)
        const f = expr.argument;
        const fPrime = differentiate(f, variable);
        const denominator = new Sqrt(
            new Subtract(
                new Constant(1),
                new Power(f, new Constant(2))
            )
        );
        return new Negate(new Divide(fPrime, denominator)).simplify();
    }

    if (expr instanceof Atan) {
        // d/dx(atan(f)) = f' / (1 + f^2)
        const f = expr.argument;
        const fPrime = differentiate(f, variable);
        const denominator = new Add([
            new Constant(1),
            new Power(f, new Constant(2))
        ]);
        return new Divide(fPrime, denominator).simplify();
    }

    // Exponential and logarithmic functions
    if (expr instanceof Exp) {
        // d/dx(exp(f)) = exp(f) * f'
        const fPrime = differentiate(expr.argument, variable);
        return new Multiply([expr, fPrime]).simplify();
    }

    if (expr instanceof Ln) {
        // d/dx(ln(f)) = f' / f
        const f = expr.argument;
        const fPrime = differentiate(f, variable);
        return new Divide(fPrime, f).simplify();
    }

    if (expr instanceof Log) {
        // d/dx(log(f)) = f' / (f * ln(10))
        const f = expr.argument;
        const fPrime = differentiate(f, variable);
        const denominator = new Multiply([
            f,
            new Constant(Math.LN10)
        ]);
        return new Divide(fPrime, denominator).simplify();
    }

    if (expr instanceof Sqrt) {
        // d/dx(sqrt(f)) = f' / (2 * sqrt(f))
        const f = expr.argument;
        const fPrime = differentiate(f, variable);
        const denominator = new Multiply([
            new Constant(2),
            expr
        ]);
        return new Divide(fPrime, denominator).simplify();
    }

    if (expr instanceof Abs) {
        // d/dx(|f|) = f * f' / |f|
        // Note: This is undefined at f = 0
        const f = expr.argument;
        const fPrime = differentiate(f, variable);
        return new Divide(
            new Multiply([f, fPrime]),
            expr
        ).simplify();
    }

    throw new Error(`Unknown expression type for differentiation: ${expr.constructor.name}`);
}

/**
 * Compute the nth derivative of an expression
 * @param expr - The expression to differentiate
 * @param variable - The variable to differentiate with respect to
 * @param n - The order of the derivative (default: 1)
 * @returns The nth derivative expression
 */
export function nthDerivative(expr: Expression, variable: string, n: number = 1): Expression {
    if (n < 0) {
        throw new Error('Derivative order must be non-negative');
    }
    if (n === 0) {
        return expr;
    }

    let result = expr;
    for (let i = 0; i < n; i++) {
        result = differentiate(result, variable);
    }
    return result.simplify();
}

/**
 * Compute partial derivatives for multivariable functions
 * @param expr - The expression to differentiate
 * @param variables - Array of variables to differentiate with respect to
 * @returns Map of variable names to their partial derivatives
 */
export function partialDerivatives(
    expr: Expression,
    variables: string[]
): Map<string, Expression> {
    const result = new Map<string, Expression>();
    for (const variable of variables) {
        result.set(variable, differentiate(expr, variable));
    }
    return result;
}

/**
 * Compute the gradient of a scalar function
 * The gradient is a vector of partial derivatives with respect to each variable
 * @param expr - The scalar expression
 * @param variables - Array of variable names
 * @returns Array of partial derivatives (gradient vector)
 */
export function gradient(expr: Expression, variables: string[]): Expression[] {
    return variables.map(v => differentiate(expr, v));
}

/**
 * Compute the Jacobian matrix of a vector-valued function
 * For functions f: R^n -> R^m, the Jacobian is an m×n matrix of partial derivatives
 * @param exprs - Array of expressions (vector-valued function)
 * @param variables - Array of variable names
 * @returns 2D array representing the Jacobian matrix
 */
export function jacobian(exprs: Expression[], variables: string[]): Expression[][] {
    return exprs.map(expr => gradient(expr, variables));
}

/**
 * Compute the Hessian matrix of a scalar function
 * The Hessian is a square matrix of second-order partial derivatives
 * @param expr - The scalar expression
 * @param variables - Array of variable names
 * @returns 2D array representing the Hessian matrix
 */
export function hessian(expr: Expression, variables: string[]): Expression[][] {
    const grad = gradient(expr, variables);
    return grad.map(g => gradient(g, variables));
}

/**
 * Directional derivative in the direction of a vector
 * @param expr - The scalar expression
 * @param variables - Array of variable names
 * @param direction - Direction vector (must have same length as variables)
 * @returns The directional derivative expression
 */
export function directionalDerivative(
    expr: Expression,
    variables: string[],
    direction: Expression[]
): Expression {
    if (variables.length !== direction.length) {
        throw new Error('Direction vector must have same length as variables array');
    }

    const grad = gradient(expr, variables);
    const terms = grad.map((g, i) => new Multiply([g, direction[i]]));

    if (terms.length === 0) {
        return new Constant(0);
    }
    if (terms.length === 1) {
        return terms[0].simplify();
    }

    return new Add(terms).simplify();
}
