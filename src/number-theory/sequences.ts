/**
 * Special Integer Sequences
 *
 * This module provides functions for computing special integer sequences:
 * - Fibonacci numbers
 * - Lucas numbers
 * - Tribonacci numbers
 * - Factorial (also available in combinatorics)
 * - Catalan numbers (also available in combinatorics)
 * - Other famous sequences
 */

/**
 * Compute the nth Fibonacci number
 * F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
 *
 * @param n - Index (0-based)
 * @returns nth Fibonacci number
 *
 * @example
 * ```ts
 * fibonacci(0); // 0
 * fibonacci(1); // 1
 * fibonacci(10); // 55
 * ```
 */
export function fibonacci(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);

  if (n === 0) return 0;
  if (n === 1) return 1;

  let a = 0;
  let b = 1;

  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }

  return b;
}

/**
 * Generate first n Fibonacci numbers
 *
 * @param n - Number of Fibonacci numbers to generate
 * @returns Array of first n Fibonacci numbers
 *
 * @example
 * ```ts
 * fibonacciSequence(10); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
 * ```
 */
export function fibonacciSequence(n: number): number[] {
  if (n <= 0) return [];

  n = Math.floor(n);
  const sequence: number[] = [0];

  if (n === 1) return sequence;

  sequence.push(1);

  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }

  return sequence;
}

/**
 * Compute Fibonacci number using matrix exponentiation (faster for large n)
 * Time complexity: O(log n)
 *
 * @param n - Index
 * @returns nth Fibonacci number
 */
export function fibonacciFast(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);

  if (n === 0) return 0;
  if (n === 1) return 1;

  // Matrix [[F(n+1), F(n)], [F(n), F(n-1)]] = [[1,1],[1,0]]^n
  const matrixPower = (matrix: number[][], exp: number): number[][] => {
    if (exp === 1) return matrix;

    if (exp % 2 === 0) {
      const half = matrixPower(matrix, exp / 2);
      return multiplyMatrices(half, half);
    } else {
      return multiplyMatrices(matrix, matrixPower(matrix, exp - 1));
    }
  };

  const multiplyMatrices = (a: number[][], b: number[][]): number[][] => {
    return [
      [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
      [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
    ];
  };

  const result = matrixPower(
    [
      [1, 1],
      [1, 0],
    ],
    n
  );

  return result[0][1];
}

/**
 * Compute the nth Lucas number
 * L(0) = 2, L(1) = 1, L(n) = L(n-1) + L(n-2)
 *
 * @param n - Index (0-based)
 * @returns nth Lucas number
 *
 * @example
 * ```ts
 * lucas(0); // 2
 * lucas(1); // 1
 * lucas(5); // 11
 * ```
 */
export function lucas(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);

  if (n === 0) return 2;
  if (n === 1) return 1;

  let a = 2;
  let b = 1;

  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }

  return b;
}

/**
 * Compute the nth Tribonacci number
 * T(0) = 0, T(1) = 0, T(2) = 1, T(n) = T(n-1) + T(n-2) + T(n-3)
 *
 * @param n - Index (0-based)
 * @returns nth Tribonacci number
 *
 * @example
 * ```ts
 * tribonacci(0); // 0
 * tribonacci(5); // 4
 * tribonacci(10); // 149
 * ```
 */
export function tribonacci(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);

  if (n === 0 || n === 1) return 0;
  if (n === 2) return 1;

  let a = 0;
  let b = 0;
  let c = 1;

  for (let i = 3; i <= n; i++) {
    const temp = a + b + c;
    a = b;
    b = c;
    c = temp;
  }

  return c;
}

/**
 * Compute the nth Pell number
 * P(0) = 0, P(1) = 1, P(n) = 2×P(n-1) + P(n-2)
 *
 * @param n - Index (0-based)
 * @returns nth Pell number
 *
 * @example
 * ```ts
 * pell(0); // 0
 * pell(5); // 29
 * pell(10); // 2378
 * ```
 */
export function pell(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);

  if (n === 0) return 0;
  if (n === 1) return 1;

  let a = 0;
  let b = 1;

  for (let i = 2; i <= n; i++) {
    const temp = 2 * b + a;
    a = b;
    b = temp;
  }

  return b;
}

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
 * Compute double factorial n!!
 * n!! = n × (n-2) × (n-4) × ...
 *
 * @param n - Non-negative integer
 * @returns n!!
 *
 * @example
 * ```ts
 * doubleFactorial(6); // 48 (6 × 4 × 2)
 * doubleFactorial(7); // 105 (7 × 5 × 3 × 1)
 * ```
 */
