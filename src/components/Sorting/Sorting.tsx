import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useGlobalConfig } from "../../context/GlobalConfigContext";
import { SortingController } from "./algorithms/controller";
import { sortingAlgorithms } from "./algorithms/implementations";
import { DrawOperations } from "./algorithms/types";

// 颜色常量
const COLORS = {
  BAR_DEFAULT: "#4C51BF", // 默认柱状图颜色
  BAR_COMPARING: "#F6E05E", // 比较中的元素颜色
  BAR_SWAPPING: "#F56565", // 交换中的元素颜色
  BAR_SORTED: "#48BB78", // 已排序的元素颜色
};

// 生成随机数组
const generateRandomArray = (length: number): number[] => {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.1);
};

// 计算柱状图尺寸
const calculateBarDimensions = (
  canvasWidth: number,
  canvasHeight: number,
  arraySize: number,
) => {
  const minBarWidth = 2;
  const maxBarWidth = 30;
  let barWidth = Math.min(maxBarWidth, (canvasWidth * 0.8) / arraySize);
  barWidth = Math.max(minBarWidth, barWidth);
  const barSpacing = Math.max(1, barWidth * 0.2);

  return {
    barWidth,
    barSpacing,
    startX: (canvasWidth - (barWidth + barSpacing) * arraySize) / 2,
  };
};

export const Sorting: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SortingController | null>(null);
  const { algorithm, animationSpeed, arraySize, state, setExecutionState } =
    useGlobalConfig();

  // 维护一个本地数组状态用于渲染
  const [array, setArray] = useState<number[]>(() =>
    generateRandomArray(arraySize),
  );
  const [highlightIndices, setHighlightIndices] = useState<number[]>([]);
  const [highlightColor, setHighlightColor] =
    useState<keyof typeof COLORS>("BAR_DEFAULT");
  const [isSorted, setIsSorted] = useState(false);

  // 绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { barWidth, barSpacing, startX } = calculateBarDimensions(
      canvas.width,
      canvas.height,
      array.length,
    );

    array.forEach((value, index) => {
      const x = startX + index * (barWidth + barSpacing);
      const height = value * canvas.height * 0.8;
      const y = canvas.height - height;

      if (isSorted) {
        ctx.fillStyle = COLORS.BAR_SORTED;
      } else if (highlightIndices.includes(index)) {
        ctx.fillStyle = COLORS[highlightColor];
      } else {
        ctx.fillStyle = COLORS.BAR_DEFAULT;
      }

      ctx.fillRect(x, y, barWidth, height);
    });
  }, [array, highlightIndices, highlightColor, isSorted]);

  // 基本绘图操作
  const drawOperations = useMemo<DrawOperations>(
    () => ({
      cmp: (i: number, j: number) => {
        setHighlightIndices([i, j]);
        setHighlightColor("BAR_COMPARING");
      },
      swap: (i: number, j: number) => {
        setHighlightIndices([i, j]);
        setHighlightColor("BAR_SWAPPING");
        // 从控制器获取最新数组状态
        if (controllerRef.current) {
          setArray([...controllerRef.current.array]);
        }
      },
      markSorted: () => {
        setHighlightIndices([]);
        setIsSorted(true);
      },
    }),
    [],
  );

  // 初始化排序控制器
  useEffect(() => {
    const currentAlgorithm = sortingAlgorithms[algorithm];
    if (!currentAlgorithm) return;

    const newArray = generateRandomArray(arraySize);
    setArray(newArray);
    setHighlightIndices([]);
    setHighlightColor("BAR_DEFAULT");
    setIsSorted(false);

    return () => {
      if (controllerRef.current) {
        controllerRef.current.reset();
      }
    };
  }, [algorithm, arraySize, animationSpeed, drawOperations]);

  // 处理动画速度变化
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateSpeedLevel(animationSpeed);
    }
  }, [animationSpeed]);

  // 处理状态变化
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) {
      console.error("Controller not initialized");
      return;
    }

    switch (state) {
      case "running":
        setHighlightIndices([]);
        setHighlightColor("BAR_DEFAULT");
        setIsSorted(false);
        controller.start().then(() => {
          setExecutionState("finished");
        });
        break;
      case "paused":
        controller.pause();
        break;
      case "ready":
        controller.reset();
        const newArray = generateRandomArray(arraySize);
        controller.updateArray(newArray);
        controller.updateSpeedLevel(animationSpeed);
        controller.updateAlgorithm(sortingAlgorithms[algorithm]);
        setArray(newArray);
        setHighlightIndices([]);
        setHighlightColor("BAR_DEFAULT");
        setIsSorted(false);
        controller.updateArray(newArray);
        break;
      case "finished":
        // 保持当前状态，等待用户手动重置
        break;
    }
  }, [state, arraySize]);

  // 监听窗口大小变化时重新绘制
  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  // 每当数组或高亮状态改变时重新绘制
  useEffect(() => {
    draw();
  }, [draw]);

  // initialize
  useEffect(() => {
    controllerRef.current = new SortingController(
      [],
      sortingAlgorithms[algorithm],
      drawOperations,
      animationSpeed,
    );
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
};

export default Sorting;
