/**
 * 3D Geometry Primitives
 *
 * Fundamental 3D geometric shapes and operations for graphics, physics,
 * and computational geometry applications.
 *
 * Features:
 * - Plane operations
 * - Sphere operations
 * - Axis-Aligned Bounding Box (AABB)
 * - Oriented Bounding Box (OBB)
 * - Ray-primitive intersections
 *
 * References:
 * - "Real-Time Collision Detection" by Christer Ericson
 * - "Geometric Tools for Computer Graphics" by Schneider & Eberly
 */

/**
 * 3D Point representation
 */
export interface Point3D {
    x: number;
    y: number;
    z: number;
}

/**
 * 3D Vector representation
 */
export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Ray in 3D space
 */
export interface Ray {
    origin: Point3D;
    direction: Vector3D; // Should be normalized
}

/**
 * Plane in 3D space
 * Represented as: ax + by + cz + d = 0
 * where (a, b, c) is the normal vector
 */
export class Plane {
    normal: Vector3D;
    d: number; // Distance from origin

    /**
     * Create a plane from normal and distance
     * @param normal - Normal vector (will be normalized)
     * @param d - Distance from origin
     */
    constructor(normal: Vector3D, d: number) {
        const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        this.normal = {
            x: normal.x / len,
            y: normal.y / len,
            z: normal.z / len
        };
        this.d = d / len;
    }

    /**
     * Create a plane from a point and normal
     */
    static fromPointNormal(point: Point3D, normal: Vector3D): Plane {
        const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        const n = { x: normal.x / len, y: normal.y / len, z: normal.z / len };
        const d = -(n.x * point.x + n.y * point.y + n.z * point.z);
        return new Plane(n, d);
    }

    /**
     * Create a plane from three points
     */
    static fromThreePoints(p1: Point3D, p2: Point3D, p3: Point3D): Plane {
        // Two edge vectors
        const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
        const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };

        // Normal is cross product
        const normal = {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };

        return Plane.fromPointNormal(p1, normal);
    }

    /**
     * Distance from point to plane (signed)
     * Positive if point is on the side of the normal
     */
    distanceToPoint(point: Point3D): number {
        return this.normal.x * point.x + this.normal.y * point.y +
               this.normal.z * point.z + this.d;
    }

    /**
     * Project a point onto the plane
     */
    projectPoint(point: Point3D): Point3D {
        const dist = this.distanceToPoint(point);
        return {
            x: point.x - dist * this.normal.x,
            y: point.y - dist * this.normal.y,
            z: point.z - dist * this.normal.z
        };
    }

    /**
     * Find intersection of ray with plane
     * Returns null if no intersection (ray parallel to plane)
     */
    intersectRay(ray: Ray): Point3D | null {
        const denom = this.normal.x * ray.direction.x +
                      this.normal.y * ray.direction.y +
                      this.normal.z * ray.direction.z;

        // Check if ray is parallel to plane
        if (Math.abs(denom) < 1e-10) {
            return null;
        }

        const t = -(this.normal.x * ray.origin.x + this.normal.y * ray.origin.y +
                    this.normal.z * ray.origin.z + this.d) / denom;

        // Intersection behind ray origin
        if (t < 0) {
            return null;
        }

        return {
            x: ray.origin.x + t * ray.direction.x,
            y: ray.origin.y + t * ray.direction.y,
            z: ray.origin.z + t * ray.direction.z
        };
    }
}

/**
 * Sphere in 3D space
 */
export class Sphere {
    center: Point3D;
    radius: number;

    constructor(center: Point3D, radius: number) {
        this.center = center;
        this.radius = radius;
    }

    /**
     * Check if point is inside sphere
     */
    containsPoint(point: Point3D): boolean {
        const dx = point.x - this.center.x;
        const dy = point.y - this.center.y;
        const dz = point.z - this.center.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        return distSq <= this.radius * this.radius;
    }

    /**
     * Distance from point to sphere surface (signed)
     * Negative if inside
     */
    distanceToPoint(point: Point3D): number {
        const dx = point.x - this.center.x;
        const dy = point.y - this.center.y;
        const dz = point.z - this.center.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return dist - this.radius;
    }

    /**
     * Closest point on sphere to given point
     */
    closestPoint(point: Point3D): Point3D {
        const dx = point.x - this.center.x;
        const dy = point.y - this.center.y;
        const dz = point.z - this.center.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 1e-10) {
            // Point at center, return any point on surface
            return { x: this.center.x + this.radius, y: this.center.y, z: this.center.z };
        }

