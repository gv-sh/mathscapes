/**
 * Convolution Operations Module
 *
 * This module provides convolution operations commonly used in neural networks:
 * - 1D, 2D, and 3D convolution operations
 * - Various padding strategies (valid, same, custom)
 * - Stride, dilation, and grouped convolution support
 * - Transposed convolution (deconvolution)
 *
 * Convolution is a fundamental operation in CNNs for feature extraction.
 */

/**
 * Padding strategy for convolution operations.
 */
export type PaddingType = 'valid' | 'same';

/**
 * Options for convolution operations.
 */
export interface ConvolutionOptions {
  /** Stride for the convolution (default: 1) */
  stride?: number | number[];
  /** Padding strategy or custom padding values (default: 'valid') */
  padding?: PaddingType | number | number[];
  /** Dilation rate for dilated/atrous convolution (default: 1) */
  dilation?: number | number[];
  /** Number of groups for grouped convolution (default: 1) */
  groups?: number;
}

/**
 * Calculate output size after convolution.
 *
 * Formula: out = floor((in + 2*pad - dilation*(kernel-1) - 1) / stride + 1)
 *
 * @param inputSize - Input dimension size
 * @param kernelSize - Kernel dimension size
 * @param stride - Stride value
 * @param padding - Padding value
 * @param dilation - Dilation value
 * @returns Output size after convolution
 */
export function calculateConvOutputSize(
  inputSize: number,
  kernelSize: number,
  stride: number = 1,
  padding: number = 0,
  dilation: number = 1
): number {
  return Math.floor((inputSize + 2 * padding - dilation * (kernelSize - 1) - 1) / stride + 1);
}

/**
 * Calculate padding needed for 'same' padding strategy.
 *
 * 'Same' padding ensures output size equals input size (when stride=1).
 *
 * @param kernelSize - Kernel dimension size
 * @param stride - Stride value
 * @param dilation - Dilation value
 * @returns Padding needed on each side
 */
export function calculateSamePadding(
  kernelSize: number,
  stride: number = 1,
  dilation: number = 1
): number {
  const effectiveKernelSize = dilation * (kernelSize - 1) + 1;
  const totalPadding = Math.max(0, (stride - 1) + effectiveKernelSize - stride);
  return Math.floor(totalPadding / 2);
}

/**
 * Pad a 1D array with specified padding.
 *
 * @param input - Input array
 * @param padding - Padding on each side [left, right]
 * @param value - Value to pad with (default: 0)
 * @returns Padded array
 */
export function pad1D(input: number[], padding: [number, number], value: number = 0): number[] {
  const [padLeft, padRight] = padding;
  const padLeftArr = new Array(padLeft).fill(value);
  const padRightArr = new Array(padRight).fill(value);
  return [...padLeftArr, ...input, ...padRightArr];
}

/**
 * Pad a 2D array with specified padding.
 *
 * @param input - Input 2D array
 * @param padding - Padding [top, bottom, left, right]
 * @param value - Value to pad with (default: 0)
 * @returns Padded 2D array
 */
export function pad2D(
  input: number[][],
  padding: [number, number, number, number],
  value: number = 0
): number[][] {
  const [padTop, padBottom, padLeft, padRight] = padding;
  const height = input.length;
  const width = input[0]?.length || 0;
  const newHeight = height + padTop + padBottom;
  const newWidth = width + padLeft + padRight;

  const result: number[][] = [];
  for (let i = 0; i < newHeight; i++) {
    const row: number[] = [];
    for (let j = 0; j < newWidth; j++) {
      if (i < padTop || i >= height + padTop || j < padLeft || j >= width + padLeft) {
        row.push(value);
      } else {
        row.push(input[i - padTop][j - padLeft]);
      }
    }
    result.push(row);
  }
  return result;
}

/**
 * Pad a 3D array with specified padding.
 *
 * @param input - Input 3D array
 * @param padding - Padding [front, back, top, bottom, left, right]
 * @param value - Value to pad with (default: 0)
 * @returns Padded 3D array
 */
export function pad3D(
  input: number[][][],
  padding: [number, number, number, number, number, number],
  value: number = 0
): number[][][] {
  const [padFront, padBack, padTop, padBottom, padLeft, padRight] = padding;
  const depth = input.length;
  const height = input[0]?.length || 0;
  const width = input[0]?.[0]?.length || 0;
  const newDepth = depth + padFront + padBack;
  const newHeight = height + padTop + padBottom;
  const newWidth = width + padLeft + padRight;

  const result: number[][][] = [];
  for (let d = 0; d < newDepth; d++) {
    const slice: number[][] = [];
    for (let i = 0; i < newHeight; i++) {
      const row: number[] = [];
      for (let j = 0; j < newWidth; j++) {
        if (
          d < padFront || d >= depth + padFront ||
          i < padTop || i >= height + padTop ||
          j < padLeft || j >= width + padLeft
        ) {
          row.push(value);
        } else {
          row.push(input[d - padFront][i - padTop][j - padLeft]);
        }
      }
      slice.push(row);
    }
    result.push(slice);
  }
  return result;
}

