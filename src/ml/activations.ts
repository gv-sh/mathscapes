/**
 * Machine Learning Activation Functions Module
 *
 * This module provides common activation functions used in neural networks,
 * along with their derivatives for backpropagation.
 *
 * Each activation function includes:
 * - Forward pass computation
 * - Derivative (gradient) computation for backpropagation
 * - Mathematical explanation and use cases
 */

/**
 * Rectified Linear Unit (ReLU) activation function.
 *
 * ReLU(x) = max(0, x)
 *
 * Most popular activation function due to:
 * - Computational efficiency
 * - Helps mitigate vanishing gradient problem
 * - Introduces non-linearity while being simple
 *
 * @param x - Input value or array
 * @returns Activated output
 *
 * @example
 * ```ts
 * relu(2.5);    // 2.5
 * relu(-1.5);   // 0
 * relu([1, -2, 3]); // [1, 0, 3]
 * ```
 */
export function relu(x: number): number;
export function relu(x: number[]): number[];
export function relu(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => Math.max(0, val));
  }
  return Math.max(0, x);
}

/**
 * Derivative of ReLU activation function.
 *
 * ReLU'(x) = 1 if x > 0, else 0
 *
 * @param x - Input value or array
 * @returns Gradient
 */
export function reluDerivative(x: number): number;
export function reluDerivative(x: number[]): number[];
export function reluDerivative(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => val > 0 ? 1 : 0);
  }
  return x > 0 ? 1 : 0;
}

/**
 * Leaky ReLU activation function.
 *
 * LeakyReLU(x) = max(αx, x) where α is a small constant (default 0.01)
 *
 * Improves upon ReLU by allowing a small gradient when x < 0,
 * preventing "dying ReLU" problem.
 *
 * @param x - Input value or array
 * @param alpha - Slope for negative values (default 0.01)
 * @returns Activated output
 *
 * @example
 * ```ts
 * leakyRelu(2.5);      // 2.5
 * leakyRelu(-1);       // -0.01
 * leakyRelu(-1, 0.2);  // -0.2
 * ```
 */
export function leakyRelu(x: number, alpha?: number): number;
export function leakyRelu(x: number[], alpha?: number): number[];
export function leakyRelu(x: number | number[], alpha: number = 0.01): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => val > 0 ? val : alpha * val);
  }
  return x > 0 ? x : alpha * x;
}

/**
 * Derivative of Leaky ReLU.
 *
 * LeakyReLU'(x) = 1 if x > 0, else α
 *
 * @param x - Input value or array
 * @param alpha - Slope for negative values (default 0.01)
 * @returns Gradient
 */
export function leakyReluDerivative(x: number, alpha?: number): number;
export function leakyReluDerivative(x: number[], alpha?: number): number[];
export function leakyReluDerivative(x: number | number[], alpha: number = 0.01): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => val > 0 ? 1 : alpha);
  }
  return x > 0 ? 1 : alpha;
}

/**
 * Parametric ReLU (PReLU) activation function.
 *
 * PReLU(x) = max(αx, x) where α is a learnable parameter
 *
 * Similar to Leaky ReLU but α is learned during training.
 * This implementation uses a fixed α value.
 *
 * @param x - Input value or array
 * @param alpha - Slope parameter (default 0.25)
 * @returns Activated output
 */
export function prelu(x: number, alpha?: number): number;
export function prelu(x: number[], alpha?: number): number[];
export function prelu(x: number | number[], alpha: number = 0.25): number | number[] {
  if (Array.isArray(x)) {
    return leakyRelu(x, alpha);
  }
  return leakyRelu(x, alpha);
}

/**
 * Derivative of PReLU.
 *
 * PReLU'(x) = 1 if x > 0, else α
 *
 * @param x - Input value or array
 * @param alpha - Slope parameter (default 0.25)
 * @returns Gradient
 */
export function preluDerivative(x: number, alpha?: number): number;
export function preluDerivative(x: number[], alpha?: number): number[];
export function preluDerivative(x: number | number[], alpha: number = 0.25): number | number[] {
  if (Array.isArray(x)) {
    return leakyReluDerivative(x, alpha);
  }
  return leakyReluDerivative(x, alpha);
}

/**
 * Exponential Linear Unit (ELU) activation function.
 *
 * ELU(x) = x if x > 0, else α(e^x - 1)
 *
 * Advantages:
 * - Smooth function everywhere
 * - Can produce negative outputs, helping push mean activations closer to zero
 * - Reduces bias shift effect
 *
 * @param x - Input value or array
 * @param alpha - Scaling parameter for negative values (default 1.0)
 * @returns Activated output
 *
 * @example
 * ```ts
 * elu(2.5);     // 2.5
 * elu(-1);      // -0.632...
 * ```
 */
