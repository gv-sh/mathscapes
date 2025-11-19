/**
 * Easing Functions Module
 *
 * Comprehensive collection of easing functions for smooth animations and transitions.
 * Based on Robert Penner's easing equations and modern web animation standards.
 *
 * All easing functions take a normalized time parameter t ∈ [0, 1] and return
 * the eased value, typically also in [0, 1] (though some functions may overshoot).
 *
 * Naming convention:
 * - easeIn: Slow start, fast end
 * - easeOut: Fast start, slow end
 * - easeInOut: Slow start and end, fast middle
 *
 * Applications:
 * - UI animations and transitions
 * - Game development
 * - Motion graphics
 * - Data visualization
 *
 * References:
 * - Robert Penner's Easing Functions (2001)
 * - CSS Easing Functions Level 1 (W3C)
 * - "Creating Animations and Interactions with Physical Models" by David DeSandro
 */

/**
 * Linear easing (no easing)
 * @param t - Time parameter [0, 1]
 * @returns Eased value
 */
export function linear(t: number): number {
    return t;
}

// ============================================================================
// QUADRATIC EASING (power of 2)
// ============================================================================

/**
 * Quadratic ease-in: t²
 * Accelerating from zero velocity
 */
export function easeInQuad(t: number): number {
    return t * t;
}

/**
 * Quadratic ease-out: 1 - (1-t)²
 * Decelerating to zero velocity
 */
export function easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
}

/**
 * Quadratic ease-in-out
 * Acceleration until halfway, then deceleration
 */
export function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ============================================================================
// CUBIC EASING (power of 3)
// ============================================================================

/**
 * Cubic ease-in: t³
 */
export function easeInCubic(t: number): number {
    return t * t * t;
}

/**
 * Cubic ease-out: 1 - (1-t)³
 */
export function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Cubic ease-in-out
 */
export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================================================
// QUARTIC EASING (power of 4)
// ============================================================================

/**
 * Quartic ease-in: t⁴
 */
export function easeInQuart(t: number): number {
    return t * t * t * t;
}

/**
 * Quartic ease-out: 1 - (1-t)⁴
 */
export function easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
}

/**
 * Quartic ease-in-out
 */
