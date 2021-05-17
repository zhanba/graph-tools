/* eslint-disable max-classes-per-file */

export interface LayoutOptions {
  /**
   *  = "block"
   */
  childDisplay: ChildDisplayType;
  /**
   * = "block-like
   */
  sizing: LayoutSizingMode;
}

enum ChildDisplayType {
  'block', // default - "blockifies" the child boxes.
  'normal',
}

enum LayoutSizingMode {
  'block-like', // default - Sizing behaves like block containers.
  'manual', // Sizing is specified by the web developer.
}

export interface IntrinsicSizes {
  readonly minContentSize: number;
  readonly maxContentSize: number;
}

export interface LayoutFragment {
  readonly inlineSize: number;
  readonly blockSize: number;
  inlineOffset: number;
  blockOffset: number;
}

export interface LayoutEdges {
  readonly inlineStart: number;
  readonly inlineEnd: number;

  readonly blockStart: number;
  readonly blockEnd: number;

  // Convenience attributes for the sum in one direction.
  readonly inline: number;
  readonly block: number;
}

enum BlockFragmentationType {
  'none',
  'page',
  'column',
  'region',
}

export interface LayoutConstraints {
  readonly availableInlineSize: number;
  readonly availableBlockSize: number;

  readonly fixedInlineSize?: number;
  readonly fixedBlockSize?: number;

  readonly percentageInlineSize: number;
  readonly percentageBlockSize: number;

  readonly blockFragmentationOffset?: number;
  readonly blockFragmentationType: BlockFragmentationType;

  readonly data: any;
}

export interface FragmentResultOptions {
  inlineSize: number;
  blockSize: number;
  autoBlockSize: number;
  childFragments: LayoutFragment[];
  data: any;
}

export class FragmentResult {
  constructor(options: FragmentResultOptions = {}) {}
}
