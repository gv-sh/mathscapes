/**
 * Quaternion Class
 *
 * Represents quaternions for 3D rotations and orientation.
 * Quaternions are an extension of complex numbers with four components: w + xi + yj + zk
 * where i² = j² = k² = ijk = -1
 *
 * @example
 * const q1 = new Quaternion(1, 0, 0, 0); // Identity quaternion
 * const q2 = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2); // 90° rotation around z-axis
 * const q3 = q1.multiply(q2);
 */

/**
 * Represents a quaternion with w, x, y, z components.
 */
export class Quaternion {
    private _w: number;
    private _x: number;
    private _y: number;
    private _z: number;

    /**
     * Creates a new Quaternion.
     *
     * @param {number} w - The scalar (real) part
     * @param {number} x - The i component
     * @param {number} y - The j component
     * @param {number} z - The k component
     */
    constructor(w: number, x: number, y: number, z: number) {
        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;
    }

    /**
     * Gets the w (scalar) component.
     *
     * @returns {number} The w component
     */
    get w(): number {
        return this._w;
    }

    /**
     * Gets the x (i) component.
     *
     * @returns {number} The x component
     */
    get x(): number {
        return this._x;
    }

    /**
     * Gets the y (j) component.
     *
     * @returns {number} The y component
     */
    get y(): number {
        return this._y;
    }

    /**
     * Gets the z (k) component.
     *
     * @returns {number} The z component
     */
    get z(): number {
        return this._z;
    }

    /**
     * Creates an identity quaternion (1, 0, 0, 0).
     *
     * @returns {Quaternion} The identity quaternion
     */
    static identity(): Quaternion {
        return new Quaternion(1, 0, 0, 0);
    }

    /**
     * Creates a quaternion from an axis and angle.
     * This represents a rotation of `angle` radians around the `axis` vector.
     *
     * @param {number[] | {x: number, y: number, z: number}} axis - The rotation axis (will be normalized)
     * @param {number} angle - The rotation angle in radians
     * @returns {Quaternion} The quaternion representing this rotation
     */
    static fromAxisAngle(axis: number[] | { x: number; y: number; z: number }, angle: number): Quaternion {
        let x: number, y: number, z: number;

        if (Array.isArray(axis)) {
            [x, y, z] = axis;
        } else {
            ({ x, y, z } = axis);
        }

        // Normalize the axis
        const length = Math.sqrt(x * x + y * y + z * z);
        if (length < 1e-10) {
            return Quaternion.identity();
        }

        x /= length;
        y /= length;
        z /= length;

        const halfAngle = angle / 2;
        const sinHalf = Math.sin(halfAngle);

        return new Quaternion(
            Math.cos(halfAngle),
            x * sinHalf,
            y * sinHalf,
            z * sinHalf
        );
    }

    /**
     * Creates a quaternion from Euler angles (in radians).
     * Uses ZYX rotation order (yaw-pitch-roll).
     *
     * @param {number} yaw - Rotation around z-axis (radians)
     * @param {number} pitch - Rotation around y-axis (radians)
     * @param {number} roll - Rotation around x-axis (radians)
     * @returns {Quaternion} The quaternion representing this rotation
     */
    static fromEuler(yaw: number, pitch: number, roll: number): Quaternion {
        const cy = Math.cos(yaw / 2);
        const sy = Math.sin(yaw / 2);
        const cp = Math.cos(pitch / 2);
        const sp = Math.sin(pitch / 2);
        const cr = Math.cos(roll / 2);
        const sr = Math.sin(roll / 2);

        return new Quaternion(
            cr * cp * cy + sr * sp * sy,
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy
        );
    }

