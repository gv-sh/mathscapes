import {
  mean,
  median,
  mode,
  trimmedMean,
  variance,
  standardDeviation,
  medianAbsoluteDeviation,
  interquartileRange,
  range,
  skewness,
  kurtosis,
  quantile,
  percentile,
  quantiles,
  fiveNumberSummary,
  summary,
} from '../../src/stats/descriptive';

describe('Descriptive Statistics', () => {
  describe('mean', () => {
    test('should calculate mean of positive numbers', () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
    });

    test('should calculate mean of negative numbers', () => {
      expect(mean([-1, -2, -3, -4, -5])).toBe(-3);
    });

    test('should calculate mean of mixed numbers', () => {
      expect(mean([10, 20, 30])).toBe(20);
    });

    test('should throw error for empty array', () => {
      expect(() => mean([])).toThrow('Cannot calculate mean of empty array');
    });

    test('should handle single element', () => {
      expect(mean([42])).toBe(42);
    });

    test('should handle decimals', () => {
      expect(mean([1.5, 2.5, 3.5])).toBeCloseTo(2.5, 10);
    });
  });

  describe('median', () => {
    test('should calculate median of odd-length array', () => {
      expect(median([1, 2, 3, 4, 5])).toBe(3);
    });

    test('should calculate median of even-length array', () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });

    test('should handle unsorted data', () => {
      expect(median([5, 1, 3, 2, 4])).toBe(3);
    });

    test('should throw error for empty array', () => {
      expect(() => median([])).toThrow('Cannot calculate median of empty array');
    });

    test('should handle single element', () => {
      expect(median([42])).toBe(42);
    });

    test('should handle duplicates', () => {
      expect(median([1, 2, 2, 3])).toBe(2);
    });
  });

  describe('mode', () => {
    test('should find single mode', () => {
      expect(mode([1, 2, 2, 3, 3, 3])).toEqual([3]);
    });

    test('should find multiple modes (bimodal)', () => {
      expect(mode([1, 1, 2, 2, 3])).toEqual([1, 2]);
    });

    test('should return empty array when no mode exists', () => {
      expect(mode([1, 2, 3])).toEqual([]);
    });

    test('should throw error for empty array', () => {
      expect(() => mode([])).toThrow('Cannot calculate mode of empty array');
    });

    test('should handle single element', () => {
      expect(mode([42])).toEqual([]);
    });

    test('should sort modes in ascending order', () => {
      expect(mode([3, 3, 1, 1, 2])).toEqual([1, 3]);
    });
  });

  describe('trimmedMean', () => {
    test('should calculate trimmed mean', () => {
      const result = trimmedMean([1, 2, 3, 4, 100], 0.2);
      expect(result).toBeCloseTo(3, 10);
    });

    test('should use default trim proportion', () => {
      const result = trimmedMean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(result).toBe(5.5);
    });

    test('should throw error for invalid trim proportion', () => {
      expect(() => trimmedMean([1, 2, 3], -0.1)).toThrow(
        'Trim proportion must be between 0 and 0.5'
      );
      expect(() => trimmedMean([1, 2, 3], 0.6)).toThrow(
        'Trim proportion must be between 0 and 0.5'
      );
    });

    test('should throw error for empty array', () => {
      expect(() => trimmedMean([])).toThrow('Cannot calculate trimmed mean of empty array');
    });
  });

  describe('variance', () => {
    test('should calculate sample variance', () => {
      const result = variance([1, 2, 3, 4, 5]);
      expect(result).toBeCloseTo(2.5, 10);
    });

    test('should calculate population variance', () => {
      const result = variance([1, 2, 3, 4, 5], false);
      expect(result).toBeCloseTo(2, 10);
    });

    test('should throw error for empty array', () => {
      expect(() => variance([])).toThrow('Cannot calculate variance of empty array');
    });

    test('should throw error for single element with sample variance', () => {
      expect(() => variance([1])).toThrow(
        'Cannot calculate sample variance with only one data point'
      );
    });

    test('should handle zero variance', () => {
      expect(variance([5, 5, 5, 5])).toBe(0);
    });
  });

  describe('standardDeviation', () => {
    test('should calculate sample standard deviation', () => {
      const result = standardDeviation([1, 2, 3, 4, 5]);
      expect(result).toBeCloseTo(Math.sqrt(2.5), 10);
    });

    test('should calculate population standard deviation', () => {
      const result = standardDeviation([1, 2, 3, 4, 5], false);
      expect(result).toBeCloseTo(Math.sqrt(2), 10);
    });

    test('should handle zero std dev', () => {
      expect(standardDeviation([5, 5, 5, 5])).toBe(0);
    });
  });

  describe('medianAbsoluteDeviation', () => {
    test('should calculate MAD', () => {
      const result = medianAbsoluteDeviation([1, 2, 3, 4, 5]);
      expect(result).toBe(1);
    });

    test('should throw error for empty array', () => {
      expect(() => medianAbsoluteDeviation([])).toThrow('Cannot calculate MAD of empty array');
    });

    test('should handle zero MAD', () => {
      expect(medianAbsoluteDeviation([5, 5, 5])).toBe(0);
    });
  });

  describe('interquartileRange', () => {
    test('should calculate IQR', () => {
      const result = interquartileRange([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(result).toBeCloseTo(4, 10);
    });

    test('should throw error for empty array', () => {
      expect(() => interquartileRange([])).toThrow('Cannot calculate IQR of empty array');
    });
  });

  describe('range', () => {
    test('should calculate range', () => {
      expect(range([1, 2, 3, 4, 5])).toBe(4);
    });

    test('should throw error for empty array', () => {
      expect(() => range([])).toThrow('Cannot calculate range of empty array');
    });

    test('should handle single element', () => {
      expect(range([5])).toBe(0);
    });
  });

  describe('skewness', () => {
    test('should calculate skewness for symmetric distribution', () => {
      const result = skewness([1, 2, 3, 4, 5]);
      expect(Math.abs(result)).toBeLessThan(0.1);
    });

    test('should calculate positive skewness for right-skewed distribution', () => {
      const result = skewness([1, 2, 3, 4, 100]);
      expect(result).toBeGreaterThan(0);
    });

    test('should calculate negative skewness for left-skewed distribution', () => {
      const result = skewness([1, 97, 98, 99, 100]);
      expect(result).toBeLessThan(0);
    });

    test('should throw error for insufficient data', () => {
      expect(() => skewness([1, 2])).toThrow('Skewness requires at least 3 data points');
    });

    test('should handle zero skewness for constant data', () => {
      expect(skewness([5, 5, 5, 5])).toBe(0);
    });
  });

  describe('kurtosis', () => {
    test('should calculate excess kurtosis', () => {
      const result = kurtosis([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      // Uniform distribution has negative excess kurtosis
      expect(result).toBeLessThan(0);
      expect(result).toBeCloseTo(-1.8, 0);
    });

    test('should calculate raw kurtosis', () => {
      const result = kurtosis([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], true, false);
      expect(result).toBeGreaterThan(0);
    });

    test('should throw error for insufficient data', () => {
      expect(() => kurtosis([1, 2, 3])).toThrow('Kurtosis requires at least 4 data points');
    });

    test('should handle constant data', () => {
      expect(kurtosis([5, 5, 5, 5, 5])).toBe(0);
    });
  });

  describe('quantile', () => {
    test('should calculate median (0.5 quantile)', () => {
      expect(quantile([1, 2, 3, 4, 5], 0.5)).toBe(3);
    });

    test('should calculate first quartile', () => {
      const result = quantile([1, 2, 3, 4, 5], 0.25);
      expect(result).toBeCloseTo(2, 10);
    });

    test('should calculate third quartile', () => {
      const result = quantile([1, 2, 3, 4, 5], 0.75);
      expect(result).toBeCloseTo(4, 10);
    });

    test('should handle edge cases (0 and 1)', () => {
      expect(quantile([1, 2, 3, 4, 5], 0)).toBe(1);
      expect(quantile([1, 2, 3, 4, 5], 1)).toBe(5);
    });

    test('should throw error for invalid quantile', () => {
      expect(() => quantile([1, 2, 3], -0.1)).toThrow('Quantile must be between 0 and 1');
      expect(() => quantile([1, 2, 3], 1.1)).toThrow('Quantile must be between 0 and 1');
    });

    test('should throw error for empty array', () => {
      expect(() => quantile([], 0.5)).toThrow('Cannot calculate quantile of empty array');
    });
  });

  describe('percentile', () => {
    test('should calculate 50th percentile (median)', () => {
      expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3);
    });

    test('should calculate 25th percentile', () => {
      const result = percentile([1, 2, 3, 4, 5], 25);
      expect(result).toBeCloseTo(2, 10);
    });

    test('should throw error for invalid percentile', () => {
      expect(() => percentile([1, 2, 3], -1)).toThrow('Percentile must be between 0 and 100');
      expect(() => percentile([1, 2, 3], 101)).toThrow('Percentile must be between 0 and 100');
    });
  });

  describe('quantiles', () => {
    test('should calculate multiple quantiles', () => {
      const result = quantiles([1, 2, 3, 4, 5], [0.25, 0.5, 0.75]);
      expect(result.length).toBe(3);
      expect(result[1]).toBe(3); // median
    });

    test('should handle empty quantiles array', () => {
      expect(quantiles([1, 2, 3], [])).toEqual([]);
    });
  });

  describe('fiveNumberSummary', () => {
    test('should calculate five-number summary', () => {
      const result = fiveNumberSummary([1, 2, 3, 4, 5]);
      expect(result.min).toBe(1);
      expect(result.q1).toBeCloseTo(2, 10);
      expect(result.median).toBe(3);
      expect(result.q3).toBeCloseTo(4, 10);
      expect(result.max).toBe(5);
    });

    test('should throw error for empty array', () => {
      expect(() => fiveNumberSummary([])).toThrow(
        'Cannot calculate five-number summary of empty array'
      );
    });
  });

  describe('summary', () => {
    test('should calculate comprehensive statistics', () => {
      const result = summary([1, 2, 3, 4, 5]);
      expect(result.count).toBe(5);
      expect(result.mean).toBe(3);
      expect(result.median).toBe(3);
      expect(result.min).toBe(1);
      expect(result.max).toBe(5);
      expect(result.range).toBe(4);
      expect(result.std).toBeCloseTo(Math.sqrt(2.5), 10);
      expect(result.variance).toBeCloseTo(2.5, 10);
      expect(Math.abs(result.skewness)).toBeLessThan(0.1);
      expect(result.kurtosis).toBeDefined();
    });

    test('should handle NaN for skewness and kurtosis with insufficient data', () => {
      const result = summary([1, 2]);
      expect(result.count).toBe(2);
      expect(result.mean).toBe(1.5);
      expect(isNaN(result.skewness)).toBe(true);
      expect(isNaN(result.kurtosis)).toBe(true);
    });

    test('should throw error for empty array', () => {
      expect(() => summary([])).toThrow('Cannot calculate summary of empty array');
    });
  });
});
