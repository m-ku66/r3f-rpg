import { create } from "zustand";
import { createNoise2D } from "simplex-noise";
import { v4 as uuidv4 } from "uuid";

// Type for grid cell (moved from Terrain.tsx)
export type GridCell = {
  x: number;
  y: number;
  z: number;
  traversable: boolean;
};

// Type for game unit
export type Unit = {
  id: string;
  position: [number, number, number];
  movement: number;
  jump: number;
};

// Core game state
type GameState = {
  // Terrain state
  terrain: {
    grid: GridCell[];
    width: number;
    height: number;
    depth: number;
    noiseScale: number;
  };
  // Units state
  units: Record<string, Unit>;
  selectedUnitId: string | null;
  // Camera state
  camera: {
    rotation: number;
    position: [number, number, number];
    target: [number, number, number];
    zoom: number;
  };
  // Turn-based system
  currentTurn: "player" | "enemy";
  // Action states
  selectedAction: "move" | "attack" | null;
  highlightedCells: GridCell[];
  // Path for unit movement
  currentPath: GridCell[];
  // Event system for observer pattern
  gameEvents: Record<string, Function[]>;
};

// Helper function to generate terrain
function generateTerrainGrid(
  width: number,
  height: number,
  depth: number,
  noiseScale: number
): GridCell[] {
  const noise2D = createNoise2D();
  const xOffset = width / 2;
  const zOffset = depth / 2;
  const yOffset = height / 2;

  const scale = noiseScale;
  const noiseAmplitude = height;
  const octaves = 4;
  const persistence = 0.5;
  const lacunarity = 2.0;

  function generateOctaveNoise(x: number, z: number): number {
    let amplitude = 1;
    let frequency = 1;
    let noiseValue = 0;

    for (let i = 0; i < octaves; i++) {
      const nx = (x * frequency) / scale;
      const nz = (z * frequency) / scale;
      noiseValue += amplitude * noise2D(nx, nz);
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return (noiseValue + 1) / 2;
  }

  const cells: GridCell[] = [];

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      const noiseValue = generateOctaveNoise(x, z);
      const stackHeight = Math.max(1, Math.floor(noiseValue * noiseAmplitude));

      for (let y = 0; y < stackHeight; y++) {
        cells.push({
          x: x - xOffset,
          y: y - yOffset,
          z: z - zOffset,
          traversable: y === stackHeight - 1, // Only top cells are traversable
        });
      }
    }
  }

  return cells;
}

// A* pathfinding helpers
function heuristic(a: GridCell, b: GridCell): number {
  const horizontalDist = Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
  const verticalDist = Math.abs(a.y - b.y);
  return horizontalDist + verticalDist * 1.5; // Vertical movement costs more
}

