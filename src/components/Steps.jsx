import { KaTeX } from './KaTeX.jsx'

export const Steps = ({ steps }) => {
    return (
        <div class="steps">
            {steps.map((step, i) => (
                <div class="step">
                    <div class="label">{step.label}</div>
                    <div class="state">
                        {Object.entries(step.state).map(([key, value]) => (
                            <KaTeX source={`${key} = ${value}`} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
