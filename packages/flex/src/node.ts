/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import Config from './config';
import Compose from './compose';
import { flexProperties } from './util';
import type { FlexDirectionProperty, Layout, NodeProperties, NodePropertyKey } from './types';
import { ParsedNodeProperties } from './property';

let id = 1;
export class Node extends ParsedNodeProperties {
  config: Config;

  parent?: Node;

  children: Node[];

  id: number;

  layoutHeight!: number;
  layoutWidth!: number;

  computedHeight?: number;
  computedWidth?: number;

  constructor(config: NodeProperties) {
    super();
    this.config = new Config(config, this);
    this.parent = undefined;
    this.children = [];
    // eslint-disable-next-line no-plusplus
    this.id = id++;
  }

  appendChild(node: Node) {
    if (!(node instanceof Node)) {
      throw new Error('appended Child must be instance of Node');
    }
    node.parent = this;
    this.children.push(node);
    return this;
  }

  calculateLayout(width?: number, height?: number, direction?: FlexDirectionProperty) {
    if (width) this.width = width;
    if (height) this.height = height;
    if (direction) this.flexDirection = direction;
    const instance = new Compose(this);
    instance.compose();
  }

  getComputedLayout(props: NodePropertyKey[] = []): Layout {
    let width = this.computedWidth;
    if (width === undefined) {
      width = this.width as number;
    }
    let height = this.computedHeight;
    if (height === undefined) {
      height = this.height as number;
    }
    const layout: Layout = { left: this.left || 0, top: this.top || 0, width, height };
    props.forEach((item) => {
      // @ts-ignore
      layout[item] = this.config[item];
    });
    return layout;
  }

  getAllComputedLayout(props?: NodePropertyKey[]) {
    const layout = this.getComputedLayout();
    layout.children = this.children
      .sort((a, b) => {
        return a.id > b.id ? 1 : -1;
      })
      .map((item) => {
        return item.getComputedLayout(props);
      });
    return layout;
  }

  static create(config: NodeProperties) {
    return new Node(config);
  }
}

flexProperties.forEach((property) => {
  Object.defineProperty(Node.prototype, property, {
    get() {
      return this.config[property];
    },
    set(value) {
      if (this.config) {
        this.config[property] = value;
      }
    },
  });
});

export default Node;
