export type ContextId = string;

export const enum LayoutTaskType {
  Layout = 'layout',
  IntrinsicSizes = 'intrinsic-sizes',
}

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
  readonly minContentInlineSize: number;
  readonly minContentBlockSize: number;
  readonly maxContentInlineSize: number;
  readonly maxContentBlockSize: number;
}

enum BlockFragmentationType {
  'none',
  'page',
  'column',
  'region',
}

export interface LayoutConstraints<T = void> {
  readonly availableInlineSize: number;
  readonly availableBlockSize: number;

  readonly fixedInlineSize?: number;
  readonly fixedBlockSize?: number;

  readonly percentageInlineSize: number;
  readonly percentageBlockSize: number;

  readonly blockFragmentationOffset?: number;
  readonly blockFragmentationType: BlockFragmentationType;

  readonly data: T;
}
