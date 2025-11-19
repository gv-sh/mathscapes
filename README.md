# mathscapes

[![Node.js Package](https://github.com/gv-sh/mathscapes/actions/workflows/.npm-publish.yml/badge.svg)](https://github.com/gv-sh/mathscapes/actions/workflows/.npm-publish.yml)

A comprehensive mathematical library for JavaScript/TypeScript with focus on numerical computing, linear algebra, and exact arithmetic.

## Features

### Core Numeric Tower (Week 1) ✅
- **Rational Numbers**: Exact fraction arithmetic
- **Complex Numbers**: First-class support for complex arithmetic
- **Quaternions**: For 3D rotations and spatial computations

### Advanced Linear Algebra (Week 2) ✅
- **Matrix Decompositions**:
  - LU Decomposition (with partial pivoting)
  - QR Decomposition (Gram-Schmidt)
  - Cholesky Decomposition (for symmetric positive-definite matrices)
  - Singular Value Decomposition (SVD)

- **Eigenvalue Algorithms**:
  - Power Iteration (for dominant eigenvalues)
  - QR Algorithm (for all eigenvalues)

- **Matrix Norms**:
  - Frobenius norm
  - L1 norm (maximum column sum)
  - L2 norm (spectral norm)
  - Infinity norm (maximum row sum)

- **Rank & Nullspace**:
  - Matrix rank computation
  - Nullspace basis computation

- **Matrix Functions**:
  - Matrix exponential (exp)
  - Matrix logarithm (log)
  - Matrix square root (sqrt)
  - Matrix power (arbitrary powers)

### Basic Matrix Operations
- Addition, subtraction, multiplication
- Transpose, inverse, identity
- Scaling, cloning, reshaping

## Installation

```bash
npm install mathscapes
```

## Usage

### Numeric Tower

```typescript
import { Rational, Complex, Quaternion } from 'mathscapes';

// Rational numbers (exact fractions)
const r1 = new Rational(1, 3);
const r2 = new Rational(1, 6);
const sum = r1.add(r2); // 1/2

// Complex numbers
const c1 = new Complex(3, 4);
const c2 = new Complex(1, 2);
const product = c1.multiply(c2);

// Quaternions
const q = Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2);
```

### Matrix Decompositions

```typescript
import { luDecomposition, qrDecomposition, choleskyDecomposition, svd } from 'mathscapes';

// LU Decomposition
const A = [[2, 1], [1, 1]];
const { L, U, P } = luDecomposition(A);

// QR Decomposition
const { Q, R } = qrDecomposition(A);

// Cholesky Decomposition (for symmetric positive-definite matrices)
const symMatrix = [[4, 12, -16], [12, 37, -43], [-16, -43, 98]];
const L = choleskyDecomposition(symMatrix);

// SVD
const { U, S, V } = svd(A);
```

### Eigenvalues & Eigenvectors

```typescript
import { powerIteration, qrAlgorithm } from 'mathscapes';

const A = [[2, 1], [1, 2]];

// Power iteration (fastest, for dominant eigenvalue)
const { values, vectors } = powerIteration(A, 1);

// QR Algorithm (more accurate, for all eigenvalues)
const result = qrAlgorithm(A);
```

### Matrix Norms

```typescript
import { frobeniusNorm, l1Norm, l2Norm, infinityNorm } from 'mathscapes';

const A = [[1, 2], [3, 4]];

const fNorm = frobeniusNorm(A);    // √30
const l1 = l1Norm(A);              // 6
const l2 = l2Norm(A);              // largest singular value
const lInf = infinityNorm(A);      // 7
```

### Rank & Nullspace

```typescript
import { rank, nullspace } from 'mathscapes';

const A = [[1, 2], [2, 4]];

const r = rank(A);           // 1
const N = nullspace(A);      // basis for nullspace
```

### Matrix Functions

```typescript
import { matrixExp, matrixLog, matrixSqrt, matrixPower } from 'mathscapes';

const A = [[1, 0], [0, 2]];

const expA = matrixExp(A);      // e^A
const logA = matrixLog(A);      // log(A)
const sqrtA = matrixSqrt(A);    // A^(1/2)
const A3 = matrixPower(A, 3);   // A^3
```

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

## Roadmap

This library is being developed following a comprehensive 6-month roadmap. See [ROADMAP.md](./ROADMAP.md) for details.

- ✅ Week 1: Numeric Tower (Rational, Complex, Quaternion)
- ✅ Week 2: Advanced Matrix Operations
- 🚧 Week 3: Vector Operations & Advanced Types
- 📋 Week 4: Quality & Documentation
- 📋 Month 2: Symbolic Mathematics
- 📋 Month 3: Computational Geometry
- 📋 Month 4: Numerical Methods
- 📋 Month 5: Statistics & ML Operations
- 📋 Month 6: Graph Theory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.