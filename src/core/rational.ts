/**
 * Rational Number Class
 *
 * Represents exact rational numbers (fractions) with automatic simplification.
 * Maintains exactness in arithmetic operations, avoiding floating-point errors.
 *
 * @example
 * const r1 = new Rational(1, 3);
 * const r2 = Rational.parse("22/7");
 * const sum = r1.add(r2);
 */

/**
 * Computes the greatest common divisor (GCD) of two integers using Euclidean algorithm.
 *
 * @param {number} a - First integer
 * @param {number} b - Second integer
 * @returns {number} The GCD of a and b
 */
function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

/**
 * Represents a rational number (fraction) with exact arithmetic.
 */
export class Rational {
    private _numerator: number;
    private _denominator: number;

    /**
     * Creates a new Rational number.
     *
     * @param {number} numerator - The numerator of the fraction
     * @param {number} denominator - The denominator of the fraction (must be non-zero)
     * @throws {Error} If denominator is zero
     */
    constructor(numerator: number, denominator: number = 1) {
        if (denominator === 0) {
            throw new Error("Denominator cannot be zero");
        }

        // Ensure both are integers
        if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
            throw new Error("Numerator and denominator must be integers");
        }

        // Simplify the fraction
        const divisor = gcd(numerator, denominator);
        this._numerator = numerator / divisor;
        this._denominator = denominator / divisor;

