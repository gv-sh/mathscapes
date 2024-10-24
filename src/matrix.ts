export const add = (matrixA: number[][], matrixB: number[][]): number[][] => {
    // Adds two matrices and returns the result
    const result: number[][] = createEmptyMatrix(matrixA.length, matrixA[0].length);
    for (let i = 0; i < matrixA.length; i++) {
        for (let j = 0; j < matrixA[0].length; j++) {
            result[i][j] = matrixA[i][j] + matrixB[i][j];
        }
    }
    return result;
}

export const multiply = (matrixA: number[][], matrixB: number[][]): number[][] => {
    // Multiplies two matrices and returns the result
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

export const identity = (size: number): number[][] => {
    // Creates an identity matrix of given size
    const result: number[][] = createEmptyMatrix(size, size);
    for (let i = 0; i < size; i++) {
        result[i][i] = 1;
    }
    return result;
}

export const inverse = (matrix: number[][]): number[][] => {
    // Calculates the inverse of a matrix using Gaussian elimination
    const size = matrix.length;
    const result: number[][] = createIdentityMatrix(size);
    const augmented: number[][] = matrix.map((row, i) => [...row, ...result[i]]);

    for (let i = 0; i < size; i++) {
        // Make the diagonal contain all 1s
        const diagValue = augmented[i][i];
        if (diagValue === 0) {
            throw new Error("Matrix is singular and cannot be inverted.");
        }
        for (let j = 0; j < augmented[i].length; j++) {
            augmented[i][j] /= diagValue;
        }

        // Make the other rows contain 0s in the current column
        for (let k = 0; k < size; k++) {
            if (k !== i) {
                const factor = augmented[k][i];
                for (let j = 0; j < augmented[k].length; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
    }

    // Extract the right half of the augmented matrix as the inverse
    return augmented.map(row => row.slice(size));
}

export const transpose = (matrix: number[][]): number[][] => {
    // Transposes the given matrix
    const result: number[][] = createEmptyMatrix(matrix[0].length, matrix.length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}

export const scale = (matrix: number[][], scalar: number): number[][] => {
    // Scales the matrix by a given scalar
    const result: number[][] = createEmptyMatrix(matrix.length, matrix[0].length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            result[i][j] = matrix[i][j] * scalar;
        }
    }
    return result;
}

export const createEmptyMatrix = (rows: number, cols: number): number[][] => {
    // Creates an empty matrix with specified rows and columns
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export const createRowMatrix = (data: number[]): number[][] => {
    // Creates a matrix with a single row from the given data
    return [data];
}

export const createColumnMatrix = (data: number[]): number[][] => {
    // Creates a matrix with a single column from the given data
    return data.map(value => [value]);
}

export const createIdentityMatrix = (size: number): number[][] => {
    // Creates an identity matrix of specified size
    return identity(size);
}

export const cloneMatrix = (matrix: number[][]): number[][] => {
    // Clones the given matrix
    return matrix.map(row => [...row]);
}

export const fillMatrix = (matrix: number[][], value: number): void => {
    // Fills the entire matrix with a specified value
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            matrix[i][j] = value;
        }
    }
}

export const getDimensions = (matrix: number[][]): { rows: number, cols: number } => {
    // Returns the dimensions of the matrix
    return { rows: matrix.length, cols: matrix[0].length };
}

export const flattenMatrix = (matrix: number[][]): number[] => {
    // Flattens the matrix into a single array
    return matrix.reduce((acc, row) => acc.concat(row), []);
}

export const reshapeToMatrix = (array: number[], rows: number, cols: number): number[][] => {
    // Reshapes a flat array into a matrix with specified dimensions
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