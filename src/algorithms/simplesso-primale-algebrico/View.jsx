import { Steps } from '../../components/Steps.jsx'
import { evalRuby } from '../../ruby.js'
import algorithmCode from './algorithm.rb?raw'

import { useEffect, useState } from 'preact/hooks'

export const metadata = {
    group: '01 - Programmazione Lineare',
    title: 'Simplesso Primale Algebrico',
    description: 'Algoritmo principale della programmazione lineare',
}

export const View = ({}) => {
    const [steps, setSteps] = useState([])

    useEffect(async () => {
        const { outputs } = await evalRuby(algorithmCode)
        setSteps(outputs)
    }, [])

    return (
        <>
            <h1>Simplesso Primale Algebrico</h1>
            <Steps steps={steps} />
        </>
    )
}
