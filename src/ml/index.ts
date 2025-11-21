/**
 * Machine Learning Operations Module
 *
 * This module provides essential components for machine learning:
 * - Activation functions with derivatives for backpropagation
 * - Loss functions for various learning tasks
 * - Optimizers for parameter updates
 * - Learning rate schedulers
 */

// Activation functions
export {
  relu,
  reluDerivative,
  leakyRelu,
  leakyReluDerivative,
  prelu,
  preluDerivative,
  elu,
  eluDerivative,
  selu,
  seluDerivative,
  sigmoid,
  sigmoidDerivative,
  tanh,
  tanhDerivative,
  softplus,
  softplusDerivative,
  softmax,
  softmaxDerivative,
  logSoftmax,
  logSoftmaxDerivative,
  gumbelSoftmax,
  swish,
  swishDerivative,
  gelu,
  geluDerivative,
  mish,
  mishDerivative,
} from './activations';

// Loss functions
export {
  mse,
  rmse,
  mae,
  huber,
  logCosh,
  binaryCrossentropy,
  categoricalCrossentropy,
  sparseCategoricalCrossentropy,
  focalLoss,
  hingeLoss,
  squaredHingeLoss,
  tripletLoss,
  cosineEmbeddingLoss,
  klDivergence,
  combineLosses,
  createCustomLoss,
  regularizedLoss,
} from './losses';

// Optimizers
export {
  Optimizer,
  SGD,
  Momentum,
  Nesterov,
  AdaGrad,
  RMSprop,
  AdaDelta,
  Adam,
  AdamW,
  NAdam,
  RAdam,
} from './optimizers';

// Learning rate schedulers
export {
  LearningRateScheduler,
  StepDecayScheduler,
  ExponentialDecayScheduler,
  CosineAnnealingScheduler,
  CosineAnnealingWarmRestartsScheduler,
  WarmupScheduler,
} from './optimizers';
