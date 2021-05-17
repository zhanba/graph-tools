/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-classes-per-file */
import type { StyleProperty, StyleInputValue } from './types';
import { dedupe, isFlexUnit, isNull, isResolutionUnit, max, min, product, sum } from './common';
import { isAngleUnit, isTimeUnit, isFrequencyUnit } from './common';
import { isLengthUnit } from './common';

/**
 * base class of all css value
 *
 * ref https://drafts.css-houdini.org/css-typed-om-1/#cssstylevalue
 */
export class CSSStyleValue {
  /**
   *
   * @param property style property name
   * @param styleInput use input value for the style
   */
  static parse(property: StyleProperty, styleInput: StyleInputValue): CSSStyleValue {
    // TODO
    return new CSSStyleValue();
  }

  static parseAll(property: StyleProperty, styleInput: StyleInputValue): CSSStyleValue[] {
    // TODO
    return [new CSSStyleValue()];
  }

  protected toString() {
    return 'CSSStyleValue';
  }
}

export type CSSKeywordish = string | CSSKeywordValue;

export class CSSKeywordValue extends CSSStyleValue {
  value!: string;

  constructor(value: CSSKeywordish) {
    super();
    let val: string;
    if (value instanceof CSSKeywordValue) {
      val = value.value;
    } else {
      val = value;
    }

    if (value === '') {
      throw new TypeError('CSSKeywordValue value can not be empty');
    }

    this.value = val;
  }

  toString() {
    return `${this.value}`;
  }
}

// export enum CSSNumericBaseType {
//   'length',
//   'angle',
//   'time',
//   'frequency',
//   'resolution',
//   'flex',
//   'percent',
// }

const baseTypes = [
  'length',
  'angle',
  'time',
  'frequency',
  'resolution',
  'flex',
  'percent',
] as const;

type CSSNumericBaseType =
  | 'length'
  | 'angle'
  | 'time'
  | 'frequency'
  | 'resolution'
  | 'flex'
  | 'percent';

interface ICSSNumericType {
  length: number;
  angle: number;
  time: number;
  frequency: number;
  resolution: number;
  flex: number;
  percent: number;
  /**
   * the percent type will finally caculate to other type
   */
  percentHint: CSSNumericBaseType;
}

type HintType = keyof ICSSNumericType;

export const createTypeFromUnit = (unit: string): Partial<ICSSNumericType> => {
  if (unit === 'number') {
    return {};
  }

  if (unit === 'percent') {
    return { percent: 1 };
  }

  if (isLengthUnit(unit)) {
    return { length: 1 };
  }
  if (isAngleUnit(unit)) {
    return { angle: 1 };
  }
  if (isTimeUnit(unit)) {
    return { time: 1 };
  }
  if (isFrequencyUnit(unit)) {
    return { frequency: 1 };
  }
  if (isResolutionUnit(unit)) {
    return { resolution: 1 };
  }
  if (isFlexUnit(unit)) {
    return { flex: 1 };
  }

  throw new TypeError(`invalid unit: ${unit}`);
};

export class CSSNumericType {
  static hasSameEntry(type1: CSSNumericType, type2: CSSNumericType): boolean {
    // has same non zero entry
    const nonZerokeys1 = type1.nonZerokeys();
    const nonZerokeys2 = type2.nonZerokeys();
    const isSame =
      nonZerokeys1.every(
        (key) => nonZerokeys2.includes(key) && type1.get(key) === type2.get(key),
      ) &&
      nonZerokeys2.every((key) => nonZerokeys1.includes(key) && type1.get(key) === type2.get(key));
    return isSame;
  }

