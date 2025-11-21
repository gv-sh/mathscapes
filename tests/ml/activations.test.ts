import {
  relu,
  reluDerivative,
  leakyRelu,
  leakyReluDerivative,
  prelu,
  preluDerivative,
  elu,
  eluDerivative,
  selu,
  seluDerivative,
  sigmoid,
  sigmoidDerivative,
  tanh,
  tanhDerivative,
  softplus,
  softplusDerivative,
  softmax,
  softmaxDerivative,
  logSoftmax,
  logSoftmaxDerivative,
  gumbelSoftmax,
  swish,
  swishDerivative,
  gelu,
  geluDerivative,
  mish,
  mishDerivative,
} from '../../src/ml/activations';

describe('Activation Functions', () => {
  describe('ReLU', () => {
    it('should return max(0, x) for scalar', () => {
      expect(relu(2.5)).toBe(2.5);
      expect(relu(-1.5)).toBe(0);
      expect(relu(0)).toBe(0);
    });

    it('should work with arrays', () => {
      expect(relu([1, -2, 3])).toEqual([1, 0, 3]);
    });

    it('should compute correct derivative', () => {
      expect(reluDerivative(2)).toBe(1);
      expect(reluDerivative(-1)).toBe(0);
      expect(reluDerivative([1, -1, 0])).toEqual([1, 0, 0]);
    });
  });

  describe('Leaky ReLU', () => {
    it('should allow small negative values', () => {
      expect(leakyRelu(2)).toBe(2);
      expect(leakyRelu(-1)).toBeCloseTo(-0.01, 5);
      expect(leakyRelu(-1, 0.2)).toBeCloseTo(-0.2, 5);
    });

    it('should compute correct derivative', () => {
      expect(leakyReluDerivative(2)).toBe(1);
      expect(leakyReluDerivative(-1)).toBeCloseTo(0.01, 5);
      expect(leakyReluDerivative(-1, 0.2)).toBeCloseTo(0.2, 5);
    });
  });

  describe('PReLU', () => {
    it('should work like leaky ReLU with different default alpha', () => {
      expect(prelu(2)).toBe(2);
      expect(prelu(-1)).toBeCloseTo(-0.25, 5);
    });

    it('should compute correct derivative', () => {
      expect(preluDerivative(2)).toBe(1);
      expect(preluDerivative(-1)).toBeCloseTo(0.25, 5);
    });
  });

  describe('ELU', () => {
    it('should be exponential for negative values', () => {
      expect(elu(2)).toBe(2);
      expect(elu(0)).toBe(0);
      expect(elu(-1)).toBeCloseTo(-0.632, 3);
    });

    it('should respect alpha parameter', () => {
      expect(elu(-1, 2.0)).toBeCloseTo(-1.264, 3);
    });

    it('should compute correct derivative', () => {
      expect(eluDerivative(2)).toBe(1);
      expect(eluDerivative(-1, 1.0)).toBeCloseTo(0.368, 3);
    });
  });

  describe('SELU', () => {
    it('should apply self-normalizing transformation', () => {
      expect(selu(2)).toBeCloseTo(2.101, 3);
      expect(selu(-1)).toBeCloseTo(-1.111, 3);
    });

    it('should compute correct derivative', () => {
      const val = selu(2);
      expect(seluDerivative(2)).toBeCloseTo(1.051, 3);
    });
  });

  describe('Sigmoid', () => {
    it('should map to (0, 1) range', () => {
      expect(sigmoid(0)).toBeCloseTo(0.5, 5);
      expect(sigmoid(2)).toBeCloseTo(0.881, 3);
      expect(sigmoid(-2)).toBeCloseTo(0.119, 3);
    });

    it('should work with arrays', () => {
      const result = sigmoid([0, 1, -1]);
      expect(result[0]).toBeCloseTo(0.5, 5);
      expect(result[1]).toBeCloseTo(0.731, 3);
    });

    it('should compute correct derivative', () => {
      const d = sigmoidDerivative(0);
      expect(d).toBeCloseTo(0.25, 5);
    });
  });

  describe('Tanh', () => {
    it('should map to (-1, 1) range', () => {
      expect(tanh(0)).toBe(0);
      expect(tanh(1)).toBeCloseTo(0.762, 3);
      expect(tanh(-1)).toBeCloseTo(-0.762, 3);
    });

    it('should compute correct derivative', () => {
      const d = tanhDerivative(0);
      expect(d).toBe(1);
    });
  });

  describe('Softplus', () => {
    it('should be smooth approximation of ReLU', () => {
      expect(softplus(0)).toBeCloseTo(0.693, 3);
      expect(softplus(2)).toBeCloseTo(2.127, 3);
      expect(softplus(-2)).toBeCloseTo(0.127, 3);
    });

    it('should have sigmoid as derivative', () => {
      const x = 1;
      const d = softplusDerivative(x);
      const s = sigmoid(x);
      expect(d).toBeCloseTo(s as number, 5);
    });
  });

  describe('Softmax', () => {
    it('should produce probability distribution', () => {
      const result = softmax([1, 2, 3]);
      const sum = result.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
      expect(result[0]).toBeCloseTo(0.090, 3);
      expect(result[1]).toBeCloseTo(0.245, 3);
      expect(result[2]).toBeCloseTo(0.665, 3);
    });

    it('should handle equal values', () => {
      const result = softmax([1, 1, 1]);
      result.forEach(val => expect(val).toBeCloseTo(0.333, 3));
    });

    it('should be numerically stable', () => {
      const result = softmax([1000, 1001, 1002]);
      expect(result.every(val => !isNaN(val) && isFinite(val))).toBe(true);
    });
  });

  describe('Log-Softmax', () => {
    it('should produce log probabilities', () => {
      const result = logSoftmax([1, 2, 3]);
      expect(result[0]).toBeCloseTo(-2.407, 2);
      expect(result[1]).toBeCloseTo(-1.407, 2);
      expect(result[2]).toBeCloseTo(-0.407, 2);
    });

    it('should be numerically stable', () => {
      const result = logSoftmax([1000, 1001, 1002]);
      expect(result.every(val => !isNaN(val) && isFinite(val))).toBe(true);
    });
  });

  describe('Gumbel-Softmax', () => {
    it('should produce approximately one-hot with low temperature', () => {
      const result = gumbelSoftmax([5, 1, 1], 0.1, false);
      expect(result[0]).toBeGreaterThan(0.9);
    });

    it('should be more uniform with high temperature', () => {
      const result = gumbelSoftmax([1, 2, 3], 10.0, false);
      const min = Math.min(...result);
      const max = Math.max(...result);
      expect(max - min).toBeLessThan(0.3);
    });
  });

  describe('Swish', () => {
    it('should compute x * sigmoid(x)', () => {
      const x = 2;
      const result = swish(x);
      const expected = x * (1 / (1 + Math.exp(-x)));
      expect(result).toBeCloseTo(expected, 5);
    });

    it('should work with arrays', () => {
      const result = swish([1, -1]);
      expect(result[0]).toBeCloseTo(0.731, 3);
      expect(result[1]).toBeCloseTo(-0.269, 3);
    });

    it('should compute derivative', () => {
      const d = swishDerivative(1);
      expect(d).toBeGreaterThan(0);
    });
  });

  describe('GELU', () => {
    it('should approximate Gaussian-weighted ReLU', () => {
      expect(gelu(1)).toBeCloseTo(0.841, 3);
      expect(gelu(-1)).toBeCloseTo(-0.159, 3);
      expect(gelu(0)).toBeCloseTo(0, 3);
    });

    it('should work with arrays', () => {
      const result = gelu([1, -1, 0]);
      expect(result[0]).toBeCloseTo(0.841, 3);
    });

    it('should compute derivative', () => {
      const d = geluDerivative(1);
      expect(d).toBeGreaterThan(0);
    });
  });

  describe('Mish', () => {
    it('should compute x * tanh(softplus(x))', () => {
      expect(mish(1)).toBeCloseTo(0.865, 3);
      expect(mish(-1)).toBeCloseTo(-0.303, 3);
    });

    it('should work with arrays', () => {
      const result = mish([1, -1]);
      expect(result[0]).toBeCloseTo(0.865, 3);
    });

    it('should compute derivative', () => {
      const d = mishDerivative(1);
      expect(d).toBeGreaterThan(0);
    });
  });

  describe('Numerical derivative verification', () => {
    const epsilon = 1e-5;

    function numericalDerivative(
      fn: (x: number) => number,
      x: number
    ): number {
      return (fn(x + epsilon) - fn(x - epsilon)) / (2 * epsilon);
    }

    it('should match numerical derivative for ReLU (where defined)', () => {
      const x = 2;
      const analytical = reluDerivative(x) as number;
      const numerical = numericalDerivative(relu as (x: number) => number, x);
      expect(analytical).toBeCloseTo(numerical, 3);
    });

    it('should match numerical derivative for sigmoid', () => {
      const x = 1;
      const analytical = sigmoidDerivative(x) as number;
      const numerical = numericalDerivative(sigmoid as (x: number) => number, x);
      expect(analytical).toBeCloseTo(numerical, 5);
    });

    it('should match numerical derivative for tanh', () => {
      const x = 0.5;
      const analytical = tanhDerivative(x) as number;
      const numerical = numericalDerivative(tanh as (x: number) => number, x);
      expect(analytical).toBeCloseTo(numerical, 5);
    });

    it('should match numerical derivative for ELU', () => {
      const x = -0.5;
      const analytical = eluDerivative(x) as number;
      const numerical = numericalDerivative((x) => elu(x) as number, x);
      expect(analytical).toBeCloseTo(numerical, 5);
    });
  });
});
