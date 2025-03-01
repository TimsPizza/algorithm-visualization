// 网格单元格状态
export type CellState = {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;

};

// 网格类型
export type Grid = CellState[][];

// 坐标点类型
export type Point = {
  x: number;
  y: number;
};

// 访问记录类型（View层使用）
export type VisitRecord = {
  point: Point;
  previousPoint: Point | null;
};

// 绘图操作接口
export interface DrawOperations {
  visit: (record: VisitRecord) => void;    // 标记访问过的节点，包含前驱节点信息
  markPath: (point: Point) => void;     // 标记最终路径
  updateDistance: (point: Point, distance: number) => void;  // 更新节点距离
  reset: () => void;                       // 重置绘图状态
}

// 异步绘图操作接口
export interface DrawOperationsWrapped {
  visit: (record: VisitRecord) => Promise<void>;
  markPath: (points: Point[]) => Promise<void>;
  updateDistance: (point: Point, distance: number) => Promise<void>;
  reset: () => Promise<void>;
}

// 算法状态
export type PathFindingState = {
  isActive: boolean;      // 算法是否正在执行
  isPaused: boolean;      // 是否暂停
  isCancelled: boolean;   // 是否被取消
  isFinished: boolean;    // 是否完成
};

// 寻路算法函数类型
export type PathFindingFunction = (
  grid: Grid,
  start: Point,
  end: Point,
  drawOp: DrawOperationsWrapped,
  getState: () => PathFindingState
) => Promise<void>;

// 寻路控制器接口
export interface PathFindingController {
  grid: Grid;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  getState: () => PathFindingState;
  updateSpeedLevel: (speed: number) => void;
  updateGrid: (grid: Grid) => void;
  updateStartPoint: (point: Point) => void;
  updateEndPoint: (point: Point) => void;
  toggleWall: (point: Point) => void;
}
