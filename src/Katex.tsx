import katex from 'katex'
import 'katex/dist/katex.css'

type KatexProps = {
    formula: string

    displayMode?: boolean
}

export const Katex = ({ formula, displayMode }: KatexProps) => {
    displayMode ??= true

    const html = katex.renderToString(formula, {
        throwOnError: false,
        displayMode,
    })

    return <span dangerouslySetInnerHTML={{ __html: html }} />
}