export function easeInOutQuart(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

// ============================================================================
// QUINTIC EASING (power of 5)
// ============================================================================

/**
 * Quintic ease-in: t⁵
 */
export function easeInQuint(t: number): number {
    return t * t * t * t * t;
}

/**
 * Quintic ease-out: 1 - (1-t)⁵
 */
export function easeOutQuint(t: number): number {
    return 1 - Math.pow(1 - t, 5);
}

/**
 * Quintic ease-in-out
 */
export function easeInOutQuint(t: number): number {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

// ============================================================================
// SINE EASING
// ============================================================================

/**
 * Sine ease-in
 * Smooth acceleration based on sine wave
 */
export function easeInSine(t: number): number {
    return 1 - Math.cos((t * Math.PI) / 2);
}

/**
 * Sine ease-out
 */
export function easeOutSine(t: number): number {
    return Math.sin((t * Math.PI) / 2);
}

/**
 * Sine ease-in-out
 */
export function easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

// ============================================================================
// EXPONENTIAL EASING
// ============================================================================

/**
 * Exponential ease-in: 2^(10(t-1))
 * Very slow start, extremely fast end
 */
export function easeInExpo(t: number): number {
    return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

/**
 * Exponential ease-out
 */
export function easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Exponential ease-in-out
 */
export function easeInOutExpo(t: number): number {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

// ============================================================================
// CIRCULAR EASING
// ============================================================================

/**
 * Circular ease-in: 1 - √(1-t²)
 * Based on a quarter circle
 */
export function easeInCirc(t: number): number {
    return 1 - Math.sqrt(1 - Math.pow(t, 2));
}

/**
 * Circular ease-out
 */
export function easeOutCirc(t: number): number {
    return Math.sqrt(1 - Math.pow(t - 1, 2));
}

/**
 * Circular ease-in-out
 */
export function easeInOutCirc(t: number): number {
    return t < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
}

// ============================================================================
// BACK EASING (overshoots)
// ============================================================================

const BACK_CONSTANT = 1.70158;
const BACK_CONSTANT_IN_OUT = BACK_CONSTANT * 1.525;

/**
 * Back ease-in
 * Pulls back before moving forward (overshoot at start)
 *
 * @param t - Time parameter [0, 1]
 * @param overshoot - Overshoot amount (default: 1.70158)
 */
export function easeInBack(t: number, overshoot: number = BACK_CONSTANT): number {
    return (overshoot + 1) * t * t * t - overshoot * t * t;
}

/**
 * Back ease-out
 * Overshoots target, then settles back
 */
export function easeOutBack(t: number, overshoot: number = BACK_CONSTANT): number {
    return 1 + (overshoot + 1) * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

/**
 * Back ease-in-out
 * Combines both overshoots
 */
export function easeInOutBack(t: number, overshoot: number = BACK_CONSTANT_IN_OUT): number {
    return t < 0.5
        ? (Math.pow(2 * t, 2) * ((overshoot + 1) * 2 * t - overshoot)) / 2
        : (Math.pow(2 * t - 2, 2) * ((overshoot + 1) * (t * 2 - 2) + overshoot) + 2) / 2;
}

// ============================================================================
// ELASTIC EASING (spring-like oscillation)
// ============================================================================

const ELASTIC_CONSTANT = (2 * Math.PI) / 3;
const ELASTIC_CONSTANT_IN_OUT = (2 * Math.PI) / 4.5;

/**
 * Elastic ease-in
 * Oscillates with decreasing amplitude, like a spring
 *
 * @param t - Time parameter [0, 1]
 * @param amplitude - Oscillation amplitude (default: 1)
 * @param period - Oscillation period (default: 0.3)
 */
export function easeInElastic(t: number, amplitude: number = 1, period: number = 0.3): number {
    if (t === 0) return 0;
    if (t === 1) return 1;

    const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);
    return -(amplitude * Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1 - s) * (2 * Math.PI)) / period));
}

/**
 * Elastic ease-out
 * Oscillates around target before settling
 */
export function easeOutElastic(t: number, amplitude: number = 1, period: number = 0.3): number {
    if (t === 0) return 0;
    if (t === 1) return 1;

    const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);
    return amplitude * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1;
}

/**
 * Elastic ease-in-out
 */
export function easeInOutElastic(t: number, amplitude: number = 1, period: number = 0.3): number {
    if (t === 0) return 0;
    if (t === 1) return 1;

    const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);

    if (t < 0.5) {
        return -(amplitude * Math.pow(2, 20 * t - 10) * Math.sin(((20 * t - 11 - s) * (2 * Math.PI)) / period)) / 2;
    }

    return (amplitude * Math.pow(2, -20 * t + 10) * Math.sin(((20 * t - 11 - s) * (2 * Math.PI)) / period)) / 2 + 1;
}

// ============================================================================
// BOUNCE EASING (bouncing ball effect)
// ============================================================================

/**
 * Bounce ease-out helper function
 */
function bounceOut(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
}

/**
 * Bounce ease-in
 * Bounces before reaching target
 */
export function easeInBounce(t: number): number {
    return 1 - bounceOut(1 - t);
}

/**
 * Bounce ease-out
 * Bounces after reaching target (like a ball settling)
 */
export function easeOutBounce(t: number): number {
    return bounceOut(t);
}

/**
 * Bounce ease-in-out
 * Bounces at both start and end
 */
export function easeInOutBounce(t: number): number {
    return t < 0.5
        ? (1 - bounceOut(1 - 2 * t)) / 2
        : (1 + bounceOut(2 * t - 1)) / 2;
}

// ============================================================================
// ANTICIPATE EASING (pulls back before moving forward)
// ============================================================================

/**
 * Anticipate easing
 * Pulls back before moving forward, like a slingshot
 * Similar to easeInBack but with different curve characteristics
 *
 * @param t - Time parameter [0, 1]
 * @param tension - Tension amount (default: 2)
 */
export function anticipate(t: number, tension: number = 2): number {
    return t * t * ((tension + 1) * t - tension);
}

