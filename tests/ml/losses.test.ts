import {
  mse,
  rmse,
  mae,
  huber,
  logCosh,
  binaryCrossentropy,
  categoricalCrossentropy,
  sparseCategoricalCrossentropy,
  focalLoss,
  hingeLoss,
  squaredHingeLoss,
  tripletLoss,
  cosineEmbeddingLoss,
  klDivergence,
  combineLosses,
  createCustomLoss,
  regularizedLoss,
} from '../../src/ml/losses';

describe('Loss Functions', () => {
  describe('MSE (Mean Squared Error)', () => {
    it('should compute correct MSE', () => {
      const yTrue = [1, 2, 3];
      const yPred = [1.1, 2.2, 2.9];
      const loss = mse(yTrue, yPred);
      const expected = (0.01 + 0.04 + 0.01) / 3;
      expect(loss).toBeCloseTo(expected, 5);
    });

    it('should return 0 for perfect predictions', () => {
      expect(mse([1, 2, 3], [1, 2, 3])).toBe(0);
    });

    it('should throw for mismatched lengths', () => {
      expect(() => mse([1, 2], [1])).toThrow();
    });

    it('should throw for empty arrays', () => {
      expect(() => mse([], [])).toThrow();
    });
  });

  describe('RMSE (Root Mean Squared Error)', () => {
    it('should be square root of MSE', () => {
      const yTrue = [1, 2, 3];
      const yPred = [1.1, 2.2, 2.9];
      expect(rmse(yTrue, yPred)).toBeCloseTo(Math.sqrt(mse(yTrue, yPred)), 5);
    });
  });

  describe('MAE (Mean Absolute Error)', () => {
    it('should compute correct MAE', () => {
      const yTrue = [1, 2, 3];
      const yPred = [1.1, 2.2, 2.9];
      const loss = mae(yTrue, yPred);
      const expected = (0.1 + 0.2 + 0.1) / 3;
      expect(loss).toBeCloseTo(expected, 5);
    });

    it('should be more robust to outliers than MSE', () => {
      const yTrue = [1, 2, 3, 4];
      const yPred1 = [1, 2, 3, 14]; // One outlier
      const yPred2 = [1, 2, 3, 4.5]; // Small error

      const mseDiff = mse(yTrue, yPred1) - mse(yTrue, yPred2);
      const maeDiff = mae(yTrue, yPred1) - mae(yTrue, yPred2);

      expect(mseDiff).toBeGreaterThan(maeDiff);
    });
  });

  describe('Huber Loss', () => {
    it('should behave like MSE for small errors', () => {
      const yTrue = [1, 2, 3];
      const yPred = [1.1, 2.1, 3.1];
      const delta = 1.0;
      const huberLoss = huber(yTrue, yPred, delta);
      // Huber uses 0.5 * error^2 for small errors, not mean of squares
      const expected = (0.5 * 0.01 + 0.5 * 0.01 + 0.5 * 0.01) / 3;
      expect(huberLoss).toBeCloseTo(expected, 5);
    });

    it('should behave like MAE for large errors', () => {
      const yTrue = [1];
      const yPred = [5];
      const delta = 1.0;
      const loss = huber(yTrue, yPred, delta);
      const error = Math.abs(5 - 1);
      const expected = delta * error - 0.5 * delta * delta;
      expect(loss).toBeCloseTo(expected, 5);
    });

    it('should use custom delta', () => {
      const yTrue = [0];
      const yPred = [2];
      const loss1 = huber(yTrue, yPred, 0.5);
      const loss2 = huber(yTrue, yPred, 1.0);
      expect(loss1).not.toBeCloseTo(loss2, 5);
    });
  });

  describe('Log-Cosh Loss', () => {
    it('should compute log(cosh(error))', () => {
      const yTrue = [1, 2, 3];
      const yPred = [1.1, 2.2, 2.9];
      const loss = logCosh(yTrue, yPred);
      expect(loss).toBeGreaterThan(0);
      expect(loss).toBeLessThan(1);
    });

    it('should be smooth and differentiable', () => {
      const yTrue = [0];
      const yPred1 = [0.1];
      const yPred2 = [0.2];
      const loss1 = logCosh(yTrue, yPred1);
      const loss2 = logCosh(yTrue, yPred2);
      expect(loss2).toBeGreaterThan(loss1);
    });
  });

  describe('Binary Cross-Entropy', () => {
    it('should compute BCE for binary classification', () => {
      const yTrue = [1, 0, 1];
      const yPred = [0.9, 0.1, 0.8];
      const loss = binaryCrossentropy(yTrue, yPred);
      expect(loss).toBeGreaterThan(0);
      expect(loss).toBeLessThan(1);
    });

    it('should be low for good predictions', () => {
      const yTrue = [1, 0];
      const goodPred = [0.99, 0.01];
      const badPred = [0.5, 0.5];
      expect(binaryCrossentropy(yTrue, goodPred)).toBeLessThan(
        binaryCrossentropy(yTrue, badPred)
      );
    });

    it('should handle edge cases with epsilon', () => {
      const yTrue = [1];
      const yPred = [1.0]; // Would cause log(0) without epsilon
      expect(() => binaryCrossentropy(yTrue, yPred)).not.toThrow();
      expect(isFinite(binaryCrossentropy(yTrue, yPred))).toBe(true);
    });
  });

  describe('Categorical Cross-Entropy', () => {
    it('should compute CCE for multi-class classification', () => {
      const yTrue = [[1, 0, 0], [0, 1, 0]];
      const yPred = [[0.8, 0.1, 0.1], [0.2, 0.7, 0.1]];
      const loss = categoricalCrossentropy(yTrue, yPred);
      expect(loss).toBeGreaterThan(0);
    });

    it('should be zero for perfect predictions', () => {
      const yTrue = [[1, 0], [0, 1]];
      const yPred = [[1, 0], [0, 1]];
      expect(categoricalCrossentropy(yTrue, yPred)).toBeCloseTo(0, 5);
    });

    it('should throw for mismatched dimensions', () => {
      const yTrue = [[1, 0]];
      const yPred = [[0.5, 0.3, 0.2]];
      expect(() => categoricalCrossentropy(yTrue, yPred)).toThrow();
    });
  });

  describe('Sparse Categorical Cross-Entropy', () => {
    it('should work with integer class labels', () => {
      const yTrue = [0, 1];
      const yPred = [[0.8, 0.1, 0.1], [0.2, 0.7, 0.1]];
      const loss = sparseCategoricalCrossentropy(yTrue, yPred);
      expect(loss).toBeGreaterThan(0);
    });

    it('should be equivalent to categorical cross-entropy', () => {
      const yTrue = [0, 1];
      const yTrueOneHot = [[1, 0, 0], [0, 1, 0]];
      const yPred = [[0.8, 0.1, 0.1], [0.2, 0.7, 0.1]];

      const sparseLoss = sparseCategoricalCrossentropy(yTrue, yPred);
      const categoricalLoss = categoricalCrossentropy(yTrueOneHot, yPred);

      expect(sparseLoss).toBeCloseTo(categoricalLoss, 5);
    });

    it('should throw for invalid class indices', () => {
      const yTrue = [0, 5]; // Class 5 doesn't exist
      const yPred = [[0.8, 0.2], [0.6, 0.4]];
      expect(() => sparseCategoricalCrossentropy(yTrue, yPred)).toThrow();
    });
  });

  describe('Focal Loss', () => {
    it('should down-weight easy examples', () => {
      const yTrue = [1, 1];
      const easyPred = [0.9, 0.9]; // Easy correct predictions
      const hardPred = [0.6, 0.6]; // Hard correct predictions

      const easyLoss = focalLoss(yTrue, easyPred);
      const hardLoss = focalLoss(yTrue, hardPred);

      expect(easyLoss).toBeLessThan(hardLoss);
    });

    it('should respect alpha and gamma parameters', () => {
      const yTrue = [1];
      const yPred = [0.7];

      const loss1 = focalLoss(yTrue, yPred, 0.25, 2.0);
      const loss2 = focalLoss(yTrue, yPred, 0.5, 2.0);
      const loss3 = focalLoss(yTrue, yPred, 0.25, 1.0);

      expect(loss1).not.toBeCloseTo(loss2, 5);
      expect(loss1).not.toBeCloseTo(loss3, 5);
    });
  });

  describe('Hinge Loss', () => {
    it('should work with +1/-1 labels', () => {
      const yTrue = [1, -1, 1];
      const yPred = [0.8, -0.5, 0.3];
      const loss = hingeLoss(yTrue, yPred);
      expect(loss).toBeGreaterThan(0);
    });

    it('should be zero for well-separated examples', () => {
      const yTrue = [1, -1];
      const yPred = [2, -2]; // Well separated
      expect(hingeLoss(yTrue, yPred)).toBe(0);
    });

    it('should penalize misclassifications', () => {
      const yTrue = [1, -1];
      const correctPred = [1, -1];
      const wrongPred = [-1, 1];
      expect(hingeLoss(yTrue, wrongPred)).toBeGreaterThan(
        hingeLoss(yTrue, correctPred)
      );
    });
  });

  describe('Squared Hinge Loss', () => {
    it('should penalize errors more heavily than hinge', () => {
      const yTrue = [1];
      const yPred = [-1]; // Large error
      const hingeLossVal = hingeLoss(yTrue, yPred);
      const sqHingeLossVal = squaredHingeLoss(yTrue, yPred);
      expect(sqHingeLossVal).toBeGreaterThan(hingeLossVal);
    });
  });

  describe('Triplet Loss', () => {
    it('should enforce margin between positive and negative', () => {
      const anchor = [[1, 2], [3, 4]];
      const positive = [[1.1, 2.1], [3.1, 4.1]]; // Close to anchor
      const negative = [[5, 6], [7, 8]]; // Far from anchor
      const loss = tripletLoss(anchor, positive, negative, 1.0);
      expect(loss).toBe(0); // Negatives are far enough
    });

    it('should be positive when negatives are too close', () => {
      const anchor = [[1, 2]];
      const positive = [[1.1, 2.1]];
      const negative = [[1.2, 2.2]]; // Too close
      const loss = tripletLoss(anchor, positive, negative, 1.0);
      expect(loss).toBeGreaterThan(0);
    });

    it('should respect margin parameter', () => {
      const anchor = [[0, 0]];
      const positive = [[1, 0]];  // dist^2 = 1
      const negative = [[2, 0]];  // dist^2 = 4

      const loss1 = tripletLoss(anchor, positive, negative, 0.5);
      const loss2 = tripletLoss(anchor, positive, negative, 1.5);

      // With margin=0.5: max(0, 1 - 4 + 0.5) = 0
      // With margin=1.5: max(0, 1 - 4 + 1.5) = 0
      // Both should be 0, so let's change the test
      expect(loss1).toBe(0);
      expect(loss2).toBe(0);

      // Test with closer negative
      const closeNegative = [[1.5, 0]]; // dist^2 = 2.25
      const loss3 = tripletLoss(anchor, positive, closeNegative, 1.5);
      // max(0, 1 - 2.25 + 1.5) = 0.25
      expect(loss3).toBeGreaterThan(0);
    });
  });

  describe('Cosine Embedding Loss', () => {
    it('should minimize distance for similar pairs', () => {
      const x1 = [[1, 0, 0]];
      const x2 = [[0.9, 0.1, 0]]; // Similar
      const y = [1]; // Similar label
      const loss = cosineEmbeddingLoss(x1, x2, y);
      expect(loss).toBeGreaterThan(0);
      expect(loss).toBeLessThan(0.2);
    });

    it('should maximize distance for dissimilar pairs', () => {
      const x1 = [[1, 0]];
      const x2 = [[1, 0]]; // Same direction
      const y = [-1]; // Dissimilar label
      const loss = cosineEmbeddingLoss(x1, x2, y, 0.5);
      expect(loss).toBeGreaterThan(0);
    });
  });

  describe('KL Divergence', () => {
    it('should measure distribution divergence', () => {
      const p = [0.5, 0.3, 0.2];
      const q = [0.4, 0.4, 0.2];
      const div = klDivergence(p, q);
      expect(div).toBeGreaterThan(0);
    });

    it('should be zero for identical distributions', () => {
      const p = [0.5, 0.3, 0.2];
      expect(klDivergence(p, p)).toBeCloseTo(0, 5);
    });

    it('should be asymmetric', () => {
      const p = [0.7, 0.2, 0.1];
      const q = [0.3, 0.4, 0.3];
      const divPQ = klDivergence(p, q);
      const divQP = klDivergence(q, p);
      expect(divPQ).not.toBeCloseTo(divQP, 5);
    });
  });

  describe('Loss Combinators', () => {
    it('should combine multiple losses with equal weights', () => {
      const losses = [0.5, 0.3, 0.2];
      const combined = combineLosses(losses);
      expect(combined).toBe(1.0);
    });

    it('should combine losses with custom weights', () => {
      const losses = [0.5, 0.3, 0.2];
      const weights = [1, 2, 1];
      const combined = combineLosses(losses, weights);
      expect(combined).toBe(0.5 * 1 + 0.3 * 2 + 0.2 * 1);
    });

    it('should throw for mismatched lengths', () => {
      expect(() => combineLosses([0.5, 0.3], [1])).toThrow();
    });

    it('should throw for empty losses', () => {
      expect(() => combineLosses([])).toThrow();
    });
  });

  describe('Custom Loss', () => {
    it('should create transformed loss function', () => {
      const clippedMSE = createCustomLoss(
        (y: number[], yhat: number[]) => mse(y, yhat),
        (loss: number) => Math.min(loss, 1.0)
      );

      const yTrue = [0, 0];
      const yPred = [10, 10]; // Would give MSE of 100

      expect(clippedMSE(yTrue, yPred)).toBe(1.0);
    });

    it('should allow chaining transformations', () => {
      const baseLoss = (y: number[], yhat: number[]) => mse(y, yhat);
      const scaled = createCustomLoss(baseLoss, (loss) => loss * 2);
      const clipped = createCustomLoss(scaled, (loss) => Math.min(loss, 5));

      const yTrue = [0];
      const yPred = [2]; // MSE = 4, scaled = 8, clipped = 5
      expect(clipped(yTrue, yPred)).toBe(5);
    });
  });

  describe('Regularized Loss', () => {
    it('should add L2 regularization', () => {
      const baseLoss = (y: number[], yhat: number[]) => 0;
      const weights = [1, 2, 3];
      const lambda = 0.01;

      const regLoss = regularizedLoss(baseLoss, weights, lambda, 'l2');
      const loss = regLoss([], []);

      const l2Reg = (1 * 1 + 2 * 2 + 3 * 3) * lambda;
      expect(loss).toBeCloseTo(l2Reg, 5);
    });

    it('should add L1 regularization', () => {
      const baseLoss = (y: number[], yhat: number[]) => 0;
      const weights = [-1, 2, -3];
      const lambda = 0.01;

      const regLoss = regularizedLoss(baseLoss, weights, lambda, 'l1');
      const loss = regLoss([], []);

      const l1Reg = (1 + 2 + 3) * lambda;
      expect(loss).toBeCloseTo(l1Reg, 5);
    });

    it('should combine base loss and regularization', () => {
      const baseLoss = (y: number[], yhat: number[]) => mse(y, yhat);
      const weights = [1, 1];
      const lambda = 0.1;

      const regLoss = regularizedLoss(baseLoss, weights, lambda, 'l2');
      const yTrue = [1, 2];
      const yPred = [1.1, 2.1];

      const loss = regLoss(yTrue, yPred);
      const expectedBase = mse(yTrue, yPred);
      const expectedReg = 2 * lambda; // 1^2 + 1^2 = 2

      expect(loss).toBeCloseTo(expectedBase + expectedReg, 5);
    });
  });
});