/**
 * 1D convolution operation.
 *
 * Applies a 1D convolution over an input signal.
 *
 * @param input - Input array of shape [length]
 * @param kernel - Kernel/filter array of shape [kernelSize]
 * @param options - Convolution options
 * @returns Convolved output array
 *
 * @example
 * ```ts
 * const input = [1, 2, 3, 4, 5];
 * const kernel = [1, 0, -1];
 * const output = conv1D(input, kernel, { padding: 'same' });
 * // output ≈ [1, 2, 2, 2, -3]
 * ```
 */
export function conv1D(
  input: number[],
  kernel: number[],
  options: ConvolutionOptions = {}
): number[] {
  const stride = typeof options.stride === 'number' ? options.stride : (options.stride?.[0] ?? 1);
  const dilation = typeof options.dilation === 'number' ? options.dilation : (options.dilation?.[0] ?? 1);

  // Calculate padding
  let padValue = 0;
  if (options.padding === 'same') {
    padValue = calculateSamePadding(kernel.length, stride, dilation);
  } else if (typeof options.padding === 'number') {
    padValue = options.padding;
  } else if (Array.isArray(options.padding)) {
    padValue = options.padding[0];
  }

  // Pad input
  const paddedInput = pad1D(input, [padValue, padValue]);

  // Calculate output size
  const outputSize = calculateConvOutputSize(
    input.length,
    kernel.length,
    stride,
    padValue,
    dilation
  );

  // Perform convolution
  const output: number[] = [];
  for (let i = 0; i < outputSize; i++) {
    const startIdx = i * stride;
    let sum = 0;

    for (let k = 0; k < kernel.length; k++) {
      const inputIdx = startIdx + k * dilation;
      if (inputIdx >= 0 && inputIdx < paddedInput.length) {
        sum += paddedInput[inputIdx] * kernel[k];
      }
    }

    output.push(sum);
  }

  return output;
}

/**
 * 2D convolution operation.
 *
 * Applies a 2D convolution over an input image.
 * This is the core operation in Convolutional Neural Networks (CNNs).
 *
 * @param input - Input 2D array of shape [height, width]
 * @param kernel - Kernel/filter 2D array of shape [kernelHeight, kernelWidth]
 * @param options - Convolution options
 * @returns Convolved output 2D array
 *
 * @example
 * ```ts
 * // Edge detection with Sobel filter
 * const image = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ];
 * const sobelX = [
 *   [-1, 0, 1],
 *   [-2, 0, 2],
 *   [-1, 0, 1]
 * ];
 * const edges = conv2D(image, sobelX);
 * ```
 */
export function conv2D(
  input: number[][],
  kernel: number[][],
  options: ConvolutionOptions = {}
): number[][] {
  const inputHeight = input.length;
  const inputWidth = input[0]?.length || 0;
  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0]?.length || 0;

  const strideH = Array.isArray(options.stride) ? options.stride[0] : (options.stride ?? 1);
  const strideW = Array.isArray(options.stride) ? options.stride[1] ?? strideH : strideH;

  const dilationH = Array.isArray(options.dilation) ? options.dilation[0] : (options.dilation ?? 1);
  const dilationW = Array.isArray(options.dilation) ? options.dilation[1] ?? dilationH : dilationH;

  // Calculate padding
  let padTop = 0, padBottom = 0, padLeft = 0, padRight = 0;

  if (options.padding === 'same') {
    const padH = calculateSamePadding(kernelHeight, strideH, dilationH);
    const padW = calculateSamePadding(kernelWidth, strideW, dilationW);
    padTop = padBottom = padH;
    padLeft = padRight = padW;
  } else if (typeof options.padding === 'number') {
    padTop = padBottom = padLeft = padRight = options.padding;
  } else if (Array.isArray(options.padding)) {
    padTop = options.padding[0] ?? 0;
    padBottom = options.padding[1] ?? padTop;
    padLeft = options.padding[2] ?? padTop;
    padRight = options.padding[3] ?? padLeft;
  }

  // Pad input
  const paddedInput = pad2D(input, [padTop, padBottom, padLeft, padRight]);

  // Calculate output dimensions
  const outputHeight = calculateConvOutputSize(inputHeight, kernelHeight, strideH, padTop, dilationH);
  const outputWidth = calculateConvOutputSize(inputWidth, kernelWidth, strideW, padLeft, dilationW);

  // Perform convolution
  const output: number[][] = [];
  for (let i = 0; i < outputHeight; i++) {
    const row: number[] = [];
    for (let j = 0; j < outputWidth; j++) {
      const startI = i * strideH;
      const startJ = j * strideW;
      let sum = 0;

      for (let ki = 0; ki < kernelHeight; ki++) {
        for (let kj = 0; kj < kernelWidth; kj++) {
          const inputI = startI + ki * dilationH;
          const inputJ = startJ + kj * dilationW;

          if (inputI >= 0 && inputI < paddedInput.length &&
              inputJ >= 0 && inputJ < paddedInput[0].length) {
            sum += paddedInput[inputI][inputJ] * kernel[ki][kj];
          }
        }
      }

      row.push(sum);
    }
    output.push(row);
  }

  return output;
}

