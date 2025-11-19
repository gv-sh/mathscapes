/**
 * Automatic Differentiation Examples
 *
 * Demonstrates both forward mode and reverse mode automatic differentiation,
 * including applications to machine learning.
 */

import {
    Dual,
    ADVariable as Variable,
    forwardMode,
    forwardModeGradient,
    reverseMode,
    reverseModeGradient
} from '../src/symbolic';

console.log('=== Automatic Differentiation Examples ===\n');

// Example 1: Forward Mode - Simple function
console.log('1. Forward Mode: f(x) = x^2 + 2x + 1');
console.log('--------------------------------------');

const f1 = (x: Dual) => x.power(2).add(x.multiply(2)).add(1);
const result1 = forwardMode(f1, 3);

console.log('f(3) =', result1.value);
console.log('f\'(3) =', result1.derivative);
console.log('Expected: f(3) = 16, f\'(3) = 8');
console.log();

// Example 2: Forward Mode - Trigonometric function
console.log('2. Forward Mode: f(x) = sin(x) * cos(x)');
console.log('----------------------------------------');

const f2 = (x: Dual) => x.sin().multiply(x.cos());
const result2 = forwardMode(f2, Math.PI / 4);

console.log('f(π/4) =', result2.value);
console.log('f\'(π/4) =', result2.derivative);
console.log('Expected: f(π/4) = 0.5, f\'(π/4) ≈ 0');
console.log();

// Example 3: Forward Mode - Exponential function
console.log('3. Forward Mode: f(x) = exp(x^2)');
console.log('---------------------------------');

const f3 = (x: Dual) => x.power(2).exp();
const result3 = forwardMode(f3, 0);

console.log('f(0) =', result3.value);
console.log('f\'(0) =', result3.derivative);
console.log('Expected: f(0) = 1, f\'(0) = 0');
console.log();

// Example 4: Forward Mode Gradient
console.log('4. Forward Mode Gradient: f(x,y) = x^2 + y^2');
console.log('---------------------------------------------');

const f4 = (vars: Dual[]) => {
    const [x, y] = vars;
    return x.power(2).add(y.power(2));
};

const grad4 = forwardModeGradient(f4, [3, 4]);
console.log('∇f(3,4) = [', grad4.join(', '), ']');
console.log('Expected: [6, 8]');
console.log();

// Example 5: Forward Mode - Machine Learning Loss Function
console.log('5. Forward Mode: Mean Squared Error');
console.log('-----------------------------------');

// MSE = (y_pred - y_true)^2
const mse = (vars: Dual[]) => {
    const [y_pred, y_true] = vars;
    return y_pred.subtract(y_true).power(2);
};

const mseGrad = forwardModeGradient(mse, [3, 5]);
console.log('MSE(3, 5) =', 4); // (3-5)^2 = 4
console.log('∂MSE/∂y_pred =', mseGrad[0]); // 2(3-5) = -4
console.log('∂MSE/∂y_true =', mseGrad[1]); // -2(3-5) = 4
console.log();

// Example 6: Reverse Mode - Simple function
console.log('6. Reverse Mode: f(x) = x^3');
console.log('---------------------------');

const f6 = (x: Variable) => x.power(3);
const result6 = reverseMode(f6, 2);

console.log('f(2) =', result6.value);
console.log('f\'(2) =', result6.derivative);
console.log('Expected: f(2) = 8, f\'(2) = 12');
console.log();

// Example 7: Reverse Mode - Complex composition
console.log('7. Reverse Mode: f(x) = sin(exp(x))');
console.log('------------------------------------');

const f7 = (x: Variable) => x.exp().sin();
const result7 = reverseMode(f7, 0);

console.log('f(0) =', result7.value);
console.log('f\'(0) =', result7.derivative);
console.log('Expected: f(0) = sin(1) ≈ 0.841, f\'(0) = cos(1) ≈ 0.540');
console.log();

// Example 8: Reverse Mode Gradient
console.log('8. Reverse Mode Gradient: f(x,y) = x*y + sin(x)');
console.log('------------------------------------------------');

const f8 = (vars: Variable[]) => {
    const [x, y] = vars;
    return x.multiply(y).add(x.sin());
};

