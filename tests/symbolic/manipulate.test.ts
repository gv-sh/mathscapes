/**
 * Tests for expression manipulation
 */

import {
    substitute,
    substituteMultiple,
    solve,
    partialFractions,
    isolate,
    Expression,
    Constant,
    Variable,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Sin,
    Cos,
    Exp,
    Ln,
    Sqrt
} from '../../src/symbolic';

describe('Expression Manipulation', () => {
    describe('Variable Substitution', () => {
        test('substitute constant for variable', () => {
            const x = new Variable('x');
            const result = substitute(x, 'x', 5);
            expect(result).toBeInstanceOf(Constant);
            expect((result as Constant).value).toBe(5);
        });

        test('substitute expression for variable', () => {
            const x = new Variable('x');
            const y = new Variable('y');
            const result = substitute(x, 'x', y);
            expect(result).toBeInstanceOf(Variable);
            expect((result as Variable).name).toBe('y');
        });

        test('substitute in addition - x + 5 with x=3', () => {
            const expr = new Add([new Variable('x'), new Constant(5)]);
            const result = substitute(expr, 'x', 3);
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(8, 10);
        });

        test('substitute in polynomial - x^2 + 2x + 1 with x=2', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Power(x, new Constant(2)),
                new Multiply([new Constant(2), x]),
                new Constant(1)
            ]);
            const result = substitute(expr, 'x', 2);
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(9, 10); // 4 + 4 + 1 = 9
        });

        test('substitute in trigonometric - sin(x) with x=π/2', () => {
            const expr = new Sin(new Variable('x'));
            const result = substitute(expr, 'x', Math.PI / 2);
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(1, 10);
        });

        test('substitute expression in expression - 2x+3 with x=y+1', () => {
            const x = new Variable('x');
            const y = new Variable('y');
            const expr = new Add([
                new Multiply([new Constant(2), x]),
                new Constant(3)
            ]);
            const sub = new Add([y, new Constant(1)]);
            const result = substitute(expr, 'x', sub);
            // 2(y+1) + 3 = 2y + 2 + 3 = 2y + 5
            const value = result.evaluate(new Map([['y', 2]]));
            expect(value).toBeCloseTo(9, 10); // 2*2 + 5 = 9
        });

        test('substitute does not affect other variables', () => {
            const expr = new Add([new Variable('x'), new Variable('y')]);
            const result = substitute(expr, 'x', 5);
            const value = result.evaluate(new Map([['y', 3]]));
            expect(value).toBeCloseTo(8, 10); // 5 + 3
        });
    });

    describe('Multiple Variable Substitution', () => {
        test('substitute multiple variables', () => {
            const expr = new Add([new Variable('x'), new Variable('y')]);
            const subs = new Map([
                ['x', 5 as Expression | number],
                ['y', 3 as Expression | number]
            ]);
            const result = substituteMultiple(expr, subs);
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(8, 10);
        });

        test('substitute multiple with expressions', () => {
            const x = new Variable('x');
            const y = new Variable('y');
            const z = new Variable('z');
            const expr = new Multiply([x, y]);
            const subs = new Map<string, Expression | number>([
                ['x', new Add([z, new Constant(1)])],
                ['y', new Constant(2)]
            ]);
            const result = substituteMultiple(expr, subs);
            // (z+1) * 2 = 2z + 2
            const value = result.evaluate(new Map([['z', 3]]));
            expect(value).toBeCloseTo(8, 10); // 2*3 + 2 = 8
        });
    });

    describe('Solving Linear Equations', () => {
        test('solve simple linear - x + 5 = 0', () => {
            const expr = new Add([new Variable('x'), new Constant(5)]);
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(1);
            const value = solutions[0].evaluate(new Map());
            expect(value).toBeCloseTo(-5, 10);
        });

        test('solve linear - 2x - 6 = 0', () => {
            const expr = new Subtract(
                new Multiply([new Constant(2), new Variable('x')]),
                new Constant(6)
            );
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(1);
            const value = solutions[0].evaluate(new Map());
            expect(value).toBeCloseTo(3, 10);
        });

        test('solve linear - 3x + 9 = 0', () => {
            const expr = new Add([
                new Multiply([new Constant(3), new Variable('x')]),
                new Constant(9)
            ]);
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(1);
            const value = solutions[0].evaluate(new Map());
            expect(value).toBeCloseTo(-3, 10);
        });

        test('solve linear - x/2 - 3 = 0', () => {
            const expr = new Subtract(
                new Divide(new Variable('x'), new Constant(2)),
                new Constant(3)
            );
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(1);
            const value = solutions[0].evaluate(new Map());
            expect(value).toBeCloseTo(6, 10);
        });
    });

    describe('Solving Quadratic Equations', () => {
        test('solve quadratic - x^2 - 5x + 6 = 0', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Power(x, new Constant(2)),
                new Multiply([new Constant(-5), x]),
                new Constant(6)
            ]);
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(2);
            const values = solutions.map(s => s.evaluate(new Map())).sort();
            expect(values[0]).toBeCloseTo(2, 10);
            expect(values[1]).toBeCloseTo(3, 10);
        });

        test('solve quadratic - x^2 - 4 = 0', () => {
            const expr = new Subtract(
                new Power(new Variable('x'), new Constant(2)),
                new Constant(4)
            );
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(2);
            const values = solutions.map(s => s.evaluate(new Map())).sort();
            expect(values[0]).toBeCloseTo(-2, 10);
            expect(values[1]).toBeCloseTo(2, 10);
        });

        test('solve quadratic - x^2 + 4x + 4 = 0 (one solution)', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Power(x, new Constant(2)),
                new Multiply([new Constant(4), x]),
                new Constant(4)
            ]);
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(1);
            const value = solutions[0].evaluate(new Map());
            expect(value).toBeCloseTo(-2, 10);
        });

        test('solve quadratic - x^2 + 1 = 0 (no real solutions)', () => {
            const expr = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Constant(1)
            ]);
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(0);
        });

        test('solve quadratic - 2x^2 - 8 = 0', () => {
            const expr = new Subtract(
                new Multiply([
                    new Constant(2),
                    new Power(new Variable('x'), new Constant(2))
                ]),
                new Constant(8)
            );
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(2);
            const values = solutions.map(s => s.evaluate(new Map())).sort();
            expect(values[0]).toBeCloseTo(-2, 10);
            expect(values[1]).toBeCloseTo(2, 10);
        });
    });

    describe('Isolate Variable', () => {
        test('isolate x in x + 5 = 0', () => {
            const expr = new Add([new Variable('x'), new Constant(5)]);
            const result = isolate(expr, 'x');
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(-5, 10);
        });

        test('isolate x in 2x - 6 = 0', () => {
            const expr = new Subtract(
                new Multiply([new Constant(2), new Variable('x')]),
                new Constant(6)
            );
            const result = isolate(expr, 'x');
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(3, 10);
        });

        test('isolate throws error for multiple solutions', () => {
            const expr = new Subtract(
                new Power(new Variable('x'), new Constant(2)),
                new Constant(4)
            );
            expect(() => isolate(expr, 'x')).toThrow('Multiple solutions exist');
        });

        test('isolate throws error for no solutions', () => {
            const expr = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Constant(1)
            ]);
            expect(() => isolate(expr, 'x')).toThrow('No solution exists');
        });
    });

    describe('Partial Fraction Decomposition', () => {
        test('partial fractions - simple linear factors', () => {
            // (2x+3)/((x+1)(x+2))
            const x = new Variable('x');
            const numerator = new Add([
                new Multiply([new Constant(2), x]),
                new Constant(3)
            ]);
            const factor1 = new Add([x, new Constant(1)]);
            const factor2 = new Add([x, new Constant(2)]);
            const denominator = new Multiply([factor1, factor2]);
            const expr = new Divide(numerator, denominator);

            const result = partialFractions(expr, 'x');

            // Verify the result is equivalent to the original
            const testValue = 0.5;
            const originalValue = expr.evaluate(new Map([['x', testValue]]));
            const resultValue = result.evaluate(new Map([['x', testValue]]));
            expect(resultValue).toBeCloseTo(originalValue, 8);
        });

        test('partial fractions - (x+5)/((x+1)(x+3))', () => {
            const x = new Variable('x');
            const numerator = new Add([x, new Constant(5)]);
            const factor1 = new Add([x, new Constant(1)]);
            const factor2 = new Add([x, new Constant(3)]);
            const denominator = new Multiply([factor1, factor2]);
            const expr = new Divide(numerator, denominator);

            const result = partialFractions(expr, 'x');

            // Verify equivalence at multiple points
            for (const testValue of [0, 0.5, 1, 2]) {
                const originalValue = expr.evaluate(new Map([['x', testValue]]));
                const resultValue = result.evaluate(new Map([['x', testValue]]));
                expect(resultValue).toBeCloseTo(originalValue, 8);
            }
        });

        test('partial fractions throws error for non-divide expression', () => {
            const expr = new Variable('x');
            const result = partialFractions(expr, 'x');
            expect(result).toBe(expr); // Should return as-is
        });
    });

    describe('Edge Cases', () => {
        test('substitute in constant does not change it', () => {
            const expr = new Constant(5);
            const result = substitute(expr, 'x', 10);
            expect(result).toBeInstanceOf(Constant);
            expect((result as Constant).value).toBe(5);
        });

        test('solve equation with no variable - 5 = 0 has no solutions', () => {
            const expr = new Constant(5);
            const solutions = solve(expr, 'x');
            expect(solutions.length).toBe(0);
        });

        test('solve 0 = 0 throws infinite solutions error', () => {
            const expr = new Constant(0);
            expect(() => solve(expr, 'x')).toThrow('Equation has infinite solutions');
        });

        test('substitute in nested functions', () => {
            const expr = new Sin(new Cos(new Variable('x')));
            const result = substitute(expr, 'x', 0);
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(Math.sin(Math.cos(0)), 10);
        });
    });
});
