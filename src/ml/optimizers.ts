/**
 * Machine Learning Optimizers Module
 *
 * This module provides optimization algorithms used to update neural network weights
 * during training, along with learning rate scheduling strategies.
 *
 * Each optimizer maintains internal state and provides methods to:
 * - Update parameters based on gradients
 * - Reset internal state
 * - Get/set learning rate
 */

/**
 * Learning rate scheduler interface.
 */
export interface LearningRateScheduler {
  /**
   * Get the learning rate for the current step.
   * @param step - Current training step
   */
  getLearningRate(step: number): number;

  /**
   * Reset the scheduler state.
   */
  reset(): void;
}

/**
 * Base optimizer interface.
 */
export interface Optimizer {
  /**
   * Update parameters using computed gradients.
   * @param params - Current parameter values
   * @param grads - Gradient values
   * @returns Updated parameters
   */
  update(params: number[], grads: number[]): number[];

  /**
   * Reset optimizer state.
   */
  reset(): void;

  /**
   * Get current learning rate.
   */
  getLearningRate(): number;

  /**
   * Set learning rate.
   */
  setLearningRate(lr: number): void;
}

/**
 * Stochastic Gradient Descent (SGD) optimizer.
 *
 * Updates: θ = θ - η∇J(θ)
 *
 * The simplest optimizer - updates parameters in the direction of the negative gradient.
 *
 * @example
 * ```ts
 * const sgd = new SGD(0.01);
 * const newParams = sgd.update(params, grads);
 * ```
 */
export class SGD implements Optimizer {
  private learningRate: number;
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(learningRate: number = 0.01, scheduler?: LearningRateScheduler) {
    this.learningRate = learningRate;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step) : this.learningRate;
    this.step++;

