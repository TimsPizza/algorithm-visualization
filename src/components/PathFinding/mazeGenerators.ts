import { Grid, Point } from "./algorithms/types";

export type MazeGenerator = (grid: Grid, drawOp: (point: Point, isWall: boolean) => Promise<void>) => Promise<void>;

// 递归分割生成迷宫
export const recursiveDivision: MazeGenerator = async (grid, drawOp) => {
  const width = grid[0].length;
  const height = grid.length;

  const divide = async (x: number, y: number, w: number, h: number, isHorizontal: boolean) => {
    if (w < 2 || h < 2) return;

    // 确定墙的位置
    const wallX = x + (isHorizontal ? 0 : Math.floor(Math.random() * (w - 1)));
    const wallY = y + (isHorizontal ? Math.floor(Math.random() * (h - 1)) : 0);

    // 确定通道位置
    const passageX = wallX + (isHorizontal ? Math.floor(Math.random() * w) : 0);
    const passageY = wallY + (isHorizontal ? 0 : Math.floor(Math.random() * h));

    // 绘制墙
    const length = isHorizontal ? w : h;
    for (let i = 0; i < length; i++) {
      const currentX = isHorizontal ? x + i : wallX;
      const currentY = isHorizontal ? wallY : y + i;
      
      if (currentX === passageX && currentY === passageY) continue;
      
      await drawOp({ x: currentX, y: currentY }, true);
    }

    // 递归划分子区域
    if (isHorizontal) {
      await divide(x, y, w, wallY - y, !isHorizontal);
      await divide(x, wallY + 1, w, h - (wallY - y + 1), !isHorizontal);
    } else {
      await divide(x, y, wallX - x, h, !isHorizontal);
      await divide(wallX + 1, y, w - (wallX - x + 1), h, !isHorizontal);
    }
  };

  // 从空白网格开始生成迷宫
  await divide(0, 0, width, height, Math.random() < 0.5);
};

// 随机密度生成墙壁
export const randomDensity: MazeGenerator = async (grid, drawOp) => {
  const width = grid[0].length;
  const height = grid.length;
  const density = 0.3; // 30% 的格子会变成墙

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (Math.random() < density) {
        await drawOp({ x, y }, true);
      }
    }
  }
};

export const MAZE_GENERATORS: Record<string, MazeGenerator> = {
  "Recursive Division": recursiveDivision,
  "Random Density": randomDensity,
};

export const MAZE_TYPES = Object.keys(MAZE_GENERATORS);
