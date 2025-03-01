interface IGlobalConfigContext {
  algorithmCategory: TAlgorithmCategories;
  algorithm: TAlgorithms;
  animationSpeed: number;
  state: "ready" | "running" | "paused" | "finished";
  arraySize: number;
  setAlgorithmCategory: (category: TAlgorithmCategories) => void;
  setAlgorithm: (algorithm: TAlgorithms) => void;
  setAnimationSpeed: (speed: number) => void;
  setExecutionState: (
    state: "ready" | "running" | "paused" | "finished",
  ) => void;
  setArraySize: (size: number) => void;
}

export type TAlgorithmCategories =
  | "Path Finding"
  | "Bi-Tree Traversal"
  | "Bi-Search Tree"
  | "Sorting"
  | "Graph Traversal";

export type TAlgorithms =
  | TPathFindingAlgorithms
  | TBiTreeTraversalAlgorithms
  | TBiSearchTreeAlgorithms
  | TSortingAlgorithms
  | TGraphTraversalAlgorithms;

export type TPathFindingAlgorithms =
  | "Dijkstra"
  | "A-Star"
  | "GreedyBestFirst"
  | "BreadthFirst"
  | "DepthFirst"
  | "Bidirectional-BFS"
  | "Bidirectional-A*"

export type TBiTreeTraversalAlgorithms = "InOrder" | "PreOrder" | "PostOrder";

export type TBiSearchTreeAlgorithms = "Insert" | "Search" | "Delete";

export type TSortingAlgorithms =
  | "BubbleSort"
  | "SelectionSort"
  | "InsertionSort"
  | "ShellSort"
  | "MergeSort"
  | "QuickSort"
  | "HeapSort"
  | "RadixSort"
  | "CocktailSort"
  | "CountingSort"
  | "BucketSort"
  | "CombSort";

export type TGraphTraversalAlgorithms = "BreadthFirst" | "DepthFirst";
