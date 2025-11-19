/**
 * Complex Number Class
 *
 * Represents complex numbers with real and imaginary components.
 * Provides arithmetic operations, magnitude, phase, and coordinate conversions.
 *
 * @example
 * const c1 = new Complex(3, 4);
 * const c2 = Complex.fromPolar(5, Math.PI / 4);
 * const sum = c1.add(c2);
 */

/**
 * Represents a complex number with real and imaginary parts.
 */
export class Complex {
    private _real: number;
    private _imag: number;

    /**
     * Creates a new Complex number.
     *
     * @param {number} real - The real part of the complex number
     * @param {number} imag - The imaginary part of the complex number (default: 0)
     */
    constructor(real: number, imag: number = 0) {
        this._real = real;
        this._imag = imag;
    }

    /**
     * Gets the real part of the complex number.
     *
     * @returns {number} The real part
     */
    get real(): number {
        return this._real;
    }

    /**
     * Gets the imaginary part of the complex number.
     *
     * @returns {number} The imaginary part
     */
    get imag(): number {
        return this._imag;
    }

    /**
     * Creates a complex number from polar coordinates.
     *
     * @param {number} r - The magnitude (radius)
     * @param {number} theta - The angle in radians
     * @returns {Complex} The complex number in rectangular form
     */
    static fromPolar(r: number, theta: number): Complex {
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
    }

    /**
     * Parses a string representation of a complex number.
     * Supports formats: "a+bi", "a-bi", "a", "bi"
     *
     * @param {string} str - String to parse (e.g., "3+4i", "5-2i", "3", "4i")
     * @returns {Complex} The parsed complex number
     * @throws {Error} If the string format is invalid
     */
    static parse(str: string): Complex {
        str = str.trim().replace(/\s+/g, '');

        // Pure imaginary: "bi" or "i"
        if (str === 'i') {
            return new Complex(0, 1);
        }
        if (str === '-i') {
            return new Complex(0, -1);
        }
        if (str.endsWith('i') && !str.includes('+') && !str.includes('-', 1)) {
            const imag = parseFloat(str.slice(0, -1)) || 1;
            return new Complex(0, imag);
        }

        // Complex: "a+bi" or "a-bi"
        const match = str.match(/^([+-]?[0-9.]+)?([+-][0-9.]*)?i?$/);
        if (match) {
            const real = match[1] ? parseFloat(match[1]) : 0;
            let imag = 0;
            if (match[2]) {
                const imagStr = match[2];
                if (imagStr === '+' || imagStr === '-') {
                    imag = imagStr === '+' ? 1 : -1;
                } else {
                    imag = parseFloat(imagStr);
                }
            }
            return new Complex(real, imag);
        }

        throw new Error("Invalid complex number format");
    }

    /**
     * Creates a complex number representing the imaginary unit i.
     *
     * @returns {Complex} The complex number 0+1i
     */
    static i(): Complex {
        return new Complex(0, 1);
    }

    /**
     * Creates a complex number representing zero.
     *
     * @returns {Complex} The complex number 0+0i
     */
    static zero(): Complex {
        return new Complex(0, 0);
    }

    /**
     * Creates a complex number representing one.
     *
     * @returns {Complex} The complex number 1+0i
     */
    static one(): Complex {
        return new Complex(1, 0);
    }

    /**
     * Adds another complex number to this one.
     *
     * @param {Complex} other - The complex number to add
     * @returns {Complex} The sum as a new Complex
     */
    add(other: Complex): Complex {
        return new Complex(this._real + other._real, this._imag + other._imag);
    }

    /**
     * Subtracts another complex number from this one.
     *
     * @param {Complex} other - The complex number to subtract
     * @returns {Complex} The difference as a new Complex
     */
    subtract(other: Complex): Complex {
        return new Complex(this._real - other._real, this._imag - other._imag);
    }

    /**
     * Multiplies this complex number by another.
     *
     * @param {Complex} other - The complex number to multiply by
     * @returns {Complex} The product as a new Complex
     */
    multiply(other: Complex): Complex {
        const real = this._real * other._real - this._imag * other._imag;
        const imag = this._real * other._imag + this._imag * other._real;
        return new Complex(real, imag);
    }

    /**
     * Divides this complex number by another.
     *
     * @param {Complex} other - The complex number to divide by
     * @returns {Complex} The quotient as a new Complex
     * @throws {Error} If dividing by zero
     */
    divide(other: Complex): Complex {
        const denominator = other._real * other._real + other._imag * other._imag;
        if (denominator === 0) {
            throw new Error("Cannot divide by zero");
        }
        const real = (this._real * other._real + this._imag * other._imag) / denominator;
        const imag = (this._imag * other._real - this._real * other._imag) / denominator;
        return new Complex(real, imag);
    }

