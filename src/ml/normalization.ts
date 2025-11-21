/**
 * Normalization Layers Module
 *
 * This module provides normalization techniques used in neural networks:
 * - Batch Normalization (BatchNorm)
 * - Layer Normalization (LayerNorm)
 * - Instance Normalization (InstanceNorm)
 * - Group Normalization (GroupNorm)
 * - Weight Normalization (WeightNorm)
 *
 * Normalization stabilizes training, allows higher learning rates,
 * and acts as a regularizer.
 */

/**
 * Options for normalization operations.
 */
export interface NormalizationOptions {
  /** Small constant for numerical stability (default: 1e-5) */
  epsilon?: number;
  /** Learnable scale parameter (gamma) */
  gamma?: number | number[];
  /** Learnable shift parameter (beta) */
  beta?: number | number[];
  /** Momentum for running statistics (default: 0.1) */
  momentum?: number;
}

/**
 * Compute mean of an array.
 *
 * @param values - Input array
 * @returns Mean value
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Compute variance of an array.
 *
 * @param values - Input array
 * @param meanVal - Pre-computed mean (optional)
 * @returns Variance
 */
function variance(values: number[], meanVal?: number): number {
  if (values.length === 0) return 0;
  const m = meanVal ?? mean(values);
  return values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / values.length;
}

/**
 * Batch Normalization for 1D input.
 *
 * Normalizes activations across the batch dimension.
 * BN(x) = γ * (x - μ_B) / √(σ²_B + ε) + β
 *
 * Where:
 * - μ_B: batch mean
 * - σ²_B: batch variance
 * - γ: learnable scale parameter (default: 1)
 * - β: learnable shift parameter (default: 0)
 * - ε: small constant for numerical stability
 *
 * Benefits:
 * - Reduces internal covariate shift
 * - Allows higher learning rates
 * - Acts as regularizer, reducing need for dropout
 *
 * @param input - Input batch [batchSize]
 * @param options - Normalization options
 * @returns Normalized output and statistics
 *
 * @example
 * ```ts
 * const batch = [1, 2, 3, 4, 5];
 * const { output, mean, variance } = batchNorm1D(batch);
 * // output will be normalized with mean≈0, variance≈1
 * ```
 */
export function batchNorm1D(
  input: number[],
  options: NormalizationOptions = {}
): { output: number[]; mean: number; variance: number } {
  const epsilon = options.epsilon ?? 1e-5;
  const gamma = typeof options.gamma === 'number' ? options.gamma : 1;
  const beta = typeof options.beta === 'number' ? options.beta : 0;

  const batchMean = mean(input);
  const batchVar = variance(input, batchMean);
  const std = Math.sqrt(batchVar + epsilon);

  const output = input.map(x => gamma * (x - batchMean) / std + beta);

  return {
    output,
    mean: batchMean,
    variance: batchVar
  };
}

/**
 * Batch Normalization for 2D input.
 *
 * Normalizes each feature independently across the batch and spatial dimensions.
 * Commonly used in CNNs after convolutional layers.
 *
 * @param input - Input batch [batchSize, features]
 * @param options - Normalization options
 * @returns Normalized output and per-feature statistics
 *
 * @example
 * ```ts
 * const batch = [
 *   [1, 10],
 *   [2, 20],
 *   [3, 30]
 * ];
 * const { output, means, variances } = batchNorm2D(batch);
 * // Each feature normalized independently
 * ```
 */
