import './style.css'
import '@fontsource/inter/latin.css'

import _ from 'lodash'

import { render } from 'preact'
import Router, { route } from 'preact-router'
import { useState } from 'preact/hooks'

const ViewRegistry = Object.fromEntries(
    Object.entries(
        import.meta.glob('./algorithms/*/View.jsx', {
            eager: true,
        })
        /* fix for broken syntax highlighting */
    ).map(([path, module]) => {
        const [id] = path.match(/(?<=\/)[^/]*(?=\/View\.jsx$)/)
        return [id, { id, ...module }]
    })
)

const NewAlgorithmBox = ({ title, description, onClick }) => (
    <div class="algorithm-box" onClick={onClick}>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
)

const AlgorithmChooserView = ({}) => {
    const sections = _.groupBy(ViewRegistry, 'metadata.group')

    return (
        <>
            <h1>Algoritmi</h1>
            {Object.entries(sections)
                .toSorted((a, b) => a[0].localeCompare(b[0]))
                .map(([group, algorithms]) => (
                    <section>
                        <h2>{group}</h2>
                        <div class="boxes">
                            {algorithms.map(({ id, metadata }) => (
                                <NewAlgorithmBox
                                    title={metadata.title}
                                    description={metadata.description}
                                    onClick={() => route(id)}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            <section>
                <h2>Flussi su Grafi</h2>
                <div class="boxes">
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                </div>
            </section>
            <section>
                <h2>Flussi su Grafi</h2>
                <div class="boxes">
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                </div>
            </section>
            <section>
                <h2>Flussi su Grafi</h2>
                <div class="boxes">
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                    <NewAlgorithmBox title="TODO" description="lorem ipsum dolor sit amet" />
                </div>
            </section>
        </>
    )
}

const Main = ({}) => {
    const [currentView, setCurrentView] = useState(null)

    if (!currentView) {
        return <AlgorithmChooserView setCurrentView={setCurrentView} />
    }

    const View = ViewRegistry[currentView].View

    return <View />
}

const App = ({}) => {
    return (
        <>
            <header>Visualizzazioni di Ricerca Operativa</header>
            <aside>
                <h2>History</h2>
            </aside>
            <main>
                <Router>
                    <AlgorithmChooserView path="/" />
                    {Object.entries(ViewRegistry).map(([id, { View }]) => (
                        <View path={id} />
                    ))}
                </Router>
            </main>
        </>
    )
}

render(<App />, document.body)
