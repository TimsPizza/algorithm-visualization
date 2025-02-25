import { TSortingAlgorithms } from "../../../types";
import { SortFunction, DrawOperationsWrapped } from "./types";

// 交换数组元素的辅助函数
const swap = (arr: number[], i: number, j: number): void => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

// 冒泡排序
export const bubbleSort: SortFunction = async (array, drawOp, isSorting) => {
  const n = array.length;

  for (let i = 0; i < n - 1 && isSorting(); i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1 && isSorting(); j++) {
      await drawOp.cmp(j, j + 1);
      if (!isSorting()) return;

      if (array[j] > array[j + 1]) {
        swap(array, j, j + 1);
        await drawOp.swap(j, j + 1);
        if (!isSorting()) return;
        swapped = true;
      }
    }

    if (!swapped) break;
  }
};

// 选择排序
export const selectionSort: SortFunction = async (array, drawOp, isSorting) => {
  const n = array.length;

  for (let i = 0; i < n - 1 && isSorting(); i++) {
    let minIdx = i;

    for (let j = i + 1; j < n && isSorting(); j++) {
      await drawOp.cmp(minIdx, j);
      if (!isSorting()) return;

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      swap(array, i, minIdx);
      await drawOp.swap(i, minIdx);
      if (!isSorting()) return;
    }
  }
};

// 插入排序
export const insertionSort: SortFunction = async (array, drawOp, isSorting) => {
  const n = array.length;

  for (let i = 1; i < n && isSorting(); i++) {
    let key = array[i];
    let j = i - 1;

    while (j >= 0 && array[j] > key && isSorting()) {
      await drawOp.cmp(j, j + 1);
      if (!isSorting()) return;

      array[j + 1] = array[j];
      await drawOp.swap(j + 1, j);
      if (!isSorting()) return;
      j--;
    }

    array[j + 1] = key;
  }
};

// 希尔排序
export const shellSort: SortFunction = async (array, drawOp, isSorting) => {
  const n = array.length;

  // 使用动态间隔序列
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n && isSorting(); i++) {
      let temp = array[i];
      let j;

      for (j = i; j >= gap && isSorting(); j -= gap) {
        await drawOp.cmp(j - gap, j);
        if (!isSorting()) return;

        if (array[j - gap] > temp) {
          array[j] = array[j - gap];
          await drawOp.swap(j, j - gap);
          if (!isSorting()) return;
        } else {
          break;
        }
      }

      array[j] = temp;
    }
  }
};

// 快速排序
export const quickSort: SortFunction = async (array, drawOp, isSorting) => {
  const partition = async (low: number, high: number): Promise<number> => {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high && isSorting(); j++) {
      await drawOp.cmp(j, high);
      if (!isSorting()) return -1;

      if (array[j] < pivot) {
        i++;
        swap(array, i, j);
        await drawOp.swap(i, j);
        if (!isSorting()) return -1;
      }
    }

    swap(array, i + 1, high);
    await drawOp.swap(i + 1, high);
    return i + 1;
  };

  const quickSortHelper = async (low: number, high: number): Promise<void> => {
    if (low < high && isSorting()) {
      const pi = await partition(low, high);
      if (pi === -1) return; // 排序被中断

      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
    }
  };

  await quickSortHelper(0, array.length - 1);
};

// 堆排序
export const heapSort: SortFunction = async (array, drawOp, isSorting) => {
  const heapify = async (n: number, i: number): Promise<void> => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      await drawOp.cmp(largest, left);
      if (!isSorting()) return;
      if (array[left] > array[largest]) {
        largest = left;
      }
    }

    if (right < n) {
      await drawOp.cmp(largest, right);
      if (!isSorting()) return;
      if (array[right] > array[largest]) {
        largest = right;
      }
    }

    if (largest !== i) {
      swap(array, i, largest);
      await drawOp.swap(i, largest);
      if (!isSorting()) return;
      await heapify(n, largest);
    }
  };

  const n = array.length;

  // 构建最大堆
  for (let i = Math.floor(n / 2) - 1; i >= 0 && isSorting(); i--) {
    await heapify(n, i);
  }

  // 逐个从堆中提取元素
  for (let i = n - 1; i > 0 && isSorting(); i--) {
    swap(array, 0, i);
    await drawOp.swap(0, i);
    if (!isSorting()) return;
    await heapify(i, 0);
  }
};

// 鸡尾酒排序（双向冒泡排序）
export const cocktailSort: SortFunction = async (array, drawOp, isSorting) => {
  let start = 0;
  let end = array.length - 1;
  let swapped = true;

  while (swapped && isSorting()) {
    swapped = false;

    // 从左到右
    for (let i = start; i < end && isSorting(); i++) {
      await drawOp.cmp(i, i + 1);
      if (!isSorting()) return;

      if (array[i] > array[i + 1]) {
        swap(array, i, i + 1);
        await drawOp.swap(i, i + 1);
        if (!isSorting()) return;
        swapped = true;
      }
    }
    end--;

    if (!swapped) break;
    swapped = false;

    // 从右到左
    for (let i = end - 1; i >= start && isSorting(); i--) {
      await drawOp.cmp(i, i + 1);
      if (!isSorting()) return;

      if (array[i] > array[i + 1]) {
        swap(array, i, i + 1);
        await drawOp.swap(i, i + 1);
        if (!isSorting()) return;
        swapped = true;
      }
    }
    start++;
  }
};

