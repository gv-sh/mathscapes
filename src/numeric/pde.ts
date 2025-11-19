/**
 * Partial Differential Equation (PDE) Solvers
 *
 * Numerical methods for solving partial differential equations using
 * finite difference methods.
 *
 * A PDE involves derivatives with respect to multiple variables, typically
 * space and time. Common forms:
 * - Heat/Diffusion: ∂u/∂t = α ∂²u/∂x²
 * - Wave: ∂²u/∂t² = c² ∂²u/∂x²
 *
 * Applications:
 * - Heat transfer and diffusion processes
 * - Wave propagation (sound, light, quantum mechanics)
 * - Fluid dynamics
 * - Electromagnetic fields
 * - Financial modeling (Black-Scholes equation)
 * - Image processing and computer vision
 *
 * References:
 * - LeVeque, "Finite Difference Methods for Ordinary and Partial Differential Equations" (2007)
 * - Strikwerda, "Finite Difference Schemes and Partial Differential Equations" (2004)
 * - Press et al., "Numerical Recipes" (2007), Chapter 20
 */

/**
 * Options for PDE solvers
 */
export interface PDEOptions {
    /** Number of spatial grid points */
    numSpatialPoints?: number;
    /** Number of time steps */
    numTimeSteps?: number;
    /** Time step size (dt) */
    timeStep?: number;
    /** Spatial step size (dx) */
    spatialStep?: number;
}

/**
 * Result from a 1D PDE solver
 */
export interface PDE1DResult {
    /** Spatial grid points */
    x: number[];
    /** Time points */
    t: number[];
    /** Solution u(x, t) as 2D array [timeIndex][spaceIndex] */
    u: number[][];
    /** Whether the solver completed successfully */
    success: boolean;
}

/**
 * Result from a 2D PDE solver
 */
export interface PDE2DResult {
    /** X-axis grid points */
    x: number[];
    /** Y-axis grid points */
    y: number[];
    /** Time points */
    t: number[];
    /** Solution u(x, y, t) as 3D array [timeIndex][yIndex][xIndex] */
    u: number[][][];
    /** Whether the solver completed successfully */
    success: boolean;
}

/**
 * Heat Equation Solver (1D)
 *
 * Solves the 1D heat/diffusion equation using explicit finite difference method:
 * ∂u/∂t = α ∂²u/∂x²
 *
 * Where:
 * - u(x,t) is the temperature/concentration at position x and time t
 * - α is the thermal diffusivity/diffusion coefficient
 *
 * Discretization (Forward Euler in time, centered in space):
 * u[i,n+1] = u[i,n] + r*(u[i+1,n] - 2*u[i,n] + u[i-1,n])
 * where r = α*dt/dx²
 *
 * Stability: Requires r ≤ 0.5 (von Neumann stability analysis)
 *
 * Algorithm:
 * 1. Discretize space [xMin, xMax] into nx points
 * 2. Discretize time [0, tMax] into nt points
 * 3. Apply initial condition u(x, 0) = f(x)
 * 4. Apply boundary conditions u(xMin, t) and u(xMax, t)
 * 5. For each time step, update interior points using finite difference
 *
 * Time Complexity: O(nx * nt)
 * Space Complexity: O(nx * nt) for storing full solution
 *
 * @param alpha Diffusion coefficient
 * @param xMin Left boundary
 * @param xMax Right boundary
 * @param tMax Final time
 * @param initialCondition u(x, 0) = f(x)
 * @param boundaryLeft u(xMin, t) for all t
 * @param boundaryRight u(xMax, t) for all t
 * @param options Solver options
 * @returns Solution u(x, t) on grid
 *
 * @example
 * // Solve heat equation with initial temperature spike in center
 * const result = heatEquation1D(
 *   0.01,  // alpha
 *   0, 1,   // xMin, xMax
 *   1,      // tMax
 *   (x) => Math.exp(-100 * (x - 0.5) ** 2), // Initial Gaussian spike
 *   0, 0,   // Boundary conditions (both ends at 0)
 *   { numSpatialPoints: 100, numTimeSteps: 1000 }
 * );
 */
