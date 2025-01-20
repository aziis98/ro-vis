import { render } from 'preact'
import { useState } from 'preact/hooks'
import { parseSafeProblemInput } from './parser-problem'
import { DisplayProblemInput } from './DisplayProblemInput'
import { Primale } from './Primale'

const INITIAL_PROBLEM_INPUT = `
c' = 500 200;

A =  1  0
     0  1
     2  1
    -1  0
     0 -1;

b =  4
     7
     9
     0
     0;

B = 2 3;
`.trim()

const App = () => {
    const [problemInput, setProblemInput] = useState(INITIAL_PROBLEM_INPUT)

    const problemValuesResult = parseSafeProblemInput(problemInput)

    return (
        <>
            <h1>Ricerca Operativa / Programmazione Lineare</h1>
            <p>
                Questo sito è un progetto per il corso di Ricerca Operativa dell'Università di Pisa per visualizzare
                automaticamente tutti i passaggi dell'<a href="#">algoritmo del simplesso primale e duale</a>.
            </p>
            <h2>Visualizzazione</h2>
            <p>I dati del problema vanno inseriti nel seguente campo di testo nel formato:</p>
            <textarea
                value={problemInput}
                onInput={e => setProblemInput(e.currentTarget.value)}
                rows={Math.max(problemInput.split('\n').length, 5)}
                cols={100}
            ></textarea>
            <h2>Problema di Input</h2>
            {'result' in problemValuesResult ? (
                <DisplayProblemInput problemInput={problemValuesResult.result} />
            ) : (
                <p>
                    <code>{problemValuesResult.error}</code>
                </p>
            )}

            <h2>Svolgimento</h2>

            {'result' in problemValuesResult && <Primale input={problemValuesResult.result} />}

            <h2>Debug</h2>
            <pre>
                <code>{JSON.stringify(problemValuesResult, null, 4)}</code>
            </pre>
        </>
    )
}

render(<App />, document.body)
