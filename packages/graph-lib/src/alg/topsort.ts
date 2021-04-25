/* eslint-disable @typescript-eslint/no-throw-literal */
import type { Graph } from '../graph';

class CycleException {}

function topsort(g: Graph) {
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
      const pred = g.predecessors(node);
      if (pred !== undefined) {
        pred.forEach(visit);
      }
      delete stack[node];
      results.push(node);
    }
  }

  g.sinks().forEach(visit);

  if (Object.keys(visited).length !== g.nodeCount()) {
    throw new CycleException();
  }

  return results;
}

export { topsort, CycleException };
