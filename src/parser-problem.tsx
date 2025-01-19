import { Matrix, Vector } from './lib/matvec'
import { asMatrix, asVector, parseSafe } from './lib/parser'
import { isRational, Rational } from './lib/rationals'

export type ProblemInput = {
    A: Matrix<Rational>
    b: Vector<Rational>
    c: Vector<Rational>

    B: number[]
}

export function parseSafeProblemInput(source: string): { result: ProblemInput } | { error: string } {
    const parseResult = parseSafe(source)
    if ('error' in parseResult) {
        return parseResult
    }

    const {
        result: { A, b, c, B },
    } = parseResult

    if (!A) {
        return { error: 'Manca la matrice A' }
    }
    if (!Array.isArray(A) || !A.every(row => Array.isArray(row))) {
        return { error: 'A deve essere una matrice' }
    }
    if (!b) {
        return { error: 'Manca il vettore b' }
    }
    if (!c) {
        return { error: 'Manca il vettore c' }
    }
    if (!B) {
        return { error: 'Manca la base iniziale B' }
    }
    if (!Array.isArray(B)) {
        return { error: 'B deve essere un vettore' }
    }
    if (B.length !== 2) {
        return { error: 'B deve contenere esattamente due elementi' }
    }
    if (B.some(i => !isRational(i) || i.den !== 1 || !(1 <= i.num && i.num <= A.length))) {
        return { error: `Gli elementi di B devono essere interi tra 1 e ${A[0].length}: ${JSON.stringify(B)}` }
    }

    try {
        return {
            result: {
                A: asMatrix(A),
                b: asVector(b),
                c: asVector(c),

                B: (B as Rational[]).map(i => i.num - 1),
            },
        }
    } catch (e) {
        return { error: e!.toString() }
    }
}