    /**
     * Scales this complex number by a real scalar.
     *
     * @param {number} scalar - The scalar to multiply by
     * @returns {Complex} The scaled complex number
     */
    scale(scalar: number): Complex {
        return new Complex(this._real * scalar, this._imag * scalar);
    }

    /**
     * Returns the complex conjugate of this number.
     * The conjugate of a+bi is a-bi.
     *
     * @returns {Complex} The conjugate
     */
    conjugate(): Complex {
        return new Complex(this._real, -this._imag);
    }

    /**
     * Returns the negation of this complex number.
     *
     * @returns {Complex} The negation (-this)
     */
    negate(): Complex {
        return new Complex(-this._real, -this._imag);
    }

    /**
     * Returns the reciprocal of this complex number (1/z).
     *
     * @returns {Complex} The reciprocal
     * @throws {Error} If the complex number is zero
     */
    reciprocal(): Complex {
        const denominator = this._real * this._real + this._imag * this._imag;
        if (denominator === 0) {
            throw new Error("Cannot take reciprocal of zero");
        }
        return new Complex(this._real / denominator, -this._imag / denominator);
    }

    /**
     * Computes the magnitude (absolute value, modulus) of this complex number.
     * |a+bi| = sqrt(a² + b²)
     *
     * @returns {number} The magnitude
     */
    magnitude(): number {
        return Math.sqrt(this._real * this._real + this._imag * this._imag);
    }

    /**
     * Alias for magnitude().
     *
     * @returns {number} The magnitude
     */
    abs(): number {
        return this.magnitude();
    }

    /**
     * Computes the squared magnitude of this complex number.
     * |a+bi|² = a² + b²
     *
     * @returns {number} The squared magnitude
     */
    magnitudeSquared(): number {
        return this._real * this._real + this._imag * this._imag;
    }

    /**
     * Computes the phase (argument, angle) of this complex number in radians.
     * Phase is the angle from the positive real axis in the complex plane.
     *
     * @returns {number} The phase in radians, in the range [-π, π]
     */
    phase(): number {
        return Math.atan2(this._imag, this._real);
    }

    /**
     * Alias for phase().
     *
     * @returns {number} The argument in radians
     */
    arg(): number {
        return this.phase();
    }

    /**
     * Converts this complex number to polar coordinates.
     *
     * @returns {{r: number, theta: number}} Object with magnitude r and phase theta
     */
    toPolar(): { r: number; theta: number } {
        return {
            r: this.magnitude(),
            theta: this.phase()
        };
    }

    /**
     * Raises this complex number to a real power.
     * Uses polar form: z^n = r^n * e^(i*n*theta)
     *
     * @param {number} exponent - The exponent
     * @returns {Complex} The result of this^exponent
     */
    pow(exponent: number): Complex {
        if (this._real === 0 && this._imag === 0) {
            if (exponent === 0) {
                return Complex.one();
            }
            return Complex.zero();
        }

        const r = this.magnitude();
        const theta = this.phase();
        const newR = Math.pow(r, exponent);
        const newTheta = theta * exponent;
        return Complex.fromPolar(newR, newTheta);
    }

    /**
     * Computes the square root of this complex number.
     *
     * @returns {Complex} The principal square root
     */
    sqrt(): Complex {
        return this.pow(0.5);
    }

    /**
     * Computes the exponential of this complex number.
     * e^(a+bi) = e^a * (cos(b) + i*sin(b))
     *
     * @returns {Complex} The result of e^this
     */
    exp(): Complex {
        const expReal = Math.exp(this._real);
        return new Complex(
            expReal * Math.cos(this._imag),
            expReal * Math.sin(this._imag)
        );
    }

    /**
     * Computes the natural logarithm of this complex number.
     * ln(a+bi) = ln|a+bi| + i*arg(a+bi)
     *
     * @returns {Complex} The principal value of ln(this)
     * @throws {Error} If the complex number is zero
     */
    log(): Complex {
        if (this._real === 0 && this._imag === 0) {
            throw new Error("Cannot take logarithm of zero");
        }
        return new Complex(Math.log(this.magnitude()), this.phase());
    }

