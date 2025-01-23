import { indexSetToLatex, matrixToLatex, rowVectorToLatex, vectorToLatex } from '../latex'
import { range } from '../math'
import { Matrix } from '../matrix'
import { Rational, RationalField } from '../rationals'
import { Vector } from '../vector'

export type ProblemInput = {
    A: Matrix<Rational>
    b: Vector<Rational>
    c: Vector<Rational>

    B: number[]

    maxIterations?: number
}

export type ProblemComment = { type: 'formula' | 'text'; content: string }

export type ProblemStep = {
    B: number[]

    x?: Vector<Rational>
    xi?: Vector<Rational>
    y_B?: Vector<Rational>

    comments: ProblemComment[]
}

export type ProblemStatus =
    | { result: 'optimal'; x: Vector<Rational> }
    | { result: 'unbounded'; xi: Vector<Rational> }
    | { result: 'infeasible' }
    | { result: 'too-many-iterations' }
    | { result: 'wrong-starting-basis' }

export type ProblemOutput = {
    status: ProblemStatus
    steps: ProblemStep[]
}

const activeIndices = (input: ProblemInput, x: Vector<Rational>): number[] => {
    const { A, b } = input
    const A_x = A.apply(x)

    return A_x.getData().flatMap((a, i) => (a.eq(b.at(i)) ? [i] : []))
}

