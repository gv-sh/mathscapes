/**
 * Machine Learning Loss Functions Module
 *
 * This module provides common loss functions used in machine learning,
 * along with utilities for combining and customizing losses.
 *
 * Loss functions measure the difference between predicted and actual values,
 * guiding the optimization process during training.
 */

/**
 * Mean Squared Error (MSE) loss.
 *
 * MSE = (1/n) Σᵢ (yᵢ - ŷᵢ)²
 *
 * Most common loss for regression problems.
 * Penalizes large errors more heavily due to squaring.
 *
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @returns MSE loss value
 *
 * @example
 * ```ts
 * mse([1, 2, 3], [1.1, 2.2, 2.9]); // 0.02
 * ```
 */
export function mse(yTrue: number[], yPred: number[]): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const squaredDiffs = yTrue.map((y, i) => Math.pow(y - yPred[i], 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Root Mean Squared Error (RMSE) loss.
 *
 * RMSE = √(MSE)
 *
 * Same scale as the target variable, easier to interpret than MSE.
 *
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @returns RMSE loss value
 */
export function rmse(yTrue: number[], yPred: number[]): number {
  return Math.sqrt(mse(yTrue, yPred));
}

/**
 * Mean Absolute Error (MAE) loss.
 *
 * MAE = (1/n) Σᵢ |yᵢ - ŷᵢ|
 *
 * More robust to outliers than MSE.
 * All errors weighted equally regardless of magnitude.
 *
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @returns MAE loss value
 *
 * @example
 * ```ts
 * mae([1, 2, 3], [1.1, 2.2, 2.9]); // 0.133...
 * ```
 */
export function mae(yTrue: number[], yPred: number[]): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const absDiffs = yTrue.map((y, i) => Math.abs(y - yPred[i]));
  return absDiffs.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Huber loss.
 *
 * Huber(y, ŷ) = {
 *   0.5(y - ŷ)²           if |y - ŷ| ≤ δ
 *   δ|y - ŷ| - 0.5δ²     otherwise
 * }
 *
 * Combines advantages of MSE and MAE:
 * - Quadratic for small errors (like MSE)
 * - Linear for large errors (like MAE, robust to outliers)
 *
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @param delta - Threshold parameter (default 1.0)
 * @returns Huber loss value
 *
 * @example
 * ```ts
 * huber([1, 2, 3], [1.1, 2.5, 2.9], 0.5); // 0.283...
 * ```
 */
export function huber(yTrue: number[], yPred: number[], delta: number = 1.0): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = yTrue.map((y, i) => {
    const error = Math.abs(y - yPred[i]);
    if (error <= delta) {
      return 0.5 * error * error;
    } else {
      return delta * error - 0.5 * delta * delta;
    }
  });

  return losses.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Log-Cosh loss.
 *
 * LogCosh = (1/n) Σᵢ log(cosh(yᵢ - ŷᵢ))
 *
 * Smooth approximation to MAE, twice differentiable everywhere.
 * Works like MSE for small errors but is less sensitive to outliers.
 *
 * @param yTrue - True values
 * @param yPred - Predicted values
 * @returns Log-Cosh loss value
 *
 * @example
 * ```ts
 * logCosh([1, 2, 3], [1.1, 2.2, 2.9]); // 0.005...
 * ```
 */
export function logCosh(yTrue: number[], yPred: number[]): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = yTrue.map((y, i) => {
    const error = yPred[i] - y;
    // Use log(cosh(x)) = |x| + log(1 + e^(-2|x|)) - log(2) for numerical stability
    const absError = Math.abs(error);
    return absError + Math.log(1 + Math.exp(-2 * absError)) - Math.log(2);
  });

  return losses.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Binary cross-entropy loss.
 *
 * BCE = -(1/n) Σᵢ [yᵢ log(ŷᵢ) + (1 - yᵢ) log(1 - ŷᵢ)]
 *
 * Standard loss for binary classification.
 * Requires predictions to be probabilities in [0, 1].
 *
 * @param yTrue - True binary labels (0 or 1)
 * @param yPred - Predicted probabilities
 * @param epsilon - Small constant to avoid log(0) (default 1e-7)
 * @returns BCE loss value
 *
 * @example
 * ```ts
 * binaryCrossentropy([1, 0, 1], [0.9, 0.1, 0.8]); // 0.105...
 * ```
 */
export function binaryCrossentropy(
  yTrue: number[],
  yPred: number[],
  epsilon: number = 1e-7
): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = yTrue.map((y, i) => {
    // Clip predictions to avoid log(0)
    const p = Math.max(epsilon, Math.min(1 - epsilon, yPred[i]));
    return -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
  });

  return losses.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Categorical cross-entropy loss.
 *
 * CCE = -(1/n) Σᵢ Σⱼ yᵢⱼ log(ŷᵢⱼ)
 *
 * Standard loss for multi-class classification with one-hot encoded labels.
 * Requires predictions to be probability distributions (sum to 1).
 *
 * @param yTrue - True labels as one-hot encoded vectors
 * @param yPred - Predicted probability distributions
 * @param epsilon - Small constant to avoid log(0) (default 1e-7)
 * @returns CCE loss value
 *
 * @example
 * ```ts
 * categoricalCrossentropy(
 *   [[1, 0, 0], [0, 1, 0]],
 *   [[0.8, 0.1, 0.1], [0.2, 0.7, 0.1]]
 * ); // 0.203...
 * ```
 */
export function categoricalCrossentropy(
  yTrue: number[][],
  yPred: number[][],
  epsilon: number = 1e-7
): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same number of samples');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = yTrue.map((trueVec, i) => {
    const predVec = yPred[i];
    if (trueVec.length !== predVec.length) {
      throw new Error('Label vectors must have the same length');
    }

    return -trueVec.reduce((sum, y, j) => {
      const p = Math.max(epsilon, Math.min(1 - epsilon, predVec[j]));
      return sum + y * Math.log(p);
    }, 0);
  });

  return losses.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Sparse categorical cross-entropy loss.
 *
 * Same as categorical cross-entropy but with integer class labels
 * instead of one-hot encoded vectors.
 *
 * @param yTrue - True class indices (integers)
 * @param yPred - Predicted probability distributions
 * @param epsilon - Small constant to avoid log(0) (default 1e-7)
 * @returns Sparse CCE loss value
 *
 * @example
 * ```ts
 * sparseCategoricalCrossentropy(
 *   [0, 1],
 *   [[0.8, 0.1, 0.1], [0.2, 0.7, 0.1]]
 * ); // 0.203...
 * ```
 */
