import type { StylePropertyMap } from '../style/styleMap';
import type { IntrinsicSizes, LayoutConstraints, LayoutOptions } from './types';
import type { FragmentResultOptions, FragmentResult } from './FragmentResult';
import type { LayoutChildren } from './LayoutChildren';
import type { LayoutEdges } from './LayoutEdges';

export abstract class AbstractLayoutDefinition {
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
  ): Promise<FragmentResultOptions | FragmentResult>;
}

// type Newable<T> = new (...args: any[]) => T;

// export type LayoutDefinitionCtor = Newable<AbstractLayoutDefinition>;

/**
 * internal use
 */
// https://stackoverflow.com/questions/39392853/is-there-a-type-for-class-in-typescript-and-does-any-include-it
export type LayoutDefinitionCtor = {
  new (): AbstractLayoutDefinition;
  inputProperties: string[];
  childrenInputProperties: string[];
  layoutOptions: LayoutOptions;
};
