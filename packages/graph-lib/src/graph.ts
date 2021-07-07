/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import { isEmpty, union } from 'lodash';

const DEFAULT_EDGE_NAME = '\x00';
const GRAPH_NODE = '\x00';
const EDGE_KEY_DELIM = '\x01';

export type LabelValue = string | number | boolean | Record<string, unknown> | undefined;

export type KeyValue = string | number;

export type NameValue = string | number;

export interface IGraphOptions {
  /**
   * default: true
   */
  directed?: boolean;
  /**
   * default: false
   */
  multigraph?: boolean;
  /**
   * default: false
   */
  compound?: boolean;
}

export type INodes = Record<string, LabelValue>;

export type ICount = Record<string, number>;

export type INodeCount = Record<string, ICount>;

export type IEdgeLabels = Record<string, LabelValue>;

export interface IEdgeObj {
  [key: string]: string | undefined;
  v: string;
  w: string;
  name?: string;
}

export type IEdgeObjs = Record<string, IEdgeObj>;

export type IEdgeObjsObj = Record<string, IEdgeObjs>;

export type IParentObjs = Record<string, KeyValue>;

export type IChildrenObjs = Record<string, Record<string, boolean>>;

export type IDefaultLabelFn = (v: any) => LabelValue;

export type DefaultEdgeLabelFn = (v: string, w: string, name: string) => LabelValue;

export class Graph {
  public readonly directed: boolean;
  public readonly multigraph: boolean;
  public readonly compound: boolean;

  // Label for the graph itself
  private label: LabelValue;

  // v -> label
  private nodesObj: INodes = {};

  // v -> parent
  private parentObj: IParentObjs = {};

  // v -> children
  private childrenObj: IChildrenObjs = {};
  // this._children[GRAPH_NODE] = {};

  // v -> edgeObj
  private in: IEdgeObjsObj = {};

  // u -> v -> Number
  private preds: INodeCount = {};

  // v -> edgeObj
  private out: IEdgeObjsObj = {};

  // v -> w -> Number
  private sucs: INodeCount = {};

  // e -> edgeObj
  private edgeObjs: IEdgeObjs = {};

  // e -> label
  private edgeLabels: IEdgeLabels = {};

  /* Number of nodes in the graph. Should only be changed by the implementation. */
  private nodeCountNumber = 0;

  /* Number of edges in the graph. Should only be changed by the implementation. */
  private edgeCountNumber = 0;

  constructor(opt?: IGraphOptions) {
    this.directed = opt && opt.directed !== undefined ? opt.directed : true;
    this.multigraph = opt && opt.multigraph !== undefined ? opt.multigraph : false;
    this.compound = opt && opt.compound !== undefined ? opt.compound : false;
    if (this.compound) {
      this.childrenObj[GRAPH_NODE] = {};
    }
  }

  /**
   * Sets the label of the graph.
   *
   * @param label label value.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setGraph(label: LabelValue): Graph {
    this.label = label;
    return this;
  }

  /**
   * Gets the graph label.
   * @returns currently assigned label for the graph or undefined if no label assigned.
   */
  public graph(): LabelValue {
    return this.label;
  }

  /**
   * Whether graph was created with 'directed' flag set to true or not.
   *
   * @returns whether the graph edges have an orientation.
   */
  isDirected(): boolean {
    return this.directed;
  }

  /**
   * Whether graph was created with 'multigraph' flag set to true or not.
   *
   * @returns whether the pair of nodes of the graph can have multiple edges.
   */
  isMultigraph(): boolean {
    return this.multigraph;
  }

  /**
   * Whether graph was created with 'compound' flag set to true or not.
   *
   * @returns whether a node of the graph can have subnodes.
   */
  isCompound(): boolean {
    return this.compound;
  }

  /**
   * Sets the default node label. This label will be assigned as default label
   * in case if no label was specified while setting a node.
   * Complexity: O(1).
   *
   * @param label default node label or default node label factory function.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setDefaultNodeLabel(label: LabelValue | IDefaultLabelFn): Graph {
    if (typeof label !== 'function') {
      this.defaultNodeLabelFn = () => label;
      return this;
    }
    this.defaultNodeLabelFn = label;
    return this;
  }

  /**
   * Gets the number of nodes in the graph.
   * Complexity: O(1).
   *
   * @returns nodes count.
   */
  public nodeCount(): number {
    return this.nodeCountNumber;
  }

  /**
   * Gets all nodes of the graph. Note, the in case of compound graph subnodes are
   * not included in list.
   * Complexity: O(1).
   *
   * @returns list of graph nodes.
   */
  public nodes(): string[] {
    return Object.keys(this.nodesObj);
  }