export function batchNorm2D(
  input: number[][],
  options: NormalizationOptions = {}
): { output: number[][]; means: number[]; variances: number[] } {
  const epsilon = options.epsilon ?? 1e-5;
  const batchSize = input.length;
  const numFeatures = input[0]?.length || 0;

  const gammas = Array.isArray(options.gamma)
    ? options.gamma
    : new Array(numFeatures).fill(options.gamma ?? 1);

  const betas = Array.isArray(options.beta)
    ? options.beta
    : new Array(numFeatures).fill(options.beta ?? 0);

  const means: number[] = [];
  const variances: number[] = [];

  // Compute mean and variance for each feature
  for (let f = 0; f < numFeatures; f++) {
    const featureValues = input.map(sample => sample[f]);
    const m = mean(featureValues);
    const v = variance(featureValues, m);
    means.push(m);
    variances.push(v);
  }

  // Normalize
  const output: number[][] = [];
  for (let i = 0; i < batchSize; i++) {
    const normalized: number[] = [];
    for (let f = 0; f < numFeatures; f++) {
      const std = Math.sqrt(variances[f] + epsilon);
      const norm = gammas[f] * (input[i][f] - means[f]) / std + betas[f];
      normalized.push(norm);
    }
    output.push(normalized);
  }

  return { output, means, variances };
}

/**
 * Layer Normalization for 2D input.
 *
 * Normalizes across features for each sample independently.
 * Unlike BatchNorm, LayerNorm normalizes across the feature dimension
 * rather than the batch dimension.
 *
 * LayerNorm(x) = γ * (x - μ) / √(σ² + ε) + β
 *
 * Benefits:
 * - Works well with variable batch sizes (including batch size 1)
 * - Effective in RNNs and Transformers
 * - No need for running statistics
 *
 * @param input - Input [batchSize, features]
 * @param options - Normalization options
 * @returns Normalized output
 *
 * @example
 * ```ts
 * const sequence = [
 *   [1, 2, 3, 4],
 *   [5, 6, 7, 8]
 * ];
 * const output = layerNorm(sequence);
 * // Each row normalized independently
 * ```
 */
export function layerNorm(
  input: number[][],
  options: NormalizationOptions = {}
): number[][] {
  const epsilon = options.epsilon ?? 1e-5;
  const numFeatures = input[0]?.length || 0;

  const gammas = Array.isArray(options.gamma)
    ? options.gamma
    : new Array(numFeatures).fill(options.gamma ?? 1);

  const betas = Array.isArray(options.beta)
    ? options.beta
    : new Array(numFeatures).fill(options.beta ?? 0);

  const output: number[][] = [];

  for (let i = 0; i < input.length; i++) {
    const sample = input[i];
    const m = mean(sample);
    const v = variance(sample, m);
    const std = Math.sqrt(v + epsilon);

    const normalized = sample.map((val, f) => gammas[f] * (val - m) / std + betas[f]);
    output.push(normalized);
  }

  return output;
}

/**
 * Instance Normalization for 3D input.
 *
 * Normalizes each instance (sample) and channel independently.
 * Used primarily in style transfer and GANs.
 *
 * InstanceNorm normalizes across spatial dimensions (H, W)
 * for each channel of each sample separately.
 *
 * @param input - Input [batchSize, channels, spatialDim]
 * @param options - Normalization options
 * @returns Normalized output
 *
 * @example
 * ```ts
 * // For a batch of 2 images, 3 channels, 4 pixels each
 * const batch = [
 *   [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]],  // image 1
 *   [[2, 3, 4, 5], [6, 7, 8, 9], [10, 11, 12, 13]]  // image 2
 * ];
 * const output = instanceNorm(batch);
 * // Each channel of each image normalized independently
 * ```
 */
export function instanceNorm(
  input: number[][][],
  options: NormalizationOptions = {}
): number[][][] {
  const epsilon = options.epsilon ?? 1e-5;
  const batchSize = input.length;
  const numChannels = input[0]?.length || 0;
  const spatialDim = input[0]?.[0]?.length || 0;

  const gammas = Array.isArray(options.gamma)
    ? options.gamma
    : new Array(numChannels).fill(options.gamma ?? 1);

  const betas = Array.isArray(options.beta)
    ? options.beta
    : new Array(numChannels).fill(options.beta ?? 0);

  const output: number[][][] = [];

  for (let b = 0; b < batchSize; b++) {
    const sampleOutput: number[][] = [];

    for (let c = 0; c < numChannels; c++) {
      const channelValues = input[b][c];
      const m = mean(channelValues);
      const v = variance(channelValues, m);
      const std = Math.sqrt(v + epsilon);

      const normalized = channelValues.map(val => gammas[c] * (val - m) / std + betas[c]);
      sampleOutput.push(normalized);
    }

    output.push(sampleOutput);
  }

  return output;
}