export function sparseCategoricalCrossentropy(
  yTrue: number[],
  yPred: number[][],
  epsilon: number = 1e-7
): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same number of samples');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = yTrue.map((classIdx, i) => {
    if (classIdx < 0 || classIdx >= yPred[i].length) {
      throw new Error(`Invalid class index: ${classIdx}`);
    }
    const p = Math.max(epsilon, Math.min(1 - epsilon, yPred[i][classIdx]));
    return -Math.log(p);
  });

  return losses.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Focal loss.
 *
 * FL = -(1/n) Σᵢ αᵢ (1 - ŷᵢ)^γ yᵢ log(ŷᵢ)
 *
 * Designed to address class imbalance by down-weighting easy examples.
 * Focuses training on hard examples.
 *
 * @param yTrue - True binary labels (0 or 1)
 * @param yPred - Predicted probabilities
 * @param alpha - Weighting factor for positive class (default 0.25)
 * @param gamma - Focusing parameter (default 2.0)
 * @param epsilon - Small constant to avoid log(0) (default 1e-7)
 * @returns Focal loss value
 *
 * @example
 * ```ts
 * focalLoss([1, 0, 1], [0.9, 0.1, 0.6], 0.25, 2.0); // 0.021...
 * ```
 */
export function focalLoss(
  yTrue: number[],
  yPred: number[],
  alpha: number = 0.25,
  gamma: number = 2.0,
  epsilon: number = 1e-7
): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = yTrue.map((y, i) => {
    const p = Math.max(epsilon, Math.min(1 - epsilon, yPred[i]));

    if (y === 1) {
      // Positive class
      return -alpha * Math.pow(1 - p, gamma) * Math.log(p);
    } else {
      // Negative class
      return -(1 - alpha) * Math.pow(p, gamma) * Math.log(1 - p);
    }
  });

  return losses.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Hinge loss.
 *
 * Hinge = (1/n) Σᵢ max(0, 1 - yᵢ * ŷᵢ)
 *
 * Used for "maximum-margin" classification, particularly with SVMs.
 * Requires labels to be -1 or +1, and predictions to be raw scores.
 *
 * @param yTrue - True labels (-1 or +1)
 * @param yPred - Predicted scores (not probabilities)
 * @returns Hinge loss value
 *
 * @example
 * ```ts
 * hingeLoss([1, -1, 1], [0.8, -0.5, 0.3]); // 0.233...
 * ```
 */
