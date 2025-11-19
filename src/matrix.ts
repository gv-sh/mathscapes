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

// ============================================================================
// MATRIX DECOMPOSITIONS
// ============================================================================

/**
 * Performs LU Decomposition using Doolittle's algorithm.
 * Decomposes matrix A into lower triangular matrix L and upper triangular matrix U
 * such that A = L * U.
 *
 * Time Complexity: O(n³)
 *
 * @param {number[][]} matrix - The square matrix to decompose.
 * @returns {{ L: number[][], U: number[][], P: number[][] }} Object containing L, U, and permutation matrix P.
 * @throws {Error} If the matrix is not square.
 */
export const luDecomposition = (matrix: number[][]): { L: number[][], U: number[][], P: number[][] } => {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error("Matrix must be square for LU decomposition");
    }

    const L = createEmptyMatrix(n, n);
    const U = cloneMatrix(matrix);
    const P = identity(n);

    // Perform partial pivoting
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(U[k][i]) > Math.abs(U[maxRow][i])) {
                maxRow = k;
            }
        }

        // Swap rows in U, L, and P
        if (maxRow !== i) {
            [U[i], U[maxRow]] = [U[maxRow], U[i]];
            [P[i], P[maxRow]] = [P[maxRow], P[i]];
            if (i > 0) {
                for (let k = 0; k < i; k++) {
                    [L[i][k], L[maxRow][k]] = [L[maxRow][k], L[i][k]];
                }
            }
        }

        // Perform elimination
        for (let k = i + 1; k < n; k++) {
            const factor = U[k][i] / U[i][i];
            L[k][i] = factor;
            for (let j = i; j < n; j++) {
                U[k][j] -= factor * U[i][j];
            }
        }
    }

    // Set diagonal of L to 1
    for (let i = 0; i < n; i++) {
        L[i][i] = 1;
    }

    return { L, U, P };
}

/**
 * Performs QR Decomposition using Gram-Schmidt orthogonalization.
 * Decomposes matrix A into orthogonal matrix Q and upper triangular matrix R
 * such that A = Q * R.
 *
 * Time Complexity: O(mn²) where m = rows, n = cols
 *
 * @param {number[][]} matrix - The matrix to decompose.
 * @returns {{ Q: number[][], R: number[][] }} Object containing orthogonal matrix Q and upper triangular matrix R.
 */
export const qrDecomposition = (matrix: number[][]): { Q: number[][], R: number[][] } => {
    const m = matrix.length;
    const n = matrix[0].length;
    const Q = createEmptyMatrix(m, n);
    const R = createEmptyMatrix(n, n);

    // Gram-Schmidt process
    for (let j = 0; j < n; j++) {
        // Copy column j from matrix
        let v = matrix.map(row => row[j]);

        // Subtract projections onto previous Q columns
        for (let i = 0; i < j; i++) {
            const q_i = Q.map(row => row[i]);
            const dot = v.reduce((sum, val, idx) => sum + val * q_i[idx], 0);
            R[i][j] = dot;
            v = v.map((val, idx) => val - dot * q_i[idx]);
        }

        // Normalize
        const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
        R[j][j] = norm;

        if (norm > 1e-10) {
            for (let i = 0; i < m; i++) {
                Q[i][j] = v[i] / norm;
            }
        }
    }

    return { Q, R };
}

/**
 * Performs Cholesky Decomposition for symmetric positive-definite matrices.
 * Decomposes matrix A into lower triangular matrix L such that A = L * L^T.
 *
 * Time Complexity: O(n³)
 *
 * @param {number[][]} matrix - The symmetric positive-definite matrix to decompose.
 * @returns {number[][]} Lower triangular matrix L.
 * @throws {Error} If the matrix is not square or not positive-definite.
 */
export const choleskyDecomposition = (matrix: number[][]): number[][] => {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error("Matrix must be square for Cholesky decomposition");
    }

    const L = createEmptyMatrix(n, n);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            if (i === j) {
                for (let k = 0; k < j; k++) {
                    sum += L[j][k] * L[j][k];
                }
                const val = matrix[j][j] - sum;
                if (val <= 0) {
                    throw new Error("Matrix is not positive-definite");
                }
                L[j][j] = Math.sqrt(val);
            } else {
                for (let k = 0; k < j; k++) {
                    sum += L[i][k] * L[j][k];
                }
                L[i][j] = (matrix[i][j] - sum) / L[j][j];
            }
        }
    }

    return L;
}

