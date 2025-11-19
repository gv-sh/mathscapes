/**
 * Octree spatial data structure
 *
 * An Octree recursively subdivides 3D space into eight octants.
 * Used for efficient spatial queries in 3D:
 * - Point location
 * - Range queries
 * - Nearest neighbor search
 * - Collision detection
 * - Ray tracing acceleration
 */

import { Point3D } from '../3d/point3d';
import { AABB } from '../3d/aabb';

interface OctreeNode<T> {
  bounds: AABB;
  points: Array<{ point: Point3D; data: T }>;
  divided: boolean;
  children?: OctreeNode<T>[];
}

export class Octree<T = any> {
  private root: OctreeNode<T>;
  private capacity: number;

  /**
   * Create an Octree
   *
   * @param bounds The bounding box of the octree
   * @param capacity Maximum number of points per node before subdivision (default: 8)
   *
   * @example
   * const octree = new Octree<string>(
   *   new AABB(
   *     new Point3D(0, 0, 0),
   *     new Point3D(100, 100, 100)
   *   ),
   *   8
   * );
   */
  constructor(bounds: AABB, capacity = 8) {
    this.capacity = capacity;
    this.root = {
      bounds,
      points: [],
      divided: false,
    };
  }

  /**
   * Insert a point with associated data
   *
   * @param point The point
   * @param data Associated data
   * @returns True if insertion was successful
   *
   * @example
   * octree.insert(new Point3D(50, 50, 50), "center");
   */
  insert(point: Point3D, data: T): boolean {
    return this.insertInNode(this.root, point, data);
  }

  private insertInNode(node: OctreeNode<T>, point: Point3D, data: T): boolean {
    // Point is outside bounds
    if (!node.bounds.containsPoint(point)) {
      return false;
    }

    // If node has capacity and isn't divided, add point here
    if (node.points.length < this.capacity && !node.divided) {
      node.points.push({ point, data });
      return true;
    }

    // Subdivide if necessary
    if (!node.divided) {
      this.subdivide(node);
    }

    // Insert into appropriate octant
    for (const child of node.children!) {
      if (this.insertInNode(child, point, data)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Subdivide a node into eight octants
   */
  private subdivide(node: OctreeNode<T>): void {
    const center = node.bounds.center();
    const halfExtents = node.bounds.halfExtents();

    node.children = [];

    // Create 8 octants
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          const offset = new Point3D(
            (x - 0.5) * halfExtents.x,
            (y - 0.5) * halfExtents.y,
            (z - 0.5) * halfExtents.z
          );

          const childCenter = center.add(offset);
          const childMin = childCenter.subtract(halfExtents.scale(0.5));
          const childMax = childCenter.add(halfExtents.scale(0.5));

          node.children.push({
            bounds: new AABB(childMin, childMax),
            points: [],
            divided: false,
          });
        }
      }
    }

    node.divided = true;

    // Reinsert existing points
    const points = node.points;
    node.points = [];

    for (const { point, data } of points) {
      for (const child of node.children) {
        if (this.insertInNode(child, point, data)) {
          break;
        }
      }
    }
  }

  /**
   * Query all points within an AABB range
   *
   * @param range The query AABB
   * @returns Array of points with data in the range
   *
   * @example
   * const results = octree.query(
   *   new AABB(
   *     new Point3D(40, 40, 40),
   *     new Point3D(60, 60, 60)
   *   )
   * );
   */
  query(range: AABB): Array<{ point: Point3D; data: T }> {
    const found: Array<{ point: Point3D; data: T }> = [];
    this.queryNode(this.root, range, found);
    return found;
  }

  private queryNode(
    node: OctreeNode<T>,
    range: AABB,
    found: Array<{ point: Point3D; data: T }>
  ): void {
    // No intersection
    if (!node.bounds.intersects(range)) {
      return;
    }

    // Check points at this node
    for (const item of node.points) {
      if (range.containsPoint(item.point)) {
        found.push(item);
      }
    }

    // Recurse into children
    if (node.divided) {
      for (const child of node.children!) {
        this.queryNode(child, range, found);
      }
    }
  }

