import type { LayoutCtor } from './index';

export class LayoutRegistry {
  registry: Map<string, LayoutCtor> = new Map();

  get size() {
    return this.registry.size;
  }

  hasLayout(name: string) {
    return this.registry.has(name);
  }

  getLayout(name: string) {
    return this.registry.get(name);
  }

  updateLayout(name: string, layout: LayoutCtor) {
    this.registry.set(name, layout);
  }

  registerLayout(name: string, layout: LayoutCtor) {
    if (name === '') {
      throw new TypeError(`layout name cant't be empty`);
    }

    if (this.hasLayout(name)) {
      throw new Error(`layout ${name} already exist.`);
    }

    this.registry.set(name, layout);
  }

  deleteLayout(name: string) {
    this.registry.delete(name);
  }
}

export const layoutRegistry = new LayoutRegistry();
