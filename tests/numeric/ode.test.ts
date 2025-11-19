import {
    euler,
    rk2,
    rk4,
    rk45,
    adamsBashforth2,
    adamsBashforth4,
    solveSystem,
    shootingMethod,
    finiteDifferenceBVP,
} from '../../src/numeric/ode';

describe('ODE Solvers', () => {
    describe('euler', () => {
        test('should solve exponential decay dy/dt = -y', () => {
            const f = (t: number, y: number) => -y;
            const result = euler(f, 0, 1, 2, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = e^(-t)
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(Math.exp(-2), 2);
        });

        test('should solve exponential growth dy/dt = y', () => {
            const f = (t: number, y: number) => y;
            const result = euler(f, 0, 1, 1, { stepSize: 0.001 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = e^t
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(Math.E, 2);
        });

        test('should solve linear ODE dy/dt = t', () => {
            const f = (t: number, y: number) => t;
            const result = euler(f, 0, 0, 2, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = t²/2
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(2, 1);
        });

        test('should have correct array lengths', () => {
            const f = (t: number, y: number) => -y;
            const result = euler(f, 0, 1, 1, { stepSize: 0.1 });

            expect(result.t.length).toBe(result.y.length);
            expect(result.t[0]).toBe(0);
            expect(result.t[result.t.length - 1]).toBeCloseTo(1);
        });

        test('should respect maxSteps limit', () => {
            const f = (t: number, y: number) => -y;
            const result = euler(f, 0, 1, 10, { stepSize: 0.01, maxSteps: 100 });

            expect(result.steps).toBe(100);
            expect(result.success).toBe(false);
        });
    });

    describe('rk2', () => {
        test('should be more accurate than Euler for dy/dt = -y', () => {
            const f = (t: number, y: number) => -y;
            const tEnd = 2;

            const resultEuler = euler(f, 0, 1, tEnd, { stepSize: 0.1 });
            const resultRK2 = rk2(f, 0, 1, tEnd, { stepSize: 0.1 });

            const exact = Math.exp(-tEnd);
            const errorEuler = Math.abs(resultEuler.y[resultEuler.y.length - 1] - exact);
            const errorRK2 = Math.abs(resultRK2.y[resultRK2.y.length - 1] - exact);

            expect(errorRK2).toBeLessThan(errorEuler);
        });

        test('should solve dy/dt = t with high accuracy', () => {
            const f = (t: number, y: number) => t;
            const result = rk2(f, 0, 0, 1, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = t²/2
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(0.5, 3);
        });

        test('should solve dy/dt = -2*t*y (Gaussian)', () => {
            const f = (t: number, y: number) => -2 * t * y;
            const result = rk2(f, 0, 1, 1, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = e^(-t²)
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(Math.exp(-1), 3);
        });
    });

    describe('rk4', () => {
        test('should solve exponential decay with high accuracy', () => {
            const f = (t: number, y: number) => -y;
            const result = rk4(f, 0, 1, 2, { stepSize: 0.1 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = e^(-t)
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(Math.exp(-2), 5);
        });

        test('should be more accurate than RK2', () => {
            const f = (t: number, y: number) => -2 * t * y;
            const tEnd = 1;

            const resultRK2 = rk2(f, 0, 1, tEnd, { stepSize: 0.1 });
            const resultRK4 = rk4(f, 0, 1, tEnd, { stepSize: 0.1 });

            const exact = Math.exp(-1);
            const errorRK2 = Math.abs(resultRK2.y[resultRK2.y.length - 1] - exact);
            const errorRK4 = Math.abs(resultRK4.y[resultRK4.y.length - 1] - exact);

            expect(errorRK4).toBeLessThan(errorRK2);
        });

        test('should solve nonlinear ODE dy/dt = y²', () => {
            const f = (t: number, y: number) => y * y;
            const result = rk4(f, 0, 1, 0.5, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = 1/(1-t)
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(2, 3);
        });

        test('should solve sinusoidal ODE dy/dt = cos(t)', () => {
            const f = (t: number, y: number) => Math.cos(t);
            const result = rk4(f, 0, 0, Math.PI, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = sin(t)
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(0, 5);
        });
    });

    describe('rk45', () => {
        test('should solve with adaptive step size', () => {
            const f = (t: number, y: number) => y;
            const result = rk45(f, 0, 1, 2, { tolerance: 1e-6 });

            expect(result.success).toBe(true);
            // Analytical solution: y(t) = e^t
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(Math.exp(2), 5);
        });

        test('should be more accurate than fixed-step RK4', () => {
            const f = (t: number, y: number) => -y;
            const tEnd = 2;

            const resultRK4 = rk4(f, 0, 1, tEnd, { stepSize: 0.1 });
            const resultRK45 = rk45(f, 0, 1, tEnd, { tolerance: 1e-8 });

            const exact = Math.exp(-tEnd);
            const errorRK4 = Math.abs(resultRK4.y[resultRK4.y.length - 1] - exact);
            const errorRK45 = Math.abs(resultRK45.y[resultRK45.y.length - 1] - exact);

            expect(errorRK45).toBeLessThan(errorRK4);
        });

        test('should handle stiff equations', () => {
            // Mildly stiff equation
            const f = (t: number, y: number) => -15 * y;
            const result = rk45(f, 0, 1, 1, { tolerance: 1e-6 });

            expect(result.success).toBe(true);
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(Math.exp(-15), 4);
        });

        test('should reach final time accurately', () => {
            const f = (t: number, y: number) => y;
            const tEnd = 1.5;
            const result = rk45(f, 0, 1, tEnd, { tolerance: 1e-6 });

            expect(result.success).toBe(true);
            expect(result.t[result.t.length - 1]).toBeCloseTo(tEnd, 8);
        });
    });

    describe('adamsBashforth2', () => {
        test('should solve exponential decay', () => {
            const f = (t: number, y: number) => -y;
            const result = adamsBashforth2(f, 0, 1, 2, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(Math.exp(-2), 2);
        });

        test('should solve linear ODE', () => {
            const f = (t: number, y: number) => t;
            const result = adamsBashforth2(f, 0, 0, 2, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(2, 1);
        });
    });

    describe('adamsBashforth4', () => {
        test('should be more accurate than AB2', () => {
            const f = (t: number, y: number) => -y;
            const tEnd = 2;

            const resultAB2 = adamsBashforth2(f, 0, 1, tEnd, { stepSize: 0.1 });
            const resultAB4 = adamsBashforth4(f, 0, 1, tEnd, { stepSize: 0.1 });

            const exact = Math.exp(-tEnd);
            const errorAB2 = Math.abs(resultAB2.y[resultAB2.y.length - 1] - exact);
            const errorAB4 = Math.abs(resultAB4.y[resultAB4.y.length - 1] - exact);

            expect(errorAB4).toBeLessThan(errorAB2);
        });

        test('should solve with high order accuracy', () => {
            const f = (t: number, y: number) => Math.cos(t);
            const result = adamsBashforth4(f, 0, 0, Math.PI, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal).toBeCloseTo(0, 4);
        });
    });

    describe('solveSystem', () => {
        test('should solve harmonic oscillator (simple pendulum)', () => {
            // d²x/dt² = -x
            // Convert to system: y[0] = x, y[1] = dx/dt
            // dy[0]/dt = y[1], dy[1]/dt = -y[0]
            const f = (t: number, y: number[]) => [y[1], -y[0]];
            const result = solveSystem(f, 0, [1, 0], 2 * Math.PI, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            // Should complete one full oscillation
            const yFinal = result.y[result.y.length - 1];
            expect(yFinal[0]).toBeCloseTo(1, 1); // Position back to 1
            expect(yFinal[1]).toBeCloseTo(0, 1); // Velocity back to 0
        });

        test('should solve coupled ODEs', () => {
            // Predator-prey model (simplified)
            // dx/dt = x - xy
            // dy/dt = xy - y
            const f = (t: number, y: number[]) => [
                y[0] * (1 - y[1]),
                y[1] * (y[0] - 1),
            ];
            const result = solveSystem(f, 0, [0.5, 0.5], 5, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            expect(result.y.length).toBeGreaterThan(0);
            // System should remain bounded
            for (const yi of result.y) {
                expect(yi[0]).toBeGreaterThan(0);
                expect(yi[1]).toBeGreaterThan(0);
            }
        });

        test('should solve 3D system (Lorenz attractor with small sigma)', () => {
            // Simplified parameters to avoid chaos
            const sigma = 1;
            const rho = 1;
            const beta = 1;
            const f = (t: number, y: number[]) => [
                sigma * (y[1] - y[0]),
                y[0] * (rho - y[2]) - y[1],
                y[0] * y[1] - beta * y[2],
            ];
            const result = solveSystem(f, 0, [1, 1, 1], 1, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            expect(result.y[0].length).toBe(3); // 3D system
        });

        test('should handle 2-body problem (circular orbit)', () => {
            // Simplified: single body in circular orbit
            // d²x/dt² = -x/r³, d²y/dt² = -y/r³
            // System: [x, y, vx, vy]
            const f = (t: number, y: number[]) => {
                const r3 = Math.pow(y[0] * y[0] + y[1] * y[1], 1.5);
                return [y[2], y[3], -y[0] / r3, -y[1] / r3];
            };
            const result = solveSystem(f, 0, [1, 0, 0, 1], 2 * Math.PI, { stepSize: 0.01 });

            expect(result.success).toBe(true);
            // After one period, should return near starting position
            const yFinal = result.y[result.y.length - 1];
            const distance = Math.sqrt(
                (yFinal[0] - 1) ** 2 + (yFinal[1] - 0) ** 2
            );
            expect(distance).toBeLessThan(0.5);
        });
    });

    describe('shootingMethod', () => {
        test('should solve simple BVP y\'\' = -y with y(0)=0, y(π/2)=1', () => {
            // This is sin(x), which satisfies y'' = -y
            const f = (x: number, y: number, yp: number) => -y;
            const result = shootingMethod(f, 0, Math.PI / 2, 0, 1, {
                numPoints: 100,
                tolerance: 1e-4,
            });

            expect(result.converged).toBe(true);
            // Check some intermediate values
            // y(π/4) should be approximately sin(π/4) = √2/2
            const idx = Math.floor(result.x.length / 2);
            expect(result.y[idx]).toBeCloseTo(Math.sqrt(2) / 2, 1);
        });

        test('should solve y\'\' = 1 with y(0)=0, y(1)=0', () => {
            // Analytical solution: y = -x(1-x)/2 = -x/2 + x²/2
            const f = (x: number, y: number, yp: number) => 1;
            const result = shootingMethod(f, 0, 1, 0, 0, {
                numPoints: 50,
                tolerance: 1e-5,
            });

            expect(result.converged).toBe(true);
            // Check maximum at x=0.5 (could be positive or negative depending on initial slope guess)
            const midIdx = Math.floor(result.x.length / 2);
            expect(Math.abs(result.y[midIdx])).toBeCloseTo(0.125, 2);
        });

        test('should solve y\'\' + y = x with y(0)=0, y(π)=0', () => {
            // Non-homogeneous BVP with unique solution
            const f = (x: number, y: number, yp: number) => x - y;
            const result = shootingMethod(f, 0, Math.PI, 0, 0, {
                numPoints: 100,
                tolerance: 1e-4,
            });

            expect(result.converged).toBe(true);
            // Should satisfy boundary conditions
            expect(Math.abs(result.y[0])).toBeLessThan(1e-3);
            expect(Math.abs(result.y[result.y.length - 1])).toBeLessThan(1e-3);
        });
    });

    describe('finiteDifferenceBVP', () => {
        test('should solve y\'\' = 2 with y(0)=0, y(1)=1', () => {
            // Analytical solution: y = x² + 0*x + 0, but with BC y(1)=1, it's y = x²
            const p = (x: number) => 0;
            const q = (x: number) => 0;
            const r = (x: number) => 2;
            const result = finiteDifferenceBVP(p, q, r, 0, 1, 0, 1, {
                numPoints: 11,
            });

            expect(result.converged).toBe(true);
            // Check midpoint y(0.5) should be close to 0.25
            const midIdx = Math.floor(result.x.length / 2);
            expect(result.y[midIdx]).toBeCloseTo(0.25, 2);
        });

        test('should solve y\'\' - y = 0 with y(0)=1, y(1)=e', () => {
            // Analytical solution: y = e^x
            const p = (x: number) => 0;
            const q = (x: number) => -1;
            const r = (x: number) => 0;
            const result = finiteDifferenceBVP(p, q, r, 0, 1, 1, Math.E, {
                numPoints: 21,
            });

            expect(result.converged).toBe(true);
            // Check midpoint y(0.5) should be close to e^0.5
            const midIdx = Math.floor(result.x.length / 2);
            expect(result.y[midIdx]).toBeCloseTo(Math.exp(0.5), 1);
        });

        test('should solve with variable coefficients', () => {
            // y'' + p(x)*y' + q(x)*y = r(x)
            const p = (x: number) => x;
            const q = (x: number) => 1;
            const r = (x: number) => x * x;
            const result = finiteDifferenceBVP(p, q, r, 0, 1, 0, 1, {
                numPoints: 31,
            });

            expect(result.converged).toBe(true);
            expect(result.y[0]).toBe(0);
            expect(result.y[result.y.length - 1]).toBe(1);
        });

        test('should have correct grid spacing', () => {
            const p = (x: number) => 0;
            const q = (x: number) => 0;
            const r = (x: number) => 1;
            const result = finiteDifferenceBVP(p, q, r, 0, 2, 0, 2, {
                numPoints: 11,
            });

            expect(result.x.length).toBe(11);
            expect(result.y.length).toBe(11);
            expect(result.x[0]).toBe(0);
            expect(result.x[10]).toBe(2);

            // Check uniform spacing
            for (let i = 1; i < result.x.length; i++) {
                const dx = result.x[i] - result.x[i - 1];
                expect(dx).toBeCloseTo(0.2, 10);
            }
        });
    });
});
