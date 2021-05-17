import { assertIsDefined } from '../assert';
import { layoutRegistry } from '../layout/layoutRegistry';
import type { StylePropertyMap } from '../style/styleMap';
import type { CSSKeywordValue } from '../style/styleValue';
import type { ComputedLayout, MeasureFn } from './types';

let id = 1;
export class Node {
  private id: number;

  private style: StylePropertyMap;

  private dirty: boolean;

  parent?: Node;

  children: Node[];

  get childCount() {
    return this.children.length;
  }

  private measureFn?: MeasureFn;

  constructor(style: StylePropertyMap) {
    // eslint-disable-next-line no-plusplus
    this.id = id++;
    this.style = style;
    this.parent = undefined;
    this.children = [];
    this.dirty = false;
  }

  setMeasure(measure: MeasureFn) {
    this.measureFn = measure;
  }

  addChild(child: Node) {
    this.children?.push(child);
  }

  insertChild(index: number, child: Node) {
    this.children.splice(index, 0, child);
  }

  removeChild(child: Node) {
    const index = this.children?.findIndex((node) => node.id === child.id);
    this.removeChildAtIndex(index);
  }

  removeChildAtIndex(index: number) {
    this.children.splice(index, 1);
  }

  replaceChildAtIndex(index: number, child: Node) {
    this.children.splice(index, 1, child);
  }

  setStyle() {}

  getStyle() {
    return this.style;
  }

  markDirty() {
    this.dirty = true;
  }

  idDirty() {
    return this.dirty;
  }

  computeLayout(size: { width?: number; height?: number }): ComputedLayout {
    const layoutName = this.style.get<CSSKeywordValue>('position').value;
    const LayoutCtor = layoutRegistry.getLayout(layoutName);
    assertIsDefined(LayoutCtor);
    const layout = new LayoutCtor();

    layout.layout();
    return {};
  }
}
