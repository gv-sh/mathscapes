/**
 * Statistical Tests Module
 *
 * This module provides comprehensive statistical hypothesis testing functions including
 * t-tests, chi-squared tests, ANOVA, normality tests, and confidence intervals.
 *
 * All tests return results with test statistic, p-value, and relevant parameters.
 */

import { mean, variance, standardDeviation } from './descriptive';
import { normal, studentT, chiSquared, fDistribution } from './distributions';

/**
 * Result of a statistical hypothesis test
 */
export interface TestResult {
  /** Test statistic value */
  statistic: number;
  /** p-value (probability of observing test statistic under null hypothesis) */
  pValue: number;
  /** Degrees of freedom (if applicable) */
  degreesOfFreedom?: number | number[];
  /** Additional test-specific information */
  [key: string]: any;
}

// ============================================================================
// t-Tests
// ============================================================================

/**
 * One-sample t-test
 *
 * Tests whether the mean of a sample differs from a hypothesized value.
 *
 * Null hypothesis: μ = μ₀
 * Alternative: μ ≠ μ₀ (two-sided), μ > μ₀ (greater), μ < μ₀ (less)
 *
 * Test statistic: t = (x̄ - μ₀) / (s / √n)
 *
 * @param data - Sample data
 * @param populationMean - Hypothesized population mean (default: 0)
 * @param alternative - 'two-sided', 'greater', or 'less' (default: 'two-sided')
 * @returns Test result with statistic and p-value
 *
 * @example
 * ```ts
 * const data = [2.3, 1.9, 2.1, 2.5, 2.0];
 * const result = tTest1Sample(data, 2.0);
 * console.log(`t = ${result.statistic}, p = ${result.pValue}`);
 * ```
 */
export function tTest1Sample(
  data: number[],
  populationMean: number = 0,
  alternative: 'two-sided' | 'greater' | 'less' = 'two-sided'
): TestResult {
  if (data.length < 2) {
    throw new Error('Sample size must be at least 2');
  }

  const n = data.length;
  const sampleMean = mean(data);
  const sampleStd = standardDeviation(data, true); // sample std dev
  const standardError = sampleStd / Math.sqrt(n);

  const tStatistic = (sampleMean - populationMean) / standardError;
  const df = n - 1;

  // Calculate p-value based on alternative hypothesis
  let pValue: number;
  if (alternative === 'two-sided') {
    pValue = 2 * (1 - studentT.cdf(Math.abs(tStatistic), df));
  } else if (alternative === 'greater') {
    pValue = 1 - studentT.cdf(tStatistic, df);
  } else {
    pValue = studentT.cdf(tStatistic, df);
  }

  return {
    statistic: tStatistic,
    pValue,
    degreesOfFreedom: df,
    sampleMean,
    standardError,
    alternative
  };
}

/**
 * Two-sample t-test (independent samples)
 *
 * Tests whether two independent samples have different means.
 *
 * Null hypothesis: μ₁ = μ₂
 * Alternative: μ₁ ≠ μ₂ (two-sided), μ₁ > μ₂ (greater), μ₁ < μ₂ (less)
 *
 * @param data1 - First sample
 * @param data2 - Second sample
 * @param equalVariance - Assume equal variances (default: true)
 * @param alternative - 'two-sided', 'greater', or 'less' (default: 'two-sided')
 * @returns Test result
 *
 * @example
 * ```ts
 * const group1 = [2.3, 1.9, 2.1, 2.5, 2.0];
 * const group2 = [1.8, 1.5, 1.7, 1.9, 1.6];
 * const result = tTest2Sample(group1, group2);
 * ```
 */
