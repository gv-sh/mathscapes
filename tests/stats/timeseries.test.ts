import {
  rollingMean,
  rollingVariance,
  rollingStdDev,
  rollingMin,
  rollingMax,
  rollingSum,
  ewma,
  ewmVariance,
  ewmStdDev,
  cumulativeSum,
  cumulativeProduct,
  cumulativeMin,
  cumulativeMax,
} from '../../src/stats/timeseries';

describe('Time Series Statistics', () => {
  describe('rollingMean', () => {
    test('should calculate trailing rolling mean', () => {
      const data = [1, 2, 3, 4, 5];
      const result = rollingMean(data, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBeCloseTo(2, 10); // (1+2+3)/3
      expect(result[3]).toBeCloseTo(3, 10); // (2+3+4)/3
      expect(result[4]).toBeCloseTo(4, 10); // (3+4+5)/3
    });

    test('should calculate centered rolling mean', () => {
      const data = [1, 2, 3, 4, 5];
      const result = rollingMean(data, 3, true);
      expect(isNaN(result[0])).toBe(true);
      expect(result[1]).toBeCloseTo(2, 10); // (1+2+3)/3
      expect(result[2]).toBeCloseTo(3, 10); // (2+3+4)/3
      expect(result[3]).toBeCloseTo(4, 10); // (3+4+5)/3
      expect(isNaN(result[4])).toBe(true);
    });

    test('should throw error for invalid window size', () => {
      expect(() => rollingMean([1, 2, 3], 0)).toThrow(
        'Window size must be between 1 and data length'
      );
      expect(() => rollingMean([1, 2, 3], 4)).toThrow(
        'Window size must be between 1 and data length'
      );
      expect(() => rollingMean([1, 2, 3], 1.5)).toThrow('Window size must be an integer');
    });

    test('should handle window size of 1', () => {
      const data = [1, 2, 3, 4, 5];
      const result = rollingMean(data, 1);
      expect(result).toEqual(data);
    });
  });

  describe('rollingVariance', () => {
    test('should calculate trailing rolling variance', () => {
      const data = [1, 2, 3, 4, 5];
      const result = rollingVariance(data, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBeCloseTo(1, 10); // var([1,2,3])
      expect(result[3]).toBeCloseTo(1, 10); // var([2,3,4])
      expect(result[4]).toBeCloseTo(1, 10); // var([3,4,5])
    });

    test('should calculate centered rolling variance', () => {
      const data = [1, 2, 3, 4, 5];
      const result = rollingVariance(data, 3, true);
      expect(isNaN(result[0])).toBe(true);
      expect(result[1]).toBeCloseTo(1, 10);
      expect(isNaN(result[4])).toBe(true);
    });
  });

  describe('rollingStdDev', () => {
    test('should calculate trailing rolling std dev', () => {
      const data = [1, 2, 3, 4, 5];
      const result = rollingStdDev(data, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBeCloseTo(1, 10); // std([1,2,3])
      expect(result[3]).toBeCloseTo(1, 10); // std([2,3,4])
      expect(result[4]).toBeCloseTo(1, 10); // std([3,4,5])
    });
  });

  describe('rollingMin', () => {
    test('should calculate trailing rolling minimum', () => {
      const data = [3, 1, 4, 1, 5];
      const result = rollingMin(data, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(1); // min([3,1,4])
      expect(result[3]).toBe(1); // min([1,4,1])
      expect(result[4]).toBe(1); // min([4,1,5])
    });

    test('should calculate centered rolling minimum', () => {
      const data = [3, 1, 4, 1, 5];
      const result = rollingMin(data, 3, true);
      expect(isNaN(result[0])).toBe(true);
      expect(result[1]).toBe(1); // min([3,1,4])
      expect(result[2]).toBe(1); // min([1,4,1])
      expect(result[3]).toBe(1); // min([4,1,5])
      expect(isNaN(result[4])).toBe(true);
    });
  });

  describe('rollingMax', () => {
    test('should calculate trailing rolling maximum', () => {
      const data = [3, 1, 4, 1, 5];
      const result = rollingMax(data, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(4); // max([3,1,4])
      expect(result[3]).toBe(4); // max([1,4,1])
      expect(result[4]).toBe(5); // max([4,1,5])
    });
  });

  describe('rollingSum', () => {
    test('should calculate trailing rolling sum', () => {
      const data = [1, 2, 3, 4, 5];
      const result = rollingSum(data, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(6); // 1+2+3
      expect(result[3]).toBe(9); // 2+3+4
      expect(result[4]).toBe(12); // 3+4+5
    });

    test('should calculate centered rolling sum', () => {
      const data = [1, 2, 3, 4, 5];
      const result = rollingSum(data, 3, true);
      expect(isNaN(result[0])).toBe(true);
      expect(result[1]).toBe(6); // 1+2+3
      expect(result[2]).toBe(9); // 2+3+4
      expect(result[3]).toBe(12); // 3+4+5
      expect(isNaN(result[4])).toBe(true);
    });
  });

  describe('ewma', () => {
    test('should calculate EWMA with alpha', () => {
      const data = [1, 2, 3, 4, 5];
      const result = ewma(data, 0.5);
      expect(result[0]).toBe(1);
      expect(result.length).toBe(data.length);
      // Each subsequent value should be weighted average
      expect(result[1]).toBeGreaterThan(1);
      expect(result[1]).toBeLessThan(2);
    });

    test('should calculate EWMA with span', () => {
      const data = [1, 2, 3, 4, 5];
      const result = ewma(data, undefined, 3);
      expect(result[0]).toBe(1);
      expect(result.length).toBe(data.length);
    });

    test('should calculate EWMA without adjustment', () => {
      const data = [1, 2, 3, 4, 5];
      const result = ewma(data, 0.5, undefined, false);
      expect(result[0]).toBe(1);
      expect(result.length).toBe(data.length);
    });

    test('should throw error for invalid alpha', () => {
      expect(() => ewma([1, 2, 3], 0)).toThrow('Alpha must be between 0 and 1');
      expect(() => ewma([1, 2, 3], 1.5)).toThrow('Alpha must be between 0 and 1');
    });

    test('should throw error for invalid span', () => {
      expect(() => ewma([1, 2, 3], undefined, 0)).toThrow('Span must be at least 1');
    });

    test('should throw error when neither alpha nor span is specified', () => {
      expect(() => ewma([1, 2, 3])).toThrow('Either alpha or span must be specified');
    });

    test('should handle empty array', () => {
      expect(ewma([], 0.5)).toEqual([]);
    });

    test('should give more weight to recent data with higher alpha', () => {
      const data = [1, 1, 1, 1, 10];
      const resultLowAlpha = ewma(data, 0.1, undefined, false);
      const resultHighAlpha = ewma(data, 0.9, undefined, false);
      // High alpha should be closer to the recent value
      expect(resultHighAlpha[4]).toBeGreaterThan(resultLowAlpha[4]);
    });
  });

  describe('ewmVariance', () => {
    test('should calculate exponentially weighted variance', () => {
      const data = [1, 2, 3, 4, 5];
      const result = ewmVariance(data, 0.5);
      expect(result[0]).toBe(0);
      expect(result.length).toBe(data.length);
      // Variance should be positive
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
      }
    });

    test('should calculate with span parameter', () => {
      const data = [1, 2, 3, 4, 5];
      const result = ewmVariance(data, undefined, 3);
      expect(result.length).toBe(data.length);
    });
  });

  describe('ewmStdDev', () => {
    test('should calculate exponentially weighted std dev', () => {
      const data = [1, 2, 3, 4, 5];
      const result = ewmStdDev(data, 0.5);
      expect(result[0]).toBe(0);
      expect(result.length).toBe(data.length);
      // Std dev should be positive
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
      }
    });

    test('should be square root of variance', () => {
      const data = [1, 2, 3, 4, 5];
      const variance = ewmVariance(data, 0.5);
      const stdDev = ewmStdDev(data, 0.5);
      for (let i = 0; i < data.length; i++) {
        expect(stdDev[i]).toBeCloseTo(Math.sqrt(variance[i]), 10);
      }
    });
  });

  describe('cumulativeSum', () => {
    test('should calculate cumulative sum', () => {
      const data = [1, 2, 3, 4, 5];
      const result = cumulativeSum(data);
      expect(result).toEqual([1, 3, 6, 10, 15]);
    });

    test('should handle negative numbers', () => {
      const data = [1, -2, 3, -4, 5];
      const result = cumulativeSum(data);
      expect(result).toEqual([1, -1, 2, -2, 3]);
    });

    test('should handle empty array', () => {
      expect(cumulativeSum([])).toEqual([]);
    });

    test('should handle single element', () => {
      expect(cumulativeSum([5])).toEqual([5]);
    });
  });

  describe('cumulativeProduct', () => {
    test('should calculate cumulative product', () => {
      const data = [1, 2, 3, 4, 5];
      const result = cumulativeProduct(data);
      expect(result).toEqual([1, 2, 6, 24, 120]);
    });

    test('should handle zeros', () => {
      const data = [1, 2, 0, 4, 5];
      const result = cumulativeProduct(data);
      expect(result).toEqual([1, 2, 0, 0, 0]);
    });

    test('should handle negative numbers', () => {
      const data = [1, -2, 3];
      const result = cumulativeProduct(data);
      expect(result).toEqual([1, -2, -6]);
    });

    test('should handle empty array', () => {
      expect(cumulativeProduct([])).toEqual([]);
    });
  });

  describe('cumulativeMin', () => {
    test('should calculate cumulative minimum', () => {
      const data = [3, 1, 4, 1, 5];
      const result = cumulativeMin(data);
      expect(result).toEqual([3, 1, 1, 1, 1]);
    });

    test('should handle increasing sequence', () => {
      const data = [1, 2, 3, 4, 5];
      const result = cumulativeMin(data);
      expect(result).toEqual([1, 1, 1, 1, 1]);
    });

    test('should handle decreasing sequence', () => {
      const data = [5, 4, 3, 2, 1];
      const result = cumulativeMin(data);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    test('should handle empty array', () => {
      expect(cumulativeMin([])).toEqual([]);
    });
  });

  describe('cumulativeMax', () => {
    test('should calculate cumulative maximum', () => {
      const data = [3, 1, 4, 1, 5];
      const result = cumulativeMax(data);
      expect(result).toEqual([3, 3, 4, 4, 5]);
    });

    test('should handle increasing sequence', () => {
      const data = [1, 2, 3, 4, 5];
      const result = cumulativeMax(data);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle decreasing sequence', () => {
      const data = [5, 4, 3, 2, 1];
      const result = cumulativeMax(data);
      expect(result).toEqual([5, 5, 5, 5, 5]);
    });

    test('should handle empty array', () => {
      expect(cumulativeMax([])).toEqual([]);
    });
  });
});