export function heatEquation1D(
    alpha: number,
    xMin: number,
    xMax: number,
    tMax: number,
    initialCondition: (x: number) => number,
    boundaryLeft: number,
    boundaryRight: number,
    options: PDEOptions = {}
): PDE1DResult {
    const { numSpatialPoints = 100, numTimeSteps = 1000 } = options;

    const nx = numSpatialPoints;
    const nt = numTimeSteps;
    const dx = (xMax - xMin) / (nx - 1);
    const dt = tMax / nt;

    // Stability check: r = α*dt/dx² should be ≤ 0.5
    const r = (alpha * dt) / (dx * dx);
    if (r > 0.5) {
        console.warn(
            `Heat equation may be unstable: r = ${r.toFixed(4)} > 0.5. ` +
                `Consider reducing time step or increasing spatial points.`
        );
    }

    // Initialize spatial grid
    const x: number[] = [];
    for (let i = 0; i < nx; i++) {
        x.push(xMin + i * dx);
    }

    // Initialize time grid
    const t: number[] = [];
    for (let n = 0; n <= nt; n++) {
        t.push(n * dt);
    }

    // Initialize solution array
    const u: number[][] = [];

    // Set initial condition
    const u0: number[] = x.map(initialCondition);
    u.push([...u0]);

    // Time stepping
    for (let n = 0; n < nt; n++) {
        const uOld = u[n];
        const uNew: number[] = new Array(nx);

        // Boundary conditions
        uNew[0] = boundaryLeft;
        uNew[nx - 1] = boundaryRight;

        // Interior points: explicit finite difference
        for (let i = 1; i < nx - 1; i++) {
            uNew[i] = uOld[i] + r * (uOld[i + 1] - 2 * uOld[i] + uOld[i - 1]);
        }

        u.push(uNew);
    }

    return {
        x,
        t,
        u,
        success: true,
    };
}

/**
 * Heat Equation Solver (1D, Implicit Method)
 *
 * Solves the 1D heat equation using implicit (backward Euler) finite difference.
 * More stable than explicit method, allows larger time steps.
 *
 * Discretization:
 * u[i,n+1] - r*(u[i+1,n+1] - 2*u[i,n+1] + u[i-1,n+1]) = u[i,n]
 *
 * This creates a tridiagonal system at each time step.
 *
 * Stability: Unconditionally stable for all r > 0
 *
 * @param alpha Diffusion coefficient
 * @param xMin Left boundary
 * @param xMax Right boundary
 * @param tMax Final time
 * @param initialCondition u(x, 0) = f(x)
 * @param boundaryLeft u(xMin, t) for all t
 * @param boundaryRight u(xMax, t) for all t
 * @param options Solver options
 * @returns Solution u(x, t) on grid
 *
 * @example
 * // Solve with larger time steps (stable due to implicit method)
 * const result = heatEquation1DImplicit(
 *   0.01, 0, 1, 1,
 *   (x) => Math.sin(Math.PI * x),
 *   0, 0,
 *   { numSpatialPoints: 50, numTimeSteps: 100 }
 * );
 */
export function heatEquation1DImplicit(
    alpha: number,
    xMin: number,
    xMax: number,
    tMax: number,
    initialCondition: (x: number) => number,
    boundaryLeft: number,
    boundaryRight: number,
    options: PDEOptions = {}
): PDE1DResult {
    const { numSpatialPoints = 100, numTimeSteps = 1000 } = options;

    const nx = numSpatialPoints;
    const nt = numTimeSteps;
    const dx = (xMax - xMin) / (nx - 1);
    const dt = tMax / nt;
    const r = (alpha * dt) / (dx * dx);

    // Initialize spatial grid
    const x: number[] = [];
    for (let i = 0; i < nx; i++) {
        x.push(xMin + i * dx);
    }

    // Initialize time grid
    const t: number[] = [];
    for (let n = 0; n <= nt; n++) {
        t.push(n * dt);
    }

    // Initialize solution array
    const u: number[][] = [];

    // Set initial condition
    const u0: number[] = x.map(initialCondition);
    u.push([...u0]);

    // Set up tridiagonal system coefficients (constant for all time steps)
    const n_interior = nx - 2; // Number of interior points
    const lower: number[] = new Array(n_interior).fill(-r);
    const diag: number[] = new Array(n_interior).fill(1 + 2 * r);
    const upper: number[] = new Array(n_interior).fill(-r);

    // Time stepping
    for (let n = 0; n < nt; n++) {
        const uOld = u[n];
        const uNew: number[] = new Array(nx);

        // Boundary conditions
        uNew[0] = boundaryLeft;
        uNew[nx - 1] = boundaryRight;

        // Right-hand side
        const rhs: number[] = new Array(n_interior);
        for (let i = 0; i < n_interior; i++) {
            rhs[i] = uOld[i + 1];
        }

        // Adjust for boundary conditions
        rhs[0] += r * boundaryLeft;
        rhs[n_interior - 1] += r * boundaryRight;

        // Solve tridiagonal system
        const solution = thomasAlgorithm(lower, diag, upper, rhs);

        // Copy solution to uNew
        for (let i = 0; i < n_interior; i++) {
            uNew[i + 1] = solution[i];
        }

        u.push(uNew);
    }

    return {
        x,
        t,
        u,
        success: true,
    };
}