/**
 * Group Normalization for 3D input.
 *
 * Divides channels into groups and normalizes within each group.
 * GroupNorm is a middle ground between LayerNorm (1 group) and
 * InstanceNorm (channels groups).
 *
 * Benefits:
 * - Works well with small batch sizes
 * - More stable than BatchNorm for small batches
 * - Effective in object detection and segmentation
 *
 * @param input - Input [batchSize, channels, spatialDim]
 * @param numGroups - Number of groups to divide channels into
 * @param options - Normalization options
 * @returns Normalized output
 *
 * @example
 * ```ts
 * // 6 channels divided into 2 groups of 3
 * const input = [
 *   [
 *     [1, 2], [3, 4], [5, 6],  // group 1
 *     [7, 8], [9, 10], [11, 12]  // group 2
 *   ]
 * ];
 * const output = groupNorm(input, 2);
 * // Each group normalized independently
 * ```
 */
export function groupNorm(
  input: number[][][],
  numGroups: number,
  options: NormalizationOptions = {}
): number[][][] {
  const epsilon = options.epsilon ?? 1e-5;
  const batchSize = input.length;
  const numChannels = input[0]?.length || 0;

  if (numChannels % numGroups !== 0) {
    throw new Error(`Number of channels (${numChannels}) must be divisible by number of groups (${numGroups})`);
  }

  const channelsPerGroup = numChannels / numGroups;

  const gammas = Array.isArray(options.gamma)
    ? options.gamma
    : new Array(numChannels).fill(options.gamma ?? 1);

  const betas = Array.isArray(options.beta)
    ? options.beta
    : new Array(numChannels).fill(options.beta ?? 0);

  const output: number[][][] = [];

  for (let b = 0; b < batchSize; b++) {
    const sampleOutput: number[][] = [];

    for (let g = 0; g < numGroups; g++) {
      const startChannel = g * channelsPerGroup;
      const endChannel = startChannel + channelsPerGroup;

      // Collect all values in this group
      const groupValues: number[] = [];
      for (let c = startChannel; c < endChannel; c++) {
        groupValues.push(...input[b][c]);
      }

      // Compute group statistics
      const m = mean(groupValues);
      const v = variance(groupValues, m);
      const std = Math.sqrt(v + epsilon);

      // Normalize channels in this group
      for (let c = startChannel; c < endChannel; c++) {
        const normalized = input[b][c].map(val => gammas[c] * (val - m) / std + betas[c]);
        sampleOutput.push(normalized);
      }
    }

    output.push(sampleOutput);
  }

  return output;
}

/**
 * Weight Normalization.
 *
 * Reparametrizes weight vectors by separating magnitude and direction:
 * w = g * v / ||v||
 *
 * Where:
 * - v: weight vector (direction)
 * - g: scalar magnitude
 * - ||v||: L2 norm of v
 *
 * Benefits:
 * - Accelerates convergence
 * - Less noise than BatchNorm
 * - Works with any batch size (including 1)
 * - Computationally cheaper than BatchNorm
 *
 * @param weights - Weight vector or matrix
 * @param g - Magnitude parameter (default: computed from weights)
 * @param options - Normalization options
 * @returns Normalized weights and computed magnitude
 *
 * @example
 * ```ts
 * const weights = [3, 4];  // ||w|| = 5
 * const { output, magnitude } = weightNorm(weights);
 * // output = [3/5, 4/5] (unit vector)
 * // magnitude = 5
 * ```
 */
export function weightNorm(
  weights: number[],
  g?: number,
  options?: NormalizationOptions
): { output: number[]; magnitude: number };

export function weightNorm(
  weights: number[][],
  g?: number,
  options?: NormalizationOptions
): { output: number[][]; magnitude: number };

