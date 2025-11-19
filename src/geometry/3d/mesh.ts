/**
 * Mesh utilities for 3D geometry
 *
 * Provides operations for triangulated meshes:
 * - Closest point on triangle
 * - Closest point on mesh
 * - Ray-triangle intersection
 * - Triangle area and normal calculation
 */

import { Point3D } from './point3d';

/**
 * Triangle represented by three vertices
 */
export interface Triangle {
  a: Point3D;
  b: Point3D;
  c: Point3D;
}

/**
 * Mesh represented by an array of triangles
 */
export class Mesh {
  constructor(public readonly triangles: Triangle[]) {
    if (triangles.length === 0) {
      throw new Error('Mesh must contain at least one triangle');
    }
  }

  /**
   * Create a mesh from vertices and triangle indices
   *
   * @param vertices Array of vertex positions
   * @param indices Array of triangle indices (3 per triangle)
   * @returns New mesh
   */
  static fromIndexed(vertices: Point3D[], indices: number[]): Mesh {
    if (indices.length % 3 !== 0) {
      throw new Error('Indices array length must be a multiple of 3');
    }

    const triangles: Triangle[] = [];
    for (let i = 0; i < indices.length; i += 3) {
      triangles.push({
        a: vertices[indices[i]],
        b: vertices[indices[i + 1]],
        c: vertices[indices[i + 2]],
      });
    }

    return new Mesh(triangles);
  }

  /**
   * Find the closest point on the mesh to a given point
   *
   * @param point The point
   * @returns Object with closest point and distance
   */
  closestPointTo(point: Point3D): { point: Point3D; distance: number } {
    let minDistance = Infinity;
    let closestPoint = this.triangles[0].a;

    for (const triangle of this.triangles) {
      const closest = closestPointOnTriangle(point, triangle);
      const distance = point.distanceTo(closest);

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = closest;
      }
    }

    return { point: closestPoint, distance: minDistance };
  }

  /**
   * Calculate the total surface area of the mesh
   *
   * @returns Surface area
   */
  surfaceArea(): number {
    let area = 0;
    for (const triangle of this.triangles) {
      area += triangleArea(triangle);
    }
    return area;
  }

  /**
   * Check if a ray intersects the mesh
   *
   * @param rayOrigin Ray origin
   * @param rayDirection Ray direction (should be normalized)
   * @returns Array of intersection points and triangle indices
   */
  intersectRay(
    rayOrigin: Point3D,
    rayDirection: Point3D
  ): Array<{ point: Point3D; triangleIndex: number; distance: number }> {
    const intersections: Array<{ point: Point3D; triangleIndex: number; distance: number }> = [];

    for (let i = 0; i < this.triangles.length; i++) {
      const intersection = rayTriangleIntersection(rayOrigin, rayDirection, this.triangles[i]);
      if (intersection) {
        intersections.push({
          point: intersection.point,
          triangleIndex: i,
          distance: intersection.distance,
        });
      }
    }

    // Sort by distance
    intersections.sort((a, b) => a.distance - b.distance);

    return intersections;
  }
}

/**
 * Calculate the area of a triangle
 * Formula: 0.5 * |AB × AC|
 *
 * @param triangle The triangle
 * @returns Area
 *
 * @example
 * const tri = {
 *   a: new Point3D(0, 0, 0),
 *   b: new Point3D(1, 0, 0),
 *   c: new Point3D(0, 1, 0)
 * };
 * triangleArea(tri); // 0.5
 */
export function triangleArea(triangle: Triangle): number {
  const ab = triangle.b.subtract(triangle.a);
  const ac = triangle.c.subtract(triangle.a);
  return ab.cross(ac).magnitude() / 2;
}

/**
 * Calculate the normal of a triangle
 * Formula: normalize(AB × AC)
 *
 * @param triangle The triangle
 * @returns Normal vector (unit length)
 *
 * @example
 * const tri = {
 *   a: new Point3D(0, 0, 0),
 *   b: new Point3D(1, 0, 0),
 *   c: new Point3D(0, 1, 0)
 * };
 * triangleNormal(tri); // Point3D(0, 0, 1)
 */
export function triangleNormal(triangle: Triangle): Point3D {
  const ab = triangle.b.subtract(triangle.a);
  const ac = triangle.c.subtract(triangle.a);
  return ab.cross(ac).normalize();
}

