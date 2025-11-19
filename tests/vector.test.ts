import { Vector } from '../src/linalg/vector';

describe('Vector', () => {
  describe('Construction', () => {
    test('creates vector from array', () => {
      const v = new Vector([1, 2, 3]);
      expect(v.dimension).toBe(3);
      expect(v.toArray()).toEqual([1, 2, 3]);
    });

    test('creates vector from components', () => {
      const v = Vector.fromComponents(4, 5, 6);
      expect(v.toArray()).toEqual([4, 5, 6]);
    });

    test('creates zero vector', () => {
      const v = Vector.zero(3);
      expect(v.toArray()).toEqual([0, 0, 0]);
    });

    test('creates unit vector', () => {
      const v = Vector.unit(3, 1);
      expect(v.toArray()).toEqual([0, 1, 0]);
    });

    test('throws error for empty vector', () => {
      expect(() => new Vector([])).toThrow();
    });
  });

  describe('Basic Operations', () => {
    test('gets component by index', () => {
      const v = new Vector([1, 2, 3]);
      expect(v.get(0)).toBe(1);
      expect(v.get(1)).toBe(2);
      expect(v.get(2)).toBe(3);
    });

    test('sets component by index', () => {
      const v = new Vector([1, 2, 3]);
      v.set(1, 5);
      expect(v.get(1)).toBe(5);
    });

    test('computes magnitude', () => {
      const v = new Vector([3, 4]);
      expect(v.magnitude()).toBe(5);
    });

    test('computes magnitude squared', () => {
      const v = new Vector([3, 4]);
      expect(v.magnitudeSquared()).toBe(25);
    });

    test('normalizes vector', () => {
      const v = new Vector([3, 4]);
      const normalized = v.normalize();
      expect(normalized.magnitude()).toBeCloseTo(1);
      expect(normalized.toArray()[0]).toBeCloseTo(0.6);
      expect(normalized.toArray()[1]).toBeCloseTo(0.8);
    });

    test('normalizes zero vector returns zero', () => {
      const v = Vector.zero(3);
      const normalized = v.normalize();
      expect(normalized.toArray()).toEqual([0, 0, 0]);
    });
  });

  describe('Arithmetic Operations', () => {
    test('adds vectors', () => {
      const v1 = new Vector([1, 2, 3]);
      const v2 = new Vector([4, 5, 6]);
      const result = v1.add(v2);
      expect(result.toArray()).toEqual([5, 7, 9]);
    });

    test('subtracts vectors', () => {
      const v1 = new Vector([4, 5, 6]);
      const v2 = new Vector([1, 2, 3]);
      const result = v1.subtract(v2);
      expect(result.toArray()).toEqual([3, 3, 3]);
    });

    test('scales vector', () => {
      const v = new Vector([1, 2, 3]);
      const result = v.scale(2);
      expect(result.toArray()).toEqual([2, 4, 6]);
    });

    test('negates vector', () => {
      const v = new Vector([1, -2, 3]);
      const result = v.negate();
      expect(result.toArray()).toEqual([-1, 2, -3]);
    });

    test('throws error for dimension mismatch in addition', () => {
      const v1 = new Vector([1, 2]);
      const v2 = new Vector([1, 2, 3]);
      expect(() => v1.add(v2)).toThrow();
    });
  });

  describe('Dot and Cross Product', () => {
    test('computes dot product', () => {
      const v1 = new Vector([1, 2, 3]);
      const v2 = new Vector([4, 5, 6]);
      expect(v1.dot(v2)).toBe(32); // 1*4 + 2*5 + 3*6
    });

    test('computes cross product', () => {
      const v1 = new Vector([1, 0, 0]);
      const v2 = new Vector([0, 1, 0]);
      const result = v1.cross(v2);
      expect(result.toArray()).toEqual([0, 0, 1]);
    });

    test('cross product with general vectors', () => {
      const v1 = new Vector([1, 2, 3]);
      const v2 = new Vector([4, 5, 6]);
      const result = v1.cross(v2);
      expect(result.toArray()).toEqual([-3, 6, -3]);
    });

    test('throws error for cross product with non-3D vectors', () => {
      const v1 = new Vector([1, 2]);
      const v2 = new Vector([3, 4]);
      expect(() => v1.cross(v2)).toThrow();
    });
  });

  describe('Angle Between Vectors', () => {
    test('computes angle between perpendicular vectors', () => {
      const v1 = new Vector([1, 0, 0]);
      const v2 = new Vector([0, 1, 0]);
      expect(v1.angleTo(v2)).toBeCloseTo(Math.PI / 2);
    });

    test('computes angle between parallel vectors', () => {
      const v1 = new Vector([1, 0, 0]);
      const v2 = new Vector([2, 0, 0]);
      expect(v1.angleTo(v2)).toBeCloseTo(0);
    });

    test('computes angle between opposite vectors', () => {
      const v1 = new Vector([1, 0, 0]);
      const v2 = new Vector([-1, 0, 0]);
      expect(v1.angleTo(v2)).toBeCloseTo(Math.PI);
    });

    test('throws error for angle with zero vector', () => {
      const v1 = new Vector([1, 0, 0]);
      const v2 = Vector.zero(3);
      expect(() => v1.angleTo(v2)).toThrow();
    });
  });

  describe('Projection and Rejection', () => {
    test('projects vector onto another', () => {
      const v1 = new Vector([1, 2]);
      const v2 = new Vector([1, 0]);
      const proj = v1.projectOnto(v2);
      expect(proj.toArray()).toEqual([1, 0]);
    });

    test('computes rejection', () => {
      const v1 = new Vector([1, 2]);
      const v2 = new Vector([1, 0]);
      const rej = v1.rejectFrom(v2);
      expect(rej.toArray()).toEqual([0, 2]);
    });

    test('throws error for projection onto zero vector', () => {
      const v1 = new Vector([1, 2]);
      const v2 = Vector.zero(2);
      expect(() => v1.projectOnto(v2)).toThrow();
    });
  });

  describe('Reflection', () => {
    test('reflects vector across normal', () => {
      const v = new Vector([1, 1]);
      const normal = new Vector([0, 1]);
      const reflected = v.reflect(normal);
      expect(reflected.toArray()[0]).toBeCloseTo(1);
      expect(reflected.toArray()[1]).toBeCloseTo(-1);
    });

    test('reflects vector across diagonal normal', () => {
      const v = new Vector([1, 0]);
      const normal = new Vector([1, 0]);
      const reflected = v.reflect(normal);
      expect(reflected.toArray()[0]).toBeCloseTo(-1);
      expect(reflected.toArray()[1]).toBeCloseTo(0);
    });
  });

  describe('Interpolation', () => {
    test('lerp at t=0 returns first vector', () => {
      const v1 = new Vector([1, 2, 3]);
      const v2 = new Vector([4, 5, 6]);
      const result = v1.lerp(v2, 0);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    test('lerp at t=1 returns second vector', () => {
      const v1 = new Vector([1, 2, 3]);
      const v2 = new Vector([4, 5, 6]);
      const result = v1.lerp(v2, 1);
      expect(result.toArray()).toEqual([4, 5, 6]);
    });

    test('lerp at t=0.5 returns midpoint', () => {
      const v1 = new Vector([0, 0]);
      const v2 = new Vector([2, 4]);
      const result = v1.lerp(v2, 0.5);
      expect(result.toArray()).toEqual([1, 2]);
    });

    test('slerp at t=0 returns first vector', () => {
      const v1 = new Vector([1, 0]);
      const v2 = new Vector([0, 1]);
      const result = v1.slerp(v2, 0);
      expect(result.toArray()[0]).toBeCloseTo(1);
      expect(result.toArray()[1]).toBeCloseTo(0);
    });

    test('slerp at t=1 returns second vector', () => {
      const v1 = new Vector([1, 0]);
      const v2 = new Vector([0, 1]);
      const result = v1.slerp(v2, 1);
      expect(result.toArray()[0]).toBeCloseTo(0);
      expect(result.toArray()[1]).toBeCloseTo(1);
    });

    test('slerp at t=0.5 for perpendicular vectors', () => {
      const v1 = new Vector([1, 0]);
      const v2 = new Vector([0, 1]);
      const result = v1.slerp(v2, 0.5);
      const normalized = result.normalize();
      expect(normalized.toArray()[0]).toBeCloseTo(1 / Math.sqrt(2));
      expect(normalized.toArray()[1]).toBeCloseTo(1 / Math.sqrt(2));
    });
  });

  describe('Utility Methods', () => {
    test('equals returns true for equal vectors', () => {
      const v1 = new Vector([1, 2, 3]);
      const v2 = new Vector([1, 2, 3]);
      expect(v1.equals(v2)).toBe(true);
    });

    test('equals returns false for different vectors', () => {
      const v1 = new Vector([1, 2, 3]);
      const v2 = new Vector([1, 2, 4]);
      expect(v1.equals(v2)).toBe(false);
    });

    test('clone creates independent copy', () => {
      const v1 = new Vector([1, 2, 3]);
      const v2 = v1.clone();
      v2.set(0, 10);
      expect(v1.get(0)).toBe(1);
      expect(v2.get(0)).toBe(10);
    });

    test('toString returns string representation', () => {
      const v = new Vector([1, 2, 3]);
      expect(v.toString()).toBe('Vector([1, 2, 3])');
    });

    test('abs returns absolute values', () => {
      const v = new Vector([1, -2, 3]);
      const result = v.abs();
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    test('min returns minimum component', () => {
      const v = new Vector([3, 1, 4]);
      expect(v.min()).toBe(1);
    });

    test('max returns maximum component', () => {
      const v = new Vector([3, 1, 4]);
      expect(v.max()).toBe(4);
    });

    test('componentMin returns component-wise minimum', () => {
      const v1 = new Vector([1, 4, 2]);
      const v2 = new Vector([3, 2, 5]);
      const result = v1.componentMin(v2);
      expect(result.toArray()).toEqual([1, 2, 2]);
    });

    test('componentMax returns component-wise maximum', () => {
      const v1 = new Vector([1, 4, 2]);
      const v2 = new Vector([3, 2, 5]);
      const result = v1.componentMax(v2);
      expect(result.toArray()).toEqual([3, 4, 5]);
    });

    test('map applies function to components', () => {
      const v = new Vector([1, 2, 3]);
      const result = v.map(x => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
    });
  });
});
