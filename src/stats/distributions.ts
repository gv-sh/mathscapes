/**
 * Probability Distributions Module
 *
 * This module provides comprehensive probability distribution functions including
 * continuous and discrete distributions with PDF, CDF, quantile, and sampling capabilities.
 *
 * Continuous distributions: Normal, Uniform, Exponential, Beta, Gamma, Student's t, Chi-squared, F-distribution
 * Discrete distributions: Binomial, Poisson, Geometric, Multinomial, Hypergeometric
 */

import { mean, variance } from './descriptive';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Computes the natural logarithm of the gamma function: ln(Γ(x))
 * Uses Lanczos approximation for better accuracy
 *
 * @param x - Input value
 * @returns Natural logarithm of gamma function
 */
function logGamma(x: number): number {
  // Lanczos coefficients
  const coefficients = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
  ];

  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;

  for (let j = 0; j < 6; j++) {
    ser += coefficients[j] / ++y;
  }

  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Computes the gamma function: Γ(x)
 *
 * @param x - Input value
 * @returns Gamma function value
 */
function gamma(x: number): number {
  return Math.exp(logGamma(x));
}

/**
 * Computes the beta function: B(a, b) = Γ(a)Γ(b)/Γ(a+b)
 *
 * @param a - First parameter
 * @param b - Second parameter
 * @returns Beta function value
 */
function betaFunction(a: number, b: number): number {
  return Math.exp(logGamma(a) + logGamma(b) - logGamma(a + b));
}

/**
 * Incomplete gamma function (lower)
 * Used for chi-squared and gamma distributions
 */
function lowerIncompleteGamma(s: number, x: number): number {
  if (x <= 0) return 0;
  if (x < s + 1) {
    // Use series representation
    let sum = 1 / s;
    let term = 1 / s;
    for (let n = 1; n <= 100; n++) {
      term *= x / (s + n);
      sum += term;
      if (Math.abs(term) < 1e-10 * Math.abs(sum)) break;
    }
    return sum * Math.exp(-x + s * Math.log(x) - logGamma(s));
  } else {
    // Use continued fraction
    return gamma(s) * (1 - upperIncompleteGammaNormalized(s, x));
  }
}

/**
 * Normalized upper incomplete gamma function
 */
function upperIncompleteGammaNormalized(s: number, x: number): number {
  const epsilon = 1e-10;
  let a = 1 - s;
  let b = a + x + 1;
  let term = 0;
  let pn = [0, 1, x, x + 1];
  let result = pn[2] / pn[3];

  for (let n = 1; n <= 100; n++) {
    a++;
    b += 2;
    term++;
    const an = term * (s - term);
    pn = [pn[2], pn[3], b * pn[2] - an * pn[0], b * pn[3] - an * pn[1]];

    if (Math.abs(pn[3]) > 1e-30) {
      const newResult = pn[2] / pn[3];
      if (Math.abs(result - newResult) < epsilon * Math.abs(newResult)) {
        break;
      }
      result = newResult;
    }
  }

  return Math.exp(-x + s * Math.log(x) - logGamma(s)) * result;
}

/**
 * Incomplete beta function I_x(a, b)
 * Used for beta, binomial, and F-distributions
 */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x)
  );

  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaContinuedFraction(x, a, b) / a;
  } else {
    return 1 - bt * betaContinuedFraction(1 - x, b, a) / b;
  }
}

/**
 * Continued fraction for incomplete beta function
 */
function betaContinuedFraction(x: number, a: number, b: number): number {
  const epsilon = 1e-10;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;

  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= 100; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < epsilon) break;
  }

  return h;
}

/**
 * Error function erf(x)
 * Used for normal distribution
 */
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Inverse error function
 * Used for normal quantile function
 */
function erfInv(x: number): number {
  if (x < -1 || x > 1) {
    throw new Error('erfInv input must be in [-1, 1]');
  }
  if (x === 0) return 0;
  if (x === 1) return Infinity;
  if (x === -1) return -Infinity;

  const a = 0.147;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const ln1minusXsq = Math.log(1 - x * x);
  const term1 = 2 / (Math.PI * a) + ln1minusXsq / 2;
  const term2 = ln1minusXsq / a;

  return sign * Math.sqrt(Math.sqrt(term1 * term1 - term2) - term1);
}