  /**
   * Find the k nearest neighbors to a point
   *
   * @param point The query point
   * @param k Number of neighbors to find
   * @returns Array of k nearest points with data
   *
   * @example
   * const nearest = octree.kNearest(new Point3D(50, 50, 50), 5);
   */
  kNearest(point: Point3D, k: number): Array<{ point: Point3D; data: T; distance: number }> {
    const all = this.getAllPoints();

    // Calculate distances
    const withDistances = all.map((item) => ({
      ...item,
      distance: point.distanceTo(item.point),
    }));

    // Sort by distance and take k nearest
    withDistances.sort((a, b) => a.distance - b.distance);
    return withDistances.slice(0, k);
  }

  /**
   * Find all points within a radius of a point
   *
   * @param center Center point
   * @param radius Radius
   * @returns Array of points with data within the radius
   *
   * @example
   * const nearby = octree.radiusQuery(new Point3D(50, 50, 50), 10);
   */
  radiusQuery(center: Point3D, radius: number): Array<{ point: Point3D; data: T }> {
    // First do a box query
    const radiusVec = new Point3D(radius, radius, radius);
    const range = new AABB(center.subtract(radiusVec), center.add(radiusVec));

    const candidates = this.query(range);

    // Filter by actual distance
    return candidates.filter((item) => center.distanceTo(item.point) <= radius);
  }

  /**
   * Ray casting query - find all points along a ray
   *
   * @param origin Ray origin
   * @param direction Ray direction (should be normalized)
   * @param maxDistance Maximum distance along ray
   * @returns Array of points with data along the ray
   */
  rayQuery(
    origin: Point3D,
    direction: Point3D,
    maxDistance = Infinity
  ): Array<{ point: Point3D; data: T; distance: number }> {
    const results: Array<{ point: Point3D; data: T; distance: number }> = [];
    this.rayQueryNode(this.root, origin, direction, maxDistance, results);
    results.sort((a, b) => a.distance - b.distance);
    return results;
  }

  private rayQueryNode(
    node: OctreeNode<T>,
    origin: Point3D,
    direction: Point3D,
    maxDistance: number,
    results: Array<{ point: Point3D; data: T; distance: number }>
  ): void {
    // Check if ray intersects this node's bounds
    const intersection = node.bounds.intersectRay(origin, direction);
    if (!intersection || !intersection.hit || intersection.tMin > maxDistance) {
      return;
    }

    // Check points in this node
    for (const item of node.points) {
      const toPoint = item.point.subtract(origin);
      const distance = toPoint.dot(direction);

      if (distance >= 0 && distance <= maxDistance) {
        const closestOnRay = origin.add(direction.scale(distance));
        const distToRay = item.point.distanceTo(closestOnRay);

        // Use a small threshold for "on the ray"
        if (distToRay < 1e-6) {
          results.push({ ...item, distance });
        }
      }
    }

    // Recurse into children
    if (node.divided) {
      for (const child of node.children!) {
        this.rayQueryNode(child, origin, direction, maxDistance, results);
      }
    }
  }

  /**
   * Get all points in the octree
   *
   * @returns Array of all points with data
   */
  getAllPoints(): Array<{ point: Point3D; data: T }> {
    const all: Array<{ point: Point3D; data: T }> = [];
    this.collectAllPoints(this.root, all);
    return all;
  }

  private collectAllPoints(node: OctreeNode<T>, all: Array<{ point: Point3D; data: T }>): void {
    all.push(...node.points);

    if (node.divided) {
      for (const child of node.children!) {
        this.collectAllPoints(child, all);
      }
    }
  }

  /**
   * Get the total number of points in the octree
   *
   * @returns Number of points
   */
  size(): number {
    return this.countPoints(this.root);
  }

  private countPoints(node: OctreeNode<T>): number {
    let count = node.points.length;

    if (node.divided) {
      for (const child of node.children!) {
        count += this.countPoints(child);
      }
    }

    return count;
  }

  /**
   * Clear all points from the octree
   */
  clear(): void {
    this.root = {
      bounds: this.root.bounds,
      points: [],
      divided: false,
    };
  }

  /**
   * Get the depth of the octree
   *
   * @returns Maximum depth
   */
  depth(): number {
    return this.getDepth(this.root);
  }

  private getDepth(node: OctreeNode<T>): number {
    if (!node.divided) {
      return 1;
    }

    let maxChildDepth = 0;
    for (const child of node.children!) {
      maxChildDepth = Math.max(maxChildDepth, this.getDepth(child));
    }

    return 1 + maxChildDepth;
  }

  /**
   * Get the bounding box of the octree
   *
   * @returns Root bounding box
   */
  getBounds(): AABB {
    return this.root.bounds;
  }
}
