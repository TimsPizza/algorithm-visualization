import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { generateMaze, generateRandomWalls } from "./mazeGenerators";
import { useGlobalConfig } from "../../context/GlobalConfigContext";
import { PathFindingController } from "./algorithms/controller";
import { GridVisualizer } from "./visualizers/implementations";
import {
  CellState,
  Grid,
  Point,
  DrawOperations,
  VisitRecord,
} from "./algorithms/types";
import { TPathFindingAlgorithms } from "../../types";
import { pathFindingAlgorithms } from "./algorithms/implementations";

// 常量定义
const COLORS = {
  EMPTY: "#ffffff", // 空白格子
  WALL: "#1a202c", // 墙壁
  START: "#48bb78", // 起点
  END: "#f56565", // 终点
  VISITED: "#90cdf4", // 已访问
  PATH: "#fbd38d", // 最终路径
  CURRENT: "#667eea", // 当前访问节点
} as const;

const COLS = 144;
const ROWS = 72;
const CELL_SIZE = 20; // 固定单元格大小为16像素

// 点位相等判断
const isSamePoint = (p1: Point, p2: Point) => p1.x === p2.x && p1.y === p2.y;

export const PathFinding: React.FC = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const controllerRef = useRef<PathFindingController | null>(null);
  const lastVisitedCellRef = useRef<Point | null>(null);
  const isWallDrawingRef = useRef<boolean | null>(null);
  const visitedRef = useRef<Set<string>>(new Set());
  const pathRef = useRef<Set<string>>(new Set());
  const startPointRef = useRef<Point>({ x: 12, y: 12 });
  const endPointRef = useRef<Point>({ x: 66, y: 12 });
  const wallsRef = useRef<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  const draggedItemRef = useRef<"start" | "end" | "wall" | null>(null);
  const isGeneratingRef = useRef(false);

  // Global Config
  const { algorithm, animationSpeed, state, setExecutionState } =
    useGlobalConfig();

  // 固定单元格大小
  const getCellSize = useCallback(() => CELL_SIZE, []);

  // 获取单元格状态 - 从各个状态源组合当前状态
  const getCellState = useCallback((point: Point): CellState => {
    const key = `${point.x},${point.y}`;
    return {
      x: point.x,
      y: point.y,
      isWall: wallsRef.current.has(key),
      isStart: isSamePoint(point, startPointRef.current),
      isEnd: isSamePoint(point, endPointRef.current),
      isVisited: visitedRef.current.has(key),
      isPath: pathRef.current.has(key),
    };
  }, []);

  // 更新控制器网格
  const updateControllerGrid = useCallback(() => {
    if (!controllerRef.current) return;
    const grid = Array.from({ length: ROWS }, (_, i) =>
      Array.from({ length: COLS }, (_, j) => getCellState({ x: j, y: i })),
    );
    controllerRef.current.updateGrid(grid);
  }, [getCellState]);

  // 重绘单个单元格
  const redrawCell = useCallback(
    (point: Point) => {
      if (!contextRef.current || !canvasRef.current) return;

      const cellSize = getCellSize();
      const cell = getCellState(point);

      GridVisualizer.updateCell(
        contextRef.current,
        cell,
        point.x,
        point.y,
        cellSize,
        {
          empty: COLORS.EMPTY,
          wall: COLORS.WALL,
          start: COLORS.START,
          end: COLORS.END,
          visited: COLORS.VISITED,
          path: COLORS.PATH,
          current: COLORS.CURRENT,
        },
      );
    },
    [getCellState, getCellSize],
  );

  // 绘制操作 - 直接操作canvas，不触发状态更新
  const drawOperations = useMemo<DrawOperations>(
    () => ({
      visit: async (record: VisitRecord) => {
        visitedRef.current.add(`${record.point.x},${record.point.y}`);
        redrawCell(record.point);
      },
      markPath: async (point: Point) => {
        pathRef.current.add(`${point.x},${point.y}`);
        redrawCell(point);
      },
      updateDistance: async () => {},
      reset: async () => {
        visitedRef.current.clear();
        pathRef.current.clear();
      },
    }),
    [redrawCell],
  );

  // 完整重绘
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 更新画布尺寸
    const dpr = window.devicePixelRatio || 1;
    const cellSize = getCellSize();
    const totalWidth = COLS * cellSize + COLS;
    const totalHeight = ROWS * cellSize + ROWS;

    // Set canvas size to exactly fit the grid
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;

    ctx.scale(dpr, dpr);

    // Set canvas style dimensions
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    contextRef.current = ctx;

    // 构建当前网格状态
    const grid: Grid = Array.from({ length: ROWS }, (_, i) =>
      Array.from({ length: COLS }, (_, j) => getCellState({ x: j, y: i })),
    );

    GridVisualizer.draw({
      ctx,
      width: totalWidth,
      height: totalHeight,
      grid,
      cellSize,
      colors: {
        empty: COLORS.EMPTY,
        wall: COLORS.WALL,
        start: COLORS.START,
        end: COLORS.END,
        visited: COLORS.VISITED,
        path: COLORS.PATH,
        current: COLORS.CURRENT,
      },
    });
  }, [getCellSize, getCellState]);

  // 处理墙壁绘制
  // Bresenham's line algorithm for interpolation
  const getPointsOnLine = (p1: Point, p2: Point): Point[] => {
    const points: Point[] = [];
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const sx = p1.x < p2.x ? 1 : -1;
    const sy = p1.y < p2.y ? 1 : -1;
    let err = dx - dy;

    let x = p1.x;
    let y = p1.y;

    while (true) {
      points.push({ x, y });
      if (x === p2.x && y === p2.y) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    return points;
  };

  const handleWallDrawing = useCallback(
    (point: Point) => {
      if (!GridVisualizer.isValidGridPosition(point.x, point.y, COLS, ROWS))
        return;

      // Initialize wall drawing mode if needed
      if (isWallDrawingRef.current === null) {
        isWallDrawingRef.current = !wallsRef.current.has(
          `${point.x},${point.y}`,
        );
      }

      // Get points to draw
      const points = lastVisitedCellRef.current
        ? getPointsOnLine(lastVisitedCellRef.current, point)
        : [point];

      // Update walls for all points in the line
      points.forEach((p) => {
        const key = `${p.x},${p.y}`;
        if (isWallDrawingRef.current) {
          wallsRef.current.add(key);
        } else {
          wallsRef.current.delete(key);
        }
        redrawCell(p);
      });
      // Update the controller's grid after all wall changes
      updateControllerGrid();

      lastVisitedCellRef.current = point;
    },
    [redrawCell],
  );

  // 处理网格点击/拖动
  const handleGridInteraction = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !controllerRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const containerDiv = canvas.parentElement;
      if (!containerDiv) return;

      const x = event.clientX - rect.left + containerDiv.scrollLeft;
      const y = event.clientY - rect.top + containerDiv.scrollTop;
      const cellSize = getCellSize();

      const gridPos = GridVisualizer.getGridPosition(x, y, cellSize);
      if (
        !gridPos ||
        !GridVisualizer.isValidGridPosition(gridPos.x, gridPos.y, COLS, ROWS)
      )
        return;

      // 检查是否点击了起点或终点
      if (!isDraggingRef.current) {
        if (isSamePoint(gridPos, startPointRef.current)) {
          draggedItemRef.current = "start";
          isDraggingRef.current = true;
          return;
        }
        if (isSamePoint(gridPos, endPointRef.current)) {
          draggedItemRef.current = "end";
          isDraggingRef.current = true;
          return;
        }
        // 如果点击其他位置，开始绘制墙壁
        draggedItemRef.current = "wall";
        isDraggingRef.current = true;
        handleWallDrawing(gridPos);
      } else if (draggedItemRef.current === "start") {
        if (getCellState(gridPos).isWall || getCellState(gridPos).isEnd) return;
        const oldPoint = startPointRef.current;
        controllerRef.current.updateStartPoint(gridPos);
        startPointRef.current = gridPos;
        redrawCell(oldPoint);
        redrawCell(gridPos);
      } else if (draggedItemRef.current === "end") {
        if (getCellState(gridPos).isWall || getCellState(gridPos).isStart)
          return;
        controllerRef.current.updateEndPoint(gridPos);
        const oldPoint = endPointRef.current;
        endPointRef.current = gridPos;
        redrawCell(oldPoint);
        redrawCell(gridPos);
      } else if (draggedItemRef.current === "wall") {
        handleWallDrawing(gridPos);
      }
    },
    [getCellSize, handleWallDrawing, redrawCell],
  );

  // 初始化控制器
  useEffect(() => {
    const selectedAlgorithm =
      pathFindingAlgorithms[algorithm as TPathFindingAlgorithms];
    const grid = Array.from({ length: ROWS }, (_, i) =>
      Array.from({ length: COLS }, (_, j) => getCellState({ x: j, y: i })),
    );

    controllerRef.current = new PathFindingController(
      grid,
      startPointRef.current,
      endPointRef.current,
      selectedAlgorithm,
      drawOperations,
      animationSpeed,
    );

    return () => {
      if (controllerRef.current) {
        controllerRef.current.reset();
      }
    };
  }, [algorithm, animationSpeed, getCellState]);

  // 初始化画布
  useEffect(() => {
    draw();
  }, [draw]);

  // 处理状态变化
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;

    switch (state) {
      case "running":
        if (controller.getState().isActive && controller.getState().isPaused) {
          controller.resume();
          return;
        }
        controller.start().then(() => {
          if (controller.getState().isFinished) {
            setExecutionState("finished");
          }
        });
        break;
      case "paused":
        controller.pause();
        break;
      case "ready":
        controller.reset();
        drawOperations.reset();
        visitedRef.current.clear();
        pathRef.current.clear();
        draw();
        break;
      case "finished":
        break;
    }
  }, [state, setExecutionState, draw]);

  // 处理速度变化
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateSpeedLevel(animationSpeed);
    }
  }, [animationSpeed]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      draw();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="sticky left-4 top-4 z-10 flex gap-2 rounded-lg bg-white/80 p-2 shadow backdrop-blur">
        <button
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
          onClick={() => {
            if (isGeneratingRef.current) return;
            isGeneratingRef.current = true;

            // Generate new maze
            const walls = generateMaze(
              COLS,
              ROWS,
              startPointRef.current,
              endPointRef.current,
            );
            const newWalls = new Set(walls.map((w) => `${w.x},${w.y}`));
            wallsRef.current = newWalls;
            updateControllerGrid();
            draw();
            isGeneratingRef.current = false;
          }}
          disabled={isGeneratingRef.current}
        >
          Generate Maze
        </button>
        <button
          className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
          onClick={() => {
            if (isGeneratingRef.current) return;
            isGeneratingRef.current = true;

            // Generate random walls
            const walls = generateRandomWalls(
              COLS,
              ROWS,
              startPointRef.current,
              endPointRef.current,
              0.3,
            );
            const newWalls = new Set(walls.map((w) => `${w.x},${w.y}`));
            wallsRef.current = newWalls;
            updateControllerGrid();
            draw();
            isGeneratingRef.current = false;
          }}
          disabled={isGeneratingRef.current}
        >
          Randomize Walls
        </button>
        <button
          className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
          onClick={() => {
            if (isGeneratingRef.current) return;
            wallsRef.current = new Set();
            updateControllerGrid();
            draw();
          }}
          disabled={isGeneratingRef.current}
        >
          Clear Walls
        </button>
      </div>
      <div className="relative flex min-h-0 w-full flex-1 items-start justify-start overflow-auto p-4">
        <canvas
          ref={canvasRef}
          className="cursor-pointer"
          onMouseDown={handleGridInteraction}
          onMouseMove={(e) => {
            if (isDraggingRef.current) {
              handleGridInteraction(e);
            }
          }}
          onMouseUp={() => {
            isDraggingRef.current = false;
            draggedItemRef.current = null;
            lastVisitedCellRef.current = null;
            isWallDrawingRef.current = null;
          }}
          onMouseLeave={() => {
            isDraggingRef.current = false;
            draggedItemRef.current = null;
            lastVisitedCellRef.current = null;
            isWallDrawingRef.current = null;
          }}
        />
      </div>
    </div>
  );
};

export default PathFinding;