/**
 * Find the closest point on a triangle to a given point
 *
 * @param point The point
 * @param triangle The triangle
 * @returns Closest point on the triangle
 *
 * @example
 * const tri = {
 *   a: new Point3D(0, 0, 0),
 *   b: new Point3D(1, 0, 0),
 *   c: new Point3D(0, 1, 0)
 * };
 * closestPointOnTriangle(new Point3D(0.5, 0.5, 1), tri);
 */
export function closestPointOnTriangle(point: Point3D, triangle: Triangle): Point3D {
  const { a, b, c } = triangle;

  // Check if point is in vertex region outside A
  const ab = b.subtract(a);
  const ac = c.subtract(a);
  const ap = point.subtract(a);
  const d1 = ab.dot(ap);
  const d2 = ac.dot(ap);
  if (d1 <= 0 && d2 <= 0) {
    return a; // Vertex region A
  }

  // Check if point is in vertex region outside B
  const bp = point.subtract(b);
  const d3 = ab.dot(bp);
  const d4 = ac.dot(bp);
  if (d3 >= 0 && d4 <= d3) {
    return b; // Vertex region B
  }

  // Check if point is in edge region of AB
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return a.add(ab.scale(v)); // Edge AB
  }

  // Check if point is in vertex region outside C
  const cp = point.subtract(c);
  const d5 = ab.dot(cp);
  const d6 = ac.dot(cp);
  if (d6 >= 0 && d5 <= d6) {
    return c; // Vertex region C
  }

  // Check if point is in edge region of AC
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return a.add(ac.scale(w)); // Edge AC
  }

  // Check if point is in edge region of BC
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    return b.add(c.subtract(b).scale(w)); // Edge BC
  }

  // Point is inside triangle face region
  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  return a.add(ab.scale(v)).add(ac.scale(w));
}

/**
 * Find the barycentric coordinates of a point on a triangle
 *
 * @param point The point
 * @param triangle The triangle
 * @returns Barycentric coordinates [u, v, w] where point = u*a + v*b + w*c
 */
export function barycentricCoordinates(
  point: Point3D,
  triangle: Triangle
): [number, number, number] {
  const { a, b, c } = triangle;

  const v0 = b.subtract(a);
  const v1 = c.subtract(a);
  const v2 = point.subtract(a);

  const d00 = v0.dot(v0);
  const d01 = v0.dot(v1);
  const d11 = v1.dot(v1);
  const d20 = v2.dot(v0);
  const d21 = v2.dot(v1);

  const denom = d00 * d11 - d01 * d01;

  const v = (d11 * d20 - d01 * d21) / denom;
  const w = (d00 * d21 - d01 * d20) / denom;
  const u = 1 - v - w;

  return [u, v, w];
}

/**
 * Check if a point is inside a triangle (coplanar test)
 *
 * @param point The point
 * @param triangle The triangle
 * @param epsilon Tolerance (default: 1e-10)
 * @returns True if point is inside the triangle
 */
export function pointInTriangle(
  point: Point3D,
  triangle: Triangle,
  epsilon = 1e-10
): boolean {
  const [u, v, w] = barycentricCoordinates(point, triangle);
  return u >= -epsilon && v >= -epsilon && w >= -epsilon;
}

/**
 * Find ray-triangle intersection using the Möller-Trumbore algorithm
 *
 * @param rayOrigin Ray origin
 * @param rayDirection Ray direction (should be normalized)
 * @param triangle The triangle
 * @returns Intersection point and distance, or null if no intersection
 */
export function rayTriangleIntersection(
  rayOrigin: Point3D,
  rayDirection: Point3D,
  triangle: Triangle
): { point: Point3D; distance: number } | null {
  const { a, b, c } = triangle;
  const epsilon = 1e-10;

  const edge1 = b.subtract(a);
  const edge2 = c.subtract(a);
  const h = rayDirection.cross(edge2);
  const det = edge1.dot(h);

  // Ray is parallel to triangle
  if (Math.abs(det) < epsilon) {
    return null;
  }

  const invDet = 1 / det;
  const s = rayOrigin.subtract(a);
  const u = invDet * s.dot(h);

  if (u < 0 || u > 1) {
    return null;
  }

  const q = s.cross(edge1);
  const v = invDet * rayDirection.dot(q);

  if (v < 0 || u + v > 1) {
    return null;
  }

  const t = invDet * edge2.dot(q);

  // Intersection is behind the ray
  if (t < epsilon) {
    return null;
  }

  const point = rayOrigin.add(rayDirection.scale(t));
  return { point, distance: t };
}
