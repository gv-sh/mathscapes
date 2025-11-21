/**
 * Hypergeometric Functions
 *
 * This module provides basic implementations of hypergeometric functions:
 * - Hypergeometric function ₁F₁ (confluent hypergeometric function)
 * - Hypergeometric function ₂F₁ (Gauss hypergeometric function)
 * - Generalized hypergeometric function ₚFᵩ (basic cases)
 *
 * These functions are solutions to hypergeometric differential equations
 * and generalize many special functions.
 *
 * References:
 * - Abramowitz and Stegun, Handbook of Mathematical Functions
 * - NIST Digital Library of Mathematical Functions
 */

import { gamma, lnGamma } from './gamma';

/**
 * Compute the Pochhammer symbol (rising factorial)
 * (a)ₙ = a(a+1)(a+2)...(a+n-1) = Γ(a+n)/Γ(a)
 *
 * @param a - Parameter
 * @param n - Number of terms (non-negative integer)
 * @returns (a)ₙ
 */
export function pochhammer(a: number, n: number): number {
  if (n < 0) throw new Error('n must be non-negative');
  if (n === 0) return 1;

  n = Math.floor(n);

  // For integer a, use direct multiplication to avoid gamma function issues
  if (Number.isInteger(a) && a > 0 && n < 100) {
    let result = 1;
    for (let i = 0; i < n; i++) {
      result *= a + i;
    }
    return result;
  }

  // Use gamma function for general case
  try {
    return Math.exp(lnGamma(a + n) - lnGamma(a));
  } catch {
    // Fallback to direct multiplication
    let result = 1;
    for (let i = 0; i < n; i++) {
      result *= a + i;
    }
    return result;
  }
}

/**
 * Compute confluent hypergeometric function ₁F₁(a; b; z)
 * Also known as Kummer's function M(a, b, z)
 *
 * ₁F₁(a; b; z) = Σ (a)ₙ/(b)ₙ × zⁿ/n!
 *
 * @param a - Numerator parameter
 * @param b - Denominator parameter (must not be non-positive integer)
 * @param z - Argument
 * @returns ₁F₁(a; b; z)
 *
 * @example
 * ```ts
 * hypergeometric1F1(1, 1, 1); // e ≈ 2.7183
 * hypergeometric1F1(0.5, 1.5, 1); // ≈ 1.3179
 * ```
 */
export function hypergeometric1F1(a: number, b: number, z: number): number {
  if (Number.isInteger(b) && b <= 0) {
    throw new Error('b must not be a non-positive integer');
  }

  // Special cases
  if (z === 0) return 1;
  if (a === 0) return 1;
  if (a === b) return Math.exp(z);

  const maxIterations = 1000;
  const epsilon = 1e-15;

  let sum = 1;
  let term = 1;

  for (let n = 1; n < maxIterations; n++) {
    term *= (a + n - 1) * z / ((b + n - 1) * n);
    sum += term;

    if (Math.abs(term) < Math.abs(sum) * epsilon) {
      break;
    }

    // Check for divergence
    if (!isFinite(sum) || Math.abs(term) > 1e100) {
      throw new Error('Series diverged');
    }
  }

  return sum;
}

/**
 * Compute Gauss hypergeometric function ₂F₁(a, b; c; z)
 *
 * ₂F₁(a, b; c; z) = Σ (a)ₙ(b)ₙ/(c)ₙ × zⁿ/n!
 *
 * Converges for |z| < 1
 *
 * @param a - First numerator parameter
 * @param b - Second numerator parameter
 * @param c - Denominator parameter (must not be non-positive integer)
 * @param z - Argument (should satisfy |z| < 1 for convergence)
 * @returns ₂F₁(a, b; c; z)
 *
 * @example
 * ```ts
 * hypergeometric2F1(1, 1, 2, 0.5); // 2 - 2*log(2) ≈ 0.6137
 * hypergeometric2F1(0.5, 1, 1.5, 0.5); // ≈ 1.3179
 * ```
 */
export function hypergeometric2F1(a: number, b: number, c: number, z: number): number {
  if (Number.isInteger(c) && c <= 0) {
    throw new Error('c must not be a non-positive integer');
  }

  // Special cases
  if (z === 0) return 1;
  if (a === 0 || b === 0) return 1;

  // Warn about convergence for |z| >= 1
  if (Math.abs(z) >= 1) {
    // Use transformation for z < -1
    if (z < -1) {
      // Use Pfaff transformation: ₂F₁(a,b;c;z) = (1-z)^(-a) ₂F₁(a,c-b;c;z/(z-1))
      const w = z / (z - 1);
      return Math.pow(1 - z, -a) * hypergeometric2F1(a, c - b, c, w);
    }

    // For z close to 1, series may converge slowly
    if (Math.abs(z - 1) < 0.01) {
      throw new Error('z too close to 1, series convergence poor');
    }
  }

  const maxIterations = 1000;
  const epsilon = 1e-15;

  let sum = 1;
  let term = 1;

  for (let n = 1; n < maxIterations; n++) {
    term *= ((a + n - 1) * (b + n - 1) * z) / ((c + n - 1) * n);
    sum += term;

    if (Math.abs(term) < Math.abs(sum) * epsilon) {
      break;
    }

    // Check for divergence
    if (!isFinite(sum) || Math.abs(term) > 1e100) {
      throw new Error('Series diverged or converges too slowly');
    }
  }

  return sum;
}

/**
 * Compute generalized hypergeometric function ₚFᵩ
 *
 * ₚFᵩ([a₁,...,aₚ]; [b₁,...,bᵩ]; z) = Σ (a₁)ₙ...(aₚ)ₙ / (b₁)ₙ...(bᵩ)ₙ × zⁿ/n!
 *
 * @param a - Array of numerator parameters
 * @param b - Array of denominator parameters
 * @param z - Argument
 * @returns ₚFᵩ(a; b; z)
 *
 * @example
 * ```ts
 * hypergeometricPFQ([1, 2], [3], 0.5); // ₂F₁(1,2;3;0.5)
 * ```
 */