export function tTest2Sample(
  data1: number[],
  data2: number[],
  equalVariance: boolean = true,
  alternative: 'two-sided' | 'greater' | 'less' = 'two-sided'
): TestResult {
  if (data1.length < 2 || data2.length < 2) {
    throw new Error('Each sample must have at least 2 observations');
  }

  const n1 = data1.length;
  const n2 = data2.length;
  const mean1 = mean(data1);
  const mean2 = mean(data2);
  const var1 = variance(data1, true);
  const var2 = variance(data2, true);

  let tStatistic: number;
  let df: number;
  let standardError: number;

  if (equalVariance) {
    // Pooled variance t-test
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    standardError = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
    tStatistic = (mean1 - mean2) / standardError;
    df = n1 + n2 - 2;
  } else {
    // Welch's t-test (unequal variances)
    standardError = Math.sqrt(var1 / n1 + var2 / n2);
    tStatistic = (mean1 - mean2) / standardError;

    // Welch-Satterthwaite degrees of freedom
    const num = Math.pow(var1 / n1 + var2 / n2, 2);
    const denom = Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1);
    df = num / denom;
  }

  // Calculate p-value
  let pValue: number;
  if (alternative === 'two-sided') {
    pValue = 2 * (1 - studentT.cdf(Math.abs(tStatistic), df));
  } else if (alternative === 'greater') {
    pValue = 1 - studentT.cdf(tStatistic, df);
  } else {
    pValue = studentT.cdf(tStatistic, df);
  }

  return {
    statistic: tStatistic,
    pValue,
    degreesOfFreedom: df,
    mean1,
    mean2,
    standardError,
    equalVariance,
    alternative
  };
}

/**
 * Paired t-test
 *
 * Tests whether the mean difference between paired observations is zero.
 *
 * Null hypothesis: μ_d = 0 (mean of differences is zero)
 *
 * @param data1 - First set of observations
 * @param data2 - Second set of observations (paired with data1)
 * @param alternative - 'two-sided', 'greater', or 'less' (default: 'two-sided')
 * @returns Test result
 *
 * @example
 * ```ts
 * const before = [120, 135, 125, 130, 128];
 * const after = [115, 130, 122, 125, 124];
 * const result = tTestPaired(before, after);
 * ```
 */
export function tTestPaired(
  data1: number[],
  data2: number[],
  alternative: 'two-sided' | 'greater' | 'less' = 'two-sided'
): TestResult {
  if (data1.length !== data2.length) {
    throw new Error('Paired samples must have equal length');
  }
  if (data1.length < 2) {
    throw new Error('Sample size must be at least 2');
  }

  // Compute differences
  const differences = data1.map((x, i) => x - data2[i]);

  // Perform one-sample t-test on differences
  return tTest1Sample(differences, 0, alternative);
}

// ============================================================================
// Chi-Squared Tests
// ============================================================================

/**
 * Chi-squared goodness-of-fit test
 *
 * Tests whether observed frequencies match expected frequencies.
 *
 * Null hypothesis: Observed frequencies follow the expected distribution
 * Test statistic: χ² = Σ((O - E)² / E)
 *
 * @param observed - Observed frequencies
 * @param expected - Expected frequencies (or null for uniform distribution)
 * @returns Test result
 *
 * @example
 * ```ts
 * const observed = [25, 30, 20, 25];
 * const expected = [25, 25, 25, 25]; // uniform
 * const result = chiSquaredTest(observed, expected);
 * ```
 */
export function chiSquaredTest(
  observed: number[],
  expected?: number[]
): TestResult {
  if (observed.length < 2) {
    throw new Error('Need at least 2 categories');
  }

  // If expected not provided, assume uniform distribution
  if (!expected) {
    const total = observed.reduce((a, b) => a + b, 0);
    expected = Array(observed.length).fill(total / observed.length);
  }

  if (observed.length !== expected.length) {
    throw new Error('Observed and expected must have same length');
  }

  // Calculate chi-squared statistic
  let chiSq = 0;
  for (let i = 0; i < observed.length; i++) {
    if (expected[i] <= 0) {
      throw new Error('Expected frequencies must be positive');
    }
    chiSq += Math.pow(observed[i] - expected[i], 2) / expected[i];
  }

  const df = observed.length - 1;
  const pValue = 1 - chiSquared.cdf(chiSq, df);

  return {
    statistic: chiSq,
    pValue,
    degreesOfFreedom: df,
    observed,
    expected
  };
}

