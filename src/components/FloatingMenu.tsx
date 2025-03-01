import React from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalConfig } from "../context/GlobalConfigContext";
import { TAlgorithmCategories, TAlgorithms } from "../types";
import { SORTING_ALGORITHMS } from "./Sorting/algorithms/implementations";
import Draggable from "react-draggable";
import { PATH_FINDING_ALGORITHMS } from "./PathFinding/algorithms/implementations";

// 算法类别与路由路径的映射
const CATEGORY_ROUTES: Record<TAlgorithmCategories, string> = {
  "Path Finding": "pathfinding",
  "Bi-Tree Traversal": "tree-traversal",
  "Bi-Search Tree": "bst",
  Sorting: "sorting",
  "Graph Traversal": "graph",
};

export const FloatingMenu: React.FC = () => {
  const navigate = useNavigate();
  const {
    algorithmCategory,
    algorithm,
    animationSpeed,
    arraySize,
    state,
    setAlgorithmCategory,
    setAlgorithm,
    setAnimationSpeed,
    setArraySize,
    setExecutionState,
  } = useGlobalConfig();

  // 处理算法类别变更
  const handleCategoryChange = (category: TAlgorithmCategories) => {
    setAlgorithmCategory(category);
    // 导航到对应的路由
    navigate(CATEGORY_ROUTES[category]);
  };

  // 获取当前类别可用的算法列表
  const getAlgorithmsForCategory = (): TAlgorithms[] => {
    switch (algorithmCategory) {
      case "Path Finding":
        return PATH_FINDING_ALGORITHMS;
      case "Bi-Tree Traversal":
        return ["InOrder", "PreOrder", "PostOrder"];
      case "Bi-Search Tree":
        return ["Insert", "Search", "Delete"];
      case "Sorting":
        return SORTING_ALGORITHMS;
      case "Graph Traversal":
        return ["BreadthFirst", "DepthFirst"];
      default:
        return [];
    }
  };

  return (
    <Draggable cancel=".dragg-disabled">
      <div className="fixed right-4 top-4 z-50 min-w-[300px] rounded-lg bg-white p-4 shadow-lg">
        <div className="space-y-4">
          {/* 算法类别选择 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Algorithm Category
            </label>
            <select
              value={algorithmCategory}
              onChange={(e) =>
                handleCategoryChange(e.target.value as TAlgorithmCategories)
              }
              disabled={state === "running" || state === "paused"}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              {Object.keys(CATEGORY_ROUTES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 具体算法选择 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as TAlgorithms)}
              disabled={state === "running" || state === "paused"}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              {getAlgorithmsForCategory().map((algo) => (
                <option key={algo} value={algo}>
                  {algo}
                </option>
              ))}
            </select>
          </div>

          {/* 数组大小控制 - 仅在排序可视化时显示 */}
          {algorithmCategory === "Sorting" && (
            <div className="">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Array Size: {arraySize}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={state !== "ready"}
                className="dragg-disabled w-full disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10</span>
                <span>500</span>
              </div>
            </div>
          )}

          {/* 动画速度控制 */}
          <div className="">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Animation Speed: {animationSpeed}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="dragg-disabled w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* 执行控制 */}
          <div className="flex space-x-2">
            {state === "finished" ? (
              // 如果是完成状态，只显示重新开始按钮
              <button
                onClick={() => setExecutionState("ready")}
                className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Start New
              </button>
            ) : (
              // 其他状态显示常规控制按钮
              <>
                <button
                  onClick={() => setExecutionState("running")}
                  // @ts-ignore
                  disabled={state === "running"}
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  Start
                </button>
                <button
                  onClick={() => {
                    setExecutionState("paused");
                  }}
                  // @ts-ignore
                  disabled={state === "paused" || state === "finished"}
                  className="flex-1 rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 disabled:bg-gray-400"
                >
                  Pause
                </button>
                <button
                  onClick={() => setExecutionState("ready")}
                  disabled={state === "ready"}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default FloatingMenu;
