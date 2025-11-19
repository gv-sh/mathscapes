/**
 * Computational Geometry Module
 *
 * Provides comprehensive 2D and 3D geometry primitives and algorithms:
 *
 * 2D Geometry:
 * - Point operations (distance, rotation, reflection, polar/Cartesian)
 * - Line and segment operations (intersection, distance, parallel/perpendicular)
 * - Polygon operations (area, centroid, point-in-polygon, convex hull, triangulation)
 * - Delaunay triangulation and Voronoi diagrams
 *
 * 3D Geometry:
 * - Plane, Sphere operations
 * - Bounding boxes (AABB, OBB)
 * - Ray-primitive intersections
 *
 * Spatial Data Structures:
 * - Quadtree (2D space partitioning)
 * - Octree (3D space partitioning)
 * - KD-Tree (k-dimensional nearest neighbor search)
 */

// 2D Geometry
export { Point } from './point';
export { Line, Segment } from './line';
export { Polygon } from './polygon';
export { Triangle, Edge, DelaunayTriangulation, VoronoiDiagram } from './delaunay';
export type { VoronoiCell } from './delaunay';

// 3D Geometry
export {
    Point3D,
    Vector3D,
    Ray,
    Plane,
    Sphere,
    AABB,
    OBB
} from './geometry3d';

// Spatial Data Structures
export {
    Rectangle,
    BoundingBox,
    Quadtree,
    QuadtreeNode,
    Octree,
    OctreeNode,
    KDTree,
    KDNode
} from './spatial';
