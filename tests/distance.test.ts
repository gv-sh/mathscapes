import { Vector } from '../src/linalg/vector';
import * as distance from '../src/linalg/distance';

describe('Distance Metrics', () => {
  describe('Euclidean Distance', () => {
    test('computes distance between arrays', () => {
      const result = distance.euclidean([0, 0], [3, 4]);
      expect(result).toBe(5);
    });

    test('computes distance between vectors', () => {
      const v1 = new Vector([0, 0]);
      const v2 = new Vector([3, 4]);
      expect(distance.euclidean(v1, v2)).toBe(5);
    });

    test('computes squared euclidean distance', () => {
      const result = distance.euclideanSquared([0, 0], [3, 4]);
      expect(result).toBe(25);
    });

    test('throws error for dimension mismatch', () => {
      expect(() => distance.euclidean([1, 2], [1, 2, 3])).toThrow();
    });
  });

  describe('Manhattan Distance', () => {
    test('computes manhattan distance', () => {
      const result = distance.manhattan([0, 0], [3, 4]);
      expect(result).toBe(7);
    });

    test('computes manhattan distance for vectors', () => {
      const v1 = new Vector([1, 1]);
      const v2 = new Vector([4, 5]);
      expect(distance.manhattan(v1, v2)).toBe(7);
    });

    test('handles negative coordinates', () => {
      const result = distance.manhattan([-1, -1], [2, 2]);
      expect(result).toBe(6);
    });
  });

  describe('Chebyshev Distance', () => {
    test('computes chebyshev distance', () => {
      const result = distance.chebyshev([0, 0], [3, 4]);
      expect(result).toBe(4);
    });

    test('computes chebyshev for equal differences', () => {
      const result = distance.chebyshev([0, 0], [5, 5]);
      expect(result).toBe(5);
    });

    test('handles negative coordinates', () => {
      const result = distance.chebyshev([1, 1], [-2, 4]);
      expect(result).toBe(3);
    });
  });

  describe('Minkowski Distance', () => {
    test('minkowski with p=1 equals manhattan', () => {
      const a = [0, 0];
      const b = [3, 4];
      expect(distance.minkowski(a, b, 1)).toBe(distance.manhattan(a, b));
    });

    test('minkowski with p=2 equals euclidean', () => {
      const a = [0, 0];
      const b = [3, 4];
      expect(distance.minkowski(a, b, 2)).toBeCloseTo(distance.euclidean(a, b));
    });

    test('minkowski with p=Infinity equals chebyshev', () => {
      const a = [0, 0];
      const b = [3, 4];
      expect(distance.minkowski(a, b, Infinity)).toBe(distance.chebyshev(a, b));
    });

    test('minkowski with p=3', () => {
      const result = distance.minkowski([0, 0], [3, 4], 3);
      expect(result).toBeCloseTo(4.497941445);
    });

    test('throws error for p < 1', () => {
      expect(() => distance.minkowski([0, 0], [1, 1], 0.5)).toThrow();
    });
  });

  describe('Cosine Similarity and Distance', () => {
    test('computes cosine similarity for identical vectors', () => {
      const result = distance.cosineSimilarity([1, 2, 3], [1, 2, 3]);
      expect(result).toBeCloseTo(1);
    });

    test('computes cosine similarity for opposite vectors', () => {
      const result = distance.cosineSimilarity([1, 2, 3], [-1, -2, -3]);
      expect(result).toBeCloseTo(-1);
    });

    test('computes cosine similarity for perpendicular vectors', () => {
      const result = distance.cosineSimilarity([1, 0], [0, 1]);
      expect(result).toBeCloseTo(0);
    });

    test('computes cosine distance', () => {
      const result = distance.cosineDistance([1, 2, 3], [1, 2, 3]);
      expect(result).toBeCloseTo(0);
    });

    test('throws error for zero vector', () => {
      expect(() => distance.cosineSimilarity([0, 0], [1, 1])).toThrow();
    });
  });

  describe('Hamming Distance', () => {
    test('computes hamming distance for binary vectors', () => {
      const result = distance.hamming([1, 0, 1, 0], [1, 1, 0, 0]);
      expect(result).toBe(2);
    });

    test('computes hamming distance for identical vectors', () => {
      const result = distance.hamming([1, 2, 3], [1, 2, 3]);
      expect(result).toBe(0);
    });

    test('computes hamming distance for completely different vectors', () => {
      const result = distance.hamming([1, 2, 3], [4, 5, 6]);
      expect(result).toBe(3);
    });

    test('computes normalized hamming distance', () => {
      const result = distance.hammingNormalized([1, 0, 1, 0], [1, 1, 0, 0]);
      expect(result).toBe(0.5);
    });

    test('uses tolerance for floating point comparison', () => {
      const result = distance.hamming([1.0, 2.0], [1.0000001, 2.0000001], 0.001);
      expect(result).toBe(0);
    });
  });

  describe('Jaccard Similarity and Distance', () => {
    test('computes jaccard similarity for identical sets', () => {
      const result = distance.jaccardSimilarity([1, 1, 0], [1, 1, 0]);
      expect(result).toBe(1);
    });

    test('computes jaccard similarity for disjoint sets', () => {
      const result = distance.jaccardSimilarity([1, 1, 0], [0, 0, 1]);
      expect(result).toBe(0);
    });

    test('computes jaccard similarity for partial overlap', () => {
      const result = distance.jaccardSimilarity([1, 1, 0, 0], [0, 1, 1, 0]);
      expect(result).toBe(1/3); // 1 in common, 3 in union
    });

    test('computes jaccard distance', () => {
      const result = distance.jaccardDistance([1, 1, 0], [1, 1, 0]);
      expect(result).toBe(0);
    });

    test('handles all-zero vectors', () => {
      const result = distance.jaccardSimilarity([0, 0], [0, 0]);
      expect(result).toBe(1);
    });
  });

  describe('Canberra Distance', () => {
    test('computes canberra distance', () => {
      const result = distance.canberra([1, 2, 3], [2, 3, 4]);
      expect(result).toBeCloseTo(1/3 + 1/5 + 1/7);
    });

    test('handles zero pairs', () => {
      const result = distance.canberra([0, 0], [0, 0]);
      expect(result).toBe(0);
    });

    test('handles mixed zero and non-zero', () => {
      const result = distance.canberra([0, 1], [0, 2]);
      expect(result).toBeCloseTo(1/3);
    });
  });

  describe('Bray-Curtis Dissimilarity', () => {
    test('computes bray-curtis dissimilarity', () => {
      const result = distance.brayCurtis([1, 2, 3], [2, 3, 4]);
      expect(result).toBeCloseTo(3/15); // |1-2| + |2-3| + |3-4| / (1+2 + 2+3 + 3+4)
    });

    test('computes dissimilarity for identical vectors', () => {
      const result = distance.brayCurtis([1, 2, 3], [1, 2, 3]);
      expect(result).toBe(0);
    });

    test('handles zero vectors', () => {
      const result = distance.brayCurtis([0, 0], [0, 0]);
      expect(result).toBe(0);
    });
  });
});
