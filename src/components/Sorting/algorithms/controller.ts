import {
  SortController,
  SortFunction,
  DrawOperations,
  DrawOperationsWrapped,
  SortingState,
} from "./types";

export class SortingController implements SortController {
  private _array: number[];
  private _sortFunction: SortFunction;
  private _drawOp: DrawOperations;
  private _speedLevel: number;
  private _skipCounter: number = 0;
  private _wrappedOps: DrawOperationsWrapped;
  private _state: SortingState = {
    isActive: false,
    isPaused: false,
    isCancelled: false,
    isFinished: false,
  };

  constructor(
    array: number[],
    sortFunction: SortFunction | null,
    drawOp: DrawOperations,
    speedLevel: number,
  ) {
    this._array = array;
    this._sortFunction = sortFunction ?? (async () => {});
    this._drawOp = drawOp;
    this._speedLevel = speedLevel;
    this._wrappedOps = this.wrapDrawOperations();
  }
  getState = () => {
    return this._state;
  };

  get array(): number[] {
    return this._array;
  }

  // 根据速度级别决定是否跳过步骤
  private shouldSkip(): boolean {
    if (this._speedLevel <= 3) return false;
    return this._skipCounter > this.getStepSkipCount();
  }

  private getStepSkipCount(speedLevel: number = this._speedLevel): number {
    return Math.floor(Math.pow(3, speedLevel - 3)); // 速度6-10，指数增加跳过步骤
  }

  // 根据数组大小动态计算延迟
  private getDelay(arraySize: number, speedLevel: number): number {
    // 基础延迟随数组大小递减，但下限更低
    const baseDelay = Math.max(200 - arraySize, 10);
    // 速度等级越高，延迟越小
    const speedFactor = Math.pow(0.7, speedLevel); // 使用指数衰减
    return Math.max(1, Math.floor(baseDelay * speedFactor));
  }

  // 处理暂停
  private handlePause = async (): Promise<void> => {
    while (this._state.isActive && this._state.isPaused) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  // 包装绘图操作，添加智能跳过和延迟控制
  private wrapDrawOperations(): DrawOperationsWrapped {
    return {
      cmp: async (i: number, j: number): Promise<void> => {
        if (this._state.isCancelled) return;
        // 比较操作在高速时可以跳过一些
        await this.handlePause();
        if (this.shouldSkip()) {
          this._skipCounter += 1;
          return;
        }
        this._drawOp.cmp(i, j);
        this._skipCounter = 0;
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            this.getDelay(this._array.length, this._speedLevel) * 0.5,
          ),
        );
      },
      swap: async (i: number, j: number): Promise<void> => {
        if (this._state.isCancelled) return;
        // 执行交换操作
        const temp = this._array[i];
        this._array[i] = this._array[j];
        this._array[j] = temp;

        await this.handlePause();
        if (this.shouldSkip()) {
          this._skipCounter += 1;
          return;
        }
        this._drawOp.swap(i, j);
        this._skipCounter = 0;
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            this.getDelay(this._array.length, this._speedLevel) * 0.5,
          ),
        );
      },
      update: async (index: number, value: number): Promise<void> => {
        if (this._state.isCancelled) return;
        this._array[index] = value;
        await this.handlePause();
        if (this.shouldSkip()) {
          this._skipCounter += 1;
          return;
        }
        this._drawOp.update(index, value);
        this._skipCounter = 0;
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            this.getDelay(this._array.length, this._speedLevel) * 0.5,
          ),
        );
      },

      markSorted: async (): Promise<void> => {
        if (this._state.isPaused || this._state.isCancelled) return;
        this._drawOp.markSorted();
      },
    };
  }

  async start(): Promise<void> {
    console.log("Start sorting");
    if (this._state.isActive) return;
    this._state.isCancelled = false;
    this._state.isActive = true;
    this._state.isPaused = false;

    try {
      await this._sortFunction(this._array, this._wrappedOps, this.getState);
      this._state.isFinished = true;
    } catch (error) {
      console.error("Sorting error:", error);
      throw error;
    } finally {
      if (this._drawOp && this._state.isActive) {
        await this._wrappedOps.markSorted();
      }
      this._state.isActive = false;
      this._state.isCancelled = false;
      this._state.isPaused = false;
    }
  }

  updateAlgorithm(sortFunction: SortFunction): void {
    this._sortFunction = sortFunction;
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
    this._array = [];
    this._skipCounter = 0;
  }

  updateSpeedLevel(speedLevel: number): void {
    this._speedLevel = speedLevel;
  }

  updateArray(array: number[]): void {
    if (!this._state.isActive) {
      this._array = array;
      this._wrappedOps = this.wrapDrawOperations();
    }
  }
}
