import {
  batchNorm1D,
  batchNorm2D,
  layerNorm,
  instanceNorm,
  groupNorm,
  weightNorm,
  rmsNorm,
  adaptiveLayerNorm,
} from '../../src/ml/normalization';

describe('Normalization Layers', () => {
  describe('Batch Normalization 1D', () => {
    it('should normalize to mean 0 and variance 1', () => {
      const input = [1, 2, 3, 4, 5];
      const { output, mean, variance } = batchNorm1D(input);

      // Check mean is close to 3
      expect(mean).toBeCloseTo(3);

      // Check variance
      expect(variance).toBeCloseTo(2);

      // Check normalized output has mean ≈ 0, variance ≈ 1
      const outputMean = output.reduce((a, b) => a + b, 0) / output.length;
      expect(outputMean).toBeCloseTo(0, 5);

      const outputVariance = output.reduce((sum, val) => sum + val * val, 0) / output.length;
      expect(outputVariance).toBeCloseTo(1, 1);
    });

    it('should apply gamma and beta', () => {
      const input = [1, 2, 3, 4, 5];
      const { output } = batchNorm1D(input, { gamma: 2, beta: 1 });

      // With gamma=2 and beta=1, output should be scaled and shifted
      const outputMean = output.reduce((a, b) => a + b, 0) / output.length;
      expect(outputMean).toBeCloseTo(1, 5);
    });

    it('should handle identical values', () => {
      const input = [5, 5, 5, 5];
      const { output } = batchNorm1D(input);

      // All values should become beta (default 0)
      output.forEach(val => {
        expect(val).toBeCloseTo(0, 5);
      });
    });
  });

  describe('Batch Normalization 2D', () => {
    it('should normalize each feature independently', () => {
      const input = [
        [1, 10],
        [2, 20],
        [3, 30]
      ];
      const { output, means, variances } = batchNorm2D(input);

      expect(means.length).toBe(2);
      expect(variances.length).toBe(2);

      // First feature mean ≈ 2
      expect(means[0]).toBeCloseTo(2);
      // Second feature mean ≈ 20
      expect(means[1]).toBeCloseTo(20);

      // Check normalized features
      output.forEach(sample => {
        expect(sample.length).toBe(2);
      });
    });

    it('should apply per-feature gamma and beta', () => {
      const input = [[1, 2], [3, 4]];
      const { output } = batchNorm2D(input, {
        gamma: [2, 0.5],
        beta: [1, -1]
      });

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
    });
  });

  describe('Layer Normalization', () => {
    it('should normalize across features for each sample', () => {
      const input = [
        [1, 2, 3, 4],
        [5, 6, 7, 8]
      ];
      const output = layerNorm(input);

      // Each row should be normalized independently
      output.forEach(sample => {
        const mean = sample.reduce((a, b) => a + b, 0) / sample.length;
        expect(mean).toBeCloseTo(0, 5);

        const variance = sample.reduce((sum, val) => sum + val * val, 0) / sample.length;
        expect(variance).toBeCloseTo(1, 1);
      });
    });

    it('should apply gamma and beta per feature', () => {
      const input = [[1, 2, 3, 4]];
      const output = layerNorm(input, {
        gamma: [1, 1, 1, 1],
        beta: [0, 0, 0, 0]
      });

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(4);
    });

    it('should work with single sample', () => {
      const input = [[1, 2, 3, 4]];
      const output = layerNorm(input);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(4);
    });
  });

  describe('Instance Normalization', () => {
    it('should normalize each instance and channel independently', () => {
      const input = [
        [[1, 2, 3, 4], [5, 6, 7, 8]],
        [[9, 10, 11, 12], [13, 14, 15, 16]]
      ];
      const output = instanceNorm(input);

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
      expect(output[0][0].length).toBe(4);

      // Each channel should be normalized
      output.forEach(sample => {
        sample.forEach(channel => {
          const mean = channel.reduce((a, b) => a + b, 0) / channel.length;
          expect(mean).toBeCloseTo(0, 5);
        });
      });
    });

    it('should apply per-channel gamma and beta', () => {
      const input = [[[1, 2], [3, 4]]];
      const output = instanceNorm(input, {
        gamma: [2, 1],
        beta: [1, 0]
      });

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(2);
    });
  });

  describe('Group Normalization', () => {
    it('should normalize within groups', () => {
      const input = [
        [
          [1, 2], [3, 4],  // Group 1
          [5, 6], [7, 8]   // Group 2
        ]
      ];
      const output = groupNorm(input, 2);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(4);
    });

    it('should enforce divisibility constraint', () => {
      const input = [[[1, 2], [3, 4], [5, 6]]];  // 3 channels

      expect(() => {
        groupNorm(input, 2);  // 3 not divisible by 2
      }).toThrow();
    });

    it('should work with single group (equivalent to LayerNorm)', () => {
      const input = [[[1, 2, 3], [4, 5, 6]]];
      const output = groupNorm(input, 1);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(2);
    });

    it('should work with group per channel (equivalent to InstanceNorm)', () => {
      const input = [[[1, 2], [3, 4]]];
      const output = groupNorm(input, 2);  // 2 groups for 2 channels

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(2);
    });
  });

  describe('Weight Normalization', () => {
    it('should normalize weight vectors', () => {
      const weights = [3, 4];  // Norm = 5
      const { output, magnitude } = weightNorm(weights);

      expect(magnitude).toBeCloseTo(5);

      // Without explicit g, magnitude is preserved so norm should equal magnitude
      const norm = Math.sqrt(output.reduce((sum, val) => sum + val * val, 0));
      expect(norm).toBeCloseTo(magnitude, 5);
    });

    it('should normalize weight matrices', () => {
      const weights = [[1, 0], [0, 1]];
      const { output, magnitude } = weightNorm(weights);

      expect(magnitude).toBeCloseTo(Math.sqrt(2));

      // Check output shape is preserved
      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
    });

    it('should use provided magnitude', () => {
      const weights = [3, 4];
      const { output, magnitude } = weightNorm(weights, 10);

      expect(magnitude).toBe(10);

      // Check that the output is scaled correctly
      const norm = Math.sqrt(output.reduce((sum, val) => sum + val * val, 0));
      expect(norm).toBeCloseTo(10, 5);
    });

    it('should handle zero weights', () => {
      const weights = [0, 0, 0];
      const { output } = weightNorm(weights);

      // Should not throw, epsilon prevents division by zero
      expect(output.length).toBe(3);
    });
  });

  describe('RMS Normalization', () => {
    it('should normalize by RMS', () => {
      const input = [[1, 2, 3, 4]];
      const output = rmsNorm(input);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(4);

      // RMS of output should be approximately 1
      const squareSum = output[0].reduce((sum, val) => sum + val * val, 0);
      const rms = Math.sqrt(squareSum / output[0].length);
      expect(rms).toBeCloseTo(1, 5);
    });

    it('should apply gamma scaling', () => {
      const input = [[1, 2, 3, 4]];
      const output = rmsNorm(input, {
        gamma: [2, 2, 2, 2]
      });

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(4);
    });

    it('should work with multiple samples', () => {
      const input = [[1, 2, 3], [4, 5, 6]];
      const output = rmsNorm(input);

      expect(output.length).toBe(2);
      output.forEach(sample => {
        expect(sample.length).toBe(3);
      });
    });
  });

  describe('Adaptive Layer Normalization', () => {
    it('should apply conditional normalization', () => {
      const input = [[1, 2, 3, 4]];
      const scale = [1.5, 1.5, 1.5, 1.5];
      const shift = [0.1, 0.1, 0.1, 0.1];

      const output = adaptiveLayerNorm(input, scale, shift);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(4);

      // Values should be different from standard LayerNorm due to conditioning
      const standardOutput = layerNorm(input);
      expect(output[0][0]).not.toBeCloseTo(standardOutput[0][0]);
    });

    it('should handle different scales per feature', () => {
      const input = [[1, 2, 3, 4]];
      const scale = [1, 2, 1, 2];
      const shift = [0, 0, 0, 0];

      const output = adaptiveLayerNorm(input, scale, shift);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(4);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty-like inputs gracefully', () => {
      const input = [[0, 0, 0]];
      const output = layerNorm(input);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(3);
      // All zeros should remain zeros (or close to beta)
    });

    it('should use epsilon to prevent division by zero', () => {
      const input = [[5, 5, 5, 5]];  // Constant values
      const output = layerNorm(input);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(4);
      // Should not throw due to zero variance
    });

    it('should handle large values', () => {
      const input = [[1e10, 2e10, 3e10]];
      const output = layerNorm(input);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(3);
      // Should be normalized without overflow
      output[0].forEach(val => {
        expect(isFinite(val)).toBe(true);
      });
    });

    it('should handle negative values', () => {
      const input = [[-3, -2, -1, 0, 1, 2, 3]];
      const output = layerNorm(input);

      expect(output.length).toBe(1);
      const mean = output[0].reduce((a, b) => a + b, 0) / output[0].length;
      expect(mean).toBeCloseTo(0, 5);
    });
  });
});