/**
 * Factorial function
 * Uses memoization for efficiency
 */
const factorialCache: Map<number, number> = new Map([[0, 1], [1, 1]]);
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    return gamma(n + 1);
  }

  if (factorialCache.has(n)) {
    return factorialCache.get(n)!;
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    if (factorialCache.has(i)) {
      result = factorialCache.get(i)!;
    } else {
      result *= i;
      factorialCache.set(i, result);
    }
  }

  return result;
}

/**
 * Binomial coefficient C(n, k) = n! / (k! * (n-k)!)
 */
function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  // Use the more efficient multiplicative formula
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i) / (i + 1);
  }
  return result;
}

// ============================================================================
// Normal Distribution (Gaussian)
// ============================================================================

/**
 * Normal (Gaussian) distribution
 *
 * The normal distribution is the most important probability distribution in statistics.
 * It has the probability density function:
 * f(x) = (1 / (σ√(2π))) * exp(-((x - μ)²) / (2σ²))
 *
 * where μ is the mean and σ is the standard deviation.
 */
export const normal = {
  /**
   * Probability density function (PDF)
   *
   * @param x - Value to evaluate
   * @param mu - Mean (default: 0)
   * @param sigma - Standard deviation (default: 1)
   * @returns Probability density at x
   */
  pdf(x: number, mu: number = 0, sigma: number = 1): number {
    if (sigma <= 0) {
      throw new Error('Standard deviation must be positive');
    }
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  },

  /**
   * Cumulative distribution function (CDF)
   *
   * @param x - Value to evaluate
   * @param mu - Mean (default: 0)
   * @param sigma - Standard deviation (default: 1)
   * @returns Cumulative probability P(X ≤ x)
   */
  cdf(x: number, mu: number = 0, sigma: number = 1): number {
    if (sigma <= 0) {
      throw new Error('Standard deviation must be positive');
    }
    const z = (x - mu) / sigma;
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
  },

  /**
   * Quantile function (inverse CDF)
   *
   * @param p - Probability (must be in [0, 1])
   * @param mu - Mean (default: 0)
   * @param sigma - Standard deviation (default: 1)
   * @returns Value x such that P(X ≤ x) = p
   */
  quantile(p: number, mu: number = 0, sigma: number = 1): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (sigma <= 0) {
      throw new Error('Standard deviation must be positive');
    }
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return mu + sigma * Math.sqrt(2) * erfInv(2 * p - 1);
  },

  /**
   * Generate random sample from normal distribution
   *
   * Uses Box-Muller transform for generating random normal variates
   *
   * @param mu - Mean (default: 0)
   * @param sigma - Standard deviation (default: 1)
   * @param size - Number of samples (default: 1)
   * @returns Array of random samples
   */
  random(mu: number = 0, sigma: number = 1, size: number = 1): number[] {
    if (sigma <= 0) {
      throw new Error('Standard deviation must be positive');
    }
    if (size < 1) {
      throw new Error('Size must be at least 1');
    }

    const samples: number[] = [];
    for (let i = 0; i < size; i += 2) {
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

      samples.push(mu + sigma * z0);
      if (samples.length < size) {
        samples.push(mu + sigma * z1);
      }
    }

    return samples.slice(0, size);
  }
};

// ============================================================================
// Uniform Distribution
// ============================================================================

/**
 * Uniform distribution
 *
 * The continuous uniform distribution has constant probability density
 * over the interval [a, b]:
 * f(x) = 1/(b-a) for a ≤ x ≤ b, 0 otherwise
 */
