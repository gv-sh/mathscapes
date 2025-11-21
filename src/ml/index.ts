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

// Convolution operations
export {
  conv1D,
  conv2D,
  conv3D,
  conv2DTranspose,
  depthwiseSeparableConv2D,
  calculateConvOutputSize,
  calculateSamePadding,
  pad1D,
  pad2D,
  pad3D,
} from './convolution';

export type { ConvolutionOptions, PaddingType } from './convolution';

// Pooling operations
export {
  maxPool1D,
  maxPool2D,
  maxPool3D,
  avgPool1D,
  avgPool2D,
  avgPool3D,
  minPool2D,
  globalAvgPool2D,
  globalMaxPool2D,
  globalAvgPool3D,
  globalMaxPool3D,
  adaptiveAvgPool2D,
  adaptiveMaxPool2D,
} from './pooling';

export type { PoolingOptions } from './pooling';

// Attention mechanisms
export {
  scaledDotProductAttention,
  multiHeadAttention,
  selfAttention,
  multiHeadSelfAttention,
  attentionScores,
  createCausalMask,
  createPaddingMask,
  combineMasks,
  attentionEntropy,
} from './attention';

export type { AttentionOptions } from './attention';

// Normalization layers
export {
  batchNorm1D,
  batchNorm2D,
  layerNorm,
  instanceNorm,
  groupNorm,
  weightNorm,
  rmsNorm,
  adaptiveLayerNorm,
} from './normalization';

export type { NormalizationOptions } from './normalization';
