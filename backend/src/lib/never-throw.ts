// // This is a easy way to handle errors, you can raplace it for libs more robust like neverthrow

type Result<S, E> =
    | { data: S; error: null } // Success case
    | { data: null; error: E }; // Error case

function isOk<S, E>(result: Result<S, E>): result is { data: S; error: null } {
    return result.error === null;
}

function isFail<S, E>(result: Result<S, E>): result is { data: null; error: E } {
    return result.error !== null && result.error !== undefined;
}

function ok<S, E = never>(data: S): Result<S, E> {
    return {
        data,
        error: null,
    };
}

function fail<S = never, E = unknown>(error: E): Result<S, E> {
    return {
        data: null,
        error,
    };
}

export { isOk, isFail, ok, fail };

export async function tryCatch<S, E = Error>(fn: () => Promise<S>): Promise<Result<S, E>> {
    try {
        return ok(await fn());
    } catch (error) {
        return fail(error as E);
    }
}

export function tryCatchSync<S, E = Error>(fn: () => S): Result<S, E> {
    try {
        return ok(fn());
    } catch (error) {
        return fail(error as E);
    }
}

export type { Result };
