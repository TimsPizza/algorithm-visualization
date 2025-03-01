import { PathFindingFunction, Grid, Point, VisitRecord } from "./types";

// 辅助函数：获取节点的邻居
const getNeighbors = (grid: Grid, point: Point): Point[] => {
  const neighbors: Point[] = [];
  const directions = [
    [-1, 0], // 上
    [1, 0], // 下
    [0, -1], // 左
    [0, 1], // 右
  ];

  for (const [dy, dx] of directions) {
    const newY = point.y + dy;
    const newX = point.x + dx;

    if (
      newY >= 0 &&
      newY < grid.length &&
      newX >= 0 &&
      newX < grid[0].length &&
      !grid[newY][newX].isWall
    ) {
      neighbors.push({ x: newX, y: newY });
    }
  }

  return neighbors;
};

// 曼哈顿距离作为启发式函数
const manhattanDistance = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Dijkstra算法
const dijkstra: PathFindingFunction = async (
  grid,
  start,
  end,
  drawOp,
  getState,
) => {
  const distances = new Map<string, number>();
  const previousNodes = new Map<string, Point>();
  const visited = new Set<string>();
  const pointKey = (p: Point) => `${p.x},${p.y}`;

  // 初始化
  grid.forEach((row, y) => {
    row.forEach((_, x) => {
      const key = pointKey({ x, y });
      distances.set(key, Infinity);
    });
  });
  distances.set(pointKey(start), 0);
  await drawOp.visit({ point: start, previousPoint: null });

  let current = start;
  while (current && !visited.has(pointKey(end))) {
    if (!getState().isActive) return;

    const currentKey = pointKey(current);
    visited.add(currentKey);

    // 检查所有邻居
    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const neighborKey = pointKey(neighbor);
      if (visited.has(neighborKey)) continue;

      const newDist = distances.get(currentKey)! + 1;
      const oldDist = distances.get(neighborKey) || Infinity;

      if (newDist < oldDist) {
        distances.set(neighborKey, newDist);
        previousNodes.set(neighborKey, current);
        await drawOp.visit({ point: neighbor, previousPoint: current });
      }
    }

    // 找到下一个最近的未访问节点
    let minDistance = Infinity;
    let next: Point | null = null;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const key = pointKey({ x, y });
        if (!visited.has(key)) {
          const dist = distances.get(key) || Infinity;
          if (dist < minDistance) {
            minDistance = dist;
            next = { x, y };
          }
        }
      }
    }

    current = next!;
  }

  // 如果找到终点，构建并标记路径
  if (visited.has(pointKey(end))) {
    const path: Point[] = [];
    let curr = end;
    while (curr) {
      path.unshift(curr);
      const prev = previousNodes.get(pointKey(curr));
      if (!prev) break;
      curr = prev;
    }
    await drawOp.markPath(path);
  }
};

// A*算法
const aStar: PathFindingFunction = async (
  grid,
  start,
  end,
  drawOp,
  getState,
) => {
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const previousNodes = new Map<string, Point>();
  const visited = new Set<string>();
  const pointKey = (p: Point) => `${p.x},${p.y}`;

  // 初始化
  gScore.set(pointKey(start), 0);
  fScore.set(pointKey(start), manhattanDistance(start, end));
  await drawOp.visit({ point: start, previousPoint: null });

  let current = start;
  while (current && !visited.has(pointKey(end))) {
    if (!getState().isActive) return;

    const currentKey = pointKey(current);
    visited.add(currentKey);

    if (current.x === end.x && current.y === end.y) {
      const path: Point[] = [];
      let curr = end;
      while (curr) {
        path.unshift(curr);
        const prev = previousNodes.get(pointKey(curr));
        if (!prev) break;
        curr = prev;
      }
      await drawOp.markPath(path);
      return;
    }

    // 检查邻居节点
    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const neighborKey = pointKey(neighbor);
      if (visited.has(neighborKey)) continue;

      const tentativeG = (gScore.get(currentKey) || 0) + 1;
      const oldG = gScore.get(neighborKey) || Infinity;

      if (tentativeG < oldG) {
        previousNodes.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + manhattanDistance(neighbor, end));
        await drawOp.visit({ point: neighbor, previousPoint: current });
      }
    }

    // 找到下一个f值最小的未访问节点
    let minF = Infinity;
    let next: Point | null = null;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const key = pointKey({ x, y });
        if (!visited.has(key)) {
          const f = fScore.get(key) || Infinity;
          if (f < minF) {
            minF = f;
            next = { x, y };
          }
        }
      }
    }

    current = next!;
  }
};