  /**
   * Gets list of nodes without in-edges.
   * Complexity: O(|V|).
   *
   * @returns the graph source nodes.
   */
  public sources(): string[] {
    return this.nodes().filter((v) => isEmpty(this.in[v]));
  }

  /**
   * Gets list of nodes without out-edges.
   * Complexity: O(|V|).
   *
   * @returns the graph source nodes.
   */
  public sinks(): string[] {
    return this.nodes().filter((v) => isEmpty(this.out[v]));
  }

  /**
   * Invokes setNode method for each node in names list.
   * Complexity: O(|names|).
   *
   * @param names - list of nodes names to be set.
   * @param value - value to set for each node in list.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setNodes(names: string[], value?: LabelValue): Graph {
    names.forEach((v) => {
      if (value) {
        this.setNode(v, value);
      } else {
        this.setNode(v);
      }
    });
    return this;
  }

  /**
   * Creates or updates the value for the node v in the graph. If label is supplied
   * it is set as the value for the node. If label is not supplied and the node was
   * created by this call then the default node label will be assigned.
   * Complexity: O(1).
   *
   * @param name node name
   * @param value value to set for node.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setNode(name: KeyValue, value?: LabelValue): Graph {
    if (this.hasNode(name)) {
      if (arguments.length > 1) {
        this.nodesObj[name] = value;
      }
      return this;
    }

    this.nodesObj[name] = arguments.length > 1 ? value : this.defaultNodeLabelFn(name);

    if (this.compound) {
      this.parentObj[name] = GRAPH_NODE;
      this.childrenObj[name] = {};
      this.childrenObj[GRAPH_NODE][name] = true;
    }
    this.in[name] = {};
    this.preds[name] = {};
    this.out[name] = {};
    this.sucs[name] = {};
    ++this.nodeCountNumber;
    return this;
  }

  /**
   * Gets the label of node with specified name.
   *
   * @param name node name
   * @returns label value of the node.
   */
  public node(name: KeyValue) {
    return this.nodesObj[name];
  }

  /**
   * Detects whether graph has a node with specified name or not.
   *
   * @param name name of the node.
   * @returns true if graph has node with specified name, false - otherwise.
   */
  public hasNode(name: KeyValue) {
    return Reflect.has(this.nodesObj, name);
  }

  /**
   * Remove the node with the name from the graph or do nothing if the node is not in
   * the graph. If the node was removed this function also removes any incident
   * edges.
   * Complexity: O(1).
   *
   * @param name name of the node.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public removeNode(name: KeyValue): Graph {
    if (this.hasNode(name)) {
      const removeEdge = (e: string) => {
        this.removeEdge(this.edgeObjs[e]);
      };
      delete this.nodesObj[name];
      if (this.compound) {
        this.removeFromParentsChildList(name);
        delete this.parentObj[name];
        const children = this.children(name);
        if (children !== undefined) {
          children.forEach((child) => this.setParent(child));
        }
        delete this.childrenObj[name];
      }

      Object.keys(this.in[name]).forEach(removeEdge);
      delete this.in[name];
      delete this.preds[name];
      Object.keys(this.out[name]).forEach(removeEdge);
      delete this.out[name];
      delete this.sucs[name];
      --this.nodeCountNumber;
    }
    return this;
  }

  /**
   * Sets node p as a parent for node v if it is defined, or removes the
   * parent for v if p is undefined. Method throws an exception in case of
   * invoking it in context of noncompound graph.
   * Average-case complexity: O(1).
   *
   * @param v - node to be child
   * @param parent - node to be parent
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setParent(v: KeyValue, parent?: KeyValue): Graph {
    if (!this.compound) {
      throw new Error('Cannot set parent in a non-compound graph');
    }

    if (parent === undefined) {
      parent = GRAPH_NODE;
    } else {
      // Coerce parent to string
      parent += '';
      for (
        let ancestor: KeyValue | undefined = parent;
        ancestor !== undefined;
        ancestor = this.parent(ancestor)
      ) {
        if (ancestor === v) {
          throw new Error(`Setting ${parent} as parent of ${v} would create a cycle`);
        }
      }
      this.setNode(parent);
    }

    this.setNode(v);
    this.removeFromParentsChildList(v);
    this.parentObj[v] = parent;
    this.childrenObj[parent][v] = true;

    return this;
  }

  public removeFromParentsChildList(v: KeyValue) {
    delete this.childrenObj[this.parentObj[v]][v];
  }

  /**
   * Gets parent node for node v.
   *
   * @param v node to get parent of.
   * @returns parent node name or void if v has no parent.
   */
  public parent(v: KeyValue): KeyValue | undefined {
    if (this.compound) {
      const parent = this.parentObj[v];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }
  }

