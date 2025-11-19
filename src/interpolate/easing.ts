/**
 * Easing Functions
 *
 * Comprehensive collection of easing functions for animations, transitions,
 * and smooth interpolations. Based on Robert Penner's easing equations.
 *
 * All easing functions take a normalized time value t ∈ [0, 1] and return
 * an eased value, typically in [0, 1] (though some may overshoot).
 *
 * Naming convention:
 * - ease{Type}In: Slow start, fast end
 * - ease{Type}Out: Fast start, slow end
 * - ease{Type}InOut: Slow start and end, fast middle
 *
 * References:
 * - Robert Penner's Easing Functions
 * - "Creating Motion Graphics with After Effects" by Christiansen
 * - easings.net
 */

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

// ============================================================================
// LINEAR
// ============================================================================

/**
 * Linear interpolation (no easing)
 * @param t - Time parameter [0, 1]
 * @returns Eased value
 */
export function linear(t: number): number {
    return t;
}

// ============================================================================
// QUADRATIC (t²)
// ============================================================================

/**
 * Quadratic ease-in (accelerating from zero)
 */
export function easeInQuad(t: number): number {
    return t * t;
}

/**
 * Quadratic ease-out (decelerating to zero)
 */
export function easeOutQuad(t: number): number {
    return t * (2 - t);
}

/**
 * Quadratic ease-in-out
 */
export function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ============================================================================
// CUBIC (t³)
// ============================================================================

/**
 * Cubic ease-in
 */
export function easeInCubic(t: number): number {
    return t * t * t;
}

/**
 * Cubic ease-out
 */
export function easeOutCubic(t: number): number {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
}

/**
 * Cubic ease-in-out
 */
export function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// ============================================================================
// QUARTIC (t⁴)
// ============================================================================

/**
 * Quartic ease-in
 */
export function easeInQuart(t: number): number {
    return t * t * t * t;
}

/**
 * Quartic ease-out
 */
export function easeOutQuart(t: number): number {
    const t1 = t - 1;
    return 1 - t1 * t1 * t1 * t1;
}

/**
 * Quartic ease-in-out
 */
export function easeInOutQuart(t: number): number {
    if (t < 0.5) {
        return 8 * t * t * t * t;
    }
    const t1 = t - 1;
    return 1 - 8 * t1 * t1 * t1 * t1;
}

// ============================================================================
// QUINTIC (t⁵)
// ============================================================================

/**
 * Quintic ease-in
 */
export function easeInQuint(t: number): number {
    return t * t * t * t * t;
}

/**
 * Quintic ease-out
 */
export function easeOutQuint(t: number): number {
    const t1 = t - 1;
    return 1 + t1 * t1 * t1 * t1 * t1;
}

/**
 * Quintic ease-in-out
 */
export function easeInOutQuint(t: number): number {
    if (t < 0.5) {
        return 16 * t * t * t * t * t;
    }
    const t1 = t - 1;
    return 1 + 16 * t1 * t1 * t1 * t1 * t1;
}

// ============================================================================
// SINUSOIDAL
// ============================================================================

/**
 * Sinusoidal ease-in
 */
export function easeInSine(t: number): number {
    return 1 - Math.cos((t * Math.PI) / 2);
}

/**
 * Sinusoidal ease-out
 */
export function easeOutSine(t: number): number {
    return Math.sin((t * Math.PI) / 2);
}

/**
 * Sinusoidal ease-in-out
 */
export function easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

// ============================================================================
// EXPONENTIAL
// ============================================================================

/**
 * Exponential ease-in
 */
export function easeInExpo(t: number): number {
    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
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
    if (t < 0.5) {
        return Math.pow(2, 20 * t - 10) / 2;
    }
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
}

// ============================================================================
// CIRCULAR
// ============================================================================

/**
 * Circular ease-in
 */
export function easeInCirc(t: number): number {
    return 1 - Math.sqrt(1 - t * t);
}

/**
 * Circular ease-out
 */
export function easeOutCirc(t: number): number {
    const t1 = t - 1;
    return Math.sqrt(1 - t1 * t1);
}

/**
 * Circular ease-in-out
 */
export function easeInOutCirc(t: number): number {
    if (t < 0.5) {
        return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
    }
    const t1 = -2 * t + 2;
    return (Math.sqrt(1 - t1 * t1) + 1) / 2;
}

// ============================================================================
// BACK (overshooting cubic)
// ============================================================================

const BACK_CONSTANT = 1.70158;

/**
 * Back ease-in (slightly overshoot at start)
 */
export function easeInBack(t: number): number {
    const c1 = BACK_CONSTANT;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
}

/**
 * Back ease-out (overshoot at end)
 */
export function easeOutBack(t: number): number {
    const c1 = BACK_CONSTANT;
    const c3 = c1 + 1;
    const t1 = t - 1;
    return 1 + c3 * t1 * t1 * t1 + c1 * t1 * t1;
}

/**
 * Back ease-in-out
 */
export function easeInOutBack(t: number): number {
    const c1 = BACK_CONSTANT;
    const c2 = c1 * 1.525;

    if (t < 0.5) {
        const t2 = 2 * t;
        return (t2 * t2 * ((c2 + 1) * 2 * t - c2)) / 2;
    }
    const t2 = 2 * t - 2;
    return (t2 * t2 * ((c2 + 1) * (t2) + c2) + 2) / 2;
}

