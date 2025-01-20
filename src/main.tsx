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

const useLocalStorage = <T,>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
    })

    const setItem = (newValue: T) => {
        setValue(newValue)
        window.localStorage.setItem(key, JSON.stringify(newValue))
    }

    return [value, setItem] as const
}

const App = () => {
    const [currentProblemName, setCurrentProblemName] = useState('Pintel')
    const [savedProblems, setSavedProblems] = useLocalStorage<{ name: string; source: string }[]>('savedProblems', [
        { name: 'Pintel', source: INITIAL_PROBLEM_INPUT },
    ])

    const [problemInput, setProblemInput] = useState(INITIAL_PROBLEM_INPUT)

    const problemValuesResult = parseSafeProblemInput(problemInput)

    return (
        <>
            <h1>Ricerca Operativa / Programmazione Lineare</h1>
            <p>
                Questo sito è un progetto per il corso di{' '}
                <a href="https://didawiki.cli.di.unipi.it/doku.php/matematica/ro/start">
                    Ricerca Operativa dell'Università di Pisa
                </a>{' '}
                per visualizzare automaticamente tutti i passaggi dell'
                <a href="https://it.wikipedia.org/wiki/Algoritmo_del_simplesso">
                    algoritmo del simplesso primale e duale
                </a>
                .
            </p>
            <h2>Visualizzazione</h2>
            <p>I dati del problema vanno inseriti nel seguente campo di testo nel formato:</p>

            <div class="flex-row">
                <select
                    onInput={e => {
                        const name = e.currentTarget.value
                        console.log(name)

                        const savedProblem = savedProblems.find(p => p.name === name)
                        if (savedProblem) {
                            setCurrentProblemName(name)
                            setProblemInput(savedProblem.source)
                        }
                    }}
                >
                    {savedProblems.find(p => p.name === currentProblemName)?.source !== problemInput && (
                        <option selected>Unsaved</option>
                    )}
                    {savedProblems.map(({ name }) => (
                        <option
                            value={name}
                            selected={
                                name === currentProblemName &&
                                savedProblems.find(p => p.name === name)!.source === problemInput
                            }
                        >
                            {name}
                        </option>
                    ))}
                </select>
                <div class="spacer"></div>
                <input
                    type="text"
                    onInput={e => {
                        const name = e.currentTarget.value
                        setCurrentProblemName(name)
                    }}
                    value={currentProblemName}
                />
                <button
                    onClick={() => {
                        setSavedProblems([...savedProblems, { name: currentProblemName, source: problemInput }])
                    }}
                >
                    Salva
                </button>
            </div>

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
        </>
    )
}

render(<App />, document.body)
