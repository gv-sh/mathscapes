/**
 * Number Theory Module
 *
 * This module provides comprehensive number theory functionality:
 * - Prime testing and generation (trial division, Sieve of Eratosthenes, Miller-Rabin)
 * - GCD, LCM, and Extended Euclidean algorithm
 * - Modular arithmetic (modular exponentiation, inverse, Chinese Remainder Theorem)
 * - Integer factorization (trial division, Pollard's rho)
 * - Combinatorics (permutations, combinations, Stirling numbers, etc.)
 * - Special integer sequences (Fibonacci, Catalan, factorial, etc.)
 */

// Prime number operations
export {
  isPrime,
  sieveOfEratosthenes,
  millerRabin,
  millerRabinDeterministic,
  generatePrimes,
  nextPrime,
  prevPrime,
  primeCount,
  nthPrime,
  twinPrimes,
} from './primes';

// GCD and LCM operations
export {
  gcd,
  gcdMultiple,
  lcm,
  lcmMultiple,
  extendedGCD,
  areCoprime,
  eulerTotient,
  solveDiophantine,
  divisors,
  divisorCount,
  divisorSum,
  isPerfect,
  ExtendedGCDResult,
} from './gcd';

// Modular arithmetic
export {
  modPow,
  modInverse,
  mod,
  modAdd,
  modSub,
  modMul,
  modDiv,
  chineseRemainder,
  isQuadraticResidue,
  legendreSymbol,
  modSqrt,
  discreteLog,
  CRTResult,
} from './modular';

// Factorization
export {
  trialDivision,
  pollardsRho,
  factorize,
  primeFactorization,
  fromPrimeFactorization,
  smallestPrimeFactor,
  largestPrimeFactor,
  distinctPrimeFactors,
  totalPrimeFactors,
  isSquareFree,
  isPrimePower,
  radical,
  mobius,
  PrimeFactorization,
} from './factorization';

// Combinatorics
export {
  factorial,
  permutations,
  combinations,
  binomial,
  multinomial,
  combinationsWithRepetition,
  permutationsWithRepetition,
  derangements,
  stirlingSecond,
  stirlingFirst,
  bell,
  catalan,
  partition,
  generatePermutations,
  generateCombinations,
} from './combinatorics';

// Integer sequences
export {
  fibonacci,
  fibonacciSequence,
  fibonacciFast,
  lucas,
  tribonacci,
  pell,
  doubleFactorial,
  triangular,
  square,
  pentagonal,
  hexagonal,
  isPerfectSquare,
  isFibonacci,
  sumOfN,
  sumOfSquares,
  sumOfCubes,
} from './sequences';

// Note: factorial and catalan are exported from both combinatorics and sequences
// They are identical implementations, so importing from either is fine
