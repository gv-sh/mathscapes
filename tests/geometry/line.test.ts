import { Point } from '../../src/geometry/point';
import { Line, Segment } from '../../src/geometry/line';

describe('Line', () => {
  describe('constructor', () => {
    test('should create a line from two points', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(1, 1);
      const line = new Line(p1, p2);
      expect(line.p1).toBe(p1);
      expect(line.p2).toBe(p2);
    });

    test('should throw error for identical points', () => {
      const p = new Point(1, 1);
      expect(() => new Line(p, p)).toThrow('Cannot create a line from two identical points');
    });
  });

  describe('fromSlopeIntercept', () => {
    test('should create line from y = mx + b', () => {
      const line = Line.fromSlopeIntercept(2, 3); // y = 2x + 3
      expect(line.slope()).toBeCloseTo(2, 10);
      expect(line.yIntercept()).toBeCloseTo(3, 10);
    });

    test('should create horizontal line', () => {
      const line = Line.fromSlopeIntercept(0, 5); // y = 5
      expect(line.slope()).toBe(0);
      expect(line.yIntercept()).toBe(5);
    });
  });

  describe('fromPointSlope', () => {
    test('should create line from point and slope', () => {
      const point = new Point(1, 2);
      const line = Line.fromPointSlope(point, 3);
      expect(line.slope()).toBeCloseTo(3, 10);
      expect(line.contains(point)).toBe(true);
    });
  });

  describe('fromGeneralForm', () => {
    test('should create line from ax + by + c = 0', () => {
      const line = Line.fromGeneralForm(1, -1, 0); // x - y = 0 => y = x
      expect(line.slope()).toBeCloseTo(1, 10);
      expect(line.yIntercept()).toBeCloseTo(0, 10);
    });

    test('should create vertical line', () => {
      const line = Line.fromGeneralForm(1, 0, -5); // x = 5
      expect(line.slope()).toBe(Infinity);
      expect(line.xIntercept()).toBe(5);
    });

    test('should throw error for invalid coefficients', () => {
      expect(() => Line.fromGeneralForm(0, 0, 1)).toThrow('Invalid line equation');
    });
  });

  describe('slope', () => {
    test('should calculate slope for diagonal line', () => {
      const line = new Line(new Point(0, 0), new Point(2, 4));
      expect(line.slope()).toBe(2);
    });

    test('should return Infinity for vertical line', () => {
      const line = new Line(new Point(1, 0), new Point(1, 5));
      expect(line.slope()).toBe(Infinity);
    });

    test('should return 0 for horizontal line', () => {
      const line = new Line(new Point(0, 1), new Point(5, 1));
      expect(line.slope()).toBe(0);
    });
  });

  describe('yIntercept', () => {
    test('should calculate y-intercept', () => {
      const line = new Line(new Point(0, 3), new Point(1, 5));
      expect(line.yIntercept()).toBeCloseTo(3, 10);
    });

    test('should return null for vertical line', () => {
      const line = new Line(new Point(1, 0), new Point(1, 5));
      expect(line.yIntercept()).toBe(null);
    });
  });

  describe('xIntercept', () => {
    test('should calculate x-intercept', () => {
      const line = new Line(new Point(3, 0), new Point(0, 3)); // y = -x + 3
      expect(line.xIntercept()).toBeCloseTo(3, 10);
    });

    test('should return null for horizontal line', () => {
      const line = new Line(new Point(0, 1), new Point(5, 1));
      expect(line.xIntercept()).toBe(null);
    });

    test('should return x value for vertical line', () => {
      const line = new Line(new Point(5, 0), new Point(5, 1));
      expect(line.xIntercept()).toBe(5);
    });
  });

  describe('generalForm', () => {
    test('should return general form coefficients', () => {
      const line = Line.fromSlopeIntercept(2, -3); // y = 2x - 3 => 2x - y - 3 = 0
      const [a, b, c] = line.generalForm();

      // Check that the line equation is satisfied
      const testPoint = new Point(0, -3);
      expect(Math.abs(a * testPoint.x + b * testPoint.y + c)).toBeCloseTo(0, 10);
    });
  });

  describe('isParallelTo', () => {
    test('should detect parallel lines', () => {
      const line1 = Line.fromSlopeIntercept(2, 1);
      const line2 = Line.fromSlopeIntercept(2, 5);
      expect(line1.isParallelTo(line2)).toBe(true);
    });

    test('should detect non-parallel lines', () => {
      const line1 = Line.fromSlopeIntercept(2, 1);
      const line2 = Line.fromSlopeIntercept(3, 1);
      expect(line1.isParallelTo(line2)).toBe(false);
    });

    test('should detect parallel vertical lines', () => {
      const line1 = new Line(new Point(1, 0), new Point(1, 5));
      const line2 = new Line(new Point(2, 0), new Point(2, 5));
      expect(line1.isParallelTo(line2)).toBe(true);
    });
  });

  describe('isPerpendicularTo', () => {
    test('should detect perpendicular lines', () => {
      const line1 = Line.fromSlopeIntercept(2, 1);
      const line2 = Line.fromSlopeIntercept(-0.5, 1);
      expect(line1.isPerpendicularTo(line2)).toBe(true);
    });

    test('should detect vertical and horizontal perpendicular', () => {
      const vertical = new Line(new Point(1, 0), new Point(1, 5));
      const horizontal = new Line(new Point(0, 1), new Point(5, 1));
      expect(vertical.isPerpendicularTo(horizontal)).toBe(true);
    });

    test('should detect non-perpendicular lines', () => {
      const line1 = Line.fromSlopeIntercept(2, 1);
      const line2 = Line.fromSlopeIntercept(3, 1);
      expect(line1.isPerpendicularTo(line2)).toBe(false);
    });
  });

  describe('intersect', () => {
    test('should find intersection of non-parallel lines', () => {
      const line1 = Line.fromSlopeIntercept(1, 0); // y = x
      const line2 = Line.fromSlopeIntercept(-1, 2); // y = -x + 2
      const intersection = line1.intersect(line2);

      expect(intersection).not.toBe(null);
      expect(intersection!.x).toBeCloseTo(1, 10);
      expect(intersection!.y).toBeCloseTo(1, 10);
    });

    test('should return null for parallel lines', () => {
      const line1 = Line.fromSlopeIntercept(2, 1);
      const line2 = Line.fromSlopeIntercept(2, 5);
      expect(line1.intersect(line2)).toBe(null);
    });

    test('should handle vertical line intersection', () => {
      const vertical = new Line(new Point(3, 0), new Point(3, 5));
      const diagonal = Line.fromSlopeIntercept(1, 0); // y = x
      const intersection = vertical.intersect(diagonal);

      expect(intersection).not.toBe(null);
      expect(intersection!.x).toBeCloseTo(3, 10);
      expect(intersection!.y).toBeCloseTo(3, 10);
    });
  });

  describe('distanceToPoint', () => {
    test('should calculate distance from point to line', () => {
      const line = Line.fromSlopeIntercept(0, 0); // y = 0 (x-axis)
      const point = new Point(5, 3);
      expect(line.distanceToPoint(point)).toBeCloseTo(3, 10);
    });

    test('should return 0 for point on line', () => {
      const line = Line.fromSlopeIntercept(1, 0); // y = x
      const point = new Point(5, 5);
      expect(line.distanceToPoint(point)).toBeCloseTo(0, 10);
    });

    test('should handle vertical line', () => {
      const line = new Line(new Point(2, 0), new Point(2, 5));
      const point = new Point(5, 3);
      expect(line.distanceToPoint(point)).toBeCloseTo(3, 10);
    });
  });

  describe('closestPoint', () => {
    test('should find closest point on horizontal line', () => {
      const line = Line.fromSlopeIntercept(0, 2); // y = 2
      const point = new Point(5, 10);
      const closest = line.closestPoint(point);

      expect(closest.x).toBeCloseTo(5, 10);
      expect(closest.y).toBeCloseTo(2, 10);
    });

    test('should find closest point on vertical line', () => {
      const line = new Line(new Point(3, 0), new Point(3, 5));
      const point = new Point(10, 7);
      const closest = line.closestPoint(point);

      expect(closest.x).toBeCloseTo(3, 10);
      expect(closest.y).toBeCloseTo(7, 10);
    });

    test('should find closest point on diagonal line', () => {
      const line = Line.fromSlopeIntercept(1, 0); // y = x
      const point = new Point(0, 2);
      const closest = line.closestPoint(point);

      expect(closest.x).toBeCloseTo(1, 10);
      expect(closest.y).toBeCloseTo(1, 10);
    });
  });

  describe('contains', () => {
    test('should return true for point on line', () => {
      const line = Line.fromSlopeIntercept(2, 3);
      const point = new Point(1, 5); // y = 2(1) + 3 = 5
      expect(line.contains(point)).toBe(true);
    });

    test('should return false for point not on line', () => {
      const line = Line.fromSlopeIntercept(2, 3);
      const point = new Point(1, 10);
      expect(line.contains(point)).toBe(false);
    });
  });

  describe('direction and normal', () => {
    test('should calculate direction vector', () => {
      const line = new Line(new Point(0, 0), new Point(3, 4));
      const dir = line.direction();
      expect(dir.magnitude()).toBeCloseTo(1, 10);
      expect(dir.x).toBeCloseTo(0.6, 10);
      expect(dir.y).toBeCloseTo(0.8, 10);
    });

    test('should calculate normal vector', () => {
      const line = new Line(new Point(0, 0), new Point(1, 0));
      const normal = line.normal();
      expect(normal.magnitude()).toBeCloseTo(1, 10);
      expect(normal.x).toBeCloseTo(0, 10);
      expect(normal.y).toBeCloseTo(1, 10);
    });
  });
});

