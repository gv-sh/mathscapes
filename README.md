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

### Symbolic Mathematics (Week 1) ✅
- **Expression System**:
  - Abstract Syntax Tree (AST) representation
  - Expression parsing from strings
  - LaTeX and Unicode output formatting
  - Expression evaluation and simplification
  - Pattern matching and equality checking

- **Mathematical Functions**:
  - Trigonometric: sin, cos, tan, asin, acos, atan
  - Exponential & Logarithmic: exp, ln, log
  - Special: sqrt, abs

- **Polynomial Class**:
  - Polynomial arithmetic (add, subtract, multiply, divide)
  - Evaluation using Horner's method
  - Derivative and integral computation
  - Root finding (quadratic formula, numerical methods)
  - GCD computation

### Computational Geometry & Curves (Month 3) ✅
- **Parametric Curves**:
  - Arc length calculation (2D and 3D)
  - Point at distance along curve
  - Curvature and torsion computation
  - Tangent and normal vectors

- **Easing Functions**:
  - Complete Penner's easing collection
  - Quadratic, cubic, quartic, quintic easings
  - Sine, exponential, circular easings
  - Back, elastic, bounce, anticipate easings
  - Custom Bezier easing (CSS cubic-bezier)
  - Steps function

- **Curve Fitting**:
  - Polynomial regression (any degree)
  - Linear regression with R² and RMSE
  - Weighted polynomial regression
  - Natural cubic spline interpolation
  - Least squares fitting with custom basis functions

### Basic Matrix Operations
- Addition, subtraction, multiplication
- Transpose, inverse, identity
- Scaling, cloning, reshaping

## Installation

```bash
npm install mathscapes
```

## Usage

### Symbolic Mathematics

```typescript
import { parse, Polynomial, fromRoots } from 'mathscapes';

// Parse and evaluate expressions
const expr = parse("x^2 + 2*x + 1");
console.log(expr.toString());        // "(x^2 + (2 * x) + 1)"
console.log(expr.toLatex());         // "x^{2} + 2 \cdot x + 1"
console.log(expr.toUnicode());       // "x² + 2·x + 1"

const vars = new Map([["x", 3]]);
console.log(expr.evaluate(vars));    // 16

// Simplify expressions
const simplified = parse("2 + 3 * 4").simplify();
console.log(simplified.toString());  // "14"

// Work with polynomials
const p = new Polynomial([1, 2, 1]);  // x^2 + 2x + 1
console.log(p.toString());            // "x^2 + 2*x + 1"
console.log(p.evaluate(2));           // 9
console.log(p.derivative().toString()); // "2*x + 2"

// Find roots
const roots = p.roots();
console.log(roots);                   // [-1] (double root)

// Create polynomial from roots
const q = fromRoots([1, 2, 3]);       // (x-1)(x-2)(x-3)
console.log(q.toString());            // "x^3 - 6*x^2 + 11*x - 6"
```

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

### Parametric Curves

```typescript
import {
  arcLength2D,
  curvature2D,
  pointAtDistance2D,
  tangent2D
} from 'mathscapes';

// Define a circle
const circle = (t: number) => ({
  x: Math.cos(t),
  y: Math.sin(t)
});

// Calculate arc length
const circumference = arcLength2D(circle, 0, 2 * Math.PI); // ≈ 6.28

// Get curvature
const k = curvature2D(circle, 0); // 1 for unit circle

// Get point at distance
const point = pointAtDistance2D(circle, 0, 2 * Math.PI, Math.PI);

// Get tangent vector
const tangent = tangent2D(circle, Math.PI / 4);
```

### Easing Functions

```typescript
import { interpolate } from 'mathscapes';

// Use built-in easings
const eased = interpolate.easing.easeInOutCubic(0.5);

// Elastic bounce effect
const bounce = interpolate.easing.easeOutElastic(0.7);

// Custom Bezier easing (like CSS)
const custom = interpolate.easing.bezierEasing(0.25, 0.1, 0.25, 1);
const value = custom(0.5);

// Steps (like CSS steps())
const stepped = interpolate.easing.steps(5);
```

### Curve Fitting

```typescript
import {
  polynomialRegression,
  linearRegression,
  naturalCubicSpline
} from 'mathscapes';

// Linear regression
const data = [
  { x: 0, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 5 }
];
const fit = linearRegression(data);
console.log(fit.slope);     // 2
console.log(fit.intercept); // 1
console.log(fit.rSquared);  // 1.0 (perfect fit)

// Polynomial regression (quadratic)
const quadFit = polynomialRegression(data, 2);
const interpolated = quadFit.evaluate(1.5);

// Cubic spline interpolation
const spline = naturalCubicSpline(data);
const smooth = spline(1.5); // Smooth interpolation
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
- ✅ Week 3: Vector Operations & Advanced Types
- ✅ Week 4: Quality & Documentation
- 🚧 Month 2 Week 1: Symbolic Mathematics (Expression System & Parsing)
- 📋 Month 3: Computational Geometry
- 📋 Month 4: Numerical Methods
- 📋 Month 5: Statistics & ML Operations
- 📋 Month 6: Graph Theory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.