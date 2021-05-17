// https://drafts.csswg.org/css-values-4/

export type NumericDataTypes = 'integer' | 'number' | 'percentage';
export type Dimensions = 'length' | 'angle' | 'time' | 'frequency' | 'resolution';

type Unit = { unit: string; convertion: number } | { unit: string; canonical: true };

// https://drafts.csswg.org/css-values-4/#viewport-relative-lengths
export const absoluteLengthUnits: Unit[] = [
  { unit: 'cm', convertion: 96 / 2.54 },
  { unit: 'mm', convertion: 96 / 2.54 / 10 },
  { unit: 'Q', convertion: 96 / 2.54 / 40 },
  { unit: 'in', convertion: 96 },
  { unit: 'pc', convertion: 96 / 6 },
  { unit: 'pt', convertion: 96 / 72 },
  { unit: 'px', canonical: true },
];

// https://drafts.csswg.org/css-values-4/#angles
export const angleUnit: Unit[] = [
  { unit: 'deg', canonical: true },
  { unit: 'grad', convertion: 360 / 400 },
  { unit: 'rad', convertion: 360 / (2 * Math.PI) },
  { unit: 'turn', convertion: 360 },
];