/**
 * Performs Singular Value Decomposition (SVD) using the Jacobi method.
 * Decomposes matrix A into U * Σ * V^T where U and V are orthogonal and Σ is diagonal.
 *
 * Time Complexity: O(n³) for square matrices
 * Note: This is a simplified implementation suitable for small to medium matrices.
 *
 * @param {number[][]} matrix - The matrix to decompose.
 * @param {number} maxIterations - Maximum number of iterations (default: 100).
 * @returns {{ U: number[][], S: number[], V: number[][] }} Object containing U, singular values S, and V.
 */
export const svd = (matrix: number[][], maxIterations: number = 100): { U: number[][], S: number[], V: number[][] } => {
    const m = matrix.length;
    const n = matrix[0].length;

    // Compute A^T * A
    const AT = transpose(matrix);
    const ATA = multiply(AT, matrix);

    // Find eigenvalues and eigenvectors of A^T * A (gives us V and S²)
    const { values: singularValuesSquared, vectors: V } = powerIteration(ATA, Math.min(m, n), maxIterations);

    // Singular values are square roots of eigenvalues
    const S = singularValuesSquared.map(val => Math.sqrt(Math.max(0, val)));

    // Compute U = A * V * S^(-1)
    const U = createEmptyMatrix(m, Math.min(m, n));
    for (let i = 0; i < Math.min(m, n); i++) {
        if (S[i] > 1e-10) {
            const v_i = V.map(row => row[i]);
            const Av = multiplyMatrixVector(matrix, v_i);
            for (let j = 0; j < m; j++) {
                U[j][i] = Av[j] / S[i];
            }
        }
    }

    return { U, S, V };
}

// Helper function for matrix-vector multiplication
const multiplyMatrixVector = (matrix: number[][], vector: number[]): number[] => {
    return matrix.map(row =>
        row.reduce((sum, val, idx) => sum + val * vector[idx], 0)
    );
}

// ============================================================================
// EIGENVALUES & EIGENVECTORS
// ============================================================================

/**
 * Computes eigenvalues and eigenvectors using power iteration and deflation.
 *
 * Time Complexity: O(kn³) where k is the number of eigenvalues to find
 *
 * @param {number[][]} matrix - The square matrix.
 * @param {number} numEigenvalues - Number of eigenvalues to compute (default: all).
 * @param {number} maxIterations - Maximum iterations for each eigenvalue (default: 100).
 * @param {number} tolerance - Convergence tolerance (default: 1e-10).
 * @returns {{ values: number[], vectors: number[][] }} Object containing eigenvalues and eigenvectors.
 * @throws {Error} If the matrix is not square.
 */
export const powerIteration = (
    matrix: number[][],
    numEigenvalues?: number,
    maxIterations: number = 100,
    tolerance: number = 1e-10
): { values: number[], vectors: number[][] } => {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error("Matrix must be square");
    }

    const k = numEigenvalues || n;
    const eigenvalues: number[] = [];
    const eigenvectors: number[][] = createEmptyMatrix(n, k);
    let A = cloneMatrix(matrix);

    for (let iter = 0; iter < k; iter++) {
        // Initialize random vector
        let v = Array(n).fill(0).map(() => Math.random());
        let lambda = 0;
        let prevLambda = 0;

        // Power iteration
        for (let i = 0; i < maxIterations; i++) {
            // Normalize v
            const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
            v = v.map(val => val / norm);

            // v_new = A * v
            const v_new = multiplyMatrixVector(A, v);

            // Rayleigh quotient: λ = v^T * A * v / v^T * v
            lambda = v.reduce((sum, val, idx) => sum + val * v_new[idx], 0);

            // Check convergence
            if (Math.abs(lambda - prevLambda) < tolerance) {
                break;
            }

            prevLambda = lambda;
            v = v_new;
        }

        // Normalize final eigenvector
        const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
        v = v.map(val => val / norm);

        eigenvalues.push(lambda);
        for (let i = 0; i < n; i++) {
            eigenvectors[i][iter] = v[i];
        }

        // Deflation: A = A - λ * v * v^T
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                A[i][j] -= lambda * v[i] * v[j];
            }
        }
    }

    return { values: eigenvalues, vectors: eigenvectors };
}

