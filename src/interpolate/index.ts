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
