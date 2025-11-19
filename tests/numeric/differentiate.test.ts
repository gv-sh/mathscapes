import {
    forwardDifference,
    backwardDifference,
    centralDifference,
    centralDifference5Point,
    secondDerivative,
    derivative,
    richardson,
    partial,
    gradient,
    jacobian,
    hessian,
    directional,
} from '../../src/numeric/differentiate';

describe('Numerical Differentiation', () => {
    describe('Forward Difference', () => {
        test('should differentiate x^2 at x=2', () => {
            const f = (x: number) => x * x;
            const result = forwardDifference(f, 2, 1e-5);
            expect(result).toBeCloseTo(4, 4);
        });

        test('should differentiate sin(x) at x=π/2', () => {
            const result = forwardDifference(Math.sin, Math.PI / 2, 1e-5);
            expect(result).toBeCloseTo(0, 4);
        });

        test('should differentiate e^x at x=0', () => {
            const result = forwardDifference(Math.exp, 0, 1e-5);
            expect(result).toBeCloseTo(1, 4);
        });

        test('should differentiate constant functions to 0', () => {
            const result = forwardDifference(() => 5, 10, 1e-5);
            expect(result).toBeCloseTo(0, 4);
        });

        test('should differentiate linear functions to constant', () => {
            const f = (x: number) => 3 * x + 2;
            const result = forwardDifference(f, 5, 1e-5);
            expect(result).toBeCloseTo(3, 4);
        });
    });

    describe('Backward Difference', () => {
        test('should differentiate x^2 at x=2', () => {
            const f = (x: number) => x * x;
            const result = backwardDifference(f, 2, 1e-5);
            expect(result).toBeCloseTo(4, 4);
        });

        test('should differentiate cos(x) at x=0', () => {
            const result = backwardDifference(Math.cos, 0, 1e-5);
            expect(result).toBeCloseTo(0, 4);
        });

        test('should differentiate ln(x) at x=1', () => {
            const result = backwardDifference(Math.log, 1, 1e-5);
            expect(result).toBeCloseTo(1, 4);
        });

        test('should match forward difference approximately', () => {
            const f = (x: number) => x * x * x;
            const x = 3;
            const h = 1e-5;

            const forward = forwardDifference(f, x, h);
            const backward = backwardDifference(f, x, h);

            expect(forward).toBeCloseTo(backward, 3);
        });
    });

    describe('Central Difference', () => {
        test('should differentiate x^2 at x=2 with higher accuracy', () => {
            const f = (x: number) => x * x;
            const result = centralDifference(f, 2, 1e-5);
            expect(result).toBeCloseTo(4, 8);
        });

        test('should differentiate sin(x) at x=π/4', () => {
            const result = centralDifference(Math.sin, Math.PI / 4, 1e-5);
            expect(result).toBeCloseTo(Math.sqrt(2) / 2, 6);
        });

        test('should differentiate tan(x) at x=0', () => {
            const result = centralDifference(Math.tan, 0, 1e-5);
            expect(result).toBeCloseTo(1, 6);
        });

        test('should be more accurate than forward difference', () => {
            const f = (x: number) => Math.exp(x);
            const x = 1;
            const h = 1e-3;
            const exact = Math.E;

            const forward = forwardDifference(f, x, h);
            const central = centralDifference(f, x, h);

            expect(Math.abs(central - exact)).toBeLessThan(Math.abs(forward - exact));
        });

        test('should handle negative x values', () => {
            const f = (x: number) => x * x * x;
            const result = centralDifference(f, -2, 1e-5);
            expect(result).toBeCloseTo(12, 6);
        });
    });

    describe('5-Point Central Difference', () => {
        test('should be more accurate than 3-point central difference', () => {
            const f = (x: number) => Math.sin(x);
            const x = Math.PI / 3;
            const h = 1e-2;
            const exact = Math.cos(x);

            const central3 = centralDifference(f, x, h);
            const central5 = centralDifference5Point(f, x, h);

            expect(Math.abs(central5 - exact)).toBeLessThan(Math.abs(central3 - exact));
        });

        test('should differentiate polynomials accurately', () => {
            const f = (x: number) => x ** 4 - 2 * x ** 3 + x ** 2;
            const df = (x: number) => 4 * x ** 3 - 6 * x ** 2 + 2 * x;

            const x = 2;
            const result = centralDifference5Point(f, x, 1e-4);
            expect(result).toBeCloseTo(df(x), 6);
        });
    });

    describe('Second Derivative', () => {
        test('should compute second derivative of x^2', () => {
            const f = (x: number) => x * x;
            const result = secondDerivative(f, 5, 1e-5);
            expect(result).toBeCloseTo(2, 4);
        });

        test('should compute second derivative of sin(x) at x=0', () => {
            const result = secondDerivative(Math.sin, 0, 1e-5);
            expect(result).toBeCloseTo(0, 5);
        });

        test('should compute second derivative of sin(x) at x=π/2', () => {
            const result = secondDerivative(Math.sin, Math.PI / 2, 1e-5);
            expect(result).toBeCloseTo(-1, 4);
        });

        test('should compute second derivative of e^x', () => {
            const x = 2;
            const result = secondDerivative(Math.exp, x, 1e-5);
            expect(result).toBeCloseTo(Math.exp(x), 4);
        });

        test('should compute second derivative of x^3', () => {
            const f = (x: number) => x * x * x;
            const x = 4;
            const result = secondDerivative(f, x, 1e-5);
            expect(result).toBeCloseTo(6 * x, 3);
        });
    });

    describe('General Derivative Function', () => {
        test('should compute first derivative with default options', () => {
            const f = (x: number) => x * x;
            const result = derivative(f, 3);
            expect(result.value).toBeCloseTo(6, 6);
            expect(result.evaluations).toBe(2);
        });

        test('should support different methods', () => {
            const f = (x: number) => x * x * x;
            const x = 2;

            const forward = derivative(f, x, { method: 'forward' });
            const backward = derivative(f, x, { method: 'backward' });
            const central = derivative(f, x, { method: 'central' });

            const exact = 3 * x * x;

            expect(forward.value).toBeCloseTo(exact, 3);
            expect(backward.value).toBeCloseTo(exact, 3);
            expect(central.value).toBeCloseTo(exact, 6);
        });

        test('should compute second derivative with order=2', () => {
            const f = (x: number) => x * x * x;
            const result = derivative(f, 2, { order: 2 });
            expect(result.value).toBeCloseTo(12, 4);
            expect(result.evaluations).toBe(3);
        });

        test('should compute higher-order derivatives', () => {
            const f = (x: number) => x ** 4;
            const df3 = (x: number) => 24 * x; // Third derivative

            const result = derivative(f, 2, { order: 3 });
            expect(result.value).toBeCloseTo(df3(2), 1);
        });

        test('should respect custom step size', () => {
            const f = (x: number) => Math.sin(x);
            const result = derivative(f, Math.PI / 4, { h: 1e-8 });
            expect(result.value).toBeCloseTo(Math.sqrt(2) / 2, 6);
        });
    });

    describe('Richardson Extrapolation', () => {
        test('should achieve high accuracy for smooth functions', () => {
            const f = (x: number) => Math.exp(x);
            const x = 1;
            const result = richardson(f, x, { levels: 5 });

            expect(result.value).toBeCloseTo(Math.E, 10);
            expect(result.error).toBeDefined();
            expect(result.error!).toBeLessThan(1e-10);
        });

        test('should differentiate sin(x) with high precision', () => {
            const result = richardson(Math.sin, Math.PI / 6, { levels: 5 });
            expect(result.value).toBeCloseTo(Math.sqrt(3) / 2, 10);
        });

        test('should differentiate polynomials accurately', () => {
            const f = (x: number) => x ** 5 - 3 * x ** 3 + 2 * x;
            const df = (x: number) => 5 * x ** 4 - 9 * x ** 2 + 2;

            const x = 1.5;
            const result = richardson(f, x, { levels: 4 });
            expect(result.value).toBeCloseTo(df(x), 8);
        });

        test('should respect initial step size', () => {
            const f = (x: number) => x * x;
            const result = richardson(f, 2, { h: 0.5, levels: 3 });
            expect(result.value).toBeCloseTo(4, 6);
        });

        test('should provide error estimate', () => {
            const f = (x: number) => Math.cos(x);
            const result = richardson(f, Math.PI / 4, { levels: 5 });

            expect(result.error).toBeDefined();
            // Error should be defined (may be very small for accurate methods)
            expect(result.error!).toBeGreaterThanOrEqual(0);
        });

        test('should be more accurate than simple central difference', () => {
            const f = (x: number) => Math.sin(x);
            const x = Math.PI / 3;
            const exact = Math.cos(x);

            const simple = centralDifference(f, x, 1e-3);
            const rich = richardson(f, x, { h: 1e-3, levels: 4 });

            expect(Math.abs(rich.value - exact)).toBeLessThan(Math.abs(simple - exact));
        });
    });

    describe('Partial Derivatives', () => {
        test('should compute partial derivative with respect to x', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const result = partial(f, [2, 3], 0);
            expect(result).toBeCloseTo(4, 5);
        });

        test('should compute partial derivative with respect to y', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const result = partial(f, [2, 3], 1);
            expect(result).toBeCloseTo(6, 5);
        });

        test('should handle mixed terms', () => {
            const f = ([x, y]: number[]) => x * y;
            const df_dx = partial(f, [2, 3], 0);
            const df_dy = partial(f, [2, 3], 1);

            expect(df_dx).toBeCloseTo(3, 5);
            expect(df_dy).toBeCloseTo(2, 5);
        });

        test('should handle 3D functions', () => {
            const f = ([x, y, z]: number[]) => x * y * z;
            const df_dx = partial(f, [2, 3, 4], 0);
            const df_dy = partial(f, [2, 3, 4], 1);
            const df_dz = partial(f, [2, 3, 4], 2);

            expect(df_dx).toBeCloseTo(12, 4);
            expect(df_dy).toBeCloseTo(8, 4);
            expect(df_dz).toBeCloseTo(6, 4);
        });
    });

    describe('Gradient', () => {
        test('should compute gradient of x^2 + y^2', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const grad = gradient(f, [1, 2]);

            expect(grad).toHaveLength(2);
            expect(grad[0]).toBeCloseTo(2, 5);
            expect(grad[1]).toBeCloseTo(4, 5);
        });

        test('should compute gradient of x*y', () => {
            const f = ([x, y]: number[]) => x * y;
            const grad = gradient(f, [3, 4]);

            expect(grad[0]).toBeCloseTo(4, 5);
            expect(grad[1]).toBeCloseTo(3, 5);
        });

        test('should handle 3D gradients', () => {
            const f = ([x, y, z]: number[]) => x * x + y * y + z * z;
            const grad = gradient(f, [1, 2, 3]);

            expect(grad).toHaveLength(3);
            expect(grad[0]).toBeCloseTo(2, 5);
            expect(grad[1]).toBeCloseTo(4, 5);
            expect(grad[2]).toBeCloseTo(6, 5);
        });

        test('should compute gradient of polynomial', () => {
            const f = ([x, y]: number[]) => x ** 3 + 2 * x * y + y ** 2;
            const grad = gradient(f, [2, 1]);

            // ∂f/∂x = 3x² + 2y = 12 + 2 = 14
            // ∂f/∂y = 2x + 2y = 4 + 2 = 6
            expect(grad[0]).toBeCloseTo(14, 4);
            expect(grad[1]).toBeCloseTo(6, 4);
        });
    });

    describe('Jacobian Matrix', () => {
        test('should compute Jacobian of linear transformation', () => {
            const F = ([x, y]: number[]) => [2 * x + y, x - 3 * y];
            const J = jacobian(F, [1, 1]);

            expect(J).toHaveLength(2);
            expect(J[0]).toHaveLength(2);
            expect(J[0][0]).toBeCloseTo(2, 4);
            expect(J[0][1]).toBeCloseTo(1, 4);
            expect(J[1][0]).toBeCloseTo(1, 4);
            expect(J[1][1]).toBeCloseTo(-3, 4);
        });

        test('should compute Jacobian of nonlinear transformation', () => {
            const F = ([x, y]: number[]) => [x * x, x * y, y * y];
            const J = jacobian(F, [2, 3]);

            expect(J).toHaveLength(3);
            expect(J[0][0]).toBeCloseTo(4, 4); // ∂(x²)/∂x = 2x
            expect(J[0][1]).toBeCloseTo(0, 4); // ∂(x²)/∂y = 0
            expect(J[1][0]).toBeCloseTo(3, 4); // ∂(xy)/∂x = y
            expect(J[1][1]).toBeCloseTo(2, 4); // ∂(xy)/∂y = x
            expect(J[2][0]).toBeCloseTo(0, 4); // ∂(y²)/∂x = 0
            expect(J[2][1]).toBeCloseTo(6, 4); // ∂(y²)/∂y = 2y
        });

        test('should compute Jacobian for polar to Cartesian conversion', () => {
            // F(r,θ) = (r·cos(θ), r·sin(θ))
            const F = ([r, theta]: number[]) => [r * Math.cos(theta), r * Math.sin(theta)];
            const J = jacobian(F, [2, Math.PI / 4]);

            // ∂x/∂r = cos(θ), ∂x/∂θ = -r·sin(θ)
            // ∂y/∂r = sin(θ), ∂y/∂θ = r·cos(θ)
            expect(J[0][0]).toBeCloseTo(Math.sqrt(2) / 2, 3);
            expect(J[0][1]).toBeCloseTo(-Math.sqrt(2), 3);
            expect(J[1][0]).toBeCloseTo(Math.sqrt(2) / 2, 3);
            expect(J[1][1]).toBeCloseTo(Math.sqrt(2), 3);
        });
    });

    describe('Hessian Matrix', () => {
        test('should compute Hessian of x^2 + y^2', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const H = hessian(f, [1, 1]);

            expect(H).toHaveLength(2);
            expect(H[0][0]).toBeCloseTo(2, 3);
            expect(H[0][1]).toBeCloseTo(0, 3);
            expect(H[1][0]).toBeCloseTo(0, 3);
            expect(H[1][1]).toBeCloseTo(2, 3);
        });

        test('should compute Hessian with mixed partials', () => {
            const f = ([x, y]: number[]) => x * y;
            const H = hessian(f, [2, 3]);

            expect(H[0][0]).toBeCloseTo(0, 3);
            expect(H[0][1]).toBeCloseTo(1, 3);
            expect(H[1][0]).toBeCloseTo(1, 3);
            expect(H[1][1]).toBeCloseTo(0, 3);
        });

        test('should be symmetric', () => {
            const f = ([x, y]: number[]) => x ** 3 + 2 * x * y ** 2 + y ** 3;
            const H = hessian(f, [1, 2]);

            expect(H[0][1]).toBeCloseTo(H[1][0], 3);
        });

        test('should compute Hessian of Rosenbrock function', () => {
            // f(x,y) = (1-x)² + 100(y-x²)²
            const f = ([x, y]: number[]) => (1 - x) ** 2 + 100 * (y - x * x) ** 2;
            const H = hessian(f, [1, 1]);

            // At (1,1): H = [[802, -400], [-400, 200]]
            expect(H[0][0]).toBeCloseTo(802, 0);
            expect(H[0][1]).toBeCloseTo(-400, 0);
            expect(H[1][0]).toBeCloseTo(-400, 0);
            expect(H[1][1]).toBeCloseTo(200, 0);
        });

        test('should handle 3D Hessian', () => {
            const f = ([x, y, z]: number[]) => x * x + y * y + z * z;
            const H = hessian(f, [1, 1, 1]);

            expect(H).toHaveLength(3);
            expect(H[0][0]).toBeCloseTo(2, 3);
            expect(H[1][1]).toBeCloseTo(2, 3);
            expect(H[2][2]).toBeCloseTo(2, 3);

            // Off-diagonal should be zero
            expect(H[0][1]).toBeCloseTo(0, 3);
            expect(H[0][2]).toBeCloseTo(0, 3);
            expect(H[1][2]).toBeCloseTo(0, 3);
        });
    });

    describe('Directional Derivative', () => {
        test('should compute directional derivative in x direction', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const result = directional(f, [1, 2], [1, 0]);

            // Gradient is [2, 4], direction is [1, 0]
            expect(result).toBeCloseTo(2, 5);
        });

        test('should compute directional derivative in y direction', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const result = directional(f, [1, 2], [0, 1]);

            // Gradient is [2, 4], direction is [0, 1]
            expect(result).toBeCloseTo(4, 5);
        });

        test('should normalize direction vector', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const result = directional(f, [1, 1], [1, 1]);

            // Gradient is [2, 2], normalized direction is [1/√2, 1/√2]
            // Result: 2·1/√2 + 2·1/√2 = 4/√2 = 2√2
            expect(result).toBeCloseTo(2 * Math.sqrt(2), 5);
        });

        test('should handle 3D directional derivatives', () => {
            const f = ([x, y, z]: number[]) => x * x + y * y + z * z;
            const result = directional(f, [1, 1, 1], [1, 0, 0]);

            // Gradient is [2, 2, 2], direction is [1, 0, 0]
            expect(result).toBeCloseTo(2, 5);
        });

        test('should compute maximum rate of change in gradient direction', () => {
            const f = ([x, y]: number[]) => x * x + y * y;
            const point = [3, 4];
            const grad = gradient(f, point);
            const gradMagnitude = Math.sqrt(grad[0] ** 2 + grad[1] ** 2);

            const result = directional(f, point, grad);

            expect(result).toBeCloseTo(gradMagnitude, 4);
        });
    });

    describe('Edge Cases', () => {
        test('should handle functions near zero', () => {
            const f = (x: number) => x * x;
            const result = centralDifference(f, 0, 1e-5);
            expect(result).toBeCloseTo(0, 4);
        });

        test('should handle very small step sizes', () => {
            const f = (x: number) => x * x;
            const result = centralDifference(f, 2, 1e-10);
            expect(result).toBeCloseTo(4, 6);
        });

        test('should handle negative values', () => {
            const f = (x: number) => x * x * x;
            const result = derivative(f, -3);
            expect(result.value).toBeCloseTo(27, 5);
        });

        test('should handle discontinuous functions at smooth points', () => {
            const f = (x: number) => (x < 0 ? -x : x);
            const result = centralDifference(f, 1, 1e-5);
            expect(result).toBeCloseTo(1, 4);
        });
    });

    describe('Accuracy Comparisons', () => {
        test('central difference should be more accurate than forward', () => {
            const f = (x: number) => Math.exp(x);
            const x = 1;
            const h = 1e-3;
            const exact = Math.E;

            const forward = forwardDifference(f, x, h);
            const central = centralDifference(f, x, h);

            expect(Math.abs(central - exact)).toBeLessThan(Math.abs(forward - exact));
        });

        test('5-point should be more accurate than 3-point', () => {
            const f = (x: number) => Math.sin(x);
            const x = 1;
            const h = 1e-2;
            const exact = Math.cos(x);

            const central3 = centralDifference(f, x, h);
            const central5 = centralDifference5Point(f, x, h);

            expect(Math.abs(central5 - exact)).toBeLessThan(Math.abs(central3 - exact));
        });

        test('Richardson should be most accurate', () => {
            const f = (x: number) => Math.exp(x);
            const x = 1;
            const exact = Math.E;

            const central = centralDifference(f, x, 1e-3);
            const rich = richardson(f, x, { h: 1e-3, levels: 4 });

            expect(Math.abs(rich.value - exact)).toBeLessThan(Math.abs(central - exact));
        });
    });
});