/**
 * Chi-squared test of independence (contingency table)
 *
 * Tests whether two categorical variables are independent.
 *
 * @param table - Contingency table (2D array)
 * @returns Test result
 *
 * @example
 * ```ts
 * const table = [
 *   [10, 15, 5],  // Category A
 *   [20, 10, 10]  // Category B
 * ];
 * const result = chiSquaredIndependence(table);
 * ```
 */
export function chiSquaredIndependence(table: number[][]): TestResult {
  const rows = table.length;
  const cols = table[0].length;

  if (rows < 2 || cols < 2) {
    throw new Error('Contingency table must be at least 2×2');
  }

  // Calculate row and column totals
  const rowTotals = table.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals: number[] = Array(cols).fill(0);
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      colTotals[j] += table[i][j];
    }
  }
  const total = rowTotals.reduce((a, b) => a + b, 0);

  // Calculate expected frequencies and chi-squared statistic
  let chiSq = 0;
  const expected: number[][] = [];

  for (let i = 0; i < rows; i++) {
    expected[i] = [];
    for (let j = 0; j < cols; j++) {
      const exp = (rowTotals[i] * colTotals[j]) / total;
      expected[i][j] = exp;
      if (exp > 0) {
        chiSq += Math.pow(table[i][j] - exp, 2) / exp;
      }
    }
  }

  const df = (rows - 1) * (cols - 1);
  const pValue = 1 - chiSquared.cdf(chiSq, df);

  return {
    statistic: chiSq,
    pValue,
    degreesOfFreedom: df,
    observed: table,
    expected
  };
}

/**
 * Fisher's exact test
 *
 * Tests independence in 2×2 contingency tables (exact test for small samples).
 *
 * @param table - 2×2 contingency table [[a, b], [c, d]]
 * @param alternative - 'two-sided', 'greater', or 'less' (default: 'two-sided')
 * @returns Test result
 *
 * @example
 * ```ts
 * const table = [[8, 2], [1, 5]];
 * const result = fisherExactTest(table);
 * ```
 */
export function fisherExactTest(
  table: number[][],
  alternative: 'two-sided' | 'greater' | 'less' = 'two-sided'
): TestResult {
  if (table.length !== 2 || table[0].length !== 2 || table[1].length !== 2) {
    throw new Error('Table must be 2×2');
  }

  const [[a, b], [c, d]] = table;

  // Check all values are non-negative integers
  if ([a, b, c, d].some(x => x < 0 || !Number.isInteger(x))) {
    throw new Error('All counts must be non-negative integers');
  }

  const n1 = a + b;
  const n2 = c + d;
  const k1 = a + c;
  const k2 = b + d;
  const n = n1 + n2;

  /**
   * Hypergeometric probability for a given value of a
   */
  function hypergeomProb(x: number): number {
    return (
      binomCoeff(n1, x) * binomCoeff(n2, k1 - x) / binomCoeff(n, k1)
    );
  }

  function binomCoeff(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    k = Math.min(k, n - k);
    let result = 1;
    for (let i = 0; i < k; i++) {
      result *= (n - i) / (i + 1);
    }
    return result;
  }

  const observedProb = hypergeomProb(a);

  // Calculate p-value based on alternative
  let pValue = 0;
  const minA = Math.max(0, k1 - n2);
  const maxA = Math.min(n1, k1);

  if (alternative === 'two-sided') {
    // Sum probabilities of tables as extreme or more extreme
    for (let x = minA; x <= maxA; x++) {
      const prob = hypergeomProb(x);
      if (prob <= observedProb + 1e-10) {
        pValue += prob;
      }
    }
  } else if (alternative === 'greater') {
    // Sum probabilities for x >= a
    for (let x = a; x <= maxA; x++) {
      pValue += hypergeomProb(x);
    }
  } else {
    // Sum probabilities for x <= a
    for (let x = minA; x <= a; x++) {
      pValue += hypergeomProb(x);
    }
  }

  // Calculate odds ratio
  const oddsRatio = (a * d) / (b * c || 1e-10);

  return {
    statistic: oddsRatio,
    pValue: Math.min(pValue, 1), // Ensure p-value doesn't exceed 1 due to rounding
    oddsRatio,
    alternative,
    table
  };
}

