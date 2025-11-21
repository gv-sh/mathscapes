import {
  maxPool1D,
  maxPool2D,
  maxPool3D,
  avgPool1D,
  avgPool2D,
  avgPool3D,
  minPool2D,
  globalAvgPool2D,
  globalMaxPool2D,
  globalAvgPool3D,
  globalMaxPool3D,
  adaptiveAvgPool2D,
  adaptiveMaxPool2D,
} from '../../src/ml/pooling';

describe('Pooling Operations', () => {
  describe('1D Max Pooling', () => {
    it('should perform basic 1D max pooling', () => {
      const input = [1, 3, 2, 4, 5, 1];
      const output = maxPool1D(input, { poolSize: 2, stride: 2 });

      expect(output).toEqual([3, 4, 5]);
    });

    it('should handle overlapping windows', () => {
      const input = [1, 2, 3, 4, 5];
      const output = maxPool1D(input, { poolSize: 2, stride: 1 });

      expect(output).toEqual([2, 3, 4, 5]);
    });
  });

  describe('2D Max Pooling', () => {
    it('should perform basic 2D max pooling', () => {
      const input = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ];
      const output = maxPool2D(input, { poolSize: 2, stride: 2 });

      expect(output).toEqual([
        [6, 8],
        [14, 16]
      ]);
    });

    it('should handle non-square pool sizes', () => {
      const input = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12]
      ];
      const output = maxPool2D(input, { poolSize: [2, 3], stride: [2, 3] });

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(1);
      expect(output[0][0]).toBe(7);
    });

    it('should handle overlapping windows in 2D', () => {
      const input = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const output = maxPool2D(input, { poolSize: 2, stride: 1 });

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
      expect(output[0][0]).toBe(5);
      expect(output[0][1]).toBe(6);
      expect(output[1][0]).toBe(8);
      expect(output[1][1]).toBe(9);
    });
  });

  describe('3D Max Pooling', () => {
    it('should perform basic 3D max pooling', () => {
      const input = [
        [[1, 2], [3, 4]],
        [[5, 6], [7, 8]]
      ];
      const output = maxPool3D(input, { poolSize: 2, stride: 2 });

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(1);
      expect(output[0][0].length).toBe(1);
      expect(output[0][0][0]).toBe(8);
    });
  });

  describe('1D Average Pooling', () => {
    it('should perform basic 1D average pooling', () => {
      const input = [1, 3, 2, 4, 5, 1];
      const output = avgPool1D(input, { poolSize: 2, stride: 2 });

      expect(output[0]).toBeCloseTo(2);
      expect(output[1]).toBeCloseTo(3);
      expect(output[2]).toBeCloseTo(3);
    });
  });

  describe('2D Average Pooling', () => {
    it('should perform basic 2D average pooling', () => {
      const input = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ];
      const output = avgPool2D(input, { poolSize: 2, stride: 2 });

      expect(output[0][0]).toBeCloseTo(3.5);
      expect(output[0][1]).toBeCloseTo(5.5);
      expect(output[1][0]).toBeCloseTo(11.5);
      expect(output[1][1]).toBeCloseTo(13.5);
    });

    it('should handle non-square inputs', () => {
      const input = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const output = avgPool2D(input, { poolSize: 2, stride: 1 });

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(2);
    });
  });

  describe('3D Average Pooling', () => {
    it('should perform basic 3D average pooling', () => {
      const input = [
        [[1, 2], [3, 4]],
        [[5, 6], [7, 8]]
      ];
      const output = avgPool3D(input, { poolSize: 2, stride: 2 });

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(1);
      expect(output[0][0].length).toBe(1);
      expect(output[0][0][0]).toBeCloseTo(4.5);
    });
  });

  describe('2D Min Pooling', () => {
    it('should perform basic 2D min pooling', () => {
      const input = [
        [4, 3, 2, 1],
        [8, 7, 6, 5],
        [12, 11, 10, 9],
        [16, 15, 14, 13]
      ];
      const output = minPool2D(input, { poolSize: 2, stride: 2 });

      expect(output).toEqual([
        [3, 1],
        [11, 9]
      ]);
    });
  });

  describe('Global Pooling', () => {
    it('should perform global average pooling on 2D', () => {
      const input = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const output = globalAvgPool2D(input);

      expect(output).toBeCloseTo(5);
    });

    it('should perform global max pooling on 2D', () => {
      const input = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const output = globalMaxPool2D(input);

      expect(output).toBe(9);
    });

    it('should perform global average pooling on 3D', () => {
      const input = [
        [[1, 2], [3, 4]],
        [[5, 6], [7, 8]]
      ];
      const output = globalAvgPool3D(input);

      expect(output.length).toBe(2);
      expect(output[0]).toBeCloseTo(2.5);
      expect(output[1]).toBeCloseTo(6.5);
    });

    it('should perform global max pooling on 3D', () => {
      const input = [
        [[1, 2], [3, 4]],
        [[5, 6], [7, 8]]
      ];
      const output = globalMaxPool3D(input);

      expect(output.length).toBe(2);
      expect(output[0]).toBe(4);
      expect(output[1]).toBe(8);
    });
  });

  describe('Adaptive Pooling', () => {
    it('should perform adaptive average pooling', () => {
      const input = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ];
      const output = adaptiveAvgPool2D(input, [2, 2]);

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
      // Check approximate values
      expect(output[0][0]).toBeCloseTo(3.5, 0);
      expect(output[0][1]).toBeCloseTo(5.5, 0);
    });

    it('should perform adaptive max pooling', () => {
      const input = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ];
      const output = adaptiveMaxPool2D(input, [2, 2]);

      expect(output.length).toBe(2);
      expect(output[0].length).toBe(2);
      expect(output[0][0]).toBe(6);
      expect(output[0][1]).toBe(8);
      expect(output[1][0]).toBe(14);
      expect(output[1][1]).toBe(16);
    });

    it('should handle adaptive pooling with different output sizes', () => {
      const input = [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12]
      ];
      const output = adaptiveAvgPool2D(input, [1, 3]);

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle single element pooling', () => {
      const input = [[5]];
      const output = maxPool2D(input, { poolSize: 1, stride: 1 });

      expect(output).toEqual([[5]]);
    });

    it('should handle pooling with pool size equal to input', () => {
      const input = [[1, 2], [3, 4]];
      const output = avgPool2D(input, { poolSize: 2, stride: 2 });

      expect(output.length).toBe(1);
      expect(output[0].length).toBe(1);
      expect(output[0][0]).toBeCloseTo(2.5);
    });
  });
});
