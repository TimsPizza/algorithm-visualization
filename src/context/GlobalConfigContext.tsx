import React from "react";
import {
  IGlobalConfigContext,
  TAlgorithmCategories,
  TAlgorithms,
} from "../types";

// Constants for localStorage keys
const STORAGE_KEYS = {
  ALGORITHM_CATEGORY: "algo-viz-category",
  ALGORITHM: "algo-viz-algorithm",
  ANIMATION_SPEED: "algo-viz-speed",
  ARRAY_SIZE: "algo-viz-array-size",
} as const;

export const GlobalConfigContext = React.createContext<IGlobalConfigContext>({
  algorithmCategory: "Path Finding",
  algorithm: "Dijkstra",
  animationSpeed: 1,
  arraySize: 50,
  state: "ready",
  setAlgorithmCategory: () => {},
  setAlgorithm: () => {},
  setAnimationSpeed: () => {},
  setArraySize: () => {},
  setExecutionState: () => {},
});

export const GlobalConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize state from localStorage or URL parameters
  const [algorithmCategory, setAlgorithmCategory] =
    React.useState<TAlgorithmCategories>(() => {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        (urlParams.get("category") as TAlgorithmCategories) ||
        (localStorage.getItem(
          STORAGE_KEYS.ALGORITHM_CATEGORY,
        ) as TAlgorithmCategories) ||
        "Path Finding"
      );
    });

  const [algorithm, setAlgorithm] = React.useState<TAlgorithms>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return (
      (urlParams.get("algorithm") as TAlgorithms) ||
      (localStorage.getItem(STORAGE_KEYS.ALGORITHM) as TAlgorithms) ||
      "Dijkstra"
    );
  });

  const [animationSpeed, setAnimationSpeed] = React.useState<number>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(
      urlParams.get("speed") ||
        localStorage.getItem(STORAGE_KEYS.ANIMATION_SPEED) ||
        "1",
      10,
    );
  });

  const [arraySize, setArraySize] = React.useState<number>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(
      urlParams.get("size") ||
        localStorage.getItem(STORAGE_KEYS.ARRAY_SIZE) ||
        "50",
      10,
    );
  });

  // DEBUG
  const [state, setExecutionState_] =
    React.useState<IGlobalConfigContext["state"]>("ready");
  const setExecutionState = React.useCallback(
    (newState: IGlobalConfigContext["state"]) => {
      setExecutionState_(newState);
      console.log("State:", newState);
    },
    [],
  );

  // Persist state changes to localStorage and URL
  const handleCategoryChange = React.useCallback(
    (category: TAlgorithmCategories) => {
      setAlgorithmCategory(category);
      localStorage.setItem(STORAGE_KEYS.ALGORITHM_CATEGORY, category);

      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("category", category);
      window.history.pushState(
        {},
        "",
        `${window.location.pathname}?${urlParams.toString()}`,
      );
    },
    [],
  );

  const handleAlgorithmChange = React.useCallback((algo: TAlgorithms) => {
    setAlgorithm(algo);
    localStorage.setItem(STORAGE_KEYS.ALGORITHM, algo);

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("algorithm", algo);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${urlParams.toString()}`,
    );
  }, []);

  const handleSpeedChange = React.useCallback((speed: number) => {
    setAnimationSpeed(speed);
    localStorage.setItem(STORAGE_KEYS.ANIMATION_SPEED, speed.toString());

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("speed", speed.toString());
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${urlParams.toString()}`,
    );
  }, []);

  const handleArraySizeChange = React.useCallback((size: number) => {
    setArraySize(size);
    localStorage.setItem(STORAGE_KEYS.ARRAY_SIZE, size.toString());

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("size", size.toString());
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${urlParams.toString()}`,
    );
  }, []);

  const value = React.useMemo(
    () => ({
      algorithmCategory,
      algorithm,
      animationSpeed,
      arraySize,
      state,
      setAlgorithmCategory: handleCategoryChange,
      setAlgorithm: handleAlgorithmChange,
      setAnimationSpeed: handleSpeedChange,
      setArraySize: handleArraySizeChange,
      setExecutionState,
    }),
    [
      algorithmCategory,
      algorithm,
      animationSpeed,
      arraySize,
      state,
      handleCategoryChange,
      handleAlgorithmChange,
      handleSpeedChange,
      handleArraySizeChange,
    ],
  );

  return (
    <GlobalConfigContext.Provider value={value}>
      {children}
    </GlobalConfigContext.Provider>
  );
};

// Custom hook for using the context
export const useGlobalConfig = () => {
  const context = React.useContext(GlobalConfigContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalConfig must be used within a GlobalConfigProvider",
    );
  }
  return context;
};
