import { parse, parseAndSimplify } from '../../src/symbolic/parser';
import {
    Constant,
    Variable,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Negate
} from '../../src/symbolic/expression';
import { Sin, Cos, Sqrt } from '../../src/symbolic/functions';

describe('Expression Parser', () => {
    describe('Basic Parsing', () => {
        it('should parse numbers', () => {
            const expr = parse('42');
            expect(expr).toBeInstanceOf(Constant);
            expect((expr as Constant).value).toBe(42);
        });

        it('should parse decimal numbers', () => {
            const expr = parse('3.14');
            expect(expr).toBeInstanceOf(Constant);
            expect((expr as Constant).value).toBeCloseTo(3.14);
        });

        it('should parse variables', () => {
            const expr = parse('x');
            expect(expr).toBeInstanceOf(Variable);
            expect((expr as Variable).name).toBe('x');
        });

        it('should parse multi-character variables', () => {
            const expr = parse('alpha');
            expect(expr).toBeInstanceOf(Variable);
            expect((expr as Variable).name).toBe('alpha');
        });
    });

    describe('Binary Operations', () => {
        it('should parse addition', () => {
            const expr = parse('2 + 3');
            expect(expr).toBeInstanceOf(Add);
            expect(expr.evaluate()).toBe(5);
        });

        it('should parse subtraction', () => {
            const expr = parse('5 - 3');
            expect(expr).toBeInstanceOf(Subtract);
            expect(expr.evaluate()).toBe(2);
        });

        it('should parse multiplication', () => {
            const expr = parse('2 * 3');
            expect(expr).toBeInstanceOf(Multiply);
            expect(expr.evaluate()).toBe(6);
        });

        it('should parse division', () => {
            const expr = parse('6 / 2');
            expect(expr).toBeInstanceOf(Divide);
            expect(expr.evaluate()).toBe(3);
        });

        it('should parse power', () => {
            const expr = parse('2^3');
            expect(expr).toBeInstanceOf(Power);
            expect(expr.evaluate()).toBe(8);
        });
    });

    describe('Operator Precedence', () => {
        it('should respect multiplication before addition', () => {
            const expr = parse('2 + 3 * 4');
            expect(expr.evaluate()).toBe(14);
        });

        it('should respect division before subtraction', () => {
            const expr = parse('10 - 6 / 2');
            expect(expr.evaluate()).toBe(7);
        });

        it('should respect power before multiplication', () => {
            const expr = parse('2 * 3^2');
            expect(expr.evaluate()).toBe(18);
        });

        it('should handle right-associative power', () => {
            const expr = parse('2^2^3');
            expect(expr.evaluate()).toBe(256); // 2^(2^3) = 2^8 = 256
        });
    });

    describe('Parentheses', () => {
        it('should parse parenthesized expressions', () => {
            const expr = parse('(2 + 3) * 4');
            expect(expr.evaluate()).toBe(20);
        });

        it('should handle nested parentheses', () => {
            const expr = parse('((2 + 3) * 4) + 1');
            expect(expr.evaluate()).toBe(21);
        });

        it('should override precedence with parentheses', () => {
            const expr = parse('2 * (3 + 4)');
            expect(expr.evaluate()).toBe(14);
        });
    });

    describe('Negation', () => {
        it('should parse unary minus', () => {
            const expr = parse('-5');
            expect(expr).toBeInstanceOf(Negate);
            expect(expr.evaluate()).toBe(-5);
        });

        it('should parse negated variable', () => {
            const expr = parse('-x');
            const vars = new Map([['x', 5]]);
            expect(expr.evaluate(vars)).toBe(-5);
        });

        it('should parse negated expression', () => {
            const expr = parse('-(2 + 3)');
            expect(expr.evaluate()).toBe(-5);
        });
    });

    describe('Functions', () => {
        it('should parse sin function', () => {
            const expr = parse('sin(0)');
            expect(expr).toBeInstanceOf(Sin);
            expect(expr.evaluate()).toBeCloseTo(0);
        });

        it('should parse cos function', () => {
            const expr = parse('cos(0)');
            expect(expr).toBeInstanceOf(Cos);
            expect(expr.evaluate()).toBeCloseTo(1);
        });

        it('should parse sqrt function', () => {
            const expr = parse('sqrt(4)');
            expect(expr).toBeInstanceOf(Sqrt);
            expect(expr.evaluate()).toBe(2);
        });

        it('should parse nested functions', () => {
            const expr = parse('sin(cos(0))');
            expect(expr.evaluate()).toBeCloseTo(Math.sin(1));
        });

        it('should parse functions with expressions', () => {
            const expr = parse('sin(2 * 3.14159)');
            expect(expr.evaluate()).toBeCloseTo(Math.sin(2 * 3.14159));
        });
    });

    describe('Complex Expressions', () => {
        it('should parse polynomial', () => {
            const expr = parse('x^2 + 2*x + 1');
            const vars = new Map([['x', 3]]);
            expect(expr.evaluate(vars)).toBe(16);
        });

        it('should parse rational function', () => {
            const expr = parse('(x + 1) / (x - 1)');
            const vars = new Map([['x', 3]]);
            expect(expr.evaluate(vars)).toBe(2);
        });

        it('should parse expression with multiple variables', () => {
            const expr = parse('x^2 + y^2');
            const vars = new Map([['x', 3], ['y', 4]]);
            expect(expr.evaluate(vars)).toBe(25);
        });

        it('should parse complex nested expression', () => {
            const expr = parse('2 * (x + 1)^2 - 3 * x + 5');
            const vars = new Map([['x', 2]]);
            // 2 * (2+1)^2 - 3*2 + 5 = 2*9 - 6 + 5 = 17
            expect(expr.evaluate(vars)).toBe(17);
        });
    });

    describe('Parse and Simplify', () => {
        it('should parse and simplify constants', () => {
            const expr = parseAndSimplify('2 + 3');
            expect(expr).toBeInstanceOf(Constant);
            expect((expr as Constant).value).toBe(5);
        });

        it('should parse and simplify constant expressions', () => {
            const expr = parseAndSimplify('2 * 3 + 4');
            expect(expr).toBeInstanceOf(Constant);
            expect((expr as Constant).value).toBe(10);
        });

        it('should parse and partially simplify mixed expressions', () => {
            const expr = parseAndSimplify('2 + x + 3');
            expect(expr).toBeInstanceOf(Add);
        });
    });

    describe('Whitespace Handling', () => {
        it('should ignore whitespace', () => {
            const expr1 = parse('2+3');
            const expr2 = parse('2 + 3');
            const expr3 = parse('  2  +  3  ');

            expect(expr1.evaluate()).toBe(5);
            expect(expr2.evaluate()).toBe(5);
            expect(expr3.evaluate()).toBe(5);
        });
    });

    describe('Error Handling', () => {
        it('should throw error on invalid character', () => {
            expect(() => parse('2 @ 3')).toThrow();
        });

        it('should throw error on mismatched parentheses', () => {
            expect(() => parse('(2 + 3')).toThrow();
        });

        it('should throw error on unexpected token', () => {
            expect(() => parse('2 + + 3')).toThrow();
        });
    });

    describe('Output Formats', () => {
        it('should generate string output', () => {
            const expr = parse('x^2 + 2*x + 1');
            const str = expr.toString();
            expect(str).toBeTruthy();
        });

        it('should generate LaTeX output', () => {
            const expr = parse('x^2 + 2*x + 1');
            const latex = expr.toLatex();
            expect(latex).toContain('^');
        });

        it('should generate Unicode output', () => {
            const expr = parse('x^2');
            const unicode = expr.toUnicode();
            expect(unicode).toContain('²');
        });
    });
});
