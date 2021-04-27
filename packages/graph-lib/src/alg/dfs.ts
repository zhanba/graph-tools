import type { Graph } from '../graph';

export type Order = 'pre' | 'post';

/**
 * A helper that preforms a pre- or post-order traversal on the input graph
 * and returns the nodes in the order they were visited. If the graph is
 * undirected then this algorithm will navigate using neighbors. If the graph
 * is directed then this algorithm will navigate using successors.
 *
 * @param graph depth first traversal target.
 * @param vs nodes list to traverse.
 * @param order Order must be one of "pre" or "post".
 * @returns the nodes in the order they were visited as a list of their names.
 */
export function dfs(graph: Graph, vs: string[] | string, order: Order) {
  if (!Array.isArray(vs)) {
    // eslint-disable-next-line no-param-reassign
    vs = [vs];
  }

  const navigation = (graph.directed ? graph.successors : graph.neighbors).bind(graph);

  const acc: string[] = [];
  const visited = {};
  vs.forEach((v) => {
    if (!graph.hasNode(v)) {
      throw new Error(`Graph does not have node: ${v}`);
    }

    doDfs(graph, v, order === 'post', visited, navigation, acc);
  });
  return acc;
}

function doDfs(
  g: Graph,
  v: string,
  postOrder: boolean,
  visited: Record<string, boolean>,
  navigation: (v: string) => string[] | undefined,
  acc: string[],
) {
  if (!Reflect.has(visited, v)) {
    // eslint-disable-next-line no-param-reassign
    visited[v] = true;

    if (!postOrder) {
      acc.push(v);
    }
    navigation(v)?.forEach((w) => {
      doDfs(g, w, postOrder, visited, navigation, acc);
    });
    if (postOrder) {
      acc.push(v);
    }
  }
}
