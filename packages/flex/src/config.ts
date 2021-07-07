/* eslint-disable no-param-reassign */
// @ts-nocheck
import { ParsedNodeProperties } from './property';
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
import type { Node } from './node';
import type { NodeProperties, Tuple4Number } from './types';
import { assertIsDefined, assertIsString } from './assert';

export class Config extends ParsedNodeProperties {
  config: NodeProperties;

  node: Node;

  constructor(config = {}, node: Node) {
    super();
    this.config = {};
    this.node = node;
    Object.keys(config).forEach((item) => {
      if (flexProperties.indexOf(item) === -1) {
        throw new Error(`config ${item} is not valid`);
      }
      this[item] = config[item];
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

  parseNumberValue(value: any, parentValue?: any): number {
    if (value === 'auto' || typeof value === 'number') return value;
    if (!value) return 0;
    const percentValue = parsePercentValue(value);
    if (typeof percentValue === 'number') {
      if (typeof parentValue === 'string') {
        parentValue = this.node.parent[parentValue];
      }
      value = percentValue * parentValue;
    } else if (/^[\d.-]+$/.test(value)) {
      value = parseFloat(value);
    } else {
      throw new Error(`${value} is not a number`);
    }
    return value;
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
      if (this[item] < 0 || this[item] === 'auto') {
        throw new Error(`${item}:${this[item]} is not valid`);
      }
      return this[item];
    }) as Tuple4Number;
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
      if (this[item] < 0 || this[item] === 'auto') {
        throw new Error(`${item}:${this[item]} is not valid`);
      }
      return this[item];
    }) as Tuple4Number;
  }

  parseMargin() {
    let margin = this.margin || [0, 0, 0, 0];
    if (margin) {
      margin = parseCombineValue(margin).map((item) => {
        return this.parseNumberValue(item, 'width');
      });
    }
    const marginList = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'] as const;
    this.margin = marginList.map((item, index) => {
      this[item] = this.parseNumberValue(this[item], 'width') || margin[index];
      return this[item];
    });
  }

  parseFlex() {
    const { flex } = this;
    if (flex) {
      if (typeof flex === 'number') {
        this.flexGrow = this.flexGrow || flex;
      } else {
        assertIsString(flex);
        const [flexFlow, flexShrink, flexBasis] = flex.split(/\s+/);
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
    this.flexShrink = parseFloat(this.flexShrink) || 1;
    this.flexGrow = parseFloat(this.flexGrow) || 0;
    let { flexBasis } = this;
    if (flexBasis) {
      assertIsDefined(this.node.parent);
      const { flexDirection } = this.node.parent;
      const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
      flexBasis = this.parseNumberValue(flexBasis, isRow ? 'width' : 'height');
      this.flexBasis = flexBasis;
    } else if (this.flexBasis === '') {
      this.flexBasis = undefined;
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
          this.flexDirection = item;
        } else if (flexWrapValues.indexOf(item) > -1) {
          this.flexWrap = item;
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
        const allowValues = props[item];
        if (allowValues.indexOf(this[item]) === -1) {
          throw new Error(`${item} value:${this[item]} is not valid`);
        }
      } else {
        // eslint-disable-next-line prefer-destructuring
        this[item] = props[item][0];
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
      width = this.offsetWidth || 0;
    }
    const { minWidth } = this;
    let { maxWidth } = this;
    if (maxWidth && minWidth && maxWidth < minWidth) {
      maxWidth = minWidth;
    }
    if (minWidth && width < minWidth) {
      width = minWidth;
    }
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
    }
    this.config.computedWidth = width;
  }

  parseLayoutWidth() {
    let width = this.computedWidth;

    const marginLeft = parseMarginAuto(this.marginLeft);
    const marginRight = parseMarginAuto(this.marginRight);
    width += marginLeft + marginRight;
    if (this.boxSizing !== 'border-box') {
      const props = ['borderLeft', 'borderRight', 'paddingLeft', 'paddingRight'];
      props.forEach((item) => {
        width += this[item] || 0;
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
      height = this.offsetHeight || 0;
    }
    const { minHeight } = this;
    let { maxHeight } = this;
    if (maxHeight && minHeight && maxHeight < minHeight) {
      maxHeight = minHeight;
    }
    if (minHeight && height < minHeight) {
      height = minHeight;
    }
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
    }
    this.config.computedHeight = height;
  }

  parseLayoutHeight() {
    let height = this.computedHeight;

    const marginTop = parseMarginAuto(this.marginTop);
    const marginBottom = parseMarginAuto(this.marginBottom);
    height += marginTop + marginBottom;
    if (this.boxSizing !== 'border-box') {
      const props = ['borderTop', 'borderBottom', 'paddingTop', 'paddingBottom'];
      props.forEach((item) => {
        height += this[item] || 0;
      });
    }
    this.layoutHeight = height;
  }
}

export default Config;
