
import {
  besselJ0,
  besselJ1,
  besselJn,
  besselY0,
  besselY1,
  besselI0,
  besselI1,
  besselK0,
  besselK1,
  sphericalBesselJ,
  sphericalBesselY,
} from '../../src/special/bessel';

describe('Bessel Functions', () => {
  describe('besselJ0', () => {
    test('should compute J₀(x)', () => {
      expect(besselJ0(0)).toBeCloseTo(1, 8);
      expect(besselJ0(1)).toBeCloseTo(0.7652, 3);
      expect(besselJ0(2)).toBeCloseTo(0.2239, 3);
    });

    test('should have zeros at known positions', () => {
      // First zero at approximately 2.4048
      expect(Math.abs(besselJ0(2.4048))).toBeLessThan(0.01);
    });

    test('should be even function', () => {
      expect(besselJ0(-1)).toBeCloseTo(besselJ0(1), 8);
      expect(besselJ0(-2)).toBeCloseTo(besselJ0(2), 8);
    });
  });

  describe('besselJ1', () => {
    test('should compute J₁(x)', () => {
      expect(besselJ1(0)).toBeCloseTo(0, 8);
      expect(besselJ1(1)).toBeCloseTo(0.4401, 3);
      expect(besselJ1(2)).toBeCloseTo(0.5767, 3);
    });

    test('should be odd function', () => {
      expect(besselJ1(-1)).toBeCloseTo(-besselJ1(1), 8);
      expect(besselJ1(-2)).toBeCloseTo(-besselJ1(2), 8);
    });

    test('should have zeros at known positions', () => {
      // First zero at approximately 3.8317
      expect(Math.abs(besselJ1(3.8317))).toBeLessThan(0.01);
    });
  });

  describe('besselJn', () => {
    test('should match J0 and J1 for n=0,1', () => {
      expect(besselJn(0, 1)).toBeCloseTo(besselJ0(1), 8);
      expect(besselJn(1, 1)).toBeCloseTo(besselJ1(1), 8);
    });

    test('should compute higher order Bessel functions', () => {
      const j2_1 = besselJn(2, 1);
      const j5_10 = besselJn(5, 10);
      expect(isFinite(j2_1)).toBe(true);
      expect(isFinite(j5_10)).toBe(true);
    });

    test('should return 0 for x = 0 and n > 0', () => {
      expect(besselJn(1, 0)).toBe(0);
      expect(besselJn(2, 0)).toBe(0);
    });
  });

  describe('besselY0', () => {
    test('should compute Y₀(x)', () => {
      expect(besselY0(1)).toBeCloseTo(0.0883, 3);
      expect(besselY0(2)).toBeCloseTo(0.5104, 3);
    });

    test('should throw for non-positive x', () => {
      expect(() => besselY0(0)).toThrow();
      expect(() => besselY0(-1)).toThrow();
    });
  });

  describe('besselY1', () => {
    test('should compute Y₁(x)', () => {
      expect(besselY1(1)).toBeCloseTo(-0.7812, 3);
      expect(besselY1(2)).toBeCloseTo(-0.1070, 3);
    });

    test('should throw for non-positive x', () => {
      expect(() => besselY1(0)).toThrow();
      expect(() => besselY1(-1)).toThrow();
    });
  });

  describe('besselI0', () => {
    test('should compute modified Bessel I₀(x)', () => {
      expect(besselI0(0)).toBeCloseTo(1, 8);
      expect(besselI0(1)).toBeCloseTo(1.2661, 3);
      expect(besselI0(2)).toBeCloseTo(2.2796, 3);
    });

    test('should be even function', () => {
      expect(besselI0(-1)).toBeCloseTo(besselI0(1), 8);
    });

    test('should grow exponentially', () => {
      expect(besselI0(5)).toBeGreaterThan(besselI0(4));
    });
  });

  describe('besselI1', () => {
    test('should compute modified Bessel I₁(x)', () => {
      expect(besselI1(0)).toBeCloseTo(0, 8);
      expect(besselI1(1)).toBeCloseTo(0.5652, 3);
      expect(besselI1(2)).toBeCloseTo(1.5906, 3);
    });

    test('should handle negative arguments', () => {
      const result = besselI1(-1);
      expect(isFinite(result)).toBe(true);
    });
  });

  describe('besselK0', () => {
    test('should compute modified Bessel K₀(x)', () => {
      expect(besselK0(1)).toBeCloseTo(0.4210, 3);
      expect(besselK0(2)).toBeCloseTo(0.1139, 3);
    });

    test('should throw for non-positive x', () => {
      expect(() => besselK0(0)).toThrow();
      expect(() => besselK0(-1)).toThrow();
    });

    test('should decay exponentially', () => {
      expect(besselK0(2)).toBeLessThan(besselK0(1));
      expect(besselK0(5)).toBeLessThan(besselK0(2));
    });
  });

  describe('besselK1', () => {
    test('should compute modified Bessel K₁(x)', () => {
      expect(besselK1(1)).toBeCloseTo(0.6019, 3);
      expect(besselK1(2)).toBeCloseTo(0.1399, 3);
    });

    test('should throw for non-positive x', () => {
      expect(() => besselK1(0)).toThrow();
      expect(() => besselK1(-1)).toThrow();
    });
  });

  describe('sphericalBesselJ', () => {
    test('should compute spherical Bessel j₀(x)', () => {
      const x = 1;
      expect(sphericalBesselJ(0, x)).toBeCloseTo(Math.sin(x) / x, 6);
    });

    test('should return 1 for j₀(0)', () => {
      expect(sphericalBesselJ(0, 0)).toBe(1);
    });

    test('should return 0 for jₙ(0) when n > 0', () => {
      expect(sphericalBesselJ(1, 0)).toBe(0);
      expect(sphericalBesselJ(2, 0)).toBe(0);
    });

    test('should compute higher orders', () => {
      const result = sphericalBesselJ(2, 1);
      expect(isFinite(result)).toBe(true);
    });
  });

  describe('sphericalBesselY', () => {
    test('should compute spherical Bessel y₀(x)', () => {
      const x = 1;
      expect(sphericalBesselY(0, x)).toBeCloseTo(-Math.cos(x) / x, 6);
    });

    test('should throw for non-positive x', () => {
      expect(() => sphericalBesselY(0, 0)).toThrow();
      expect(() => sphericalBesselY(1, -1)).toThrow();
    });

    test('should compute higher orders', () => {
      const result = sphericalBesselY(2, 1);
      expect(isFinite(result)).toBe(true);
    });
  });
});
