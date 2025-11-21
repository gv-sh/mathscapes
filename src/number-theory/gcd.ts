/**
 * GCD, LCM, and Extended Euclidean Algorithm
 *
 * This module provides functions for computing greatest common divisors,
 * least common multiples, and solving linear Diophantine equations.
 */

/**
 * Compute the greatest common divisor (GCD) using Euclidean algorithm
 * Time complexity: O(log min(a, b))
 *
 * @param a - First number
 * @param b - Second number
 * @returns GCD of a and b
 *
 * @example
 * ```ts
 * gcd(48, 18); // 6
 * gcd(100, 35); // 5
 * ```
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.floor(a));
  b = Math.abs(Math.floor(b));

  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

/**
 * Compute GCD of multiple numbers
 *
 * @param numbers - Array of numbers
 * @returns GCD of all numbers
 *
 * @example
 * ```ts
 * gcdMultiple([48, 18, 30]); // 6
 * ```
 */
export function gcdMultiple(numbers: number[]): number {
  if (numbers.length === 0) throw new Error('Array must not be empty');
  if (numbers.length === 1) return Math.abs(numbers[0]);

  return numbers.reduce((acc, num) => gcd(acc, num));
}

/**
 * Compute the least common multiple (LCM)
 * LCM(a, b) = |a * b| / GCD(a, b)
 *
 * @param a - First number
 * @param b - Second number
 * @returns LCM of a and b
 *
 * @example
 * ```ts
 * lcm(12, 18); // 36
 * lcm(21, 6); // 42
 * ```
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;

  a = Math.abs(Math.floor(a));
  b = Math.abs(Math.floor(b));

  return (a * b) / gcd(a, b);
}

/**
 * Compute LCM of multiple numbers
 *
 * @param numbers - Array of numbers
 * @returns LCM of all numbers
 *
 * @example
 * ```ts
 * lcmMultiple([4, 6, 12]); // 12
 * ```
 */
export function lcmMultiple(numbers: number[]): number {
  if (numbers.length === 0) throw new Error('Array must not be empty');
  if (numbers.length === 1) return Math.abs(numbers[0]);

  return numbers.reduce((acc, num) => lcm(acc, num));
}

/**
 * Result of the extended Euclidean algorithm
 */
export interface ExtendedGCDResult {
  /** Greatest common divisor */
  gcd: number;
  /** Coefficient x such that ax + by = gcd(a, b) */
  x: number;
  /** Coefficient y such that ax + by = gcd(a, b) */
  y: number;
}

/**
 * Extended Euclidean Algorithm
 * Finds integers x, y such that ax + by = gcd(a, b)
 *
 * @param a - First number
 * @param b - Second number
 * @returns Object with gcd, x, and y
 *
 * @example
 * ```ts
 * const result = extendedGCD(240, 46);
 * // result.gcd = 2
 * // result.x * 240 + result.y * 46 = 2
 * ```
 */
export function extendedGCD(a: number, b: number): ExtendedGCDResult {
  const origA = a;
  const origB = b;

  a = Math.abs(Math.floor(a));
  b = Math.abs(Math.floor(b));

  if (b === 0) {
    return { gcd: a, x: 1, y: 0 };
  }

  let x0 = 1, x1 = 0;
  let y0 = 0, y1 = 1;

  while (b !== 0) {
    const q = Math.floor(a / b);
    const temp = b;
    b = a % b;
    a = temp;

    const tempX = x1;
    x1 = x0 - q * x1;
    x0 = tempX;

    const tempY = y1;
    y1 = y0 - q * y1;
    y0 = tempY;
  }

  // Adjust signs based on original inputs
  if (origA < 0) x0 = -x0;
  if (origB < 0) y0 = -y0;

  return { gcd: a, x: x0, y: y0 };
}

/**
 * Test if two numbers are coprime (relatively prime)
 * Two numbers are coprime if their GCD is 1
 *
 * @param a - First number
 * @param b - Second number
 * @returns true if a and b are coprime
 *
 * @example
 * ```ts
 * areCoprime(8, 15); // true
 * areCoprime(12, 18); // false
 * ```
 */
export function areCoprime(a: number, b: number): boolean {
  return gcd(a, b) === 1;
}

