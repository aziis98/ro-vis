import { KaTeX } from './KaTeX.jsx'

const StepBlock = ({ type, content }) => {
    if (!['text', 'code', 'math'].includes(type)) {
        throw new Error(`Invalid step block type: ${type}`)
    }

    return type === 'text' ? (
        <p>{content}</p>
    ) : type === 'code' ? (
        <pre>
            <code>{content}</code>
        </pre>
    ) : type === 'math' ? (
        <KaTeX source={content} />
    ) : null
}

export const Steps = ({ steps }) => {
    return (
        <div class="steps">
            {steps.map(step => (
                <div class="step">
                    <div class="title">{step.title}</div>
                    <div class="content">
                        {step.blocks.map((block, i) => (
                            <StepBlock key={i} {...block} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
