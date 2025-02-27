import { TSortingAlgorithms } from "../../../types";
import { SortFunction } from "./types";

// 冒泡排序
export const bubbleSort: SortFunction = async (array, drawOp, getState) => {
  const n = array.length;

  for (
    let i = 0;
    i < n - 1 && !getState().isCancelled && getState().isActive;
    i++
  ) {
    let swapped = false;

    for (
      let j = 0;
      j < n - i - 1 && !getState().isCancelled && getState().isActive;
      j++
    ) {
      await drawOp.cmp(j, j + 1);

      if (array[j] > array[j + 1]) {
        await drawOp.swap(j, j + 1);
        swapped = true;
      }
    }

    if (!swapped) break;
  }
};

// 选择排序
export const selectionSort: SortFunction = async (array, drawOp, getState) => {
  const n = array.length;

  for (
    let i = 0;
    i < n - 1 && !getState().isCancelled && getState().isActive;
    i++
  ) {
    let minIdx = i;

    for (
      let j = i + 1;
      j < n && !getState().isCancelled && getState().isActive;
      j++
    ) {
      await drawOp.cmp(minIdx, j);

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      await drawOp.swap(i, minIdx);
    }
  }
};

// 插入排序
export const insertionSort: SortFunction = async (array, drawOp, getState) => {
  const n = array.length;

  for (
    let i = 1;
    i < n && !getState().isCancelled && getState().isActive;
    i++
  ) {
    let key = array[i];
    let j = i - 1;

    while (
      j >= 0 &&
      array[j] > key &&
      !getState().isCancelled &&
      getState().isActive
    ) {
      await drawOp.cmp(j, j + 1);

      array[j + 1] = array[j];
      await drawOp.swap(j + 1, j);

      j--;
    }

    array[j + 1] = key;
  }
};

// 希尔排序
export const shellSort: SortFunction = async (array, drawOp, getState) => {
  const n = array.length;

  // 使用动态间隔序列
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (
      let i = gap;
      i < n && !getState().isCancelled && getState().isActive;
      i++
    ) {
      let temp = array[i];
      let j;

      for (
        j = i;
        j >= gap && !getState().isCancelled && getState().isActive;
        j -= gap
      ) {
        await drawOp.cmp(j - gap, j);

        if (array[j - gap] > temp) {
          array[j] = array[j - gap];
          await drawOp.swap(j, j - gap);
        } else {
          break;
        }
      }

      array[j] = temp;
    }
  }
};

// 快速排序
export const quickSort: SortFunction = async (array, drawOp, getState) => {
  const partition = async (low: number, high: number): Promise<number> => {
    const pivot = array[high];
    let i = low - 1;
    for (
      let j = low;
      j < high &&
      !getState().isCancelled &&
      getState().isActive &&
      getState().isActive;
      j++
    ) {
      await drawOp.cmp(j, high);
      if (array[j] < pivot) {
        i++;
        await drawOp.swap(i, j);
      }
    }

    await drawOp.swap(i + 1, high);
    return i + 1;
  };

  const quickSortHelper = async (low: number, high: number): Promise<void> => {
    if (low < high && !getState().isCancelled && getState().isActive) {
      const pi = await partition(low, high);
      if (pi === -1) return; // 排序被中断
      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
    }
  };

  await quickSortHelper(0, array.length - 1);
};

// 堆排序
export const heapSort: SortFunction = async (array, drawOp, getState) => {
  const heapify = async (n: number, i: number): Promise<void> => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      await drawOp.cmp(largest, left);

      if (array[left] > array[largest]) {
        largest = left;
      }
    }

    if (right < n) {
      await drawOp.cmp(largest, right);
      if (array[right] > array[largest]) {
        largest = right;
      }
    }
    if (largest !== i) {
      await drawOp.swap(i, largest);
      await heapify(n, largest);
    }
  };

  const n = array.length;

  // 构建最大堆
  for (
    let i = Math.floor(n / 2) - 1;
    i >= 0 && !getState().isCancelled && getState().isActive;
    i--
  ) {
    await heapify(n, i);
  }

  // 逐个从堆中提取元素
  for (
    let i = n - 1;
    i > 0 && !getState().isCancelled && getState().isActive;
    i--
  ) {
    await drawOp.swap(0, i);

    await heapify(i, 0);
  }
};

