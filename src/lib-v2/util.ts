export type Result<T> = { result: T } | { error: string }

export const tryBlock = <T>(fn: () => T): Result<T> => {
    try {
        return { result: fn() }
    } catch (e) {
        return { error: e!.toString() }
    }
}
