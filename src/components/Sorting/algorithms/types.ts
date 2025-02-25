// 视图层提供的原始绘图操作（同步）
export type DrawOperations = {
  cmp: (i: number, j: number) => void;      // 比较两个元素
  swap: (i: number, j: number) => void;     // 交换两个元素
  markSorted: () => void;                   // 标记排序完成
};

// 控制器包装后提供给算法的绘图操作（异步）
export type DrawOperationsWrapped = {
  cmp: (i: number, j: number) => Promise<void>;    // 比较两个元素
  swap: (i: number, j: number) => Promise<void>;   // 交换两个元素
  markSorted: () => Promise<void>;                 // 标记排序完成
};

// 排序算法实现的函数类型
export type SortFunction = (
  array: number[],
  drawOp: DrawOperationsWrapped,  // 使用包装后的异步操作
  isSorting: () => boolean
) => Promise<void>;

// 排序控制器类型
export type SortController = {
  array: number[];
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  isSorting: () => boolean;
  updateSpeedLevel: (speed: number) => void;
  updateArray: (array: number[]) => void;
};