// ============================================================================
// ANOVA (Analysis of Variance)
// ============================================================================

/**
 * One-way ANOVA
 *
 * Tests whether means of multiple groups are equal.
 *
 * Null hypothesis: μ₁ = μ₂ = ... = μₖ
 * Test statistic: F = MSB / MSW
 *
 * where MSB is mean square between groups and MSW is mean square within groups.
 *
 * @param groups - Array of data arrays, one per group
 * @returns Test result
 *
 * @example
 * ```ts
 * const group1 = [2.3, 1.9, 2.1];
 * const group2 = [3.1, 2.8, 3.0];
 * const group3 = [1.8, 1.5, 1.7];
 * const result = anovaOneWay([group1, group2, group3]);
 * ```
 */
export function anovaOneWay(groups: number[][]): TestResult {
  if (groups.length < 2) {
    throw new Error('Need at least 2 groups');
  }

  const k = groups.length; // number of groups
  const n = groups.reduce((sum, g) => sum + g.length, 0); // total observations

  if (n < k + 1) {
    throw new Error('Need more observations than groups');
  }

  // Calculate group means and overall mean
  const groupMeans = groups.map(g => mean(g));
  const groupSizes = groups.map(g => g.length);
  const allData = groups.flat();
  const grandMean = mean(allData);

  // Calculate sum of squares between groups (SSB)
  let ssb = 0;
  for (let i = 0; i < k; i++) {
    ssb += groupSizes[i] * Math.pow(groupMeans[i] - grandMean, 2);
  }

  // Calculate sum of squares within groups (SSW)
  let ssw = 0;
  for (let i = 0; i < k; i++) {
    for (const x of groups[i]) {
      ssw += Math.pow(x - groupMeans[i], 2);
    }
  }

  // Calculate mean squares
  const dfBetween = k - 1;
  const dfWithin = n - k;
  const msb = ssb / dfBetween;
  const msw = ssw / dfWithin;

  // Calculate F-statistic
  const fStatistic = msb / msw;
  const pValue = 1 - fDistribution.cdf(fStatistic, dfBetween, dfWithin);

  return {
    statistic: fStatistic,
    pValue,
    degreesOfFreedom: [dfBetween, dfWithin],
    sumOfSquaresBetween: ssb,
    sumOfSquaresWithin: ssw,
    meanSquareBetween: msb,
    meanSquareWithin: msw,
    groupMeans
  };
}

/**
 * Two-way ANOVA (without interaction)
 *
 * Tests effects of two factors on a dependent variable.
 *
 * @param data - 2D array where data[i][j] contains observations for level i of factor A and level j of factor B
 * @returns Test results for both factors
 *
 * @example
 * ```ts
 * const data = [
 *   [[5, 6], [7, 8]],  // Factor A, level 1
 *   [[4, 5], [6, 7]]   // Factor A, level 2
 * ];
 * const result = anovaTwoWay(data);
 * ```
 */
