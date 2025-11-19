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

// B-splines and NURBS
export {
    generateClampedKnotVector,
    generateUniformKnotVector,
    basisFunction,
    bspline,
    bspline2D,
    bspline3D,
    nurbs,
    nurbs2D,
    nurbs3D,
    bsplineDerivative
} from './bspline';

// Parametric curves
export {
    ParametricCurve2D,
    ParametricCurve3D,
    arcLength2D,
    arcLength3D,
    parameterAtArcLength2D,
    parameterAtArcLength3D,
    curvature2D,
    curvature3D,
    torsion3D,
    reparameterizeByArcLength2D,
    reparameterizeByArcLength3D,
    sampleUniform2D,
    sampleUniform3D
} from './parametric';

// Easing functions
export {
    EasingFunction,
    linear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    easeInQuart,
    easeOutQuart,
    easeInOutQuart,
    easeInQuint,
    easeOutQuint,
    easeInOutQuint,
    easeInSine,
    easeOutSine,
    easeInOutSine,
    easeInExpo,
    easeOutExpo,
    easeInOutExpo,
    easeInCirc,
    easeOutCirc,
    easeInOutCirc,
    easeInBack,
    easeOutBack,
    easeInOutBack,
    easeInElastic,
    easeOutElastic,
    easeInOutElastic,
    easeInBounce,
    easeOutBounce,
    easeInOutBounce,
    createEasing,
    combineEasing,
    chainEasing,
    applyEasing,
    EASINGS,
    getEasing
} from './easing';

// Curve fitting and regression
export {
    PolynomialCoefficients,
    FitResult,
    polynomialRegression,
    linearRegression,
    quadraticRegression,
    cubicRegression,
    exponentialRegression,
    logarithmicRegression,
    powerLawRegression,
    evaluatePolynomial,
    weightedLeastSquares,
    fitCubicSpline
} from './fitting';
