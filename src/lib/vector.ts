import { Ops, range } from './math'
import { Rationals, Rational } from './rationals'

export abstract class Vector<T> {
    abstract ops: Ops<T>

    abstract indices: number[]
    abstract at(i: number): T

    withValues(values: T[]): Vector<T> {
        if (values.length !== this.indices.length) {
            throw new Error('Invalid number of values')
        }

        return new VectorDense(this.ops, this.indices, values)
    }

    get size(): number {
        return this.indices.length
    }

    slice(indices: number[]): Vector<T> {
        return new SubVector(this, indices)
    }

    dot(vector: Vector<T>): T {
        if (this.size !== vector.size) {
            throw new Error('Vector dimensions do not match')
        }

        console.log('this.indices', this.indices)
        console.log('vector.indices', vector.indices)

        return this.indices.map((_, ii) => this.ops.mul(this.at(ii), vector.at(ii))).reduce(this.ops.sum, this.ops.zero)
    }

    getData(): T[] {
        return this.indices.map(i => this.at(i))
    }

    getIndexedData(): [number, T][] {
        return this.indices.map(i => [i, this.at(i)])
    }

    static ofRationals(data: Rational[]): Vector<Rational> {
        return Vector.of(Rationals, data)
    }

    static of<T>(ops: Ops<T>, data: T[]): Vector<T> {
        return VectorDense.of(ops, data)
    }

    static oneHot<T>(ops: Ops<T>, size: number, index: number): Vector<T> {
        return new OneHotVector(ops, size, index)
    }
}

class VectorDense<T> extends Vector<T> {
    constructor(public ops: Ops<T>, public indices: number[], public data: T[]) {
        super()
    }

    at(i: number): T {
        return this.data[this.indices[i]]
    }

    withValues(values: T[]): Vector<T> {
        if (values.length !== this.data.length) {
            throw new Error('Invalid number of values')
        }

        return new VectorDense(this.ops, this.indices, values)
    }

    static of<T>(ops: Ops<T>, data: T[]): Vector<T> {
        return new VectorDense(ops, range(0, data.length), data)
    }

    toString() {
        return `Vector over ${this.ops.name} of [${this.data.map(r => this.ops.toString(r)).join(', ')}]`
    }
}

class SubVector<T> extends Vector<T> {
    private backwardIndices: number[] = []

    constructor(public parent: Vector<T>, public indices: number[]) {
        super()
        this.indices.forEach((index, i) => (this.backwardIndices[index] = i))
    }

    get ops() {
        return this.parent.ops
    }

    at(i: number): T {
        return this.parent.at(this.indices[i])
    }

    withValues(values: T[]): Vector<T> {
        if (values.length !== this.indices.length) {
            throw new Error('Invalid number of values')
        }

        return new VectorDense(this.ops, this.indices, values)
    }

    toString() {
        return `SubVector of (${this.parent.toString()}) with {${this.indices.join(', ')}} of [${this.indices
            .map(i => this.ops.toString(this.at(this.backwardIndices[i])))
            .join(', ')}]`
    }
}

class OneHotVector<T> extends Vector<T> {
    #size: number

    constructor(public ops: Ops<T>, size: number, public index: number) {
        super()
        this.#size = size
    }

    get size(): number {
        return this.#size
    }

    get indices(): number[] {
        return range(0, this.size)
    }

    at(i: number): T {
        return i === this.index ? this.ops.one : this.ops.zero
    }

    withValues(values: T[]): Vector<T> {
        if (values.length !== this.size) {
            throw new Error('Invalid number of values')
        }

        return new VectorDense(this.ops, this.indices, values)
    }

    toString() {
        return `One-hot vector of size ${this.size} with 1 at index ${this.index}`
    }
}
