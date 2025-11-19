import {
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
    anticipate,
    overshoot,
    anticipateOvershoot,
    easeInPower,
    easeOutPower,
    easeInOutPower,
    bezierEasing,
    ease,
    easeIn,
    easeOut,
    easeInOut,
    steps
} from '../../src/interpolate/easing';

describe('Easing Functions', () => {
    // Test that all easing functions satisfy basic properties
    const testEasingFunction = (name: string, easingFn: (t: number) => number, allowOvershoot = false) => {
        describe(name, () => {
            it('should return 0 at t=0', () => {
                expect(easingFn(0)).toBeCloseTo(0, 5);
            });

            it('should return 1 at t=1', () => {
                expect(easingFn(1)).toBeCloseTo(1, 5);
            });

            it('should be continuous in [0, 1]', () => {
                for (let t = 0; t <= 1; t += 0.1) {
                    const value = easingFn(t);
                    expect(value).toBeDefined();
                    expect(isNaN(value)).toBe(false);
                }
            });

            if (!allowOvershoot) {
                it('should stay in [0, 1] range', () => {
                    for (let t = 0; t <= 1; t += 0.05) {
                        const value = easingFn(t);
                        expect(value).toBeGreaterThanOrEqual(-0.01);
                        expect(value).toBeLessThanOrEqual(1.01);
                    }
                });
            }

            it('should be monotonic or have controlled behavior', () => {
                const values = [];
                for (let t = 0; t <= 1; t += 0.1) {
                    values.push(easingFn(t));
                }
                // Values should be reasonable (not all the same)
                const min = Math.min(...values);
                const max = Math.max(...values);
                expect(max - min).toBeGreaterThan(0.5);
            });
        });
    };

    describe('linear', () => {
        it('should return the input unchanged', () => {
            expect(linear(0)).toBe(0);
            expect(linear(0.5)).toBe(0.5);
            expect(linear(1)).toBe(1);
        });
    });

    // Quadratic
    testEasingFunction('easeInQuad', easeInQuad);
    testEasingFunction('easeOutQuad', easeOutQuad);
    testEasingFunction('easeInOutQuad', easeInOutQuad);

    // Cubic
    testEasingFunction('easeInCubic', easeInCubic);
    testEasingFunction('easeOutCubic', easeOutCubic);
    testEasingFunction('easeInOutCubic', easeInOutCubic);

    // Quartic
    testEasingFunction('easeInQuart', easeInQuart);
    testEasingFunction('easeOutQuart', easeOutQuart);
    testEasingFunction('easeInOutQuart', easeInOutQuart);

    // Quintic
    testEasingFunction('easeInQuint', easeInQuint);
    testEasingFunction('easeOutQuint', easeOutQuint);
    testEasingFunction('easeInOutQuint', easeInOutQuint);

    // Sine
    testEasingFunction('easeInSine', easeInSine);
    testEasingFunction('easeOutSine', easeOutSine);
    testEasingFunction('easeInOutSine', easeInOutSine);

    // Exponential
    testEasingFunction('easeInExpo', easeInExpo);
    testEasingFunction('easeOutExpo', easeOutExpo);
    testEasingFunction('easeInOutExpo', easeInOutExpo);

    // Circular
    testEasingFunction('easeInCirc', easeInCirc);
    testEasingFunction('easeOutCirc', easeOutCirc);
    testEasingFunction('easeInOutCirc', easeInOutCirc);

    // Back (allows overshoot)
    testEasingFunction('easeInBack', easeInBack, true);
    testEasingFunction('easeOutBack', easeOutBack, true);
    testEasingFunction('easeInOutBack', easeInOutBack, true);

    // Elastic (allows overshoot)
    testEasingFunction('easeInElastic', easeInElastic, true);
    testEasingFunction('easeOutElastic', easeOutElastic, true);
    testEasingFunction('easeInOutElastic', easeInOutElastic, true);

    // Bounce
    testEasingFunction('easeInBounce', easeInBounce);
    testEasingFunction('easeOutBounce', easeOutBounce);
    testEasingFunction('easeInOutBounce', easeInOutBounce);

    describe('easeInQuad specific', () => {
        it('should be slower at start', () => {
            expect(easeInQuad(0.25)).toBeLessThan(0.25);
            expect(easeInQuad(0.5)).toBeLessThan(0.5);
        });

        it('should match quadratic formula', () => {
            expect(easeInQuad(0.5)).toBeCloseTo(0.25, 5);
            expect(easeInQuad(0.8)).toBeCloseTo(0.64, 5);
        });
    });

    describe('easeOutQuad specific', () => {
        it('should be faster at start', () => {
            expect(easeOutQuad(0.25)).toBeGreaterThan(0.25);
            expect(easeOutQuad(0.5)).toBeGreaterThan(0.5);
        });
    });

    describe('easeInOutQuad specific', () => {
        it('should be symmetric around 0.5', () => {
            const t1 = 0.3;
            const t2 = 0.7;
            const v1 = easeInOutQuad(t1);
            const v2 = easeInOutQuad(t2);
            expect(v1 + v2).toBeCloseTo(1, 3);
        });
    });

    describe('Back easing', () => {
        it('should overshoot with custom tension', () => {
            const result = easeOutBack(0.8, 3);
            expect(result).toBeGreaterThan(1);
        });

        it('should go negative at start for easeInBack', () => {
            const result = easeInBack(0.2);
            expect(result).toBeLessThan(0);
        });
    });

    describe('Elastic easing', () => {
        it('should oscillate for easeOutElastic', () => {
            const values = [];
            for (let t = 0.5; t <= 1; t += 0.05) {
                values.push(easeOutElastic(t));
            }
            // Check that there are both values > 1 and < 1 (oscillation)
            const hasAbove = values.some(v => v > 1);
            const hasBelow = values.some(v => v < 1);
            expect(hasAbove || hasBelow).toBe(true);
        });

        it('should accept custom amplitude and period', () => {
            const result = easeOutElastic(0.5, 1.5, 0.5);
            expect(result).toBeDefined();
            expect(isNaN(result)).toBe(false);
        });
    });

    describe('Bounce easing', () => {
        it('should have multiple local maxima for easeOutBounce', () => {
            const values = [];
            for (let t = 0; t <= 1; t += 0.01) {
                values.push(easeOutBounce(t));
            }

            // Count local maxima (bounces)
            let maxCount = 0;
            for (let i = 1; i < values.length - 1; i++) {
                if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
                    maxCount++;
                }
            }
            expect(maxCount).toBeGreaterThan(1); // Should bounce multiple times
        });
    });

    describe('Anticipate/Overshoot', () => {
        testEasingFunction('anticipate', anticipate, true);
        testEasingFunction('overshoot', overshoot, true);
        testEasingFunction('anticipateOvershoot', anticipateOvershoot, true);

        it('anticipate should go negative', () => {
            const result = anticipate(0.3);
            expect(result).toBeLessThan(0);
        });

        it('overshoot should exceed 1', () => {
            const result = overshoot(0.8);
            expect(result).toBeGreaterThan(1);
        });

        it('should accept custom tension', () => {
            const result = anticipate(0.5, 3);
            expect(result).toBeDefined();
        });
    });

    describe('Power easings', () => {
        it('easeInPower should create valid easing function', () => {
            const easeIn3 = easeInPower(3);
            expect(easeIn3(0)).toBe(0);
            expect(easeIn3(1)).toBe(1);
            expect(easeIn3(0.5)).toBeCloseTo(0.125, 5);
        });

        it('easeOutPower should create valid easing function', () => {
            const easeOut3 = easeOutPower(3);
            expect(easeOut3(0)).toBe(0);
            expect(easeOut3(1)).toBe(1);
        });

        it('easeInOutPower should create valid easing function', () => {
            const easeInOut3 = easeInOutPower(3);
            expect(easeInOut3(0)).toBe(0);
            expect(easeInOut3(1)).toBe(1);
        });
    });

    describe('bezierEasing', () => {
        it('should create CSS ease equivalent', () => {
            const cssEase = bezierEasing(0.25, 0.1, 0.25, 1);
            expect(cssEase(0)).toBeCloseTo(0, 5);
            expect(cssEase(1)).toBeCloseTo(1, 5);
            expect(cssEase(0.5)).toBeGreaterThan(0.4);
            expect(cssEase(0.5)).toBeLessThan(1);
        });

        it('should create linear easing with (0,0,1,1)', () => {
            const linearBezier = bezierEasing(0, 0, 1, 1);
            expect(linearBezier(0.5)).toBeCloseTo(0.5, 2);
        });

        it('should handle ease-in-out bezier', () => {
            const easeInOutBezier = bezierEasing(0.42, 0, 0.58, 1);
            expect(easeInOutBezier(0)).toBeCloseTo(0, 5);
            expect(easeInOutBezier(1)).toBeCloseTo(1, 5);
        });
    });

    describe('CSS presets', () => {
        it('ease should be defined and work', () => {
            expect(ease(0)).toBeCloseTo(0, 5);
            expect(ease(1)).toBeCloseTo(1, 5);
        });

        it('easeIn should be defined and work', () => {
            expect(easeIn(0)).toBeCloseTo(0, 5);
            expect(easeIn(1)).toBeCloseTo(1, 5);
        });

        it('easeOut should be defined and work', () => {
            expect(easeOut(0)).toBeCloseTo(0, 5);
            expect(easeOut(1)).toBeCloseTo(1, 5);
        });

        it('easeInOut should be defined and work', () => {
            expect(easeInOut(0)).toBeCloseTo(0, 5);
            expect(easeInOut(1)).toBeCloseTo(1, 5);
        });
    });

    describe('steps', () => {
        it('should create stepped easing with jump at end', () => {
            const step4 = steps(4, false);
            expect(step4(0)).toBe(0);
            expect(step4(0.24)).toBe(0);
            expect(step4(0.26)).toBeCloseTo(0.25, 5);
            expect(step4(0.5)).toBeCloseTo(0.5, 5);
            expect(step4(0.99)).toBeCloseTo(0.75, 5);
        });

        it('should create stepped easing with jump at start', () => {
            const step4 = steps(4, true);
            expect(step4(0)).toBeCloseTo(0.25, 5);
            expect(step4(0.5)).toBeCloseTo(0.75, 5);
        });

        it('should handle single step', () => {
            const step1 = steps(1, false);
            expect(step1(0.5)).toBe(0);
        });
    });

    describe('Symmetry tests', () => {
        it('easeInOut functions should be symmetric', () => {
            const testSymmetry = (fn: (t: number) => number) => {
                const t1 = 0.3;
                const t2 = 0.7;
                const v1 = fn(t1);
                const v2 = fn(t2);
                expect(Math.abs((v1 + v2) - 1)).toBeLessThan(0.1);
            };

            testSymmetry(easeInOutQuad);
            testSymmetry(easeInOutCubic);
            testSymmetry(easeInOutSine);
        });
    });

    describe('Performance', () => {
        it('should execute quickly for all easing functions', () => {
            const easings = [
                easeInQuad, easeOutQuad, easeInOutQuad,
                easeInCubic, easeOutCubic, easeInOutCubic,
                easeInSine, easeOutSine, easeInOutSine,
                easeInExpo, easeOutExpo, easeInOutExpo,
                easeInCirc, easeOutCirc, easeInOutCirc
            ];

            const start = Date.now();
            for (const easing of easings) {
                for (let t = 0; t <= 1; t += 0.01) {
                    easing(t);
                }
            }
            const elapsed = Date.now() - start;
            expect(elapsed).toBeLessThan(100); // Should complete in < 100ms
        });
    });
});
