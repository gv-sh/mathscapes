// Matrix operations
export * from './matrix';

// Core numeric tower
export { Rational } from './core/rational';
export { Complex } from './core/complex';
export { Quaternion } from './core/quaternion';
export { Interval, BoundaryType } from './core/interval';
export { MathSet } from './core/set';

// Linear algebra - vectors and distance metrics
export { Vector } from './linalg/vector';
export * as distance from './linalg/distance';

// Symbolic mathematics
export * from './symbolic';