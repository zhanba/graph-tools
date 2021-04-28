class AssertionError extends Error {}

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError(`Expected 'val' to be defined, but received ${val}`);
  }
}

export function assertIsString(val: any): asserts val is string {
  if (typeof val !== 'string') {
    throw new AssertionError('Not a string!');
  }
}

export function assertIsNumber(val: any): asserts val is number {
  if (typeof val !== 'number') {
    throw new AssertionError('Not a string!');
  }
}
