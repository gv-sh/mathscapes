import { Point } from '../../src/geometry/point';

describe('Point', () => {
  describe('constructor', () => {
    test('should create a point with x and y coordinates', () => {
      const p = new Point(3, 4);
      expect(p.x).toBe(3);
      expect(p.y).toBe(4);
    });
  });

  describe('distanceTo', () => {
    test('should calculate Euclidean distance', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(3, 4);
      expect(p1.distanceTo(p2)).toBe(5);
    });

    test('should return 0 for same point', () => {
      const p = new Point(1, 2);
      expect(p.distanceTo(p)).toBe(0);
    });

    test('should be symmetric', () => {
      const p1 = new Point(1, 2);
      const p2 = new Point(4, 6);
      expect(p1.distanceTo(p2)).toBe(p2.distanceTo(p1));
    });
  });

  describe('manhattanDistanceTo', () => {
    test('should calculate Manhattan distance', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(3, 4);
      expect(p1.manhattanDistanceTo(p2)).toBe(7);
    });

    test('should return 0 for same point', () => {
      const p = new Point(1, 2);
      expect(p.manhattanDistanceTo(p)).toBe(0);
    });
  });

  describe('distanceSquaredTo', () => {
    test('should calculate squared distance', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(3, 4);
      expect(p1.distanceSquaredTo(p2)).toBe(25);
    });
  });

  describe('midpoint', () => {
    test('should find the midpoint', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(4, 6);
      const mid = p1.midpoint(p2);
      expect(mid.x).toBe(2);
      expect(mid.y).toBe(3);
    });

    test('should work with negative coordinates', () => {
      const p1 = new Point(-2, -4);
      const p2 = new Point(2, 4);
      const mid = p1.midpoint(p2);
      expect(mid.x).toBe(0);
      expect(mid.y).toBe(0);
    });
  });

  describe('rotate', () => {
    test('should rotate 90 degrees counterclockwise', () => {
      const p = new Point(1, 0);
      const rotated = p.rotate(Math.PI / 2);
      expect(rotated.x).toBeCloseTo(0, 10);
      expect(rotated.y).toBeCloseTo(1, 10);
    });

    test('should rotate 180 degrees', () => {
      const p = new Point(1, 0);
      const rotated = p.rotate(Math.PI);
      expect(rotated.x).toBeCloseTo(-1, 10);
      expect(rotated.y).toBeCloseTo(0, 10);
    });

    test('should rotate 360 degrees to original position', () => {
      const p = new Point(3, 4);
      const rotated = p.rotate(2 * Math.PI);
      expect(rotated.x).toBeCloseTo(p.x, 10);
      expect(rotated.y).toBeCloseTo(p.y, 10);
    });
  });

  describe('rotateAround', () => {
    test('should rotate around a custom center', () => {
      const p = new Point(2, 0);
      const center = new Point(1, 0);
      const rotated = p.rotateAround(Math.PI / 2, center);
      expect(rotated.x).toBeCloseTo(1, 10);
      expect(rotated.y).toBeCloseTo(1, 10);
    });

    test('should not change the point when rotating around itself', () => {
      const p = new Point(3, 4);
      const rotated = p.rotateAround(Math.PI / 2, p);
      expect(rotated.x).toBeCloseTo(p.x, 10);
      expect(rotated.y).toBeCloseTo(p.y, 10);
    });
  });

  describe('reflectX', () => {
    test('should reflect across x-axis', () => {
      const p = new Point(3, 4);
      const reflected = p.reflectX();
      expect(reflected.x).toBe(3);
      expect(reflected.y).toBe(-4);
    });
  });

  describe('reflectY', () => {
    test('should reflect across y-axis', () => {
      const p = new Point(3, 4);
      const reflected = p.reflectY();
      expect(reflected.x).toBe(-3);
      expect(reflected.y).toBe(4);
    });
  });

  describe('reflectOrigin', () => {
    test('should reflect across origin', () => {
      const p = new Point(3, 4);
      const reflected = p.reflectOrigin();
      expect(reflected.x).toBe(-3);
      expect(reflected.y).toBe(-4);
    });
  });

  describe('reflectAcrossLine', () => {
    test('should reflect across y = x', () => {
      const p = new Point(3, 1);
      const reflected = p.reflectAcrossLine(1, 0); // y = x
      expect(reflected.x).toBeCloseTo(1, 10);
      expect(reflected.y).toBeCloseTo(3, 10);
    });

    test('should reflect across horizontal line y = 2', () => {
      const p = new Point(1, 1);
      const reflected = p.reflectAcrossLine(0, 2); // y = 2
      expect(reflected.x).toBeCloseTo(1, 10);
      expect(reflected.y).toBeCloseTo(3, 10);
    });
  });

  describe('toPolar and fromPolar', () => {
    test('should convert to polar coordinates', () => {
      const p = new Point(1, 1);
      const [r, theta] = p.toPolar();
      expect(r).toBeCloseTo(Math.sqrt(2), 10);
      expect(theta).toBeCloseTo(Math.PI / 4, 10);
    });

    test('should convert from polar coordinates', () => {
      const p = Point.fromPolar(1, Math.PI / 2);
      expect(p.x).toBeCloseTo(0, 10);
      expect(p.y).toBeCloseTo(1, 10);
    });

    test('should round-trip convert', () => {
      const original = new Point(3, 4);
      const [r, theta] = original.toPolar();
      const converted = Point.fromPolar(r, theta);
      expect(converted.x).toBeCloseTo(original.x, 10);
      expect(converted.y).toBeCloseTo(original.y, 10);
    });
  });

  describe('add', () => {
    test('should add two points', () => {
      const p1 = new Point(1, 2);
      const p2 = new Point(3, 4);
      const sum = p1.add(p2);
      expect(sum.x).toBe(4);
      expect(sum.y).toBe(6);
    });
  });

  describe('subtract', () => {
    test('should subtract two points', () => {
      const p1 = new Point(3, 4);
      const p2 = new Point(1, 2);
      const diff = p1.subtract(p2);
      expect(diff.x).toBe(2);
      expect(diff.y).toBe(2);
    });
  });

  describe('scale', () => {
    test('should scale by a factor', () => {
      const p = new Point(2, 3);
      const scaled = p.scale(2);
      expect(scaled.x).toBe(4);
      expect(scaled.y).toBe(6);
    });

    test('should handle negative scaling', () => {
      const p = new Point(2, 3);
      const scaled = p.scale(-1);
      expect(scaled.x).toBe(-2);
      expect(scaled.y).toBe(-3);
    });
  });

  describe('dot', () => {
    test('should calculate dot product', () => {
      const p1 = new Point(1, 2);
      const p2 = new Point(3, 4);
      expect(p1.dot(p2)).toBe(11); // 1*3 + 2*4 = 11
    });

    test('should be 0 for perpendicular vectors', () => {
      const p1 = new Point(1, 0);
      const p2 = new Point(0, 1);
      expect(p1.dot(p2)).toBe(0);
    });
  });

  describe('cross', () => {
    test('should calculate cross product magnitude', () => {
      const p1 = new Point(1, 0);
      const p2 = new Point(0, 1);
      expect(p1.cross(p2)).toBe(1);
    });

    test('should be negative for clockwise orientation', () => {
      const p1 = new Point(0, 1);
      const p2 = new Point(1, 0);
      expect(p1.cross(p2)).toBe(-1);
    });

    test('should be 0 for parallel vectors', () => {
      const p1 = new Point(2, 4);
      const p2 = new Point(1, 2);
      expect(p1.cross(p2)).toBe(0);
    });
  });

  describe('magnitude', () => {
    test('should calculate magnitude', () => {
      const p = new Point(3, 4);
      expect(p.magnitude()).toBe(5);
    });

    test('should be 0 for origin', () => {
      const p = new Point(0, 0);
      expect(p.magnitude()).toBe(0);
    });
  });

  describe('normalize', () => {
    test('should create unit vector', () => {
      const p = new Point(3, 4);
      const normalized = p.normalize();
      expect(normalized.magnitude()).toBeCloseTo(1, 10);
      expect(normalized.x).toBeCloseTo(0.6, 10);
      expect(normalized.y).toBeCloseTo(0.8, 10);
    });

    test('should throw error for zero vector', () => {
      const p = new Point(0, 0);
      expect(() => p.normalize()).toThrow('Cannot normalize a zero-length vector');
    });
  });

  describe('lerp', () => {
    test('should interpolate at t=0', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(10, 10);
      const result = p1.lerp(p2, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    test('should interpolate at t=1', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(10, 10);
      const result = p1.lerp(p2, 1);
      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
    });

    test('should interpolate at t=0.5', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(10, 10);
      const result = p1.lerp(p2, 0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });
  });

  describe('equals', () => {
    test('should return true for equal points', () => {
      const p1 = new Point(1, 2);
      const p2 = new Point(1, 2);
      expect(p1.equals(p2)).toBe(true);
    });

    test('should return false for different points', () => {
      const p1 = new Point(1, 2);
      const p2 = new Point(3, 4);
      expect(p1.equals(p2)).toBe(false);
    });

    test('should handle floating point precision', () => {
      const p1 = new Point(1, 2);
      const p2 = new Point(1 + 1e-11, 2 + 1e-11);
      expect(p1.equals(p2)).toBe(true);
    });
  });

  describe('clone', () => {
    test('should create a copy', () => {
      const p1 = new Point(3, 4);
      const p2 = p1.clone();
      expect(p2.x).toBe(p1.x);
      expect(p2.y).toBe(p1.y);
      expect(p2).not.toBe(p1);
    });
  });

  describe('toArray and fromArray', () => {
    test('should convert to array', () => {
      const p = new Point(3, 4);
      const arr = p.toArray();
      expect(arr).toEqual([3, 4]);
    });

    test('should create from array', () => {
      const p = Point.fromArray([3, 4]);
      expect(p.x).toBe(3);
      expect(p.y).toBe(4);
    });
  });

  describe('angle', () => {
    test('should calculate angle for positive x-axis', () => {
      const p = new Point(1, 0);
      expect(p.angle()).toBe(0);
    });

    test('should calculate angle for positive y-axis', () => {
      const p = new Point(0, 1);
      expect(p.angle()).toBeCloseTo(Math.PI / 2, 10);
    });

    test('should calculate angle for negative x-axis', () => {
      const p = new Point(-1, 0);
      expect(Math.abs(p.angle())).toBeCloseTo(Math.PI, 10);
    });
  });

  describe('angleTo', () => {
    test('should calculate angle between two points', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(1, 1);
      expect(p1.angleTo(p2)).toBeCloseTo(Math.PI / 4, 10);
    });
  });

  describe('projectOnto', () => {
    test('should project onto another vector', () => {
      const p = new Point(3, 4);
      const onto = new Point(1, 0);
      const projected = p.projectOnto(onto);
      expect(projected.x).toBeCloseTo(3, 10);
      expect(projected.y).toBeCloseTo(0, 10);
    });

    test('should throw error for zero vector', () => {
      const p = new Point(1, 2);
      const onto = new Point(0, 0);
      expect(() => p.projectOnto(onto)).toThrow('Cannot project onto a zero-length vector');
    });
  });

  describe('toString', () => {
    test('should convert to string', () => {
      const p = new Point(3, 4);
      expect(p.toString()).toBe('Point(3, 4)');
    });
  });
});