  static add(type1: CSSNumericType, type2: CSSNumericType) {
    const finalType = new CSSNumericType('number');
    const percentHint1 = type1.get('percentHint');
    const percentHint2 = type2.get('percentHint');
    if (!isNull(percentHint1) && !isNull(percentHint2) && percentHint1 !== percentHint2) {
      throw new Error(`The types can’t be added`);
    }

    if (!isNull(percentHint1) && isNull(percentHint2)) {
      type2.applyPercentHint(percentHint1!);
    }

    if (isNull(percentHint1) && !isNull(percentHint2)) {
      type1.applyPercentHint(percentHint2!);
    }

    if (CSSNumericType.hasSameEntry(type1, type2)) {
      type1.keys().forEach((key) => {
        finalType.set(key, type1.get(key));
      });
      type2.keys().forEach((key) => {
        if (!finalType.contain(key)) {
          finalType.set(key, type2.get(key));
        }
      });
      finalType.set('percentHint', type1.get('percentHint'));
      return finalType;
    }

    if (
      (type1.get('percent') !== 0 || type2.get('percent') !== 0) &&
      (type1.keys().some((key) => key !== 'percent' && type1.get(key) !== 0) ||
        type2.keys().some((key) => key !== 'percent' && type2.get(key) !== 0))
    ) {
      // eslint-disable-next-line no-restricted-syntax
      for (const type of baseTypes.filter((item) => item !== 'percent')) {
        const type1clone = type1.clone();
        type1clone.applyPercentHint(type);
        const type2clone = type2.clone();
        type2clone.applyPercentHint(type);
        if (CSSNumericType.hasSameEntry(type1clone, type2clone)) {
          type1clone.keys().forEach((key) => {
            finalType.set(key, type1.get(key));
          });
          type2clone.keys().forEach((key) => {
            if (!finalType.contain(key)) {
              finalType.set(key, type2.get(key));
            }
          });
          finalType.set('percentHint', type);
          return finalType;
        }
      }
    }
    throw new Error(`The types can’t be added`);
  }

  static multiply(type1: CSSNumericType, type2: CSSNumericType) {
    const finalType = new CSSNumericType('number');
    const percentHint1 = type1.get('percentHint');
    const percentHint2 = type2.get('percentHint');
    if (!isNull(percentHint1) && !isNull(percentHint2) && percentHint1 !== percentHint2) {
      throw new Error(`The types can’t be multiplied`);
    }

    if (!isNull(percentHint1) && isNull(percentHint2)) {
      type2.applyPercentHint(percentHint1!);
    }

    if (isNull(percentHint1) && !isNull(percentHint2)) {
      type1.applyPercentHint(percentHint2!);
    }

    type1.keys().forEach((key) => {
      finalType.set(key, type1.get(key));
    });

    type2.keys().forEach((key) => {
      if (baseTypes.includes(key as CSSNumericBaseType)) {
        if (finalType.contain(key)) {
          finalType.set(
            key,
            (finalType.get(key as CSSNumericBaseType) ?? 0) +
              (type2.get(key as CSSNumericBaseType) ?? 0),
          );
        } else {
          finalType.set(key, type2.get(key as CSSNumericBaseType) ?? 0);
        }
      }
    });
    finalType.set('percentHint', type1.get('percentHint'));
    return finalType;
  }

  private type: Partial<ICSSNumericType>;

  constructor(unit: string) {
    this.type = createTypeFromUnit(unit);
  }

  contain(hint: HintType) {
    return !isNull(this.type[hint]);
  }

  set<T extends HintType>(hint: T, value: Partial<ICSSNumericType>[T]) {
    this.type[hint] = value;
  }

  get<T extends HintType>(hint: T): Partial<ICSSNumericType>[T] {
    return this.type[hint];
  }

  keys() {
    return Object.keys(this.type) as HintType[];
  }

  nonZerokeys() {
    return this.keys().filter((key) => this.get(key) !== 0);
  }

  toEntries() {
    return Object.entries(this.type);
  }

  applyPercentHint(hint: CSSNumericBaseType) {
    if (this.contain('percent')) {
      this.set(hint, (this.get(hint) ?? 0) + (this.get('percent') ?? 0));
      this.set('percent', 0);
    }

    this.set('percentHint', hint);
  }

  clone() {
    return { ...this };
  }
}