export function weightNorm(
  weights: number[] | number[][],
  g?: number,
  options: NormalizationOptions = {}
): { output: number[] | number[][]; magnitude: number } {
  const epsilon = options.epsilon ?? 1e-5;

  // Flatten for norm computation
  const flat = Array.isArray(weights[0])
    ? (weights as number[][]).flat()
    : (weights as number[]);

  // Compute L2 norm
  const norm = Math.sqrt(flat.reduce((sum, val) => sum + val * val, 0) + epsilon);

  // Use provided magnitude or default to norm
  const magnitude = g ?? norm;

  // Normalize
  const scale = magnitude / norm;

  if (Array.isArray(weights[0])) {
    const output = (weights as number[][]).map(row =>
      row.map(val => val * scale)
    );
    return { output, magnitude };
  } else {
    const output = (weights as number[]).map(val => val * scale);
    return { output, magnitude };
  }
}

/**
 * Root Mean Square (RMS) Layer Normalization.
 *
 * A simpler variant of LayerNorm that only normalizes by RMS (no mean centering).
 * RMSNorm(x) = x / RMS(x) * γ
 *
 * where RMS(x) = √(mean(x²) + ε)
 *
 * Benefits:
 * - Computationally more efficient than LayerNorm
 * - Works well in transformers (used in T5, GPT-NeoX)
 * - Requires fewer operations (no mean subtraction)
 *
 * @param input - Input [batchSize, features]
 * @param options - Normalization options
 * @returns RMS normalized output
 *
 * @example
 * ```ts
 * const input = [[1, 2, 3, 4], [5, 6, 7, 8]];
 * const output = rmsNorm(input);
 * // Each row normalized by its RMS value
 * ```
 */
export function rmsNorm(
  input: number[][],
  options: NormalizationOptions = {}
): number[][] {
  const epsilon = options.epsilon ?? 1e-5;
  const numFeatures = input[0]?.length || 0;

  const gammas = Array.isArray(options.gamma)
    ? options.gamma
    : new Array(numFeatures).fill(options.gamma ?? 1);

  const output: number[][] = [];

  for (let i = 0; i < input.length; i++) {
    const sample = input[i];

    // Compute RMS
    const squareSum = sample.reduce((sum, val) => sum + val * val, 0);
    const rms = Math.sqrt(squareSum / sample.length + epsilon);

    // Normalize
    const normalized = sample.map((val, f) => (val / rms) * gammas[f]);
    output.push(normalized);
  }

  return output;
}

/**
 * Adaptive Layer Normalization (AdaLN).
 *
 * Conditional normalization where scale and shift are predicted
 * from conditioning information (e.g., timestep in diffusion models).
 *
 * AdaLN(x, c) = γ(c) * ((x - μ) / σ) + β(c)
 *
 * Used in:
 * - Diffusion models (DiT)
 * - Conditional generation
 * - Style modulation
 *
 * @param input - Input [batchSize, features]
 * @param conditioningScale - Predicted scale (gamma) from conditioning
 * @param conditioningShift - Predicted shift (beta) from conditioning
 * @param options - Normalization options
 * @returns Adaptively normalized output
 *
 * @example
 * ```ts
 * const features = [[1, 2, 3, 4]];
 * const scale = [1.5, 1.5, 1.5, 1.5];  // From conditioning network
 * const shift = [0.1, 0.1, 0.1, 0.1];  // From conditioning network
 * const output = adaptiveLayerNorm(features, scale, shift);
 * ```
 */
export function adaptiveLayerNorm(
  input: number[][],
  conditioningScale: number[],
  conditioningShift: number[],
  options: NormalizationOptions = {}
): number[][] {
  const epsilon = options.epsilon ?? 1e-5;
  const output: number[][] = [];

  for (let i = 0; i < input.length; i++) {
    const sample = input[i];
    const m = mean(sample);
    const v = variance(sample, m);
    const std = Math.sqrt(v + epsilon);

    const normalized = sample.map((val, f) =>
      conditioningScale[f] * (val - m) / std + conditioningShift[f]
    );
    output.push(normalized);
  }

  return output;
}
