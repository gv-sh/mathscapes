/**
 * Descriptive Statistics Module
 *
 * This module provides functions for calculating descriptive statistics
 * including measures of central tendency, dispersion, and distribution shape.
 */

/**
 * Calculates the arithmetic mean (average) of an array of numbers.
 *
 * The mean is the sum of all values divided by the count of values:
 * μ = (Σ xᵢ) / n
 *
 * @param data - Array of numbers
 * @returns The mean value
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * mean([1, 2, 3, 4, 5]); // 3
 * mean([10, 20, 30]); // 20
 * ```
 */
export function mean(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

/**
 * Calculates the median (middle value) of an array of numbers.
 *
 * The median is the middle value when data is sorted. For even-length arrays,
 * it's the average of the two middle values.
 *
 * @param data - Array of numbers
 * @returns The median value
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * median([1, 2, 3, 4, 5]); // 3
 * median([1, 2, 3, 4]); // 2.5
 * ```
 */
export function median(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate median of empty array');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Calculates the mode (most frequent value) of an array of numbers.
 *
 * Returns an array of modes as there can be multiple modes (multimodal distribution).
 * Returns empty array if all values appear with equal frequency.
 *
 * @param data - Array of numbers
 * @returns Array of mode values
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * mode([1, 2, 2, 3, 3, 3]); // [3]
 * mode([1, 1, 2, 2, 3]); // [1, 2]
 * mode([1, 2, 3]); // []
 * ```
 */
export function mode(data: number[]): number[] {
  if (data.length === 0) {
    throw new Error('Cannot calculate mode of empty array');
  }

  const frequency = new Map<number, number>();
  let maxFreq = 0;

  // Count frequencies
  for (const val of data) {
    const freq = (frequency.get(val) || 0) + 1;
    frequency.set(val, freq);
    maxFreq = Math.max(maxFreq, freq);
  }

  // If all values appear once, no mode
  if (maxFreq === 1) {
    return [];
  }

  // Find all values with max frequency
  const modes: number[] = [];
  for (const [val, freq] of frequency.entries()) {
    if (freq === maxFreq) {
      modes.push(val);
    }
  }

  return modes.sort((a, b) => a - b);
}

/**
 * Calculates the trimmed mean by removing a percentage of extreme values.
 *
 * A trimmed mean removes a specified percentage of the smallest and largest
 * values before calculating the mean. This provides a more robust measure
 * of central tendency that is less affected by outliers.
 *
 * @param data - Array of numbers
 * @param trimProportion - Proportion to trim from each end (0 to 0.5)
 * @returns The trimmed mean
 * @throws Error if array is empty or trimProportion is invalid
 *
 * @example
 * ```ts
 * trimmedMean([1, 2, 3, 4, 100], 0.2); // trims 1 value from each end
 * trimmedMean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.1); // 10% trim
 * ```
 */
export function trimmedMean(data: number[], trimProportion: number = 0.1): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate trimmed mean of empty array');
  }
  if (trimProportion < 0 || trimProportion >= 0.5) {
    throw new Error('Trim proportion must be between 0 and 0.5');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const trimCount = Math.floor(data.length * trimProportion);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

  if (trimmed.length === 0) {
    throw new Error('Trim proportion too large for data size');
  }

  return mean(trimmed);
}

/**
 * Calculates the variance of an array of numbers.
 *
 * Variance measures the average squared deviation from the mean:
 * σ² = Σ(xᵢ - μ)² / n (population)
 * s² = Σ(xᵢ - x̄)² / (n-1) (sample)
 *
 * @param data - Array of numbers
 * @param sample - If true, calculates sample variance (n-1), else population variance (n)
 * @returns The variance
 * @throws Error if array is empty or has only one element (for sample variance)
 *
 * @example
 * ```ts
 * variance([1, 2, 3, 4, 5]); // sample variance
 * variance([1, 2, 3, 4, 5], false); // population variance
 * ```
 */
export function variance(data: number[], sample: boolean = true): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate variance of empty array');
  }
  if (sample && data.length === 1) {
    throw new Error('Cannot calculate sample variance with only one data point');
  }

  const mu = mean(data);
  const sumSquaredDiff = data.reduce((sum, val) => sum + Math.pow(val - mu, 2), 0);
  const denominator = sample ? data.length - 1 : data.length;

  return sumSquaredDiff / denominator;
}

/**
 * Calculates the standard deviation of an array of numbers.
 *
 * Standard deviation is the square root of variance:
 * σ = √(Σ(xᵢ - μ)² / n)
 *
 * @param data - Array of numbers
 * @param sample - If true, calculates sample std dev (n-1), else population std dev (n)
 * @returns The standard deviation
 * @throws Error if array is empty or has only one element (for sample std dev)
 *
 * @example
 * ```ts
 * standardDeviation([1, 2, 3, 4, 5]); // sample std dev
 * standardDeviation([1, 2, 3, 4, 5], false); // population std dev
 * ```
 */
export function standardDeviation(data: number[], sample: boolean = true): number {
  return Math.sqrt(variance(data, sample));
}

/**
 * Calculates the Median Absolute Deviation (MAD).
 *
 * MAD is a robust measure of statistical dispersion:
 * MAD = median(|xᵢ - median(x)|)
 *
 * @param data - Array of numbers
 * @returns The median absolute deviation
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * medianAbsoluteDeviation([1, 2, 3, 4, 5]); // 1
 * ```
 */
export function medianAbsoluteDeviation(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate MAD of empty array');
  }

  const med = median(data);
  const absoluteDeviations = data.map(val => Math.abs(val - med));
  return median(absoluteDeviations);
}

