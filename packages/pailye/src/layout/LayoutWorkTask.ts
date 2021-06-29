import type { Deferred } from '../util';
import type { LayoutChildren } from './LayoutChildren';
import type { LayoutConstraints, LayoutTaskType } from './types';

export interface LayoutWorkTask<T = void> {
  layoutConstraints?: LayoutConstraints;
  layoutChild: LayoutChildren;
  taskType: LayoutTaskType;
  promise: Deferred<T>;
}
