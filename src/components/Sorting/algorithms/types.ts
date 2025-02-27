// 排序操作的可视化回调函数类型
export interface DrawOperations {
  cmp: (i: number, j: number) => void;      // 比较两个元素
  swap: (i: number, j: number) => void;     // 交换两个元素
  update: (i: number, value: number) => void; // 更新单个元素
  markSorted: () => void;                   // 标记排序完成
}

// 排序可视化操作的异步包装类型
export interface DrawOperationsWrapped {
  cmp: (i: number, j: number) => Promise<void>;    // 比较两个元素
  swap: (i: number, j: number) => Promise<void>;   // 交换两个元素
  update: (i: number, value: number) => Promise<void>; // 更新单个元素
  markSorted: () => Promise<void>;                 // 标记排序完成
}

// 排序算法状态
export type SortingState = {
  isActive: boolean;     // 排序是否正在进行
  isPaused: boolean;      // 是否暂停
  isCancelled: boolean;   // 是否被取消
};

// 定义排序算法的类型
export type SortFunction = (
  array: number[],
  drawOp: DrawOperationsWrapped,
  getState: () => SortingState
) => Promise<void>;

// 排序控制器接口
export interface SortController {
  array: number[];
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  getState: () => SortingState;
  updateSpeedLevel: (speed: number) => void;
  updateArray: (array: number[]) => void;
}
