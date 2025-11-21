/**
 * Gamma and Beta Functions
 *
 * This module provides implementations of the Gamma and Beta functions,
 * which are important special functions in mathematics and statistics.
 *
 * References:
 * - Numerical Recipes in C (Press et al.)
 * - NIST Digital Library of Mathematical Functions
 */

/**
 * Compute the natural logarithm of the Gamma function ln(Γ(x))
 * Uses Lanczos approximation for high accuracy
 *
 * @param x - Input value (must be positive)
 * @returns ln(Γ(x))
 *
 * @example
 * ```ts
 * lnGamma(5); // ln(24) ≈ 3.178
 * ```
 */
export function lnGamma(x: number): number {
  if (x <= 0) throw new Error('Gamma function is undefined for non-positive integers');

  // Lanczos coefficients for g=7, n=9
  const g = 7;
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];

  if (x < 0.5) {
    // Use reflection formula: Γ(1-z)Γ(z) = π/sin(πz)
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }

  x -= 1;

  let a = coef[0];
  for (let i = 1; i < coef.length; i++) {
    a += coef[i] / (x + i);
  }

  const t = x + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/**
 * Compute the Gamma function Γ(x)
 * Γ(n) = (n-1)! for positive integers
 *
 * @param x - Input value
 * @returns Γ(x)
 *
 * @example
 * ```ts
 * gamma(5); // 24 (same as 4!)
 * gamma(0.5); // √π ≈ 1.772
 * gamma(3.5); // ≈ 3.323
 * ```
 */
export function gamma(x: number): number {
  if (x <= 0 && Number.isInteger(x)) {
    throw new Error('Gamma function is undefined for non-positive integers');
  }

  // Special cases
  if (x === 0.5) return Math.sqrt(Math.PI);
  if (Number.isInteger(x) && x > 0) {
    // Γ(n) = (n-1)!
    let result = 1;
    for (let i = 2; i < x; i++) {
      result *= i;
    }
    return result;
  }

  return Math.exp(lnGamma(x));
}

/**
 * Compute the lower incomplete gamma function γ(s, x)
 * γ(s, x) = ∫₀ˣ t^(s-1) e^(-t) dt
 *
 * Uses series expansion for small x, continued fraction for large x
 *
 * @param s - Shape parameter (must be positive)
 * @param x - Upper limit of integration (must be non-negative)
 * @returns γ(s, x)
 */
export function lowerIncompleteGamma(s: number, x: number): number {
  if (s <= 0) throw new Error('s must be positive');
  if (x < 0) throw new Error('x must be non-negative');

  if (x === 0) return 0;

  // Use series expansion for x < s + 1
  if (x < s + 1) {
    return gammaSeriesExpansion(s, x);
  }

  // Use continued fraction for x ≥ s + 1
  return gamma(s) - upperIncompleteGammaCF(s, x);
}

/**
 * Compute the upper incomplete gamma function Γ(s, x)
 * Γ(s, x) = ∫ₓ^∞ t^(s-1) e^(-t) dt
 *
 * @param s - Shape parameter (must be positive)
 * @param x - Lower limit of integration (must be non-negative)
 * @returns Γ(s, x)
 */
export function upperIncompleteGamma(s: number, x: number): number {
  if (s <= 0) throw new Error('s must be positive');
  if (x < 0) throw new Error('x must be non-negative');

  if (x === 0) return gamma(s);

  // Use continued fraction
  if (x >= s + 1) {
    return upperIncompleteGammaCF(s, x);
  }

  // Use series expansion
  return gamma(s) - gammaSeriesExpansion(s, x);
}

/**
 * Series expansion for lower incomplete gamma function
 * @private
 */
function gammaSeriesExpansion(s: number, x: number): number {
  const maxIterations = 100;
  const epsilon = 1e-10;

  let sum = 1 / s;
  let term = 1 / s;

  for (let n = 1; n < maxIterations; n++) {
    term *= x / (s + n);
    sum += term;

    if (Math.abs(term) < Math.abs(sum) * epsilon) {
      break;
    }
  }

  return Math.exp(-x + s * Math.log(x) - lnGamma(s)) * sum;
}

/**
 * Continued fraction for upper incomplete gamma function
 * @private
 */
function upperIncompleteGammaCF(s: number, x: number): number {
  const maxIterations = 100;
  const epsilon = 1e-10;

  let b = x + 1 - s;
  let c = 1 / epsilon;
  let d = 1 / b;
  let h = d;

  for (let i = 1; i < maxIterations; i++) {
    const a = -i * (i - s);
    b += 2;
    d = a * d + b;

    if (Math.abs(d) < epsilon) d = epsilon;

    c = b + a / c;

    if (Math.abs(c) < epsilon) c = epsilon;

    d = 1 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) < epsilon) {
      break;
    }
  }

  return Math.exp(-x + s * Math.log(x) - lnGamma(s)) * h;
}

/**
 * Compute the regularized lower incomplete gamma function P(s, x)
 * P(s, x) = γ(s, x) / Γ(s)
 *
 * @param s - Shape parameter (must be positive)
 * @param x - Upper limit of integration (must be non-negative)
 * @returns P(s, x) in range [0, 1]
 */
export function regularizedGammaP(s: number, x: number): number {
  return lowerIncompleteGamma(s, x) / gamma(s);
}

