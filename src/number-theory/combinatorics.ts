/**
 * Combinatorics Functions
 *
 * This module provides functions for combinatorial calculations:
 * - Permutations and combinations
 * - Multinomial coefficients
 * - Stirling numbers
 * - Bell numbers
 * - Partition functions
 */

/**
 * Compute factorial of n
 * n! = n × (n-1) × ... × 2 × 1
 *
 * @param n - Non-negative integer
 * @returns n!
 *
 * @example
 * ```ts
 * factorial(5); // 120
 * factorial(0); // 1
 * ```
 */
export function factorial(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');
  if (n === 0 || n === 1) return 1;

  n = Math.floor(n);
  let result = 1;

  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
}

/**
 * Compute number of permutations P(n, k) = n!/(n-k)!
 * Number of ways to arrange k items from n items
 *
 * @param n - Total number of items
 * @param k - Number of items to arrange
 * @returns P(n, k)
 *
 * @example
 * ```ts
 * permutations(5, 2); // 20
 * permutations(4, 4); // 24
 * ```
 */
export function permutations(n: number, k: number): number {
  if (n < 0 || k < 0) throw new Error('n and k must be non-negative');
  if (k > n) return 0;

  n = Math.floor(n);
  k = Math.floor(k);

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= n - i;
  }

  return result;
}

/**
 * Compute number of combinations C(n, k) = n!/(k!(n-k)!)
 * Number of ways to choose k items from n items (binomial coefficient)
 *
 * @param n - Total number of items
 * @param k - Number of items to choose
 * @returns C(n, k)
 *
 * @example
 * ```ts
 * combinations(5, 2); // 10
 * combinations(10, 3); // 120
 * ```
 */
export function combinations(n: number, k: number): number {
  if (n < 0 || k < 0) throw new Error('n and k must be non-negative');
  if (k > n) return 0;

  n = Math.floor(n);
  k = Math.floor(k);

  // Optimization: C(n, k) = C(n, n-k)
  if (k > n - k) {
    k = n - k;
  }

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= n - i;
    result /= i + 1;
  }

  return Math.round(result); // Round to handle floating point errors
}

/**
 * Compute binomial coefficient (alias for combinations)
 *
 * @param n - Total number of items
 * @param k - Number of items to choose
 * @returns Binomial coefficient C(n, k)
 */
export function binomial(n: number, k: number): number {
  return combinations(n, k);
}

/**
 * Compute multinomial coefficient
 * Number of ways to partition n items into groups of sizes k1, k2, ..., km
 * M(n; k1, k2, ..., km) = n! / (k1! × k2! × ... × km!)
 *
 * @param n - Total number of items
 * @param groups - Array of group sizes
 * @returns Multinomial coefficient
 *
 * @example
 * ```ts
 * multinomial(10, [3, 3, 4]); // 4200
 * multinomial(5, [2, 2, 1]); // 30
 * ```
 */
export function multinomial(n: number, groups: number[]): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);
  const sum = groups.reduce((acc, g) => acc + g, 0);

  if (sum !== n) {
    throw new Error('Sum of group sizes must equal n');
  }

  let result = factorial(n);
  for (const g of groups) {
    result /= factorial(g);
  }

  return Math.round(result);
}

/**
 * Compute combinations with repetition (multicombinations)
 * Number of ways to choose k items from n types with replacement
 * CR(n, k) = C(n + k - 1, k)
 *
 * @param n - Number of types
 * @param k - Number of items to choose
 * @returns CR(n, k)
 *
 * @example
 * ```ts
 * combinationsWithRepetition(3, 2); // 6
 * // Example: choosing 2 items from {A, B, C} with replacement
 * // Possibilities: AA, AB, AC, BB, BC, CC
 * ```
 */
export function combinationsWithRepetition(n: number, k: number): number {
  if (n <= 0 || k < 0) throw new Error('n must be positive and k non-negative');
  return combinations(n + k - 1, k);
}

/**
 * Compute permutations with repetition
 * Number of ways to arrange n items where items can repeat
 *
 * @param n - Number of positions
 * @param k - Number of types
 * @returns k^n
 *
 * @example
 * ```ts
 * permutationsWithRepetition(3, 2); // 8 (2^3)
 * ```
 */
export function permutationsWithRepetition(n: number, k: number): number {
  if (n < 0 || k < 0) throw new Error('n and k must be non-negative');
  return Math.pow(k, n);
}

/**
 * Compute derangements D(n)
 * Number of permutations where no element appears in its original position
 * D(n) = n! × Σ((-1)^k / k!) for k=0 to n
 *
 * @param n - Number of items
 * @returns Number of derangements
 *
 * @example
 * ```ts
 * derangements(3); // 2 (permutations: {2,3,1} and {3,1,2})
 * derangements(4); // 9
 * ```
 */
export function derangements(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');
  if (n === 0) return 1;
  if (n === 1) return 0;

  n = Math.floor(n);

  // Use recurrence: D(n) = (n-1) × (D(n-1) + D(n-2))
  let d0 = 1; // D(0)
  let d1 = 0; // D(1)

  for (let i = 2; i <= n; i++) {
    const di = (i - 1) * (d0 + d1);
    d0 = d1;
    d1 = di;
  }

  return d1;
}