export function computePrimalSimplexSteps(input: ProblemInput): ProblemOutput {
    input.maxIterations ??= 10

    const { A, b, c } = input

    let B = input.B
    let stepResult_B: number[] | undefined = undefined
    let stepResult_xi: Vector<Rational> | undefined = undefined
    let stepResult_y_B: Vector<Rational> | undefined = undefined

    let status: ProblemStatus | null = null

    const steps: ProblemStep[] = []

    while (status === null && steps.length < input.maxIterations) {
        const comments: ProblemComment[] = []

        const A_B = A.slice({ rows: B })
        const A_B_inverse = A_B.inverse2x2()
        const b_B = b.slice(B)

        comments.push({
            type: 'formula',
            content: [
                `B = ${indexSetToLatex(B)}`,
                `A_B = ${matrixToLatex(A_B)}`,
                `b_B = ${vectorToLatex(b_B)}`,
                `c^t = ${rowVectorToLatex(c)}`,
            ].join(' \\qquad '),
        })

        const x = A_B_inverse.apply(b_B)

        const isAdmissible = A.apply(x).leq(b)

        if (isAdmissible) {
            comments.push({
                type: 'formula',
                content: [
                    String.raw`\bar{x}`,
                    `A_B^{-1} b_B`,
                    `${matrixToLatex(A_B)}^{-1} ${vectorToLatex(b_B)}`,
                    `${matrixToLatex(A_B_inverse)} ${vectorToLatex(b_B)}`,
                    `${vectorToLatex(x)}`,
                ].join(' = '),
            })

            const y_B = A_B_inverse.transpose().apply(c)
            stepResult_y_B = y_B

            comments.push({
                type: 'formula',
                content: [
                    String.raw`\bar{y}_B^t`,
                    `c_B^t A_B^{-1}`,
                    `${rowVectorToLatex(c)} ${matrixToLatex(A_B_inverse)}`,
                    `${rowVectorToLatex(y_B)}`,
                ].join(' = '),
            })

            const y_Zero = Vector.zero(RationalField, A.rows)

            const y = y_Zero.with(B, y_B)

            comments.push({ type: 'formula', content: String.raw`\implies \bar{y}^t = ${rowVectorToLatex(y)}` })

            const I_x = activeIndices(input, x)

            comments.push({
                type: 'formula',
                content: [
                    String.raw`I(\bar{x})`,
                    String.raw`\{ i \in \{1, \dots, ${A.rows}\} \mid A_i \bar{x}_i = b_i \}`,
                    indexSetToLatex(I_x),
                ].join(' = '),
            })

            const isDegenerate = I_x.length < A_B.rows
            const isDualAdmissible = y_B.getData().every(y => y.geq(RationalField.zero))
            const isDualDegenerate = y_B.getData().some(y => y.eq(RationalField.zero))

            comments.push({
                type: 'text',
                content: `La soluzione primale è *${isAdmissible ? 'ammissibile' : 'non ammissibile'}* e *${
                    isDegenerate ? 'degenere' : 'non degenere'
                }*.`,
            })

            comments.push({
                type: 'text',
                content: `La soluzione duale è *${isDualAdmissible ? 'ammissibile' : 'non ammissibile'}* e *${
                    isDualDegenerate ? 'degenere' : 'non degenere'
                }*.`,
            })

            if (!isDualAdmissible) {
                const h = Math.min(...y.getData().flatMap((y, i) => (y.lt(RationalField.zero) ? [i] : [])))

                comments.push({
                    type: 'formula',
                    content: [
                        // prettier-ignore
                        `h`,
                        String.raw`\min \{ i \in B \mid \bar{y}_i < 0 \}`,
                        `${h + 1}`,
                    ].join(' = '),
                })

                const e_h = Vector.oneHot(RationalField, A.rows, h).slice(B)
                console.log(e_h)

                const xi = A_B_inverse.apply(e_h).neg()
                stepResult_xi = xi

                comments.push({
                    type: 'formula',
                    content: [
                        // prettier-ignore
                        `\\xi`,
                        `-A_B^{-1} u_{B(h)}`,
                        `${vectorToLatex(xi)}`,
                    ].join(' = '),
                })

                const N = range(0, A.rows).filter(i => !B.includes(i))
                const A_N = A.slice({ rows: N })

                const A_N__xi = A_N.apply(xi)

                comments.push({
                    type: 'formula',
                    content: `N = \\{1, \\dots, ${A.rows}\\} \\setminus B = ${indexSetToLatex(N)}`,
                })

                comments.push({
                    type: 'formula',
                    content: [
                        `A_N \\xi`,
                        `${matrixToLatex(A_N)} ${vectorToLatex(xi)}`,
                        `${vectorToLatex(A_N__xi)}`,
                    ].join(' = '),
                })

                if (!A_N__xi.getData().every(x => x.leq(RationalField.zero))) {
                    const [k, lambda] = N.filter(i => A_N__xi.at(A_N.forwardRowIndices[i]).gt(RationalField.zero))
                        .map<[number, Rational]>(i => [i, b.at(i).sub(A.rowAt(i).dot(x)).div(A.rowAt(i).dot(xi))])
                        .reduce(([i1, lambda1], [i2, lambda2]) => (lambda1.lt(lambda2) ? [i1, lambda1] : [i2, lambda2]))

                    comments.push({
                        type: 'formula',
                        content: [
                            `\\bar\\lambda`,
                            `\\min_i \\left\\{ \\frac{b_i - A_i \\bar{x}}{A_i \\xi} \\; \\middle| \\; i \\in N, A_i \\xi > 0 \\right\\}`,
                            `${lambda}`,
                        ].join(' = '),
                    })

                    comments.push({
                        type: 'formula',
                        content: [
                            `k`,
                            `\\argmin_i \\left\\{ \\bar\\lambda_i \\; \\middle| \\; i \\in N, A_i \\xi > 0 \\right\\}`,
                            `${k + 1}`,
                        ].join(' = '),
                    })

                    comments.push({
                        type: 'formula',
                        content: [
                            `B'`,
                            `B \\setminus \\{${h + 1}\\} \\cup \\{${k + 1}\\}`,
                            `${indexSetToLatex([...B.filter(i => i !== h), k].toSorted())}`,
                        ].join(' = '),
                    })

                    stepResult_B = [...B.filter(i => i !== h), k].toSorted()
                } else {
                    comments.push({ type: 'text', content: 'La soluzione è *illimitata*' })

                    status = { result: 'unbounded', xi }
                }
            } else {
                comments.push({ type: 'text', content: 'La soluzione è *ottima*' })

                status = { result: 'optimal', x }
            }
        } else {
            comments.push({
                type: 'formula',
                content: [
                    String.raw`\bar{x}`,
                    `A_B^{-1} b_B`,
                    `${matrixToLatex(A_B)}^{-1} ${vectorToLatex(b_B)}`,
                    `${matrixToLatex(A_B_inverse)} ${vectorToLatex(b_B)}`,
                    `${vectorToLatex(x)}`,
                ].join(' = '),
            })

            comments.push({
                type: 'formula',
                content:
                    [
                        //
                        `A \\bar{x}`,
                        `${matrixToLatex(A)} ${vectorToLatex(x)}`,
                        `${vectorToLatex(A.apply(x))}`,
                    ].join(' = ') + ` \\not\\leq ${vectorToLatex(b)} = b`,
            })

            comments.push({
                type: 'text',
                content: 'In questo caso bisogna usare il metodo del *simplesso duale*.',
            })

            status = { result: 'wrong-starting-basis' }
        }

        steps.push({
            B,
            x,
            xi: stepResult_xi,
            y_B: stepResult_y_B,

            comments,
        })

        if (stepResult_B) {
            B = stepResult_B

            stepResult_B = undefined
            stepResult_xi = undefined
            stepResult_y_B = undefined
        }
    }

    if (status === null) {
        status = { result: 'too-many-iterations' }
    }

    return {
        status,
        steps,
    }
}
