/**
 * Special Functions Module
 *
 * This module provides implementations of important special functions:
 * - Gamma and Beta functions (complete and incomplete variants)
 * - Error functions (erf, erfc, inverse, Dawson, Faddeeva)
 * - Bessel functions (J, Y, I, K, spherical)
 * - Hypergeometric functions (₁F₁, ₂F₁, ₚFᵩ, Whittaker)
 *
 * These functions appear frequently in mathematics, physics, statistics,
 * and engineering applications.
 */

// Gamma and Beta functions
export {
  lnGamma,
  gamma,
  lowerIncompleteGamma,
  upperIncompleteGamma,
  regularizedGammaP,
  regularizedGammaQ,
  digamma,
  beta,
  lnBeta,
  incompleteBeta,
  regularizedBeta,
  multivariateGamma,
} from './gamma';

// Error functions
export {
  erf,
  erfc,
  erfcx,
  erfInv,
  erfcInv,
  erfi,
  dawson,
  faddeeva,
} from './erf';

// Bessel functions
export {
  besselJ0,
  besselJ1,
  besselJn,
  besselY0,
  besselY1,
  besselI0,
  besselI1,
  besselK0,
  besselK1,
  sphericalBesselJ,
  sphericalBesselY,
} from './bessel';

// Hypergeometric functions
export {
  pochhammer,
  hypergeometric1F1,
  hypergeometric2F1,
  hypergeometricPFQ,
  hypergeometricU,
  regularizedHypergeometric1F1,
  whittakerM,
  whittakerW,
} from './hypergeometric';
