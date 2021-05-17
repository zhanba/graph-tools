/**
 * a general css typed object model in user land, extend and modified for Pailye.
 * ref: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API ,
 */

import type { StyleProperty } from './types';
import type { CSSStyleValue } from './styleValue';

export class StylePropertyMap {
  private styleMap: Map<StyleProperty, CSSStyleValue>;

  constructor() {
    this.styleMap = new Map();
  }

  get<T extends CSSStyleValue>(property: StyleProperty) {
    return this.styleMap.get(property) as T;
  }

  set(property: StyleProperty, value: CSSStyleValue) {
    this.styleMap.set(property, value);
  }

  append(property: StyleProperty, value: CSSStyleValue) {
    this.styleMap.set(property, value);
  }

  delete(property: StyleProperty) {
    this.styleMap.delete(property);
  }

  clear() {
    this.styleMap.clear();
  }
}