export const uniform = {
  /**
   * Probability density function (PDF)
   */
  pdf(x: number, a: number = 0, b: number = 1): number {
    if (a >= b) {
      throw new Error('Lower bound must be less than upper bound');
    }
    return (x >= a && x <= b) ? 1 / (b - a) : 0;
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(x: number, a: number = 0, b: number = 1): number {
    if (a >= b) {
      throw new Error('Lower bound must be less than upper bound');
    }
    if (x < a) return 0;
    if (x > b) return 1;
    return (x - a) / (b - a);
  },

  /**
   * Quantile function (inverse CDF)
   */
  quantile(p: number, a: number = 0, b: number = 1): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (a >= b) {
      throw new Error('Lower bound must be less than upper bound');
    }
    return a + p * (b - a);
  },

  /**
   * Generate random samples
   */
  random(a: number = 0, b: number = 1, size: number = 1): number[] {
    if (a >= b) {
      throw new Error('Lower bound must be less than upper bound');
    }
    return Array.from({ length: size }, () => a + Math.random() * (b - a));
  }
};

// ============================================================================
// Exponential Distribution
// ============================================================================

/**
 * Exponential distribution
 *
 * Models the time between events in a Poisson process:
 * f(x) = λ * exp(-λx) for x ≥ 0
 *
 * where λ is the rate parameter.
 */
export const exponential = {
  /**
   * Probability density function (PDF)
   */
  pdf(x: number, lambda: number = 1): number {
    if (lambda <= 0) {
      throw new Error('Rate parameter must be positive');
    }
    return x < 0 ? 0 : lambda * Math.exp(-lambda * x);
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(x: number, lambda: number = 1): number {
    if (lambda <= 0) {
      throw new Error('Rate parameter must be positive');
    }
    return x < 0 ? 0 : 1 - Math.exp(-lambda * x);
  },

  /**
   * Quantile function (inverse CDF)
   */
  quantile(p: number, lambda: number = 1): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (lambda <= 0) {
      throw new Error('Rate parameter must be positive');
    }
    if (p === 0) return 0;
    if (p === 1) return Infinity;
    return -Math.log(1 - p) / lambda;
  },

  /**
   * Generate random samples
   */
  random(lambda: number = 1, size: number = 1): number[] {
    if (lambda <= 0) {
      throw new Error('Rate parameter must be positive');
    }
    return Array.from({ length: size }, () => -Math.log(Math.random()) / lambda);
  }
};

// ============================================================================
// Gamma Distribution
// ============================================================================

/**
 * Gamma distribution
 *
 * A flexible continuous distribution with shape parameter α and rate parameter β:
 * f(x) = (β^α / Γ(α)) * x^(α-1) * exp(-βx)
 */
export const gammaDistribution = {
  /**
   * Probability density function (PDF)
   */
  pdf(x: number, alpha: number, beta: number = 1): number {
    if (alpha <= 0 || beta <= 0) {
      throw new Error('Shape and rate parameters must be positive');
    }
    if (x < 0) return 0;
    if (x === 0) return alpha === 1 ? beta : 0;

    return Math.exp(
      alpha * Math.log(beta) - logGamma(alpha) +
      (alpha - 1) * Math.log(x) - beta * x
    );
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(x: number, alpha: number, beta: number = 1): number {
    if (alpha <= 0 || beta <= 0) {
      throw new Error('Shape and rate parameters must be positive');
    }
    if (x <= 0) return 0;
    return lowerIncompleteGamma(alpha, beta * x) / gamma(alpha);
  },

  /**
   * Quantile function (approximate)
   */
  quantile(p: number, alpha: number, beta: number = 1): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (alpha <= 0 || beta <= 0) {
      throw new Error('Shape and rate parameters must be positive');
    }

    // Use Newton's method to find inverse
    let x = alpha / beta; // Initial guess (mean)
    for (let i = 0; i < 20; i++) {
      const cdfVal = this.cdf(x, alpha, beta);
      const pdfVal = this.pdf(x, alpha, beta);
      if (Math.abs(cdfVal - p) < 1e-10) break;
      x = x - (cdfVal - p) / pdfVal;
      if (x < 0) x = 1e-10;
    }
    return x;
  },

  /**
   * Generate random samples
   * Uses Marsaglia and Tsang method for alpha >= 1
   */
  random(alpha: number, beta: number = 1, size: number = 1): number[] {
    if (alpha <= 0 || beta <= 0) {
      throw new Error('Shape and rate parameters must be positive');
    }

    const samples: number[] = [];

    for (let i = 0; i < size; i++) {
      if (alpha < 1) {
        // Use Johnk's generator
        let u: number, v: number, x: number, y: number;
        do {
          u = Math.random();
          v = Math.random();
          x = Math.pow(u, 1 / alpha);
          y = Math.pow(v, 1 / (1 - alpha));
        } while (x + y > 1);

        const e = -Math.log(Math.random());
        samples.push((e * x / (x + y)) / beta);
      } else {
        // Marsaglia and Tsang method
        const d = alpha - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);

        while (true) {
          let x: number, v: number;
          do {
            x = normal.random(0, 1, 1)[0];
            v = 1 + c * x;
          } while (v <= 0);

          v = v * v * v;
          const u = Math.random();
          if (u < 1 - 0.0331 * x * x * x * x) {
            samples.push(d * v / beta);
            break;
          }
          if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
            samples.push(d * v / beta);
            break;
          }
        }
      }
    }

    return samples;
  }
};