type CSSNumberish = number | CSSNumericValue;

export class CSSNumericValue extends CSSStyleValue {
  static rectify(value: CSSNumberish, unit = 'number'): CSSNumericValue {
    if (value instanceof CSSNumericValue) {
      return value;
    }
    return new CSSUnitValue(value, unit);
  }

  static equal(value1: CSSNumericValue, value2: CSSNumericValue): boolean {
    if (value1.constructor !== value2.constructor) {
      return false;
    }

    if (value1 instanceof CSSUnitValue && value2 instanceof CSSUnitValue) {
      if (value1.value === value2.value && value1.unit === value2.unit) {
        return true;
      }
      return false;
    }

    if (
      (value1 instanceof CSSMathSum && value2 instanceof CSSMathSum) ||
      (value1 instanceof CSSMathProduct && value2 instanceof CSSMathProduct) ||
      (value1 instanceof CSSMathMin && value2 instanceof CSSMathMin) ||
      (value1 instanceof CSSMathMax && value2 instanceof CSSMathMax)
    ) {
      if (value1.values.length !== value2.values.length) {
        return false;
      }
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i++; i < value1.values.length) {
        if (value1.values[i] !== value2.values[i]) {
          return false;
        }
      }
      return true;
    }

    if (
      (value1 instanceof CSSMathNegate && value2 instanceof CSSMathNegate) ||
      (value1 instanceof CSSMathInvert && value2 instanceof CSSMathInvert)
    ) {
      return CSSNumericValue.equal(value1.value, value2.value);
    }

