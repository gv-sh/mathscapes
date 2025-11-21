/**
 * Pooling Operations Module
 *
 * This module provides pooling operations commonly used in neural networks:
 * - Max pooling, average pooling, min pooling
 * - Global pooling operations
 * - Adaptive pooling
 *
 * Pooling operations downsample feature maps while preserving important information,
 * reducing computational cost and controlling overfitting.
 */

/**
 * Options for pooling operations.
 */
export interface PoolingOptions {
  /** Size of the pooling window */
  poolSize: number | number[];
  /** Stride for the pooling operation (default: same as poolSize) */
  stride?: number | number[];
  /** Padding strategy or values (default: 'valid') */
  padding?: 'valid' | 'same' | number | number[];
}

/**
 * Calculate output size after pooling.
 *
 * @param inputSize - Input dimension size
 * @param poolSize - Pool window size
 * @param stride - Stride value
 * @param padding - Padding value
 * @returns Output size after pooling
 */
function calculatePoolOutputSize(
  inputSize: number,
  poolSize: number,
  stride: number,
  padding: number = 0
): number {
  return Math.floor((inputSize + 2 * padding - poolSize) / stride + 1);
}

/**
 * 1D max pooling operation.
 *
 * Returns the maximum value in each pooling window.
 * Commonly used after convolutional layers to reduce dimensionality.
 *
 * @param input - Input array
 * @param options - Pooling options
 * @returns Pooled output array
 *
 * @example
 * ```ts
 * const input = [1, 3, 2, 4, 5, 1];
 * const output = maxPool1D(input, { poolSize: 2, stride: 2 });
 * // output = [3, 4, 5]
 * ```
 */
export function maxPool1D(input: number[], options: PoolingOptions): number[] {
  const poolSize = typeof options.poolSize === 'number' ? options.poolSize : options.poolSize[0];
  const stride = typeof options.stride === 'number' ? options.stride : (options.stride?.[0] ?? poolSize);

  const outputSize = calculatePoolOutputSize(input.length, poolSize, stride);
  const output: number[] = [];

  for (let i = 0; i < outputSize; i++) {
    const startIdx = i * stride;
    let max = -Infinity;

    for (let k = 0; k < poolSize; k++) {
      const idx = startIdx + k;
      if (idx < input.length) {
        max = Math.max(max, input[idx]);
      }
    }

    output.push(max);
  }

  return output;
}

/**
 * 2D max pooling operation.
 *
 * Returns the maximum value in each 2D pooling window.
 * Most commonly used pooling operation in CNNs.
 *
 * @param input - Input 2D array [height, width]
 * @param options - Pooling options
 * @returns Pooled output 2D array
 *
 * @example
 * ```ts
 * const featureMap = [
 *   [1, 2, 3, 4],
 *   [5, 6, 7, 8],
 *   [9, 10, 11, 12],
 *   [13, 14, 15, 16]
 * ];
 * const pooled = maxPool2D(featureMap, { poolSize: 2, stride: 2 });
 * // pooled = [[6, 8], [14, 16]]
 * ```
 */
export function maxPool2D(input: number[][], options: PoolingOptions): number[][] {
  const inputHeight = input.length;
  const inputWidth = input[0]?.length || 0;

  const poolH = Array.isArray(options.poolSize) ? options.poolSize[0] : options.poolSize;
  const poolW = Array.isArray(options.poolSize) ? options.poolSize[1] ?? poolH : poolH;

  const strideH = Array.isArray(options.stride) ? options.stride[0] : (options.stride ?? poolH);
  const strideW = Array.isArray(options.stride) ? options.stride[1] ?? strideH : strideH;

  const outputHeight = calculatePoolOutputSize(inputHeight, poolH, strideH);
  const outputWidth = calculatePoolOutputSize(inputWidth, poolW, strideW);

  const output: number[][] = [];

  for (let i = 0; i < outputHeight; i++) {
    const row: number[] = [];
    for (let j = 0; j < outputWidth; j++) {
      const startI = i * strideH;
      const startJ = j * strideW;
      let max = -Infinity;

      for (let pi = 0; pi < poolH; pi++) {
        for (let pj = 0; pj < poolW; pj++) {
          const inputI = startI + pi;
          const inputJ = startJ + pj;

          if (inputI < inputHeight && inputJ < inputWidth) {
            max = Math.max(max, input[inputI][inputJ]);
          }
        }
      }

      row.push(max);
    }
    output.push(row);
  }

  return output;
}

