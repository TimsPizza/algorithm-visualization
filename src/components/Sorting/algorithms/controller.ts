import {
  SortController,
  SortFunction,
  DrawOperations,
  DrawOperationsWrapped,
} from "./types";

export class SortingController implements SortController {
  private _array: number[];
  private _sorting: boolean = false;
  private _paused: boolean = false;
  private _sortFunction: SortFunction;
  private _drawOp: DrawOperations;
  private _speedLevel: number;
  private _skipCounter: number = 0;
  private _wrappedOps: DrawOperationsWrapped;

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
    this._sorting = false;
  }

  get array(): number[] {
    return this._array;
  }

  isSorting = (): boolean => {
    return this._sorting && !this._paused;
  };

  // 根据速度级别决定是否跳过步骤
  private shouldSkip(): boolean {
    if (this._speedLevel <= 3) return false;
    console.log("should skip: ", this._skipCounter > this.getStepSkipCount());
    return this._skipCounter > this.getStepSkipCount();
  }

  private getStepSkipCount(speedLevel: number = this._speedLevel): number {
    return Math.floor(Math.pow(2, speedLevel - 3)); // 速度6-10，指数增加跳过步骤
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
    while (this._paused && this._sorting) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  // 包装绘图操作，添加智能跳过和延迟控制
  private wrapDrawOperations(): DrawOperationsWrapped {
    return {
      cmp: async (i: number, j: number): Promise<void> => {
        if (!this.isSorting()) return;
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
        if (!this.isSorting()) return;
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
      markSorted: async (): Promise<void> => {
        if (!this.isSorting()) return;
        this._drawOp.markSorted();
      },
    };
  }

  async start(): Promise<void> {
    console.log("Start sorting");
    if (this._sorting) return;
    this._sorting = true;
    this._paused = false;

    try {
      await this._sortFunction(this._array, this._wrappedOps, this.isSorting);
    } catch (error) {
      console.error("Sorting error:", error);
      throw error;
    } finally {
      this._sorting = false;
      this._paused = false;
      if (this._drawOp) {
        await this._wrappedOps.markSorted();
      }
    }
  }

  updateAlgorithm(sortFunction: SortFunction): void {
    this._sortFunction = sortFunction;
  }

  pause(): void {
    if (this._sorting && !this._paused) {
      this._paused = true;
    }
  }

  resume(): void {
    if (this._sorting && this._paused) {
      this._paused = false;
    }
  }

  reset(): void {
    this._sorting = false;
    this._paused = false;
    this._skipCounter = 0;
  }

  updateSpeedLevel(speedLevel: number): void {
    this._speedLevel = speedLevel;
  }

  updateArray(array: number[]): void {
    if (!this._sorting) {
      this._array = array;
      this._wrappedOps = this.wrapDrawOperations();
    }
  }
}
