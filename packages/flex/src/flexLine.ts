/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import { SizePropsBridge } from './util';
import { getProp, parseSpaceBetween, exchangeFlexProp, parseMarginAuto, ObjectTyped } from './util';
import type { Node } from './node';
import type { FlexDirectionProperty } from './types';
import { assertIsDefined, assertIsNumber } from './assert';

const CROSS_AXIS_SIZE = Symbol('crossAxisSize');

export class FlexLine extends SizePropsBridge {
  [CROSS_AXIS_SIZE]?: number;

  items: Node[];
  container: Node;
  flexDirection: FlexDirectionProperty;
  crossPosition: number;
  crossSpace: number;

  constructor(items: Node[], container: Node) {
    super();
    this.items = items;
    this.container = container;
    this.flexDirection = container.flexDirection!;
    this.crossPosition = 0;
    this.crossSpace = 0;
    const props = getProp(this.flexDirection);
    ObjectTyped.keys(props).forEach((prop) => {
      this[prop] = props[prop];
    });
  }

  /**
   * get main axis size base on flex direction
   */
  get mainAxisSize() {
    let value = 0;
    this.items.forEach((item) => {
      value += (item[this.mainLayoutSize] as number) || 0;
    });
    return value;
  }

  /**
   * get cross axis size based on flex direction
   */
  get crossAxisSize() {
    if (this[CROSS_AXIS_SIZE]) return this[CROSS_AXIS_SIZE] as number;
    const values = this.items.map((item) => {
      return item[this.crossLayoutSize] || 0;
    }) as number[];
    const result = Math.max(...values);
    this[CROSS_AXIS_SIZE] = result;
    return result;
  }

  parseAutoCrossMargin(item: Node, crossSize: number) {
    const startAuto = item[this.crossMarginStart] === 'auto';
    const endAuto = item[this.crossMarginEnd] === 'auto';
    if (startAuto || endAuto) {
      if (this.container.alignContent === 'stretch') {
        crossSize += this.crossSpace;
      }
      const layoutSize = item[this.crossLayoutSize];
      assertIsNumber(layoutSize);
      let size = 0;
      if (startAuto && endAuto) {
        size = (crossSize - layoutSize) / 2;
      } else if (startAuto) {
        size = crossSize - layoutSize;
      } else {
        size = item[this.crossMarginStart] as number;
      }
      item[this.crossPos] = this.crossPosition + size;
      return true;
    }
    return false;
  }

  parseItemAlignSelf(item: Node, crossSize: number) {
    // has auto value in margin on cross axis
    if (this.parseAutoCrossMargin(item, crossSize)) return;

    let { alignSelf } = item;
    if (alignSelf === 'auto') {
      alignSelf = item.parent?.alignItems;
    }
    const { flexWrap } = this.container;
    if (flexWrap === 'wrap-reverse') {
      assertIsDefined(alignSelf);
      alignSelf = exchangeFlexProp(alignSelf);
    }
    const layoutSize = item[this.crossLayoutSize];
    assertIsNumber(layoutSize);
    const itemCrossSize = item[this.crossSize];
    let { crossSpace } = this;
    if (this.container.alignContent !== 'stretch') {
      crossSpace = 0;
    }
    let crossPosition = 0;
    switch (alignSelf) {
      case 'flex-end':
        crossPosition = crossSpace + crossSize - layoutSize;
        break;
      case 'center':
        crossPosition = (crossSpace + crossSize - layoutSize) / 2;
        break;
      case 'stretch':
        // stretch item cross size
        if (!itemCrossSize) {
          const maxSize = item[this.crossMaxSize] || 0;
          let caculateSize =
            this.crossAxisSize - item[this.crossLayoutSize] + item[this.crossComputedSize];
          if (this.container.alignContent === 'stretch') {
            caculateSize += this.crossSpace;
          }
          if (maxSize) {
            assertIsNumber(maxSize);
            item[this.crossComputedSize] = Math.min(caculateSize, maxSize);
          } else {
            item[this.crossComputedSize] = caculateSize;
          }
        } else if (flexWrap === 'wrap-reverse') {
          crossPosition = crossSpace + crossSize - layoutSize;
        }
        break;
      case 'baseline':
        throw new Error('align-self:baseline is not support');
      default:
        // default is flex-start
        break;
    }
    const pos = this.crossPosition + crossPosition;
    item[this.crossPos] = pos + parseMarginAuto(item[this.crossMarginStart]);
  }

  parseAlignSelf(crossSize = 0) {
    this.items.forEach((item) => {
      this.parseItemAlignSelf(item, crossSize);
    });
  }

  hasMarginAutoInMainAxis() {
    return this.items.some((item) => {
      return item[this.mainMarginStart] === 'auto' || item[this.mainMarginEnd] === 'auto';
    });
  }

  hasFlexGrow() {
    return this.items.some((item) => {
      return item.flexGrow;
    });
  }

