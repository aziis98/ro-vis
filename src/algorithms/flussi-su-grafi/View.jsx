// import { evalRuby } from '../../ruby.js'
// import algorithmCode from './algorithm.rb?raw'

import { useEffect, useState } from 'preact/hooks'
import { GraphInput, useGraph } from '../../components/GraphInput.jsx'

const [id1, id2, id3] = Array(3)
    .fill(null)
    .map(() => crypto.randomUUID(9).split('-')[0])

export const metadata = {
    group: '02 - Flussi su Grafi',
    title: 'Flussi su Grafi',
    description: 'Algoritmo per Flussi su Grafi tramite PL',
}

export const View = ({}) => {
    const [graph, setGraph] = useGraph({
        nodes: [
            {
                id: id1,
                label: '1',
                x: 100 + Math.random() * 500,
                y: 100 + Math.random() * 300,
            },
            {
                id: id2,
                label: '2',
                x: 100 + Math.random() * 500,
                y: 100 + Math.random() * 300,
            },
            {
                id: id3,
                label: '3',
                x: 100 + Math.random() * 500,
                y: 100 + Math.random() * 300,
            },
        ],
        edges: [
            { from: id1, to: id2, label: 'a' },
            { from: id1, to: id3, label: 'b' },
        ],
    })

    return (
        <div class="content">
            <h1>Flussi su Grafi</h1>
            <h2>Input</h2>
            <GraphInput graph={graph} setGraph={setGraph} />
            <p>
                Doppio click per aggiungere un nodo o modificarne uno esistente. Trascina per
                spostare i nodi. Inizia a trascinare da un nodo tenendo Ctrl premuto per creare un
                arco.
            </p>
            <h2>Svolgimento</h2>
            <h2>Output</h2>
        </div>
    )
}
