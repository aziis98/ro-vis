import { Matrix } from './matrix'
import { Rationals } from './rationals'
import { Vector } from './vector'

const A = Matrix.ofRationals(4, 3, [
    [Rationals.of(1), Rationals.of(2), Rationals.of(3)],
    [Rationals.of(4), Rationals.of(5), Rationals.of(6)],
    [Rationals.of(7), Rationals.of(8), Rationals.of(9)],
    [Rationals.of(10), Rationals.of(11), Rationals.of(12)],
])

console.log(A.toString())

const A_B = A.slice({ rows: [1, 3], cols: [0, 2] })

console.log(A_B.toString())

const A_B_inverse = A_B.inverse2x2()

console.log(A_B_inverse.toString())

const b = Vector.ofRationals([Rationals.of(1), Rationals.of(0)])

console.log(b.toString())

const x = A_B.apply(b)

console.log(x.toString())