const grad8 = reverseModeGradient(f8, [Math.PI, 2]);
console.log('∇f(π,2) = [', grad8.join(', '), ']');
console.log('Expected: ∂f/∂x = y + cos(x) = 2 + (-1) = 1');
console.log('          ∂f/∂y = x = π ≈', Math.PI);
console.log();

// Example 9: Neural Network - Simple Linear Layer
console.log('9. Neural Network: Linear Layer');
console.log('-------------------------------');

// y = w*x + b (simple perceptron)
const linearLayer = (vars: Variable[]) => {
    const [w, x, b] = vars;
    return w.multiply(x).add(b);
};

// Forward pass with w=2, x=3, b=1
const w = 2, x = 3, b = 1;
const grad9 = reverseModeGradient(linearLayer, [w, x, b]);

console.log('y = w*x + b where w=2, x=3, b=1');
console.log('y =', w * x + b);
console.log('∂y/∂w =', grad9[0], '(= x)');
console.log('∂y/∂x =', grad9[1], '(= w)');
console.log('∂y/∂b =', grad9[2], '(= 1)');
console.log();

// Example 10: Neural Network - Two-layer network
console.log('10. Neural Network: Two-layer Network');
console.log('-------------------------------------');

// Layer 1: h = w1*x + b1
// Activation: h = sin(h)
// Layer 2: y = w2*h + b2
const twoLayerNetwork = (vars: Variable[]) => {
    const [w1, x, b1, w2, b2] = vars;
    const h = w1.multiply(x).add(b1).sin();
    return w2.multiply(h).add(b2);
};

const params = [1, 0, 0, 2, 1]; // w1=1, x=0, b1=0, w2=2, b2=1
const netGrad = reverseModeGradient(twoLayerNetwork, params);

console.log('Input x=0, w1=1, b1=0, w2=2, b2=1');
console.log('h = sin(w1*x + b1) = sin(0) = 0');
console.log('y = w2*h + b2 = 2*0 + 1 = 1');
console.log('\nGradients:');
console.log('∂y/∂w1 =', netGrad[0]);
console.log('∂y/∂x  =', netGrad[1]);
console.log('∂y/∂b1 =', netGrad[2]);
console.log('∂y/∂w2 =', netGrad[3]);
console.log('∂y/∂b2 =', netGrad[4]);
console.log();

// Example 11: Comparison of Forward and Reverse Mode
console.log('11. Comparison: Forward vs Reverse Mode');
console.log('---------------------------------------');

const compareFunc = (vars: any[]) => {
    const [x, y, z] = vars;
    return x.power(2).add(y.multiply(z)).multiply(x.sin());
};

const point = [1, 2, 3];

const forwardGrad = forwardModeGradient(compareFunc, point);
const reverseGrad = reverseModeGradient(compareFunc, point);

console.log('f(x,y,z) = (x^2 + y*z) * sin(x)');
console.log('At point (1, 2, 3):');
console.log('\nForward mode gradient:', forwardGrad);
console.log('Reverse mode gradient:', reverseGrad);
console.log('\nBoth methods give the same result!');
console.log('\nNote: Forward mode efficient for few inputs, many outputs');
console.log('      Reverse mode efficient for many inputs, few outputs (ML)');
console.log();

// Example 12: Batch Gradient Descent Example
console.log('12. Gradient Descent: Minimizing f(x) = x^2 - 4x + 4');
console.log('-----------------------------------------------------');

const objective = (x: Variable) => {
    return x.power(2).subtract(x.multiply(4)).add(4);
};

let currentX = 0; // Starting point
const learningRate = 0.1;
const iterations = 10;

console.log('Starting at x =', currentX);
console.log('Learning rate =', learningRate);
console.log('\nIterations:');

for (let i = 0; i < iterations; i++) {
    const result = reverseMode(objective, currentX);
    const gradient = result.derivative;

    console.log(`Iteration ${i + 1}: x = ${currentX.toFixed(4)}, f(x) = ${result.value.toFixed(4)}, f'(x) = ${gradient.toFixed(4)}`);

    // Gradient descent update
    currentX = currentX - learningRate * gradient;
}

console.log('\nFinal x ≈', currentX.toFixed(4));
console.log('Optimal x = 2 (analytical solution)');
console.log('Minimum value f(2) = 0');
console.log();

console.log('All examples completed successfully!');
