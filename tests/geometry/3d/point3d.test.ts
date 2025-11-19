import { Point3D } from '../../../src/geometry/3d/point3d';

describe('Point3D', () => {
  describe('constructor', () => {
    it('should create a point with given coordinates', () => {
      const p = new Point3D(1, 2, 3);
      expect(p.x).toBe(1);
      expect(p.y).toBe(2);
      expect(p.z).toBe(3);
    });
  });

  describe('distanceTo', () => {
    it('should calculate Euclidean distance', () => {
      const p1 = new Point3D(0, 0, 0);
      const p2 = new Point3D(3, 4, 0);
      expect(p1.distanceTo(p2)).toBe(5);
    });

    it('should calculate 3D distance', () => {
      const p1 = new Point3D(0, 0, 0);
      const p2 = new Point3D(1, 1, 1);
      expect(p1.distanceTo(p2)).toBeCloseTo(Math.sqrt(3));
    });
  });

  describe('distanceSquaredTo', () => {
    it('should calculate squared distance', () => {
      const p1 = new Point3D(0, 0, 0);
      const p2 = new Point3D(3, 4, 0);
      expect(p1.distanceSquaredTo(p2)).toBe(25);
    });
  });

  describe('manhattanDistanceTo', () => {
    it('should calculate Manhattan distance', () => {
      const p1 = new Point3D(0, 0, 0);
      const p2 = new Point3D(3, 4, 5);
      expect(p1.manhattanDistanceTo(p2)).toBe(12);
    });
  });

  describe('midpoint', () => {
    it('should find the midpoint', () => {
      const p1 = new Point3D(0, 0, 0);
      const p2 = new Point3D(4, 6, 8);
      const mid = p1.midpoint(p2);
      expect(mid.x).toBe(2);
      expect(mid.y).toBe(3);
      expect(mid.z).toBe(4);
    });
  });

  describe('add', () => {
    it('should add two points', () => {
      const p1 = new Point3D(1, 2, 3);
      const p2 = new Point3D(4, 5, 6);
      const sum = p1.add(p2);
      expect(sum.x).toBe(5);
      expect(sum.y).toBe(7);
      expect(sum.z).toBe(9);
    });
  });

  describe('subtract', () => {
    it('should subtract two points', () => {
      const p1 = new Point3D(5, 7, 9);
      const p2 = new Point3D(1, 2, 3);
      const diff = p1.subtract(p2);
      expect(diff.x).toBe(4);
      expect(diff.y).toBe(5);
      expect(diff.z).toBe(6);
    });
  });

  describe('scale', () => {
    it('should scale by a scalar', () => {
      const p = new Point3D(1, 2, 3);
      const scaled = p.scale(2);
      expect(scaled.x).toBe(2);
      expect(scaled.y).toBe(4);
      expect(scaled.z).toBe(6);
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude', () => {
      const p = new Point3D(3, 4, 0);
      expect(p.magnitude()).toBe(5);
    });
  });

  describe('normalize', () => {
    it('should normalize to unit length', () => {
      const p = new Point3D(3, 4, 0);
      const normalized = p.normalize();
      expect(normalized.magnitude()).toBeCloseTo(1);
      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
    });

    it('should handle zero vector', () => {
      const p = new Point3D(0, 0, 0);
      const normalized = p.normalize();
      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
      expect(normalized.z).toBe(0);
    });
  });

  describe('dot', () => {
    it('should calculate dot product', () => {
      const p1 = new Point3D(1, 2, 3);
      const p2 = new Point3D(4, 5, 6);
      expect(p1.dot(p2)).toBe(32); // 1*4 + 2*5 + 3*6
    });

    it('should be zero for perpendicular vectors', () => {
      const p1 = new Point3D(1, 0, 0);
      const p2 = new Point3D(0, 1, 0);
      expect(p1.dot(p2)).toBe(0);
    });
  });

  describe('cross', () => {
    it('should calculate cross product', () => {
      const p1 = new Point3D(1, 0, 0);
      const p2 = new Point3D(0, 1, 0);
      const cross = p1.cross(p2);
      expect(cross.x).toBeCloseTo(0);
      expect(cross.y).toBeCloseTo(0);
      expect(cross.z).toBeCloseTo(1);
    });

    it('should be anti-commutative', () => {
      const p1 = new Point3D(1, 2, 3);
      const p2 = new Point3D(4, 5, 6);
      const cross1 = p1.cross(p2);
      const cross2 = p2.cross(p1);
      expect(cross1.x).toBeCloseTo(-cross2.x);
      expect(cross1.y).toBeCloseTo(-cross2.y);
      expect(cross1.z).toBeCloseTo(-cross2.z);
    });
  });

  describe('angleTo', () => {
    it('should calculate angle between vectors', () => {
      const p1 = new Point3D(1, 0, 0);
      const p2 = new Point3D(0, 1, 0);
      expect(p1.angleTo(p2)).toBeCloseTo(Math.PI / 2);
    });

    it('should return 0 for parallel vectors', () => {
      const p1 = new Point3D(1, 0, 0);
      const p2 = new Point3D(2, 0, 0);
      expect(p1.angleTo(p2)).toBeCloseTo(0);
    });
  });

  describe('lerp', () => {
    it('should interpolate between points', () => {
      const p1 = new Point3D(0, 0, 0);
      const p2 = new Point3D(10, 10, 10);
      const mid = p1.lerp(p2, 0.5);
      expect(mid.x).toBe(5);
      expect(mid.y).toBe(5);
      expect(mid.z).toBe(5);
    });
  });

  describe('rotateX', () => {
    it('should rotate around X axis', () => {
      const p = new Point3D(0, 1, 0);
      const rotated = p.rotateX(Math.PI / 2);
      expect(rotated.x).toBeCloseTo(0);
      expect(rotated.y).toBeCloseTo(0);
      expect(rotated.z).toBeCloseTo(1);
    });
  });

  describe('rotateY', () => {
    it('should rotate around Y axis', () => {
      const p = new Point3D(1, 0, 0);
      const rotated = p.rotateY(Math.PI / 2);
      expect(rotated.x).toBeCloseTo(0);
      expect(rotated.y).toBeCloseTo(0);
      expect(rotated.z).toBeCloseTo(-1);
    });
  });

  describe('rotateZ', () => {
    it('should rotate around Z axis', () => {
      const p = new Point3D(1, 0, 0);
      const rotated = p.rotateZ(Math.PI / 2);
      expect(rotated.x).toBeCloseTo(0);
      expect(rotated.y).toBeCloseTo(1);
      expect(rotated.z).toBeCloseTo(0);
    });
  });

  describe('fromSpherical', () => {
    it('should convert from spherical coordinates', () => {
      const p = Point3D.fromSpherical(1, Math.PI / 2, 0);
      expect(p.x).toBeCloseTo(1);
      expect(p.y).toBeCloseTo(0);
      expect(p.z).toBeCloseTo(0);
    });
  });

  describe('toSpherical', () => {
    it('should convert to spherical coordinates', () => {
      const p = new Point3D(1, 0, 0);
      const spherical = p.toSpherical();
      expect(spherical.r).toBeCloseTo(1);
      expect(spherical.theta).toBeCloseTo(Math.PI / 2);
      expect(spherical.phi).toBeCloseTo(0);
    });
  });

  describe('equals', () => {
    it('should compare points with epsilon', () => {
      const p1 = new Point3D(1, 2, 3);
      const p2 = new Point3D(1.0000001, 2.0000001, 3.0000001);
      expect(p1.equals(p2, 0.001)).toBe(true);
      expect(p1.equals(p2, 0.0000001)).toBe(false);
    });
  });

  describe('static factory methods', () => {
    it('should create origin', () => {
      const origin = Point3D.origin();
      expect(origin.x).toBe(0);
      expect(origin.y).toBe(0);
      expect(origin.z).toBe(0);
    });

    it('should create unit vectors', () => {
      const ux = Point3D.unitX();
      expect(ux.x).toBe(1);
      expect(ux.y).toBe(0);
      expect(ux.z).toBe(0);

      const uy = Point3D.unitY();
      expect(uy.x).toBe(0);
      expect(uy.y).toBe(1);
      expect(uy.z).toBe(0);

      const uz = Point3D.unitZ();
      expect(uz.x).toBe(0);
      expect(uz.y).toBe(0);
      expect(uz.z).toBe(1);
    });
  });
});