/**
 * 3D max pooling operation.
 *
 * Returns the maximum value in each 3D pooling window.
 * Used in 3D CNNs for video or volumetric data.
 *
 * @param input - Input 3D array [depth, height, width]
 * @param options - Pooling options
 * @returns Pooled output 3D array
 */
export function maxPool3D(input: number[][][], options: PoolingOptions): number[][][] {
  const inputDepth = input.length;
  const inputHeight = input[0]?.length || 0;
  const inputWidth = input[0]?.[0]?.length || 0;

  const poolD = Array.isArray(options.poolSize) ? options.poolSize[0] : options.poolSize;
  const poolH = Array.isArray(options.poolSize) ? options.poolSize[1] ?? poolD : poolD;
  const poolW = Array.isArray(options.poolSize) ? options.poolSize[2] ?? poolH : poolH;

  const strideD = Array.isArray(options.stride) ? options.stride[0] : (options.stride ?? poolD);
  const strideH = Array.isArray(options.stride) ? options.stride[1] ?? strideD : strideD;
  const strideW = Array.isArray(options.stride) ? options.stride[2] ?? strideH : strideH;

  const outputDepth = calculatePoolOutputSize(inputDepth, poolD, strideD);
  const outputHeight = calculatePoolOutputSize(inputHeight, poolH, strideH);
  const outputWidth = calculatePoolOutputSize(inputWidth, poolW, strideW);

  const output: number[][][] = [];

  for (let d = 0; d < outputDepth; d++) {
    const slice: number[][] = [];
    for (let i = 0; i < outputHeight; i++) {
      const row: number[] = [];
      for (let j = 0; j < outputWidth; j++) {
        const startD = d * strideD;
        const startI = i * strideH;
        const startJ = j * strideW;
        let max = -Infinity;

        for (let pd = 0; pd < poolD; pd++) {
          for (let pi = 0; pi < poolH; pi++) {
            for (let pj = 0; pj < poolW; pj++) {
              const inputD = startD + pd;
              const inputI = startI + pi;
              const inputJ = startJ + pj;

              if (inputD < inputDepth && inputI < inputHeight && inputJ < inputWidth) {
                max = Math.max(max, input[inputD][inputI][inputJ]);
              }
            }
          }
        }

        row.push(max);
      }
      slice.push(row);
    }
    output.push(slice);
  }

  return output;
}

/**
 * 1D average pooling operation.
 *
 * Returns the average value in each pooling window.
 * Smoother than max pooling, preserves more information.
 *
 * @param input - Input array
 * @param options - Pooling options
 * @returns Pooled output array
 *
 * @example
 * ```ts
 * const input = [1, 3, 2, 4, 5, 1];
 * const output = avgPool1D(input, { poolSize: 2, stride: 2 });
 * // output = [2, 3, 3]
 * ```
 */
export function avgPool1D(input: number[], options: PoolingOptions): number[] {
  const poolSize = typeof options.poolSize === 'number' ? options.poolSize : options.poolSize[0];
  const stride = typeof options.stride === 'number' ? options.stride : (options.stride?.[0] ?? poolSize);

  const outputSize = calculatePoolOutputSize(input.length, poolSize, stride);
  const output: number[] = [];

  for (let i = 0; i < outputSize; i++) {
    const startIdx = i * stride;
    let sum = 0;
    let count = 0;

    for (let k = 0; k < poolSize; k++) {
      const idx = startIdx + k;
      if (idx < input.length) {
        sum += input[idx];
        count++;
      }
    }

    output.push(count > 0 ? sum / count : 0);
  }

  return output;
}

