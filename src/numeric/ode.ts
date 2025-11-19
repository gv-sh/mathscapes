/**
 * Ordinary Differential Equation (ODE) Solvers
 *
 * Numerical methods for solving initial value problems (IVPs) and
 * boundary value problems (BVPs) for ordinary differential equations.
 *
 * An ODE has the form: dy/dt = f(t, y) with initial condition y(t0) = y0
 *
 * Applications:
 * - Physics simulations (motion, heat transfer, fluid dynamics)
 * - Population dynamics and epidemiology
 * - Chemical reaction kinetics
 * - Electrical circuits
 * - Economics and finance (option pricing, growth models)
 * - Control systems and robotics
 *
 * References:
 * - Press et al., "Numerical Recipes" (2007), Chapter 17
 * - Hairer, Nørsett & Wanner, "Solving Ordinary Differential Equations I" (1993)
 * - Ascher & Petzold, "Computer Methods for Ordinary Differential Equations" (1998)
 */

/**
 * Type for ODE function: dy/dt = f(t, y)
 * For scalar ODEs
 */
export type ODEFunction = (t: number, y: number) => number;

/**
 * Type for system of ODEs: dy/dt = f(t, y)
 * For vector ODEs (systems)
 */
export type ODESystemFunction = (t: number, y: number[]) => number[];

/**
 * Options for ODE solvers
 */
export interface ODEOptions {
    /** Step size (if fixed) or initial step size (if adaptive) */
    stepSize?: number;
    /** Maximum number of steps */
    maxSteps?: number;
    /** Tolerance for adaptive methods */
    tolerance?: number;
    /** Whether to use adaptive step size */
    adaptive?: boolean;
    /** Minimum step size for adaptive methods */
    minStepSize?: number;
    /** Maximum step size for adaptive methods */
    maxStepSize?: number;
}

/**
 * Result from an ODE solver
 */
export interface ODEResult {
    /** Array of time points */
    t: number[];
    /** Array of solution values at each time point */
    y: number[];
    /** Number of steps taken */
    steps: number;
    /** Whether the solver completed successfully */
    success: boolean;
}

/**
 * Result from a system ODE solver
 */
export interface ODESystemResult {
    /** Array of time points */
    t: number[];
    /** Array of solution vectors at each time point */
    y: number[][];
    /** Number of steps taken */
    steps: number;
    /** Whether the solver completed successfully */
    success: boolean;
}

/**
 * Euler's Method
 *
 * The simplest method for solving ODEs. Uses first-order approximation:
 * y(t + h) ≈ y(t) + h * f(t, y(t))
 *
 * Algorithm:
 * 1. Start with initial condition (t0, y0)
 * 2. Compute yn+1 = yn + h * f(tn, yn)
 * 3. Advance tn+1 = tn + h
 * 4. Repeat until reaching final time
 *
 * Pros:
 * - Simple to implement and understand
 * - Low computational cost per step
 * - Good for educational purposes
 *
 * Cons:
 * - First-order accuracy: O(h) local error, O(h²) global error
 * - Requires small step size for accuracy
 * - Can be unstable for stiff equations
 *
 * Time Complexity: O(n) where n = (tEnd - t0) / h
 * Space Complexity: O(n) for storing results
 *
 * @param f ODE function dy/dt = f(t, y)
 * @param t0 Initial time
 * @param y0 Initial value
 * @param tEnd Final time
 * @param options Solver options
 * @returns Solution at discrete time points
 *
 * @example
 * // Solve dy/dt = -y with y(0) = 1 (exponential decay)
 * const result = euler((t, y) => -y, 0, 1, 2, { stepSize: 0.1 });
 * console.log(result.y[result.y.length - 1]); // ≈ 0.135 (actual: e^-2 ≈ 0.1353)
 */