  /**
   * Gets list of direct children of node v.
   *
   * @param v node to get children of.
   * @returns children nodes names list.
   */
  public children(v: KeyValue = GRAPH_NODE): string[] | undefined {
    if (this.compound) {
      const children = this.childrenObj[v];
      if (children) {
        return Object.keys(children);
      }
    } else if (v === GRAPH_NODE) {
      return this.nodes();
    } else if (this.hasNode(v)) {
      return [];
    }
    return undefined;
  }

  /**
   * Return all nodes that are predecessors of the specified node or undefined if node v is not in
   * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
   * Complexity: O(|V|).
   *
   * @param v node identifier.
   * @returns node identifiers list or undefined if v is not in the graph.
   */
  public predecessors(v: KeyValue): string[] | undefined {
    const predsV = this.preds[v];
    if (predsV) {
      return Object.keys(predsV);
    }
    return undefined;
  }

  /**
   * Return all nodes that are successors of the specified node or undefined if node v is not in
   * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
   * Complexity: O(|V|).
   *
   * @param v node identifier.
   * @returns node identifiers list or undefined if v is not in the graph.
   */
  public successors(v: KeyValue): string[] | undefined {
    const sucsV = this.sucs[v];
    if (sucsV) {
      return Object.keys(sucsV);
    }
    return undefined;
  }

  /**
   * Return all nodes that are predecessors or successors of the specified node or undefined if
   * node v is not in the graph.
   * Complexity: O(|V|).
   *
   * @param v node identifier.
   * @returns node identifiers list or undefined if v is not in the graph.
   */
  public neighbors(v: KeyValue): string[] | undefined {
    const preds = this.predecessors(v);
    const sucs = this.successors(v);
    if (preds) {
      return union(preds, sucs);
    }
    return undefined;
  }

  public isLeaf(v: KeyValue): boolean {
    let neighbors;
    if (this.directed) {
      neighbors = this.successors(v);
    } else {
      neighbors = this.neighbors(v);
    }
    if (neighbors) {
      return neighbors.length === 0;
    }
    // not exist ??
    // TODO
    return false;
  }

