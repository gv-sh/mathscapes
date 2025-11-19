#!/usr/bin/env node

/**
 * Mathscapes Benchmark Suite
 *
 * Runs performance benchmarks for various mathematical operations
 */

const { performance } = require('perf_hooks');
const path = require('path');

// Import compiled modules
const Matrix = require('../src/matrix').Matrix;
const Vector = require('../src/linalg/vector').Vector;
const Rational = require('../src/core/rational').Rational;
const Complex = require('../src/core/complex').Complex;
const Quaternion = require('../src/core/quaternion').Quaternion;

// Benchmark utilities
function benchmark(name, fn, iterations = 10000) {
  // Warm-up
  for (let i = 0; i < 100; i++) fn();

  // Actual benchmark
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();

  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  const opsPerSec = 1000 / avgTime;

  return {
    name,
    totalTime: totalTime.toFixed(2),
    avgTime: avgTime.toFixed(6),
    opsPerSec: opsPerSec.toFixed(0),
    iterations
  };
}

function printResults(results) {
  console.log('\n' + '='.repeat(80));
  console.log(results.category);
  console.log('='.repeat(80));
  console.log(
    'Operation'.padEnd(40) +
    'Avg Time'.padEnd(15) +
    'Ops/sec'.padEnd(15) +
    'Iterations'
  );
  console.log('-'.repeat(80));

  results.benchmarks.forEach(result => {
    console.log(
      result.name.padEnd(40) +
      (result.avgTime + ' ms').padEnd(15) +
      result.opsPerSec.padEnd(15) +
      result.iterations
    );
  });
  console.log('');
}

// Matrix Benchmarks
function runMatrixBenchmarks() {
  const results = {
    category: 'Matrix Operations',
    benchmarks: []
  };

  // Small matrices (3x3)
  const m3a = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  const m3b = new Matrix([[9, 8, 7], [6, 5, 4], [3, 2, 1]]);

  results.benchmarks.push(benchmark('Matrix 3x3 - Addition', () => {
    m3a.add(m3b);
  }));

  results.benchmarks.push(benchmark('Matrix 3x3 - Multiplication', () => {
    m3a.multiply(m3b);
  }));

  results.benchmarks.push(benchmark('Matrix 3x3 - Transpose', () => {
    m3a.transpose();
  }));

  results.benchmarks.push(benchmark('Matrix 3x3 - Determinant', () => {
    m3a.determinant();
  }, 5000));

  // Medium matrices (10x10)
  const m10a = Matrix.random(10, 10);
  const m10b = Matrix.random(10, 10);

  results.benchmarks.push(benchmark('Matrix 10x10 - Addition', () => {
    m10a.add(m10b);
  }, 5000));

  results.benchmarks.push(benchmark('Matrix 10x10 - Multiplication', () => {
    m10a.multiply(m10b);
  }, 1000));

  results.benchmarks.push(benchmark('Matrix 10x10 - Transpose', () => {
    m10a.transpose();
  }, 5000));

  results.benchmarks.push(benchmark('Matrix 10x10 - Inverse', () => {
    m10a.inverse();
  }, 500));

  printResults(results);
}

// Vector Benchmarks
function runVectorBenchmarks() {
  const results = {
    category: 'Vector Operations',
    benchmarks: []
  };

  const v1 = new Vector([1, 2, 3]);
  const v2 = new Vector([4, 5, 6]);

  results.benchmarks.push(benchmark('Vector 3D - Addition', () => {
    v1.add(v2);
  }));

  results.benchmarks.push(benchmark('Vector 3D - Dot Product', () => {
    v1.dot(v2);
  }));

  results.benchmarks.push(benchmark('Vector 3D - Cross Product', () => {
    v1.cross(v2);
  }));

  results.benchmarks.push(benchmark('Vector 3D - Normalize', () => {
    v1.normalize();
  }));

  results.benchmarks.push(benchmark('Vector 3D - Magnitude', () => {
    v1.magnitude();
  }));

  const v100_1 = Vector.random(100);
  const v100_2 = Vector.random(100);

  results.benchmarks.push(benchmark('Vector 100D - Addition', () => {
    v100_1.add(v100_2);
  }, 5000));

  results.benchmarks.push(benchmark('Vector 100D - Dot Product', () => {
    v100_1.dot(v100_2);
  }, 5000));

  printResults(results);
}

// Rational Number Benchmarks
function runRationalBenchmarks() {
  const results = {
    category: 'Rational Number Operations',
    benchmarks: []
  };

  const r1 = new Rational(1, 3);
  const r2 = new Rational(2, 5);

  results.benchmarks.push(benchmark('Rational - Addition', () => {
    r1.add(r2);
  }));

  results.benchmarks.push(benchmark('Rational - Multiplication', () => {
    r1.multiply(r2);
  }));

  results.benchmarks.push(benchmark('Rational - Division', () => {
    r1.divide(r2);
  }));

  results.benchmarks.push(benchmark('Rational - Simplification', () => {
    new Rational(1000, 2000);
  }));

  printResults(results);
}

// Complex Number Benchmarks
function runComplexBenchmarks() {
  const results = {
    category: 'Complex Number Operations',
    benchmarks: []
  };

  const c1 = new Complex(3, 4);
  const c2 = new Complex(1, 2);

  results.benchmarks.push(benchmark('Complex - Addition', () => {
    c1.add(c2);
  }));

  results.benchmarks.push(benchmark('Complex - Multiplication', () => {
    c1.multiply(c2);
  }));

  results.benchmarks.push(benchmark('Complex - Division', () => {
    c1.divide(c2);
  }));

  results.benchmarks.push(benchmark('Complex - Magnitude', () => {
    c1.magnitude();
  }));

  results.benchmarks.push(benchmark('Complex - Polar Conversion', () => {
    c1.toPolar();
  }));

  printResults(results);
}

// Quaternion Benchmarks
function runQuaternionBenchmarks() {
  const results = {
    category: 'Quaternion Operations',
    benchmarks: []
  };

  const q1 = new Quaternion(1, 0, 0, 0);
  const q2 = new Quaternion(0.707, 0, 0.707, 0);

  results.benchmarks.push(benchmark('Quaternion - Multiplication', () => {
    q1.multiply(q2);
  }));

  results.benchmarks.push(benchmark('Quaternion - Normalize', () => {
    q1.normalize();
  }));

  results.benchmarks.push(benchmark('Quaternion - Inverse', () => {
    q1.inverse();
  }));

  results.benchmarks.push(benchmark('Quaternion - SLERP', () => {
    q1.slerp(q2, 0.5);
  }));

  results.benchmarks.push(benchmark('Quaternion - Rotate Vector', () => {
    q1.rotateVector([1, 0, 0]);
  }));

  printResults(results);
}

// Main execution
console.log('\n' + '█'.repeat(80));
console.log('█' + ' '.repeat(78) + '█');
console.log('█' + '  MATHSCAPES PERFORMANCE BENCHMARKS'.padEnd(78) + '█');
console.log('█' + ' '.repeat(78) + '█');
console.log('█'.repeat(80));

try {
  runMatrixBenchmarks();
  runVectorBenchmarks();
  runRationalBenchmarks();
  runComplexBenchmarks();
  runQuaternionBenchmarks();

  console.log('='.repeat(80));
  console.log('Benchmarks completed successfully!');
  console.log('='.repeat(80) + '\n');
} catch (error) {
  console.error('Error running benchmarks:', error.message);
  console.error('Make sure to build the project first: npm run build');
  process.exit(1);
}