export function euler(
    f: ODEFunction,
    t0: number,
    y0: number,
    tEnd: number,
    options: ODEOptions = {}
): ODEResult {
    const { stepSize = 0.01, maxSteps = 10000 } = options;
    const h = stepSize;

    const t: number[] = [t0];
    const y: number[] = [y0];

    let tn = t0;
    let yn = y0;
    let steps = 0;

    while (tn < tEnd && steps < maxSteps) {
        // Adjust last step to hit tEnd exactly
        const actualH = Math.min(h, tEnd - tn);

        // Euler step: y(n+1) = y(n) + h * f(t(n), y(n))
        const yn1 = yn + actualH * f(tn, yn);

        tn += actualH;
        yn = yn1;

        t.push(tn);
        y.push(yn);
        steps++;
    }

    return {
        t,
        y,
        steps,
        success: tn >= tEnd,
    };
}

/**
 * Runge-Kutta 2nd Order (RK2) Method (Midpoint Method)
 *
 * Second-order accurate method using two function evaluations per step.
 *
 * Algorithm:
 * 1. k1 = h * f(tn, yn)
 * 2. k2 = h * f(tn + h/2, yn + k1/2)
 * 3. yn+1 = yn + k2
 *
 * Accuracy: O(h²) local error, O(h³) global error
 *
 * Time Complexity: O(n) where n = (tEnd - t0) / h
 *
 * @param f ODE function dy/dt = f(t, y)
 * @param t0 Initial time
 * @param y0 Initial value
 * @param tEnd Final time
 * @param options Solver options
 * @returns Solution at discrete time points
 *
 * @example
 * // Solve dy/dt = t with y(0) = 0 (solution: y = t²/2)
 * const result = rk2((t, y) => t, 0, 0, 1, { stepSize: 0.1 });
 * console.log(result.y[result.y.length - 1]); // ≈ 0.5
 */
export function rk2(
    f: ODEFunction,
    t0: number,
    y0: number,
    tEnd: number,
    options: ODEOptions = {}
): ODEResult {
    const { stepSize = 0.01, maxSteps = 10000 } = options;
    const h = stepSize;

    const t: number[] = [t0];
    const y: number[] = [y0];

    let tn = t0;
    let yn = y0;
    let steps = 0;

    while (tn < tEnd && steps < maxSteps) {
        const actualH = Math.min(h, tEnd - tn);

        // RK2 (Midpoint method)
        const k1 = actualH * f(tn, yn);
        const k2 = actualH * f(tn + actualH / 2, yn + k1 / 2);

        yn = yn + k2;
        tn += actualH;

        t.push(tn);
        y.push(yn);
        steps++;
    }

    return {
        t,
        y,
        steps,
        success: tn >= tEnd,
    };
}

/**
 * Runge-Kutta 4th Order (RK4) Method
 *
 * Fourth-order accurate method, the most widely used Runge-Kutta method.
 * Uses four function evaluations per step for high accuracy.
 *
 * Algorithm:
 * 1. k1 = h * f(tn, yn)
 * 2. k2 = h * f(tn + h/2, yn + k1/2)
 * 3. k3 = h * f(tn + h/2, yn + k2/2)
 * 4. k4 = h * f(tn + h, yn + k3)
 * 5. yn+1 = yn + (k1 + 2*k2 + 2*k3 + k4) / 6
 *
 * Accuracy: O(h⁴) local error, O(h⁵) global error
 *
 * Pros:
 * - Excellent balance of accuracy and efficiency
 * - No need for derivative calculations
 * - Well-tested and reliable
 *
 * Cons:
 * - Four function evaluations per step
 * - Fixed step size (non-adaptive version)
 *
 * Time Complexity: O(n) where n = (tEnd - t0) / h
 *
 * @param f ODE function dy/dt = f(t, y)
 * @param t0 Initial time
 * @param y0 Initial value
 * @param tEnd Final time
 * @param options Solver options
 * @returns Solution at discrete time points
 *
 * @example
 * // Solve dy/dt = -2*t*y with y(0) = 1 (solution: y = e^(-t²))
 * const result = rk4((t, y) => -2 * t * y, 0, 1, 1, { stepSize: 0.1 });
 * console.log(result.y[result.y.length - 1]); // ≈ 0.3679 (actual: e^-1 ≈ 0.3679)
 */
