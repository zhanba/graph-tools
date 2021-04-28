/* eslint-disable no-param-reassign */
import type {
  AlignContentProperty,
  ComninedValue,
  FlexDirectionProperty,
  Percentage,
} from './types';

export const flexProperties = [
  'flex',
  'flexDirection',
  'flexWrap',
  'flexFlow',
  'justifyContent',
  'alignContent',
  'alignItems',
  'alignSelf',
  'flexShrink',
  'flexBasis',
  'flexGrow',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'border',
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
  'height',
  'width',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'boxSizing',
  'layoutWidth',
  'layoutHeight',
  'offsetWidth',
  'offsetHeight',
  'computedWidth',
  'computedHeight',
  'order',
];

export const flexDirectionValues = ['row', 'row-reverse', 'column', 'column-reverse'];

export const flexWrapValues = ['nowrap', 'wrap', 'wrap-reverse'];

export const justifyContentValues = [
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
];

export const alignItemsValues = ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'];

export const alignSelfValues = ['auto', 'stretch', 'flex-start', 'flex-end', 'center', 'baseline'];

export const alignContentValues = [
  'stretch',
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
];

export function parseCombineValue<T>(value: ComninedValue<T>) {
  if (!Array.isArray(value)) {
    value = [value, value, value, value];
  } else if (value.length === 1) {
    value = [value[0], value[0], value[0], value[0]];
  } else if (value.length === 2) {
    value = [value[0], value[1], value[0], value[1]];
  } else if (value.length === 3) {
    value = [value[0], value[1], value[2], value[1]];
  }
  return value;
}

/**
 * parse percent value
 * @param {String} value percent value, like `10%`
 */
export function parsePercentValue(value: Percentage) {
  if (!/%$/.test(value)) return false;
  return 0.01 * parseInt(value, 10);
}

/**
 * parse space between items
 * @param {Number} space space size
 * @param {String} type flex-start/flex-end/...
 * @param {Number} num array size
 */
export function parseSpaceBetween(space: number, type: AlignContentProperty, num: number) {
  const marginSize: number[] = [];
  const fillFull = (size = 0) => {
    // eslint-disable-next-line no-plusplus
    for (let i = marginSize.length; i < num + 1; i++) {
      marginSize[i] = size;
    }
  };
  if (space < 0) {
    if (type === 'space-between' || type === 'stretch') {
      type = 'flex-start';
    } else if (type === 'space-around' || type === 'space-evenly') {
      type = 'center';
    }
  }
  if (type === 'flex-end') {
    marginSize[0] = space;
    fillFull();
  } else if (type === 'center') {
    const itemSize = space / 2;
    marginSize[0] = itemSize;
    fillFull();
    marginSize[num] = itemSize;
  } else if (type === 'space-between') {
    marginSize[0] = 0;
    if (num === 1) {
      fillFull(space);
    } else {
      fillFull(space / (num - 1));
      marginSize[num] = 0;
    }
  } else if (type === 'space-between-reverse') {
    if (num === 1) {
      marginSize[0] = space;
      fillFull(0);
    } else {
      marginSize[0] = 0;
      fillFull(space / (num - 1));
      marginSize[num] = 0;
    }
  } else if (type === 'space-around') {
    const itemSize = space / num;
    marginSize[0] = itemSize / 2;
    fillFull(itemSize);
    marginSize[num] = itemSize / 2;
  } else if (type === 'space-evenly') {
    const itemSize = space / (num + 1);
    fillFull(itemSize);
  } else if (type === 'stretch') {
    const itemSize = space / num;
    marginSize[0] = 0;
    fillFull(itemSize);
  } else {
    // flex-start
    fillFull();
  }
  return marginSize;
}

