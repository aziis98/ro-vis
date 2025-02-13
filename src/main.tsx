import '@fontsource-variable/jetbrains-mono/index.css'
import '@fontsource-variable/open-sans/index.css'

import { render } from 'preact'
import { useState } from 'preact/hooks'
import { parseSafeProblemInput } from './parser-problem'
import { DisplayProblemInput } from './DisplayProblemInput'
import { Primal } from './Primal'

import exampleProblems from './example-problems.json'

type Problem = {
    name: string
    source: string
}

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
    const [currentProblemName, setCurrentProblemName] = useLocalStorage('current-problem-name', 'Pintel')
    const [savedProblems, setSavedProblems] = useLocalStorage<Problem[]>('saved-problems', exampleProblems)

    const [problemInput, setProblemInput] = useState(
        savedProblems.find(p => p.name === currentProblemName)?.source ?? INITIAL_PROBLEM_INPUT
    )

    const problemValuesResult = parseSafeProblemInput(problemInput)

    return (
        <>
            <h1>
                Operations Research / LP / Simplex Algorithm
                <small>
                    {' '}
                    by <a href="https://poisson.phc.dm.unipi.it/~delucreziis/">@aziis98</a>
                </small>
            </h1>
            <p>
                This is a project for the{' '}
                <a href="https://didawiki.cli.di.unipi.it/doku.php/matematica/ro/start">Operations Research course</a>{' '}
                at the University of Pisa to automatically visualize all the steps of the{' '}
                <a href="https://en.wikipedia.org/wiki/Simplex_algorithm">primal simplex algorithm</a>, the source code
                for this <a href="https://github.com/aziis98/ro-vis">is on GitHub</a>.
            </p>
            <h2>Visualization</h2>
            <p>The problem data must be entered in the following text field in the format:</p>

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

            <h2>Input Problem</h2>
            {'result' in problemValuesResult ? (
                <DisplayProblemInput problemInput={problemValuesResult.result} />
            ) : (
                <p>
                    <code>{problemValuesResult.error}</code>
                </p>
            )}

            {'result' in problemValuesResult && <Primal input={problemValuesResult.result} />}
        </>
    )
}

render(<App />, document.body)
