/**
 * Symbolic Integration
 *
 * Provides symbolic integration capabilities including:
 * - Basic integration rules (power, constant, sum)
 * - Integration of elementary functions
 * - Integration by substitution (simple cases)
 * - Definite integrals with symbolic bounds
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

/**
 * Integrate an expression with respect to a variable
 * @param expr - The expression to integrate
 * @param variable - The variable to integrate with respect to
 * @returns The antiderivative expression (indefinite integral)
 */
export function integrate(expr: Expression, variable: string): Expression {
    // Constant rule: ∫c dx = c*x
    if (expr instanceof Constant) {
        return new Multiply([expr, new Variable(variable)]);
    }

    // Variable rule: ∫x dx = x^2/2, ∫y dx = y*x
    if (expr instanceof Variable) {
        if (expr.name === variable) {
            return new Divide(
                new Power(new Variable(variable), new Constant(2)),
                new Constant(2)
            );
        } else {
            // Treat as constant with respect to integration variable
            return new Multiply([expr, new Variable(variable)]);
        }
    }

    // Sum rule: ∫(f + g + ...) dx = ∫f dx + ∫g dx + ...
    if (expr instanceof Add) {
        const integrals = expr.terms.map(term => integrate(term, variable));
        return new Add(integrals).simplify();
    }

    // Difference rule: ∫(f - g) dx = ∫f dx - ∫g dx
    if (expr instanceof Subtract) {
        return new Subtract(
            integrate(expr.left, variable),
            integrate(expr.right, variable)
        ).simplify();
    }

    // Constant multiple rule: ∫(c*f) dx = c*∫f dx
    if (expr instanceof Multiply) {
        const constants: Expression[] = [];
        const variables: Expression[] = [];

        for (const factor of expr.factors) {
            const vars = factor.getVariables();
            if (vars.has(variable)) {
                variables.push(factor);
            } else {
                constants.push(factor);
            }
        }

        if (variables.length === 0) {
            // All constants with respect to integration variable
            return new Multiply([expr, new Variable(variable)]);
        }

        if (variables.length === 1) {
            // Can pull out constants
            const integral = integrate(variables[0], variable);
            if (constants.length === 0) {
                return integral;
            }
            return new Multiply([...constants, integral]).simplify();
        }

        // Multiple variable factors - try special cases
        return integrateProduct(expr.factors, variable);
    }

    // Negation rule: ∫(-f) dx = -∫f dx
    if (expr instanceof Negate) {
        return new Negate(integrate(expr.operand, variable)).simplify();
    }

    // Power rule: ∫x^n dx = x^(n+1)/(n+1) for n ≠ -1
    if (expr instanceof Power) {
        // Special case: ∫x^n dx where base is the integration variable
        if (expr.base instanceof Variable && expr.base.name === variable) {
            if (expr.exponent instanceof Constant) {
                const n = expr.exponent.value;
                if (n === -1) {
                    // ∫x^(-1) dx = ln|x|
                    return new Ln(new Variable(variable));
                }
                // ∫x^n dx = x^(n+1)/(n+1)
                const newExponent = new Constant(n + 1);
                return new Divide(
                    new Power(new Variable(variable), newExponent),
                    newExponent
                );
            }
        }

        // Check if it's a constant power
        const vars = expr.getVariables();
        if (!vars.has(variable)) {
            return new Multiply([expr, new Variable(variable)]);
        }
    }

    // Division: ∫f/g dx
    if (expr instanceof Divide) {
        const numeratorVars = expr.numerator.getVariables();
        const denominatorVars = expr.denominator.getVariables();

        // Check if denominator is constant
        if (!denominatorVars.has(variable)) {
            // ∫f/c dx = (1/c)∫f dx
            return new Divide(
                integrate(expr.numerator, variable),
                expr.denominator
            ).simplify();
        }

        // Special case: ∫1/x dx = ln|x|
        if (expr.numerator instanceof Constant &&
            expr.numerator.value === 1 &&
            expr.denominator instanceof Variable &&
            expr.denominator.name === variable) {
            return new Ln(new Variable(variable));
        }

        // Special case: ∫f'/f dx = ln|f|
        // This would require pattern matching, which is complex
    }

    // Trigonometric functions
    if (expr instanceof Sin) {
        // ∫sin(x) dx = -cos(x)
        if (expr.argument instanceof Variable && expr.argument.name === variable) {
            return new Negate(new Cos(new Variable(variable)));
        }
        // ∫sin(ax) dx = -cos(ax)/a
        if (expr.argument instanceof Multiply) {
            const result = tryLinearSubstitution(expr, variable);
            if (result) return result;
        }
    }

    if (expr instanceof Cos) {
        // ∫cos(x) dx = sin(x)
        if (expr.argument instanceof Variable && expr.argument.name === variable) {
            return new Sin(new Variable(variable));
        }
        // ∫cos(ax) dx = sin(ax)/a
        if (expr.argument instanceof Multiply) {
            const result = tryLinearSubstitution(expr, variable);
            if (result) return result;
        }
    }

    // Exponential function
    if (expr instanceof Exp) {
        // ∫exp(x) dx = exp(x)
        if (expr.argument instanceof Variable && expr.argument.name === variable) {
            return new Exp(new Variable(variable));
        }
        // ∫exp(ax) dx = exp(ax)/a
        if (expr.argument instanceof Multiply) {
            const result = tryLinearSubstitution(expr, variable);
            if (result) return result;
        }
    }

    // If we can't integrate, throw an error
    throw new Error(`Unable to integrate expression: ${expr.toString()}`);
}