describe('Segment', () => {
  describe('constructor', () => {
    test('should create a segment from two points', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(1, 1);
      const seg = new Segment(p1, p2);
      expect(seg.p1).toBe(p1);
      expect(seg.p2).toBe(p2);
    });

    test('should throw error for identical points', () => {
      const p = new Point(1, 1);
      expect(() => new Segment(p, p)).toThrow('Cannot create a segment from two identical points');
    });
  });

  describe('length', () => {
    test('should calculate segment length', () => {
      const seg = new Segment(new Point(0, 0), new Point(3, 4));
      expect(seg.length()).toBe(5);
    });
  });

  describe('midpoint', () => {
    test('should calculate segment midpoint', () => {
      const seg = new Segment(new Point(0, 0), new Point(4, 6));
      const mid = seg.midpoint();
      expect(mid.x).toBe(2);
      expect(mid.y).toBe(3);
    });
  });

  describe('toLine', () => {
    test('should convert segment to line', () => {
      const seg = new Segment(new Point(0, 0), new Point(1, 2));
      const line = seg.toLine();
      expect(line.slope()).toBeCloseTo(2, 10);
    });
  });

  describe('contains', () => {
    test('should return true for point on segment', () => {
      const seg = new Segment(new Point(0, 0), new Point(4, 4));
      const point = new Point(2, 2);
      expect(seg.contains(point)).toBe(true);
    });

    test('should return false for point on line but outside segment', () => {
      const seg = new Segment(new Point(0, 0), new Point(2, 2));
      const point = new Point(5, 5); // On line y = x, but outside segment
      expect(seg.contains(point)).toBe(false);
    });

    test('should return false for point not on line', () => {
      const seg = new Segment(new Point(0, 0), new Point(2, 2));
      const point = new Point(1, 5);
      expect(seg.contains(point)).toBe(false);
    });

    test('should return true for endpoints', () => {
      const seg = new Segment(new Point(0, 0), new Point(4, 4));
      expect(seg.contains(seg.p1)).toBe(true);
      expect(seg.contains(seg.p2)).toBe(true);
    });
  });

  describe('distanceToPoint', () => {
    test('should calculate distance to point near middle', () => {
      const seg = new Segment(new Point(0, 0), new Point(4, 0));
      const point = new Point(2, 3);
      expect(seg.distanceToPoint(point)).toBeCloseTo(3, 10);
    });

    test('should calculate distance to point beyond endpoint', () => {
      const seg = new Segment(new Point(0, 0), new Point(2, 0));
      const point = new Point(5, 3);
      // Distance to p2 (2, 0) is √((5-2)² + 3²) = √18
      expect(seg.distanceToPoint(point)).toBeCloseTo(Math.sqrt(18), 10);
    });
  });

  describe('closestPoint', () => {
    test('should find closest point in middle of segment', () => {
      const seg = new Segment(new Point(0, 0), new Point(4, 0));
      const point = new Point(2, 5);
      const closest = seg.closestPoint(point);

      expect(closest.x).toBeCloseTo(2, 10);
      expect(closest.y).toBeCloseTo(0, 10);
    });

    test('should return endpoint for point beyond segment', () => {
      const seg = new Segment(new Point(0, 0), new Point(2, 0));
      const point = new Point(5, 5);
      const closest = seg.closestPoint(point);

      expect(closest.x).toBeCloseTo(2, 10);
      expect(closest.y).toBeCloseTo(0, 10);
    });
  });

  describe('intersect', () => {
    test('should find intersection of crossing segments', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(2, 2));
      const seg2 = new Segment(new Point(0, 2), new Point(2, 0));
      const intersection = seg1.intersect(seg2);

      expect(intersection).not.toBe(null);
      expect(intersection!.x).toBeCloseTo(1, 10);
      expect(intersection!.y).toBeCloseTo(1, 10);
    });

    test('should return null for non-intersecting segments', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(1, 1));
      const seg2 = new Segment(new Point(2, 0), new Point(3, 1));
      expect(seg1.intersect(seg2)).toBe(null);
    });

    test('should return null for parallel segments', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(2, 0));
      const seg2 = new Segment(new Point(0, 1), new Point(2, 1));
      expect(seg1.intersect(seg2)).toBe(null);
    });

    test('should handle endpoint intersection', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(1, 1));
      const seg2 = new Segment(new Point(1, 1), new Point(2, 0));
      const intersection = seg1.intersect(seg2);

      expect(intersection).not.toBe(null);
      expect(intersection!.x).toBeCloseTo(1, 10);
      expect(intersection!.y).toBeCloseTo(1, 10);
    });
  });

  describe('intersects', () => {
    test('should return true for intersecting segments', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(2, 2));
      const seg2 = new Segment(new Point(0, 2), new Point(2, 0));
      expect(seg1.intersects(seg2)).toBe(true);
    });

    test('should return false for non-intersecting segments', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(1, 1));
      const seg2 = new Segment(new Point(2, 0), new Point(3, 1));
      expect(seg1.intersects(seg2)).toBe(false);
    });
  });

  describe('intersectsOrientation', () => {
    test('should detect intersection using orientation method', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(2, 2));
      const seg2 = new Segment(new Point(0, 2), new Point(2, 0));
      expect(seg1.intersectsOrientation(seg2)).toBe(true);
    });

    test('should detect no intersection', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(1, 1));
      const seg2 = new Segment(new Point(2, 0), new Point(3, 1));
      expect(seg1.intersectsOrientation(seg2)).toBe(false);
    });

    test('should handle collinear segments that overlap', () => {
      const seg1 = new Segment(new Point(0, 0), new Point(2, 0));
      const seg2 = new Segment(new Point(1, 0), new Point(3, 0));
      expect(seg1.intersectsOrientation(seg2)).toBe(true);
    });
  });

  describe('direction and normal', () => {
    test('should calculate direction vector', () => {
      const seg = new Segment(new Point(0, 0), new Point(3, 4));
      const dir = seg.direction();
      expect(dir.magnitude()).toBeCloseTo(1, 10);
      expect(dir.x).toBeCloseTo(0.6, 10);
      expect(dir.y).toBeCloseTo(0.8, 10);
    });

    test('should calculate normal vector', () => {
      const seg = new Segment(new Point(0, 0), new Point(1, 0));
      const normal = seg.normal();
      expect(normal.magnitude()).toBeCloseTo(1, 10);
    });
  });

  describe('pointAt', () => {
    test('should interpolate at t=0', () => {
      const seg = new Segment(new Point(0, 0), new Point(10, 10));
      const point = seg.pointAt(0);
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
    });

    test('should interpolate at t=1', () => {
      const seg = new Segment(new Point(0, 0), new Point(10, 10));
      const point = seg.pointAt(1);
      expect(point.x).toBe(10);
      expect(point.y).toBe(10);
    });

    test('should interpolate at t=0.5', () => {
      const seg = new Segment(new Point(0, 0), new Point(10, 10));
      const point = seg.pointAt(0.5);
      expect(point.x).toBe(5);
      expect(point.y).toBe(5);
    });
  });

  describe('reverse', () => {
    test('should reverse the segment', () => {
      const seg = new Segment(new Point(1, 2), new Point(3, 4));
      const reversed = seg.reverse();
      expect(reversed.p1.x).toBe(3);
      expect(reversed.p1.y).toBe(4);
      expect(reversed.p2.x).toBe(1);
      expect(reversed.p2.y).toBe(2);
    });
  });
});
