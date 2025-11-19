/**
 * Polynomial Class
 *
 * Represents polynomials and provides operations for polynomial arithmetic,
 * evaluation, differentiation, and root finding.
 *
 * A polynomial is represented by its coefficients in ascending order of powers:
 * [a0, a1, a2, ...] represents a0 + a1*x + a2*x^2 + ...
 */

/**
 * Polynomial class for univariate polynomials
 *
 * @example
 * ```typescript
 * // Create polynomial: 2x^2 + 3x + 1
 * const p = new Polynomial([1, 3, 2]);
 *
 * // Evaluate at x = 2
 * p.evaluate(2); // 15
 *
 * // Add polynomials
 * const q = new Polynomial([1, 2]);
 * p.add(q); // 2x^2 + 5x + 2
 *
 * // Derivative
 * p.derivative(); // 4x + 3
 * ```
 */
export class Polynomial {
    private coefficients: number[];

    /**
     * Create a polynomial from coefficients
     * @param coefficients - Coefficients in ascending order [a0, a1, a2, ...]
     *                       representing a0 + a1*x + a2*x^2 + ...
     */
    constructor(coefficients: number[]) {
        if (coefficients.length === 0) {
            this.coefficients = [0];
        } else {
            // Remove leading zeros
            let lastNonZero = coefficients.length - 1;
            while (lastNonZero > 0 && Math.abs(coefficients[lastNonZero]) < 1e-10) {
                lastNonZero--;
            }
            this.coefficients = coefficients.slice(0, lastNonZero + 1);
        }
    }

    /**
     * Get the polynomial coefficients
     */
    getCoefficients(): number[] {
        return [...this.coefficients];
    }

    /**
     * Get the degree of the polynomial
     */
    degree(): number {
        return this.coefficients.length - 1;
    }

    /**
     * Evaluate the polynomial at a given value using Horner's method
     * @param x - Value at which to evaluate
     * @returns Polynomial value at x
     */
    evaluate(x: number): number {
        // Horner's method for efficient evaluation
        let result = 0;
        for (let i = this.coefficients.length - 1; i >= 0; i--) {
            result = result * x + this.coefficients[i];
        }
        return result;
    }

    /**
     * Add two polynomials
     * @param other - Polynomial to add
     * @returns Sum of polynomials
     */
    add(other: Polynomial): Polynomial {
        const maxLen = Math.max(this.coefficients.length, other.coefficients.length);
        const result: number[] = [];

        for (let i = 0; i < maxLen; i++) {
            const a = i < this.coefficients.length ? this.coefficients[i] : 0;
            const b = i < other.coefficients.length ? other.coefficients[i] : 0;
            result.push(a + b);
        }

        return new Polynomial(result);
    }

    /**
     * Subtract two polynomials
     * @param other - Polynomial to subtract
     * @returns Difference of polynomials
     */
    subtract(other: Polynomial): Polynomial {
        const maxLen = Math.max(this.coefficients.length, other.coefficients.length);
        const result: number[] = [];

        for (let i = 0; i < maxLen; i++) {
            const a = i < this.coefficients.length ? this.coefficients[i] : 0;
            const b = i < other.coefficients.length ? other.coefficients[i] : 0;
            result.push(a - b);
        }

        return new Polynomial(result);
    }

    /**
     * Multiply two polynomials
     * @param other - Polynomial to multiply
     * @returns Product of polynomials
     */
    multiply(other: Polynomial): Polynomial {
        const resultLen = this.coefficients.length + other.coefficients.length - 1;
        const result: number[] = new Array(resultLen).fill(0);

        for (let i = 0; i < this.coefficients.length; i++) {
            for (let j = 0; j < other.coefficients.length; j++) {
                result[i + j] += this.coefficients[i] * other.coefficients[j];
            }
        }

        return new Polynomial(result);
    }

    /**
     * Multiply polynomial by a scalar
     * @param scalar - Scalar value
     * @returns Scaled polynomial
     */
    scale(scalar: number): Polynomial {
        return new Polynomial(this.coefficients.map(c => c * scalar));
    }