export function anovaTwoWay(data: number[][][]): {
  factorA: TestResult;
  factorB: TestResult;
  residual: {
    sumOfSquares: number;
    degreesOfFreedom: number;
    meanSquare: number;
  };
} {
  const a = data.length; // levels of factor A
  const b = data[0].length; // levels of factor B

  if (a < 2 || b < 2) {
    throw new Error('Need at least 2 levels for each factor');
  }

  // Flatten all data and calculate grand mean
  const allData: number[] = [];
  let n = 0; // number of observations per cell (assuming balanced design)
  const cellMeans: number[][] = [];

  for (let i = 0; i < a; i++) {
    cellMeans[i] = [];
    for (let j = 0; j < b; j++) {
      const cell = data[i][j];
      allData.push(...cell);
      cellMeans[i][j] = mean(cell);
      if (i === 0 && j === 0) n = cell.length;
    }
  }

  const grandMean = mean(allData);

  // Calculate row means (factor A) and column means (factor B)
  const rowMeans: number[] = [];
  for (let i = 0; i < a; i++) {
    const rowData = data[i].flat(2);
    rowMeans[i] = mean(rowData);
  }

  const colMeans: number[] = [];
  for (let j = 0; j < b; j++) {
    const colData: number[] = [];
    for (let i = 0; i < a; i++) {
      colData.push(...data[i][j]);
    }
    colMeans[j] = mean(colData);
  }

  // Calculate sum of squares for factor A
  let ssA = 0;
  for (let i = 0; i < a; i++) {
    ssA += b * n * Math.pow(rowMeans[i] - grandMean, 2);
  }

  // Calculate sum of squares for factor B
  let ssB = 0;
  for (let j = 0; j < b; j++) {
    ssB += a * n * Math.pow(colMeans[j] - grandMean, 2);
  }

  // Calculate sum of squares within (residual)
  let ssW = 0;
  for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
      for (const x of data[i][j]) {
        ssW += Math.pow(x - cellMeans[i][j], 2);
      }
    }
  }

  // Degrees of freedom
  const dfA = a - 1;
  const dfB = b - 1;
  const dfW = a * b * (n - 1);

  // Mean squares
  const msA = ssA / dfA;
  const msB = ssB / dfB;
  const msW = ssW / dfW;

  // F-statistics
  const fA = msA / msW;
  const fB = msB / msW;

  const pValueA = 1 - fDistribution.cdf(fA, dfA, dfW);
  const pValueB = 1 - fDistribution.cdf(fB, dfB, dfW);

  return {
    factorA: {
      statistic: fA,
      pValue: pValueA,
      degreesOfFreedom: [dfA, dfW],
      sumOfSquares: ssA,
      meanSquare: msA
    },
    factorB: {
      statistic: fB,
      pValue: pValueB,
      degreesOfFreedom: [dfB, dfW],
      sumOfSquares: ssB,
      meanSquare: msB
    },
    residual: {
      sumOfSquares: ssW,
      degreesOfFreedom: dfW,
      meanSquare: msW
    }
  };
}

// ============================================================================
// Normality Tests
// ============================================================================

/**
 * Shapiro-Wilk test for normality
 *
 * Tests whether a sample comes from a normal distribution.
 * Works best for sample sizes 3 ≤ n ≤ 5000.
 *
 * Null hypothesis: Data follows a normal distribution
 *
 * @param data - Sample data
 * @returns Test result
 *
 * @example
 * ```ts
 * const data = normal.random(0, 1, 100);
 * const result = shapiroWilkTest(data);
 * ```
 */