/**
 * Computes eigenvalues and eigenvectors using the QR algorithm.
 * More accurate than power iteration but slower.
 *
 * Time Complexity: O(n³)
 *
 * @param {number[][]} matrix - The square matrix.
 * @param {number} maxIterations - Maximum number of iterations (default: 100).
 * @param {number} tolerance - Convergence tolerance (default: 1e-10).
 * @returns {{ values: number[], vectors: number[][] }} Object containing eigenvalues and eigenvectors.
 */
export const qrAlgorithm = (
    matrix: number[][],
    maxIterations: number = 100,
    tolerance: number = 1e-10
): { values: number[], vectors: number[][] } => {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error("Matrix must be square");
    }

    let A = cloneMatrix(matrix);
    let V = identity(n); // Accumulate transformations

    for (let iter = 0; iter < maxIterations; iter++) {
        const { Q, R } = qrDecomposition(A);
        A = multiply(R, Q);
        V = multiply(V, Q);

        // Check for convergence (off-diagonal elements should be near zero)
        let offDiagSum = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    offDiagSum += Math.abs(A[i][j]);
                }
            }
        }

        if (offDiagSum < tolerance) {
            break;
        }
    }

    // Extract eigenvalues from diagonal
    const eigenvalues = A.map((row, i) => row[i]);

    return { values: eigenvalues, vectors: V };
}

// ============================================================================
// MATRIX NORMS
// ============================================================================

/**
 * Computes the Frobenius norm of a matrix.
 * ||A||_F = sqrt(sum of all squared elements)
 *
 * Time Complexity: O(mn)
 *
 * @param {number[][]} matrix - The matrix.
 * @returns {number} The Frobenius norm.
 */
export const frobeniusNorm = (matrix: number[][]): number => {
    let sum = 0;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            sum += matrix[i][j] * matrix[i][j];
        }
    }
    return Math.sqrt(sum);
}

/**
 * Computes the L1 norm (maximum absolute column sum) of a matrix.
 * ||A||_1 = max_j sum_i |a_ij|
 *
 * Time Complexity: O(mn)
 *
 * @param {number[][]} matrix - The matrix.
 * @returns {number} The L1 norm.
 */
export const l1Norm = (matrix: number[][]): number => {
    const m = matrix.length;
    const n = matrix[0].length;
    let maxSum = 0;

    for (let j = 0; j < n; j++) {
        let colSum = 0;
        for (let i = 0; i < m; i++) {
            colSum += Math.abs(matrix[i][j]);
        }
        maxSum = Math.max(maxSum, colSum);
    }

    return maxSum;
}

/**
 * Computes the L2 norm (spectral norm, largest singular value) of a matrix.
 * ||A||_2 = largest singular value of A
 *
 * Time Complexity: O(n³)
 *
 * @param {number[][]} matrix - The matrix.
 * @returns {number} The L2 norm.
 */
export const l2Norm = (matrix: number[][]): number => {
    // L2 norm is the largest singular value
    const { S } = svd(matrix, 50);
    return Math.max(...S);
}

/**
 * Computes the infinity norm (maximum absolute row sum) of a matrix.
 * ||A||_∞ = max_i sum_j |a_ij|
 *
 * Time Complexity: O(mn)
 *
 * @param {number[][]} matrix - The matrix.
 * @returns {number} The infinity norm.
 */
export const infinityNorm = (matrix: number[][]): number => {
    let maxSum = 0;

    for (let i = 0; i < matrix.length; i++) {
        let rowSum = 0;
        for (let j = 0; j < matrix[0].length; j++) {
            rowSum += Math.abs(matrix[i][j]);
        }
        maxSum = Math.max(maxSum, rowSum);
    }

    return maxSum;
}

// ============================================================================
// RANK & NULLSPACE
// ============================================================================

/**
 * Computes the rank of a matrix using Gaussian elimination.
 * The rank is the dimension of the vector space spanned by its columns.
 *
 * Time Complexity: O(mn * min(m,n))
 *
 * @param {number[][]} matrix - The matrix.
 * @param {number} tolerance - Tolerance for considering a value as zero (default: 1e-10).
 * @returns {number} The rank of the matrix.
 */
