import { Katex } from './Katex'
import { indexSetToLatex, matrixToLatex, rowVectorToLatex, vectorToLatex } from './lib/latex'
import { Matrix, Vector } from './lib/matvec'
import { Rationals, Rational } from './lib/rationals'
import { ProblemInput } from './parser-problem'

type Step = {
    B: number[]
}

const activeIndices = (input: ProblemInput, x: Vector<Rational>): number[] => {
    const { A, b } = input

    const A_x = A.apply(x)

    console.log(A_x, b)

    return A_x.flatMap((a, i) => (Rationals.eq(a, b[i]) ? [i] : []))
}

export const Primale = ({ input }: { input: ProblemInput }) => {
    const steps: Step[] = [{ B: input.B }]

    return (
        <div class="steps">
            {steps.map(step => (
                <PrimaleStep input={input} step={step} />
            ))}
        </div>
    )
}

export const PrimaleStep = ({ input, step }: { input: ProblemInput; step: Step }) => {
    const { A, b, c } = input
    const rows = []

    const A_B = A.slice({ rows: step.B })
    const A_B_inverse = A_B.inverse2x2()
    const b_B = b.slice(step.B)

    rows.push(
        <div class="row">
            <Katex
                formula={[
                    String.raw`A_B = ${matrixToLatex(A_B)}`,
                    String.raw`b_B = ${vectorToLatex(b_B)}`,
                    String.raw`c^t = ${rowVectorToLatex(c)}`,
                ].join(' \\qquad ')}
            />
        </div>
    )

    const x = A_B_inverse.apply(b_B)

    rows.push(
        <div class="row">
            <Katex
                formula={[
                    String.raw`\bar{x}`,
                    String.raw`A_B^{-1} b_B`,
                    String.raw`${matrixToLatex(A_B)}^{-1} ${vectorToLatex(b_B)}`,
                    String.raw`${matrixToLatex(A_B_inverse)} ${vectorToLatex(b_B)}`,
                    String.raw`${vectorToLatex(x)}`,
                ].join(' = ')}
            />
        </div>
    )

    const y_B = A_B_inverse.transpose().apply(c)

    rows.push(
        <div class="row">
            <Katex
                formula={[
                    String.raw`\bar{y}_B^t`,
                    String.raw`c_B^t A_B^{-1}`,
                    String.raw`${rowVectorToLatex(c)} ${matrixToLatex(A_B_inverse)}`,
                    String.raw`${rowVectorToLatex(y_B)}`,
                ].join(' = ')}
            />
        </div>
    )

    const y_Zero = Array.from({ length: A.rows }, () => ({ num: 0, den: 1 }))
    const y = Vec.with(y_Zero, step.B, y_B)

    rows.push(
        <div class="row">
            <Katex formula={String.raw`\implies \bar{y}^t = ${rowVectorToLatex(y)}`} />
        </div>
    )

    const I_x = activeIndices(input, x)

    rows.push(
        <div class="row">
            <Katex
                formula={[
                    String.raw`I(\bar{x})`,
                    String.raw`\{ i \in \{1, \dots, m\} \mid A_i \bar{x}_i = b_i \}`,
                    indexSetToLatex(I_x),
                ].join(' = ')}
            />
        </div>
    )

    const isDegenerate = I_x.length < A_B.rows
    const isDualAdmissible = y_B.every(y => Rationals.geq(y, Rationals.zero))
    const isDualDegenerate = y_B.some(y => Rationals.eq(y, Rationals.zero))

    rows.push(
        <div class="row">
            <p>
                La soluzione primale è <strong>{isDegenerate ? 'degenere' : 'non degenere'}</strong>.
            </p>
            <p>
                La soluzione duale è <strong>{isDualAdmissible ? 'ammissibile' : 'non ammissibile'}</strong> e{' '}
                <strong>{isDualDegenerate ? 'degenere' : 'non degenere'}</strong>.
            </p>
        </div>
    )

    if (!isDualAdmissible) {
        const h = Math.min(...y.flatMap((y, i) => (Rationals.lt(y, Rationals.zero) ? [i] : [])))

        rows.push(
            <div class="row">
                <Katex
                    formula={[
                        //
                        String.raw`h`,
                        String.raw`\min \{ i \in B \mid \bar{y}_i < 0 \}`,
                        String.raw`${h + 1}`,
                    ].join(' = ')}
                />
            </div>
        )

        const e_h = Vec.slice(Vec.oneHot(A.length, h), step.B)
        console.log(e_h)

        const xi = Vec.neg(Mat.apply(A_B_inverse, e_h))

        rows.push(
            <div class="row">
                <Katex
                    formula={[
                        //
                        `\\xi`,
                        String.raw`-A_B^{-1} u_{B(h)}`,
                        String.raw`${vectorToLatex(xi)}`,
                    ].join(' = ')}
                />
            </div>
        )

        const N = Array.from({ length: A.length }, (_, i) => i).filter(i => !step.B.includes(i))
        const A_N = Mat.slice(A, { rows: N })

        const A_N__xi = Mat.apply(A_N, xi)

        rows.push(
            <div class="row">
                <Katex
                    formula={[
                        //
                        `A_N \\xi`,
                        String.raw`${matrixToLatex(A_N)} ${vectorToLatex(xi)}`,
                        String.raw`${vectorToLatex(A_N__xi)}`,
                    ].join(' = ')}
                />
            </div>
        )

        if (!A_N__xi.every(x => Rationals.leq(x, Rationals.zero))) {
            const positiveIndices = Array.from({ length: A.length }, (_, i) => i).filter(i => N.includes(i))
        } else {
            rows.push(
                <div class="row">
                    <p>
                        La soluzione duale è <strong>illimitata</strong>.
                    </p>
                </div>
            )
        }
    }

    return (
        <div class="step">
            <div class="algebraic-step">{rows}</div>
            <div class="geometric-step"></div>
        </div>
    )
}
