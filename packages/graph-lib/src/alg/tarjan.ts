import type { Graph } from '../graph';

export type IVisited = Record<
  string,
  {
    index: number;
    lowLink: number;
    onStack: boolean;
  }
>;

/**
 * This function is an implementation of Tarjan's algorithm which finds all strongly connected
 * components in the directed graph g. Each strongly connected component is composed of nodes that
 * can reach all other nodes in the component via directed edges. A strongly connected component
 * can consist of a single node if that node cannot both reach and be reached by any other
 * specific node in the graph. Components of more than one node are guaranteed to have at least
 * one cycle.
 * Complexity: O(|V| + |E|).
 *
 * @param graph graph to find all strongly connected components of.
 * @returns an array of components. Each component is itself an array that contains
 *          the ids of all nodes in the component.
 */
export function tarjan(graph: Graph): string[][] {
  let index = 0;
  const stack: string[] = [];
  // node id -> { onStack, lowlink, index }
  const visited: IVisited = {};
  const results: string[][] = [];

  function dfs(v: string) {
    // eslint-disable-next-line no-multi-assign
    const entry = (visited[v] = {
      lowLink: index,
      // eslint-disable-next-line no-plusplus
      index: index++,
      onStack: true,
    });
    stack.push(v);

    const succ = graph.successors(v);
    if (succ !== undefined) {
      succ.forEach((w) => {
        if (!Reflect.has(visited, w)) {
          dfs(w);
          entry.lowLink = Math.min(entry.lowLink, visited[w].lowLink);
        } else if (visited[w].onStack) {
          entry.lowLink = Math.min(entry.lowLink, visited[w].index);
        }
      });
    }

    if (entry.lowLink === entry.index) {
      const cmpt: string[] = [];
      let w: string;
      do {
        w = String(stack.pop());
        visited[w].onStack = false;
        cmpt.push(w);
      } while (v !== w);
      results.push(cmpt);
    }
  }

  graph.nodes().forEach((v) => {
    if (!Reflect.has(visited, v)) {
      dfs(v);
    }
  });

  return results;
}