export function rk4(
    f: ODEFunction,
    t0: number,
    y0: number,
    tEnd: number,
    options: ODEOptions = {}
): ODEResult {
    const { stepSize = 0.01, maxSteps = 10000 } = options;
    const h = stepSize;

    const t: number[] = [t0];
    const y: number[] = [y0];

    let tn = t0;
    let yn = y0;
    let steps = 0;

    while (tn < tEnd && steps < maxSteps) {
        const actualH = Math.min(h, tEnd - tn);

        // RK4 method
        const k1 = actualH * f(tn, yn);
        const k2 = actualH * f(tn + actualH / 2, yn + k1 / 2);
        const k3 = actualH * f(tn + actualH / 2, yn + k2 / 2);
        const k4 = actualH * f(tn + actualH, yn + k3);

        yn = yn + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        tn += actualH;

        t.push(tn);
        y.push(yn);
        steps++;
    }

    return {
        t,
        y,
        steps,
        success: tn >= tEnd,
    };
}

/**
 * Runge-Kutta-Fehlberg Method (RK45)
 *
 * Adaptive step-size method combining 4th and 5th order Runge-Kutta.
 * Automatically adjusts step size to maintain desired accuracy.
 *
 * Algorithm:
 * 1. Compute 4th-order and 5th-order estimates
 * 2. Compare estimates to estimate local truncation error
 * 3. If error is too large, reduce step size and retry
 * 4. If error is small, accept step and possibly increase step size
 *
 * Accuracy: O(h⁴) per step
 *
 * Pros:
 * - Automatic error control
 * - Efficient for problems requiring variable accuracy
 * - Good for stiff and non-stiff problems
 *
 * Cons:
 * - More complex implementation
 * - May take very small steps in certain regions
 *
 * @param f ODE function dy/dt = f(t, y)
 * @param t0 Initial time
 * @param y0 Initial value
 * @param tEnd Final time
 * @param options Solver options (tolerance, minStepSize, maxStepSize)
 * @returns Solution at discrete time points
 *
 * @example
 * // Solve dy/dt = y with y(0) = 1 (exponential growth)
 * const result = rk45((t, y) => y, 0, 1, 2, { tolerance: 1e-6 });
 * console.log(result.y[result.y.length - 1]); // ≈ 7.389 (actual: e² ≈ 7.389)
 */
export function rk45(
    f: ODEFunction,
    t0: number,
    y0: number,
    tEnd: number,
    options: ODEOptions = {}
): ODEResult {
    const {
        tolerance = 1e-6,
        maxSteps = 10000,
        minStepSize = 1e-10,
        maxStepSize = (tEnd - t0) / 10,
        stepSize = (tEnd - t0) / 100,
    } = options;

    // Fehlberg coefficients
    const a2 = 1 / 4;
    const a3 = 3 / 8;
    const a4 = 12 / 13;
    const a5 = 1;
    const a6 = 1 / 2;

    const b21 = 1 / 4;
    const b31 = 3 / 32;
    const b32 = 9 / 32;
    const b41 = 1932 / 2197;
    const b42 = -7200 / 2197;
    const b43 = 7296 / 2197;
    const b51 = 439 / 216;
    const b52 = -8;
    const b53 = 3680 / 513;
    const b54 = -845 / 4104;
    const b61 = -8 / 27;
    const b62 = 2;
    const b63 = -3544 / 2565;
    const b64 = 1859 / 4104;
    const b65 = -11 / 40;

    // 4th order coefficients
    const c1 = 25 / 216;
    const c3 = 1408 / 2565;
    const c4 = 2197 / 4104;
    const c5 = -1 / 5;

    // 5th order coefficients
    const d1 = 16 / 135;
    const d3 = 6656 / 12825;
    const d4 = 28561 / 56430;
    const d5 = -9 / 50;
    const d6 = 2 / 55;

    const t: number[] = [t0];
    const y: number[] = [y0];

    let tn = t0;
    let yn = y0;
    let h = stepSize;
    let steps = 0;

    while (tn < tEnd && steps < maxSteps) {
        // Don't overshoot the end
        if (tn + h > tEnd) {
            h = tEnd - tn;
        }

        // Compute k values
        const k1 = h * f(tn, yn);
        const k2 = h * f(tn + a2 * h, yn + b21 * k1);
        const k3 = h * f(tn + a3 * h, yn + b31 * k1 + b32 * k2);
        const k4 = h * f(tn + a4 * h, yn + b41 * k1 + b42 * k2 + b43 * k3);
        const k5 = h * f(tn + a5 * h, yn + b51 * k1 + b52 * k2 + b53 * k3 + b54 * k4);
        const k6 = h * f(tn + a6 * h, yn + b61 * k1 + b62 * k2 + b63 * k3 + b64 * k4 + b65 * k5);

        // 4th and 5th order estimates
        const y4 = yn + c1 * k1 + c3 * k3 + c4 * k4 + c5 * k5;
        const y5 = yn + d1 * k1 + d3 * k3 + d4 * k4 + d5 * k5 + d6 * k6;

        // Estimate error
        const error = Math.abs(y5 - y4);

        // Compute optimal step size
        const s = 0.84 * Math.pow(tolerance / Math.max(error, 1e-10), 0.25);

        if (error <= tolerance) {
            // Accept the step
            yn = y5;
            tn += h;

            t.push(tn);
            y.push(yn);
            steps++;

            // Increase step size for next iteration
            h = Math.min(s * h, maxStepSize);
        } else {
            // Reject the step and reduce step size
            h = Math.max(s * h, minStepSize);
        }

        // Safety check for step size
        if (h < minStepSize) {
            console.warn('Step size too small in RK45, may not converge');
            break;
        }
    }

    return {
        t,
        y,
        steps,
        success: Math.abs(tn - tEnd) < 1e-10,
    };
}

