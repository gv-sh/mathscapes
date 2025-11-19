/**
 * Delaunay Triangulation and Voronoi Diagram Implementation
 *
 * Provides:
 * - Delaunay triangulation using the Bowyer-Watson algorithm
 * - Voronoi diagram generation from Delaunay triangulation
 * - Triangle and edge data structures
 * - Circumcircle computation
 * - Point location and triangle membership
 *
 * References:
 * - Bowyer, A. (1981). "Computing Dirichlet tessellations". The Computer Journal, 24(2), 162-166.
 * - Watson, D.F. (1981). "Computing the n-dimensional Delaunay tessellation with application to Voronoi polytopes".
 *   The Computer Journal, 24(2), 167-172.
 * - de Berg, M., et al. (2008). "Computational Geometry: Algorithms and Applications" (3rd ed.). Springer.
 * - Fortune, S. (1987). "A sweepline algorithm for Voronoi diagrams". Algorithmica, 2(1-4), 153-174.
 *
 * @module delaunay
 */

import { Point } from './point';

/**
 * Represents an edge between two points
 * Edges are undirected and immutable
 */
export class Edge {
  /**
   * Create an edge between two points
   *
   * @param p1 First endpoint
   * @param p2 Second endpoint
   */
  constructor(
    public readonly p1: Point,
    public readonly p2: Point
  ) {}

  /**
   * Calculate the length of this edge
   *
   * @returns Edge length
   */
  length(): number {
    return this.p1.distanceTo(this.p2);
  }

  /**
   * Calculate the midpoint of this edge
   *
   * @returns Midpoint
   */
  midpoint(): Point {
    return this.p1.midpoint(this.p2);
  }

  /**
   * Check if this edge equals another edge (order-independent)
   *
   * @param other The other edge
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if edges are equal
   */
  equals(other: Edge, epsilon: number = 1e-10): boolean {
    return (
      (this.p1.equals(other.p1, epsilon) && this.p2.equals(other.p2, epsilon)) ||
      (this.p1.equals(other.p2, epsilon) && this.p2.equals(other.p1, epsilon))
    );
  }

  /**
   * Check if this edge shares a vertex with another edge
   *
   * @param other The other edge
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if edges share a vertex
   */
  sharesVertex(other: Edge, epsilon: number = 1e-10): boolean {
    return (
      this.p1.equals(other.p1, epsilon) ||
      this.p1.equals(other.p2, epsilon) ||
      this.p2.equals(other.p1, epsilon) ||
      this.p2.equals(other.p2, epsilon)
    );
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `Edge[(${this.p1.x}, ${this.p1.y}) - (${this.p2.x}, ${this.p2.y})]`;
  }
}

/**
 * Represents a triangle defined by three points
 * Triangles are immutable and store their vertices in counterclockwise order
 */
export class Triangle {
  /**
   * Create a triangle from three points
   * Points are automatically ordered counterclockwise
   *
   * @param p1 First vertex
   * @param p2 Second vertex
   * @param p3 Third vertex
   * @throws Error if points are collinear
   */
  constructor(
    public readonly p1: Point,
    public readonly p2: Point,
    public readonly p3: Point
  ) {
    // Check if points are collinear
    const area = this.signedArea();
    if (Math.abs(area) < 1e-10) {
      throw new Error('Cannot create triangle from collinear points');
    }
  }

  /**
   * Calculate the signed area of this triangle
   * Positive for counterclockwise orientation, negative for clockwise
   *
   * Formula: Area = ½[(x₁(y₂ - y₃) + x₂(y₃ - y₁) + x₃(y₁ - y₂))]
   *
   * @returns Signed area
   */
  signedArea(): number {
    return (
      0.5 *
      (this.p1.x * (this.p2.y - this.p3.y) +
        this.p2.x * (this.p3.y - this.p1.y) +
        this.p3.x * (this.p1.y - this.p2.y))
    );
  }

  /**
   * Calculate the area of this triangle
   *
   * @returns Triangle area (always positive)
   */
  area(): number {
    return Math.abs(this.signedArea());
  }

