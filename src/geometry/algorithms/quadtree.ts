/**
 * Quadtree spatial data structure
 *
 * A Quadtree recursively subdivides 2D space into four quadrants.
 * Used for efficient spatial queries like:
 * - Point location
 * - Range queries
 * - Nearest neighbor search
 * - Collision detection
 */

import { Point } from '../point';

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface QuadtreeNode<T> {
  bounds: Bounds;
  points: Array<{ point: Point; data: T }>;
  divided: boolean;
  northeast?: QuadtreeNode<T>;
  northwest?: QuadtreeNode<T>;
  southeast?: QuadtreeNode<T>;
  southwest?: QuadtreeNode<T>;
}

export class Quadtree<T = any> {
  private root: QuadtreeNode<T>;
  private capacity: number;

  /**
   * Create a Quadtree
   *
   * @param bounds The bounding box of the quadtree
   * @param capacity Maximum number of points per node before subdivision (default: 4)
   *
   * @example
   * const quadtree = new Quadtree<string>(
   *   { x: 0, y: 0, width: 100, height: 100 },
   *   4
   * );
   */
  constructor(bounds: Bounds, capacity = 4) {
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
   * quadtree.insert(new Point(50, 50), "center");
   */
  insert(point: Point, data: T): boolean {
    return this.insertInNode(this.root, point, data);
  }

  private insertInNode(node: QuadtreeNode<T>, point: Point, data: T): boolean {
    // Point is outside bounds
    if (!this.containsPoint(node.bounds, point)) {
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

    // Insert into appropriate quadrant
    if (this.insertInNode(node.northeast!, point, data)) return true;
    if (this.insertInNode(node.northwest!, point, data)) return true;
    if (this.insertInNode(node.southeast!, point, data)) return true;
    if (this.insertInNode(node.southwest!, point, data)) return true;

    return false;
  }

  /**
   * Subdivide a node into four quadrants
   */
  private subdivide(node: QuadtreeNode<T>): void {
    const { x, y, width, height } = node.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    node.northeast = {
      bounds: { x: x + halfWidth, y: y, width: halfWidth, height: halfHeight },
      points: [],
      divided: false,
    };

    node.northwest = {
      bounds: { x, y, width: halfWidth, height: halfHeight },
      points: [],
      divided: false,
    };

    node.southeast = {
      bounds: { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight },
      points: [],
      divided: false,
    };

    node.southwest = {
      bounds: { x, y: y + halfHeight, width: halfWidth, height: halfHeight },
      points: [],
      divided: false,
    };

    node.divided = true;

    // Reinsert existing points
    const points = node.points;
    node.points = [];

    for (const { point, data } of points) {
      this.insertInNode(node.northeast, point, data);
      this.insertInNode(node.northwest, point, data);
      this.insertInNode(node.southeast, point, data);
      this.insertInNode(node.southwest, point, data);
    }
  }

  /**
   * Query all points within a rectangular range
   *
   * @param range The query rectangle
   * @returns Array of points with data in the range
   *
   * @example
   * const results = quadtree.query({
   *   x: 40, y: 40, width: 20, height: 20
   * });
   */
  query(range: Bounds): Array<{ point: Point; data: T }> {
    const found: Array<{ point: Point; data: T }> = [];
    this.queryNode(this.root, range, found);
    return found;
  }

  private queryNode(
    node: QuadtreeNode<T>,
    range: Bounds,
    found: Array<{ point: Point; data: T }>
  ): void {
    // No intersection
    if (!this.intersects(node.bounds, range)) {
      return;
    }

    // Check points at this node
    for (const item of node.points) {
      if (this.containsPoint(range, item.point)) {
        found.push(item);
      }
    }

    // Recurse into children
    if (node.divided) {
      this.queryNode(node.northeast!, range, found);
      this.queryNode(node.northwest!, range, found);
      this.queryNode(node.southeast!, range, found);
      this.queryNode(node.southwest!, range, found);
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
   * const nearest = quadtree.kNearest(new Point(50, 50), 5);
   */
  kNearest(point: Point, k: number): Array<{ point: Point; data: T; distance: number }> {
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
   * const nearby = quadtree.radiusQuery(new Point(50, 50), 10);
   */
  radiusQuery(center: Point, radius: number): Array<{ point: Point; data: T }> {
    // First do a rectangular query
    const range = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2,
    };

    const candidates = this.query(range);

    // Filter by actual distance
    return candidates.filter((item) => center.distanceTo(item.point) <= radius);
  }

  /**
   * Get all points in the quadtree
   *
   * @returns Array of all points with data
   */
  getAllPoints(): Array<{ point: Point; data: T }> {
    const all: Array<{ point: Point; data: T }> = [];
    this.collectAllPoints(this.root, all);
    return all;
  }

  private collectAllPoints(node: QuadtreeNode<T>, all: Array<{ point: Point; data: T }>): void {
    all.push(...node.points);

    if (node.divided) {
      this.collectAllPoints(node.northeast!, all);
      this.collectAllPoints(node.northwest!, all);
      this.collectAllPoints(node.southeast!, all);
      this.collectAllPoints(node.southwest!, all);
    }
  }

  /**
   * Get the total number of points in the quadtree
   *
   * @returns Number of points
   */
  size(): number {
    return this.countPoints(this.root);
  }

  private countPoints(node: QuadtreeNode<T>): number {
    let count = node.points.length;

    if (node.divided) {
      count += this.countPoints(node.northeast!);
      count += this.countPoints(node.northwest!);
      count += this.countPoints(node.southeast!);
      count += this.countPoints(node.southwest!);
    }

    return count;
  }

  /**
   * Clear all points from the quadtree
   */
  clear(): void {
    this.root = {
      bounds: this.root.bounds,
      points: [],
      divided: false,
    };
  }

  /**
   * Check if a bounds contains a point
   */
  private containsPoint(bounds: Bounds, point: Point): boolean {
    return (
      point.x >= bounds.x &&
      point.x < bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y < bounds.y + bounds.height
    );
  }

  /**
   * Check if two bounds intersect
   */
  private intersects(bounds1: Bounds, bounds2: Bounds): boolean {
    return !(
      bounds1.x > bounds2.x + bounds2.width ||
      bounds1.x + bounds1.width < bounds2.x ||
      bounds1.y > bounds2.y + bounds2.height ||
      bounds1.y + bounds1.height < bounds2.y
    );
  }

  /**
   * Get the depth of the quadtree
   *
   * @returns Maximum depth
   */
  depth(): number {
    return this.getDepth(this.root);
  }

  private getDepth(node: QuadtreeNode<T>): number {
    if (!node.divided) {
      return 1;
    }

    return (
      1 +
      Math.max(
        this.getDepth(node.northeast!),
        this.getDepth(node.northwest!),
        this.getDepth(node.southeast!),
        this.getDepth(node.southwest!)
      )
    );
  }
}
