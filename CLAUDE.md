# Claude Code Configuration for Mathscapes

This file provides Claude Code with context about the Mathscapes project to enable more effective assistance.

## Project Overview

**Mathscapes** is a comprehensive, pedagogically-focused mathematical library for TypeScript/JavaScript that provides:

- **Numeric Tower**: Rational numbers, Complex numbers, Quaternions, Intervals
- **Symbolic Computation**: Expression parsing, differentiation, integration, simplification
- **Numerical Methods**: Root finding, optimization, numerical integration, ODE/PDE solvers
- **Computational Geometry**: 2D/3D primitives, Delaunay triangulation, Voronoi diagrams
- **Machine Learning**: Activations, losses, optimizers, convolutions, attention
- **Graph Theory**: Traversal, shortest paths, MST, centrality, flow algorithms
- **Statistics**: Distributions, hypothesis tests, time series analysis
- **And more**: Interpolation, noise generation, number theory, special functions

## Key Principles

### Mathematical Rigor
- All implementations must be mathematically correct
- Edge cases (zero, infinity, NaN) must be handled properly
- Numerical stability is critical for floating-point operations

### Pure TypeScript
- Zero production dependencies
- All algorithms implemented from scratch
- Full type safety with strict mode

### Pedagogical Focus
- Code should be readable and educational
- Comments explain mathematical concepts
- Examples demonstrate real-world usage

## Directory Structure

```
src/                    # TypeScript source (97 files)
├── core/               # Numeric types (Rational, Complex, Quaternion)
├── linalg/             # Linear algebra
├── symbolic/           # Computer algebra system
├── numeric/            # Numerical methods
├── geometry/           # Computational geometry
├── ml/                 # Machine learning operations
├── graph/              # Graph algorithms
├── stats/              # Statistics
├── interpolate/        # Interpolation and curves
├── noise/              # Procedural noise
├── number-theory/      # Number theory
├── special/            # Special functions
└── index.ts            # Main exports

tests/                  # Jest test suite (63 files)
benchmarks/             # Performance benchmarks
examples/               # Usage examples
docs/                   # Generated TypeDoc documentation
```

## Development Commands

```bash
npm test              # Run test suite
npm run test:coverage # Tests with coverage report
npm run build         # TypeScript compilation
npm run docs          # Generate TypeDoc documentation
npm run benchmark     # Run performance benchmarks
```

## Quality Targets

- **Test Coverage**: 95%+ line coverage
- **Type Safety**: No `any` types without justification
- **Documentation**: All public APIs have JSDoc comments
- **Performance**: Competitive with math.js and numeric.js

## Available Claude Agents

Specialized sub-agents are configured in `.claude/agents/`:

| Command | Purpose |
|---------|---------|
| `/review` | Code quality review |
| `/test-coverage` | Test coverage analysis |
| `/docs` | Documentation generation |
| `/perf` | Performance analysis |
| `/math-check` | Mathematical correctness |
| `/api-check` | API consistency |
| `/polish` | Comprehensive quality check |
| `/implement` | Guide new feature implementation |
| `/fix-issue` | Guide bug resolution |

## Coding Conventions

### Naming
- Factory methods: `from*`, `create*`
- Conversions: `to*`
- Predicates: `is*`
- Arithmetic: `add`, `subtract`, `multiply`, `divide`

### Parameters
- Primary values first, options object last
- Use options objects for optional parameters
- Document defaults in JSDoc

### Error Handling
- Use descriptive error types (DimensionMismatchError, ConvergenceError)
- Validate inputs at public API boundaries
- Include helpful error messages

### Documentation
- JSDoc for all public APIs
- Include @param, @returns, @throws, @example
- Use Unicode math notation (α, β, Σ, ∫, etc.)

## Testing Guidelines

- Test mathematical properties and identities
- Cover edge cases: 0, ∞, NaN, negative values
- Verify inverse relationships: f(f⁻¹(x)) ≈ x
- Check numerical precision with appropriate tolerances