/**
 * 2D average pooling operation.
 *
 * Returns the average value in each 2D pooling window.
 * Often used as an alternative to max pooling.
 *
 * @param input - Input 2D array [height, width]
 * @param options - Pooling options
 * @returns Pooled output 2D array
 *
 * @example
 * ```ts
 * const featureMap = [
 *   [1, 2, 3, 4],
 *   [5, 6, 7, 8],
 *   [9, 10, 11, 12],
 *   [13, 14, 15, 16]
 * ];
 * const pooled = avgPool2D(featureMap, { poolSize: 2, stride: 2 });
 * // pooled = [[3.5, 5.5], [11.5, 13.5]]
 * ```
 */
export function avgPool2D(input: number[][], options: PoolingOptions): number[][] {
  const inputHeight = input.length;
  const inputWidth = input[0]?.length || 0;

  const poolH = Array.isArray(options.poolSize) ? options.poolSize[0] : options.poolSize;
  const poolW = Array.isArray(options.poolSize) ? options.poolSize[1] ?? poolH : poolH;

  const strideH = Array.isArray(options.stride) ? options.stride[0] : (options.stride ?? poolH);
  const strideW = Array.isArray(options.stride) ? options.stride[1] ?? strideH : strideH;

  const outputHeight = calculatePoolOutputSize(inputHeight, poolH, strideH);
  const outputWidth = calculatePoolOutputSize(inputWidth, poolW, strideW);

  const output: number[][] = [];

  for (let i = 0; i < outputHeight; i++) {
    const row: number[] = [];
    for (let j = 0; j < outputWidth; j++) {
      const startI = i * strideH;
      const startJ = j * strideW;
      let sum = 0;
      let count = 0;

      for (let pi = 0; pi < poolH; pi++) {
        for (let pj = 0; pj < poolW; pj++) {
          const inputI = startI + pi;
          const inputJ = startJ + pj;

          if (inputI < inputHeight && inputJ < inputWidth) {
            sum += input[inputI][inputJ];
            count++;
          }
        }
      }

      row.push(count > 0 ? sum / count : 0);
    }
    output.push(row);
  }

  return output;
}

/**
 * 3D average pooling operation.
 *
 * Returns the average value in each 3D pooling window.
 *
 * @param input - Input 3D array [depth, height, width]
 * @param options - Pooling options
 * @returns Pooled output 3D array
 */
export function avgPool3D(input: number[][][], options: PoolingOptions): number[][][] {
  const inputDepth = input.length;
  const inputHeight = input[0]?.length || 0;
  const inputWidth = input[0]?.[0]?.length || 0;

  const poolD = Array.isArray(options.poolSize) ? options.poolSize[0] : options.poolSize;
  const poolH = Array.isArray(options.poolSize) ? options.poolSize[1] ?? poolD : poolD;
  const poolW = Array.isArray(options.poolSize) ? options.poolSize[2] ?? poolH : poolH;

  const strideD = Array.isArray(options.stride) ? options.stride[0] : (options.stride ?? poolD);
  const strideH = Array.isArray(options.stride) ? options.stride[1] ?? strideD : strideD;
  const strideW = Array.isArray(options.stride) ? options.stride[2] ?? strideH : strideH;

  const outputDepth = calculatePoolOutputSize(inputDepth, poolD, strideD);
  const outputHeight = calculatePoolOutputSize(inputHeight, poolH, strideH);
  const outputWidth = calculatePoolOutputSize(inputWidth, poolW, strideW);

  const output: number[][][] = [];

  for (let d = 0; d < outputDepth; d++) {
    const slice: number[][] = [];
    for (let i = 0; i < outputHeight; i++) {
      const row: number[] = [];
      for (let j = 0; j < outputWidth; j++) {
        const startD = d * strideD;
        const startI = i * strideH;
        const startJ = j * strideW;
        let sum = 0;
        let count = 0;

        for (let pd = 0; pd < poolD; pd++) {
          for (let pi = 0; pi < poolH; pi++) {
            for (let pj = 0; pj < poolW; pj++) {
              const inputD = startD + pd;
              const inputI = startI + pi;
              const inputJ = startJ + pj;

              if (inputD < inputDepth && inputI < inputHeight && inputJ < inputWidth) {
                sum += input[inputD][inputI][inputJ];
                count++;
              }
            }
          }
        }

        row.push(count > 0 ? sum / count : 0);
      }
      slice.push(row);
    }
    output.push(slice);
  }

  return output;
}

