import React, { Suspense, ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './_layout';
import PathFinding from '../components/PathFinding/PathFinding';
import Sorting from '../components/Sorting/Sorting';

// 定义组件类型
type LazyComponentModule = {
  default: ComponentType<any>;
};

// 其他算法组件仍然使用懒加载占位符
const BiTreeTraversal = React.lazy(() => 
  Promise.resolve<LazyComponentModule>({
    default: () => <div>Binary Tree Traversal Visualization (Coming Soon)</div>
  })
);

const BiSearchTree = React.lazy(() =>
  Promise.resolve<LazyComponentModule>({
    default: () => <div>Binary Search Tree Visualization (Coming Soon)</div>
  })
);

const GraphTraversal = React.lazy(() =>
  Promise.resolve<LazyComponentModule>({
    default: () => <div>Graph Traversal Visualization (Coming Soon)</div>
  })
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/pathfinding" replace />
      },
      {
        path: 'pathfinding',
        element: <PathFinding />
      },
      {
        path: 'tree-traversal',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BiTreeTraversal />
          </Suspense>
        )
      },
      {
        path: 'bst',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BiSearchTree />
          </Suspense>
        )
      },
      {
        path: 'sorting',
        element: <Sorting />  // 直接使用实际的排序组件
      },
      {
        path: 'graph',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <GraphTraversal />
          </Suspense>
        )
      }
    ]
  }
]);
