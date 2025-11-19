import { Complex } from '../src/core/complex';

describe('Complex', () => {
    describe('Constructor', () => {
        test('should create a complex number', () => {
            const c = new Complex(3, 4);
            expect(c.real).toBe(3);
            expect(c.imag).toBe(4);
        });

        test('should default imaginary part to zero', () => {
            const c = new Complex(5);
            expect(c.real).toBe(5);
            expect(c.imag).toBe(0);
        });
    });

    describe('Static Factory Methods', () => {
        test('should create from polar coordinates', () => {
            const c = Complex.fromPolar(1, Math.PI / 2);
            expect(c.real).toBeCloseTo(0, 10);
            expect(c.imag).toBeCloseTo(1, 10);
        });

        test('should create imaginary unit', () => {
            const i = Complex.i();
            expect(i.real).toBe(0);
            expect(i.imag).toBe(1);
        });

        test('should create zero', () => {
            const z = Complex.zero();
            expect(z.real).toBe(0);
            expect(z.imag).toBe(0);
        });

        test('should create one', () => {
            const o = Complex.one();
            expect(o.real).toBe(1);
            expect(o.imag).toBe(0);
        });

        test('should create from array', () => {
            const c = Complex.fromArray([3, 4]);
            expect(c.real).toBe(3);
            expect(c.imag).toBe(4);
        });
    });

    describe('parse', () => {
        test('should parse "i"', () => {
            const c = Complex.parse('i');
            expect(c.real).toBe(0);
            expect(c.imag).toBe(1);
        });

        test('should parse "-i"', () => {
            const c = Complex.parse('-i');
            expect(c.real).toBe(0);
            expect(c.imag).toBe(-1);
        });

        test('should parse real number', () => {
            const c = Complex.parse('5');
            expect(c.real).toBe(5);
            expect(c.imag).toBe(0);
        });

        test('should parse imaginary number', () => {
            const c = Complex.parse('3i');
            expect(c.real).toBe(0);
            expect(c.imag).toBe(3);
        });
    });

    describe('Arithmetic Operations', () => {
        test('should add complex numbers', () => {
            const c1 = new Complex(1, 2);
            const c2 = new Complex(3, 4);
            const sum = c1.add(c2);
            expect(sum.real).toBe(4);
            expect(sum.imag).toBe(6);
        });

        test('should subtract complex numbers', () => {
            const c1 = new Complex(5, 6);
            const c2 = new Complex(2, 3);
            const diff = c1.subtract(c2);
            expect(diff.real).toBe(3);
            expect(diff.imag).toBe(3);
        });

        test('should multiply complex numbers', () => {
            const c1 = new Complex(1, 2);
            const c2 = new Complex(3, 4);
            const product = c1.multiply(c2);
            expect(product.real).toBe(-5); // (1*3 - 2*4)
            expect(product.imag).toBe(10); // (1*4 + 2*3)
        });

        test('should verify i * i = -1', () => {
            const i = Complex.i();
            const result = i.multiply(i);
            expect(result.real).toBeCloseTo(-1, 10);
            expect(result.imag).toBeCloseTo(0, 10);
        });

        test('should divide complex numbers', () => {
            const c1 = new Complex(1, 2);
            const c2 = new Complex(3, 4);
            const quotient = c1.divide(c2);
            expect(quotient.real).toBeCloseTo(0.44, 2);
            expect(quotient.imag).toBeCloseTo(0.08, 2);
        });

        test('should throw error when dividing by zero', () => {
            const c1 = new Complex(1, 2);
            const c2 = Complex.zero();
            expect(() => c1.divide(c2)).toThrow('Cannot divide by zero');
        });

        test('should scale by a real number', () => {
            const c = new Complex(2, 3);
            const scaled = c.scale(2);
            expect(scaled.real).toBe(4);
            expect(scaled.imag).toBe(6);
        });
    });

    describe('Unary Operations', () => {
        test('should compute conjugate', () => {
            const c = new Complex(3, 4);
            const conj = c.conjugate();
            expect(conj.real).toBe(3);
            expect(conj.imag).toBe(-4);
        });

        test('should negate', () => {
            const c = new Complex(3, 4);
            const neg = c.negate();
            expect(neg.real).toBe(-3);
            expect(neg.imag).toBe(-4);
        });

        test('should compute reciprocal', () => {
            const c = new Complex(3, 4);
            const recip = c.reciprocal();
            const product = c.multiply(recip);
            expect(product.real).toBeCloseTo(1, 10);
            expect(product.imag).toBeCloseTo(0, 10);
        });

        test('should throw error for reciprocal of zero', () => {
            const c = Complex.zero();
            expect(() => c.reciprocal()).toThrow('Cannot take reciprocal of zero');
        });
    });

    describe('Magnitude and Phase', () => {
        test('should compute magnitude', () => {
            const c = new Complex(3, 4);
            expect(c.magnitude()).toBe(5);
            expect(c.abs()).toBe(5);
        });

        test('should compute squared magnitude', () => {
            const c = new Complex(3, 4);
            expect(c.magnitudeSquared()).toBe(25);
        });

        test('should compute phase', () => {
            const c = new Complex(1, 1);
            expect(c.phase()).toBeCloseTo(Math.PI / 4, 10);
            expect(c.arg()).toBeCloseTo(Math.PI / 4, 10);
        });

        test('should convert to polar', () => {
            const c = new Complex(3, 4);
            const polar = c.toPolar();
            expect(polar.r).toBe(5);
            expect(polar.theta).toBeCloseTo(Math.atan2(4, 3), 10);
        });

        test('should round-trip polar conversion', () => {
            const original = new Complex(3, 4);
            const polar = original.toPolar();
            const converted = Complex.fromPolar(polar.r, polar.theta);
            expect(converted.real).toBeCloseTo(3, 10);
            expect(converted.imag).toBeCloseTo(4, 10);
        });
    });

    describe('Power and Root', () => {
        test('should raise to integer power', () => {
            const c = new Complex(1, 1);
            const squared = c.pow(2);
            expect(squared.real).toBeCloseTo(0, 10);
            expect(squared.imag).toBeCloseTo(2, 10);
        });

        test('should raise to zero power', () => {
            const c = new Complex(3, 4);
            const result = c.pow(0);
            expect(result.real).toBeCloseTo(1, 10);
            expect(result.imag).toBeCloseTo(0, 10);
        });

        test('should compute square root', () => {
            const c = new Complex(-1, 0);
            const sqrt = c.sqrt();
            expect(sqrt.real).toBeCloseTo(0, 10);
            expect(Math.abs(sqrt.imag)).toBeCloseTo(1, 10);
        });

        test('should verify sqrt(-1) = i or -i', () => {
            const c = new Complex(-1, 0);
            const sqrt = c.sqrt();
            const squared = sqrt.multiply(sqrt);
            expect(squared.real).toBeCloseTo(-1, 10);
            expect(squared.imag).toBeCloseTo(0, 10);
        });
    });

    describe('Transcendental Functions', () => {
        test('should compute exponential', () => {
            const c = new Complex(0, Math.PI);
            const exp = c.exp();
            expect(exp.real).toBeCloseTo(-1, 10);
            expect(exp.imag).toBeCloseTo(0, 10);
        });

        test('should compute natural logarithm', () => {
            const c = new Complex(1, 0);
            const log = c.log();
            expect(log.real).toBeCloseTo(0, 10);
            expect(log.imag).toBeCloseTo(0, 10);
        });

        test('should throw error for log of zero', () => {
            const c = Complex.zero();
            expect(() => c.log()).toThrow('Cannot take logarithm of zero');
        });

        test('should compute sine', () => {
            const c = new Complex(0, 0);
            const sin = c.sin();
            expect(sin.real).toBeCloseTo(0, 10);
            expect(sin.imag).toBeCloseTo(0, 10);
        });

        test('should compute cosine', () => {
            const c = new Complex(0, 0);
            const cos = c.cos();
            expect(cos.real).toBeCloseTo(1, 10);
            expect(cos.imag).toBeCloseTo(0, 10);
        });

        test('should compute tangent', () => {
            const c = new Complex(0, 0);
            const tan = c.tan();
            expect(tan.real).toBeCloseTo(0, 10);
            expect(tan.imag).toBeCloseTo(0, 10);
        });
    });

    describe('Predicates', () => {
        test('should check equality', () => {
            const c1 = new Complex(1, 2);
            const c2 = new Complex(1, 2);
            expect(c1.equals(c2)).toBe(true);
        });

        test('should check inequality', () => {
            const c1 = new Complex(1, 2);
            const c2 = new Complex(2, 1);
            expect(c1.equals(c2)).toBe(false);
        });

        test('should check if zero', () => {
            const c1 = Complex.zero();
            const c2 = new Complex(0.000001, 0);
            expect(c1.isZero()).toBe(true);
            expect(c2.isZero()).toBe(false);
        });

        test('should check if real', () => {
            const c1 = new Complex(5, 0);
            const c2 = new Complex(5, 0.000001);
            expect(c1.isReal()).toBe(true);
            expect(c2.isReal()).toBe(false);
        });

        test('should check if imaginary', () => {
            const c1 = new Complex(0, 5);
            const c2 = new Complex(0.000001, 5);
            expect(c1.isImaginary()).toBe(true);
            expect(c2.isImaginary()).toBe(false);
        });
    });

    describe('Conversion', () => {
        test('should convert to string (general form)', () => {
            const c = new Complex(3, 4);
            expect(c.toString()).toBe('3+4i');
        });

        test('should convert to string (negative imaginary)', () => {
            const c = new Complex(3, -4);
            expect(c.toString()).toBe('3-4i');
        });

        test('should convert to string (real only)', () => {
            const c = new Complex(5, 0);
            expect(c.toString()).toBe('5');
        });

        test('should convert to string (imaginary only)', () => {
            const c = new Complex(0, 3);
            expect(c.toString()).toBe('3i');
        });

        test('should convert to LaTeX', () => {
            const c = new Complex(3, 4);
            expect(c.toLatex()).toBe('3+4i');
        });

        test('should convert to array', () => {
            const c = new Complex(3, 4);
            const arr = c.toArray();
            expect(arr).toEqual([3, 4]);
        });
    });

    describe('clone', () => {
        test('should create a copy', () => {
            const c1 = new Complex(3, 4);
            const c2 = c1.clone();
            expect(c1.equals(c2)).toBe(true);
            expect(c1).not.toBe(c2);
        });
    });

    describe('Euler\'s Identity', () => {
        test('should verify e^(iπ) + 1 = 0', () => {
            const c = new Complex(0, Math.PI);
            const exp = c.exp();
            const result = exp.add(Complex.one());
            expect(result.real).toBeCloseTo(0, 10);
            expect(result.imag).toBeCloseTo(0, 10);
        });
    });
});
