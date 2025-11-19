import {
    Expression,
    Constant,
    Variable,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Negate
} from '../../src/symbolic/expression';

describe('Expression System', () => {
    describe('Constant', () => {
        it('should create and evaluate a constant', () => {
            const c = new Constant(42);
            expect(c.evaluate()).toBe(42);
            expect(c.toString()).toBe('42');
            expect(c.toLatex()).toBe('42');
        });

        it('should check equality', () => {
            const c1 = new Constant(42);
            const c2 = new Constant(42);
            const c3 = new Constant(43);

            expect(c1.equals(c2)).toBe(true);
            expect(c1.equals(c3)).toBe(false);
        });

        it('should simplify to itself', () => {
            const c = new Constant(42);
            expect(c.simplify()).toEqual(c);
        });
    });

    describe('Variable', () => {
        it('should create and evaluate a variable', () => {
            const x = new Variable('x');
            const vars = new Map([['x', 5]]);

            expect(x.evaluate(vars)).toBe(5);
            expect(x.toString()).toBe('x');
            expect(x.toLatex()).toBe('x');
        });

        it('should throw error when variable is undefined', () => {
            const x = new Variable('x');
            expect(() => x.evaluate()).toThrow();
        });

        it('should check equality', () => {
            const x1 = new Variable('x');
            const x2 = new Variable('x');
            const y = new Variable('y');

            expect(x1.equals(x2)).toBe(true);
            expect(x1.equals(y)).toBe(false);
        });

        it('should get variables', () => {
            const x = new Variable('x');
            const vars = x.getVariables();

            expect(vars.size).toBe(1);
            expect(vars.has('x')).toBe(true);
        });
    });

    describe('Add', () => {
        it('should add constants', () => {
            const expr = new Add([new Constant(2), new Constant(3)]);
            expect(expr.evaluate()).toBe(5);
        });

        it('should add variables', () => {
            const expr = new Add([new Variable('x'), new Variable('y')]);
            const vars = new Map([['x', 2], ['y', 3]]);

            expect(expr.evaluate(vars)).toBe(5);
        });

        it('should simplify constant additions', () => {
            const expr = new Add([new Constant(2), new Constant(3)]);
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Constant);
            expect((simplified as Constant).value).toBe(5);
        });

        it('should simplify mixed expressions', () => {
            const expr = new Add([
                new Constant(2),
                new Variable('x'),
                new Constant(3)
            ]);
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Add);
        });

        it('should get all variables', () => {
            const expr = new Add([new Variable('x'), new Variable('y')]);
            const vars = expr.getVariables();

            expect(vars.size).toBe(2);
            expect(vars.has('x')).toBe(true);
            expect(vars.has('y')).toBe(true);
        });
    });

    describe('Subtract', () => {
        it('should subtract constants', () => {
            const expr = new Subtract(new Constant(5), new Constant(3));
            expect(expr.evaluate()).toBe(2);
        });

        it('should simplify constant subtractions', () => {
            const expr = new Subtract(new Constant(5), new Constant(3));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Constant);
            expect((simplified as Constant).value).toBe(2);
        });

        it('should simplify subtracting zero', () => {
            const expr = new Subtract(new Variable('x'), new Constant(0));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Variable);
        });
    });

    describe('Multiply', () => {
        it('should multiply constants', () => {
            const expr = new Multiply([new Constant(2), new Constant(3)]);
            expect(expr.evaluate()).toBe(6);
        });

        it('should multiply variables', () => {
            const expr = new Multiply([new Variable('x'), new Variable('y')]);
            const vars = new Map([['x', 2], ['y', 3]]);

            expect(expr.evaluate(vars)).toBe(6);
        });

        it('should simplify constant multiplications', () => {
            const expr = new Multiply([new Constant(2), new Constant(3)]);
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Constant);
            expect((simplified as Constant).value).toBe(6);
        });

        it('should simplify multiplication by zero', () => {
            const expr = new Multiply([new Variable('x'), new Constant(0)]);
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Constant);
            expect((simplified as Constant).value).toBe(0);
        });

        it('should simplify multiplication by one', () => {
            const expr = new Multiply([new Variable('x'), new Constant(1)]);
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Variable);
        });
    });

    describe('Divide', () => {
        it('should divide constants', () => {
            const expr = new Divide(new Constant(6), new Constant(2));
            expect(expr.evaluate()).toBe(3);
        });

        it('should throw error on division by zero', () => {
            const expr = new Divide(new Constant(6), new Constant(0));
            expect(() => expr.evaluate()).toThrow();
        });

        it('should simplify constant divisions', () => {
            const expr = new Divide(new Constant(6), new Constant(2));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Constant);
            expect((simplified as Constant).value).toBe(3);
        });

        it('should simplify division by one', () => {
            const expr = new Divide(new Variable('x'), new Constant(1));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Variable);
        });

        it('should format as LaTeX fraction', () => {
            const expr = new Divide(new Variable('x'), new Constant(2));
            expect(expr.toLatex()).toBe('\\frac{x}{2}');
        });
    });

    describe('Power', () => {
        it('should compute powers', () => {
            const expr = new Power(new Constant(2), new Constant(3));
            expect(expr.evaluate()).toBe(8);
        });

        it('should simplify constant powers', () => {
            const expr = new Power(new Constant(2), new Constant(3));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Constant);
            expect((simplified as Constant).value).toBe(8);
        });

        it('should simplify x^0 to 1', () => {
            const expr = new Power(new Variable('x'), new Constant(0));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Constant);
            expect((simplified as Constant).value).toBe(1);
        });

        it('should simplify x^1 to x', () => {
            const expr = new Power(new Variable('x'), new Constant(1));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Variable);
        });

        it('should format with superscript in Unicode', () => {
            const expr = new Power(new Variable('x'), new Constant(2));
            expect(expr.toUnicode()).toBe('x²');
        });
    });

    describe('Negate', () => {
        it('should negate a constant', () => {
            const expr = new Negate(new Constant(5));
            expect(expr.evaluate()).toBe(-5);
        });

        it('should simplify negated constant', () => {
            const expr = new Negate(new Constant(5));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Constant);
            expect((simplified as Constant).value).toBe(-5);
        });

        it('should simplify double negation', () => {
            const expr = new Negate(new Negate(new Variable('x')));
            const simplified = expr.simplify();

            expect(simplified).toBeInstanceOf(Variable);
        });
    });

    describe('Complex Expressions', () => {
        it('should evaluate complex expression', () => {
            // (2 + 3) * 4 = 20
            const expr = new Multiply([
                new Add([new Constant(2), new Constant(3)]),
                new Constant(4)
            ]);

            expect(expr.evaluate()).toBe(20);
        });

        it('should evaluate polynomial expression', () => {
            // x^2 + 2*x + 1 at x=3 = 16
            const expr = new Add([
                new Power(new Variable('x'), new Constant(2)),
                new Multiply([new Constant(2), new Variable('x')]),
                new Constant(1)
            ]);

            const vars = new Map([['x', 3]]);
            expect(expr.evaluate(vars)).toBe(16);
        });

        it('should clone expressions', () => {
            const expr = new Add([new Constant(2), new Variable('x')]);
            const cloned = expr.clone();

            expect(cloned.equals(expr)).toBe(true);
            expect(cloned).not.toBe(expr);
        });
    });
});