    /**
     * Divide polynomial by another polynomial
     * @param divisor - Polynomial divisor
     * @returns Object with quotient and remainder
     */
    divide(divisor: Polynomial): { quotient: Polynomial; remainder: Polynomial } {
        if (divisor.degree() === 0 && Math.abs(divisor.coefficients[0]) < 1e-10) {
            throw new Error('Division by zero polynomial');
        }

        let remainder = new Polynomial(this.coefficients);
        const quotientCoeffs: number[] = [];

        while (remainder.degree() >= divisor.degree() && remainder.degree() >= 0) {
            const coeff = remainder.coefficients[remainder.degree()] /
                         divisor.coefficients[divisor.degree()];

            const degree = remainder.degree() - divisor.degree();

            quotientCoeffs[degree] = coeff;

            // Subtract divisor * coeff * x^degree from remainder
            const term = new Array(degree + 1).fill(0);
            term[degree] = coeff;
            const subtrahend = divisor.multiply(new Polynomial(term));
            remainder = remainder.subtract(subtrahend);
        }

        const quotient = quotientCoeffs.length > 0
            ? new Polynomial(quotientCoeffs)
            : new Polynomial([0]);

        return { quotient, remainder };
    }

    /**
     * Compute the derivative of the polynomial
     * @returns Derivative polynomial
     */
    derivative(): Polynomial {
        if (this.coefficients.length <= 1) {
            return new Polynomial([0]);
        }

        const result: number[] = [];
        for (let i = 1; i < this.coefficients.length; i++) {
            result.push(this.coefficients[i] * i);
        }

        return new Polynomial(result);
    }

    /**
     * Compute the integral of the polynomial (with integration constant = 0)
     * @returns Integral polynomial
     */
    integral(): Polynomial {
        const result: number[] = [0];
        for (let i = 0; i < this.coefficients.length; i++) {
            result.push(this.coefficients[i] / (i + 1));
        }

        return new Polynomial(result);
    }

    /**
     * Find roots of the polynomial using various methods
     * @param tolerance - Numerical tolerance for root finding
     * @returns Array of real roots (may not find all roots)
     */
    roots(tolerance: number = 1e-10): number[] {
        const degree = this.degree();

        // Constant polynomial
        if (degree === 0) {
            return [];
        }

        // Linear: ax + b = 0 => x = -b/a
        if (degree === 1) {
            return [-this.coefficients[0] / this.coefficients[1]];
        }

        // Quadratic: ax^2 + bx + c = 0
        if (degree === 2) {
            return this.quadraticRoots();
        }

        // For higher degrees, use numerical methods
        return this.numericalRoots(tolerance);
    }

    /**
     * Solve quadratic equation: ax^2 + bx + c = 0
     * @private
     */
    private quadraticRoots(): number[] {
        const [c, b, a] = this.coefficients;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return []; // No real roots
        }

        if (Math.abs(discriminant) < 1e-10) {
            return [-b / (2 * a)]; // One root
        }

