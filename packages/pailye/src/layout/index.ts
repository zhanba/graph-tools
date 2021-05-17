/* eslint-disable max-classes-per-file */
import type { StylePropertyMap } from '../style/styleMap';
import type {
  IntrinsicSizes,
  LayoutConstraints,
  LayoutFragment,
  LayoutOptions,
  LayoutEdges,
} from './types';

export abstract class LayoutChildren {
  abstract styleMap: StylePropertyMap;
  abstract intrinsicSizes(): Promise<IntrinsicSizes>;
  abstract layoutNextFragment(constraints: LayoutConstraints): Promise<LayoutFragment>;
}

export abstract class AbstractLayout {
  static inputProperties: string[];
  static childrenInputProperties: string[];
  static layoutOptions: LayoutOptions;

  abstract intrinsicSizes(
    children: LayoutChildren[],
    edges: LayoutEdges,
    styleMap: StylePropertyMap,
  ): Promise<IntrinsicSizes>;
  abstract layout(
    children: LayoutChildren[],
    edges: LayoutEdges,
    constraints: LayoutConstraints,
    styleMap: StylePropertyMap,
  ): Promise<void>;
}

type Newable<T> = new (...args: any[]) => T;

export type LayoutCtor = Newable<AbstractLayout>;