// 广度优先搜索
const breadthFirst: PathFindingFunction = async (
  grid,
  start,
  end,
  drawOp,
  getState,
) => {
  const queue: Point[] = [start];
  const visited = new Set<string>();
  const previousNodes = new Map<string, Point>();
  const pointKey = (p: Point) => `${p.x},${p.y}`;

  visited.add(pointKey(start));
  await drawOp.visit({ point: start, previousPoint: null });

  while (queue.length > 0) {
    if (!getState().isActive) return;

    const current = queue.shift()!;

    if (current.x === end.x && current.y === end.y) {
      const path: Point[] = [];
      let curr = end;
      while (curr) {
        path.unshift(curr);
        const prev = previousNodes.get(pointKey(curr));
        if (!prev) break;
        curr = prev;
      }
      await drawOp.markPath(path);
      return;
    }

    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const neighborKey = pointKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        previousNodes.set(neighborKey, current);
        queue.push(neighbor);
        await drawOp.visit({ point: neighbor, previousPoint: current });
      }
    }
  }
};

// 深度优先搜索
const depthFirst: PathFindingFunction = async (
  grid,
  start,
  end,
  drawOp,
  getState,
) => {
  const stack: Point[] = [start];
  const visited = new Set<string>();
  const previousNodes = new Map<string, Point>();
  const pointKey = (p: Point) => `${p.x},${p.y}`;

  visited.add(pointKey(start));
  await drawOp.visit({ point: start, previousPoint: null });

  while (stack.length > 0) {
    if (!getState().isActive) return;

    const current = stack.pop()!;

    if (current.x === end.x && current.y === end.y) {
      const path: Point[] = [];
      let curr = end;
      while (curr) {
        path.unshift(curr);
        const prev = previousNodes.get(pointKey(curr));
        if (!prev) break;
        curr = prev;
      }
      await drawOp.markPath(path);
      return;
    }

    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const neighborKey = pointKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        previousNodes.set(neighborKey, current);
        stack.push(neighbor);
        await drawOp.visit({ point: neighbor, previousPoint: current });
      }
    }
  }
};

// 贪婪最佳优先搜索
const greedyBestFirst: PathFindingFunction = async (
  grid,
  start,
  end,
  drawOp,
  getState,
) => {
  const hScore = new Map<string, number>();
  const previousNodes = new Map<string, Point>();
  const visited = new Set<string>();
  const pointKey = (p: Point) => `${p.x},${p.y}`;

  hScore.set(pointKey(start), manhattanDistance(start, end));
  await drawOp.visit({ point: start, previousPoint: null });

  let current = start;
  while (current) {
    if (!getState().isActive) return;

    const currentKey = pointKey(current);
    visited.add(currentKey);

    // 检查是否到达终点
    if (current.x === end.x && current.y === end.y) {
      const path: Point[] = [];
      let curr = end;
      while (curr) {
        path.unshift(curr);
        const prev = previousNodes.get(pointKey(curr));
        if (!prev) break;
        curr = prev;
      }
      await drawOp.markPath(path);
      return;
    }

    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const neighborKey = pointKey(neighbor);
      if (visited.has(neighborKey)) continue;

      if (!hScore.has(neighborKey)) {
        hScore.set(neighborKey, manhattanDistance(neighbor, end));
        previousNodes.set(neighborKey, current);
        await drawOp.visit({ point: neighbor, previousPoint: current });
      }
    }

    // 找到下一个h值最小的未访问节点
    let minH = Infinity;
    let next: Point | null = null;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        const key = pointKey({ x: c, y: r });
        if (!visited.has(key)) {
          const h = hScore.get(key) ?? Infinity;
          if (h < minH) {
            minH = h;
            next = { x: c, y: r };
          }
        }
      }
    }

    current = next!;
  }
};

// 导出所有算法
export const pathFindingAlgorithms: Record<string, PathFindingFunction> = {
  Dijkstra: dijkstra,
  "A-Star": aStar,
  BreadthFirst: breadthFirst,
  DepthFirst: depthFirst,
  GreedyBestFirst: greedyBestFirst,
};