// ============================================================================
// Beta Distribution
// ============================================================================

/**
 * Beta distribution
 *
 * Defined on [0, 1] with shape parameters α and β:
 * f(x) = (x^(α-1) * (1-x)^(β-1)) / B(α, β)
 */
export const beta = {
  /**
   * Probability density function (PDF)
   */
  pdf(x: number, alpha: number, betaParam: number): number {
    if (alpha <= 0 || betaParam <= 0) {
      throw new Error('Shape parameters must be positive');
    }
    if (x < 0 || x > 1) return 0;
    if (x === 0) return alpha === 1 ? 1 / betaFunction(alpha, betaParam) : 0;
    if (x === 1) return betaParam === 1 ? 1 / betaFunction(alpha, betaParam) : 0;

    return Math.exp(
      (alpha - 1) * Math.log(x) + (betaParam - 1) * Math.log(1 - x) -
      (logGamma(alpha) + logGamma(betaParam) - logGamma(alpha + betaParam))
    );
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(x: number, alpha: number, betaParam: number): number {
    if (alpha <= 0 || betaParam <= 0) {
      throw new Error('Shape parameters must be positive');
    }
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return incompleteBeta(x, alpha, betaParam);
  },

  /**
   * Quantile function (approximate)
   */
  quantile(p: number, alpha: number, betaParam: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (alpha <= 0 || betaParam <= 0) {
      throw new Error('Shape parameters must be positive');
    }

    // Use Newton's method
    let x = alpha / (alpha + betaParam); // Initial guess (mean)
    for (let i = 0; i < 20; i++) {
      const cdfVal = this.cdf(x, alpha, betaParam);
      const pdfVal = this.pdf(x, alpha, betaParam);
      if (Math.abs(cdfVal - p) < 1e-10) break;
      x = x - (cdfVal - p) / pdfVal;
      x = Math.max(0, Math.min(1, x));
    }
    return x;
  },

  /**
   * Generate random samples
   * Uses the fact that if X ~ Gamma(α), Y ~ Gamma(β), then X/(X+Y) ~ Beta(α, β)
   */
  random(alpha: number, betaParam: number, size: number = 1): number[] {
    if (alpha <= 0 || betaParam <= 0) {
      throw new Error('Shape parameters must be positive');
    }

    const x = gammaDistribution.random(alpha, 1, size);
    const y = gammaDistribution.random(betaParam, 1, size);
    return x.map((xi, i) => xi / (xi + y[i]));
  }
};

// ============================================================================
// Student's t-Distribution
// ============================================================================

/**
 * Student's t-distribution
 *
 * Used in hypothesis testing when the sample size is small:
 * f(x) = Γ((ν+1)/2) / (√(νπ) Γ(ν/2)) * (1 + x²/ν)^(-(ν+1)/2)
 *
 * where ν is the degrees of freedom.
 */
export const studentT = {
  /**
   * Probability density function (PDF)
   */
  pdf(x: number, df: number): number {
    if (df <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }

    return Math.exp(
      logGamma((df + 1) / 2) - logGamma(df / 2) -
      0.5 * Math.log(df * Math.PI) -
      ((df + 1) / 2) * Math.log(1 + x * x / df)
    );
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(x: number, df: number): number {
    if (df <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }

    const t = df / (df + x * x);
    const iBeta = incompleteBeta(t, df / 2, 0.5);
    return x >= 0 ? 1 - 0.5 * iBeta : 0.5 * iBeta;
  },

  /**
   * Quantile function (approximate)
   */
  quantile(p: number, df: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (df <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }

    // Use Newton's method
    let x = 0; // Initial guess
    for (let i = 0; i < 20; i++) {
      const cdfVal = this.cdf(x, df);
      const pdfVal = this.pdf(x, df);
      if (Math.abs(cdfVal - p) < 1e-10) break;
      x = x - (cdfVal - p) / pdfVal;
    }
    return x;
  },

  /**
   * Generate random samples
   * Uses the fact that T = Z/√(V/ν) where Z ~ N(0,1) and V ~ χ²(ν)
   */
  random(df: number, size: number = 1): number[] {
    if (df <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }

    const z = normal.random(0, 1, size);
    const v = chiSquared.random(df, size);
    return z.map((zi, i) => zi / Math.sqrt(v[i] / df));
  }
};

// ============================================================================
// Chi-Squared Distribution
// ============================================================================

/**
 * Chi-squared distribution
 *
 * Distribution of sum of squares of k independent standard normal variables:
 * f(x) = (1 / (2^(k/2) Γ(k/2))) * x^(k/2-1) * exp(-x/2)
 */
export const chiSquared = {
  /**
   * Probability density function (PDF)
   */
  pdf(x: number, df: number): number {
    if (df <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }
    if (x < 0) return 0;
    if (x === 0) return df === 2 ? 0.5 : 0;

    return Math.exp(
      (df / 2 - 1) * Math.log(x) - x / 2 -
      (df / 2) * Math.log(2) - logGamma(df / 2)
    );
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(x: number, df: number): number {
    if (df <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }
    if (x <= 0) return 0;
    return lowerIncompleteGamma(df / 2, x / 2) / gamma(df / 2);
  },

  /**
   * Quantile function (approximate)
   */
  quantile(p: number, df: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (df <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }

    // Use Newton's method
    let x = df; // Initial guess
    for (let i = 0; i < 20; i++) {
      const cdfVal = this.cdf(x, df);
      const pdfVal = this.pdf(x, df);
      if (Math.abs(cdfVal - p) < 1e-10) break;
      x = x - (cdfVal - p) / pdfVal;
      if (x < 0) x = 1e-10;
    }
    return x;
  },

  /**
   * Generate random samples
   * Uses the fact that χ²(k) = Γ(k/2, 2)
   */
  random(df: number, size: number = 1): number[] {
    if (df <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }
    return gammaDistribution.random(df / 2, 0.5, size);
  }
};

// ============================================================================
// F-Distribution
// ============================================================================

/**
 * F-distribution
 *
 * Ratio of two chi-squared distributions, used in ANOVA:
 * If U ~ χ²(d₁) and V ~ χ²(d₂), then F = (U/d₁)/(V/d₂) ~ F(d₁, d₂)
 */
export const fDistribution = {
  /**
   * Probability density function (PDF)
   */
  pdf(x: number, df1: number, df2: number): number {
    if (df1 <= 0 || df2 <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }
    if (x < 0) return 0;

    return Math.exp(
      logGamma((df1 + df2) / 2) - logGamma(df1 / 2) - logGamma(df2 / 2) +
      (df1 / 2) * Math.log(df1) + (df2 / 2) * Math.log(df2) +
      (df1 / 2 - 1) * Math.log(x) -
      ((df1 + df2) / 2) * Math.log(df2 + df1 * x)
    );
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(x: number, df1: number, df2: number): number {
    if (df1 <= 0 || df2 <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }
    if (x <= 0) return 0;

    const t = df1 * x / (df1 * x + df2);
    return incompleteBeta(t, df1 / 2, df2 / 2);
  },

  /**
   * Quantile function (approximate)
   */
  quantile(p: number, df1: number, df2: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (df1 <= 0 || df2 <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }

    // Use Newton's method
    let x = 1; // Initial guess
    for (let i = 0; i < 20; i++) {
      const cdfVal = this.cdf(x, df1, df2);
      const pdfVal = this.pdf(x, df1, df2);
      if (Math.abs(cdfVal - p) < 1e-10) break;
      x = x - (cdfVal - p) / pdfVal;
      if (x < 0) x = 1e-10;
    }
    return x;
  },

  /**
   * Generate random samples
   */
  random(df1: number, df2: number, size: number = 1): number[] {
    if (df1 <= 0 || df2 <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }

    const u = chiSquared.random(df1, size);
    const v = chiSquared.random(df2, size);
    return u.map((ui, i) => (ui / df1) / (v[i] / df2));
  }
};

// ============================================================================
// Multivariate Normal Distribution
// ============================================================================

/**
 * Multivariate normal distribution
 *
 * Generalization of univariate normal to multiple dimensions.
 */
export const multivariateNormal = {
  /**
   * Probability density function (PDF)
   *
   * @param x - Vector to evaluate
   * @param mu - Mean vector
   * @param sigma - Covariance matrix (as flat array, row-major)
   * @returns Probability density at x
   */
  pdf(x: number[], mu: number[], sigma: number[][]): number {
    const k = x.length;
    if (mu.length !== k) {
      throw new Error('Mean vector must have same dimension as x');
    }
    if (sigma.length !== k || sigma[0].length !== k) {
      throw new Error('Covariance matrix must be k × k');
    }

    // Compute determinant and inverse (simplified for 2D case)
    const det = matrixDeterminant(sigma);
    if (det <= 0) {
      throw new Error('Covariance matrix must be positive definite');
    }

    const inv = matrixInverse(sigma);
    const diff = x.map((xi, i) => xi - mu[i]);

    // Compute (x - μ)ᵀ Σ⁻¹ (x - μ)
    let quadForm = 0;
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        quadForm += diff[i] * inv[i][j] * diff[j];
      }
    }

    const coeff = 1 / Math.sqrt(Math.pow(2 * Math.PI, k) * det);
    return coeff * Math.exp(-0.5 * quadForm);
  },

  /**
   * Generate random samples
   *
   * Uses Cholesky decomposition to generate correlated samples
   */
  random(mu: number[], sigma: number[][], size: number = 1): number[][] {
    const k = mu.length;
    if (sigma.length !== k || sigma[0].length !== k) {
      throw new Error('Covariance matrix must be k × k');
    }

    // Cholesky decomposition
    const L = choleskyDecomposition(sigma);

    const samples: number[][] = [];
    for (let s = 0; s < size; s++) {
      // Generate k independent standard normal samples
      const z = normal.random(0, 1, k);

      // Transform: x = μ + L * z
      const x: number[] = [];
      for (let i = 0; i < k; i++) {
        let sum = 0;
        for (let j = 0; j <= i; j++) {
          sum += L[i][j] * z[j];
        }
        x.push(mu[i] + sum);
      }
      samples.push(x);
    }

    return samples;
  }
};

// Helper functions for multivariate normal
function matrixDeterminant(matrix: number[][]): number {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  // General case using Laplace expansion (simplified)
  let det = 0;
  for (let j = 0; j < n; j++) {
    det += (j % 2 === 0 ? 1 : -1) * matrix[0][j] *
           matrixDeterminant(minor(matrix, 0, j));
  }
  return det;
}

function minor(matrix: number[][], row: number, col: number): number[][] {
  return matrix
    .filter((_, i) => i !== row)
    .map(r => r.filter((_, j) => j !== col));
}

function matrixInverse(matrix: number[][]): number[][] {
  const n = matrix.length;
  if (n === 1) return [[1 / matrix[0][0]]];

  if (n === 2) {
    const det = matrixDeterminant(matrix);
    return [
      [matrix[1][1] / det, -matrix[0][1] / det],
      [-matrix[1][0] / det, matrix[0][0] / det]
    ];
  }

  // General case using Gauss-Jordan elimination
  const aug = matrix.map((row, i) => [
    ...row,
    ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  ]);

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
        maxRow = k;
      }
    }
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

    // Scale pivot row
    const pivot = aug[i][i];
    for (let j = 0; j < 2 * n; j++) {
      aug[i][j] /= pivot;
    }

    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = aug[k][i];
        for (let j = 0; j < 2 * n; j++) {
          aug[k][j] -= factor * aug[i][j];
        }
      }
    }
  }

  return aug.map(row => row.slice(n));
}

