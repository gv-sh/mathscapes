/**
 * K-Dimensional Tree (KD-Tree) spatial data structure
 *
 * A KD-Tree is a binary tree that partitions k-dimensional space.
 * Particularly efficient for:
 * - Nearest neighbor search
 * - Range queries
 * - K-nearest neighbors
 *
 * This implementation supports both 2D (Point) and 3D (Point3D) points.
 */

import { Point } from '../point';
import { Point3D } from '../3d/point3d';

type KDPoint = Point | Point3D;

interface KDNode<T> {
  point: KDPoint;
  data: T;
  left: KDNode<T> | null;
  right: KDNode<T> | null;
  axis: number;
}

export class KDTree<T = any> {
  private root: KDNode<T> | null = null;
  private dimensions: number;

  /**
   * Create a KD-Tree
   *
   * @param points Array of points with associated data
   * @param dimensions Number of dimensions (2 or 3)
   *
   * @example
   * // 2D KD-Tree
   * const tree2d = new KDTree([
   *   { point: new Point(1, 2), data: "a" },
   *   { point: new Point(3, 4), data: "b" }
   * ], 2);
   *
   * // 3D KD-Tree
   * const tree3d = new KDTree([
   *   { point: new Point3D(1, 2, 3), data: "a" },
   *   { point: new Point3D(4, 5, 6), data: "b" }
   * ], 3);
   */
  constructor(points: Array<{ point: KDPoint; data: T }>, dimensions: number) {
    if (dimensions !== 2 && dimensions !== 3) {
      throw new Error('KDTree only supports 2 or 3 dimensions');
    }
    this.dimensions = dimensions;
    this.root = this.buildTree(points, 0);
  }

  /**
   * Build the KD-Tree recursively
   */
  private buildTree(
    points: Array<{ point: KDPoint; data: T }>,
    depth: number
  ): KDNode<T> | null {
    if (points.length === 0) {
      return null;
    }

    const axis = depth % this.dimensions;

    // Sort points by the current axis
    points.sort((a, b) => {
      const aVal = this.getCoordinate(a.point, axis);
      const bVal = this.getCoordinate(b.point, axis);
      return aVal - bVal;
    });

    // Choose median as pivot
    const medianIndex = Math.floor(points.length / 2);
    const median = points[medianIndex];

    return {
      point: median.point,
      data: median.data,
      axis,
      left: this.buildTree(points.slice(0, medianIndex), depth + 1),
      right: this.buildTree(points.slice(medianIndex + 1), depth + 1),
    };
  }

  /**
   * Get coordinate at the specified axis
   */
  private getCoordinate(point: KDPoint, axis: number): number {
    if (this.dimensions === 2) {
      return axis === 0 ? (point as Point).x : (point as Point).y;
    } else {
      const p = point as Point3D;
      return axis === 0 ? p.x : axis === 1 ? p.y : p.z;
    }
  }

  /**
   * Calculate distance between two points
   */
  private distance(p1: KDPoint, p2: KDPoint): number {
    if (this.dimensions === 2) {
      return (p1 as Point).distanceTo(p2 as Point);
    } else {
      return (p1 as Point3D).distanceTo(p2 as Point3D);
    }
  }

  /**
   * Calculate squared distance between two points
   */
  private distanceSquared(p1: KDPoint, p2: KDPoint): number {
    if (this.dimensions === 2) {
      return (p1 as Point).distanceSquaredTo(p2 as Point);
    } else {
      return (p1 as Point3D).distanceSquaredTo(p2 as Point3D);
    }
  }

  /**
   * Find the nearest neighbor to a point
   *
   * @param point Query point
   * @returns Nearest point with data and distance
   *
   * @example
   * const nearest = tree.nearest(new Point(5, 5));
   */
  nearest(point: KDPoint): { point: KDPoint; data: T; distance: number } | null {
    if (!this.root) {
      return null;
    }

    let best: { node: KDNode<T>; distance: number } | null = null;

    const search = (node: KDNode<T> | null): void => {
      if (!node) return;

      const dist = this.distanceSquared(point, node.point);

      if (!best || dist < best.distance) {
        best = { node, distance: dist };
      }

      const axis = node.axis;
      const queryCoord = this.getCoordinate(point, axis);
      const nodeCoord = this.getCoordinate(node.point, axis);
      const diff = queryCoord - nodeCoord;

      // Search the near side first
      const nearSide = diff < 0 ? node.left : node.right;
      const farSide = diff < 0 ? node.right : node.left;

      search(nearSide);

      // Check if we need to search the far side
      if (best && diff * diff < best.distance) {
        search(farSide);
      }
    };

    search(this.root);

    if (!best) {
      return null;
    }

    const result = best as { node: KDNode<T>; distance: number };
    return {
      point: result.node.point,
      data: result.node.data,
      distance: Math.sqrt(result.distance),
    };
  }