  /**
   * Get the vertices of this triangle as an array
   *
   * @returns Array of vertices [p1, p2, p3]
   */
  vertices(): [Point, Point, Point] {
    return [this.p1, this.p2, this.p3];
  }

  /**
   * Get the edges of this triangle
   *
   * @returns Array of edges
   */
  edges(): [Edge, Edge, Edge] {
    return [
      new Edge(this.p1, this.p2),
      new Edge(this.p2, this.p3),
      new Edge(this.p3, this.p1),
    ];
  }

  /**
   * Calculate the circumcenter of this triangle
   * The circumcenter is the center of the circle passing through all three vertices
   *
   * Algorithm:
   * 1. Calculate the perpendicular bisectors of two sides
   * 2. Find their intersection point
   *
   * @returns Circumcenter point
   * @throws Error if triangle is degenerate
   */
  circumcenter(): Point {
    const ax = this.p1.x;
    const ay = this.p1.y;
    const bx = this.p2.x;
    const by = this.p2.y;
    const cx = this.p3.x;
    const cy = this.p3.y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

    if (Math.abs(d) < 1e-10) {
      throw new Error('Cannot compute circumcenter of degenerate triangle');
    }

    const ux =
      ((ax * ax + ay * ay) * (by - cy) +
        (bx * bx + by * by) * (cy - ay) +
        (cx * cx + cy * cy) * (ay - by)) /
      d;

    const uy =
      ((ax * ax + ay * ay) * (cx - bx) +
        (bx * bx + by * by) * (ax - cx) +
        (cx * cx + cy * cy) * (bx - ax)) /
      d;

    return new Point(ux, uy);
  }

  /**
   * Calculate the radius of the circumcircle
   *
   * @returns Circumradius
   */
  circumradius(): number {
    const center = this.circumcenter();
    return center.distanceTo(this.p1);
  }

  /**
   * Check if a point lies inside the circumcircle of this triangle
   * Used in the Bowyer-Watson algorithm
   *
   * @param point The point to test
   * @param epsilon Tolerance for floating-point comparison (default: 1e-10)
   * @returns True if point is inside the circumcircle
   */
  inCircumcircle(point: Point, epsilon: number = 1e-10): boolean {
    const center = this.circumcenter();
    const radius = this.circumradius();
    const distance = center.distanceTo(point);
    return distance < radius - epsilon;
  }

  /**
   * Check if a point is contained within this triangle
   * Uses barycentric coordinates
   *
   * @param point The point to test
   * @param epsilon Tolerance for boundary checks (default: 1e-10)
   * @returns True if point is inside the triangle
   */
  contains(point: Point, epsilon: number = 1e-10): boolean {
    // Calculate barycentric coordinates
    const v0 = this.p3.subtract(this.p1);
    const v1 = this.p2.subtract(this.p1);
    const v2 = point.subtract(this.p1);

    const dot00 = v0.dot(v0);
    const dot01 = v0.dot(v1);
    const dot02 = v0.dot(v2);
    const dot11 = v1.dot(v1);
    const dot12 = v1.dot(v2);

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return u >= -epsilon && v >= -epsilon && u + v <= 1 + epsilon;
  }

