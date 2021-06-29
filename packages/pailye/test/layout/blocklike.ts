import type { LayoutChildren } from '../../src/layout/LayoutChildren';
import { AbstractLayoutDefinition } from '../../src/layout/LayoutDefinition';
import type { LayoutEdges, LayoutConstraints, IntrinsicSizes } from '../../src/layout/types';
import type { StylePropertyMap } from '../../src/style/styleMap';

export class BlockLikeLayout extends AbstractLayoutDefinition {
  async intrinsicSizes(
    children: LayoutChildren[],
    edges: LayoutEdges,
    styleMap: StylePropertyMap,
  ): Promise<IntrinsicSizes> {
    const childrenSizes = await Promise.all(
      children.map((child) => {
        return child.intrinsicSizes();
      }),
    );

    const maxContentSize =
      childrenSizes.reduce((max, childSizes) => {
        return Math.max(max, childSizes.maxContentSize);
      }, 0) + edges.inline;

    const minContentSize =
      childrenSizes.reduce((max, childSizes) => {
        return Math.max(max, childSizes.minContentSize);
      }, 0) + edges.inline;

    return { maxContentSize, minContentSize };
  }
  async layout(
    children: LayoutChildren[],
    edges: LayoutEdges,
    constraints: LayoutConstraints,
    styleMap: StylePropertyMap,
  ): Promise<void> {
    // Determine our (inner) available size.
    const availableInlineSize = constraints.fixedInlineSize
      ? constraints.fixedInlineSize - edges.inline
      : null;
    const availableBlockSize = constraints.fixedBlockSize
      ? constraints.fixedBlockSize - edges.block
      : null;

    let childFragments = [];
    const childConstraints = { availableInlineSize, availableBlockSize };

    childFragments = await Promise.all(
      children.map((child) => {
        return child.layoutNextFragment(childConstraints);
      }),
    );

    let blockOffset = edges.blockStart;
    // eslint-disable-next-line no-restricted-syntax
    for (const fragment of childFragments) {
      // Position the fragment in a block like manner, centering it in the
      // inline direction.
      fragment.blockOffset = blockOffset;
      fragment.inlineOffset = Math.max(
        edges.inlineStart,
        (availableInlineSize - fragment.inlineSize) / 2,
      );

      blockOffset += fragment.blockSize;
    }

    const autoBlockSize = blockOffset + edges.blockEnd;

    return {
      autoBlockSize,
      childFragments,
    };
  }
}