export function hypergeometricPFQ(a: number[], b: number[], z: number): number {
  // Check denominator parameters
  for (const bi of b) {
    if (Number.isInteger(bi) && bi <= 0) {
      throw new Error('Denominator parameters must not be non-positive integers');
    }
  }

  // Special case: z = 0
  if (z === 0) return 1;

  // Special case: any numerator parameter is 0
  if (a.some((ai) => ai === 0)) return 1;

  const p = a.length;
  const q = b.length;

  const maxIterations = 1000;
  const epsilon = 1e-15;

  let sum = 1;
  let term = 1;

  for (let n = 1; n < maxIterations; n++) {
    // Compute (a₁)ₙ...(aₚ)ₙ
    let numerator = 1;
    for (const ai of a) {
      numerator *= ai + n - 1;
    }

    // Compute (b₁)ₙ...(bᵩ)ₙ
    let denominator = 1;
    for (const bi of b) {
      denominator *= bi + n - 1;
    }

    term *= (numerator * z) / (denominator * n);
    sum += term;

    if (Math.abs(term) < Math.abs(sum) * epsilon) {
      break;
    }

    // Check for divergence
    if (!isFinite(sum) || Math.abs(term) > 1e100) {
      // Series might diverge if p > q + 1 and |z| >= 1
      if (p > q + 1) {
        throw new Error('Series diverged (p > q+1 requires |z| < 1)');
      }
      throw new Error('Series diverged or converges too slowly');
    }
  }

  return sum;
}

/**
 * Compute the hypergeometric U function (confluent hypergeometric function of second kind)
 * U(a, b, z) = Γ(1-b)/Γ(a-b+1) × ₁F₁(a; b; z) + Γ(b-1)/Γ(a) × z^(1-b) × ₁F₁(a-b+1; 2-b; z)
 *
 * For basic cases where the formula is stable
 *
 * @param a - First parameter
 * @param b - Second parameter
 * @param z - Argument (must be positive)
 * @returns U(a, b, z)
 */
export function hypergeometricU(a: number, b: number, z: number): number {
  if (z <= 0) throw new Error('z must be positive for U function');

  // For large z, use asymptotic expansion
  if (z > 30) {
    return Math.pow(z, -a) * hypergeometricAsymptoticU(a, b, z);
  }

  // Use series expansion
  const maxIterations = 1000;
  const epsilon = 1e-15;

  try {
    const coeff1 = Math.exp(lnGamma(1 - b) - lnGamma(a - b + 1));
    const term1 = coeff1 * hypergeometric1F1(a, b, z);

    const coeff2 = Math.exp(lnGamma(b - 1) - lnGamma(a) + (1 - b) * Math.log(z));
    const term2 = coeff2 * hypergeometric1F1(a - b + 1, 2 - b, z);

    return term1 + term2;
  } catch {
    // Fallback: use direct series
    let sum = 0;
    let term = 1;

    for (let n = 0; n < maxIterations; n++) {
      if (n > 0) {
        term *= ((a + n - 1) * z) / (n * (b + n - 1));
      }

      const contribution = term * Math.pow(z, -a - n);
      sum += contribution;

      if (Math.abs(contribution) < Math.abs(sum) * epsilon) {
        break;
      }
    }

    return sum;
  }
}

/**
 * Asymptotic expansion for U function (large z)
 * @private
 */
function hypergeometricAsymptoticU(a: number, b: number, z: number): number {
  let sum = 1;
  let term = 1;

  for (let n = 1; n < 20; n++) {
    term *= ((a + n - 1) * (a - b + n)) / (n * z);
    sum += term;

    if (Math.abs(term) < 1e-15) break;
  }

  return sum;
}

/**
 * Compute the regularized hypergeometric function
 * ₁F̃₁(a; b; z) = ₁F₁(a; b; z) / Γ(b)
 *
 * @param a - Numerator parameter
 * @param b - Denominator parameter
 * @param z - Argument
 * @returns ₁F̃₁(a; b; z)
 */
export function regularizedHypergeometric1F1(a: number, b: number, z: number): number {
  return hypergeometric1F1(a, b, z) / gamma(b);
}

/**
 * Compute the Whittaker M function
 * M_{κ,μ}(z) = z^(μ+1/2) × e^(-z/2) × ₁F₁(μ-κ+1/2; 2μ+1; z)
 *
 * @param kappa - Parameter κ
 * @param mu - Parameter μ
 * @param z - Argument
 * @returns M_{κ,μ}(z)
 */
export function whittakerM(kappa: number, mu: number, z: number): number {
  const a = mu - kappa + 0.5;
  const b = 2 * mu + 1;

  return Math.pow(z, mu + 0.5) * Math.exp(-z / 2) * hypergeometric1F1(a, b, z);
}

/**
 * Compute the Whittaker W function
 * W_{κ,μ}(z) = z^(μ+1/2) × e^(-z/2) × U(μ-κ+1/2; 2μ+1; z)
 *
 * @param kappa - Parameter κ
 * @param mu - Parameter μ
 * @param z - Argument (must be positive)
 * @returns W_{κ,μ}(z)
 */
export function whittakerW(kappa: number, mu: number, z: number): number {
  if (z <= 0) throw new Error('z must be positive for Whittaker W');

  const a = mu - kappa + 0.5;
  const b = 2 * mu + 1;

  return Math.pow(z, mu + 0.5) * Math.exp(-z / 2) * hypergeometricU(a, b, z);
}