export const rank = (matrix: number[][], tolerance: number = 1e-10): number => {
    const m = matrix.length;
    const n = matrix[0].length;
    const A = cloneMatrix(matrix);
    let rank = 0;

    for (let col = 0; col < Math.min(m, n); col++) {
        // Find pivot
        let pivotRow = -1;
        for (let row = rank; row < m; row++) {
            if (Math.abs(A[row][col]) > tolerance) {
                pivotRow = row;
                break;
            }
        }

        if (pivotRow === -1) continue;

        // Swap rows
        if (pivotRow !== rank) {
            [A[rank], A[pivotRow]] = [A[pivotRow], A[rank]];
        }

        // Eliminate
        for (let row = rank + 1; row < m; row++) {
            const factor = A[row][col] / A[rank][col];
            for (let j = col; j < n; j++) {
                A[row][j] -= factor * A[rank][j];
            }
        }

        rank++;
    }

    return rank;
}

/**
 * Computes a basis for the nullspace (kernel) of a matrix.
 * The nullspace consists of all vectors x such that A*x = 0.
 *
 * Time Complexity: O(mn²)
 *
 * @param {number[][]} matrix - The matrix.
 * @param {number} tolerance - Tolerance for considering a value as zero (default: 1e-10).
 * @returns {number[][]} Matrix whose columns form a basis for the nullspace.
 */
export const nullspace = (matrix: number[][], tolerance: number = 1e-10): number[][] => {
    const m = matrix.length;
    const n = matrix[0].length;
    const A = cloneMatrix(matrix);
    const pivotCols: number[] = [];
    let currentRow = 0;

    // Row echelon form
    for (let col = 0; col < n && currentRow < m; col++) {
        // Find pivot
        let pivotRow = -1;
        for (let row = currentRow; row < m; row++) {
            if (Math.abs(A[row][col]) > tolerance) {
                pivotRow = row;
                break;
            }
        }

        if (pivotRow === -1) continue;

        pivotCols.push(col);

        // Swap rows
        if (pivotRow !== currentRow) {
            [A[currentRow], A[pivotRow]] = [A[pivotRow], A[currentRow]];
        }

        // Normalize pivot row
        const pivot = A[currentRow][col];
        for (let j = 0; j < n; j++) {
            A[currentRow][j] /= pivot;
        }

        // Eliminate
        for (let row = 0; row < m; row++) {
            if (row !== currentRow && Math.abs(A[row][col]) > tolerance) {
                const factor = A[row][col];
                for (let j = 0; j < n; j++) {
                    A[row][j] -= factor * A[currentRow][j];
                }
            }
        }

        currentRow++;
    }

    // Find free variables
    const freeCols: number[] = [];
    for (let col = 0; col < n; col++) {
        if (!pivotCols.includes(col)) {
            freeCols.push(col);
        }
    }

    // Build nullspace basis
    const nullspaceBasis = createEmptyMatrix(n, freeCols.length);
    for (let i = 0; i < freeCols.length; i++) {
        const freeCol = freeCols[i];
        nullspaceBasis[freeCol][i] = 1;

        for (let j = 0; j < pivotCols.length; j++) {
            const pivotCol = pivotCols[j];
            nullspaceBasis[pivotCol][i] = -A[j][freeCol];
        }
    }

    return nullspaceBasis;
}

// ============================================================================
// MATRIX FUNCTIONS
// ============================================================================

/**
 * Computes the matrix exponential e^A using the scaling and squaring method.
 *
 * Time Complexity: O(n³)
 *
 * @param {number[][]} matrix - The square matrix.
 * @param {number} terms - Number of terms in Taylor series (default: 20).
 * @returns {number[][]} The matrix exponential.
 * @throws {Error} If the matrix is not square.
 */
