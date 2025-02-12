import { useEffect, useState } from 'preact/hooks'
import { MobileScrollable } from './components'
import { Katex } from './Katex'
import { fillDot, drawSemiplane, drawSimpleArrow, strokeInfiniteLine } from './lib-v2/canvas'
import { range } from './lib-v2/math'
import { Matrix } from './lib-v2/matrix'
import { Rational, RationalField } from './lib-v2/rationals'
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
    y_B,

    comments,
}: {
    iter: number

    A: Matrix<Rational>
    b: Vector<Rational>
    c: Vector<Rational>

    B: number[]
    x?: Vector<Rational>
    xi?: Vector<Rational>
    y_B?: Vector<Rational>

    comments: ProblemComment[]
}) => {
    return (
        <div class="step">
            <div class="algebraic-step">
                <div class="comment">
                    <p>
                        Iteration <strong>{iter + 1}</strong> of the algorithm
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
                <PrimalCanvas {...{ A, b, c, B, x, xi, y_B }} />
                <PrimalCanvasCone {...{ A, b, c, B, x, xi, y_B }} />
            </div>
        </div>
    )
}

export const Primal = ({ input }: { input: ProblemInput }) => {
    const [[problemInput, problemOutput, elapsedTime], setProblem] = useState<
        [ProblemInput, ReturnType<typeof computePrimalSimplexSteps>, number] | [null, null]
    >([null, null])

    useEffect(() => {
        console.log('Computing primal simplex steps')

        const timerStart = performance.now()
        const output = computePrimalSimplexSteps({
            A: input.A,
            b: input.b,
            c: input.c,
            B: input.B,
            maxIterations: 10,
        })

        const elapsedTime = performance.now() - timerStart
        console.log('Computed primal simplex steps in', elapsedTime, 'ms')

        setProblem([input, output, elapsedTime])
    }, [input])

    return (
        <div class="steps" title={elapsedTime ? `Computed in ${elapsedTime}ms` : `Computing...`}>
            {problemOutput ? (
                <>
                    <div class="title">
                        <h2>Visualization</h2>
                    </div>
                    {problemOutput.steps.map((step, iter) => (
                        <PrimalStep
                            key={iter}
                            {...{
                                iter,

                                A: problemInput.A,
                                b: problemInput.b,
                                c: problemInput.c,

                                B: step.B,
                                x: step.x,
                                xi: step.xi,
                                y_B: step.y_B,

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

type CanvasProps = {
    A: Matrix<Rational>
    b: Vector<Rational>
    c: Vector<Rational>
    B: number[]

    x?: Vector<Rational>
    xi?: Vector<Rational>
    y_B?: Vector<Rational>
}

const PrimalCanvas = ({ A, b, c, B, x, xi }: CanvasProps) => {
    const render = ($canvas: HTMLCanvasElement | null, props: CanvasProps) => {
        if (!$canvas) {
            return
        }

        const { A, b, c, B, x, xi } = props

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
                    lineColor: '#488',
                    lineWidth: 6,
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
                        // '#44d'
                        '#44f'
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

    return <canvas ref={$canvas => render($canvas, { A, b, c, B, x, xi })} />
}

const PrimalCanvasCone = ({ A, b, c, B, x, xi, y_B }: CanvasProps) => {
    const render = ($canvas: HTMLCanvasElement | null, props: CanvasProps) => {
        if (!$canvas) {
            return
        }

        const { A, c, B, y_B } = props

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

        g.save()
        {
            g.translate(width / 2, height / 2)
            g.scale(width / 2, -width / 2)
            g.scale(1 / 5, 1 / 5)

            const [c1, c2] = c.getData()
            const cLen = Math.sqrt(c1.toNumber() ** 2 + c2.toNumber() ** 2)

            let directions = []

            if (y_B) {
                const [y1, y2] = y_B.getData()

                if (y1.gt(RationalField.zero)) {
                    directions.push(A.rowAt(B[0]))
                }
                if (y1.lt(RationalField.zero)) {
                    directions.push(A.rowAt(B[0]).neg())
                }

                if (y2.gt(RationalField.zero)) {
                    directions.push(A.rowAt(B[1]))
                }
                if (y2.lt(RationalField.zero)) {
                    directions.push(A.rowAt(B[1]).neg())
                }

                if (directions.length === 1) {
                    const [[d0x, d0y]] = directions.map(v => v.getData())
                    drawSimpleArrow(g, 0, 0, d0x.toNumber() * 3, d0y.toNumber() * 3, 0.2, '#44f')
                }
                if (directions.length === 2) {
                    const [[d1x, d1y], [d2x, d2y]] = directions.map(v => v.getData())

                    const d1Len = Math.sqrt(d1x.toNumber() ** 2 + d1y.toNumber() ** 2)
                    const d2Len = Math.sqrt(d2x.toNumber() ** 2 + d2y.toNumber() ** 2)

                    // draw cone
                    g.fillStyle = '#4444ff18'
                    g.beginPath()
                    g.moveTo(0, 0)
                    g.lineTo((d1x.toNumber() * 100) / d1Len, (d1y.toNumber() * 100) / d1Len)
                    g.lineTo((d2x.toNumber() * 100) / d2Len, (d2y.toNumber() * 100) / d2Len)
                    g.fill()
                }
            }

            B.forEach(i => {
                const [a1, a2] = A.rowAt(i).getData()

                const aLen = Math.sqrt(a1.toNumber() ** 2 + a2.toNumber() ** 2)

                g.save()
                {
                    g.strokeStyle = '#b60'
                    g.lineWidth = 20 / (g.canvas.width / window.devicePixelRatio)

                    g.setLineDash([0.2, 0.2])
                    g.beginPath()
                    g.moveTo((a1.toNumber() / aLen) * 10, (a2.toNumber() / aLen) * 10)
                    g.lineTo(-(a1.toNumber() / aLen) * 10, -(a2.toNumber() / aLen) * 10)
                    g.stroke()
                }
                g.restore()

                drawSemiplane(g, a1.toNumber(), a2.toNumber(), 0, {
                    gradientSize: 2,
                })
            })

            B.forEach(i => {
                const [a1, a2] = A.rowAt(i).getData()

                const aLen = Math.sqrt(a1.toNumber() ** 2 + a2.toNumber() ** 2)

                drawSimpleArrow(g, 0, 0, (a1.toNumber() / aLen) * 4, (a2.toNumber() / aLen) * 4, 0.2, '#b60')
            })

            drawSimpleArrow(g, 0, 0, (c1.toNumber() / cLen) * 4, (c2.toNumber() / cLen) * 4, 0.2, 'darkgreen')
        }
        g.restore()

        // draw A_i labels

        g.save()
        {
            g.translate(width / 2, height / 2)

            B.forEach(i => {
                const [a1, a2] = A.rowAt(i).getData()
                const aLen = Math.sqrt(a1.toNumber() ** 2 + a2.toNumber() ** 2)

                g.beginPath()
                g.ellipse(
                    (a1.toNumber() / aLen) * width * 0.45,
                    -(a2.toNumber() / aLen) * width * 0.45,
                    9,
                    9,
                    0,
                    0,
                    Math.PI * 2
                )
                g.fillStyle = '#b60'
                g.fill()

                g.font = 'bold 12px sans-serif'
                g.fillStyle = '#fff'
                g.fillText(`${i + 1}`, (a1.toNumber() / aLen) * width * 0.45, -(a2.toNumber() / aLen) * width * 0.45)
            })
        }
        g.restore()
    }

    return <canvas class="small" ref={$canvas => render($canvas, { A, b, c, B, x, xi, y_B })} />
}
