/**
 * Mathematical Functions (Trigonometric, Exponential, Logarithmic, etc.)
 *
 * Provides expression types for common mathematical functions.
 */

import { Expression, Constant } from './expression';

/**
 * Base class for unary functions
 */
abstract class UnaryFunction extends Expression {
    constructor(public readonly argument: Expression) {
        super();
    }

    abstract evaluateFunction(x: number): number;
    abstract functionName(): string;
    abstract latexName(): string;

    evaluate(variables?: Map<string, number>): number {
        return this.evaluateFunction(this.argument.evaluate(variables));
    }

    toString(): string {
        return `${this.functionName()}(${this.argument.toString()})`;
    }

    toLatex(): string {
        return `\\${this.latexName()}\\left(${this.argument.toLatex()}\\right)`;
    }

    toUnicode(): string {
        return `${this.functionName()}(${this.argument.toUnicode()})`;
    }

    getVariables(): Set<string> {
        return this.argument.getVariables();
    }
}

/**
 * Sine function: sin(x)
 */
export class Sin extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.sin(x);
    }

    functionName(): string {
        return 'sin';
    }

    latexName(): string {
        return 'sin';
    }

    equals(other: Expression): boolean {
        return other instanceof Sin && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Sin(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            return new Constant(Math.sin(arg.value));
        }

        return new Sin(arg);
    }
}

/**
 * Cosine function: cos(x)
 */
export class Cos extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.cos(x);
    }

    functionName(): string {
        return 'cos';
    }

    latexName(): string {
        return 'cos';
    }

    equals(other: Expression): boolean {
        return other instanceof Cos && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Cos(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            return new Constant(Math.cos(arg.value));
        }

        return new Cos(arg);
    }
}

/**
 * Tangent function: tan(x)
 */
export class Tan extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.tan(x);
    }

    functionName(): string {
        return 'tan';
    }

    latexName(): string {
        return 'tan';
    }

    equals(other: Expression): boolean {
        return other instanceof Tan && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Tan(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            return new Constant(Math.tan(arg.value));
        }

        return new Tan(arg);
    }
}

/**
 * Arcsine function: asin(x)
 */
export class Asin extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.asin(x);
    }

    functionName(): string {
        return 'asin';
    }

    latexName(): string {
        return 'arcsin';
    }

    equals(other: Expression): boolean {
        return other instanceof Asin && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Asin(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            return new Constant(Math.asin(arg.value));
        }

        return new Asin(arg);
    }
}

/**
 * Arccosine function: acos(x)
 */
export class Acos extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.acos(x);
    }

    functionName(): string {
        return 'acos';
    }

    latexName(): string {
        return 'arccos';
    }

    equals(other: Expression): boolean {
        return other instanceof Acos && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Acos(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            return new Constant(Math.acos(arg.value));
        }

        return new Acos(arg);
    }
}

/**
 * Arctangent function: atan(x)
 */
export class Atan extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.atan(x);
    }

    functionName(): string {
        return 'atan';
    }

    latexName(): string {
        return 'arctan';
    }

    equals(other: Expression): boolean {
        return other instanceof Atan && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Atan(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            return new Constant(Math.atan(arg.value));
        }

        return new Atan(arg);
    }
}

/**
 * Natural exponential function: exp(x) = e^x
 */
export class Exp extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.exp(x);
    }

    functionName(): string {
        return 'exp';
    }

    latexName(): string {
        return 'exp';
    }

    equals(other: Expression): boolean {
        return other instanceof Exp && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Exp(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            return new Constant(Math.exp(arg.value));
        }

        return new Exp(arg);
    }
}

/**
 * Natural logarithm: ln(x) = log_e(x)
 */
export class Ln extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.log(x);
    }

    functionName(): string {
        return 'ln';
    }

    latexName(): string {
        return 'ln';
    }

    equals(other: Expression): boolean {
        return other instanceof Ln && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Ln(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            if (arg.value <= 0) {
                throw new Error('Logarithm of non-positive number');
            }
            return new Constant(Math.log(arg.value));
        }

        return new Ln(arg);
    }
}

/**
 * Base-10 logarithm: log(x) = log_10(x)
 */
export class Log extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.log10(x);
    }

    functionName(): string {
        return 'log';
    }

    latexName(): string {
        return 'log';
    }

    equals(other: Expression): boolean {
        return other instanceof Log && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Log(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            if (arg.value <= 0) {
                throw new Error('Logarithm of non-positive number');
            }
            return new Constant(Math.log10(arg.value));
        }

        return new Log(arg);
    }
}

/**
 * Square root: sqrt(x) = x^(1/2)
 */
export class Sqrt extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.sqrt(x);
    }

    functionName(): string {
        return 'sqrt';
    }

    latexName(): string {
        return 'sqrt';
    }

    toLatex(): string {
        return `\\sqrt{${this.argument.toLatex()}}`;
    }

    toUnicode(): string {
        return `√(${this.argument.toUnicode()})`;
    }

    equals(other: Expression): boolean {
        return other instanceof Sqrt && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Sqrt(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            if (arg.value < 0) {
                throw new Error('Square root of negative number');
            }
            return new Constant(Math.sqrt(arg.value));
        }

        return new Sqrt(arg);
    }
}

/**
 * Absolute value: abs(x) = |x|
 */
export class Abs extends UnaryFunction {
    evaluateFunction(x: number): number {
        return Math.abs(x);
    }

    functionName(): string {
        return 'abs';
    }

    latexName(): string {
        return 'left|';
    }

    toLatex(): string {
        return `\\left|${this.argument.toLatex()}\\right|`;
    }

    toUnicode(): string {
        return `|${this.argument.toUnicode()}|`;
    }

    equals(other: Expression): boolean {
        return other instanceof Abs && this.argument.equals(other.argument);
    }

    clone(): Expression {
        return new Abs(this.argument.clone());
    }

    simplify(): Expression {
        const arg = this.argument.simplify();

        if (arg instanceof Constant) {
            return new Constant(Math.abs(arg.value));
        }

        return new Abs(arg);
    }
}
