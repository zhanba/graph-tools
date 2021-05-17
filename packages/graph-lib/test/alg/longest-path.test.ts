import { longestPath } from '../../src/alg/longest-path';
import { Graph } from '../../src/graph';

describe('alg.longest-path', () => {
  it('directed graph', () => {
    const graph = new Graph({ directed: true });
    graph.setEdge('a', 'b', 4);
    graph.setEdge('a', 'c', 1);
    graph.setEdge('c', 'd', 2);
    expect(longestPath(graph)).toEqual({
      b: { distance: 4, predecessor: 'a' },
      c: { distance: 1, predecessor: 'a' },
      d: { distance: 3, predecessor: 'c' },
    });
  });

  it('directed graph with default weight', () => {
    const graph = new Graph({ directed: true });
    graph.setEdge('a', 'b');
    graph.setEdge('a', 'c');
    graph.setEdge('c', 'd');
    expect(longestPath(graph)).toEqual({
      b: { distance: 1, predecessor: 'a' },
      c: { distance: 1, predecessor: 'a' },
      d: { distance: 2, predecessor: 'c' },
    });
  });

  it('throw error if graph id undirected', () => {
    const graph = new Graph({ directed: false });
    graph.setEdge('a', 'b', 4);
    graph.setEdge('a', 'c', 1);
    graph.setEdge('c', 'd', 2);
    expect(() => longestPath(graph)).toThrow();
  });

  it('throw error if weight is negative', () => {
    const graph = new Graph({ directed: true });
    graph.setEdge('a', 'b', 4);
    graph.setEdge('a', 'c', -1);
    graph.setEdge('c', 'd', 2);
    expect(() => longestPath(graph)).toThrow();
  });
});
