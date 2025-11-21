import {
  conv1D,
  conv2D,
  conv3D,
  conv2DTranspose,
  depthwiseSeparableConv2D,
  calculateConvOutputSize,
  calculateSamePadding,
  pad1D,
  pad2D,
  pad3D,
} from '../../src/ml/convolution';

describe('Convolution Operations', () => {
  describe('Output size calculations', () => {
    it('should calculate output size correctly', () => {
      expect(calculateConvOutputSize(10, 3, 1, 0)).toBe(8);
      expect(calculateConvOutputSize(10, 3, 2, 0)).toBe(4);
      expect(calculateConvOutputSize(10, 3, 1, 1)).toBe(10);
    });

    it('should calculate same padding correctly', () => {
      expect(calculateSamePadding(3, 1, 1)).toBe(1);
      expect(calculateSamePadding(5, 1, 1)).toBe(2);
      expect(calculateSamePadding(3, 2, 1)).toBe(1);
    });
  });

  describe('Padding operations', () => {
    it('should pad 1D array correctly', () => {
      const input = [1, 2, 3];
      const padded = pad1D(input, [1, 1], 0);
      expect(padded).toEqual([0, 1, 2, 3, 0]);
    });

    it('should pad 2D array correctly', () => {
      const input = [[1, 2], [3, 4]];
      const padded = pad2D(input, [1, 1, 1, 1], 0);
      expect(padded.length).toBe(4);
      expect(padded[0].length).toBe(4);
      expect(padded[1][1]).toBe(1);
    });

    it('should pad 3D array correctly', () => {
      const input = [[[1, 2]], [[3, 4]]];
      const padded = pad3D(input, [1, 1, 1, 1, 1, 1], 0);
      expect(padded.length).toBe(4);
      expect(padded[0].length).toBe(3);
      expect(padded[0][0].length).toBe(4);
    });
  });

  describe('1D Convolution', () => {
    it('should perform basic 1D convolution', () => {
      const input = [1, 2, 3, 4, 5];
      const kernel = [1, 0, -1];
      const output = conv1D(input, kernel);

      expect(output.length).toBe(3);
      expect(output[0]).toBeCloseTo(1 - 3);
      expect(output[1]).toBeCloseTo(2 - 4);
      expect(output[2]).toBeCloseTo(3 - 5);
    });

    it('should handle stride correctly', () => {
      const input = [1, 2, 3, 4, 5, 6];
      const kernel = [1, 1];
      const output = conv1D(input, kernel, { stride: 2 });

      expect(output.length).toBe(3);
      expect(output[0]).toBeCloseTo(3);
      expect(output[1]).toBeCloseTo(7);
      expect(output[2]).toBeCloseTo(11);
    });

    it('should handle same padding', () => {
      const input = [1, 2, 3, 4, 5];
      const kernel = [1, 1, 1];
      const output = conv1D(input, kernel, { padding: 'same' });

      expect(output.length).toBe(5);
    });
  });

  describe('2D Convolution', () => {
    it('should perform basic 2D convolution', () => {
      const input = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const kernel = [
        [1, 0],
        [0, 1]
      ];
      const output = conv2D(input, kernel);

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
      expect(output[0][0]).toBeCloseTo(1 + 5);
      expect(output[0][1]).toBeCloseTo(2 + 6);
    });

    it('should handle edge detection kernel', () => {
      const input = [
        [1, 1, 1],
        [1, 1, 1],
        [0, 0, 0]
      ];
      const sobelY = [
        [1, 2, 1],
        [0, 0, 0],
        [-1, -2, -1]
      ];
      const output = conv2D(input, sobelY);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(1);
      // Should detect horizontal edge
      expect(Math.abs(output[0][0])).toBeGreaterThan(0);
    });

    it('should handle stride in 2D', () => {
      const input = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ];
      const kernel = [[1, 1], [1, 1]];
      const output = conv2D(input, kernel, { stride: 2 });

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
    });

    it('should handle same padding in 2D', () => {
      const input = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const kernel = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
      const output = conv2D(input, kernel, { padding: 'same' });

      expect(output.length).toBe(3);
      expect(output[0].length).toBe(3);
    });
  });

  describe('3D Convolution', () => {
    it('should perform basic 3D convolution', () => {
      const input = [
        [[1, 2], [3, 4]],
        [[5, 6], [7, 8]]
      ];
      const kernel = [
        [[1, 0], [0, 1]],
        [[1, 0], [0, 1]]
      ];
      const output = conv3D(input, kernel);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(1);
      expect(output[0][0].length).toBe(1);
    });

    it('should handle stride in 3D', () => {
      const input = [
        [[1, 2, 3, 4], [5, 6, 7, 8]],
        [[9, 10, 11, 12], [13, 14, 15, 16]],
        [[17, 18, 19, 20], [21, 22, 23, 24]],
        [[25, 26, 27, 28], [29, 30, 31, 32]]
      ];
      const kernel = [[[1, 1], [1, 1]], [[1, 1], [1, 1]]];
      const output = conv3D(input, kernel, { stride: 2 });

      expect(output.length).toBe(2);
    });
  });

  describe('Transposed Convolution', () => {
    it('should upsample with transposed convolution', () => {
      const input = [[1, 2], [3, 4]];
      const kernel = [[1, 1], [1, 1]];
      const output = conv2DTranspose(input, kernel);

      // Output should be larger than input
      expect(output.length).toBeGreaterThan(input.length);
      expect(output[0].length).toBeGreaterThan(input[0].length);
    });

    it('should handle stride correctly in transposed conv', () => {
      const input = [[1]];
      const kernel = [[1, 1], [1, 1]];
      const output = conv2DTranspose(input, kernel, { stride: 2 });

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
    });
  });

  describe('Depthwise Separable Convolution', () => {
    it('should perform depthwise separable convolution', () => {
      const input = [
        [[1, 2], [3, 4]],
        [[5, 6], [7, 8]]
      ];
      const depthwiseKernels = [
        [[1, 0], [0, 1]],
        [[1, 0], [0, 1]]
      ];
      const pointwiseKernels = [
        [1, 1],
        [0.5, 0.5]
      ];
      const output = depthwiseSeparableConv2D(
        input,
        depthwiseKernels,
        pointwiseKernels
      );

      expect(output.length).toBe(2);
      expect(Array.isArray(output[0])).toBe(true);
    });
  });
});
