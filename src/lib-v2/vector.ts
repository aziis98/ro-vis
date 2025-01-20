import { Field, FieldValue, range } from './math'

export abstract class Vector<T extends FieldValue<T>> {
    abstract size: number
    abstract at(i: number): T

    slice(indices: number[]): Vector<T> {
        return new VectorDense(indices.map(i => this.at(i)))
    }

    dot(vector: Vector<T>): T {
        if (this.size !== vector.size) {
            throw new Error('Vector dimensions do not match')
        }

        return this.getData()
            .map((v, i) => v.mul(vector.at(i)))
            .reduce((a, b) => a.add(b))
    }

    getData(): T[] {
        return range(0, this.size).map(i => this.at(i))
    }

    neg(): Vector<T> {
        return new VectorDense(this.getData().map(v => v.neg()))
    }

    leq(vector: Vector<T>): boolean {
        if (this.size !== vector.size) {
            throw new Error('Vector dimensions do not match')
        }

        return this.getData().every((v, i) => v.leq(vector.at(i)))
    }

    with(indices: number[], vector: Vector<T>): Vector<T> {
        if (indices.length !== vector.size) {
            throw new Error('Vector dimensions do not match')
        }

        return new VectorDense(
            range(0, this.size).map(i => (indices.includes(i) ? vector.at(indices.indexOf(i)) : this.at(i)))
        )
    }

    static of<T extends FieldValue<T>>(data: T[]): Vector<T> {
        return new VectorDense(data)
    }

    static oneHot<T extends FieldValue<T>>(baseField: Field<T>, size: number, index: number): Vector<T> {
        return new OneHotVector(size, index, baseField)
    }

    static zero<T extends FieldValue<T>>(baseField: Field<T>, size: number): Vector<T> {
        return Vector.of(range(0, size).map(() => baseField.zero))
    }
}

class VectorDense<T extends FieldValue<T>> extends Vector<T> {
    constructor(public data: T[]) {
        super()
    }

    get size() {
        return this.data.length
    }

    at(i: number): T {
        return this.data[i]
    }

    toString() {
        return `Vector of [${this.data.join(', ')}]`
    }
}

class OneHotVector<T extends FieldValue<T>> extends Vector<T> {
    constructor(public size: number, public index: number, public baseField: Field<T>) {
        super()
    }

    at(i: number): T {
        return i === this.index ? this.baseField.one : this.baseField.zero
    }

    toString() {
        return `One-hot vector of size ${this.size} with 1 at index ${this.index}`
    }
}
