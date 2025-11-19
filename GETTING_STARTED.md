# Getting Started with Mathscapes

Welcome to **Mathscapes** - a comprehensive mathematical library for JavaScript/TypeScript with focus on numerical computing, linear algebra, and exact arithmetic.

## Installation

```bash
npm install mathscapes
```

## Quick Start

### Basic Linear Algebra

```typescript
import { Matrix, Vector } from 'mathscapes';

// Create matrices
const A = new Matrix([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]);

const B = new Matrix([
  [9, 8, 7],
  [6, 5, 4],
  [3, 2, 1]
]);

// Matrix operations
const sum = A.add(B);
const product = A.multiply(B);
const transpose = A.transpose();
const determinant = A.determinant();

// Create vectors
const v1 = new Vector([1, 2, 3]);
const v2 = new Vector([4, 5, 6]);

// Vector operations
const dotProduct = v1.dot(v2);           // 32
const crossProduct = v1.cross(v2);       // [-3, 6, -3]
const magnitude = v1.magnitude();        // ~3.74
const normalized = v1.normalize();
```

### Advanced Matrix Operations

```typescript
import { Matrix } from 'mathscapes';

const matrix = new Matrix([
  [4, 2],
  [1, 3]
]);

// Eigenvalues and eigenvectors
const eigenResult = matrix.eigenvalues();
console.log('Eigenvalues:', eigenResult.values);
console.log('Eigenvectors:', eigenResult.vectors);

// Singular Value Decomposition
const svdResult = matrix.svd();
console.log('U:', svdResult.U);
console.log('Σ:', svdResult.S);
console.log('V:', svdResult.V);

// LU Decomposition
const luResult = matrix.luDecomposition();
console.log('L:', luResult.L);
console.log('U:', luResult.U);
console.log('P:', luResult.P);

// Matrix norms
const frobeniusNorm = matrix.frobeniusNorm();
const l1Norm = matrix.norm('l1');
const infNorm = matrix.norm('infinity');
```

### Exact Arithmetic with Rational Numbers

Unlike standard JavaScript numbers, Rational numbers maintain exact precision:

```typescript
import { Rational } from 'mathscapes';

// Create rational numbers
const oneThird = new Rational(1, 3);
const twoFifths = new Rational(2, 5);

// Arithmetic operations
const sum = oneThird.add(twoFifths);      // 11/15
const product = oneThird.multiply(twoFifths);  // 2/15

// No floating-point errors!
console.log(sum.toString());  // "11/15"

// Convert to decimal when needed
console.log(sum.toNumber());  // 0.7333...

// Parse from strings
const fraction = Rational.parse("22/7");  // π approximation
```

### Complex Numbers

```typescript
import { Complex } from 'mathscapes';

// Create complex numbers
const z1 = new Complex(3, 4);  // 3 + 4i
const z2 = Complex.fromPolar(5, Math.PI / 4);  // From polar form

// Arithmetic
const sum = z1.add(z2);
const product = z1.multiply(z2);
const conjugate = z1.conjugate();

// Properties
const magnitude = z1.magnitude();  // |z| = 5
const phase = z1.phase();          // arg(z)

// Convert between forms
const polar = z1.toPolar();
console.log(`${polar.r} ∠ ${polar.theta}`);
```

### Quaternions (3D Rotations)

Perfect for 3D graphics and robotics:

```typescript
import { Quaternion } from 'mathscapes';

// Create quaternion from axis-angle
const axis = [0, 1, 0];  // Y-axis
const angle = Math.PI / 2;  // 90 degrees
const q = Quaternion.fromAxisAngle(axis, angle);

// Rotate a point
const point = [1, 0, 0];
const rotated = q.rotateVector(point);

// Quaternion operations
const q1 = new Quaternion(1, 0, 0, 0);
const q2 = new Quaternion(0.707, 0, 0.707, 0);
const product = q1.multiply(q2);
const inverse = q1.inverse();

// SLERP interpolation for smooth rotations
const interpolated = q1.slerp(q2, 0.5);

// Convert to/from Euler angles
const euler = q.toEuler();
const fromEuler = Quaternion.fromEuler(euler.x, euler.y, euler.z);
```

### Vector Operations

```typescript
import { Vector } from 'mathscapes';

const v1 = new Vector([1, 2, 3]);
const v2 = new Vector([4, 5, 6]);

// Basic operations
const sum = v1.add(v2);
const scaled = v1.scale(2);
const negated = v1.negate();

// Geometric operations
const projection = v1.projectOnto(v2);
const rejection = v1.rejectFrom(v2);
const reflection = v1.reflect(v2);
const angle = v1.angleTo(v2);

// Interpolation
const lerp = v1.lerp(v2, 0.5);  // Linear interpolation
const slerp = v1.slerp(v2, 0.5);  // Spherical interpolation

// Utility methods
const min = v1.min();  // Minimum component
const max = v1.max();  // Maximum component
const componentMin = v1.componentMin(v2);  // Component-wise minimum
```

### Distance Metrics

