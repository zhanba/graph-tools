import { LayoutObject } from '../../src';
import { CSSKeywordValue, TypedCSS } from '../../src/style/styleValue';

describe('BlockLikeLayout', () => {
  it('basic', () => {
    const parent = new LayoutObject();
    parent.setStyle('width', TypedCSS.px(200));
    parent.setStyle('height', TypedCSS.px(100));
    parent.setStyle('layout', new CSSKeywordValue('block-like'));

    const child = new LayoutObject();
    child.setStyle('width', TypedCSS.px(100));
    child.setStyle('height', TypedCSS.px(50));

    parent.addChild(child);

    parent.computeLayout();

    const layout = child.getComputedLayout();
    expect(layout?.inlineOffset).toEqual(0);
  });
});
