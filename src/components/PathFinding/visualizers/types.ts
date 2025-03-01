import { CellState, Grid, Point } from "../algorithms/types";

// 绘制上下文类型
export interface PathFindingVisualizerContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  grid: Grid;
  cellSize: number;
  colors: {
    empty: string;      // 空白格子颜色
    wall: string;       // 墙壁颜色
    start: string;      // 起点颜色
    end: string;        // 终点颜色
    visited: string;    // 已访问节点颜色
    path: string;       // 最终路径颜色
    current: string;    // 当前访问节点颜色
  };
}

// 可视化器接口
export interface PathFindingVisualizer {
  // 完整绘制网格
  draw: (context: PathFindingVisualizerContext) => void;
  // 更新单个单元格
  updateCell: (
    ctx: CanvasRenderingContext2D,
    cell: CellState, 
    x: number, 
    y: number, 
    cellSize: number,
    colors: PathFindingVisualizerContext['colors']
  ) => void;
  // 辅助方法：将画布坐标转换为网格坐标
  getGridPosition: (x: number, y: number, cellSize: number) => Point | null;
  // 辅助方法：判断点击是否在网格范围内
  isValidGridPosition: (x: number, y: number, width: number, height: number) => boolean;
}