    /**
     * Creates a quaternion from a rotation matrix.
     *
     * @param {number[][]} matrix - A 3x3 or 4x4 rotation matrix
     * @returns {Quaternion} The quaternion representing this rotation
     */
    static fromRotationMatrix(matrix: number[][]): Quaternion {
        const m = matrix;
        const trace = m[0][0] + m[1][1] + m[2][2];

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            return new Quaternion(
                0.25 / s,
                (m[2][1] - m[1][2]) * s,
                (m[0][2] - m[2][0]) * s,
                (m[1][0] - m[0][1]) * s
            );
        } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
            const s = 2.0 * Math.sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]);
            return new Quaternion(
                (m[2][1] - m[1][2]) / s,
                0.25 * s,
                (m[0][1] + m[1][0]) / s,
                (m[0][2] + m[2][0]) / s
            );
        } else if (m[1][1] > m[2][2]) {
            const s = 2.0 * Math.sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]);
            return new Quaternion(
                (m[0][2] - m[2][0]) / s,
                (m[0][1] + m[1][0]) / s,
                0.25 * s,
                (m[1][2] + m[2][1]) / s
            );
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]);
            return new Quaternion(
                (m[1][0] - m[0][1]) / s,
                (m[0][2] + m[2][0]) / s,
                (m[1][2] + m[2][1]) / s,
                0.25 * s
            );
        }
    }

    /**
     * Adds another quaternion to this one (component-wise).
     *
     * @param {Quaternion} other - The quaternion to add
     * @returns {Quaternion} The sum
     */
    add(other: Quaternion): Quaternion {
        return new Quaternion(
            this._w + other._w,
            this._x + other._x,
            this._y + other._y,
            this._z + other._z
        );
    }

    /**
     * Subtracts another quaternion from this one (component-wise).
     *
     * @param {Quaternion} other - The quaternion to subtract
     * @returns {Quaternion} The difference
     */
    subtract(other: Quaternion): Quaternion {
        return new Quaternion(
            this._w - other._w,
            this._x - other._x,
            this._y - other._y,
            this._z - other._z
        );
    }

    /**
     * Multiplies this quaternion by another (Hamilton product).
     * Note: Quaternion multiplication is non-commutative (q1 * q2 ≠ q2 * q1)
     *
     * @param {Quaternion} other - The quaternion to multiply by
     * @returns {Quaternion} The product
     */
    multiply(other: Quaternion): Quaternion {
        return new Quaternion(
            this._w * other._w - this._x * other._x - this._y * other._y - this._z * other._z,
            this._w * other._x + this._x * other._w + this._y * other._z - this._z * other._y,
            this._w * other._y - this._x * other._z + this._y * other._w + this._z * other._x,
            this._w * other._z + this._x * other._y - this._y * other._x + this._z * other._w
        );
    }

    /**
     * Scales this quaternion by a scalar (component-wise).
     *
     * @param {number} scalar - The scalar to multiply by
     * @returns {Quaternion} The scaled quaternion
     */
    scale(scalar: number): Quaternion {
        return new Quaternion(
            this._w * scalar,
            this._x * scalar,
            this._y * scalar,
            this._z * scalar
        );
    }

    /**
     * Returns the conjugate of this quaternion.
     * The conjugate of (w, x, y, z) is (w, -x, -y, -z)
     *
     * @returns {Quaternion} The conjugate
     */
    conjugate(): Quaternion {
        return new Quaternion(this._w, -this._x, -this._y, -this._z);
    }

    /**
     * Returns the negation of this quaternion.
     *
     * @returns {Quaternion} The negation
     */
    negate(): Quaternion {
        return new Quaternion(-this._w, -this._x, -this._y, -this._z);
    }

    /**
     * Computes the norm (magnitude) of this quaternion.
     * ||q|| = sqrt(w² + x² + y² + z²)
     *
     * @returns {number} The norm
     */
    norm(): number {
        return Math.sqrt(this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z);
    }

    /**
     * Computes the squared norm of this quaternion.
     * ||q||² = w² + x² + y² + z²
     *
     * @returns {number} The squared norm
     */
    normSquared(): number {
        return this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z;
    }

    /**
     * Returns a normalized (unit) quaternion.
     * A unit quaternion has norm = 1 and represents a valid rotation.
     *
     * @returns {Quaternion} The normalized quaternion
     */
    normalize(): Quaternion {
        const n = this.norm();
        if (n < 1e-10) {
            return Quaternion.identity();
        }
        return this.scale(1 / n);
    }

    /**
     * Returns the inverse of this quaternion.
     * For unit quaternions, inverse equals conjugate.
     *
     * @returns {Quaternion} The inverse
     * @throws {Error} If the quaternion is zero
     */
    inverse(): Quaternion {
        const normSq = this.normSquared();
        if (normSq < 1e-10) {
            throw new Error("Cannot invert zero quaternion");
        }
        return this.conjugate().scale(1 / normSq);
    }

    /**
     * Computes the dot product of this quaternion with another.
     *
     * @param {Quaternion} other - The other quaternion
     * @returns {number} The dot product
     */
    dot(other: Quaternion): number {
        return this._w * other._w + this._x * other._x + this._y * other._y + this._z * other._z;
    }

    /**
     * Rotates a 3D vector by this quaternion.
     * The quaternion should be normalized for correct results.
     *
     * @param {number[] | {x: number, y: number, z: number}} vector - The vector to rotate
     * @returns {number[]} The rotated vector as [x, y, z]
     */
    rotateVector(vector: number[] | { x: number; y: number; z: number }): number[] {
        let vx: number, vy: number, vz: number;

        if (Array.isArray(vector)) {
            [vx, vy, vz] = vector;
        } else {
            ({ x: vx, y: vy, z: vz } = vector);
        }

        // v' = q * v * q^-1
        // Optimized formula:
        const qw = this._w, qx = this._x, qy = this._y, qz = this._z;

        const ix = qw * vx + qy * vz - qz * vy;
        const iy = qw * vy + qz * vx - qx * vz;
        const iz = qw * vz + qx * vy - qy * vx;
        const iw = -qx * vx - qy * vy - qz * vz;

        return [
            ix * qw + iw * -qx + iy * -qz - iz * -qy,
            iy * qw + iw * -qy + iz * -qx - ix * -qz,
            iz * qw + iw * -qz + ix * -qy - iy * -qx
        ];
    }

    /**
     * Converts this quaternion to a rotation matrix (3x3).
     *
     * @returns {number[][]} A 3x3 rotation matrix
     */
    toRotationMatrix(): number[][] {
        const w = this._w, x = this._x, y = this._y, z = this._z;
        const w2 = w * w, x2 = x * x, y2 = y * y, z2 = z * z;

        return [
            [
                w2 + x2 - y2 - z2,
                2 * (x * y - w * z),
                2 * (x * z + w * y)
            ],
            [
                2 * (x * y + w * z),
                w2 - x2 + y2 - z2,
                2 * (y * z - w * x)
            ],
            [
                2 * (x * z - w * y),
                2 * (y * z + w * x),
                w2 - x2 - y2 + z2
            ]
        ];
    }

    /**
     * Converts this quaternion to axis-angle representation.
     *
     * @returns {{axis: number[], angle: number}} The axis as [x, y, z] and angle in radians
     */
    toAxisAngle(): { axis: number[]; angle: number } {
        const q = this.normalize();
        const angle = 2 * Math.acos(Math.max(-1, Math.min(1, q._w)));

        if (angle < 1e-10) {
            return { axis: [0, 0, 1], angle: 0 };
        }

        const sinHalf = Math.sin(angle / 2);
        const axis = [
            q._x / sinHalf,
            q._y / sinHalf,
            q._z / sinHalf
        ];

        return { axis, angle };
    }

    /**
     * Converts this quaternion to Euler angles (in radians).
     * Returns angles in ZYX order (yaw, pitch, roll).
     *
     * @returns {{yaw: number, pitch: number, roll: number}} The Euler angles in radians
     */
    toEuler(): { yaw: number; pitch: number; roll: number } {
        const w = this._w, x = this._x, y = this._y, z = this._z;

        // Roll (x-axis rotation)
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        const roll = Math.atan2(sinr_cosp, cosr_cosp);

        // Pitch (y-axis rotation)
        const sinp = 2 * (w * y - z * x);
        let pitch: number;
        if (Math.abs(sinp) >= 1) {
            pitch = Math.sign(sinp) * Math.PI / 2; // Use 90 degrees if out of range
        } else {
            pitch = Math.asin(sinp);
        }

        // Yaw (z-axis rotation)
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        const yaw = Math.atan2(siny_cosp, cosy_cosp);

        return { yaw, pitch, roll };
    }

    /**
     * Performs spherical linear interpolation (SLERP) between this quaternion and another.
     * This produces smooth rotations for animation.
     *
     * @param {Quaternion} other - The target quaternion
     * @param {number} t - Interpolation parameter in [0, 1]
     * @returns {Quaternion} The interpolated quaternion
     */
    slerp(other: Quaternion, t: number): Quaternion {
        // Normalize both quaternions
        const q1 = this.normalize();
        let q2 = other.normalize();

        // Compute dot product
        let dot = q1.dot(q2);

        // If the dot product is negative, slerp won't take the shorter path
        // So negate one quaternion
        if (dot < 0) {
            q2 = q2.negate();
            dot = -dot;
        }

        // Clamp dot product
        dot = Math.max(-1, Math.min(1, dot));

        // If quaternions are very close, use linear interpolation
        if (dot > 0.9995) {
            return new Quaternion(
                q1._w + t * (q2._w - q1._w),
                q1._x + t * (q2._x - q1._x),
                q1._y + t * (q2._y - q1._y),
                q1._z + t * (q2._z - q1._z)
            ).normalize();
        }

        // Calculate coefficients
        const theta = Math.acos(dot);
        const sinTheta = Math.sin(theta);
        const w1 = Math.sin((1 - t) * theta) / sinTheta;
        const w2 = Math.sin(t * theta) / sinTheta;

        return new Quaternion(
            q1._w * w1 + q2._w * w2,
            q1._x * w1 + q2._x * w2,
            q1._y * w1 + q2._y * w2,
            q1._z * w1 + q2._z * w2
        );
    }

    /**
     * Performs normalized linear interpolation (NLERP) between this quaternion and another.
     * Faster than SLERP but not constant angular velocity.
     *
     * @param {Quaternion} other - The target quaternion
     * @param {number} t - Interpolation parameter in [0, 1]
     * @returns {Quaternion} The interpolated quaternion
     */
    nlerp(other: Quaternion, t: number): Quaternion {
        let q2 = other;

        // Ensure we take the shorter path
        if (this.dot(other) < 0) {
            q2 = other.negate();
        }

        return new Quaternion(
            this._w + t * (q2._w - this._w),
            this._x + t * (q2._x - this._x),
            this._y + t * (q2._y - this._y),
            this._z + t * (q2._z - this._z)
        ).normalize();
    }

    /**
     * Checks if this quaternion equals another within a tolerance.
     *
     * @param {Quaternion} other - The quaternion to compare with
     * @param {number} tolerance - The tolerance for comparison (default: 1e-10)
     * @returns {boolean} True if equal within tolerance
     */
    equals(other: Quaternion, tolerance: number = 1e-10): boolean {
        return Math.abs(this._w - other._w) < tolerance &&
               Math.abs(this._x - other._x) < tolerance &&
               Math.abs(this._y - other._y) < tolerance &&
               Math.abs(this._z - other._z) < tolerance;
    }

    /**
     * Returns a string representation of the quaternion.
     *
     * @returns {string} String in format "w+xi+yj+zk"
     */
    toString(): string {
        const formatComponent = (value: number, symbol: string): string => {
            if (Math.abs(value) < 1e-10) return '';
            const sign = value >= 0 ? '+' : '';
            return `${sign}${value}${symbol}`;
        };

        let result = this._w.toString();
        result += formatComponent(this._x, 'i');
        result += formatComponent(this._y, 'j');
        result += formatComponent(this._z, 'k');

        return result;
    }

    /**
     * Converts the quaternion to an array [w, x, y, z].
     *
     * @returns {[number, number, number, number]} Array containing quaternion components
     */
    toArray(): [number, number, number, number] {
        return [this._w, this._x, this._y, this._z];
    }

    /**
     * Creates a quaternion from an array [w, x, y, z].
     *
     * @param {[number, number, number, number]} arr - Array containing quaternion components
     * @returns {Quaternion} The quaternion
     */
    static fromArray(arr: [number, number, number, number]): Quaternion {
        return new Quaternion(arr[0], arr[1], arr[2], arr[3]);
    }

    /**
     * Creates a copy of this quaternion.
     *
     * @returns {Quaternion} A new Quaternion with the same value
     */
    clone(): Quaternion {
        return new Quaternion(this._w, this._x, this._y, this._z);
    }
}