/**
 * 2D min pooling operation.
 *
 * Returns the minimum value in each 2D pooling window.
 * Less common but useful for specific applications.
 *
 * @param input - Input 2D array [height, width]
 * @param options - Pooling options
 * @returns Pooled output 2D array
 */
export function minPool2D(input: number[][], options: PoolingOptions): number[][] {
  const inputHeight = input.length;
  const inputWidth = input[0]?.length || 0;

  const poolH = Array.isArray(options.poolSize) ? options.poolSize[0] : options.poolSize;
  const poolW = Array.isArray(options.poolSize) ? options.poolSize[1] ?? poolH : poolH;

  const strideH = Array.isArray(options.stride) ? options.stride[0] : (options.stride ?? poolH);
  const strideW = Array.isArray(options.stride) ? options.stride[1] ?? strideH : strideH;

  const outputHeight = calculatePoolOutputSize(inputHeight, poolH, strideH);
  const outputWidth = calculatePoolOutputSize(inputWidth, poolW, strideW);

  const output: number[][] = [];

  for (let i = 0; i < outputHeight; i++) {
    const row: number[] = [];
    for (let j = 0; j < outputWidth; j++) {
      const startI = i * strideH;
      const startJ = j * strideW;
      let min = Infinity;

      for (let pi = 0; pi < poolH; pi++) {
        for (let pj = 0; pj < poolW; pj++) {
          const inputI = startI + pi;
          const inputJ = startJ + pj;

          if (inputI < inputHeight && inputJ < inputWidth) {
            min = Math.min(min, input[inputI][inputJ]);
          }
        }
      }

      row.push(min);
    }
    output.push(row);
  }

  return output;
}

/**
 * Global average pooling for 2D input.
 *
 * Reduces each feature map to a single value by averaging all spatial locations.
 * Often used before the final classification layer instead of flattening.
 *
 * Benefits:
 * - Reduces number of parameters
 * - More robust to spatial translations
 * - Acts as regularizer
 *
 * @param input - Input 2D array [height, width]
 * @returns Single average value
 *
 * @example
 * ```ts
 * const featureMap = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ];
 * const globalAvg = globalAvgPool2D(featureMap);
 * // globalAvg = 5 (average of all values)
 * ```
 */
export function globalAvgPool2D(input: number[][]): number {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input[i].length; j++) {
      sum += input[i][j];
      count++;
    }
  }

  return count > 0 ? sum / count : 0;
}

/**
 * Global max pooling for 2D input.
 *
 * Reduces each feature map to a single value by taking the maximum.
 *
 * @param input - Input 2D array [height, width]
 * @returns Maximum value
 *
 * @example
 * ```ts
 * const featureMap = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ];
 * const globalMax = globalMaxPool2D(featureMap);
 * // globalMax = 9
 * ```
 */
export function globalMaxPool2D(input: number[][]): number {
  let max = -Infinity;

  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input[i].length; j++) {
      max = Math.max(max, input[i][j]);
    }
  }

  return max;
}

/**
 * Global average pooling for 3D input (batch of 2D feature maps).
 *
 * Applies global average pooling to each channel independently.
 *
 * @param input - Input 3D array [channels, height, width]
 * @returns Array of average values, one per channel
 *
 * @example
 * ```ts
 * const featureMaps = [
 *   [[1, 2], [3, 4]],  // channel 0: avg = 2.5
 *   [[5, 6], [7, 8]]   // channel 1: avg = 6.5
 * ];
 * const globalAvg = globalAvgPool3D(featureMaps);
 * // globalAvg = [2.5, 6.5]
 * ```
 */