/**
 * Wave Equation Solver (1D)
 *
 * Solves the 1D wave equation using explicit finite difference:
 * ∂²u/∂t² = c² ∂²u/∂x²
 *
 * Where:
 * - u(x,t) is the displacement at position x and time t
 * - c is the wave speed
 *
 * Discretization (centered in both space and time):
 * u[i,n+1] = 2*u[i,n] - u[i,n-1] + r²*(u[i+1,n] - 2*u[i,n] + u[i-1,n])
 * where r = c*dt/dx (Courant number)
 *
 * Stability: Requires r ≤ 1 (CFL condition)
 *
 * Algorithm:
 * 1. Apply initial conditions u(x, 0) and ∂u/∂t(x, 0)
 * 2. Use special formula for first time step
 * 3. For subsequent steps, use centered difference
 * 4. Apply boundary conditions at each step
 *
 * @param c Wave speed
 * @param xMin Left boundary
 * @param xMax Right boundary
 * @param tMax Final time
 * @param initialDisplacement u(x, 0)
 * @param initialVelocity ∂u/∂t(x, 0)
 * @param boundaryLeft u(xMin, t) for all t
 * @param boundaryRight u(xMax, t) for all t
 * @param options Solver options
 * @returns Solution u(x, t) on grid
 *
 * @example
 * // Solve wave equation with initial Gaussian pulse
 * const result = waveEquation1D(
 *   1,     // wave speed c
 *   0, 10,  // xMin, xMax
 *   5,      // tMax
 *   (x) => Math.exp(-((x - 5) ** 2)), // Initial displacement
 *   (x) => 0,                          // Initial velocity
 *   0, 0,   // Boundary conditions
 *   { numSpatialPoints: 200, numTimeSteps: 1000 }
 * );
 */
export function waveEquation1D(
    c: number,
    xMin: number,
    xMax: number,
    tMax: number,
    initialDisplacement: (x: number) => number,
    initialVelocity: (x: number) => number,
    boundaryLeft: number,
    boundaryRight: number,
    options: PDEOptions = {}
): PDE1DResult {
    const { numSpatialPoints = 100, numTimeSteps = 1000 } = options;

    const nx = numSpatialPoints;
    const nt = numTimeSteps;
    const dx = (xMax - xMin) / (nx - 1);
    const dt = tMax / nt;

    // Courant number: r = c*dt/dx
    const r = (c * dt) / dx;
    const r2 = r * r;

    // Stability check: r should be ≤ 1 (CFL condition)
    if (r > 1) {
        console.warn(
            `Wave equation may be unstable: Courant number r = ${r.toFixed(4)} > 1. ` +
                `Consider reducing time step or increasing spatial points.`
        );
    }

    // Initialize spatial grid
    const x: number[] = [];
    for (let i = 0; i < nx; i++) {
        x.push(xMin + i * dx);
    }

    // Initialize time grid
    const t: number[] = [];
    for (let n = 0; n <= nt; n++) {
        t.push(n * dt);
    }

    // Initialize solution array
    const u: number[][] = [];

    // Set initial displacement (n = 0)
    const u0: number[] = x.map(initialDisplacement);
    u.push([...u0]);

    // First time step (n = 1): special formula using initial velocity
    const u1: number[] = new Array(nx);
    u1[0] = boundaryLeft;
    u1[nx - 1] = boundaryRight;

    for (let i = 1; i < nx - 1; i++) {
        // u[i,1] = u[i,0] + dt*v[i,0] + (r²/2)*(u[i+1,0] - 2*u[i,0] + u[i-1,0])
        u1[i] =
            u0[i] +
            dt * initialVelocity(x[i]) +
            (r2 / 2) * (u0[i + 1] - 2 * u0[i] + u0[i - 1]);
    }
    u.push(u1);

    // Time stepping for n >= 2
    for (let n = 1; n < nt; n++) {
        const uOld = u[n - 1];
        const uCurrent = u[n];
        const uNew: number[] = new Array(nx);

        // Boundary conditions
        uNew[0] = boundaryLeft;
        uNew[nx - 1] = boundaryRight;

        // Interior points
        for (let i = 1; i < nx - 1; i++) {
            // u[i,n+1] = 2*u[i,n] - u[i,n-1] + r²*(u[i+1,n] - 2*u[i,n] + u[i-1,n])
            uNew[i] =
                2 * uCurrent[i] -
                uOld[i] +
                r2 * (uCurrent[i + 1] - 2 * uCurrent[i] + uCurrent[i - 1]);
        }

        u.push(uNew);
    }

    return {
        x,
        t,
        u,
        success: true,
    };
}