/**
 * Adams-Bashforth 2-step Method
 *
 * Multistep method that uses previous points to achieve higher accuracy.
 * Uses RK4 for the first step, then applies the Adams-Bashforth formula.
 *
 * Algorithm:
 * 1. Use RK4 for first step to get y1
 * 2. For subsequent steps:
 *    yn+1 = yn + h/2 * (3*f(tn, yn) - f(tn-1, yn-1))
 *
 * Accuracy: O(h²) global error
 *
 * Pros:
 * - Only one function evaluation per step (after initialization)
 * - More efficient than RK methods for long integrations
 *
 * Cons:
 * - Requires starting values (uses RK4 initially)
 * - Less stable than Runge-Kutta methods
 * - Not self-starting
 *
 * @param f ODE function dy/dt = f(t, y)
 * @param t0 Initial time
 * @param y0 Initial value
 * @param tEnd Final time
 * @param options Solver options
 * @returns Solution at discrete time points
 *
 * @example
 * // Solve dy/dt = -y with y(0) = 1
 * const result = adamsBashforth2((t, y) => -y, 0, 1, 2, { stepSize: 0.1 });
 */
export function adamsBashforth2(
    f: ODEFunction,
    t0: number,
    y0: number,
    tEnd: number,
    options: ODEOptions = {}
): ODEResult {
    const { stepSize = 0.01, maxSteps = 10000 } = options;
    const h = stepSize;

    const t: number[] = [t0];
    const y: number[] = [y0];
    const fy: number[] = [f(t0, y0)]; // Store f(t, y) values

    let tn = t0;
    let yn = y0;
    let steps = 0;

    // First step: use RK4 to get started
    if (tn + h <= tEnd) {
        const actualH = Math.min(h, tEnd - tn);
        const k1 = actualH * f(tn, yn);
        const k2 = actualH * f(tn + actualH / 2, yn + k1 / 2);
        const k3 = actualH * f(tn + actualH / 2, yn + k2 / 2);
        const k4 = actualH * f(tn + actualH, yn + k3);

        yn = yn + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        tn += actualH;

        t.push(tn);
        y.push(yn);
        fy.push(f(tn, yn));
        steps++;
    }

    // Subsequent steps: Adams-Bashforth 2-step
    while (tn < tEnd && steps < maxSteps) {
        const actualH = Math.min(h, tEnd - tn);

        // AB2: y(n+1) = y(n) + h/2 * (3*f(n) - f(n-1))
        const fCurrent = fy[fy.length - 1];
        const fPrevious = fy[fy.length - 2];

        yn = yn + (actualH / 2) * (3 * fCurrent - fPrevious);
        tn += actualH;

        t.push(tn);
        y.push(yn);
        fy.push(f(tn, yn));
        steps++;
    }

    return {
        t,
        y,
        steps,
        success: tn >= tEnd,
    };
}