/**
 * Calculates the Interquartile Range (IQR).
 *
 * IQR is the difference between the 75th and 25th percentiles:
 * IQR = Q3 - Q1
 *
 * @param data - Array of numbers
 * @returns The interquartile range
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * interquartileRange([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Q3 - Q1
 * ```
 */
export function interquartileRange(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate IQR of empty array');
  }

  const q1 = quantile(data, 0.25);
  const q3 = quantile(data, 0.75);
  return q3 - q1;
}

/**
 * Calculates the range (max - min) of an array of numbers.
 *
 * @param data - Array of numbers
 * @returns The range
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * range([1, 2, 3, 4, 5]); // 4
 * ```
 */
export function range(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate range of empty array');
  }

  return Math.max(...data) - Math.min(...data);
}

/**
 * Calculates the skewness of a distribution.
 *
 * Skewness measures the asymmetry of the probability distribution:
 * γ₁ = E[(X - μ)³] / σ³
 *
 * - Positive skew: right tail is longer
 * - Negative skew: left tail is longer
 * - Zero skew: symmetric distribution
 *
 * @param data - Array of numbers
 * @param sample - If true, applies sample correction
 * @returns The skewness coefficient
 * @throws Error if array is empty or has insufficient data
 *
 * @example
 * ```ts
 * skewness([1, 2, 3, 4, 5]); // ~0 (symmetric)
 * skewness([1, 2, 3, 4, 100]); // positive (right skew)
 * ```
 */
export function skewness(data: number[], sample: boolean = true): number {
  if (data.length < 3) {
    throw new Error('Skewness requires at least 3 data points');
  }

  const mu = mean(data);
  const sigma = standardDeviation(data, sample);
  const n = data.length;

  if (sigma === 0) {
    return 0;
  }

  const m3 = data.reduce((sum, val) => sum + Math.pow(val - mu, 3), 0) / n;
  const skew = m3 / Math.pow(sigma, 3);

  // Apply sample correction if needed
  if (sample) {
    return (Math.sqrt(n * (n - 1)) / (n - 2)) * skew;
  }

  return skew;
}

/**
 * Calculates the kurtosis of a distribution.
 *
 * Kurtosis measures the "tailedness" of the probability distribution:
 * γ₂ = E[(X - μ)⁴] / σ⁴ - 3 (excess kurtosis)
 *
 * - Positive excess kurtosis: heavy tails (leptokurtic)
 * - Negative excess kurtosis: light tails (platykurtic)
 * - Zero excess kurtosis: normal distribution (mesokurtic)
 *
 * @param data - Array of numbers
 * @param sample - If true, applies sample correction
 * @param excess - If true, returns excess kurtosis (subtract 3)
 * @returns The kurtosis coefficient
 * @throws Error if array is empty or has insufficient data
 *
 * @example
 * ```ts
 * kurtosis([1, 2, 3, 4, 5]); // excess kurtosis
 * kurtosis([1, 2, 3, 4, 5], true, false); // raw kurtosis
 * ```
 */
