/**
 * Spatial Data Structures
 *
 * Efficient data structures for spatial queries and nearest neighbor searches.
 *
 * Implementations:
 * - Quadtree (2D space partitioning)
 * - Octree (3D space partitioning)
 * - KD-Tree (K-dimensional binary space partitioning)
 *
 * References:
 * - "Computational Geometry: Algorithms and Applications" by de Berg et al.
 * - "Foundations of Multidimensional and Metric Data Structures" by Samet
 */

import { Point } from './point';

/**
 * 2D Point interface (aliased from Point class)
 */
export type Point2D = Point;

/**
 * 3D Point interface
 */
export interface Point3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Rectangle (2D bounding box)
 */
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ============================================================================
// QUADTREE (2D)
// ============================================================================

/**
 * Quadtree node for 2D spatial partitioning
 * Each node divides space into 4 quadrants: NW, NE, SW, SE
 */
export class QuadtreeNode<T> {
    bounds: Rectangle;
    capacity: number;
    points: Array<{ point: Point2D; data: T }>;
    divided: boolean;
    northwest?: QuadtreeNode<T>;
    northeast?: QuadtreeNode<T>;
    southwest?: QuadtreeNode<T>;
    southeast?: QuadtreeNode<T>;

    constructor(bounds: Rectangle, capacity: number = 4) {
        this.bounds = bounds;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    /**
     * Check if a point is within the bounds
     */
    contains(point: Point2D): boolean {
        return point.x >= this.bounds.x &&
               point.x < this.bounds.x + this.bounds.width &&
               point.y >= this.bounds.y &&
               point.y < this.bounds.y + this.bounds.height;
    }

    /**
     * Check if a rectangle intersects with the bounds
     */
    intersects(range: Rectangle): boolean {
        return !(range.x > this.bounds.x + this.bounds.width ||
                 range.x + range.width < this.bounds.x ||
                 range.y > this.bounds.y + this.bounds.height ||
                 range.y + range.height < this.bounds.y);
    }

    /**
     * Subdivide into 4 quadrants
     */
    subdivide(): void {
        const x = this.bounds.x;
        const y = this.bounds.y;
        const w = this.bounds.width / 2;
        const h = this.bounds.height / 2;

        this.northwest = new QuadtreeNode({ x, y, width: w, height: h }, this.capacity);
        this.northeast = new QuadtreeNode({ x: x + w, y, width: w, height: h }, this.capacity);
        this.southwest = new QuadtreeNode({ x, y: y + h, width: w, height: h }, this.capacity);
        this.southeast = new QuadtreeNode({ x: x + w, y: y + h, width: w, height: h }, this.capacity);

        this.divided = true;
    }

    /**
     * Insert a point into the quadtree
     */
    insert(point: Point2D, data: T): boolean {
        if (!this.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push({ point, data });
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        return this.northwest!.insert(point, data) ||
               this.northeast!.insert(point, data) ||
               this.southwest!.insert(point, data) ||
               this.southeast!.insert(point, data);
    }

    /**
     * Query points within a rectangular range
     */
    query(range: Rectangle, found: Array<{ point: Point2D; data: T }> = []): Array<{ point: Point2D; data: T }> {
        if (!this.intersects(range)) {
            return found;
        }

        for (const item of this.points) {
            if (this.pointInRectangle(item.point, range)) {
                found.push(item);
            }
        }

        if (this.divided) {
            this.northwest!.query(range, found);
            this.northeast!.query(range, found);
            this.southwest!.query(range, found);
            this.southeast!.query(range, found);
        }

        return found;
    }

    private pointInRectangle(point: Point2D, rect: Rectangle): boolean {
        return point.x >= rect.x &&
               point.x < rect.x + rect.width &&
               point.y >= rect.y &&
               point.y < rect.y + rect.height;
    }
}

/**
 * Quadtree class for 2D spatial indexing
 */
export class Quadtree<T = any> {
    root: QuadtreeNode<T>;

    constructor(bounds: Rectangle, capacity: number = 4) {
        this.root = new QuadtreeNode(bounds, capacity);
    }

    insert(point: Point2D, data: T): boolean {
        return this.root.insert(point, data);
    }

    query(range: Rectangle): Array<{ point: Point2D; data: T }> {
        return this.root.query(range);
    }
}

// ============================================================================
// OCTREE (3D)
// ============================================================================

/**
 * 3D Bounding box
 */
export interface BoundingBox {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
}

/**
 * Octree node for 3D spatial partitioning
 */
export class OctreeNode<T> {
    bounds: BoundingBox;
    capacity: number;
    points: Array<{ point: Point3D; data: T }>;
    divided: boolean;
    children: OctreeNode<T>[];

    constructor(bounds: BoundingBox, capacity: number = 8) {
        this.bounds = bounds;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
        this.children = [];
    }

    contains(point: Point3D): boolean {
        return point.x >= this.bounds.x &&
               point.x < this.bounds.x + this.bounds.width &&
               point.y >= this.bounds.y &&
               point.y < this.bounds.y + this.bounds.height &&
               point.z >= this.bounds.z &&
               point.z < this.bounds.z + this.bounds.depth;
    }

    intersects(range: BoundingBox): boolean {
        return !(range.x > this.bounds.x + this.bounds.width ||
                 range.x + range.width < this.bounds.x ||
                 range.y > this.bounds.y + this.bounds.height ||
                 range.y + range.height < this.bounds.y ||
                 range.z > this.bounds.z + this.bounds.depth ||
                 range.z + range.depth < this.bounds.z);
    }

    subdivide(): void {
        const x = this.bounds.x;
        const y = this.bounds.y;
        const z = this.bounds.z;
        const w = this.bounds.width / 2;
        const h = this.bounds.height / 2;
        const d = this.bounds.depth / 2;

        // Create 8 octants
        this.children = [
            new OctreeNode({ x, y, z, width: w, height: h, depth: d }, this.capacity),
            new OctreeNode({ x: x + w, y, z, width: w, height: h, depth: d }, this.capacity),
            new OctreeNode({ x, y: y + h, z, width: w, height: h, depth: d }, this.capacity),
            new OctreeNode({ x: x + w, y: y + h, z, width: w, height: h, depth: d }, this.capacity),
            new OctreeNode({ x, y, z: z + d, width: w, height: h, depth: d }, this.capacity),
            new OctreeNode({ x: x + w, y, z: z + d, width: w, height: h, depth: d }, this.capacity),
            new OctreeNode({ x, y: y + h, z: z + d, width: w, height: h, depth: d }, this.capacity),
            new OctreeNode({ x: x + w, y: y + h, z: z + d, width: w, height: h, depth: d }, this.capacity)
        ];

        this.divided = true;
    }

    insert(point: Point3D, data: T): boolean {
        if (!this.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push({ point, data });
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        for (const child of this.children) {
            if (child.insert(point, data)) {
                return true;
            }
        }

        return false;
    }

    query(range: BoundingBox, found: Array<{ point: Point3D; data: T }> = []): Array<{ point: Point3D; data: T }> {
        if (!this.intersects(range)) {
            return found;
        }

        for (const item of this.points) {
            if (this.pointInBox(item.point, range)) {
                found.push(item);
            }
        }

        if (this.divided) {
            for (const child of this.children) {
                child.query(range, found);
            }
        }

        return found;
    }

    private pointInBox(point: Point3D, box: BoundingBox): boolean {
        return point.x >= box.x &&
               point.x < box.x + box.width &&
               point.y >= box.y &&
               point.y < box.y + box.height &&
               point.z >= box.z &&
               point.z < box.z + box.depth;
    }
}

/**
 * Octree class for 3D spatial indexing
 */
export class Octree<T = any> {
    root: OctreeNode<T>;

    constructor(bounds: BoundingBox, capacity: number = 8) {
        this.root = new OctreeNode(bounds, capacity);
    }

    insert(point: Point3D, data: T): boolean {
        return this.root.insert(point, data);
    }

    query(range: BoundingBox): Array<{ point: Point3D; data: T }> {
        return this.root.query(range);
    }
}

// ============================================================================
// KD-TREE
// ============================================================================

/**
 * KD-Tree node
 */
export class KDNode {
    point: number[];
    left: KDNode | null;
    right: KDNode | null;
    axis: number;

    constructor(point: number[], axis: number) {
        this.point = point;
        this.left = null;
        this.right = null;
        this.axis = axis;
    }
}

/**
 * KD-Tree for k-dimensional nearest neighbor search
 * Optimized for 2D and 3D, but supports arbitrary dimensions
 */
export class KDTree {
    private root: KDNode | null;
    private k: number; // Number of dimensions

    constructor(points: number[][], k?: number) {
        if (points.length === 0) {
            this.root = null;
            this.k = k || 2;
        } else {
            this.k = k || points[0].length;
            this.root = this.buildTree(points, 0);
        }
    }

    private buildTree(points: number[][], depth: number): KDNode | null {
        if (points.length === 0) {
            return null;
        }

        const axis = depth % this.k;

        // Sort points by current axis
        points.sort((a, b) => a[axis] - b[axis]);

        const median = Math.floor(points.length / 2);
        const node = new KDNode(points[median], axis);

        node.left = this.buildTree(points.slice(0, median), depth + 1);
        node.right = this.buildTree(points.slice(median + 1), depth + 1);

        return node;
    }

    /**
     * Find nearest neighbor to a query point
     */
    nearest(queryPoint: number[]): { point: number[]; distance: number } | null {
        if (!this.root) {
            return null;
        }

        let best: { point: number[]; distance: number } | null = null;

        const search = (node: KDNode | null, depth: number): void => {
            if (!node) {
                return;
            }

            const dist = this.distance(queryPoint, node.point);

            if (!best || dist < best.distance) {
                best = { point: node.point, distance: dist };
            }

            const axis = depth % this.k;
            const diff = queryPoint[axis] - node.point[axis];

            const near = diff < 0 ? node.left : node.right;
            const far = diff < 0 ? node.right : node.left;

            search(near, depth + 1);

            // Check if we need to search the other side
            if (!best || Math.abs(diff) < best.distance) {
                search(far, depth + 1);
            }
        };

        search(this.root, 0);
        return best;
    }

    /**
     * Find k nearest neighbors
     */
    kNearest(queryPoint: number[], count: number): Array<{ point: number[]; distance: number }> {
        if (!this.root) {
            return [];
        }

        const neighbors: Array<{ point: number[]; distance: number }> = [];

        const search = (node: KDNode | null, depth: number): void => {
            if (!node) {
                return;
            }

            const dist = this.distance(queryPoint, node.point);

            // Add to neighbors list
            neighbors.push({ point: node.point, distance: dist });
            neighbors.sort((a, b) => a.distance - b.distance);
            if (neighbors.length > count) {
                neighbors.pop();
            }

            const axis = depth % this.k;
            const diff = queryPoint[axis] - node.point[axis];

            const near = diff < 0 ? node.left : node.right;
            const far = diff < 0 ? node.right : node.left;

            search(near, depth + 1);

            // Check if we need to search the other side
            if (neighbors.length < count || Math.abs(diff) < neighbors[neighbors.length - 1].distance) {
                search(far, depth + 1);
            }
        };

        search(this.root, 0);
        return neighbors;
    }

    /**
     * Find all points within a radius
     */
    withinRadius(queryPoint: number[], radius: number): number[][] {
        if (!this.root) {
            return [];
        }

        const found: number[][] = [];

        const search = (node: KDNode | null, depth: number): void => {
            if (!node) {
                return;
            }

            const dist = this.distance(queryPoint, node.point);

            if (dist <= radius) {
                found.push(node.point);
            }

            const axis = depth % this.k;
            const diff = queryPoint[axis] - node.point[axis];

            const near = diff < 0 ? node.left : node.right;
            const far = diff < 0 ? node.right : node.left;

            search(near, depth + 1);

            // Check if sphere intersects splitting plane
            if (Math.abs(diff) <= radius) {
                search(far, depth + 1);
            }
        };

        search(this.root, 0);
        return found;
    }

    /**
     * Euclidean distance between two points
     */
    private distance(a: number[], b: number[]): number {
        let sum = 0;
        for (let i = 0; i < this.k; i++) {
            const diff = a[i] - b[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
}
