import 'reflect-metadata';
import type { LayoutObject } from '../node';
import type { CSSKeywordValue, CSSUnitValue } from '../style/styleValue';
import { LayoutContribution, LayoutRegistry } from './layoutRegistry';
import type { IntrinsicSizes, LayoutConstraints } from './types';
import { LayoutTaskType } from './types';
import { inject, injectable, named } from 'inversify';
import { ContributionProvider } from '../contribution-provider';
import type { LayoutContext } from './layoutContext';
import { LayoutContextFactory } from './layoutContext';
import type { LayoutChildren } from './LayoutChildren';
import { LayoutChildrenFactory } from './LayoutChildren';
import { LayoutEdgesFactory } from './LayoutEdges';
import type { LayoutWorkTask } from './LayoutWorkTask';
import { makeQuerablePromise } from '../util';
import { PropertyNameMap } from '../style/propertyName';
import { FragmentResult, FragmentResultFactory } from './FragmentResult';
import type { LayoutFragment, LayoutFragmentOptions } from './LayoutFragment';
import { LayoutFragmentFactory } from './LayoutFragment';

export const CurrentLayoutObject = Symbol('CurrentLayoutObject');
export const CurrentLayoutContext = Symbol('CurrentLayoutContext');

@injectable()
export class LayoutEngine {
  private currentLayoutObject?: LayoutObject;
  private currentLayoutContext?: LayoutContext;

  protected layoutRegistry: LayoutRegistry;
  protected layoutContextFactory: LayoutContextFactory;
  protected layoutChildrenFactory: LayoutChildrenFactory;
  protected layoutEdgesFactory: LayoutEdgesFactory;
  protected fragmentResultFactory: FragmentResultFactory;
  protected layoutFragmentFactory: LayoutFragmentFactory;

  constructor(
    @inject(LayoutRegistry)
    protected readonly _layoutRegistry: LayoutRegistry,
    @inject(LayoutContextFactory)
    protected readonly _layoutContextFactory: LayoutContextFactory,
    @inject(LayoutChildrenFactory)
    protected readonly _layoutChildrenFactory: LayoutChildrenFactory,
    @inject(LayoutEdgesFactory)
    protected readonly _layoutEdgesFactory: LayoutEdgesFactory,
    @inject(FragmentResultFactory)
    protected readonly _fragmentResultFactory: FragmentResultFactory,
    @inject(LayoutFragmentFactory)
    protected readonly _layoutFragmentFactory: LayoutFragmentFactory,
    @inject(ContributionProvider)
    @named(LayoutContribution)
    protected readonly layoutContributions: ContributionProvider<LayoutContribution>,
  ) {
    this.layoutRegistry = _layoutRegistry;
    this.layoutContextFactory = _layoutContextFactory;
    this.layoutChildrenFactory = _layoutChildrenFactory;
    this.layoutEdgesFactory = _layoutEdgesFactory;
    this.fragmentResultFactory = _fragmentResultFactory;
    this.layoutFragmentFactory = _layoutFragmentFactory;
    layoutContributions.getContributions().forEach((layoutContrib) => {
      layoutContrib.registerLayout(_layoutRegistry);
    });
  }

  getCurrentLayoutObject() {
    return this.currentLayoutObject;
  }

  getCurrentLayoutContext() {
    return this.currentLayoutContext;
  }

  /**
   * This function takes the root of the box-tree, a LayoutConstraints object, and compute the position of every node in the tree
   * @param rootNode root node of the layout object tree
   * @param rootPageConstraints layout constraints
   * @returns
   */
  computeLayout(rootNode: LayoutObject, rootPageConstraints: LayoutConstraints): void {
    this.determineIntrinsicSizes(rootNode, rootNode.children);
    this.calculateLayout(rootNode, rootNode.children, rootPageConstraints);
  }

  protected getLayoutDefinitionName(node: LayoutObject) {
    return node.getStyle().get<CSSKeywordValue>(PropertyNameMap.LAYOUT).value;
  }

  /**
   * calculate the min/max content size of node
   * @param node current layout object
   * @param childNodes children of the current node
   */
  protected determineIntrinsicSizes(node: LayoutObject, childNodes: LayoutObject[]) {
    const layoutName = this.getLayoutDefinitionName(node);
    this.invokeIntrinsicSizesCallback(layoutName, node, childNodes);
  }

