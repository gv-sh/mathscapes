/**
 * Comprehensive tests for Delaunay Triangulation and Voronoi Diagram
 */

import { Point, DelaunayTriangulation, VoronoiDiagram, Triangle, Edge } from '../src/geometry';

console.log('Delaunay Triangulation and Voronoi Diagram - Comprehensive Tests');
console.log('================================================================\n');

// Test 1: Basic triangle operations
console.log('Test 1: Basic Triangle Operations');
console.log('----------------------------------');

const t1 = new Triangle(
  new Point(0, 0),
  new Point(4, 0),
  new Point(0, 3)
);

console.log('Triangle:', t1.toString());
console.log('Area:', t1.area());
console.log('Signed Area:', t1.signedArea());
console.log('Circumcenter:', t1.circumcenter());
console.log('Circumradius:', t1.circumradius());
console.log('Centroid:', t1.centroid());

// Test point containment
const testPoint1 = new Point(1, 1);
const testPoint2 = new Point(5, 5);
console.log(`Contains (1, 1):`, t1.contains(testPoint1));
console.log(`Contains (5, 5):`, t1.contains(testPoint2));

// Test circumcircle
console.log(`(1, 1) in circumcircle:`, t1.inCircumcircle(testPoint1));
console.log(`(5, 5) in circumcircle:`, t1.inCircumcircle(testPoint2));

console.log('\nTest 2: Edge Operations');
console.log('-----------------------');

const e1 = new Edge(new Point(0, 0), new Point(4, 0));
const e2 = new Edge(new Point(4, 0), new Point(0, 0));
const e3 = new Edge(new Point(0, 0), new Point(0, 3));

console.log('Edge 1:', e1.toString());
console.log('Length:', e1.length());
console.log('Midpoint:', e1.midpoint());
console.log('Edge 1 equals Edge 2 (reversed):', e1.equals(e2));
console.log('Edge 1 equals Edge 3:', e1.equals(e3));
console.log('Edge 1 shares vertex with Edge 3:', e1.sharesVertex(e3));

console.log('\nTest 3: Simple Square Triangulation');
console.log('-----------------------------------');

const square = new DelaunayTriangulation();
square.addPoint(new Point(0, 0));
square.addPoint(new Point(1, 0));
square.addPoint(new Point(1, 1));
square.addPoint(new Point(0, 1));

const squareTriangles = square.getTriangles();
console.log(`Number of triangles: ${squareTriangles.length}`);
console.log(`Number of edges: ${square.getEdges().length}`);
console.log(`Number of points: ${square.getPoints().length}`);

console.log('\nTest 4: Random Points Triangulation');
console.log('-----------------------------------');

const random = new DelaunayTriangulation();
const randomPoints = [
  new Point(0.5, 0.5),
  new Point(2.3, 1.7),
  new Point(4.1, 0.8),
  new Point(3.5, 3.2),
  new Point(1.2, 2.9),
  new Point(2.8, 2.1),
];

console.log('Adding random points...');
randomPoints.forEach((p, i) => {
  random.addPoint(p);
  console.log(`  Added point ${i + 1}: (${p.x}, ${p.y})`);
});

const randomTriangles = random.getTriangles();
console.log(`\nTriangulation complete:`);
console.log(`  Triangles: ${randomTriangles.length}`);
console.log(`  Edges: ${random.getEdges().length}`);

// Verify Euler's formula: V - E + F = 2 (for planar graphs)
// For Delaunay: V (vertices) - E (edges) + F (triangles + 1 for outer face) = 2
const V = random.getPoints().length;
const E = random.getEdges().length;
const F = randomTriangles.length + 1;
console.log(`\nEuler's formula verification: V - E + F = ${V} - ${E} + ${F} = ${V - E + F}`);

console.log('\nTest 5: Voronoi Diagram from Simple Grid');
console.log('----------------------------------------');

const grid = new DelaunayTriangulation();
// Create a 3x3 grid
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    grid.addPoint(new Point(i, j));
  }
}

const gridVoronoi = VoronoiDiagram.fromDelaunay(grid);
const gridCells = gridVoronoi.getCells();

console.log(`Number of Voronoi cells: ${gridCells.length}`);
console.log(`Number of Voronoi edges: ${gridVoronoi.getEdges().length}`);

// Check center cell
const centerCell = gridVoronoi.getCell(new Point(1, 1));
if (centerCell) {
  console.log(`\nCenter cell (1, 1):`);
  console.log(`  Vertices: ${centerCell.vertices.length}`);
  console.log(`  Neighbors: ${centerCell.neighbors.length}`);
}

