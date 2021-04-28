import { assertIsDefined, assertIsNumber } from './assert';
import type Node from './node';
import { ParsedNodeProperties } from './property';
import type {
  FlexDirectionProperty,
  FlexWrapProperty,
  Length,
  LengthOrPercentage,
  LengthOrPercentageOrAuto,
  NodeProperties,
  NodePropertyKey,
  Percentage,
  Tuple4,
  Tuple4Number,
} from './types';
import {
  flexProperties,
  flexDirectionValues,
  flexWrapValues,
  justifyContentValues,
  alignItemsValues,
  alignSelfValues,
  alignContentValues,
  parseCombineValue,
  parsePercentValue,
  parseMarginAuto,
  ObjectTyped,
} from './util';

class Config extends ParsedNodeProperties {
  private config: NodeProperties;

  private node: Node;

  layoutWidth!: number;

  layoutHeight!: number;

  constructor(config: NodeProperties = {}, node: Node) {
    super();
    this.config = {};
    this.node = node;
    ObjectTyped.keys(config).forEach((item) => {
      if (flexProperties.indexOf(item) === -1) {
        throw new Error(`config ${item} is not valid`);
      }
      this[item] = config[item] as any;
    });
  }

  parse() {
    this.parseBorder();
    this.parsePadding();
    this.parseMargin();
    this.parseFlex();
    this.parseFlexFlow();
    this.parseFlexProps();
    this.parseSize();
    this.parseComputedWidth();
    this.parseComputedHeight();
    this.parseLayoutWidth();
    this.parseLayoutHeight();
  }

  parseNumberValue(value?: 'auto', parentValue?: NodePropertyKey | number): 'auto';
  parseNumberValue(value?: Length, parentValue?: NodePropertyKey | number): Length;
  parseNumberValue(value?: LengthOrPercentage, parentValue?: NodePropertyKey | number): number;
  parseNumberValue(
    value?: LengthOrPercentageOrAuto,
    parentValue?: NodePropertyKey | number,
  ): 'auto' | number;
  parseNumberValue(value?: 'auto' | number | Percentage, parentValue?: NodePropertyKey | number) {
    if (value === 'auto' || typeof value === 'number') return value;
    if (!value) return 0;
    if (parentValue === undefined) {
      throw new Error('no parent value');
    }
    const percentValue = parsePercentValue(value);
    if (typeof percentValue === 'number') {
      let parentNumberValue: number;
      if (typeof parentValue === 'string') {
        const val = this.node?.parent?.[parentValue];
        if (typeof val === 'number') {
          parentNumberValue = val;
        } else {
          throw new Error(`${parentValue} of parent is not a number`);
        }
      } else {
        parentNumberValue = parentValue;
      }
      return percentValue * parentNumberValue;
    }
    if (/^[\d.-]+$/.test(value)) {
      return parseFloat(value);
    }
    throw new Error(`${value} is not a number`);
  }

  parseBorder() {
    let border = this.border || [0, 0, 0, 0];
    if (border) {
      border = parseCombineValue(border).map((item) => {
        return this.parseNumberValue(item);
      }) as Tuple4Number;
    }
    const borderList = ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'] as const;
    this.border = borderList.map((item, index) => {
      this[item] = this.parseNumberValue(this[item]) || border[index];
      // if (this[item]! < 0 || this[item] === 'auto') {
      //   throw new Error(`${item}:${this[item]} is not valid`);
      // }
      assertIsNumber(this[item]);
      return this[item];
    }) as Tuple4<Length>;
  }

  parsePadding() {
    let padding = this.padding || [0, 0, 0, 0];
    if (padding) {
      padding = parseCombineValue(padding).map((item) => {
        return this.parseNumberValue(item, 'width');
      }) as Tuple4Number;
    }
    const paddingList = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const;
    this.padding = paddingList.map((item, index) => {
      this[item] = this.parseNumberValue(this[item], 'width') || padding[index];
      if (this[item]! < 0 || this[item] === 'auto') {
        throw new Error(`${item}:${this[item]} is not valid`);
      }
      return this[item];
    }) as Tuple4<Length>;
  }

  parseMargin() {
    let margin = this.margin || [0, 0, 0, 0];
    if (margin) {
      margin = parseCombineValue(margin).map((item) => {
        return this.parseNumberValue(item, 'width');
      }) as Tuple4Number;
    }
    const marginList = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'] as const;
    this.margin = marginList.map((item, index) => {
      this[item] = this.parseNumberValue(this[item], 'width') || margin[index];
      return this[item];
    }) as Tuple4<Length>;
  }

  parseFlex() {
    const { flex } = this;
    if (flex) {
      if (typeof flex === 'number') {
        this.flexGrow = this.flexGrow || flex;
      } else {
        const [flexFlow, flexShrink, flexBasis] = flex;
        if (!this.flexFlow) {
          this.flexFlow = flexFlow;
        }
        if (!this.flexShrink) {
          this.flexShrink = flexShrink;
        }
        if (!this.flexBasis) {
          this.flexBasis = flexBasis;
        }
      }
    }

    this.flexShrink = this.flexShrink ?? 1;
    this.flexGrow = this.flexGrow ?? 0;
    let { flexBasis } = this;
    if (flexBasis && this.node.parent) {
      const { flexDirection } = this.node.parent;
      const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
      flexBasis = this.parseNumberValue(flexBasis, isRow ? 'width' : 'height');
      this.flexBasis = flexBasis;
    }
  }