export function shapiroWilkTest(data: number[]): TestResult {
  const n = data.length;

  if (n < 3) {
    throw new Error('Sample size must be at least 3');
  }
  if (n > 5000) {
    throw new Error('Sample size too large for Shapiro-Wilk test (max 5000)');
  }

  // Sort data
  const sorted = [...data].sort((a, b) => a - b);

  // Calculate mean and variance
  const dataMean = mean(data);
  const dataVar = variance(data, true);

  // Calculate coefficients (simplified approximation)
  const m: number[] = [];
  for (let i = 0; i < n; i++) {
    m[i] = normal.quantile((i + 1 - 0.375) / (n + 0.25), 0, 1);
  }

  const mSum = m.reduce((a, b) => a + b, 0);
  const mSumSq = m.reduce((a, b) => a + b * b, 0);

  const a: number[] = [];
  const c = 1 / Math.sqrt(mSumSq);
  for (let i = 0; i < n; i++) {
    a[i] = (m[i] - mSum / n) * c;
  }

  // Calculate W statistic
  let b = 0;
  for (let i = 0; i < n; i++) {
    b += a[i] * sorted[i];
  }

  const W = (b * b) / ((n - 1) * dataVar);

  // Approximate p-value using transformation
  // This is a simplified approximation
  const ln1minusW = Math.log(1 - W);
  const mu = -1.2725 + 1.0521 * Math.pow(Math.log(n), 1.5);
  const sigma = 1.0308 - 0.26758 * Math.log(Math.log(n));
  const z = (ln1minusW - mu) / sigma;
  const pValue = 1 - normal.cdf(z, 0, 1);

  return {
    statistic: W,
    pValue: Math.max(0, Math.min(1, pValue)), // Clamp to [0, 1]
    testName: 'Shapiro-Wilk'
  };
}

/**
 * Anderson-Darling test for normality
 *
 * Tests whether a sample comes from a normal distribution.
 * More sensitive to deviations in the tails than Shapiro-Wilk.
 *
 * Null hypothesis: Data follows a normal distribution
 *
 * @param data - Sample data
 * @returns Test result
 *
 * @example
 * ```ts
 * const data = [2.3, 1.9, 2.1, 2.5, 2.0, 1.8, 2.2];
 * const result = andersonDarlingTest(data);
 * ```
 */
export function andersonDarlingTest(data: number[]): TestResult {
  const n = data.length;

  if (n < 3) {
    throw new Error('Sample size must be at least 3');
  }

  // Estimate parameters (mean and std dev)
  const dataMean = mean(data);
  const dataStd = standardDeviation(data, true);

  // Sort data
  const sorted = [...data].sort((a, b) => a - b);

  // Calculate standardized CDF values
  const F: number[] = [];
  for (let i = 0; i < n; i++) {
    F[i] = normal.cdf(sorted[i], dataMean, dataStd);
    // Avoid log(0) or log(1)
    F[i] = Math.max(1e-10, Math.min(1 - 1e-10, F[i]));
  }

  // Calculate A² statistic
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (2 * (i + 1) - 1) * (Math.log(F[i]) + Math.log(1 - F[n - 1 - i]));
  }

  const A2 = -n - sum / n;

  // Adjust for sample size
  const A2adjusted = A2 * (1 + 0.75 / n + 2.25 / (n * n));

  // Approximate p-value (critical values)
  let pValue: number;
  if (A2adjusted < 0.2) {
    pValue = 1 - Math.exp(-13.436 + 101.14 * A2adjusted - 223.73 * A2adjusted * A2adjusted);
  } else if (A2adjusted < 0.34) {
    pValue = 1 - Math.exp(-8.318 + 42.796 * A2adjusted - 59.938 * A2adjusted * A2adjusted);
  } else if (A2adjusted < 0.6) {
    pValue = Math.exp(0.9177 - 4.279 * A2adjusted - 1.38 * A2adjusted * A2adjusted);
  } else {
    pValue = Math.exp(1.2937 - 5.709 * A2adjusted + 0.0186 * A2adjusted * A2adjusted);
  }

  pValue = Math.max(0, Math.min(1, pValue));

  return {
    statistic: A2adjusted,
    pValue,
    testName: 'Anderson-Darling'
  };
}