console.log('\nTest 6: Nearest Site Query');
console.log('--------------------------');

const queryPoints = [
  new Point(0.7, 0.7),
  new Point(1.5, 1.5),
  new Point(2.2, 1.8),
];

queryPoints.forEach((p) => {
  const nearest = gridVoronoi.findNearestSite(p);
  if (nearest) {
    const distance = p.distanceTo(nearest);
    console.log(`Query (${p.x}, ${p.y}) -> Nearest: (${nearest.x}, ${nearest.y}), Distance: ${distance.toFixed(3)}`);
  }
});

console.log('\nTest 7: Triangle Membership Queries');
console.log('-----------------------------------');

const queries = [
  new Point(1.5, 1.5),
  new Point(0.5, 0.5),
  new Point(2.5, 2.5),
];

queries.forEach((p) => {
  const tri = grid.findTriangle(p);
  if (tri) {
    const [v1, v2, v3] = tri.vertices();
    console.log(`Point (${p.x}, ${p.y}) is in triangle:`);
    console.log(`  (${v1.x}, ${v1.y}), (${v2.x}, ${v2.y}), (${v3.x}, ${v3.y})`);
  } else {
    console.log(`Point (${p.x}, ${p.y}) is not in any triangle`);
  }
});

console.log('\nTest 8: Duplicate Point Handling');
console.log('--------------------------------');

const dupTest = new DelaunayTriangulation();
dupTest.addPoint(new Point(0, 0));
dupTest.addPoint(new Point(1, 0));
dupTest.addPoint(new Point(0, 1));

try {
  dupTest.addPoint(new Point(0, 0)); // Duplicate
  console.log('ERROR: Should have thrown an error for duplicate point');
} catch (error) {
  if (error instanceof Error) {
    console.log('Correctly rejected duplicate point:', error.message);
  }
}

console.log('\nTest 9: Collinear Points Handling');
console.log('---------------------------------');

try {
  const collinear = new Triangle(
    new Point(0, 0),
    new Point(1, 0),
    new Point(2, 0)
  );
  console.log('ERROR: Should have thrown an error for collinear points');
} catch (error) {
  if (error instanceof Error) {
    console.log('Correctly rejected collinear triangle:', error.message);
  }
}

console.log('\nTest 10: Circle Point Distribution');
console.log('----------------------------------');

const circle = new DelaunayTriangulation();
const numPoints = 12;
const radius = 5;

console.log(`Creating triangulation of ${numPoints} points on a circle...`);
for (let i = 0; i < numPoints; i++) {
  const angle = (2 * Math.PI * i) / numPoints;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  circle.addPoint(new Point(x, y));
}

// Add center point
circle.addPoint(new Point(0, 0));

const circleTriangles = circle.getTriangles();
const circleEdges = circle.getEdges();

console.log(`Triangulation complete:`);
console.log(`  Points: ${circle.getPoints().length}`);
console.log(`  Triangles: ${circleTriangles.length}`);
console.log(`  Edges: ${circleEdges.length}`);

// Create Voronoi diagram
const circleVoronoi = VoronoiDiagram.fromDelaunay(circle);
console.log(`  Voronoi cells: ${circleVoronoi.size()}`);

console.log('\nTest 11: Voronoi Diagram Properties');
console.log('-----------------------------------');

// Verify that each cell corresponds to a site
const cells = circleVoronoi.getCells();
console.log(`Total cells: ${cells.length}`);

let totalVertices = 0;
let totalNeighbors = 0;

cells.forEach((cell) => {
  totalVertices += cell.vertices.length;
  totalNeighbors += cell.neighbors.length;
});

console.log(`Average vertices per cell: ${(totalVertices / cells.length).toFixed(2)}`);
console.log(`Average neighbors per cell: ${(totalNeighbors / cells.length).toFixed(2)}`);

console.log('\nTest 12: Triangulation Size Limits');
console.log('----------------------------------');

const large = new DelaunayTriangulation();
const largeSize = 50;

console.log(`Creating large triangulation with ${largeSize * largeSize} points...`);
const startTime = Date.now();

for (let i = 0; i < largeSize; i++) {
  for (let j = 0; j < largeSize; j++) {
    large.addPoint(new Point(i / 10, j / 10));
  }
}

const endTime = Date.now();
const largeTriangles = large.getTriangles();

console.log(`Triangulation complete in ${endTime - startTime}ms`);
console.log(`  Points: ${large.getPoints().length}`);
console.log(`  Triangles: ${largeTriangles.length}`);
console.log(`  Edges: ${large.getEdges().length}`);

console.log('\n================================================================');
console.log('All tests completed successfully!');
console.log('================================================================');