  /**
   * Find k nearest neighbors to a point
   *
   * @param point Query point
   * @param k Number of neighbors
   * @returns Array of k nearest points with data and distances
   *
   * @example
   * const neighbors = tree.kNearest(new Point(5, 5), 3);
   */
  kNearest(point: KDPoint, k: number): Array<{ point: KDPoint; data: T; distance: number }> {
    if (!this.root || k <= 0) {
      return [];
    }

    const heap: Array<{ node: KDNode<T>; distanceSquared: number }> = [];

    const search = (node: KDNode<T> | null): void => {
      if (!node) return;

      const distSquared = this.distanceSquared(point, node.point);

      if (heap.length < k) {
        heap.push({ node, distanceSquared: distSquared });
        heap.sort((a, b) => b.distanceSquared - a.distanceSquared);
      } else if (distSquared < heap[0].distanceSquared) {
        heap[0] = { node, distanceSquared: distSquared };
        heap.sort((a, b) => b.distanceSquared - a.distanceSquared);
      }

      const axis = node.axis;
      const queryCoord = this.getCoordinate(point, axis);
      const nodeCoord = this.getCoordinate(node.point, axis);
      const diff = queryCoord - nodeCoord;

      // Search the near side first
      const nearSide = diff < 0 ? node.left : node.right;
      const farSide = diff < 0 ? node.right : node.left;

      search(nearSide);

      // Check if we need to search the far side
      if (heap.length < k || diff * diff < heap[0].distanceSquared) {
        search(farSide);
      }
    };

    search(this.root);

    return heap
      .map((item) => ({
        point: item.node.point,
        data: item.node.data,
        distance: Math.sqrt(item.distanceSquared),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Find all points within a radius of a query point
   *
   * @param point Center point
   * @param radius Search radius
   * @returns Array of points with data within the radius
   *
   * @example
   * const nearby = tree.radiusQuery(new Point(5, 5), 10);
   */
  radiusQuery(point: KDPoint, radius: number): Array<{ point: KDPoint; data: T; distance: number }> {
    if (!this.root) {
      return [];
    }

    const radiusSquared = radius * radius;
    const results: Array<{ point: KDPoint; data: T; distance: number }> = [];

    const search = (node: KDNode<T> | null): void => {
      if (!node) return;

      const distSquared = this.distanceSquared(point, node.point);

      if (distSquared <= radiusSquared) {
        results.push({
          point: node.point,
          data: node.data,
          distance: Math.sqrt(distSquared),
        });
      }

      const axis = node.axis;
      const queryCoord = this.getCoordinate(point, axis);
      const nodeCoord = this.getCoordinate(node.point, axis);
      const diff = queryCoord - nodeCoord;

      // Search the near side first
      const nearSide = diff < 0 ? node.left : node.right;
      const farSide = diff < 0 ? node.right : node.left;

      search(nearSide);

      // Check if we need to search the far side
      if (diff * diff <= radiusSquared) {
        search(farSide);
      }
    };

    search(this.root);

    return results.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Range query for 2D rectangles or 3D boxes
   *
   * @param min Minimum corner
   * @param max Maximum corner
   * @returns Array of points with data in the range
   *
   * @example
   * const inRange = tree.rangeQuery(new Point(0, 0), new Point(10, 10));
   */
  rangeQuery(min: KDPoint, max: KDPoint): Array<{ point: KDPoint; data: T }> {
    if (!this.root) {
      return [];
    }

    const results: Array<{ point: KDPoint; data: T }> = [];

    const inRange = (point: KDPoint): boolean => {
      for (let i = 0; i < this.dimensions; i++) {
        const coord = this.getCoordinate(point, i);
        const minCoord = this.getCoordinate(min, i);
        const maxCoord = this.getCoordinate(max, i);
        if (coord < minCoord || coord > maxCoord) {
          return false;
        }
      }
      return true;
    };

    const search = (node: KDNode<T> | null): void => {
      if (!node) return;

      if (inRange(node.point)) {
        results.push({
          point: node.point,
          data: node.data,
        });
      }

      const axis = node.axis;
      const nodeCoord = this.getCoordinate(node.point, axis);
      const minCoord = this.getCoordinate(min, axis);
      const maxCoord = this.getCoordinate(max, axis);

      // Check if we need to search left
      if (minCoord <= nodeCoord) {
        search(node.left);
      }

      // Check if we need to search right
      if (maxCoord >= nodeCoord) {
        search(node.right);
      }
    };

    search(this.root);

    return results;
  }

  /**
   * Get all points in the tree
   *
   * @returns Array of all points with data
   */
  getAllPoints(): Array<{ point: KDPoint; data: T }> {
    const results: Array<{ point: KDPoint; data: T }> = [];

    const traverse = (node: KDNode<T> | null): void => {
      if (!node) return;

      results.push({
        point: node.point,
        data: node.data,
      });

      traverse(node.left);
      traverse(node.right);
    };

    traverse(this.root);

    return results;
  }

  /**
   * Get the total number of points in the tree
   *
   * @returns Number of points
   */
  size(): number {
    const count = (node: KDNode<T> | null): number => {
      if (!node) return 0;
      return 1 + count(node.left) + count(node.right);
    };

    return count(this.root);
  }

  /**
   * Get the height/depth of the tree
   *
   * @returns Tree height
   */
  height(): number {
    const getHeight = (node: KDNode<T> | null): number => {
      if (!node) return 0;
      return 1 + Math.max(getHeight(node.left), getHeight(node.right));
    };

    return getHeight(this.root);
  }

  /**
   * Check if the tree is balanced
   *
   * @returns True if balanced
   */
  isBalanced(): boolean {
    const checkBalance = (node: KDNode<T> | null): { balanced: boolean; height: number } => {
      if (!node) {
        return { balanced: true, height: 0 };
      }

      const left = checkBalance(node.left);
      const right = checkBalance(node.right);

      const balanced =
        left.balanced &&
        right.balanced &&
        Math.abs(left.height - right.height) <= 1;

      return {
        balanced,
        height: 1 + Math.max(left.height, right.height),
      };
    };

    return checkBalance(this.root).balanced;
  }
}
