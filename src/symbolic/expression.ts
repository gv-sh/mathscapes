/**
 * Symbolic Expression System
 *
 * Provides an Abstract Syntax Tree (AST) representation for mathematical expressions.
 * Supports symbolic computation, pattern matching, and expression manipulation.
 */

/**
 * Base class for all symbolic expressions
 */
export abstract class Expression {
    /**
     * Evaluate the expression with given variable values
     * @param variables - Map of variable names to their numerical values
     * @returns The numerical result of the expression
     */
    abstract evaluate(variables?: Map<string, number>): number;

    /**
     * Convert expression to a string representation
     * @returns String representation of the expression
     */
    abstract toString(): string;

    /**
     * Convert expression to LaTeX format
     * @returns LaTeX string representation
     */
    abstract toLatex(): string;

    /**
     * Convert expression to Unicode pretty-print format
     * @returns Unicode string representation
     */
    abstract toUnicode(): string;

    /**
     * Check if this expression is equal to another
     * @param other - Expression to compare with
     * @returns True if expressions are structurally equal
     */
    abstract equals(other: Expression): boolean;

    /**
     * Create a deep copy of this expression
     * @returns A new expression with the same structure
     */
    abstract clone(): Expression;

    /**
     * Simplify the expression
     * @returns A simplified version of the expression
     */
    abstract simplify(): Expression;

    /**
     * Get all variables used in this expression
     * @returns Set of variable names
     */
    abstract getVariables(): Set<string>;
}

/**
 * Constant numeric value
 */
export class Constant extends Expression {
    constructor(public readonly value: number) {
        super();
    }

    evaluate(): number {
        return this.value;
    }

    toString(): string {
        return this.value.toString();
    }

    toLatex(): string {
        return this.value.toString();
    }

    toUnicode(): string {
        return this.value.toString();
    }

    equals(other: Expression): boolean {
        return other instanceof Constant && this.value === other.value;
    }

    clone(): Expression {
        return new Constant(this.value);
    }

    simplify(): Expression {
        return this;
    }

    getVariables(): Set<string> {
        return new Set();
    }
}

/**
 * Variable symbol
 */
export class Variable extends Expression {
    constructor(public readonly name: string) {
        super();
    }

    evaluate(variables?: Map<string, number>): number {
        if (!variables || !variables.has(this.name)) {
            throw new Error(`Variable '${this.name}' is not defined`);
        }
        return variables.get(this.name)!;
    }

    toString(): string {
        return this.name;
    }

    toLatex(): string {
        return this.name;
    }

    toUnicode(): string {
        return this.name;
    }

    equals(other: Expression): boolean {
        return other instanceof Variable && this.name === other.name;
    }

    clone(): Expression {
        return new Variable(this.name);
    }

    simplify(): Expression {
        return this;
    }

    getVariables(): Set<string> {
        return new Set([this.name]);
    }
}

/**
 * Addition expression: a + b + c + ...
 */
export class Add extends Expression {
    constructor(public readonly terms: Expression[]) {
        super();
        if (terms.length < 2) {
            throw new Error('Add requires at least 2 terms');
        }
    }

    evaluate(variables?: Map<string, number>): number {
        return this.terms.reduce((sum, term) => sum + term.evaluate(variables), 0);
    }

    toString(): string {
        return '(' + this.terms.map(t => t.toString()).join(' + ') + ')';
    }

    toLatex(): string {
        return this.terms.map(t => t.toLatex()).join(' + ');
    }

    toUnicode(): string {
        return this.terms.map(t => t.toUnicode()).join(' + ');
    }

    equals(other: Expression): boolean {
        if (!(other instanceof Add) || this.terms.length !== other.terms.length) {
            return false;
        }
        // For commutative operations, we need a more sophisticated comparison
        // For now, we just check element-wise
        return this.terms.every((term, i) => term.equals(other.terms[i]));
    }

    clone(): Expression {
        return new Add(this.terms.map(t => t.clone()));
    }

    simplify(): Expression {
        const simplified = this.terms.map(t => t.simplify());

        // Collect constants
        let constantSum = 0;
        const nonConstants: Expression[] = [];

        for (const term of simplified) {
            if (term instanceof Constant) {
                constantSum += term.value;
            } else {
                nonConstants.push(term);
            }
        }

        // Build result
        const result: Expression[] = [];
        if (constantSum !== 0 || nonConstants.length === 0) {
            result.push(new Constant(constantSum));
        }
        result.push(...nonConstants);

        if (result.length === 0) {
            return new Constant(0);
        }
        if (result.length === 1) {
            return result[0];
        }
        return new Add(result);
    }

    getVariables(): Set<string> {
        const vars = new Set<string>();
        for (const term of this.terms) {
            for (const v of term.getVariables()) {
                vars.add(v);
            }
        }
        return vars;
    }
}

