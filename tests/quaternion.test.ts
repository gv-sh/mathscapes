import { Quaternion } from '../src/core/quaternion';

describe('Quaternion', () => {
    describe('Constructor', () => {
        test('should create a quaternion', () => {
            const q = new Quaternion(1, 2, 3, 4);
            expect(q.w).toBe(1);
            expect(q.x).toBe(2);
            expect(q.y).toBe(3);
            expect(q.z).toBe(4);
        });
    });

    describe('Static Factory Methods', () => {
        test('should create identity quaternion', () => {
            const q = Quaternion.identity();
            expect(q.w).toBe(1);
            expect(q.x).toBe(0);
            expect(q.y).toBe(0);
            expect(q.z).toBe(0);
        });

        test('should create from axis-angle (array)', () => {
            const q = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            expect(q.w).toBeCloseTo(Math.cos(Math.PI / 4), 10);
            expect(q.x).toBeCloseTo(0, 10);
            expect(q.y).toBeCloseTo(0, 10);
            expect(q.z).toBeCloseTo(Math.sin(Math.PI / 4), 10);
        });

        test('should create from axis-angle (object)', () => {
            const q = Quaternion.fromAxisAngle({ x: 0, y: 0, z: 1 }, Math.PI / 2);
            expect(q.w).toBeCloseTo(Math.cos(Math.PI / 4), 10);
            expect(q.z).toBeCloseTo(Math.sin(Math.PI / 4), 10);
        });

        test('should normalize axis in fromAxisAngle', () => {
            const q = Quaternion.fromAxisAngle([0, 0, 2], Math.PI / 2);
            expect(q.norm()).toBeCloseTo(1, 10);
        });

        test('should handle zero axis in fromAxisAngle', () => {
            const q = Quaternion.fromAxisAngle([0, 0, 0], Math.PI / 2);
            expect(q.equals(Quaternion.identity())).toBe(true);
        });

        test('should create from Euler angles', () => {
            const q = Quaternion.fromEuler(0, 0, 0);
            expect(q.equals(Quaternion.identity())).toBe(true);
        });

        test('should create from rotation matrix', () => {
            const matrix = [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ];
            const q = Quaternion.fromRotationMatrix(matrix);
            expect(q.w).toBeCloseTo(1, 10);
        });

        test('should create from array', () => {
            const q = Quaternion.fromArray([1, 2, 3, 4]);
            expect(q.w).toBe(1);
            expect(q.x).toBe(2);
            expect(q.y).toBe(3);
            expect(q.z).toBe(4);
        });
    });

    describe('Arithmetic Operations', () => {
        test('should add quaternions', () => {
            const q1 = new Quaternion(1, 2, 3, 4);
            const q2 = new Quaternion(5, 6, 7, 8);
            const sum = q1.add(q2);
            expect(sum.w).toBe(6);
            expect(sum.x).toBe(8);
            expect(sum.y).toBe(10);
            expect(sum.z).toBe(12);
        });

        test('should subtract quaternions', () => {
            const q1 = new Quaternion(5, 6, 7, 8);
            const q2 = new Quaternion(1, 2, 3, 4);
            const diff = q1.subtract(q2);
            expect(diff.w).toBe(4);
            expect(diff.x).toBe(4);
            expect(diff.y).toBe(4);
            expect(diff.z).toBe(4);
        });

        test('should multiply quaternions', () => {
            const q1 = new Quaternion(1, 0, 0, 0);
            const q2 = new Quaternion(0, 1, 0, 0);
            const product = q1.multiply(q2);
            expect(product.w).toBe(0);
            expect(product.x).toBe(1);
            expect(product.y).toBe(0);
            expect(product.z).toBe(0);
        });

        test('should verify quaternion multiplication is non-commutative', () => {
            const q1 = new Quaternion(1, 2, 3, 4);
            const q2 = new Quaternion(5, 6, 7, 8);
            const p1 = q1.multiply(q2);
            const p2 = q2.multiply(q1);
            expect(p1.equals(p2)).toBe(false);
        });

        test('should scale quaternion', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const scaled = q.scale(2);
            expect(scaled.w).toBe(2);
            expect(scaled.x).toBe(4);
            expect(scaled.y).toBe(6);
            expect(scaled.z).toBe(8);
        });
    });

    describe('Unary Operations', () => {
        test('should compute conjugate', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const conj = q.conjugate();
            expect(conj.w).toBe(1);
            expect(conj.x).toBe(-2);
            expect(conj.y).toBe(-3);
            expect(conj.z).toBe(-4);
        });

        test('should negate quaternion', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const neg = q.negate();
            expect(neg.w).toBe(-1);
            expect(neg.x).toBe(-2);
            expect(neg.y).toBe(-3);
            expect(neg.z).toBe(-4);
        });

        test('should compute norm', () => {
            const q = new Quaternion(1, 0, 0, 0);
            expect(q.norm()).toBe(1);
        });

        test('should compute norm of general quaternion', () => {
            const q = new Quaternion(2, 3, 6, 0);
            expect(q.norm()).toBe(7);
        });

        test('should compute squared norm', () => {
            const q = new Quaternion(2, 3, 6, 0);
            expect(q.normSquared()).toBe(49);
        });

        test('should normalize quaternion', () => {
            const q = new Quaternion(2, 0, 0, 0);
            const normalized = q.normalize();
            expect(normalized.norm()).toBeCloseTo(1, 10);
            expect(normalized.w).toBeCloseTo(1, 10);
        });

        test('should handle normalization of zero quaternion', () => {
            const q = new Quaternion(0, 0, 0, 0);
            const normalized = q.normalize();
            expect(normalized.equals(Quaternion.identity())).toBe(true);
        });

        test('should compute inverse', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const inv = q.inverse();
            const product = q.multiply(inv);
            expect(product.w).toBeCloseTo(1, 10);
            expect(product.x).toBeCloseTo(0, 10);
            expect(product.y).toBeCloseTo(0, 10);
            expect(product.z).toBeCloseTo(0, 10);
        });

        test('should throw error for inverse of zero quaternion', () => {
            const q = new Quaternion(0, 0, 0, 0);
            expect(() => q.inverse()).toThrow('Cannot invert zero quaternion');
        });

        test('should verify inverse equals conjugate for unit quaternions', () => {
            const q = new Quaternion(1, 2, 3, 4).normalize();
            const inv = q.inverse();
            const conj = q.conjugate();
            expect(inv.equals(conj, 1e-9)).toBe(true);
        });
    });

    describe('Dot Product', () => {
        test('should compute dot product', () => {
            const q1 = new Quaternion(1, 2, 3, 4);
            const q2 = new Quaternion(5, 6, 7, 8);
            const dot = q1.dot(q2);
            expect(dot).toBe(70); // 1*5 + 2*6 + 3*7 + 4*8
        });

        test('should verify dot product of orthogonal quaternions', () => {
            const q1 = new Quaternion(1, 0, 0, 0);
            const q2 = new Quaternion(0, 1, 0, 0);
            expect(q1.dot(q2)).toBe(0);
        });
    });

    describe('Vector Rotation', () => {
        test('should rotate vector (array)', () => {
            const q = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            const v = [1, 0, 0];
            const rotated = q.rotateVector(v);
            expect(rotated[0]).toBeCloseTo(0, 10);
            expect(rotated[1]).toBeCloseTo(1, 10);
            expect(rotated[2]).toBeCloseTo(0, 10);
        });

        test('should rotate vector (object)', () => {
            const q = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            const v = { x: 1, y: 0, z: 0 };
            const rotated = q.rotateVector(v);
            expect(rotated[0]).toBeCloseTo(0, 10);
            expect(rotated[1]).toBeCloseTo(1, 10);
            expect(rotated[2]).toBeCloseTo(0, 10);
        });

        test('should preserve vector length', () => {
            const q = Quaternion.fromAxisAngle([1, 1, 1], Math.PI / 3);
            const v = [3, 4, 5];
            const rotated = q.rotateVector(v);
            const originalLength = Math.sqrt(3 * 3 + 4 * 4 + 5 * 5);
            const rotatedLength = Math.sqrt(rotated[0] ** 2 + rotated[1] ** 2 + rotated[2] ** 2);
            expect(rotatedLength).toBeCloseTo(originalLength, 10);
        });

        test('should handle 180 degree rotation', () => {
            const q = Quaternion.fromAxisAngle([0, 0, 1], Math.PI);
            const v = [1, 0, 0];
            const rotated = q.rotateVector(v);
            expect(rotated[0]).toBeCloseTo(-1, 10);
            expect(rotated[1]).toBeCloseTo(0, 10);
            expect(rotated[2]).toBeCloseTo(0, 10);
        });
    });

    describe('Conversions', () => {
        test('should convert to rotation matrix', () => {
            const q = Quaternion.identity();
            const matrix = q.toRotationMatrix();
            expect(matrix).toEqual([
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ]);
        });

        test('should round-trip rotation matrix conversion', () => {
            const original = Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 4);
            const matrix = original.toRotationMatrix();
            const converted = Quaternion.fromRotationMatrix(matrix);
            // Quaternions q and -q represent the same rotation
            expect(
                original.equals(converted, 1e-9) || original.equals(converted.negate(), 1e-9)
            ).toBe(true);
        });

        test('should convert to axis-angle', () => {
            const original = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            const { axis, angle } = original.toAxisAngle();
            expect(axis[0]).toBeCloseTo(0, 10);
            expect(axis[1]).toBeCloseTo(0, 10);
            expect(axis[2]).toBeCloseTo(1, 10);
            expect(angle).toBeCloseTo(Math.PI / 2, 10);
        });

        test('should handle identity in toAxisAngle', () => {
            const q = Quaternion.identity();
            const { axis, angle } = q.toAxisAngle();
            expect(angle).toBeCloseTo(0, 10);
        });

        test('should convert to Euler angles', () => {
            const q = Quaternion.identity();
            const euler = q.toEuler();
            expect(euler.yaw).toBeCloseTo(0, 10);
            expect(euler.pitch).toBeCloseTo(0, 10);
            expect(euler.roll).toBeCloseTo(0, 10);
        });

        test('should round-trip Euler conversion', () => {
            const yaw = 0.5, pitch = 0.3, roll = 0.7;
            const q = Quaternion.fromEuler(yaw, pitch, roll);
            const euler = q.toEuler();
            expect(euler.yaw).toBeCloseTo(yaw, 10);
            expect(euler.pitch).toBeCloseTo(pitch, 10);
            expect(euler.roll).toBeCloseTo(roll, 10);
        });

        test('should convert to array', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const arr = q.toArray();
            expect(arr).toEqual([1, 2, 3, 4]);
        });
    });

    describe('SLERP (Spherical Linear Interpolation)', () => {
        test('should interpolate at t=0', () => {
            const q1 = Quaternion.fromAxisAngle([0, 0, 1], 0);
            const q2 = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            const result = q1.slerp(q2, 0);
            expect(result.equals(q1, 1e-9)).toBe(true);
        });

        test('should interpolate at t=1', () => {
            const q1 = Quaternion.fromAxisAngle([0, 0, 1], 0);
            const q2 = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            const result = q1.slerp(q2, 1);
            expect(result.equals(q2, 1e-9)).toBe(true);
        });

        test('should interpolate at t=0.5', () => {
            const q1 = Quaternion.fromAxisAngle([0, 0, 1], 0);
            const q2 = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            const result = q1.slerp(q2, 0.5);
            const expected = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 4);
            expect(result.equals(expected, 1e-9)).toBe(true);
        });

        test('should produce unit quaternions', () => {
            const q1 = Quaternion.fromAxisAngle([1, 0, 0], 0.5);
            const q2 = Quaternion.fromAxisAngle([0, 1, 0], 1.2);
            const result = q1.slerp(q2, 0.3);
            expect(result.norm()).toBeCloseTo(1, 10);
        });

        test('should handle very close quaternions', () => {
            const q1 = Quaternion.fromAxisAngle([0, 0, 1], 0);
            const q2 = Quaternion.fromAxisAngle([0, 0, 1], 0.0001);
            const result = q1.slerp(q2, 0.5);
            expect(result.norm()).toBeCloseTo(1, 10);
        });
    });

    describe('NLERP (Normalized Linear Interpolation)', () => {
        test('should interpolate at t=0', () => {
            const q1 = Quaternion.fromAxisAngle([0, 0, 1], 0);
            const q2 = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            const result = q1.nlerp(q2, 0);
            expect(result.equals(q1, 1e-9)).toBe(true);
        });

        test('should interpolate at t=1', () => {
            const q1 = Quaternion.fromAxisAngle([0, 0, 1], 0);
            const q2 = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
            const result = q1.nlerp(q2, 1);
            expect(result.equals(q2, 1e-9)).toBe(true);
        });

        test('should produce unit quaternions', () => {
            const q1 = Quaternion.fromAxisAngle([1, 0, 0], 0.5);
            const q2 = Quaternion.fromAxisAngle([0, 1, 0], 1.2);
            const result = q1.nlerp(q2, 0.3);
            expect(result.norm()).toBeCloseTo(1, 10);
        });
    });

    describe('Comparison', () => {
        test('should check equality', () => {
            const q1 = new Quaternion(1, 2, 3, 4);
            const q2 = new Quaternion(1, 2, 3, 4);
            expect(q1.equals(q2)).toBe(true);
        });

        test('should check inequality', () => {
            const q1 = new Quaternion(1, 2, 3, 4);
            const q2 = new Quaternion(4, 3, 2, 1);
            expect(q1.equals(q2)).toBe(false);
        });

        test('should handle tolerance in equality', () => {
            const q1 = new Quaternion(1, 2, 3, 4);
            const q2 = new Quaternion(1.0000001, 2, 3, 4);
            expect(q1.equals(q2, 1e-6)).toBe(true);
        });
    });

    describe('String Representation', () => {
        test('should convert to string', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const str = q.toString();
            expect(str).toContain('1');
            expect(str).toContain('2');
            expect(str).toContain('3');
            expect(str).toContain('4');
        });
    });

    describe('clone', () => {
        test('should create a copy', () => {
            const q1 = new Quaternion(1, 2, 3, 4);
            const q2 = q1.clone();
            expect(q1.equals(q2)).toBe(true);
            expect(q1).not.toBe(q2);
        });
    });

    describe('Quaternion Identities', () => {
        test('should verify q * q^-1 = 1', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const result = q.multiply(q.inverse());
            expect(result.w).toBeCloseTo(1, 10);
            expect(result.x).toBeCloseTo(0, 10);
            expect(result.y).toBeCloseTo(0, 10);
            expect(result.z).toBeCloseTo(0, 10);
        });

        test('should verify ||q|| = ||conjugate(q)||', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const conj = q.conjugate();
            expect(q.norm()).toBeCloseTo(conj.norm(), 10);
        });

        test('should verify q * conjugate(q) = ||q||^2', () => {
            const q = new Quaternion(1, 2, 3, 4);
            const result = q.multiply(q.conjugate());
            expect(result.w).toBeCloseTo(q.normSquared(), 10);
            expect(result.x).toBeCloseTo(0, 10);
            expect(result.y).toBeCloseTo(0, 10);
            expect(result.z).toBeCloseTo(0, 10);
        });
    });
});
