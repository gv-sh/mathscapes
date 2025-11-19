/**
 * Interpolation Module
 *
 * Comprehensive collection of interpolation functions for smooth transitions,
 * curve generation, and data resampling.
 */

// Linear interpolation
export {
    lerp,
    lerpClamped,
    inverseLerp,
    remap,
    bilinear,
    bilinearArray,
    trilinear,
    trilinearArray,
    smoothstep,
    smootherstep,
    cosineInterp,
    multiLerp
} from './linear';

// Cubic interpolation
export {
    hermite,
    catmullRom,
    cardinal,
    cubicSpline,
    monotoneCubic,
    bicubic,
    tricubic,
    cubicCoefficients,
    evaluateCubic
} from './cubic';

// Bezier curves
export {
    Point2D,
    Point3D,
    bernstein,
    linearBezier,
    quadraticBezier,
    cubicBezier,
    bezier,
    quadraticBezier2D,
    cubicBezier2D,
    bezier2D,
    cubicBezier3D,
    bezier3D,
    cubicBezierDerivative,
    cubicBezierSecondDerivative,
    splitCubicBezier,
    cubicBezierLength,
    cubicBezierParameterAtLength,
    elevateBezierDegree
} from './bezier';

// Parametric curves
export {
    ParametricCurve2D,
    ParametricCurve3D,
    arcLength2D,
    arcLength3D,
    parameterAtLength2D,
    parameterAtLength3D,
    pointAtDistance2D,
    pointAtDistance3D,
    curvature2D,
    signedCurvature2D,
    curvature3D,
    torsion3D,
    tangent2D,
    tangent3D,
    normal2D
} from './parametric';

// Easing functions
export * as easing from './easing';

// Curve fitting
export {
    PolynomialFit,
    polynomialRegression,
    linearRegression,
    weightedPolynomialRegression,
    naturalCubicSpline,
    leastSquaresFit
} from './fitting';
