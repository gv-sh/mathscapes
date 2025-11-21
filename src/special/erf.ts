/**
 * Error Functions
 *
 * This module provides implementations of the error function and related functions:
 * - Error function (erf)
 * - Complementary error function (erfc)
 * - Inverse error function (erfInv)
 * - Scaled complementary error function (erfcx)
 *
 * These functions are important in probability, statistics, and physics.
 *
 * References:
 * - Abramowitz and Stegun, Handbook of Mathematical Functions
 * - Numerical Recipes in C (Press et al.)
 */

/**
 * Compute the error function erf(x)
 * erf(x) = (2/√π) ∫₀ˣ e^(-t²) dt
 *
 * Uses rational approximations for different ranges of x
 *
 * @param x - Input value
 * @returns erf(x) in range [-1, 1]
 *
 * @example
 * ```ts
 * erf(0); // 0
 * erf(1); // ≈ 0.8427
 * erf(-1); // ≈ -0.8427
 * erf(Infinity); // 1
 * ```
 */
export function erf(x: number): number {
  // Special cases
  if (x === 0) return 0;
  if (x === Infinity) return 1;
  if (x === -Infinity) return -1;
  if (isNaN(x)) return NaN;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  // For large x, use asymptotic expansion via erfc
  if (x > 6) {
    return sign * (1 - erfc(x));
  }

  // Abramowitz and Stegun approximation (maximum error: 1.5e-7)
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * x);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;

  return sign * (1 - (a1 * t + a2 * t2 + a3 * t3 + a4 * t4 + a5 * t5) * Math.exp(-x * x));
}

/**
 * Compute the complementary error function erfc(x)
 * erfc(x) = 1 - erf(x) = (2/√π) ∫ₓ^∞ e^(-t²) dt
 *
 * @param x - Input value
 * @returns erfc(x) in range [0, 2]
 *
 * @example
 * ```ts
 * erfc(0); // 1
 * erfc(1); // ≈ 0.1573
 * erfc(Infinity); // 0
 * ```
 */
export function erfc(x: number): number {
  // Special cases
  if (x === Infinity) return 0;
  if (x === -Infinity) return 2;
  if (isNaN(x)) return NaN;

  // For small |x|, use erf
  if (Math.abs(x) < 0.5) {
    return 1 - erf(x);
  }

  // For negative x, use symmetry
  if (x < 0) {
    return 2 - erfc(-x);
  }

  // For large positive x, use continued fraction expansion
  if (x > 6) {
    return erfcAsymptotic(x);
  }

  // For moderate x, use rational approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * x);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;

  return (a1 * t + a2 * t2 + a3 * t3 + a4 * t4 + a5 * t5) * Math.exp(-x * x);
}

/**
 * Asymptotic expansion for erfc (for large x)
 * @private
 */
function erfcAsymptotic(x: number): number {
  const sqrtPi = Math.sqrt(Math.PI);
  const x2 = x * x;

  // Asymptotic series: erfc(x) ~ (e^(-x²) / (x√π)) * (1 - 1/(2x²) + 3/(4x⁴) - ...)
  let sum = 1;
  let term = 1;

  for (let n = 1; n < 10; n++) {
    term *= -(2 * n - 1) / (2 * x2);
    sum += term;

    if (Math.abs(term) < 1e-15) break;
  }

  return (Math.exp(-x2) / (x * sqrtPi)) * sum;
}

/**
 * Compute the scaled complementary error function erfcx(x)
 * erfcx(x) = e^(x²) × erfc(x)
 *
 * This function avoids overflow for large positive x
 *
 * @param x - Input value
 * @returns erfcx(x)
 *
 * @example
 * ```ts
 * erfcx(0); // 1
 * erfcx(10); // ≈ 0.0564
 * ```
 */
export function erfcx(x: number): number {
  if (isNaN(x)) return NaN;

  // For small |x|, use direct formula
  if (Math.abs(x) < 0.5) {
    return Math.exp(x * x) * erfc(x);
  }

  // For negative x, use relation: erfcx(-x) = 2e^(x²) - erfcx(x)
  if (x < 0) {
    return 2 * Math.exp(x * x) - erfcx(-x);
  }

  // For positive x, use continued fraction to avoid overflow
  const sqrtPi = Math.sqrt(Math.PI);
  const x2 = x * x;

  let a = 1;
  let b = x;
  let c = x;
  let d = x2 + 0.5;
  let e = 0;

  for (let n = 1; n < 100; n++) {
    const an = n * 0.5;
    a = (a + e * an) * b;
    b = 1;
    e = (d > a) ? (d - a) / d : (a - d) / a;
    c = c + e * c;
    d = d + an;

    if (Math.abs(e) < 1e-15) break;
  }

  return 1 / (x * sqrtPi * c);
}

/**
 * Compute the inverse error function erf⁻¹(x)
 * Returns y such that erf(y) = x
 *
 * @param x - Input value (must be in (-1, 1))
 * @returns erf⁻¹(x)
 *
 * @example
 * ```ts
 * erfInv(0); // 0
 * erfInv(0.8427); // ≈ 1
 * erfInv(-0.8427); // ≈ -1
 * ```
 */