/**
 * Adams-Bashforth 4-step Method
 *
 * Higher-order multistep method using four previous points.
 *
 * Algorithm:
 * Uses RK4 for first 3 steps, then:
 * yn+1 = yn + h/24 * (55*f(n) - 59*f(n-1) + 37*f(n-2) - 9*f(n-3))
 *
 * Accuracy: O(h⁴) global error
 *
 * @param f ODE function dy/dt = f(t, y)
 * @param t0 Initial time
 * @param y0 Initial value
 * @param tEnd Final time
 * @param options Solver options
 * @returns Solution at discrete time points
 */
export function adamsBashforth4(
    f: ODEFunction,
    t0: number,
    y0: number,
    tEnd: number,
    options: ODEOptions = {}
): ODEResult {
    const { stepSize = 0.01, maxSteps = 10000 } = options;
    const h = stepSize;

    const t: number[] = [t0];
    const y: number[] = [y0];
    const fy: number[] = [f(t0, y0)];

    let tn = t0;
    let yn = y0;
    let steps = 0;

    // First 3 steps: use RK4 to get started
    for (let i = 0; i < 3 && tn < tEnd && steps < maxSteps; i++) {
        const actualH = Math.min(h, tEnd - tn);
        const k1 = actualH * f(tn, yn);
        const k2 = actualH * f(tn + actualH / 2, yn + k1 / 2);
        const k3 = actualH * f(tn + actualH / 2, yn + k2 / 2);
        const k4 = actualH * f(tn + actualH, yn + k3);

        yn = yn + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        tn += actualH;

        t.push(tn);
        y.push(yn);
        fy.push(f(tn, yn));
        steps++;
    }

    // Subsequent steps: Adams-Bashforth 4-step
    while (tn < tEnd && steps < maxSteps) {
        const actualH = Math.min(h, tEnd - tn);

        // AB4: y(n+1) = y(n) + h/24 * (55*f(n) - 59*f(n-1) + 37*f(n-2) - 9*f(n-3))
        const f0 = fy[fy.length - 1];
        const f1 = fy[fy.length - 2];
        const f2 = fy[fy.length - 3];
        const f3 = fy[fy.length - 4];

        yn = yn + (actualH / 24) * (55 * f0 - 59 * f1 + 37 * f2 - 9 * f3);
        tn += actualH;

        t.push(tn);
        y.push(yn);
        fy.push(f(tn, yn));
        steps++;
    }

    return {
        t,
        y,
        steps,
        success: tn >= tEnd,
    };
}

/**
 * Solve a system of ODEs using RK4
 *
 * Solves: dy/dt = f(t, y) where y is a vector
 *
 * @param f System ODE function
 * @param t0 Initial time
 * @param y0 Initial state vector
 * @param tEnd Final time
 * @param options Solver options
 * @returns Solution vectors at discrete time points
 *
 * @example
 * // Solve harmonic oscillator: d²x/dt² = -x
 * // Convert to system: y[0] = x, y[1] = dx/dt
 * // dy[0]/dt = y[1], dy[1]/dt = -y[0]
 * const f = (t: number, y: number[]) => [y[1], -y[0]];
 * const result = solveSystem(f, 0, [1, 0], 10, { stepSize: 0.1 });
 */
