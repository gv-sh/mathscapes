/**
 * Bessel Functions
 *
 * This module provides implementations of Bessel functions:
 * - Bessel functions of the first kind (J_n)
 * - Bessel functions of the second kind (Y_n)
 * - Modified Bessel functions (I_n, K_n)
 * - Spherical Bessel functions
 *
 * These functions are solutions to Bessel's differential equation and appear
 * in many physics and engineering applications.
 *
 * References:
 * - Abramowitz and Stegun, Handbook of Mathematical Functions
 * - Numerical Recipes in C (Press et al.)
 */

import { gamma } from './gamma';

/**
 * Compute Bessel function of the first kind J₀(x)
 * Solution to: x²y'' + xy' + x²y = 0
 *
 * @param x - Input value
 * @returns J₀(x)
 *
 * @example
 * ```ts
 * besselJ0(0); // 1
 * besselJ0(1); // ≈ 0.7652
 * besselJ0(2.4048); // ≈ 0 (first zero)
 * ```
 */
export function besselJ0(x: number): number {
  const ax = Math.abs(x);

  if (ax < 8.0) {
    // Use polynomial approximation for small x
    const y = x * x;
    const ans1 =
      57568490574.0 +
      y *
        (-13362590354.0 +
          y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * -184.9052456))));
    const ans2 =
      57568490411.0 +
      y *
        (1029532985.0 +
          y * (9494680.718 + y * (59272.64853 + y * (267.8532712 + y * 1.0))));

    return ans1 / ans2;
  } else {
    // Use asymptotic expansion for large x
    const z = 8.0 / ax;
    const y = z * z;
    const xx = ax - 0.785398164;

    const ans1 =
      1.0 +
      y *
        (-0.1098628627e-2 +
          y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)));
    const ans2 =
      -0.1562499995e-1 +
      y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)));

    return Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - (z * Math.sin(xx) * ans2));
  }
}

/**
 * Compute Bessel function of the first kind J₁(x)
 *
 * @param x - Input value
 * @returns J₁(x)
 *
 * @example
 * ```ts
 * besselJ1(0); // 0
 * besselJ1(1); // ≈ 0.4401
 * besselJ1(3.8317); // ≈ 0 (first zero)
 * ```
 */
export function besselJ1(x: number): number {
  const ax = Math.abs(x);

  if (ax < 8.0) {
    // Use polynomial approximation for small x
    const y = x * x;
    const ans1 =
      x *
      (72362614232.0 +
        y *
          (-7895059235.0 +
            y * (242396853.1 + y * (-2972611.439 + y * (15704.48260 + y * -30.16036606)))));
    const ans2 =
      144725228442.0 +
      y *
        (2300535178.0 +
          y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y * 1.0))));

    return ans1 / ans2;
  } else {
    // Use asymptotic expansion for large x
    const z = 8.0 / ax;
    const y = z * z;
    const xx = ax - 2.356194491;

    const ans1 =
      1.0 +
      y *
        (0.183105e-2 +
          y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)));
    const ans2 =
      0.04687499995 +
      y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));

    const ans = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - (z * Math.sin(xx) * ans2));

    return x < 0.0 ? -ans : ans;
  }
}

/**
 * Compute Bessel function of the first kind Jₙ(x) for integer order n
 *
 * @param n - Order (non-negative integer)
 * @param x - Input value
 * @returns Jₙ(x)
 *
 * @example
 * ```ts
 * besselJn(2, 1); // ≈ 0.1149
 * besselJn(5, 10); // ≈ -0.2340
 * ```
 */
export function besselJn(n: number, x: number): number {
  if (n < 0) throw new Error('Order n must be non-negative');

  n = Math.floor(n);

  if (n === 0) return besselJ0(x);
  if (n === 1) return besselJ1(x);

  const ax = Math.abs(x);

  if (ax === 0.0) return 0.0;

  // Use forward recurrence for small x, backward for large x
  if (ax > n) {
    // Forward recurrence: J_{n+1} = (2n/x)J_n - J_{n-1}
    let jnm1 = besselJ0(x);
    let jn = besselJ1(x);

    for (let i = 1; i < n; i++) {
      const jnp1 = ((2 * i) / x) * jn - jnm1;
      jnm1 = jn;
      jn = jnp1;
    }

    return jn;
  } else {
    // Backward recurrence (Miller's algorithm)
    const m = 2 * Math.floor((n + Math.floor(Math.sqrt(40 * n))) / 2);
    let jsum = 0.0;
    let bjp = 0.0;
    let bj = 1.0;

    for (let j = m; j > 0; j--) {
      const bjm = ((2 * j) / x) * bj - bjp;
      bjp = bj;
      bj = bjm;

      if (Math.abs(bj) > 1e10) {
        bj *= 1e-10;
        bjp *= 1e-10;
        jsum *= 1e-10;
      }

      if (j === n) jsum = bjp;
    }

    const sum = 2.0 * jsum - bj;
    return jsum / (sum / besselJ0(x));
  }
}

