import {
    goldenSection,
    brentOptimize,
    gradientDescent,
    newtonOptimize,
    maximize,
} from '../../src/numeric/optimize';

describe('Optimization Algorithms', () => {
    describe('goldenSection', () => {
        test('should find minimum of (x - 2)^2', () => {
            const f = (x: number) => (x - 2) ** 2;
            const result = goldenSection(f, 0, 4);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 8);
            expect(result.fx).toBeCloseTo(0, 9);
        });

        test('should find minimum of x^2 + 4x + 4', () => {
            // Minimum at x = -2, f(-2) = 0
            const f = (x: number) => x * x + 4 * x + 4;
            const result = goldenSection(f, -4, 0);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(-2, 8);
            expect(result.fx).toBeCloseTo(0, 9);
        });

        test('should find minimum of sin(x) in [0, 2π]', () => {
            // Minimum at x = 3π/2, f(3π/2) = -1
            const f = Math.sin;
            const result = goldenSection(f, 0, 2 * Math.PI);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(3 * Math.PI / 2, 7);
            expect(result.fx).toBeCloseTo(-1, 9);
        });

        test('should find minimum of x^4 - 14x^3 + 60x^2 - 70x', () => {
            // Complex polynomial with multiple local minima
            const f = (x: number) => x ** 4 - 14 * x ** 3 + 60 * x ** 2 - 70 * x;
            const result = goldenSection(f, 0, 2);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(1, 6);
        });

        test('should throw error for invalid interval (a >= b)', () => {
            const f = (x: number) => x * x;
            expect(() => goldenSection(f, 2, 1)).toThrow();
        });

        test('should handle very narrow interval', () => {
            const f = (x: number) => (x - 2) ** 2;
            const result = goldenSection(f, 1.99, 2.01);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 8);
        });

        test('should respect custom tolerance', () => {
            const f = (x: number) => x * x;
            const result = goldenSection(f, -1, 1, { tolerance: 1e-5 });

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(0, 4);
        });

        test('should handle flat function', () => {
            const f = () => 1; // Constant function
            const result = goldenSection(f, 0, 1);

            expect(result.converged).toBe(true);
            expect(result.fx).toBe(1);
        });
    });

    describe('brentOptimize', () => {
        test('should find minimum of (x - 2)^2', () => {
            const f = (x: number) => (x - 2) ** 2;
            const result = brentOptimize(f, 0, 4);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 10);
            expect(result.fx).toBeCloseTo(0, 10);
        });

        test('should converge faster than golden section', () => {
            const f = (x: number) => (x - 2) ** 2;
            const goldenResult = goldenSection(f, 0, 4);
            const brentResult = brentOptimize(f, 0, 4);

            expect(brentResult.converged).toBe(true);
            expect(brentResult.iterations).toBeLessThan(goldenResult.iterations);
        });

        test('should find minimum of x^4 - 2x^2 + 1', () => {
            const f = (x: number) => x ** 4 - 2 * x ** 2 + 1;
            const result = brentOptimize(f, -2, 0);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(-1, 8);
            expect(result.fx).toBeCloseTo(0, 9);
        });

        test('should find minimum of sin(x)', () => {
            const f = Math.sin;
            const result = brentOptimize(f, 0, 2 * Math.PI);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(3 * Math.PI / 2, 8);
            expect(result.fx).toBeCloseTo(-1, 9);
        });

        test('should handle nearly quadratic functions well', () => {
            // Brent's method uses parabolic interpolation, so should excel here
            const f = (x: number) => 3 * x * x - 6 * x + 10;
            const result = brentOptimize(f, -10, 10);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(1, 8);
            expect(result.fx).toBeCloseTo(7, 9);
        });

        test('should throw error for invalid interval', () => {
            const f = (x: number) => x * x;
            expect(() => brentOptimize(f, 2, 1)).toThrow();
        });

        test('should handle difficult non-smooth functions', () => {
            const f = (x: number) => Math.abs(x - 1.5);
            const result = brentOptimize(f, 0, 3);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(1.5, 8);
            expect(result.fx).toBeCloseTo(0, 8);
        });
    });

    describe('gradientDescent', () => {
        test('should find minimum of (x - 2)^2 with derivative', () => {
            const f = (x: number) => (x - 2) ** 2;
            const df = (x: number) => 2 * (x - 2);
            const result = gradientDescent(f, df, 0, { learningRate: 0.1 });

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 6);
            expect(result.fx).toBeCloseTo(0, 6);
        });

        test('should find minimum without derivative (using finite differences)', () => {
            const f = (x: number) => (x - 2) ** 2;
            const result = gradientDescent(f, undefined, 0, { learningRate: 0.1 });

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 5);
        });

        test('should find minimum of x^4 - 3x^3 + 2', () => {
            const f = (x: number) => x ** 4 - 3 * x ** 3 + 2;
            const df = (x: number) => 4 * x ** 3 - 9 * x ** 2;
            const result = gradientDescent(f, df, 3, { learningRate: 0.01 });

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2.25, 4);
        });

        test('should handle different learning rates', () => {
            const f = (x: number) => x * x;
            const df = (x: number) => 2 * x;

            // Small learning rate
            const result1 = gradientDescent(f, df, 10, { learningRate: 0.01 });
            expect(result1.converged).toBe(true);

            // Larger learning rate (should converge faster)
            const result2 = gradientDescent(f, df, 10, { learningRate: 0.1 });
            expect(result2.converged).toBe(true);
            expect(result2.iterations).toBeLessThan(result1.iterations);
        });

        test('should converge from different starting points', () => {
            const f = (x: number) => (x - 5) ** 2;
            const df = (x: number) => 2 * (x - 5);

            const result1 = gradientDescent(f, df, 0, { learningRate: 0.1 });
            const result2 = gradientDescent(f, df, 10, { learningRate: 0.1 });

            expect(result1.converged).toBe(true);
            expect(result2.converged).toBe(true);
            expect(result1.x).toBeCloseTo(5, 5);
            expect(result2.x).toBeCloseTo(5, 5);
        });

        test('should handle zero gradient at minimum', () => {
            const f = (x: number) => x * x;
            const df = (x: number) => 2 * x;
            const result = gradientDescent(f, df, 0.1, { learningRate: 0.1 });

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(0, 6);
        });
    });

    describe('newtonOptimize', () => {
        test('should find minimum of (x - 2)^2', () => {
            const f = (x: number) => (x - 2) ** 2;
            const df = (x: number) => 2 * (x - 2);
            const ddf = () => 2;
            const result = newtonOptimize(f, df, ddf, 0);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 10);
            expect(result.fx).toBeCloseTo(0, 10);
        });

        test('should converge in one iteration for quadratic', () => {
            // Newton's method finds exact minimum of quadratic in one step
            const f = (x: number) => x * x - 4 * x + 5;
            const df = (x: number) => 2 * x - 4;
            const ddf = () => 2;
            const result = newtonOptimize(f, df, ddf, 10);

            expect(result.converged).toBe(true);
            expect(result.iterations).toBeLessThanOrEqual(2); // May take 2 due to convergence check
            expect(result.x).toBeCloseTo(2, 10);
        });

        test('should find minimum of x^4 - 8x^2 + 5', () => {
            const f = (x: number) => x ** 4 - 8 * x ** 2 + 5;
            const df = (x: number) => 4 * x ** 3 - 16 * x;
            const ddf = (x: number) => 12 * x ** 2 - 16;
            const result = newtonOptimize(f, df, ddf, 2);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 8);
        });

        test('should converge much faster than gradient descent', () => {
            const f = (x: number) => x ** 4 - 3 * x ** 3 + 2;
            const df = (x: number) => 4 * x ** 3 - 9 * x ** 2;
            const ddf = (x: number) => 12 * x ** 2 - 18 * x;

            const newtonResult = newtonOptimize(f, df, ddf, 3);
            const gdResult = gradientDescent(f, df, 3, { learningRate: 0.01 });

            expect(newtonResult.converged).toBe(true);
            expect(gdResult.converged).toBe(true);
            expect(newtonResult.iterations).toBeLessThan(gdResult.iterations);
        });

        test('should throw error if second derivative is zero', () => {
            const f = (x: number) => x * x;
            const df = (x: number) => 2 * x;
            const ddf = () => 0; // Zero second derivative

            expect(() => newtonOptimize(f, df, ddf, 1)).toThrow();
        });

        test('should handle cubic function', () => {
            const f = (x: number) => x ** 3 - 3 * x ** 2 + 2;
            const df = (x: number) => 3 * x ** 2 - 6 * x;
            const ddf = (x: number) => 6 * x - 6;
            const result = newtonOptimize(f, df, ddf, 3);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 9);
        });

        test('should find minimum from different starting points', () => {
            const f = (x: number) => (x - 3) ** 2;
            const df = (x: number) => 2 * (x - 3);
            const ddf = () => 2;

            const result1 = newtonOptimize(f, df, ddf, 0);
            const result2 = newtonOptimize(f, df, ddf, 10);

            expect(result1.x).toBeCloseTo(3, 10);
            expect(result2.x).toBeCloseTo(3, 10);
        });
    });

    describe('maximize', () => {
        test('should find maximum by negating function', () => {
            // Maximize -(x - 2)^2, which has maximum at x = 2
            const f = (x: number) => -((x - 2) ** 2);
            const result = maximize(f, goldenSection, 0, 4);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 9);
            expect(result.fx).toBeCloseTo(0, 9); // Maximum value is 0
        });

        test('should find maximum of sin(x)', () => {
            // Maximum at x = π/2, f(π/2) = 1
            const f = Math.sin;
            const result = maximize(f, goldenSection, 0, Math.PI);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(Math.PI / 2, 7);
            expect(result.fx).toBeCloseTo(1, 9);
        });

        test('should work with brentOptimize', () => {
            const f = (x: number) => -((x - 3) ** 2) + 10;
            const result = maximize(f, brentOptimize, 0, 6);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(3, 8);
            expect(result.fx).toBeCloseTo(10, 9);
        });

        test('should find maximum of quadratic', () => {
            // Maximize -x^2 + 4x - 1, which has maximum at x = 2, f(2) = 3
            const f = (x: number) => -x * x + 4 * x - 1;
            const result = maximize(f, goldenSection, 0, 4);

            expect(result.converged).toBe(true);
            expect(result.x).toBeCloseTo(2, 7);
            expect(result.fx).toBeCloseTo(3, 9);
        });
    });

    describe('Comparison of methods', () => {
        test('all methods should find same minimum', () => {
            const f = (x: number) => (x - Math.PI) ** 2;
            const df = (x: number) => 2 * (x - Math.PI);
            const ddf = () => 2;

            const goldenResult = goldenSection(f, 0, 6);
            const brentResult = brentOptimize(f, 0, 6);
            const gdResult = gradientDescent(f, df, 0, { learningRate: 0.1 });
            const newtonResult = newtonOptimize(f, df, ddf, 0);

            expect(goldenResult.x).toBeCloseTo(Math.PI, 8);
            expect(brentResult.x).toBeCloseTo(Math.PI, 8);
            expect(gdResult.x).toBeCloseTo(Math.PI, 5);
            expect(newtonResult.x).toBeCloseTo(Math.PI, 8);
        });

        test('derivative-free methods should work without derivatives', () => {
            const f = (x: number) => Math.abs(x - 2.5); // Non-differentiable at minimum

            const goldenResult = goldenSection(f, 0, 5);
            const brentResult = brentOptimize(f, 0, 5);

            expect(goldenResult.x).toBeCloseTo(2.5, 7);
            expect(brentResult.x).toBeCloseTo(2.5, 7);
        });

        test('Newton method should be fastest for smooth functions', () => {
            const f = (x: number) => x ** 4 - 4 * x ** 3 + 6 * x ** 2 - 4 * x + 1;
            const df = (x: number) => 4 * x ** 3 - 12 * x ** 2 + 12 * x - 4;
            const ddf = (x: number) => 12 * x ** 2 - 24 * x + 12;

            const newtonResult = newtonOptimize(f, df, ddf, 0);
            const gdResult = gradientDescent(f, df, 0, { learningRate: 0.01 });

            expect(newtonResult.iterations).toBeLessThan(gdResult.iterations);
        });
    });
});
