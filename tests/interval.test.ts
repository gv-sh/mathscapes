import { Interval, BoundaryType } from '../src/core/interval';

describe('Interval', () => {
  describe('Construction', () => {
    test('creates closed interval', () => {
      const interval = Interval.closed(1, 5);
      expect(interval.lower).toBe(1);
      expect(interval.upper).toBe(5);
      expect(interval.type).toBe(BoundaryType.CLOSED);
    });

    test('creates open interval', () => {
      const interval = Interval.open(1, 5);
      expect(interval.type).toBe(BoundaryType.OPEN);
    });

    test('creates left-open interval', () => {
      const interval = Interval.leftOpen(1, 5);
      expect(interval.type).toBe(BoundaryType.LEFT_OPEN);
    });

    test('creates right-open interval', () => {
      const interval = Interval.rightOpen(1, 5);
      expect(interval.type).toBe(BoundaryType.RIGHT_OPEN);
    });

    test('throws error if lower > upper', () => {
      expect(() => new Interval(5, 1)).toThrow();
    });

    test('allows lower = upper for closed interval', () => {
      const interval = Interval.closed(5, 5);
      expect(interval.lower).toBe(5);
      expect(interval.upper).toBe(5);
    });
  });

  describe('Boundary Checking', () => {
    test('checks if lower bound is included', () => {
      expect(Interval.closed(1, 5).isLowerIncluded()).toBe(true);
      expect(Interval.open(1, 5).isLowerIncluded()).toBe(false);
      expect(Interval.leftOpen(1, 5).isLowerIncluded()).toBe(false);
      expect(Interval.rightOpen(1, 5).isLowerIncluded()).toBe(true);
    });

    test('checks if upper bound is included', () => {
      expect(Interval.closed(1, 5).isUpperIncluded()).toBe(true);
      expect(Interval.open(1, 5).isUpperIncluded()).toBe(false);
      expect(Interval.leftOpen(1, 5).isUpperIncluded()).toBe(true);
      expect(Interval.rightOpen(1, 5).isUpperIncluded()).toBe(false);
    });
  });

  describe('Properties', () => {
    test('computes width', () => {
      const interval = Interval.closed(1, 5);
      expect(interval.width()).toBe(4);
    });

    test('computes midpoint', () => {
      const interval = Interval.closed(1, 5);
      expect(interval.midpoint()).toBe(3);
    });

    test('checks if empty', () => {
      expect(Interval.open(5, 5).isEmpty()).toBe(true);
      expect(Interval.closed(5, 5).isEmpty()).toBe(false);
    });
  });

  describe('Contains', () => {
    test('closed interval contains endpoints', () => {
      const interval = Interval.closed(1, 5);
      expect(interval.contains(1)).toBe(true);
      expect(interval.contains(5)).toBe(true);
      expect(interval.contains(3)).toBe(true);
      expect(interval.contains(0)).toBe(false);
      expect(interval.contains(6)).toBe(false);
    });

    test('open interval excludes endpoints', () => {
      const interval = Interval.open(1, 5);
      expect(interval.contains(1)).toBe(false);
      expect(interval.contains(5)).toBe(false);
      expect(interval.contains(3)).toBe(true);
    });

    test('left-open interval', () => {
      const interval = Interval.leftOpen(1, 5);
      expect(interval.contains(1)).toBe(false);
      expect(interval.contains(5)).toBe(true);
      expect(interval.contains(3)).toBe(true);
    });

    test('right-open interval', () => {
      const interval = Interval.rightOpen(1, 5);
      expect(interval.contains(1)).toBe(true);
      expect(interval.contains(5)).toBe(false);
      expect(interval.contains(3)).toBe(true);
    });
  });

  describe('Contains Interval', () => {
    test('interval contains itself', () => {
      const interval = Interval.closed(1, 5);
      expect(interval.containsInterval(interval)).toBe(true);
    });

    test('larger interval contains smaller', () => {
      const large = Interval.closed(1, 5);
      const small = Interval.closed(2, 4);
      expect(large.containsInterval(small)).toBe(true);
      expect(small.containsInterval(large)).toBe(false);
    });

    test('boundary types matter for containment', () => {
      const closed = Interval.closed(1, 5);
      const open = Interval.open(1, 5);
      expect(closed.containsInterval(open)).toBe(true);
      expect(open.containsInterval(closed)).toBe(false);
    });
  });

  describe('Overlaps', () => {
    test('overlapping intervals', () => {
      const a = Interval.closed(1, 5);
      const b = Interval.closed(3, 7);
      expect(a.overlaps(b)).toBe(true);
      expect(b.overlaps(a)).toBe(true);
    });

    test('non-overlapping intervals', () => {
      const a = Interval.closed(1, 3);
      const b = Interval.closed(4, 7);
      expect(a.overlaps(b)).toBe(false);
    });

    test('touching intervals with open/closed boundaries', () => {
      const a = Interval.rightOpen(1, 3);
      const b = Interval.closed(3, 5);
      expect(a.overlaps(b)).toBe(false);
    });

    test('touching intervals with closed boundaries', () => {
      const a = Interval.closed(1, 3);
      const b = Interval.closed(3, 5);
      expect(a.overlaps(b)).toBe(true);
    });
  });

  describe('Intersection', () => {
    test('intersection of overlapping intervals', () => {
      const a = Interval.closed(1, 5);
      const b = Interval.closed(3, 7);
      const result = a.intersection(b);
      expect(result).not.toBeNull();
      expect(result!.lower).toBe(3);
      expect(result!.upper).toBe(5);
    });

    test('intersection of non-overlapping intervals', () => {
      const a = Interval.closed(1, 3);
      const b = Interval.closed(4, 7);
      const result = a.intersection(b);
      expect(result).toBeNull();
    });

    test('intersection respects boundary types', () => {
      const a = Interval.closed(1, 5);
      const b = Interval.open(3, 7);
      const result = a.intersection(b);
      expect(result).not.toBeNull();
      expect(result!.type).toBe(BoundaryType.LEFT_OPEN);
    });

    test('intersection at single point', () => {
      const a = Interval.closed(1, 3);
      const b = Interval.closed(3, 5);
      const result = a.intersection(b);
      expect(result).not.toBeNull();
      expect(result!.lower).toBe(3);
      expect(result!.upper).toBe(3);
    });

    test('intersection at single point with open boundary', () => {
      const a = Interval.rightOpen(1, 3);
      const b = Interval.closed(3, 5);
      const result = a.intersection(b);
      expect(result).toBeNull(); // no overlap
    });
  });

  describe('Union', () => {
    test('union of overlapping intervals', () => {
      const a = Interval.closed(1, 5);
      const b = Interval.closed(3, 7);
      const result = a.union(b);
      expect(result).not.toBeNull();
      expect(result!.lower).toBe(1);
      expect(result!.upper).toBe(7);
    });

    test('union of disjoint intervals', () => {
      const a = Interval.closed(1, 3);
      const b = Interval.closed(5, 7);
      const result = a.union(b);
      expect(result).toBeNull(); // cannot form single interval
    });

    test('union of adjacent intervals', () => {
      const a = Interval.closed(1, 3);
      const b = Interval.closed(3, 5);
      const result = a.union(b);
      expect(result).not.toBeNull();
      expect(result!.lower).toBe(1);
      expect(result!.upper).toBe(5);
    });

    test('union respects boundary types', () => {
      const a = Interval.open(1, 5);
      const b = Interval.closed(3, 7);
      const result = a.union(b);
      expect(result).not.toBeNull();
      expect(result!.isLowerIncluded()).toBe(false);
      expect(result!.isUpperIncluded()).toBe(true);
    });
  });

  describe('Adjacent', () => {
    test('intervals are adjacent when they share boundary', () => {
      const a = Interval.closed(1, 3);
      const b = Interval.closed(3, 5);
      expect(a.isAdjacentTo(b)).toBe(true);
    });

    test('intervals with open boundaries are not adjacent', () => {
      const a = Interval.rightOpen(1, 3);
      const b = Interval.leftOpen(3, 5);
      expect(a.isAdjacentTo(b)).toBe(false);
    });

    test('overlapping intervals are not adjacent', () => {
      const a = Interval.closed(1, 4);
      const b = Interval.closed(3, 5);
      expect(a.isAdjacentTo(b)).toBe(false);
    });
  });

  describe('Equality', () => {
    test('equal intervals', () => {
      const a = Interval.closed(1, 5);
      const b = Interval.closed(1, 5);
      expect(a.equals(b)).toBe(true);
    });

    test('different bounds', () => {
      const a = Interval.closed(1, 5);
      const b = Interval.closed(1, 6);
      expect(a.equals(b)).toBe(false);
    });

    test('different boundary types', () => {
      const a = Interval.closed(1, 5);
      const b = Interval.open(1, 5);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('Arithmetic Operations', () => {
    test('adds intervals', () => {
      const a = Interval.closed(1, 2);
      const b = Interval.closed(3, 4);
      const result = a.add(b);
      expect(result.lower).toBe(4); // 1 + 3
      expect(result.upper).toBe(6); // 2 + 4
    });

    test('subtracts intervals', () => {
      const a = Interval.closed(5, 10);
      const b = Interval.closed(1, 3);
      const result = a.subtract(b);
      expect(result.lower).toBe(2); // 5 - 3
      expect(result.upper).toBe(9); // 10 - 1
    });

    test('multiplies intervals', () => {
      const a = Interval.closed(2, 3);
      const b = Interval.closed(4, 5);
      const result = a.multiply(b);
      expect(result.lower).toBe(8); // 2 * 4
      expect(result.upper).toBe(15); // 3 * 5
    });

    test('multiplies intervals with negative values', () => {
      const a = Interval.closed(-2, 3);
      const b = Interval.closed(1, 2);
      const result = a.multiply(b);
      expect(result.lower).toBe(-4); // -2 * 2
      expect(result.upper).toBe(6);  // 3 * 2
    });

    test('divides intervals', () => {
      const a = Interval.closed(6, 12);
      const b = Interval.closed(2, 3);
      const result = a.divide(b);
      expect(result.lower).toBe(2); // 6 / 3
      expect(result.upper).toBe(6); // 12 / 2
    });

    test('throws error when dividing by interval containing zero', () => {
      const a = Interval.closed(1, 5);
      const b = Interval.closed(-1, 1);
      expect(() => a.divide(b)).toThrow();
    });

    test('scales interval by positive scalar', () => {
      const interval = Interval.closed(1, 5);
      const result = interval.scale(2);
      expect(result.lower).toBe(2);
      expect(result.upper).toBe(10);
    });

    test('scales interval by negative scalar', () => {
      const interval = Interval.closed(1, 5);
      const result = interval.scale(-1);
      expect(result.lower).toBe(-5);
      expect(result.upper).toBe(-1);
    });
  });

  describe('Absolute Value', () => {
    test('abs of positive interval', () => {
      const interval = Interval.closed(2, 5);
      const result = interval.abs();
      expect(result.lower).toBe(2);
      expect(result.upper).toBe(5);
    });

    test('abs of negative interval', () => {
      const interval = Interval.closed(-5, -2);
      const result = interval.abs();
      expect(result.lower).toBe(2);
      expect(result.upper).toBe(5);
    });

    test('abs of interval containing zero', () => {
      const interval = Interval.closed(-3, 5);
      const result = interval.abs();
      expect(result.lower).toBe(0);
      expect(result.upper).toBe(5);
    });
  });

  describe('Utility Methods', () => {
    test('clones interval', () => {
      const interval = Interval.closed(1, 5);
      const clone = interval.clone();
      expect(clone.equals(interval)).toBe(true);
    });

    test('toString returns string representation', () => {
      expect(Interval.closed(1, 5).toString()).toBe('[1, 5]');
      expect(Interval.open(1, 5).toString()).toBe('(1, 5)');
      expect(Interval.leftOpen(1, 5).toString()).toBe('(1, 5]');
      expect(Interval.rightOpen(1, 5).toString()).toBe('[1, 5)');
    });

    test('toArray returns bounds as array', () => {
      const interval = Interval.closed(1, 5);
      expect(interval.toArray()).toEqual([1, 5]);
    });
  });
});