    return params.map((p, i) => p - lr * grads[i]);
  }

  reset(): void {
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

/**
 * SGD with Momentum optimizer.
 *
 * Updates:
 * v = βv + ∇J(θ)
 * θ = θ - ηv
 *
 * Accumulates a velocity vector in directions of persistent gradient reduction.
 * Helps accelerate convergence and dampen oscillations.
 *
 * @example
 * ```ts
 * const momentum = new Momentum(0.01, 0.9);
 * const newParams = momentum.update(params, grads);
 * ```
 */
export class Momentum implements Optimizer {
  private learningRate: number;
  private beta: number;
  private velocity: number[] = [];
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(
    learningRate: number = 0.01,
    beta: number = 0.9,
    scheduler?: LearningRateScheduler
  ) {
    this.learningRate = learningRate;
    this.beta = beta;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    // Initialize velocity on first update
    if (this.velocity.length === 0) {
      this.velocity = new Array(params.length).fill(0);
    }

    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step) : this.learningRate;
    this.step++;

    // Update velocity and parameters
    return params.map((p, i) => {
      this.velocity[i] = this.beta * this.velocity[i] + grads[i];
      return p - lr * this.velocity[i];
    });
  }

  reset(): void {
    this.velocity = [];
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

/**
 * Nesterov Accelerated Gradient (NAG) optimizer.
 *
 * Updates:
 * v = βv + ∇J(θ - ηβv)
 * θ = θ - ηv
 *
 * "Look ahead" by computing gradient at the anticipated position.
 * Often converges faster than standard momentum.
 *
 * @example
 * ```ts
 * const nag = new Nesterov(0.01, 0.9);
 * const newParams = nag.update(params, grads);
 * ```
 */
export class Nesterov implements Optimizer {
  private learningRate: number;
  private beta: number;
  private velocity: number[] = [];
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(
    learningRate: number = 0.01,
    beta: number = 0.9,
    scheduler?: LearningRateScheduler
  ) {
    this.learningRate = learningRate;
    this.beta = beta;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    if (this.velocity.length === 0) {
      this.velocity = new Array(params.length).fill(0);
    }

    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step) : this.learningRate;
    this.step++;

    return params.map((p, i) => {
      // Nesterov momentum: look ahead
      const vPrev = this.velocity[i];
      this.velocity[i] = this.beta * this.velocity[i] + grads[i];
      return p - lr * (this.beta * this.velocity[i] + grads[i]);
    });
  }

  reset(): void {
    this.velocity = [];
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

/**
 * AdaGrad optimizer.
 *
 * Updates:
 * G = G + ∇J(θ)²
 * θ = θ - η/(√G + ε) * ∇J(θ)
 *
 * Adapts learning rate based on historical gradient information.
 * Large gradients → smaller effective learning rate.
 * Good for sparse data but can decay learning rate too aggressively.
 *
 * @example
 * ```ts
 * const adagrad = new AdaGrad(0.01);
 * const newParams = adagrad.update(params, grads);
 * ```
 */
export class AdaGrad implements Optimizer {
  private learningRate: number;
  private epsilon: number;
  private accumulator: number[] = [];
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(
    learningRate: number = 0.01,
    epsilon: number = 1e-8,
    scheduler?: LearningRateScheduler
  ) {
    this.learningRate = learningRate;
    this.epsilon = epsilon;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    if (this.accumulator.length === 0) {
      this.accumulator = new Array(params.length).fill(0);
    }

    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step) : this.learningRate;
    this.step++;

    return params.map((p, i) => {
      this.accumulator[i] += grads[i] * grads[i];
      return p - (lr / (Math.sqrt(this.accumulator[i]) + this.epsilon)) * grads[i];
    });
  }

  reset(): void {
    this.accumulator = [];
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

/**
 * RMSprop optimizer.
 *
 * Updates:
 * E[g²] = βE[g²] + (1-β)∇J(θ)²
 * θ = θ - η/(√E[g²] + ε) * ∇J(θ)
 *
 * Uses exponential moving average of squared gradients.
 * Resolves AdaGrad's radically diminishing learning rates.
 *
 * @example
 * ```ts
 * const rmsprop = new RMSprop(0.001, 0.9);
 * const newParams = rmsprop.update(params, grads);
 * ```
 */
export class RMSprop implements Optimizer {
  private learningRate: number;
  private beta: number;
  private epsilon: number;
  private accumulator: number[] = [];
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(
    learningRate: number = 0.001,
    beta: number = 0.9,
    epsilon: number = 1e-8,
    scheduler?: LearningRateScheduler
  ) {
    this.learningRate = learningRate;
    this.beta = beta;
    this.epsilon = epsilon;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    if (this.accumulator.length === 0) {
      this.accumulator = new Array(params.length).fill(0);
    }

    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step) : this.learningRate;
    this.step++;

    return params.map((p, i) => {
      this.accumulator[i] = this.beta * this.accumulator[i] + (1 - this.beta) * grads[i] * grads[i];
      return p - (lr / (Math.sqrt(this.accumulator[i]) + this.epsilon)) * grads[i];
    });
  }

  reset(): void {
    this.accumulator = [];
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

/**
 * AdaDelta optimizer.
 *
 * Updates:
 * E[g²] = ρE[g²] + (1-ρ)∇J(θ)²
 * Δθ = -√(E[Δθ²] + ε)/(√E[g²] + ε) * ∇J(θ)
 * E[Δθ²] = ρE[Δθ²] + (1-ρ)Δθ²
 * θ = θ + Δθ
 *
 * Extension of AdaGrad that doesn't require manual learning rate setting.
 *
 * @example
 * ```ts
 * const adadelta = new AdaDelta(0.95);
 * const newParams = adadelta.update(params, grads);
 * ```
 */
export class AdaDelta implements Optimizer {
  private rho: number;
  private epsilon: number;
  private accumGrad: number[] = [];
  private accumDelta: number[] = [];
  private step: number = 0;

  constructor(rho: number = 0.95, epsilon: number = 1e-8) {
    this.rho = rho;
    this.epsilon = epsilon;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    if (this.accumGrad.length === 0) {
      this.accumGrad = new Array(params.length).fill(0);
      this.accumDelta = new Array(params.length).fill(0);
    }

    this.step++;

    return params.map((p, i) => {
      // Accumulate gradient
      this.accumGrad[i] = this.rho * this.accumGrad[i] + (1 - this.rho) * grads[i] * grads[i];

      // Compute update
      const delta = -(Math.sqrt(this.accumDelta[i] + this.epsilon) /
        Math.sqrt(this.accumGrad[i] + this.epsilon)) * grads[i];

      // Accumulate updates
      this.accumDelta[i] = this.rho * this.accumDelta[i] + (1 - this.rho) * delta * delta;

      return p + delta;
    });
  }

  reset(): void {
    this.accumGrad = [];
    this.accumDelta = [];
    this.step = 0;
  }

  getLearningRate(): number {
    return 1.0; // AdaDelta doesn't use explicit learning rate
  }

  setLearningRate(lr: number): void {
    // No-op: AdaDelta doesn't use learning rate
  }
}

/**
 * Adam (Adaptive Moment Estimation) optimizer.
 *
 * Updates:
 * m = β₁m + (1-β₁)∇J(θ)
 * v = β₂v + (1-β₂)∇J(θ)²
 * m̂ = m/(1-β₁ᵗ)
 * v̂ = v/(1-β₂ᵗ)
 * θ = θ - η * m̂/(√v̂ + ε)
 *
 * Combines advantages of Momentum and RMSprop.
 * Most popular optimizer for deep learning.
 *
 * @example
 * ```ts
 * const adam = new Adam(0.001, 0.9, 0.999);
 * const newParams = adam.update(params, grads);
 * ```
 */
export class Adam implements Optimizer {
  private learningRate: number;
  private beta1: number;
  private beta2: number;
  private epsilon: number;
  private m: number[] = [];
  private v: number[] = [];
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(
    learningRate: number = 0.001,
    beta1: number = 0.9,
    beta2: number = 0.999,
    epsilon: number = 1e-8,
    scheduler?: LearningRateScheduler
  ) {
    this.learningRate = learningRate;
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.epsilon = epsilon;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    if (this.m.length === 0) {
      this.m = new Array(params.length).fill(0);
      this.v = new Array(params.length).fill(0);
    }

    this.step++;
    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step - 1) : this.learningRate;

    // Bias correction terms
    const beta1t = Math.pow(this.beta1, this.step);
    const beta2t = Math.pow(this.beta2, this.step);

    return params.map((p, i) => {
      // Update biased first moment estimate
      this.m[i] = this.beta1 * this.m[i] + (1 - this.beta1) * grads[i];

      // Update biased second raw moment estimate
      this.v[i] = this.beta2 * this.v[i] + (1 - this.beta2) * grads[i] * grads[i];

      // Compute bias-corrected moment estimates
      const mHat = this.m[i] / (1 - beta1t);
      const vHat = this.v[i] / (1 - beta2t);

      // Update parameters
      return p - lr * mHat / (Math.sqrt(vHat) + this.epsilon);
    });
  }

  reset(): void {
    this.m = [];
    this.v = [];
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

/**
 * AdamW optimizer.
 *
 * Adam with decoupled weight decay regularization.
 * Fixes weight decay implementation in standard Adam.
 *
 * Updates:
 * θ = θ - η * (m̂/(√v̂ + ε) + λθ)
 *
 * @example
 * ```ts
 * const adamw = new AdamW(0.001, 0.9, 0.999, 0.01);
 * const newParams = adamw.update(params, grads);
 * ```
 */
export class AdamW implements Optimizer {
  private learningRate: number;
  private beta1: number;
  private beta2: number;
  private epsilon: number;
  private weightDecay: number;
  private m: number[] = [];
  private v: number[] = [];
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(
    learningRate: number = 0.001,
    beta1: number = 0.9,
    beta2: number = 0.999,
    weightDecay: number = 0.01,
    epsilon: number = 1e-8,
    scheduler?: LearningRateScheduler
  ) {
    this.learningRate = learningRate;
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.weightDecay = weightDecay;
    this.epsilon = epsilon;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    if (this.m.length === 0) {
      this.m = new Array(params.length).fill(0);
      this.v = new Array(params.length).fill(0);
    }

    this.step++;
    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step - 1) : this.learningRate;

    const beta1t = Math.pow(this.beta1, this.step);
    const beta2t = Math.pow(this.beta2, this.step);

    return params.map((p, i) => {
      this.m[i] = this.beta1 * this.m[i] + (1 - this.beta1) * grads[i];
      this.v[i] = this.beta2 * this.v[i] + (1 - this.beta2) * grads[i] * grads[i];

      const mHat = this.m[i] / (1 - beta1t);
      const vHat = this.v[i] / (1 - beta2t);

      // AdamW: decoupled weight decay
      return p - lr * (mHat / (Math.sqrt(vHat) + this.epsilon) + this.weightDecay * p);
    });
  }

  reset(): void {
    this.m = [];
    this.v = [];
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

/**
 * NAdam optimizer.
 *
 * Adam with Nesterov momentum.
 * Combines Adam and Nesterov acceleration.
 *
 * @example
 * ```ts
 * const nadam = new NAdam(0.001, 0.9, 0.999);
 * const newParams = nadam.update(params, grads);
 * ```
 */
export class NAdam implements Optimizer {
  private learningRate: number;
  private beta1: number;
  private beta2: number;
  private epsilon: number;
  private m: number[] = [];
  private v: number[] = [];
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(
    learningRate: number = 0.001,
    beta1: number = 0.9,
    beta2: number = 0.999,
    epsilon: number = 1e-8,
    scheduler?: LearningRateScheduler
  ) {
    this.learningRate = learningRate;
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.epsilon = epsilon;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    if (this.m.length === 0) {
      this.m = new Array(params.length).fill(0);
      this.v = new Array(params.length).fill(0);
    }

    this.step++;
    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step - 1) : this.learningRate;

    const beta1t = Math.pow(this.beta1, this.step);
    const beta2t = Math.pow(this.beta2, this.step);
    const beta1tNext = Math.pow(this.beta1, this.step + 1);

    return params.map((p, i) => {
      this.m[i] = this.beta1 * this.m[i] + (1 - this.beta1) * grads[i];
      this.v[i] = this.beta2 * this.v[i] + (1 - this.beta2) * grads[i] * grads[i];

      const mHat = this.m[i] / (1 - beta1t);
      const vHat = this.v[i] / (1 - beta2t);

      // NAdam: Nesterov-accelerated adaptive moment
      const mBar = (this.beta1 * mHat + (1 - this.beta1) * grads[i] / (1 - beta1t));

      return p - lr * mBar / (Math.sqrt(vHat) + this.epsilon);
    });
  }

  reset(): void {
    this.m = [];
    this.v = [];
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

/**
 * RAdam (Rectified Adam) optimizer.
 *
 * Adam with a rectification term to handle the variance in the early stages of training.
 * Provides more stable convergence than Adam.
 *
 * @example
 * ```ts
 * const radam = new RAdam(0.001, 0.9, 0.999);
 * const newParams = radam.update(params, grads);
 * ```
 */
export class RAdam implements Optimizer {
  private learningRate: number;
  private beta1: number;
  private beta2: number;
  private epsilon: number;
  private m: number[] = [];
  private v: number[] = [];
  private step: number = 0;
  private scheduler?: LearningRateScheduler;

  constructor(
    learningRate: number = 0.001,
    beta1: number = 0.9,
    beta2: number = 0.999,
    epsilon: number = 1e-8,
    scheduler?: LearningRateScheduler
  ) {
    this.learningRate = learningRate;
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.epsilon = epsilon;
    this.scheduler = scheduler;
  }

  update(params: number[], grads: number[]): number[] {
    if (params.length !== grads.length) {
      throw new Error('Parameters and gradients must have the same length');
    }

    if (this.m.length === 0) {
      this.m = new Array(params.length).fill(0);
      this.v = new Array(params.length).fill(0);
    }

    this.step++;
    const lr = this.scheduler ? this.scheduler.getLearningRate(this.step - 1) : this.learningRate;

    const beta1t = Math.pow(this.beta1, this.step);
    const beta2t = Math.pow(this.beta2, this.step);

    // Compute the maximum length of the approximated SMA (Simple Moving Average)
    const rhoInf = 2 / (1 - this.beta2) - 1;
    const rho = rhoInf - 2 * this.step * beta2t / (1 - beta2t);

    return params.map((p, i) => {
      this.m[i] = this.beta1 * this.m[i] + (1 - this.beta1) * grads[i];
      this.v[i] = this.beta2 * this.v[i] + (1 - this.beta2) * grads[i] * grads[i];

      const mHat = this.m[i] / (1 - beta1t);

      if (rho > 4) {
        // Variance is tractable, use adaptive learning rate
        const vHat = this.v[i] / (1 - beta2t);
        const r = Math.sqrt(
          ((rho - 4) * (rho - 2) * rhoInf) /
          ((rhoInf - 4) * (rhoInf - 2) * rho)
        );
        return p - lr * r * mHat / (Math.sqrt(vHat) + this.epsilon);
      } else {
        // Variance is not tractable, use un-adapted step size
        return p - lr * mHat;
      }
    });
  }

  reset(): void {
    this.m = [];
    this.v = [];
    this.step = 0;
    if (this.scheduler) {
      this.scheduler.reset();
    }
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

// ============================================================================
// Learning Rate Schedulers
// ============================================================================

/**
 * Step decay learning rate scheduler.
 *
 * Reduces learning rate by a factor every N steps.
 * lr = lr₀ * factor^⌊step/stepSize⌋
 *
 * @example
 * ```ts
 * const scheduler = new StepDecayScheduler(0.1, 1000, 0.5);
 * const lr = scheduler.getLearningRate(1500); // 0.1 * 0.5 = 0.05
 * ```
 */
export class StepDecayScheduler implements LearningRateScheduler {
  private initialLR: number;
  private stepSize: number;
  private factor: number;

  constructor(initialLR: number, stepSize: number, factor: number = 0.1) {
    this.initialLR = initialLR;
    this.stepSize = stepSize;
    this.factor = factor;
  }

  getLearningRate(step: number): number {
    const decay = Math.floor(step / this.stepSize);
    return this.initialLR * Math.pow(this.factor, decay);
  }

  reset(): void {
    // No state to reset
  }
}

/**
 * Exponential decay learning rate scheduler.
 *
 * Smoothly decays learning rate exponentially.
 * lr = lr₀ * e^(-λt)
 *
 * @example
 * ```ts
 * const scheduler = new ExponentialDecayScheduler(0.1, 0.001);
 * const lr = scheduler.getLearningRate(100);
 * ```
 */
export class ExponentialDecayScheduler implements LearningRateScheduler {
  private initialLR: number;
  private decayRate: number;

  constructor(initialLR: number, decayRate: number) {
    this.initialLR = initialLR;
    this.decayRate = decayRate;
  }

  getLearningRate(step: number): number {
    return this.initialLR * Math.exp(-this.decayRate * step);
  }

  reset(): void {
    // No state to reset
  }
}

/**
 * Cosine annealing learning rate scheduler.
 *
 * Anneals learning rate following a cosine curve.
 * lr = lr_min + 0.5 * (lr_max - lr_min) * (1 + cos(π * step / T))
 *
 * Often used with warm restarts for better convergence.
 *
 * @example
 * ```ts
 * const scheduler = new CosineAnnealingScheduler(0.1, 0.001, 1000);
 * const lr = scheduler.getLearningRate(500); // Middle of cycle
 * ```
 */
export class CosineAnnealingScheduler implements LearningRateScheduler {
  private maxLR: number;
  private minLR: number;
  private period: number;

  constructor(maxLR: number, minLR: number, period: number) {
    this.maxLR = maxLR;
    this.minLR = minLR;
    this.period = period;
  }

  getLearningRate(step: number): number {
    const cycle = step % this.period;
    const cosine = Math.cos((Math.PI * cycle) / this.period);
    return this.minLR + 0.5 * (this.maxLR - this.minLR) * (1 + cosine);
  }

  reset(): void {
    // No state to reset
  }
}

/**
 * Cosine annealing with warm restarts scheduler.
 *
 * Periodically restarts the cosine annealing, allowing the model
 * to escape local minima.
 *
 * @example
 * ```ts
 * const scheduler = new CosineAnnealingWarmRestartsScheduler(0.1, 0.001, 100, 2);
 * ```
 */
export class CosineAnnealingWarmRestartsScheduler implements LearningRateScheduler {
  private maxLR: number;
  private minLR: number;
  private t0: number;
  private tMult: number;

  constructor(maxLR: number, minLR: number, t0: number, tMult: number = 1) {
    this.maxLR = maxLR;
    this.minLR = minLR;
    this.t0 = t0;
    this.tMult = tMult;
  }

  getLearningRate(step: number): number {
    let tCur = step;
    let tI = this.t0;
    let cycle = 0;

    // Find which cycle we're in
    while (tCur >= tI) {
      tCur -= tI;
      cycle++;
      tI *= this.tMult;
    }

    const cosine = Math.cos((Math.PI * tCur) / tI);
    return this.minLR + 0.5 * (this.maxLR - this.minLR) * (1 + cosine);
  }

  reset(): void {
    // No state to reset
  }
}

/**
 * Linear warmup scheduler wrapper.
 *
 * Gradually increases learning rate from 0 to target over warmup steps,
 * then follows the base scheduler.
 *
 * @example
 * ```ts
 * const baseScheduler = new CosineAnnealingScheduler(0.1, 0.001, 1000);
 * const scheduler = new WarmupScheduler(baseScheduler, 100);
 * ```
 */
export class WarmupScheduler implements LearningRateScheduler {
  private baseScheduler: LearningRateScheduler;
  private warmupSteps: number;
  private targetLR: number;

  constructor(baseScheduler: LearningRateScheduler, warmupSteps: number, targetLR?: number) {
    this.baseScheduler = baseScheduler;
    this.warmupSteps = warmupSteps;
    this.targetLR = targetLR ?? baseScheduler.getLearningRate(warmupSteps);
  }

  getLearningRate(step: number): number {
    if (step < this.warmupSteps) {
      // Linear warmup
      return (step / this.warmupSteps) * this.targetLR;
    } else {
      return this.baseScheduler.getLearningRate(step - this.warmupSteps);
    }
  }

  reset(): void {
    this.baseScheduler.reset();
  }
}
