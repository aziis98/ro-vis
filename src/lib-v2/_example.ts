import { Matrix } from './matrix'
import { parse } from './parser'
import { Rational } from './rationals'

// Example usage
const source = `
c' = 500 200;

A =  1  0
     0  1
     2  1
    -1  0
    -1  0;

b =  4
     7
     9
     0
     0;

B = 1/2  3;
`

const env = parse(source)
Object.entries(env).forEach(([name, { value }]) => {
    console.log(name, JSON.stringify(value, null, 2))
})

const A = Matrix.of([
    [Rational.of(1), Rational.of(0), Rational.of(0)],
    [Rational.of(0), Rational.of(1), Rational.of(1)],
    [Rational.of(2), Rational.of(1), Rational.of(1)],
    [Rational.of(-1), Rational.of(0), Rational.of(0)],
    [Rational.of(-1), Rational.of(0), Rational.of(0)],
])

console.log(A.toString())

const A_B = A.slice({ rows: [1, 3], cols: [0, 2] })

console.log(A_B.toString())

const A_B_inverse = A_B.inverse2x2()

console.log(A_B_inverse.toString())

console.log(A_B.forwardRowIndices, A_B.forwardColIndices)
