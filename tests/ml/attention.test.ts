import {
  scaledDotProductAttention,
  multiHeadAttention,
  selfAttention,
  multiHeadSelfAttention,
  attentionScores,
  createCausalMask,
  createPaddingMask,
  combineMasks,
  attentionEntropy,
} from '../../src/ml/attention';

describe('Attention Mechanisms', () => {
  describe('Scaled Dot-Product Attention', () => {
    it('should compute basic attention', () => {
      const queries = [[1, 0], [0, 1]];
      const keys = [[1, 0], [0, 1]];
      const values = [[1, 2], [3, 4]];

      const { output, weights } = scaledDotProductAttention(queries, keys, values);

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
      expect(weights.length).toBe(2);
      expect(weights[0].length).toBe(2);

      // Attention weights should sum to 1
      const sum0 = weights[0].reduce((a, b) => a + b, 0);
      const sum1 = weights[1].reduce((a, b) => a + b, 0);
      expect(sum0).toBeCloseTo(1);
      expect(sum1).toBeCloseTo(1);
    });

    it('should apply causal masking', () => {
      const input = [[1, 0], [0, 1], [1, 1]];

      const { weights } = scaledDotProductAttention(input, input, input, {
        causalMask: true
      });

      // Position 0 should only attend to position 0
      expect(weights[0][0]).toBeGreaterThan(0);
      expect(weights[0][1]).toBe(0);
      expect(weights[0][2]).toBe(0);

      // Position 1 should attend to positions 0 and 1
      expect(weights[1][0]).toBeGreaterThan(0);
      expect(weights[1][1]).toBeGreaterThan(0);
      expect(weights[1][2]).toBe(0);

      // Position 2 should attend to all positions
      expect(weights[2][0]).toBeGreaterThan(0);
      expect(weights[2][1]).toBeGreaterThan(0);
      expect(weights[2][2]).toBeGreaterThan(0);
    });

    it('should apply custom mask', () => {
      const queries = [[1, 0], [0, 1]];
      const keys = [[1, 0], [0, 1]];
      const values = [[1, 2], [3, 4]];
      const mask = [[1, 0], [1, 1]];

      const { weights } = scaledDotProductAttention(queries, keys, values, {
        mask
      });

      // First position should only attend to first position
      expect(weights[0][0]).toBeCloseTo(1);
      expect(weights[0][1]).toBe(0);
    });

    it('should produce valid attention output', () => {
      const queries = [[1, 1]];
      const keys = [[1, 0], [0, 1]];
      const values = [[2, 0], [0, 2]];

      const { output } = scaledDotProductAttention(queries, keys, values);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(2);
      // Output should be a weighted combination of values
      expect(output[0][0]).toBeGreaterThan(0);
      expect(output[0][1]).toBeGreaterThan(0);
    });
  });

  describe('Multi-Head Attention', () => {
    it('should compute multi-head attention', () => {
      const input = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0]
      ];

      const { output, headWeights } = multiHeadAttention(
        input, input, input,
        2  // 2 heads
      );

      expect(output.length).toBe(3);
      expect(output[0].length).toBe(4);
      expect(headWeights.length).toBe(2);
    });

    it('should enforce divisibility constraint', () => {
      const input = [[1, 0, 0]];  // 3 dimensions, not divisible by 2

      expect(() => {
        multiHeadAttention(input, input, input, 2);
      }).toThrow();
    });

    it('should produce different attention patterns per head', () => {
      const input = [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [1, 1, 0, 0]
      ];

      const { headWeights } = multiHeadAttention(input, input, input, 2);

      // Each head should have its own weights
      expect(headWeights[0]).not.toEqual(headWeights[1]);
    });
  });

  describe('Self-Attention', () => {
    it('should compute self-attention', () => {
      const input = [[1, 0], [0, 1], [1, 1]];

      const { output, weights } = selfAttention(input);

      expect(output.length).toBe(3);
      expect(output[0].length).toBe(2);
      expect(weights.length).toBe(3);

      // Each position should attend to all positions
      weights.forEach(row => {
        const sum = row.reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1);
      });
    });
  });

  describe('Multi-Head Self-Attention', () => {
    it('should compute multi-head self-attention', () => {
      const input = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ];

      const { output, headWeights } = multiHeadSelfAttention(input, 2);

      expect(output.length).toBe(4);
      expect(output[0].length).toBe(4);
      expect(headWeights.length).toBe(2);
    });
  });

  describe('Attention Scores', () => {
    it('should compute raw attention scores', () => {
      const queries = [[1, 0], [0, 1]];
      const keys = [[1, 0], [0, 1]];

      const scores = attentionScores(queries, keys);

      expect(scores.length).toBe(2);
      expect(scores[0].length).toBe(2);
    });

    it('should scale scores when requested', () => {
      const queries = [[1, 0]];
      const keys = [[1, 0]];

      const scaledScores = attentionScores(queries, keys, true);
      const unscaledScores = attentionScores(queries, keys, false);

      // Scaled scores should be smaller in magnitude
      expect(Math.abs(scaledScores[0][0])).toBeLessThanOrEqual(
        Math.abs(unscaledScores[0][0])
      );
    });
  });

  describe('Mask Creation', () => {
    it('should create causal mask', () => {
      const mask = createCausalMask(4);

      expect(mask).toEqual([
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [1, 1, 1, 0],
        [1, 1, 1, 1]
      ]);
    });

    it('should create padding mask', () => {
      const tokens = [5, 10, 3, 0, 0];
      const mask = createPaddingMask(tokens);

      expect(mask.length).toBe(5);
      // All positions should be able to attend to non-padding (0-2)
      expect(mask[0][0]).toBe(1);
      expect(mask[0][1]).toBe(1);
      expect(mask[0][2]).toBe(1);
      // But not to padding (3-4)
      expect(mask[0][3]).toBe(0);
      expect(mask[0][4]).toBe(0);
    });

    it('should combine masks correctly', () => {
      const mask1 = [[1, 1], [1, 1]];
      const mask2 = [[1, 0], [1, 1]];

      const combined = combineMasks(mask1, mask2);

      expect(combined).toEqual([
        [1, 0],
        [1, 1]
      ]);
    });

    it('should handle combining causal and padding masks', () => {
      const causalMask = createCausalMask(4);
      const paddingMask = createPaddingMask([1, 2, 0, 0]);

      const combined = combineMasks(causalMask, paddingMask);

      expect(combined.length).toBe(4);
      expect(combined[0].length).toBe(4);
      // Position 0 should only attend to position 0 (causal + not padding)
      expect(combined[0][0]).toBe(1);
      expect(combined[0][1]).toBe(0);
      // Position 2 should not attend to itself (padding)
      expect(combined[2][2]).toBe(0);
    });
  });

  describe('Attention Entropy', () => {
    it('should compute entropy for focused attention', () => {
      const weights = [[0.9, 0.1], [0.5, 0.5]];
      const entropy = attentionEntropy(weights);

      expect(entropy.length).toBe(2);
      // First position is more focused (lower entropy)
      expect(entropy[0]).toBeLessThan(entropy[1]);
    });

    it('should give zero entropy for deterministic attention', () => {
      const weights = [[1, 0, 0], [0, 1, 0]];
      const entropy = attentionEntropy(weights);

      expect(entropy[0]).toBeCloseTo(0, 5);
      expect(entropy[1]).toBeCloseTo(0, 5);
    });

    it('should give high entropy for uniform attention', () => {
      const weights = [[0.25, 0.25, 0.25, 0.25]];
      const entropy = attentionEntropy(weights);

      // Uniform distribution has maximum entropy (log2(4) = 2)
      expect(entropy[0]).toBeCloseTo(2, 1);
    });
  });

  describe('Integration tests', () => {
    it('should work with typical transformer sequence', () => {
      // Simulate a simple sequence of token embeddings
      const sequence = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ];

      const { output } = multiHeadSelfAttention(sequence, 2);

      // Output should have same shape as input
      expect(output.length).toBe(sequence.length);
      expect(output[0].length).toBe(sequence[0].length);

      // Output values should be valid (no NaN or Infinity)
      output.forEach(row => {
        row.forEach(val => {
          expect(isFinite(val)).toBe(true);
        });
      });
    });

    it('should handle autoregressive generation with causal mask', () => {
      const sequence = [[1, 0], [0, 1], [1, 1]];

      const { output, weights } = selfAttention(sequence, {
        causalMask: true
      });

      // First token should only see itself
      expect(output[0]).toBeDefined();

      // Last token should see all previous tokens
      expect(weights[2][0]).toBeGreaterThan(0);
      expect(weights[2][1]).toBeGreaterThan(0);
      expect(weights[2][2]).toBeGreaterThan(0);
    });
  });
});
