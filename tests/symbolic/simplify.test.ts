/**
 * Tests for advanced simplification
 */

import {
    algebraicSimplify,
    collectLikeTerms,
    expand,
    factor,
    simplifyTrig,
    simplifyLogExp,
    rationalize,
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

describe('Advanced Simplification', () => {
    describe('Algebraic Simplification', () => {
        test('collect like terms - 2x + 3x', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Multiply([new Constant(2), x]),
                new Multiply([new Constant(3), x])
            ]);
            const result = collectLikeTerms(expr);
            // 2x + 3x = 5x
            expect(result.evaluate(new Map([['x', 2]]))).toBeCloseTo(10, 10);
        });

        test('collect like terms - x + 2x + 3', () => {
            const x = new Variable('x');
            const expr = new Add([
                x,
                new Multiply([new Constant(2), x]),
                new Constant(3)
            ]);
            const result = collectLikeTerms(expr);
            // x + 2x + 3 = 3x + 3
            expect(result.evaluate(new Map([['x', 2]]))).toBeCloseTo(9, 10);
        });

        test('algebraic simplify - expand and collect', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Multiply([new Constant(2), x]),
                new Constant(3),
                x
            ]);
            const result = algebraicSimplify(expr);
            expect(result.evaluate(new Map([['x', 1]]))).toBeCloseTo(6, 10); // 3x + 3
        });
    });

    describe('Expression Expansion', () => {
        test('expand (x+2)(x+3)', () => {
            const x = new Variable('x');
            const expr = new Multiply([
                new Add([x, new Constant(2)]),
                new Add([x, new Constant(3)])
            ]);
            const result = expand(expr);
            // (x+2)(x+3) = x^2 + 5x + 6
            expect(result.evaluate(new Map([['x', 1]]))).toBeCloseTo(12, 10); // 1 + 5 + 6 = 12
            expect(result.evaluate(new Map([['x', 2]]))).toBeCloseTo(20, 10); // 4 + 10 + 6 = 20
        });

        test('expand (x+1)^2', () => {
            const x = new Variable('x');
            const expr = new Power(
                new Add([x, new Constant(1)]),
                new Constant(2)
            );
            const result = expand(expr);
            // (x+1)^2 = x^2 + 2x + 1
            expect(result.evaluate(new Map([['x', 2]]))).toBeCloseTo(9, 10);
            expect(result.evaluate(new Map([['x', 3]]))).toBeCloseTo(16, 10);
        });

        test('expand (x+1)^3', () => {
            const x = new Variable('x');
            const expr = new Power(
                new Add([x, new Constant(1)]),
                new Constant(3)
            );
            const result = expand(expr);
            // (x+1)^3 = x^3 + 3x^2 + 3x + 1
            expect(result.evaluate(new Map([['x', 2]]))).toBeCloseTo(27, 10);
        });

        test('expand 2(x+3)', () => {
            const x = new Variable('x');
            const expr = new Multiply([
                new Constant(2),
                new Add([x, new Constant(3)])
            ]);
            const result = expand(expr);
            // 2(x+3) = 2x + 6
            expect(result.evaluate(new Map([['x', 1]]))).toBeCloseTo(8, 10);
        });
    });

    describe('Expression Factoring', () => {
        test('factor out common factor - 2x + 4', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Multiply([new Constant(2), x]),
                new Constant(4)
            ]);
            const result = factor(expr);
            // 2x + 4 = 2(x + 2)
            expect(result.evaluate(new Map([['x', 3]]))).toBeCloseTo(10, 10);
        });

        test('factor out common factor - 6x + 9', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Multiply([new Constant(6), x]),
                new Constant(9)
            ]);
            const result = factor(expr);
            // 6x + 9 = 3(2x + 3)
            expect(result.evaluate(new Map([['x', 2]]))).toBeCloseTo(21, 10);
        });
    });

    describe('Trigonometric Simplification', () => {
        test('simplify sin^2(x) + cos^2(x) = 1', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Power(new Sin(x), new Constant(2)),
                new Power(new Cos(x), new Constant(2))
            ]);
            const result = simplifyTrig(expr);
            // sin^2(x) + cos^2(x) = 1
            expect(result).toBeInstanceOf(Constant);
            expect((result as Constant).value).toBe(1);
        });

        test('simplify cos^2(x) + sin^2(x) = 1', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Power(new Cos(x), new Constant(2)),
                new Power(new Sin(x), new Constant(2))
            ]);
            const result = simplifyTrig(expr);
            // cos^2(x) + sin^2(x) = 1
            expect(result).toBeInstanceOf(Constant);
            expect((result as Constant).value).toBe(1);
        });

        test('simplify sin^2(x) + cos^2(x) + 5 = 6', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Power(new Sin(x), new Constant(2)),
                new Power(new Cos(x), new Constant(2)),
                new Constant(5)
            ]);
            const result = simplifyTrig(expr);
            // sin^2(x) + cos^2(x) + 5 = 1 + 5 = 6
            const evaluated = result.evaluate(new Map());
            expect(evaluated).toBeCloseTo(6, 10);
        });
    });

    describe('Logarithm and Exponential Simplification', () => {
        test('simplify ln(e^x) = x', () => {
            const x = new Variable('x');
            const expr = new Ln(new Exp(x));
            const result = simplifyLogExp(expr);
            // ln(e^x) = x
            expect(result).toBeInstanceOf(Variable);
            expect((result as Variable).name).toBe('x');
        });

        test('simplify e^(ln(x)) = x', () => {
            const x = new Variable('x');
            const expr = new Exp(new Ln(x));
            const result = simplifyLogExp(expr);
            // e^(ln(x)) = x
            expect(result).toBeInstanceOf(Variable);
            expect((result as Variable).name).toBe('x');
        });

        test('simplify ln(x*y) = ln(x) + ln(y)', () => {
            const x = new Variable('x');
            const y = new Variable('y');
            const expr = new Ln(new Multiply([x, y]));
            const result = simplifyLogExp(expr);
            // ln(x*y) = ln(x) + ln(y)
            expect(result).toBeInstanceOf(Add);
            const evaluated = result.evaluate(new Map([['x', Math.E], ['y', Math.E]]));
            expect(evaluated).toBeCloseTo(2, 10); // ln(e) + ln(e) = 1 + 1 = 2
        });

        test('simplify ln(x^2) = 2*ln(x)', () => {
            const x = new Variable('x');
            const expr = new Ln(new Power(x, new Constant(2)));
            const result = simplifyLogExp(expr);
            // ln(x^2) = 2*ln(x)
            expect(result).toBeInstanceOf(Multiply);
            const evaluated = result.evaluate(new Map([['x', Math.E]]));
            expect(evaluated).toBeCloseTo(2, 10); // 2*ln(e) = 2*1 = 2
        });

        test('simplify ln(x/y) = ln(x) - ln(y)', () => {
            const x = new Variable('x');
            const y = new Variable('y');
            const expr = new Ln(new Divide(x, y));
            const result = simplifyLogExp(expr);
            // ln(x/y) = ln(x) - ln(y)
            expect(result).toBeInstanceOf(Subtract);
            const evaluated = result.evaluate(new Map([['x', Math.E * Math.E], ['y', Math.E]]));
            expect(evaluated).toBeCloseTo(1, 10); // ln(e^2) - ln(e) = 2 - 1 = 1
        });

        test('simplify e^a * e^b = e^(a+b)', () => {
            const a = new Variable('a');
            const b = new Variable('b');
            const expr = new Multiply([new Exp(a), new Exp(b)]);
            const result = simplifyLogExp(expr);
            // e^a * e^b = e^(a+b)
            expect(result).toBeInstanceOf(Exp);
            const evaluated = result.evaluate(new Map([['a', 1], ['b', 1]]));
            expect(evaluated).toBeCloseTo(Math.E * Math.E, 10);
        });
    });

    describe('Rationalization', () => {
        test('rationalize 1/sqrt(2)', () => {
            const expr = new Divide(
                new Constant(1),
                new Sqrt(new Constant(2))
            );
            const result = rationalize(expr);
            // 1/sqrt(2) = sqrt(2)/2
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(Math.sqrt(2) / 2, 10);
        });

        test('rationalize 3/sqrt(5)', () => {
            const expr = new Divide(
                new Constant(3),
                new Sqrt(new Constant(5))
            );
            const result = rationalize(expr);
            // 3/sqrt(5) = 3*sqrt(5)/5
            const value = result.evaluate(new Map());
            expect(value).toBeCloseTo(3 / Math.sqrt(5), 10);
        });

        test('rationalize x/sqrt(x)', () => {
            const x = new Variable('x');
            const expr = new Divide(x, new Sqrt(x));
            const result = rationalize(expr);
            // x/sqrt(x) = sqrt(x)
            const value = result.evaluate(new Map([['x', 4]]));
            expect(value).toBeCloseTo(2, 10); // 4/sqrt(4) = 4/2 = 2
        });
    });

    describe('Edge Cases', () => {
        test('expand expression that is already expanded', () => {
            const x = new Variable('x');
            const expr = new Add([
                new Power(x, new Constant(2)),
                new Multiply([new Constant(2), x]),
                new Constant(1)
            ]);
            const result = expand(expr);
            expect(result.evaluate(new Map([['x', 2]]))).toBeCloseTo(9, 10);
        });

        test('simplifyTrig on non-trig expression', () => {
            const x = new Variable('x');
            const expr = new Add([x, new Constant(1)]);
            const result = simplifyTrig(expr);
            expect(result.evaluate(new Map([['x', 5]]))).toBeCloseTo(6, 10);
        });

        test('simplifyLogExp on non-log/exp expression', () => {
            const x = new Variable('x');
            const expr = new Add([x, new Constant(1)]);
            const result = simplifyLogExp(expr);
            expect(result.evaluate(new Map([['x', 5]]))).toBeCloseTo(6, 10);
        });
    });
});
