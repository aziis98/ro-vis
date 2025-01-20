import { Field, FieldValue, range } from './math'
import { Vector } from './vector'

export type MatrixShape = { rows: number; cols: number }

export abstract class Matrix<T extends FieldValue<T>> {
    abstract baseField: Field<T>

    abstract rows: number
    abstract cols: number

    abstract at(i: number, j: number): T

    getData(): T[][] {
        return range(0, this.rows).map(i => range(0, this.cols).map(j => this.at(i, j)))
    }

    apply(vector: Vector<T>): Vector<T> {
        if (this.cols !== vector.size) {
            throw new Error('Matrix and vector dimensions do not match')
        }

        return Vector.of(
            this.getData().map(row => row.reduce((acc, v, j) => acc.add(v.mul(vector.at(j))), this.baseField.zero))
        )
    }

    inverse2x2(): Matrix<T> {
        if (this.rows !== 2 || this.cols !== 2) {
            throw new Error('Matrix is not 2x2')
        }

        const a = this.at(0, 0)
        const b = this.at(0, 1)
        const c = this.at(1, 0)
        const d = this.at(1, 1)

        const det = a.mul(d).sub(b.mul(c))
        if (det.isZero()) {
            throw new Error('Matrix is singular')
        }

        return new MatrixDense(
            2,
            2,
            [
                [d, b.neg()],
                [c.neg(), a],
            ].map(row => row.map(r => r.div(det)))
        )
    }

    slice({ rows, cols }: { rows?: number[]; cols?: number[] }): MatrixView<T> {
        rows ??= range(0, this.rows)
        cols ??= range(0, this.cols)

        return new MatrixView(this, rows, cols)
    }

    rowAt(i: number): Vector<T> {
        return new MatrixRow(this, i)
    }

    transpose(): Matrix<T> {
        return new MatrixTransposed(this)
    }

    toString() {
        return `Matrix of ${this.rows}x${this.cols} [${this.getData()
            .map(row => `[${row.join(', ')}]`)
            .join(', ')}]`
    }

    static of<T extends FieldValue<T>>(data: T[][]): Matrix<T> {
        const rows = data.length
        const cols = data[0].length

        return new MatrixDense(rows, cols, data)
    }
}

class MatrixDense<T extends FieldValue<T>> extends Matrix<T> {
    constructor(public rows: number, public cols: number, public data: T[][]) {
        super()

        if (data.length !== rows) {
            throw new Error('Invalid number of rows')
        }
        if (data.some(row => row.length !== cols)) {
            throw new Error('Invalid number of columns')
        }
    }

    get baseField() {
        return this.data[0][0].baseField
    }

    at(i: number, j: number): T {
        return this.data[i][j]
    }
}

class MatrixView<T extends FieldValue<T>> extends Matrix<T> {
    public forwardRowIndices: number[] = []
    public forwardColIndices: number[] = []

    constructor(public parent: Matrix<T>, public rowIndices: number[], public colIndices: number[]) {
        super()

        rowIndices.forEach((i, j) => (this.forwardRowIndices[i] = j))
        colIndices.forEach((i, j) => (this.forwardColIndices[i] = j))
    }

    get baseField() {
        return this.parent.baseField
    }

    get rows() {
        return this.rowIndices.length
    }

    get cols() {
        return this.colIndices.length
    }

    at(i: number, j: number): T {
        return this.parent.at(this.rowIndices[i], this.colIndices[j])
    }
}

class MatrixTransposed<T extends FieldValue<T>> extends Matrix<T> {
    constructor(public parent: Matrix<T>) {
        super()
    }

    get baseField() {
        return this.parent.baseField
    }

    get rows() {
        return this.parent.cols
    }

    get cols() {
        return this.parent.rows
    }

    at(i: number, j: number): T {
        return this.parent.at(j, i)
    }
}

class MatrixRow<T extends FieldValue<T>> extends Vector<T> {
    constructor(public parent: Matrix<T>, public row: number) {
        super()
    }

    get size() {
        return this.parent.cols
    }

    at(i: number): T {
        return this.parent.at(this.row, i)
    }
}
