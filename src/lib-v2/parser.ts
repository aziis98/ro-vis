import { Matrix } from './matrix'
import { Rational } from './rationals'
import { Result } from './util'
import { Vector } from './vector'

export type Value = { rank: 0; value: Rational } | { rank: 1; value: Rational[] } | { rank: 2; value: Rational[][] }

export function asScalar(v: Value): Rational {
    if (v.rank === 0) {
        return v.value
    }

    throw new Error(`Expected scalar, got ${JSON.stringify(v)}`)
}

export function asVector(v: Value): Vector<Rational> {
    if (v.rank === 1) {
        return Vector.of(v.value)
    }

    if (v.rank === 2 && v.value.every(row => row.length === 1)) {
        return Vector.of(v.value.map(row => row[0]))
    }

    if (v.rank === 2 && v.value.length === 1) {
        return Vector.of(v.value[0])
    }

    throw new Error(`Expected column vector, got ${JSON.stringify(v)}`)
}

export function asMatrix(v: Value): Matrix<Rational> {
    if (v.rank === 0) {
        return Matrix.of([[v.value]])
    }

    if (v.rank === 1) {
        return Matrix.of(v.value.map(vv => [vv]))
    }

    if (v.rank === 2) {
        return Matrix.of(v.value)
    }

    throw new Error(`Expected matrix, got ${JSON.stringify(v)}`)
}

function transposeValue(v: Value): Value {
    if (v.rank === 0) {
        return v
    }

    if (v.rank === 1) {
        return { rank: 2, value: v.value.map(r => [r]) }
    }

    if (v.rank === 2) {
        return { rank: 2, value: asMatrix(v).transpose().getData() }
    }

    throw new Error(`Cannot transpose value: ${JSON.stringify(v)}`)
}

enum TokenType {
    Identifier,
    Transpose,
    Equals,
    Number,
    Divide,
    Semicolon,
    Newline,
}

interface Token {
    type: TokenType
    value: string
}

function tokenize(source: string): Token[] {
    const tokens: Token[] = []
    const patterns: [RegExp, TokenType][] = [
        [/^[a-zA-Z]+/, TokenType.Identifier],
        [/^'/, TokenType.Transpose],
        [/^=/, TokenType.Equals],
        [/^-?\d+/, TokenType.Number],
        [/^\//, TokenType.Divide],
        [/^;/, TokenType.Semicolon],
        [/^\n/, TokenType.Newline],
    ]

    let remaining = source
    while (remaining.trimStart().length > 0) {
        remaining = remaining.replace(/^[\t ]+/, '')

        let matched = false
        for (const [pattern, type] of patterns) {
            const match = remaining.match(pattern)
            if (match) {
                tokens.push({ type, value: match[0] })
                remaining = remaining.slice(match[0].length)
                matched = true
                break
            }
        }

        if (!matched) {
            throw new Error(`Unexpected token: "${remaining}"`)
        }
    }

    return tokens
}

export function parse(source: string): Record<string, Value> {
    const tokens = tokenize(source)
    // console.log(tokens)

    const result: Record<string, Value> = {}
    let i = 0

    function parseValue(): Value {
        const rows: Rational[][] = []
        let currentRow: Rational[] = []

        while (i < tokens.length) {
            const token = tokens[i]

            if (token.type === TokenType.Number) {
                const n = Number(token.value)

                if (tokens[i + 1]?.type === TokenType.Divide) {
                    i++

                    if (tokens[i + 1]?.type !== TokenType.Number) {
                        throw new Error('Expected denominator after "/"')
                    }

                    i++
                    currentRow.push(Rational.of(n, Number(tokens[i].value)))

                    i++
                } else {
                    i++
                    currentRow.push(Rational.of(n, 1))
                }
            } else if (token.type === TokenType.Newline) {
                if (currentRow.length > 0) {
                    rows.push(currentRow)
                    currentRow = []
                }
                i++
            } else if (token.type === TokenType.Semicolon) {
                if (currentRow.length > 0) {
                    rows.push(currentRow)
                }
                i++
                break
            } else {
                break
            }
        }

        if (rows.length === 1) {
            return { rank: 1, value: rows[0] }
        }

        return { rank: 2, value: rows }
    }

    while (i < tokens.length) {
        while (tokens[i].type === TokenType.Newline) {
            i++
        }

        const token = tokens[i]

        if (token.type === TokenType.Identifier) {
            const identifier = token.value
            i++

            let transpose = false
            if (tokens[i]?.type === TokenType.Transpose) {
                transpose = true
                i++
            }

            if (tokens[i]?.type === TokenType.Equals) {
                i++
                result[identifier] = parseValue()

                if (transpose) {
                    result[identifier] = transposeValue(result[identifier])
                }
            } else {
                throw new Error(`Expected '=' after identifier '${identifier}'`)
            }
        } else {
            throw new Error(`Unexpected token: "${token.value.replace('\n', '\\n')}"`)
        }
    }

    return result
}

export function parseSafe(source: string): Result<Record<string, Value>> {
    try {
        return { result: parse(source) }
    } catch (e) {
        return { error: e!.toString() }
    }
}