function choleskyDecomposition(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }

      if (i === j) {
        L[i][j] = Math.sqrt(matrix[i][i] - sum);
      } else {
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
      }
    }
  }

  return L;
}

// ============================================================================
// Discrete Distributions
// ============================================================================

/**
 * Binomial distribution
 *
 * Number of successes in n independent Bernoulli trials:
 * P(X = k) = C(n,k) * p^k * (1-p)^(n-k)
 */
export const binomial = {
  /**
   * Probability mass function (PMF)
   */
  pmf(k: number, n: number, p: number): number {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('n must be a non-negative integer');
    }
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (!Number.isInteger(k) || k < 0 || k > n) return 0;

    return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(k: number, n: number, p: number): number {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('n must be a non-negative integer');
    }
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }

    k = Math.floor(k);
    if (k < 0) return 0;
    if (k >= n) return 1;

    return 1 - incompleteBeta(p, k + 1, n - k);
  },

  /**
   * Generate random samples
   */
  random(n: number, p: number, size: number = 1): number[] {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('n must be a non-negative integer');
    }
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }

    return Array.from({ length: size }, () => {
      let count = 0;
      for (let i = 0; i < n; i++) {
        if (Math.random() < p) count++;
      }
      return count;
    });
  }
};

/**
 * Poisson distribution
 *
 * Models the number of events occurring in a fixed interval:
 * P(X = k) = (λ^k * exp(-λ)) / k!
 */
