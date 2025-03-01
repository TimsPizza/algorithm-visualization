import { TPathFindingAlgorithms } from "../../../types";
import { PathFindingFunction, Grid, Point } from "./types";

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

// 双向广度优先搜索
const bidirectionalBFS: PathFindingFunction = async (
  grid,
  start,
  end,
  drawOp,
  getState,
) => {
  // 如果起点终点相同，直接结束
  if (start.x === end.x && start.y === end.y) {
    await drawOp.markPath([start]);
    return;
  }

  const pointKey = (p: Point) => `${p.x},${p.y}`;

  // 两个队列、两份已访问集合、两份前驱记录
  const forwardQueue: Point[] = [start];
  const backwardQueue: Point[] = [end];
  const forwardVisited = new Set<string>([pointKey(start)]);
  const backwardVisited = new Set<string>([pointKey(end)]);
  const forwardPrev = new Map<string, Point>();
  const backwardPrev = new Map<string, Point>();

  // 构建完整路径
  const buildPath = (meetPoint: Point) => {
    const path: Point[] = [];
    // 从 meetPoint 往回找 start
    let curr: Point | undefined = meetPoint;
    while (curr) {
      path.unshift(curr);
      const key = pointKey(curr);
      curr = forwardPrev.get(key);
    }
    // 从 meetPoint 往回找 end（跳过meetPoint本身）
    curr = backwardPrev.get(pointKey(meetPoint));
    while (curr) {
      path.push(curr);
      curr = backwardPrev.get(pointKey(curr));
    }
    return path;
  };

  // 主循环：两端交替扩展
  while (forwardQueue.length > 0 && backwardQueue.length > 0) {
    if (!getState().isActive) return;

    // 前向搜索一层
    const forwardSize = forwardQueue.length;
    for (let i = 0; i < forwardSize; i++) {
      const current = forwardQueue.shift()!;
      const neighbors = getNeighbors(grid, current);

      for (const neighbor of neighbors) {
        const neighborKey = pointKey(neighbor);
        if (!forwardVisited.has(neighborKey)) {
          forwardVisited.add(neighborKey);
          forwardPrev.set(neighborKey, current);
          await drawOp.visit({ point: neighbor, previousPoint: current });

          // 如果该邻居已被后向搜索访问过，说明找到了相遇点
          if (backwardVisited.has(neighborKey)) {
            const path = buildPath(neighbor);
            await drawOp.markPath(path);
            return;
          }
          forwardQueue.push(neighbor);
        }
      }
    }

    if (!getState().isActive) return;

    // 后向搜索一层
    const backwardSize = backwardQueue.length;
    for (let i = 0; i < backwardSize; i++) {
      const current = backwardQueue.shift()!;
      const neighbors = getNeighbors(grid, current);

      for (const neighbor of neighbors) {
        const neighborKey = pointKey(neighbor);
        if (!backwardVisited.has(neighborKey)) {
          backwardVisited.add(neighborKey);
          backwardPrev.set(neighborKey, current);
          await drawOp.visit({ point: neighbor, previousPoint: current });

          // 如果该邻居已被前向搜索访问过，说明找到了相遇点
          if (forwardVisited.has(neighborKey)) {
            const path = buildPath(neighbor);
            await drawOp.markPath(path);
            return;
          }
          backwardQueue.push(neighbor);
        }
      }
    }
  }
};

