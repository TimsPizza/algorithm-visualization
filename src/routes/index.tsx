import React, { ComponentType, Suspense } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import PathFinding from "../components/PathFinding/PathFinding";
import Sorting from "../components/Sorting/Sorting";
import Layout from "./_layout";

// 定义组件类型
type LazyComponentModule = {
  default: ComponentType<any>;
};

// 其他算法组件仍然使用懒加载占位符
const BiTree = React.lazy(() =>
  Promise.resolve<LazyComponentModule>({
    default: () => (
      <div className="mx-auto my-auto text-lg font-bold">
        Binary Tree Related Visualization (Coming Soon)
      </div>
    ),
  }),
);

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/pathfinding" replace />,
      },
      {
        path: "pathfinding",
        element: <PathFinding />,
      },
      {
        path: "binarytree",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BiTree />
          </Suspense>
        ),
      },
      {
        path: "sorting",
        element: <Sorting />, // 直接使用实际的排序组件
      },
    ],
  },
]);
