import { useEffect, useState } from 'preact/hooks'
import { MobileScrollable } from './components'
import { Katex } from './Katex'
import { fillDot, drawSemiplane, drawSimpleArrow, strokeInfiniteLine } from './lib-v2/canvas'
import { range } from './lib-v2/math'
import { Matrix } from './lib-v2/matrix'
import { Rational } from './lib-v2/rationals'
import { ProblemComment, computePrimalSimplexSteps } from './lib-v2/ro/primal-simplex'
import { Vector } from './lib-v2/vector'
import { MiniMark } from './MiniMark'
import { ProblemInput } from './parser-problem'

// type Step = {
//     B: number[]
// }

// const activeIndices = (input: ProblemInput, x: Vector<Rational>): number[] => {
//     const { A, b } = input
//     const A_x = A.apply(x)

//     return A_x.getData().flatMap((a, i) => (a.eq(b.at(i)) ? [i] : []))
// }

const PrimalStep = ({
    iter,

    A,
    b,
    c,
    B,

    x,
    xi,

    comments,
}: {
    iter: number

    A: Matrix<Rational>
    b: Vector<Rational>
    c: Vector<Rational>

    B: number[]
    x?: Vector<Rational>
    xi?: Vector<Rational>

    comments: ProblemComment[]
}) => {
    return (
        <div class="step">
            <div class="algebraic-step">
                <div class="comment">
                    <p>
                        Iterazione <strong>{iter + 1}</strong> dell'algoritmo
                    </p>
                </div>

                {comments.map(comment =>
                    comment.type === 'formula' ? (
                        <MobileScrollable>
                            <Katex formula={comment.content} />
                        </MobileScrollable>
                    ) : (
                        <div class="comment">
                            <MiniMark content={comment.content} />
                        </div>
                    )
                )}
            </div>
            <div class="geometric-step">
                <PrimalCanvas
                    {...{
                        A,
                        b,
                        c,
                        B,
                        x,
                        xi,
                    }}
                />
            </div>
        </div>
    )
}

export const Primal = ({ input }: { input: ProblemInput }) => {
    const [problemOutput, setProblemOutput] = useState<ReturnType<typeof computePrimalSimplexSteps> | null>(null)
    const [timerDelta, setTimerDelta] = useState<number | null>(null)

    useEffect(() => {
        const timerStart = performance.now()
        const output = computePrimalSimplexSteps({
            A: input.A,
            b: input.b,
            c: input.c,
            B: input.B,
            maxIterations: 10,
        })
        const elapsedTime = performance.now() - timerStart

        setProblemOutput(output)
        setTimerDelta(elapsedTime)
    }, [input])

    return (
        <div class="steps" title={`Calcolato in ${timerDelta}ms`}>
            {problemOutput ? (
                <>
                    <div class="title">
                        <h2>Svolgimento</h2>
                    </div>
                    {problemOutput.steps.map((step, iter) => (
                        <PrimalStep
                            {...{
                                iter,

                                A: input.A,
                                b: input.b,
                                c: input.c,

                                B: step.B,
                                x: step.x,
                                xi: step.xi,

                                comments: step.comments,
                            }}
                        />
                    ))}
                </>
            ) : (
                <div class="title">
                    <h2>Loading...</h2>
                </div>
            )}
        </div>
    )
}