/**
 * Helper function to integrate products
 */
function integrateProduct(factors: Expression[], variable: string): Expression {
    // Try to find patterns like x * sin(x), x * exp(x), etc.
    // For now, throw error for complex products
    throw new Error(`Unable to integrate product: ${factors.map(f => f.toString()).join(' * ')}`);
}

/**
 * Helper function for linear substitution (e.g., sin(ax+b), exp(ax+b))
 */
function tryLinearSubstitution(expr: Sin | Cos | Exp, variable: string): Expression | null {
    // Pattern: f(ax + b) where f is sin, cos, or exp
    const arg = expr.argument;

    // Check for ax or ax+b pattern
    if (arg instanceof Multiply) {
        const constants: Expression[] = [];
        let hasVariable = false;

        for (const factor of arg.factors) {
            if (factor instanceof Variable && factor.name === variable) {
                hasVariable = true;
            } else if (!factor.getVariables().has(variable)) {
                constants.push(factor);
            } else {
                return null; // Complex expression
            }
        }

        if (hasVariable && constants.length > 0) {
            // We have ax pattern
            const a = constants.length === 1 ? constants[0] : new Multiply(constants);

            if (expr instanceof Sin) {
                // ∫sin(ax) dx = -cos(ax)/a
                return new Divide(
                    new Negate(new Cos(arg)),
                    a
                ).simplify();
            } else if (expr instanceof Cos) {
                // ∫cos(ax) dx = sin(ax)/a
                return new Divide(
                    new Sin(arg),
                    a
                ).simplify();
            } else if (expr instanceof Exp) {
                // ∫exp(ax) dx = exp(ax)/a
                return new Divide(
                    new Exp(arg),
                    a
                ).simplify();
            }
        }
    }

    return null;
}

/**
 * Compute a definite integral with symbolic or numeric bounds
 * Uses the fundamental theorem of calculus: ∫[a,b] f(x) dx = F(b) - F(a)
 * @param expr - The expression to integrate
 * @param variable - The variable to integrate with respect to
 * @param lowerBound - Lower bound (can be symbolic expression or number)
 * @param upperBound - Upper bound (can be symbolic expression or number)
 * @returns The definite integral value
 */