export const poisson = {
  /**
   * Probability mass function (PMF)
   */
  pmf(k: number, lambda: number): number {
    if (lambda <= 0) {
      throw new Error('Rate parameter must be positive');
    }
    if (!Number.isInteger(k) || k < 0) return 0;

    return Math.exp(k * Math.log(lambda) - lambda - logGamma(k + 1));
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(k: number, lambda: number): number {
    if (lambda <= 0) {
      throw new Error('Rate parameter must be positive');
    }

    k = Math.floor(k);
    if (k < 0) return 0;

    // For discrete distributions, sum the PMF
    // This is more accurate and straightforward
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += this.pmf(i, lambda);
    }
    return sum;
  },

  /**
   * Generate random samples
   * Uses Knuth's algorithm for small λ, rejection method for large λ
   */
  random(lambda: number, size: number = 1): number[] {
    if (lambda <= 0) {
      throw new Error('Rate parameter must be positive');
    }

    return Array.from({ length: size }, () => {
      if (lambda < 30) {
        // Knuth's algorithm
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
          k++;
          p *= Math.random();
        } while (p > L);
        return k - 1;
      } else {
        // Rejection method
        const c = 0.767 - 3.36 / lambda;
        const beta = Math.PI / Math.sqrt(3 * lambda);
        const alpha = beta * lambda;
        const k_mode = Math.floor(lambda);

        while (true) {
          const u = Math.random() - 0.5;
          const v = Math.random();
          const x = Math.floor(alpha / Math.abs(u) + lambda + 0.43);

          if (x < 0) continue;

          const logAccept = x * Math.log(lambda) - lambda - logGamma(x + 1);
          const logTest = Math.log(v * alpha / (c + Math.abs(u)));

          if (logTest <= logAccept) {
            return x;
          }
        }
      }
    });
  }
};