```typescript
import { distance } from 'mathscapes';

const point1 = [1, 2, 3];
const point2 = [4, 5, 6];

// Various distance metrics
const euclidean = distance.euclidean(point1, point2);
const manhattan = distance.manhattan(point1, point2);
const chebyshev = distance.chebyshev(point1, point2);
const minkowski = distance.minkowski(point1, point2, 3);

// String distances
const string1 = "hello";
const string2 = "hallo";
const hamming = distance.hamming(string1, string2);

// Set distances
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);
const jaccard = distance.jaccard(set1, set2);

// Similarity measures
const vector1 = [1, 2, 3, 4];
const vector2 = [2, 3, 4, 5];
const cosine = distance.cosineSimilarity(vector1, vector2);
```

### Mathematical Sets

```typescript
import { MathSet } from 'mathscapes';

const A = new MathSet([1, 2, 3, 4]);
const B = new MathSet([3, 4, 5, 6]);

// Set operations
const union = A.union(B);              // {1, 2, 3, 4, 5, 6}
const intersection = A.intersection(B); // {3, 4}
const difference = A.difference(B);     // {1, 2}
const symmetricDiff = A.symmetricDifference(B);  // {1, 2, 5, 6}

// Set properties
const cardinality = A.cardinality();    // 4
const isSubset = A.isSubsetOf(B);      // false
const isSuperset = A.isSupersetOf(B);  // false

// Advanced operations
const powerSet = A.powerSet();          // All subsets
const cartesian = A.cartesianProduct(B); // All pairs (a, b)
```

### Interval Arithmetic

```typescript
import { Interval } from 'mathscapes';

// Create intervals
const closed = Interval.closed(1, 5);      // [1, 5]
const open = Interval.open(1, 5);          // (1, 5)
const leftOpen = Interval.leftOpen(1, 5);  // (1, 5]
const rightOpen = Interval.rightOpen(1, 5); // [1, 5)

// Interval operations
const i1 = Interval.closed(1, 5);
const i2 = Interval.closed(3, 8);

const intersection = i1.intersection(i2);  // [3, 5]
const union = i1.union(i2);                // [1, 8]

// Membership testing
console.log(i1.contains(3));      // true
console.log(i1.contains(5));      // true (closed interval)
console.log(open.contains(1));    // false (open at lower bound)

// Interval arithmetic
const sum = i1.add(i2);           // [4, 13]
const product = i1.multiply(i2);  // [3, 40]

// Check relationships
console.log(i1.overlaps(i2));     // true
console.log(i1.isAdjacentTo(i2)); // false
```

## Module Structure

Mathscapes is organized into logical modules:

```typescript
// Core types
import { Rational, Complex, Quaternion, Interval } from 'mathscapes/core';
import { MathSet } from 'mathscapes/core';

// Linear algebra
import { Matrix, Vector } from 'mathscapes/linalg';
import { distance } from 'mathscapes/linalg';
```

## TypeScript Support

Mathscapes is written in TypeScript and provides full type definitions:

```typescript
import { Matrix, Vector } from 'mathscapes';

// Type inference works automatically
const matrix = new Matrix([[1, 2], [3, 4]]);
const det: number = matrix.determinant();

// Generic types for flexible APIs
function processVector<T>(v: Vector): number {
  return v.magnitude();
}
```

## Performance Tips

1. **Reuse objects when possible**: Creating new objects has overhead
   ```typescript
   // Good - reuse matrix
   const A = new Matrix([[1, 2], [3, 4]]);
   for (let i = 0; i < 1000; i++) {
     A.set(0, 0, i);
     // ... do work
   }

   // Avoid - creates 1000 matrices
   for (let i = 0; i < 1000; i++) {
     const A = new Matrix([[i, 2], [3, 4]]);
   }
   ```

2. **Use rational numbers only when exactness is required**: They're slower than floats
   ```typescript
   // Use Rational for exact computation
   const exact = new Rational(1, 3).add(new Rational(1, 6)); // 1/2

   // Use regular numbers for approximate computation
   const approx = 1/3 + 1/6; // 0.5
   ```

3. **Choose the right decomposition**: Different decompositions have different costs
   - LU: O(n³), best for solving systems
   - QR: O(n³), better numerical stability
   - SVD: O(n³), most expensive but most informative

## Examples

Check out more examples in the `/examples` directory:

- `matrix_operations.ts` - Comprehensive matrix examples
- `vector_math.ts` - Vector operations and transformations
- `exact_arithmetic.ts` - Using Rational numbers
- `3d_rotations.ts` - Quaternion-based rotations
- `data_science.ts` - Distance metrics and clustering

## API Documentation

Full API documentation is available at [docs/index.html](docs/index.html) or online at [https://mathscapes.dev/docs](https://mathscapes.dev/docs).

Generate documentation locally:

```bash
npm run docs
```

## Testing

Run the test suite:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

## Benchmarks

Compare performance with other libraries:

```bash
npm run benchmark
```

## What's Next?

- Read the [API Documentation](docs/index.html)
- Explore the [examples](examples/)
- Check out the [Roadmap](ROADMAP.md) for upcoming features
- Contribute on [GitHub](https://github.com/your-repo/mathscapes)

## Getting Help

- **Documentation**: [https://mathscapes.dev/docs](https://mathscapes.dev/docs)
- **Issues**: [GitHub Issues](https://github.com/your-repo/mathscapes/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/mathscapes/discussions)

## License

MIT License - see [LICENSE](LICENSE) for details