const PrimalCanvas = ({
    A,
    b,
    c,
    B,

    x,
    xi,
}: {
    A: Matrix<Rational>
    b: Vector<Rational>
    c: Vector<Rational>
    B: number[]

    x?: Vector<Rational>
    xi?: Vector<Rational>
}) => {
    const render = ($canvas: HTMLCanvasElement | null) => {
        if (!$canvas) {
            return
        }

        $canvas.width = $canvas.offsetWidth * window.devicePixelRatio
        $canvas.height = $canvas.offsetHeight * window.devicePixelRatio

        const width = $canvas.width / window.devicePixelRatio
        const height = $canvas.height / window.devicePixelRatio

        const g = $canvas.getContext('2d')
        if (!g) {
            throw new Error('Could not get 2d context')
        }

        g.strokeStyle = '#333'
        g.lineWidth = 2
        g.lineCap = 'round'
        g.lineJoin = 'round'

        g.fillStyle = '#333'
        g.font = 'bold 16px sans-serif'
        g.textAlign = 'center'
        g.textBaseline = 'middle'

        g.scale(window.devicePixelRatio, window.devicePixelRatio)
        g.clearRect(0, 0, width, height)

        const [c1, c2] = c.getData()
        const cLen = Math.sqrt(c1.toNumber() ** 2 + c2.toNumber() ** 2)

        // // draw y axis arrow
        // g.beginPath()
        // g.moveTo(width / 2, height / 2)
        // g.lineTo(width / 2, 5)
        // g.lineTo(width / 2 - 10, 15)
        // g.moveTo(width / 2, 5)
        // g.lineTo(width / 2 + 10, 15)
        // g.stroke()

        // // draw x axis arrow
        // g.beginPath()
        // g.moveTo(width / 2, height / 2)
        // g.lineTo(width - 5, height / 2)
        // g.lineTo(width - 15, height / 2 - 10)
        // g.moveTo(width - 5, height / 2)
        // g.lineTo(width - 15, height / 2 + 10)
        // g.stroke()

        // g.beginPath()
        // g.translate(50, height - 50)
        // g.rotate(Math.atan2(c2.toNumber(), c1.toNumber()))
        // g.moveTo(0, 0)
        // g.lineTo(30, 0)
        // g.moveTo(30, 0)
        // g.lineTo(25, -5)
        // g.moveTo(30, 0)
        // g.lineTo(25, 5)
        // g.stroke()
        // g.restore()

        // g.fillStyle = '#333'
        // g.font = '16px sans-serif'
        // g.textAlign = 'center'
        // g.textBaseline = 'middle'
        // g.fillText(`A = ${A}`, width / 2, height / 2)

        g.save()
        {
            g.translate(width / 2, height / 2)
            g.scale(width / 2, -width / 2)
            g.scale(1 / 10, 1 / 10)

            // draw grid

            g.strokeStyle = '#ddd'
            g.lineWidth = 20 / width
            for (let i = -10; i <= 10; i++) {
                strokeInfiniteLine(g, i, 0, Math.PI / 2)
            }
            for (let i = -9; i <= 9; i++) {
                strokeInfiniteLine(g, 0, i, 0)
            }

            g.strokeStyle = '#333'
            g.lineWidth = 40 / width
            drawSimpleArrow(g, 0, 0, 9.8, 0, 0.35, '#444')
            drawSimpleArrow(g, 0, 0, 0, 9.8, 0.35, '#444')

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

                drawSemiplane(g, a1.toNumber(), a2.toNumber(), b_i.toNumber(), {
                    lineColor: '#040',
                    lineWidth: 3,
                })
            })

            // draw current solution
            if (x) {
                const [x1, x2] = x.getData()

                g.lineWidth = 50 / width
                drawSimpleArrow(
                    g,
                    x1.toNumber(),
                    x2.toNumber(),
                    x1.toNumber() + c1.toNumber() / cLen,
                    x2.toNumber() + c2.toNumber() / cLen,
                    0.25,
                    'darkgreen'
                )

                // draw xi
                if (xi) {
                    const [xi1, xi2] = xi.getData()
                    const xiLen = Math.sqrt(xi1.toNumber() ** 2 + xi2.toNumber() ** 2)

                    g.lineWidth = 50 / width
                    drawSimpleArrow(
                        g,
                        x1.toNumber(),
                        x2.toNumber(),
                        x1.toNumber() + xi1.toNumber() / xiLen,
                        x2.toNumber() + xi2.toNumber() / xiLen,
                        0.25,
                        '#44d'
                    )
                }

                g.fillStyle = '#d44'
                fillDot(g, x1.toNumber(), x2.toNumber(), 0.2)
            }
        }
        g.restore()

        // draw c vector

        g.lineWidth = 2
        drawSimpleArrow(
            g,
            50,
            height - 50,
            50 + (c1.toNumber() / cLen) * 40,
            height - 50 - (c2.toNumber() / cLen) * 40,
            7,
            'darkgreen'
        )

        g.fillStyle = 'darkgreen'
        fillDot(g, 50, height - 50, 4)

        g.fillText(`c`, 50 - (c1.toNumber() / cLen) * 20, height - 50 + (c2.toNumber() / cLen) * 20)
    }

    return <canvas ref={render} />
}