export function hingeLoss(yTrue: number[], yPred: number[]): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = yTrue.map((y, i) => Math.max(0, 1 - y * yPred[i]));
  return losses.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Squared hinge loss.
 *
 * SquaredHinge = (1/n) Σᵢ max(0, 1 - yᵢ * ŷᵢ)²
 *
 * Differentiable version of hinge loss, penalizes misclassifications more heavily.
 *
 * @param yTrue - True labels (-1 or +1)
 * @param yPred - Predicted scores
 * @returns Squared hinge loss value
 */
export function squaredHingeLoss(yTrue: number[], yPred: number[]): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = yTrue.map((y, i) => {
    const margin = Math.max(0, 1 - y * yPred[i]);
    return margin * margin;
  });
  return losses.reduce((sum, val) => sum + val, 0) / yTrue.length;
}

/**
 * Triplet loss.
 *
 * TL = max(0, ||a - p||² - ||a - n||² + margin)
 *
 * Used for learning embeddings where:
 * - anchor and positive should be close
 * - anchor and negative should be far apart
 * - margin ensures a minimum separation
 *
 * @param anchor - Anchor embeddings
 * @param positive - Positive embeddings (same class as anchor)
 * @param negative - Negative embeddings (different class from anchor)
 * @param margin - Minimum desired separation (default 1.0)
 * @returns Triplet loss value
 *
 * @example
 * ```ts
 * tripletLoss(
 *   [[1, 2], [3, 4]],
 *   [[1.1, 2.1], [3.1, 4.1]],
 *   [[5, 6], [7, 8]],
 *   1.0
 * ); // 0.0 (negatives are far enough)
 * ```
 */