        const sqrtDisc = Math.sqrt(discriminant);
        return [
            (-b + sqrtDisc) / (2 * a),
            (-b - sqrtDisc) / (2 * a)
        ];
    }

    /**
     * Find roots numerically using Durand-Kerner method
     * @private
     */
    private numericalRoots(tolerance: number): number[] {
        const degree = this.degree();
        const roots: number[] = [];

        // Use Newton-Raphson to find one root at a time
        const derivative = this.derivative();

        // Try different starting points
        const startingPoints = this.generateStartingPoints();

        for (const x0 of startingPoints) {
            const root = this.newtonRaphson(x0, derivative, tolerance);

            if (root !== null) {
                // Check if this is a new root
                const isNew = roots.every(r => Math.abs(r - root) > tolerance);

                if (isNew && Math.abs(this.evaluate(root)) < tolerance) {
                    roots.push(root);

                    if (roots.length >= degree) {
                        break;
                    }
                }
            }
        }

        return roots.sort((a, b) => a - b);
    }

    /**
     * Generate starting points for root finding
     * @private
     */
    private generateStartingPoints(): number[] {
        const points: number[] = [];

        // Use Cauchy's bound to estimate root locations
        const bound = this.cauchyBound();

        // Use fewer, more strategic starting points for better performance
        const numPoints = Math.min(this.degree() * 2, 8);

        // Generate points along the real axis
        for (let i = 0; i < numPoints; i++) {
            const x = -bound + (2 * bound * i) / (numPoints - 1);
            points.push(x);
        }

        return points;
    }

    /**
     * Compute Cauchy's bound for polynomial roots
     * @private
     */
    private cauchyBound(): number {
        const an = this.coefficients[this.coefficients.length - 1];
        let max = 0;

        for (let i = 0; i < this.coefficients.length - 1; i++) {
            max = Math.max(max, Math.abs(this.coefficients[i] / an));
        }

        return 1 + max;
    }

    /**
     * Newton-Raphson method for root finding
     * @private
     */
    private newtonRaphson(
        x0: number,
        derivative: Polynomial,
        tolerance: number,
        maxIterations: number = 50
    ): number | null {
        let x = x0;

        for (let i = 0; i < maxIterations; i++) {
            const fx = this.evaluate(x);
            const fpx = derivative.evaluate(x);

            if (Math.abs(fpx) < 1e-15) {
                return null; // Derivative too close to zero
            }

            const xNew = x - fx / fpx;

            if (Math.abs(xNew - x) < tolerance) {
                return xNew;
            }

            x = xNew;
        }

        return null; // Did not converge
    }

    /**
     * Convert polynomial to string representation
     * @param variable - Variable name (default: 'x')
     * @returns String representation
     */
    toString(variable: string = 'x'): string {
        if (this.coefficients.length === 1) {
            return this.coefficients[0].toString();
        }

        const terms: string[] = [];

        for (let i = this.coefficients.length - 1; i >= 0; i--) {
            const coeff = this.coefficients[i];

            if (Math.abs(coeff) < 1e-10) {
                continue;
            }

            let term = '';

            // Coefficient
            if (i === 0 || Math.abs(coeff) !== 1) {
                term += Math.abs(coeff).toString();
            }

            // Variable and power
            if (i > 0) {
                if (term !== '' && term !== '1') {
                    term += '*';
                }
                term += variable;

                if (i > 1) {
                    term += '^' + i;
                }
            }

            // Sign
            if (terms.length > 0) {
                term = (coeff >= 0 ? ' + ' : ' - ') + term;
            } else if (coeff < 0) {
                term = '-' + term;
            }

            terms.push(term);
        }

        return terms.length > 0 ? terms.join('') : '0';
    }

    /**
     * Convert polynomial to LaTeX representation
     * @param variable - Variable name (default: 'x')
     * @returns LaTeX string
     */
    toLatex(variable: string = 'x'): string {
        if (this.coefficients.length === 1) {
            return this.coefficients[0].toString();
        }

        const terms: string[] = [];

        for (let i = this.coefficients.length - 1; i >= 0; i--) {
            const coeff = this.coefficients[i];

            if (Math.abs(coeff) < 1e-10) {
                continue;
            }

            let term = '';

            // Coefficient
            if (i === 0 || Math.abs(coeff) !== 1) {
                term += Math.abs(coeff).toString();
            }

            // Variable and power
            if (i > 0) {
                term += variable;

                if (i > 1) {
                    term += '^{' + i + '}';
                }
            }

            // Sign
            if (terms.length > 0) {
                term = (coeff >= 0 ? ' + ' : ' - ') + term;
            } else if (coeff < 0) {
                term = '-' + term;
            }

            terms.push(term);
        }

        return terms.length > 0 ? terms.join('') : '0';
    }
}

/**
 * Create a polynomial from its roots
 * @param roots - Array of roots
 * @returns Polynomial with the given roots
 *
 * @example
 * ```typescript
 * // Create polynomial with roots 1, 2, 3: (x-1)(x-2)(x-3)
 * const p = fromRoots([1, 2, 3]);
 * ```
 */
export function fromRoots(roots: number[]): Polynomial {
    let result = new Polynomial([1]);

    for (const root of roots) {
        // Multiply by (x - root)
        const factor = new Polynomial([-root, 1]);
        result = result.multiply(factor);
    }

    return result;
}

/**
 * Compute the greatest common divisor (GCD) of two polynomials
 * Uses the Euclidean algorithm
 *
 * @param p1 - First polynomial
 * @param p2 - Second polynomial
 * @returns GCD polynomial
 */
export function gcd(p1: Polynomial, p2: Polynomial): Polynomial {
    let a = p1;
    let b = p2;

    while (b.degree() > 0 || Math.abs(b.getCoefficients()[0]) > 1e-10) {
        const { remainder } = a.divide(b);
        a = b;
        b = remainder;
    }

    // Normalize so leading coefficient is 1
    const coeffs = a.getCoefficients();
    const leadingCoeff = coeffs[coeffs.length - 1];

    return a.scale(1 / leadingCoeff);
}