export function solveSystem(
    f: ODESystemFunction,
    t0: number,
    y0: number[],
    tEnd: number,
    options: ODEOptions = {}
): ODESystemResult {
    const { stepSize = 0.01, maxSteps = 10000 } = options;
    const h = stepSize;

    const t: number[] = [t0];
    const y: number[][] = [[...y0]];

    let tn = t0;
    let yn = [...y0];
    let steps = 0;

    const n = y0.length;

    // Vector addition helper
    const vadd = (a: number[], b: number[]): number[] => a.map((ai, i) => ai + b[i]);
    const vscale = (s: number, v: number[]): number[] => v.map((vi) => s * vi);

    while (tn < tEnd && steps < maxSteps) {
        const actualH = Math.min(h, tEnd - tn);

        // RK4 for systems
        const k1 = vscale(actualH, f(tn, yn));
        const k2 = vscale(actualH, f(tn + actualH / 2, vadd(yn, vscale(0.5, k1))));
        const k3 = vscale(actualH, f(tn + actualH / 2, vadd(yn, vscale(0.5, k2))));
        const k4 = vscale(actualH, f(tn + actualH, vadd(yn, k3)));

        // Update: y(n+1) = y(n) + (k1 + 2*k2 + 2*k3 + k4) / 6
        yn = vadd(yn, vscale(1 / 6, vadd(vadd(k1, vscale(2, k2)), vadd(vscale(2, k3), k4))));
        tn += actualH;

        t.push(tn);
        y.push([...yn]);
        steps++;
    }

    return {
        t,
        y,
        steps,
        success: tn >= tEnd,
    };
}

/**
 * Options for boundary value problem solvers
 */
export interface BVPOptions {
    /** Number of grid points */
    numPoints?: number;
    /** Maximum iterations for shooting method */
    maxIterations?: number;
    /** Tolerance for convergence */
    tolerance?: number;
}

/**
 * Result from a BVP solver
 */
export interface BVPResult {
    /** Grid points */
    x: number[];
    /** Solution values */
    y: number[];
    /** Whether the solver converged */
    converged: boolean;
    /** Number of iterations */
    iterations?: number;
}

/**
 * Shooting Method for Boundary Value Problems
 *
 * Converts a BVP into an IVP by guessing the initial slope and iterating.
 *
 * Problem: y'' = f(x, y, y') with y(a) = ya and y(b) = yb
 *
 * Algorithm:
 * 1. Guess initial slope s
 * 2. Solve IVP with y(a) = ya and y'(a) = s
 * 3. Check if y(b) matches yb
 * 4. Adjust s and repeat until convergence
 *
 * @param f Second derivative function: y'' = f(x, y, y')
 * @param a Left boundary point
 * @param b Right boundary point
 * @param ya Boundary value at a
 * @param yb Boundary value at b
 * @param options Solver options
 * @returns Solution at discrete points
 *
 * @example
 * // Solve y'' = -y with y(0) = 0, y(π/2) = 1
 * const result = shootingMethod(
 *   (x, y, yp) => -y,
 *   0, Math.PI/2, 0, 1,
 *   { numPoints: 100 }
 * );
 */
export function shootingMethod(
    f: (x: number, y: number, yPrime: number) => number,
    a: number,
    b: number,
    ya: number,
    yb: number,
    options: BVPOptions = {}
): BVPResult {
    const { numPoints = 100, maxIterations = 50, tolerance = 1e-6 } = options;

    // Convert second-order ODE to system of first-order ODEs
    // Let y[0] = y, y[1] = y'
    // Then: dy[0]/dx = y[1], dy[1]/dx = f(x, y[0], y[1])
    const system = (x: number, y: number[]): number[] => [y[1], f(x, y[0], y[1])];

    // Secant method to find the correct initial slope
    let s1 = 0; // First guess for initial slope
    let s2 = 1; // Second guess for initial slope

    // Solve with first guess
    let result1 = solveSystem(system, a, [ya, s1], b, { stepSize: (b - a) / numPoints });
    let error1 = result1.y[result1.y.length - 1][0] - yb;

    let iterations = 0;

    for (let i = 0; i < maxIterations; i++) {
        iterations++;

        // Solve with second guess
        const result2 = solveSystem(system, a, [ya, s2], b, { stepSize: (b - a) / numPoints });
        const error2 = result2.y[result2.y.length - 1][0] - yb;

        // Check for convergence
        if (Math.abs(error2) < tolerance) {
            return {
                x: result2.t,
                y: result2.y.map((yi) => yi[0]),
                converged: true,
                iterations,
            };
        }

        // Secant method update
        const sNew = s2 - error2 * (s2 - s1) / (error2 - error1);

        // Update for next iteration
        s1 = s2;
        error1 = error2;
        s2 = sNew;
        result1 = result2;
    }

    // Did not converge
    return {
        x: result1.t,
        y: result1.y.map((yi) => yi[0]),
        converged: false,
        iterations,
    };
}

