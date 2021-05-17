import type { Graph, KeyValue } from '../graph';
import { topsort } from './topsort';

/**
 * - calculate longest path of graph
 * - only work for directed graph
 * - support edge weight, eg. `graph.setEdge(v, w,  number)`
 * - weight must be positive number
 * - time complexity : O(V + E)
 * @param graph the graph
 */
export const longestPath = (graph: Graph) => {
  if (!graph.isDirected()) {
    throw new Error('longestPath only work for directed graph');
  }

  const dist: Record<KeyValue, { distance: number; predecessor: KeyValue }> = {};

  const topsortResult = topsort(graph);

  topsortResult.forEach((u) => {
    const adjacentVertex = graph.successors(u);
    adjacentVertex?.forEach((v) => {
      const edge = graph.edge(u, v);
      const weight = typeof edge === 'number' ? edge : 1;
      if (weight < 0) {
        throw new Error('weight must be positive');
      }
      const distv = dist[v]?.distance ?? 0;
      const distu = dist[u]?.distance ?? 0;
      if (distv < distu + weight) {
        dist[v] = { distance: distu + weight, predecessor: u };
      }
    });
  });

  return dist;
};