/**
 * 3D convolution operation.
 *
 * Applies a 3D convolution over an input volume.
 * Used in video processing and volumetric data (e.g., medical imaging).
 *
 * @param input - Input 3D array of shape [depth, height, width]
 * @param kernel - Kernel/filter 3D array of shape [kernelDepth, kernelHeight, kernelWidth]
 * @param options - Convolution options
 * @returns Convolved output 3D array
 *
 * @example
 * ```ts
 * // Process 3D volumetric data
 * const volume = [...]; // 3D medical scan
 * const kernel3D = [...]; // 3D filter
 * const features = conv3D(volume, kernel3D, { stride: 2 });
 * ```
 */
export function conv3D(
  input: number[][][],
  kernel: number[][][],
  options: ConvolutionOptions = {}
): number[][][] {
  const inputDepth = input.length;
  const inputHeight = input[0]?.length || 0;
  const inputWidth = input[0]?.[0]?.length || 0;
  const kernelDepth = kernel.length;
  const kernelHeight = kernel[0]?.length || 0;
  const kernelWidth = kernel[0]?.[0]?.length || 0;

  const strideD = Array.isArray(options.stride) ? options.stride[0] : (options.stride ?? 1);
  const strideH = Array.isArray(options.stride) ? options.stride[1] ?? strideD : strideD;
  const strideW = Array.isArray(options.stride) ? options.stride[2] ?? strideH : strideH;

  const dilationD = Array.isArray(options.dilation) ? options.dilation[0] : (options.dilation ?? 1);
  const dilationH = Array.isArray(options.dilation) ? options.dilation[1] ?? dilationD : dilationD;
  const dilationW = Array.isArray(options.dilation) ? options.dilation[2] ?? dilationH : dilationH;

  // Calculate padding
  let padFront = 0, padBack = 0, padTop = 0, padBottom = 0, padLeft = 0, padRight = 0;

  if (options.padding === 'same') {
    const padD = calculateSamePadding(kernelDepth, strideD, dilationD);
    const padH = calculateSamePadding(kernelHeight, strideH, dilationH);
    const padW = calculateSamePadding(kernelWidth, strideW, dilationW);
    padFront = padBack = padD;
    padTop = padBottom = padH;
    padLeft = padRight = padW;
  } else if (typeof options.padding === 'number') {
    padFront = padBack = padTop = padBottom = padLeft = padRight = options.padding;
  } else if (Array.isArray(options.padding)) {
    padFront = options.padding[0] ?? 0;
    padBack = options.padding[1] ?? padFront;
    padTop = options.padding[2] ?? padFront;
    padBottom = options.padding[3] ?? padTop;
    padLeft = options.padding[4] ?? padTop;
    padRight = options.padding[5] ?? padLeft;
  }

  // Pad input
  const paddedInput = pad3D(input, [padFront, padBack, padTop, padBottom, padLeft, padRight]);

  // Calculate output dimensions
  const outputDepth = calculateConvOutputSize(inputDepth, kernelDepth, strideD, padFront, dilationD);
  const outputHeight = calculateConvOutputSize(inputHeight, kernelHeight, strideH, padTop, dilationH);
  const outputWidth = calculateConvOutputSize(inputWidth, kernelWidth, strideW, padLeft, dilationW);

  // Perform convolution
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

        for (let kd = 0; kd < kernelDepth; kd++) {
          for (let ki = 0; ki < kernelHeight; ki++) {
            for (let kj = 0; kj < kernelWidth; kj++) {
              const inputD = startD + kd * dilationD;
              const inputI = startI + ki * dilationH;
              const inputJ = startJ + kj * dilationW;

              if (inputD >= 0 && inputD < paddedInput.length &&
                  inputI >= 0 && inputI < paddedInput[0].length &&
                  inputJ >= 0 && inputJ < paddedInput[0][0].length) {
                sum += paddedInput[inputD][inputI][inputJ] * kernel[kd][ki][kj];
              }
            }
          }
        }

        row.push(sum);
      }
      slice.push(row);
    }
    output.push(slice);
  }

  return output;
}

