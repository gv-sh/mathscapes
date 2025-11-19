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
