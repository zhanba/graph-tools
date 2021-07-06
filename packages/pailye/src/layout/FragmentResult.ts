/* eslint-disable @typescript-eslint/no-redeclare */
import { inject, injectable } from 'inversify';
import { LayoutObject } from '../node';
import { LayoutContext } from './layoutContext';
import { CurrentLayoutContext, CurrentLayoutObject } from './layoutEngine';
import type { LayoutFragment } from './LayoutFragment';
import type { ContextId } from './types';

export const FragmentResultFactory = Symbol('FragmentResultFactory');
export interface FragmentResultFactory {
  (options: FragmentResultOptions): FragmentResult;
}

/**
 * The web developer defined layout method can return either a FragmentResultOptions or a FragmentResult.
 */

export const FragmentResultOptions = Symbol('FragmentResultOptions');
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
    @inject(CurrentLayoutContext) protected readonly layoutContext: LayoutContext,
    @inject(FragmentResultOptions) protected readonly options: FragmentResultOptions<T>,
    @inject(CurrentLayoutObject) protected readonly _currentLayoutObject: LayoutObject,
  ) {
    this.contextId = layoutContext.contextId;
    this.inlineSize = options?.inlineSize;
    this.blockSize = options?.blockSize;
    this.childFragments = options?.childFragments;
    this.data = options.data;
    this.node = _currentLayoutObject;
  }
}