export function globalAvgPool3D(input: number[][][]): number[] {
  const result: number[] = [];

  for (let c = 0; c < input.length; c++) {
    result.push(globalAvgPool2D(input[c]));
  }

  return result;
}

/**
 * Global max pooling for 3D input (batch of 2D feature maps).
 *
 * Applies global max pooling to each channel independently.
 *
 * @param input - Input 3D array [channels, height, width]
 * @returns Array of maximum values, one per channel
 */
export function globalMaxPool3D(input: number[][][]): number[] {
  const result: number[] = [];

  for (let c = 0; c < input.length; c++) {
    result.push(globalMaxPool2D(input[c]));
  }

  return result;
}

/**
 * Adaptive average pooling for 2D input.
 *
 * Pools the input to a specific output size regardless of input size.
 * Automatically calculates appropriate pooling window and stride.
 *
 * Used when you need a fixed output size but have variable input sizes.
 *
 * @param input - Input 2D array [height, width]
 * @param outputSize - Desired output size [height, width]
 * @returns Pooled output of specified size
 *
 * @example
 * ```ts
 * const input = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]];
 * const output = adaptiveAvgPool2D(input, [2, 2]);
 * // output will be 2x2 regardless of input size
 * ```
 */
export function adaptiveAvgPool2D(
  input: number[][],
  outputSize: [number, number]
): number[][] {
  const inputHeight = input.length;
  const inputWidth = input[0]?.length || 0;
  const [outputHeight, outputWidth] = outputSize;

  const output: number[][] = [];

  for (let i = 0; i < outputHeight; i++) {
    const row: number[] = [];
    const startI = Math.floor((i * inputHeight) / outputHeight);
    const endI = Math.ceil(((i + 1) * inputHeight) / outputHeight);

    for (let j = 0; j < outputWidth; j++) {
      const startJ = Math.floor((j * inputWidth) / outputWidth);
      const endJ = Math.ceil(((j + 1) * inputWidth) / outputWidth);

      let sum = 0;
      let count = 0;

      for (let pi = startI; pi < endI; pi++) {
        for (let pj = startJ; pj < endJ; pj++) {
          if (pi < inputHeight && pj < inputWidth) {
            sum += input[pi][pj];
            count++;
          }
        }
      }

      row.push(count > 0 ? sum / count : 0);
    }
    output.push(row);
  }

  return output;
}

/**
 * Adaptive max pooling for 2D input.
 *
 * Pools the input to a specific output size using max pooling.
 *
 * @param input - Input 2D array [height, width]
 * @param outputSize - Desired output size [height, width]
 * @returns Pooled output of specified size
 */
export function adaptiveMaxPool2D(
  input: number[][],
  outputSize: [number, number]
): number[][] {
  const inputHeight = input.length;
  const inputWidth = input[0]?.length || 0;
  const [outputHeight, outputWidth] = outputSize;

  const output: number[][] = [];

  for (let i = 0; i < outputHeight; i++) {
    const row: number[] = [];
    const startI = Math.floor((i * inputHeight) / outputHeight);
    const endI = Math.ceil(((i + 1) * inputHeight) / outputHeight);

    for (let j = 0; j < outputWidth; j++) {
      const startJ = Math.floor((j * inputWidth) / outputWidth);
      const endJ = Math.ceil(((j + 1) * inputWidth) / outputWidth);

      let max = -Infinity;

      for (let pi = startI; pi < endI; pi++) {
        for (let pj = startJ; pj < endJ; pj++) {
          if (pi < inputHeight && pj < inputWidth) {
            max = Math.max(max, input[pi][pj]);
          }
        }
      }

      row.push(max);
    }
    output.push(row);
  }

  return output;
}
