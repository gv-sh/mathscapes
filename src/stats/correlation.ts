/**
 * Correlation and Covariance Module
 *
 * This module provides functions for calculating correlation coefficients,
 * covariance, and related statistical measures of association between variables.
 */

import { mean, variance, standardDeviation } from './descriptive';

/**
 * Calculates the covariance between two variables.
 *
 * Covariance measures how two variables vary together:
 * Cov(X,Y) = E[(X - μₓ)(Y - μᵧ)]
 *
 * @param x - First array of numbers
 * @param y - Second array of numbers
 * @param sample - If true, uses sample covariance (n-1), else population (n)
 * @returns The covariance
 * @throws Error if arrays have different lengths or are empty
 *
 * @example
 * ```ts
 * covariance([1, 2, 3], [4, 5, 6]); // positive covariance
 * covariance([1, 2, 3], [6, 5, 4]); // negative covariance
 * ```
 */
export function covariance(x: number[], y: number[], sample: boolean = true): number {
  if (x.length === 0 || y.length === 0) {
    throw new Error('Cannot calculate covariance of empty arrays');
  }
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }
  if (sample && x.length === 1) {
    throw new Error('Cannot calculate sample covariance with only one data point');
  }

  const meanX = mean(x);
  const meanY = mean(y);
  const n = x.length;

  const sum = x.reduce((acc, xi, i) => {
    return acc + (xi - meanX) * (y[i] - meanY);
  }, 0);

  const denominator = sample ? n - 1 : n;
  return sum / denominator;
}

/**
 * Calculates the Pearson correlation coefficient between two variables.
 *
 * Pearson correlation measures the linear relationship between two variables:
 * r = Cov(X,Y) / (σₓ × σᵧ)
 *
 * The result is always between -1 and 1:
 * - 1: perfect positive linear correlation
 * - 0: no linear correlation
 * - -1: perfect negative linear correlation
 *
 * @param x - First array of numbers
 * @param y - Second array of numbers
 * @returns The Pearson correlation coefficient
 * @throws Error if arrays have different lengths or are empty
 *
 * @example
 * ```ts
 * pearsonCorrelation([1, 2, 3, 4], [2, 4, 6, 8]); // 1.0 (perfect positive)
 * pearsonCorrelation([1, 2, 3, 4], [8, 6, 4, 2]); // -1.0 (perfect negative)
 * ```
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length === 0 || y.length === 0) {
    throw new Error('Cannot calculate correlation of empty arrays');
  }
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }

  const cov = covariance(x, y, false);
  const stdX = standardDeviation(x, false);
  const stdY = standardDeviation(y, false);

  if (stdX === 0 || stdY === 0) {
    return 0; // No variation means no correlation
  }

  return cov / (stdX * stdY);
}

/**
 * Helper function to calculate ranks for data (used by Spearman and Kendall).
 * Handles ties by assigning average ranks.
 *
 * @param data - Array of numbers
 * @returns Array of ranks
 */
function ranks(data: number[]): number[] {
  const n = data.length;
  const sorted = data
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);

  const result = new Array(n);

  let i = 0;
  while (i < n) {
    // Find all elements with the same value (ties)
    let j = i;
    while (j < n && sorted[j].value === sorted[i].value) {
      j++;
    }

    // Assign average rank to all tied elements
    const avgRank = (i + j - 1) / 2 + 1; // +1 because ranks start at 1
    for (let k = i; k < j; k++) {
      result[sorted[k].index] = avgRank;
    }

    i = j;
  }

  return result;
}

/**
 * Calculates the Spearman rank correlation coefficient.
 *
 * Spearman correlation measures the monotonic relationship between two variables
 * by computing the Pearson correlation of the rank values.
 *
 * This is more robust to outliers than Pearson correlation.
 *
 * @param x - First array of numbers
 * @param y - Second array of numbers
 * @returns The Spearman correlation coefficient
 * @throws Error if arrays have different lengths or are empty
 *
 * @example
 * ```ts
 * spearmanCorrelation([1, 2, 3, 4], [1, 4, 9, 16]); // 1.0 (monotonic)
 * spearmanCorrelation([1, 2, 3, 4], [4, 3, 2, 1]); // -1.0
 * ```
 */
export function spearmanCorrelation(x: number[], y: number[]): number {
  if (x.length === 0 || y.length === 0) {
    throw new Error('Cannot calculate correlation of empty arrays');
  }
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }

  const ranksX = ranks(x);
  const ranksY = ranks(y);

  return pearsonCorrelation(ranksX, ranksY);
}

