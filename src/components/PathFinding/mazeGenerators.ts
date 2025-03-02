import { Point } from "./algorithms/types";

// Helper to check if a point is valid and not a wall
const isValidPoint = (
  x: number,
  y: number,
  width: number,
  height: number,
  walls: Set<string>,
): boolean => {
  return (
    x >= 0 && x < width && y >= 0 && y < height && !walls.has(`${x},${y}`)
  );
};

// Create a guaranteed path between start and end points
const createPath = (startPoint: Point, endPoint: Point): Point[] => {
  const path = new Set<string>();
  const pathPoints: Point[] = [];
  let { x, y } = startPoint;

  // First move horizontally
  while (x !== endPoint.x) {
    x += x < endPoint.x ? 1 : -1;
    const key = `${x},${y}`;
    if (!path.has(key)) {
      path.add(key);
      pathPoints.push({ x, y });
    }
  }

  // Then move vertically
  while (y !== endPoint.y) {
    y += y < endPoint.y ? 1 : -1;
    const key = `${x},${y}`;
    if (!path.has(key)) {
      path.add(key);
      pathPoints.push({ x, y });
    }
  }

  return pathPoints;
};

// DFS with Random Backtracking Maze Generation
export const generateMaze = (
  width: number,
  height: number,
  startPoint: Point,
  endPoint: Point
): Point[] => {
  // Initialize grid with all walls
  const walls = new Set<string>();
  const visited = new Set<string>();
  const paths = new Set<string>();

  // Add all points as walls initially, except start and end
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if ((x !== startPoint.x || y !== startPoint.y) && 
          (x !== endPoint.x || y !== endPoint.y)) {
        walls.add(`${x},${y}`);
      }
    }
  }

  // Directions: right, down, left, up
  const directions = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  // Fisher-Yates shuffle for random direction order
  const shuffleDirections = () => {
    const shuffled = [...directions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const isValid = (x: number, y: number) => {
    return x >= 0 && x < width && y >= 0 && y < height;
  };

  const dfs = (x: number, y: number) => {
    const key = `${x},${y}`;
    visited.add(key);
    paths.add(key);
    walls.delete(key);

    // Get random direction order
    const shuffledDirs = shuffleDirections();

    // Try each direction in random order
    for (const [dx, dy] of shuffledDirs) {
      const nextX = x + dx * 2;
      const nextY = y + dy * 2;
      const midX = x + dx;
      const midY = y + dy;

      if (isValid(nextX, nextY) && !visited.has(`${nextX},${nextY}`)) {
        // Remove wall between current and next cell
        const midKey = `${midX},${midY}`;
        walls.delete(midKey);
        paths.add(midKey);
        dfs(nextX, nextY);
      }
    }
  };

  // Start DFS from start point
  dfs(startPoint.x, startPoint.y);

  // Ensure path to end point
  if (!paths.has(`${endPoint.x},${endPoint.y}`)) {
    const pathToEnd = createPath(
      { x: startPoint.x, y: startPoint.y },
      { x: endPoint.x, y: endPoint.y }
    );
    pathToEnd.forEach(point => {
      const key = `${point.x},${point.y}`;
      walls.delete(key);
      paths.add(key);
    });
  }

  // Convert walls set to array of points
  return Array.from(walls).map(key => {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  });
};

// Random Wall Generation
export const generateRandomWalls = (
  width: number,
  height: number,
  startPoint: Point,
  endPoint: Point,
  density: number = 0.3
): Point[] => {
  const walls: Point[] = [];
  const wallSet = new Set<string>();
  const isPointEqual = (p1: Point, p2: Point) => p1.x === p2.x && p1.y === p2.y;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const point = { x, y };
      const key = `${x},${y}`;
      if (
        Math.random() < density && 
        !isPointEqual(point, startPoint) &&
        !isPointEqual(point, endPoint)
      ) {
        walls.push(point);
        wallSet.add(key);
      }
    }
  }

  return walls;
};
