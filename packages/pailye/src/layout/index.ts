import { ContainerModule } from 'inversify';

import { bindContributionProvider } from '../contribution-provider';
import { AbsoluteLayout } from './algo/absoluteLayout';
import { BlockLikeLayout } from './algo/blocklikeLayout';
import { RelativeLayout } from './algo/realtiveLayout';
import { FragmentResult, FragmentResultFactory, FragmentResultOptions } from './FragmentResult';
import { LayoutChildren, LayoutChildrenFactory, LayoutChildrenOptions } from './LayoutChildren';
import { LayoutContext, LayoutContextFactory, LayoutContextOptions } from './layoutContext';
import { LayoutEdges, LayoutEdgesFactory, LayoutEdgesOptions } from './LayoutEdges';
import { CurrentLayoutContext, CurrentLayoutObject, LayoutEngine } from './layoutEngine';
import { LayoutFragment, LayoutFragmentFactory, LayoutFragmentOptions } from './LayoutFragment';
import { LayoutContribution, LayoutRegistry } from './layoutRegistry';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const layoutModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(LayoutEngine).toSelf().inSingletonScope();
  bind(CurrentLayoutObject).toDynamicValue((context) => {
    return context.container.get(LayoutEngine).getCurrentLayoutObject();
  });
  bind(CurrentLayoutContext).toDynamicValue((context) => {
    return context.container.get(LayoutEngine).getCurrentLayoutContext();
  });

  bind(LayoutChildren).toSelf();
  bind(LayoutChildrenFactory).toFactory((context) => (options: LayoutChildrenOptions) => {
    const childContainer = context.container.createChild();
    childContainer.bind(LayoutChildrenOptions).toConstantValue(options);
    return childContainer.get(LayoutChildren);
  });

  bind(LayoutEdges).toSelf();
  bind(LayoutEdgesFactory).toFactory((context) => (options: LayoutEdgesOptions) => {
    const container = context.container.createChild();
    container.bind(LayoutEdgesOptions).toConstantValue(options);
    return container.get(LayoutEdges);
  });

  bind(LayoutContext).toSelf();
  bind<LayoutContextFactory>(LayoutContextFactory).toFactory((context) => (options) => {
    const container = context.container.createChild();
    container.bind(LayoutContextOptions).toConstantValue(options);
    return container.get(LayoutContext);
  });

  bind(FragmentResult).toSelf();
  bind(FragmentResultFactory).toFactory((context) => (options) => {
    const container = context.container.createChild();
    container.bind(FragmentResultOptions).toConstantValue(options);
    return container.get(FragmentResult);
  });

  bind(LayoutFragment).toSelf();
  bind(LayoutFragmentFactory).toFactory((context) => (options) => {
    const container = context.container.createChild();
    container.bind(LayoutFragmentOptions).toConstantValue(options);
    return container.get(LayoutFragment);
  });

  bind(LayoutRegistry).toSelf().inSingletonScope();
  bindContributionProvider(bind, LayoutContribution);

  bind(AbsoluteLayout).toSelf().inSingletonScope();
  bind(LayoutContribution).toService(AbsoluteLayout);

  bind(RelativeLayout).toSelf().inSingletonScope();
  bind(LayoutContribution).toService(RelativeLayout);

  bind(BlockLikeLayout).toSelf().inSingletonScope();
  bind(LayoutContribution).toService(BlockLikeLayout);
});