/**
 * Calculates the Kendall tau rank correlation coefficient.
 *
 * Kendall's tau measures the ordinal association between two variables
 * by counting concordant and discordant pairs:
 * τ = (concordant - discordant) / (n(n-1)/2)
 *
 * - Concordant pair: both x and y increase or decrease together
 * - Discordant pair: one increases while the other decreases
 *
 * @param x - First array of numbers
 * @param y - Second array of numbers
 * @returns The Kendall tau correlation coefficient
 * @throws Error if arrays have different lengths or are empty
 *
 * @example
 * ```ts
 * kendallTau([1, 2, 3, 4], [2, 4, 6, 8]); // 1.0 (perfect concordance)
 * kendallTau([1, 2, 3, 4], [8, 6, 4, 2]); // -1.0 (perfect discordance)
 * ```
 */
export function kendallTau(x: number[], y: number[]): number {
  if (x.length === 0 || y.length === 0) {
    throw new Error('Cannot calculate correlation of empty arrays');
  }
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }

  const n = x.length;
  let concordant = 0;
  let discordant = 0;

  // Count concordant and discordant pairs
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const signX = Math.sign(x[j] - x[i]);
      const signY = Math.sign(y[j] - y[i]);
      const product = signX * signY;

      if (product > 0) {
        concordant++;
      } else if (product < 0) {
        discordant++;
      }
      // If product === 0, it's a tie, don't count
    }
  }

  const totalPairs = (n * (n - 1)) / 2;
  if (totalPairs === 0) {
    return 0;
  }

  return (concordant - discordant) / totalPairs;
}

/**
 * Calculates the covariance matrix for multiple variables.
 *
 * The covariance matrix is a square matrix where element (i,j) is the
 * covariance between variable i and variable j.
 *
 * @param data - 2D array where each row is an observation and each column is a variable
 * @param sample - If true, uses sample covariance (n-1), else population (n)
 * @returns The covariance matrix
 * @throws Error if data is empty or malformed
 *
 * @example
 * ```ts
 * const data = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ];
 * const covMatrix = covarianceMatrix(data);
 * ```
 */
export function covarianceMatrix(data: number[][], sample: boolean = true): number[][] {
  if (data.length === 0) {
    throw new Error('Cannot calculate covariance matrix of empty data');
  }
  if (data.some(row => row.length !== data[0].length)) {
    throw new Error('All rows must have the same length');
  }

  const nVars = data[0].length;
  const matrix: number[][] = Array(nVars)
    .fill(0)
    .map(() => Array(nVars).fill(0));

  // Extract each variable as a column
  const variables: number[][] = [];
  for (let j = 0; j < nVars; j++) {
    variables[j] = data.map(row => row[j]);
  }

  // Calculate covariance for each pair
  for (let i = 0; i < nVars; i++) {
    for (let j = 0; j < nVars; j++) {
      matrix[i][j] = covariance(variables[i], variables[j], sample);
    }
  }

  return matrix;
}

/**
 * Calculates the correlation matrix for multiple variables.
 *
 * The correlation matrix is a square matrix where element (i,j) is the
 * Pearson correlation between variable i and variable j.
 *
 * @param data - 2D array where each row is an observation and each column is a variable
 * @returns The correlation matrix
 * @throws Error if data is empty or malformed
 *
 * @example
 * ```ts
 * const data = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ];
 * const corrMatrix = correlationMatrix(data);
 * ```
 */
export function correlationMatrix(data: number[][]): number[][] {
  if (data.length === 0) {
    throw new Error('Cannot calculate correlation matrix of empty data');
  }
  if (data.some(row => row.length !== data[0].length)) {
    throw new Error('All rows must have the same length');
  }

  const nVars = data[0].length;
  const matrix: number[][] = Array(nVars)
    .fill(0)
    .map(() => Array(nVars).fill(0));

  // Extract each variable as a column
  const variables: number[][] = [];
  for (let j = 0; j < nVars; j++) {
    variables[j] = data.map(row => row[j]);
  }

  // Calculate correlation for each pair
  for (let i = 0; i < nVars; i++) {
    for (let j = 0; j < nVars; j++) {
      if (i === j) {
        matrix[i][j] = 1; // Correlation with self is always 1
      } else {
        matrix[i][j] = pearsonCorrelation(variables[i], variables[j]);
      }
    }
  }

  return matrix;
}

