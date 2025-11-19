import { PerlinNoise, perlin1D, perlin2D, perlin3D, perlin4D } from '../../src/noise/perlin';

describe('Perlin Noise', () => {
    describe('PerlinNoise Class', () => {
        it('should create instance with default seed', () => {
            const perlin = new PerlinNoise();
            expect(perlin).toBeInstanceOf(PerlinNoise);
        });

        it('should create instance with custom seed', () => {
            const perlin = new PerlinNoise(42);
            expect(perlin).toBeInstanceOf(PerlinNoise);
        });

        it('should produce deterministic results with same seed', () => {
            const perlin1 = new PerlinNoise(12345);
            const perlin2 = new PerlinNoise(12345);

            const value1 = perlin1.noise2D(5.5, 3.2);
            const value2 = perlin2.noise2D(5.5, 3.2);

            expect(value1).toBe(value2);
        });

        it('should produce different results with different seeds', () => {
            const perlin1 = new PerlinNoise(12345);
            const perlin2 = new PerlinNoise(54321);

            const value1 = perlin1.noise2D(5.5, 3.2);
            const value2 = perlin2.noise2D(5.5, 3.2);

            expect(value1).not.toBe(value2);
        });
    });

    describe('1D Perlin Noise', () => {
        const perlin = new PerlinNoise(42);

        it('should return values in reasonable range', () => {
            for (let i = 0; i < 100; i++) {
                const value = perlin.noise1D(i * 0.1);
                expect(value).toBeGreaterThanOrEqual(-1.5);
                expect(value).toBeLessThanOrEqual(1.5);
            }
        });

        it('should produce continuous values', () => {
            const v1 = perlin.noise1D(5.0);
            const v2 = perlin.noise1D(5.001);

            expect(Math.abs(v1 - v2)).toBeLessThan(0.1);
        });

        it('should produce different values at different positions', () => {
            const v1 = perlin.noise1D(0);
            const v2 = perlin.noise1D(10);

            expect(v1).not.toBe(v2);
        });

        it('should work with negative coordinates', () => {
            const value = perlin.noise1D(-5.5);
            expect(value).toBeGreaterThanOrEqual(-1.5);
            expect(value).toBeLessThanOrEqual(1.5);
        });
    });

    describe('2D Perlin Noise', () => {
        const perlin = new PerlinNoise(42);

        it('should return values in reasonable range', () => {
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    const value = perlin.noise2D(i * 0.5, j * 0.5);
                    expect(value).toBeGreaterThanOrEqual(-1.5);
                    expect(value).toBeLessThanOrEqual(1.5);
                }
            }
        });

        it('should produce continuous values', () => {
            const v1 = perlin.noise2D(5.0, 3.0);
            const v2 = perlin.noise2D(5.001, 3.001);

            expect(Math.abs(v1 - v2)).toBeLessThan(0.1);
        });

        it('should produce different values at different positions', () => {
            const v1 = perlin.noise2D(0, 0);
            const v2 = perlin.noise2D(5, 5);

            expect(v1).not.toBe(v2);
        });

        it('should be relatively smooth', () => {
            const values: number[] = [];
            for (let i = 0; i < 10; i++) {
                values.push(perlin.noise2D(i * 0.1, 0));
            }

            // Check that adjacent values don't jump too much
            for (let i = 1; i < values.length; i++) {
                expect(Math.abs(values[i] - values[i - 1])).toBeLessThan(0.5);
            }
        });

        it('should work with negative coordinates', () => {
            const value = perlin.noise2D(-5.5, -3.2);
            expect(value).toBeGreaterThanOrEqual(-1.5);
            expect(value).toBeLessThanOrEqual(1.5);
        });
    });

    describe('3D Perlin Noise', () => {
        const perlin = new PerlinNoise(42);

        it('should return values in reasonable range', () => {
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    for (let k = 0; k < 5; k++) {
                        const value = perlin.noise3D(i * 0.5, j * 0.5, k * 0.5);
                        expect(value).toBeGreaterThanOrEqual(-1.5);
                        expect(value).toBeLessThanOrEqual(1.5);
                    }
                }
            }
        });

        it('should produce continuous values', () => {
            const v1 = perlin.noise3D(5.0, 3.0, 2.0);
            const v2 = perlin.noise3D(5.001, 3.001, 2.001);

            expect(Math.abs(v1 - v2)).toBeLessThan(0.1);
        });

        it('should produce different values at different positions', () => {
            const v1 = perlin.noise3D(1.5, 2.3, 3.7);
            const v2 = perlin.noise3D(10.2, 15.7, 8.3);

            expect(v1).not.toBe(v2);
        });

        it('should work with negative coordinates', () => {
            const value = perlin.noise3D(-5.5, -3.2, -1.8);
            expect(value).toBeGreaterThanOrEqual(-1.5);
            expect(value).toBeLessThanOrEqual(1.5);
        });
    });

    describe('4D Perlin Noise', () => {
        const perlin = new PerlinNoise(42);

        it('should return values in reasonable range', () => {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    for (let k = 0; k < 3; k++) {
                        for (let l = 0; l < 3; l++) {
                            const value = perlin.noise4D(i, j, k, l);
                            expect(value).toBeGreaterThanOrEqual(-1.5);
                            expect(value).toBeLessThanOrEqual(1.5);
                        }
                    }
                }
            }
        });

        it('should produce continuous values', () => {
            const v1 = perlin.noise4D(5.0, 3.0, 2.0, 1.0);
            const v2 = perlin.noise4D(5.001, 3.001, 2.001, 1.001);

            expect(Math.abs(v1 - v2)).toBeLessThan(0.1);
        });

        it('should produce different values at different positions', () => {
            const v1 = perlin.noise4D(1.5, 2.3, 3.7, 4.1);
            const v2 = perlin.noise4D(10.2, 15.7, 8.3, 12.4);

            expect(v1).not.toBe(v2);
        });

        it('should work with time dimension for animation', () => {
            // Test animating through time dimension
            const values: number[] = [];
            for (let t = 0; t < 10; t++) {
                values.push(perlin.noise4D(5, 3, 2, t * 0.1));
            }

            // Values should change but remain continuous
            for (let i = 1; i < values.length; i++) {
                expect(Math.abs(values[i] - values[i - 1])).toBeLessThan(0.5);
            }
        });
    });

    describe('Convenience Functions', () => {
        it('should work for perlin1D', () => {
            const value = perlin1D(5.5);
            expect(typeof value).toBe('number');
            expect(value).toBeGreaterThanOrEqual(-1.5);
            expect(value).toBeLessThanOrEqual(1.5);
        });

        it('should work for perlin2D', () => {
            const value = perlin2D(5.5, 3.2);
            expect(typeof value).toBe('number');
            expect(value).toBeGreaterThanOrEqual(-1.5);
            expect(value).toBeLessThanOrEqual(1.5);
        });

        it('should work for perlin3D', () => {
            const value = perlin3D(5.5, 3.2, 1.8);
            expect(typeof value).toBe('number');
            expect(value).toBeGreaterThanOrEqual(-1.5);
            expect(value).toBeLessThanOrEqual(1.5);
        });

        it('should work for perlin4D', () => {
            const value = perlin4D(5.5, 3.2, 1.8, 0.5);
            expect(typeof value).toBe('number');
            expect(value).toBeGreaterThanOrEqual(-1.5);
            expect(value).toBeLessThanOrEqual(1.5);
        });
    });

    describe('Statistical Properties', () => {
        const perlin = new PerlinNoise(42);

        it('should have approximately zero mean over large sample', () => {
            let sum = 0;
            const samples = 1000;

            for (let i = 0; i < samples; i++) {
                sum += perlin.noise2D(Math.random() * 100, Math.random() * 100);
            }

            const mean = sum / samples;
            expect(Math.abs(mean)).toBeLessThan(0.2);
        });

        it('should produce varied output', () => {
            const values = new Set();
            for (let i = 0; i < 100; i++) {
                values.add(perlin.noise2D(i * 0.5, i * 0.3));
            }

            // Should have many unique values (at least 50% unique)
            expect(values.size).toBeGreaterThan(50);
        });
    });
});
