/**
 * Symbolic Differentiation Examples
 *
 * Demonstrates the use of symbolic differentiation features including:
 * - Basic differentiation rules
 * - Partial derivatives
 * - Higher-order derivatives
 * - Gradient, Jacobian, and Hessian computation
 */

import {
    Variable,
    Constant,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Sin,
    Cos,
    Exp,
    Ln,
    differentiate,
    nthDerivative,
    gradient,
    jacobian,
    hessian
} from '../src/symbolic';

console.log('=== Symbolic Differentiation Examples ===\n');

// Example 1: Basic differentiation
console.log('1. Basic Differentiation');
console.log('------------------------');

// d/dx(x^2 + 3x + 5)
const expr1 = new Add([
    new Power(new Variable('x'), new Constant(2)),
    new Multiply([new Constant(3), new Variable('x')]),
    new Constant(5)
]);

console.log('f(x) =', expr1.toString());
const deriv1 = differentiate(expr1, 'x');
console.log('f\'(x) =', deriv1.toString());
console.log('f\'(2) =', deriv1.evaluate(new Map([['x', 2]])));
console.log();

// Example 2: Product rule
console.log('2. Product Rule: d/dx(x * sin(x))');
console.log('----------------------------------');

const expr2 = new Multiply([
    new Variable('x'),
    new Sin(new Variable('x'))
]);

console.log('f(x) =', expr2.toString());
const deriv2 = differentiate(expr2, 'x');
console.log('f\'(x) =', deriv2.toString());
console.log('f\'(π) =', deriv2.evaluate(new Map([['x', Math.PI]])));
console.log();

// Example 3: Chain rule
console.log('3. Chain Rule: d/dx(sin(x^2))');
console.log('-----------------------------');

const expr3 = new Sin(
    new Power(new Variable('x'), new Constant(2))
);

console.log('f(x) =', expr3.toString());
const deriv3 = differentiate(expr3, 'x');
console.log('f\'(x) =', deriv3.toString());
console.log('f\'(1) =', deriv3.evaluate(new Map([['x', 1]])));
console.log();

// Example 4: Higher-order derivatives
console.log('4. Higher-Order Derivatives: d^3/dx^3(x^4)');
console.log('-------------------------------------------');

const expr4 = new Power(new Variable('x'), new Constant(4));

console.log('f(x) =', expr4.toString());
console.log('f\'(x) =', differentiate(expr4, 'x').toString());
console.log('f\'\'(x) =', nthDerivative(expr4, 'x', 2).toString());
console.log('f\'\'\'(x) =', nthDerivative(expr4, 'x', 3).toString());
console.log('f\'\'\'(2) =', nthDerivative(expr4, 'x', 3).evaluate(new Map([['x', 2]])));
console.log();

// Example 5: Partial derivatives
console.log('5. Partial Derivatives: f(x,y) = x^2 + y^2');
console.log('-------------------------------------------');

const expr5 = new Add([
    new Power(new Variable('x'), new Constant(2)),
    new Power(new Variable('y'), new Constant(2))
]);

console.log('f(x,y) =', expr5.toString());
const dfdx = differentiate(expr5, 'x');
const dfdy = differentiate(expr5, 'y');
console.log('∂f/∂x =', dfdx.toString());
console.log('∂f/∂y =', dfdy.toString());

const point = new Map([['x', 3], ['y', 4]]);
console.log('∂f/∂x at (3,4) =', dfdx.evaluate(point));
console.log('∂f/∂y at (3,4) =', dfdy.evaluate(point));
console.log();

// Example 6: Gradient
console.log('6. Gradient: ∇f where f(x,y) = x^2*y + sin(y)');
console.log('----------------------------------------------');

const expr6 = new Add([
    new Multiply([
        new Power(new Variable('x'), new Constant(2)),
        new Variable('y')
    ]),
    new Sin(new Variable('y'))
]);

console.log('f(x,y) =', expr6.toString());
const grad6 = gradient(expr6, ['x', 'y']);
console.log('∇f = [', grad6.map(g => g.toString()).join(', '), ']');

const point6 = new Map([['x', 2], ['y', Math.PI]]);
const gradValues = grad6.map(g => g.evaluate(point6));
console.log('∇f at (2,π) = [', gradValues.join(', '), ']');
console.log();

// Example 7: Jacobian
console.log('7. Jacobian: f(x,y) = [x^2, x*y, y^2]');
console.log('--------------------------------------');

const f1 = new Power(new Variable('x'), new Constant(2));
const f2 = new Multiply([new Variable('x'), new Variable('y')]);
const f3 = new Power(new Variable('y'), new Constant(2));

const jac = jacobian([f1, f2, f3], ['x', 'y']);

console.log('f₁(x,y) =', f1.toString());
console.log('f₂(x,y) =', f2.toString());
console.log('f₃(x,y) =', f3.toString());
console.log('\nJacobian matrix:');
for (let i = 0; i < jac.length; i++) {
    console.log('[', jac[i].map(e => e.toString()).join(', '), ']');
}

const point7 = new Map([['x', 2], ['y', 3]]);
console.log('\nJacobian at (2,3):');
for (let i = 0; i < jac.length; i++) {
    const row = jac[i].map(e => e.evaluate(point7));
    console.log('[', row.join(', '), ']');
}
console.log();

// Example 8: Hessian
console.log('8. Hessian: f(x,y) = x^3 + y^3 - 3xy');
console.log('-------------------------------------');

const expr8 = new Add([
    new Power(new Variable('x'), new Constant(3)),
    new Power(new Variable('y'), new Constant(3)),
    new Multiply([
        new Constant(-3),
        new Variable('x'),
        new Variable('y')
    ])
]);

console.log('f(x,y) =', expr8.toString());
const hess = hessian(expr8, ['x', 'y']);

console.log('\nHessian matrix:');
for (let i = 0; i < hess.length; i++) {
    console.log('[', hess[i].map(e => e.toString()).join(', '), ']');
}

const point8 = new Map([['x', 1], ['y', 1]]);
console.log('\nHessian at (1,1):');
for (let i = 0; i < hess.length; i++) {
    const row = hess[i].map(e => e.evaluate(point8));
    console.log('[', row.join(', '), ']');
}
console.log();

// Example 9: Optimization - finding critical points
console.log('9. Finding Critical Points');
console.log('--------------------------');

const expr9 = new Add([
    new Power(new Variable('x'), new Constant(2)),
    new Power(new Variable('y'), new Constant(2)),
    new Multiply([
        new Constant(-2),
        new Variable('x')
    ]),
    new Multiply([
        new Constant(-4),
        new Variable('y')
    ])
]);

console.log('f(x,y) =', expr9.toString());
console.log('To find critical points, solve ∇f = 0:');

const grad9 = gradient(expr9, ['x', 'y']);
console.log('∂f/∂x =', grad9[0].toString(), '= 0');
console.log('∂f/∂y =', grad9[1].toString(), '= 0');
console.log('\nSolving: x = 1, y = 2');

const critical = new Map([['x', 1], ['y', 2]]);
console.log('f(1,2) =', expr9.evaluate(critical));

// Check second derivative test
const hess9 = hessian(expr9, ['x', 'y']);
console.log('\nHessian at (1,2):');
for (let i = 0; i < hess9.length; i++) {
    const row = hess9[i].map(e => e.evaluate(critical));
    console.log('[', row.join(', '), ']');
}
console.log('Both eigenvalues are positive → local minimum');
console.log();

console.log('All examples completed successfully!');