// export const PrimaleStep = ({ input, step }: { input: ProblemInput; step: Step }) => {
//     const { A, b, c } = input

//     const rows = []
//     const canvasOptions: Parameters<typeof PrimalCanvas>[0] = { A, b, c, B: step.B }

//     const A_B = A.slice({ rows: step.B })
//     const A_B_inverse = A_B.inverse2x2()
//     const b_B = b.slice(step.B)

//     rows.push(
//         <div class="row">
//             <Katex
//                 formula={[
//                     String.raw`A_B = ${matrixToLatex(A_B)}`,
//                     String.raw`b_B = ${vectorToLatex(b_B)}`,
//                     String.raw`c^t = ${rowVectorToLatex(c)}`,
//                 ].join(' \\qquad ')}
//             />
//         </div>
//     )

//     const x = A_B_inverse.apply(b_B)
//     canvasOptions.x = x

//     rows.push(
//         <div class="row">
//             <Katex
//                 formula={[
//                     String.raw`\bar{x}`,
//                     String.raw`A_B^{-1} b_B`,
//                     String.raw`${matrixToLatex(A_B)}^{-1} ${vectorToLatex(b_B)}`,
//                     String.raw`${matrixToLatex(A_B_inverse)} ${vectorToLatex(b_B)}`,
//                     String.raw`${vectorToLatex(x)}`,
//                 ].join(' = ')}
//             />
//         </div>
//     )

//     const y_B = A_B_inverse.transpose().apply(c)

//     rows.push(
//         <div class="row">
//             <Katex
//                 formula={[
//                     String.raw`\bar{y}_B^t`,
//                     String.raw`c_B^t A_B^{-1}`,
//                     String.raw`${rowVectorToLatex(c)} ${matrixToLatex(A_B_inverse)}`,
//                     String.raw`${rowVectorToLatex(y_B)}`,
//                 ].join(' = ')}
//             />
//         </div>
//     )

//     const y_Zero = Vector.zero(RationalField, A.rows)

//     const y = y_Zero.with(step.B, y_B)

//     rows.push(
//         <div class="row">
//             <Katex formula={String.raw`\implies \bar{y}^t = ${rowVectorToLatex(y)}`} />
//         </div>
//     )

//     const I_x = activeIndices(input, x)

//     rows.push(
//         <div class="row">
//             <Katex
//                 formula={[
//                     String.raw`I(\bar{x})`,
//                     String.raw`\{ i \in \{1, \dots, m\} \mid A_i \bar{x}_i = b_i \}`,
//                     indexSetToLatex(I_x),
//                 ].join(' = ')}
//             />
//         </div>
//     )

//     const isDegenerate = I_x.length < A_B.rows
//     const isDualAdmissible = y_B.getData().every(y => y.geq(RationalField.zero))
//     const isDualDegenerate = y_B.getData().some(y => y.eq(RationalField.zero))

//     rows.push(
//         <div class="row">
//             <p>
//                 La soluzione primale è <strong>{isDegenerate ? 'degenere' : 'non degenere'}</strong>.
//             </p>
//             <p>
//                 La soluzione duale è <strong>{isDualAdmissible ? 'ammissibile' : 'non ammissibile'}</strong> e{' '}
//                 <strong>{isDualDegenerate ? 'degenere' : 'non degenere'}</strong>.
//             </p>
//         </div>
//     )

