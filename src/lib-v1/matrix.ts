import { Ops, range } from './math'
import { Rational, Rationals } from './rationals'
import { Vector } from './vector'

export type MatrixShape = { rows: number; cols: number }

export abstract class Matrix<T> {
    abstract ops: Ops<T>

    abstract rowIndices: number[]
    abstract colIndices: number[]

    abstract at(i: number, j: number): T

    withValues(values: T[][]): Matrix<T> {
        if (values.length !== this.shape.rows) {
            throw new Error('Invalid number of rows')
        }
        if (values.some(row => row.length !== this.shape.cols)) {
            throw new Error('Invalid number of columns')
        }

        return new MatrixDense(this.ops, this.rowIndices, this.colIndices, values)
    }

    get rootShape(): MatrixShape {
        return {
            rows: this.rowIndices.length,
            cols: this.colIndices.length,
        }
    }

    get shape(): MatrixShape {
        return this.rootShape
    }

    getData(): T[][] {
        return range(0, this.shape.rows).map(i => range(0, this.shape.cols).map(j => this.at(i, j)))
    }

    apply(vector: Vector<T>): Vector<T> {
        if (this.shape.cols !== vector.size) {
            throw new Error('Matrix and vector dimensions do not match')
        }

        return vector.withValues(this.getRows().map(row => row.dot(vector)))
    }

    inverse2x2(): Matrix<T> {
        if (this.shape.rows !== 2 || this.shape.cols !== 2) {
            throw new Error('Matrix is not 2x2')
        }

        const a = this.at(0, 0)
        const b = this.at(0, 1)
        const c = this.at(1, 0)
        const d = this.at(1, 1)

        const det = this.ops.sub(this.ops.mul(a, d), this.ops.mul(b, c))
        if (this.ops.isZero(det)) {
            throw new Error('Matrix is singular')
        }

        // return new MatrixDense(
        //     this.ops,
        //     2,
        //     2,
        //     [
        //         [d, this.ops.neg(b)],
        //         [this.ops.neg(c), a],
        //     ].map(row => row.map(r => this.ops.div(r, det)))
        // )

        return this.withValues(
            [
                [d, this.ops.neg(b)],
                [this.ops.neg(c), a],
            ].map(row => row.map(r => this.ops.div(r, det)))
        )
    }

    slice({ rows, cols }: { rows?: number[]; cols?: number[] }): Matrix<T> {
        rows ??= range(0, this.rootShape.rows).filter(i => this.rowIndices.includes(i))
        cols ??= range(0, this.rootShape.cols).filter(j => this.colIndices.includes(j))

        return new MatrixView(this, rows, cols)
    }

    transpose(): Matrix<T> {
        return new MatrixTransposed(this)
    }

    getRow(i: number): RowVector<T> {
        return new RowVector(this, i)
    }

    getRows(indices: number[] = this.rowIndices): RowVector<T>[] {
        return indices.map(i => new RowVector(this, i))
    }

    getColumn(j: number): ColumnVector<T> {
        return new ColumnVector(this, j)
    }

    getColumns(indices: number[] = this.colIndices): ColumnVector<T>[] {
        return indices.map(j => new ColumnVector(this, j))
    }

    static ofRationals(rows: number, cols: number, data: Rational[][]): Matrix<Rational> {
        return Matrix.of(Rationals, rows, cols, data)
    }

    static of<T>(ops: Ops<T>, rows: number, cols: number, data: T[][]): Matrix<T> {
        return new MatrixDense(ops, range(0, rows), range(0, cols), data)
    }
}

class MatrixDense<T> extends Matrix<T> {
    constructor(public ops: Ops<T>, public rowIndices: number[], public colIndices: number[], public data: T[][]) {
        super()

        if (data.length !== rowIndices.length) {
            throw new Error('Invalid number of rows')
        }
        if (data.some(row => row.length !== colIndices.length)) {
            throw new Error('Invalid number of columns')
        }
    }

    at(i: number, j: number): T {
        console.log('MatrixDense at', i, j)

        return this.data[i][j]
    }

    toString() {
        return `Matrix over ${this.ops.name} ${this.shape.rows} x ${this.shape.cols} of [${this.data
            .map(row => `[${row.map(r => this.ops.toString(r)).join(', ')}]`)
            .join(', ')}])`
    }
}

class MatrixTransposed<T> extends Matrix<T> {
    constructor(public parent: Matrix<T>) {
        super()
    }

    get ops() {
        return this.parent.ops
    }

    get rowIndices() {
        return this.parent.colIndices
    }

    get colIndices() {
        return this.parent.rowIndices
    }

    at(i: number, j: number): T {
        return this.parent.at(j, i)
    }

    toString() {
        return `Transpose of (${this.parent.toString()})`
    }
}

class MatrixView<T> extends Matrix<T> {
    private reverseRows: number[] = []
    private reverseCols: number[] = []

    constructor(public parent: Matrix<T>, public rowIndices: number[], public colIndices: number[]) {
        super()

        if (rowIndices.some(i => i >= parent.shape.rows)) {
            throw new Error('Invalid row index')
        }
        if (colIndices.some(j => j >= parent.shape.cols)) {
            throw new Error('Invalid column index')
        }

        rowIndices.forEach((rowIndex, i) => (this.reverseRows[rowIndex] = i))
        colIndices.forEach((colIndex, j) => (this.reverseCols[colIndex] = j))
    }

    get ops() {
        return this.parent.ops
    }

    at(i: number, j: number): T {
        console.log('MatrixView at', i, j)

        return this.parent.at(this.rowIndices[i], this.colIndices[j])
    }

    toString() {
        return `View of (${this.parent.toString()}) with {${this.rowIndices.join(', ')}} x {${this.colIndices.join(
            ', '
        )}} of [${range(0, this.rowIndices.length)
            .map(
                i =>
                    `[${range(0, this.colIndices.length)
                        .map(j => this.ops.toString(this.at(i, j)))
                        .join(', ')}]`
            )
            .join(', ')}]`
    }
}

class ColumnVector<T> extends Vector<T> {
    constructor(public parent: Matrix<T>, public colIndex: number) {
        super()
    }

    get indices() {
        return this.parent.rowIndices
    }

    get ops() {
        return this.parent.ops
    }

    at(i: number): T {
        console.log('ColumnVector at', i)

        return this.parent.at(i, this.colIndex)
    }
}

class RowVector<T> extends Vector<T> {
    constructor(public parent: Matrix<T>, public rowIndex: number) {
        super()
    }

    get indices() {
        return this.parent.colIndices
    }

    get ops() {
        return this.parent.ops
    }

    at(i: number): T {
        console.log('RowVector at', i, this.parent.colIndices)

        return this.parent.at(this.rowIndex, i)
    }
}
