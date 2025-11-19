import {
    solveLinear,
    solveQuadratic,
    solveCubic,
    solvePolynomial,
    solvePolynomialNumeric,
    solveLinearSystem
} from '../../src/symbolic/solve';

import {
    parse,
    Expression,
    Constant,
    Variable,
    Add,
    Multiply,
    Power,
    Divide,
    Sqrt
} from '../../src/symbolic';

describe('Equation Solving', () => {
    describe('Linear Equations', () => {
        test('solve simple linear equation: 2x - 4 = 0', () => {
            const eq = parse('2*x - 4');
            const solutions = solveLinear(eq, 'x');

            expect(solutions).toHaveLength(1);
            expect(solutions[0].evaluate(new Map())).toBeCloseTo(2);
        });

        test('solve linear equation: 3x + 6 = 0', () => {
            const eq = parse('3*x + 6');
            const solutions = solveLinear(eq, 'x');

            expect(solutions).toHaveLength(1);
            expect(solutions[0].evaluate(new Map())).toBeCloseTo(-2);
        });

        test('solve linear equation with fractions: x/2 - 1 = 0', () => {
            const eq = parse('x/2 - 1');
            const solutions = solveLinear(eq, 'x');

            expect(solutions).toHaveLength(1);
            expect(solutions[0].evaluate(new Map())).toBeCloseTo(2);
        });

        test('solve linear equation: -x + 5 = 0', () => {
            const eq = parse('-x + 5');
            const solutions = solveLinear(eq, 'x');

            expect(solutions).toHaveLength(1);
            expect(solutions[0].evaluate(new Map())).toBeCloseTo(5);
        });

        test('no solution for inconsistent equation: 0*x + 5 = 0', () => {
            const eq = parse('5');
            const solutions = solveLinear(eq, 'x');

            expect(solutions).toHaveLength(0);
        });

        test('infinite solutions throws error: 0*x = 0', () => {
            const eq = new Constant(0);
            expect(() => solveLinear(eq, 'x')).toThrow('infinite solutions');
        });
    });

    describe('Quadratic Equations', () => {
        test('solve quadratic: x^2 - 4 = 0', () => {
            const eq = parse('x^2 - 4');
            const solutions = solveQuadratic(eq, 'x');

            expect(solutions).toHaveLength(2);
            const values = solutions.map(s => s.evaluate(new Map())).sort((a, b) => a - b);
            expect(values[0]).toBeCloseTo(-2);
            expect(values[1]).toBeCloseTo(2);
        });

        test('solve quadratic: x^2 - 5x + 6 = 0', () => {
            const eq = parse('x^2 - 5*x + 6');
            const solutions = solveQuadratic(eq, 'x');

            expect(solutions).toHaveLength(2);
            const values = solutions.map(s => s.evaluate(new Map())).sort((a, b) => a - b);
            expect(values[0]).toBeCloseTo(2);
            expect(values[1]).toBeCloseTo(3);
        });

        test('solve quadratic: 2x^2 - 8 = 0', () => {
            const eq = parse('2*x^2 - 8');
            const solutions = solveQuadratic(eq, 'x');

            expect(solutions).toHaveLength(2);
            const values = solutions.map(s => s.evaluate(new Map())).sort((a, b) => a - b);
            expect(values[0]).toBeCloseTo(-2);
            expect(values[1]).toBeCloseTo(2);
        });

        test('solve quadratic with one solution: x^2 - 2x + 1 = 0', () => {
            const eq = parse('x^2 - 2*x + 1');
            const solutions = solveQuadratic(eq, 'x');

            expect(solutions).toHaveLength(1);
            expect(solutions[0].evaluate(new Map())).toBeCloseTo(1);
        });

        test('quadratic with no real solutions: x^2 + 1 = 0', () => {
            const eq = parse('x^2 + 1');
            const solutions = solveQuadratic(eq, 'x');

            expect(solutions).toHaveLength(0);
        });

        test('solve quadratic: x^2 + 3x + 2 = 0', () => {
            const eq = parse('x^2 + 3*x + 2');
            const solutions = solveQuadratic(eq, 'x');

            expect(solutions).toHaveLength(2);
            const values = solutions.map(s => s.evaluate(new Map())).sort((a, b) => a - b);
            expect(values[0]).toBeCloseTo(-2);
            expect(values[1]).toBeCloseTo(-1);
        });

        test('quadratic formula preserves symbolic form', () => {
            const eq = parse('x^2 - 2');
            const solutions = solveQuadratic(eq, 'x');

            expect(solutions).toHaveLength(2);
            // Solutions should be approximately ±√2
            const values = solutions.map(s => s.evaluate(new Map())).sort((a, b) => a - b);
            expect(values[0]).toBeCloseTo(-Math.sqrt(2), 5);
            expect(values[1]).toBeCloseTo(Math.sqrt(2), 5);
        });
    });

    describe('Polynomial Equations', () => {
        test('solve polynomial automatically chooses linear solver', () => {
            const eq = parse('2*x - 6');
            const solutions = solvePolynomial(eq, 'x');

            expect(solutions).toHaveLength(1);
            expect(solutions[0].evaluate(new Map())).toBeCloseTo(3);
        });

        test('solve polynomial automatically chooses quadratic solver', () => {
            const eq = parse('x^2 - 9');
            const solutions = solvePolynomial(eq, 'x');

            expect(solutions).toHaveLength(2);
            const values = solutions.map(s => s.evaluate(new Map())).sort((a, b) => a - b);
            expect(values[0]).toBeCloseTo(-3);
            expect(values[1]).toBeCloseTo(3);
        });

        test('solve constant equation (no variable)', () => {
            const eq = parse('5');
            const solutions = solvePolynomial(eq, 'x');

            expect(solutions).toHaveLength(0);
        });
    });

    describe('Numeric Polynomial Solving', () => {
        test('solve cubic numerically: x^3 - 6x^2 + 11x - 6 = 0', () => {
            const eq = parse('x^3 - 6*x^2 + 11*x - 6');
            const solutions = solvePolynomialNumeric(eq, 'x', 3, 5);

            expect(solutions.length).toBeGreaterThan(0);
            expect(solutions.length).toBeLessThanOrEqual(3);

            // Roots are x = 1, 2, 3
            const values = solutions.map(s => s.evaluate(new Map())).sort((a, b) => a - b);

            // Check that we found at least some roots close to 1, 2, 3
            for (const value of values) {
                expect([1, 2, 3].some(root => Math.abs(value - root) < 0.01)).toBe(true);
            }
        });

        test('solve quartic numerically: x^4 - 5x^2 + 4 = 0', () => {
            const eq = parse('x^4 - 5*x^2 + 4');
            const solutions = solvePolynomialNumeric(eq, 'x', 4, 5);

            expect(solutions.length).toBeGreaterThan(0);

            // Roots are x = ±1, ±2
            const values = solutions.map(s => s.evaluate(new Map()));

            // Check we found some roots
            for (const value of values) {
                expect([-2, -1, 1, 2].some(root => Math.abs(value - root) < 0.01)).toBe(true);
            }
        });

        test('solve polynomial with single root: x^3 - 8 = 0', () => {
            const eq = parse('x^3 - 8');
            const solutions = solvePolynomialNumeric(eq, 'x', 3, 3);

            expect(solutions.length).toBeGreaterThan(0);

            // Real root is x = 2
            const hasRootNear2 = solutions.some(s => Math.abs(s.evaluate(new Map()) - 2) < 0.01);
            expect(hasRootNear2).toBe(true);
        });
    });

    describe('Systems of Linear Equations', () => {
        test('solve 2x2 system: 2x + y = 5, x - y = 1', () => {
            const eq1 = parse('2*x + y - 5');
            const eq2 = parse('x - y - 1');

            const solution = solveLinearSystem([eq1, eq2], ['x', 'y']);

            expect(solution.size).toBe(2);
            expect(solution.get('x')!.evaluate(new Map())).toBeCloseTo(2);
            expect(solution.get('y')!.evaluate(new Map())).toBeCloseTo(1);
        });

        test('solve 2x2 system: x + y = 3, 2x - y = 0', () => {
            const eq1 = parse('x + y - 3');
            const eq2 = parse('2*x - y');

            const solution = solveLinearSystem([eq1, eq2], ['x', 'y']);

            expect(solution.size).toBe(2);
            expect(solution.get('x')!.evaluate(new Map())).toBeCloseTo(1);
            expect(solution.get('y')!.evaluate(new Map())).toBeCloseTo(2);
        });

        test('solve 3x3 system', () => {
            const eq1 = parse('x + y + z - 6');
            const eq2 = parse('2*x - y + z - 3');
            const eq3 = parse('x + 2*y - z - 2');

            const solution = solveLinearSystem([eq1, eq2, eq3], ['x', 'y', 'z']);

            expect(solution.size).toBe(3);
            expect(solution.get('x')!.evaluate(new Map())).toBeCloseTo(1);
            expect(solution.get('y')!.evaluate(new Map())).toBeCloseTo(2);
            expect(solution.get('z')!.evaluate(new Map())).toBeCloseTo(3);
        });

        test('solve simple 2x2 system: x = 2, y = 3', () => {
            const eq1 = parse('x - 2');
            const eq2 = parse('y - 3');

            const solution = solveLinearSystem([eq1, eq2], ['x', 'y']);

            expect(solution.size).toBe(2);
            expect(solution.get('x')!.evaluate(new Map())).toBeCloseTo(2);
            expect(solution.get('y')!.evaluate(new Map())).toBeCloseTo(3);
        });

        test('system with fractions: x/2 + y = 2, x - y/2 = 1', () => {
            const eq1 = parse('x/2 + y - 2');
            const eq2 = parse('x - y/2 - 1');

            const solution = solveLinearSystem([eq1, eq2], ['x', 'y']);

            expect(solution.size).toBe(2);
            const x = solution.get('x')!.evaluate(new Map());
            const y = solution.get('y')!.evaluate(new Map());

            // Verify the solution satisfies the original equations
            expect(x / 2 + y).toBeCloseTo(2);
            expect(x - y / 2).toBeCloseTo(1);
        });

        test('throws error for mismatched system', () => {
            const eq1 = parse('x + y - 1');
            const eq2 = parse('x - y - 2');

            expect(() => solveLinearSystem([eq1, eq2], ['x', 'y', 'z'])).toThrow();
        });

        test('throws error for singular system', () => {
            // x + y = 1, 2x + 2y = 3 (inconsistent)
            const eq1 = parse('x + y - 1');
            const eq2 = parse('2*x + 2*y - 3');

            expect(() => solveLinearSystem([eq1, eq2], ['x', 'y'])).toThrow('singular');
        });
    });

    describe('Edge Cases', () => {
        test('solve equation with no x: 5 = 0', () => {
            const eq = parse('5');
            const solutions = solvePolynomial(eq, 'x');

            expect(solutions).toHaveLength(0);
        });

        test('solve with variable in coefficient: ax - a = 0 should give x = 1', () => {
            // This is a symbolic coefficient case
            const eq = new Add([
                new Multiply([new Variable('a'), new Variable('x')]),
                new Multiply([new Constant(-1), new Variable('a')])
            ]);

            const solutions = solveLinear(eq, 'x');
            expect(solutions).toHaveLength(1);

            // Substitute a = 2 and verify x = 1
            const xValue = solutions[0].evaluate(new Map([['a', 2]]));
            expect(xValue).toBeCloseTo(1);
        });

        test('solve quadratic with symbolic coefficients', () => {
            // x^2 - a = 0, should give x = ±sqrt(a)
            const eq = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Multiply([new Constant(-1), new Variable('a')])
            ]);

            const solutions = solveQuadratic(eq, 'x');
            expect(solutions).toHaveLength(2);

            // For a = 4, solutions should be ±2
            const values = solutions.map(s => s.evaluate(new Map([['a', 4]]))).sort((a, b) => a - b);
            expect(values[0]).toBeCloseTo(-2);
            expect(values[1]).toBeCloseTo(2);
        });
    });

    describe('Integration with existing solve function', () => {
        test('original solve function still works', () => {
            const { solve } = require('../../src/symbolic/manipulate');

            const eq = parse('2*x - 4');
            const solutions = solve(eq, 'x');

            expect(solutions).toHaveLength(1);
            expect(solutions[0].evaluate(new Map())).toBeCloseTo(2);
        });
    });
});