export class SizePropsBridge {
  mainLayoutSize!: 'layoutHeight' | 'layoutWidth';
  crossLayoutSize!: 'layoutWidth' | 'layoutHeight';
  mainSize!: 'height' | 'width';
  crossSize!: 'height' | 'width';
  mainComputedSize!: 'computedHeight' | 'computedWidth';
  crossComputedSize!: 'computedHeight' | 'computedWidth';
  mainPos!: 'top' | 'left';
  crossPos!: 'top' | 'left';
  mainMaxSize!: 'maxHeight' | 'maxWidth';
  mainMinSize!: 'minHeight' | 'minWidth';
  crossMaxSize!: 'maxHeight' | 'maxWidth';
  mainMarginStart!: 'marginTop' | 'marginLeft';
  mainMarginEnd!: 'marginBottom' | 'marginRight';
  crossMarginStart!: 'marginTop' | 'marginLeft';
  crossMarginEnd!: 'marginBottom' | 'marginRight';
}

interface PropsBridge {
  mainLayoutSize: 'layoutHeight' | 'layoutWidth';
  crossLayoutSize: 'layoutWidth' | 'layoutHeight';
  mainSize: 'height' | 'width';
  crossSize: 'height' | 'width';
  mainComputedSize: 'computedHeight' | 'computedWidth';
  crossComputedSize: 'computedHeight' | 'computedWidth';
  mainPos: 'top' | 'left';
  crossPos: 'top' | 'left';
  mainMaxSize: 'maxHeight' | 'maxWidth';
  mainMinSize: 'minHeight' | 'minWidth';
  crossMaxSize: 'maxHeight' | 'maxWidth';
  mainMarginStart: 'marginTop' | 'marginLeft';
  mainMarginEnd: 'marginBottom' | 'marginRight';
  crossMarginStart: 'marginTop' | 'marginLeft';
  crossMarginEnd: 'marginBottom' | 'marginRight';
}

export function getProp(flexDirection: FlexDirectionProperty): PropsBridge {
  if (flexDirection === 'column' || flexDirection === 'column-reverse') {
    return {
      mainLayoutSize: 'layoutHeight',
      crossLayoutSize: 'layoutWidth',
      mainSize: 'height',
      mainComputedSize: 'computedHeight',
      crossSize: 'width',
      crossComputedSize: 'computedWidth',
      mainPos: 'top',
      mainMaxSize: 'maxHeight',
      mainMinSize: 'minHeight',
      crossPos: 'left',
      crossMaxSize: 'maxWidth',
      mainMarginStart: 'marginTop',
      mainMarginEnd: 'marginBottom',
      crossMarginStart: 'marginLeft',
      crossMarginEnd: 'marginRight',
    };
  }
  return {
    mainLayoutSize: 'layoutWidth',
    crossLayoutSize: 'layoutHeight',
    mainSize: 'width',
    mainComputedSize: 'computedWidth',
    crossSize: 'height',
    crossComputedSize: 'computedHeight',
    mainPos: 'left',
    mainMaxSize: 'maxWidth',
    mainMinSize: 'minWidth',
    crossMaxSize: 'maxHeight',
    crossPos: 'top',
    mainMarginStart: 'marginLeft',
    mainMarginEnd: 'marginRight',
    crossMarginStart: 'marginTop',
    crossMarginEnd: 'marginBottom',
  };
}

export function exchangeFlexProp(prop: AlignContentProperty) {
  if (prop === 'flex-start') return 'flex-end';
  if (prop === 'flex-end') return 'flex-start';
  if (prop === 'space-between') return 'space-between-reverse';
  return prop;
}

export function parseMarginAuto(value: 'auto' | number, autoValue = 0) {
  if (value === 'auto') return autoValue;
  return value || 0;
}

/**
 * Nicely typed aliases for some `Object` Methods
 * - PSA: Don't mutate `yourObject`s
 * - Numerical keys are BAD, resolve that issue upstream
 * - Discussion: https://stackoverflow.com/a/65117465/565877
 */
export const ObjectTyped = {
  /**
   * Object.keys, but with nice typing (`Array<keyof T>`)
   */
  keys: Object.keys as <T extends {}>(yourObject: T) => (keyof T)[],
  /**
   * Object.values, but with nice typing
   */
  values: Object.values as <T extends {}>(yourObject: T) => T[keyof T][],
  /**
   * Object.entries, but with nice typing
   */
  entries: Object.entries as <T extends {}>(yourObject: T) => [keyof T, T[keyof T]][],
};
