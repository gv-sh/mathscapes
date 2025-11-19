import {
    Variable,
    Constant,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Negate,
    Sin,
    Cos,
    Tan,
    Exp,
    Ln,
    Log,
    Sqrt,
    Asin,
    Acos,
    Atan,
    differentiate,
    nthDerivative,
    partialDerivatives,
    gradient,
    jacobian,
    hessian,
    directionalDerivative
} from '../../src/symbolic';

describe('Symbolic Differentiation', () => {
    describe('Basic Rules', () => {
        it('should differentiate constants to zero', () => {
            const expr = new Constant(5);
            const result = differentiate(expr, 'x');
            expect(result).toBeInstanceOf(Constant);
            expect((result as Constant).value).toBe(0);
        });

        it('should differentiate variable with respect to itself to one', () => {
            const expr = new Variable('x');
            const result = differentiate(expr, 'x');
            expect(result).toBeInstanceOf(Constant);
            expect((result as Constant).value).toBe(1);
        });

        it('should differentiate variable with respect to different variable to zero', () => {
            const expr = new Variable('y');
            const result = differentiate(expr, 'x');
            expect(result).toBeInstanceOf(Constant);
            expect((result as Constant).value).toBe(0);
        });
    });

    describe('Power Rule', () => {
        it('should differentiate x^2', () => {
            // d/dx(x^2) = 2x
            const expr = new Power(new Variable('x'), new Constant(2));
            const result = differentiate(expr, 'x');
            const expected = new Multiply([
                new Constant(2),
                new Power(new Variable('x'), new Constant(1))
            ]).simplify();

            expect(result.toString()).toBe(expected.toString());
        });

        it('should differentiate x^3', () => {
            // d/dx(x^3) = 3x^2
            const expr = new Power(new Variable('x'), new Constant(3));
            const result = differentiate(expr, 'x');

            // Evaluate at x=2: 3*2^2 = 12
            const vars = new Map([['x', 2]]);
            expect(result.evaluate(vars)).toBeCloseTo(12);
        });

        it('should differentiate x^0.5 (square root)', () => {
            // d/dx(x^0.5) = 0.5 * x^(-0.5)
            const expr = new Power(new Variable('x'), new Constant(0.5));
            const result = differentiate(expr, 'x');

            // Evaluate at x=4: 0.5 * 4^(-0.5) = 0.5 * 0.5 = 0.25
            const vars = new Map([['x', 4]]);
            expect(result.evaluate(vars)).toBeCloseTo(0.25);
        });
    });

    describe('Sum and Difference Rules', () => {
        it('should differentiate sum of terms', () => {
            // d/dx(x^2 + 3x + 5) = 2x + 3
            const expr = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Multiply([new Constant(3), new Variable('x')]),
                new Constant(5)
            ]);
            const result = differentiate(expr, 'x');

            // Evaluate at x=2: 2*2 + 3 = 7
            const vars = new Map([['x', 2]]);
            expect(result.evaluate(vars)).toBeCloseTo(7);
        });

        it('should differentiate difference', () => {
            // d/dx(x^2 - x) = 2x - 1
            const expr = new Subtract(
                new Power(new Variable('x'), new Constant(2)),
                new Variable('x')
            );
            const result = differentiate(expr, 'x');

            // Evaluate at x=3: 2*3 - 1 = 5
            const vars = new Map([['x', 3]]);
            expect(result.evaluate(vars)).toBeCloseTo(5);
        });
    });

    describe('Product Rule', () => {
        it('should differentiate product of two terms', () => {
            // d/dx(x * x^2) = x^2 + x * 2x = x^2 + 2x^2 = 3x^2
            const expr = new Multiply([
                new Variable('x'),
                new Power(new Variable('x'), new Constant(2))
            ]);
            const result = differentiate(expr, 'x');

            // Evaluate at x=2: 3*4 = 12
            const vars = new Map([['x', 2]]);
            expect(result.evaluate(vars)).toBeCloseTo(12);
        });

        it('should differentiate product of three terms', () => {
            // d/dx(x * x * x) = 3x^2
            const expr = new Multiply([
                new Variable('x'),
                new Variable('x'),
                new Variable('x')
            ]);
            const result = differentiate(expr, 'x');

            // Evaluate at x=2: 3*4 = 12
            const vars = new Map([['x', 2]]);
            expect(result.evaluate(vars)).toBeCloseTo(12);
        });
    });

    describe('Quotient Rule', () => {
        it('should differentiate quotient', () => {
            // d/dx(x^2 / x) = (2x * x - x^2 * 1) / x^2 = (2x^2 - x^2) / x^2 = x^2 / x^2 = 1
            // Alternatively: x^2/x = x, so d/dx(x) = 1
            const expr = new Divide(
                new Power(new Variable('x'), new Constant(2)),
                new Variable('x')
            );
            const result = differentiate(expr, 'x');

            // Evaluate at x=2: 1
            const vars = new Map([['x', 2]]);
            expect(result.evaluate(vars)).toBeCloseTo(1);
        });

        it('should differentiate 1/x', () => {
            // d/dx(1/x) = -1/x^2
            const expr = new Divide(new Constant(1), new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=2: -1/4 = -0.25
            const vars = new Map([['x', 2]]);
            expect(result.evaluate(vars)).toBeCloseTo(-0.25);
        });
    });

    describe('Chain Rule', () => {
        it('should differentiate (2x)^2', () => {
            // d/dx((2x)^2) = 2 * (2x) * 2 = 8x
            const expr = new Power(
                new Multiply([new Constant(2), new Variable('x')]),
                new Constant(2)
            );
            const result = differentiate(expr, 'x');

            // Evaluate at x=3: 8*3 = 24
            const vars = new Map([['x', 3]]);
            expect(result.evaluate(vars)).toBeCloseTo(24);
        });
    });

    describe('Trigonometric Functions', () => {
        it('should differentiate sin(x)', () => {
            // d/dx(sin(x)) = cos(x)
            const expr = new Sin(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=0: cos(0) = 1
            const vars = new Map([['x', 0]]);
            expect(result.evaluate(vars)).toBeCloseTo(1);
        });

        it('should differentiate cos(x)', () => {
            // d/dx(cos(x)) = -sin(x)
            const expr = new Cos(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=0: -sin(0) = 0
            const vars = new Map([['x', 0]]);
            expect(result.evaluate(vars)).toBeCloseTo(0);
        });

        it('should differentiate tan(x)', () => {
            // d/dx(tan(x)) = sec^2(x) = 1/cos^2(x)
            const expr = new Tan(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=0: 1/cos^2(0) = 1
            const vars = new Map([['x', 0]]);
            expect(result.evaluate(vars)).toBeCloseTo(1);
        });

        it('should differentiate sin(2x) using chain rule', () => {
            // d/dx(sin(2x)) = cos(2x) * 2
            const expr = new Sin(new Multiply([new Constant(2), new Variable('x')]));
            const result = differentiate(expr, 'x');

            // Evaluate at x=0: cos(0) * 2 = 2
            const vars = new Map([['x', 0]]);
            expect(result.evaluate(vars)).toBeCloseTo(2);
        });
    });

    describe('Inverse Trigonometric Functions', () => {
        it('should differentiate asin(x)', () => {
            // d/dx(asin(x)) = 1/sqrt(1-x^2)
            const expr = new Asin(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=0: 1/sqrt(1) = 1
            const vars = new Map([['x', 0]]);
            expect(result.evaluate(vars)).toBeCloseTo(1);
        });

        it('should differentiate acos(x)', () => {
            // d/dx(acos(x)) = -1/sqrt(1-x^2)
            const expr = new Acos(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=0: -1/sqrt(1) = -1
            const vars = new Map([['x', 0]]);
            expect(result.evaluate(vars)).toBeCloseTo(-1);
        });

        it('should differentiate atan(x)', () => {
            // d/dx(atan(x)) = 1/(1+x^2)
            const expr = new Atan(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=0: 1/(1+0) = 1
            const vars = new Map([['x', 0]]);
            expect(result.evaluate(vars)).toBeCloseTo(1);
        });
    });

    describe('Exponential and Logarithmic Functions', () => {
        it('should differentiate exp(x)', () => {
            // d/dx(exp(x)) = exp(x)
            const expr = new Exp(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=0: exp(0) = 1
            const vars = new Map([['x', 0]]);
            expect(result.evaluate(vars)).toBeCloseTo(1);
        });

        it('should differentiate ln(x)', () => {
            // d/dx(ln(x)) = 1/x
            const expr = new Ln(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=2: 1/2 = 0.5
            const vars = new Map([['x', 2]]);
            expect(result.evaluate(vars)).toBeCloseTo(0.5);
        });

        it('should differentiate log(x)', () => {
            // d/dx(log(x)) = 1/(x*ln(10))
            const expr = new Log(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=10: 1/(10*ln(10))
            const vars = new Map([['x', 10]]);
            expect(result.evaluate(vars)).toBeCloseTo(1 / (10 * Math.LN10));
        });

        it('should differentiate sqrt(x)', () => {
            // d/dx(sqrt(x)) = 1/(2*sqrt(x))
            const expr = new Sqrt(new Variable('x'));
            const result = differentiate(expr, 'x');

            // Evaluate at x=4: 1/(2*2) = 0.25
            const vars = new Map([['x', 4]]);
            expect(result.evaluate(vars)).toBeCloseTo(0.25);
        });
    });

    describe('Higher-Order Derivatives', () => {
        it('should compute second derivative of x^3', () => {
            // d/dx(x^3) = 3x^2
            // d^2/dx^2(x^3) = 6x
            const expr = new Power(new Variable('x'), new Constant(3));
            const result = nthDerivative(expr, 'x', 2);

            // Evaluate at x=2: 6*2 = 12
            const vars = new Map([['x', 2]]);
            expect(result.evaluate(vars)).toBeCloseTo(12);
        });

        it('should compute third derivative of x^4', () => {
            // d^3/dx^3(x^4) = 24x
            const expr = new Power(new Variable('x'), new Constant(4));
            const result = nthDerivative(expr, 'x', 3);

            // Evaluate at x=1: 24
            const vars = new Map([['x', 1]]);
            expect(result.evaluate(vars)).toBeCloseTo(24);
        });

        it('should return original expression for 0th derivative', () => {
            const expr = new Power(new Variable('x'), new Constant(2));
            const result = nthDerivative(expr, 'x', 0);

            expect(result.toString()).toBe(expr.toString());
        });
    });

    describe('Partial Derivatives', () => {
        it('should compute partial derivatives of x^2 + y^2', () => {
            // f(x, y) = x^2 + y^2
            // ∂f/∂x = 2x, ∂f/∂y = 2y
            const expr = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Power(new Variable('y'), new Constant(2))
            ]);

            const partials = partialDerivatives(expr, ['x', 'y']);

            const vars = new Map([['x', 3], ['y', 4]]);
            expect(partials.get('x')!.evaluate(vars)).toBeCloseTo(6);
            expect(partials.get('y')!.evaluate(vars)).toBeCloseTo(8);
        });

        it('should compute partial derivatives of x*y', () => {
            // f(x, y) = x*y
            // ∂f/∂x = y, ∂f/∂y = x
            const expr = new Multiply([new Variable('x'), new Variable('y')]);

            const partials = partialDerivatives(expr, ['x', 'y']);

            const vars = new Map([['x', 3], ['y', 4]]);
            expect(partials.get('x')!.evaluate(vars)).toBeCloseTo(4);
            expect(partials.get('y')!.evaluate(vars)).toBeCloseTo(3);
        });
    });

    describe('Gradient', () => {
        it('should compute gradient of x^2 + y^2', () => {
            // f(x, y) = x^2 + y^2
            // ∇f = [2x, 2y]
            const expr = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Power(new Variable('y'), new Constant(2))
            ]);

            const grad = gradient(expr, ['x', 'y']);

            const vars = new Map([['x', 3], ['y', 4]]);
            expect(grad[0].evaluate(vars)).toBeCloseTo(6);
            expect(grad[1].evaluate(vars)).toBeCloseTo(8);
        });
    });

    describe('Jacobian', () => {
        it('should compute Jacobian of [x^2, y^2]', () => {
            // f(x, y) = [x^2, y^2]
            // J = [[2x, 0], [0, 2y]]
            const exprs = [
                new Power(new Variable('x'), new Constant(2)),
                new Power(new Variable('y'), new Constant(2))
            ];

            const J = jacobian(exprs, ['x', 'y']);

            const vars = new Map([['x', 3], ['y', 4]]);
            expect(J[0][0].evaluate(vars)).toBeCloseTo(6);
            expect(J[0][1].evaluate(vars)).toBeCloseTo(0);
            expect(J[1][0].evaluate(vars)).toBeCloseTo(0);
            expect(J[1][1].evaluate(vars)).toBeCloseTo(8);
        });

        it('should compute Jacobian of [x*y, x+y]', () => {
            // f(x, y) = [x*y, x+y]
            // J = [[y, x], [1, 1]]
            const exprs = [
                new Multiply([new Variable('x'), new Variable('y')]),
                new Add([new Variable('x'), new Variable('y')])
            ];

            const J = jacobian(exprs, ['x', 'y']);

            const vars = new Map([['x', 2], ['y', 3]]);
            expect(J[0][0].evaluate(vars)).toBeCloseTo(3);
            expect(J[0][1].evaluate(vars)).toBeCloseTo(2);
            expect(J[1][0].evaluate(vars)).toBeCloseTo(1);
            expect(J[1][1].evaluate(vars)).toBeCloseTo(1);
        });
    });

    describe('Hessian', () => {
        it('should compute Hessian of x^2 + y^2', () => {
            // f(x, y) = x^2 + y^2
            // H = [[2, 0], [0, 2]]
            const expr = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Power(new Variable('y'), new Constant(2))
            ]);

            const H = hessian(expr, ['x', 'y']);

            const vars = new Map([['x', 3], ['y', 4]]);
            expect(H[0][0].evaluate(vars)).toBeCloseTo(2);
            expect(H[0][1].evaluate(vars)).toBeCloseTo(0);
            expect(H[1][0].evaluate(vars)).toBeCloseTo(0);
            expect(H[1][1].evaluate(vars)).toBeCloseTo(2);
        });

        it('should compute Hessian of x*y', () => {
            // f(x, y) = x*y
            // ∂²f/∂x² = 0, ∂²f/∂x∂y = 1, ∂²f/∂y∂x = 1, ∂²f/∂y² = 0
            // H = [[0, 1], [1, 0]]
            const expr = new Multiply([new Variable('x'), new Variable('y')]);

            const H = hessian(expr, ['x', 'y']);

            const vars = new Map([['x', 3], ['y', 4]]);
            expect(H[0][0].evaluate(vars)).toBeCloseTo(0);
            expect(H[0][1].evaluate(vars)).toBeCloseTo(1);
            expect(H[1][0].evaluate(vars)).toBeCloseTo(1);
            expect(H[1][1].evaluate(vars)).toBeCloseTo(0);
        });
    });

    describe('Directional Derivative', () => {
        it('should compute directional derivative', () => {
            // f(x, y) = x^2 + y^2
            // ∇f = [2x, 2y]
            // D_v f = ∇f · v
            const expr = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Power(new Variable('y'), new Constant(2))
            ]);

            // Direction vector [1, 1]
            const direction = [new Constant(1), new Constant(1)];

            const result = directionalDerivative(expr, ['x', 'y'], direction);

            // At (3, 4): 2*3*1 + 2*4*1 = 6 + 8 = 14
            const vars = new Map([['x', 3], ['y', 4]]);
            expect(result.evaluate(vars)).toBeCloseTo(14);
        });
    });
});