// 鸡尾酒排序（双向冒泡排序）
export const cocktailSort: SortFunction = async (array, drawOp, getState) => {
  let start = 0;
  let end = array.length - 1;
  let swapped = true;

  while (swapped && !getState().isCancelled && getState().isActive) {
    swapped = false;

    // 从左到右
    for (
      let i = start;
      i < end && !getState().isCancelled && getState().isActive;
      i++
    ) {
      await drawOp.cmp(i, i + 1);

      if (array[i] > array[i + 1]) {
        await drawOp.swap(i, i + 1);

        swapped = true;
      }
    }
    end--;

    if (!swapped) break;
    swapped = false;

    // 从右到左
    for (
      let i = end - 1;
      i >= start && !getState().isCancelled && getState().isActive;
      i--
    ) {
      await drawOp.cmp(i, i + 1);

      if (array[i] > array[i + 1]) {
        await drawOp.swap(i, i + 1);
        swapped = true;
      }
    }
    start++;
  }
};

// 归并排序
export const mergeSort: SortFunction = async (array, drawOp, getState) => {
  const merge = async (
    left: number,
    mid: number,
    right: number,
  ): Promise<void> => {
    // snapshot
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;

    while (
      i < leftArr.length &&
      j < rightArr.length &&
      !getState().isCancelled
    ) {
      await drawOp.cmp(left + i, mid + 1 + j);

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        await drawOp.update(k, leftArr[i]); // 仅更新目标位置
        i++;
      } else {
        array[k] = rightArr[j];
        await drawOp.update(k, rightArr[j]);
        j++;
      }
      k++;
    }

    // 处理剩余元素（同样使用临时数组的值）
    while (
      i < leftArr.length &&
      !getState().isCancelled &&
      getState().isActive
    ) {
      array[k] = leftArr[i];
      await drawOp.update(k, leftArr[i]);
      i++;
      k++;
    }

    while (
      j < rightArr.length &&
      !getState().isCancelled &&
      getState().isActive
    ) {
      array[k] = rightArr[j];
      await drawOp.update(k, rightArr[j]);
      j++;
      k++;
    }
  };

  const mergeSortHelper = async (
    left: number,
    right: number,
  ): Promise<void> => {
    if (left < right && !getState().isCancelled && getState().isActive) {
      const mid = Math.floor((left + right) / 2);
      await mergeSortHelper(left, mid);

      await mergeSortHelper(mid + 1, right);

      await merge(left, mid, right);
    }
  };

  await mergeSortHelper(0, array.length - 1);
};

// 计数排序
export const countingSort: SortFunction = async (array, drawOp, getState) => {
  const n = array.length;
  const factor = 1e5;

  // 将原小数转换为整数，确保排序时不会丢失精度
  const intArray = array.map((num) => Math.round(num * factor));

  // 计数排序实现：基于整数数组
  const maxInt = Math.max(...intArray);
  const minInt = Math.min(...intArray);
  const range = maxInt - minInt + 1;
  const count = new Array(range).fill(0);
  const output = new Array(n);

  // 统计每个整数出现的次数
  for (
    let i = 0;
    i < n && !getState().isCancelled && getState().isActive;
    i++
  ) {
    await drawOp.cmp(i, i); // 视觉反馈
    const index = intArray[i] - minInt;
    count[index]++;
  }

  // 修改 count 数组，使其累计计数
  for (
    let i = 1;
    i < range && !getState().isCancelled && getState().isActive;
    i++
  ) {
    count[i] += count[i - 1];
  }

  // 构建排序后的整数输出数组（从后往前遍历，保证排序稳定性）
  for (
    let i = n - 1;
    i >= 0 && !getState().isCancelled && getState().isActive;
    i--
  ) {
    const index = intArray[i] - minInt;
    output[count[index] - 1] = intArray[i];
    count[index]--;
  }

  // 将排序后的整数数组还原为小数，并更新原数组及视图
  for (
    let i = 0;
    i < n && !getState().isCancelled && getState().isActive;
    i++
  ) {
    const sortedValue = output[i] / factor;
    array[i] = sortedValue; // 可选：如果需要修改原数组
    await drawOp.update(i, sortedValue); // 视觉反馈
  }
};