/**
 * Compute Euler's totient function φ(n)
 * φ(n) counts the positive integers up to n that are coprime to n
 *
 * @param n - Input number
 * @returns φ(n)
 *
 * @example
 * ```ts
 * eulerTotient(9); // 6 (numbers 1, 2, 4, 5, 7, 8 are coprime to 9)
 * eulerTotient(10); // 4 (numbers 1, 3, 7, 9 are coprime to 10)
 * ```
 */
export function eulerTotient(n: number): number {
  if (n <= 0) throw new Error('n must be positive');

  n = Math.floor(n);
  let result = n;

  // Find all prime factors and apply φ(n) = n * ∏(1 - 1/p) for all prime p dividing n
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      // Remove factor p
      while (n % p === 0) {
        n /= p;
      }
      // Apply formula
      result -= result / p;
    }
  }

  // If n > 1, then it's a prime factor
  if (n > 1) {
    result -= result / n;
  }

  return Math.floor(result);
}

/**
 * Solve linear Diophantine equation ax + by = c
 * Returns one particular solution if it exists
 *
 * @param a - Coefficient of x
 * @param b - Coefficient of y
 * @param c - Right-hand side
 * @returns Solution {x, y} or null if no solution exists
 *
 * @example
 * ```ts
 * const sol = solveDiophantine(3, 5, 1);
 * // sol = {x: 2, y: -1} since 3*2 + 5*(-1) = 1
 * ```
 */
export function solveDiophantine(
  a: number,
  b: number,
  c: number
): { x: number; y: number } | null {
  const { gcd: g, x: x0, y: y0 } = extendedGCD(a, b);

  if (c % g !== 0) {
    return null; // No solution exists
  }

  // Scale the solution
  const scale = c / g;
  return {
    x: x0 * scale,
    y: y0 * scale,
  };
}

/**
 * Find all divisors of n
 *
 * @param n - Input number
 * @returns Array of all divisors in ascending order
 *
 * @example
 * ```ts
 * divisors(12); // [1, 2, 3, 4, 6, 12]
 * divisors(28); // [1, 2, 4, 7, 14, 28]
 * ```
 */
export function divisors(n: number): number[] {
  if (n <= 0) throw new Error('n must be positive');

  n = Math.floor(n);
  const divs: number[] = [];
  const sqrt = Math.floor(Math.sqrt(n));

  for (let i = 1; i <= sqrt; i++) {
    if (n % i === 0) {
      divs.push(i);
      if (i !== n / i) {
        divs.push(n / i);
      }
    }
  }

  return divs.sort((a, b) => a - b);
}

/**
 * Count the number of divisors of n
 *
 * @param n - Input number
 * @returns Number of divisors
 *
 * @example
 * ```ts
 * divisorCount(12); // 6
 * divisorCount(28); // 6
 * ```
 */
export function divisorCount(n: number): number {
  if (n <= 0) throw new Error('n must be positive');

  n = Math.floor(n);
  let count = 0;
  const sqrt = Math.floor(Math.sqrt(n));

  for (let i = 1; i <= sqrt; i++) {
    if (n % i === 0) {
      count += i === n / i ? 1 : 2;
    }
  }

  return count;
}

/**
 * Compute the sum of divisors of n (σ(n))
 *
 * @param n - Input number
 * @returns Sum of all divisors
 *
 * @example
 * ```ts
 * divisorSum(12); // 28 (1+2+3+4+6+12)
 * divisorSum(6); // 12 (1+2+3+6)
 * ```
 */
export function divisorSum(n: number): number {
  if (n <= 0) throw new Error('n must be positive');

  n = Math.floor(n);
  let sum = 0;
  const sqrt = Math.floor(Math.sqrt(n));

  for (let i = 1; i <= sqrt; i++) {
    if (n % i === 0) {
      sum += i;
      if (i !== n / i) {
        sum += n / i;
      }
    }
  }

  return sum;
}

/**
 * Check if n is a perfect number
 * A perfect number equals the sum of its proper divisors
 *
 * @param n - Input number
 * @returns true if n is perfect
 *
 * @example
 * ```ts
 * isPerfect(6); // true (1+2+3 = 6)
 * isPerfect(28); // true (1+2+4+7+14 = 28)
 * ```
 */
export function isPerfect(n: number): boolean {
  if (n <= 0) return false;
  return divisorSum(n) === 2 * n;
}
