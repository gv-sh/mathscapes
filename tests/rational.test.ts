import { Rational } from '../src/core/rational';

describe('Rational', () => {
    describe('Constructor', () => {
        test('should create a rational number', () => {
            const r = new Rational(3, 4);
            expect(r.numerator).toBe(3);
            expect(r.denominator).toBe(4);
        });

        test('should simplify fractions automatically', () => {
            const r = new Rational(6, 8);
            expect(r.numerator).toBe(3);
            expect(r.denominator).toBe(4);
        });

        test('should handle negative denominators', () => {
            const r = new Rational(3, -4);
            expect(r.numerator).toBe(-3);
            expect(r.denominator).toBe(4);
        });

        test('should throw error for zero denominator', () => {
            expect(() => new Rational(1, 0)).toThrow('Denominator cannot be zero');
        });

        test('should throw error for non-integer inputs', () => {
            expect(() => new Rational(1.5, 2)).toThrow('Numerator and denominator must be integers');
        });

        test('should handle zero numerator', () => {
            const r = new Rational(0, 5);
            expect(r.numerator).toBe(0);
            expect(r.denominator).toBe(1);
        });
    });

    describe('parse', () => {
        test('should parse fraction strings', () => {
            const r = Rational.parse('22/7');
            expect(r.numerator).toBe(22);
            expect(r.denominator).toBe(7);
        });

        test('should parse integer strings', () => {
            const r = Rational.parse('5');
            expect(r.numerator).toBe(5);
            expect(r.denominator).toBe(1);
        });

        test('should parse decimal strings', () => {
            const r = Rational.parse('0.5');
            expect(r.numerator).toBe(1);
            expect(r.denominator).toBe(2);
        });

        test('should parse negative fractions', () => {
            const r = Rational.parse('-3/4');
            expect(r.numerator).toBe(-3);
            expect(r.denominator).toBe(4);
        });

        test('should throw error for invalid format', () => {
            expect(() => Rational.parse('abc')).toThrow();
        });
    });

    describe('fromDecimal', () => {
        test('should convert decimal to rational', () => {
            const r = Rational.fromDecimal(0.5);
            expect(r.numerator).toBe(1);
            expect(r.denominator).toBe(2);
        });

        test('should convert integer to rational', () => {
            const r = Rational.fromDecimal(5);
            expect(r.numerator).toBe(5);
            expect(r.denominator).toBe(1);
        });

        test('should handle negative decimals', () => {
            const r = Rational.fromDecimal(-0.25);
            expect(r.toDecimal()).toBeCloseTo(-0.25);
        });

        test('should throw error for infinite values', () => {
            expect(() => Rational.fromDecimal(Infinity)).toThrow();
            expect(() => Rational.fromDecimal(NaN)).toThrow();
        });
    });

    describe('Arithmetic Operations', () => {
        test('should add rational numbers', () => {
            const r1 = new Rational(1, 3);
            const r2 = new Rational(1, 6);
            const sum = r1.add(r2);
            expect(sum.numerator).toBe(1);
            expect(sum.denominator).toBe(2);
        });

        test('should subtract rational numbers', () => {
            const r1 = new Rational(3, 4);
            const r2 = new Rational(1, 4);
            const diff = r1.subtract(r2);
            expect(diff.numerator).toBe(1);
            expect(diff.denominator).toBe(2);
        });

        test('should multiply rational numbers', () => {
            const r1 = new Rational(2, 3);
            const r2 = new Rational(3, 4);
            const product = r1.multiply(r2);
            expect(product.numerator).toBe(1);
            expect(product.denominator).toBe(2);
        });

        test('should divide rational numbers', () => {
            const r1 = new Rational(2, 3);
            const r2 = new Rational(4, 5);
            const quotient = r1.divide(r2);
            expect(quotient.numerator).toBe(5);
            expect(quotient.denominator).toBe(6);
        });

        test('should throw error when dividing by zero', () => {
            const r1 = new Rational(1, 2);
            const r2 = new Rational(0, 1);
            expect(() => r1.divide(r2)).toThrow('Cannot divide by zero');
        });
    });

    describe('Unary Operations', () => {
        test('should compute reciprocal', () => {
            const r = new Rational(3, 4);
            const recip = r.reciprocal();
            expect(recip.numerator).toBe(4);
            expect(recip.denominator).toBe(3);
        });

        test('should throw error for reciprocal of zero', () => {
            const r = new Rational(0, 1);
            expect(() => r.reciprocal()).toThrow('Cannot take reciprocal of zero');
        });

        test('should negate rational number', () => {
            const r = new Rational(3, 4);
            const neg = r.negate();
            expect(neg.numerator).toBe(-3);
            expect(neg.denominator).toBe(4);
        });

        test('should compute absolute value', () => {
            const r = new Rational(-3, 4);
            const abs = r.abs();
            expect(abs.numerator).toBe(3);
            expect(abs.denominator).toBe(4);
        });
    });

    describe('Power', () => {
        test('should raise to positive power', () => {
            const r = new Rational(2, 3);
            const squared = r.pow(2);
            expect(squared.numerator).toBe(4);
            expect(squared.denominator).toBe(9);
        });

        test('should raise to zero power', () => {
            const r = new Rational(2, 3);
            const result = r.pow(0);
            expect(result.numerator).toBe(1);
            expect(result.denominator).toBe(1);
        });

        test('should raise to negative power', () => {
            const r = new Rational(2, 3);
            const result = r.pow(-1);
            expect(result.numerator).toBe(3);
            expect(result.denominator).toBe(2);
        });

        test('should throw error for non-integer exponent', () => {
            const r = new Rational(2, 3);
            expect(() => r.pow(0.5)).toThrow('Exponent must be an integer');
        });
    });

    describe('Comparison', () => {
        test('should compare equal rationals', () => {
            const r1 = new Rational(1, 2);
            const r2 = new Rational(2, 4);
            expect(r1.equals(r2)).toBe(true);
            expect(r1.compare(r2)).toBe(0);
        });

        test('should compare less than', () => {
            const r1 = new Rational(1, 3);
            const r2 = new Rational(1, 2);
            expect(r1.lessThan(r2)).toBe(true);
            expect(r1.compare(r2)).toBe(-1);
        });

        test('should compare greater than', () => {
            const r1 = new Rational(2, 3);
            const r2 = new Rational(1, 2);
            expect(r1.greaterThan(r2)).toBe(true);
            expect(r1.compare(r2)).toBe(1);
        });

        test('should handle negative comparisons', () => {
            const r1 = new Rational(-1, 2);
            const r2 = new Rational(1, 2);
            expect(r1.lessThan(r2)).toBe(true);
        });
    });

    describe('Conversion', () => {
        test('should convert to decimal', () => {
            const r = new Rational(1, 4);
            expect(r.toDecimal()).toBe(0.25);
        });

        test('should convert to decimal with precision', () => {
            const r = new Rational(1, 3);
            expect(r.toDecimal(2)).toBeCloseTo(0.33, 2);
        });

        test('should convert to string', () => {
            const r = new Rational(3, 4);
            expect(r.toString()).toBe('3/4');
        });

        test('should convert integer to simple string', () => {
            const r = new Rational(5, 1);
            expect(r.toString()).toBe('5');
        });

        test('should convert to mixed number string', () => {
            const r = new Rational(7, 3);
            expect(r.toMixedString()).toBe('2 1/3');
        });

        test('should convert to LaTeX', () => {
            const r = new Rational(3, 4);
            expect(r.toLatex()).toBe('\\frac{3}{4}');
        });

        test('should convert integer to simple LaTeX', () => {
            const r = new Rational(5, 1);
            expect(r.toLatex()).toBe('5');
        });
    });

    describe('clone', () => {
        test('should create a copy', () => {
            const r1 = new Rational(3, 4);
            const r2 = r1.clone();
            expect(r1.equals(r2)).toBe(true);
            expect(r1).not.toBe(r2);
        });
    });

    describe('Edge Cases', () => {
        test('should handle very large numerators and denominators', () => {
            const r = new Rational(1000000, 2000000);
            expect(r.numerator).toBe(1);
            expect(r.denominator).toBe(2);
        });

        test('should maintain exactness in repeated operations', () => {
            const r = new Rational(1, 3);
            const sum = r.add(r).add(r);
            expect(sum.numerator).toBe(1);
            expect(sum.denominator).toBe(1);
        });
    });
});
