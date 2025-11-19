import {
    Dual,
    ADVariable as Variable,
    forwardMode,
    forwardModeGradient,
    reverseMode,
    reverseModeGradient
} from '../../src/symbolic';

describe('Automatic Differentiation', () => {
    describe('Dual Numbers (Forward Mode)', () => {
        describe('Basic Operations', () => {
            it('should create dual numbers', () => {
                const d1 = new Dual(3, 1);
                expect(d1.value).toBe(3);
                expect(d1.derivative).toBe(1);

                const d2 = Dual.variable(5);
                expect(d2.value).toBe(5);
                expect(d2.derivative).toBe(1);

                const d3 = Dual.constant(7);
                expect(d3.value).toBe(7);
                expect(d3.derivative).toBe(0);
            });

            it('should add dual numbers', () => {
                const d1 = new Dual(3, 1);
                const d2 = new Dual(5, 2);
                const result = d1.add(d2);

                expect(result.value).toBe(8);
                expect(result.derivative).toBe(3);
            });

            it('should add dual number and scalar', () => {
                const d1 = new Dual(3, 1);
                const result = d1.add(5);

                expect(result.value).toBe(8);
                expect(result.derivative).toBe(1);
            });

            it('should subtract dual numbers', () => {
                const d1 = new Dual(5, 2);
                const d2 = new Dual(3, 1);
                const result = d1.subtract(d2);

                expect(result.value).toBe(2);
                expect(result.derivative).toBe(1);
            });

            it('should multiply dual numbers (product rule)', () => {
                // (3 + 1ε) * (5 + 2ε) = 15 + (1*5 + 3*2)ε = 15 + 11ε
                const d1 = new Dual(3, 1);
                const d2 = new Dual(5, 2);
                const result = d1.multiply(d2);

                expect(result.value).toBe(15);
                expect(result.derivative).toBe(11);
            });

            it('should divide dual numbers (quotient rule)', () => {
                // (6 + 3ε) / (2 + 1ε) = 3 + (3*2 - 6*1)/4 ε = 3 + 0ε
                const d1 = new Dual(6, 3);
                const d2 = new Dual(2, 1);
                const result = d1.divide(d2);

                expect(result.value).toBe(3);
                expect(result.derivative).toBe(0);
            });

            it('should compute power', () => {
                // (2 + 1ε)^3 = 8 + 3*4*1ε = 8 + 12ε
                const d1 = new Dual(2, 1);
                const result = d1.power(3);

                expect(result.value).toBe(8);
                expect(result.derivative).toBe(12);
            });

            it('should negate dual numbers', () => {
                const d1 = new Dual(3, 1);
                const result = d1.negate();

                expect(result.value).toBe(-3);
                expect(result.derivative).toBe(-1);
            });
        });

        describe('Mathematical Functions', () => {
            it('should compute sin', () => {
                const d1 = Dual.variable(0);
                const result = d1.sin();

                expect(result.value).toBeCloseTo(0);
                expect(result.derivative).toBeCloseTo(1); // cos(0) = 1
            });

            it('should compute cos', () => {
                const d1 = Dual.variable(0);
                const result = d1.cos();

                expect(result.value).toBeCloseTo(1);
                expect(result.derivative).toBeCloseTo(0); // -sin(0) = 0
            });

            it('should compute tan', () => {
                const d1 = Dual.variable(0);
                const result = d1.tan();

                expect(result.value).toBeCloseTo(0);
                expect(result.derivative).toBeCloseTo(1); // 1/cos^2(0) = 1
            });

            it('should compute exp', () => {
                const d1 = Dual.variable(0);
                const result = d1.exp();

                expect(result.value).toBeCloseTo(1);
                expect(result.derivative).toBeCloseTo(1); // exp(0) = 1
            });

            it('should compute ln', () => {
                const d1 = Dual.variable(1);
                const result = d1.ln();

                expect(result.value).toBeCloseTo(0);
                expect(result.derivative).toBeCloseTo(1); // 1/1 = 1
            });

            it('should compute sqrt', () => {
                const d1 = Dual.variable(4);
                const result = d1.sqrt();

                expect(result.value).toBeCloseTo(2);
                expect(result.derivative).toBeCloseTo(0.25); // 1/(2*2) = 0.25
            });

            it('should compute abs', () => {
                const d1 = Dual.variable(3);
                const result = d1.abs();

                expect(result.value).toBe(3);
                expect(result.derivative).toBe(1);

                const d2 = Dual.variable(-3);
                const result2 = d2.abs();

                expect(result2.value).toBe(3);
                expect(result2.derivative).toBe(-1);
            });
        });
    });

    describe('Forward Mode AD', () => {
        it('should compute derivative of f(x) = x^2', () => {
            const f = (x: Dual) => x.power(2);
            const result = forwardMode(f, 3);

            expect(result.value).toBe(9); // 3^2 = 9
            expect(result.derivative).toBe(6); // 2*3 = 6
        });

        it('should compute derivative of f(x) = 2x + 3', () => {
            const f = (x: Dual) => x.multiply(2).add(3);
            const result = forwardMode(f, 5);

            expect(result.value).toBe(13); // 2*5 + 3 = 13
            expect(result.derivative).toBe(2); // 2
        });

        it('should compute derivative of f(x) = sin(x)', () => {
            const f = (x: Dual) => x.sin();
            const result = forwardMode(f, 0);

            expect(result.value).toBeCloseTo(0);
            expect(result.derivative).toBeCloseTo(1); // cos(0) = 1
        });

        it('should compute derivative of f(x) = exp(x)', () => {
            const f = (x: Dual) => x.exp();
            const result = forwardMode(f, 0);

            expect(result.value).toBeCloseTo(1);
            expect(result.derivative).toBeCloseTo(1);
        });

        it('should compute derivative of f(x) = x^2 * sin(x)', () => {
            const f = (x: Dual) => x.power(2).multiply(x.sin());
            const result = forwardMode(f, Math.PI);

            // f(π) = π^2 * sin(π) ≈ 0
            expect(result.value).toBeCloseTo(0, 5);
            // f'(π) = 2π * sin(π) + π^2 * cos(π) = 0 + π^2 * (-1) = -π^2
            expect(result.derivative).toBeCloseTo(-Math.PI * Math.PI, 5);
        });

        it('should compute gradient of f(x, y) = x^2 + y^2', () => {
            const f = (vars: Dual[]) => {
                const [x, y] = vars;
                return x.power(2).add(y.power(2));
            };

            const grad = forwardModeGradient(f, [3, 4]);

            expect(grad[0]).toBeCloseTo(6); // ∂f/∂x = 2x = 6
            expect(grad[1]).toBeCloseTo(8); // ∂f/∂y = 2y = 8
        });

        it('should compute gradient of f(x, y) = x * y', () => {
            const f = (vars: Dual[]) => {
                const [x, y] = vars;
                return x.multiply(y);
            };

            const grad = forwardModeGradient(f, [3, 4]);

            expect(grad[0]).toBeCloseTo(4); // ∂f/∂x = y = 4
            expect(grad[1]).toBeCloseTo(3); // ∂f/∂y = x = 3
        });
    });

    describe('Reverse Mode AD', () => {
        describe('Basic Operations', () => {
            it('should create variables', () => {
                const v1 = new Variable(3);
                expect(v1.value).toBe(3);
                expect(v1.gradient).toBe(0);
            });

            it('should compute gradients for addition', () => {
                const x = new Variable(3);
                const y = new Variable(4);
                const z = x.add(y);

                z.backward();

                expect(z.value).toBe(7);
                expect(x.gradient).toBe(1);
                expect(y.gradient).toBe(1);
            });

            it('should compute gradients for multiplication', () => {
                const x = new Variable(3);
                const y = new Variable(4);
                const z = x.multiply(y);

                z.backward();

                expect(z.value).toBe(12);
                expect(x.gradient).toBe(4); // ∂z/∂x = y
                expect(y.gradient).toBe(3); // ∂z/∂y = x
            });

            it('should compute gradients for power', () => {
                const x = new Variable(2);
                const y = x.power(3);

                y.backward();

                expect(y.value).toBe(8);
                expect(x.gradient).toBe(12); // 3 * 2^2 = 12
            });
        });

        it('should compute derivative of f(x) = x^2', () => {
            const f = (x: Variable) => x.power(2);
            const result = reverseMode(f, 3);

            expect(result.value).toBe(9);
            expect(result.derivative).toBe(6); // 2*3 = 6
        });

        it('should compute derivative of f(x) = sin(x)', () => {
            const f = (x: Variable) => x.sin();
            const result = reverseMode(f, 0);

            expect(result.value).toBeCloseTo(0);
            expect(result.derivative).toBeCloseTo(1); // cos(0) = 1
        });

        it('should compute derivative of f(x) = exp(x)', () => {
            const f = (x: Variable) => x.exp();
            const result = reverseMode(f, 0);

            expect(result.value).toBeCloseTo(1);
            expect(result.derivative).toBeCloseTo(1);
        });

        it('should compute gradient of f(x, y) = x^2 + y^2', () => {
            const f = (vars: Variable[]) => {
                const [x, y] = vars;
                return x.power(2).add(y.power(2));
            };

            const grad = reverseModeGradient(f, [3, 4]);

            expect(grad[0]).toBeCloseTo(6); // ∂f/∂x = 2x = 6
            expect(grad[1]).toBeCloseTo(8); // ∂f/∂y = 2y = 8
        });

        it('should compute gradient of f(x, y) = x * y', () => {
            const f = (vars: Variable[]) => {
                const [x, y] = vars;
                return x.multiply(y);
            };

            const grad = reverseModeGradient(f, [3, 4]);

            expect(grad[0]).toBeCloseTo(4); // ∂f/∂x = y = 4
            expect(grad[1]).toBeCloseTo(3); // ∂f/∂y = x = 3
        });

        it('should compute gradient of f(x, y, z) = x * y + y * z', () => {
            const f = (vars: Variable[]) => {
                const [x, y, z] = vars;
                return x.multiply(y).add(y.multiply(z));
            };

            const grad = reverseModeGradient(f, [2, 3, 4]);

            expect(grad[0]).toBeCloseTo(3); // ∂f/∂x = y = 3
            expect(grad[1]).toBeCloseTo(6); // ∂f/∂y = x + z = 2 + 4 = 6
            expect(grad[2]).toBeCloseTo(3); // ∂f/∂z = y = 3
        });

        it('should handle complex expressions', () => {
            // f(x, y) = sin(x * y) + exp(x)
            const f = (vars: Variable[]) => {
                const [x, y] = vars;
                return x.multiply(y).sin().add(x.exp());
            };

            const grad = reverseModeGradient(f, [0, 1]);

            // At (0, 1):
            // f = sin(0) + exp(0) = 0 + 1 = 1
            // ∂f/∂x = y * cos(x*y) + exp(x) = 1 * cos(0) + exp(0) = 1 + 1 = 2
            // ∂f/∂y = x * cos(x*y) = 0 * cos(0) = 0
            expect(grad[0]).toBeCloseTo(2);
            expect(grad[1]).toBeCloseTo(0);
        });
    });

    describe('Comparison: Forward vs Reverse Mode', () => {
        it('should give same results for scalar functions', () => {
            const f = (x: any) => x.power(2).multiply(x.sin());

            const forward = forwardMode(f, Math.PI);
            const reverse = reverseMode(f, Math.PI);

            expect(forward.value).toBeCloseTo(reverse.value);
            expect(forward.derivative).toBeCloseTo(reverse.derivative);
        });

        it('should give same gradient for multivariable functions', () => {
            const f = (vars: any[]) => {
                const [x, y] = vars;
                return x.power(2).add(y.power(2)).multiply(x.sin());
            };

            const forwardGrad = forwardModeGradient(f, [1, 2]);
            const reverseGrad = reverseModeGradient(f, [1, 2]);

            expect(forwardGrad[0]).toBeCloseTo(reverseGrad[0]);
            expect(forwardGrad[1]).toBeCloseTo(reverseGrad[1]);
        });
    });

    describe('ML-style Applications', () => {
        it('should compute gradients for simple neural network layer', () => {
            // Simple linear layer: y = w*x + b
            const forward = (vars: Variable[]) => {
                const [w, x, b] = vars;
                return w.multiply(x).add(b);
            };

            const grad = reverseModeGradient(forward, [2, 3, 1]);

            // ∂y/∂w = x = 3
            // ∂y/∂x = w = 2
            // ∂y/∂b = 1
            expect(grad[0]).toBeCloseTo(3);
            expect(grad[1]).toBeCloseTo(2);
            expect(grad[2]).toBeCloseTo(1);
        });

        it('should compute gradients for non-linear activation', () => {
            // f(w, x, b) = sin(w*x + b)
            const forward = (vars: Variable[]) => {
                const [w, x, b] = vars;
                return w.multiply(x).add(b).sin();
            };

            const grad = reverseModeGradient(forward, [1, 0, 0]);

            // At (1, 0, 0): f = sin(0) = 0
            // ∂f/∂w = x * cos(w*x + b) = 0 * 1 = 0
            // ∂f/∂x = w * cos(w*x + b) = 1 * 1 = 1
            // ∂f/∂b = cos(w*x + b) = 1
            expect(grad[0]).toBeCloseTo(0);
            expect(grad[1]).toBeCloseTo(1);
            expect(grad[2]).toBeCloseTo(1);
        });

        it('should compute gradients for mean squared error', () => {
            // MSE for single example: (y_pred - y_true)^2
            const mse = (vars: Variable[]) => {
                const [y_pred, y_true] = vars;
                return y_pred.subtract(y_true).power(2);
            };

            const grad = reverseModeGradient(mse, [3, 5]);

            // ∂MSE/∂y_pred = 2(y_pred - y_true) = 2(3 - 5) = -4
            // ∂MSE/∂y_true = -2(y_pred - y_true) = -2(3 - 5) = 4
            expect(grad[0]).toBeCloseTo(-4);
            expect(grad[1]).toBeCloseTo(4);
        });
    });
});