// 双向 A* 搜索
const bidirectionalAStar: PathFindingFunction = async (
  grid,
  start,
  end,
  drawOp,
  getState,
) => {
  if (start.x === end.x && start.y === end.y) {
    await drawOp.markPath([start]);
    return;
  }

  const pointKey = (p: Point) => `${p.x},${p.y}`;

  // 前向和后向的 g、f 值记录
  const forwardG = new Map<string, number>();
  const backwardG = new Map<string, number>();
  const forwardF = new Map<string, number>();
  const backwardF = new Map<string, number>();

  const forwardPrev = new Map<string, Point>();
  const backwardPrev = new Map<string, Point>();

  const forwardVisited = new Set<string>();
  const backwardVisited = new Set<string>();

  // 初始化起点和终点
  forwardG.set(pointKey(start), 0);
  backwardG.set(pointKey(end), 0);
  forwardF.set(pointKey(start), manhattanDistance(start, end));
  backwardF.set(pointKey(end), manhattanDistance(end, start));

  let forwardCurrent = start;
  let backwardCurrent = end;

  // 构建路径
  const buildPath = (meetPoint: Point) => {
    const path: Point[] = [];
    let curr: Point | undefined = meetPoint;
    while (curr) {
      path.unshift(curr);
      curr = forwardPrev.get(pointKey(curr));
    }
    curr = backwardPrev.get(pointKey(meetPoint));
    while (curr) {
      path.push(curr);
      curr = backwardPrev.get(pointKey(curr));
    }
    return path;
  };

  // 选择下一个要访问的节点
  const getNextNode = (
    fScore: Map<string, number>,
    visited: Set<string>,
    grid: Grid,
  ): Point | null => {
    let minF = Infinity;
    let next: Point | null = null;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const key = pointKey({ x, y });
        if (!visited.has(key)) {
          const f = fScore.get(key) ?? Infinity;
          if (f < minF) {
            minF = f;
            next = { x, y };
          }
        }
      }
    }
    return next;
  };

  await drawOp.visit({ point: start, previousPoint: null });
  await drawOp.visit({ point: end, previousPoint: null });

  while (forwardCurrent && backwardCurrent) {
    if (!getState().isActive) return;

    // 前向搜索
    const forwardKey = pointKey(forwardCurrent);
    forwardVisited.add(forwardKey);

    const forwardNeighbors = getNeighbors(grid, forwardCurrent);
    for (const neighbor of forwardNeighbors) {
      const neighborKey = pointKey(neighbor);
      if (forwardVisited.has(neighborKey)) continue;

      const tentativeG = (forwardG.get(forwardKey) ?? 0) + 1;
      if (tentativeG < (forwardG.get(neighborKey) ?? Infinity)) {
        forwardPrev.set(neighborKey, forwardCurrent);
        forwardG.set(neighborKey, tentativeG);
        forwardF.set(
          neighborKey,
          tentativeG + manhattanDistance(neighbor, end),
        );
        await drawOp.visit({ point: neighbor, previousPoint: forwardCurrent });

        if (backwardVisited.has(neighborKey)) {
          // 找到相遇点，返回路径
          const path = buildPath(neighbor);
          await drawOp.markPath(path);
          return;
        }
      }
    }

    // 后向搜索
    const backwardKey = pointKey(backwardCurrent);
    backwardVisited.add(backwardKey);

    const backwardNeighbors = getNeighbors(grid, backwardCurrent);
    for (const neighbor of backwardNeighbors) {
      const neighborKey = pointKey(neighbor);
      if (backwardVisited.has(neighborKey)) continue;

      const tentativeG = (backwardG.get(backwardKey) ?? 0) + 1;
      if (tentativeG < (backwardG.get(neighborKey) ?? Infinity)) {
        backwardPrev.set(neighborKey, backwardCurrent);
        backwardG.set(neighborKey, tentativeG);
        backwardF.set(
          neighborKey,
          tentativeG + manhattanDistance(neighbor, start),
        );
        await drawOp.visit({ point: neighbor, previousPoint: backwardCurrent });

        if (forwardVisited.has(neighborKey)) {
          // 找到相遇点，返回路径
          const path = buildPath(neighbor);
          await drawOp.markPath(path);
          return;
        }
      }
    }

    // 选择下一个要访问的节点
    forwardCurrent = getNextNode(forwardF, forwardVisited, grid)!;
    backwardCurrent = getNextNode(backwardF, backwardVisited, grid)!;
  }
};

// 导出所有算法
export const pathFindingAlgorithms: Record<
  TPathFindingAlgorithms,
  PathFindingFunction
> = {
  Dijkstra: dijkstra,
  "A-Star": aStar,
  BreadthFirst: breadthFirst,
  DepthFirst: depthFirst,
  GreedyBestFirst: greedyBestFirst,
  "Bidirectional-BFS": bidirectionalBFS,
  "Bidirectional-A*": bidirectionalAStar,
};

export const PATH_FINDING_ALGORITHMS: Array<TPathFindingAlgorithms> = [
  "Dijkstra",
  "A-Star",
  "BreadthFirst",
  "DepthFirst",
  "GreedyBestFirst",
  "Bidirectional-BFS",
  "Bidirectional-A*",
];