/**
 * Compute the regularized upper incomplete gamma function Q(s, x)
 * Q(s, x) = Γ(s, x) / Γ(s) = 1 - P(s, x)
 *
 * @param s - Shape parameter (must be positive)
 * @param x - Lower limit of integration (must be non-negative)
 * @returns Q(s, x) in range [0, 1]
 */
export function regularizedGammaQ(s: number, x: number): number {
  return 1 - regularizedGammaP(s, x);
}

/**
 * Compute the digamma function ψ(x) = Γ'(x) / Γ(x)
 * The logarithmic derivative of the gamma function
 *
 * @param x - Input value
 * @returns ψ(x)
 *
 * @example
 * ```ts
 * digamma(1); // -γ (Euler-Mascheroni constant) ≈ -0.5772
 * ```
 */
export function digamma(x: number): number {
  if (x <= 0 && Number.isInteger(x)) {
    throw new Error('Digamma function is undefined for non-positive integers');
  }

  // Use reflection formula for x < 0
  if (x < 0) {
    return digamma(1 - x) + Math.PI / Math.tan(Math.PI * x);
  }

  // Use recurrence relation for small x
  let result = 0;
  while (x < 7) {
    result -= 1 / x;
    x += 1;
  }

  // Asymptotic expansion for large x
  const invX = 1 / x;
  const invX2 = invX * invX;

  result +=
    Math.log(x) -
    0.5 * invX -
    invX2 / 12 +
    invX2 * invX2 / 120 -
    invX2 * invX2 * invX2 / 252;

  return result;
}

/**
 * Compute the Beta function B(a, b)
 * B(a, b) = Γ(a)Γ(b) / Γ(a+b)
 *
 * @param a - First parameter (must be positive)
 * @param b - Second parameter (must be positive)
 * @returns B(a, b)
 *
 * @example
 * ```ts
 * beta(2, 3); // 1/12 ≈ 0.0833
 * beta(0.5, 0.5); // π
 * ```
 */
export function beta(a: number, b: number): number {
  if (a <= 0 || b <= 0) throw new Error('Beta function parameters must be positive');

  return Math.exp(lnGamma(a) + lnGamma(b) - lnGamma(a + b));
}

/**
 * Compute the natural logarithm of the Beta function ln(B(a, b))
 *
 * @param a - First parameter (must be positive)
 * @param b - Second parameter (must be positive)
 * @returns ln(B(a, b))
 */
export function lnBeta(a: number, b: number): number {
  if (a <= 0 || b <= 0) throw new Error('Beta function parameters must be positive');

  return lnGamma(a) + lnGamma(b) - lnGamma(a + b);
}

/**
 * Compute the incomplete Beta function B(x; a, b)
 * B(x; a, b) = ∫₀ˣ t^(a-1) (1-t)^(b-1) dt
 *
 * @param x - Upper limit (must be in [0, 1])
 * @param a - First parameter (must be positive)
 * @param b - Second parameter (must be positive)
 * @returns B(x; a, b)
 */
export function incompleteBeta(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) throw new Error('x must be in [0, 1]');
  if (a <= 0 || b <= 0) throw new Error('Parameters must be positive');

  if (x === 0) return 0;
  if (x === 1) return beta(a, b);

  // Use symmetry relation if x > 0.5
  if (x > 0.5) {
    return beta(a, b) - incompleteBeta(1 - x, b, a);
  }

  return incompleteBetaCF(x, a, b);
}

/**
 * Continued fraction for incomplete beta function
 * @private
 */
function incompleteBetaCF(x: number, a: number, b: number): number {
  const maxIterations = 100;
  const epsilon = 1e-10;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;

  let c = 1;
  let d = 1 - (qab * x) / qap;

  if (Math.abs(d) < epsilon) d = epsilon;
  d = 1 / d;

  let h = d;

  for (let m = 1; m < maxIterations; m++) {
    const m2 = 2 * m;
    const aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));

    d = 1 + aa * d;
    if (Math.abs(d) < epsilon) d = epsilon;

    c = 1 + aa / c;
    if (Math.abs(c) < epsilon) c = epsilon;

    d = 1 / d;
    h *= d * c;

    const aa2 = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));

    d = 1 + aa2 * d;
    if (Math.abs(d) < epsilon) d = epsilon;

    c = 1 + aa2 / c;
    if (Math.abs(c) < epsilon) c = epsilon;

    d = 1 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) < epsilon) {
      break;
    }
  }

  return (Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lnBeta(a, b)) * h) / a;
}

/**
 * Compute the regularized incomplete Beta function I(x; a, b)
 * I(x; a, b) = B(x; a, b) / B(a, b)
 *
 * @param x - Upper limit (must be in [0, 1])
 * @param a - First parameter (must be positive)
 * @param b - Second parameter (must be positive)
 * @returns I(x; a, b) in range [0, 1]
 */
export function regularizedBeta(x: number, a: number, b: number): number {
  return incompleteBeta(x, a, b) / beta(a, b);
}

/**
 * Compute the multivariate gamma function (used in multivariate statistics)
 * Γₚ(a) = π^(p(p-1)/4) ∏ᵢ₌₁ᵖ Γ(a + (1-i)/2)
 *
 * @param a - Parameter
 * @param p - Dimension
 * @returns Γₚ(a)
 */
export function multivariateGamma(a: number, p: number): number {
  if (p < 1) throw new Error('Dimension p must be at least 1');

  let result = Math.pow(Math.PI, (p * (p - 1)) / 4);

  for (let i = 1; i <= p; i++) {
    result *= gamma(a + (1 - i) / 2);
  }

  return result;
}
