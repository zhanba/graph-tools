import type { Graph, IEdgeObj } from '../graph';
import { PriorityQueue } from '../priority-queue';

export interface IEntry {
  [key: string]: number | string;
  distance: number;
}

export type IDijkstraResult = Record<string, IEntry>;

export type IDijkstraAllResult = Record<string, IDijkstraResult>;

export type IWeightFn = (edge: IEdgeObj) => number;

export type IEdgeFn = (v: string) => IEdgeObj[] | undefined;

const DEFAULT_WEIGHT_FUNC = () => 1;

/**
 * This function is an implementation of Dijkstra's algorithm which finds the shortest
 * path from source to all other nodes in graph. This function returns a map of
 * v -> { distance, predecessor }. The distance property holds the sum of the weights
 * from source to v along the shortest path or Number.POSITIVE_INFINITY if there is no path
 * from source. The predecessor property can be used to walk the individual elements of the
 * path from source to v in reverse order.
 * Complexity: O((|E| + |V|) * log |V|).
 *
 * @param graph graph where to search pathes.
 * @param source node to start pathes from.
 * @param weightFn function which takes edge e and returns the weight of it. If no weightFn
 * is supplied then each edge is assumed to have a weight of 1. This function throws an
 * Error if any of the traversed edges have a negative edge weight.
 * @param edgeFn function which takes a node v and returns the ids of all edges incident to it
 * for the purposes of shortest path traversal. By default this function uses the graph.outEdges.
 * @returns shortest pathes map that starts from node source
 */
function dijkstra(
  graph: Graph,
  source: string,
  weightFn: IWeightFn = DEFAULT_WEIGHT_FUNC,
  edgeFn = (v: string) => graph.outEdges(v),
): IDijkstraResult {
  return runDijkstra(graph, String(source), weightFn, edgeFn);
}

function runDijkstra(graph: Graph, source: string, weightFn: IWeightFn, edgeFn: IEdgeFn) {
  const results: IDijkstraResult = {};
  const pq = new PriorityQueue();
  let v: string = '';
  let vEntry: IEntry = { distance: 0 };

  const updateNeighbors = (edge: IEdgeObj) => {
    const w = edge.v !== v ? edge.v : edge.w;
    const wEntry: IEntry = results[w];
    const weight = weightFn(edge);
    const distance = vEntry.distance + weight;

    if (weight < 0) {
      throw new Error(
        `${'dijkstra does not allow negative edge weights. Bad edge: '}${edge} Weight: ${weight}`,
      );
    }

    if (distance < wEntry.distance) {
      wEntry.distance = distance;
      wEntry.predecessor = v;
      pq.decrease(w, distance);
    }
  };

  graph.nodes().forEach((v2) => {
    const distance2 = v2 === source ? 0 : Number.POSITIVE_INFINITY;
    results[v2] = { distance: distance2 };
    pq.add(v2, distance2);
  });

  while (pq.size() > 0) {
    v = pq.removeMin() as string;
    vEntry = results[v];
    if (vEntry.distance === Number.POSITIVE_INFINITY) {
      break;
    }
    const res = edgeFn(v);
    if (res !== undefined) {
      res.forEach(updateNeighbors);
    }
  }

  return results;
}

/**
 * This function finds the shortest path from each node to every other reachable node in
 * the graph. It is similar to alg.dijkstra, but instead of returning a single-source
 * array, it returns a mapping of source -> alg.dijksta(g, source, weightFn, edgeFn).
 * Complexity: O(|V| * (|E| + |V|) * log |V|).
 *
 * @param graph graph where to search pathes.
 * @param weightFn function which takes edge e and returns the weight of it. If no weightFn
 * is supplied then each edge is assumed to have a weight of 1. This function throws an
 * Error if any of the traversed edges have a negative edge weight.
 * @param edgeFn function which takes a node v and returns the ids of all edges incident to it
 * for the purposes of shortest path traversal. By default this function uses the graph.outEdges.
 * @returns shortest pathes map.
 */
function dijkstraAll(graph: Graph, weightFn?: IWeightFn, edgeFn?: IEdgeFn): IDijkstraAllResult {
  const res: IDijkstraAllResult = {};
  graph.nodes().forEach((v) => {
    res[v] = dijkstra(graph, v, weightFn, edgeFn);
  });
  return res;
}

export { dijkstra, dijkstraAll };
