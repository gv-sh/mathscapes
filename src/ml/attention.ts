/**
 * Attention Mechanisms Module
 *
 * This module provides attention mechanisms used in modern neural networks:
 * - Scaled dot-product attention
 * - Multi-head attention
 * - Self-attention utilities
 *
 * Attention mechanisms allow models to focus on relevant parts of the input,
 * crucial for transformers and many modern architectures.
 */

/**
 * Options for attention mechanisms.
 */
export interface AttentionOptions {
  /** Whether to apply causal masking (for autoregressive models) */
  causalMask?: boolean;
  /** Custom attention mask (0 = mask, 1 = attend) */
  mask?: number[][];
  /** Dropout probability for attention weights (default: 0) */
  dropout?: number;
}

/**
 * Softmax function for attention weights.
 *
 * Converts logits to probabilities that sum to 1.
 *
 * @param x - Input array of logits
 * @returns Softmax probabilities
 */
function softmax(x: number[]): number[] {
  const max = Math.max(...x);
  const exps = x.map(val => Math.exp(val - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(exp => exp / sum);
}

/**
 * Matrix multiplication helper for 2D arrays.
 *
 * @param a - First matrix [m, n]
 * @param b - Second matrix [n, p]
 * @returns Result matrix [m, p]
 */
function matmul(a: number[][], b: number[][]): number[][] {
  const m = a.length;
  const n = a[0]?.length || 0;
  const p = b[0]?.length || 0;

  const result: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row: number[] = [];
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += a[i][k] * b[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

/**
 * Transpose a 2D matrix.
 *
 * @param matrix - Input matrix
 * @returns Transposed matrix
 */
function transpose(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  const result: number[][] = [];
  for (let j = 0; j < cols; j++) {
    const row: number[] = [];
    for (let i = 0; i < rows; i++) {
      row.push(matrix[i][j]);
    }
    result.push(row);
  }
  return result;
}

/**
 * Scaled dot-product attention.
 *
 * The core attention mechanism used in transformers.
 * Attention(Q, K, V) = softmax(Q·K^T / √d_k)·V
 *
 * Where:
 * - Q (queries): What we're looking for
 * - K (keys): What's available to match against
 * - V (values): The actual content to retrieve
 * - d_k: Dimension of keys (scaling factor)
 *
 * The scaling by √d_k prevents dot products from becoming too large.
 *
 * @param queries - Query matrix [seqLen, dModel]
 * @param keys - Key matrix [seqLen, dModel]
 * @param values - Value matrix [seqLen, dModel]
 * @param options - Attention options
 * @returns Attention output [seqLen, dModel] and attention weights
 *
 * @example
 * ```ts
 * // Self-attention example
 * const input = [[1, 0], [0, 1], [1, 1]];  // 3 tokens, 2 dims
 * const { output, weights } = scaledDotProductAttention(input, input, input);
 * // output: attended representation
 * // weights: attention distribution over tokens
 * ```
 */
export function scaledDotProductAttention(
  queries: number[][],
  keys: number[][],
  values: number[][],
  options: AttentionOptions = {}
): { output: number[][]; weights: number[][] } {
  const seqLen = queries.length;
  const dModel = keys[0]?.length || 0;
  const scale = 1 / Math.sqrt(dModel);

  // Compute Q·K^T
  const keysTransposed = transpose(keys);
  const scores = matmul(queries, keysTransposed);

  // Scale scores
  for (let i = 0; i < scores.length; i++) {
    for (let j = 0; j < scores[i].length; j++) {
      scores[i][j] *= scale;
    }
  }

  // Apply causal mask if specified (for autoregressive models)
  if (options.causalMask) {
    for (let i = 0; i < seqLen; i++) {
      for (let j = i + 1; j < seqLen; j++) {
        scores[i][j] = -Infinity; // Mask future positions
      }
    }
  }

  // Apply custom mask if provided
  if (options.mask) {
    for (let i = 0; i < seqLen; i++) {
      for (let j = 0; j < seqLen; j++) {
        if (options.mask[i]?.[j] === 0) {
          scores[i][j] = -Infinity;
        }
      }
    }
  }

  // Apply softmax to get attention weights
  const weights: number[][] = [];
  for (let i = 0; i < scores.length; i++) {
    weights.push(softmax(scores[i]));
  }

  // Compute weighted sum of values
  const output = matmul(weights, values);

  return { output, weights };
}

/**
 * Multi-head attention.
 *
 * Instead of performing a single attention function, multi-head attention
 * runs multiple attention operations in parallel (different "heads"),
 * then concatenates and projects the results.
 *
 * This allows the model to attend to information from different representation
 * subspaces at different positions.
 *
 * MultiHead(Q, K, V) = Concat(head_1, ..., head_h)·W^O
 * where head_i = Attention(Q·W^Q_i, K·W^K_i, V·W^V_i)
 *
 * @param queries - Query matrix [seqLen, dModel]
 * @param keys - Key matrix [seqLen, dModel]
 * @param values - Value matrix [seqLen, dModel]
 * @param numHeads - Number of attention heads
 * @param options - Attention options
 * @returns Multi-head attention output and weights for each head
 *
 * @example
 * ```ts
 * const input = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]];
 * const { output, headWeights } = multiHeadAttention(
 *   input, input, input,
 *   2  // 2 heads
 * );
 * // Each head attends to different aspects of the input
 * ```
 */
export function multiHeadAttention(
  queries: number[][],
  keys: number[][],
  values: number[][],
  numHeads: number,
  options: AttentionOptions = {}
): { output: number[][]; headWeights: number[][][] } {
  const seqLen = queries.length;
  const dModel = queries[0]?.length || 0;

  if (dModel % numHeads !== 0) {
    throw new Error(`Model dimension (${dModel}) must be divisible by number of heads (${numHeads})`);
  }

  const dHead = dModel / numHeads;

  // Split into heads
  const splitHeads = (matrix: number[][]): number[][][] => {
    const heads: number[][][] = [];
    for (let h = 0; h < numHeads; h++) {
      const head: number[][] = [];
      for (let i = 0; i < seqLen; i++) {
        const headRow: number[] = [];
        for (let j = 0; j < dHead; j++) {
          headRow.push(matrix[i][h * dHead + j]);
        }
        head.push(headRow);
      }
      heads.push(head);
    }
    return heads;
  };

  const queryHeads = splitHeads(queries);
  const keyHeads = splitHeads(keys);
  const valueHeads = splitHeads(values);

  // Apply attention to each head
  const headOutputs: number[][][] = [];
  const headWeights: number[][][] = [];

  for (let h = 0; h < numHeads; h++) {
    const { output, weights } = scaledDotProductAttention(
      queryHeads[h],
      keyHeads[h],
      valueHeads[h],
      options
    );
    headOutputs.push(output);
    headWeights.push(weights);
  }

  // Concatenate heads
  const output: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    const row: number[] = [];
    for (let h = 0; h < numHeads; h++) {
      for (let j = 0; j < dHead; j++) {
        row.push(headOutputs[h][i][j]);
      }
    }
    output.push(row);
  }

  return { output, headWeights };
}

/**
 * Self-attention.
 *
 * A special case of attention where queries, keys, and values
 * all come from the same input sequence.
 *
 * Used extensively in transformers for encoding relationships
 * between different positions in the sequence.
 *
 * @param input - Input matrix [seqLen, dModel]
 * @param options - Attention options
 * @returns Self-attention output and weights
 *
 * @example
 * ```ts
 * const sequence = [
 *   [1, 0, 0],  // token 1
 *   [0, 1, 0],  // token 2
 *   [0, 0, 1]   // token 3
 * ];
 * const { output, weights } = selfAttention(sequence);
 * // Each token attends to all tokens (including itself)
 * ```
 */
export function selfAttention(
  input: number[][],
  options: AttentionOptions = {}
): { output: number[][]; weights: number[][] } {
  return scaledDotProductAttention(input, input, input, options);
}

/**
 * Multi-head self-attention.
 *
 * Combines multi-head attention with self-attention.
 * This is the primary building block of transformer encoders.
 *
 * @param input - Input matrix [seqLen, dModel]
 * @param numHeads - Number of attention heads
 * @param options - Attention options
 * @returns Multi-head self-attention output and weights
 *
 * @example
 * ```ts
 * const tokens = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
 * const { output, headWeights } = multiHeadSelfAttention(tokens, 2);
 * // 2 heads each attending to the full sequence
 * ```
 */
export function multiHeadSelfAttention(
  input: number[][],
  numHeads: number,
  options: AttentionOptions = {}
): { output: number[][]; headWeights: number[][][] } {
  return multiHeadAttention(input, input, input, numHeads, options);
}

/**
 * Compute attention scores (before softmax).
 *
 * Returns raw attention logits without applying softmax.
 * Useful for visualizing attention patterns or custom attention modifications.
 *
 * @param queries - Query matrix [seqLen, dModel]
 * @param keys - Key matrix [seqLen, dModel]
 * @param scale - Whether to scale by √d_k (default: true)
 * @returns Attention scores [seqLen, seqLen]
 *
 * @example
 * ```ts
 * const q = [[1, 0], [0, 1]];
 * const k = [[1, 0], [0, 1]];
 * const scores = attentionScores(q, k);
 * // Raw similarity scores before softmax
 * ```
 */
export function attentionScores(
  queries: number[][],
  keys: number[][],
  scale: boolean = true
): number[][] {
  const dModel = keys[0]?.length || 0;
  const scaleFactor = scale ? 1 / Math.sqrt(dModel) : 1;

  const keysTransposed = transpose(keys);
  const scores = matmul(queries, keysTransposed);

  if (scale) {
    for (let i = 0; i < scores.length; i++) {
      for (let j = 0; j < scores[i].length; j++) {
        scores[i][j] *= scaleFactor;
      }
    }
  }

  return scores;
}

/**
 * Create a causal attention mask.
 *
 * Creates a lower triangular mask for autoregressive models,
 * preventing positions from attending to future positions.
 *
 * @param seqLen - Sequence length
 * @returns Causal mask [seqLen, seqLen] where 1 = can attend, 0 = mask
 *
 * @example
 * ```ts
 * const mask = createCausalMask(4);
 * // mask = [
 * //   [1, 0, 0, 0],
 * //   [1, 1, 0, 0],
 * //   [1, 1, 1, 0],
 * //   [1, 1, 1, 1]
 * // ]
 * // Position i can only attend to positions 0..i
 * ```
 */
export function createCausalMask(seqLen: number): number[][] {
  const mask: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    const row: number[] = [];
    for (let j = 0; j < seqLen; j++) {
      row.push(j <= i ? 1 : 0);
    }
    mask.push(row);
  }
  return mask;
}

/**
 * Create a padding mask.
 *
 * Creates a mask to ignore padding tokens (typically marked as 0).
 * Prevents attention from being placed on padding positions.
 *
 * @param tokens - Token IDs where 0 indicates padding
 * @returns Padding mask [seqLen, seqLen] where 1 = can attend, 0 = mask
 *
 * @example
 * ```ts
 * const tokens = [5, 10, 3, 0, 0];  // Last 2 are padding
 * const mask = createPaddingMask(tokens);
 * // All positions can attend to tokens 0-2, but not 3-4
 * ```
 */
export function createPaddingMask(tokens: number[]): number[][] {
  const seqLen = tokens.length;
  const mask: number[][] = [];

  for (let i = 0; i < seqLen; i++) {
    const row: number[] = [];
    for (let j = 0; j < seqLen; j++) {
      // Can attend if target token is not padding
      row.push(tokens[j] !== 0 ? 1 : 0);
    }
    mask.push(row);
  }

  return mask;
}

/**
 * Combine multiple attention masks.
 *
 * Combines masks using logical AND (both must allow attention).
 * Useful for combining causal and padding masks.
 *
 * @param masks - Array of masks to combine
 * @returns Combined mask where all inputs must be 1 to attend
 *
 * @example
 * ```ts
 * const causalMask = createCausalMask(4);
 * const paddingMask = createPaddingMask([1, 2, 3, 0]);
 * const combinedMask = combineMasks([causalMask, paddingMask]);
 * // Applies both causal and padding constraints
 * ```
 */
export function combineMasks(...masks: number[][][]): number[][] {
  if (masks.length === 0) {
    throw new Error('At least one mask is required');
  }

  const seqLen = masks[0].length;
  const result: number[][] = [];

  for (let i = 0; i < seqLen; i++) {
    const row: number[] = [];
    for (let j = 0; j < seqLen; j++) {
      let combined = 1;
      for (const mask of masks) {
        if (mask[i]?.[j] === 0) {
          combined = 0;
          break;
        }
      }
      row.push(combined);
    }
    result.push(row);
  }

  return result;
}

/**
 * Compute attention entropy.
 *
 * Measures how "focused" or "distributed" attention is.
 * - Low entropy: attention is focused on few positions
 * - High entropy: attention is distributed evenly
 *
 * @param attentionWeights - Attention weight matrix [seqLen, seqLen]
 * @returns Entropy for each query position
 *
 * @example
 * ```ts
 * const weights = [[0.9, 0.1], [0.5, 0.5]];
 * const entropy = attentionEntropy(weights);
 * // First position: low entropy (focused)
 * // Second position: high entropy (distributed)
 * ```
 */
export function attentionEntropy(attentionWeights: number[][]): number[] {
  const entropy: number[] = [];

  for (let i = 0; i < attentionWeights.length; i++) {
    let ent = 0;
    for (let j = 0; j < attentionWeights[i].length; j++) {
      const p = attentionWeights[i][j];
      if (p > 0) {
        ent -= p * Math.log2(p);
      }
    }
    entropy.push(ent);
  }

  return entropy;
}
