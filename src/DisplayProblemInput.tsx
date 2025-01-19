import { Katex } from './Katex'
import { matrixToLatex, rowVectorToLatex, vectorToLatex } from './lib/latex'
import { ProblemInput } from './parser-problem'

export const DisplayProblemInput = ({ problemInput }: { problemInput: ProblemInput }) => {
    const { A, b, c, B } = problemInput

    return (
        <Katex
            formula={[
                '\\begin{cases} \\max c^t x \\\\ Ax \\leq b \\end{cases}',
                `A = ${matrixToLatex(A)}`,
                `b = ${vectorToLatex(b)}`,
                `c^t = ${rowVectorToLatex(c)}`,
                `B = \\{${B.map(r => (r + 1).toString()).join(', ')}\\}`,
            ].join(' \\qquad ')}
        />
    )
}