export function doubleFactorial(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');
  if (n === 0 || n === 1) return 1;

  n = Math.floor(n);
  let result = n;

  for (let i = n - 2; i > 0; i -= 2) {
    result *= i;
  }

  return result;
}

/**
 * Compute nth Catalan number
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

  let result = 1;
  for (let i = 0; i < n; i++) {
    result *= 2 * n - i;
    result /= i + 1;
  }

  return Math.round(result / (n + 1));
}

/**
 * Compute nth triangular number
 * T(n) = 1 + 2 + ... + n = n(n+1)/2
 *
 * @param n - Index
 * @returns nth triangular number
 *
 * @example
 * ```ts
 * triangular(5); // 15 (1+2+3+4+5)
 * triangular(10); // 55
 * ```
 */
export function triangular(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);
  return (n * (n + 1)) / 2;
}

/**
 * Compute nth square number
 *
 * @param n - Index
 * @returns n²
 *
 * @example
 * ```ts
 * square(5); // 25
 * ```
 */
export function square(n: number): number {
  n = Math.floor(n);
  return n * n;
}

/**
 * Compute nth pentagonal number
 * P(n) = n(3n-1)/2
 *
 * @param n - Index
 * @returns nth pentagonal number
 *
 * @example
 * ```ts
 * pentagonal(5); // 35
 * ```
 */
export function pentagonal(n: number): number {
  n = Math.floor(n);
  return (n * (3 * n - 1)) / 2;
}

/**
 * Compute nth hexagonal number
 * H(n) = n(2n-1)
 *
 * @param n - Index
 * @returns nth hexagonal number
 *
 * @example
 * ```ts
 * hexagonal(5); // 45
 * ```
 */
export function hexagonal(n: number): number {
  n = Math.floor(n);
  return n * (2 * n - 1);
}

/**
 * Check if n is a perfect square
 *
 * @param n - Number to check
 * @returns true if n is a perfect square
 *
 * @example
 * ```ts
 * isPerfectSquare(16); // true
 * isPerfectSquare(15); // false
 * ```
 */
export function isPerfectSquare(n: number): boolean {
  if (n < 0) return false;

  const sqrt = Math.floor(Math.sqrt(n));
  return sqrt * sqrt === n;
}

/**
 * Check if n is a Fibonacci number
 * A number is Fibonacci if one of (5n²+4) or (5n²-4) is a perfect square
 *
 * @param n - Number to check
 * @returns true if n is a Fibonacci number
 *
 * @example
 * ```ts
 * isFibonacci(13); // true
 * isFibonacci(14); // false
 * ```
 */
export function isFibonacci(n: number): boolean {
  if (n < 0) return false;

  return (
    isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4)
  );
}

/**
 * Compute the sum of first n natural numbers
 * Sum = 1 + 2 + ... + n = n(n+1)/2
 *
 * @param n - Upper limit
 * @returns Sum of first n natural numbers
 */
export function sumOfN(n: number): number {
  return triangular(n);
}

/**
 * Compute the sum of squares of first n natural numbers
 * Sum = 1² + 2² + ... + n² = n(n+1)(2n+1)/6
 *
 * @param n - Upper limit
 * @returns Sum of squares
 *
 * @example
 * ```ts
 * sumOfSquares(5); // 55 (1+4+9+16+25)
 * ```
 */
export function sumOfSquares(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);
  return (n * (n + 1) * (2 * n + 1)) / 6;
}

/**
 * Compute the sum of cubes of first n natural numbers
 * Sum = 1³ + 2³ + ... + n³ = [n(n+1)/2]²
 *
 * @param n - Upper limit
 * @returns Sum of cubes
 *
 * @example
 * ```ts
 * sumOfCubes(5); // 225 (1+8+27+64+125)
 * ```
 */
export function sumOfCubes(n: number): number {
  if (n < 0) throw new Error('n must be non-negative');

  n = Math.floor(n);
  const sum = (n * (n + 1)) / 2;
  return sum * sum;
}
