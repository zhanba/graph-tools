import type { KeyValue, LabelValue } from './graph';
import { Graph } from './graph';

export interface INodeObj {
  v: KeyValue;
  value: LabelValue;
  parent: KeyValue | undefined;
}

export interface IEdgeObj {
  v: string;
  w: string;
  name: string | undefined;
  value: LabelValue;
}

export interface IJsonObj {
  options: {
    directed: boolean;
    multigraph: boolean;
    compound: boolean;
  };
  nodes: INodeObj[];
  edges: IEdgeObj[];
  value: LabelValue;
}

/**
 * Creates a JSON representation of the graph that can be serialized to a string with
 * JSON.stringify. The graph can later be restored using json.read.
 *
 * @param graph target to create JSON representation of.
 * @returns JSON serializable graph representation
 */
function write(graph: Graph): IJsonObj {
  const jsonObj: IJsonObj = {
    edges: writeEdges(graph),
    nodes: writeNodes(graph),
    options: {
      compound: graph.compound,
      directed: graph.directed,
      multigraph: graph.multigraph,
    },
    // eslint-disable-next-line prefer-object-spread
    value: typeof graph.graph === 'object' ? Object.assign({}, graph.graph()) : graph.graph(),
  };

  return jsonObj;
}

function writeNodes(g: Graph): INodeObj[] {
  return g.nodes().map((v) => {
    const nodeValue = g.node(v);
    const parent = g.parent(v);
    const node: INodeObj = { v, value: undefined, parent: undefined };
    if (nodeValue !== undefined) {
      node.value = nodeValue;
    }
    if (parent !== undefined) {
      node.parent = parent;
    }
    return node;
  });
}

function writeEdges(g: Graph): IEdgeObj[] {
  return g.edges().map((e) => {
    const edgeValue = g.edge(e);
    const edge: IEdgeObj = {
      name: undefined,
      v: e.v,
      value: undefined,
      w: e.w,
    };
    if (e.name !== undefined) {
      edge.name = e.name;
    }
    if (edgeValue !== undefined) {
      edge.value = edgeValue;
    }
    return edge;
  });
}

/**
 * Takes JSON as input and returns the graph representation.
 *
 * @example
 * ```
 * var g2 = graphlib.json.read(JSON.parse(str));
 * g2.nodes();
 * // ['a', 'b']
 * g2.edges()
 * // [ { v: 'a', w: 'b' } ]
 * ```
 * @param jsonObj JSON serializable graph representation
 * @returns graph constructed acccording to specified representation
 */
function read(jsonObj: IJsonObj): Graph {
  const g = new Graph(jsonObj.options).setGraph(jsonObj.value);
  jsonObj.nodes.forEach((entry) => {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  jsonObj.edges.forEach((entry) => {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  });
  return g;
}

const json = {
  read,
  write,
};

export { json };
