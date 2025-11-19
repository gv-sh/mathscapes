/**
 * Automatic Differentiation
 *
 * Provides both forward mode and reverse mode automatic differentiation.
 * Forward mode is efficient for functions with few inputs and many outputs.
 * Reverse mode (backpropagation) is efficient for functions with many inputs and few outputs.
 */

/**
 * Dual number for forward mode automatic differentiation
 * Represents a number with its derivative: x + x' * ε
 */
export class Dual {
    /**
     * Create a dual number
     * @param value - The primal value
     * @param derivative - The derivative value (default: 0)
     */
    constructor(
        public readonly value: number,
        public readonly derivative: number = 0
    ) {}

    /**
     * Create a variable dual number with derivative 1
     */
    static variable(value: number): Dual {
        return new Dual(value, 1);
    }

    /**
     * Create a constant dual number with derivative 0
     */
    static constant(value: number): Dual {
        return new Dual(value, 0);
    }

    // Arithmetic operations
    add(other: Dual | number): Dual {
        if (typeof other === 'number') {
            return new Dual(this.value + other, this.derivative);
        }
        return new Dual(
            this.value + other.value,
            this.derivative + other.derivative
        );
    }

    subtract(other: Dual | number): Dual {
        if (typeof other === 'number') {
            return new Dual(this.value - other, this.derivative);
        }
        return new Dual(
            this.value - other.value,
            this.derivative - other.derivative
        );
    }

    multiply(other: Dual | number): Dual {
        if (typeof other === 'number') {
            return new Dual(this.value * other, this.derivative * other);
        }
        // Product rule: (uv)' = u'v + uv'
        return new Dual(
            this.value * other.value,
            this.derivative * other.value + this.value * other.derivative
        );
    }

    divide(other: Dual | number): Dual {
        if (typeof other === 'number') {
            return new Dual(this.value / other, this.derivative / other);
        }
        // Quotient rule: (u/v)' = (u'v - uv') / v^2
        return new Dual(
            this.value / other.value,
            (this.derivative * other.value - this.value * other.derivative) /
            (other.value * other.value)
        );
    }

    power(exponent: number): Dual {
        // Power rule: (x^n)' = n * x^(n-1) * x'
        return new Dual(
            Math.pow(this.value, exponent),
            exponent * Math.pow(this.value, exponent - 1) * this.derivative
        );
    }

    negate(): Dual {
        return new Dual(-this.value, -this.derivative);
    }

    // Mathematical functions
    sin(): Dual {
        return new Dual(
            Math.sin(this.value),
            Math.cos(this.value) * this.derivative
        );
    }

    cos(): Dual {
        return new Dual(
            Math.cos(this.value),
            -Math.sin(this.value) * this.derivative
        );
    }

    tan(): Dual {
        const cosVal = Math.cos(this.value);
        return new Dual(
            Math.tan(this.value),
            this.derivative / (cosVal * cosVal)
        );
    }

    exp(): Dual {
        const expVal = Math.exp(this.value);
        return new Dual(expVal, expVal * this.derivative);
    }

    ln(): Dual {
        return new Dual(
            Math.log(this.value),
            this.derivative / this.value
        );
    }

    log(): Dual {
        return new Dual(
            Math.log10(this.value),
            this.derivative / (this.value * Math.LN10)
        );
    }

    sqrt(): Dual {
        const sqrtVal = Math.sqrt(this.value);
        return new Dual(
            sqrtVal,
            this.derivative / (2 * sqrtVal)
        );
    }

    abs(): Dual {
        return new Dual(
            Math.abs(this.value),
            this.value >= 0 ? this.derivative : -this.derivative
        );
    }

    asin(): Dual {
        return new Dual(
            Math.asin(this.value),
            this.derivative / Math.sqrt(1 - this.value * this.value)
        );
    }

    acos(): Dual {
        return new Dual(
            Math.acos(this.value),
            -this.derivative / Math.sqrt(1 - this.value * this.value)
        );
    }

