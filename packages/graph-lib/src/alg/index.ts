import { components } from "./components";
import { dfs } from "./dfs";
import { dijkstra, dijkstraAll } from "./dijkstra";
import { findCycles } from "./find-cycles";
import { floydWarshall } from "./floyd-warshall";
import { isAcyclic } from "./is-acyclic";
import { postorder } from "./postorder";
import { preorder } from "./preorder";
import { prim } from "./prim";
import { tarjan } from "./tarjan";
import { topsort } from "./topsort";

const alg = {
  components,
  dfs,
  dijkstra,
  dijkstraAll,
  findCycles,
  floydWarshall,
  isAcyclic,
  postorder,
  preorder,
  prim,
  tarjan,
  topsort,
};

export { alg };