  parseSize() {
    const widths = ['width', 'minWidth', 'maxWidth'] as const;
    widths.forEach((item) => {
      this[item] = this.parseNumberValue(this[item], 'width') || 0;
    });
    if (this.width && !this.offsetWidth) {
      this.offsetWidth = this.width;
    }
    const heights = ['height', 'minHeight', 'maxHeight'] as const;
    heights.forEach((item) => {
      this[item] = this.parseNumberValue(this[item], 'height') || 0;
    });
    if (this.height && !this.offsetHeight) {
      this.offsetHeight = this.height;
    }
  }

  parseFlexFlow() {
    const { flexFlow } = this;
    if (flexFlow) {
      flexFlow.split(/\s+/).forEach((item) => {
        if (flexDirectionValues.indexOf(item) > -1) {
          this.flexDirection = item as FlexDirectionProperty;
        } else if (flexWrapValues.indexOf(item) > -1) {
          this.flexWrap = item as FlexWrapProperty;
        } else {
          throw new Error(`FlexFlow: ${flexFlow} is not valid`);
        }
      });
    }
  }

  parseFlexProps() {
    const props = {
      flexDirection: flexDirectionValues,
      flexWrap: flexWrapValues,
      justifyContent: justifyContentValues,
      alignItems: alignItemsValues,
      alignSelf: alignSelfValues,
      alignContent: alignContentValues,
    };
    ObjectTyped.keys(props).forEach((item) => {
      if (this[item]) {
        const allowValues = props[item] as readonly string[];
        assertIsDefined(this[item]);
        if (allowValues.indexOf(this[item]!) === -1) {
          throw new Error(`${item} value:${this[item]} is not valid`);
        }
      } else {
        // eslint-disable-next-line prefer-destructuring
        this[item] = props[item][0] as any;
      }
    });
  }

  getFlexBasis(type = 'width') {
    assertIsDefined(this.node.parent);
    const { flexDirection } = this.node.parent;
    const { flexBasis } = this;
    if (flexBasis !== undefined && flexBasis !== 'auto') {
      const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
      if ((type === 'width' && isRow) || (type === 'height' && !isRow)) {
        return this.parseNumberValue(flexBasis, isRow ? 'width' : 'height');
      }
    }
  }

  get computedWidth() {
    return this.config.computedWidth;
  }

  set computedWidth(value) {
    this.config.computedWidth = value;
    this.parseLayoutWidth();
  }

  parseComputedWidth() {
    let width = this.getFlexBasis('width');
    if (width === undefined) {
      width = this.parseNumberValue(this.offsetWidth) || 0;
    }
    const { minWidth } = this;
    let { maxWidth } = this;
    if (maxWidth && minWidth && maxWidth < minWidth) {
      maxWidth = minWidth;
    }
    if (minWidth && width < minWidth) {
      width = this.parseNumberValue(minWidth);
    }
    if (maxWidth && width > maxWidth) {
      width = this.parseNumberValue(maxWidth);
    }
    this.config.computedWidth = width;
  }

  parseLayoutWidth() {
    let width = this.computedWidth || 0;
    assertIsDefined(this.marginLeft);
    assertIsDefined(this.marginRight);

    const marginLeft = parseMarginAuto(this.parseNumberValue(this.marginLeft));
    const marginRight = parseMarginAuto(this.parseNumberValue(this.marginRight));
    width += marginLeft + marginRight;
    if (this.boxSizing !== 'border-box') {
      const props = ['borderLeft', 'borderRight', 'paddingLeft', 'paddingRight'] as const;
      props.forEach((item) => {
        assertIsNumber(this[item]);
        width += (this[item] as number) || 0;
      });
    }
    this.layoutWidth = width;
  }

  get computedHeight() {
    return this.config.computedHeight;
  }

  set computedHeight(value) {
    this.config.computedHeight = value;
    this.parseLayoutHeight();
  }

  parseComputedHeight() {
    let height = this.getFlexBasis('height');
    if (height === undefined) {
      height = this.parseNumberValue(this.offsetHeight) || 0;
    }
    const { minHeight } = this;
    let { maxHeight } = this;
    if (maxHeight && minHeight && maxHeight < minHeight) {
      maxHeight = minHeight;
    }
    if (minHeight && height < minHeight) {
      height = this.parseNumberValue(minHeight);
    }
    if (maxHeight && height > maxHeight) {
      height = this.parseNumberValue(maxHeight);
    }
    this.config.computedHeight = height;
  }

  parseLayoutHeight() {
    let height = this.computedHeight || 0;

    const marginTop = parseMarginAuto(this.parseNumberValue(this.marginTop));
    const marginBottom = parseMarginAuto(this.parseNumberValue(this.marginBottom));
    height += marginTop + marginBottom;
    if (this.boxSizing !== 'border-box') {
      const props = ['borderTop', 'borderBottom', 'paddingTop', 'paddingBottom'] as const;
      props.forEach((item) => {
        assertIsNumber(this[item]);
        height += (this[item] as number) || 0;
      });
    }
    this.layoutHeight = height;
  }
}

export default Config;
