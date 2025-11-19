/**
 * Computational Geometry Module
 *
 * Provides comprehensive 2D and 3D geometry primitives and algorithms:
 * - 2D: Point, Line, Segment, Polygon operations
 * - 3D: Point3D, Ray, Plane, Sphere, AABB, OBB, Mesh operations
 * - Algorithms: Delaunay triangulation, Voronoi diagrams, Boolean operations
 * - Spatial structures: Quadtree, Octree, KD-tree
 */

// 2D Geometry
export { Point } from './point';
export { Line, Segment } from './line';
export { Polygon } from './polygon';

// 3D Geometry
export * from './3d';

// Advanced Algorithms
export * from './algorithms';
