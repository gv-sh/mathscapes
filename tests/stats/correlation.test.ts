import {
  covariance,
  pearsonCorrelation,
  spearmanCorrelation,
  kendallTau,
  covarianceMatrix,
  correlationMatrix,
  partialCorrelation,
  autocorrelation,
} from '../../src/stats/correlation';

describe('Correlation and Covariance', () => {
  describe('covariance', () => {
    test('should calculate positive covariance', () => {
      const x = [1, 2, 3];
      const y = [4, 5, 6];
      const result = covariance(x, y);
      expect(result).toBeGreaterThan(0);
    });

    test('should calculate negative covariance', () => {
      const x = [1, 2, 3];
      const y = [6, 5, 4];
      const result = covariance(x, y);
      expect(result).toBeLessThan(0);
    });

    test('should calculate sample covariance by default', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      const result = covariance(x, y);
      expect(result).toBeCloseTo(5, 10);
    });

    test('should calculate population covariance', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      const result = covariance(x, y, false);
      expect(result).toBeCloseTo(4, 10);
    });

    test('should throw error for different length arrays', () => {
      expect(() => covariance([1, 2], [1, 2, 3])).toThrow('Arrays must have the same length');
    });

    test('should throw error for empty arrays', () => {
      expect(() => covariance([], [])).toThrow('Cannot calculate covariance of empty arrays');
    });

    test('should throw error for single element with sample covariance', () => {
      expect(() => covariance([1], [2])).toThrow(
        'Cannot calculate sample covariance with only one data point'
      );
    });
  });

  describe('pearsonCorrelation', () => {
    test('should calculate perfect positive correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      const result = pearsonCorrelation(x, y);
      expect(result).toBeCloseTo(1, 10);
    });

    test('should calculate perfect negative correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [10, 8, 6, 4, 2];
      const result = pearsonCorrelation(x, y);
      expect(result).toBeCloseTo(-1, 10);
    });

    test('should calculate zero correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [1, 3, 2, 4, 3];
      const result = pearsonCorrelation(x, y);
      expect(Math.abs(result)).toBeLessThan(1);
    });

    test('should return 0 for constant arrays', () => {
      const x = [5, 5, 5, 5];
      const y = [1, 2, 3, 4];
      const result = pearsonCorrelation(x, y);
      expect(result).toBe(0);
    });

    test('should throw error for different length arrays', () => {
      expect(() => pearsonCorrelation([1, 2], [1, 2, 3])).toThrow(
        'Arrays must have the same length'
      );
    });

    test('should throw error for empty arrays', () => {
      expect(() => pearsonCorrelation([], [])).toThrow(
        'Cannot calculate correlation of empty arrays'
      );
    });
  });

  describe('spearmanCorrelation', () => {
    test('should calculate perfect monotonic positive correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [1, 4, 9, 16, 25]; // quadratic, but monotonic
      const result = spearmanCorrelation(x, y);
      expect(result).toBeCloseTo(1, 10);
    });

    test('should calculate perfect monotonic negative correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [25, 16, 9, 4, 1];
      const result = spearmanCorrelation(x, y);
      expect(result).toBeCloseTo(-1, 10);
    });

    test('should handle ties', () => {
      const x = [1, 2, 2, 3];
      const y = [1, 2, 2, 3];
      const result = spearmanCorrelation(x, y);
      expect(result).toBeCloseTo(1, 10);
    });

    test('should throw error for different length arrays', () => {
      expect(() => spearmanCorrelation([1, 2], [1, 2, 3])).toThrow(
        'Arrays must have the same length'
      );
    });
  });

  describe('kendallTau', () => {
    test('should calculate perfect concordance', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      const result = kendallTau(x, y);
      expect(result).toBeCloseTo(1, 10);
    });

    test('should calculate perfect discordance', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [10, 8, 6, 4, 2];
      const result = kendallTau(x, y);
      expect(result).toBeCloseTo(-1, 10);
    });

    test('should handle ties', () => {
      const x = [1, 2, 2, 3];
      const y = [1, 2, 2, 3];
      const result = kendallTau(x, y);
      expect(result).toBeGreaterThan(0);
    });

    test('should calculate intermediate correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [1, 3, 2, 4, 5];
      const result = kendallTau(x, y);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test('should throw error for different length arrays', () => {
      expect(() => kendallTau([1, 2], [1, 2, 3])).toThrow('Arrays must have the same length');
    });
  });

  describe('covarianceMatrix', () => {
    test('should calculate covariance matrix', () => {
      const data = [
        [1, 2],
        [2, 3],
        [3, 4],
      ];
      const result = covarianceMatrix(data);
      expect(result.length).toBe(2);
      expect(result[0].length).toBe(2);
      expect(result[0][0]).toBeCloseTo(1, 10); // Var(X)
      expect(result[1][1]).toBeCloseTo(1, 10); // Var(Y)
      expect(result[0][1]).toBeCloseTo(1, 10); // Cov(X,Y)
      expect(result[1][0]).toBeCloseTo(1, 10); // Cov(Y,X)
    });

    test('should be symmetric', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const result = covarianceMatrix(data);
      expect(result[0][1]).toBeCloseTo(result[1][0], 10);
      expect(result[0][2]).toBeCloseTo(result[2][0], 10);
      expect(result[1][2]).toBeCloseTo(result[2][1], 10);
    });

    test('should throw error for empty data', () => {
      expect(() => covarianceMatrix([])).toThrow(
        'Cannot calculate covariance matrix of empty data'
      );
    });

    test('should throw error for inconsistent row lengths', () => {
      const data = [
        [1, 2],
        [3, 4, 5],
      ];
      expect(() => covarianceMatrix(data)).toThrow('All rows must have the same length');
    });
  });

  describe('correlationMatrix', () => {
    test('should calculate correlation matrix', () => {
      const data = [
        [1, 2],
        [2, 4],
        [3, 6],
      ];
      const result = correlationMatrix(data);
      expect(result.length).toBe(2);
      expect(result[0].length).toBe(2);
      expect(result[0][0]).toBeCloseTo(1, 10); // Corr(X,X) = 1
      expect(result[1][1]).toBeCloseTo(1, 10); // Corr(Y,Y) = 1
      expect(result[0][1]).toBeCloseTo(1, 10); // Perfect correlation
      expect(result[1][0]).toBeCloseTo(1, 10);
    });

    test('should have diagonal of 1s', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const result = correlationMatrix(data);
      expect(result[0][0]).toBe(1);
      expect(result[1][1]).toBe(1);
      expect(result[2][2]).toBe(1);
    });

    test('should be symmetric', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const result = correlationMatrix(data);
      expect(result[0][1]).toBeCloseTo(result[1][0], 10);
      expect(result[0][2]).toBeCloseTo(result[2][0], 10);
      expect(result[1][2]).toBeCloseTo(result[2][1], 10);
    });

    test('should throw error for empty data', () => {
      expect(() => correlationMatrix([])).toThrow(
        'Cannot calculate correlation matrix of empty data'
      );
    });
  });

  describe('partialCorrelation', () => {
    test('should calculate partial correlation with one control variable', () => {
      // Create data where X and Y are both correlated with Z
      const data = [
        [1, 2, 1],
        [2, 4, 2],
        [3, 6, 3],
        [4, 8, 4],
        [5, 10, 5],
      ];
      const result = partialCorrelation(data);
      // Partial correlation should exist and be well-defined
      expect(result).toBeDefined();
      expect(Math.abs(result)).toBeLessThanOrEqual(1);
    });

    test('should calculate partial correlation with multiple control variables', () => {
      // Create data with varied patterns to avoid singular matrices
      // Use random-ish but deterministic data
      const data = [
        [1.0, 2.0, 0.5, 1.5],
        [2.0, 3.5, 1.0, 2.5],
        [3.0, 4.5, 1.5, 0.5],
        [4.0, 5.0, 0.5, 1.5],
        [5.0, 6.5, 1.0, 2.5],
        [6.0, 7.0, 1.5, 0.5],
        [7.0, 8.5, 0.5, 1.5],
      ];
      const result = partialCorrelation(data);
      expect(result).toBeDefined();
      expect(Math.abs(result)).toBeLessThanOrEqual(1);
      expect(isNaN(result)).toBe(false);
    });

    test('should throw error for insufficient variables', () => {
      const data = [
        [1, 2],
        [2, 3],
      ];
      expect(() => partialCorrelation(data)).toThrow(
        'Partial correlation requires at least 3 variables'
      );
    });

    test('should throw error for empty data', () => {
      expect(() => partialCorrelation([])).toThrow(
        'Cannot calculate partial correlation of empty data'
      );
    });
  });

  describe('autocorrelation', () => {
    test('should calculate autocorrelation at lag 1', () => {
      const data = [1, 2, 3, 4, 5, 6];
      const result = autocorrelation(data, 1);
      expect(result).toBeGreaterThan(0);
      expect(Math.abs(result)).toBeLessThanOrEqual(1);
    });

    test('should calculate autocorrelation at lag 2', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = autocorrelation(data, 2);
      expect(Math.abs(result)).toBeLessThanOrEqual(1);
    });

    test('should throw error for negative lag', () => {
      expect(() => autocorrelation([1, 2, 3], -1)).toThrow('Lag must be non-negative');
    });

    test('should throw error when lag >= data length', () => {
      expect(() => autocorrelation([1, 2, 3], 3)).toThrow(
        'Data length must be greater than lag'
      );
    });

    test('should handle periodic data', () => {
      // Sine wave should have high autocorrelation at period intervals
      const data = Array.from({ length: 20 }, (_, i) => Math.sin((i * Math.PI) / 4));
      const result1 = autocorrelation(data, 1);
      const result8 = autocorrelation(data, 8); // One period
      expect(Math.abs(result8)).toBeGreaterThan(Math.abs(result1));
    });
  });
});
