/* eslint-disable @typescript-eslint/no-redeclare */
import { inject, injectable } from 'inversify';
import type { LayoutObject } from '../node';
import type { StylePropertyMap } from '../style/styleMap';
import { Deferred } from '../util';
import type { LayoutContext } from './layoutContext';
import type { LayoutFragment } from './LayoutFragment';
import type { ContextId, IntrinsicSizes, LayoutConstraints } from './types';
import { LayoutTaskType } from './types';

export const LayoutChildrenFactory = Symbol('LayoutChildrenFactory');
export interface LayoutChildrenFactory {
  (options: LayoutChildrenOptions): LayoutChildren;
}

export const LayoutChildrenOptions = Symbol('LayoutChildrenOptions');
export interface LayoutChildrenOptions {
  node: LayoutObject;
  context: LayoutContext;
}

@injectable()
export class LayoutChildren {
  contextId: ContextId;
  node: LayoutObject;
  readonly styleMap: StylePropertyMap;

  layoutContext: LayoutContext;

  constructor(@inject(LayoutChildrenOptions) protected readonly options: LayoutChildrenOptions) {
    this.contextId = options.context.contextId;
    this.node = options.node;
    this.styleMap = options.node.getStyle();
    this.layoutContext = options.context;
  }

  intrinsicSizes(): Promise<IntrinsicSizes> {
    if (this.contextId !== this.layoutContext.contextId) {
      throw new Error('Invalid State: wrong layout context');
    }
    const deferred = new Deferred<IntrinsicSizes>();
    this.layoutContext.appendWorkTask({
      layoutChild: this,
      taskType: LayoutTaskType.IntrinsicSizes,
      deferred,
    });
    return deferred.promise;
  }

  layoutNextFragment(constraints: LayoutConstraints): Promise<LayoutFragment> {
    if (this.contextId !== this.layoutContext.contextId) {
      throw new Error('Invalid State: wrong layout context');
    }

    if (this.layoutContext.mode === LayoutTaskType.IntrinsicSizes) {
      throw new Error('Not Supported: cant call layoutNextFragment in intrinsicSizes');
    }
    const deferred = new Deferred<LayoutFragment>();
    this.layoutContext.appendWorkTask({
      layoutConstraints: constraints,
      layoutChild: this,
      taskType: LayoutTaskType.Layout,
      deferred,
    });
    return deferred.promise;
  }
}