export function elu(x: number, alpha?: number): number;
export function elu(x: number[], alpha?: number): number[];
export function elu(x: number | number[], alpha: number = 1.0): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => val > 0 ? val : alpha * (Math.exp(val) - 1));
  }
  return x > 0 ? x : alpha * (Math.exp(x) - 1);
}

/**
 * Derivative of ELU.
 *
 * ELU'(x) = 1 if x > 0, else α * e^x = ELU(x) + α
 *
 * @param x - Input value or array
 * @param alpha - Scaling parameter (default 1.0)
 * @returns Gradient
 */
export function eluDerivative(x: number, alpha?: number): number;
export function eluDerivative(x: number[], alpha?: number): number[];
export function eluDerivative(x: number | number[], alpha: number = 1.0): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => val > 0 ? 1 : alpha * Math.exp(val));
  }
  return x > 0 ? 1 : alpha * Math.exp(x);
}

/**
 * Scaled Exponential Linear Unit (SELU) activation function.
 *
 * SELU(x) = λ * (x if x > 0, else α(e^x - 1))
 *
 * Self-normalizing property when used with proper weight initialization.
 * Constants are chosen such that mean and variance are preserved.
 *
 * @param x - Input value or array
 * @returns Activated output
 *
 * @example
 * ```ts
 * selu(2.5);    // 2.626...
 * selu(-1);     // -1.111...
 * ```
 */
export function selu(x: number): number;
export function selu(x: number[]): number[];
export function selu(x: number | number[]): number | number[] {
  const alpha = 1.6732632423543772848170429916717;
  const lambda = 1.0507009873554804934193349852946;

  if (Array.isArray(x)) {
    return x.map(val => lambda * (val > 0 ? val : alpha * (Math.exp(val) - 1)));
  }
  return lambda * (x > 0 ? x : alpha * (Math.exp(x) - 1));
}

/**
 * Derivative of SELU.
 *
 * SELU'(x) = λ if x > 0, else λ * α * e^x
 *
 * @param x - Input value or array
 * @returns Gradient
 */
export function seluDerivative(x: number): number;
export function seluDerivative(x: number[]): number[];
export function seluDerivative(x: number | number[]): number | number[] {
  const alpha = 1.6732632423543772848170429916717;
  const lambda = 1.0507009873554804934193349852946;

  if (Array.isArray(x)) {
    return x.map(val => val > 0 ? lambda : lambda * alpha * Math.exp(val));
  }
  return x > 0 ? lambda : lambda * alpha * Math.exp(x);
}

/**
 * Sigmoid activation function.
 *
 * σ(x) = 1 / (1 + e^(-x))
 *
 * Classic activation function that maps input to (0, 1).
 * Used primarily in binary classification output layers.
 * Suffers from vanishing gradient problem for large |x|.
 *
 * @param x - Input value or array
 * @returns Activated output in range (0, 1)
 *
 * @example
 * ```ts
 * sigmoid(0);    // 0.5
 * sigmoid(2);    // 0.881...
 * sigmoid(-2);   // 0.119...
 * ```
 */
export function sigmoid(x: number): number;
export function sigmoid(x: number[]): number[];
export function sigmoid(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => 1 / (1 + Math.exp(-val)));
  }
  return 1 / (1 + Math.exp(-x));
}

/**
 * Derivative of sigmoid.
 *
 * σ'(x) = σ(x) * (1 - σ(x))
 *
 * @param x - Input value or array
 * @returns Gradient
 */
export function sigmoidDerivative(x: number): number;
export function sigmoidDerivative(x: number[]): number[];
export function sigmoidDerivative(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => {
      const s = 1 / (1 + Math.exp(-val));
      return s * (1 - s);
    });
  }
  const s = 1 / (1 + Math.exp(-x));
  return s * (1 - s);
}

/**
 * Hyperbolic tangent (tanh) activation function.
 *
 * tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))
 *
 * Maps input to (-1, 1), zero-centered unlike sigmoid.
 * Better than sigmoid for hidden layers but still suffers
 * from vanishing gradients.
 *
 * @param x - Input value or array
 * @returns Activated output in range (-1, 1)
 *
 * @example
 * ```ts
 * tanh(0);     // 0
 * tanh(1);     // 0.762...
 * tanh(-1);    // -0.762...
 * ```
 */
export function tanh(x: number): number;
export function tanh(x: number[]): number[];
export function tanh(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => Math.tanh(val));
  }
  return Math.tanh(x);
}

/**
 * Derivative of tanh.
 *
 * tanh'(x) = 1 - tanh²(x)
 *
 * @param x - Input value or array
 * @returns Gradient
 */
export function tanhDerivative(x: number): number;
export function tanhDerivative(x: number[]): number[];
export function tanhDerivative(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => {
      const t = Math.tanh(val);
      return 1 - t * t;
    });
  }
  const t = Math.tanh(x);
  return 1 - t * t;
}

