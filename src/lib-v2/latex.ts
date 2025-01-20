import { Matrix } from './matrix'
import { Rational } from './rationals'
import { Vector } from './vector'

export const rationalToLatex = (r: Rational) => (r.den === 1 ? r.num.toString() : `${r.num} / ${r.den}`)

export const matrixToLatex = (matrix: Matrix<Rational>) =>
    `\\begin{bmatrix} ${matrix
        .getData()
        .map(row => row.map(r => rationalToLatex(r)).join(' & '))
        .join(' \\\\ ')} \\end{bmatrix}`

export const vectorToLatex = (vector: Vector<Rational>) =>
    vector
        ? `\\begin{bmatrix} ${vector
              .getData()
              .map(r => rationalToLatex(r))
              .join(' \\\\ ')} \\end{bmatrix}`
        : ''

export const rowVectorToLatex = (vector: Vector<Rational>) =>
    vector
        ? `\\begin{bmatrix} ${vector
              .getData()
              .map(r => rationalToLatex(r))
              .join(' & ')} \\end{bmatrix}`
        : ''

export const indexSetToLatex = (indices: number[]) => `\\{${indices.map(i => (i + 1).toString()).join(', ')}\\}`
