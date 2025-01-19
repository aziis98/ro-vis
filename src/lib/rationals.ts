import { gcd } from './math'

export type Rational = { num: number; den: number }

export function isRational(v: any): v is Rational {
    return typeof v === 'object' && 'num' in v && 'den' in v
}

export const Rationals = {
    name: 'Rationals',

    zero: { num: 0, den: 1 },
    one: { num: 1, den: 1 },

    isZero: (r: Rational) => r.num === 0,
    isOne: (r: Rational) => r.num === r.den,

    of: (num: number, den: number = 1) => {
        if (den === 0) {
            throw new Error('Division by zero')
        }
        if ((num | 0) !== num || (den | 0) !== den) {
            throw new Error('Expected integer')
        }

        return { num, den }
    },

    toString: (r: Rational) => (r.den === 1 ? r.num.toString() : `${r.num} / ${r.den}`),

    simplify: (r: Rational) => {
        if (r.den === 0) {
            throw new Error('Division by zero')
        }
        if (r.num === 0) {
            return Rationals.zero
        }
        if (r.den < 0) {
            r = { num: -r.num, den: -r.den }
        }

        const g = Math.abs(gcd(r.num, r.den))

        return {
            num: r.num / g,
            den: r.den / g,
        }
    },

    sum: (a: Rational, b: Rational) =>
        Rationals.simplify({
            num: a.num * b.den + b.num * a.den,
            den: a.den * b.den,
        }),
    sub: (a: Rational, b: Rational) =>
        Rationals.simplify({
            num: a.num * b.den - b.num * a.den,
            den: a.den * b.den,
        }),
    mul: (a: Rational, b: Rational) =>
        Rationals.simplify({
            num: a.num * b.num,
            den: a.den * b.den,
        }),
    div: (a: Rational, b: Rational) =>
        Rationals.simplify({
            num: a.num * b.den,
            den: a.den * b.num,
        }),

    inverse: (a: Rational) => {
        if (a.num === 0) {
            throw new Error('Division by zero')
        }

        return Rationals.simplify({
            num: a.den,
            den: a.num,
        })
    },
    neg: (a: Rational) => {
        return Rationals.simplify({
            num: -a.num,
            den: a.den,
        })
    },

    scale: (a: Rational, k: number) =>
        Rationals.simplify({
            num: a.num * k,
            den: a.den,
        }),

    eq: (a: Rational, b: Rational) => a.num * b.den === b.num * a.den,
    lt: (a: Rational, b: Rational) => a.num * b.den < b.num * a.den,
    gt: (a: Rational, b: Rational) => a.num * b.den > b.num * a.den,
    leq: (a: Rational, b: Rational) => a.num * b.den <= b.num * a.den,
    geq: (a: Rational, b: Rational) => a.num * b.den >= b.num * a.den,
}
