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

// Computational Geometry
export { Point, Line, Segment, Polygon } from './geometry';

// Symbolic mathematics
export * from './symbolic';

// Noise functions
export * as noise from './noise';

// Interpolation functions
export * as interpolate from './interpolate';

// Numerical methods
export * as numeric from './numeric';

// Statistics
export * as stats from './stats';

// Machine Learning operations
export * as ml from './ml';