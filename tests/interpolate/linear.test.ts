import {
    lerp,
    lerpClamped,
    inverseLerp,
    remap,
    bilinear,
    bilinearArray,
    trilinear,
    trilinearArray,
    smoothstep,
    smootherstep,
    cosineInterp,
    multiLerp
} from '../../src/interpolate/linear';

describe('Linear Interpolation', () => {
    describe('lerp', () => {
        it('should return start value when t=0', () => {
            expect(lerp(0, 10, 0)).toBe(0);
            expect(lerp(5, 15, 0)).toBe(5);
        });

        it('should return end value when t=1', () => {
            expect(lerp(0, 10, 1)).toBe(10);
            expect(lerp(5, 15, 1)).toBe(15);
        });

        it('should interpolate correctly at t=0.5', () => {
            expect(lerp(0, 10, 0.5)).toBe(5);
            expect(lerp(10, 20, 0.5)).toBe(15);
        });

        it('should handle negative values', () => {
            expect(lerp(-10, 10, 0.5)).toBe(0);
            expect(lerp(-5, -15, 0.5)).toBe(-10);
        });

        it('should extrapolate when t > 1', () => {
            expect(lerp(0, 10, 1.5)).toBe(15);
        });

        it('should extrapolate when t < 0', () => {
            expect(lerp(0, 10, -0.5)).toBe(-5);
        });
    });

    describe('lerpClamped', () => {
        it('should clamp t to [0, 1]', () => {
            expect(lerpClamped(0, 10, -0.5)).toBe(0);
            expect(lerpClamped(0, 10, 1.5)).toBe(10);
        });

        it('should work normally within range', () => {
            expect(lerpClamped(0, 10, 0.5)).toBe(5);
        });
    });

    describe('inverseLerp', () => {
        it('should return 0 when value equals start', () => {
            expect(inverseLerp(0, 10, 0)).toBe(0);
            expect(inverseLerp(5, 15, 5)).toBe(0);
        });

        it('should return 1 when value equals end', () => {
            expect(inverseLerp(0, 10, 10)).toBe(1);
            expect(inverseLerp(5, 15, 15)).toBe(1);
        });

        it('should return 0.5 for middle value', () => {
            expect(inverseLerp(0, 10, 5)).toBe(0.5);
            expect(inverseLerp(10, 20, 15)).toBe(0.5);
        });

        it('should handle values outside range', () => {
            expect(inverseLerp(0, 10, 15)).toBe(1.5);
            expect(inverseLerp(0, 10, -5)).toBe(-0.5);
        });

        it('should handle equal start and end', () => {
            expect(inverseLerp(5, 5, 5)).toBe(0);
        });
    });

    describe('remap', () => {
        it('should remap value from one range to another', () => {
            expect(remap(5, 0, 10, 0, 100)).toBe(50);
            expect(remap(0.5, 0, 1, -1, 1)).toBe(0);
        });

        it('should handle edge cases', () => {
            expect(remap(0, 0, 10, 0, 100)).toBe(0);
            expect(remap(10, 0, 10, 0, 100)).toBe(100);
        });

        it('should work with negative ranges', () => {
            expect(remap(0, -10, 10, 0, 100)).toBe(50);
        });
    });

    describe('bilinear', () => {
        it('should return v00 when both t values are 0', () => {
            expect(bilinear(1, 2, 3, 4, 0, 0)).toBe(1);
        });

        it('should return v11 when both t values are 1', () => {
            expect(bilinear(1, 2, 3, 4, 1, 1)).toBe(4);
        });

        it('should return v10 when tx=1, ty=0', () => {
            expect(bilinear(1, 2, 3, 4, 1, 0)).toBe(2);
        });

        it('should return v01 when tx=0, ty=1', () => {
            expect(bilinear(1, 2, 3, 4, 0, 1)).toBe(3);
        });

        it('should interpolate correctly in center', () => {
            expect(bilinear(0, 2, 2, 4, 0.5, 0.5)).toBe(2);
        });

        it('should handle uniform grid', () => {
            expect(bilinear(5, 5, 5, 5, 0.3, 0.7)).toBe(5);
        });
    });

    describe('bilinearArray', () => {
        it('should work with array of corners', () => {
            const result = bilinearArray([1, 2, 3, 4], 0.5, 0.5);
            expect(result).toBe(2.5);
        });

        it('should throw error for invalid array length', () => {
            expect(() => bilinearArray([1, 2, 3], 0.5, 0.5)).toThrow();
        });
    });

    describe('trilinear', () => {
        it('should return v000 when all t values are 0', () => {
            expect(trilinear(1, 2, 3, 4, 5, 6, 7, 8, 0, 0, 0)).toBe(1);
        });

        it('should return v111 when all t values are 1', () => {
            expect(trilinear(1, 2, 3, 4, 5, 6, 7, 8, 1, 1, 1)).toBe(8);
        });

        it('should interpolate correctly in center', () => {
            expect(trilinear(0, 2, 2, 4, 2, 4, 4, 6, 0.5, 0.5, 0.5)).toBe(3);
        });

        it('should handle uniform grid', () => {
            expect(trilinear(5, 5, 5, 5, 5, 5, 5, 5, 0.3, 0.7, 0.5)).toBe(5);
        });
    });

    describe('trilinearArray', () => {
        it('should work with array of corners', () => {
            const result = trilinearArray([1, 2, 3, 4, 5, 6, 7, 8], 0.5, 0.5, 0.5);
            expect(result).toBe(4.5);
        });

        it('should throw error for invalid array length', () => {
            expect(() => trilinearArray([1, 2, 3], 0.5, 0.5, 0.5)).toThrow();
        });
    });

    describe('smoothstep', () => {
        it('should return 0 at lower edge', () => {
            expect(smoothstep(0, 1, 0)).toBe(0);
        });

        it('should return 1 at upper edge', () => {
            expect(smoothstep(0, 1, 1)).toBe(1);
        });

        it('should return 0.5 at midpoint', () => {
            expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5);
        });

        it('should have smooth curve', () => {
            const v1 = smoothstep(0, 1, 0.25);
            const v2 = smoothstep(0, 1, 0.75);

            // Should be symmetric
            expect(v1).toBeCloseTo(1 - v2);
        });

        it('should clamp values outside range', () => {
            expect(smoothstep(0, 1, -0.5)).toBe(0);
            expect(smoothstep(0, 1, 1.5)).toBe(1);
        });

        it('should work with different ranges', () => {
            expect(smoothstep(0, 10, 5)).toBeCloseTo(0.5);
        });
    });

    describe('smootherstep', () => {
        it('should return 0 at lower edge', () => {
            expect(smootherstep(0, 1, 0)).toBe(0);
        });

        it('should return 1 at upper edge', () => {
            expect(smootherstep(0, 1, 1)).toBe(1);
        });

        it('should return 0.5 at midpoint', () => {
            expect(smootherstep(0, 1, 0.5)).toBeCloseTo(0.5);
        });

        it('should be smoother than smoothstep', () => {
            // At edges, smootherstep should be flatter
            const smooth1 = smoothstep(0, 1, 0.1);
            const smoother1 = smootherstep(0, 1, 0.1);
            expect(smoother1).toBeLessThan(smooth1);
        });
    });

    describe('cosineInterp', () => {
        it('should return start value when t=0', () => {
            expect(cosineInterp(0, 10, 0)).toBe(0);
        });

        it('should return end value when t=1', () => {
            expect(cosineInterp(0, 10, 1)).toBe(10);
        });

        it('should return middle value when t=0.5', () => {
            expect(cosineInterp(0, 10, 0.5)).toBeCloseTo(5);
        });

        it('should produce smooth curve', () => {
            const values: number[] = [];
            for (let i = 0; i <= 10; i++) {
                values.push(cosineInterp(0, 10, i / 10));
            }

            // Check smoothness (no large jumps)
            for (let i = 1; i < values.length; i++) {
                expect(Math.abs(values[i] - values[i - 1])).toBeLessThan(2);
            }
        });
    });

    describe('multiLerp', () => {
        it('should return first value when t=0', () => {
            expect(multiLerp([0, 5, 10], 0)).toBe(0);
        });

        it('should return last value when t=1', () => {
            expect(multiLerp([0, 5, 10], 1)).toBe(10);
        });

        it('should interpolate through middle points', () => {
            expect(multiLerp([0, 5, 10], 0.5)).toBe(5);
        });

        it('should handle single point', () => {
            expect(multiLerp([5], 0.5)).toBe(5);
        });

        it('should handle two points like regular lerp', () => {
            expect(multiLerp([0, 10], 0.5)).toBe(5);
        });

        it('should throw error for empty array', () => {
            expect(() => multiLerp([], 0.5)).toThrow();
        });

        it('should interpolate correctly within segments', () => {
            const result = multiLerp([0, 10, 20, 30], 0.25);
            expect(result).toBeCloseTo(7.5);
        });

        it('should clamp t to [0, 1]', () => {
            expect(multiLerp([0, 5, 10], -0.5)).toBe(0);
            expect(multiLerp([0, 5, 10], 1.5)).toBe(10);
        });
    });

    describe('Integration tests', () => {
        it('lerp and inverseLerp should be inverses', () => {
            const a = 10;
            const b = 50;
            const value = 30;

            const t = inverseLerp(a, b, value);
            const result = lerp(a, b, t);

            expect(result).toBeCloseTo(value);
        });

        it('bilinear should reduce to lerp on edges', () => {
            // When ty = 0, should be lerp along x
            const bilinResult = bilinear(1, 2, 3, 4, 0.5, 0);
            const lerpResult = lerp(1, 2, 0.5);
            expect(bilinResult).toBeCloseTo(lerpResult);
        });

        it('trilinear should reduce to bilinear on faces', () => {
            // When tz = 0, should be bilinear
            const trilinResult = trilinear(1, 2, 3, 4, 5, 6, 7, 8, 0.5, 0.5, 0);
            const bilinResult = bilinear(1, 2, 3, 4, 0.5, 0.5);
            expect(trilinResult).toBeCloseTo(bilinResult);
        });
    });
});
