import type { LayoutObject } from '../node';
import type { CSSKeywordValue } from '../style/styleValue';
import { LayoutContribution, LayoutRegistry } from './layoutRegistry';
import type { LayoutConstraints } from './types';
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

  constructor(
    @inject(LayoutRegistry)
    protected readonly _layoutRegistry: LayoutRegistry,
    @inject(LayoutContextFactory)
    protected readonly _layoutContextFactory: LayoutContextFactory,
    @inject(LayoutChildrenFactory)
    protected readonly _layoutChildrenFactory: LayoutChildrenFactory,
    @inject(LayoutEdgesFactory)
    protected readonly _layoutEdgesFactory: LayoutEdgesFactory,
    @inject(ContributionProvider)
    @named(LayoutContribution)
    protected readonly layoutContributions: ContributionProvider<LayoutContribution>,
  ) {
    this.layoutRegistry = _layoutRegistry;
    this.layoutContextFactory = _layoutContextFactory;
    this.layoutChildrenFactory = _layoutChildrenFactory;
    this.layoutEdgesFactory = _layoutEdgesFactory;
    layoutContributions.getContributions().forEach((layoutContrib) => {
      layoutContrib.registerLayout(_layoutRegistry);
    });
  }

  // This function takes the root of the box-tree, a LayoutConstraints object, and a
  // BreakToken to (if paginating for printing for example) and generates a
  // LayoutFragment.
  layoutEntry(rootNode: LayoutObject, rootPageConstraints: LayoutConstraints) {
    return this.layoutFragment({
      layoutChild: rootNode,
      layoutConstraints: rootPageConstraints,
    });
  }

  computeLayout() {
    //
  }

  getCurrentLayoutObject() {
    return this.currentLayoutObject;
  }

  getCurrentLayoutContext() {
    return this.currentLayoutContext;
  }

  protected determineIntrinsicSizes(node: LayoutObject, childNodes: LayoutObject[]) {
    const name = node.getStyle().get<CSSKeywordValue>('layout').value;
    this.invokeIntrinsicSizesCallback(name, node, childNodes);
  }

  protected createLayoutChild() {}

  protected invokeIntrinsicSizesCallback(
    name: string,
    node: LayoutObject,
    childNodes: LayoutObject[],
  ) {
    const LayoutDef = this.layoutRegistry.getLayout(name);
    const layoutInstance = new LayoutDef();
    this.currentLayoutContext = this.layoutContextFactory({ mode: LayoutTaskType.IntrinsicSizes });
    const { inputProperties } = LayoutDef;
    const children: LayoutChildren[] = [];

    if (this.currentLayoutContext === undefined) {
      throw new Error('currentLayoutContext not defined when invokeIntrinsicSizesCallback');
    }

    childNodes.forEach((childNode) => {
      const layoutChild = this.layoutChildrenFactory({
        name,
        node: childNode,
        contextId: this.currentLayoutContext!.contextId,
      });
      children.push(layoutChild);
    });

    const edges = this.layoutEdgesFactory({ node });

    const styleMap = node.getStyle(...inputProperties);

    // TODO compare to cache

    const value = layoutInstance.intrinsicSizes(children, edges, styleMap);

    this.runWorkQueue(value, this.currentLayoutContext.workQueue);
  }

  protected generateFragment(
    node: LayoutObject,
    childNodes: LayoutObject[],
    layoutConstraints: LayoutConstraints,
  ) {
    const name = node.getStyle().get<CSSKeywordValue>('layout').value;
    this.invokeLayoutCallback(name, node, childNodes, layoutConstraints);
  }

  protected invokeLayoutCallback(
    name: string,
    node: LayoutObject,
    childNodes: LayoutObject[],
    layoutConstraints: LayoutConstraints,
  ) {
    const LayoutDef = this.layoutRegistry.getLayout(name);
    const layoutInstance = new LayoutDef();
    this.currentLayoutContext = this.layoutContextFactory({ mode: LayoutTaskType.Layout });
    const { inputProperties } = LayoutDef;
    const children: LayoutChildren[] = [];

    if (this.currentLayoutContext === undefined) {
      throw new Error('currentLayoutContext not defined when invokeLayoutCallback');
    }

    childNodes.forEach((childNode) => {
      const layoutChild = this.layoutChildrenFactory({
        name,
        node: childNode,
        contextId: this.currentLayoutContext!.contextId,
      });
      children.push(layoutChild);
    });

    const edges = this.layoutEdgesFactory({ node });

    const styleMap = node.getStyle(...inputProperties);

    // TODO compare cahche, children styleMap layoutConstraints

    const value = layoutInstance.layout(children, edges, layoutConstraints, styleMap);
  }

  protected runWorkQueue<T>(promise: Promise<T>, workQueue: LayoutWorkTask[]): T {
    if (workQueue.length > 0 && makeQuerablePromise(promise).isPending) {
      workQueue.forEach((workTask) => {
        if (workTask.taskType === LayoutTaskType.IntrinsicSizes) {
          const { layoutChild } = workTask;
          const { node } = layoutChild;
        }
      });
    }
  }

  // protected selectLayoutAlgorithmForNode(node: LayoutObject): LayoutDefinitionCtor {
  //   const layoutProp = node.getStyle().get<CSSKeywordValue>('layout');
  //   return this.layoutRegistry.getLayout(layoutProp.value);
  // }

  // // This function takes a LayoutFragmentRequest and calls the appropriate
  // // layout algorithm to generate the a LayoutFragment.
  // protected layoutFragment(fragmentRequest: LayoutFragmentRequest) {
  //   const node = fragmentRequest.layoutChild;
  //   const LayoutDef = this.selectLayoutAlgorithmForNode(node);
  //   const layout = new LayoutDef();
  //   const fragmentRequestGenerator = layout.layout(
  //     node.children,
  //     edges,
  //     fragmentRequest.layoutConstraints,
  //     node.getStyle(),
  //   );

  //   let nextFragmentRequest = fragmentRequestGenerator.next();

  //   while (!nextFragmentRequest.done) {
  //     // A user-agent may decide to perform layout to generate the fragments in
  //     // parallel on separate threads. This example performs them synchronously
  //     // in order.
  //     const fragments = nextFragmentRequest.value.map(layoutFragment);

  //     // A user-agent may decide to yield for other work (garbage collection for
  //     // example) before resuming this layout work. This example just performs
  //     // layout synchronously without any ability to yield.
  //     nextFragmentRequest = fragmentRequestGenerator.next(fragments);
  //   }

  //   return nextFragmentRequest.value; // Return the final LayoutFragment.
  // }
}
