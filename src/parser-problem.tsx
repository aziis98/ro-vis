import { Matrix } from './lib-v2/matrix'
import { asMatrix, asVector, parseSafe } from './lib-v2/parser'
import { Rational } from './lib-v2/rationals'
import { Result, tryBlock } from './lib-v2/util'
import { Vector } from './lib-v2/vector'

export type ProblemInput = {
    A: Matrix<Rational>
    b: Vector<Rational>
    c: Vector<Rational>

    B: number[]
}

export function parseSafeProblemInput(source: string): Result<ProblemInput> {
    const parseResult = parseSafe(source)
    if ('error' in parseResult) {
        return parseResult
    }
    const { result: env } = parseResult

    if (!env.A) {
        return { error: 'Missing matrix A' }
    }
    if (!env.b) {
        return { error: 'Missing vector b' }
    }
    if (!env.c) {
        return { error: 'Missing vector c' }
    }
    if (!env.B) {
        return { error: 'Missing vector B' }
    }

    const A_asMatrixResult = tryBlock(() => asMatrix(env.A))
    if ('error' in A_asMatrixResult) {
        return A_asMatrixResult
    }
    const { result: A } = A_asMatrixResult

    const b_asVectorResult = tryBlock(() => asVector(env.b))
    if ('error' in b_asVectorResult) {
        return b_asVectorResult
    }
    const { result: b } = b_asVectorResult

    const c_asVectorResult = tryBlock(() => asVector(env.c))
    if ('error' in c_asVectorResult) {
        return c_asVectorResult
    }
    const { result: c } = c_asVectorResult

    const B = env.B

    if (B.rank !== 1) {
        return { error: 'B must be a vector' }
    }
    if (B.value.length !== 2) {
        return { error: 'B must contain exactly two elements for this visualization' }
    }
    if (B.value.some(v => !v.isInteger() || v.num < 1 || v.num > A.rows)) {
        return {
            error: `The elements of B must be integer indices between 1 and ${A.rows}: ${JSON.stringify(B.value)}`,
        }
    }

    // check dimensions
    if (A.cols !== c.size) {
        return { error: 'The number of columns in A must have the same dimension of c' }
    }
    if (A.rows !== b.size) {
        return { error: 'The number of rows of A must match the dimension of b' }
    }

    return {
        result: {
            A,
            b,
            c,
            B: B.value.map(i => i.num - 1),
        },
    }
}