export function definiteIntegral(
    expr: Expression,
    variable: string,
    lowerBound: Expression | number,
    upperBound: Expression | number
): Expression {
    // Get the antiderivative
    const antiderivative = integrate(expr, variable);

    // Convert bounds to expressions
    const lower = typeof lowerBound === 'number' ? new Constant(lowerBound) : lowerBound;
    const upper = typeof upperBound === 'number' ? new Constant(upperBound) : upperBound;

    // Evaluate at upper bound
    const upperValue = substitute(antiderivative, variable, upper);

    // Evaluate at lower bound
    const lowerValue = substitute(antiderivative, variable, lower);

    // Return F(b) - F(a)
    return new Subtract(upperValue, lowerValue).simplify();
}

/**
 * Substitute a value for a variable in an expression
 * @param expr - The expression
 * @param variable - The variable name to substitute
 * @param value - The value to substitute (expression)
 * @returns New expression with substitution applied
 */
function substitute(expr: Expression, variable: string, value: Expression): Expression {
    if (expr instanceof Constant) {
        return expr.clone();
    }

    if (expr instanceof Variable) {
        return expr.name === variable ? value.clone() : expr.clone();
    }

    if (expr instanceof Add) {
        return new Add(expr.terms.map(t => substitute(t, variable, value)));
    }

    if (expr instanceof Subtract) {
        return new Subtract(
            substitute(expr.left, variable, value),
            substitute(expr.right, variable, value)
        );
    }

    if (expr instanceof Multiply) {
        return new Multiply(expr.factors.map(f => substitute(f, variable, value)));
    }

    if (expr instanceof Divide) {
        return new Divide(
            substitute(expr.numerator, variable, value),
            substitute(expr.denominator, variable, value)
        );
    }

    if (expr instanceof Power) {
        return new Power(
            substitute(expr.base, variable, value),
            substitute(expr.exponent, variable, value)
        );
    }

    if (expr instanceof Negate) {
        return new Negate(substitute(expr.operand, variable, value));
    }

    // Handle functions
    if (expr instanceof Sin) {
        return new Sin(substitute(expr.argument, variable, value));
    }

    if (expr instanceof Cos) {
        return new Cos(substitute(expr.argument, variable, value));
    }

    if (expr instanceof Tan) {
        return new Tan(substitute(expr.argument, variable, value));
    }

    if (expr instanceof Exp) {
        return new Exp(substitute(expr.argument, variable, value));
    }

    if (expr instanceof Ln) {
        return new Ln(substitute(expr.argument, variable, value));
    }

    if (expr instanceof Sqrt) {
        return new Sqrt(substitute(expr.argument, variable, value));
    }

    throw new Error(`Unknown expression type for substitution: ${(expr.constructor as any).name}`);
}

/**
 * Numerical integration using Simpson's rule (for when symbolic integration fails)
 * @param expr - The expression to integrate
 * @param variable - The variable to integrate with respect to
 * @param lowerBound - Lower bound (numeric)
 * @param upperBound - Upper bound (numeric)
 * @param intervals - Number of intervals (must be even, default: 100)
 * @returns Approximate integral value
 */
export function numericalIntegrate(
    expr: Expression,
    variable: string,
    lowerBound: number,
    upperBound: number,
    intervals: number = 100
): number {
    if (intervals % 2 !== 0) {
        throw new Error('Number of intervals must be even for Simpson\'s rule');
    }

    const h = (upperBound - lowerBound) / intervals;
    let sum = 0;

    const vars = new Map<string, number>();

    // Evaluate at endpoints
    vars.set(variable, lowerBound);
    sum += expr.evaluate(vars);

    vars.set(variable, upperBound);
    sum += expr.evaluate(vars);

    // Evaluate at interior points
    for (let i = 1; i < intervals; i++) {
        const x = lowerBound + i * h;
        vars.set(variable, x);
        const coeff = (i % 2 === 0) ? 2 : 4;
        sum += coeff * expr.evaluate(vars);
    }

    return (h / 3) * sum;
}