    atan(): Dual {
        return new Dual(
            Math.atan(this.value),
            this.derivative / (1 + this.value * this.value)
        );
    }

    toString(): string {
        return `${this.value} + ${this.derivative}ε`;
    }
}

/**
 * Forward mode automatic differentiation
 * Efficient when the number of inputs is small
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate the derivative
 * @returns Object containing the value and derivative
 */
export function forwardMode(
    f: (x: Dual) => Dual,
    x: number
): { value: number; derivative: number } {
    const result = f(Dual.variable(x));
    return { value: result.value, derivative: result.derivative };
}

/**
 * Compute gradient using forward mode AD
 * @param f - Multivariable function
 * @param x - Point at which to evaluate (array of numbers)
 * @returns Gradient vector
 */
export function forwardModeGradient(
    f: (x: Dual[]) => Dual,
    x: number[]
): number[] {
    const gradient: number[] = [];

    for (let i = 0; i < x.length; i++) {
        // Create dual numbers with derivative 1 for the i-th variable
        const duals = x.map((val, j) =>
            i === j ? Dual.variable(val) : Dual.constant(val)
        );
        const result = f(duals);
        gradient.push(result.derivative);
    }

    return gradient;
}

/**
 * Node in the computation graph for reverse mode AD
 */
class ComputationNode {
    value: number;
    gradient: number = 0;
    children: Array<{ node: ComputationNode; gradient: number }> = [];

    constructor(value: number) {
        this.value = value;
    }

    /**
     * Backpropagate gradients through the computation graph
     */
    backward(gradient: number = 1): void {
        this.gradient += gradient;

        for (const { node, gradient: localGrad } of this.children) {
            node.backward(this.gradient * localGrad);
        }
    }

    /**
     * Reset gradients in the computation graph
     */
    zeroGrad(): void {
        this.gradient = 0;
        for (const { node } of this.children) {
            node.zeroGrad();
        }
    }
}

/**
 * Variable for reverse mode automatic differentiation
 * Builds a computation graph during forward pass
 */
export class Variable {
    private node: ComputationNode;

    constructor(value: number) {
        this.node = new ComputationNode(value);
    }

    get value(): number {
        return this.node.value;
    }

    get gradient(): number {
        return this.node.gradient;
    }

    /**
     * Perform backward pass to compute gradients
     */
    backward(): void {
        this.node.backward();
    }

    /**
     * Reset gradients to zero
     */
    zeroGrad(): void {
        this.node.zeroGrad();
    }

    // Arithmetic operations
    add(other: Variable | number): Variable {
        const result = new Variable(
            this.value + (typeof other === 'number' ? other : other.value)
        );

        result.node.children.push({ node: this.node, gradient: 1 });
        if (other instanceof Variable) {
            result.node.children.push({ node: other.node, gradient: 1 });
        }

        return result;
    }

    subtract(other: Variable | number): Variable {
        const result = new Variable(
            this.value - (typeof other === 'number' ? other : other.value)
        );

        result.node.children.push({ node: this.node, gradient: 1 });
        if (other instanceof Variable) {
            result.node.children.push({ node: other.node, gradient: -1 });
        }

        return result;
    }

    multiply(other: Variable | number): Variable {
        const otherVal = typeof other === 'number' ? other : other.value;
        const result = new Variable(this.value * otherVal);

        result.node.children.push({ node: this.node, gradient: otherVal });
        if (other instanceof Variable) {
            result.node.children.push({ node: other.node, gradient: this.value });
        }

        return result;
    }

    divide(other: Variable | number): Variable {
        const otherVal = typeof other === 'number' ? other : other.value;
        const result = new Variable(this.value / otherVal);

        result.node.children.push({ node: this.node, gradient: 1 / otherVal });
        if (other instanceof Variable) {
            result.node.children.push({
                node: other.node,
                gradient: -this.value / (otherVal * otherVal)
            });
        }

        return result;
    }

