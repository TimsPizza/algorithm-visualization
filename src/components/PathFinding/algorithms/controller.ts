import {
  PathFindingFunction,
  DrawOperations,
  DrawOperationsWrapped,
  PathFindingState,
  Grid,
  Point,
  VisitRecord,
} from "./types";

export class PathFindingController implements PathFindingController {
  private _grid: Grid;
  private _startPoint: Point;
  private _endPoint: Point;
  private _algorithm: PathFindingFunction;
  private _drawOp: DrawOperations;
  private _speedLevel: number;
  private _wrappedOps: DrawOperationsWrapped;
  private _state: PathFindingState = {
    isActive: false,
    isPaused: false,
    isCancelled: false,
    isFinished: false,
  };

  constructor(
    grid: Grid,
    startPoint: Point,
    endPoint: Point,
    algorithm: PathFindingFunction | null,
    drawOp: DrawOperations,
    speedLevel: number,
  ) {
    this._grid = [...grid];
    this._startPoint = startPoint;
    this._endPoint = endPoint;
    this._algorithm = algorithm ?? (async () => {});
    this._drawOp = drawOp;
    this._speedLevel = speedLevel;
    this._wrappedOps = this.wrapDrawOperations();
  }

  get grid(): Grid {
    return this._grid;
  }

  getState = () => {
    return this._state;
  };

  // 动态计算延迟时间
  private getDelay(gridSize: number, speedLevel: number): number {
    const baseDelay = Math.max(5000 - gridSize, 10);
    const speedFactor = Math.pow(0.7, speedLevel);
    return Math.max(1, Math.floor(baseDelay * speedFactor));
  }

  // 处理暂停
  private handlePause = async (): Promise<void> => {
    while (this._state.isActive && this._state.isPaused) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  // 包装绘图操作
  private wrapDrawOperations(): DrawOperationsWrapped {
    return {
      visit: async (record: VisitRecord): Promise<void> => {
        if (this._state.isCancelled) return;
        await this.handlePause();
        if (this.isStartOrEndPoint(record.point)) return;
        this._drawOp.visit(record);
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            this.getDelay(
              this._grid.length * this._grid[0].length,
              this._speedLevel,
            ),
          ),
        );
      },
      markPath: async (points: Point[]): Promise<void> => {
        if (this._state.isCancelled) return;
        await this.handlePause();
        for (const point of points) {
          // if (this.isStartOrEndPoint(point)) return;
          this._drawOp.markPath(point);
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              this.getDelay(this._grid.length * this._grid[0].length, 1),
            ),
          );
        }
      },
      updateDistance: async (point: Point, distance: number): Promise<void> => {
        if (this._state.isCancelled) return;
        await this.handlePause();
        this._drawOp.updateDistance(point, distance);
      },
      reset: async (): Promise<void> => {
        if (this._state.isCancelled) return;
        this._drawOp.reset();
      },
    };
  }

  async start(): Promise<void> {
    if (this._state.isActive) return;
    this._state.isCancelled = false;
    this._state.isActive = true;
    this._state.isPaused = false;
    this._state.isFinished = false;

    try {
      await this._algorithm(
        this._grid,
        this._startPoint,
        this._endPoint,
        this._wrappedOps,
        this.getState,
      );
      this._state.isFinished = true;
    } catch (error) {
      console.error("PathFinding error:", error);
      throw error;
    } finally {
      this._state.isActive = false;
      this._state.isCancelled = false;
      this._state.isPaused = false;
    }
  }

  pause(): void {
    this._state.isPaused = true;
  }

  resume(): void {
    this._state.isPaused = false;
  }

  reset(): void {
    this._state.isActive = false;
    this._state.isPaused = false;
    this._state.isCancelled = false;
  }

  updateSpeedLevel(speedLevel: number): void {
    this._speedLevel = speedLevel;
  }

  updateGrid(grid: Grid): void {
    if (!this._state.isActive) {
      this._grid = [...grid];
    }
  }

  updateStartPoint(point: Point): void {
    if (!this._state.isActive) {
      this._startPoint = point;
    }
  }

  updateEndPoint(point: Point): void {
    if (!this._state.isActive) {
      this._endPoint = point;
    }
  }

  toggleWall(point: Point): void {
    if (!this._state.isActive && !this.isStartOrEndPoint(point)) {
      this._grid[point.y][point.x] = {
        ...this._grid[point.y][point.x],
        isWall: !this._grid[point.y][point.x].isWall,
      };
    }
  }

  private isStartOrEndPoint(point: Point): boolean {
    return (
      (point.x === this._startPoint.x && point.y === this._startPoint.y) ||
      (point.x === this._endPoint.x && point.y === this._endPoint.y)
    );
  }
}
