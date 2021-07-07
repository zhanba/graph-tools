/* eslint-disable no-param-reassign */
import { FlexLine } from './flexLine';
import { SizePropsBridge } from './util';
import { getProp, parseSpaceBetween, exchangeFlexProp, ObjectTyped } from './util';
import type { Node } from './node';
import { assertIsDefined, assertIsNumber } from './assert';

class Compose extends SizePropsBridge {
  container: Node;
  flexLines: FlexLine[];

  constructor(container: Node) {
    super();
    this.container = container;
    assertIsDefined(container.flexDirection);
    const props = getProp(container.flexDirection);
    ObjectTyped.keys(props).forEach((prop) => {
      // @ts-ignore
      this[prop] = props[prop];
    });
    container.children.forEach((item) => {
      item.config.parse();
    });
    container.children = this.parseOrder(container.children);
    this.flexLines = this.parseFlexLines(container.children);
  }

  parseOrder(items: Node[]) {
    return items.sort((a, b) => {
      // @ts-ignore
      // eslint-disable-next-line no-bitwise
      const ar = a?.order | 0;
      // @ts-ignore
      // eslint-disable-next-line no-bitwise
      const br = b?.order | 0;
      if (a.order && b.order) return ar > br ? 1 : -1;
      if (a.order) return ar > 0 ? 1 : -1;
      if (b.order) return br > 0 ? -1 : 1;
      return a.id > b.id ? 1 : -1;
    });
  }

  /**
   * parse flex lines by flexWrap
   * @param {Array} items flex items
   */
  parseFlexLines(items: Node[]) {
    const wrap = this.container.flexWrap;
    const { flexDirection } = this.container;
    const containerPropValue = this.container[this.mainSize];
    let lines = [];
    if (wrap === 'nowrap' || !containerPropValue) {
      lines = [items];
    } else {
      let line: Node[] = [];
      let propValue = 0;
      items.forEach((item) => {
        const value = item[this.mainLayoutSize];
        assertIsNumber(value);
        if (propValue + value > containerPropValue && line.length) {
          lines.push(line);
          propValue = 0;
          line = [];
        }
        propValue += value;
        line.push(item);
      });
      if (line.length) {
        lines.push(line);
        line = [];
      }
      if (wrap === 'wrap-reverse') {
        lines = lines.reverse();
      }
    }

    if (flexDirection === 'row-reverse' || flexDirection === 'column-reverse') {
      lines = lines.map((line) => {
        return line.reverse();
      });
    }
    lines = lines.map((line) => {
      return new FlexLine(line, this.container);
    });
    return lines;
  }

  /**
   * parse align-content on multiline flex lines
   */
  parseAlignContent() {
    let { alignContent } = this.container;
    assertIsDefined(alignContent);
    let crossAxisSize = this.container[this.crossSize];
    let space = 0;
    const lineLength = this.flexLines.length;
    if (crossAxisSize) {
      let linesCrossAxisSize = 0;
      this.flexLines.forEach((line) => {
        linesCrossAxisSize += line.crossAxisSize;
      });
      // margin between lines
      crossAxisSize = parseFloat(crossAxisSize as string);
      space = crossAxisSize - linesCrossAxisSize;
    }
    let linesMarginSize: number[] = [];
    if (lineLength === 1) {
      this.container.alignContent = 'stretch';
      linesMarginSize = [0, space];
    } else {
      if (this.container.flexWrap === 'wrap-reverse') {
        alignContent = exchangeFlexProp(alignContent);
      }
      linesMarginSize = parseSpaceBetween(space, alignContent, lineLength);
    }
    let crossPosition = 0;
    this.flexLines.forEach((line, index) => {
      crossPosition += linesMarginSize[index] || 0;
      line.crossPosition = crossPosition;
      line.crossSpace = linesMarginSize[index + 1] || 0;
      crossPosition += line.crossAxisSize;
    });
  }

  parseAlignSelf() {
    this.flexLines.forEach((line) => {
      line.parseAlignSelf(line.crossAxisSize);
    });
  }

  computeContainerSize() {
    const line = this.flexLines[0];
    if (!this.container[this.crossSize]) {
      this.container[this.crossSize] = line.crossAxisSize;
    }
    if (!this.container[this.mainSize]) {
      this.container[this.mainSize] = line.mainAxisSize;
    }
  }

  parseMainAxis() {
    this.flexLines.forEach((line) => {
      line.parseMainAxis();
    });
  }

  compose() {
    this.parseAlignContent();
    this.parseAlignSelf();
    this.parseMainAxis();
    this.computeContainerSize();
  }
}

export default Compose;
