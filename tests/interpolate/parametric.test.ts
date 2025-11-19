import {
    arcLength2D,
    arcLength3D,
    parameterAtLength2D,
    parameterAtLength3D,
    pointAtDistance2D,
    pointAtDistance3D,
    curvature2D,
    signedCurvature2D,
    curvature3D,
    torsion3D,
    tangent2D,
    tangent3D,
    normal2D
} from '../../src/interpolate/parametric';

describe('Parametric Curves', () => {
    describe('arcLength2D', () => {
        it('should calculate arc length of a circle', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const length = arcLength2D(circle, 0, 2 * Math.PI);
            expect(length).toBeCloseTo(2 * Math.PI, 3);
        });

        it('should calculate arc length of a straight line', () => {
            const line = (t: number) => ({ x: t, y: t });
            const length = arcLength2D(line, 0, 1);
            expect(length).toBeCloseTo(Math.sqrt(2), 5);
        });

        it('should handle partial arc', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const length = arcLength2D(circle, 0, Math.PI);
            expect(length).toBeCloseTo(Math.PI, 3);
        });

        it('should return zero for zero length curve', () => {
            const point = (t: number) => ({ x: 0, y: 0 });
            const length = arcLength2D(point, 0, 1);
            expect(length).toBeCloseTo(0, 5);
        });
    });

    describe('arcLength3D', () => {
        it('should calculate arc length of a helix', () => {
            const helix = (t: number) => ({ x: Math.cos(t), y: Math.sin(t), z: t });
            const length = arcLength3D(helix, 0, 2 * Math.PI);
            // Arc length of helix: √(r² + p²) * θ where r=1, p=1/(2π)
            const expected = Math.sqrt(1 + 1) * 2 * Math.PI;
            expect(length).toBeCloseTo(expected, 2);
        });

        it('should calculate arc length of a straight line in 3D', () => {
            const line = (t: number) => ({ x: t, y: t, z: t });
            const length = arcLength3D(line, 0, 1);
            expect(length).toBeCloseTo(Math.sqrt(3), 5);
        });
    });

    describe('parameterAtLength2D', () => {
        it('should find parameter at half length of circle', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const t = parameterAtLength2D(circle, 0, 2 * Math.PI, Math.PI);
            expect(t).toBeCloseTo(Math.PI, 2);
        });

        it('should return start parameter for zero length', () => {
            const line = (t: number) => ({ x: t, y: 0 });
            const t = parameterAtLength2D(line, 0, 1, 0);
            expect(t).toBeCloseTo(0, 5);
        });

        it('should return end parameter for full length', () => {
            const line = (t: number) => ({ x: t, y: 0 });
            const fullLength = arcLength2D(line, 0, 1);
            const t = parameterAtLength2D(line, 0, 1, fullLength);
            expect(t).toBeCloseTo(1, 3);
        });
    });

    describe('pointAtDistance2D', () => {
        it('should get point at specified distance along circle', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const point = pointAtDistance2D(circle, 0, 2 * Math.PI, Math.PI);
            expect(point.x).toBeCloseTo(-1, 1);
            expect(point.y).toBeCloseTo(0, 1);
        });

        it('should get point at specified distance along line', () => {
            const line = (t: number) => ({ x: t, y: 0 });
            const point = pointAtDistance2D(line, 0, 10, 5);
            expect(point.x).toBeCloseTo(5, 2);
            expect(point.y).toBeCloseTo(0, 5);
        });
    });

    describe('curvature2D', () => {
        it('should calculate curvature of a circle', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const k = curvature2D(circle, 0);
            expect(k).toBeCloseTo(1, 3); // Unit circle has curvature 1
        });

        it('should calculate curvature of a larger circle', () => {
            const radius = 2;
            const circle = (t: number) => ({ x: radius * Math.cos(t), y: radius * Math.sin(t) });
            const k = curvature2D(circle, Math.PI / 4);
            expect(k).toBeCloseTo(1 / radius, 3);
        });

        it('should return zero curvature for straight line', () => {
            const line = (t: number) => ({ x: t, y: 2 * t + 1 });
            const k = curvature2D(line, 0.5);
            expect(k).toBeCloseTo(0, 3);
        });

        it('should calculate curvature of parabola', () => {
            const parabola = (t: number) => ({ x: t, y: t * t });
            const k = curvature2D(parabola, 0);
            // At vertex (0,0), curvature is 2 for y=x²
            expect(k).toBeCloseTo(2, 1);
        });
    });

    describe('signedCurvature2D', () => {
        it('should return positive curvature for counter-clockwise circle', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const k = signedCurvature2D(circle, 0);
            expect(k).toBeCloseTo(1, 3);
        });

        it('should return negative curvature for clockwise circle', () => {
            const circle = (t: number) => ({ x: Math.cos(-t), y: Math.sin(-t) });
            const k = signedCurvature2D(circle, 0);
            expect(k).toBeCloseTo(-1, 3);
        });
    });

    describe('curvature3D', () => {
        it('should calculate curvature of a 3D circle', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t), z: 0 });
            const k = curvature3D(circle, Math.PI / 4);
            expect(k).toBeCloseTo(1, 3);
        });

        it('should calculate curvature of a helix', () => {
            const a = 1; // radius
            const b = 0.5; // pitch
            const helix = (t: number) => ({ x: a * Math.cos(t), y: a * Math.sin(t), z: b * t });
            const k = curvature3D(helix, Math.PI / 4);
            // Curvature of helix: a/(a² + b²)
            const expected = a / (a * a + b * b);
            expect(k).toBeCloseTo(expected, 3);
        });

        it('should return zero curvature for straight line in 3D', () => {
            const line = (t: number) => ({ x: t, y: 2 * t, z: 3 * t });
            const k = curvature3D(line, 0.5);
            expect(k).toBeCloseTo(0, 3);
        });
    });

    describe('torsion3D', () => {
        it('should calculate torsion of a helix', () => {
            const a = 1; // radius
            const b = 0.5; // pitch
            const helix = (t: number) => ({ x: a * Math.cos(t), y: a * Math.sin(t), z: b * t });
            const tau = torsion3D(helix, Math.PI / 4);
            // Torsion of helix: b/(a² + b²)
            const expected = b / (a * a + b * b);
            expect(tau).toBeCloseTo(expected, 1);
        });

        it('should return zero torsion for planar curve', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t), z: 0 });
            const tau = torsion3D(circle, Math.PI / 4);
            expect(Math.abs(tau)).toBeLessThan(0.1); // Nearly zero
        });

        it('should return zero torsion for straight line', () => {
            const line = (t: number) => ({ x: t, y: 2 * t, z: 3 * t });
            const tau = torsion3D(line, 0.5);
            expect(Math.abs(tau)).toBeLessThan(0.01);
        });
    });

    describe('tangent2D', () => {
        it('should calculate tangent vector of a circle', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const tang = tangent2D(circle, 0);
            // At t=0, tangent should point in (0, 1) direction
            expect(tang.x).toBeCloseTo(0, 3);
            expect(tang.y).toBeCloseTo(1, 3);
        });

        it('should return normalized tangent vector', () => {
            const curve = (t: number) => ({ x: t * t, y: t * t * t });
            const tang = tangent2D(curve, 1);
            const magnitude = Math.sqrt(tang.x * tang.x + tang.y * tang.y);
            expect(magnitude).toBeCloseTo(1, 5);
        });

        it('should calculate tangent of a line', () => {
            const line = (t: number) => ({ x: 3 * t, y: 4 * t });
            const tang = tangent2D(line, 0.5);
            // Tangent should be in direction (3, 4), normalized to (0.6, 0.8)
            expect(tang.x).toBeCloseTo(0.6, 3);
            expect(tang.y).toBeCloseTo(0.8, 3);
        });
    });

    describe('tangent3D', () => {
        it('should calculate tangent vector of a helix', () => {
            const helix = (t: number) => ({ x: Math.cos(t), y: Math.sin(t), z: t });
            const tang = tangent3D(helix, 0);
            const magnitude = Math.sqrt(tang.x * tang.x + tang.y * tang.y + tang.z * tang.z);
            expect(magnitude).toBeCloseTo(1, 5);
        });

        it('should return normalized tangent vector', () => {
            const curve = (t: number) => ({ x: t, y: t * t, z: t * t * t });
            const tang = tangent3D(curve, 1);
            const magnitude = Math.sqrt(tang.x * tang.x + tang.y * tang.y + tang.z * tang.z);
            expect(magnitude).toBeCloseTo(1, 5);
        });
    });

    describe('normal2D', () => {
        it('should be perpendicular to tangent', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const tang = tangent2D(circle, Math.PI / 4);
            const norm = normal2D(circle, Math.PI / 4);
            const dotProduct = tang.x * norm.x + tang.y * norm.y;
            expect(dotProduct).toBeCloseTo(0, 5);
        });

        it('should be normalized', () => {
            const curve = (t: number) => ({ x: t * t, y: t * t * t });
            const norm = normal2D(curve, 1);
            const magnitude = Math.sqrt(norm.x * norm.x + norm.y * norm.y);
            expect(magnitude).toBeCloseTo(1, 5);
        });

        it('should point inward for a circle', () => {
            const circle = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
            const norm = normal2D(circle, 0);
            // At t=0, point is (1, 0), normal should point left (inward): (-1, 0)
            expect(norm.x).toBeCloseTo(-1, 3);
            expect(norm.y).toBeCloseTo(0, 3);
        });
    });
});