/**
 * Geometric distribution
 *
 * Number of trials until first success:
 * P(X = k) = (1-p)^(k-1) * p
 */
export const geometric = {
  /**
   * Probability mass function (PMF)
   */
  pmf(k: number, p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }
    if (!Number.isInteger(k) || k < 1) return 0;

    return Math.pow(1 - p, k - 1) * p;
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(k: number, p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }

    k = Math.floor(k);
    if (k < 1) return 0;

    return 1 - Math.pow(1 - p, k);
  },

  /**
   * Generate random samples
   */
  random(p: number, size: number = 1): number[] {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be in [0, 1]');
    }

    return Array.from({ length: size }, () =>
      Math.floor(Math.log(Math.random()) / Math.log(1 - p)) + 1
    );
  }
};

/**
 * Multinomial distribution
 *
 * Generalization of binomial to multiple outcomes.
 *
 * @param counts - Array of counts for each category
 * @param probs - Array of probabilities for each category (must sum to 1)
 * @returns Probability of observing the given counts
 */
export function multinomialPMF(counts: number[], probs: number[]): number {
  if (counts.length !== probs.length) {
    throw new Error('Counts and probabilities must have same length');
  }

  const probSum = probs.reduce((a, b) => a + b, 0);
  if (Math.abs(probSum - 1) > 1e-10) {
    throw new Error('Probabilities must sum to 1');
  }

  const n = counts.reduce((a, b) => a + b, 0);

  // Compute multinomial coefficient
  let coeff = factorial(n);
  for (const count of counts) {
    coeff /= factorial(count);
  }

  // Compute probability
  let prob = 1;
  for (let i = 0; i < counts.length; i++) {
    prob *= Math.pow(probs[i], counts[i]);
  }

  return coeff * prob;
}