  parseByFlexGrow(space: number) {
    let grow = 0;
    let max = 0;
    const items: { max?: number; grow?: number }[] = [];
    this.items.forEach((item) => {
      grow += item.flexGrow || 0;
      items.push({ max: item[this.mainMaxSize] as number, grow: item.flexGrow });
      if (item[this.mainMaxSize]) max++;
    });
    while (true) {
      const itemSpace = space / Math.max(grow, 1);
      if (!max) {
        items.forEach((item, index) => {
          if (item.grow) {
            const increSpace = item.grow * itemSpace;
            this.items[index][this.mainComputedSize] += increSpace;
            space -= increSpace;
          }
        });
        break;
      }
      let flag = false;
      items.forEach((item, index) => {
        if (item.max && item.grow) {
          const leaveSpace = item.max - this.items[index][this.mainComputedSize];
          if (itemSpace * item.grow > leaveSpace) {
            this.items[index][this.mainComputedSize] = item.max;
            space -= leaveSpace;
            grow -= item.grow;
            delete item.max;
            delete item.grow;
            flag = true;
          }
        }
      });
      if (!grow) break;
      if (!flag) {
        max = 0;
      }
    }
    return space;
  }

  parseByMarginAuto(space: number) {
    let marginAutoNum = 0;
    this.items.forEach((item) => {
      if (item[this.mainMarginStart] === 'auto') {
        marginAutoNum++;
      }
      if (item[this.mainMarginEnd] === 'auto') {
        marginAutoNum++;
      }
    });
    const itemSpace = space / marginAutoNum;
    let pos = 0;
    this.items.forEach((item) => {
      pos += parseMarginAuto(item[this.mainMarginStart], itemSpace);
      item[this.mainPos] = pos;
      pos += item[this.mainLayoutSize] - parseMarginAuto(item[this.mainMarginStart]);
      pos +=
        parseMarginAuto(item[this.mainMarginEnd], itemSpace) -
        parseMarginAuto(item[this.mainMarginEnd]);
    });
  }

  parseJustifyContent() {
    let { justifyContent } = this.container;
    assertIsDefined(justifyContent);
    const { flexDirection } = this.container;
    if (flexDirection === 'row-reverse' || flexDirection === 'column-reverse') {
      justifyContent = exchangeFlexProp(justifyContent);
    }
    return justifyContent;
  }

  parseByJustifyContentPositive(space: number) {
    return this.parseByJustifyContentSpace(space);
  }

  parseByJustifyContentSpace(space: number) {
    const justifyContent = this.parseJustifyContent();
    assertIsDefined(justifyContent);
    const marginSizes = parseSpaceBetween(space, justifyContent, this.items.length);
    let pos = 0;
    this.items.forEach((item, index) => {
      pos += marginSizes[index] || 0;
      item[this.mainPos] = pos + parseMarginAuto(item[this.mainMarginStart]);
      pos += item[this.mainLayoutSize];
    });
  }

  parseByJustifyContentNegative(space: number) {
    let shrink = 0;
    let min = 0;
    const items: { min?: number; shrink?: number }[] = [];
    this.items.forEach((item) => {
      assertIsDefined(item.flexShrink);
      const shrinkItem = item.flexShrink * item[this.mainComputedSize];
      shrink += shrinkItem;
      items.push({ min: item[this.mainMinSize] as number, shrink: shrinkItem });
      if (item[this.mainMinSize]) min++;
    });
    while (true) {
      const itemSpace = (0 - space) / shrink;
      if (!min) {
        items.forEach((item, index) => {
          if (item.shrink) {
            const decreSpace = item.shrink * itemSpace;
            const size = this.items[index][this.mainComputedSize] - decreSpace;
            if (size > 0) {
              this.items[index][this.mainComputedSize] -= decreSpace;
              space += decreSpace;
            } else {
              this.items[index][this.mainComputedSize] = 1;
              space += decreSpace + size;
            }
          }
        });
        break;
      }
      let flag = false;
      items.forEach((item, index) => {
        if (item.min) {
          const leaveSpace = this.items[index][this.mainComputedSize] - item.min;
          assertIsDefined(item.shrink);
          if (itemSpace * item.shrink > leaveSpace) {
            this.items[index][this.mainComputedSize] = item.min;
            space += leaveSpace;
            shrink -= item.shrink;
            delete item.min;
            delete item.shrink;
            flag = true;
          }
        }
      });
      if (!flag) {
        min = 0;
      }
    }
    this.parseByJustifyContentSpace(space);
  }

  parseMainAxis() {
    const mainSize = this.container[this.mainSize];
    // container size is not set
    if (!mainSize) {
      let pos = 0;
      this.items.forEach((item) => {
        item[this.mainPos] = pos;
        pos += item[this.mainLayoutSize];
      });
      return;
    }
    assertIsNumber(mainSize);
    let space = mainSize - this.mainAxisSize;
    if (space > 0) {
      if (this.hasFlexGrow()) {
        space = this.parseByFlexGrow(space);
      }
      if (this.hasMarginAutoInMainAxis()) {
        return this.parseByMarginAuto(space);
      }
      return this.parseByJustifyContentPositive(space);
    }
    return this.parseByJustifyContentNegative(space);
  }
}