/**
 * Compute Bessel function of the second kind Y₀(x)
 * (Also called Neumann function)
 *
 * @param x - Input value (must be positive)
 * @returns Y₀(x)
 *
 * @example
 * ```ts
 * besselY0(1); // ≈ 0.0883
 * besselY0(2); // ≈ 0.5104
 * ```
 */
export function besselY0(x: number): number {
  if (x <= 0) throw new Error('x must be positive for Y0');

  if (x < 8.0) {
    const j0 = besselJ0(x);
    const y = x * x;

    const ans1 =
      -2957821389.0 +
      y *
        (7062834065.0 +
          y * (-512359803.6 + y * (10879881.29 + y * (-86327.92757 + y * 228.4622733))));
    const ans2 =
      40076544269.0 +
      y *
        (745249964.8 +
          y * (7189466.438 + y * (47447.26470 + y * (226.1030244 + y * 1.0))));

    return ans1 / ans2 + 0.636619772 * j0 * Math.log(x);
  } else {
    const z = 8.0 / x;
    const y = z * z;
    const xx = x - 0.785398164;

    const ans1 =
      1.0 +
      y *
        (-0.1098628627e-2 +
          y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)));
    const ans2 =
      -0.1562499995e-1 +
      y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)));

    return Math.sqrt(0.636619772 / x) * (Math.sin(xx) * ans1 + (z * Math.cos(xx) * ans2));
  }
}

/**
 * Compute Bessel function of the second kind Y₁(x)
 *
 * @param x - Input value (must be positive)
 * @returns Y₁(x)
 *
 * @example
 * ```ts
 * besselY1(1); // ≈ -0.7812
 * besselY1(2); // ≈ -0.1070
 * ```
 */
export function besselY1(x: number): number {
  if (x <= 0) throw new Error('x must be positive for Y1');

  if (x < 8.0) {
    const j1 = besselJ1(x);
    const y = x * x;

    const ans1 =
      x *
      (-0.4900604943e13 +
        y *
          (0.1275274390e13 +
            y * (-0.5153438139e11 + y * (0.7349264551e9 + y * (-0.4237922726e7 + y * 0.8511937935e4)))));
    const ans2 =
      0.2499580570e14 +
      y *
        (0.4244419664e12 +
          y * (0.3733650367e10 + y * (0.2245904002e8 + y * (0.1020426050e6 + y * (0.3549632885e3 + y)))));

    return ans1 / ans2 + 0.636619772 * (j1 * Math.log(x) - 1.0 / x);
  } else {
    const z = 8.0 / x;
    const y = z * z;
    const xx = x - 2.356194491;

    const ans1 =
      1.0 +
      y *
        (0.183105e-2 +
          y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)));
    const ans2 =
      0.04687499995 +
      y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));

    return Math.sqrt(0.636619772 / x) * (Math.sin(xx) * ans1 + (z * Math.cos(xx) * ans2));
  }
}

/**
 * Compute modified Bessel function of the first kind I₀(x)
 * Solution to: x²y'' + xy' - x²y = 0
 *
 * @param x - Input value
 * @returns I₀(x)
 *
 * @example
 * ```ts
 * besselI0(0); // 1
 * besselI0(1); // ≈ 1.2661
 * besselI0(2); // ≈ 2.2796
 * ```
 */
export function besselI0(x: number): number {
  const ax = Math.abs(x);

  if (ax < 3.75) {
    const y = (x / 3.75) * (x / 3.75);
    return (
      1.0 +
      y *
        (3.5156229 +
          y * (3.0899424 + y * (1.2067492 + y * (0.2659732 + y * (0.0360768 + y * 0.0045813)))))
    );
  } else {
    const y = 3.75 / ax;
    return (
      (Math.exp(ax) / Math.sqrt(ax)) *
      (0.39894228 +
        y *
          (0.01328592 +
            y *
              (0.00225319 +
                y *
                  (-0.00157565 +
                    y * (0.00916281 + y * (-0.02057706 + y * (0.02635537 + y * (-0.01647633 + y * 0.00392377))))))))
    );
  }
}

/**
 * Compute modified Bessel function of the first kind I₁(x)
 *
 * @param x - Input value
 * @returns I₁(x)
 *
 * @example
 * ```ts
 * besselI1(0); // 0
 * besselI1(1); // ≈ 0.5652
 * besselI1(2); // ≈ 1.5906
 * ```
 */
export function besselI1(x: number): number {
  const ax = Math.abs(x);

  if (ax < 3.75) {
    const y = (x / 3.75) * (x / 3.75);
    return (
      ax *
      (0.5 +
        y *
          (0.87890594 +
            y * (0.51498869 + y * (0.15084934 + y * (0.02658733 + y * (0.00301532 + y * 0.00032411))))))
    );
  } else {
    const y = 3.75 / ax;
    const ans =
      0.39894228 +
      y *
        (-0.03988024 +
          y *
            (-0.00362018 +
              y *
                (0.00163801 +
                  y * (-0.01031555 + y * (0.02282967 + y * (-0.02895312 + y * (0.01787654 + y * -0.00420059)))))));

    return (Math.exp(ax) / Math.sqrt(ax)) * ans * (x < 0 ? -1 : 1);
  }
}

