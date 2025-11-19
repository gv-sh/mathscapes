/**
 * Example usage of Delaunay Triangulation and Voronoi Diagram
 */

import { Point, DelaunayTriangulation, VoronoiDiagram } from '../src/geometry';

// Create a set of points
const points = [
  new Point(0, 0),
  new Point(4, 0),
  new Point(4, 3),
  new Point(0, 3),
  new Point(2, 1.5),
  new Point(1, 1),
  new Point(3, 2),
];

console.log('Creating Delaunay triangulation...');

// Create Delaunay triangulation
const delaunay = new DelaunayTriangulation();

// Add all points
points.forEach((point, index) => {
  console.log(`Adding point ${index + 1}: (${point.x}, ${point.y})`);
  delaunay.addPoint(point);
});

// Get triangles
const triangles = delaunay.getTriangles();
console.log(`\nDelaunay Triangulation complete!`);
console.log(`Number of triangles: ${triangles.length}`);

// Display triangles
triangles.forEach((triangle, index) => {
  const [p1, p2, p3] = triangle.vertices();
  console.log(
    `Triangle ${index + 1}: ` +
      `(${p1.x}, ${p1.y}), (${p2.x}, ${p2.y}), (${p3.x}, ${p3.y})`
  );
  console.log(`  Area: ${triangle.area().toFixed(2)}`);
  const center = triangle.circumcenter();
  console.log(
    `  Circumcenter: (${center.x.toFixed(2)}, ${center.y.toFixed(2)})`
  );
  console.log(`  Circumradius: ${triangle.circumradius().toFixed(2)}`);
});

// Get edges
const edges = delaunay.getEdges();
console.log(`\nNumber of unique edges: ${edges.length}`);

console.log('\n============================================================');
console.log('Creating Voronoi diagram...');
console.log('============================================================');

// Create Voronoi diagram from Delaunay triangulation
const voronoi = VoronoiDiagram.fromDelaunay(delaunay);

// Get cells
const cells = voronoi.getCells();
console.log(`\nVoronoi Diagram complete!`);
console.log(`Number of cells: ${cells.length}`);

// Display cells
cells.forEach((cell, index) => {
  console.log(
    `\nCell ${index + 1} (site: ${cell.site.x}, ${cell.site.y}):`
  );
  console.log(`  Number of vertices: ${cell.vertices.length}`);
  console.log(`  Vertices:`);
  cell.vertices.forEach((vertex) => {
    console.log(`    (${vertex.x.toFixed(2)}, ${vertex.y.toFixed(2)})`);
  });
  console.log(`  Number of neighbors: ${cell.neighbors.length}`);
  console.log(`  Neighbors:`);
  cell.neighbors.forEach((neighbor) => {
    console.log(`    (${neighbor.x}, ${neighbor.y})`);
  });
});

// Get Voronoi edges
const voronoiEdges = voronoi.getEdges();
console.log(`\nNumber of Voronoi edges: ${voronoiEdges.length}`);

// Test point location
const testPoint = new Point(2, 2);
console.log(`\n============================================================`);
console.log(`Testing point location for (${testPoint.x}, ${testPoint.y})`);
console.log('============================================================');

const containingTriangle = delaunay.findTriangle(testPoint);
if (containingTriangle) {
  const [p1, p2, p3] = containingTriangle.vertices();
  console.log(
    `Point is inside triangle: ` +
      `(${p1.x}, ${p1.y}), (${p2.x}, ${p2.y}), (${p3.x}, ${p3.y})`
  );
}

const nearestSite = voronoi.findNearestSite(testPoint);
if (nearestSite) {
  console.log(
    `Nearest site: (${nearestSite.x}, ${nearestSite.y})`
  );
  const distance = testPoint.distanceTo(nearestSite);
  console.log(`Distance to site: ${distance.toFixed(2)}`);
}

const containingCell = voronoi.findCell(testPoint);
if (containingCell) {
  console.log(
    `Point is in Voronoi cell of site: (${containingCell.site.x}, ${containingCell.site.y})`
  );
}

console.log('\n============================================================');
console.log('Example complete!');
console.log('============================================================');
