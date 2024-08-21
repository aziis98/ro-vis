import 'katex/dist/katex.min.css'
import katex from 'katex'

export const KaTeX = ({ source }) => {
    return (
        <div
            class="katex"
            ref={el => {
                if (!el) return
                katex.render(source.toString(), el, { throwOnError: false })
            }}
        ></div>
    )
}
