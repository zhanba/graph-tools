import { container } from '../inversify.config';
import { LayoutEngine } from '../layout/layoutEngine';
import type { LayoutFragment } from '../layout/LayoutFragment';
import type { IntrinsicSizes } from '../layout/types';
import { PropertyNameMap } from '../style/propertyName';
import { StylePropertyMap } from '../style/styleMap';
import type { CSSStyleValue, CSSUnitValue } from '../style/styleValue';
import type { StyleProperty } from '../style/types';
import type { MeasureFn } from './types';

const layoutEngine = container.get(LayoutEngine);

interface LayoutObjectIntrinsicSizes {
  minContentInlineSize: number;
  minContentBlockSize: number;
  maxContentInlineSize: number;
  maxContentBlockSize: number;
}

let id = 1;
export class LayoutObject {
  private id: number;

  private style: StylePropertyMap;

  private dirty: boolean;

  parent?: LayoutObject;

  children: LayoutObject[];

  private internalIntrisicSizes?: LayoutObjectIntrinsicSizes;

  private computedLayout?: LayoutFragment;

  get intrisicSizes() {
    return this.internalIntrisicSizes;
  }

  get childCount() {
    return this.children.length;
  }

  private measureFn?: MeasureFn;

  constructor(style?: StylePropertyMap) {
    // eslint-disable-next-line no-plusplus
    this.id = id++;
    this.style = style ?? new StylePropertyMap();
    this.parent = undefined;
    this.children = [];
    this.dirty = false;
  }

  /**
   * set the intrinsic size of leaf node, different basic shape has different size, compsed shape has
   * @param measure measure function
   */
  setMeasure(measure: MeasureFn) {
    this.measureFn = measure;
  }

  setIntrisicSizes(intrisicSizes: IntrinsicSizes) {
    this.internalIntrisicSizes = intrisicSizes;
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

  setStyle(property: StyleProperty, value: CSSStyleValue) {
    this.style.set(property, value);
  }

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

  getAllStyle() {
    return this.style;
  }

  markDirty() {
    this.dirty = true;
  }

  idDirty() {
    return this.dirty;
  }

  private getSize() {
    const width = this.style.get<CSSUnitValue>(PropertyNameMap.WIDTH).value;
    const height = this.style.get<CSSUnitValue>(PropertyNameMap.HEIGHT).value;
    return { width, height };
  }

  computeLayout(): void {
    const size = this.getSize();
    layoutEngine.computeLayout(this, {
      availableInlineSize: size.width,
      availableBlockSize: size.height,
      percentageInlineSize: size.width,
      percentageBlockSize: size.height,
      data: undefined,
    });
  }

  setComputedLayout(computedLayout: LayoutFragment) {
    this.computedLayout = computedLayout;
  }

  getComputedLayout() {
    return this.computedLayout;
  }

  getAllComputedLayout() {}
}
