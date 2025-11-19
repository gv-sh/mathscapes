/**
 * Time Series Statistics Module
 *
 * This module provides functions for calculating rolling (moving) statistics
 * and exponentially weighted statistics for time series data.
 */

import { mean, variance, standardDeviation } from './descriptive';

/**
 * Calculates rolling (moving) mean over a sliding window.
 *
 * For each position i, calculates the mean of window_size elements
 * centered or trailing at position i.
 *
 * @param data - Array of numbers
 * @param windowSize - Size of the rolling window
 * @param center - If true, centers the window; if false, uses trailing window
 * @returns Array of rolling means (NaN for positions without full window)
 * @throws Error if windowSize is invalid
 *
 * @example
 * ```ts
 * rollingMean([1, 2, 3, 4, 5], 3); // trailing window
 * // [NaN, NaN, 2, 3, 4]
 *
 * rollingMean([1, 2, 3, 4, 5], 3, true); // centered window
 * // [NaN, 2, 3, 4, NaN]
 * ```
 */
export function rollingMean(
  data: number[],
  windowSize: number,
  center: boolean = false
): number[] {
  if (windowSize < 1 || windowSize > data.length) {
    throw new Error('Window size must be between 1 and data length');
  }
  if (!Number.isInteger(windowSize)) {
    throw new Error('Window size must be an integer');
  }

  const result: number[] = new Array(data.length);

  if (center) {
    const halfWindow = Math.floor(windowSize / 2);
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);

      // Only calculate if we have a full window
      if (end - start === windowSize) {
        const window = data.slice(start, end);
        result[i] = mean(window);
      } else {
        result[i] = NaN;
      }
    }
  } else {
    // Trailing window
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result[i] = NaN;
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        result[i] = mean(window);
      }
    }
  }

  return result;
}

/**
 * Calculates rolling (moving) variance over a sliding window.
 *
 * @param data - Array of numbers
 * @param windowSize - Size of the rolling window
 * @param center - If true, centers the window; if false, uses trailing window
 * @param sample - If true, uses sample variance (n-1)
 * @returns Array of rolling variances (NaN for positions without full window)
 * @throws Error if windowSize is invalid
 *
 * @example
 * ```ts
 * rollingVariance([1, 2, 3, 4, 5], 3);
 * ```
 */
export function rollingVariance(
  data: number[],
  windowSize: number,
  center: boolean = false,
  sample: boolean = true
): number[] {
  if (windowSize < 1 || windowSize > data.length) {
    throw new Error('Window size must be between 1 and data length');
  }
  if (!Number.isInteger(windowSize)) {
    throw new Error('Window size must be an integer');
  }

  const result: number[] = new Array(data.length);

  if (center) {
    const halfWindow = Math.floor(windowSize / 2);
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);

      if (end - start === windowSize) {
        const window = data.slice(start, end);
        result[i] = variance(window, sample);
      } else {
        result[i] = NaN;
      }
    }
  } else {
    // Trailing window
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result[i] = NaN;
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        result[i] = variance(window, sample);
      }
    }
  }

  return result;
}

/**
 * Calculates rolling (moving) standard deviation over a sliding window.
 *
 * @param data - Array of numbers
 * @param windowSize - Size of the rolling window
 * @param center - If true, centers the window; if false, uses trailing window
 * @param sample - If true, uses sample std dev (n-1)
 * @returns Array of rolling standard deviations (NaN for positions without full window)
 * @throws Error if windowSize is invalid
 *
 * @example
 * ```ts
 * rollingStdDev([1, 2, 3, 4, 5], 3);
 * ```
 */
export function rollingStdDev(
  data: number[],
  windowSize: number,
  center: boolean = false,
  sample: boolean = true
): number[] {
  if (windowSize < 1 || windowSize > data.length) {
    throw new Error('Window size must be between 1 and data length');
  }
  if (!Number.isInteger(windowSize)) {
    throw new Error('Window size must be an integer');
  }

  const result: number[] = new Array(data.length);

  if (center) {
    const halfWindow = Math.floor(windowSize / 2);
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);

      if (end - start === windowSize) {
        const window = data.slice(start, end);
        result[i] = standardDeviation(window, sample);
      } else {
        result[i] = NaN;
      }
    }
  } else {
    // Trailing window
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result[i] = NaN;
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        result[i] = standardDeviation(window, sample);
      }
    }
  }

  return result;
}

/**
 * Calculates rolling (moving) minimum over a sliding window.
 *
 * @param data - Array of numbers
 * @param windowSize - Size of the rolling window
 * @param center - If true, centers the window; if false, uses trailing window
 * @returns Array of rolling minimums (NaN for positions without full window)
 * @throws Error if windowSize is invalid
 *
 * @example
 * ```ts
 * rollingMin([3, 1, 4, 1, 5], 3); // [NaN, NaN, 1, 1, 1]
 * ```
 */
