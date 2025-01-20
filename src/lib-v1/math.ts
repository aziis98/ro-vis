/**
 * A range of integers from `start` inclusive to `end` exclusive.
 */
export function range(start: number, end: number): number[] {
    return Array.from({ length: end - start }, (_, i) => i + start)
}

export const gcd = (a: number, b: number): number => {
    if (b === 0) {
        return a
    }

    return gcd(b, a % b)
}

export type Ops<T> = {
    name: string

    zero: T
    one: T

    isZero(a: T): boolean
    isOne(a: T): boolean

    sum(a: T, b: T): T
    sub(a: T, b: T): T
    mul(a: T, b: T): T
    div(a: T, b: T): T

    inverse(a: T): T
    neg(a: T): T

    scale(a: T, k: number): T

    eq(a: T, b: T): boolean
    lt(a: T, b: T): boolean
    gt(a: T, b: T): boolean
    leq(a: T, b: T): boolean
    geq(a: T, b: T): boolean

    toString(v: T): string
}
