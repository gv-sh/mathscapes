/**
 * Tests for symbolic integration
 */

import {
    integrate,
    definiteIntegral,
    numericalIntegrate,
    Constant,
    Variable,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Negate,
    Sin,
    Cos,
    Exp,
    Ln
} from '../../src/symbolic';

describe('Symbolic Integration', () => {
    describe('Basic Integration Rules', () => {
        test('integrate constant', () => {
            const expr = new Constant(5);
            const result = integrate(expr, 'x');
            // ∫5 dx = 5x
            expect(result.toString()).toBe('(5 * x)');
        });

        test('integrate variable', () => {
            const expr = new Variable('x');
            const result = integrate(expr, 'x');
            // ∫x dx = x^2/2
            expect(result.toString()).toBe('(x^2 / 2)');
        });

        test('integrate power rule - x^2', () => {
            const expr = new Power(new Variable('x'), new Constant(2));
            const result = integrate(expr, 'x');
            // ∫x^2 dx = x^3/3
            expect(result.toString()).toBe('(x^3 / 3)');
        });

        test('integrate power rule - x^3', () => {
            const expr = new Power(new Variable('x'), new Constant(3));
            const result = integrate(expr, 'x');
            // ∫x^3 dx = x^4/4
            expect(result.toString()).toBe('(x^4 / 4)');
        });

        test('integrate power rule - x^(-1) = ln(x)', () => {
            const expr = new Power(new Variable('x'), new Constant(-1));
            const result = integrate(expr, 'x');
            // ∫x^(-1) dx = ln(x)
            expect(result).toBeInstanceOf(Ln);
        });

        test('integrate 1/x', () => {
            const expr = new Divide(new Constant(1), new Variable('x'));
            const result = integrate(expr, 'x');
            // ∫1/x dx = ln(x)
            expect(result).toBeInstanceOf(Ln);
        });
    });

    describe('Sum and Difference Rules', () => {
        test('integrate sum - x + 5', () => {
            const expr = new Add([new Variable('x'), new Constant(5)]);
            const result = integrate(expr, 'x');
            // ∫(x + 5) dx = x^2/2 + 5x
            const evaluated = result.evaluate(new Map([['x', 2]]));
            expect(evaluated).toBeCloseTo(12, 10); // 2^2/2 + 5*2 = 2 + 10 = 12
        });

        test('integrate difference - x^2 - x', () => {
            const x = new Variable('x');
            const expr = new Subtract(
                new Power(x, new Constant(2)),
                x
            );
            const result = integrate(expr, 'x');
            // ∫(x^2 - x) dx = x^3/3 - x^2/2
            const evaluated = result.evaluate(new Map([['x', 3]]));
            expect(evaluated).toBeCloseTo(4.5, 10); // 27/3 - 9/2 = 9 - 4.5 = 4.5
        });

        test('integrate polynomial - 3x^2 + 2x + 1', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Multiply([new Constant(3), new Power(x, new Constant(2))]),
                new Multiply([new Constant(2), x]),
                new Constant(1)
            ]);
            const result = integrate(expr, 'x');
            // ∫(3x^2 + 2x + 1) dx = x^3 + x^2 + x
            const evaluated = result.evaluate(new Map([['x', 2]]));
            expect(evaluated).toBeCloseTo(14, 10); // 8 + 4 + 2 = 14
        });
    });

    describe('Constant Multiple Rule', () => {
        test('integrate constant times variable - 5x', () => {
            const expr = new Multiply([new Constant(5), new Variable('x')]);
            const result = integrate(expr, 'x');
            // ∫5x dx = 5x^2/2
            const evaluated = result.evaluate(new Map([['x', 2]]));
            expect(evaluated).toBeCloseTo(10, 10); // 5 * 4 / 2 = 10
        });

        test('integrate constant times power - 4x^3', () => {
            const expr = new Multiply([
                new Constant(4),
                new Power(new Variable('x'), new Constant(3))
            ]);
            const result = integrate(expr, 'x');
            // ∫4x^3 dx = x^4
            const evaluated = result.evaluate(new Map([['x', 2]]));
            expect(evaluated).toBeCloseTo(16, 10); // 2^4 = 16
        });
    });

    describe('Trigonometric Integration', () => {
        test('integrate sin(x)', () => {
            const expr = new Sin(new Variable('x'));
            const result = integrate(expr, 'x');
            // ∫sin(x) dx = -cos(x)
            expect(result).toBeInstanceOf(Negate);
            const evaluated = result.evaluate(new Map([['x', 0]]));
            expect(evaluated).toBeCloseTo(-1, 10); // -cos(0) = -1
        });

        test('integrate cos(x)', () => {
            const expr = new Cos(new Variable('x'));
            const result = integrate(expr, 'x');
            // ∫cos(x) dx = sin(x)
            expect(result).toBeInstanceOf(Sin);
            const evaluated = result.evaluate(new Map([['x', 0]]));
            expect(evaluated).toBeCloseTo(0, 10); // sin(0) = 0
        });

        test('integrate sin(2x) - linear substitution', () => {
            const expr = new Sin(
                new Multiply([new Constant(2), new Variable('x')])
            );
            const result = integrate(expr, 'x');
            // ∫sin(2x) dx = -cos(2x)/2
            const evaluated = result.evaluate(new Map([['x', 0]]));
            expect(evaluated).toBeCloseTo(-0.5, 10); // -cos(0)/2 = -1/2
        });
    });

    describe('Exponential Integration', () => {
        test('integrate exp(x)', () => {
            const expr = new Exp(new Variable('x'));
            const result = integrate(expr, 'x');
            // ∫exp(x) dx = exp(x)
            expect(result).toBeInstanceOf(Exp);
            const evaluated = result.evaluate(new Map([['x', 0]]));
            expect(evaluated).toBeCloseTo(1, 10); // exp(0) = 1
        });

        test('integrate exp(2x) - linear substitution', () => {
            const expr = new Exp(
                new Multiply([new Constant(2), new Variable('x')])
            );
            const result = integrate(expr, 'x');
            // ∫exp(2x) dx = exp(2x)/2
            const evaluated = result.evaluate(new Map([['x', 0]]));
            expect(evaluated).toBeCloseTo(0.5, 10); // exp(0)/2 = 1/2
        });
    });

    describe('Definite Integrals', () => {
        test('definite integral of constant - ∫[0,1] 5 dx', () => {
            const expr = new Constant(5);
            const result = definiteIntegral(expr, 'x', 0, 1);
            // 5x |[0,1] = 5*1 - 5*0 = 5
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(5, 10);
        });

        test('definite integral of x - ∫[0,2] x dx', () => {
            const expr = new Variable('x');
            const result = definiteIntegral(expr, 'x', 0, 2);
            // x^2/2 |[0,2] = 4/2 - 0 = 2
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(2, 10);
        });

        test('definite integral of x^2 - ∫[1,3] x^2 dx', () => {
            const expr = new Power(new Variable('x'), new Constant(2));
            const result = definiteIntegral(expr, 'x', 1, 3);
            // x^3/3 |[1,3] = 27/3 - 1/3 = 26/3
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(26 / 3, 10);
        });

        test('definite integral with symbolic bounds', () => {
            const expr = new Variable('x');
            const a = new Variable('a');
            const b = new Variable('b');
            const result = definiteIntegral(expr, 'x', a, b);
            // x^2/2 |[a,b] = b^2/2 - a^2/2
            const value = result.evaluate(new Map([['a', 1], ['b', 3]]));
            expect(value).toBeCloseTo(4, 10); // 9/2 - 1/2 = 4
        });
    });

    describe('Numerical Integration', () => {
        test('numerical integration of x^2 from 0 to 1', () => {
            const expr = new Power(new Variable('x'), new Constant(2));
            const result = numericalIntegrate(expr, 'x', 0, 1, 100);
            // ∫[0,1] x^2 dx = 1/3
            expect(result).toBeCloseTo(1 / 3, 5);
        });

        test('numerical integration of sin(x) from 0 to π', () => {
            const expr = new Sin(new Variable('x'));
            const result = numericalIntegrate(expr, 'x', 0, Math.PI, 100);
            // ∫[0,π] sin(x) dx = 2
            expect(result).toBeCloseTo(2, 5);
        });

        test('numerical integration of exp(x) from 0 to 1', () => {
            const expr = new Exp(new Variable('x'));
            const result = numericalIntegrate(expr, 'x', 0, 1, 100);
            // ∫[0,1] exp(x) dx = e - 1
            expect(result).toBeCloseTo(Math.E - 1, 5);
        });
    });

    describe('Edge Cases', () => {
        test('integrate with respect to different variable', () => {
            const expr = new Variable('y');
            const result = integrate(expr, 'x');
            // ∫y dx = y*x (y is constant with respect to x)
            expect(result.toString()).toBe('(y * x)');
        });

        test('integrate negative expression', () => {
            const expr = new Negate(new Variable('x'));
            const result = integrate(expr, 'x');
            // ∫-x dx = -x^2/2
            const evaluated = result.evaluate(new Map([['x', 2]]));
            expect(evaluated).toBeCloseTo(-2, 10);
        });

        test('numerical integration requires even intervals', () => {
            const expr = new Variable('x');
            expect(() => {
                numericalIntegrate(expr, 'x', 0, 1, 99);
            }).toThrow('Number of intervals must be even');
        });
    });
});
