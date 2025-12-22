# Mathscapes Library Agents

This directory contains specialized Claude sub-agent prompts for developing and polishing the Mathscapes mathematical library.

## Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| **Code Reviewer** | `code-reviewer.md` | Reviews code for quality, TypeScript best practices, and mathematical implementation correctness |
| **Test Coverage** | `test-coverage.md` | Analyzes test coverage and generates comprehensive test cases |
| **Documentation** | `documentation.md` | Creates and improves JSDoc documentation and usage examples |
| **Performance** | `performance.md` | Analyzes performance characteristics and suggests optimizations |
| **Math Correctness** | `math-correctness.md` | Verifies mathematical accuracy and numerical stability |
| **API Consistency** | `api-consistency.md` | Ensures public API follows consistent patterns and conventions |

## How to Use

These agents are invoked through the corresponding slash commands in `.claude/commands/`:

```
/review [file_or_module]      - Code review
/test-coverage [file_or_module] - Test coverage analysis
/docs [file_or_module]        - Documentation generation
/perf [file_or_module]        - Performance analysis
/math-check [file_or_module]  - Mathematical correctness
/api-check [file_or_module]   - API consistency check
/polish [file_or_module]      - Run all checks
/implement [feature]          - Guide new feature implementation
/fix-issue [description]      - Guide issue resolution
```

## Agent Design Philosophy

Each agent is designed with:

1. **Domain Expertise**: Deep knowledge of their specific area
2. **Mathscapes Context**: Understanding of the library's patterns and conventions
3. **Structured Output**: Consistent, actionable report formats
4. **Code Generation**: Ready-to-use code snippets when applicable

## Extending Agents

To add a new agent:

1. Create a new `.md` file in this directory
2. Follow the existing agent prompt structure:
   - Header with agent name and purpose
   - Expertise section
   - Detailed guidelines
   - Output format specification
3. Create a corresponding slash command in `.claude/commands/`
4. Update this README

## Module Coverage

The agents understand all Mathscapes modules:

- **core**: Rational, Complex, Quaternion, Interval, MathSet
- **linalg**: Vector, distance metrics
- **symbolic**: Expressions, parsing, differentiation, integration, simplification
- **numeric**: Root finding, optimization, numerical integration, ODE/PDE solvers
- **geometry**: 2D/3D primitives, Delaunay, Voronoi, spatial trees
- **ml**: Activations, losses, optimizers, convolutions, attention
- **graph**: Traversal, shortest path, MST, centrality, flow, matching
- **stats**: Descriptive, distributions, hypothesis tests, time series
- **interpolate**: Linear, cubic, Bezier, parametric, easing
- **noise**: Perlin, Simplex, Worley, fractal
- **number-theory**: Primes, GCD, modular arithmetic, factorization
- **special**: Gamma, error function, Bessel, hypergeometric
