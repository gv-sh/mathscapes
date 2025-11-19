/**
 * Numerical Methods Module
 *
 * Comprehensive suite of numerical algorithms for scientific computing.
 * Includes root finding, optimization, numerical integration, differentiation,
 * and differential equation solvers.
 *
 * This module provides production-grade implementations of classical numerical
 * methods used in engineering, physics, economics, and computational science.
 */

// Root finding algorithms
export {
    bisection,
    newtonRaphson,
    secant,
    brent,
    polynomialRoots,
    polynomialRealRoots,
} from './roots';

export type { RootOptions, RootResult, PolynomialRootOptions } from './roots';

// Univariate optimization algorithms
export {
    goldenSection,
    brentOptimize,
    gradientDescent,
    newtonOptimize,
    maximize,
} from './optimize';

export type { OptimizeOptions, OptimizeResult } from './optimize';

// Multivariate optimization algorithms
export {
    gradientDescentMultivariate,
    conjugateGradient,
    bfgs,
    lbfgs,
    newtonMultivariate,
    nelderMead,
    powell,
    simulatedAnnealing,
    geneticAlgorithm,
} from './multivariate-optimize';

export type {
    Vector,
    Matrix,
    ObjectiveFunction,
    GradientFunction,
    HessianFunction,
    ConstraintFunction,
    MultivariateOptimizeOptions,
    MultivariateOptimizeResult,
} from './multivariate-optimize';

// Constrained optimization algorithms
export {
    lagrangeMultipliers,
    penaltyMethod,
    augmentedLagrangian,
    simplexMethod,
    projectedGradientDescent,
} from './constrained-optimize';

export type {
    ConstrainedOptimizeOptions,
    ConstrainedOptimizeResult,
} from './constrained-optimize';
