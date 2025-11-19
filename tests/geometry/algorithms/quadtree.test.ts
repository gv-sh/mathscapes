import { Quadtree } from '../../../src/geometry/algorithms/quadtree';
import { Point } from '../../../src/geometry/point';

describe('Quadtree', () => {
  describe('constructor', () => {
    it('should create an empty quadtree', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 });
      expect(qt.size()).toBe(0);
    });
  });

  describe('insert', () => {
    it('should insert points', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 });
      expect(qt.insert(new Point(50, 50), 'center')).toBe(true);
      expect(qt.size()).toBe(1);
    });

    it('should reject points outside bounds', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 });
      expect(qt.insert(new Point(150, 50), 'outside')).toBe(false);
      expect(qt.size()).toBe(0);
    });

    it('should subdivide when capacity is reached', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4);
      for (let i = 0; i < 10; i++) {
        qt.insert(new Point(i * 10, i * 10), `point${i}`);
      }
      expect(qt.size()).toBe(10);
      expect(qt.depth()).toBeGreaterThan(1);
    });
  });

  describe('query', () => {
    it('should find points in range', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 });
      qt.insert(new Point(25, 25), 'a');
      qt.insert(new Point(50, 50), 'b');
      qt.insert(new Point(75, 75), 'c');

      const results = qt.query({ x: 20, y: 20, width: 35, height: 35 });
      expect(results.length).toBe(2);
    });

    it('should return empty array for empty range', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 });
      qt.insert(new Point(50, 50), 'a');

      const results = qt.query({ x: 0, y: 0, width: 10, height: 10 });
      expect(results.length).toBe(0);
    });
  });

  describe('radiusQuery', () => {
    it('should find points within radius', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 });
      qt.insert(new Point(50, 50), 'center');
      qt.insert(new Point(55, 50), 'near');
      qt.insert(new Point(80, 50), 'far');

      const results = qt.radiusQuery(new Point(50, 50), 10);
      expect(results.length).toBe(2);
    });
  });

  describe('kNearest', () => {
    it('should find k nearest neighbors', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 });
      qt.insert(new Point(50, 50), 'a');
      qt.insert(new Point(55, 50), 'b');
      qt.insert(new Point(60, 50), 'c');
      qt.insert(new Point(80, 50), 'd');

      const nearest = qt.kNearest(new Point(50, 50), 2);
      expect(nearest.length).toBe(2);
      expect(nearest[0].data).toBe('a');
      expect(nearest[1].data).toBe('b');
    });
  });

  describe('clear', () => {
    it('should remove all points', () => {
      const qt = new Quadtree({ x: 0, y: 0, width: 100, height: 100 });
      qt.insert(new Point(50, 50), 'a');
      qt.insert(new Point(60, 60), 'b');
      expect(qt.size()).toBe(2);

      qt.clear();
      expect(qt.size()).toBe(0);
    });
  });
});