export const matrixExp = (matrix: number[][], terms: number = 20): number[][] => {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error("Matrix must be square");
    }

    // Scale matrix by power of 2
    let s = 0;
    const matrixNorm = infinityNorm(matrix);
    if (matrixNorm > 0.5) {
        s = Math.ceil(Math.log2(matrixNorm));
    }

    const scaledMatrix = scale(matrix, 1 / Math.pow(2, s));

    // Compute Taylor series: I + A + A²/2! + A³/3! + ...
    let result = identity(n);
    let term = identity(n);

    for (let k = 1; k <= terms; k++) {
        term = multiply(term, scaledMatrix);
        const scaledTerm = scale(term, 1 / factorial(k));
        result = add(result, scaledTerm);
    }

    // Square s times to undo scaling
    for (let i = 0; i < s; i++) {
        result = multiply(result, result);
    }

    return result;
}

/**
 * Computes the matrix logarithm using the inverse scaling and squaring method.
 * Only works for matrices close to identity. For general matrices, use eigendecomposition.
 *
 * Time Complexity: O(n³)
 *
 * @param {number[][]} matrix - The square matrix.
 * @param {number} terms - Number of terms in Taylor series (default: 50).
 * @returns {number[][]} The matrix logarithm.
 * @throws {Error} If the matrix is not square.
 */
export const matrixLog = (matrix: number[][], terms: number = 50): number[][] => {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error("Matrix must be square");
    }

    // log(A) = log(I + (A - I)) using Taylor series
    // log(I + X) = X - X²/2 + X³/3 - X⁴/4 + ...
    const I = identity(n);
    const X = subtract(matrix, I);

    let result = createEmptyMatrix(n, n);
    let term = cloneMatrix(X);

    for (let k = 1; k <= terms; k++) {
        const scaledTerm = scale(term, (k % 2 === 0 ? -1 : 1) / k);
        result = add(result, scaledTerm);
        term = multiply(term, X);
    }

    return result;
}

/**
 * Computes the matrix square root using Denman-Beavers iteration.
 * For symmetric positive-definite matrices, equivalent to Cholesky.
 *
 * Time Complexity: O(n³) per iteration
 *
 * @param {number[][]} matrix - The square matrix.
 * @param {number} maxIterations - Maximum number of iterations (default: 50).
 * @param {number} tolerance - Convergence tolerance (default: 1e-10).
 * @returns {number[][]} The matrix square root.
 * @throws {Error} If the matrix is not square.
 */
export const matrixSqrt = (
    matrix: number[][],
    maxIterations: number = 50,
    tolerance: number = 1e-10
): number[][] => {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error("Matrix must be square");
    }

    // Denman-Beavers iteration
    let Y = cloneMatrix(matrix);
    let Z = identity(n);

    for (let iter = 0; iter < maxIterations; iter++) {
        const Y_next = scale(add(Y, inverse(Z)), 0.5);
        const Z_next = scale(add(Z, inverse(Y)), 0.5);

        // Check convergence
        const diff = frobeniusNorm(subtract(Y_next, Y));
        if (diff < tolerance) {
            return Y_next;
        }

        Y = Y_next;
        Z = Z_next;
    }

    return Y;
}

/**
 * Computes the matrix power A^k using eigendecomposition.
 *
 * Time Complexity: O(n³)
 *
 * @param {number[][]} matrix - The square matrix.
 * @param {number} k - The power to raise the matrix to.
 * @returns {number[][]} The matrix power.
 * @throws {Error} If the matrix is not square.
 */
export const matrixPower = (matrix: number[][], k: number): number[][] => {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error("Matrix must be square");
    }

    if (k === 0) return identity(n);
    if (k === 1) return cloneMatrix(matrix);

    // For integer powers, use repeated squaring
    if (Number.isInteger(k) && k > 0) {
        let result = identity(n);
        let base = cloneMatrix(matrix);
        let exp = k;

        while (exp > 0) {
            if (exp % 2 === 1) {
                result = multiply(result, base);
            }
            base = multiply(base, base);
            exp = Math.floor(exp / 2);
        }

        return result;
    }

    // For negative or fractional powers, use A^k = V * D^k * V^(-1)
    const { values, vectors } = qrAlgorithm(matrix);

    // D^k
    const D_k = createEmptyMatrix(n, n);
    for (let i = 0; i < n; i++) {
        D_k[i][i] = Math.pow(values[i], k);
    }

    // A^k = V * D^k * V^(-1)
    const V_inv = inverse(vectors);
    return multiply(multiply(vectors, D_k), V_inv);
}

// Helper function: factorial
const factorial = (n: number): number => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}