/* eslint-disable @typescript-eslint/no-throw-literal */
import type { Graph } from '../graph';

export class CycleException {}

/**
 * Given a Graph graph this function applies topological sorting to it.
 * If the graph has a cycle it is impossible to generate such a list and CycleException is thrown.
 * Complexity: O(|V| + |E|).
 *
 * @param graph graph to apply topological sorting to.
 * @returns an array of nodes such that for each edge u -> v, u appears before v in the array.
 */
export function topsort(graph: Graph) {
  const visited: Record<string, boolean> = {};
  const stack: Record<string, boolean> = {};
  const results: string[] = [];

  function visit(node: string) {
    if (Reflect.has(stack, node)) {
      throw new CycleException();
    }

    if (!Reflect.has(visited, node)) {
      stack[node] = true;
      visited[node] = true;
      const pred = graph.predecessors(node);
      if (pred !== undefined) {
        pred.forEach(visit);
      }
      delete stack[node];
      results.push(node);
    }
  }

  graph.sinks().forEach(visit);

  if (Object.keys(visited).length !== graph.nodeCount()) {
    throw new CycleException();
  }

  return results;
}