    /**
     * Computes the sine of this complex number.
     * sin(a+bi) = sin(a)cosh(b) + i*cos(a)sinh(b)
     *
     * @returns {Complex} The result of sin(this)
     */
    sin(): Complex {
        return new Complex(
            Math.sin(this._real) * Math.cosh(this._imag),
            Math.cos(this._real) * Math.sinh(this._imag)
        );
    }

    /**
     * Computes the cosine of this complex number.
     * cos(a+bi) = cos(a)cosh(b) - i*sin(a)sinh(b)
     *
     * @returns {Complex} The result of cos(this)
     */
    cos(): Complex {
        return new Complex(
            Math.cos(this._real) * Math.cosh(this._imag),
            -Math.sin(this._real) * Math.sinh(this._imag)
        );
    }

    /**
     * Computes the tangent of this complex number.
     * tan(z) = sin(z) / cos(z)
     *
     * @returns {Complex} The result of tan(this)
     */
    tan(): Complex {
        return this.sin().divide(this.cos());
    }

    /**
     * Checks if this complex number equals another within a tolerance.
     *
     * @param {Complex} other - The complex number to compare with
     * @param {number} tolerance - The tolerance for comparison (default: 1e-10)
     * @returns {boolean} True if equal within tolerance
     */
    equals(other: Complex, tolerance: number = 1e-10): boolean {
        return Math.abs(this._real - other._real) < tolerance &&
               Math.abs(this._imag - other._imag) < tolerance;
    }

    /**
     * Checks if this complex number is zero.
     *
     * @param {number} tolerance - The tolerance for comparison (default: 1e-10)
     * @returns {boolean} True if the magnitude is less than tolerance
     */
    isZero(tolerance: number = 1e-10): boolean {
        return this.magnitudeSquared() < tolerance * tolerance;
    }

    /**
     * Checks if this complex number is real (imaginary part is zero).
     *
     * @param {number} tolerance - The tolerance for comparison (default: 1e-10)
     * @returns {boolean} True if imaginary part is zero
     */
    isReal(tolerance: number = 1e-10): boolean {
        return Math.abs(this._imag) < tolerance;
    }

    /**
     * Checks if this complex number is purely imaginary (real part is zero).
     *
     * @param {number} tolerance - The tolerance for comparison (default: 1e-10)
     * @returns {boolean} True if real part is zero
     */
    isImaginary(tolerance: number = 1e-10): boolean {
        return Math.abs(this._real) < tolerance;
    }

    /**
     * Returns a string representation of the complex number.
     *
     * @returns {string} String in format "a+bi" or simplified forms
     */
    toString(): string {
        if (Math.abs(this._imag) < 1e-10) {
            return this._real.toString();
        }
        if (Math.abs(this._real) < 1e-10) {
            if (Math.abs(this._imag - 1) < 1e-10) {
                return 'i';
            }
            if (Math.abs(this._imag + 1) < 1e-10) {
                return '-i';
            }
            return `${this._imag}i`;
        }

        const sign = this._imag >= 0 ? '+' : '';
        const imagPart = Math.abs(this._imag - 1) < 1e-10 ? 'i' :
                        Math.abs(this._imag + 1) < 1e-10 ? '-i' :
                        `${this._imag}i`;
        return `${this._real}${sign}${imagPart}`;
    }

    /**
     * Returns a LaTeX representation of the complex number.
     *
     * @returns {string} LaTeX string
     */
    toLatex(): string {
        if (Math.abs(this._imag) < 1e-10) {
            return this._real.toString();
        }
        if (Math.abs(this._real) < 1e-10) {
            if (Math.abs(this._imag - 1) < 1e-10) {
                return 'i';
            }
            if (Math.abs(this._imag + 1) < 1e-10) {
                return '-i';
            }
            return `${this._imag}i`;
        }

        const sign = this._imag >= 0 ? '+' : '';
        return `${this._real}${sign}${this._imag}i`;
    }

    /**
     * Creates a copy of this complex number.
     *
     * @returns {Complex} A new Complex with the same value
     */
    clone(): Complex {
        return new Complex(this._real, this._imag);
    }

    /**
     * Converts the complex number to an array [real, imag].
     *
     * @returns {[number, number]} Array containing real and imaginary parts
     */
    toArray(): [number, number] {
        return [this._real, this._imag];
    }

    /**
     * Creates a complex number from an array [real, imag].
     *
     * @param {[number, number]} arr - Array containing real and imaginary parts
     * @returns {Complex} The complex number
     */
    static fromArray(arr: [number, number]): Complex {
        return new Complex(arr[0], arr[1]);
    }
}
