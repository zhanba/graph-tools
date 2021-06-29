import { inject, injectable } from 'inversify';
import type { LayoutObject } from '../node';
import { LayoutContext } from './layoutContext';
import type { ContextId, LayoutFragment } from './types';

/**
 * The web developer defined layout method can return either a FragmentResultOptions or a FragmentResult.
 */

export const FragmentResultOptions = Symbol('FragmentResultOptions');

// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface FragmentResultOptions<T = void> {
  inlineSize: number;
  blockSize: number;
  autoBlockSize: number;
  childFragments: LayoutFragment[];
  data: T;
}

@injectable()
export class FragmentResult<T = void> {
  private contextId: ContextId;

  readonly inlineSize: number;
  readonly blockSize: number;

  private node: LayoutObject;

  childFragments: LayoutFragment[];

  data: T;

  constructor(
    @inject(LayoutContext) protected readonly layoutContext: LayoutContext,
    @inject(FragmentResultOptions) protected readonly options: FragmentResultOptions<T>,
  ) {
    this.contextId = layoutContext.contextId;
    this.inlineSize = options?.inlineSize;
    this.blockSize = options?.blockSize;
    this.childFragments = options?.childFragments;
    this.data = options.data;
  }
}