/**
 * Stirling number of the second kind S(n, k)
 * Number of ways to partition n elements into k non-empty subsets
 *
 * @param n - Number of elements
 * @param k - Number of subsets
 * @returns S(n, k)
 *
 * @example
 * ```ts
 * stirlingSecond(4, 2); // 7
 * ```
 */
export function stirlingSecond(n: number, k: number): number {
  if (n < 0 || k < 0) throw new Error('n and k must be non-negative');
  if (k > n) return 0;
  if (k === 0) return n === 0 ? 1 : 0;
  if (k === 1 || k === n) return 1;

  n = Math.floor(n);
  k = Math.floor(k);

  // Use dynamic programming
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(k + 1).fill(0));

  dp[0][0] = 1;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= Math.min(i, k); j++) {
      dp[i][j] = j * dp[i - 1][j] + dp[i - 1][j - 1];
    }
  }

  return dp[n][k];
}

/**
 * Stirling number of the first kind s(n, k)
 * Number of permutations of n elements with k cycles
 *
 * @param n - Number of elements
 * @param k - Number of cycles
 * @param signed - If true, return signed Stirling number
 * @returns s(n, k)
 *
 * @example
 * ```ts
 * stirlingFirst(4, 2); // 11
 * stirlingFirst(4, 2, true); // -11
 * ```
 */
export function stirlingFirst(n: number, k: number, signed: boolean = false): number {
  if (n < 0 || k < 0) throw new Error('n and k must be non-negative');
  if (k > n) return 0;
  if (k === 0) return n === 0 ? 1 : 0;
  if (n === 0) return 0;

  n = Math.floor(n);
  k = Math.floor(k);

  // Use dynamic programming
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(k + 1).fill(0));

  dp[0][0] = 1;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= Math.min(i, k); j++) {
      dp[i][j] = dp[i - 1][j - 1] + (i - 1) * dp[i - 1][j];
    }
  }

  const result = dp[n][k];
  return signed && (n - k) % 2 === 1 ? -result : result;
}

/**
 * Bell number B(n)
 * Number of ways to partition n elements into any number of non-empty subsets
 * B(n) = Σ S(n, k) for k=0 to n
 *
 * @param n - Number of elements
 * @returns B(n)
 *
 * @example
 * ```ts
 * bell(3); // 5 (partitions: {1,2,3}, {1,2}{3}, {1,3}{2}, {1}{2,3}, {1}{2}{3})
 * bell(4); // 15
 * ```
 */
export function bell(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');
  if (n === 0) return 1;

  n = Math.floor(n);

  // Use Bell triangle
  const triangle: number[][] = [[1]];

  for (let i = 1; i <= n; i++) {
    const row: number[] = [triangle[i - 1][triangle[i - 1].length - 1]];

    for (let j = 1; j <= i; j++) {
      row.push(row[j - 1] + triangle[i - 1][j - 1]);
    }

    triangle.push(row);
  }

  return triangle[n][0];
}

/**
 * Catalan number C(n)
 * C(n) = C(2n, n) / (n + 1) = (2n)! / ((n+1)! × n!)
 *
 * @param n - Index
 * @returns nth Catalan number
 *
 * @example
 * ```ts
 * catalan(0); // 1
 * catalan(3); // 5
 * catalan(5); // 42
 * ```
 */
export function catalan(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');
  if (n === 0) return 1;

  n = Math.floor(n);

  // Use formula: C(n) = C(2n, n) / (n + 1)
  return combinations(2 * n, n) / (n + 1);
}

/**
 * Partition function P(n)
 * Number of ways to write n as a sum of positive integers (order doesn't matter)
 *
 * @param n - Number to partition
 * @returns P(n)
 *
 * @example
 * ```ts
 * partition(4); // 5 (partitions: 4, 3+1, 2+2, 2+1+1, 1+1+1+1)
 * partition(5); // 7
 * ```
 */
export function partition(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');
  if (n === 0) return 1;

  n = Math.floor(n);

  // Use dynamic programming
  const dp: number[] = Array(n + 1).fill(0);
  dp[0] = 1;

  for (let i = 1; i <= n; i++) {
    for (let j = i; j <= n; j++) {
      dp[j] += dp[j - i];
    }
  }

  return dp[n];
}

/**
 * Generate all permutations of an array
 *
 * @param arr - Input array
 * @returns Array of all permutations
 *
 * @example
 * ```ts
 * generatePermutations([1, 2, 3]);
 * // [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
 * ```
 */
export function generatePermutations<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [[]];
  if (arr.length === 1) return [[arr[0]]];

  const result: T[][] = [];

  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const restPerms = generatePermutations(rest);

    for (const perm of restPerms) {
      result.push([arr[i], ...perm]);
    }
  }

  return result;
}

/**
 * Generate all combinations of k elements from an array
 *
 * @param arr - Input array
 * @param k - Number of elements to choose
 * @returns Array of all combinations
 *
 * @example
 * ```ts
 * generateCombinations([1, 2, 3, 4], 2);
 * // [[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]
 * ```
 */
export function generateCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  if (k === arr.length) return [arr];

  const result: T[][] = [];

  for (let i = 0; i <= arr.length - k; i++) {
    const rest = generateCombinations(arr.slice(i + 1), k - 1);
    for (const comb of rest) {
      result.push([arr[i], ...comb]);
    }
  }

  return result;
}