export function tripletLoss(
  anchor: number[][],
  positive: number[][],
  negative: number[][],
  margin: number = 1.0
): number {
  if (anchor.length !== positive.length || anchor.length !== negative.length) {
    throw new Error('All arrays must have the same number of samples');
  }
  if (anchor.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = anchor.map((a, i) => {
    const p = positive[i];
    const n = negative[i];

    if (a.length !== p.length || a.length !== n.length) {
      throw new Error('Embedding vectors must have the same dimension');
    }

    // Compute squared Euclidean distances
    const distAP = a.reduce((sum, val, j) => {
      const diff = val - p[j];
      return sum + diff * diff;
    }, 0);

    const distAN = a.reduce((sum, val, j) => {
      const diff = val - n[j];
      return sum + diff * diff;
    }, 0);

    return Math.max(0, distAP - distAN + margin);
  });

  return losses.reduce((sum, val) => sum + val, 0) / anchor.length;
}

/**
 * Cosine embedding loss.
 *
 * Used for learning similarity between embeddings:
 * - If y = 1 (similar): loss = 1 - cos(x₁, x₂)
 * - If y = -1 (dissimilar): loss = max(0, cos(x₁, x₂) - margin)
 *
 * @param x1 - First embeddings
 * @param x2 - Second embeddings
 * @param y - Similarity labels (1 for similar, -1 for dissimilar)
 * @param margin - Margin for dissimilar pairs (default 0.0)
 * @returns Cosine embedding loss value
 */
export function cosineEmbeddingLoss(
  x1: number[][],
  x2: number[][],
  y: number[],
  margin: number = 0.0
): number {
  if (x1.length !== x2.length || x1.length !== y.length) {
    throw new Error('All arrays must have the same number of samples');
  }
  if (x1.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  const losses = x1.map((vec1, i) => {
    const vec2 = x2[i];
    const label = y[i];

    if (vec1.length !== vec2.length) {
      throw new Error('Embedding vectors must have the same dimension');
    }

    // Compute cosine similarity
    const dotProduct = vec1.reduce((sum, val, j) => sum + val * vec2[j], 0);
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    const cosSim = dotProduct / (norm1 * norm2 + 1e-8);

    if (label === 1) {
      return 1 - cosSim;
    } else {
      return Math.max(0, cosSim - margin);
    }
  });

  return losses.reduce((sum, val) => sum + val, 0) / x1.length;
}

/**
 * Kullback-Leibler (KL) divergence loss.
 *
 * KL(P||Q) = Σᵢ P(i) log(P(i) / Q(i))
 *
 * Measures how one probability distribution diverges from another.
 * Not symmetric: KL(P||Q) ≠ KL(Q||P)
 *
 * @param yTrue - True probability distribution
 * @param yPred - Predicted probability distribution
 * @param epsilon - Small constant to avoid log(0) (default 1e-7)
 * @returns KL divergence value
 *
 * @example
 * ```ts
 * klDivergence([0.5, 0.3, 0.2], [0.4, 0.4, 0.2]); // 0.021...
 * ```
 */
export function klDivergence(
  yTrue: number[],
  yPred: number[],
  epsilon: number = 1e-7
): number {
  if (yTrue.length !== yPred.length) {
    throw new Error('Arrays must have the same length');
  }
  if (yTrue.length === 0) {
    throw new Error('Arrays cannot be empty');
  }

  return yTrue.reduce((sum, p, i) => {
    const q = Math.max(epsilon, yPred[i]);
    const pClipped = Math.max(epsilon, p);
    return sum + pClipped * Math.log(pClipped / q);
  }, 0);
}

/**
 * Loss function combinator: weighted sum of multiple losses.
 *
 * Combined = Σᵢ wᵢ * Lossᵢ
 *
 * Useful for multi-task learning or combining different loss objectives.
 *
 * @param losses - Array of loss values
 * @param weights - Weights for each loss (default: equal weights)
 * @returns Combined loss value
 *
 * @example
 * ```ts
 * combineLosses([0.5, 0.3, 0.2], [1, 2, 1]); // 0.5 + 0.6 + 0.2 = 1.3
 * ```
 */
export function combineLosses(losses: number[], weights?: number[]): number {
  if (losses.length === 0) {
    throw new Error('Losses array cannot be empty');
  }

  if (weights) {
    if (losses.length !== weights.length) {
      throw new Error('Losses and weights must have the same length');
    }
    return losses.reduce((sum, loss, i) => sum + loss * weights[i], 0);
  } else {
    return losses.reduce((sum, loss) => sum + loss, 0);
  }
}

/**
 * Creates a custom loss function that applies a transformation to another loss.
 *
 * @param baseLoss - Base loss function
 * @param transform - Transformation function to apply to the loss
 * @returns Transformed loss function
 *
 * @example
 * ```ts
 * // Create a loss that clips values above 1.0
 * const clippedMSE = createCustomLoss(
 *   (y, yhat) => mse(y, yhat),
 *   (loss) => Math.min(loss, 1.0)
 * );
 * ```
 */
export function createCustomLoss(
  baseLoss: (yTrue: any, yPred: any) => number,
  transform: (loss: number) => number
): (yTrue: any, yPred: any) => number {
  return (yTrue: any, yPred: any) => {
    const loss = baseLoss(yTrue, yPred);
    return transform(loss);
  };
}

/**
 * Creates a regularized loss function by adding L1 or L2 regularization.
 *
 * @param baseLoss - Base loss function
 * @param weights - Model weights to regularize
 * @param lambda - Regularization strength
 * @param type - Type of regularization: 'l1' or 'l2' (default 'l2')
 * @returns Regularized loss value
 *
 * @example
 * ```ts
 * const weights = [0.5, -0.3, 0.8];
 * const loss = regularizedLoss(
 *   (y, yhat) => mse(y, yhat),
 *   weights,
 *   0.01,
 *   'l2'
 * );
 * ```
 */
export function regularizedLoss(
  baseLoss: (yTrue: any, yPred: any) => number,
  weights: number[],
  lambda: number,
  type: 'l1' | 'l2' = 'l2'
): (yTrue: any, yPred: any) => number {
  return (yTrue: any, yPred: any) => {
    const loss = baseLoss(yTrue, yPred);

    let regularization = 0;
    if (type === 'l1') {
      regularization = weights.reduce((sum, w) => sum + Math.abs(w), 0);
    } else {
      regularization = weights.reduce((sum, w) => sum + w * w, 0);
    }

    return loss + lambda * regularization;
  };
}