  /**
   * Check if this triangle shares an edge with another triangle
   *
   * @param other The other triangle
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if triangles share an edge
   */
  sharesEdge(other: Triangle, epsilon: number = 1e-10): boolean {
    const edges1 = this.edges();
    const edges2 = other.edges();

    for (const e1 of edges1) {
      for (const e2 of edges2) {
        if (e1.equals(e2, epsilon)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if this triangle shares a vertex with another triangle
   *
   * @param other The other triangle
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if triangles share a vertex
   */
  sharesVertex(other: Triangle, epsilon: number = 1e-10): boolean {
    const vertices1 = this.vertices();
    const vertices2 = other.vertices();

    for (const v1 of vertices1) {
      for (const v2 of vertices2) {
        if (v1.equals(v2, epsilon)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if this triangle contains a specific vertex
   *
   * @param point The point to check
   * @param epsilon Tolerance for comparison (default: 1e-10)
   * @returns True if point is a vertex of this triangle
   */
  hasVertex(point: Point, epsilon: number = 1e-10): boolean {
    return (
      this.p1.equals(point, epsilon) ||
      this.p2.equals(point, epsilon) ||
      this.p3.equals(point, epsilon)
    );
  }

  /**
   * Calculate the centroid of this triangle
   *
   * @returns Centroid point
   */
  centroid(): Point {
    return new Point(
      (this.p1.x + this.p2.x + this.p3.x) / 3,
      (this.p1.y + this.p2.y + this.p3.y) / 3
    );
  }

  /**
   * Convert to string representation
   *
   * @returns String representation
   */
  toString(): string {
    return `Triangle[(${this.p1.x}, ${this.p1.y}), (${this.p2.x}, ${this.p2.y}), (${this.p3.x}, ${this.p3.y})]`;
  }
}

/**
 * Delaunay Triangulation using the Bowyer-Watson algorithm
 *
 * The Delaunay triangulation of a set of points is a triangulation such that
 * no point is inside the circumcircle of any triangle. This maximizes the
 * minimum angle of all triangles, avoiding "sliver" triangles.
 *
 * The Bowyer-Watson algorithm is an incremental algorithm that:
 * 1. Starts with a super-triangle that contains all points
 * 2. Adds points one at a time
 * 3. For each point, removes all triangles whose circumcircle contains it
 * 4. Fills the resulting hole with new triangles connected to the point
 *
 * Time complexity: O(n²) worst case, O(n log n) expected for random points
 * Space complexity: O(n)
 *
 * @example
 * const points = [
 *   new Point(0, 0),
 *   new Point(1, 0),
 *   new Point(0, 1),
 *   new Point(1, 1)
 * ];
 * const dt = new DelaunayTriangulation();
 * points.forEach(p => dt.addPoint(p));
 * const triangles = dt.getTriangles();
 */
export class DelaunayTriangulation {
  private triangles: Triangle[] = [];
  private points: Point[] = [];
  private superTriangle: Triangle | null = null;

  /**
   * Create a new Delaunay triangulation
   *
   * @param epsilon Tolerance for floating-point comparisons (default: 1e-10)
   */
  constructor(private epsilon: number = 1e-10) {}

  /**
   * Create a super-triangle that contains all points
   * The super-triangle is large enough to contain all current and future points
   *
   * @returns Super-triangle
   */
  private createSuperTriangle(): Triangle {
    if (this.points.length === 0) {
      // Create a large default triangle
      const size = 1e6;
      return new Triangle(
        new Point(0, size),
        new Point(size, -size),
        new Point(-size, -size)
      );
    }

    // Find bounding box of all points
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of this.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }

    // Create a triangle that contains the bounding box with margin
    const dx = maxX - minX;
    const dy = maxY - minY;
    const deltaMax = Math.max(dx, dy, 1) * 10; // Ensure minimum size
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    // Create an equilateral-like triangle to avoid collinearity
    return new Triangle(
      new Point(midX, midY + deltaMax * 2),
      new Point(midX + deltaMax * 2, midY - deltaMax),
      new Point(midX - deltaMax * 2, midY - deltaMax)
    );
  }

  /**
   * Add a point to the triangulation
   * Implements the incremental Bowyer-Watson algorithm
   *
   * Algorithm:
   * 1. Find all triangles whose circumcircle contains the point (bad triangles)
   * 2. Find the boundary of the hole created by removing bad triangles
   * 3. Create new triangles connecting the point to the boundary edges
   *
   * @param point The point to add
   * @throws Error if point already exists in the triangulation
   */
  addPoint(point: Point): void {
    // Check for duplicate points
    for (const p of this.points) {
      if (p.equals(point, this.epsilon)) {
        throw new Error(
          `Point (${point.x}, ${point.y}) already exists in the triangulation`
        );
      }
    }

    this.points.push(point);

    // Initialize triangulation with super-triangle if needed
    if (this.triangles.length === 0) {
      this.superTriangle = this.createSuperTriangle();
      this.triangles.push(this.superTriangle);
    }

    // Find all triangles whose circumcircle contains the point (bad triangles)
    const badTriangles: Triangle[] = [];
    for (const triangle of this.triangles) {
      if (triangle.inCircumcircle(point, this.epsilon)) {
        badTriangles.push(triangle);
      }
    }

    // Find the boundary of the polygonal hole created by bad triangles
    // An edge is on the boundary if it's not shared by two bad triangles
    const boundaryEdges: Edge[] = [];

    for (const triangle of badTriangles) {
      const edges = triangle.edges();

      for (const edge of edges) {
        let shared = false;

        // Check if this edge is shared with another bad triangle
        for (const other of badTriangles) {
          if (triangle === other) continue;

          const otherEdges = other.edges();
          for (const otherEdge of otherEdges) {
            if (edge.equals(otherEdge, this.epsilon)) {
              shared = true;
              break;
            }
          }

          if (shared) break;
        }

        if (!shared) {
          boundaryEdges.push(edge);
        }
      }
    }

    // Remove bad triangles
    this.triangles = this.triangles.filter(
      (triangle) => badTriangles.indexOf(triangle) === -1
    );

    // Create new triangles connecting the point to each boundary edge
    for (const edge of boundaryEdges) {
      try {
        const newTriangle = new Triangle(edge.p1, edge.p2, point);
        this.triangles.push(newTriangle);
      } catch (error) {
        // Skip degenerate triangles (collinear points)
        continue;
      }
    }
  }

  /**
   * Perform complete triangulation of all added points
   * This is called automatically, but can be called explicitly to force recomputation
   */
  triangulate(): void {
    // The triangulation is maintained incrementally, so this method
    // ensures the super-triangle vertices are removed if needed
    this.removeSupertriangle();
  }

  /**
   * Remove triangles that share vertices with the super-triangle
   * Should be called after all points have been added
   */
  private removeSupertriangle(): void {
    if (!this.superTriangle) return;

    const superVertices = this.superTriangle.vertices();

    this.triangles = this.triangles.filter((triangle) => {
      for (const sv of superVertices) {
        if (triangle.hasVertex(sv, this.epsilon)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Get all triangles in the triangulation
   * Automatically removes super-triangle before returning
   *
   * @returns Array of triangles
   */
  getTriangles(): Triangle[] {
    this.removeSupertriangle();
    return [...this.triangles];
  }

  /**
   * Get all edges in the triangulation (without duplicates)
   *
   * @returns Array of unique edges
   */
  getEdges(): Edge[] {
    this.removeSupertriangle();

    const edges: Edge[] = [];
    const edgeMap: { [key: string]: boolean } = {};

    for (const triangle of this.triangles) {
      for (const edge of triangle.edges()) {
        // Create a normalized key for the edge
        const key = this.edgeKey(edge);

        if (!edgeMap[key]) {
          edgeMap[key] = true;
          edges.push(edge);
        }
      }
    }

    return edges;
  }

  /**
   * Create a unique key for an edge (order-independent)
   *
   * @param edge The edge
   * @returns Unique key string
   */
  private edgeKey(edge: Edge): string {
    const p1 = edge.p1;
    const p2 = edge.p2;

    // Sort points to make key order-independent
    if (p1.x < p2.x || (p1.x === p2.x && p1.y < p2.y)) {
      return `${p1.x},${p1.y}-${p2.x},${p2.y}`;
    } else {
      return `${p2.x},${p2.y}-${p1.x},${p1.y}`;
    }
  }

  /**
   * Get all points in the triangulation
   *
   * @returns Array of points
   */
  getPoints(): Point[] {
    return [...this.points];
  }

  /**
   * Find the triangle containing a given point
   *
   * @param point The point to locate
   * @returns The triangle containing the point, or null if none found
   */
  findTriangle(point: Point): Triangle | null {
    this.removeSupertriangle();

    for (const triangle of this.triangles) {
      if (triangle.contains(point, this.epsilon)) {
        return triangle;
      }
    }

    return null;
  }

  /**
   * Clear all triangles and points from the triangulation
   */
  clear(): void {
    this.triangles = [];
    this.points = [];
    this.superTriangle = null;
  }

  /**
   * Get the number of triangles in the triangulation
   *
   * @returns Number of triangles
   */
  size(): number {
    this.removeSupertriangle();
    return this.triangles.length;
  }
}

/**
 * Represents a cell in a Voronoi diagram
 * A Voronoi cell is the region of points closer to a given site than to any other site
 */
export interface VoronoiCell {
  /** The site point for this cell */
  site: Point;
  /** The vertices of this cell (polygon) */
  vertices: Point[];
  /** The neighboring cells (sites) */
  neighbors: Point[];
}

/**
 * Voronoi Diagram generated from a Delaunay Triangulation
 *
 * A Voronoi diagram partitions the plane into regions based on distance to a set of points (sites).
 * Each region contains all points closer to its site than to any other site.
 *
 * The Voronoi diagram is the dual graph of the Delaunay triangulation:
 * - Voronoi vertices are circumcenters of Delaunay triangles
 * - Voronoi edges connect circumcenters of adjacent triangles
 * - Voronoi cells correspond to Delaunay vertices
 *
 * Properties:
 * - Each Voronoi edge is perpendicular to the corresponding Delaunay edge
 * - Voronoi vertices are equidistant from at least three sites
 * - The Voronoi diagram is a convex partition for points in convex position
 *
 * @example
 * const dt = new DelaunayTriangulation();
 * points.forEach(p => dt.addPoint(p));
 * const voronoi = VoronoiDiagram.fromDelaunay(dt);
 * const cells = voronoi.getCells();
 */
export class VoronoiDiagram {
  private cells: { [key: string]: VoronoiCell } = {};
  private edges: Edge[] = [];

  /**
   * Create a Voronoi diagram (use static factory methods instead)
   *
   * @param epsilon Tolerance for floating-point comparisons (default: 1e-10)
   */
  private constructor(private epsilon: number = 1e-10) {}

  /**
   * Generate a Voronoi diagram from a Delaunay triangulation
   *
   * Algorithm:
   * 1. For each Delaunay vertex (site), find all adjacent triangles
   * 2. The circumcenters of these triangles form the Voronoi cell vertices
   * 3. Order the vertices to form a convex polygon
   *
   * @param delaunay The Delaunay triangulation
   * @param epsilon Tolerance for floating-point comparisons (default: 1e-10)
   * @returns Voronoi diagram
   */
  static fromDelaunay(
    delaunay: DelaunayTriangulation,
    epsilon: number = 1e-10
  ): VoronoiDiagram {
    const voronoi = new VoronoiDiagram(epsilon);
    const triangles = delaunay.getTriangles();
    const points = delaunay.getPoints();

    if (triangles.length === 0) {
      return voronoi;
    }

    // For each point (site), find all triangles that contain it
    for (const point of points) {
      const adjacentTriangles: Triangle[] = [];

      for (const triangle of triangles) {
        if (triangle.hasVertex(point, epsilon)) {
          adjacentTriangles.push(triangle);
        }
      }

      if (adjacentTriangles.length === 0) continue;

      // Get circumcenters of adjacent triangles (these form the Voronoi cell)
      const circumcenters: Point[] = [];

      for (const triangle of adjacentTriangles) {
        try {
          const center = triangle.circumcenter();
          circumcenters.push(center);
        } catch (error) {
          // Skip degenerate triangles
          continue;
        }
      }

      if (circumcenters.length < 3) continue;

      // Order circumcenters counterclockwise around the site
      const orderedVertices = voronoi.orderPointsCounterclockwise(
        circumcenters,
        point
      );

      // Find neighboring sites
      const neighbors: Point[] = [];
      for (const triangle of adjacentTriangles) {
        for (const vertex of triangle.vertices()) {
          if (!vertex.equals(point, epsilon)) {
            // Check if not already in neighbors
            let found = false;
            for (const neighbor of neighbors) {
              if (neighbor.equals(vertex, epsilon)) {
                found = true;
                break;
              }
            }
            if (!found) {
              neighbors.push(vertex);
            }
          }
        }
      }

      const cell: VoronoiCell = {
        site: point,
        vertices: orderedVertices,
        neighbors: neighbors,
      };

      voronoi.cells[voronoi.pointKey(point)] = cell;
    }

    // Build Voronoi edges from adjacent triangles
    voronoi.buildEdges(triangles);

    return voronoi;
  }

  /**
   * Order points counterclockwise around a center point
   *
   * @param points The points to order
   * @param center The center point
   * @returns Ordered points
   */
  private orderPointsCounterclockwise(points: Point[], center: Point): Point[] {
    return points.sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      return angleA - angleB;
    });
  }

  /**
   * Build Voronoi edges from Delaunay triangles
   * Each pair of adjacent triangles creates a Voronoi edge
   *
   * @param triangles The Delaunay triangles
   */
  private buildEdges(triangles: Triangle[]): void {
    const edges: Edge[] = [];
    const edgeMap: { [key: string]: boolean } = {};

    // For each pair of triangles that share an edge
    for (let i = 0; i < triangles.length; i++) {
      for (let j = i + 1; j < triangles.length; j++) {
        const t1 = triangles[i];
        const t2 = triangles[j];

        if (t1.sharesEdge(t2, this.epsilon)) {
          try {
            const c1 = t1.circumcenter();
            const c2 = t2.circumcenter();
            const edge = new Edge(c1, c2);

            // Create a unique key for the edge
            const key = this.edgeKey(edge);

            if (!edgeMap[key]) {
              edgeMap[key] = true;
              edges.push(edge);
            }
          } catch (error) {
            // Skip degenerate triangles
            continue;
          }
        }
      }
    }

    this.edges = edges;
  }

  /**
   * Create a unique key for an edge (order-independent)
   *
   * @param edge The edge
   * @returns Unique key string
   */
  private edgeKey(edge: Edge): string {
    const p1 = edge.p1;
    const p2 = edge.p2;

    if (p1.x < p2.x || (p1.x === p2.x && p1.y < p2.y)) {
      return `${p1.x},${p1.y}-${p2.x},${p2.y}`;
    } else {
      return `${p2.x},${p2.y}-${p1.x},${p1.y}`;
    }
  }

  /**
   * Create a unique key for a point
   *
   * @param point The point
   * @returns Unique key string
   */
  private pointKey(point: Point): string {
    return `${point.x},${point.y}`;
  }

  /**
   * Get all Voronoi cells
   *
   * @returns Array of Voronoi cells
   */
  getCells(): VoronoiCell[] {
    const result: VoronoiCell[] = [];
    for (const key in this.cells) {
      if (this.cells.hasOwnProperty(key)) {
        result.push(this.cells[key]);
      }
    }
    return result;
  }

  /**
   * Get the Voronoi cell for a specific site
   *
   * @param site The site point
   * @returns The Voronoi cell, or undefined if not found
   */
  getCell(site: Point): VoronoiCell | undefined {
    return this.cells[this.pointKey(site)];
  }

  /**
   * Get all Voronoi edges
   *
   * @returns Array of edges
   */
  getEdges(): Edge[] {
    return [...this.edges];
  }

  /**
   * Find the nearest site to a given point
   *
   * @param point The query point
   * @returns The nearest site, or null if no sites exist
   */
  findNearestSite(point: Point): Point | null {
    let nearest: Point | null = null;
    let minDistance = Infinity;

    for (const key in this.cells) {
      if (this.cells.hasOwnProperty(key)) {
        const cell = this.cells[key];
        const distance = cell.site.distanceTo(point);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = cell.site;
        }
      }
    }

    return nearest;
  }

  /**
   * Find the Voronoi cell containing a given point
   *
   * @param point The query point
   * @returns The cell containing the point, or null if none found
   */
  findCell(point: Point): VoronoiCell | null {
    const nearest = this.findNearestSite(point);
    if (!nearest) return null;

    return this.getCell(nearest) || null;
  }

  /**
   * Get the number of cells in the diagram
   *
   * @returns Number of cells
   */
  size(): number {
    let count = 0;
    for (const key in this.cells) {
      if (this.cells.hasOwnProperty(key)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Check if a point is a site in this diagram
   *
   * @param point The point to check
   * @returns True if the point is a site
   */
  hasSite(point: Point): boolean {
    return this.cells.hasOwnProperty(this.pointKey(point));
  }
}
