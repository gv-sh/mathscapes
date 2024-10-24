import { add, multiply, identity, inverse, transpose, scale, createRowMatrix, createColumnMatrix, cloneMatrix, fillMatrix, getDimensions, flattenMatrix, reshapeToMatrix } from '../src/matrix';

describe('Matrix Functions', () => {
    test('add', () => {
        expect(add([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[6, 8], [10, 12]]);
    });

    test('multiply', () => {
        expect(multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]);
    });

    test('identity', () => {
        expect(identity(3)).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    });

    test('inverse', () => {
        const result = inverse([[4, 7], [2, 6]]);
        expect(result[0][0]).toBeCloseTo(0.6, 5); // Check with tolerance
        expect(result[0][1]).toBeCloseTo(-0.7, 5); // Check with tolerance
        expect(result[1][0]).toBeCloseTo(-0.2, 5); // Check with tolerance
        expect(result[1][1]).toBeCloseTo(0.4, 5); // Check with tolerance
    });

    test('transpose', () => {
        expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
    });

    test('scale', () => {
        expect(scale([[1, 2], [3, 4]], 2)).toEqual([[2, 4], [6, 8]]);
    });

    test('createRowMatrix', () => {
        expect(createRowMatrix([1, 2, 3])).toEqual([[1, 2, 3]]);
    });

    test('createColumnMatrix', () => {
        expect(createColumnMatrix([1, 2, 3])).toEqual([[1], [2], [3]]);
    });

    test('cloneMatrix', () => {
        const original = [[1, 2], [3, 4]];
        const cloned = cloneMatrix(original);
        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original); // Ensure it's a different reference
    });

    test('fillMatrix', () => {
        const matrix = createRowMatrix([1, 2, 3]);
        fillMatrix(matrix, 0);
        expect(matrix).toEqual([[0, 0, 0]]);
    });

    test('getDimensions', () => {
        expect(getDimensions([[1, 2], [3, 4]])).toEqual({ rows: 2, cols: 2 });
    });

    test('flattenMatrix', () => {
        expect(flattenMatrix([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });

    test('reshapeToMatrix', () => {
        expect(reshapeToMatrix([1, 2, 3, 4], 2, 2)).toEqual([[1, 2], [3, 4]]);
    });
});
