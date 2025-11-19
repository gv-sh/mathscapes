/**
 * Voronoi Diagram
 *
 * Implements Voronoi diagram computation from Delaunay triangulation.
 * A Voronoi diagram partitions the plane into regions, where each region
 * contains all points closer to a specific site than to any other site.
 *
 * Properties:
 * - Dual graph of Delaunay triangulation
 * - Each Voronoi cell is convex
 * - Voronoi edges are perpendicular bisectors of Delaunay edges
 */

import { Point } from '../point';
import { DelaunayTriangulation } from './delaunay';

export interface VoronoiCell {
  site: Point;
  vertices: Point[];
  neighbors: Point[];
}

export interface VoronoiEdge {
  start: Point;
  end: Point;
  leftSite: Point;
  rightSite: Point;
}

export class VoronoiDiagram {
  public readonly cells: Map<string, VoronoiCell>;
  public readonly edges: VoronoiEdge[];

  constructor(cells: Map<string, VoronoiCell>, edges: VoronoiEdge[]) {
    this.cells = cells;
    this.edges = edges;
  }

  /**
   * Compute Voronoi diagram from a set of points
   *
   * @param points Array of site points
   * @param bounds Optional bounding box for clipping [minX, minY, maxX, maxY]
   * @returns Voronoi diagram
   *
   * @example
   * const points = [
   *   new Point(0, 0),
   *   new Point(1, 0),
   *   new Point(0.5, 1)
   * ];
   * const voronoi = VoronoiDiagram.fromPoints(points);
   */
  static fromPoints(points: Point[], bounds?: [number, number, number, number]): VoronoiDiagram {
    if (points.length < 2) {
      throw new Error('Need at least 2 points for Voronoi diagram');
    }

    // Compute Delaunay triangulation
    const delaunay = DelaunayTriangulation.triangulate(points);

    // Initialize cells map
    const cells = new Map<string, VoronoiCell>();
    for (const point of points) {
      const key = this.pointKey(point);
      cells.set(key, {
        site: point,
        vertices: [],
        neighbors: [],
      });
    }

    // Collect Voronoi vertices from Delaunay circumcenters
    const edges: VoronoiEdge[] = [];
    const edgeMap = new Map<string, { center1: Point; center2: Point | null; sites: Point[] }>();

    // Build edge map from Delaunay triangles
    for (const triangle of delaunay.triangles) {
      const [a, b, c] = triangle.vertices;
      const center = triangle.circumcenter;

      // Add circumcenter to each vertex's cell
      for (const vertex of [a, b, c]) {
        const key = this.pointKey(vertex);
        const cell = cells.get(key);
        if (cell) {
          cell.vertices.push(center);
        }
      }

      // Track edges
      const triangleEdges = [
        [a, b],
        [b, c],
        [c, a],
      ];

      for (const [p1, p2] of triangleEdges) {
        const edgeKey = this.edgeKey(p1, p2);
        const existing = edgeMap.get(edgeKey);

        if (existing) {
          existing.center2 = center;
        } else {
          edgeMap.set(edgeKey, {
            center1: center,
            center2: null,
            sites: [p1, p2],
          });
        }
      }
    }

    // Create Voronoi edges from the edge map
    for (const [, edgeData] of edgeMap) {
      if (edgeData.center2) {
        edges.push({
          start: edgeData.center1,
          end: edgeData.center2,
          leftSite: edgeData.sites[0],
          rightSite: edgeData.sites[1],
        });
      }
    }

    // Sort vertices of each cell in counterclockwise order
    for (const [, cell] of cells) {
      if (cell.vertices.length > 0) {
        cell.vertices = this.sortVerticesCounterClockwise(cell.site, cell.vertices);
      }
    }

    // Find neighbors for each cell
    for (const [, cell] of cells) {
      const neighbors = new Set<string>();

      for (const edge of edges) {
        if (this.pointsEqual(edge.leftSite, cell.site)) {
          neighbors.add(this.pointKey(edge.rightSite));
        } else if (this.pointsEqual(edge.rightSite, cell.site)) {
          neighbors.add(this.pointKey(edge.leftSite));
        }
      }

      cell.neighbors = Array.from(neighbors).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return new Point(x, y);
      });
    }

    // Clip cells to bounds if provided
    if (bounds) {
      const [minX, minY, maxX, maxY] = bounds;
      for (const [, cell] of cells) {
        cell.vertices = this.clipPolygon(cell.vertices, minX, minY, maxX, maxY);
      }
    }

    return new VoronoiDiagram(cells, edges);
  }

  /**
   * Sort vertices in counterclockwise order around a center point
   */
  private static sortVerticesCounterClockwise(center: Point, vertices: Point[]): Point[] {
    return vertices.slice().sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      return angleA - angleB;
    });
  }

  /**
   * Clip a polygon to a rectangular bounding box using Sutherland-Hodgman algorithm
   */
  private static clipPolygon(
    vertices: Point[],
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): Point[] {
    if (vertices.length === 0) return [];

    let output = vertices;

    // Clip against each edge of the bounding box
    const edges = [
      { x: minX, y: 0, dx: 0, dy: 1 }, // Left edge
      { x: 0, y: maxY, dx: 1, dy: 0 }, // Top edge
      { x: maxX, y: 0, dx: 0, dy: -1 }, // Right edge
      { x: 0, y: minY, dx: -1, dy: 0 }, // Bottom edge
    ];

    for (const edge of edges) {
      const input = output;
      output = [];

      if (input.length === 0) break;

      for (let i = 0; i < input.length; i++) {
        const current = input[i];
        const next = input[(i + 1) % input.length];

        const currentInside = this.isInsideEdge(current, edge, minX, minY, maxX, maxY);
        const nextInside = this.isInsideEdge(next, edge, minX, minY, maxX, maxY);

        if (nextInside) {
          if (!currentInside) {
            const intersection = this.lineIntersectEdge(
              current,
              next,
              edge,
              minX,
              minY,
              maxX,
              maxY
            );
            if (intersection) {
              output.push(intersection);
            }
          }
          output.push(next);
        } else if (currentInside) {
          const intersection = this.lineIntersectEdge(
            current,
            next,
            edge,
            minX,
            minY,
            maxX,
            maxY
          );
          if (intersection) {
            output.push(intersection);
          }
        }
      }
    }

    return output;
  }

  /**
   * Check if a point is inside a clipping edge
   */
  private static isInsideEdge(
    point: Point,
    edge: { x: number; y: number; dx: number; dy: number },
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): boolean {
    if (edge.dx === 0 && edge.dy === 1) return point.x >= minX; // Left
    if (edge.dx === 1 && edge.dy === 0) return point.y <= maxY; // Top
    if (edge.dx === 0 && edge.dy === -1) return point.x <= maxX; // Right
    if (edge.dx === -1 && edge.dy === 0) return point.y >= minY; // Bottom
    return false;
  }

  /**
   * Find intersection of a line segment with a clipping edge
   */
  private static lineIntersectEdge(
    p1: Point,
    p2: Point,
    edge: { x: number; y: number; dx: number; dy: number },
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): Point | null {
    if (edge.dx === 0 && edge.dy === 1) {
      // Left edge (x = minX)
      const t = (minX - p1.x) / (p2.x - p1.x);
      if (t >= 0 && t <= 1) {
        return new Point(minX, p1.y + t * (p2.y - p1.y));
      }
    } else if (edge.dx === 1 && edge.dy === 0) {
      // Top edge (y = maxY)
      const t = (maxY - p1.y) / (p2.y - p1.y);
      if (t >= 0 && t <= 1) {
        return new Point(p1.x + t * (p2.x - p1.x), maxY);
      }
    } else if (edge.dx === 0 && edge.dy === -1) {
      // Right edge (x = maxX)
      const t = (maxX - p1.x) / (p2.x - p1.x);
      if (t >= 0 && t <= 1) {
        return new Point(maxX, p1.y + t * (p2.y - p1.y));
      }
    } else if (edge.dx === -1 && edge.dy === 0) {
      // Bottom edge (y = minY)
      const t = (minY - p1.y) / (p2.y - p1.y);
      if (t >= 0 && t <= 1) {
        return new Point(p1.x + t * (p2.x - p1.x), minY);
      }
    }
    return null;
  }

  /**
   * Get the Voronoi cell for a specific site
   *
   * @param site The site point
   * @returns Voronoi cell, or null if not found
   */
  getCell(site: Point): VoronoiCell | null {
    return this.cells.get(VoronoiDiagram.pointKey(site)) || null;
  }

  /**
   * Find the nearest site to a point
   *
   * @param point The query point
   * @returns Nearest site
   */
  nearestSite(point: Point): Point | null {
    let minDistance = Infinity;
    let nearest: Point | null = null;

    for (const [, cell] of this.cells) {
      const distance = point.distanceSquaredTo(cell.site);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = cell.site;
      }
    }

    return nearest;
  }

  /**
   * Create a unique key for a point
   */
  private static pointKey(point: Point): string {
    return `${point.x},${point.y}`;
  }

  /**
   * Create a unique key for an edge (order-independent)
   */
  private static edgeKey(p1: Point, p2: Point): string {
    const k1 = this.pointKey(p1);
    const k2 = this.pointKey(p2);
    return k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
  }

  /**
   * Check if two points are equal
   */
  private static pointsEqual(p1: Point, p2: Point): boolean {
    return p1.equals(p2);
  }

  /**
   * Get all sites in the diagram
   *
   * @returns Array of site points
   */
  getSites(): Point[] {
    return Array.from(this.cells.values()).map((cell) => cell.site);
  }

  /**
   * Calculate the area of a Voronoi cell
   *
   * @param site The site point
   * @returns Area of the cell, or 0 if not found
   */
  cellArea(site: Point): number {
    const cell = this.getCell(site);
    if (!cell || cell.vertices.length < 3) {
      return 0;
    }

    let area = 0;
    for (let i = 0; i < cell.vertices.length; i++) {
      const v1 = cell.vertices[i];
      const v2 = cell.vertices[(i + 1) % cell.vertices.length];
      area += v1.x * v2.y - v2.x * v1.y;
    }

    return Math.abs(area) / 2;
  }
}