/**
 * Calculates the partial correlation between two variables controlling for others.
 *
 * Partial correlation measures the correlation between X and Y after removing
 * the linear effect of the control variables.
 *
 * This implementation uses the formula:
 * r_xy.z = (r_xy - r_xz * r_yz) / sqrt((1 - r_xz²)(1 - r_yz²))
 *
 * For multiple control variables, it recursively applies this formula.
 *
 * @param data - 2D array where columns are [X, Y, Z1, Z2, ...]
 * @returns The partial correlation coefficient
 * @throws Error if data is malformed or has insufficient variables
 *
 * @example
 * ```ts
 * // Partial correlation between variable 0 and 1, controlling for variable 2
 * const data = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ];
 * const partialCorr = partialCorrelation(data);
 * ```
 */
export function partialCorrelation(data: number[][]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate partial correlation of empty data');
  }
  if (data.some(row => row.length !== data[0].length)) {
    throw new Error('All rows must have the same length');
  }
  if (data[0].length < 3) {
    throw new Error('Partial correlation requires at least 3 variables (X, Y, and controls)');
  }

  const nVars = data[0].length;

  // Extract variables as columns
  const variables: number[][] = [];
  for (let j = 0; j < nVars; j++) {
    variables[j] = data.map(row => row[j]);
  }

  // If only one control variable, use simple formula
  if (nVars === 3) {
    const rXY = pearsonCorrelation(variables[0], variables[1]);
    const rXZ = pearsonCorrelation(variables[0], variables[2]);
    const rYZ = pearsonCorrelation(variables[1], variables[2]);

    const numerator = rXY - rXZ * rYZ;
    const denominator = Math.sqrt((1 - rXZ * rXZ) * (1 - rYZ * rYZ));

    if (denominator === 0) {
      return 0;
    }

    return numerator / denominator;
  }

  // For multiple control variables, use recursive approach
  // This is a simplified implementation; more sophisticated methods exist
  // First, get correlation matrix
  const corrMatrix = correlationMatrix(data);

  // Use the precision matrix approach (inverse of correlation matrix)
  // r_ij.rest = -p_ij / sqrt(p_ii * p_jj)
  // where P is the precision matrix (inverse of correlation matrix)

  const precision = invertMatrix(corrMatrix);
  const numerator = -precision[0][1];
  const denominator = Math.sqrt(precision[0][0] * precision[1][1]);

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/**
 * Inverts a square matrix using Gaussian elimination.
 * Used internally for partial correlation calculation.
 *
 * @param matrix - Square matrix to invert
 * @returns The inverted matrix
 * @throws Error if matrix is singular (not invertible)
 */
function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;

  // Create augmented matrix [A | I]
  const augmented: number[][] = matrix.map((row, i) => {
    const newRow = [...row];
    for (let j = 0; j < n; j++) {
      newRow.push(i === j ? 1 : 0);
    }
    return newRow;
  });

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-10) {
      throw new Error('Matrix is singular and cannot be inverted');
    }

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j < 2 * n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  // Back substitution
  for (let i = n - 1; i >= 0; i--) {
    // Normalize row
    const divisor = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= divisor;
    }

    // Make all rows above this one 0 in current column
    for (let k = i - 1; k >= 0; k--) {
      const factor = augmented[k][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  // Extract the inverse matrix from the right side
  const inverse: number[][] = augmented.map(row => row.slice(n));
  return inverse;
}

/**
 * Calculates the autocorrelation of a time series at a given lag.
 *
 * Autocorrelation measures the correlation of a signal with a delayed copy of itself.
 *
 * @param data - Array of numbers representing a time series
 * @param lag - The lag at which to calculate autocorrelation
 * @returns The autocorrelation coefficient
 * @throws Error if data is too short for the given lag
 *
 * @example
 * ```ts
 * autocorrelation([1, 2, 3, 4, 5, 6], 1); // correlation with 1-step lag
 * autocorrelation([1, 2, 3, 4, 5, 6], 2); // correlation with 2-step lag
 * ```
 */
export function autocorrelation(data: number[], lag: number): number {
  if (lag < 0) {
    throw new Error('Lag must be non-negative');
  }
  if (data.length <= lag) {
    throw new Error('Data length must be greater than lag');
  }

  const n = data.length - lag;
  const x = data.slice(0, n);
  const y = data.slice(lag, lag + n);

  return pearsonCorrelation(x, y);
}
