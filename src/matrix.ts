/**
 * Adds two matrices and returns the result.
 * 
 * @param {number[][]} matrixA - The first matrix to add.
 * @param {number[][]} matrixB - The second matrix to add.
 * @returns {number[][]} The resulting matrix after addition.
 */
export const add = (matrixA: number[][], matrixB: number[][]): number[][] => {
    const result: number[][] = createEmptyMatrix(matrixA.length, matrixA[0].length);
    for (let i = 0; i < matrixA.length; i++) {
        for (let j = 0; j < matrixA[0].length; j++) {
            result[i][j] = matrixA[i][j] + matrixB[i][j];
        }
    }
    return result;
}

/**
 * Subtracts two matrices and returns the result.
 * 
 * @param {number[][]} matrixA - The first matrix to subtract.
 * @param {number[][]} matrixB - The second matrix to subtract.
 * @returns {number[][]} The resulting matrix after subtraction.
 */
export const subtract = (matrixA: number[][], matrixB: number[][]): number[][] => {
    return add(matrixA, scale(matrixB, -1));
}

/**
 * Multiplies two matrices and returns the result.
 * 
 * @param {number[][]} matrixA - The first matrix to multiply.
 * @param {number[][]} matrixB - The second matrix to multiply.
 * @returns {number[][]} The resulting matrix after multiplication.
 */
export const multiply = (matrixA: number[][], matrixB: number[][]): number[][] => {
    const result: number[][] = createEmptyMatrix(matrixA.length, matrixB[0].length);
    for (let i = 0; i < matrixA.length; i++) {
        for (let j = 0; j < matrixB[0].length; j++) {
            for (let k = 0; k < matrixA[0].length; k++) {
                result[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }
    return result;
}

/**
 * Creates an identity matrix of given size.
 * 
 * @param {number} size - The size of the identity matrix.
 * @returns {number[][]} The resulting identity matrix.
 */
export const identity = (size: number): number[][] => {
    const result: number[][] = createEmptyMatrix(size, size);
    for (let i = 0; i < size; i++) {
        result[i][i] = 1;
    }
    return result;
}

/**
 * Calculates the inverse of a matrix using Gaussian elimination.
 * 
 * @param {number[][]} matrix - The matrix to invert.
 * @returns {number[][]} The resulting inverse matrix.
 * @throws {Error} If the matrix is singular and cannot be inverted.
 */
export const inverse = (matrix: number[][]): number[][] => {
    const size = matrix.length;
    const result: number[][] = createIdentityMatrix(size);
    const augmented: number[][] = matrix.map((row, i) => [...row, ...result[i]]);

    for (let i = 0; i < size; i++) {
        const diagValue = augmented[i][i];
        if (diagValue === 0) {
            throw new Error("Matrix is singular and cannot be inverted.");
        }
        for (let j = 0; j < augmented[i].length; j++) {
            augmented[i][j] /= diagValue;
        }

        for (let k = 0; k < size; k++) {
            if (k !== i) {
                const factor = augmented[k][i];
                for (let j = 0; j < augmented[k].length; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
    }

    return augmented.map(row => row.slice(size));
}

/**
 * Transposes the given matrix.
 * 
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} The transposed matrix.
 */
export const transpose = (matrix: number[][]): number[][] => {
    const result: number[][] = createEmptyMatrix(matrix[0].length, matrix.length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}

/**
 * Scales the matrix by a given scalar.
 * 
 * @param {number[][]} matrix - The matrix to scale.
 * @param {number} scalar - The scalar value to multiply each element by.
 * @returns {number[][]} The scaled matrix.
 */
export const scale = (matrix: number[][], scalar: number): number[][] => {
    const result: number[][] = createEmptyMatrix(matrix.length, matrix[0].length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            result[i][j] = matrix[i][j] * scalar;
        }
    }
    return result;
}

/**
 * Creates an empty matrix with specified rows and columns.
 * 
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @returns {number[][]} The resulting empty matrix.
 */
export const createEmptyMatrix = (rows: number, cols: number): number[][] => {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/**
 * Creates a matrix with a single row from the given data.
 * 
 * @param {number[]} data - The data to create the row matrix from.
 * @returns {number[][]} The resulting row matrix.
 */
export const createRowMatrix = (data: number[]): number[][] => {
    return [data];
}

/**
 * Creates a matrix with a single column from the given data.
 * 
 * @param {number[]} data - The data to create the column matrix from.
 * @returns {number[][]} The resulting column matrix.
 */
export const createColumnMatrix = (data: number[]): number[][] => {
    return data.map(value => [value]);
}

/**
 * Creates an identity matrix of specified size.
 * 
 * @param {number} size - The size of the identity matrix.
 * @returns {number[][]} The resulting identity matrix.
 */
export const createIdentityMatrix = (size: number): number[][] => {
    return identity(size);
}

/**
 * Clones the given matrix.
 * 
 * @param {number[][]} matrix - The matrix to clone.
 * @returns {number[][]} A new matrix that is a clone of the original.
 */
export const cloneMatrix = (matrix: number[][]): number[][] => {
    return matrix.map(row => [...row]);
}

/**
 * Fills the entire matrix with a specified value.
 * 
 * @param {number[][]} matrix - The matrix to fill.
 * @param {number} value - The value to fill the matrix with.
 */
export const fillMatrix = (matrix: number[][], value: number): void => {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            matrix[i][j] = value;
        }
    }
}

/**
 * Returns the dimensions of the matrix.
 * 
 * @param {number[][]} matrix - The matrix to get dimensions of.
 * @returns {{ rows: number, cols: number }} The dimensions of the matrix.
 */
export const getDimensions = (matrix: number[][]): { rows: number, cols: number } => {
    return { rows: matrix.length, cols: matrix[0].length };
}

/**
 * Flattens the matrix into a single array.
 * 
 * @param {number[][]} matrix - The matrix to flatten.
 * @returns {number[]} The flattened array.
 */
export const flattenMatrix = (matrix: number[][]): number[] => {
    return matrix.reduce((acc, row) => acc.concat(row), []);
}

/**
 * Reshapes a flat array into a matrix with specified dimensions.
 * 
 * @param {number[]} array - The flat array to reshape.
 * @param {number} rows - The number of rows in the resulting matrix.
 * @param {number} cols - The number of columns in the resulting matrix.
 * @returns {number[][]} The reshaped matrix.
 */
export const reshapeToMatrix = (array: number[], rows: number, cols: number): number[][] => {
    const result: number[][] = createEmptyMatrix(rows, cols);
    for (let i = 0; i < array.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        if (row < rows) {
            result[row][col] = array[i];
        }
    }
    return result;
}