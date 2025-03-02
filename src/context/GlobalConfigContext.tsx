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

// Function to get URL parameters from hash
const getHashParams = () => {
  const [, queryString] = window.location.hash.split('?');
  return new URLSearchParams(queryString || '');
};

// Function to update URL with new parameters
const updateHashWithParams = (params: URLSearchParams) => {
  const [basePath] = window.location.hash.split('?');
  window.location.hash = `${basePath}?${params.toString()}`;
};

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
      const urlParams = getHashParams();
      return (
        (urlParams.get("category") as TAlgorithmCategories) ||
        (localStorage.getItem(
          STORAGE_KEYS.ALGORITHM_CATEGORY,
        ) as TAlgorithmCategories) ||
        "Sorting"
      );
    });

  const [algorithm, setAlgorithm] = React.useState<TAlgorithms>(() => {
    const urlParams = getHashParams();
    return (
      (urlParams.get("algorithm") as TAlgorithms) ||
      (localStorage.getItem(STORAGE_KEYS.ALGORITHM) as TAlgorithms) ||
      "Dijkstra"
    );
  });

  const [animationSpeed, setAnimationSpeed] = React.useState<number>(() => {
    const urlParams = getHashParams();
    return parseInt(
      urlParams.get("speed") ||
        localStorage.getItem(STORAGE_KEYS.ANIMATION_SPEED) ||
        "1",
      10,
    );
  });

  const [arraySize, setArraySize] = React.useState<number>(() => {
    const urlParams = getHashParams();
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

      const urlParams = getHashParams();
      urlParams.set("category", category);
      updateHashWithParams(urlParams);
    },
    [setAlgorithmCategory],
  );

  const handleAlgorithmChange = React.useCallback((algo: TAlgorithms) => {
    setAlgorithm(algo);
    localStorage.setItem(STORAGE_KEYS.ALGORITHM, algo);

    const urlParams = getHashParams();
    urlParams.set("algorithm", algo);
    updateHashWithParams(urlParams);
  }, [setAlgorithm]);

  const handleSpeedChange = React.useCallback((speed: number) => {
    setAnimationSpeed(speed);
    localStorage.setItem(STORAGE_KEYS.ANIMATION_SPEED, speed.toString());

    const urlParams = getHashParams();
    urlParams.set("speed", speed.toString());
    updateHashWithParams(urlParams);
  }, [setAnimationSpeed]);

  const handleArraySizeChange = React.useCallback((size: number) => {
    setArraySize(size);
    localStorage.setItem(STORAGE_KEYS.ARRAY_SIZE, size.toString());

    const urlParams = getHashParams();
    urlParams.set("size", size.toString());
    updateHashWithParams(urlParams);
  }, [setArraySize]);

  // Function to sync state from URL parameters
  const syncStateFromUrl = React.useCallback(() => {
    const urlParams = getHashParams();
    const category = urlParams.get("category") as TAlgorithmCategories;
    const algo = urlParams.get("algorithm") as TAlgorithms;
    const speed = urlParams.get("speed");
    const size = urlParams.get("size");

    if (category && category !== algorithmCategory) {
      handleCategoryChange(category);
    }
    if (algo && algo !== algorithm) {
      handleAlgorithmChange(algo);
    }
    if (speed) {
      const newSpeed = parseInt(speed, 10);
      if (newSpeed !== animationSpeed) {
        handleSpeedChange(newSpeed);
      }
    }
    if (size) {
      const newSize = parseInt(size, 10);
      if (newSize !== arraySize) {
        handleArraySizeChange(newSize);
      }
    }
  }, [
    algorithmCategory,
    algorithm,
    animationSpeed,
    arraySize,
    handleCategoryChange,
    handleAlgorithmChange,
    handleSpeedChange,
    handleArraySizeChange,
  ]);

  // Add hash change listener to handle browser navigation
  React.useEffect(() => {
    // Handle initial URL parameters
    syncStateFromUrl();
    
    // Listen for hash changes
    window.addEventListener('hashchange', syncStateFromUrl);
    return () => window.removeEventListener('hashchange', syncStateFromUrl);
  }, [
    algorithmCategory,
    algorithm,
    animationSpeed,
    arraySize,
    handleCategoryChange,
    handleAlgorithmChange,
    handleSpeedChange,
    handleArraySizeChange,
  ]);

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
