import type {
  AlignContentProperty,
  AlignItemsProperty,
  AlignSelfProperty,
  FlexDirectionProperty,
  FlexFlowProperty,
  FlexWrapProperty,
  JustifyContentProperty,
  Length,
  LengthOrPercentage,
  LengthOrPercentageOrAuto,
  NodeProperties,
} from './types';

export class ParsedNodeProperties implements NodeProperties {
  // computedWidth?: number;

  // computedHeight?: number;

  left?: number;

  top?: number;

  //--

  height?: LengthOrPercentage;
  width?: LengthOrPercentage;
  maxHeight?: LengthOrPercentage;
  maxWidth?: LengthOrPercentage;
  minWidth?: LengthOrPercentage;
  minHeight?: LengthOrPercentage;

  //--

  flexDirection?: FlexDirectionProperty;
  flexWrap?: FlexWrapProperty;
  flexFlow?: FlexFlowProperty;
  alignItems?: AlignItemsProperty;
  alignContent?: AlignContentProperty;
  justifyContent?: JustifyContentProperty;

  //--

  flex?: [FlexFlowProperty, number?, number?];
  alignSelf?: AlignSelfProperty;

  flexShrink?: number;

  flexBasis?: number | 'auto';

  flexGrow?: number;

  offsetWidth?: LengthOrPercentage;

  offsetHeight?: LengthOrPercentage;

  order?: number;

  //--
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