/**
 * Finite Difference Method for Boundary Value Problems
 *
 * Discretizes the ODE using finite differences and solves the resulting
 * linear system.
 *
 * Problem: y'' + p(x)*y' + q(x)*y = r(x) with y(a) = ya and y(b) = yb
 *
 * Algorithm:
 * 1. Discretize domain into n points
 * 2. Approximate derivatives with finite differences
 * 3. Set up tridiagonal linear system
 * 4. Solve using Thomas algorithm
 *
 * @param p Coefficient of y'
 * @param q Coefficient of y
 * @param r Right-hand side function
 * @param a Left boundary point
 * @param b Right boundary point
 * @param ya Boundary value at a
 * @param yb Boundary value at b
 * @param options Solver options
 * @returns Solution at discrete points
 *
 * @example
 * // Solve y'' = 2 with y(0) = 0, y(1) = 1
 * const result = finiteDifferenceBVP(
 *   (x) => 0, (x) => 0, (x) => 2,
 *   0, 1, 0, 1,
 *   { numPoints: 11 }
 * );
 */
export function finiteDifferenceBVP(
    p: (x: number) => number,
    q: (x: number) => number,
    r: (x: number) => number,
    a: number,
    b: number,
    ya: number,
    yb: number,
    options: BVPOptions = {}
): BVPResult {
    const { numPoints = 100 } = options;
    const n = numPoints - 2; // Interior points
    const h = (b - a) / (numPoints - 1);

    // Set up tridiagonal system: A * y = d
    const lower: number[] = new Array(n);
    const diag: number[] = new Array(n);
    const upper: number[] = new Array(n);
    const rhs: number[] = new Array(n);

    // Fill the system
    for (let i = 0; i < n; i++) {
        const xi = a + (i + 1) * h;
        const pi = p(xi);
        const qi = q(xi);
        const ri = r(xi);

        // Finite difference approximation:
        // y''(i) ≈ (y(i-1) - 2*y(i) + y(i+1)) / h²
        // y'(i) ≈ (y(i+1) - y(i-1)) / (2*h)

        lower[i] = 1 / (h * h) - pi / (2 * h);
        diag[i] = -2 / (h * h) + qi;
        upper[i] = 1 / (h * h) + pi / (2 * h);
        rhs[i] = ri;

        // Adjust for boundary conditions
        if (i === 0) {
            rhs[i] -= lower[i] * ya;
        }
        if (i === n - 1) {
            rhs[i] -= upper[i] * yb;
        }
    }

    // Solve tridiagonal system using Thomas algorithm
    const solution = thomasAlgorithm(lower, diag, upper, rhs);

    // Construct full solution including boundaries
    const x: number[] = [];
    const y: number[] = [];

    x.push(a);
    y.push(ya);

    for (let i = 0; i < n; i++) {
        x.push(a + (i + 1) * h);
        y.push(solution[i]);
    }

    x.push(b);
    y.push(yb);

    return {
        x,
        y,
        converged: true,
    };
}

/**
 * Thomas Algorithm for solving tridiagonal systems
 *
 * Solves: A * x = d where A is tridiagonal
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 *
 * @param lower Lower diagonal
 * @param diag Main diagonal
 * @param upper Upper diagonal
 * @param rhs Right-hand side
 * @returns Solution vector
 */
function thomasAlgorithm(
    lower: number[],
    diag: number[],
    upper: number[],
    rhs: number[]
): number[] {
    const n = diag.length;
    const c: number[] = new Array(n);
    const d: number[] = new Array(n);
    const x: number[] = new Array(n);

    // Forward sweep
    c[0] = upper[0] / diag[0];
    d[0] = rhs[0] / diag[0];

    for (let i = 1; i < n; i++) {
        const denom = diag[i] - lower[i] * c[i - 1];
        c[i] = upper[i] / denom;
        d[i] = (rhs[i] - lower[i] * d[i - 1]) / denom;
    }

    // Back substitution
    x[n - 1] = d[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        x[i] = d[i] - c[i] * x[i + 1];
    }

    return x;
}