        // Ensure denominator is positive
        if (this._denominator < 0) {
            this._numerator = -this._numerator;
            this._denominator = -this._denominator;
        }
    }

    /**
     * Gets the numerator of the rational number.
     *
     * @returns {number} The numerator
     */
    get numerator(): number {
        return this._numerator;
    }

    /**
     * Gets the denominator of the rational number.
     *
     * @returns {number} The denominator
     */
    get denominator(): number {
        return this._denominator;
    }

    /**
     * Parses a string representation of a rational number.
     * Supports formats: "a/b", "a", or decimal strings
     *
     * @param {string} str - String to parse (e.g., "22/7", "3", "0.5")
     * @returns {Rational} The parsed rational number
     * @throws {Error} If the string format is invalid
     */
    static parse(str: string): Rational {
        str = str.trim();

        // Check for fraction format "a/b"
        if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length !== 2) {
                throw new Error("Invalid fraction format");
            }
            const numerator = parseInt(parts[0].trim(), 10);
            const denominator = parseInt(parts[1].trim(), 10);

            if (isNaN(numerator) || isNaN(denominator)) {
                throw new Error("Invalid fraction format");
            }

            return new Rational(numerator, denominator);
        }

        // Check for decimal format
        if (str.includes('.')) {
            const decimalPlaces = str.split('.')[1].length;
            const denominator = Math.pow(10, decimalPlaces);
            const numerator = parseFloat(str) * denominator;
            return new Rational(Math.round(numerator), denominator);
        }

        // Integer format
        const value = parseInt(str, 10);
        if (isNaN(value)) {
            throw new Error("Invalid number format");
        }
        return new Rational(value, 1);
    }

    /**
     * Creates a Rational from a decimal number with specified precision.
     *
     * @param {number} decimal - The decimal number to convert
     * @param {number} maxDenominator - Maximum allowed denominator (default: 10000)
     * @returns {Rational} The rational approximation
     */
    static fromDecimal(decimal: number, maxDenominator: number = 10000): Rational {
        // Handle special cases
        if (!isFinite(decimal)) {
            throw new Error("Cannot convert infinite or NaN to Rational");
        }

        if (Number.isInteger(decimal)) {
            return new Rational(decimal, 1);
        }

        // Use continued fractions algorithm for best rational approximation
        let sign = decimal < 0 ? -1 : 1;
        decimal = Math.abs(decimal);

        let n0 = 0, d0 = 1;
        let n1 = 1, d1 = 0;
        let x = decimal;

        while (d1 <= maxDenominator) {
            const a = Math.floor(x);
            const n2 = n0 + a * n1;
            const d2 = d0 + a * d1;

            if (d2 > maxDenominator) break;

            if (Math.abs(decimal - n2 / d2) < 1e-10) {
                return new Rational(sign * n2, d2);
            }

            n0 = n1; n1 = n2;
            d0 = d1; d1 = d2;

            if (Math.abs(x - a) < 1e-10) break;
            x = 1 / (x - a);
        }

        return new Rational(sign * n1, d1);
    }

    /**
     * Adds another rational number to this one.
     *
     * @param {Rational} other - The rational number to add
     * @returns {Rational} The sum as a new Rational
     */
    add(other: Rational): Rational {
        const numerator = this._numerator * other._denominator + other._numerator * this._denominator;
        const denominator = this._denominator * other._denominator;
        return new Rational(numerator, denominator);
    }

    /**
     * Subtracts another rational number from this one.
     *
     * @param {Rational} other - The rational number to subtract
     * @returns {Rational} The difference as a new Rational
     */
    subtract(other: Rational): Rational {
        const numerator = this._numerator * other._denominator - other._numerator * this._denominator;
        const denominator = this._denominator * other._denominator;
        return new Rational(numerator, denominator);
    }

    /**
     * Multiplies this rational number by another.
     *
     * @param {Rational} other - The rational number to multiply by
     * @returns {Rational} The product as a new Rational
     */
    multiply(other: Rational): Rational {
        return new Rational(
            this._numerator * other._numerator,
            this._denominator * other._denominator
        );
    }

    /**
     * Divides this rational number by another.
     *
     * @param {Rational} other - The rational number to divide by
     * @returns {Rational} The quotient as a new Rational
     * @throws {Error} If dividing by zero
     */
    divide(other: Rational): Rational {
        if (other._numerator === 0) {
            throw new Error("Cannot divide by zero");
        }
        return new Rational(
            this._numerator * other._denominator,
            this._denominator * other._numerator
        );
    }

    /**
     * Returns the reciprocal of this rational number.
     *
     * @returns {Rational} The reciprocal (1/this)
     * @throws {Error} If the rational is zero
     */
    reciprocal(): Rational {
        if (this._numerator === 0) {
            throw new Error("Cannot take reciprocal of zero");
        }
        return new Rational(this._denominator, this._numerator);
    }

    /**
     * Returns the negation of this rational number.
     *
     * @returns {Rational} The negation (-this)
     */
    negate(): Rational {
        return new Rational(-this._numerator, this._denominator);
    }

    /**
     * Returns the absolute value of this rational number.
     *
     * @returns {Rational} The absolute value
     */
    abs(): Rational {
        return new Rational(Math.abs(this._numerator), this._denominator);
    }

    /**
     * Raises this rational number to an integer power.
     *
     * @param {number} exponent - The integer exponent
     * @returns {Rational} The result of this^exponent
     * @throws {Error} If exponent is not an integer
     */
    pow(exponent: number): Rational {
        if (!Number.isInteger(exponent)) {
            throw new Error("Exponent must be an integer");
        }

        if (exponent === 0) {
            return new Rational(1, 1);
        }

        if (exponent < 0) {
            return this.reciprocal().pow(-exponent);
        }

        let result: Rational = new Rational(1, 1);
        let base: Rational = new Rational(this._numerator, this._denominator);
        let exp = exponent;

        while (exp > 0) {
            if (exp % 2 === 1) {
                result = result.multiply(base);
            }
            base = base.multiply(base);
            exp = Math.floor(exp / 2);
        }

        return result;
    }

    /**
     * Compares this rational number with another.
     *
     * @param {Rational} other - The rational number to compare with
     * @returns {number} -1 if this < other, 0 if equal, 1 if this > other
     */
    compare(other: Rational): number {
        const diff = this._numerator * other._denominator - other._numerator * this._denominator;
        return diff < 0 ? -1 : diff > 0 ? 1 : 0;
    }

    /**
     * Checks if this rational number equals another.
     *
     * @param {Rational} other - The rational number to compare with
     * @returns {boolean} True if equal, false otherwise
     */
    equals(other: Rational): boolean {
        return this.compare(other) === 0;
    }

    /**
     * Checks if this rational number is less than another.
     *
     * @param {Rational} other - The rational number to compare with
     * @returns {boolean} True if this < other
     */
    lessThan(other: Rational): boolean {
        return this.compare(other) < 0;
    }

    /**
     * Checks if this rational number is greater than another.
     *
     * @param {Rational} other - The rational number to compare with
     * @returns {boolean} True if this > other
     */
    greaterThan(other: Rational): boolean {
        return this.compare(other) > 0;
    }

    /**
     * Converts the rational number to a decimal.
     *
     * @param {number} precision - Number of decimal places (optional)
     * @returns {number} The decimal representation
     */
    toDecimal(precision?: number): number {
        const value = this._numerator / this._denominator;
        if (precision !== undefined) {
            return parseFloat(value.toFixed(precision));
        }
        return value;
    }

    /**
     * Returns a string representation of the rational number.
     *
     * @returns {string} String in format "numerator/denominator" or "numerator" if denominator is 1
     */
    toString(): string {
        if (this._denominator === 1) {
            return this._numerator.toString();
        }
        return `${this._numerator}/${this._denominator}`;
    }

    /**
     * Returns a mixed number representation as a string.
     *
     * @returns {string} String in format "whole numerator/denominator"
     */
    toMixedString(): string {
        const whole = Math.floor(Math.abs(this._numerator) / this._denominator);
        const remainder = Math.abs(this._numerator) % this._denominator;
        const sign = this._numerator < 0 ? '-' : '';

        if (whole === 0) {
            return this.toString();
        }

        if (remainder === 0) {
            return `${sign}${whole}`;
        }

        return `${sign}${whole} ${remainder}/${this._denominator}`;
    }

    /**
     * Returns a LaTeX representation of the rational number.
     *
     * @returns {string} LaTeX string
     */
    toLatex(): string {
        if (this._denominator === 1) {
            return this._numerator.toString();
        }
        return `\\frac{${this._numerator}}{${this._denominator}}`;
    }

    /**
     * Creates a copy of this rational number.
     *
     * @returns {Rational} A new Rational with the same value
     */
    clone(): Rational {
        return new Rational(this._numerator, this._denominator);
    }
}
