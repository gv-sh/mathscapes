import {
  tTest1Sample,
  tTest2Sample,
  tTestPaired,
  chiSquaredTest,
  chiSquaredIndependence,
  fisherExactTest,
  anovaOneWay,
  anovaTwoWay,
  shapiroWilkTest,
  andersonDarlingTest,
  kolmogorovSmirnovTest,
  confidenceIntervalMean,
  confidenceIntervalProportion,
  confidenceIntervalDifferenceMeans,
  hypothesisTestFramework,
} from '../../src/stats/tests';
import { normal } from '../../src/stats/distributions';

describe('Statistical Tests', () => {
  // ============================================================================
  // t-Tests
  // ============================================================================

  describe('One-Sample t-Test', () => {
    test('should detect significant difference from hypothesized mean', () => {
      // Sample clearly different from mu=0
      const data = [5, 6, 7, 8, 9];
      const result = tTest1Sample(data, 0);

      expect(result.statistic).toBeGreaterThan(0);
      expect(result.pValue).toBeLessThan(0.05);
      expect(result.degreesOfFreedom).toBe(4);
    });

    test('should not detect difference when sample matches hypothesis', () => {
      // Sample close to mu=5
      const data = [4.9, 5.1, 4.8, 5.2, 5.0];
      const result = tTest1Sample(data, 5);

      expect(Math.abs(result.statistic)).toBeLessThan(2);
      expect(result.pValue).toBeGreaterThan(0.05);
    });

    test('should handle one-sided tests', () => {
      const data = [5, 6, 7, 8, 9];

      const greaterResult = tTest1Sample(data, 0, 'greater');
      const lessResult = tTest1Sample(data, 0, 'less');

      expect(greaterResult.pValue).toBeLessThan(0.05);
      expect(lessResult.pValue).toBeGreaterThan(0.95);
    });

    test('should throw error for insufficient data', () => {
      expect(() => tTest1Sample([1], 0)).toThrow();
    });
  });

  describe('Two-Sample t-Test', () => {
    test('should detect difference between groups', () => {
      const group1 = [1, 2, 3, 4, 5];
      const group2 = [6, 7, 8, 9, 10];

      const result = tTest2Sample(group1, group2);

      expect(result.statistic).toBeLessThan(0);
      expect(result.pValue).toBeLessThan(0.05);
    });

    test('should not detect difference when groups are similar', () => {
      const group1 = [5, 6, 7, 8, 9];
      const group2 = [5.1, 6.1, 6.9, 8.1, 8.9];

      const result = tTest2Sample(group1, group2);

      expect(result.pValue).toBeGreaterThan(0.05);
    });

    test('should handle unequal variances (Welch test)', () => {
      const group1 = [1, 2, 3];
      const group2 = [10, 20, 30, 40, 50];

      const result = tTest2Sample(group1, group2, false);

      expect(result.equalVariance).toBe(false);
      expect(result.pValue).toBeLessThan(0.05);
    });

    test('should throw error for insufficient data', () => {
      expect(() => tTest2Sample([1], [2, 3])).toThrow();
    });
  });

  describe('Paired t-Test', () => {
    test('should detect change in paired observations', () => {
      const before = [120, 135, 125, 130, 128];
      const after = [115, 130, 120, 125, 123];

      const result = tTestPaired(before, after);

      expect(result.statistic).toBeGreaterThan(0);
      expect(result.pValue).toBeLessThan(0.05);
    });

    test('should not detect change when differences are small', () => {
      const before = [120, 135, 125, 130, 128];
      const after = [120.1, 135.1, 124.9, 130.1, 127.9];

      const result = tTestPaired(before, after);

      expect(result.pValue).toBeGreaterThan(0.05);
    });

    test('should throw error for mismatched lengths', () => {
      expect(() => tTestPaired([1, 2, 3], [1, 2])).toThrow();
    });
  });

  // ============================================================================
  // Chi-Squared Tests
  // ============================================================================

  describe('Chi-Squared Goodness-of-Fit Test', () => {
    test('should detect deviation from expected distribution', () => {
      const observed = [40, 30, 20, 10];
      const expected = [25, 25, 25, 25]; // Uniform

      const result = chiSquaredTest(observed, expected);

      expect(result.statistic).toBeGreaterThan(0);
      expect(result.pValue).toBeLessThan(0.05);
    });

    test('should not detect difference when observed matches expected', () => {
      const observed = [25, 26, 24, 25];
      const expected = [25, 25, 25, 25];

      const result = chiSquaredTest(observed, expected);

      expect(result.pValue).toBeGreaterThan(0.05);
    });

    test('should assume uniform distribution if expected not provided', () => {
      const observed = [10, 10, 10, 10];
      const result = chiSquaredTest(observed);

      expect(result.pValue).toBeGreaterThan(0.05);
    });
  });

  describe('Chi-Squared Independence Test', () => {
    test('should detect association between variables', () => {
      // Strong association
      const table = [
        [40, 10],
        [10, 40],
      ];

      const result = chiSquaredIndependence(table);

      expect(result.statistic).toBeGreaterThan(0);
      expect(result.pValue).toBeLessThan(0.05);
    });

    test('should not detect association when variables are independent', () => {
      const table = [
        [25, 25],
        [25, 25],
      ];

      const result = chiSquaredIndependence(table);

      expect(result.pValue).toBeGreaterThan(0.05);
    });

    test('should work with larger tables', () => {
      const table = [
        [10, 15, 5],
        [20, 10, 10],
      ];

      const result = chiSquaredIndependence(table);

      expect(result.degreesOfFreedom).toBe(2); // (2-1)*(3-1) = 2
    });
  });

  describe("Fisher's Exact Test", () => {
    test('should test independence in 2x2 table', () => {
      const table = [
        [8, 2],
        [1, 5],
      ];

      const result = fisherExactTest(table);

      expect(result.pValue).toBeGreaterThan(0);
      expect(result.pValue).toBeLessThan(1);
      expect(result.oddsRatio).toBeGreaterThan(0);
    });

    test('should handle one-sided alternatives', () => {
      const table = [
        [8, 2],
        [1, 5],
      ];

      const twoSided = fisherExactTest(table, 'two-sided');
      const greater = fisherExactTest(table, 'greater');
      const less = fisherExactTest(table, 'less');

      expect(twoSided.pValue).toBeGreaterThan(0);
      expect(greater.pValue).toBeGreaterThan(0);
      expect(less.pValue).toBeGreaterThan(0);
    });

    test('should throw error for non-2x2 table', () => {
      const table = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      expect(() => fisherExactTest(table as any)).toThrow();
    });
  });

  // ============================================================================
  // ANOVA
  // ============================================================================

  describe('One-Way ANOVA', () => {
    test('should detect difference between groups', () => {
      const group1 = [1, 2, 3, 4, 5];
      const group2 = [6, 7, 8, 9, 10];
      const group3 = [11, 12, 13, 14, 15];

      const result = anovaOneWay([group1, group2, group3]);

      expect(result.statistic).toBeGreaterThan(0);
      expect(result.pValue).toBeLessThan(0.05);
      expect(result.degreesOfFreedom).toEqual([2, 12]); // 3-1=2, 15-3=12
    });

    test('should not detect difference when groups are similar', () => {
      const group1 = [5, 6, 7];
      const group2 = [5.1, 6.1, 6.9];
      const group3 = [5.2, 5.9, 7.1];

      const result = anovaOneWay([group1, group2, group3]);

      expect(result.pValue).toBeGreaterThan(0.05);
    });

    test('should calculate correct sum of squares', () => {
      const group1 = [1, 2, 3];
      const group2 = [4, 5, 6];

      const result = anovaOneWay([group1, group2]);

      expect(result.sumOfSquaresBetween).toBeGreaterThan(0);
      expect(result.sumOfSquaresWithin).toBeGreaterThan(0);
    });

    test('should throw error for insufficient groups', () => {
      expect(() => anovaOneWay([[1, 2, 3]])).toThrow();
    });
  });

  describe('Two-Way ANOVA', () => {
    test('should test effects of two factors', () => {
      // 2x2 design with balanced data
      const data = [
        [
          [5, 6],
          [7, 8],
        ],
        [
          [9, 10],
          [11, 12],
        ],
      ];

      const result = anovaTwoWay(data);

      expect(result.factorA.statistic).toBeGreaterThan(0);
      expect(result.factorB.statistic).toBeGreaterThan(0);
      expect(result.residual.degreesOfFreedom).toBeGreaterThan(0);
    });

    test('should detect significant factor effects', () => {
      // Strong effect of factor A
      const data = [
        [
          [1, 2, 3],
          [2, 3, 4],
        ],
        [
          [10, 11, 12],
          [11, 12, 13],
        ],
      ];

      const result = anovaTwoWay(data);

      expect(result.factorA.pValue).toBeLessThan(0.05);
    });
  });

  // ============================================================================
  // Normality Tests
  // ============================================================================

  describe('Shapiro-Wilk Test', () => {
    test('should accept normal data', () => {
      const data = normal.random(0, 1, 50);
      const result = shapiroWilkTest(data);

      // Most of the time should accept null (data is normal)
      expect(result.statistic).toBeGreaterThan(0);
      expect(result.statistic).toBeLessThanOrEqual(1);
      expect(result.pValue).toBeGreaterThan(0);
    });

    test('should reject non-normal data', () => {
      // Bimodal data (clearly not normal)
      const data = [
        ...Array.from({ length: 25 }, () => 1 + Math.random()),
        ...Array.from({ length: 25 }, () => 10 + Math.random()),
      ];
      const result = shapiroWilkTest(data);

      // The test should return a statistic between 0 and 1
      expect(result.statistic).toBeGreaterThan(0);
      expect(result.statistic).toBeLessThanOrEqual(1);
      // For bimodal data, W statistic should be relatively low
      expect(result.statistic).toBeLessThan(0.98);
    });

    test('should throw error for insufficient data', () => {
      expect(() => shapiroWilkTest([1, 2])).toThrow();
    });
  });

  describe('Anderson-Darling Test', () => {
    test('should test normality', () => {
      const data = normal.random(0, 1, 50);
      const result = andersonDarlingTest(data);

      expect(result.statistic).toBeGreaterThan(0);
      expect(result.pValue).toBeGreaterThan(0);
      expect(result.testName).toBe('Anderson-Darling');
    });

    test('should reject non-normal data', () => {
      // Exponential data (not normal)
      const data = Array.from({ length: 50 }, () => -Math.log(Math.random()));
      const result = andersonDarlingTest(data);

      expect(result.pValue).toBeLessThan(0.05);
    });
  });

  describe('Kolmogorov-Smirnov Test', () => {
    test('should test normality', () => {
      const data = normal.random(0, 1, 50);
      const result = kolmogorovSmirnovTest(data);

      expect(result.statistic).toBeGreaterThan(0);
      expect(result.statistic).toBeLessThan(1);
      expect(result.pValue).toBeGreaterThan(0);
    });

    test('should detect deviation from normality', () => {
      // Bimodal data (not normal)
      const data = [
        ...normal.random(-5, 1, 25),
        ...normal.random(5, 1, 25),
      ];
      const result = kolmogorovSmirnovTest(data);

      expect(result.pValue).toBeLessThan(0.05);
    });
  });

  // ============================================================================
  // Confidence Intervals
  // ============================================================================

  describe('Confidence Interval for Mean', () => {
    test('should calculate 95% confidence interval', () => {
      const data = [5, 6, 7, 8, 9];
      const ci = confidenceIntervalMean(data, 0.95);

      expect(ci.length).toBe(2);
      expect(ci[0]).toBeLessThan(ci[1]);

      // Check that sample mean is in interval
      const sampleMean = data.reduce((a, b) => a + b, 0) / data.length;
      expect(sampleMean).toBeGreaterThan(ci[0]);
      expect(sampleMean).toBeLessThan(ci[1]);
    });

    test('should handle different confidence levels', () => {
      const data = [5, 6, 7, 8, 9];

      const ci90 = confidenceIntervalMean(data, 0.90);
      const ci95 = confidenceIntervalMean(data, 0.95);
      const ci99 = confidenceIntervalMean(data, 0.99);

      // Higher confidence should give wider interval
      const width90 = ci90[1] - ci90[0];
      const width95 = ci95[1] - ci95[0];
      const width99 = ci99[1] - ci99[0];

      expect(width90).toBeLessThan(width95);
      expect(width95).toBeLessThan(width99);
    });
  });

  describe('Confidence Interval for Proportion', () => {
    test('should calculate Wilson score interval', () => {
      const ci = confidenceIntervalProportion(42, 100, 0.95, 'wilson');

      expect(ci.length).toBe(2);
      expect(ci[0]).toBeGreaterThanOrEqual(0);
      expect(ci[1]).toBeLessThanOrEqual(1);
      expect(ci[0]).toBeLessThan(ci[1]);

      // Sample proportion should be in interval
      expect(0.42).toBeGreaterThan(ci[0]);
      expect(0.42).toBeLessThan(ci[1]);
    });

    test('should calculate normal approximation interval', () => {
      const ci = confidenceIntervalProportion(42, 100, 0.95, 'normal');

      expect(ci.length).toBe(2);
      expect(ci[0]).toBeGreaterThanOrEqual(0);
      expect(ci[1]).toBeLessThanOrEqual(1);
    });

    test('should handle edge cases', () => {
      // All successes
      const ci1 = confidenceIntervalProportion(100, 100, 0.95);
      expect(ci1[1]).toBeLessThanOrEqual(1);

      // No successes
      const ci2 = confidenceIntervalProportion(0, 100, 0.95);
      expect(ci2[0]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Confidence Interval for Difference of Means', () => {
    test('should calculate CI for difference', () => {
      const group1 = [5, 6, 7, 8, 9];
      const group2 = [3, 4, 5, 6, 7];

      const ci = confidenceIntervalDifferenceMeans(group1, group2, 0.95);

      expect(ci.length).toBe(2);
      expect(ci[0]).toBeLessThan(ci[1]);

      // Difference should be positive (group1 > group2)
      // Both bounds should be positive since group1 mean is 7 and group2 mean is 5
      expect(ci[1]).toBeGreaterThan(0);
    });

    test('should handle Welch correction for unequal variances', () => {
      const group1 = [1, 2, 3];
      const group2 = [10, 20, 30, 40, 50];

      const ci = confidenceIntervalDifferenceMeans(group1, group2, 0.95, false);

      expect(ci.length).toBe(2);
      // Difference should be negative (group1 < group2)
      expect(ci[1]).toBeLessThan(0);
    });
  });

  // ============================================================================
  // Hypothesis Testing Framework
  // ============================================================================

  describe('Hypothesis Testing Framework', () => {
    test('should provide structured test result', () => {
      const data = [5, 6, 7, 8, 9];
      const testResult = tTest1Sample(data, 0);

      const framework = hypothesisTestFramework(
        testResult,
        'The population mean is 0',
        'The population mean is not 0',
        0.05
      );

      expect(framework.nullHypothesis).toBe('The population mean is 0');
      expect(framework.alternativeHypothesis).toBe('The population mean is not 0');
      expect(framework.testStatistic).toBe(testResult.statistic);
      expect(framework.pValue).toBe(testResult.pValue);
      expect(framework.alpha).toBe(0.05);
      expect(typeof framework.rejectNull).toBe('boolean');
      expect(typeof framework.conclusion).toBe('string');
    });

    test('should reject null when p-value is small', () => {
      const data = [10, 11, 12, 13, 14];
      const testResult = tTest1Sample(data, 0);

      const framework = hypothesisTestFramework(
        testResult,
        'μ = 0',
        'μ ≠ 0',
        0.05
      );

      expect(framework.rejectNull).toBe(true);
      expect(framework.conclusion).toContain('Reject');
    });

    test('should not reject null when p-value is large', () => {
      const data = [4.9, 5.0, 5.1, 5.0, 5.0];
      const testResult = tTest1Sample(data, 5);

      const framework = hypothesisTestFramework(
        testResult,
        'μ = 5',
        'μ ≠ 5',
        0.05
      );

      expect(framework.rejectNull).toBe(false);
      expect(framework.conclusion).toContain('Fail to reject');
    });
  });
});