  protected invokeIntrinsicSizesCallback(
    layoutName: string,
    node: LayoutObject,
    childNodes: LayoutObject[],
  ) {
    const LayoutDef = this.layoutRegistry.getLayout(layoutName);
    const layoutInstance = new LayoutDef();
    const context = this.layoutContextFactory({ mode: LayoutTaskType.IntrinsicSizes });
    this.currentLayoutContext = context;
    const { inputProperties } = LayoutDef;
    const children: LayoutChildren[] = [];

    if (this.currentLayoutContext === undefined) {
      throw new Error('currentLayoutContext not defined when invokeIntrinsicSizesCallback');
    }

    childNodes.forEach((childNode) => {
      const layoutChild = this.layoutChildrenFactory({
        node: childNode,
        context,
      });
      children.push(layoutChild);
    });

    const edges = this.layoutEdgesFactory({ node });

    const styleMap = node.getStyle(...inputProperties);

    // TODO compare to cache ( children edges styleMap )

    const value = layoutInstance.intrinsicSizes(children, edges, styleMap);

    const intrinsicSizesValue = this.runWorkQueue(value, this.currentLayoutContext.workQueue);
    node.setIntrisicSizes(intrinsicSizesValue);
  }

  protected calculateLayout(
    node: LayoutObject,
    childNodes: LayoutObject[],
    layoutConstraints: LayoutConstraints,
  ) {
    const layoutName = this.getLayoutDefinitionName(node);
    this.invokeLayoutCallback(layoutName, node, childNodes, layoutConstraints);
  }

  protected invokeLayoutCallback(
    layoutName: string,
    node: LayoutObject,
    childNodes: LayoutObject[],
    layoutConstraints: LayoutConstraints,
  ) {
    const LayoutDef = this.layoutRegistry.getLayout(layoutName);
    const layoutInstance = new LayoutDef();
    const context = this.layoutContextFactory({ mode: LayoutTaskType.Layout });
    this.currentLayoutContext = context;
    const { inputProperties } = LayoutDef;
    const children: LayoutChildren[] = [];

    if (this.currentLayoutContext === undefined) {
      throw new Error('currentLayoutContext not defined when invokeLayoutCallback');
    }

    childNodes.forEach((childNode) => {
      const layoutChild = this.layoutChildrenFactory({
        node: childNode,
        context,
      });
      children.push(layoutChild);
    });

    const edges = this.layoutEdgesFactory({ node });

    const styleMap = node.getStyle(...inputProperties);

    // TODO compare to cahche ( children styleMap layoutConstraints )

    const value = layoutInstance.layout(children, edges, layoutConstraints, styleMap);
    const fragmentResultvalue = this.runWorkQueue(value, this.currentLayoutContext.workQueue);
    const fragmentResult =
      fragmentResultvalue instanceof FragmentResult
        ? fragmentResultvalue
        : this.fragmentResultFactory(fragmentResultvalue);

    const layoutFragment = this.layoutFragmentFactory({
      inlineSize: fragmentResult.inlineSize,
      blockSize: fragmentResult.blockSize,
      data: fragmentResult.data,
    });

    node.setComputedLayout(layoutFragment);
  }

  protected runWorkQueue<T>(promise: Promise<T>, workQueue: LayoutWorkTask[]): T {
    const querablePromise = makeQuerablePromise(promise);
    if (workQueue.length > 0 && querablePromise.isPending()) {
      workQueue.forEach((workTask) => {
        if (workTask.taskType === LayoutTaskType.IntrinsicSizes) {
          const { layoutChild, deferred } = workTask;
          const { node } = layoutChild;
          deferred.resolve(this.getNodeIntrisicSizes(node));
        }

        if (workTask.taskType === LayoutTaskType.Layout) {
          const { layoutChild, deferred, layoutConstraints } = workTask;
          const { node } = layoutChild;
          const fragment = this.getNodeFragment(node, layoutConstraints);
          deferred.resolve(this.layoutFragmentFactory(fragment));
        }
      });
      this.currentLayoutContext?.clearWorkQueue();
    }

    if (!querablePromise.isFulfilled()) {
      throw new Error('promise not fullfilled!');
    }
    return querablePromise.getFullFilledValue();
  }

  protected getNodeIntrisicSizes(node: LayoutObject): IntrinsicSizes {
    // TODO
    // calculate from border box, depend on writing mode of current layout
    const minWidth = node.getStyle().get<CSSUnitValue>(PropertyNameMap.MIN_WIDTH).value;
    const maxWidth = node.getStyle().get<CSSUnitValue>(PropertyNameMap.MAX_WIDTH).value;
    const minHeight = node.getStyle().get<CSSUnitValue>(PropertyNameMap.MIN_HEIGHT).value;
    const maxHeight = node.getStyle().get<CSSUnitValue>(PropertyNameMap.MAX_HEIGHT).value;
    return {
      minContentInlineSize: minWidth,
      maxContentInlineSize: maxWidth,
      minContentBlockSize: minHeight,
      maxContentBlockSize: maxHeight,
    };
  }

  protected getNodeFragment(
    node: LayoutObject,
    constraints: LayoutConstraints,
  ): LayoutFragmentOptions {
    // TODO
    const width = node.getStyle().get<CSSUnitValue>(PropertyNameMap.WIDTH).value;
    const height = node.getStyle().get<CSSUnitValue>(PropertyNameMap.HEIGHT).value;
    return {
      inlineSize: width,
      blockSize: height,
      data: constraints.data,
    };
  }
}
