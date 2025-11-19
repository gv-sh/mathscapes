/**
 * Symbolic Mathematics Module
 *
 * Provides computer algebra system capabilities including:
 * - Expression trees (AST)
 * - Expression parsing
 * - Polynomial operations
 * - Symbolic computation
 */

// Export expression classes
export {
    Expression,
    Constant,
    Variable,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Negate
} from './expression';

// Export function classes
export {
    Sin,
    Cos,
    Tan,
    Asin,
    Acos,
    Atan,
    Exp,
    Ln,
    Log,
    Sqrt,
    Abs
} from './functions';

// Export parser
export {
    parse,
    parseAndSimplify
} from './parser';

// Export polynomial
export {
    Polynomial,
    fromRoots,
    gcd as polynomialGcd
} from './polynomial';

// Export differentiation
export {
    differentiate,
    nthDerivative,
    partialDerivatives,
    gradient,
    jacobian,
    hessian,
    directionalDerivative
} from './differentiate';

// Export automatic differentiation
export {
    Dual,
    Variable as ADVariable,
    forwardMode,
    forwardModeGradient,
    reverseMode,
    reverseModeGradient
} from './autodiff';

// Export integration
export {
    integrate,
    definiteIntegral,
    numericalIntegrate
} from './integrate';

// Export simplification
export {
    algebraicSimplify,
    collectLikeTerms,
    expand,
    factor,
    simplifyTrig,
    simplifyLogExp,
    rationalize
} from './simplify';

// Export expression manipulation
export {
    substitute,
    substituteMultiple,
    solve,
    partialFractions,
    isolate
} from './manipulate';

// Export equation solving
export {
    solveLinear,
    solveQuadratic,
    solveCubic,
    solvePolynomial,
    solvePolynomialNumeric,
    solveLinearSystem
} from './solve';

// Export symbolic limits
export {
    limit,
    limitAtInfinity,
    lhopital,
    limitFromLeft,
    limitFromRight,
    limitExists,
    LimitDirection
} from './limits';

// Export series expansion
export {
    taylorSeries,
    maclaurinSeries,
    powerSeriesCoefficients,
    addPowerSeries,
    multiplyPowerSeries,
    composePowerSeries,
    powerSeriesToExpression,
    sinSeries,
    cosSeries,
    expSeries,
    lnOnePlusSeries,
    binomialSeries,
    geometricSeries,
    differentiatePowerSeries,
    integratePowerSeries,
    evaluatePowerSeries,
    radiusOfConvergence
} from './series';
