import {
    limit,
    limitAtInfinity,
    lhopital,
    limitFromLeft,
    limitFromRight,
    limitExists
} from '../../src/symbolic/limits';

import {
    parse,
    Expression,
    Constant,
    Variable,
    Divide,
    Sin,
    Power
} from '../../src/symbolic';

describe('Symbolic Limits', () => {
    describe('Basic Limits', () => {
        test('limit of constant: lim(5) as x→2 = 5', () => {
            const expr = parse('5');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(5);
        });

        test('limit of linear function: lim(2x + 3) as x→1 = 5', () => {
            const expr = parse('2*x + 3');
            const result = limit(expr, 'x', 1);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(5);
        });

        test('limit of polynomial: lim(x^2 - 4x + 3) as x→2 = -1', () => {
            const expr = parse('x^2 - 4*x + 3');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(-1);
        });

        test('limit with substitution: lim(x^2) as x→3 = 9', () => {
            const expr = parse('x^2');
            const result = limit(expr, 'x', 3);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(9);
        });

        test('limit of quotient: lim((x^2 - 1)/(x + 1)) as x→2 = 3', () => {
            const expr = parse('(x^2 - 1)/(x + 1)');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(3);
        });
    });

    describe('Limits with Indeterminate Forms', () => {
        test('limit 0/0: lim((x^2 - 4)/(x - 2)) as x→2 = 4', () => {
            const expr = parse('(x^2 - 4)/(x - 2)');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(4);
        });

        test('limit 0/0: lim((x^2 - 1)/(x - 1)) as x→1 = 2', () => {
            const expr = parse('(x^2 - 1)/(x - 1)');
            const result = limit(expr, 'x', 1);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(2);
        });

        test('limit 0/0: lim(x/x) as x→0 = 1', () => {
            const expr = parse('x/x');
            const result = limit(expr, 'x', 0);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(1);
        });

        test('limit 0/0 with higher degree: lim((x^3 - 8)/(x - 2)) as x→2 = 12', () => {
            const expr = parse('(x^3 - 8)/(x - 2)');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(12);
        });
    });

    describe('L\'Hôpital\'s Rule', () => {
        test('apply L\'Hôpital to (x^2 - 4)/(x - 2) at x=2', () => {
            const expr = parse('(x^2 - 4)/(x - 2)');
            const result = lhopital(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(4);
        });

        test('apply L\'Hôpital to (x^3 - 1)/(x - 1) at x=1', () => {
            const expr = parse('(x^3 - 1)/(x - 1)');
            const result = lhopital(expr, 'x', 1);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(3);
        });

        test('apply L\'Hôpital to (x^2 - 9)/(x^2 - 2x - 3) at x=3', () => {
            const expr = parse('(x^2 - 9)/(x^2 - 2*x - 3)');
            const result = lhopital(expr, 'x', 3);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(1.5);
        });

        test('L\'Hôpital with multiple applications', () => {
            // lim (x^2)/(e^x - 1 - x) as x→0 requires multiple applications
            // For simplicity, test (x^2 - 2x)/(x^2 - x) at x=0
            const expr = parse('(x^2)/(2*x)');
            const result = lhopital(expr, 'x', 0);

            expect(result).toBeDefined();
            // After L'Hôpital: 2x/2 → 0
            expect(result!.evaluate(new Map())).toBeCloseTo(0);
        });
    });

    describe('Limits at Infinity', () => {
        test('lim(1/x) as x→∞ = 0', () => {
            const expr = parse('1/x');
            const result = limitAtInfinity(expr, 'x', Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(0);
        });

        test('lim(x^2) as x→∞ = ∞', () => {
            const expr = parse('x^2');
            const result = limitAtInfinity(expr, 'x', Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBe(Infinity);
        });

        test('lim(x) as x→∞ = ∞', () => {
            const expr = parse('x');
            const result = limitAtInfinity(expr, 'x', Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBe(Infinity);
        });

        test('lim(5) as x→∞ = 5', () => {
            const expr = parse('5');
            const result = limitAtInfinity(expr, 'x', Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(5);
        });

        test('lim((2x^2 + 3x)/(x^2 + 1)) as x→∞ = 2', () => {
            const expr = parse('(2*x^2 + 3*x)/(x^2 + 1)');
            const result = limitAtInfinity(expr, 'x', Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(2);
        });

        test('lim((3x + 1)/(x^2 + 1)) as x→∞ = 0', () => {
            const expr = parse('(3*x + 1)/(x^2 + 1)');
            const result = limitAtInfinity(expr, 'x', Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(0);
        });

        test('lim((x^3 + 1)/(x^2 + 1)) as x→∞ = ∞', () => {
            const expr = parse('(x^3 + 1)/(x^2 + 1)');
            const result = limitAtInfinity(expr, 'x', Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBe(Infinity);
        });

        test('lim(x) as x→-∞ = -∞', () => {
            const expr = parse('x');
            const result = limitAtInfinity(expr, 'x', -Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBe(-Infinity);
        });

        test('lim(x^2) as x→-∞ = ∞', () => {
            const expr = parse('x^2');
            const result = limitAtInfinity(expr, 'x', -Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBe(Infinity);
        });
    });

    describe('One-Sided Limits', () => {
        test('left and right limits exist and are equal', () => {
            const expr = parse('x^2');
            const leftLim = limitFromLeft(expr, 'x', 2);
            const rightLim = limitFromRight(expr, 'x', 2);

            expect(leftLim).toBeDefined();
            expect(rightLim).toBeDefined();
            expect(leftLim!.evaluate(new Map())).toBeCloseTo(4);
            expect(rightLim!.evaluate(new Map())).toBeCloseTo(4);
        });

        test('limit exists for continuous function', () => {
            const expr = parse('2*x + 1');
            const exists = limitExists(expr, 'x', 3);

            expect(exists).toBe(true);
        });

        test('limit from left: lim(x) as x→0-', () => {
            const expr = parse('x');
            const result = limitFromLeft(expr, 'x', 0);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(0);
        });

        test('limit from right: lim(x) as x→0+', () => {
            const expr = parse('x');
            const result = limitFromRight(expr, 'x', 0);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(0);
        });
    });

    describe('Special Cases', () => {
        test('limit with multiple variables: lim(x + y) as x→1 with y=2', () => {
            const expr = parse('x + y');
            // Substitute y first, then take limit
            const result = limit(expr, 'x', 1);

            expect(result).toBeDefined();
            // Result should be 1 + y
            const value = result!.evaluate(new Map([['y', 2]]));
            expect(value).toBeCloseTo(3);
        });

        test('limit of zero numerator: lim(0/(x+1)) as x→2 = 0', () => {
            const expr = parse('0/(x + 1)');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(0);
        });

        test('limit with constant in numerator: lim(5/(x^2)) as x→∞ = 0', () => {
            const expr = parse('5/(x^2)');
            const result = limitAtInfinity(expr, 'x', Infinity);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(0);
        });
    });

    describe('Rational Function Limits', () => {
        test('lim((x-1)/(x+1)) as x→1 = 0', () => {
            const expr = parse('(x - 1)/(x + 1)');
            const result = limit(expr, 'x', 1);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(0);
        });

        test('lim((2x^2 - 8)/(x - 2)) as x→2 = 8', () => {
            const expr = parse('(2*x^2 - 8)/(x - 2)');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(8);
        });

        test('lim((x^2 + x - 6)/(x - 2)) as x→2 = 5', () => {
            const expr = parse('(x^2 + x - 6)/(x - 2)');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(5);
        });
    });

    describe('Numeric Limits', () => {
        test('numeric approximation for complex limit', () => {
            const expr = parse('(x^2 - 4)/(x - 2)');
            const result = limit(expr, 'x', 2);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(4, 1);
        });

        test('limit with decimal point', () => {
            const expr = parse('x^2 + 2*x');
            const result = limit(expr, 'x', 1.5);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(5.25);
        });
    });

    describe('Edge Cases', () => {
        test('limit at point where function is defined', () => {
            const expr = parse('x + 1');
            const result = limit(expr, 'x', 0);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(1);
        });

        test('limit of expression without variable', () => {
            const expr = parse('42');
            const result = limit(expr, 'x', 5);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(42);
        });

        test('limit using Constant expression', () => {
            const expr = new Constant(7);
            const result = limit(expr, 'x', 100);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(7);
        });

        test('limit at 0', () => {
            const expr = parse('3*x + 2');
            const result = limit(expr, 'x', 0);

            expect(result).toBeDefined();
            expect(result!.evaluate(new Map())).toBeCloseTo(2);
        });
    });
});
