registerLayout(
  'random',
  class {
    // currently: all children are blockified
    async intrinsicSizes() {}
    async layout(children, edges, constraintSpace, styles) {
      const childFragments = [];
      console.log(constraintSpace);
      for (const child of children) {
        const childFragment = await child.layoutNextFragment();
        console.log(childFragment);
        childFragment.inlineOffset = Math.random() * constraintSpace.fixedInlineSize;
        childFragment.blockOffset = Math.random() * constraintSpace.fixedBlockSize;
        childFragments.push(childFragment);
      }

      return {
        childFragments,
      };
    }
  },
);