        const scale = this.radius / dist;
        return {
            x: this.center.x + dx * scale,
            y: this.center.y + dy * scale,
            z: this.center.z + dz * scale
        };
    }

    /**
     * Check if this sphere intersects another sphere
     */
    intersectsSphere(other: Sphere): boolean {
        const dx = this.center.x - other.center.x;
        const dy = this.center.y - other.center.y;
        const dz = this.center.z - other.center.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const radiusSum = this.radius + other.radius;
        return distSq <= radiusSum * radiusSum;
    }

    /**
     * Ray-sphere intersection
     * Returns array of intersection points (0, 1, or 2 points)
     */
    intersectRay(ray: Ray): Point3D[] {
        // Vector from ray origin to sphere center
        const oc = {
            x: ray.origin.x - this.center.x,
            y: ray.origin.y - this.center.y,
            z: ray.origin.z - this.center.z
        };

        // Quadratic equation coefficients: at^2 + bt + c = 0
        const a = ray.direction.x * ray.direction.x +
                  ray.direction.y * ray.direction.y +
                  ray.direction.z * ray.direction.z;

        const b = 2 * (oc.x * ray.direction.x + oc.y * ray.direction.y + oc.z * ray.direction.z);

        const c = oc.x * oc.x + oc.y * oc.y + oc.z * oc.z - this.radius * this.radius;

        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return []; // No intersection
        }

        const sqrtDisc = Math.sqrt(discriminant);
        const t1 = (-b - sqrtDisc) / (2 * a);
        const t2 = (-b + sqrtDisc) / (2 * a);

        const intersections: Point3D[] = [];

        if (t1 >= 0) {
            intersections.push({
                x: ray.origin.x + t1 * ray.direction.x,
                y: ray.origin.y + t1 * ray.direction.y,
                z: ray.origin.z + t1 * ray.direction.z
            });
        }

        if (t2 >= 0 && Math.abs(t1 - t2) > 1e-10) {
            intersections.push({
                x: ray.origin.x + t2 * ray.direction.x,
                y: ray.origin.y + t2 * ray.direction.y,
                z: ray.origin.z + t2 * ray.direction.z
            });
        }

        return intersections;
    }

    /**
     * Surface area of sphere
     */
    surfaceArea(): number {
        return 4 * Math.PI * this.radius * this.radius;
    }

    /**
     * Volume of sphere
     */
    volume(): number {
        return (4 / 3) * Math.PI * this.radius * this.radius * this.radius;
    }
}

/**
 * Axis-Aligned Bounding Box (AABB)
 * Fast collision detection using axis-aligned boxes
 */
export class AABB {
    min: Point3D;
    max: Point3D;

    constructor(min: Point3D, max: Point3D) {
        this.min = min;
        this.max = max;
    }

    /**
     * Create AABB from center and half-extents
     */
    static fromCenterSize(center: Point3D, halfSize: Vector3D): AABB {
        return new AABB(
            { x: center.x - halfSize.x, y: center.y - halfSize.y, z: center.z - halfSize.z },
            { x: center.x + halfSize.x, y: center.y + halfSize.y, z: center.z + halfSize.z }
        );
    }

    /**
     * Create AABB from array of points
     */
    static fromPoints(points: Point3D[]): AABB {
        if (points.length === 0) {
            throw new Error('Cannot create AABB from empty point array');
        }

        let minX = points[0].x, minY = points[0].y, minZ = points[0].z;
        let maxX = points[0].x, maxY = points[0].y, maxZ = points[0].z;

        for (const p of points) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            minZ = Math.min(minZ, p.z);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
            maxZ = Math.max(maxZ, p.z);
        }

