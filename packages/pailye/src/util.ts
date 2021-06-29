interface PromiseStatus {
  isPending: boolean;
  isRejected: boolean;
  isFulfilled: boolean;
  isResolved: boolean;
}

/**
 * This function allow you to modify a JS Promise by adding some status properties.
 * Based on: http://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 * But modified according to the specs of promises : https://promisesaplus.com/
 */
export const makeQuerablePromise = (promise: Promise<any>) => {
  // Don't modify any promise that has been already modified.
  if ((promise as any).isRejected || (promise as any).isFulfilled)
    return promise as any as PromiseStatus;

  // Set initial state
  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;

  // Observe the promise, saving the fulfillment in a closure scope.
  const result = promise.then(
    (v) => {
      isFulfilled = true;
      isPending = false;
      return v;
    },
    (e) => {
      isRejected = true;
      isPending = false;
      throw e;
    },
  ) as any as PromiseStatus;

  (result as any).isFulfilled = () => {
    return isFulfilled;
  };
  (result as any).isPending = () => {
    return isPending;
  };
  (result as any).isRejected = () => {
    return isRejected;
  };
  return result;
};

/**
 * Simple implementation of the deferred pattern.
 * An object that exposes a promise and functions to resolve and reject it.
 */
export class Deferred<T = void> {
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (err?: any) => void;

  promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}
