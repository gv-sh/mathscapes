/**
 * Distance metrics and similarity measures for vectors and arrays
 */

import { Vector } from './vector';

/**
 * Computes the Euclidean distance between two vectors
 * d(a, b) = √(Σ(aᵢ - bᵢ)²)
 * @param a - First vector or array
 * @param b - Second vector or array
 */
export function euclidean(a: Vector | number[], b: Vector | number[]): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Computes the squared Euclidean distance (avoids square root for performance)
 * d²(a, b) = Σ(aᵢ - bᵢ)²
 * @param a - First vector or array
 * @param b - Second vector or array
 */
export function euclideanSquared(a: Vector | number[], b: Vector | number[]): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return sum;
}

/**
 * Computes the Manhattan (L1) distance between two vectors
 * d(a, b) = Σ|aᵢ - bᵢ|
 * Also known as taxicab distance or city block distance
 * @param a - First vector or array
 * @param b - Second vector or array
 */
export function manhattan(a: Vector | number[], b: Vector | number[]): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.abs(arr1[i] - arr2[i]);
  }
  return sum;
}

/**
 * Computes the Chebyshev (L∞) distance between two vectors
 * d(a, b) = max|aᵢ - bᵢ|
 * Also known as chessboard distance
 * @param a - First vector or array
 * @param b - Second vector or array
 */
export function chebyshev(a: Vector | number[], b: Vector | number[]): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let max = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = Math.abs(arr1[i] - arr2[i]);
    if (diff > max) {
      max = diff;
    }
  }
  return max;
}

/**
 * Computes the Minkowski distance between two vectors
 * d(a, b) = (Σ|aᵢ - bᵢ|ᵖ)^(1/p)
 * Generalizes Euclidean (p=2) and Manhattan (p=1) distances
 * @param a - First vector or array
 * @param b - Second vector or array
 * @param p - The order of the Minkowski distance (must be >= 1)
 */
export function minkowski(a: Vector | number[], b: Vector | number[], p: number): number {
  if (p < 1) {
    throw new Error('Minkowski distance order p must be >= 1');
  }

  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  if (p === Infinity) {
    return chebyshev(arr1, arr2);
  }

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(Math.abs(arr1[i] - arr2[i]), p);
  }
  return Math.pow(sum, 1 / p);
}

/**
 * Computes the cosine similarity between two vectors
 * sim(a, b) = (a · b) / (|a| |b|)
 * Returns a value between -1 (opposite) and 1 (same direction)
 * @param a - First vector or array
 * @param b - Second vector or array
 */
export function cosineSimilarity(a: Vector | number[], b: Vector | number[]): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < arr1.length; i++) {
    dotProduct += arr1[i] * arr2[i];
    magA += arr1[i] * arr1[i];
    magB += arr2[i] * arr2[i];
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  if (denominator === 0) {
    throw new Error('Cannot compute cosine similarity with zero vector');
  }

  return dotProduct / denominator;
}

/**
 * Computes the cosine distance between two vectors
 * d(a, b) = 1 - cosineSimilarity(a, b)
 * Returns a value between 0 (same direction) and 2 (opposite)
 * @param a - First vector or array
 * @param b - Second vector or array
 */
export function cosineDistance(a: Vector | number[], b: Vector | number[]): number {
  return 1 - cosineSimilarity(a, b);
}

/**
 * Computes the Hamming distance between two vectors
 * d(a, b) = count of positions where aᵢ ≠ bᵢ
 * Useful for comparing binary vectors or categorical data
 * @param a - First vector or array
 * @param b - Second vector or array
 * @param tolerance - Tolerance for comparing floating point numbers (default: 1e-10)
 */
export function hamming(a: Vector | number[], b: Vector | number[], tolerance: number = 1e-10): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let count = 0;
  for (let i = 0; i < arr1.length; i++) {
    if (Math.abs(arr1[i] - arr2[i]) > tolerance) {
      count++;
    }
  }
  return count;
}

/**
 * Computes the normalized Hamming distance (between 0 and 1)
 * d(a, b) = (count of differences) / (total positions)
 * @param a - First vector or array
 * @param b - Second vector or array
 * @param tolerance - Tolerance for comparing floating point numbers (default: 1e-10)
 */
export function hammingNormalized(a: Vector | number[], b: Vector | number[], tolerance: number = 1e-10): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  return hamming(arr1, b, tolerance) / arr1.length;
}

/**
 * Computes the Jaccard similarity coefficient for binary vectors
 * J(A, B) = |A ∩ B| / |A ∪ B|
 * Counts positions where both are non-zero vs positions where at least one is non-zero
 * @param a - First vector or array
 * @param b - Second vector or array
 * @param tolerance - Tolerance for comparing to zero (default: 1e-10)
 */
export function jaccardSimilarity(a: Vector | number[], b: Vector | number[], tolerance: number = 1e-10): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let intersection = 0;
  let union = 0;

  for (let i = 0; i < arr1.length; i++) {
    const a_nonzero = Math.abs(arr1[i]) > tolerance;
    const b_nonzero = Math.abs(arr2[i]) > tolerance;

    if (a_nonzero && b_nonzero) {
      intersection++;
      union++;
    } else if (a_nonzero || b_nonzero) {
      union++;
    }
  }

  if (union === 0) {
    return 1; // Both vectors are zero, consider them identical
  }

  return intersection / union;
}

/**
 * Computes the Jaccard distance
 * d(A, B) = 1 - J(A, B)
 * @param a - First vector or array
 * @param b - Second vector or array
 * @param tolerance - Tolerance for comparing to zero (default: 1e-10)
 */
export function jaccardDistance(a: Vector | number[], b: Vector | number[], tolerance: number = 1e-10): number {
  return 1 - jaccardSimilarity(a, b, tolerance);
}

/**
 * Computes the Canberra distance between two vectors
 * d(a, b) = Σ(|aᵢ - bᵢ| / (|aᵢ| + |bᵢ|))
 * Very sensitive to small changes near zero
 * @param a - First vector or array
 * @param b - Second vector or array
 */
export function canberra(a: Vector | number[], b: Vector | number[]): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const numerator = Math.abs(arr1[i] - arr2[i]);
    const denominator = Math.abs(arr1[i]) + Math.abs(arr2[i]);

    if (denominator > 0) {
      sum += numerator / denominator;
    }
    // If both are zero, the distance contribution is 0
  }
  return sum;
}

/**
 * Computes the Bray-Curtis dissimilarity between two vectors
 * d(a, b) = Σ|aᵢ - bᵢ| / Σ(aᵢ + bᵢ)
 * Commonly used in ecology and environmental science
 * @param a - First vector or array
 * @param b - Second vector or array
 */
export function brayCurtis(a: Vector | number[], b: Vector | number[]): number {
  const arr1 = a instanceof Vector ? a.toArray() : a;
  const arr2 = b instanceof Vector ? b.toArray() : b;

  if (arr1.length !== arr2.length) {
    throw new Error(`Vectors must have same dimension: ${arr1.length} vs ${arr2.length}`);
  }

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < arr1.length; i++) {
    numerator += Math.abs(arr1[i] - arr2[i]);
    denominator += arr1[i] + arr2[i];
  }

  if (denominator === 0) {
    return 0; // Both vectors are zero
  }

  return numerator / denominator;
}