export function erfInv(x: number): number {
  if (x <= -1 || x >= 1) {
    if (x === -1) return -Infinity;
    if (x === 1) return Infinity;
    return NaN;
  }

  if (x === 0) return 0;

  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);

  // Use rational approximation
  let result: number;

  if (a <= 0.7) {
    // For |x| ≤ 0.7, use polynomial approximation
    const a2 = a * a;
    result = a * (
      1.0 +
      a2 * (0.88622692545275801 +
      a2 * (0.23195074746789731 +
      a2 * (0.12759308945888992 +
      a2 * (0.13082485253923686))))
    ) / (
      1.0 +
      a2 * (0.88622692545275801 +
      a2 * (0.46390149493579462 +
      a2 * (0.38279025494540964 +
      a2 * (0.23254001970494051 +
      a2 * (0.082090612322829414 +
      a2 * (0.012888569617849693))))))
    );
  } else {
    // For 0.7 < |x| < 1, use different approximation
    const y = Math.sqrt(-Math.log((1 - a) / 2));

    result = (
      2.3195125565432387 +
      y * (3.5925285124451088 +
      y * (1.7130917081891343 +
      y * (0.28205565634680338 +
      y * (0.008164878484474528))))
    ) / (
      1.0 +
      y * (1.4164799856731667 +
      y * (0.79704264404346638 +
      y * (0.26784150085846437 +
      y * (0.046508896555089705 +
      y * (0.0031340292633651072)))))
    );
  }

  // Refine using Newton's method
  for (let i = 0; i < 2; i++) {
    const err = erf(result) - a;
    result -= err / ((2 / Math.sqrt(Math.PI)) * Math.exp(-result * result));
  }

  return sign * result;
}

/**
 * Compute the inverse complementary error function erfc⁻¹(x)
 * Returns y such that erfc(y) = x
 *
 * @param x - Input value (must be in (0, 2))
 * @returns erfc⁻¹(x)
 *
 * @example
 * ```ts
 * erfcInv(1); // 0
 * erfcInv(0.1573); // ≈ 1
 * ```
 */
export function erfcInv(x: number): number {
  if (x <= 0 || x >= 2) {
    if (x === 0) return Infinity;
    if (x === 2) return -Infinity;
    return NaN;
  }

  return erfInv(1 - x);
}

/**
 * Compute the imaginary error function erfi(x)
 * erfi(x) = -i × erf(ix) = (2/√π) ∫₀ˣ e^(t²) dt
 *
 * @param x - Input value
 * @returns erfi(x)
 *
 * @example
 * ```ts
 * erfi(0); // 0
 * erfi(1); // ≈ 1.6504
 * ```
 */
export function erfi(x: number): number {
  if (x === 0) return 0;
  if (isNaN(x)) return NaN;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  // Use series expansion for small x
  if (x < 2) {
    const sqrtPi = Math.sqrt(Math.PI);
    const x2 = x * x;
    let sum = x;
    let term = x;

    for (let n = 1; n < 100; n++) {
      term *= x2 / n;
      const next = term / (2 * n + 1);
      sum += next;

      if (Math.abs(next) < Math.abs(sum) * 1e-15) break;
    }

    return sign * (2 / sqrtPi) * sum;
  }

  // For large x, use asymptotic expansion
  const sqrtPi = Math.sqrt(Math.PI);
  const x2 = x * x;
  let sum = 1;
  let term = 1;

  for (let n = 1; n < 10; n++) {
    term *= (2 * n - 1) / (2 * x2);
    sum += term;

    if (Math.abs(term) < 1e-15) break;
  }

  return sign * (Math.exp(x2) / (x * sqrtPi)) * sum;
}

/**
 * Compute the Dawson function D(x)
 * D(x) = e^(-x²) ∫₀ˣ e^(t²) dt = (√π/2) × e^(-x²) × erfi(x)
 *
 * @param x - Input value
 * @returns D(x)
 *
 * @example
 * ```ts
 * dawson(0); // 0
 * dawson(1); // ≈ 0.5380
 * ```
 */
export function dawson(x: number): number {
  if (x === 0) return 0;
  if (isNaN(x)) return NaN;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  // Use series expansion for small x
  if (x < 0.2) {
    const x2 = x * x;
    let sum = x;
    let term = x;

    for (let n = 1; n < 100; n++) {
      term *= -2 * x2 / (2 * n + 1);
      sum += term;

      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }

    return sign * sum;
  }

  // Use relation: D(x) = (√π/2) × e^(-x²) × erfi(x)
  return sign * (Math.sqrt(Math.PI) / 2) * Math.exp(-x * x) * erfi(x);
}

/**
 * Compute the Faddeeva function w(z) for real argument
 * w(x) = e^(-x²) × erfc(-ix) = e^(-x²) × (1 + (2i/√π) ∫₀ˣ e^(t²) dt)
 *
 * For real x, returns the real part
 *
 * @param x - Input value
 * @returns Re[w(x)]
 */
export function faddeeva(x: number): number {
  // For real argument: w(x) = e^(-x²) × (1 + i×√π×erfi(x))
  // Real part: e^(-x²)
  return Math.exp(-x * x) + Math.sqrt(Math.PI) * dawson(x);
}