/**
 * Kolmogorov-Smirnov test for normality
 *
 * Tests whether a sample comes from a normal distribution.
 *
 * Null hypothesis: Data follows a normal distribution
 *
 * @param data - Sample data
 * @returns Test result
 *
 * @example
 * ```ts
 * const data = [2.3, 1.9, 2.1, 2.5, 2.0];
 * const result = kolmogorovSmirnovTest(data);
 * ```
 */
export function kolmogorovSmirnovTest(data: number[]): TestResult {
  const n = data.length;

  if (n < 3) {
    throw new Error('Sample size must be at least 3');
  }

  // Estimate parameters
  const dataMean = mean(data);
  const dataStd = standardDeviation(data, true);

  // Sort data
  const sorted = [...data].sort((a, b) => a - b);

  // Calculate D statistic (maximum distance between empirical and theoretical CDF)
  let dPlus = 0;
  let dMinus = 0;

  for (let i = 0; i < n; i++) {
    const empiricalCDF = (i + 1) / n;
    const theoreticalCDF = normal.cdf(sorted[i], dataMean, dataStd);

    dPlus = Math.max(dPlus, empiricalCDF - theoreticalCDF);
    dMinus = Math.max(dMinus, theoreticalCDF - (i / n));
  }

  const D = Math.max(dPlus, dMinus);

  // Approximate p-value using Kolmogorov distribution
  // This is a simplified approximation
  const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * D;

  let pValue = 0;
  for (let k = 1; k <= 100; k++) {
    pValue += Math.pow(-1, k - 1) * Math.exp(-2 * k * k * lambda * lambda);
  }
  pValue *= 2;
  pValue = Math.max(0, Math.min(1, pValue));

  return {
    statistic: D,
    pValue,
    testName: 'Kolmogorov-Smirnov'
  };
}

// ============================================================================
// Confidence Intervals
// ============================================================================

/**
 * Confidence interval for mean (normal distribution)
 *
 * @param data - Sample data
 * @param confidence - Confidence level (default: 0.95 for 95%)
 * @returns Confidence interval [lower, upper]
 *
 * @example
 * ```ts
 * const data = [2.3, 1.9, 2.1, 2.5, 2.0];
 * const ci = confidenceIntervalMean(data, 0.95);
 * console.log(`95% CI: [${ci[0]}, ${ci[1]}]`);
 * ```
 */
export function confidenceIntervalMean(
  data: number[],
  confidence: number = 0.95
): [number, number] {
  if (data.length < 2) {
    throw new Error('Sample size must be at least 2');
  }
  if (confidence <= 0 || confidence >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }

  const n = data.length;
  const sampleMean = mean(data);
  const sampleStd = standardDeviation(data, true);
  const standardError = sampleStd / Math.sqrt(n);

  // Use t-distribution for small samples
  const alpha = 1 - confidence;
  const tCritical = studentT.quantile(1 - alpha / 2, n - 1);

  const marginOfError = tCritical * standardError;

  return [sampleMean - marginOfError, sampleMean + marginOfError];
}

/**
 * Confidence interval for proportion
 *
 * @param successes - Number of successes
 * @param trials - Number of trials
 * @param confidence - Confidence level (default: 0.95)
 * @param method - 'normal' or 'wilson' (default: 'wilson')
 * @returns Confidence interval [lower, upper]
 *
 * @example
 * ```ts
 * const ci = confidenceIntervalProportion(42, 100, 0.95);
 * console.log(`95% CI: [${ci[0]}, ${ci[1]}]`);
 * ```
 */
