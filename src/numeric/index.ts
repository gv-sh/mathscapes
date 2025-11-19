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

// Optimization algorithms
export {
    goldenSection,
    brentOptimize,
    gradientDescent,
    newtonOptimize,
    maximize,
} from './optimize';

export type { OptimizeOptions, OptimizeResult } from './optimize';