// 基数排序
export const radixSort: SortFunction = async (array, drawOp, getState) => {
  const getDigit = (num: number, place: number): number => {
    return Math.floor(Math.abs(num * 100) / Math.pow(10, place)) % 10;
  };

  const maxDigits = 3; // 由于我们的数字在0-1之间，考虑小数点后3位

  for (
    let digit = 0;
    digit < maxDigits && !getState().isCancelled && getState().isActive;
    digit++
  ) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);

    // 将数字分配到桶中
    for (
      let i = 0;
      i < array.length && !getState().isCancelled && getState().isActive;
      i++
    ) {
      await drawOp.cmp(i, i); // 视觉反馈
      const d = getDigit(array[i], digit);
      buckets[d].push(array[i]);
    }

    // 收集桶中的数字
    let idx = 0;
    for (
      let i = 0;
      i < 10 && !getState().isCancelled && getState().isActive;
      i++
    ) {
      for (
        let j = 0;
        j < buckets[i].length && !getState().isCancelled && getState().isActive;
        j++
      ) {
        array[idx] = buckets[i][j];
        await drawOp.swap(idx, idx); // 视觉反馈

        idx++;
      }
    }
  }
};

// 梳排序
export const combSort: SortFunction = async (array, drawOp, getState) => {
  const n = array.length;
  let gap = n;
  let shrink = 1.3;
  let sorted = false;

  while (!sorted && !getState().isCancelled && getState().isActive) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }

    for (
      let i = 0;
      i + gap < n && !getState().isCancelled && getState().isActive;
      i++
    ) {
      await drawOp.cmp(i, i + gap);

      if (array[i] > array[i + gap]) {
        await drawOp.swap(i, i + gap);

        sorted = false;
      }
    }
  }
};

export const bucketSort: SortFunction = async (array, drawOp, getState) => {
  const n = array.length;
  const buckets: number[][] = Array.from({ length: n }, () => []);

  // 将数字分配到桶中
  for (
    let i = 0;
    i < n && !getState().isCancelled && getState().isActive;
    i++
  ) {
    await drawOp.cmp(i, i); // 视觉反馈
    const bucketIdx = Math.floor(array[i] * n);
    buckets[bucketIdx].push(array[i]);
  }

  // 对每个桶进行排序
  for (
    let i = 0;
    i < n && !getState().isCancelled && getState().isActive;
    i++
  ) {
    buckets[i].sort((a, b) => a - b);
  }

  // 收集桶中的数字
  let idx = 0;

  for (
    let i = 0;
    i < n && !getState().isCancelled && getState().isActive;
    i++
  ) {
    for (
      let j = 0;
      j < buckets[i].length && !getState().isCancelled && getState().isActive;
      j++
    ) {
      array[idx] = buckets[i][j];
      await drawOp.swap(idx, idx); // 视觉反馈

      idx++;
    }
  }
};

export const SORTING_ALGORITHMS: Array<TSortingAlgorithms> = [
  "BubbleSort",
  "SelectionSort",
  "InsertionSort",
  "ShellSort",
  "MergeSort",
  "QuickSort",
  "HeapSort",
  "RadixSort",
  "CocktailSort",
  "CountingSort",
  "BucketSort",
  "CombSort",
];

// 导出所有可用的排序算法
export const sortingAlgorithms: Record<TSortingAlgorithms, SortFunction> = {
  BubbleSort: bubbleSort,
  SelectionSort: selectionSort,
  InsertionSort: insertionSort,
  ShellSort: shellSort,
  QuickSort: quickSort,
  HeapSort: heapSort,
  CocktailSort: cocktailSort,
  MergeSort: mergeSort,
  CountingSort: countingSort,
  RadixSort: radixSort,
  CombSort: combSort,
  BucketSort: bucketSort,
};
