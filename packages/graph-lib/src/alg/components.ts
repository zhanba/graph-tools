import type { Graph } from '../graph';

/**
 * Finds all connected components in a graph and returns an array of these components.
 * Each component is itself an array that contains the ids of nodes in the component.
 * Complexity: O(|V|).
 *
 * @param graph graph to find components in.
 * @returns array of nodes list representing components
 */
export function components(graph: Graph) {
  const visited: Record<string, boolean> = {};
  let cmpt: string[] = [];
  const cmpts: string[][] = [];
  function dfs(v: string) {
    if (Reflect.has(visited, v)) {
      return;
    }
    visited[v] = true;
    cmpt.push(v);
    const succ = graph.successors(v);
    if (succ !== undefined) {
      succ.forEach(dfs);
    }
    const pred = graph.predecessors(v);
    if (pred !== undefined) {
      pred.forEach(dfs);
    }
  }

  graph.nodes().forEach((v) => {
    cmpt = [];
    dfs(v);
    if (cmpt.length) {
      cmpts.push(cmpt);
    }
  });

  return cmpts;
}
