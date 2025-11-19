import {
    heatEquation1D,
    heatEquation1DImplicit,
    waveEquation1D,
    heatEquation2D,
} from '../../src/numeric/pde';

describe('PDE Solvers', () => {
    describe('heatEquation1D', () => {
        test('should solve heat equation with constant initial condition', () => {
            // Initial condition: u(x, 0) = 1 everywhere
            // With zero boundary conditions, should decay to zero
            const result = heatEquation1D(
                0.01, // alpha - smaller to ensure stability
                0,
                1, // xMin, xMax
                0.5, // tMax
                (x) => 1, // initial condition
                0, // left boundary
                0, // right boundary
                { numSpatialPoints: 100, numTimeSteps: 500 }
            );

            expect(result.success).toBe(true);
            expect(result.x.length).toBe(100);
            expect(result.t.length).toBe(501); // 0 to 500 inclusive

            // Boundary conditions should be applied starting from second time step
            expect(result.u[1][0]).toBe(0);
            expect(result.u[1][result.x.length - 1]).toBe(0);

            // Solution should decay over time
            const midIdx = Math.floor(result.x.length / 2);
            // Compare to a later time step (not initial) since initial might have boundary applied
            expect(result.u[result.u.length - 1][midIdx]).toBeLessThan(
                result.u[1][midIdx]
            );
        });

        test('should solve with Gaussian initial condition', () => {
            // Initial spike at center
            const result = heatEquation1D(
                0.01,
                0,
                1,
                0.5,
                (x) => Math.exp(-100 * (x - 0.5) ** 2),
                0,
                0,
                { numSpatialPoints: 100, numTimeSteps: 500 }
            );

            expect(result.success).toBe(true);

            // Heat should diffuse outward
            const midIdx = Math.floor(result.x.length / 2);

            // Initial peak should be high
            expect(result.u[0][midIdx]).toBeGreaterThan(0.5);

            // Final peak should be lower (diffused)
            expect(result.u[result.u.length - 1][midIdx]).toBeLessThan(
                result.u[0][midIdx]
            );
        });

        test('should satisfy boundary conditions at all times', () => {
            const result = heatEquation1D(
                0.1,
                0,
                1,
                1,
                (x) => Math.sin(Math.PI * x),
                0,
                0,
                { numSpatialPoints: 50, numTimeSteps: 100 }
            );

            expect(result.success).toBe(true);

            // Check boundaries for all time steps (after first step)
            for (let n = 1; n < result.u.length; n++) {
                expect(result.u[n][0]).toBeCloseTo(0, 10);
                expect(result.u[n][result.x.length - 1]).toBeCloseTo(0, 10);
            }
        });

        test('should have decreasing total energy', () => {
            // For zero boundary conditions, total heat should decrease
            const result = heatEquation1D(
                0.1,
                0,
                1,
                0.5,
                (x) => Math.sin(Math.PI * x),
                0,
                0,
                { numSpatialPoints: 50, numTimeSteps: 100 }
            );

            expect(result.success).toBe(true);

            // Calculate total energy at different times
            const energy0 = result.u[0].reduce((sum, val) => sum + val, 0);
            const energyFinal = result.u[result.u.length - 1].reduce(
                (sum, val) => sum + val,
                0
            );

            expect(energyFinal).toBeLessThan(energy0);
        });

        test('should handle non-zero boundary conditions', () => {
            const result = heatEquation1D(
                0.1, // alpha
                0,
                1,
                2, // longer time for diffusion
                (x) => 0,
                1, // left = 1
                1, // right = 1
                { numSpatialPoints: 50, numTimeSteps: 1000 }
            );

            expect(result.success).toBe(true);

            // Eventually should approach uniform temperature of 1
            const finalTemp = result.u[result.u.length - 1];
            const midIdx = Math.floor(result.x.length / 2);

            // Middle should be approaching 1
            expect(finalTemp[midIdx]).toBeGreaterThan(0.7);
            expect(finalTemp[midIdx]).toBeLessThan(1.5); // Should not explode
        });
    });

    describe('heatEquation1DImplicit', () => {
        test('should solve with implicit method', () => {
            const result = heatEquation1DImplicit(
                0.1,
                0,
                1,
                1,
                (x) => Math.sin(Math.PI * x),
                0,
                0,
                { numSpatialPoints: 50, numTimeSteps: 100 }
            );

            expect(result.success).toBe(true);
            expect(result.x.length).toBe(50);
            expect(result.t.length).toBe(101);

            // Should satisfy boundary conditions (after first step)
            for (let n = 1; n < result.u.length; n++) {
                expect(result.u[n][0]).toBeCloseTo(0, 10);
                expect(result.u[n][result.x.length - 1]).toBeCloseTo(0, 10);
            }
        });

        test('should be stable with larger time steps', () => {
            // Implicit method should handle larger dt without instability
            const result = heatEquation1DImplicit(
                0.1,
                0,
                1,
                1,
                (x) => Math.sin(Math.PI * x),
                0,
                0,
                { numSpatialPoints: 30, numTimeSteps: 20 } // Larger time steps
            );

            expect(result.success).toBe(true);

            // Should not have NaN or Inf
            for (const row of result.u) {
                for (const val of row) {
                    expect(isFinite(val)).toBe(true);
                }
            }
        });

        test('should match explicit method approximately', () => {
            const alpha = 0.01;
            const tMax = 0.5;
            const initialCondition = (x: number) => Math.exp(-50 * (x - 0.5) ** 2);

            const resultExplicit = heatEquation1D(
                alpha,
                0,
                1,
                tMax,
                initialCondition,
                0,
                0,
                { numSpatialPoints: 50, numTimeSteps: 500 }
            );

            const resultImplicit = heatEquation1DImplicit(
                alpha,
                0,
                1,
                tMax,
                initialCondition,
                0,
                0,
                { numSpatialPoints: 50, numTimeSteps: 500 }
            );

            expect(resultExplicit.success).toBe(true);
            expect(resultImplicit.success).toBe(true);

            // Final solutions should be similar
            const midIdx = Math.floor(resultExplicit.x.length / 2);
            const explicitFinal =
                resultExplicit.u[resultExplicit.u.length - 1][midIdx];
            const implicitFinal =
                resultImplicit.u[resultImplicit.u.length - 1][midIdx];

            expect(implicitFinal).toBeCloseTo(explicitFinal, 1);
        });
    });

    describe('waveEquation1D', () => {
        test('should solve with Gaussian initial displacement', () => {
            const result = waveEquation1D(
                1, // wave speed
                0,
                10,
                5,
                (x) => Math.exp(-((x - 5) ** 2)), // initial displacement
                (x) => 0, // initial velocity
                0,
                0,
                { numSpatialPoints: 200, numTimeSteps: 1000 }
            );

            expect(result.success).toBe(true);
            expect(result.x.length).toBe(200);
            expect(result.t.length).toBe(1001);

            // Boundary conditions should be satisfied (after first 2 steps)
            for (let n = 2; n < result.u.length; n++) {
                expect(result.u[n][0]).toBeCloseTo(0, 8);
                expect(result.u[n][result.x.length - 1]).toBeCloseTo(0, 8);
            }
        });

        test('should propagate wave in both directions', () => {
            const result = waveEquation1D(
                1,
                0,
                10,
                2,
                (x) => Math.exp(-25 * (x - 5) ** 2),
                (x) => 0,
                0,
                0,
                { numSpatialPoints: 200, numTimeSteps: 400 }
            );

            expect(result.success).toBe(true);

            // Initially, peak is at center
            const midIdx = Math.floor(result.x.length / 2);
            expect(result.u[0][midIdx]).toBeGreaterThan(0.8);

            // After some time, wave should split and move
            const laterTime = Math.floor(result.u.length / 2);
            // Center should be lower (wave has moved)
            expect(result.u[laterTime][midIdx]).toBeLessThan(result.u[0][midIdx]);
        });

        test('should satisfy boundary conditions', () => {
            const result = waveEquation1D(
                1,
                0,
                1,
                1,
                (x) => Math.sin(Math.PI * x),
                (x) => 0,
                0,
                0,
                { numSpatialPoints: 100, numTimeSteps: 200 }
            );

            expect(result.success).toBe(true);

            // Check boundaries after first 2 steps
            for (let n = 2; n < result.u.length; n++) {
                expect(result.u[n][0]).toBeCloseTo(0, 10);
                expect(result.u[n][result.x.length - 1]).toBeCloseTo(0, 10);
            }
        });

        test('should handle initial velocity', () => {
            // String plucked with initial velocity
            const result = waveEquation1D(
                1,
                0,
                1,
                1,
                (x) => 0, // no initial displacement
                (x) => Math.sin(Math.PI * x), // initial velocity
                0,
                0,
                { numSpatialPoints: 100, numTimeSteps: 200 }
            );

            expect(result.success).toBe(true);

            // After some time, should have non-zero displacement
            const laterTime = Math.floor(result.u.length / 4);
            const midIdx = Math.floor(result.x.length / 2);
            expect(Math.abs(result.u[laterTime][midIdx])).toBeGreaterThan(0.1);
        });

        test('should have finite energy throughout simulation', () => {
            const result = waveEquation1D(
                1,
                0,
                Math.PI,
                Math.PI,
                (x) => Math.sin(x),
                (x) => 0,
                0,
                0,
                { numSpatialPoints: 100, numTimeSteps: 300 }
            );

            expect(result.success).toBe(true);

            // Calculate total energy at different times
            // Energy = sum of u²
            const energy0 = result.u[0].reduce((sum, val) => sum + val * val, 0);
            const energyMid = result.u[Math.floor(result.u.length / 2)].reduce(
                (sum, val) => sum + val * val,
                0
            );

            // With zero boundary conditions, energy will dissipate
            // But it should remain finite and positive
            expect(energyMid).toBeGreaterThan(0);
            expect(isFinite(energyMid)).toBe(true);
            // Energy should decrease due to boundaries absorbing wave
            expect(energyMid).toBeLessThanOrEqual(energy0);
        });
    });

    describe('heatEquation2D', () => {
        test('should solve 2D heat equation', () => {
            const result = heatEquation2D(
                0.01,
                0,
                1,
                0,
                1,
                0.5,
                (x, y) => Math.exp(-100 * ((x - 0.5) ** 2 + (y - 0.5) ** 2)),
                0,
                { numSpatialPoints: 30, numTimeSteps: 100 }
            );

            expect(result.success).toBe(true);
            expect(result.x.length).toBe(30);
            expect(result.y.length).toBe(30);
            expect(result.t.length).toBe(101);
            expect(result.u.length).toBe(101);
        });

        test('should satisfy boundary conditions on all edges', () => {
            const boundaryValue = 0.5;
            const result = heatEquation2D(
                0.1,
                0,
                1,
                0,
                1,
                0.5,
                (x, y) => 1,
                boundaryValue,
                { numSpatialPoints: 20, numTimeSteps: 50 }
            );

            expect(result.success).toBe(true);

            // Check all time steps (except first, which has initial condition)
            for (let n = 1; n < result.u.length; n++) {
                const nx = result.x.length;
                const ny = result.y.length;

                // Left edge (x = 0)
                for (let j = 0; j < ny; j++) {
                    expect(result.u[n][j][0]).toBe(boundaryValue);
                }

                // Right edge (x = xMax)
                for (let j = 0; j < ny; j++) {
                    expect(result.u[n][j][nx - 1]).toBe(boundaryValue);
                }

                // Bottom edge (y = 0)
                for (let i = 0; i < nx; i++) {
                    expect(result.u[n][0][i]).toBe(boundaryValue);
                }

                // Top edge (y = yMax)
                for (let i = 0; i < nx; i++) {
                    expect(result.u[n][ny - 1][i]).toBe(boundaryValue);
                }
            }
        });

        test('should diffuse heat from center', () => {
            const result = heatEquation2D(
                0.01,
                0,
                1,
                0,
                1,
                0.5,
                (x, y) => Math.exp(-50 * ((x - 0.5) ** 2 + (y - 0.5) ** 2)),
                0,
                { numSpatialPoints: 30, numTimeSteps: 200 }
            );

            expect(result.success).toBe(true);

            // Center should cool down over time
            const midX = Math.floor(result.x.length / 2);
            const midY = Math.floor(result.y.length / 2);

            const initialCenter = result.u[0][midY][midX];
            const finalCenter = result.u[result.u.length - 1][midY][midX];

            expect(finalCenter).toBeLessThan(initialCenter);
        });

        test('should have decreasing total energy', () => {
            const result = heatEquation2D(
                0.05,
                0,
                1,
                0,
                1,
                0.5,
                (x, y) => Math.sin(Math.PI * x) * Math.sin(Math.PI * y),
                0,
                { numSpatialPoints: 25, numTimeSteps: 100 }
            );

            expect(result.success).toBe(true);

            // Calculate total energy at start and end
            let energy0 = 0;
            let energyFinal = 0;

            for (const row of result.u[0]) {
                for (const val of row) {
                    energy0 += Math.abs(val);
                }
            }

            for (const row of result.u[result.u.length - 1]) {
                for (const val of row) {
                    energyFinal += Math.abs(val);
                }
            }

            expect(energyFinal).toBeLessThan(energy0);
        });

        test('should handle symmetric initial condition symmetrically', () => {
            // Radially symmetric initial condition
            const result = heatEquation2D(
                0.01,
                0,
                1,
                0,
                1,
                0.2,
                (x, y) => Math.exp(-50 * ((x - 0.5) ** 2 + (y - 0.5) ** 2)),
                0,
                { numSpatialPoints: 30, numTimeSteps: 100 }
            );

            expect(result.success).toBe(true);

            // Solution should remain approximately symmetric
            const n = result.u.length - 1;
            const mid = Math.floor(result.x.length / 2);

            // Check that opposite points are similar
            if (mid > 2 && mid < result.x.length - 3) {
                const val1 = result.u[n][mid - 2][mid];
                const val2 = result.u[n][mid + 2][mid];
                const val3 = result.u[n][mid][mid - 2];
                const val4 = result.u[n][mid][mid + 2];

                // Due to symmetry, these should be approximately equal
                // Using relative tolerance
                const avg1 = (val1 + val2) / 2;
                const avg2 = (val3 + val4) / 2;
                if (avg1 > 0.01) {
                    expect(Math.abs(val1 - val2) / avg1).toBeLessThan(0.3);
                }
                if (avg2 > 0.01) {
                    expect(Math.abs(val3 - val4) / avg2).toBeLessThan(0.3);
                }
            }
        });

        test('should not produce NaN or Inf values', () => {
            const result = heatEquation2D(
                0.1,
                0,
                1,
                0,
                1,
                0.5,
                (x, y) => x + y,
                0,
                { numSpatialPoints: 25, numTimeSteps: 100 }
            );

            expect(result.success).toBe(true);

            for (const timeSlice of result.u) {
                for (const row of timeSlice) {
                    for (const val of row) {
                        expect(isFinite(val)).toBe(true);
                    }
                }
            }
        });
    });
});