export function kurtosis(
  data: number[],
  sample: boolean = true,
  excess: boolean = true
): number {
  if (data.length < 4) {
    throw new Error('Kurtosis requires at least 4 data points');
  }

  const mu = mean(data);
  const sigma = standardDeviation(data, sample);
  const n = data.length;

  if (sigma === 0) {
    return 0;
  }

  const m4 = data.reduce((sum, val) => sum + Math.pow(val - mu, 4), 0) / n;
  let kurt = m4 / Math.pow(sigma, 4);

  // Apply sample correction if needed
  if (sample) {
    kurt =
      ((n - 1) / ((n - 2) * (n - 3))) *
      ((n + 1) * kurt - 3 * (n - 1)) +
      3;
  }

  return excess ? kurt - 3 : kurt;
}

/**
 * Calculates a quantile (percentile) of the data.
 *
 * Uses linear interpolation between closest ranks (R-7 method, default in R and NumPy).
 *
 * @param data - Array of numbers
 * @param p - Quantile to calculate (0 to 1)
 * @returns The quantile value
 * @throws Error if array is empty or p is out of range
 *
 * @example
 * ```ts
 * quantile([1, 2, 3, 4, 5], 0.5); // median
 * quantile([1, 2, 3, 4, 5], 0.25); // first quartile
 * quantile([1, 2, 3, 4, 5], 0.75); // third quartile
 * ```
 */
export function quantile(data: number[], p: number): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate quantile of empty array');
  }
  if (p < 0 || p > 1) {
    throw new Error('Quantile must be between 0 and 1');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  if (p === 0) return sorted[0];
  if (p === 1) return sorted[n - 1];

  // Linear interpolation (R-7 method)
  const index = (n - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculates a percentile (convenience wrapper for quantile).
 *
 * @param data - Array of numbers
 * @param p - Percentile to calculate (0 to 100)
 * @returns The percentile value
 * @throws Error if array is empty or p is out of range
 *
 * @example
 * ```ts
 * percentile([1, 2, 3, 4, 5], 50); // median
 * percentile([1, 2, 3, 4, 5], 25); // first quartile
 * percentile([1, 2, 3, 4, 5], 75); // third quartile
 * ```
 */
export function percentile(data: number[], p: number): number {
  if (p < 0 || p > 100) {
    throw new Error('Percentile must be between 0 and 100');
  }
  return quantile(data, p / 100);
}

/**
 * Calculates multiple quantiles at once.
 *
 * @param data - Array of numbers
 * @param quantiles - Array of quantile values (0 to 1)
 * @returns Array of quantile values
 *
 * @example
 * ```ts
 * quantiles([1, 2, 3, 4, 5], [0.25, 0.5, 0.75]); // [Q1, median, Q3]
 * ```
 */
export function quantiles(data: number[], quantiles: number[]): number[] {
  return quantiles.map(q => quantile(data, q));
}

/**
 * Calculates a five-number summary (min, Q1, median, Q3, max).
 *
 * The five-number summary provides a quick overview of the distribution.
 *
 * @param data - Array of numbers
 * @returns Object with min, q1, median, q3, max
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * fiveNumberSummary([1, 2, 3, 4, 5]);
 * // { min: 1, q1: 1.5, median: 3, q3: 4.5, max: 5 }
 * ```
 */
export function fiveNumberSummary(data: number[]): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
} {
  if (data.length === 0) {
    throw new Error('Cannot calculate five-number summary of empty array');
  }

  return {
    min: Math.min(...data),
    q1: quantile(data, 0.25),
    median: median(data),
    q3: quantile(data, 0.75),
    max: Math.max(...data),
  };
}

/**
 * Calculates comprehensive descriptive statistics for a dataset.
 *
 * @param data - Array of numbers
 * @returns Object containing multiple statistical measures
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * const stats = summary([1, 2, 3, 4, 5]);
 * console.log(stats.mean, stats.median, stats.std);
 * ```
 */
export function summary(data: number[]): {
  count: number;
  mean: number;
  std: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  range: number;
  iqr: number;
} {
  if (data.length === 0) {
    throw new Error('Cannot calculate summary of empty array');
  }

  const summary = fiveNumberSummary(data);

  return {
    count: data.length,
    mean: mean(data),
    std: standardDeviation(data),
    min: summary.min,
    q1: summary.q1,
    median: summary.median,
    q3: summary.q3,
    max: summary.max,
    variance: variance(data),
    skewness: data.length >= 3 ? skewness(data) : NaN,
    kurtosis: data.length >= 4 ? kurtosis(data) : NaN,
    range: range(data),
    iqr: interquartileRange(data),
  };
}
