import { ContainerModule } from 'inversify';
import { LayoutRegistry } from '../../dist/src/layout/layoutRegistry';
import { bindContributionProvider } from '../contribution-provider';
import { FragmentResult } from './FragmentResult';
import { LayoutChildren, LayoutChildrenFactory, LayoutChildrenOptions } from './LayoutChildren';
import { LayoutContext, LayoutContextFactory, LayoutContextOptions } from './layoutContext';
import { LayoutEdges, LayoutEdgesFactory, LayoutEdgesOptions } from './LayoutEdges';
import { CurrentLayoutContext, CurrentLayoutObject, LayoutEngine } from './layoutEngine';
import { LayoutContribution } from './layoutRegistry';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const layoutModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(LayoutEngine).toSelf().inSingletonScope();
  bind(CurrentLayoutObject).toDynamicValue((context) => {
    return context.container.get(LayoutEngine).getCurrentLayoutObject();
  });
  bind(CurrentLayoutContext).toDynamicValue((context) => {
    return context.container.get(LayoutEngine).getCurrentLayoutContext();
  });

  bind(LayoutRegistry).toSelf().inSingletonScope();
  bindContributionProvider(bind, LayoutContribution);

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

  bind<LayoutContextFactory>(LayoutContextFactory).toFactory((context) => (options) => {
    const container = context.container.createChild();
    container.bind(LayoutContext).toSelf().inSingletonScope();
    container.bind(LayoutContextOptions).toConstantValue(options);

    container.bind(FragmentResult).toSelf();
    // container.bind(LayoutWorkTask).toSelf();
    return container.get(LayoutContext);
  });
});
