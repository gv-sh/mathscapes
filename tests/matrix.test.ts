import {
    add, subtract, multiply, identity, inverse, transpose, scale, createRowMatrix, createColumnMatrix,
    cloneMatrix, fillMatrix, getDimensions, flattenMatrix, reshapeToMatrix,
    // Week 2: Advanced Matrix Operations
    luDecomposition, qrDecomposition, choleskyDecomposition, svd,
    powerIteration, qrAlgorithm,
    frobeniusNorm, l1Norm, l2Norm, infinityNorm,
    rank, nullspace,
    matrixExp, matrixLog, matrixSqrt, matrixPower
} from '../src/matrix';

describe('Matrix Functions', () => {
    test('add', () => {
        expect(add([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[6, 8], [10, 12]]);
    });

    test('subtract', () => {
        expect(subtract([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[-4, -4], [-4, -4]]);
    });

    test('multiply', () => {
        expect(multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]);
    });

    test('identity', () => {
        expect(identity(3)).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    });

    test('inverse', () => {
        const result = inverse([[4, 7], [2, 6]]);
        expect(result[0][0]).toBeCloseTo(0.6, 5);
        expect(result[0][1]).toBeCloseTo(-0.7, 5);
        expect(result[1][0]).toBeCloseTo(-0.2, 5);
        expect(result[1][1]).toBeCloseTo(0.4, 5);
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
        expect(cloned).not.toBe(original);
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

// ============================================================================
// WEEK 2: ADVANCED MATRIX OPERATIONS
// ============================================================================

describe('Matrix Decompositions', () => {
    describe('LU Decomposition', () => {
        test('decomposes a simple 2x2 matrix', () => {
            const A = [[2, 1], [1, 1]];
            const { L, U, P } = luDecomposition(A);

            // Verify P*A = L*U
            const PA = multiply(P, A);
            const LU = multiply(L, U);

            for (let i = 0; i < PA.length; i++) {
                for (let j = 0; j < PA[0].length; j++) {
                    expect(PA[i][j]).toBeCloseTo(LU[i][j], 10);
                }
            }
        });

        test('decomposes a 3x3 matrix', () => {
            const A = [[1, 2, 3], [4, 5, 6], [7, 8, 10]];
            const { L, U, P } = luDecomposition(A);

            const PA = multiply(P, A);
            const LU = multiply(L, U);

            for (let i = 0; i < PA.length; i++) {
                for (let j = 0; j < PA[0].length; j++) {
                    expect(PA[i][j]).toBeCloseTo(LU[i][j], 10);
                }
            }
        });

        test('throws error for non-square matrix', () => {
            expect(() => luDecomposition([[1, 2, 3], [4, 5, 6]])).toThrow();
        });
    });

    describe('QR Decomposition', () => {
        test('decomposes a 3x3 matrix', () => {
            const A = [[12, -51, 4], [6, 167, -68], [-4, 24, -41]];
            const { Q, R } = qrDecomposition(A);

            // Verify A = Q*R
            const QR = multiply(Q, R);

            for (let i = 0; i < A.length; i++) {
                for (let j = 0; j < A[0].length; j++) {
                    expect(QR[i][j]).toBeCloseTo(A[i][j], 8);
                }
            }

            // Verify Q is orthogonal: Q^T * Q = I
            const QT = transpose(Q);
            const QTQ = multiply(QT, Q);
            const I = identity(Q[0].length);

            for (let i = 0; i < I.length; i++) {
                for (let j = 0; j < I[0].length; j++) {
                    expect(QTQ[i][j]).toBeCloseTo(I[i][j], 8);
                }
            }
        });

        test('handles rectangular matrices', () => {
            const A = [[1, 2], [3, 4], [5, 6]];
            const { Q, R } = qrDecomposition(A);

            const QR = multiply(Q, R);

            for (let i = 0; i < A.length; i++) {
                for (let j = 0; j < A[0].length; j++) {
                    expect(QR[i][j]).toBeCloseTo(A[i][j], 10);
                }
            }
        });
    });

    describe('Cholesky Decomposition', () => {
        test('decomposes a symmetric positive-definite matrix', () => {
            const A = [[4, 12, -16], [12, 37, -43], [-16, -43, 98]];
            const L = choleskyDecomposition(A);

            // Verify A = L*L^T
            const LT = transpose(L);
            const LLT = multiply(L, LT);

            for (let i = 0; i < A.length; i++) {
                for (let j = 0; j < A[0].length; j++) {
                    expect(LLT[i][j]).toBeCloseTo(A[i][j], 10);
                }
            }
        });

        test('throws error for non-square matrix', () => {
            expect(() => choleskyDecomposition([[1, 2, 3], [4, 5, 6]])).toThrow();
        });

        test('throws error for non-positive-definite matrix', () => {
            expect(() => choleskyDecomposition([[1, 2], [2, 1]])).toThrow();
        });
    });

    describe('SVD', () => {
        test('computes singular values for a 2x2 matrix', () => {
            const A = [[3, 0], [0, 2]];
            const { U, S, V } = svd(A, 50);

            // Singular values should be close to 3 and 2
            expect(S.length).toBeGreaterThan(0);
            expect(Math.max(...S)).toBeCloseTo(3, 1);
        });

        test('decomposes a 3x3 matrix', () => {
            const A = [[1, 0, 0], [0, 2, 0], [0, 0, 3]];
            const { S } = svd(A, 50);

            // For diagonal matrix, singular values should be absolute values of diagonal
            expect(S.length).toBeGreaterThan(0);
        });
    });
});

describe('Eigenvalues & Eigenvectors', () => {
    describe('Power Iteration', () => {
        test('finds dominant eigenvalue for 2x2 matrix', () => {
            const A = [[2, 0], [0, 1]];
            const { values, vectors } = powerIteration(A, 1, 100);

            expect(values[0]).toBeCloseTo(2, 1);
        });

        test('finds multiple eigenvalues for diagonal matrix', () => {
            const A = [[3, 0, 0], [0, 2, 0], [0, 0, 1]];
            const { values } = powerIteration(A, 3, 100);

            expect(values.length).toBe(3);
        });
    });

    describe('QR Algorithm', () => {
        test('finds eigenvalues for 2x2 matrix', () => {
            const A = [[2, 0], [0, 3]];
            const { values } = qrAlgorithm(A, 100);

            // Eigenvalues should be close to 2 and 3
            const sortedValues = values.sort((a, b) => a - b);
            expect(sortedValues[0]).toBeCloseTo(2, 1);
            expect(sortedValues[1]).toBeCloseTo(3, 1);
        });

        test('finds eigenvalues for symmetric 3x3 matrix', () => {
            const A = [[1, 0, 0], [0, 2, 0], [0, 0, 3]];
            const { values } = qrAlgorithm(A, 100);

            expect(values.length).toBe(3);
        });
    });
});

describe('Matrix Norms', () => {
    const A = [[1, 2], [3, 4]];

    test('Frobenius norm', () => {
        const norm = frobeniusNorm(A);
        // ||A||_F = sqrt(1² + 2² + 3² + 4²) = sqrt(30)
        expect(norm).toBeCloseTo(Math.sqrt(30), 10);
    });

    test('L1 norm (max column sum)', () => {
        const norm = l1Norm(A);
        // Max column sum: max(|1|+|3|, |2|+|4|) = max(4, 6) = 6
        expect(norm).toBe(6);
    });

    test('L2 norm (spectral norm)', () => {
        const norm = l2Norm([[2, 0], [0, 1]]);
        // For diagonal matrix, L2 norm is the largest diagonal element
        expect(norm).toBeCloseTo(2, 0);
    });

    test('Infinity norm (max row sum)', () => {
        const norm = infinityNorm(A);
        // Max row sum: max(|1|+|2|, |3|+|4|) = max(3, 7) = 7
        expect(norm).toBe(7);
    });

    test('all norms are positive', () => {
        expect(frobeniusNorm(A)).toBeGreaterThan(0);
        expect(l1Norm(A)).toBeGreaterThan(0);
        expect(infinityNorm(A)).toBeGreaterThan(0);
    });
});

describe('Rank & Nullspace', () => {
    describe('Rank', () => {
        test('full rank square matrix', () => {
            const A = [[1, 0], [0, 1]];
            expect(rank(A)).toBe(2);
        });

        test('rank-deficient square matrix', () => {
            const A = [[1, 2], [2, 4]];
            expect(rank(A)).toBe(1);
        });

        test('rectangular matrix', () => {
            const A = [[1, 2, 3], [4, 5, 6]];
            expect(rank(A)).toBe(2);
        });

        test('zero matrix', () => {
            const A = [[0, 0], [0, 0]];
            expect(rank(A)).toBe(0);
        });
    });

    describe('Nullspace', () => {
        test('trivial nullspace for full rank matrix', () => {
            const A = [[1, 0], [0, 1]];
            const N = nullspace(A);
            expect(N[0].length).toBe(0);
        });

        test('non-trivial nullspace for rank-deficient matrix', () => {
            const A = [[1, 2], [2, 4]];
            const N = nullspace(A);
            expect(N[0].length).toBeGreaterThan(0);

            // Verify A*N = 0
            const AN = multiply(A, N);
            for (let i = 0; i < AN.length; i++) {
                for (let j = 0; j < AN[0].length; j++) {
                    expect(Math.abs(AN[i][j])).toBeLessThan(1e-9);
                }
            }
        });

        test('nullspace of zero matrix', () => {
            const A = [[0, 0, 0], [0, 0, 0]];
            const N = nullspace(A);
            expect(N[0].length).toBe(3); // Full nullspace
        });
    });
});

describe('Matrix Functions', () => {
    describe('Matrix Exponential', () => {
        test('exponential of zero matrix is identity', () => {
            const A = [[0, 0], [0, 0]];
            const expA = matrixExp(A);
            const I = identity(2);

            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(expA[i][j]).toBeCloseTo(I[i][j], 5);
                }
            }
        });

        test('exponential of diagonal matrix', () => {
            const A = [[1, 0], [0, 2]];
            const expA = matrixExp(A);

            // exp([[a,0],[0,b]]) = [[e^a, 0], [0, e^b]]
            expect(expA[0][0]).toBeCloseTo(Math.exp(1), 5);
            expect(expA[0][1]).toBeCloseTo(0, 5);
            expect(expA[1][0]).toBeCloseTo(0, 5);
            expect(expA[1][1]).toBeCloseTo(Math.exp(2), 5);
        });
    });

    describe('Matrix Logarithm', () => {
        test('logarithm of identity is zero matrix', () => {
            const I = identity(2);
            const logI = matrixLog(I);

            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(Math.abs(logI[i][j])).toBeLessThan(1e-5);
                }
            }
        });
    });

    describe('Matrix Square Root', () => {
        test('square root of identity is identity', () => {
            const I = identity(2);
            const sqrtI = matrixSqrt(I);

            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(sqrtI[i][j]).toBeCloseTo(I[i][j], 5);
                }
            }
        });

        test('square root squared gives original matrix', () => {
            const A = [[4, 0], [0, 9]];
            const sqrtA = matrixSqrt(A);
            const sqrtA_squared = multiply(sqrtA, sqrtA);

            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(sqrtA_squared[i][j]).toBeCloseTo(A[i][j], 3);
                }
            }
        });
    });

    describe('Matrix Power', () => {
        test('matrix to power 0 is identity', () => {
            const A = [[2, 3], [4, 5]];
            const A0 = matrixPower(A, 0);
            const I = identity(2);

            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(A0[i][j]).toBeCloseTo(I[i][j], 10);
                }
            }
        });

        test('matrix to power 1 is itself', () => {
            const A = [[2, 3], [4, 5]];
            const A1 = matrixPower(A, 1);

            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(A1[i][j]).toBeCloseTo(A[i][j], 10);
                }
            }
        });

        test('matrix to power 2', () => {
            const A = [[2, 0], [0, 3]];
            const A2 = matrixPower(A, 2);

            // [[2,0],[0,3]]² = [[4,0],[0,9]]
            expect(A2[0][0]).toBeCloseTo(4, 10);
            expect(A2[0][1]).toBeCloseTo(0, 10);
            expect(A2[1][0]).toBeCloseTo(0, 10);
            expect(A2[1][1]).toBeCloseTo(9, 10);
        });

        test('matrix to power 3', () => {
            const A = [[2, 0], [0, 3]];
            const A3 = matrixPower(A, 3);

            // [[2,0],[0,3]]³ = [[8,0],[0,27]]
            expect(A3[0][0]).toBeCloseTo(8, 10);
            expect(A3[1][1]).toBeCloseTo(27, 10);
        });
    });
});