// export type Tuple4<T> = {
//   [0]: T;
//   [1]: T;
//   [2]: T;
//   [3]: T;
//   map: <U>(callbackfn: (value: T, index?: number, array?: T[]) => U, thisArg?: any) => [U, U, U, U];
// };

export interface Array<T> {
  map: <U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any,
  ) => { [K in keyof this]: U };
}

export type Tuple4<T> = [T, T, T, T];

export type Tuple4Number = Tuple4<number>;

export type ComninedValue<T> = T | [T] | [T, T] | [T, T, T] | Tuple4<T>;

export type CombinedNumber = ComninedValue<number>;

export type Length = number;

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Percentage = `${Digit}%` | `${Digit}${Digit}%`;

export type LengthOrPercentage = Length | Percentage;
export type LengthOrPercentageOrAuto = Length | Percentage | 'auto';

type ContentDistribution =
  | 'space-around'
  | 'space-between'
  | 'space-evenly'
  | 'space-between-reverse';

export type ContentPosition = 'center' | 'flex-end' | 'flex-start';

export type AlignContentProperty = 'stretch' | ContentDistribution | ContentPosition;

export type AlignItemsProperty = 'stretch' | ContentPosition;

export type FlexDirectionProperty = 'column' | 'column-reverse' | 'row' | 'row-reverse';

export type FlexFlowProperty = `${FlexDirectionProperty} ${FlexWrapProperty}`;

export type FlexWrapProperty = 'nowrap' | 'wrap' | 'wrap-reverse';

export type JustifyContentProperty = ContentDistribution | ContentPosition;

export type AlignSelfProperty = 'auto' | 'stretch' | ContentPosition;

export interface NodeSizeProperties {
  height?: LengthOrPercentage;
  width?: LengthOrPercentage;
  maxHeight?: LengthOrPercentage;
  maxWidth?: LengthOrPercentage;
  minWidth?: LengthOrPercentage;
  minHeight?: LengthOrPercentage;
}

export interface FlexboxContainerProperties {
  /**
   * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
   *
   * **Syntax**: `row | row-reverse | column | column-reverse`
   *
   * **Initial value**: `row`
   *
   *
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-direction
   */
  flexDirection?: FlexDirectionProperty;

  /**
   * The **`flex-wrap`** CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.
   *
   * **Syntax**: `nowrap | wrap | wrap-reverse`
   *
   * **Initial value**: `nowrap`
   *
   *
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-wrap
   */
  flexWrap?: FlexWrapProperty;

  /**
   * The **`flex-flow`** CSS property is a shorthand property for `flex-direction` and `flex-wrap` properties.
   *
   * **Syntax**: `<'flex-direction'> || <'flex-wrap'>`
   *
   *
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-flow
   */
  flexFlow?: FlexFlowProperty;

  /**
   * The CSS **`align-items`** property sets the `align-self` value on all direct children as a group. The align-self property sets the alignment of an item within its containing block. In Flexbox it controls the alignment of items on the Cross Axis, in Grid Layout it controls the alignment of items on the Block Axis within their grid area.
   *
   * **Syntax**: stretch | flex-start | flex-end | center`
   *
   * **Initial value**: `stretch`
   *
   *
   * @see https://developer.mozilla.org/docs/Web/CSS/align-items
   */
  alignItems?: AlignItemsProperty;

  /**
   * The CSS **`align-content`** property sets how the browser distributes space between and around content items along the cross-axis of a flexbox container, and the main-axis of a grid container.
   *
   * **Syntax**: `stretch | flex-start | flex-end | center | space-between | space-around | space-evenly`
   *
   * **Initial value**: `stretch`
   *
   *
   * @see https://developer.mozilla.org/docs/Web/CSS/align-content
   */
  alignContent?: AlignContentProperty;

  /**
   * The CSS **`justify-content`** property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.
   *
   * **Syntax**: `flex-start | flex-end | center | space-between | space-around | space-evenly`
   *
   * **Initial value**: `flex-start`
   *
   *
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-content
   */
  justifyContent?: JustifyContentProperty;
}

export interface FlexboxItemProperties {
  flex?: [FlexFlowProperty, number?, number?];

  /**
   * The **`align-self`** CSS property aligns flex items of the current flex line overriding the `align-items` value. If any of the item's cross-axis margin is set to `auto`, then `align-self` is ignored. In Grid layout `align-self` aligns the item inside the grid area.
   *
   * **Syntax**: `auto | stretch | flex-start | flex-end | center`
   *
   * **Initial value**: `auto`
   *
   *
   * @see https://developer.mozilla.org/docs/Web/CSS/align-self
   */
  alignSelf?: AlignSelfProperty;

  flexShrink?: number;

  flexBasis?: number | 'auto';

  flexGrow?: number;

  /**
   * set offset width of flex item
   */
  offsetWidth?: LengthOrPercentage;

  /**
   * set offset height of flex item
   */
  offsetHeight?: LengthOrPercentage;
  /**
   * set flex items order
   */
  order?: number;
}

export interface BoxModelProperties {
  boxSizing?: 'contentBox' | 'border-box';

  border?: [Length, Length, Length, Length];
  borderTop?: Length;
  borderRight?: Length;
  borderBottom?: Length;
  borderLeft?: Length;

  margin?: [
    LengthOrPercentageOrAuto,
    LengthOrPercentageOrAuto,
    LengthOrPercentageOrAuto,
    LengthOrPercentageOrAuto,
  ];
  marginTop?: LengthOrPercentageOrAuto;
  marginRight?: LengthOrPercentageOrAuto;
  marginBottom?: LengthOrPercentageOrAuto;
  marginLeft?: LengthOrPercentageOrAuto;

  padding?: [
    LengthOrPercentageOrAuto,
    LengthOrPercentageOrAuto,
    LengthOrPercentageOrAuto,
    LengthOrPercentageOrAuto,
  ];
  paddingTop?: LengthOrPercentageOrAuto;
  paddingRight?: LengthOrPercentageOrAuto;
  paddingBottom?: LengthOrPercentageOrAuto;
  paddingLeft?: LengthOrPercentageOrAuto;
}

export interface NodeProperties
  extends NodeSizeProperties,
    FlexboxContainerProperties,
    FlexboxItemProperties,
    BoxModelProperties {
  computedWidth?: number;

  computedHeight?: number;

  left?: number;

  top?: number;
}

export type NodePropertyKey = keyof NodeProperties;

export interface Layout extends NodeProperties {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  children?: Layout[];
}
