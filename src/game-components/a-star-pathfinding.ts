export type GridCell = {
  x: number;
  y: number;
  z: number;
  traversable: boolean;
};

export function aStarPathfinding(
  start: GridCell,
  target: GridCell,
  grid: GridCell[]
): GridCell[] {
  const openSet: GridCell[] = [start];
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, GridCell>();

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const getCellKey = (cell: GridCell) => `${cell.x},${cell.y},${cell.z}`;
  const startKey = getCellKey(start);

  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, target));

  console.log("Starting A* pathfinding from", start, "to", target);

  while (openSet.length > 0) {
    const current = openSet.reduce((a, b) =>
      (fScore.get(getCellKey(a)) || Infinity) <
      (fScore.get(getCellKey(b)) || Infinity)
        ? a
        : b
    );

    const currentKey = getCellKey(current);
    console.log("Current cell:", current);

    if (
      current.x === target.x &&
      current.y === target.y &&
      current.z === target.z
    ) {
      console.log("Path found!");
      return reconstructPath(current, cameFrom);
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(currentKey);

    const neighbors = getNeighbors(current, grid);
    console.log(`Found ${neighbors.length} neighbors for current cell`);

    for (const neighbor of neighbors) {
      const neighborKey = getCellKey(neighbor);

      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Calculate movement cost including vertical movement
      const heightDifference = neighbor.y - current.y;
      const movementCost =
        1 +
        (heightDifference > 0
          ? heightDifference
          : Math.abs(heightDifference) / 2);
      const tentativeGScore =
        (gScore.get(currentKey) || Infinity) + movementCost;

      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
        continue;
      }

      cameFrom.set(neighborKey, current);
      gScore.set(neighborKey, tentativeGScore);
      fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, target));
    }
  }

  console.log("No path found");
  return [];
}

function heuristic(a: GridCell, b: GridCell): number {
  // Modified Manhattan distance that considers vertical movement cost
  const horizontalDist = Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
  const verticalDist = Math.abs(a.y - b.y);
  return horizontalDist + verticalDist * 1.5; // Vertical movement costs more
}

function reconstructPath(
  current: GridCell,
  cameFrom: Map<string, GridCell>
): GridCell[] {
  const path = [current];
  let currentKey = `${current.x},${current.y},${current.z}`;

  while (cameFrom.has(currentKey)) {
    current = cameFrom.get(currentKey)!;
    path.unshift(current);
    currentKey = `${current.x},${current.y},${current.z}`;
  }

  return path;
}

export function getNeighbors(cell: GridCell, grid: GridCell[]): GridCell[] {
  const directions = [
    // Horizontal movement
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
    // Diagonal movement
    { x: 1, y: 0, z: 1 },
    { x: 1, y: 0, z: -1 },
    { x: -1, y: 0, z: 1 },
    { x: -1, y: 0, z: -1 },
    // Vertical movement
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    // Diagonal vertical movement
    { x: 1, y: 1, z: 0 },
    { x: -1, y: 1, z: 0 },
    { x: 0, y: 1, z: 1 },
    { x: 0, y: 1, z: -1 },
    { x: 1, y: -1, z: 0 },
    { x: -1, y: -1, z: 0 },
    { x: 0, y: -1, z: 1 },
    { x: 0, y: -1, z: -1 },
  ];

  return grid.filter((n) => {
    const matchingDir = directions.find(
      (dir) =>
        n.x === cell.x + dir.x &&
        n.y === cell.y + dir.y &&
        n.z === cell.z + dir.z
    );

    return matchingDir && n.traversable;
  });
}
