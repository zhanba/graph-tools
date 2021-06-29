import { StylePropertyMap } from '../style/styleMap';
import type { StyleProperty } from '../style/types';
import type { ComputedLayout, MeasureFn } from './types';

let id = 1;
export class LayoutObject {
  private id: number;

  private style: StylePropertyMap;

  private dirty: boolean;

  parent?: LayoutObject;

  children: LayoutObject[];

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

  addChild(child: LayoutObject) {
    this.children?.push(child);
  }

  insertChild(index: number, child: LayoutObject) {
    this.children.splice(index, 0, child);
  }

  removeChild(child: LayoutObject) {
    const index = this.children?.findIndex((node) => node.id === child.id);
    this.removeChildAtIndex(index);
  }

  removeChildAtIndex(index: number) {
    this.children.splice(index, 1);
  }

  replaceChildAtIndex(index: number, child: LayoutObject) {
    this.children.splice(index, 1, child);
  }

  setStyle() {}

  getStyle(...properties: StyleProperty[]) {
    if (properties) {
      const returnStyle = new StylePropertyMap();
      properties.forEach((prop) => {
        returnStyle.set(prop, this.style.get(prop));
      });
      return returnStyle;
    }
    return this.style;
  }

  markDirty() {
    this.dirty = true;
  }

  idDirty() {
    return this.dirty;
  }

  computeLayout(size: { width?: number; height?: number }): ComputedLayout {}
}