    throw new Error(`value is not CSSNumericValue`);
  }

  //   value: CSSNumericValue;

  //   values: CSSNumericValue[];

  numericType: CSSNumericType;

  private negate(): CSSNumericValue {
    if (this instanceof CSSMathNegate) {
      return this.value;
    }
    if (this instanceof CSSUnitValue) {
      return new CSSUnitValue(-this.value, this.unit);
    }
    return new CSSMathNegate(this);
  }

  private invert(): CSSNumericValue {
    if (this instanceof CSSMathInvert) {
      return this.value;
    }
    if (this instanceof CSSUnitValue && this.unit === 'number') {
      if (this.value === 0 || Object.is(this.value, -0)) {
        throw new RangeError(`0 cant't be invert`);
      } else {
        return new CSSUnitValue(1 / this.value, 'number');
      }
    }
    return new CSSMathInvert(this);
  }

  add(...values: CSSNumberish[]): CSSNumericValue {
    const vals = values.map((item) => CSSNumericValue.rectify(item));
    if (this instanceof CSSMathSum) {
      vals.push(...this.values);
    } else {
      vals.push(this);
    }

    if (
      vals.every((item) => item instanceof CSSUnitValue) &&
      dedupe(vals.map((item) => (item as CSSUnitValue).unit)).length === 1
    ) {
      return new CSSUnitValue(
        sum(vals.map((item) => (item as CSSUnitValue).value)),
        (vals[0] as CSSUnitValue).unit,
      );
    }

    const type = vals
      .map((val) => val.type())
      .reduce((accumulator, currentValue) => CSSNumericType.add(accumulator, currentValue));
    if (type) {
      return new CSSMathSum(...vals);
    }
    throw new Error('cant add CSSNumericValue');
  }

  sub(...values: CSSNumberish[]): CSSNumericValue {
    const vals = values.map((item) => CSSNumericValue.rectify(item).negate());
    return this.add(...vals);
  }

  mul(...values: CSSNumberish[]): CSSNumericValue {
    const vals = values.map((item) => CSSNumericValue.rectify(item));
    if (this instanceof CSSMathProduct) {
      vals.push(...this.values);
    } else {
      vals.push(this);
    }

    if (vals.every((item) => item instanceof CSSUnitValue && item.unit === 'number')) {
      return new CSSUnitValue(product(vals.map((item) => (item as CSSUnitValue).value)), 'number');
    }

    if (
      vals.every((item) => item instanceof CSSUnitValue) &&
      vals.filter((item) => (item as CSSUnitValue).unit === 'number').length === vals.length - 1
    ) {
      const { unit } = vals.find(
        (item) => (item as CSSUnitValue).unit !== 'number',
      ) as CSSUnitValue;
      return new CSSUnitValue(product(vals.map((item) => (item as CSSUnitValue).value)), unit);
    }

    const type = vals
      .map((val) => val.type())
      .reduce((accumulator, currentValue) => CSSNumericType.multiply(accumulator, currentValue));

    if (type) {
      return new CSSMathProduct(...vals);
    }

    throw new Error('cant multipfy CSSNumericValue');
  }

  div(...values: CSSNumberish[]): CSSNumericValue {
    const vals = values.map((item) => CSSNumericValue.rectify(item).invert());
    return this.mul(...vals);
  }

  min(...values: CSSNumberish[]): CSSNumericValue {
    const vals = values.map((item) => CSSNumericValue.rectify(item).invert());
    if (this instanceof CSSMathMin) {
      vals.push(...this.values);
    } else {
      vals.push(this);
    }

    if (
      vals.every((item) => item instanceof CSSUnitValue) &&
      dedupe(vals.map((item) => (item as CSSUnitValue).unit)).length === 1
    ) {
      return new CSSUnitValue(
        min(vals.map((item) => (item as CSSUnitValue).value)),
        (vals[0] as CSSUnitValue).unit,
      );
    }

    const type = vals
      .map((val) => val.type())
      .reduce((accumulator, currentValue) => CSSNumericType.add(accumulator, currentValue));
    if (type) {
      return new CSSMathMin(...vals);
    }
    throw new Error(`can't min CSSNumericValue`);
  }

  max(...values: CSSNumberish[]): CSSNumericValue {
    const vals = values.map((item) => CSSNumericValue.rectify(item).invert());
    if (this instanceof CSSMathMin) {
      vals.push(...this.values);
    } else {
      vals.push(this);
    }

    if (
      vals.every((item) => item instanceof CSSUnitValue) &&
      dedupe(vals.map((item) => (item as CSSUnitValue).unit)).length === 1
    ) {
      return new CSSUnitValue(
        max(vals.map((item) => (item as CSSUnitValue).value)),
        (vals[0] as CSSUnitValue).unit,
      );
    }

    const type = vals
      .map((val) => val.type())
      .reduce((accumulator, currentValue) => CSSNumericType.add(accumulator, currentValue));
    if (type) {
      return new CSSMathMax(...vals);
    }
    throw new Error(`can't max CSSNumericValue`);
  }

  equals(...values: CSSNumberish[]): boolean {
    const vals = values.map((item) => CSSNumericValue.rectify(item).invert());
    // eslint-disable-next-line no-restricted-syntax
    for (const val of vals) {
      if (!CSSNumericValue.equal(this, val)) {
        return false;
      }
    }
    return true;
  }

  createSumValue() {
    if (this instanceof CSSUnitValue) {
      const { unit, value } = this;
    }
  }

  /**
   * transform unit if possible
   * @param unit
   */
  to(unit: string): CSSUnitValue {
    const type = createTypeFromUnit(unit);

    return new CSSUnitValue(this.value, unit);
  }
  toSum(...units: string[]): CSSMathSum {}
  type(): CSSNumericType {
    return this.numericType;
  }

  static parse(cssText: string): CSSNumericValue {}
}

export class CSSUnitValue extends CSSNumericValue {
  numericType: CSSNumericType;
  value: number;
  readonly unit: string;

  constructor(value: number, unit: string) {
    super();
    this.value = value;
    this.numericType = new CSSNumericType(unit);
    this.unit = unit;
  }

  toString() {
    if (this.unit === 'number') {
      return `${this.value}`;
    }
    if (this.unit === 'percent') {
      return `${this.value}%`;
    }
    return `${this.value}${this.unit}`;
  }
}

