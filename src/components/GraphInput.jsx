import _ from 'lodash'
import { useState, useEffect } from 'preact/hooks'

export const useGraph = (initialGraph = { nodes: [], edges: [] }) => {
    return useState(initialGraph)
}

export const GraphInput = ({ graph, setGraph }) => {
    const dict = _.keyBy(graph.nodes, 'id')

    const lines = graph.edges.map(({ from, to, label }) => {
        return shrinkLine({
            from: dict[from],
            to: dict[to],
            midpoint: computeMidpoint(dict[from], dict[to]),
            label,
        })
    })

    const [interacting, setInteracting] = useState(false)
    // console.log(interacting)

    const onMouseMove = e => {
        if (interacting && interacting.type === 'drag') {
            const deltaX = e.x - interacting.initialDragPos.x
            const deltaY = e.y - interacting.initialDragPos.y

            setGraph(g => {
                const newNodes = [...g.nodes]
                newNodes[interacting.index] = {
                    ...g.nodes[interacting.index],
                    x: interacting.initialPos.x + deltaX,
                    y: interacting.initialPos.y + deltaY,
                }

                return {
                    ...g,
                    nodes: newNodes,
                }
            })
        }
        if (interacting && interacting.type === 'arrow') {
            setInteracting(i => ({
                ...i,
                x: i.initialPos.x + e.x - i.initialDragPos.x,
                y: i.initialPos.y + e.y - i.initialDragPos.y,
            }))
        }
    }

    const addNode = (x, y) => {
        setGraph(g => ({
            ...g,
            nodes: [
                ...g.nodes,
                {
                    id: crypto.randomUUID(9).split('-')[0],
                    label: '?',
                    balance: 0,
                    x,
                    y,
                },
            ],
        }))
    }

    return (
        <div
            class="graph-input"
            onDblclick={e =>
                e.target.classList.contains('graph-input') && addNode(e.offsetX, e.offsetY)
            }
            onClick={e =>
                e.target.classList.contains('graph-input') &&
                (interacting?.type === 'edit-node' || interacting?.type === 'edit-edge') &&
                setInteracting(false)
            }
            onMouseMove={e => onMouseMove(e)}
            onMouseUp={() => {
                if (interacting?.type === 'arrow' && interacting.target !== null) {
                    setGraph(g => ({
                        ...g,
                        edges: [
                            ...g.edges,
                            {
                                from: g.nodes[interacting.index].id,
                                to: g.nodes[interacting.target].id,
                                label: '?',
                            },
                        ],
                    }))
                }

                if (interacting?.type === 'arrow' || interacting?.type === 'drag') {
                    setInteracting(false)
                }
            }}
        >
            <div class="edges">
                <svg width="100%" height="100%">
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="6"
                            markerHeight="6"
                            refX="5" // Adjust position of the arrowhead
                            refY="3"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <polygon points="0 0, 6 3, 0 6" fill="black" />
                        </marker>
                        <marker
                            id="arrowhead-green"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9" // Adjust position of the arrowhead
                            refY="3"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <polygon points="0 0, 10 3, 0 6" fill="green" />
                        </marker>
                    </defs>

                    {lines.map(({ from, to }) => (
                        <line
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke="black"
                            stroke-width="2"
                            marker-end="url(#arrowhead)"
                        />
                    ))}

                    {interacting && interacting.type === 'arrow' && (
                        <line
                            x1={graph.nodes[interacting.index].x}
                            y1={graph.nodes[interacting.index].y}
                            x2={interacting.x}
                            y2={interacting.y}
                            stroke="green"
                            stroke-width="2"
                            marker-end="url(#arrowhead-green)"
                        />
                    )}
                </svg>
            </div>
            <div class="edge-labels">
                {lines.map(({ midpoint: { x, y }, label }, index) => (
                    <div
                        class="edge-label"
                        style={{ '--x': x, '--y': y }}
                        onDblclick={e => {
                            setInteracting({
                                type: 'edit-edge',
                                index,
                            })
                        }}
                        onKeyDown={e => {
                            if (
                                (e.key === 'Enter' || e.key === 'Escape') &&
                                interacting?.type === 'edit-edge'
                            ) {
                                setInteracting(false)
                            }
                        }}
                    >
                        {interacting?.type === 'edit-edge' && interacting.index === index ? (
                            <input
                                type="text"
                                value={label}
                                onInput={e =>
                                    setGraph(g => {
                                        const newEdges = [...g.edges]
                                        newEdges[interacting.index] = {
                                            ...g.edges[interacting.index],
                                            label: e.target.value,
                                        }

                                        return {
                                            ...g,
                                            edges: newEdges,
                                        }
                                    })
                                }
                            />
                        ) : (
                            label
                        )}
                    </div>
                ))}
            </div>
            <div class="nodes">
                {graph.nodes.map(({ id, label, balance, x, y }, index) => (
                    <div
                        class={[
                            'node',
                            interacting?.type === 'arrow' &&
                                interacting.target === index &&
                                'targeted',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        style={{ '--x': x, '--y': y }}
                        onKeyDown={e => {
                            if (
                                (e.key === 'Enter' || e.key === 'Escape') &&
                                interacting?.type === 'edit-node'
                            ) {
                                setInteracting(false)
                            }
                        }}
                    >
                        <div class="popup">
                            <button
                                onClick={() => {
                                    setGraph(g => {
                                        const newNodes = [...g.nodes]
                                        newNodes[index] = {
                                            ...g.nodes[index],
                                            balance: g.nodes[index].balance + 1,
                                        }

                                        return { ...g, nodes: newNodes }
                                    })
                                }}
                            >
                                +
                            </button>
                            <button
                                onClick={() => {
                                    setGraph(g => {
                                        const newNodes = [...g.nodes]
                                        newNodes[index] = {
                                            ...g.nodes[index],
                                            balance: g.nodes[index].balance - 1,
                                        }

                                        return { ...g, nodes: newNodes }
                                    })
                                }}
                            >
                                -
                            </button>
                        </div>
                        <div
                            class="node-ball"
                            onMouseDown={e => {
                                if (interacting) return

                                if (e.ctrlKey) {
                                    setInteracting({
                                        type: 'arrow',
                                        index,
                                        initialPos: { x, y },
                                        initialDragPos: { x: e.x, y: e.y },
                                        x: x,
                                        y: y,
                                        target: null,
                                    })
                                } else {
                                    setInteracting({
                                        type: 'drag',
                                        index,
                                        initialPos: { x, y },
                                        initialDragPos: { x: e.x, y: e.y },
                                    })
                                }
                            }}
                            onMouseMove={e => {
                                if (interacting?.type === 'arrow' && interacting.index !== index) {
                                    setInteracting(i => ({ ...i, target: index }))
                                }
                            }}
                            onMouseLeave={e => {
                                if (interacting && interacting.type === 'arrow') {
                                    setInteracting(i => ({ ...i, target: null }))
                                }
                            }}
                            onDblclick={e => {
                                setInteracting({
                                    type: 'edit-node',
                                    index,
                                })
                            }}
                        >
                            {interacting?.type === 'edit-node' && interacting.index === index ? (
                                <input
                                    type="text"
                                    value={label}
                                    onInput={e =>
                                        setGraph(g => {
                                            const newNodes = [...g.nodes]
                                            newNodes[interacting.index] = {
                                                ...g.nodes[interacting.index],
                                                label: e.target.value,
                                            }

                                            return {
                                                ...g,
                                                nodes: newNodes,
                                            }
                                        })
                                    }
                                />
                            ) : (
                                label
                            )}
                        </div>
                        {balance !== 0 && (
                            <div class="balance">
                                {balance < 0 ? (
                                    <>&minus;{Math.abs(balance)}</>
                                ) : (
                                    <>+{Math.abs(balance)}</>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

//
// Utils
//

const shrinkLine = (line, offset = 28) => {
    const dx = line.to.x - line.from.x
    const dy = line.to.y - line.from.y

    const length = Math.sqrt(dx * dx + dy * dy)
    const ratio = offset / length

    const newStart = {
        x: line.from.x + dx * ratio,
        y: line.from.y + dy * ratio,
    }

    const newEnd = {
        x: line.to.x - dx * ratio,
        y: line.to.y - dy * ratio,
    }

    return { ...line, from: newStart, to: newEnd }
}

const computeMidpoint = (start, end) => {
    return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
    }
}

const useCtrlClick = () => {
    const [isCtrlClick, setIsCtrlClick] = useState(false)

    useEffect(() => {
        const handleKeydown = event => {
            setIsCtrlClick(event.ctrlKey)
        }

        document.addEventListener('keydown', handleKeydown)

        return () => {
            document.removeEventListener('keydown', handleKeydown)
        }
    }, [])

    return isCtrlClick
}

const useShiftClick = () => {
    const [isShiftClick, setIsShiftClick] = useState(false)

    useEffect(() => {
        const handleKeydown = event => {
            setIsShiftClick(event.shiftKey)
        }

        document.addEventListener('keydown', handleKeydown)

        return () => {
            document.removeEventListener('keydown', handleKeydown)
        }
    }, [])

    return isShiftClick
}
