import {
    taylorSeries,
    maclaurinSeries,
    powerSeriesCoefficients,
    addPowerSeries,
    multiplyPowerSeries,
    composePowerSeries,
    powerSeriesToExpression,
    sinSeries,
    cosSeries,
    expSeries,
    lnOnePlusSeries,
    binomialSeries,
    geometricSeries,
    differentiatePowerSeries,
    integratePowerSeries,
    evaluatePowerSeries,
    radiusOfConvergence
} from '../../src/symbolic/series';

import {
    parse,
    Expression,
    Constant,
    Variable,
    Sin,
    Cos,
    Exp,
    Ln,
    Add,
    Power
} from '../../src/symbolic';

describe('Series Expansion', () => {
    describe('Taylor Series', () => {
        test('Taylor series of x^2 around x=0', () => {
            const expr = parse('x^2');
            const series = taylorSeries(expr, 'x', 0, 3);

            // x^2 = 0 + 0x + x^2 + 0x^3
            const value = series.evaluate(new Map([['x', 2]]));
            expect(value).toBeCloseTo(4);
        });

        test('Taylor series of x^2 around x=1', () => {
            const expr = parse('x^2');
            const series = taylorSeries(expr, 'x', 1, 2);

            // x^2 = 1 + 2(x-1) + (x-1)^2
            // At x=2: 1 + 2(1) + 1 = 4
            const value = series.evaluate(new Map([['x', 2]]));
            expect(value).toBeCloseTo(4);
        });

        test('Taylor series of sin(x) around x=0 (order 5)', () => {
            const expr = new Sin(new Variable('x'));
            const series = taylorSeries(expr, 'x', 0, 5);

            // sin(x) ≈ x - x^3/6 + x^5/120
            const value = series.evaluate(new Map([['x', 0.5]]));
            expect(value).toBeCloseTo(Math.sin(0.5), 3);
        });

        test('Taylor series of exp(x) around x=0 (order 4)', () => {
            const expr = new Exp(new Variable('x'));
            const series = taylorSeries(expr, 'x', 0, 4);

            // e^x ≈ 1 + x + x^2/2 + x^3/6 + x^4/24
            const value = series.evaluate(new Map([['x', 1]]));
            expect(value).toBeCloseTo(Math.E, 1);
        });

        test('Taylor series of 1/(1-x) around x=0', () => {
            const expr = parse('1/(1-x)');
            const series = taylorSeries(expr, 'x', 0, 4);

            // 1/(1-x) = 1 + x + x^2 + x^3 + x^4
            const value = series.evaluate(new Map([['x', 0.5]]));
            expect(value).toBeCloseTo(2, 1);
        });

        test('Taylor series of polynomial matches original', () => {
            const expr = parse('2*x^2 + 3*x + 1');
            const series = taylorSeries(expr, 'x', 0, 3);

            // Should match exactly
            const value = series.evaluate(new Map([['x', 2]]));
            const original = expr.evaluate(new Map([['x', 2]]));
            expect(value).toBeCloseTo(original);
        });
    });

    describe('Maclaurin Series', () => {
        test('Maclaurin series of x^3', () => {
            const expr = parse('x^3');
            const series = maclaurinSeries(expr, 'x', 4);

            const value = series.evaluate(new Map([['x', 2]]));
            expect(value).toBeCloseTo(8);
        });

        test('Maclaurin series of cos(x) order 4', () => {
            const expr = new Cos(new Variable('x'));
            const series = maclaurinSeries(expr, 'x', 4);

            // cos(x) ≈ 1 - x^2/2 + x^4/24
            const value = series.evaluate(new Map([['x', 1]]));
            expect(value).toBeCloseTo(Math.cos(1), 2);
        });

        test('Maclaurin series of exp(x)', () => {
            const expr = new Exp(new Variable('x'));
            const series = maclaurinSeries(expr, 'x', 5);

            const value = series.evaluate(new Map([['x', 0.5]]));
            expect(value).toBeCloseTo(Math.exp(0.5), 3);
        });

        test('Maclaurin series is Taylor series at 0', () => {
            const expr = parse('x^2 + 2*x');
            const maclaurin = maclaurinSeries(expr, 'x', 3);
            const taylor = taylorSeries(expr, 'x', 0, 3);

            const x = 1.5;
            const macValue = maclaurin.evaluate(new Map([['x', x]]));
            const tayValue = taylor.evaluate(new Map([['x', x]]));

            expect(macValue).toBeCloseTo(tayValue);
        });
    });

    describe('Power Series Coefficients', () => {
        test('coefficients of x^2', () => {
            const expr = parse('x^2');
            const coeffs = powerSeriesCoefficients(expr, 'x', 0, 3);

            expect(coeffs).toHaveLength(4);
            expect(coeffs[0].evaluate(new Map())).toBeCloseTo(0); // constant
            expect(coeffs[1].evaluate(new Map())).toBeCloseTo(0); // x
            expect(coeffs[2].evaluate(new Map())).toBeCloseTo(1); // x^2
            expect(coeffs[3].evaluate(new Map())).toBeCloseTo(0); // x^3
        });

        test('coefficients of 1 + x + x^2', () => {
            const expr = parse('1 + x + x^2');
            const coeffs = powerSeriesCoefficients(expr, 'x', 0, 2);

            expect(coeffs[0].evaluate(new Map())).toBeCloseTo(1);
            expect(coeffs[1].evaluate(new Map())).toBeCloseTo(1);
            expect(coeffs[2].evaluate(new Map())).toBeCloseTo(1);
        });

        test('coefficients of exp(x) Maclaurin', () => {
            const expr = new Exp(new Variable('x'));
            const coeffs = powerSeriesCoefficients(expr, 'x', 0, 4);

            // e^x = 1 + x + x^2/2! + x^3/3! + x^4/4!
            expect(coeffs[0].evaluate(new Map())).toBeCloseTo(1);
            expect(coeffs[1].evaluate(new Map())).toBeCloseTo(1);
            expect(coeffs[2].evaluate(new Map())).toBeCloseTo(0.5);
            expect(coeffs[3].evaluate(new Map())).toBeCloseTo(1 / 6, 4);
            expect(coeffs[4].evaluate(new Map())).toBeCloseTo(1 / 24, 4);
        });
    });

    describe('Power Series Operations', () => {
        test('add two power series', () => {
            const c1 = [new Constant(1), new Constant(2), new Constant(3)];
            const c2 = [new Constant(4), new Constant(5), new Constant(6)];

            const sum = addPowerSeries(c1, c2);

            expect(sum[0].evaluate(new Map())).toBeCloseTo(5);
            expect(sum[1].evaluate(new Map())).toBeCloseTo(7);
            expect(sum[2].evaluate(new Map())).toBeCloseTo(9);
        });

        test('add series of different lengths', () => {
            const c1 = [new Constant(1), new Constant(2)];
            const c2 = [new Constant(3), new Constant(4), new Constant(5)];

            const sum = addPowerSeries(c1, c2);

            expect(sum).toHaveLength(3);
            expect(sum[0].evaluate(new Map())).toBeCloseTo(4);
            expect(sum[1].evaluate(new Map())).toBeCloseTo(6);
            expect(sum[2].evaluate(new Map())).toBeCloseTo(5);
        });

        test('multiply two power series (Cauchy product)', () => {
            // (1 + x) * (1 + x) = 1 + 2x + x^2
            const c1 = [new Constant(1), new Constant(1)];
            const c2 = [new Constant(1), new Constant(1)];

            const product = multiplyPowerSeries(c1, c2);

            expect(product[0].evaluate(new Map())).toBeCloseTo(1);
            expect(product[1].evaluate(new Map())).toBeCloseTo(2);
            expect(product[2].evaluate(new Map())).toBeCloseTo(1);
        });

        test('multiply series with different coefficients', () => {
            // (1 + 2x) * (3 + 4x) = 3 + 10x + 8x^2
            const c1 = [new Constant(1), new Constant(2)];
            const c2 = [new Constant(3), new Constant(4)];

            const product = multiplyPowerSeries(c1, c2);

            expect(product[0].evaluate(new Map())).toBeCloseTo(3);
            expect(product[1].evaluate(new Map())).toBeCloseTo(10);
            expect(product[2].evaluate(new Map())).toBeCloseTo(8);
        });

        test('compose power series', () => {
            // f(x) = 1 + x, g(x) = x
            // f(g(x)) = 1 + x
            const f = [new Constant(1), new Constant(1)];
            const g = [new Constant(0), new Constant(1)];

            const composition = composePowerSeries(f, g, 2);

            expect(composition[0].evaluate(new Map())).toBeCloseTo(1);
            expect(composition[1].evaluate(new Map())).toBeCloseTo(1);
        });
    });

    describe('Common Series', () => {
        test('sin series matches sin function', () => {
            const series = sinSeries('x', 5);

            const value = series.evaluate(new Map([['x', 0.5]]));
            expect(value).toBeCloseTo(Math.sin(0.5), 4);
        });

        test('cos series matches cos function', () => {
            const series = cosSeries('x', 5);

            const value = series.evaluate(new Map([['x', 1]]));
            expect(value).toBeCloseTo(Math.cos(1), 3);
        });

        test('exp series matches exp function', () => {
            const series = expSeries('x', 10);

            const value = series.evaluate(new Map([['x', 1]]));
            expect(value).toBeCloseTo(Math.E, 4);
        });

        test('ln(1+x) series', () => {
            const series = lnOnePlusSeries('x', 10);

            // ln(1 + 0.5) = ln(1.5)
            const value = series.evaluate(new Map([['x', 0.5]]));
            expect(value).toBeCloseTo(Math.log(1.5), 3);
        });

        test('geometric series 1/(1-x)', () => {
            const series = geometricSeries('x', 10);

            // At x=0.5: 1/(1-0.5) = 2
            const value = series.evaluate(new Map([['x', 0.5]]));
            expect(value).toBeCloseTo(2, 2);
        });

        test('binomial series (1+x)^2', () => {
            const series = binomialSeries('x', 2, 3);

            // (1+x)^2 = 1 + 2x + x^2
            const value = series.evaluate(new Map([['x', 1]]));
            expect(value).toBeCloseTo(4);
        });

        test('binomial series (1+x)^0.5', () => {
            const series = binomialSeries('x', 0.5, 4);

            // sqrt(1+x) at x=0.2
            const value = series.evaluate(new Map([['x', 0.2]]));
            expect(value).toBeCloseTo(Math.sqrt(1.2), 2);
        });
    });

    describe('Series Calculus', () => {
        test('differentiate power series', () => {
            // d/dx(1 + x + x^2) = 1 + 2x
            const coeffs = [new Constant(1), new Constant(1), new Constant(1)];
            const derivative = differentiatePowerSeries(coeffs);

            expect(derivative[0].evaluate(new Map())).toBeCloseTo(1);
            expect(derivative[1].evaluate(new Map())).toBeCloseTo(2);
        });

        test('differentiate constant series', () => {
            const coeffs = [new Constant(5)];
            const derivative = differentiatePowerSeries(coeffs);

            expect(derivative[0].evaluate(new Map())).toBeCloseTo(0);
        });

        test('integrate power series', () => {
            // ∫(1 + 2x)dx = C + x + x^2
            const coeffs = [new Constant(1), new Constant(2)];
            const integral = integratePowerSeries(coeffs, new Constant(0));

            expect(integral[0].evaluate(new Map())).toBeCloseTo(0); // C = 0
            expect(integral[1].evaluate(new Map())).toBeCloseTo(1);
            expect(integral[2].evaluate(new Map())).toBeCloseTo(1);
        });

        test('integrate with constant term', () => {
            const coeffs = [new Constant(2)];
            const integral = integratePowerSeries(coeffs, new Constant(5));

            expect(integral[0].evaluate(new Map())).toBeCloseTo(5); // C = 5
            expect(integral[1].evaluate(new Map())).toBeCloseTo(2);
        });
    });

    describe('Series Evaluation', () => {
        test('evaluate power series at a point', () => {
            // 1 + 2x + 3x^2 at x=1 = 6
            const coeffs = [new Constant(1), new Constant(2), new Constant(3)];
            const value = evaluatePowerSeries(coeffs, 'x', 0, 1);

            expect(value).toBeCloseTo(6);
        });

        test('evaluate geometric series', () => {
            // 1 + x + x^2 at x=0.5 = 1.75
            const coeffs = [new Constant(1), new Constant(1), new Constant(1)];
            const value = evaluatePowerSeries(coeffs, 'x', 0, 0.5);

            expect(value).toBeCloseTo(1.75);
        });

        test('evaluate series centered at non-zero point', () => {
            // Series centered at x=1, evaluate at x=2
            const coeffs = [new Constant(1), new Constant(2)];
            const value = evaluatePowerSeries(coeffs, 'x', 1, 2);

            // 1 + 2(2-1) = 3
            expect(value).toBeCloseTo(3);
        });
    });

    describe('Series Convergence', () => {
        test('radius of convergence for geometric series', () => {
            // 1 + x + x^2 + ... has R=1
            const coeffs = Array(10).fill(null).map(() => new Constant(1));
            const radius = radiusOfConvergence(coeffs);

            expect(radius).toBeCloseTo(1, 0);
        });

        test('radius of convergence for exp series', () => {
            // e^x has R=∞
            const coeffs = [new Constant(1), new Constant(1), new Constant(0.5), new Constant(1 / 6)];
            const radius = radiusOfConvergence(coeffs);

            expect(radius).toBeGreaterThan(5);
        });

        test('radius of convergence for alternating series', () => {
            const coeffs = [new Constant(1), new Constant(-1), new Constant(1), new Constant(-1)];
            const radius = radiusOfConvergence(coeffs);

            expect(radius).toBeCloseTo(1, 0);
        });
    });

    describe('Series to Expression Conversion', () => {
        test('convert power series to expression', () => {
            const coeffs = [new Constant(1), new Constant(2), new Constant(3)];
            const expr = powerSeriesToExpression(coeffs, 'x', 0);

            // 1 + 2x + 3x^2
            const value = expr.evaluate(new Map([['x', 2]]));
            expect(value).toBeCloseTo(17);
        });

        test('convert series centered at non-zero', () => {
            const coeffs = [new Constant(1), new Constant(1)];
            const expr = powerSeriesToExpression(coeffs, 'x', 1);

            // 1 + (x-1)
            const value = expr.evaluate(new Map([['x', 3]]));
            expect(value).toBeCloseTo(3);
        });

        test('skip zero coefficients', () => {
            const coeffs = [new Constant(1), new Constant(0), new Constant(3)];
            const expr = powerSeriesToExpression(coeffs, 'x', 0);

            // 1 + 3x^2
            const value = expr.evaluate(new Map([['x', 2]]));
            expect(value).toBeCloseTo(13);
        });
    });

    describe('Integration Tests', () => {
        test('sin series differentiated gives cos series', () => {
            const sinCoeffs = powerSeriesCoefficients(new Sin(new Variable('x')), 'x', 0, 6);
            const cosCoeffs = powerSeriesCoefficients(new Cos(new Variable('x')), 'x', 0, 5);

            const dSin = differentiatePowerSeries(sinCoeffs);

            // Compare coefficients
            for (let i = 0; i < Math.min(dSin.length, cosCoeffs.length); i++) {
                const dSinVal = dSin[i].evaluate(new Map());
                const cosVal = cosCoeffs[i].evaluate(new Map());
                expect(dSinVal).toBeCloseTo(cosVal, 4);
            }
        });

        test('exp series matches exp of sum', () => {
            const expX = expSeries('x', 8);
            const value1 = expX.evaluate(new Map([['x', 1]]));

            const expY = expSeries('y', 8);
            const value2 = expY.evaluate(new Map([['y', 1]]));

            // e^1 * e^1 ≈ e^2
            expect(value1 * value2).toBeCloseTo(Math.E * Math.E, 2);
        });

        test('Taylor series approximates function accurately', () => {
            const expr = new Sin(new Variable('x'));
            const series = taylorSeries(expr, 'x', 0, 10);

            // Test at multiple points
            for (const x of [0.1, 0.5, 1.0, 1.5]) {
                const approx = series.evaluate(new Map([['x', x]]));
                const actual = Math.sin(x);
                expect(approx).toBeCloseTo(actual, 4);
            }
        });
    });

    describe('Edge Cases', () => {
        test('series of order 0', () => {
            const expr = parse('x^2 + 1');
            const series = taylorSeries(expr, 'x', 0, 0);

            // Only constant term
            const value = series.evaluate(new Map([['x', 5]]));
            expect(value).toBeCloseTo(1);
        });

        test('series with all zero coefficients after simplification', () => {
            const coeffs = [new Constant(0), new Constant(0)];
            const expr = powerSeriesToExpression(coeffs, 'x', 0);

            expect(expr.evaluate(new Map([['x', 1]]))).toBeCloseTo(0);
        });

        test('empty coefficient array', () => {
            const result = addPowerSeries([], []);
            expect(result).toHaveLength(0);
        });
    });
});
