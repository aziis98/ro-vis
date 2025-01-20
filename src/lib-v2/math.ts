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

export type Field<T> = {
    zero: T
    one: T
}

export type FieldValue<T> = {
    baseField: Field<T>

    isZero(): boolean
    isOne(): boolean

    scale(k: number): T

    add(other: T): T
    sub(other: T): T
    mul(other: T): T
    div(other: T): T

    inverse(): T
    neg(): T

    eq(other: T): boolean
    lt(other: T): boolean
    gt(other: T): boolean
    leq(other: T): boolean
    geq(other: T): boolean
}
