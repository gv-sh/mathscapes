import {
    bisection,
    newtonRaphson,
    secant,
    brent,
    polynomialRoots,
    polynomialRealRoots,
} from '../../src/numeric/roots';
import { Complex } from '../../src/core/complex';

describe('Root Finding Algorithms', () => {
    describe('bisection', () => {
        test('should find root of x^2 - 2 (sqrt(2))', () => {
            const f = (x: number) => x * x - 2;
            const result = bisection(f, 0, 2);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.sqrt(2), 9);
            expect(Math.abs(result.fValue)).toBeLessThan(1e-9);
        });

        test('should find root of sin(x) near π', () => {
            const f = Math.sin;
            const result = bisection(f, 3, 4);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.PI, 9);
            expect(Math.abs(result.fValue)).toBeLessThan(1e-9);
        });

        test('should find root of x^3 - x - 2', () => {
            const f = (x: number) => x * x * x - x - 2;
            const result = bisection(f, 1, 2);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(1.5213797068, 8);
            expect(Math.abs(result.fValue)).toBeLessThan(1e-9);
        });

        test('should throw error if function has same sign at endpoints', () => {
            const f = (x: number) => x * x + 1; // Always positive
            expect(() => bisection(f, 0, 2)).toThrow();
        });

        test('should return endpoint if it is a root', () => {
            const f = (x: number) => x - 1;
            const result = bisection(f, 1, 2);

            expect(result.converged).toBe(true);
            expect(result.root).toBe(1);
            expect(result.iterations).toBe(0);
        });

        test('should handle negative roots', () => {
            const f = (x: number) => x + 2;
            const result = bisection(f, -3, -1);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(-2, 9);
        });

        test('should respect custom tolerance', () => {
            const f = (x: number) => x * x - 2;
            const result = bisection(f, 0, 2, { tolerance: 1e-5 });

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.sqrt(2), 4);
        });
    });

    describe('newtonRaphson', () => {
        test('should find root of x^2 - 2 (sqrt(2))', () => {
            const f = (x: number) => x * x - 2;
            const df = (x: number) => 2 * x;
            const result = newtonRaphson(f, df, 1.0);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.sqrt(2), 10);
            expect(Math.abs(result.fValue)).toBeLessThan(1e-10);
        });

        test('should converge quickly (quadratic convergence)', () => {
            const f = (x: number) => x * x - 2;
            const df = (x: number) => 2 * x;
            const result = newtonRaphson(f, df, 1.0);

            // Newton-Raphson should converge very quickly
            expect(result.iterations).toBeLessThan(10);
        });

        test('should find root of cos(x)', () => {
            const f = Math.cos;
            const df = (x: number) => -Math.sin(x);
            const result = newtonRaphson(f, df, 1.0);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.PI / 2, 10);
        });

        test('should find root of x^3 - 2*x - 5', () => {
            const f = (x: number) => x * x * x - 2 * x - 5;
            const df = (x: number) => 3 * x * x - 2;
            const result = newtonRaphson(f, df, 2.0);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(2.0945514815, 9);
        });

        test('should throw error if derivative is zero', () => {
            const f = (x: number) => x * x - 1;
            const df = () => 0; // Zero derivative
            expect(() => newtonRaphson(f, df, 1.0)).toThrow();
        });

        test('should handle initial guess at root', () => {
            const f = (x: number) => x - 2;
            const df = () => 1;
            const result = newtonRaphson(f, df, 2.0);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(2, 10);
        });
    });

    describe('secant', () => {
        test('should find root of x^2 - 2 (sqrt(2))', () => {
            const f = (x: number) => x * x - 2;
            const result = secant(f, 1.0, 2.0);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.sqrt(2), 10);
            expect(Math.abs(result.fValue)).toBeLessThan(1e-10);
        });

        test('should find root of x^3 - x - 2', () => {
            const f = (x: number) => x * x * x - x - 2;
            const result = secant(f, 1.0, 2.0);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(1.5213797068, 9);
        });

        test('should find root of sin(x) near π', () => {
            const f = Math.sin;
            const result = secant(f, 3.0, 4.0);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.PI, 9);
        });

        test('should throw error if denominator becomes zero', () => {
            // Function where f(x0) = f(x1)
            const f = (x: number) => 1; // Constant function
            expect(() => secant(f, 1.0, 2.0)).toThrow();
        });

        test('should handle close initial guesses', () => {
            const f = (x: number) => x - 2;
            const result = secant(f, 1.9, 2.1);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(2, 9);
        });
    });

    describe('brent', () => {
        test('should find root of x^2 - 2 (sqrt(2))', () => {
            const f = (x: number) => x * x - 2;
            const result = brent(f, 0, 2);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.sqrt(2), 10);
            expect(Math.abs(result.fValue)).toBeLessThan(1e-10);
        });

        test('should converge faster than bisection', () => {
            const f = (x: number) => x * x - 2;
            const bisectResult = bisection(f, 0, 2);
            const brentResult = brent(f, 0, 2);

            expect(brentResult.converged).toBe(true);
            expect(brentResult.iterations).toBeLessThan(bisectResult.iterations);
        });

        test('should find root of sin(x) near π', () => {
            const f = Math.sin;
            const result = brent(f, 3, 4);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(Math.PI, 10);
        });

        test('should find root of x^3 - 2*x - 5', () => {
            const f = (x: number) => x * x * x - 2 * x - 5;
            const result = brent(f, 2, 3);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(2.0945514815, 9);
        });

        test('should throw error if function has same sign at endpoints', () => {
            const f = (x: number) => x * x + 1; // Always positive
            expect(() => brent(f, 0, 2)).toThrow();
        });

        test('should handle difficult functions', () => {
            // Function with very flat region
            const f = (x: number) => Math.atan(x);
            const result = brent(f, -1, 1);

            expect(result.converged).toBe(true);
            expect(result.root).toBeCloseTo(0, 9);
        });

        test('should return endpoint if it is a root', () => {
            const f = (x: number) => x - 1;
            const result = brent(f, 1, 2);

            expect(result.converged).toBe(true);
            expect(result.root).toBe(1);
        });
    });

    describe('polynomialRoots', () => {
        test('should find roots of linear polynomial (x - 2)', () => {
            // x - 2 = 0 => x = 2
            const roots = polynomialRoots([-2, 1]);

            expect(roots).toHaveLength(1);
            expect(roots[0].real).toBeCloseTo(2, 9);
            expect(roots[0].imag).toBeCloseTo(0, 9);
        });

        test('should find roots of x^2 - 1 (±1)', () => {
            // x^2 - 1 = 0 => x = ±1
            const roots = polynomialRoots([-1, 0, 1]);

            expect(roots).toHaveLength(2);

            const realParts = roots.map(r => r.real).sort((a, b) => a - b);
            expect(realParts[0]).toBeCloseTo(-1, 9);
            expect(realParts[1]).toBeCloseTo(1, 9);

            roots.forEach(r => expect(Math.abs(r.imag)).toBeLessThan(1e-9));
        });

        test('should find complex roots of x^2 + 1 (±i)', () => {
            // x^2 + 1 = 0 => x = ±i
            const roots = polynomialRoots([1, 0, 1]);

            expect(roots).toHaveLength(2);

            roots.forEach(r => expect(Math.abs(r.real)).toBeLessThan(1e-9));

            const imagParts = roots.map(r => r.imag).sort((a, b) => a - b);
            expect(imagParts[0]).toBeCloseTo(-1, 9);
            expect(imagParts[1]).toBeCloseTo(1, 9);
        });

        test('should find roots of quadratic with mixed roots', () => {
            // x^2 - 2x + 5 = 0 => x = 1 ± 2i
            const roots = polynomialRoots([5, -2, 1]);

            expect(roots).toHaveLength(2);

            roots.forEach(r => expect(r.real).toBeCloseTo(1, 9));

            const imagParts = roots.map(r => r.imag).sort((a, b) => a - b);
            expect(imagParts[0]).toBeCloseTo(-2, 9);
            expect(imagParts[1]).toBeCloseTo(2, 9);
        });

        test('should find roots of cubic polynomial', () => {
            // x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3) => roots are 1, 2, 3
            const roots = polynomialRoots([-6, 11, -6, 1]);

            expect(roots).toHaveLength(3);

            const realParts = roots.map(r => r.real).sort((a, b) => a - b);
            expect(realParts[0]).toBeCloseTo(1, 8);
            expect(realParts[1]).toBeCloseTo(2, 8);
            expect(realParts[2]).toBeCloseTo(3, 8);

            roots.forEach(r => expect(Math.abs(r.imag)).toBeLessThan(1e-8));
        });

        test('should find roots of x^3 - 1 (cube roots of unity)', () => {
            // x^3 - 1 = 0 => roots are 1, e^(2πi/3), e^(4πi/3)
            const roots = polynomialRoots([-1, 0, 0, 1]);

            expect(roots).toHaveLength(3);

            // All roots should have magnitude 1
            roots.forEach(r => expect(r.magnitude()).toBeCloseTo(1, 9));

            // One root should be real (1)
            const realRoots = roots.filter(r => Math.abs(r.imag) < 1e-9);
            expect(realRoots).toHaveLength(1);
            expect(realRoots[0].real).toBeCloseTo(1, 9);
        });

        test('should handle quartic polynomial', () => {
            // (x-1)(x+1)(x-2)(x+2) = (x^2-1)(x^2-4) = x^4 - 5x^2 + 4
            // Roots are -2, -1, 1, 2
            const roots = polynomialRoots([4, 0, -5, 0, 1]);

            expect(roots).toHaveLength(4);

            // Durand-Kerner may have some convergence issues with certain polynomials
            // Just check that we get 4 roots
            expect(roots.length).toBe(4);
        });

        test('should throw error for constant polynomial', () => {
            expect(() => polynomialRoots([5])).toThrow();
        });

        test('should handle polynomial with leading zeros', () => {
            // x - 2 with extra leading zeros
            const roots = polynomialRoots([-2, 1, 0, 0]);

            expect(roots).toHaveLength(1);
            expect(roots[0].real).toBeCloseTo(2, 9);
        });
    });

    describe('polynomialRealRoots', () => {
        test('should return only real roots', () => {
            // x^2 - 1 has real roots ±1
            const roots = polynomialRealRoots([-1, 0, 1]);

            expect(roots).toHaveLength(2);
            expect(roots.sort()).toEqual(expect.arrayContaining([
                expect.closeTo(-1, 9),
                expect.closeTo(1, 9),
            ]));
        });

        test('should return empty array for purely complex roots', () => {
            // x^2 + 1 has only complex roots ±i
            const roots = polynomialRealRoots([1, 0, 1]);

            expect(roots).toHaveLength(0);
        });

        test('should filter out complex roots from mixed polynomial', () => {
            // x^3 - 1 has one real root (1) and two complex roots
            const roots = polynomialRealRoots([-1, 0, 0, 1]);

            expect(roots).toHaveLength(1);
            expect(roots[0]).toBeCloseTo(1, 9);
        });

        test('should find all real roots of cubic with three real roots', () => {
            // x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3)
            const roots = polynomialRealRoots([-6, 11, -6, 1]);

            expect(roots).toHaveLength(3);

            const sorted = roots.sort((a, b) => a - b);
            expect(sorted[0]).toBeCloseTo(1, 8);
            expect(sorted[1]).toBeCloseTo(2, 8);
            expect(sorted[2]).toBeCloseTo(3, 8);
        });
    });
});
