/**
 * 3D Geometry Module
 *
 * Comprehensive 3D geometry primitives and operations
 */

export { Point3D } from './point3d';
export { Ray } from './ray';
export { Plane } from './plane';
export { Sphere } from './sphere';
export { AABB } from './aabb';
export { OBB } from './obb';
export {
  Mesh,
  Triangle,
  triangleArea,
  triangleNormal,
  closestPointOnTriangle,
  barycentricCoordinates,
  pointInTriangle,
  rayTriangleIntersection,
} from './mesh';