/**
 * Softplus activation function.
 *
 * Softplus(x) = ln(1 + e^x)
 *
 * Smooth approximation of ReLU. Always positive and differentiable everywhere.
 * Less commonly used due to computational cost.
 *
 * @param x - Input value or array
 * @returns Activated output
 *
 * @example
 * ```ts
 * softplus(0);    // 0.693...
 * softplus(2);    // 2.127...
 * softplus(-2);   // 0.127...
 * ```
 */
export function softplus(x: number): number;
export function softplus(x: number[]): number[];
export function softplus(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => Math.log(1 + Math.exp(val)));
  }
  return Math.log(1 + Math.exp(x));
}

/**
 * Derivative of softplus.
 *
 * Softplus'(x) = e^x / (1 + e^x) = σ(x)
 *
 * @param x - Input value or array
 * @returns Gradient
 */
export function softplusDerivative(x: number): number;
export function softplusDerivative(x: number[]): number[];
export function softplusDerivative(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return sigmoid(x);
  }
  return sigmoid(x);
}

/**
 * Softmax activation function.
 *
 * softmax(xᵢ) = e^xᵢ / Σⱼ e^xⱼ
 *
 * Converts a vector of values into a probability distribution.
 * Used in multi-class classification output layers.
 * Output values sum to 1 and are in range (0, 1).
 *
 * @param x - Input array
 * @returns Probability distribution
 *
 * @example
 * ```ts
 * softmax([1, 2, 3]); // [0.090, 0.245, 0.665]
 * softmax([1, 1, 1]); // [0.333, 0.333, 0.333]
 * ```
 */
export function softmax(x: number[]): number[] {
  // Numerical stability: subtract max value
  const max = Math.max(...x);
  const exps = x.map(val => Math.exp(val - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(val => val / sum);
}

/**
 * Derivative of softmax.
 *
 * For vector output, returns Jacobian matrix where:
 * ∂yᵢ/∂xⱼ = yᵢ(δᵢⱼ - yⱼ)
 *
 * This returns a simplified form suitable for common use cases.
 *
 * @param x - Input array
 * @returns Gradient (diagonal of Jacobian)
 */
export function softmaxDerivative(x: number[]): number[] {
  const s = softmax(x);
  return s.map(val => val * (1 - val));
}

/**
 * Log-softmax activation function.
 *
 * log_softmax(xᵢ) = log(e^xᵢ / Σⱼ e^xⱼ) = xᵢ - log(Σⱼ e^xⱼ)
 *
 * Numerically stable version of log(softmax(x)).
 * Often used with negative log-likelihood loss.
 *
 * @param x - Input array
 * @returns Log probabilities
 *
 * @example
 * ```ts
 * logSoftmax([1, 2, 3]); // [-2.407, -1.407, -0.407]
 * ```
 */
export function logSoftmax(x: number[]): number[] {
  const max = Math.max(...x);
  const exps = x.map(val => Math.exp(val - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const logSum = Math.log(sum) + max;
  return x.map(val => val - logSum);
}

/**
 * Derivative of log-softmax.
 *
 * ∂log_softmax(xᵢ)/∂xⱼ = δᵢⱼ - softmax(xⱼ)
 *
 * @param x - Input array
 * @returns Gradient
 */
export function logSoftmaxDerivative(x: number[]): number[] {
  const s = softmax(x);
  return s.map(val => 1 - val);
}

/**
 * Gumbel-softmax activation function.
 *
 * Used for sampling from categorical distributions in a differentiable way.
 * Adds Gumbel noise and applies softmax with temperature parameter.
 *
 * @param x - Input array (logits)
 * @param temperature - Temperature parameter (default 1.0, lower = more discrete)
 * @param addNoise - Whether to add Gumbel noise (default true)
 * @returns Soft sample from categorical distribution
 *
 * @example
 * ```ts
 * gumbelSoftmax([1, 2, 3], 0.5); // Approximately one-hot with noise
 * gumbelSoftmax([1, 2, 3], 5.0); // More uniform distribution
 * ```
 */
export function gumbelSoftmax(x: number[], temperature: number = 1.0, addNoise: boolean = true): number[] {
  let logits = x;

  if (addNoise) {
    // Add Gumbel noise: -log(-log(U)) where U ~ Uniform(0,1)
    logits = x.map(val => {
      const u = Math.random();
      const gumbel = -Math.log(-Math.log(u + 1e-20) + 1e-20);
      return (val + gumbel) / temperature;
    });
  } else {
    logits = x.map(val => val / temperature);
  }

  return softmax(logits);
}

/**
 * Swish (SiLU) activation function.
 *
 * Swish(x) = x * σ(βx) where β is typically 1
 *
 * Self-gated activation function discovered by Google.
 * Smooth, non-monotonic, and often outperforms ReLU.
 *
 * @param x - Input value or array
 * @param beta - Scaling parameter (default 1.0)
 * @returns Activated output
 *
 * @example
 * ```ts
 * swish(2);     // 1.762...
 * swish(-1);    // -0.269...
 * ```
 */
export function swish(x: number, beta?: number): number;
export function swish(x: number[], beta?: number): number[];
export function swish(x: number | number[], beta: number = 1.0): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => val / (1 + Math.exp(-beta * val)));
  }
  return x / (1 + Math.exp(-beta * x));
}

/**
 * Derivative of Swish.
 *
 * Swish'(x) = Swish(x) + σ(βx)(1 - Swish(x))
 *
 * @param x - Input value or array
 * @param beta - Scaling parameter (default 1.0)
 * @returns Gradient
 */
export function swishDerivative(x: number, beta?: number): number;
export function swishDerivative(x: number[], beta?: number): number[];
export function swishDerivative(x: number | number[], beta: number = 1.0): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => {
      const sig = 1 / (1 + Math.exp(-beta * val));
      const sw = val * sig;
      return sw + sig * (1 - sw);
    });
  }
  const sig = 1 / (1 + Math.exp(-beta * x));
  const sw = x * sig;
  return sw + sig * (1 - sw);
}

