# Mathscapes Benchmarks

This directory contains performance benchmarks for the Mathscapes library.

## Running Benchmarks

First, make sure the project is built:

```bash
npm run build
```

Then run the benchmarks:

```bash
npm run benchmark
```

## Benchmark Categories

The benchmark suite tests the following categories:

### Matrix Operations
- Addition, multiplication, transpose
- Determinant, inverse
- Various matrix sizes (3x3, 10x10)

### Vector Operations
- Addition, dot product, cross product
- Normalization, magnitude
- Various dimensions (3D, 100D)

### Rational Number Operations
- Basic arithmetic (add, multiply, divide)
- Simplification

### Complex Number Operations
- Arithmetic operations
- Polar conversions
- Magnitude calculation

### Quaternion Operations
- Multiplication, normalization
- SLERP interpolation
- Vector rotation

## Interpreting Results

The benchmark output shows:
- **Avg Time**: Average time per operation in milliseconds
- **Ops/sec**: Number of operations per second
- **Iterations**: Number of times the operation was executed

Higher ops/sec is better. Use these benchmarks to:
1. Track performance regressions
2. Compare with other libraries
3. Identify optimization opportunities

## Adding New Benchmarks

To add a new benchmark:

1. Edit `run.js`
2. Add a new function following the pattern:
   ```javascript
   function runMyBenchmarks() {
     const results = {
       category: 'My Operations',
       benchmarks: []
     };

     results.benchmarks.push(benchmark('My Operation', () => {
       // Operation to benchmark
     }));

     printResults(results);
   }
   ```
3. Call your function in the main execution block

## Performance Tips

Based on benchmark results:

1. **Preallocate when possible**: Creating new objects has overhead
2. **Batch operations**: Minimize function call overhead
3. **Use appropriate data structures**: Choose the right type for your use case
4. **Profile before optimizing**: Use these benchmarks to identify bottlenecks