/**
 * Generate samples from multinomial distribution
 */
export function multinomialRandom(n: number, probs: number[], size: number = 1): number[][] {
  const probSum = probs.reduce((a, b) => a + b, 0);
  if (Math.abs(probSum - 1) > 1e-10) {
    throw new Error('Probabilities must sum to 1');
  }

  return Array.from({ length: size }, () => {
    const counts = Array(probs.length).fill(0);
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      let cumProb = 0;
      for (let j = 0; j < probs.length; j++) {
        cumProb += probs[j];
        if (r < cumProb) {
          counts[j]++;
          break;
        }
      }
    }
    return counts;
  });
}

/**
 * Hypergeometric distribution
 *
 * Sampling without replacement:
 * P(X = k) = C(K,k) * C(N-K,n-k) / C(N,n)
 *
 * where N is population size, K is number of success states in population,
 * n is number of draws, k is number of observed successes.
 */
export const hypergeometric = {
  /**
   * Probability mass function (PMF)
   */
  pmf(k: number, N: number, K: number, n: number): number {
    if (!Number.isInteger(k) || !Number.isInteger(N) ||
        !Number.isInteger(K) || !Number.isInteger(n)) {
      throw new Error('All parameters must be integers');
    }
    if (K < 0 || K > N || n < 0 || n > N) {
      throw new Error('Invalid parameters');
    }
    if (k < Math.max(0, n - N + K) || k > Math.min(n, K)) return 0;

    return (binomialCoefficient(K, k) * binomialCoefficient(N - K, n - k)) /
           binomialCoefficient(N, n);
  },

  /**
   * Cumulative distribution function (CDF)
   */
  cdf(k: number, N: number, K: number, n: number): number {
    k = Math.floor(k);
    let sum = 0;
    const kMin = Math.max(0, n - N + K);
    for (let i = kMin; i <= k; i++) {
      sum += this.pmf(i, N, K, n);
    }
    return sum;
  },

  /**
   * Generate random samples
   */
  random(N: number, K: number, n: number, size: number = 1): number[] {
    if (!Number.isInteger(N) || !Number.isInteger(K) || !Number.isInteger(n)) {
      throw new Error('All parameters must be integers');
    }
    if (K < 0 || K > N || n < 0 || n > N) {
      throw new Error('Invalid parameters');
    }

    return Array.from({ length: size }, () => {
      // Sample without replacement
      const population = Array(N).fill(0).map((_, i) => i < K ? 1 : 0);
      let successes = 0;

      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * (N - i));
        successes += population.splice(idx, 1)[0];
      }

      return successes;
    });
  }
};