// 归并排序
export const mergeSort: SortFunction = async (array, drawOp, isSorting) => {
  const merge = async (
    left: number,
    mid: number,
    right: number,
  ): Promise<void> => {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length && isSorting()) {
      await drawOp.cmp(left + i, mid + 1 + j);
      if (!isSorting()) return;

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        await drawOp.swap(k, left + i);
        if (!isSorting()) return;
        i++;
      } else {
        array[k] = rightArr[j];
        await drawOp.swap(k, mid + 1 + j);
        if (!isSorting()) return;
        j++;
      }
      k++;
    }

    while (i < leftArr.length && isSorting()) {
      array[k] = leftArr[i];
      await drawOp.swap(k, left + i);
      if (!isSorting()) return;
      i++;
      k++;
    }

    while (j < rightArr.length && isSorting()) {
      array[k] = rightArr[j];
      await drawOp.swap(k, mid + 1 + j);
      if (!isSorting()) return;
      j++;
      k++;
    }
  };

  const mergeSortHelper = async (
    left: number,
    right: number,
  ): Promise<void> => {
    if (left < right && isSorting()) {
      const mid = Math.floor((left + right) / 2);
      await mergeSortHelper(left, mid);
      if (!isSorting()) return;

      await mergeSortHelper(mid + 1, right);
      if (!isSorting()) return;

      await merge(left, mid, right);
    }
  };

  await mergeSortHelper(0, array.length - 1);
};

// 计数排序
export const countingSort: SortFunction = async (array, drawOp, isSorting) => {
  const n = array.length;
  const output = new Array(n);
  const max = Math.max(...array);
  const min = Math.min(...array);
  const range = max - min + 1;
  const count = new Array(range).fill(0);

  // 计算每个元素的出现次数
  for (let i = 0; i < n && isSorting(); i++) {
    await drawOp.cmp(i, i); // 视觉反馈
    count[Math.floor(array[i] * range) - min]++;
  }

  // 修改count数组，使其包含实际位置信息
  for (let i = 1; i < range && isSorting(); i++) {
    count[i] += count[i - 1];
  }

  // 构建输出数组
  for (let i = n - 1; i >= 0 && isSorting(); i--) {
    const value = Math.floor(array[i] * range) - min;
    output[count[value] - 1] = array[i];
    count[value]--;
  }

  // 将排序后的数组复制回原数组
  for (let i = 0; i < n && isSorting(); i++) {
    array[i] = output[i];
    await drawOp.swap(i, i); // 视觉反馈
    if (!isSorting()) return;
  }
};

// 基数排序
export const radixSort: SortFunction = async (array, drawOp, isSorting) => {
  const getDigit = (num: number, place: number): number => {
    return Math.floor(Math.abs(num * 100) / Math.pow(10, place)) % 10;
  };

  const maxDigits = 3; // 由于我们的数字在0-1之间，考虑小数点后3位

  for (let digit = 0; digit < maxDigits && isSorting(); digit++) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);

    // 将数字分配到桶中
    for (let i = 0; i < array.length && isSorting(); i++) {
      await drawOp.cmp(i, i); // 视觉反馈
      const d = getDigit(array[i], digit);
      buckets[d].push(array[i]);
    }

    // 收集桶中的数字
    let idx = 0;
    for (let i = 0; i < 10 && isSorting(); i++) {
      for (let j = 0; j < buckets[i].length && isSorting(); j++) {
        array[idx] = buckets[i][j];
        await drawOp.swap(idx, idx); // 视觉反馈
        if (!isSorting()) return;
        idx++;
      }
    }
  }
};

// 梳排序
export const combSort: SortFunction = async (array, drawOp, isSorting) => {
  const n = array.length;
  let gap = n;
  let shrink = 1.3;
  let sorted = false;

  while (!sorted && isSorting()) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }

    for (let i = 0; i + gap < n && isSorting(); i++) {
      await drawOp.cmp(i, i + gap);
      if (!isSorting()) return;

      if (array[i] > array[i + gap]) {
        swap(array, i, i + gap);
        await drawOp.swap(i, i + gap);
        if (!isSorting()) return;
        sorted = false;
      }
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
export const sortingAlgorithms: Record<string, SortFunction> = {
  "Bubble Sort": bubbleSort,
  "Selection Sort": selectionSort,
  "Insertion Sort": insertionSort,
  "Shell Sort": shellSort,
  "Quick Sort": quickSort,
  "Heap Sort": heapSort,
  "Cocktail Sort": cocktailSort,
  "Merge Sort": mergeSort,
  "Counting Sort": countingSort,
  "Radix Sort": radixSort,
  "Comb Sort": combSort,
};