//     if (!isDualAdmissible) {
//         const h = Math.min(...y.getData().flatMap((y, i) => (y.lt(RationalField.zero) ? [i] : [])))

//         rows.push(
//             <div class="row">
//                 <Katex
//                     formula={[
//                         //
//                         String.raw`h`,
//                         String.raw`\min \{ i \in B \mid \bar{y}_i < 0 \}`,
//                         String.raw`${h + 1}`,
//                     ].join(' = ')}
//                 />
//             </div>
//         )

//         const e_h = Vector.oneHot(RationalField, A.rows, h).slice(step.B)
//         console.log(e_h)

//         // const xi = Vec.neg(Mat.apply(A_B_inverse, e_h))
//         const xi = A_B_inverse.apply(e_h).neg()

//         rows.push(
//             <div class="row">
//                 <Katex
//                     formula={[
//                         //
//                         `\\xi`,
//                         String.raw`-A_B^{-1} u_{B(h)}`,
//                         String.raw`${vectorToLatex(xi)}`,
//                     ].join(' = ')}
//                 />
//             </div>
//         )

//         const N = range(0, A.rows).filter(i => !step.B.includes(i))
//         const A_N = A.slice({ rows: N })

//         const A_N__xi = A_N.apply(xi)

//         rows.push(
//             <div class="row">
//                 <Katex
//                     formula={[
//                         [`N = \\{1, \\dots, m\\} \\setminus B = ${indexSetToLatex(N)}`],
//                         [
//                             `A_N \\xi`,
//                             String.raw`${matrixToLatex(A_N)} ${vectorToLatex(xi)}`,
//                             String.raw`${vectorToLatex(A_N__xi)}`,
//                         ].join(' = '),
//                     ].join(' \\qquad ')}
//                 />
//             </div>
//         )

//         if (!A_N__xi.getData().every(x => x.leq(RationalField.zero))) {
//             const positiveIndices = N.filter(i => A_N__xi.at(A_N.forwardRowIndices[i]).gt(RationalField.zero))

//             const [k, lambda] = positiveIndices
//                 .map<[number, Rational]>(i => [i, b.at(i).sub(A.rowAt(i).dot(x)).div(A.rowAt(i).dot(xi))])
//                 .reduce(([i1, lambda1], [i2, lambda2]) => (lambda2.lt(lambda1) ? [i2, lambda2] : [i1, lambda1]))

//             rows.push(
//                 <div class="row">
//                     <Katex
//                         formula={[
//                             `\\bar\\lambda`,
//                             `\\min_i \\left\\{ \\frac{b_i - A_i \\bar{x}}{A_i \\xi} \\; \\middle| \\; i \\in N, A_i \\xi > 0 \\right\\}`,
//                             `${lambda}`,
//                         ].join(' = ')}
//                     />
//                 </div>
//             )
//             rows.push(
//                 <div class="row">
//                     <Katex
//                         formula={[
//                             `k`,
//                             `\\argmin_i \\left\\{ \\bar\\lambda_i \\; \\middle| \\; i \\in N, A_i \\xi > 0 \\right\\}`,
//                             `${k + 1}`,
//                         ].join(' = ')}
//                     />
//                 </div>
//             )
//             rows.push(
//                 <div class="row">
//                     <Katex
//                         formula={[
//                             `\\implies B'`,
//                             `B \\setminus \\{${h + 1}\\} \\cup \\{${k + 1}\\}`,
//                             `${indexSetToLatex([...step.B.filter(i => i !== h), k].toSorted())}`,
//                         ].join(' = ')}
//                     />
//                 </div>
//             )
//         } else {
//             rows.push(
//                 <div class="row">
//                     <p>
//                         La soluzione duale è <strong>illimitata</strong>.
//                     </p>
//                 </div>
//             )
//         }
//     }

//     return (
//         <div class="step">
//             <div class="algebraic-step">{rows}</div>
//             <div class="geometric-step">
//                 <PrimalCanvas {...canvasOptions} />
//             </div>
//         </div>
//     )
// }