        return new AABB(
            { x: minX, y: minY, z: minZ },
            { x: maxX, y: maxY, z: maxZ }
        );
    }

    /**
     * Get center of AABB
     */
    center(): Point3D {
        return {
            x: (this.min.x + this.max.x) / 2,
            y: (this.min.y + this.max.y) / 2,
            z: (this.min.z + this.max.z) / 2
        };
    }

    /**
     * Get half-extents of AABB
     */
    halfSize(): Vector3D {
        return {
            x: (this.max.x - this.min.x) / 2,
            y: (this.max.y - this.min.y) / 2,
            z: (this.max.z - this.min.z) / 2
        };
    }

    /**
     * Check if point is inside AABB
     */
    containsPoint(point: Point3D): boolean {
        return point.x >= this.min.x && point.x <= this.max.x &&
               point.y >= this.min.y && point.y <= this.max.y &&
               point.z >= this.min.z && point.z <= this.max.z;
    }

    /**
     * Check if this AABB intersects another AABB
     */
    intersectsAABB(other: AABB): boolean {
        return this.min.x <= other.max.x && this.max.x >= other.min.x &&
               this.min.y <= other.max.y && this.max.y >= other.min.y &&
               this.min.z <= other.max.z && this.max.z >= other.min.z;
    }

    /**
     * Check if this AABB contains another AABB
     */
    containsAABB(other: AABB): boolean {
        return this.min.x <= other.min.x && this.max.x >= other.max.x &&
               this.min.y <= other.min.y && this.max.y >= other.max.y &&
               this.min.z <= other.min.z && this.max.z >= other.max.z;
    }

    /**
     * Closest point on AABB to given point
     */
    closestPoint(point: Point3D): Point3D {
        return {
            x: Math.max(this.min.x, Math.min(point.x, this.max.x)),
            y: Math.max(this.min.y, Math.min(point.y, this.max.y)),
            z: Math.max(this.min.z, Math.min(point.z, this.max.z))
        };
    }

    /**
     * Distance from point to AABB
     */
    distanceToPoint(point: Point3D): number {
        const closest = this.closestPoint(point);
        const dx = point.x - closest.x;
        const dy = point.y - closest.y;
        const dz = point.z - closest.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Ray-AABB intersection (fast slab method)
     * Returns t value of intersection, or null if no intersection
     */
    intersectRay(ray: Ray): number | null {
        let tmin = -Infinity;
        let tmax = Infinity;

        // X slab
        if (Math.abs(ray.direction.x) > 1e-10) {
            const tx1 = (this.min.x - ray.origin.x) / ray.direction.x;
            const tx2 = (this.max.x - ray.origin.x) / ray.direction.x;
            tmin = Math.max(tmin, Math.min(tx1, tx2));
            tmax = Math.min(tmax, Math.max(tx1, tx2));
        } else if (ray.origin.x < this.min.x || ray.origin.x > this.max.x) {
            return null;
        }

        // Y slab
        if (Math.abs(ray.direction.y) > 1e-10) {
            const ty1 = (this.min.y - ray.origin.y) / ray.direction.y;
            const ty2 = (this.max.y - ray.origin.y) / ray.direction.y;
            tmin = Math.max(tmin, Math.min(ty1, ty2));
            tmax = Math.min(tmax, Math.max(ty1, ty2));
        } else if (ray.origin.y < this.min.y || ray.origin.y > this.max.y) {
            return null;
        }

        // Z slab
        if (Math.abs(ray.direction.z) > 1e-10) {
            const tz1 = (this.min.z - ray.origin.z) / ray.direction.z;
            const tz2 = (this.max.z - ray.origin.z) / ray.direction.z;
            tmin = Math.max(tmin, Math.min(tz1, tz2));
            tmax = Math.min(tmax, Math.max(tz1, tz2));
        } else if (ray.origin.z < this.min.z || ray.origin.z > this.max.z) {
            return null;
        }

        if (tmax < tmin || tmax < 0) {
            return null;
        }

        return tmin >= 0 ? tmin : tmax;
    }

    /**
     * Expand AABB to include a point
     */
    expandToInclude(point: Point3D): void {
        this.min.x = Math.min(this.min.x, point.x);
        this.min.y = Math.min(this.min.y, point.y);
        this.min.z = Math.min(this.min.z, point.z);
        this.max.x = Math.max(this.max.x, point.x);
        this.max.y = Math.max(this.max.y, point.y);
        this.max.z = Math.max(this.max.z, point.z);
    }

    /**
     * Volume of AABB
     */
    volume(): number {
        return (this.max.x - this.min.x) *
               (this.max.y - this.min.y) *
               (this.max.z - this.min.z);
    }

    /**
     * Surface area of AABB
     */
    surfaceArea(): number {
        const dx = this.max.x - this.min.x;
        const dy = this.max.y - this.min.y;
        const dz = this.max.z - this.min.z;
        return 2 * (dx * dy + dy * dz + dz * dx);
    }
}

/**
 * Oriented Bounding Box (OBB)
 * More accurate than AABB for rotated objects
 */
export class OBB {
    center: Point3D;
    axes: [Vector3D, Vector3D, Vector3D]; // Three orthonormal axes
    halfSizes: [number, number, number]; // Half-extents along each axis

    constructor(
        center: Point3D,
        axes: [Vector3D, Vector3D, Vector3D],
        halfSizes: [number, number, number]
    ) {
        this.center = center;
        this.axes = axes;
        this.halfSizes = halfSizes;
    }

    /**
     * Check if point is inside OBB
     */
    containsPoint(point: Point3D): boolean {
        // Transform point to OBB's local space
        const d = {
            x: point.x - this.center.x,
            y: point.y - this.center.y,
            z: point.z - this.center.z
        };

        for (let i = 0; i < 3; i++) {
            const axis = this.axes[i];
            const dist = Math.abs(d.x * axis.x + d.y * axis.y + d.z * axis.z);
            if (dist > this.halfSizes[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the 8 corner points of the OBB
     */
    getCorners(): Point3D[] {
        const corners: Point3D[] = [];

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < 2; k++) {
                    const sx = (i === 0 ? -1 : 1) * this.halfSizes[0];
                    const sy = (j === 0 ? -1 : 1) * this.halfSizes[1];
                    const sz = (k === 0 ? -1 : 1) * this.halfSizes[2];

                    corners.push({
                        x: this.center.x + sx * this.axes[0].x + sy * this.axes[1].x + sz * this.axes[2].x,
                        y: this.center.y + sx * this.axes[0].y + sy * this.axes[1].y + sz * this.axes[2].y,
                        z: this.center.z + sx * this.axes[0].z + sy * this.axes[1].z + sz * this.axes[2].z
                    });
                }
            }
        }

        return corners;
    }

    /**
     * Convert OBB to AABB (conservative bounding)
     */
    toAABB(): AABB {
        const corners = this.getCorners();
        return AABB.fromPoints(corners);
    }
}