export function rollingMin(
  data: number[],
  windowSize: number,
  center: boolean = false
): number[] {
  if (windowSize < 1 || windowSize > data.length) {
    throw new Error('Window size must be between 1 and data length');
  }
  if (!Number.isInteger(windowSize)) {
    throw new Error('Window size must be an integer');
  }

  const result: number[] = new Array(data.length);

  if (center) {
    const halfWindow = Math.floor(windowSize / 2);
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);

      if (end - start === windowSize) {
        const window = data.slice(start, end);
        result[i] = Math.min(...window);
      } else {
        result[i] = NaN;
      }
    }
  } else {
    // Trailing window
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result[i] = NaN;
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        result[i] = Math.min(...window);
      }
    }
  }

  return result;
}

/**
 * Calculates rolling (moving) maximum over a sliding window.
 *
 * @param data - Array of numbers
 * @param windowSize - Size of the rolling window
 * @param center - If true, centers the window; if false, uses trailing window
 * @returns Array of rolling maximums (NaN for positions without full window)
 * @throws Error if windowSize is invalid
 *
 * @example
 * ```ts
 * rollingMax([3, 1, 4, 1, 5], 3); // [NaN, NaN, 4, 4, 5]
 * ```
 */
export function rollingMax(
  data: number[],
  windowSize: number,
  center: boolean = false
): number[] {
  if (windowSize < 1 || windowSize > data.length) {
    throw new Error('Window size must be between 1 and data length');
  }
  if (!Number.isInteger(windowSize)) {
    throw new Error('Window size must be an integer');
  }

  const result: number[] = new Array(data.length);

  if (center) {
    const halfWindow = Math.floor(windowSize / 2);
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);

      if (end - start === windowSize) {
        const window = data.slice(start, end);
        result[i] = Math.max(...window);
      } else {
        result[i] = NaN;
      }
    }
  } else {
    // Trailing window
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result[i] = NaN;
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        result[i] = Math.max(...window);
      }
    }
  }

  return result;
}

/**
 * Calculates rolling (moving) sum over a sliding window.
 *
 * @param data - Array of numbers
 * @param windowSize - Size of the rolling window
 * @param center - If true, centers the window; if false, uses trailing window
 * @returns Array of rolling sums (NaN for positions without full window)
 * @throws Error if windowSize is invalid
 *
 * @example
 * ```ts
 * rollingSum([1, 2, 3, 4, 5], 3); // [NaN, NaN, 6, 9, 12]
 * ```
 */
export function rollingSum(
  data: number[],
  windowSize: number,
  center: boolean = false
): number[] {
  if (windowSize < 1 || windowSize > data.length) {
    throw new Error('Window size must be between 1 and data length');
  }
  if (!Number.isInteger(windowSize)) {
    throw new Error('Window size must be an integer');
  }

  const result: number[] = new Array(data.length);

  if (center) {
    const halfWindow = Math.floor(windowSize / 2);
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);

      if (end - start === windowSize) {
        const window = data.slice(start, end);
        result[i] = window.reduce((sum, val) => sum + val, 0);
      } else {
        result[i] = NaN;
      }
    }
  } else {
    // Trailing window
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result[i] = NaN;
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        result[i] = window.reduce((sum, val) => sum + val, 0);
      }
    }
  }

  return result;
}

/**
 * Calculates exponentially weighted moving average (EWMA).
 *
 * EWMA gives more weight to recent observations:
 * EWMAₜ = α × xₜ + (1 - α) × EWMAₜ₋₁
 *
 * where α (alpha) is the smoothing factor between 0 and 1.
 * Higher alpha gives more weight to recent data.
 *
 * Alternative parameterization using span:
 * α = 2 / (span + 1)
 *
 * @param data - Array of numbers
 * @param alpha - Smoothing factor (0 to 1), or undefined if using span
 * @param span - Alternative to alpha: window span (alpha = 2/(span+1))
 * @param adjust - If true, adjusts for initial bias
 * @returns Array of exponentially weighted means
 * @throws Error if parameters are invalid
 *
 * @example
 * ```ts
 * ewma([1, 2, 3, 4, 5], 0.5); // alpha = 0.5
 * ewma([1, 2, 3, 4, 5], undefined, 3); // span = 3 (alpha = 0.5)
 * ```
 */
export function ewma(
  data: number[],
  alpha?: number,
  span?: number,
  adjust: boolean = true
): number[] {
  if (data.length === 0) {
    return [];
  }

  // Determine alpha from either alpha or span parameter
  let smoothingFactor: number;
  if (alpha !== undefined) {
    if (alpha <= 0 || alpha > 1) {
      throw new Error('Alpha must be between 0 and 1 (exclusive of 0)');
    }
    smoothingFactor = alpha;
  } else if (span !== undefined) {
    if (span < 1) {
      throw new Error('Span must be at least 1');
    }
    smoothingFactor = 2 / (span + 1);
  } else {
    throw new Error('Either alpha or span must be specified');
  }

  const result: number[] = new Array(data.length);
  result[0] = data[0];

  if (adjust) {
    // Adjust for initial bias
    let sumWeights = 1;
    let weightedSum = data[0];

    for (let i = 1; i < data.length; i++) {
      const weight = Math.pow(1 - smoothingFactor, i);
      weightedSum = weightedSum * (1 - smoothingFactor) + data[i];
      sumWeights = sumWeights * (1 - smoothingFactor) + 1;
      result[i] = weightedSum / sumWeights;
    }
  } else {
    // Simple recursive formula
    for (let i = 1; i < data.length; i++) {
      result[i] = smoothingFactor * data[i] + (1 - smoothingFactor) * result[i - 1];
    }
  }

  return result;
}