/**
 * Compute modified Bessel function of the second kind K₀(x)
 *
 * @param x - Input value (must be positive)
 * @returns K₀(x)
 *
 * @example
 * ```ts
 * besselK0(1); // ≈ 0.4210
 * besselK0(2); // ≈ 0.1139
 * ```
 */
export function besselK0(x: number): number {
  if (x <= 0) throw new Error('x must be positive for K0');

  if (x <= 2.0) {
    const y = x * x / 4.0;
    return (
      -Math.log(x / 2.0) * besselI0(x) +
      (-0.57721566 +
        y *
          (0.42278420 +
            y * (0.23069756 + y * (0.03488590 + y * (0.00262698 + y * (0.00010750 + y * 0.00000740))))))
    );
  } else {
    const y = 2.0 / x;
    return (
      (Math.exp(-x) / Math.sqrt(x)) *
      (1.25331414 +
        y *
          (-0.07832358 +
            y *
              (0.02189568 +
                y * (-0.01062446 + y * (0.00587872 + y * (-0.00251540 + y * 0.00053208))))))
    );
  }
}

/**
 * Compute modified Bessel function of the second kind K₁(x)
 *
 * @param x - Input value (must be positive)
 * @returns K₁(x)
 *
 * @example
 * ```ts
 * besselK1(1); // ≈ 0.6019
 * besselK1(2); // ≈ 0.1399
 * ```
 */
export function besselK1(x: number): number {
  if (x <= 0) throw new Error('x must be positive for K1');

  if (x <= 2.0) {
    const y = x * x / 4.0;
    return (
      Math.log(x / 2.0) * besselI1(x) +
      (1.0 / x) *
        (1.0 +
          y *
            (0.15443144 +
              y *
                (-0.67278579 +
                  y * (-0.18156897 + y * (-0.01919402 + y * (-0.00110404 + y * -0.00004686))))))
    );
  } else {
    const y = 2.0 / x;
    return (
      (Math.exp(-x) / Math.sqrt(x)) *
      (1.25331414 +
        y *
          (0.23498619 +
            y *
              (-0.03655620 +
                y * (0.01504268 + y * (-0.00780353 + y * (0.00325614 + y * -0.00068245))))))
    );
  }
}

/**
 * Compute spherical Bessel function of the first kind jₙ(x)
 * jₙ(x) = √(π/(2x)) × Jₙ₊₁/₂(x)
 *
 * @param n - Order (non-negative integer)
 * @param x - Input value
 * @returns jₙ(x)
 *
 * @example
 * ```ts
 * sphericalBesselJ(0, 1); // sin(1) ≈ 0.8415
 * sphericalBesselJ(1, 1); // (sin(1) - cos(1))/1 ≈ 0.3012
 * ```
 */
export function sphericalBesselJ(n: number, x: number): number {
  if (n < 0) throw new Error('Order n must be non-negative');
  if (x === 0) return n === 0 ? 1 : 0;

  n = Math.floor(n);

  // Use explicit formulas for small n
  if (n === 0) return Math.sin(x) / x;
  if (n === 1) return Math.sin(x) / (x * x) - Math.cos(x) / x;

  // Use recurrence relation
  let jnm2 = Math.sin(x) / x;
  let jnm1 = Math.sin(x) / (x * x) - Math.cos(x) / x;

  for (let i = 2; i <= n; i++) {
    const jn = ((2 * i - 1) / x) * jnm1 - jnm2;
    jnm2 = jnm1;
    jnm1 = jn;
  }

  return jnm1;
}

/**
 * Compute spherical Bessel function of the second kind yₙ(x)
 * yₙ(x) = √(π/(2x)) × Yₙ₊₁/₂(x)
 *
 * @param n - Order (non-negative integer)
 * @param x - Input value (must be positive)
 * @returns yₙ(x)
 */
export function sphericalBesselY(n: number, x: number): number {
  if (n < 0) throw new Error('Order n must be non-negative');
  if (x <= 0) throw new Error('x must be positive');

  n = Math.floor(n);

  // Use explicit formulas for small n
  if (n === 0) return -Math.cos(x) / x;
  if (n === 1) return -Math.cos(x) / (x * x) - Math.sin(x) / x;

  // Use recurrence relation
  let ynm2 = -Math.cos(x) / x;
  let ynm1 = -Math.cos(x) / (x * x) - Math.sin(x) / x;

  for (let i = 2; i <= n; i++) {
    const yn = ((2 * i - 1) / x) * ynm1 - ynm2;
    ynm2 = ynm1;
    ynm1 = yn;
  }

  return ynm1;
}