export function confidenceIntervalProportion(
  successes: number,
  trials: number,
  confidence: number = 0.95,
  method: 'normal' | 'wilson' = 'wilson'
): [number, number] {
  if (trials < 1) {
    throw new Error('Number of trials must be at least 1');
  }
  if (successes < 0 || successes > trials) {
    throw new Error('Successes must be between 0 and trials');
  }
  if (confidence <= 0 || confidence >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }

  const p = successes / trials;
  const alpha = 1 - confidence;
  const z = normal.quantile(1 - alpha / 2, 0, 1);

  if (method === 'normal') {
    // Normal approximation (Wald interval)
    const se = Math.sqrt(p * (1 - p) / trials);
    const marginOfError = z * se;
    return [
      Math.max(0, p - marginOfError),
      Math.min(1, p + marginOfError)
    ];
  } else {
    // Wilson score interval (better for small samples or extreme proportions)
    const denominator = 1 + z * z / trials;
    const center = (p + z * z / (2 * trials)) / denominator;
    const margin = (z / denominator) * Math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials));

    return [
      Math.max(0, center - margin),
      Math.min(1, center + margin)
    ];
  }
}

/**
 * Confidence interval for difference of means (two independent samples)
 *
 * @param data1 - First sample
 * @param data2 - Second sample
 * @param confidence - Confidence level (default: 0.95)
 * @param equalVariance - Assume equal variances (default: true)
 * @returns Confidence interval [lower, upper]
 */
export function confidenceIntervalDifferenceMeans(
  data1: number[],
  data2: number[],
  confidence: number = 0.95,
  equalVariance: boolean = true
): [number, number] {
  if (data1.length < 2 || data2.length < 2) {
    throw new Error('Each sample must have at least 2 observations');
  }
  if (confidence <= 0 || confidence >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }

  const n1 = data1.length;
  const n2 = data2.length;
  const mean1 = mean(data1);
  const mean2 = mean(data2);
  const var1 = variance(data1, true);
  const var2 = variance(data2, true);

  let standardError: number;
  let df: number;

  if (equalVariance) {
    // Pooled variance
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    standardError = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
    df = n1 + n2 - 2;
  } else {
    // Welch's method
    standardError = Math.sqrt(var1 / n1 + var2 / n2);
    const num = Math.pow(var1 / n1 + var2 / n2, 2);
    const denom = Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1);
    df = num / denom;
  }

  const alpha = 1 - confidence;
  const tCritical = studentT.quantile(1 - alpha / 2, df);
  const marginOfError = tCritical * standardError;

  const diff = mean1 - mean2;
  return [diff - marginOfError, diff + marginOfError];
}

/**
 * General hypothesis testing framework result
 */
export interface HypothesisTestFramework {
  /** Null hypothesis description */
  nullHypothesis: string;
  /** Alternative hypothesis description */
  alternativeHypothesis: string;
  /** Test statistic value */
  testStatistic: number;
  /** p-value */
  pValue: number;
  /** Significance level (alpha) */
  alpha: number;
  /** Whether to reject null hypothesis */
  rejectNull: boolean;
  /** Conclusion statement */
  conclusion: string;
}

/**
 * Hypothesis test framework wrapper
 *
 * Provides a structured approach to hypothesis testing with clear interpretation.
 *
 * @param testResult - Result from any statistical test
 * @param nullHypothesis - Description of null hypothesis
 * @param alternativeHypothesis - Description of alternative hypothesis
 * @param alpha - Significance level (default: 0.05)
 * @returns Structured test result with conclusion
 */
export function hypothesisTestFramework(
  testResult: TestResult,
  nullHypothesis: string,
  alternativeHypothesis: string,
  alpha: number = 0.05
): HypothesisTestFramework {
  const rejectNull = testResult.pValue < alpha;

  const conclusion = rejectNull
    ? `Reject null hypothesis (p = ${testResult.pValue.toFixed(4)} < α = ${alpha}). ` +
      `Evidence supports: ${alternativeHypothesis}`
    : `Fail to reject null hypothesis (p = ${testResult.pValue.toFixed(4)} ≥ α = ${alpha}). ` +
      `Insufficient evidence against: ${nullHypothesis}`;

  return {
    nullHypothesis,
    alternativeHypothesis,
    testStatistic: testResult.statistic,
    pValue: testResult.pValue,
    alpha,
    rejectNull,
    conclusion
  };
}
