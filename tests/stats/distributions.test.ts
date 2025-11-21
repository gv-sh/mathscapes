import {
  normal,
  uniform,
  exponential,
  gammaDistribution,
  beta,
  studentT,
  chiSquared,
  fDistribution,
  multivariateNormal,
  binomial,
  poisson,
  geometric,
  multinomialPMF,
  multinomialRandom,
  hypergeometric,
} from '../../src/stats/distributions';

describe('Probability Distributions', () => {
  // ============================================================================
  // Normal Distribution
  // ============================================================================

  describe('Normal Distribution', () => {
    test('pdf should calculate correct probability density', () => {
      // Standard normal at mean
      expect(normal.pdf(0, 0, 1)).toBeCloseTo(0.3989423, 6);

      // Standard normal at 1 std dev
      expect(normal.pdf(1, 0, 1)).toBeCloseTo(0.2419707, 6);

      // Non-standard normal
      expect(normal.pdf(5, 5, 2)).toBeCloseTo(0.1994711, 6);
    });

    test('cdf should calculate correct cumulative probability', () => {
      // Standard normal at mean
      expect(normal.cdf(0, 0, 1)).toBeCloseTo(0.5, 6);

      // Standard normal at 1 std dev
      expect(normal.cdf(1, 0, 1)).toBeCloseTo(0.8413447, 6);

      // Standard normal at -1 std dev
      expect(normal.cdf(-1, 0, 1)).toBeCloseTo(0.1586553, 6);
    });

    test('quantile should calculate correct inverse CDF', () => {
      // Median
      expect(normal.quantile(0.5, 0, 1)).toBeCloseTo(0, 6);

      // 84.13th percentile
      expect(normal.quantile(0.8413447, 0, 1)).toBeCloseTo(1, 3);

      // 15.87th percentile
      expect(normal.quantile(0.1586553, 0, 1)).toBeCloseTo(-1, 3);
    });

    test('random should generate samples', () => {
      const samples = normal.random(0, 1, 1000);
      expect(samples.length).toBe(1000);

      // Check sample mean is close to population mean
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(sampleMean).toBeCloseTo(0, 0.5);

      // Check sample variance is close to population variance
      const sampleVar = samples.reduce((sum, x) => sum + x * x, 0) / samples.length;
      expect(sampleVar).toBeCloseTo(1, 0.5);
    });

    test('should throw error for non-positive standard deviation', () => {
      expect(() => normal.pdf(0, 0, 0)).toThrow();
      expect(() => normal.pdf(0, 0, -1)).toThrow();
    });
  });

  // ============================================================================
  // Uniform Distribution
  // ============================================================================

  describe('Uniform Distribution', () => {
    test('pdf should return constant in interval', () => {
      expect(uniform.pdf(0.5, 0, 1)).toBe(1);
      expect(uniform.pdf(2, 0, 4)).toBe(0.25);
      expect(uniform.pdf(-1, 0, 1)).toBe(0); // Outside interval
      expect(uniform.pdf(2, 0, 1)).toBe(0); // Outside interval
    });

    test('cdf should be linear in interval', () => {
      expect(uniform.cdf(0, 0, 1)).toBe(0);
      expect(uniform.cdf(0.5, 0, 1)).toBe(0.5);
      expect(uniform.cdf(1, 0, 1)).toBe(1);
      expect(uniform.cdf(2, 1, 5)).toBeCloseTo(0.25, 6);
    });

    test('quantile should be inverse of cdf', () => {
      expect(uniform.quantile(0, 0, 1)).toBe(0);
      expect(uniform.quantile(0.5, 0, 1)).toBe(0.5);
      expect(uniform.quantile(1, 0, 1)).toBe(1);
      expect(uniform.quantile(0.25, 2, 6)).toBe(3);
    });

    test('random should generate samples in interval', () => {
      const samples = uniform.random(0, 1, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0 && x <= 1)).toBe(true);
    });
  });

  // ============================================================================
  // Exponential Distribution
  // ============================================================================

  describe('Exponential Distribution', () => {
    test('pdf should calculate correct density', () => {
      expect(exponential.pdf(0, 1)).toBe(1);
      expect(exponential.pdf(1, 1)).toBeCloseTo(0.3678794, 6);
      expect(exponential.pdf(-1, 1)).toBe(0); // Negative values have zero density
    });

    test('cdf should calculate correct cumulative probability', () => {
      expect(exponential.cdf(0, 1)).toBe(0);
      expect(exponential.cdf(1, 1)).toBeCloseTo(0.6321206, 6);
      expect(exponential.cdf(Infinity, 1)).toBe(1);
    });

    test('quantile should be inverse of cdf', () => {
      expect(exponential.quantile(0, 1)).toBe(0);
      expect(exponential.quantile(0.5, 1)).toBeCloseTo(0.6931472, 6);
      expect(exponential.quantile(0.6321206, 1)).toBeCloseTo(1, 5);
    });

    test('random should generate positive samples', () => {
      const samples = exponential.random(1, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0)).toBe(true);
    });
  });

  // ============================================================================
  // Gamma Distribution
  // ============================================================================

  describe('Gamma Distribution', () => {
    test('pdf should calculate correct density', () => {
      expect(gammaDistribution.pdf(1, 2, 1)).toBeCloseTo(0.3678794, 5);
      expect(gammaDistribution.pdf(0, 1, 1)).toBe(1); // Special case
    });

    test('cdf should calculate cumulative probability', () => {
      expect(gammaDistribution.cdf(0, 1, 1)).toBe(0);
      expect(gammaDistribution.cdf(1, 1, 1)).toBeCloseTo(0.6321206, 5);
    });

    test('random should generate positive samples', () => {
      const samples = gammaDistribution.random(2, 1, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0)).toBe(true);
    });
  });

  // ============================================================================
  // Beta Distribution
  // ============================================================================

  describe('Beta Distribution', () => {
    test('pdf should calculate correct density in [0, 1]', () => {
      expect(beta.pdf(0.5, 2, 2)).toBeCloseTo(1.5, 5);
      expect(beta.pdf(-0.1, 2, 2)).toBe(0); // Outside [0, 1]
      expect(beta.pdf(1.1, 2, 2)).toBe(0); // Outside [0, 1]
    });

    test('cdf should calculate cumulative probability', () => {
      expect(beta.cdf(0, 2, 2)).toBe(0);
      expect(beta.cdf(0.5, 2, 2)).toBeCloseTo(0.5, 5);
      expect(beta.cdf(1, 2, 2)).toBe(1);
    });

    test('random should generate samples in [0, 1]', () => {
      const samples = beta.random(2, 2, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0 && x <= 1)).toBe(true);
    });
  });

  // ============================================================================
  // Student's t-Distribution
  // ============================================================================

  describe("Student's t-Distribution", () => {
    test('pdf should calculate correct density', () => {
      expect(studentT.pdf(0, 1)).toBeCloseTo(0.3183099, 6);
      expect(studentT.pdf(0, 10)).toBeCloseTo(0.3891084, 6);
    });

    test('cdf should calculate cumulative probability', () => {
      expect(studentT.cdf(0, 1)).toBeCloseTo(0.5, 6);
      expect(studentT.cdf(1, 10)).toBeCloseTo(0.8295534, 5);
    });

    test('random should generate samples', () => {
      const samples = studentT.random(5, 100);
      expect(samples.length).toBe(100);
      // t-distribution has heavier tails than normal
    });
  });

  // ============================================================================
  // Chi-Squared Distribution
  // ============================================================================

  describe('Chi-Squared Distribution', () => {
    test('pdf should calculate correct density', () => {
      expect(chiSquared.pdf(0, 2)).toBeCloseTo(0.5, 5);
      expect(chiSquared.pdf(1, 2)).toBeCloseTo(0.3033688, 3);
      expect(chiSquared.pdf(-1, 2)).toBe(0); // Negative values have zero density
    });

    test('cdf should calculate cumulative probability', () => {
      expect(chiSquared.cdf(0, 2)).toBe(0);
      expect(chiSquared.cdf(2, 2)).toBeCloseTo(0.6321206, 5);
    });

    test('random should generate positive samples', () => {
      const samples = chiSquared.random(5, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0)).toBe(true);
    });
  });

  // ============================================================================
  // F-Distribution
  // ============================================================================

  describe('F-Distribution', () => {
    test('pdf should calculate correct density', () => {
      expect(fDistribution.pdf(1, 5, 5)).toBeCloseTo(0.424413, 4);
      expect(fDistribution.pdf(-1, 5, 5)).toBe(0); // Negative values
    });

    test('cdf should calculate cumulative probability', () => {
      expect(fDistribution.cdf(0, 5, 5)).toBe(0);
      expect(fDistribution.cdf(1, 5, 5)).toBeCloseTo(0.5, 5);
    });

    test('random should generate positive samples', () => {
      const samples = fDistribution.random(5, 5, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0)).toBe(true);
    });
  });

  // ============================================================================
  // Multivariate Normal Distribution
  // ============================================================================

  describe('Multivariate Normal Distribution', () => {
    test('pdf should calculate density for 2D case', () => {
      const mu = [0, 0];
      const sigma = [
        [1, 0],
        [0, 1],
      ];
      const x = [0, 0];

      const density = multivariateNormal.pdf(x, mu, sigma);
      expect(density).toBeCloseTo(1 / (2 * Math.PI), 5);
    });

    test('random should generate samples with correct dimension', () => {
      const mu = [0, 0];
      const sigma = [
        [1, 0],
        [0, 1],
      ];

      const samples = multivariateNormal.random(mu, sigma, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(s => s.length === 2)).toBe(true);
    });

    test('random should respect covariance structure', () => {
      const mu = [0, 0];
      const sigma = [
        [1, 0.8],
        [0.8, 1],
      ];

      const samples = multivariateNormal.random(mu, sigma, 1000);

      // Calculate sample correlation
      const x = samples.map(s => s[0]);
      const y = samples.map(s => s[1]);
      const meanX = x.reduce((a, b) => a + b, 0) / x.length;
      const meanY = y.reduce((a, b) => a + b, 0) / y.length;

      let cov = 0;
      let varX = 0;
      let varY = 0;
      for (let i = 0; i < x.length; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        cov += dx * dy;
        varX += dx * dx;
        varY += dy * dy;
      }

      const correlation = cov / Math.sqrt(varX * varY);
      expect(correlation).toBeCloseTo(0.8, 0.5); // Should be close to 0.8
    });
  });

  // ============================================================================
  // Binomial Distribution
  // ============================================================================

  describe('Binomial Distribution', () => {
    test('pmf should calculate correct probabilities', () => {
      expect(binomial.pmf(5, 10, 0.5)).toBeCloseTo(0.2460938, 6);
      expect(binomial.pmf(0, 10, 0.5)).toBeCloseTo(0.0009765625, 6);
      expect(binomial.pmf(10, 10, 0.5)).toBeCloseTo(0.0009765625, 6);
    });

    test('pmf should return 0 for invalid k', () => {
      expect(binomial.pmf(-1, 10, 0.5)).toBe(0);
      expect(binomial.pmf(11, 10, 0.5)).toBe(0);
      expect(binomial.pmf(5.5, 10, 0.5)).toBe(0); // Non-integer
    });

    test('cdf should calculate cumulative probability', () => {
      expect(binomial.cdf(5, 10, 0.5)).toBeCloseTo(0.6230469, 5);
      expect(binomial.cdf(0, 10, 0.5)).toBeCloseTo(0.0009765625, 6);
    });

    test('random should generate valid counts', () => {
      const samples = binomial.random(10, 0.5, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0 && x <= 10 && Number.isInteger(x))).toBe(true);
    });
  });

  // ============================================================================
  // Poisson Distribution
  // ============================================================================

  describe('Poisson Distribution', () => {
    test('pmf should calculate correct probabilities', () => {
      expect(poisson.pmf(0, 3)).toBeCloseTo(0.04978707, 6);
      expect(poisson.pmf(3, 3)).toBeCloseTo(0.2240418, 6);
      expect(poisson.pmf(10, 3)).toBeCloseTo(0.0008101512, 8);
    });

    test('pmf should return 0 for negative k', () => {
      expect(poisson.pmf(-1, 3)).toBe(0);
      expect(poisson.pmf(2.5, 3)).toBe(0); // Non-integer
    });

    test('cdf should calculate cumulative probability', () => {
      // P(X <= 3) for Poisson(3)
      const expected = poisson.pmf(0, 3) + poisson.pmf(1, 3) + poisson.pmf(2, 3) + poisson.pmf(3, 3);
      expect(poisson.cdf(3, 3)).toBeCloseTo(expected, 5);
      expect(poisson.cdf(0, 3)).toBeCloseTo(0.04978707, 6);
    });

    test('random should generate non-negative integers', () => {
      const samples = poisson.random(3, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0 && Number.isInteger(x))).toBe(true);
    });
  });

  // ============================================================================
  // Geometric Distribution
  // ============================================================================

  describe('Geometric Distribution', () => {
    test('pmf should calculate correct probabilities', () => {
      expect(geometric.pmf(1, 0.5)).toBeCloseTo(0.5, 6);
      expect(geometric.pmf(2, 0.5)).toBeCloseTo(0.25, 6);
      expect(geometric.pmf(3, 0.5)).toBeCloseTo(0.125, 6);
    });

    test('pmf should return 0 for k < 1', () => {
      expect(geometric.pmf(0, 0.5)).toBe(0);
      expect(geometric.pmf(-1, 0.5)).toBe(0);
    });

    test('cdf should calculate cumulative probability', () => {
      expect(geometric.cdf(1, 0.5)).toBeCloseTo(0.5, 6);
      expect(geometric.cdf(2, 0.5)).toBeCloseTo(0.75, 6);
    });

    test('random should generate positive integers', () => {
      const samples = geometric.random(0.5, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 1 && Number.isInteger(x))).toBe(true);
    });
  });

  // ============================================================================
  // Multinomial Distribution
  // ============================================================================

  describe('Multinomial Distribution', () => {
    test('pmf should calculate correct probability', () => {
      const counts = [7, 2, 3];
      const probs = [0.2, 0.3, 0.5];
      const prob = multinomialPMF(counts, probs);
      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(1);
    });

    test('should throw error if probabilities do not sum to 1', () => {
      const counts = [1, 2, 3];
      const probs = [0.2, 0.3, 0.4]; // Sum is 0.9
      expect(() => multinomialPMF(counts, probs)).toThrow();
    });

    test('random should generate valid counts', () => {
      const n = 10;
      const probs = [0.2, 0.3, 0.5];
      const samples = multinomialRandom(n, probs, 100);

      expect(samples.length).toBe(100);
      expect(samples.every(s => s.length === 3)).toBe(true);
      expect(samples.every(s => s.reduce((a, b) => a + b, 0) === n)).toBe(true);
    });
  });

  // ============================================================================
  // Hypergeometric Distribution
  // ============================================================================

  describe('Hypergeometric Distribution', () => {
    test('pmf should calculate correct probabilities', () => {
      // Drawing 5 from population of 50 with 10 successes
      const prob = hypergeometric.pmf(2, 50, 10, 5);
      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(1);
    });

    test('pmf should return 0 for impossible outcomes', () => {
      expect(hypergeometric.pmf(-1, 50, 10, 5)).toBe(0);
      expect(hypergeometric.pmf(11, 50, 10, 5)).toBe(0);
    });

    test('cdf should calculate cumulative probability', () => {
      const cdf = hypergeometric.cdf(2, 50, 10, 5);
      expect(cdf).toBeGreaterThan(0);
      expect(cdf).toBeLessThan(1);
    });

    test('random should generate valid counts', () => {
      const samples = hypergeometric.random(50, 10, 5, 100);
      expect(samples.length).toBe(100);
      expect(samples.every(x => x >= 0 && x <= 5 && Number.isInteger(x))).toBe(true);
    });
  });
});
