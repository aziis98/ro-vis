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
        return { error: 'Manca la matrice A' }
    }
    if (!env.b) {
        return { error: 'Manca il vettore b' }
    }
    if (!env.c) {
        return { error: 'Manca il vettore c' }
    }
    if (!env.B) {
        return { error: 'Manca il vettore B' }
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
        return { error: 'B deve essere un vettore' }
    }
    if (B.value.length !== 2) {
        return { error: 'B deve contenere esattamente due elementi' }
    }
    if (B.value.some(v => !v.isInteger() || v.num < 1 || v.num > A.rows)) {
        return {
            error: `Gli elementi di B devono essere interi tra 1 e ${A.rows}: ${JSON.stringify(B.value)}`,
        }
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
