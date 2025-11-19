import {
    trapezoidal,
    simpson,
    romberg,
    gaussLegendre,
    adaptiveQuadrature,
    monteCarlo,
    monteCarloMulti,
    composite,
} from '../../src/numeric/integrate';

describe('Numerical Integration', () => {
    const tolerance = 1e-5;

    describe('Trapezoidal Rule', () => {
        test('should integrate x^2 from 0 to 1', () => {
            const result = trapezoidal((x) => x * x, 0, 1, { n: 1000 });
            expect(result.value).toBeCloseTo(1 / 3, 4);
            expect(result.evaluations).toBe(1001);
        });

        test('should integrate sin(x) from 0 to π', () => {
            const result = trapezoidal(Math.sin, 0, Math.PI, { n: 1000 });
            expect(result.value).toBeCloseTo(2, 4);
        });

        test('should integrate e^x from 0 to 1', () => {
            const result = trapezoidal(Math.exp, 0, 1, { n: 1000 });
            const expected = Math.E - 1;
            expect(result.value).toBeCloseTo(expected, 4);
        });

        test('should handle constant functions', () => {
            const result = trapezoidal(() => 5, 0, 10, { n: 100 });
            expect(result.value).toBeCloseTo(50, 5);
        });

        test('should handle linear functions exactly with n=1', () => {
            const result = trapezoidal((x) => 2 * x + 1, 0, 1, { n: 1 });
            expect(result.value).toBeCloseTo(2, 10);
        });
    });

    describe('Simpson\'s Rule', () => {
        test('should integrate x^2 from 0 to 1', () => {
            const result = simpson((x) => x * x, 0, 1, { n: 100 });
            expect(result.value).toBeCloseTo(1 / 3, 6);
        });

        test('should integrate sin(x) from 0 to π', () => {
            const result = simpson(Math.sin, 0, Math.PI, { n: 100 });
            expect(result.value).toBeCloseTo(2, 6);
        });

        test('should integrate x^3 from 0 to 1', () => {
            const result = simpson((x) => x * x * x, 0, 1, { n: 100 });
            expect(result.value).toBeCloseTo(1 / 4, 6);
        });

        test('should be exact for cubic polynomials', () => {
            // Simpson's rule is exact for polynomials up to degree 3
            const f = (x: number) => 2 * x * x * x - 3 * x * x + 4 * x - 1;
            const result = simpson(f, 0, 2, { n: 10 });
            // Exact: [0.5x^4 - x^3 + 2x^2 - x] from 0 to 2 = 8 - 8 + 8 - 2 = 6
            expect(result.value).toBeCloseTo(6, 8);
        });

        test('should automatically adjust n to be even', () => {
            const result = simpson((x) => x * x, 0, 1, { n: 101 });
            expect(result.evaluations).toBeGreaterThan(101);
        });
    });

    describe('Romberg Integration', () => {
        test('should integrate x^2 from 0 to 1 with high accuracy', () => {
            const result = romberg((x) => x * x, 0, 1, { absTol: 1e-12 });
            expect(result.value).toBeCloseTo(1 / 3, 10);
            expect(result.converged).toBe(true);
            expect(result.error).toBeDefined();
            expect(result.error!).toBeLessThan(1e-10);
        });

        test('should integrate e^x from 0 to 1', () => {
            const result = romberg(Math.exp, 0, 1, { absTol: 1e-12 });
            const expected = Math.E - 1;
            expect(result.value).toBeCloseTo(expected, 10);
            expect(result.converged).toBe(true);
        });

        test('should integrate sin(x) from 0 to π', () => {
            const result = romberg(Math.sin, 0, Math.PI, { absTol: 1e-12 });
            expect(result.value).toBeCloseTo(2, 10);
            expect(result.converged).toBe(true);
        });

        test('should integrate 1/(1+x^2) from 0 to 1 (arctan)', () => {
            const result = romberg((x) => 1 / (1 + x * x), 0, 1, { absTol: 1e-12 });
            expect(result.value).toBeCloseTo(Math.PI / 4, 10);
        });

        test('should handle smooth functions efficiently', () => {
            const result = romberg((x) => Math.cos(x), 0, Math.PI / 2, { absTol: 1e-12 });
            expect(result.value).toBeCloseTo(1, 10);
            expect(result.evaluations).toBeLessThan(1000);
        });
    });

    describe('Gaussian Quadrature (Gauss-Legendre)', () => {
        test('should be exact for polynomials up to degree 2n-1', () => {
            // For n=2, exact for polynomials up to degree 3
            const f = (x: number) => x * x * x;
            const result = gaussLegendre(f, -1, 1, 2);
            expect(result.value).toBeCloseTo(0, 10);
        });

        test('should integrate x^2 from 0 to 1 with n=2', () => {
            const result = gaussLegendre((x) => x * x, 0, 1, 2);
            expect(result.value).toBeCloseTo(1 / 3, 8);
        });

        test('should integrate sin(x) with high accuracy', () => {
            const result = gaussLegendre(Math.sin, 0, Math.PI, 5);
            expect(result.value).toBeCloseTo(2, 6);
        });

        test('should handle different quadrature orders', () => {
            const f = (x: number) => x * x;
            const result2 = gaussLegendre(f, 0, 1, 2);
            const result3 = gaussLegendre(f, 0, 1, 3);
            const result5 = gaussLegendre(f, 0, 1, 5);

            // All should be accurate for x^2
            expect(result2.value).toBeCloseTo(1 / 3, 8);
            expect(result3.value).toBeCloseTo(1 / 3, 8);
            expect(result5.value).toBeCloseTo(1 / 3, 8);
        });

        test('should throw error for unsupported quadrature order', () => {
            expect(() => gaussLegendre((x) => x, 0, 1, 10)).toThrow();
        });

        test('should use fewer evaluations than other methods', () => {
            const f = (x: number) => Math.exp(x);
            const result = gaussLegendre(f, 0, 1, 5);
            expect(result.evaluations).toBe(5);
            expect(result.value).toBeCloseTo(Math.E - 1, 4);
        });
    });

    describe('Adaptive Quadrature', () => {
        test('should integrate smooth functions efficiently', () => {
            const result = adaptiveQuadrature((x) => x * x, 0, 1, { absTol: 1e-10 });
            expect(result.value).toBeCloseTo(1 / 3, 8);
            expect(result.converged).toBe(true);
        });

        test('should handle functions with sharp features', () => {
            // Function with a sharp peak at x=0.5
            const f = (x: number) => 1 / (1 + 100 * (x - 0.5) * (x - 0.5));
            const result = adaptiveQuadrature(f, 0, 1, { absTol: 1e-6 });
            expect(result.converged).toBe(true);
        });

        test('should integrate sin(x) from 0 to π', () => {
            const result = adaptiveQuadrature(Math.sin, 0, Math.PI, { absTol: 1e-10 });
            expect(result.value).toBeCloseTo(2, 8);
        });

        test('should handle discontinuous functions reasonably', () => {
            const step = (x: number) => (x < 0.5 ? 1 : 2);
            const result = adaptiveQuadrature(step, 0, 1, { absTol: 1e-6 });
            expect(result.value).toBeCloseTo(1.5, 4);
        });

        test('should respect maxEvaluations limit', () => {
            const result = adaptiveQuadrature((x) => Math.sin(1 / x), 0.001, 1, {
                maxEvaluations: 100,
            });
            // Allow some overhead for the initial evaluations
            expect(result.evaluations).toBeLessThanOrEqual(150);
        });

        test('should be more efficient than uniform methods for localized features', () => {
            const f = (x: number) => Math.exp(-100 * (x - 0.5) * (x - 0.5));
            const result = adaptiveQuadrature(f, 0, 1, { absTol: 1e-8 });
            expect(result.evaluations).toBeLessThan(500);
        });
    });

    describe('Monte Carlo Integration', () => {
        test('should integrate x^2 from 0 to 1', () => {
            const result = monteCarlo((x) => x * x, 0, 1, { samples: 100000, seed: 42 });
            expect(result.value).toBeCloseTo(1 / 3, 2);
            expect(result.error).toBeDefined();
        });

        test('should integrate sin(x) from 0 to π', () => {
            const result = monteCarlo(Math.sin, 0, Math.PI, { samples: 100000, seed: 42 });
            expect(result.value).toBeCloseTo(2, 1);
        });

        test('should provide error estimates', () => {
            const result = monteCarlo((x) => x * x, 0, 1, { samples: 10000, seed: 42 });
            expect(result.error).toBeDefined();
            expect(result.error!).toBeGreaterThan(0);
        });

        test('should give reproducible results with same seed', () => {
            const result1 = monteCarlo((x) => x * x, 0, 1, { samples: 1000, seed: 123 });
            const result2 = monteCarlo((x) => x * x, 0, 1, { samples: 1000, seed: 123 });
            expect(result1.value).toBe(result2.value);
        });

        test('should handle constant functions', () => {
            const result = monteCarlo(() => 5, 0, 10, { samples: 1000, seed: 42 });
            expect(result.value).toBeCloseTo(50, 0);
        });

        test('should improve accuracy with more samples', () => {
            const f = (x: number) => x * x;
            const result1 = monteCarlo(f, 0, 1, { samples: 1000, seed: 42 });
            const result2 = monteCarlo(f, 0, 1, { samples: 100000, seed: 42 });

            expect(Math.abs(result2.value - 1 / 3)).toBeLessThan(
                Math.abs(result1.value - 1 / 3)
            );
        });
    });

    describe('Multi-dimensional Monte Carlo Integration', () => {
        test('should integrate over a 2D region', () => {
            // Integrate x^2 + y^2 over [0,1] × [0,1]
            const f = ([x, y]: number[]) => x * x + y * y;
            const result = monteCarloMulti(
                f,
                [
                    [0, 1],
                    [0, 1],
                ],
                { samples: 100000, seed: 42 }
            );
            // Exact: ∫∫(x^2 + y^2)dxdy = 1/3 + 1/3 = 2/3
            expect(result.value).toBeCloseTo(2 / 3, 2);
        });

        test('should integrate over a 3D region', () => {
            // Integrate x*y*z over [0,1] × [0,1] × [0,1]
            const f = ([x, y, z]: number[]) => x * y * z;
            const result = monteCarloMulti(
                f,
                [
                    [0, 1],
                    [0, 1],
                    [0, 1],
                ],
                { samples: 100000, seed: 42 }
            );
            // Exact: (1/2)^3 = 1/8
            expect(result.value).toBeCloseTo(1 / 8, 2);
        });

        test('should handle different bounds for each dimension', () => {
            const f = ([x, y]: number[]) => x + y;
            const result = monteCarloMulti(
                f,
                [
                    [0, 2],
                    [0, 3],
                ],
                { samples: 100000, seed: 42 }
            );
            // Exact: ∫₀²∫₀³(x+y)dydx = ∫₀²(3x + 4.5)dx = 6 + 9 = 15
            expect(result.value).toBeCloseTo(15, 1);
        });

        test('should provide error estimates', () => {
            const f = ([x, y]: number[]) => x * y;
            const result = monteCarloMulti(
                f,
                [
                    [0, 1],
                    [0, 1],
                ],
                { samples: 10000, seed: 42 }
            );
            expect(result.error).toBeDefined();
            expect(result.error!).toBeGreaterThan(0);
        });

        test('should handle high-dimensional integrals', () => {
            // Sum of squares in 5D
            const f = (x: number[]) => x.reduce((sum, xi) => sum + xi * xi, 0);
            const bounds: [number, number][] = Array(5).fill([0, 1]);
            const result = monteCarloMulti(f, bounds, { samples: 100000, seed: 42 });
            // Exact: 5 * (1/3) = 5/3
            expect(result.value).toBeCloseTo(5 / 3, 1);
        });

        test('should give reproducible results with same seed', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const bounds: [number, number][] = [
                [0, 1],
                [0, 1],
            ];
            const result1 = monteCarloMulti(f, bounds, { samples: 1000, seed: 123 });
            const result2 = monteCarloMulti(f, bounds, { samples: 1000, seed: 123 });
            expect(result1.value).toBe(result2.value);
        });
    });

    describe('Composite Integration', () => {
        test('should apply Simpson rule to subintervals', () => {
            const f = (x: number) => x * x;
            const result = composite(f, 0, 1, simpson, 10);
            expect(result.value).toBeCloseTo(1 / 3, 6);
        });

        test('should apply Gaussian quadrature to subintervals', () => {
            const f = (x: number) => Math.sin(x);
            const gaussRule = (f: any, a: number, b: number) => gaussLegendre(f, a, b, 3);
            const result = composite(f, 0, Math.PI, gaussRule, 5);
            expect(result.value).toBeCloseTo(2, 6);
        });

        test('should track total evaluations', () => {
            const f = (x: number) => x * x;
            const result = composite(f, 0, 1, trapezoidal, 5);
            expect(result.evaluations).toBeGreaterThan(0);
        });

        test('should improve accuracy with more subintervals', () => {
            const f = (x: number) => Math.exp(x);
            const result1 = composite(f, 0, 1, trapezoidal, 5);
            const result2 = composite(f, 0, 1, trapezoidal, 20);

            const exact = Math.E - 1;
            expect(Math.abs(result2.value - exact)).toBeLessThan(
                Math.abs(result1.value - exact)
            );
        });
    });

    describe('Integration Edge Cases', () => {
        test('should handle integration over zero interval', () => {
            const result = trapezoidal((x) => x * x, 5, 5, { n: 100 });
            expect(result.value).toBeCloseTo(0, 10);
        });

        test('should handle negative bounds', () => {
            const result = simpson((x) => x * x, -1, 1, { n: 100 });
            expect(result.value).toBeCloseTo(2 / 3, 6);
        });

        test('should handle reversed bounds (b < a)', () => {
            const result1 = trapezoidal((x) => x * x, 0, 1, { n: 100 });
            const result2 = trapezoidal((x) => x * x, 1, 0, { n: 100 });
            expect(result2.value).toBeCloseTo(-result1.value, 6);
        });

        test('should handle very small intervals', () => {
            const result = simpson((x) => x * x, 0, 1e-10, { n: 100 });
            expect(Math.abs(result.value)).toBeLessThan(1e-25);
        });

        test('should handle functions with zeros', () => {
            const result = trapezoidal(Math.sin, 0, 2 * Math.PI, { n: 1000 });
            expect(result.value).toBeCloseTo(0, 3);
        });
    });

    describe('Performance Comparisons', () => {
        test('Simpson should be more accurate than trapezoidal for same n', () => {
            const f = (x: number) => Math.sin(x);
            const exact = 2;

            const trap = trapezoidal(f, 0, Math.PI, { n: 100 });
            const simp = simpson(f, 0, Math.PI, { n: 100 });

            expect(Math.abs(simp.value - exact)).toBeLessThan(Math.abs(trap.value - exact));
        });

        test('Gaussian quadrature should be very efficient for smooth functions', () => {
            const f = (x: number) => x * x * x + 2 * x * x - x + 3;
            // ∫(x³ + 2x² - x + 3)dx from 0 to 2 = [x⁴/4 + 2x³/3 - x²/2 + 3x]₀²
            // = 4 + 16/3 - 2 + 6 = 8 + 16/3 = 40/3 ≈ 13.333
            const exact = 40 / 3;

            const gauss = gaussLegendre(f, 0, 2, 5);
            const simp = simpson(f, 0, 2, { n: 100 });

            // Gauss should use far fewer evaluations
            expect(gauss.evaluations).toBeLessThan(simp.evaluations);
            // Both should be reasonably accurate for this polynomial
            expect(Math.abs(gauss.value - exact)).toBeLessThan(0.01);
            expect(Math.abs(simp.value - exact)).toBeLessThan(0.01);
        });
    });
});
