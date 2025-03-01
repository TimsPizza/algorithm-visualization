import { CellState, Point } from "../algorithms/types";
import { PathFindingVisualizer, PathFindingVisualizerContext } from "./types";

// 辅助函数：绘制单个单元格
const drawCell = (
  ctx: CanvasRenderingContext2D,
  cell: CellState,
  x: number,
  y: number,
  cellSize: number,
  colors: PathFindingVisualizerContext["colors"],
) => {
  // 填充单元格
  ctx.fillStyle = colors.empty;
  if (cell.isWall) ctx.fillStyle = colors.wall;
  if (cell.isVisited) ctx.fillStyle = colors.visited;
  if (cell.isPath) ctx.fillStyle = colors.path;
  if (cell.isStart) ctx.fillStyle = colors.start;
  if (cell.isEnd) ctx.fillStyle = colors.end;

  ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

  // 绘制网格线
  ctx.strokeStyle = "#e2e8f0"; // 浅灰色网格线
  ctx.strokeRect(x, y, cellSize, cellSize);
};

export const GridVisualizer: PathFindingVisualizer = {
  // 完整绘制网格
  draw: ({
    ctx,
    width,
    height,
    grid,
    cellSize,
    colors,
  }: PathFindingVisualizerContext) => {
    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格中的所有单元格
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        const x = j * cellSize;
        const y = i * cellSize;
        drawCell(ctx, cell, x, y, cellSize, colors);
      });
    });
  },

  // 更新单个单元格
  updateCell: (
    ctx: CanvasRenderingContext2D,
    cell: CellState,
    x: number,
    y: number,
    cellSize: number,
    colors: PathFindingVisualizerContext["colors"],
  ) => {
    const pixelX = x * cellSize;
    const pixelY = y * cellSize;
    drawCell(ctx, cell, pixelX, pixelY, cellSize, colors);
  },

  // 将画布坐标转换为网格坐标
  getGridPosition: (x: number, y: number, cellSize: number): Point | null => {
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    return { x: gridX, y: gridY };
  },

  // 判断点击是否在网格范围内
  isValidGridPosition: (
    x: number,
    y: number,
    width: number,
    height: number,
  ): boolean => {
    return x >= 0 && x < width && y >= 0 && y < height;
  },
};
