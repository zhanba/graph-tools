/* eslint-disable @typescript-eslint/no-redeclare */
import { injectable } from 'inversify';
import type { LayoutObject } from '../node';
import type { CSSUnitValue } from '../style/styleValue';

export const LayoutEdgesFactory = Symbol('LayoutEdgesFactory');
export interface LayoutEdgesFactory {
  (options: LayoutEdgesOptions): LayoutEdges;
}

export const LayoutEdgesOptions = Symbol('LayoutEdgesOptions');
export interface LayoutEdgesOptions {
  node: LayoutObject;
}

const SCROLLBAR_SIZES = [0, 0, 0, 0];

/**
 * https://drafts.css-houdini.org/css-layout-api/#layoutedges
 * the size of border, scrollbar, padding
 */
@injectable()
export class LayoutEdges {
  readonly inlineStart: number;
  readonly inlineEnd: number;

  readonly blockStart: number;
  readonly blockEnd: number;

  // Convenience attributes for the sum in one direction.
  readonly inline: number;
  readonly block: number;

  constructor(options: LayoutEdgesOptions) {
    const { node } = options;
    const styleMap = node.getStyle();

    const borderTopWidth = styleMap.get<CSSUnitValue>('borderTopWidth');
    const borderRightWidth = styleMap.get<CSSUnitValue>('borderRightWidth');
    const borderBottomWidth = styleMap.get<CSSUnitValue>('borderBottomWidth');
    const borderLeftWidth = styleMap.get<CSSUnitValue>('borderLeftWidth');

    const paddingTopWidth = styleMap.get<CSSUnitValue>('paddingTopWidth');
    const paddingRightWidth = styleMap.get<CSSUnitValue>('paddingRightWidth');
    const paddingBottomWidth = styleMap.get<CSSUnitValue>('paddingBottomWidth');
    const paddingLeftWidth = styleMap.get<CSSUnitValue>('paddingLeftWidth');

    this.blockStart = borderTopWidth.value + SCROLLBAR_SIZES[0] + paddingTopWidth.value;
    this.inlineStart = borderRightWidth.value + SCROLLBAR_SIZES[1] + paddingRightWidth.value;
    this.blockEnd = borderBottomWidth.value + SCROLLBAR_SIZES[2] + paddingBottomWidth.value;
    this.inlineEnd = borderLeftWidth.value + SCROLLBAR_SIZES[3] + paddingLeftWidth.value;

    this.block = this.blockStart + this.blockEnd;
    this.inline = this.inlineStart + this.inlineEnd;
  }
}
