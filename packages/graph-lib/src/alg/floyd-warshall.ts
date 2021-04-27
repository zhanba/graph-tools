import type { Graph } from '../graph';
import type { IEdgeFn, IWeightFn } from './dijkstra';

type IResult = Record<
  string,
  Record<
    string,
    {
      distance: number;
      predecessor?: string;
    }
  >
>;

const DEFAULT_WEIGHT_FUNC: IWeightFn = () => 1;

/**
 * This function is an implementation of the Floyd-Warshall algorithm, which finds the
 * shortest path from each node to every other reachable node in the graph. It is similar
 * to alg.dijkstraAll, but it handles negative edge weights and is more efficient for some types
 * of graphs. This function returns a map of source -> { target -> { distance, predecessor }.
 * The distance property holds the sum of the weights from source to target along the shortest
 * path of Number.POSITIVE_INFINITY if there is no path from source. The predecessor property
 * can be used to walk the individual elements of the path from source to target in reverse
 * order.
 * Complexity: O(|V|^3).
 *
 * @param graph graph where to search pathes.
 * @param weightFn function which takes edge e and returns the weight of it. If no weightFn
 * is supplied then each edge is assumed to have a weight of 1. This function throws an
 * Error if any of the traversed edges have a negative edge weight.
 * @param edgeFn function which takes a node v and returns the ids of all edges incident to it
 * for the purposes of shortest path traversal. By default this function uses the graph.outEdges.
 * @returns shortest pathes map.
 */
export function floydWarshall(graph: Graph, weightFn?: IWeightFn, edgeFn?: IEdgeFn) {
  return runFloydWarshall(graph, weightFn, edgeFn);
}

function runFloydWarshall(
  graph: Graph,
  weightFn = DEFAULT_WEIGHT_FUNC,
  edgeFn = (v: string) => graph.outEdges(v),
) {
  const results: IResult = {};
  const nodes = graph.nodes();

  nodes.forEach((v) => {
    results[v] = {};
    results[v][v] = { distance: 0 };
    nodes.forEach((w) => {
      if (v !== w) {
        results[v][w] = { distance: Number.POSITIVE_INFINITY };
      }
    });
    const res = edgeFn(v);
    if (res !== undefined) {
      res.forEach((edge) => {
        const w = edge.v === v ? edge.w : edge.v;
        const d = weightFn(edge);
        results[v][w] = { distance: d, predecessor: v };
      });
    }
  });

  nodes.forEach((k) => {
    const rowK = results[k];
    nodes.forEach((i) => {
      const rowI = results[i];
      nodes.forEach((j) => {
        const ik = rowI[k];
        const kj = rowK[j];
        const ij = rowI[j];
        const altDistance = ik.distance + kj.distance;
        if (altDistance < ij.distance) {
          ij.distance = altDistance;
          ij.predecessor = kj.predecessor;
        }
      });
    });
  });

  return results;
}