/**
 * Overshoot easing
 * Overshoots target then returns
 *
 * @param t - Time parameter [0, 1]
 * @param tension - Tension amount (default: 2)
 */
export function overshoot(t: number, tension: number = 2): number {
    const s = t - 1;
    return s * s * ((tension + 1) * s + tension) + 1;
}

/**
 * Anticipate-overshoot easing
 * Combines anticipate and overshoot
 */
export function anticipateOvershoot(t: number, tension: number = 2): number {
    const s = tension * 1.525;
    if (t < 0.5) {
        const t2 = t * 2;
        return 0.5 * (t2 * t2 * ((s + 1) * t2 - s));
    } else {
        const t2 = (t - 1) * 2;
        return 0.5 * (t2 * t2 * ((s + 1) * t2 + s) + 2);
    }
}

// ============================================================================
// PARAMETRIC EASING FUNCTIONS
// ============================================================================

/**
 * Create a custom ease-in function with power p
 * @param p - Power (e.g., 2 for quadratic, 3 for cubic)
 */
export function easeInPower(p: number): (t: number) => number {
    return (t: number) => Math.pow(t, p);
}

/**
 * Create a custom ease-out function with power p
 */
export function easeOutPower(p: number): (t: number) => number {
    return (t: number) => 1 - Math.pow(1 - t, p);
}

/**
 * Create a custom ease-in-out function with power p
 */
export function easeInOutPower(p: number): (t: number) => number {
    return (t: number) =>
        t < 0.5
            ? Math.pow(2, p - 1) * Math.pow(t, p)
            : 1 - Math.pow(-2 * t + 2, p) / 2;
}

/**
 * Create a bezier-based easing function
 * Mimics CSS cubic-bezier() function
 *
 * @param x1 - First control point x
 * @param y1 - First control point y
 * @param x2 - Second control point x
 * @param y2 - Second control point y
 * @returns Easing function
 *
 * @example
 * ```typescript
 * const ease = bezierEasing(0.25, 0.1, 0.25, 1); // CSS ease
 * const eased = ease(0.5);
 * ```
 */
export function bezierEasing(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
    return (t: number) => {
        if (t === 0 || t === 1) return t;

        // Cubic bezier interpolation
        // Use Newton-Raphson to find t parameter for given x
        let guess = t;
        for (let i = 0; i < 8; i++) {
            const x = cubicBezier1D(0, x1, x2, 1, guess);
            if (Math.abs(x - t) < 1e-7) break;

            const dx = cubicBezierDerivative1D(0, x1, x2, 1, guess);
            if (Math.abs(dx) < 1e-6) break;

            guess -= (x - t) / dx;
        }

        return cubicBezier1D(0, y1, y2, 1, guess);
    };
}

// Helper functions for bezierEasing
function cubicBezier1D(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function cubicBezierDerivative1D(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const u = 1 - t;
    return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

// ============================================================================
// CSS STANDARD EASING PRESETS
// ============================================================================

/**
 * CSS ease (default): cubic-bezier(0.25, 0.1, 0.25, 1)
 */
export const ease = bezierEasing(0.25, 0.1, 0.25, 1);

/**
 * CSS ease-in: cubic-bezier(0.42, 0, 1, 1)
 */
export const easeIn = bezierEasing(0.42, 0, 1, 1);

/**
 * CSS ease-out: cubic-bezier(0, 0, 0.58, 1)
 */
export const easeOut = bezierEasing(0, 0, 0.58, 1);

/**
 * CSS ease-in-out: cubic-bezier(0.42, 0, 0.58, 1)
 */
export const easeInOut = bezierEasing(0.42, 0, 0.58, 1);

/**
 * Steps easing function (like CSS steps())
 *
 * @param steps - Number of steps
 * @param jumpStart - If true, jump at start of each step; otherwise at end
 * @returns Stepped easing function
 */
export function steps(steps: number, jumpStart: boolean = false): (t: number) => number {
    return (t: number) => {
        const step = Math.floor(t * steps);
        return jumpStart ? (step + 1) / steps : step / steps;
    };
}