/**
 * Subtraction expression: a - b
 */
export class Subtract extends Expression {
    constructor(public readonly left: Expression, public readonly right: Expression) {
        super();
    }

    evaluate(variables?: Map<string, number>): number {
        return this.left.evaluate(variables) - this.right.evaluate(variables);
    }

    toString(): string {
        return `(${this.left.toString()} - ${this.right.toString()})`;
    }

    toLatex(): string {
        return `${this.left.toLatex()} - ${this.right.toLatex()}`;
    }

    toUnicode(): string {
        return `${this.left.toUnicode()} - ${this.right.toUnicode()}`;
    }

    equals(other: Expression): boolean {
        return other instanceof Subtract &&
            this.left.equals(other.left) &&
            this.right.equals(other.right);
    }

    clone(): Expression {
        return new Subtract(this.left.clone(), this.right.clone());
    }

    simplify(): Expression {
        const left = this.left.simplify();
        const right = this.right.simplify();

        if (left instanceof Constant && right instanceof Constant) {
            return new Constant(left.value - right.value);
        }

        if (right instanceof Constant && right.value === 0) {
            return left;
        }

        return new Subtract(left, right);
    }

    getVariables(): Set<string> {
        const vars = new Set<string>();
        for (const v of this.left.getVariables()) {
            vars.add(v);
        }
        for (const v of this.right.getVariables()) {
            vars.add(v);
        }
        return vars;
    }
}

/**
 * Multiplication expression: a * b * c * ...
 */
export class Multiply extends Expression {
    constructor(public readonly factors: Expression[]) {
        super();
        if (factors.length < 2) {
            throw new Error('Multiply requires at least 2 factors');
        }
    }

    evaluate(variables?: Map<string, number>): number {
        return this.factors.reduce((product, factor) => product * factor.evaluate(variables), 1);
    }

    toString(): string {
        return '(' + this.factors.map(f => f.toString()).join(' * ') + ')';
    }

    toLatex(): string {
        return this.factors.map(f => {
            if (f instanceof Add || f instanceof Subtract) {
                return `(${f.toLatex()})`;
            }
            return f.toLatex();
        }).join(' \\cdot ');
    }

    toUnicode(): string {
        return this.factors.map(f => {
            if (f instanceof Add || f instanceof Subtract) {
                return `(${f.toUnicode()})`;
            }
            return f.toUnicode();
        }).join('·');
    }

    equals(other: Expression): boolean {
        if (!(other instanceof Multiply) || this.factors.length !== other.factors.length) {
            return false;
        }
        return this.factors.every((factor, i) => factor.equals(other.factors[i]));
    }

    clone(): Expression {
        return new Multiply(this.factors.map(f => f.clone()));
    }

    simplify(): Expression {
        const simplified = this.factors.map(f => f.simplify());

        // Collect constants
        let constantProduct = 1;
        const nonConstants: Expression[] = [];

        for (const factor of simplified) {
            if (factor instanceof Constant) {
                constantProduct *= factor.value;
            } else {
                nonConstants.push(factor);
            }
        }

        // If any factor is 0, the whole expression is 0
        if (constantProduct === 0) {
            return new Constant(0);
        }

        // Build result
        const result: Expression[] = [];
        if (constantProduct !== 1 || nonConstants.length === 0) {
            result.push(new Constant(constantProduct));
        }
        result.push(...nonConstants);

        if (result.length === 0) {
            return new Constant(1);
        }
        if (result.length === 1) {
            return result[0];
        }
        return new Multiply(result);
    }

    getVariables(): Set<string> {
        const vars = new Set<string>();
        for (const factor of this.factors) {
            for (const v of factor.getVariables()) {
                vars.add(v);
            }
        }
        return vars;
    }
}

/**
 * Division expression: a / b
 */
export class Divide extends Expression {
    constructor(public readonly numerator: Expression, public readonly denominator: Expression) {
        super();
    }

    evaluate(variables?: Map<string, number>): number {
        const denom = this.denominator.evaluate(variables);
        if (denom === 0) {
            throw new Error('Division by zero');
        }
        return this.numerator.evaluate(variables) / denom;
    }

    toString(): string {
        return `(${this.numerator.toString()} / ${this.denominator.toString()})`;
    }

    toLatex(): string {
        return `\\frac{${this.numerator.toLatex()}}{${this.denominator.toLatex()}}`;
    }

    toUnicode(): string {
        return `${this.numerator.toUnicode()} / ${this.denominator.toUnicode()}`;
    }

    equals(other: Expression): boolean {
        return other instanceof Divide &&
            this.numerator.equals(other.numerator) &&
            this.denominator.equals(other.denominator);
    }

    clone(): Expression {
        return new Divide(this.numerator.clone(), this.denominator.clone());
    }