  /**
   * Creates new graph with nodes filtered via filter. Edges incident to rejected node
   * are also removed. In case of compound graph, if parent is rejected by filter,
   * than all its children are rejected too.
   * Average-case complexity: O(|E|+|V|).
   *
   * @param filter filtration function detecting whether the node should stay or not.
   * @returns new graph made from current and nodes filtered.
   */
  public filterNodes(filter: (v: string) => boolean): Graph {
    const copy = new Graph({
      compound: this.compound,
      directed: this.directed,
      multigraph: this.multigraph,
    });

    copy.setGraph(this.graph());

    Object.entries(this.nodesObj).forEach(([v, value]) => {
      if (filter(v)) {
        copy.setNode(v, value);
      }
    });

    Object.entries(this.edgeObjs).forEach(([, edgeObject]) => {
      if (copy.hasNode(edgeObject.v) && copy.hasNode(edgeObject.w)) {
        copy.setEdge(edgeObject, this.edge(edgeObject));
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const parents: Record<string, KeyValue | undefined> = {};
    function findParent(v: KeyValue): KeyValue | undefined {
      const parent = self.parent(v);
      if (parent === undefined || copy.hasNode(parent)) {
        parents[v] = parent;
        return parent;
      }
      if (parent in parents) {
        return parents[parent];
      }
      return findParent(parent);
    }

    if (this.compound) {
      copy.nodes().forEach((v) => copy.setParent(v, findParent(v)));
    }
    return copy;
  }

  /**
   * Sets the default edge label factory function. This function will be invoked
   * each time when setting an edge with no label specified and returned value
   * will be used as a label for edge.
   * Complexity: O(1).
   *
   * @param label default edge label or default edge label factory function.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setDefaultEdgeLabel(label: LabelValue | DefaultEdgeLabelFn) {
    if (typeof label !== 'function') {
      this.defaultEdgeLabelFn = () => label;
    } else {
      this.defaultEdgeLabelFn = label;
    }
    return this;
  }

  /**
   * Gets the number of edges in the graph.
   * Complexity: O(1).
   *
   * @returns edges count.
   */
  public edgeCount(): number {
    return this.edgeCountNumber;
  }

  /**
   * Gets edges of the graph. In case of compound graph subgraphs are not considered.
   * Complexity: O(|E|).
   *
   * @returns graph edges list.
   */
  public edges(): IEdgeObj[] {
    return Object.values(this.edgeObjs);
  }

  /**
   * Establish an edges path over the nodes in nodes list. If some edge is already
   * exists, it will update its label, otherwise it will create an edge between pair
   * of nodes with label provided or default label if no label provided.
   * Complexity: O(|nodes|).
   *
   * @param nodes list of nodes to be connected in series.
   * @param value value to set for each edge between pairs of nodes.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setPath(nodes: string[], value?: LabelValue): Graph {
    nodes.reduce((v, w) => {
      if (value) {
        this.setEdge(v, w, value);
      } else {
        this.setEdge(v, w);
      }
      return w;
    });
    return this;
  }

  /**
   * Creates or updates the label for the specified edge. If label is supplied it is
   * set as the value for the edge. If label is not supplied and the edge was created
   * by this call then the default edge label will be assigned. The name parameter is
   * only useful with multigraphs.
   *
   * @param edgeobj edge descriptor.
   * @param value value to associate with the edge.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setEdge(edgeobj: IEdgeObj, value?: LabelValue): Graph;
  /**
   * Creates or updates the label for the edge (v, w) with the optionally supplied
   * name. If label is supplied it is set as the value for the edge. If label is not
   * supplied and the edge was created by this call then the default edge label will
   * be assigned. The name parameter is only useful with multigraphs.
   *
   * @param v edge source node.
   * @param w edge sink node.
   * @param value value to associate with the edge.
   * @param name unique name of the edge in order to identify it in multigraph.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public setEdge(v: KeyValue, w: KeyValue, value?: LabelValue, name?: NameValue): Graph;
  public setEdge(): any {
    let v;
    let w;
    let name;
    let value;
    let valueSpecified = false;
    const arg0 = arguments[0];

    if (typeof arg0 === 'object' && arg0 !== null && 'v' in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (arguments.length === 2) {
        value = arguments[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = arguments[1];
      name = arguments[3];
      if (arguments.length > 2) {
        value = arguments[2];
        valueSpecified = true;
      }
    }

    v = `${v}`;
    w = `${w}`;
    if (name !== undefined) {
      name = `${name}`;
    }

    const e = edgeArgsToId(this.directed, v, w, name);
    if (Reflect.has(this.edgeLabels, e)) {
      if (valueSpecified) {
        this.edgeLabels[e] = value;
      }
      return this;
    }

    if (name !== undefined && !this.multigraph) {
      throw new Error('Cannot set a named edge when isMultigraph = false');
    }

    // It didn't exist, so we need to create it.
    // First ensure the nodes exist.
    this.setNode(v);
    this.setNode(w);

    this.edgeLabels[e] = valueSpecified ? value : this.defaultEdgeLabelFn(v, w, name);

    const edgeObj = edgeArgsToObj(this.directed, v, w, name);
    // Ensure we add undirected edges in a consistent way.
    v = edgeObj.v;
    w = edgeObj.w;

    Object.freeze(edgeObj);

    this.edgeObjs[e] = edgeObj;
    incrementOrInitEntry(this.preds[w], v);
    incrementOrInitEntry(this.sucs[v], w);

    this.in[w][e] = edgeObj;
    this.out[v][e] = edgeObj;
    this.edgeCountNumber++;
    return this;
  }

  /**
   * Gets the label for the specified edge.
   *
   * @param v edge source node.
   * @param w edge sink node.
   * @param name name of the edge (actual for multigraph).
   * @returns value associated with specified edge.
   */
  public edge(v: KeyValue, w: KeyValue, name?: NameValue): LabelValue;
  /**
   * Gets the label for the specified edge.
   *
   * @param edgeObj edge descriptor.
   * @returns value associated with specified edge.
   */
  public edge(edgeObj: IEdgeObj): LabelValue;
  public edge(v: any): any {
    const e =
      arguments.length === 1
        ? edgeObjToId(this.directed, arguments[0])
        : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    return this.edgeLabels[e];
  }

  /**
   * Detects whether the graph contains specified edge or not. No subgraphs are considered.
   * Complexity: O(1).
   *
   * @param v edge source node.
   * @param w edge sink node.
   * @param name name of the edge (actual for multigraph).
   * @returns whether the graph contains the specified edge or not.
   */
  public hasEdge(v: KeyValue, w: KeyValue, name?: NameValue): boolean;
  /**
   * Detects whether the graph contains specified edge or not. No subgraphs are considered.
   * Complexity: O(1).
   *
   * @param edgeObj edge descriptor.
   * @returns whether the graph contains the specified edge or not.
   */
  public hasEdge(edgeObj: IEdgeObj): boolean;
  public hasEdge(v: any): any {
    const e =
      arguments.length === 1
        ? edgeObjToId(this.directed, arguments[0])
        : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    return Reflect.has(this.edgeLabels, e);
  }

  /**
   * Removes the specified edge from the graph. No subgraphs are considered.
   * Complexity: O(1).
   *
   * @param v edge source node.
   * @param w edge sink node.
   * @param name name of the edge (actual for multigraph).
   * @returns the graph, allowing this to be chained with other functions.
   */
  public removeEdge(v: string, w: string, name?: string): Graph;
  /**
   * Removes the specified edge from the graph. No subgraphs are considered.
   * Complexity: O(1).
   *
   * @param edgeObj  edge descriptor.
   * @returns the graph, allowing this to be chained with other functions.
   */
  public removeEdge(edgeObj: IEdgeObj): Graph;
  public removeEdge(v: any): any {
    const e =
      arguments.length === 1
        ? edgeObjToId(this.directed, arguments[0])
        : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    const edge = this.edgeObjs[e];
    if (edge) {
      const v1 = edge.v;
      const w1 = edge.w;
      delete this.edgeLabels[e];
      delete this.edgeObjs[e];
      decrementOrRemoveEntry(this.preds[w1], v1);
      decrementOrRemoveEntry(this.sucs[v1], w1);
      delete this.in[w1][e];
      delete this.out[v1][e];
      this.edgeCountNumber--;
    }
    return this;
  }

  /**
   * Return all edges that point to the node v. Optionally filters those edges down to just those
   * coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
   * Complexity: O(|E|).
   *
   * @param v edge source node.
   * @param w edge sink node.
   * @returns  edges descriptors list if v is in the graph, or undefined otherwise.
   */
  public inEdges(v: string, w?: string): IEdgeObj[] | undefined {
    const inV = this.in[v];
    if (inV) {
      const edges = Object.values(inV);
      if (!w) {
        return edges;
      }
      return edges.filter((edge) => edge.v === w);
    }
    return undefined;
  }

  /**
   * Return all edges that are pointed at by node v. Optionally filters those edges down to just
   * those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead.
   * Complexity: O(|E|).
   *
   * @param v edge source node.
   * @param w edge sink node.
   * @returns edges descriptors list if v is in the graph, or undefined otherwise.
   */
  public outEdges(v: string, w?: string): IEdgeObj[] | undefined {
    const outV = this.out[v];
    if (outV) {
      const edges = Object.values(outV);
      if (!w) {
        return edges;
      }
      return edges.filter((edge) => edge.w === w);
    }
    return undefined;
  }

  /**
   * Returns all edges to or from node v regardless of direction. Optionally filters those edges
   * down to just those between nodes v and w regardless of direction.
   * Complexity: O(|E|).
   *
   * @param v edge source node.
   * @param w edge sink node.
   * @returns edges descriptors list if v is in the graph, or undefined otherwise.
   */
  public nodeEdges(v: string, w?: string): IEdgeObj[] | undefined {
    const inEdges = this.inEdges(v, w);
    const outEdges = this.outEdges(v, w);
    if (inEdges && outEdges) {
      return inEdges.concat(outEdges);
    }
    return undefined;
  }

  // Defaults to be set when creating a new node
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private defaultNodeLabelFn: IDefaultLabelFn = (label: LabelValue) => undefined;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private defaultEdgeLabelFn: DefaultEdgeLabelFn = (label: LabelValue) => undefined;
}

function incrementOrInitEntry(map: ICount, k: string): void {
  if (map[k]) {
    map[k]++;
  } else {
    map[k] = 1;
  }
}

function decrementOrRemoveEntry(map: ICount, k: string): void {
  if (!--map[k]) {
    delete map[k];
  }
}

function edgeArgsToId(isDirected: boolean, v0: string, w0: string, name?: string): string {
  let v = `${v0}`;
  let w = `${w0}`;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (name === undefined ? DEFAULT_EDGE_NAME : name);
}

function edgeArgsToObj(isDirected: boolean, v0: string, w0: string, name?: string): IEdgeObj {
  let v = `${v0}`;
  let w = `${w0}`;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  const edgeObj: IEdgeObj = { v, w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}

function edgeObjToId(isDirected: boolean, edgeObj: IEdgeObj): string {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}
