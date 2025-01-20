import { Field, FieldValue, gcd } from './math'

export class Rational implements FieldValue<Rational> {
    private constructor(public num: number, public den: number) {
        if (den === 0) {
            throw new Error('Division by zero')
        }
        if ((num | 0) !== num || (den | 0) !== den) {
            throw new Error('Expected integer')
        }

        this.#simplify()
    }

    get baseField() {
        return RationalField
    }

    toString() {
        return this.den === 1 ? this.num.toString() : `${this.num} / ${this.den}`
    }

    #simplify() {
        if (this.den === 0) {
            throw new Error('Division by zero')
        }
        if (this.num === 0) {
            this.den = 1
        }
        if (this.den < 0) {
            this.num = -this.num
            this.den = -this.den
        }

        const g = Math.abs(gcd(this.num, this.den))

        this.num /= g
        this.den /= g
    }

    isZero() {
        return this.num === 0
    }

    isOne() {
        return this.num === this.den
    }

    isInteger() {
        return this.den === 1
    }

    toNumber() {
        return this.num / this.den
    }

    add(b: Rational) {
        return new Rational(this.num * b.den + b.num * this.den, this.den * b.den)
    }

    sub(b: Rational) {
        return new Rational(this.num * b.den - b.num * this.den, this.den * b.den)
    }

    mul(b: Rational) {
        return new Rational(this.num * b.num, this.den * b.den)
    }

    div(b: Rational) {
        return new Rational(this.num * b.den, this.den * b.num)
    }

    inverse() {
        if (this.num === 0) {
            throw new Error('Division by zero')
        }

        return new Rational(this.den, this.num)
    }

    neg() {
        return new Rational(-this.num, this.den)
    }

    scale(k: number) {
        return new Rational(this.num * k, this.den)
    }

    eq(b: Rational) {
        return this.num * b.den === b.num * this.den
    }

    lt(b: Rational) {
        return this.num * b.den < b.num * this.den
    }

    gt(b: Rational) {
        return this.num * b.den > b.num * this.den
    }

    leq(b: Rational) {
        return this.num * b.den <= b.num * this.den
    }

    geq(b: Rational) {
        return this.num * b.den >= b.num * this.den
    }

    static of(num: number, den: number = 1) {
        return new Rational(num, den)
    }
}

export const RationalField: Field<Rational> = {
    zero: Rational.of(0),
    one: Rational.of(1),
}