    power(exponent: number): Variable {
        const result = new Variable(Math.pow(this.value, exponent));
        result.node.children.push({
            node: this.node,
            gradient: exponent * Math.pow(this.value, exponent - 1)
        });
        return result;
    }

    negate(): Variable {
        const result = new Variable(-this.value);
        result.node.children.push({ node: this.node, gradient: -1 });
        return result;
    }

    // Mathematical functions
    sin(): Variable {
        const result = new Variable(Math.sin(this.value));
        result.node.children.push({
            node: this.node,
            gradient: Math.cos(this.value)
        });
        return result;
    }

    cos(): Variable {
        const result = new Variable(Math.cos(this.value));
        result.node.children.push({
            node: this.node,
            gradient: -Math.sin(this.value)
        });
        return result;
    }

    tan(): Variable {
        const cosVal = Math.cos(this.value);
        const result = new Variable(Math.tan(this.value));
        result.node.children.push({
            node: this.node,
            gradient: 1 / (cosVal * cosVal)
        });
        return result;
    }

    exp(): Variable {
        const expVal = Math.exp(this.value);
        const result = new Variable(expVal);
        result.node.children.push({ node: this.node, gradient: expVal });
        return result;
    }

    ln(): Variable {
        const result = new Variable(Math.log(this.value));
        result.node.children.push({
            node: this.node,
            gradient: 1 / this.value
        });
        return result;
    }

    log(): Variable {
        const result = new Variable(Math.log10(this.value));
        result.node.children.push({
            node: this.node,
            gradient: 1 / (this.value * Math.LN10)
        });
        return result;
    }

    sqrt(): Variable {
        const sqrtVal = Math.sqrt(this.value);
        const result = new Variable(sqrtVal);
        result.node.children.push({
            node: this.node,
            gradient: 1 / (2 * sqrtVal)
        });
        return result;
    }

    abs(): Variable {
        const result = new Variable(Math.abs(this.value));
        result.node.children.push({
            node: this.node,
            gradient: this.value >= 0 ? 1 : -1
        });
        return result;
    }

    asin(): Variable {
        const result = new Variable(Math.asin(this.value));
        result.node.children.push({
            node: this.node,
            gradient: 1 / Math.sqrt(1 - this.value * this.value)
        });
        return result;
    }

    acos(): Variable {
        const result = new Variable(Math.acos(this.value));
        result.node.children.push({
            node: this.node,
            gradient: -1 / Math.sqrt(1 - this.value * this.value)
        });
        return result;
    }

    atan(): Variable {
        const result = new Variable(Math.atan(this.value));
        result.node.children.push({
            node: this.node,
            gradient: 1 / (1 + this.value * this.value)
        });
        return result;
    }

    toString(): string {
        return `Variable(value=${this.value}, grad=${this.gradient})`;
    }
}

/**
 * Reverse mode automatic differentiation
 * Efficient when the number of outputs is small (e.g., for ML applications)
 * @param f - Function to differentiate
 * @param x - Point at which to evaluate the derivative
 * @returns Object containing the value and derivative
 */
export function reverseMode(
    f: (x: Variable) => Variable,
    x: number
): { value: number; derivative: number } {
    const input = new Variable(x);
    const output = f(input);
    output.backward();

    return { value: output.value, derivative: input.gradient };
}

/**
 * Compute gradient using reverse mode AD (backpropagation)
 * More efficient than forward mode for many inputs, few outputs
 * @param f - Multivariable function
 * @param x - Point at which to evaluate (array of numbers)
 * @returns Gradient vector
 */
export function reverseModeGradient(
    f: (x: Variable[]) => Variable,
    x: number[]
): number[] {
    const inputs = x.map(val => new Variable(val));
    const output = f(inputs);
    output.backward();

    return inputs.map(input => input.gradient);
}
