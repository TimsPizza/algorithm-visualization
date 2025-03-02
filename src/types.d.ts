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

export type TAlgorithmCategories = "Path Finding" | "Binary Tree" | "Sorting";

export type TAlgorithms =
  | TPathFindingAlgorithms
  | TBiTreeAlgorithms
  | TSortingAlgorithms
  | TGraphTraversalAlgorithms;

export type TPathFindingAlgorithms =
  | "Dijkstra"
  | "A-Star"
  | "GreedyBestFirst"
  | "BreadthFirst"
  | "DepthFirst"
  | "Bidirectional-BFS"
  | "Bidirectional-A*";

export type TBiTreeAlgorithms =
  | "InOrder"
  | "PreOrder"
  | "PostOrder"
  | "LevelOrder";

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
