const isUnit = (unit: string, units: string[]): boolean => {
  return units.includes(unit);
};

export const isLengthUnit = (unit: string) =>
  isUnit(unit, [
    'em',
    'ex',
    'ch',
    'ic',
    'rem',
    'lh',
    'rlh',
    'vw',
    'vh',
    'vi',
    'vb',
    'vmin',
    'vmax',
    'cm',
    'mm',
    'Q',
    'in',
    'pt',
    'pc',
    'px',
  ]);
export const isAngleUnit = (unit: string) => isUnit(unit, ['deg', 'rad', 'grad', 'turn']);
export const isTimeUnit = (unit: string) => isUnit(unit, ['s', 'ms']);
export const isFrequencyUnit = (unit: string) => isUnit(unit, ['hz', 'Hz']);
export const isResolutionUnit = (unit: string) => isUnit(unit, ['dpi', 'dpcm', 'dppx']);
export const isFlexUnit = (unit: string) => isUnit(unit, ['fr']);

export const dedupe = <T>(array: T[]) => [...new Set(array)];

export const sum = (array: number[]) =>
  array.reduce((accumulator, currentValue) => accumulator + currentValue);
export const product = (array: number[]) =>
  array.reduce((accumulator, currentValue) => accumulator * currentValue);
export const min = (array: number[]) =>
  array.reduce((accumulator, currentValue) => Math.min(accumulator, currentValue));
export const max = (array: number[]) =>
  array.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue));

export const isNull = (val: any) => val === undefined || val === null;