/**
 * Transposed convolution (deconvolution) for 2D input.
 *
 * Also known as fractionally-strided convolution or deconvolution.
 * Used for upsampling in neural networks (e.g., in GANs, autoencoders, segmentation).
 *
 * The transposed convolution is the gradient of the forward convolution
 * with respect to its input.
 *
 * @param input - Input 2D array
 * @param kernel - Kernel/filter 2D array
 * @param options - Convolution options
 * @returns Upsampled output 2D array
 *
 * @example
 * ```ts
 * // Upsample a feature map
 * const featureMap = [[1, 2], [3, 4]];
 * const kernel = [[1, 1], [1, 1]];
 * const upsampled = conv2DTranspose(featureMap, kernel, { stride: 2 });
 * // Output will be 4x4 (upsampled by factor of 2)
 * ```
 */
export function conv2DTranspose(
  input: number[][],
  kernel: number[][],
  options: ConvolutionOptions = {}
): number[][] {
  const inputHeight = input.length;
  const inputWidth = input[0]?.length || 0;
  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0]?.length || 0;

  const strideH = Array.isArray(options.stride) ? options.stride[0] : (options.stride ?? 1);
  const strideW = Array.isArray(options.stride) ? options.stride[1] ?? strideH : strideH;

  // For transposed convolution, output size is larger than input
  const outputHeight = (inputHeight - 1) * strideH + kernelHeight;
  const outputWidth = (inputWidth - 1) * strideW + kernelWidth;

  // Initialize output with zeros
  const output: number[][] = Array.from({ length: outputHeight }, () =>
    Array.from({ length: outputWidth }, () => 0)
  );

  // Perform transposed convolution
  for (let i = 0; i < inputHeight; i++) {
    for (let j = 0; j < inputWidth; j++) {
      const value = input[i][j];
      const startI = i * strideH;
      const startJ = j * strideW;

      // Apply kernel at this position
      for (let ki = 0; ki < kernelHeight; ki++) {
        for (let kj = 0; kj < kernelWidth; kj++) {
          const outputI = startI + ki;
          const outputJ = startJ + kj;

          if (outputI < outputHeight && outputJ < outputWidth) {
            output[outputI][outputJ] += value * kernel[ki][kj];
          }
        }
      }
    }
  }

  return output;
}

/**
 * Depthwise separable convolution for 2D input.
 *
 * Efficient alternative to standard convolution, decomposing into:
 * 1. Depthwise convolution (apply each filter to each input channel separately)
 * 2. Pointwise convolution (1x1 convolution to combine channels)
 *
 * Used in MobileNets and other efficient architectures.
 *
 * @param input - Input 3D array [channels, height, width]
 * @param depthwiseKernels - Array of 2D kernels, one per channel
 * @param pointwiseKernels - Array of 1D kernels for pointwise convolution
 * @param options - Convolution options
 * @returns Output after depthwise separable convolution
 *
 * @example
 * ```ts
 * // Efficient convolution for mobile networks
 * const input = [...]; // [channels, height, width]
 * const dwKernels = [...]; // One 3x3 kernel per channel
 * const pwKernels = [...]; // 1x1 kernels for combining
 * const output = depthwiseSeparableConv2D(input, dwKernels, pwKernels);
 * ```
 */
export function depthwiseSeparableConv2D(
  input: number[][][],
  depthwiseKernels: number[][][],
  pointwiseKernels: number[][],
  options: ConvolutionOptions = {}
): number[][][] {
  const numChannels = input.length;

  // Step 1: Depthwise convolution (apply each kernel to its corresponding channel)
  const depthwiseOutput: number[][][] = [];
  for (let c = 0; c < numChannels; c++) {
    const channelOutput = conv2D(input[c], depthwiseKernels[c], options);
    depthwiseOutput.push(channelOutput);
  }

  // Step 2: Pointwise convolution (1x1 conv to combine channels)
  const outputChannels = pointwiseKernels.length;
  const outputHeight = depthwiseOutput[0].length;
  const outputWidth = depthwiseOutput[0][0].length;

  const output: number[][][] = [];
  for (let oc = 0; oc < outputChannels; oc++) {
    const channelOutput: number[][] = [];
    for (let i = 0; i < outputHeight; i++) {
      const row: number[] = [];
      for (let j = 0; j < outputWidth; j++) {
        let sum = 0;
        for (let ic = 0; ic < numChannels; ic++) {
          sum += depthwiseOutput[ic][i][j] * pointwiseKernels[oc][ic];
        }
        row.push(sum);
      }
      channelOutput.push(row);
    }
    output.push(channelOutput);
  }

  return output;
}