    simplify(): Expression {
        const num = this.numerator.simplify();
        const denom = this.denominator.simplify();

        if (num instanceof Constant && denom instanceof Constant) {
            if (denom.value === 0) {
                throw new Error('Division by zero');
            }
            return new Constant(num.value / denom.value);
        }

        if (denom instanceof Constant && denom.value === 1) {
            return num;
        }

        if (num instanceof Constant && num.value === 0) {
            return new Constant(0);
        }

        return new Divide(num, denom);
    }

    getVariables(): Set<string> {
        const vars = new Set<string>();
        for (const v of this.numerator.getVariables()) {
            vars.add(v);
        }
        for (const v of this.denominator.getVariables()) {
            vars.add(v);
        }
        return vars;
    }
}

/**
 * Power expression: base^exponent
 */
export class Power extends Expression {
    constructor(public readonly base: Expression, public readonly exponent: Expression) {
        super();
    }

    evaluate(variables?: Map<string, number>): number {
        return Math.pow(this.base.evaluate(variables), this.exponent.evaluate(variables));
    }

    toString(): string {
        const baseStr = this.base instanceof Add || this.base instanceof Subtract ||
                        this.base instanceof Multiply || this.base instanceof Divide
            ? `(${this.base.toString()})`
            : this.base.toString();
        return `${baseStr}^${this.exponent.toString()}`;
    }

    toLatex(): string {
        const baseStr = this.base instanceof Add || this.base instanceof Subtract ||
                        this.base instanceof Multiply || this.base instanceof Divide
            ? `(${this.base.toLatex()})`
            : this.base.toLatex();
        return `${baseStr}^{${this.exponent.toLatex()}}`;
    }

    toUnicode(): string {
        const baseStr = this.base instanceof Add || this.base instanceof Subtract ||
                        this.base instanceof Multiply || this.base instanceof Divide
            ? `(${this.base.toUnicode()})`
            : this.base.toUnicode();

        // Convert exponent to superscript if it's a simple number
        if (this.exponent instanceof Constant) {
            const expStr = this.exponent.value.toString();
            const superscripts: { [key: string]: string } = {
                '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
                '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
                '-': '⁻', '.': '·'
            };
            const unicodeExp = expStr.split('').map(c => superscripts[c] || c).join('');
            return `${baseStr}${unicodeExp}`;
        }

        return `${baseStr}^(${this.exponent.toUnicode()})`;
    }

    equals(other: Expression): boolean {
        return other instanceof Power &&
            this.base.equals(other.base) &&
            this.exponent.equals(other.exponent);
    }

    clone(): Expression {
        return new Power(this.base.clone(), this.exponent.clone());
    }

    simplify(): Expression {
        const base = this.base.simplify();
        const exp = this.exponent.simplify();

        // x^0 = 1
        if (exp instanceof Constant && exp.value === 0) {
            return new Constant(1);
        }

        // x^1 = x
        if (exp instanceof Constant && exp.value === 1) {
            return base;
        }

        // c1^c2 = constant
        if (base instanceof Constant && exp instanceof Constant) {
            return new Constant(Math.pow(base.value, exp.value));
        }

        return new Power(base, exp);
    }

    getVariables(): Set<string> {
        const vars = new Set<string>();
        for (const v of this.base.getVariables()) {
            vars.add(v);
        }
        for (const v of this.exponent.getVariables()) {
            vars.add(v);
        }
        return vars;
    }
}

/**
 * Negation expression: -a
 */
export class Negate extends Expression {
    constructor(public readonly operand: Expression) {
        super();
    }

    evaluate(variables?: Map<string, number>): number {
        return -this.operand.evaluate(variables);
    }

    toString(): string {
        if (this.operand instanceof Add || this.operand instanceof Subtract) {
            return `-(${this.operand.toString()})`;
        }
        return `-${this.operand.toString()}`;
    }

    toLatex(): string {
        if (this.operand instanceof Add || this.operand instanceof Subtract) {
            return `-(${this.operand.toLatex()})`;
        }
        return `-${this.operand.toLatex()}`;
    }

    toUnicode(): string {
        if (this.operand instanceof Add || this.operand instanceof Subtract) {
            return `-(${this.operand.toUnicode()})`;
        }
        return `-${this.operand.toUnicode()}`;
    }

    equals(other: Expression): boolean {
        return other instanceof Negate && this.operand.equals(other.operand);
    }

    clone(): Expression {
        return new Negate(this.operand.clone());
    }

    simplify(): Expression {
        const operand = this.operand.simplify();

        if (operand instanceof Constant) {
            return new Constant(-operand.value);
        }

        if (operand instanceof Negate) {
            return operand.operand;
        }

        return new Negate(operand);
    }

    getVariables(): Set<string> {
        return this.operand.getVariables();
    }
}
