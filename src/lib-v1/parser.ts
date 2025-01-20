import { Matrix } from './matrix'
import { isRational, Rational } from './rationals'
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
        return Vector.ofRationals(v.value)
    }

    // if (isRational(v)) {
    //     return Vector.ofRationals([v])
    // }

    // if (Array.isArray(v) && v.every(vv => isRational(vv))) {
    //     return Vector.ofRationals(v)
    // }

    // if (Array.isArray(v) && v.every(vv => Array.isArray(vv) && vv.length === 1 && isRational(vv[0]))) {
    //     return Vector.ofRationals(v.map(vv => vv[0]))
    // }

    // if (Array.isArray(v) && v.length === 1 && Array.isArray(v[0]) && v[0].every(vv => isRational(vv))) {
    //     return Vector.ofRationals(v[0])
    // }

    throw new Error(`Expected column vector, got ${JSON.stringify(v)}`)
}

export function asMatrix(v: Value): Matrix<Rational> {
    // scalar
    if (isRational(v)) {
        return Matrix.ofRationals(1, 1, [[v]])
    }

    // vector
    if (Array.isArray(v) && v.every(vv => isRational(vv))) {
        return Matrix.ofRationals(
            v.length,
            1,
            v.map(vv => [vv])
        )
    }

    // matrix
    if (Array.isArray(v) && v.every(vv => Array.isArray(vv) && vv.every(vvv => isRational(vvv)))) {
        return Matrix.ofRationals(v.length, v[0].length, v)
    }

    throw new Error(`Expected matrix, got ${JSON.stringify(v)}`)
}

function transposeValue(v: Value): Value {
    // scalar
    if (isRational(v)) {
        return v
    }

    // vector
    if (Array.isArray(v) && v.every(vv => isRational(vv))) {
        return v.map(vv => [vv])
    }

    // matrix
    if (Array.isArray(v) && v.every(vv => Array.isArray(vv) && vv.every(vvv => isRational(vvv)))) {
        return asMatrix(v).transpose().getData()
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
        const values: Rational[][] = []
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
                    currentRow.push({ num: n, den: Number(tokens[i].value) })

                    i++
                } else {
                    i++
                    currentRow.push({ num: n, den: 1 })
                }
            } else if (token.type === TokenType.Newline) {
                if (currentRow.length > 0) {
                    values.push(currentRow)
                    currentRow = []
                }
                i++
            } else if (token.type === TokenType.Semicolon) {
                if (currentRow.length > 0) {
                    values.push(currentRow)
                }
                i++
                break
            } else {
                break
            }
        }

        if (values.length === 1) {
            return values[0].length === 1 ? values[0][0] : values[0]
        }

        return values
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

export function parseSafe(source: string): { result: Record<string, Value> } | { error: string } {
    try {
        return { result: parse(source) }
    } catch (e) {
        return { error: e!.toString() }
    }
}

// Example usage
const source = `
c' = 500 200;

A =  1  0
     0  1
     2  1
    -1  0
    -1  0;

b =  4
     7
     9
     0
     0;

B = 1/2  3;
`

console.dir(parse(source), { depth: null })
