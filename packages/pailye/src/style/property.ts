import type { StyleInputValue, StyleProperty } from './types';
import type { CSSStyleValue } from './styleValue';

export type PropertyParser = (value: StyleInputValue) => CSSStyleValue;

interface PropertyConfig {
  parser: PropertyParser;
}

export class PropertyRegistry {
  private registry: Map<StyleProperty, PropertyConfig> = new Map();

  registerProperty(property: StyleProperty, config: PropertyConfig) {
    this.registry.set(property, config);
  }

  unregisterProperty(property: StyleProperty) {
    this.registry.delete(property);
  }

  has(property: StyleProperty): boolean {
    return this.registry.has(property);
  }
}