enum CSSMathOperator {
  'sum',
  'product',
  'negate',
  'invert',
  'min',
  'max',
  'clamp',
}

export abstract class CSSMathValue extends CSSNumericValue {
  abstract readonly operator: CSSMathOperator;
}

export class CSSMathSum extends CSSMathValue {
  operator: CSSMathOperator = CSSMathOperator.sum;
  readonly values: CSSNumericValue[];

  constructor(...args: CSSNumberish[]) {
    super();
    this.values = args.map((item) => CSSNumericValue.rectify(item));
  }
}

export class CSSMathProduct extends CSSMathValue {
  operator: CSSMathOperator = CSSMathOperator.product;
  readonly values: CSSNumericValue[];

  constructor(...args: CSSNumberish[]) {
    super();
    this.values = args.map((item) => CSSNumericValue.rectify(item));
  }
}

export class CSSMathMin extends CSSMathValue {
  operator: CSSMathOperator = CSSMathOperator.min;
  readonly values: CSSNumericValue[];

  constructor(...args: CSSNumberish[]) {
    super();
    this.values = args.map((item) => CSSNumericValue.rectify(item));
  }
}

export class CSSMathMax extends CSSMathValue {
  operator: CSSMathOperator = CSSMathOperator.max;
  readonly values: CSSNumericValue[];

  constructor(...args: CSSNumberish[]) {
    super();
    this.values = args.map((item) => CSSNumericValue.rectify(item));
  }
}

export class CSSMathNegate extends CSSMathValue {
  operator: CSSMathOperator = CSSMathOperator.negate;
  readonly value: CSSNumericValue;

  constructor(args: CSSNumberish) {
    super();
    this.value = CSSNumericValue.rectify(args);
  }
}

export class CSSMathInvert extends CSSMathValue {
  operator: CSSMathOperator = CSSMathOperator.invert;
  readonly value: CSSNumericValue;

  constructor(args: CSSNumberish) {
    super();
    this.value = CSSNumericValue.rectify(args);
  }
}

export class CSSMathClamp extends CSSMathValue {
  operator: CSSMathOperator = CSSMathOperator.clamp;

  readonly min: CSSNumericValue;
  readonly val: CSSNumericValue;
  readonly max: CSSNumericValue;

  constructor(min: CSSNumberish, val: CSSNumberish, max: CSSNumberish) {
    super();
    this.min = CSSNumericValue.rectify(min);
    this.val = CSSNumericValue.rectify(val);
    this.max = CSSNumericValue.rectify(max);
  }
}

/**
 * just shorthand methed
 */
export class CSS {
  static number(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'number');
  }
  static percent(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'percent');
  }

  // <length>
  static em(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'em');
  }
  static ex(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'ex');
  }
  static ch(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'ch');
  }
  static ic(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'ic');
  }
  static rem(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'rem');
  }
  static lh(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'lh');
  }
  static rlh(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'rlh');
  }
  static vw(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'vw');
  }
  static vh(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'vh');
  }
  static vi(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'vi');
  }
  static vb(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'vb');
  }
  static vmin(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'vmin');
  }
  static vmax(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'vmax');
  }
  static cm(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'cm');
  }
  static mm(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'mm');
  }
  static Q(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'Q');
  }
  static in(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'in');
  }
  static pt(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'pt');
  }
  static pc(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'pc');
  }
  static px(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'px');
  }

  // <angle>
  static deg(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'deg');
  }
  static grad(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'grad');
  }
  static rad(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'rad');
  }
  static turn(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'turn');
  }

  // <time>
  static s(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 's');
  }
  static ms(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'ms');
  }

  // <frequency>
  static Hz(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'Hz');
  }
  static kHz(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'kHz');
  }

  // <resolution>
  static dpi(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'dpi');
  }
  static dpcm(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'dpcm');
  }
  static dppx(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'dppx');
  }

  // <flex>
  static fr(value: number): CSSUnitValue {
    return new CSSUnitValue(value, 'fr');
  }
}