/**
 * Heat Equation Solver (2D)
 *
 * Solves the 2D heat equation using explicit finite difference:
 * ∂u/∂t = α(∂²u/∂x² + ∂²u/∂y²)
 *
 * Discretization:
 * u[i,j,n+1] = u[i,j,n] + r*(u[i+1,j,n] + u[i-1,j,n] + u[i,j+1,n] + u[i,j-1,n] - 4*u[i,j,n])
 * where r = α*dt/(dx²) (assuming dx = dy)
 *
 * Stability: Requires r ≤ 0.25
 *
 * @param alpha Diffusion coefficient
 * @param xMin Left boundary
 * @param xMax Right boundary
 * @param yMin Bottom boundary
 * @param yMax Top boundary
 * @param tMax Final time
 * @param initialCondition u(x, y, 0)
 * @param boundaryValue Boundary condition (Dirichlet, constant on all edges)
 * @param options Solver options
 * @returns Solution u(x, y, t) on grid
 *
 * @example
 * // 2D heat diffusion with hot center
 * const result = heatEquation2D(
 *   0.01, 0, 1, 0, 1, 1,
 *   (x, y) => Math.exp(-100 * ((x - 0.5) ** 2 + (y - 0.5) ** 2)),
 *   0,
 *   { numSpatialPoints: 50, numTimeSteps: 500 }
 * );
 */
export function heatEquation2D(
    alpha: number,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    tMax: number,
    initialCondition: (x: number, y: number) => number,
    boundaryValue: number,
    options: PDEOptions = {}
): PDE2DResult {
    const { numSpatialPoints = 50, numTimeSteps = 500 } = options;

    const nx = numSpatialPoints;
    const ny = numSpatialPoints; // Same for both dimensions
    const nt = numTimeSteps;
    const dx = (xMax - xMin) / (nx - 1);
    const dy = (yMax - yMin) / (ny - 1);
    const dt = tMax / nt;

    // Assuming dx = dy
    const r = (alpha * dt) / (dx * dx);

    // Stability check
    if (r > 0.25) {
        console.warn(
            `2D heat equation may be unstable: r = ${r.toFixed(4)} > 0.25. ` +
                `Consider reducing time step or increasing spatial points.`
        );
    }

    // Initialize grids
    const x: number[] = [];
    for (let i = 0; i < nx; i++) {
        x.push(xMin + i * dx);
    }

    const y: number[] = [];
    for (let j = 0; j < ny; j++) {
        y.push(yMin + j * dy);
    }

    const t: number[] = [];
    for (let n = 0; n <= nt; n++) {
        t.push(n * dt);
    }

    // Initialize solution array
    const u: number[][][] = [];

    // Set initial condition
    const u0: number[][] = [];
    for (let j = 0; j < ny; j++) {
        const row: number[] = [];
        for (let i = 0; i < nx; i++) {
            row.push(initialCondition(x[i], y[j]));
        }
        u0.push(row);
    }
    u.push(u0);

    // Time stepping
    for (let n = 0; n < nt; n++) {
        const uOld = u[n];
        const uNew: number[][] = [];

        for (let j = 0; j < ny; j++) {
            const row: number[] = [];

            for (let i = 0; i < nx; i++) {
                // Boundary points
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) {
                    row.push(boundaryValue);
                } else {
                    // Interior points: 5-point stencil
                    const newVal =
                        uOld[j][i] +
                        r *
                            (uOld[j][i + 1] +
                                uOld[j][i - 1] +
                                uOld[j + 1][i] +
                                uOld[j - 1][i] -
                                4 * uOld[j][i]);
                    row.push(newVal);
                }
            }

            uNew.push(row);
        }

        u.push(uNew);
    }

    return {
        x,
        y,
        t,
        u,
        success: true,
    };
}

/**
 * Thomas Algorithm for solving tridiagonal systems
 *
 * Solves: A * x = d where A is tridiagonal
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