// ============================================================================
// ELASTIC (spring-like)
// ============================================================================

const ELASTIC_CONSTANT = (2 * Math.PI) / 3;

/**
 * Elastic ease-in (spring effect at start)
 */
export function easeInElastic(t: number): number {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ELASTIC_CONSTANT);
}

/**
 * Elastic ease-out (spring effect at end)
 */
export function easeOutElastic(t: number): number {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_CONSTANT) + 1;
}

/**
 * Elastic ease-in-out
 */
export function easeInOutElastic(t: number): number {
    if (t === 0) return 0;
    if (t === 1) return 1;

    const c5 = (2 * Math.PI) / 4.5;

    if (t < 0.5) {
        return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
    }
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
}

// ============================================================================
// BOUNCE
// ============================================================================

/**
 * Bounce ease-out (bouncing at end)
 */
export function easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        const t2 = t - 1.5 / d1;
        return n1 * t2 * t2 + 0.75;
    } else if (t < 2.5 / d1) {
        const t2 = t - 2.25 / d1;
        return n1 * t2 * t2 + 0.9375;
    } else {
        const t2 = t - 2.625 / d1;
        return n1 * t2 * t2 + 0.984375;
    }
}

/**
 * Bounce ease-in (bouncing at start)
 */
export function easeInBounce(t: number): number {
    return 1 - easeOutBounce(1 - t);
}

/**
 * Bounce ease-in-out
 */
export function easeInOutBounce(t: number): number {
    if (t < 0.5) {
        return (1 - easeOutBounce(1 - 2 * t)) / 2;
    }
    return (1 + easeOutBounce(2 * t - 1)) / 2;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a custom easing function with configurable parameters
 *
 * @param type - Base easing type
 * @param params - Optional parameters (e.g., overshoot for back, amplitude for elastic)
 * @returns Configured easing function
 */
export function createEasing(
    type: 'back' | 'elastic',
    params: { overshoot?: number; amplitude?: number; period?: number } = {}
): EasingFunction {
    if (type === 'back') {
        const s = params.overshoot || BACK_CONSTANT;
        return (t: number) => {
            const c3 = s + 1;
            return c3 * t * t * t - s * t * t;
        };
    }

    if (type === 'elastic') {
        const a = params.amplitude || 1;
        const p = params.period || 0.3;
        return (t: number) => {
            if (t === 0) return 0;
            if (t === 1) return 1;
            const s = (p / (2 * Math.PI)) * Math.asin(1 / a);
            return -(a * Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1) - s) * (2 * Math.PI) / p));
        };
    }

    return linear;
}

/**
 * Combine two easing functions
 *
 * @param easing1 - First easing function (applied first half)
 * @param easing2 - Second easing function (applied second half)
 * @returns Combined easing function
 *
 * @example
 * ```ts
 * const custom = combineEasing(easeInQuad, easeOutBounce);
 * ```
 */
export function combineEasing(
    easing1: EasingFunction,
    easing2: EasingFunction
): EasingFunction {
    return (t: number) => {
        if (t < 0.5) {
            return easing1(t * 2) / 2;
        }
        return 0.5 + easing2((t - 0.5) * 2) / 2;
    };
}

/**
 * Chain multiple easing functions
 *
 * @param easings - Array of easing functions to chain
 * @returns Chained easing function
 *
 * @example
 * ```ts
 * const chain = chainEasing([easeInQuad, linear, easeOutBounce]);
 * // First third uses easeInQuad, middle uses linear, last third uses easeOutBounce
 * ```
 */
export function chainEasing(easings: EasingFunction[]): EasingFunction {
    return (t: number) => {
        const n = easings.length;
        const segmentSize = 1 / n;
        const index = Math.min(Math.floor(t / segmentSize), n - 1);
        const localT = (t - index * segmentSize) / segmentSize;
        const eased = easings[index](localT);
        return (index + eased) / n;
    };
}

/**
 * Apply easing to a value range
 *
 * @param t - Time parameter [0, 1]
 * @param start - Start value
 * @param end - End value
 * @param easing - Easing function (default: linear)
 * @returns Eased value in range [start, end]
 *
 * @example
 * ```ts
 * const value = applyEasing(0.5, 0, 100, easeOutBounce);
 * // Returns value between 0 and 100 with bounce easing
 * ```
 */
export function applyEasing(
    t: number,
    start: number,
    end: number,
    easing: EasingFunction = linear
): number {
    const eased = easing(Math.max(0, Math.min(1, t)));
    return start + (end - start) * eased;
}

/**
 * Map of all available easing functions by name
 */
export const EASINGS: Record<string, EasingFunction> = {
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
    easeInOutBounce
};

/**
 * Get an easing function by name
 *
 * @param name - Name of the easing function
 * @returns Easing function, or linear if not found
 *
 * @example
 * ```ts
 * const easing = getEasing('easeOutBounce');
 * const value = easing(0.5);
 * ```
 */
export function getEasing(name: string): EasingFunction {
    return EASINGS[name] || linear;
}
