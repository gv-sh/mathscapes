import {
    polynomialRegression,
    linearRegression,
    weightedPolynomialRegression,
    naturalCubicSpline,
    leastSquaresFit
} from '../../src/interpolate/fitting';

describe('Curve Fitting', () => {
    describe('linearRegression', () => {
        it('should fit a perfect line', () => {
            const data = [
                { x: 0, y: 1 },
                { x: 1, y: 3 },
                { x: 2, y: 5 },
                { x: 3, y: 7 }
            ];
            const fit = linearRegression(data);
            expect(fit.slope).toBeCloseTo(2, 5);
            expect(fit.intercept).toBeCloseTo(1, 5);
            expect(fit.rSquared).toBeCloseTo(1, 5);
            expect(fit.rmse).toBeCloseTo(0, 5);
        });

        it('should fit noisy data', () => {
            const data = [
                { x: 0, y: 1.1 },
                { x: 1, y: 2.9 },
                { x: 2, y: 5.1 },
                { x: 3, y: 6.8 }
            ];
            const fit = linearRegression(data);
            expect(fit.slope).toBeCloseTo(2, 0);
            expect(fit.intercept).toBeCloseTo(1, 0);
            expect(fit.rSquared).toBeGreaterThan(0.9);
        });

        it('should evaluate at any point', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 2 },
                { x: 2, y: 4 }
            ];
            const fit = linearRegression(data);
            expect(fit.evaluate(1.5)).toBeCloseTo(3, 2);
        });

        it('should handle negative slopes', () => {
            const data = [
                { x: 0, y: 10 },
                { x: 1, y: 8 },
                { x: 2, y: 6 },
                { x: 3, y: 4 }
            ];
            const fit = linearRegression(data);
            expect(fit.slope).toBeCloseTo(-2, 5);
            expect(fit.intercept).toBeCloseTo(10, 5);
        });
    });

    describe('polynomialRegression', () => {
        it('should fit a quadratic curve', () => {
            // y = x² + 2x + 1
            const data = [
                { x: 0, y: 1 },
                { x: 1, y: 4 },
                { x: 2, y: 9 },
                { x: 3, y: 16 }
            ];
            const fit = polynomialRegression(data, 2);
            expect(fit.coefficients[0]).toBeCloseTo(1, 1); // constant
            expect(fit.coefficients[1]).toBeCloseTo(2, 1); // linear
            expect(fit.coefficients[2]).toBeCloseTo(1, 1); // quadratic
            expect(fit.rSquared).toBeGreaterThan(0.99);
        });

        it('should fit a cubic curve', () => {
            // y = x³
            const data = [
                { x: -2, y: -8 },
                { x: -1, y: -1 },
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 8 }
            ];
            const fit = polynomialRegression(data, 3);
            expect(fit.coefficients[0]).toBeCloseTo(0, 2); // constant
            expect(fit.coefficients[1]).toBeCloseTo(0, 2); // linear
            expect(fit.coefficients[2]).toBeCloseTo(0, 2); // quadratic
            expect(fit.coefficients[3]).toBeCloseTo(1, 1); // cubic
        });

        it('should handle degree 0 (constant)', () => {
            const data = [
                { x: 0, y: 5 },
                { x: 1, y: 5 },
                { x: 2, y: 5 }
            ];
            const fit = polynomialRegression(data, 0);
            expect(fit.coefficients[0]).toBeCloseTo(5, 2);
        });

        it('should interpolate and extrapolate', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 4 }
            ];
            const fit = polynomialRegression(data, 2);
            expect(fit.evaluate(1.5)).toBeGreaterThan(0);
            expect(fit.evaluate(3)).toBeGreaterThan(4); // extrapolation
        });

        it('should throw error if not enough points', () => {
            const data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            expect(() => polynomialRegression(data, 3)).toThrow();
        });

        it('should throw error for negative degree', () => {
            const data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            expect(() => polynomialRegression(data, -1)).toThrow();
        });

        it('should calculate RMSE correctly', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 4 },
                { x: 3, y: 9 }
            ];
            const fit = polynomialRegression(data, 1); // Linear fit to quadratic data
            expect(fit.rmse).toBeGreaterThan(0);
        });
    });

    describe('weightedPolynomialRegression', () => {
        it('should fit with equal weights same as unweighted', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 2 },
                { x: 2, y: 4 }
            ];
            const weights = [1, 1, 1];
            const fit = weightedPolynomialRegression(data, weights, 1);
            const unfitWeighted = linearRegression(data);
            expect(fit.coefficients[0]).toBeCloseTo(unfitWeighted.intercept, 3);
            expect(fit.coefficients[1]).toBeCloseTo(unfitWeighted.slope, 3);
        });

        it('should prioritize high-weight points', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 10 }, // Outlier
                { x: 2, y: 4 }
            ];
            const lowWeight = [1, 0.1, 1]; // Low weight on outlier
            const highWeight = [1, 10, 1]; // High weight on outlier

            const fitLow = weightedPolynomialRegression(data, lowWeight, 1);
            const fitHigh = weightedPolynomialRegression(data, highWeight, 1);

            // High weight fit should be closer to the outlier
            expect(Math.abs(fitHigh.evaluate(1) - 10)).toBeLessThan(
                Math.abs(fitLow.evaluate(1) - 10)
            );
        });

        it('should throw error for mismatched lengths', () => {
            const data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            const weights = [1];
            expect(() => weightedPolynomialRegression(data, weights, 1)).toThrow();
        });

        it('should throw error for negative weights', () => {
            const data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            const weights = [1, -1];
            expect(() => weightedPolynomialRegression(data, weights, 1)).toThrow();
        });
    });

    describe('naturalCubicSpline', () => {
        it('should pass through all data points', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0 },
                { x: 3, y: 1 }
            ];
            const spline = naturalCubicSpline(data);

            for (const point of data) {
                expect(spline(point.x)).toBeCloseTo(point.y, 5);
            }
        });

        it('should interpolate between points', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0 }
            ];
            const spline = naturalCubicSpline(data);
            const mid = spline(0.5);
            expect(mid).toBeGreaterThan(0);
            expect(mid).toBeLessThan(1);
        });

        it('should handle sorted data correctly', () => {
            const data = [
                { x: 0, y: 1 },
                { x: 2, y: 3 },
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ];
            const spline = naturalCubicSpline(data);
            expect(spline(0)).toBeCloseTo(1, 3);
            expect(spline(1)).toBeCloseTo(2, 3);
            expect(spline(2)).toBeCloseTo(3, 3);
            expect(spline(3)).toBeCloseTo(4, 3);
        });

        it('should be smooth (continuous derivatives)', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0 }
            ];
            const spline = naturalCubicSpline(data);

            // Check smoothness by checking nearby points
            const h = 0.001;
            const x = 1;
            const y1 = spline(x - h);
            const y2 = spline(x);
            const y3 = spline(x + h);

            // Should be continuous
            expect(Math.abs(y2 - (y1 + y3) / 2)).toBeLessThan(0.01);
        });

        it('should throw error for insufficient points', () => {
            const data = [{ x: 0, y: 0 }];
            expect(() => naturalCubicSpline(data)).toThrow();
        });

        it('should throw error for duplicate x values', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 1, y: 2 }
            ];
            expect(() => naturalCubicSpline(data)).toThrow();
        });

        it('should extrapolate beyond data range', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0 }
            ];
            const spline = naturalCubicSpline(data);
            const extrapolated = spline(3);
            expect(extrapolated).toBeDefined();
            expect(isNaN(extrapolated)).toBe(false);
        });
    });

    describe('leastSquaresFit', () => {
        it('should fit with polynomial basis functions', () => {
            const data = [
                { x: 0, y: 1 },
                { x: 1, y: 3 },
                { x: 2, y: 5 }
            ];
            const basis = [
                (x: number) => 1,
                (x: number) => x
            ];
            const fit = leastSquaresFit(data, basis);
            expect(fit.coefficients[0]).toBeCloseTo(1, 5); // intercept
            expect(fit.coefficients[1]).toBeCloseTo(2, 5); // slope
        });

        it('should fit with trigonometric basis', () => {
            // Fit a + b*sin(x) + c*cos(x)
            const data = [];
            for (let x = 0; x < 2 * Math.PI; x += 0.5) {
                data.push({ x, y: 2 + 3 * Math.sin(x) + Math.cos(x) });
            }

            const basis = [
                (x: number) => 1,
                (x: number) => Math.sin(x),
                (x: number) => Math.cos(x)
            ];

            const fit = leastSquaresFit(data, basis);
            expect(fit.coefficients[0]).toBeCloseTo(2, 1); // constant
            expect(fit.coefficients[1]).toBeCloseTo(3, 1); // sin coefficient
            expect(fit.coefficients[2]).toBeCloseTo(1, 1); // cos coefficient
            expect(fit.rSquared).toBeGreaterThan(0.99);
        });

        it('should fit with exponential basis', () => {
            const data = [
                { x: 0, y: 1 },
                { x: 1, y: Math.E },
                { x: 2, y: Math.E * Math.E }
            ];
            const basis = [
                (x: number) => Math.exp(x)
            ];
            const fit = leastSquaresFit(data, basis);
            expect(fit.coefficients[0]).toBeCloseTo(1, 2);
        });

        it('should evaluate fitted function', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 4 }
            ];
            const basis = [
                (x: number) => 1,
                (x: number) => x,
                (x: number) => x * x
            ];
            const fit = leastSquaresFit(data, basis);
            expect(fit.evaluate(1.5)).toBeGreaterThan(0);
            expect(fit.evaluate(1.5)).toBeLessThan(4);
        });

        it('should throw error if not enough points', () => {
            const data = [{ x: 0, y: 0 }];
            const basis = [(x: number) => 1, (x: number) => x];
            expect(() => leastSquaresFit(data, basis)).toThrow();
        });

        it('should calculate R² and RMSE', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 4 },
                { x: 3, y: 9 }
            ];
            const basis = [(x: number) => 1, (x: number) => x * x]; // Quadratic
            const fit = leastSquaresFit(data, basis);
            expect(fit.rSquared).toBeGreaterThan(0.99);
            expect(fit.rmse).toBeLessThan(0.1);
        });

        it('should handle custom basis functions', () => {
            const data = [
                { x: 1, y: 1 },
                { x: 2, y: 4 },
                { x: 3, y: 9 }
            ];
            const basis = [
                (x: number) => x * x, // Only quadratic term
            ];
            const fit = leastSquaresFit(data, basis);
            expect(fit.coefficients[0]).toBeCloseTo(1, 2);
        });
    });

    describe('Integration tests', () => {
        it('should handle real-world noisy data', () => {
            // Generate noisy quadratic data
            const trueCoeffs = [1, -2, 0.5]; // y = 0.5x² - 2x + 1
            const data = [];
            for (let x = -5; x <= 5; x += 0.5) {
                const y = trueCoeffs[0] + trueCoeffs[1] * x + trueCoeffs[2] * x * x;
                const noise = (Math.random() - 0.5) * 0.5;
                data.push({ x, y: y + noise });
            }

            const fit = polynomialRegression(data, 2);
            expect(fit.rSquared).toBeGreaterThan(0.9);
            expect(Math.abs(fit.coefficients[0] - trueCoeffs[0])).toBeLessThan(0.5);
            expect(Math.abs(fit.coefficients[1] - trueCoeffs[1])).toBeLessThan(0.5);
            expect(Math.abs(fit.coefficients[2] - trueCoeffs[2])).toBeLessThan(0.5);
        });

        it('should compare different fitting methods', () => {
            const data = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0.5 },
                { x: 3, y: 0 }
            ];

            const linearFit = linearRegression(data);
            const quadraticFit = polynomialRegression(data, 2);
            const spline = naturalCubicSpline(data);

            // Quadratic should fit better than linear for this data
            expect(quadraticFit.rSquared).toBeGreaterThan(linearFit.rSquared);

            // Spline should pass through all points
            for (const point of data) {
                expect(spline(point.x)).toBeCloseTo(point.y, 3);
            }
        });
    });
});
