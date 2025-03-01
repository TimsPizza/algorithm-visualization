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
import { visualizers } from "./visualizers/implementations";
import {
  VISUALIZER_TYPES,
  VISUALIZER_OPTIONS,
  VisualizerType,
} from "./visualizers/types";
import { TSortingAlgorithms } from "../../types";

// 颜色常量
export const COLORS = {
  BAR_DEFAULT: "#55D6C2", // 默认颜色
  BAR_COMPARING: "#F6E05E", // 比较颜色
  BAR_SWAPPING: "#F56565", // 交换颜色
  BAR_SORTED: "#48BB78", // 已排序颜色
} as const;

// 生成随机数组
const generateRandomArray = (length: number): number[] => {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.1);
};

export const Sorting: React.FC = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SortingController | null>(null);
  const requestAnimationFrameRef = useRef<number>();

  // Global Config
  const { algorithm, animationSpeed, arraySize, state, setExecutionState } =
    useGlobalConfig();

  // Local State
  const [array, setArray] = useState<number[]>(() =>
    generateRandomArray(arraySize),
  );
  const [highlightIndices, setHighlightIndices] = useState<number[]>([]);
  const [highlightColor, setHighlightColor] =
    useState<keyof typeof COLORS>("BAR_DEFAULT");
  const [isSorted, setIsSorted] = useState(false);
  const [visualizerType, setVisualizerType] = useState<VisualizerType>(
    VISUALIZER_TYPES.CLASSIC_BARS,
  );

  // 清理动画帧
  const cancelAnimation = useCallback(() => {
    if (requestAnimationFrameRef.current) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
      requestAnimationFrameRef.current = undefined;
    }
  }, []);

  // 绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 更新画布尺寸
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // 获取当前可视化器
    const currentVisualizer = visualizers[visualizerType];
    if (!currentVisualizer) return;

    // 绘制数组
    currentVisualizer.draw({
      ctx,
      width: rect.width,
      height: rect.height,
      array,
      highlightIndices,
      highlightColor: COLORS[highlightColor],
      defaultColor: COLORS.BAR_DEFAULT,
      sortedColor: COLORS.BAR_SORTED,
      isSorted,
    });
  }, [array, highlightIndices, highlightColor, isSorted, visualizerType]);

  // 绘图操作
  const drawOperations = useMemo<DrawOperations>(
    () => ({
      cmp: (i: number, j: number) => {
        setHighlightIndices([i, j]);
        setHighlightColor("BAR_COMPARING");
      },
      swap: (i: number, j: number) => {
        setHighlightIndices([i, j]);
        setHighlightColor("BAR_SWAPPING");
        if (controllerRef.current) {
          setArray([...controllerRef.current.array]);
        }
      },
      update: (index: number, value: number) => {
        setHighlightIndices([index]);
        setHighlightColor("BAR_SWAPPING");
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

  // 使用 requestAnimationFrame 优化重绘
  useEffect(() => {
    cancelAnimation();
    requestAnimationFrameRef.current = requestAnimationFrame(draw);
    return cancelAnimation;
  }, [draw, cancelAnimation]);

  // 初始化排序控制器
  useEffect(() => {
    const currentAlgorithm = sortingAlgorithms[algorithm as TSortingAlgorithms];
    if (!currentAlgorithm) return;

    const newArray = generateRandomArray(arraySize);
    setArray(newArray);
    setHighlightIndices([]);
    setHighlightColor("BAR_DEFAULT");
    setIsSorted(false);

    controllerRef.current = new SortingController(
      newArray,
      currentAlgorithm,
      drawOperations,
      animationSpeed,
    );

    return () => {
      if (controllerRef.current) {
        controllerRef.current.reset();
      }
    };
  }, [algorithm, arraySize, drawOperations]);

  // 处理动画速度变化
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateSpeedLevel(animationSpeed);
    }
  }, [animationSpeed]);

  // 处理状态变化
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;

    switch (state) {
      case "running":
        if (controller.getState().isActive && controller.getState().isPaused) {
          // resume from paused state
          controller.resume();
          return;
        }
        setHighlightIndices([]);
        setHighlightColor("BAR_DEFAULT");
        setIsSorted(false);
        controller.start().then(() => {
          if (controller.getState().isFinished) setExecutionState("finished");
        });
        break;
      case "paused":
        controller.pause();
        break;
      case "ready":
        controller.reset();
        const newArray = generateRandomArray(arraySize);
        controller.updateArray(newArray);
        setArray(newArray);
        setHighlightColor("BAR_DEFAULT");
        setHighlightIndices([]);
        setIsSorted(false);
        break;
      case "finished":
        break;
    }
  }, [state, arraySize]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      cancelAnimation();
      requestAnimationFrameRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw, cancelAnimation]);

  return (
    <div className="flex min-h-0 flex-1 flex-col" id="sorting-wrapper">
      <div className="flex flex-none flex-row flex-wrap justify-center gap-2 mt-4">
        {VISUALIZER_OPTIONS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setVisualizerType(type)}
            className={`rounded px-3 py-1 ${
              visualizerType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={visualizers[type]?.description}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <canvas ref={canvasRef} className="w-full" />
      </div>
    </div>
  );
};

export default Sorting;
