import { Katex } from './Katex'
import { drawSemiplane } from './lib-v2/canvas'
import { indexSetToLatex, matrixToLatex, rowVectorToLatex, vectorToLatex } from './lib-v2/latex'
import { range } from './lib-v2/math'
import { Matrix } from './lib-v2/matrix'
import { Rational, RationalField } from './lib-v2/rationals'
import { Vector } from './lib-v2/vector'
import { ProblemInput } from './parser-problem'

type Step = {
    B: number[]
}

const activeIndices = (input: ProblemInput, x: Vector<Rational>): number[] => {
    const { A, b } = input
    const A_x = A.apply(x)

    return A_x.getData().flatMap((a, i) => (a.eq(b.at(i)) ? [i] : []))
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

const PrimaleCanvas = ({
    A,
    b,
    c,
    B,

    x,
}: {
    A: Matrix<Rational>
    b: Vector<Rational>
    c: Vector<Rational>
    B: number[]

    x?: Vector<Rational>
}) => {
    const render = ($canvas: HTMLCanvasElement | null) => {
        if (!$canvas) {
            return
        }

        $canvas.width = $canvas.offsetWidth
        $canvas.height = $canvas.offsetHeight

        const g = $canvas.getContext('2d')
        if (!g) {
            throw new Error('Could not get 2d context')
        }

        const width = $canvas.width
        const height = $canvas.height

        g.clearRect(0, 0, width, height)
        g.strokeStyle = '#333'
        g.lineWidth = 2
        g.lineCap = 'round'
        g.lineJoin = 'round'

        // draw y axis arrow
        g.beginPath()
        g.moveTo(width / 2, height / 2)
        g.lineTo(width / 2, 5)
        g.lineTo(width / 2 - 10, 15)
        g.moveTo(width / 2, 5)
        g.lineTo(width / 2 + 10, 15)
        g.stroke()

        // draw x axis arrow
        g.beginPath()
        g.moveTo(width / 2, height / 2)
        g.lineTo(width - 5, height / 2)
        g.lineTo(width - 15, height / 2 - 10)
        g.moveTo(width - 5, height / 2)
        g.lineTo(width - 15, height / 2 + 10)
        g.stroke()

        // g.fillStyle = '#333'
        // g.font = '16px sans-serif'
        // g.textAlign = 'center'
        // g.textBaseline = 'middle'
        // g.fillText(`A = ${A}`, width / 2, height / 2)

        g.translate(width / 2, height / 2)
        g.scale(width / 2, -width / 2)
        g.scale(1 / 10, 1 / 10)

        // draw semiplanes

        // draw semiplanes not in B
        range(0, A.rows)
            .filter(i => !B.includes(i))
            .forEach(i => {
                const [a1, a2] = A.rowAt(i).getData()
                const b_i = b.at(i)

                drawSemiplane(g, a1.toNumber(), a2.toNumber(), b_i.toNumber())
            })

        // draw semiplanes in B
        B.forEach(i => {
            const [a1, a2] = A.rowAt(i).getData()
            const b_i = b.at(i)

            drawSemiplane(g, a1.toNumber(), a2.toNumber(), b_i.toNumber(), { lineColor: '#040', lineWidth: 3 })
        })

        // draw x
        if (x) {
            const [x1, x2] = x.getData()
            g.fillStyle = '#f00'
            g.beginPath()
            g.ellipse(x1.toNumber(), x2.toNumber(), 0.1, 0.1, 0, 0, 2 * Math.PI)
            g.fill()
        }
    }

    return <canvas ref={render} />
}

export const PrimaleStep = ({ input, step }: { input: ProblemInput; step: Step }) => {
    const { A, b, c } = input

    const rows = []
    const canvasOptions: Parameters<typeof PrimaleCanvas>[0] = { A, b, c, B: step.B }

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
    canvasOptions.x = x

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

    const y_Zero = Vector.zero(RationalField, A.rows)

    const y = y_Zero.with(step.B, y_B)

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
    const isDualAdmissible = y_B.getData().every(y => y.geq(RationalField.zero))
    const isDualDegenerate = y_B.getData().some(y => y.eq(RationalField.zero))

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
        const h = Math.min(...y.getData().flatMap((y, i) => (y.lt(RationalField.zero) ? [i] : [])))

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

        const e_h = Vector.oneHot(RationalField, A.rows, h).slice(step.B)
        console.log(e_h)

        // const xi = Vec.neg(Mat.apply(A_B_inverse, e_h))
        const xi = A_B_inverse.apply(e_h).neg()

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

        const N = range(0, A.rows).filter(i => !step.B.includes(i))
        const A_N = A.slice({ rows: N })

        const A_N__xi = A_N.apply(xi)

        rows.push(
            <div class="row">
                <Katex
                    formula={[
                        [`N = \\{1, \\dots, m\\} \\setminus B = ${indexSetToLatex(N)}`],
                        [
                            `A_N \\xi`,
                            String.raw`${matrixToLatex(A_N)} ${vectorToLatex(xi)}`,
                            String.raw`${vectorToLatex(A_N__xi)}`,
                        ].join(' = '),
                    ].join(' \\qquad ')}
                />
            </div>
        )

        if (!A_N__xi.getData().every(x => x.leq(RationalField.zero))) {
            const positiveIndices = N.filter(i => A_N__xi.at(A_N.forwardRowIndices[i]).gt(RationalField.zero))

            const [k, lambda] = positiveIndices
                .map<[number, Rational]>(i => [i, b.at(i).sub(A.rowAt(i).dot(x)).div(A.rowAt(i).dot(xi))])
                .reduce(([i1, lambda1], [i2, lambda2]) => (lambda2.lt(lambda1) ? [i2, lambda2] : [i1, lambda1]))

            rows.push(
                <div class="row">
                    <Katex
                        formula={[
                            `\\bar\\lambda`,
                            `\\min_i \\left\\{ \\frac{b_i - A_i \\bar{x}}{A_i \\xi} \\; \\middle| \\; i \\in N, A_i \\xi > 0 \\right\\}`,
                            `${lambda}`,
                        ].join(' = ')}
                    />
                </div>
            )
            rows.push(
                <div class="row">
                    <Katex
                        formula={[
                            `k`,
                            `\\argmin_i \\left\\{ \\bar\\lambda_i \\; \\middle| \\; i \\in N, A_i \\xi > 0 \\right\\}`,
                            `${k + 1}`,
                        ].join(' = ')}
                    />
                </div>
            )
            rows.push(
                <div class="row">
                    <Katex
                        formula={[
                            `\\implies B'`,
                            `B \\setminus \\{${h + 1}\\} \\cup \\{${k + 1}\\}`,
                            `${indexSetToLatex([...step.B.filter(i => i !== h), k].toSorted())}`,
                        ].join(' = ')}
                    />
                </div>
            )
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
            <div class="geometric-step">
                <PrimaleCanvas {...canvasOptions} />
            </div>
        </div>
    )
}