function getNeighbors(cell: GridCell, grid: GridCell[]): GridCell[] {
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

function aStarPathfinding(
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

  while (openSet.length > 0) {
    const current = openSet.reduce((a, b) =>
      (fScore.get(getCellKey(a)) || Infinity) <
      (fScore.get(getCellKey(b)) || Infinity)
        ? a
        : b
    );

    const currentKey = getCellKey(current);

    if (
      current.x === target.x &&
      current.y === target.y &&
      current.z === target.z
    ) {
      return reconstructPath(current, cameFrom);
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(currentKey);

    const neighbors = getNeighbors(current, grid);

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

  return [];
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

// The store type combining state and actions
type GameStore = GameState & {
  // Terrain actions
  generateTerrain: (
    width: number,
    height: number,
    depth: number,
    noiseScale: number
  ) => void;

  // Unit actions
  addUnit: (unit: Omit<Unit, "id">) => string;
  selectUnit: (id: string | null) => void;
  moveUnit: (id: string, position: [number, number, number]) => void;
  calculateReachableCells: (unitId: string) => void;

  // Camera actions
  rotateCamera: (direction: "left" | "right") => void;
  resetCamera: () => void;

  // Game flow actions
  startTurn: (player: "player" | "enemy") => void;
  endTurn: () => void;

  // Event system (Observer pattern)
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  emit: (event: string, ...args: any[]) => void;

  // A* Pathfinding
  findPath: (unitId: string, targetCell: GridCell) => void;
  executePath: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  terrain: {
    grid: [],
    width: 20,
    height: 10,
    depth: 20,
    noiseScale: 30,
  },
  units: {},
  selectedUnitId: null,
  camera: {
    rotation: 45,
    position: [10, 10, 10],
    target: [0, 0, 0],
    zoom: 0.5,
  },
  currentTurn: "player",
  selectedAction: null,
  highlightedCells: [],
  currentPath: [],
  gameEvents: {},

  // Terrain actions
  generateTerrain: (width, height, depth, noiseScale) => {
    const grid = generateTerrainGrid(width, height, depth, noiseScale);
    set({
      terrain: {
        grid,
        width,
        height,
        depth,
        noiseScale,
      },
    });
    get().emit("terrainGenerated", grid);
  },

  // Unit actions
  addUnit: (unit) => {
    const id = uuidv4();
    set((state) => ({
      units: {
        ...state.units,
        [id]: {
          ...unit,
          id,
        },
      },
    }));
    get().emit("unitAdded", id);
    return id;
  },

  selectUnit: (id) => {
    set({ selectedUnitId: id });
    if (id) {
      get().calculateReachableCells(id);
      get().emit("unitSelected", id);
    } else {
      set({ highlightedCells: [], currentPath: [] });
      get().emit("unitDeselected");
    }
  },

  moveUnit: (id, position) => {
    set((state) => ({
      units: {
        ...state.units,
        [id]: {
          ...state.units[id],
          position,
        },
      },
      highlightedCells: [],
      currentPath: [],
    }));
    get().emit("unitMoved", id, position);
  },

  calculateReachableCells: (unitId) => {
    const { units, terrain } = get();
    const unit = units[unitId];
    if (!unit) return;

    // Find the unit's current cell
    const unitCell = terrain.grid.find((cell) => {
      const [ux, uy, uz] = unit.position;
      return (
        Math.abs(cell.x - ux) < 0.1 &&
        Math.abs(cell.y - uy) < 0.1 &&
        Math.abs(cell.z - uz) < 0.1 &&
        cell.traversable
      );
    });

    if (!unitCell) return;

    // Use a queue-based approach to find all reachable cells
    const reachable: GridCell[] = [];
    const visited = new Set<string>();
    const queue: { cell: GridCell; movementCost: number; jumpCost: number }[] =
      [{ cell: unitCell, movementCost: 0, jumpCost: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const cellKey = `${current.cell.x},${current.cell.y},${current.cell.z}`;

      if (visited.has(cellKey)) continue;
      visited.add(cellKey);
      reachable.push(current.cell);

      const neighbors = getNeighbors(current.cell, terrain.grid);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y},${neighbor.z}`;
        if (visited.has(neighborKey)) continue;

        const horizontalDistance =
          Math.abs(neighbor.x - unitCell.x) + Math.abs(neighbor.z - unitCell.z);

        const heightDifference = neighbor.y - current.cell.y;
        // Jumping up costs more than moving down
        const newJumpCost =
          current.jumpCost + (heightDifference > 0 ? heightDifference : 0);
        const newMovementCost = current.movementCost + 1;

        const totalHeightDifference = Math.abs(neighbor.y - unitCell.y);

        if (
          neighbor.traversable &&
          newMovementCost <= unit.movement &&
          newJumpCost <= unit.jump &&
          totalHeightDifference <= unit.jump
        ) {
          queue.push({
            cell: neighbor,
            movementCost: newMovementCost,
            jumpCost: newJumpCost,
          });
        }
      }
    }

    set({ highlightedCells: reachable });
    get().emit("reachableCellsCalculated", reachable);
  },

  // Camera actions
  rotateCamera: (direction) => {
    set((state) => {
      const newRotation =
        direction === "left"
          ? (state.camera.rotation + 45) % 360
          : (state.camera.rotation - 45) % 360;

      return {
        camera: {
          ...state.camera,
          rotation: newRotation,
        },
      };
    });
    get().emit("cameraRotated", get().camera.rotation);
  },

  resetCamera: () => {
    set((state) => ({
      camera: {
        ...state.camera,
        rotation: 45,
      },
    }));
    get().emit("cameraReset");
  },

  // Game flow actions
  startTurn: (player) => {
    set({ currentTurn: player });
    get().emit("turnStarted", player);
  },

  endTurn: () => {
    const nextTurn = get().currentTurn === "player" ? "enemy" : "player";
    set({
      currentTurn: nextTurn,
      selectedUnitId: null,
      selectedAction: null,
      highlightedCells: [],
      currentPath: [],
    });
    get().emit("turnEnded");
    get().emit("turnStarted", nextTurn);
  },

  // Event system (Observer pattern)
  on: (event, callback) => {
    set((state) => {
      const events = state.gameEvents[event] || [];
      return {
        gameEvents: {
          ...state.gameEvents,
          [event]: [...events, callback],
        },
      };
    });
  },

  off: (event, callback) => {
    set((state) => {
      const events = state.gameEvents[event] || [];
      return {
        gameEvents: {
          ...state.gameEvents,
          [event]: events.filter((cb) => cb !== callback),
        },
      };
    });
  },

  emit: (event, ...args) => {
    const events = get().gameEvents[event] || [];
    events.forEach((callback) => {
      callback(...args);
    });
  },

  // A* Pathfinding
  findPath: (unitId, targetCell) => {
    const { units, terrain, highlightedCells } = get();
    const unit = units[unitId];

    if (!unit) return;

    // Check if the target cell is reachable
    const isReachable = highlightedCells.some(
      (cell) =>
        cell.x === targetCell.x &&
        cell.y === targetCell.y &&
        cell.z === targetCell.z
    );

    if (!isReachable) return;

    // Find the unit's current cell
    const unitCell = terrain.grid.find((cell) => {
      const [ux, uy, uz] = unit.position;
      return (
        Math.abs(cell.x - ux) < 0.1 &&
        Math.abs(cell.y - uy) < 0.1 &&
        Math.abs(cell.z - uz) < 0.1 &&
        cell.traversable
      );
    });

    if (!unitCell) return;

    // Use the A* algorithm to find the path
    const path = aStarPathfinding(unitCell, targetCell, terrain.grid);

    if (path.length > 0) {
      set({ currentPath: path });
      get().emit("pathFound", path);
    }
  },

  executePath: () => {
    const { currentPath, selectedUnitId, units } = get();

    if (!selectedUnitId || currentPath.length < 2) return;

    const lastCell = currentPath[currentPath.length - 1];
    get().moveUnit(selectedUnitId, [lastCell.x, lastCell.y, lastCell.z]);
    set({ currentPath: [] });
    get().emit("pathExecuted");
  },
}));
