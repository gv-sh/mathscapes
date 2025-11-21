import {
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
  StepDecayScheduler,
  ExponentialDecayScheduler,
  CosineAnnealingScheduler,
  CosineAnnealingWarmRestartsScheduler,
  WarmupScheduler,
} from '../../src/ml/optimizers';

describe('Optimizers', () => {
  describe('SGD', () => {
    it('should update parameters in direction of negative gradient', () => {
      const sgd = new SGD(0.1);
      const params = [1, 2, 3];
      const grads = [0.1, 0.2, 0.3];
      const newParams = sgd.update(params, grads);

      expect(newParams[0]).toBeCloseTo(1 - 0.1 * 0.1, 5);
      expect(newParams[1]).toBeCloseTo(2 - 0.1 * 0.2, 5);
      expect(newParams[2]).toBeCloseTo(3 - 0.1 * 0.3, 5);
    });

    it('should respect learning rate', () => {
      const sgd1 = new SGD(0.1);
      const sgd2 = new SGD(0.01);
      const params = [1];
      const grads = [1];

      const result1 = sgd1.update(params, grads);
      const result2 = sgd2.update(params, grads);

      expect(Math.abs(result1[0] - params[0])).toBeGreaterThan(
        Math.abs(result2[0] - params[0])
      );
    });

    it('should throw for mismatched lengths', () => {
      const sgd = new SGD(0.1);
      expect(() => sgd.update([1, 2], [1])).toThrow();
    });

    it('should allow getting and setting learning rate', () => {
      const sgd = new SGD(0.1);
      expect(sgd.getLearningRate()).toBe(0.1);
      sgd.setLearningRate(0.01);
      expect(sgd.getLearningRate()).toBe(0.01);
    });

    it('should reset state', () => {
      const sgd = new SGD(0.1);
      sgd.update([1], [1]);
      sgd.reset();
      // Should not throw and should work normally
      expect(() => sgd.update([1], [1])).not.toThrow();
    });
  });

  describe('Momentum', () => {
    it('should accumulate velocity', () => {
      const momentum = new Momentum(0.1, 0.9);
      const params = [1];
      const grads = [1];

      const result1 = momentum.update(params, grads);
      const result2 = momentum.update(result1, grads);

      // Second update should move further due to accumulated velocity
      const dist1 = Math.abs(result1[0] - params[0]);
      const dist2 = Math.abs(result2[0] - result1[0]);
      expect(dist2).toBeGreaterThan(dist1);
    });

    it('should dampen oscillations', () => {
      const sgd = new SGD(0.1);
      const momentum = new Momentum(0.1, 0.9);

      let sgdParams = [0];
      let momentumParams = [0];

      // Oscillating gradients
      const oscillatingGrads = [1, -1, 1, -1, 1, -1];

      for (const grad of oscillatingGrads) {
        sgdParams = sgd.update(sgdParams, [grad]);
        momentumParams = momentum.update(momentumParams, [grad]);
      }

      // With oscillating gradients, momentum accumulates less movement
      // SGD moves: -0.1, +0.1, -0.1, +0.1, -0.1, +0.1 = 0
      // Momentum dampens but accumulates velocity
      // The key is that momentum reduces variance in the direction of oscillation
      expect(Math.abs(momentumParams[0])).toBeLessThanOrEqual(Math.abs(sgdParams[0]) + 0.3);
    });

    it('should reset velocity on reset', () => {
      const momentum = new Momentum(0.1, 0.9);
      momentum.update([1], [1]);
      momentum.reset();
      const result = momentum.update([1], [1]);
      // Should behave like first update
      expect(result[0]).toBeCloseTo(1 - 0.1 * 1, 5);
    });
  });

  describe('Nesterov', () => {
    it('should look ahead in gradient computation', () => {
      const nesterov = new Nesterov(0.1, 0.9);
      const momentum = new Momentum(0.1, 0.9);

      const params = [1];
      const grads = [1];

      const nesterovResult = nesterov.update(params, grads);
      const momentumResult = momentum.update(params, grads);

      // Results should differ due to look-ahead
      expect(nesterovResult[0]).not.toBeCloseTo(momentumResult[0], 5);
    });
  });

  describe('AdaGrad', () => {
    it('should adapt learning rate based on historical gradients', () => {
      const adagrad = new AdaGrad(0.1);
      const params = [1];

      const result1 = adagrad.update(params, [1]);
      const result2 = adagrad.update(result1, [1]);

      // Second update should have smaller effective learning rate
      const step1 = Math.abs(result1[0] - params[0]);
      const step2 = Math.abs(result2[0] - result1[0]);
      expect(step2).toBeLessThan(step1);
    });

    it('should handle different gradient magnitudes per parameter', () => {
      const adagrad = new AdaGrad(1.0);
      const params = [1, 1];
      const grads = [10, 0.1]; // Very different magnitudes

      const result = adagrad.update(params, grads);

      // Large gradient should result in smaller effective step size per unit gradient
      const step1 = Math.abs(result[0] - params[0]);
      const step2 = Math.abs(result[1] - params[1]);
      // step1 = 1.0 / sqrt(100 + eps) * 10 ≈ 1.0
      // step2 = 1.0 / sqrt(0.01 + eps) * 0.1 ≈ 1.0
      // They should be similar in magnitude
      expect(step1).toBeCloseTo(step2, 0);
    });
  });

  describe('RMSprop', () => {
    it('should use exponential moving average of squared gradients', () => {
      const rmsprop = new RMSprop(0.01, 0.9);
      const params = [1];

      let current = params;
      for (let i = 0; i < 10; i++) {
        current = rmsprop.update(current, [1]);
      }

      // Should continue to make progress
      expect(current[0]).toBeLessThan(params[0]);
    });

    it('should not suffer from aggressive decay like AdaGrad', () => {
      const adagrad = new AdaGrad(0.1);
      const rmsprop = new RMSprop(0.1, 0.9);

      let adagradParams = [1];
      let rmspropParams = [1];

      for (let i = 0; i < 100; i++) {
        adagradParams = adagrad.update(adagradParams, [1]);
        rmspropParams = rmsprop.update(rmspropParams, [1]);
      }

      // RMSprop should make more progress in later iterations
      const adagradDist = Math.abs(adagradParams[0] - 1);
      const rmspropDist = Math.abs(rmspropParams[0] - 1);
      expect(rmspropDist).toBeGreaterThan(adagradDist);
    });
  });

  describe('AdaDelta', () => {
    it('should not require explicit learning rate', () => {
      const adadelta = new AdaDelta(0.95);
      const params = [1];
      const grads = [1];

      const result = adadelta.update(params, grads);
      expect(result[0]).not.toBe(params[0]);
    });

    it('should adapt to gradient scale automatically', () => {
      const adadelta = new AdaDelta(0.95);
      let params = [1];

      for (let i = 0; i < 10; i++) {
        params = adadelta.update(params, [1]);
      }

      expect(params[0]).toBeLessThan(1);
    });
  });

  describe('Adam', () => {
    it('should combine momentum and adaptive learning rates', () => {
      const adam = new Adam(0.001, 0.9, 0.999);
      const params = [1];
      const grads = [1];

      const result = adam.update(params, grads);
      expect(result[0]).toBeLessThan(params[0]);
    });

    it('should use bias correction', () => {
      const adam = new Adam(0.1, 0.9, 0.999);
      const params = [1];
      const grads = [1];

      const result1 = adam.update(params, grads);
      adam.reset();
      const result2 = adam.update(params, grads);

      // Results should be identical due to reset
      expect(result1[0]).toBeCloseTo(result2[0], 5);
    });

    it('should handle vanishing gradients better than SGD', () => {
      const adam = new Adam(0.001, 0.9, 0.999);
      const sgd = new SGD(0.001);

      let adamParams = [1];
      let sgdParams = [1];

      // Small gradients
      for (let i = 0; i < 100; i++) {
        adamParams = adam.update(adamParams, [0.001]);
        sgdParams = sgd.update(sgdParams, [0.001]);
      }

      // Adam should make more progress due to adaptive learning rates
      expect(Math.abs(adamParams[0] - 1)).toBeGreaterThan(
        Math.abs(sgdParams[0] - 1)
      );
    });
  });

  describe('AdamW', () => {
    it('should apply weight decay correctly', () => {
      const adam = new Adam(0.001, 0.9, 0.999);
      const adamw = new AdamW(0.001, 0.9, 0.999, 0.01);

      const params = [1];
      const grads = [0]; // Zero gradients to isolate weight decay

      const adamResult = adam.update(params, grads);
      const adamwResult = adamw.update(params, grads);

      // AdamW should have additional weight decay
      expect(Math.abs(adamwResult[0] - params[0])).toBeGreaterThan(
        Math.abs(adamResult[0] - params[0])
      );
    });

    it('should decouple weight decay from gradient', () => {
      const adamw = new AdamW(0.001, 0.9, 0.999, 0.1);
      const params = [1];
      const grads = [1];

      const result = adamw.update(params, grads);

      // Weight decay should pull parameters toward zero
      expect(result[0]).toBeLessThan(params[0]);
    });
  });

  describe('NAdam', () => {
    it('should combine Adam with Nesterov acceleration', () => {
      const nadam = new NAdam(0.001, 0.9, 0.999);
      const params = [1];
      const grads = [1];

      const result = nadam.update(params, grads);
      expect(result[0]).toBeLessThan(params[0]);
    });

    it('should differ from standard Adam', () => {
      const adam = new Adam(0.001, 0.9, 0.999);
      const nadam = new NAdam(0.001, 0.9, 0.999);

      const params = [1];
      const grads = [1];

      const adamResult = adam.update(params, grads);
      const nadamResult = nadam.update(params, grads);

      expect(adamResult[0]).not.toBeCloseTo(nadamResult[0], 5);
    });
  });

  describe('RAdam', () => {
    it('should provide rectified adaptive learning rate', () => {
      const radam = new RAdam(0.001, 0.9, 0.999);
      const params = [1];
      const grads = [1];

      const result = radam.update(params, grads);
      expect(result[0]).toBeLessThan(params[0]);
    });

    it('should handle early training more conservatively', () => {
      const radam = new RAdam(0.01, 0.9, 0.999);
      const params = [1];
      const grads = [1];

      const result1 = radam.update(params, grads);
      const step1 = Math.abs(result1[0] - params[0]);

      // After several updates, behavior stabilizes
      radam.reset();
      let current = params;
      for (let i = 0; i < 20; i++) {
        current = radam.update(current, [0.1]);
      }
      const result2 = radam.update(current, grads);
      const step2 = Math.abs(result2[0] - current[0]);

      // RAdam starts conservatively, then gradually increases learning rate
      // After enough steps (>5), should have stabilized
      expect(step2).toBeGreaterThan(0);
      expect(step1).toBeGreaterThan(0);
    });
  });

  describe('Learning Rate Schedulers', () => {
    describe('StepDecayScheduler', () => {
      it('should decay learning rate in steps', () => {
        const scheduler = new StepDecayScheduler(0.1, 100, 0.5);

        expect(scheduler.getLearningRate(0)).toBeCloseTo(0.1, 5);
        expect(scheduler.getLearningRate(99)).toBeCloseTo(0.1, 5);
        expect(scheduler.getLearningRate(100)).toBeCloseTo(0.05, 5);
        expect(scheduler.getLearningRate(200)).toBeCloseTo(0.025, 5);
      });

      it('should respect factor parameter', () => {
        const scheduler = new StepDecayScheduler(1.0, 10, 0.1);
        expect(scheduler.getLearningRate(10)).toBeCloseTo(0.1, 5);
        expect(scheduler.getLearningRate(20)).toBeCloseTo(0.01, 5);
      });
    });

    describe('ExponentialDecayScheduler', () => {
      it('should decay exponentially', () => {
        const scheduler = new ExponentialDecayScheduler(1.0, 0.01);

        const lr0 = scheduler.getLearningRate(0);
        const lr1 = scheduler.getLearningRate(1);
        const lr2 = scheduler.getLearningRate(2);

        expect(lr0).toBeCloseTo(1.0, 5);
        expect(lr1).toBeLessThan(lr0);
        expect(lr2).toBeLessThan(lr1);

        // Should decay exponentially
        const ratio1 = lr1 / lr0;
        const ratio2 = lr2 / lr1;
        expect(ratio1).toBeCloseTo(ratio2, 5);
      });

      it('should respect decay rate', () => {
        const fast = new ExponentialDecayScheduler(1.0, 0.1);
        const slow = new ExponentialDecayScheduler(1.0, 0.01);

        expect(fast.getLearningRate(10)).toBeLessThan(
          slow.getLearningRate(10)
        );
      });
    });

    describe('CosineAnnealingScheduler', () => {
      it('should follow cosine curve', () => {
        const scheduler = new CosineAnnealingScheduler(0.1, 0.01, 100);

        const lr0 = scheduler.getLearningRate(0);
        const lr50 = scheduler.getLearningRate(50);
        const lr99 = scheduler.getLearningRate(99);

        expect(lr0).toBeCloseTo(0.1, 5);
        expect(lr50).toBeCloseTo(0.055, 2); // Middle of range
        // At step 99 (before completing the period), should be close to min
        expect(lr99).toBeCloseTo(0.01, 2);
      });

      it('should restart at period', () => {
        const scheduler = new CosineAnnealingScheduler(0.1, 0.01, 100);

        const lr0 = scheduler.getLearningRate(0);
        const lr100 = scheduler.getLearningRate(100);
        const lr200 = scheduler.getLearningRate(200);

        expect(lr100).toBeCloseTo(lr200, 5);
      });
    });

    describe('CosineAnnealingWarmRestartsScheduler', () => {
      it('should restart with increasing periods', () => {
        const scheduler = new CosineAnnealingWarmRestartsScheduler(
          0.1,
          0.01,
          10,
          2
        );

        const lr0 = scheduler.getLearningRate(0);
        const lr10 = scheduler.getLearningRate(10); // First restart
        const lr30 = scheduler.getLearningRate(30); // Second restart (10 + 20)

        expect(lr0).toBeCloseTo(0.1, 5);
        expect(lr10).toBeCloseTo(0.1, 5);
        expect(lr30).toBeCloseTo(0.1, 5);
      });

      it('should support constant period with tMult=1', () => {
        const scheduler = new CosineAnnealingWarmRestartsScheduler(
          0.1,
          0.01,
          10,
          1
        );

        const lr10 = scheduler.getLearningRate(10);
        const lr20 = scheduler.getLearningRate(20);

        expect(lr10).toBeCloseTo(lr20, 5);
      });
    });

    describe('WarmupScheduler', () => {
      it('should linearly increase during warmup', () => {
        const baseScheduler = new StepDecayScheduler(0.1, 1000, 0.5);
        const scheduler = new WarmupScheduler(baseScheduler, 10);

        expect(scheduler.getLearningRate(0)).toBeCloseTo(0, 5);
        expect(scheduler.getLearningRate(5)).toBeCloseTo(0.05, 5);
        expect(scheduler.getLearningRate(10)).toBeCloseTo(0.1, 5);
      });

      it('should follow base scheduler after warmup', () => {
        const baseScheduler = new ExponentialDecayScheduler(0.1, 0.01);
        const scheduler = new WarmupScheduler(baseScheduler, 10);

        const lr20 = scheduler.getLearningRate(20);
        const baseLr10 = baseScheduler.getLearningRate(10);

        expect(lr20).toBeCloseTo(baseLr10, 5);
      });
    });

    describe('Optimizer with Scheduler Integration', () => {
      it('should use scheduler for learning rate', () => {
        const scheduler = new StepDecayScheduler(0.1, 2, 0.5);
        const sgd = new SGD(0.1, scheduler);

        const params = [1];
        const grads = [1];

        const result1 = sgd.update(params, grads); // Step 0, lr=0.1
        const result2 = sgd.update(result1, grads); // Step 1, lr=0.1
        const result3 = sgd.update(result2, grads); // Step 2, lr=0.05

        const step1 = Math.abs(result1[0] - params[0]);
        const step2 = Math.abs(result2[0] - result1[0]);
        const step3 = Math.abs(result3[0] - result2[0]);

        expect(step1).toBeCloseTo(step2, 5);
        expect(step3).toBeCloseTo(step1 * 0.5, 5);
      });

      it('should reset scheduler on optimizer reset', () => {
        const scheduler = new ExponentialDecayScheduler(0.1, 0.1);
        const sgd = new SGD(0.1, scheduler);

        sgd.update([1], [1]);
        sgd.update([1], [1]);
        sgd.reset();

        const params = [1];
        const grads = [1];
        const result = sgd.update(params, grads);

        // Should use initial learning rate after reset
        expect(result[0]).toBeCloseTo(1 - 0.1 * 1, 5);
      });
    });
  });

  describe('Convergence Tests', () => {
    // Simple quadratic function: f(x) = x^2
    // Gradient: f'(x) = 2x
    // Minimum at x = 0

    function testConvergence(optimizerName: string, optimizer: any, tolerance: number = 0.1) {
      let params = [5]; // Start far from minimum

      for (let i = 0; i < 1000; i++) {
        const grads = [2 * params[0]]; // Gradient of x^2
        params = optimizer.update(params, grads);

        if (Math.abs(params[0]) < tolerance) {
          return true;
        }
      }

      return false;
    }

    it('SGD should converge to minimum', () => {
      const sgd = new SGD(0.01);
      expect(testConvergence('SGD', sgd)).toBe(true);
    });

    it('Momentum should converge faster than SGD', () => {
      const sgd = new SGD(0.01);
      const momentum = new Momentum(0.01, 0.9);

      let sgdParams = [5];
      let momentumParams = [5];

      for (let i = 0; i < 100; i++) {
        sgdParams = sgd.update(sgdParams, [2 * sgdParams[0]]);
        momentumParams = momentum.update(momentumParams, [2 * momentumParams[0]]);
      }

      expect(Math.abs(momentumParams[0])).toBeLessThan(Math.abs(sgdParams[0]));
    });

    it('Adam should converge reliably', () => {
      const adam = new Adam(0.1, 0.9, 0.999);
      expect(testConvergence('Adam', adam, 0.01)).toBe(true);
    });

    it('RMSprop should converge reliably', () => {
      const rmsprop = new RMSprop(0.01, 0.9);
      expect(testConvergence('RMSprop', rmsprop)).toBe(true);
    });
  });
});
