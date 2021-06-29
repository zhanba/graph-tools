/* eslint-disable @typescript-eslint/no-redeclare */
import { guid } from '../guid';
import type { LayoutWorkTask } from './LayoutWorkTask';
import type { LayoutTaskType } from './types';
import type { ContextId } from './types';
import { inject, injectable } from 'inversify';

export const LayoutContextFactory = Symbol('LayoutContextFactory');
export interface LayoutContextFactory {
  (options: LayoutContextOptions): LayoutContext;
}

export const LayoutContextOptions = Symbol('LayoutContextOptions');
export interface LayoutContextOptions {
  mode: LayoutTaskType;
}

/**
 * 每次layout 有单独的 context
 */
@injectable()
export class LayoutContext<T = void> {
  contextId: ContextId;
  workQueue: LayoutWorkTask<T>[] = [];
  mode: LayoutTaskType;
  constructor(@inject(LayoutContextOptions) protected readonly options: LayoutContextOptions) {
    this.contextId = guid();
    this.mode = options.mode;
  }

  appendWorkTask(work: LayoutWorkTask<T>) {
    this.workQueue.push(work);
  }
}