/**
 * Calculates exponentially weighted moving variance.
 *
 * Uses the same smoothing factor as EWMA but for variance calculation.
 *
 * @param data - Array of numbers
 * @param alpha - Smoothing factor (0 to 1), or undefined if using span
 * @param span - Alternative to alpha: window span
 * @param adjust - If true, adjusts for initial bias
 * @returns Array of exponentially weighted variances
 * @throws Error if parameters are invalid
 *
 * @example
 * ```ts
 * ewmVariance([1, 2, 3, 4, 5], 0.5);
 * ```
 */
export function ewmVariance(
  data: number[],
  alpha?: number,
  span?: number,
  adjust: boolean = true
): number[] {
  if (data.length === 0) {
    return [];
  }

  // Get EWMA first
  const means = ewma(data, alpha, span, adjust);

  // Determine smoothing factor
  let smoothingFactor: number;
  if (alpha !== undefined) {
    smoothingFactor = alpha;
  } else if (span !== undefined) {
    smoothingFactor = 2 / (span + 1);
  } else {
    throw new Error('Either alpha or span must be specified');
  }

  const result: number[] = new Array(data.length);
  result[0] = 0;

  if (adjust) {
    let sumWeights = 1;
    let weightedSumSq = 0;

    for (let i = 1; i < data.length; i++) {
      const deviation = data[i] - means[i - 1];
      weightedSumSq = weightedSumSq * (1 - smoothingFactor) + deviation * deviation;
      sumWeights = sumWeights * (1 - smoothingFactor) + 1;
      result[i] = weightedSumSq / sumWeights;
    }
  } else {
    for (let i = 1; i < data.length; i++) {
      const deviation = data[i] - means[i - 1];
      result[i] =
        smoothingFactor * deviation * deviation + (1 - smoothingFactor) * result[i - 1];
    }
  }

  return result;
}

/**
 * Calculates exponentially weighted moving standard deviation.
 *
 * @param data - Array of numbers
 * @param alpha - Smoothing factor (0 to 1), or undefined if using span
 * @param span - Alternative to alpha: window span
 * @param adjust - If true, adjusts for initial bias
 * @returns Array of exponentially weighted standard deviations
 * @throws Error if parameters are invalid
 *
 * @example
 * ```ts
 * ewmStdDev([1, 2, 3, 4, 5], 0.5);
 * ```
 */
export function ewmStdDev(
  data: number[],
  alpha?: number,
  span?: number,
  adjust: boolean = true
): number[] {
  const variances = ewmVariance(data, alpha, span, adjust);
  return variances.map(v => Math.sqrt(v));
}

/**
 * Calculates cumulative sum of an array.
 *
 * @param data - Array of numbers
 * @returns Array of cumulative sums
 *
 * @example
 * ```ts
 * cumulativeSum([1, 2, 3, 4, 5]); // [1, 3, 6, 10, 15]
 * ```
 */
export function cumulativeSum(data: number[]): number[] {
  const result: number[] = new Array(data.length);
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    result[i] = sum;
  }

  return result;
}

/**
 * Calculates cumulative product of an array.
 *
 * @param data - Array of numbers
 * @returns Array of cumulative products
 *
 * @example
 * ```ts
 * cumulativeProduct([1, 2, 3, 4, 5]); // [1, 2, 6, 24, 120]
 * ```
 */
export function cumulativeProduct(data: number[]): number[] {
  const result: number[] = new Array(data.length);
  let product = 1;

  for (let i = 0; i < data.length; i++) {
    product *= data[i];
    result[i] = product;
  }

  return result;
}

/**
 * Calculates cumulative minimum of an array.
 *
 * @param data - Array of numbers
 * @returns Array of cumulative minimums
 *
 * @example
 * ```ts
 * cumulativeMin([3, 1, 4, 1, 5]); // [3, 1, 1, 1, 1]
 * ```
 */
export function cumulativeMin(data: number[]): number[] {
  const result: number[] = new Array(data.length);
  let min = Infinity;

  for (let i = 0; i < data.length; i++) {
    min = Math.min(min, data[i]);
    result[i] = min;
  }

  return result;
}

/**
 * Calculates cumulative maximum of an array.
 *
 * @param data - Array of numbers
 * @returns Array of cumulative maximums
 *
 * @example
 * ```ts
 * cumulativeMax([3, 1, 4, 1, 5]); // [3, 3, 4, 4, 5]
 * ```
 */
export function cumulativeMax(data: number[]): number[] {
  const result: number[] = new Array(data.length);
  let max = -Infinity;

  for (let i = 0; i < data.length; i++) {
    max = Math.max(max, data[i]);
    result[i] = max;
  }

  return result;
}