/**
 * Gaussian Error Linear Unit (GELU) activation function.
 *
 * GELU(x) = x * Φ(x) where Φ is the cumulative distribution function of standard normal
 *
 * Approximation: GELU(x) ≈ 0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))
 *
 * Used in BERT and GPT models. Smooth approximation to ReLU
 * that weights inputs by their value.
 *
 * @param x - Input value or array
 * @returns Activated output
 *
 * @example
 * ```ts
 * gelu(1);      // 0.841...
 * gelu(-1);     // -0.159...
 * ```
 */
export function gelu(x: number): number;
export function gelu(x: number[]): number[];
export function gelu(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => {
      const inner = Math.sqrt(2 / Math.PI) * (val + 0.044715 * Math.pow(val, 3));
      return 0.5 * val * (1 + Math.tanh(inner));
    });
  }
  const inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3));
  return 0.5 * x * (1 + Math.tanh(inner));
}

/**
 * Derivative of GELU (approximation).
 *
 * @param x - Input value or array
 * @returns Gradient
 */
export function geluDerivative(x: number): number;
export function geluDerivative(x: number[]): number[];
export function geluDerivative(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => {
      const inner = Math.sqrt(2 / Math.PI) * (val + 0.044715 * Math.pow(val, 3));
      const tanhInner = Math.tanh(inner);
      const sech2 = 1 - tanhInner * tanhInner;
      const dInner = Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * val * val);
      return 0.5 * (1 + tanhInner) + 0.5 * val * sech2 * dInner;
    });
  }
  const inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3));
  const tanhInner = Math.tanh(inner);
  const sech2 = 1 - tanhInner * tanhInner;
  const dInner = Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * x * x);
  return 0.5 * (1 + tanhInner) + 0.5 * x * sech2 * dInner;
}

/**
 * Mish activation function.
 *
 * Mish(x) = x * tanh(softplus(x)) = x * tanh(ln(1 + e^x))
 *
 * Smooth, non-monotonic activation function.
 * Self-regularizing and often performs better than ReLU and Swish.
 *
 * @param x - Input value or array
 * @returns Activated output
 *
 * @example
 * ```ts
 * mish(1);      // 0.865...
 * mish(-1);     // -0.303...
 * ```
 */
export function mish(x: number): number;
export function mish(x: number[]): number[];
export function mish(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => val * Math.tanh(Math.log(1 + Math.exp(val))));
  }
  return x * Math.tanh(Math.log(1 + Math.exp(x)));
}

/**
 * Derivative of Mish.
 *
 * Mish'(x) = σ(x) * (x * (1 - tanh²(softplus(x))) + Mish(x))
 *
 * @param x - Input value or array
 * @returns Gradient
 */
export function mishDerivative(x: number): number;
export function mishDerivative(x: number[]): number[];
export function mishDerivative(x: number | number[]): number | number[] {
  if (Array.isArray(x)) {
    return x.map(val => {
      const sp = Math.log(1 + Math.exp(val));
      const tanhSp = Math.tanh(sp);
      const sig = 1 / (1 + Math.exp(-val));
      return sig * (val * (1 - tanhSp * tanhSp) + val * tanhSp);
    });
  }
  const sp = Math.log(1 + Math.exp(x));
  const tanhSp = Math.tanh(sp);
  const sig = 1 / (1 + Math.exp(-x));
  return sig * (x * (1 - tanhSp * tanhSp) + x * tanhSp);
}
