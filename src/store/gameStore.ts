import { create } from "zustand";
import { createNoise2D } from "simplex-noise";
import { v4 as uuidv4 } from "uuid";
import {
  EntityId,
  UnitData,
  Player,
  GridCell,
  TerrainType,
  GameAction,
  UnitType,
  BaseStats,
  UnitAttributes,
} from "../types/game";

// Core game state
interface GameState {
  // Terrain state
  terrain: {
    grid: GridCell[];
    width: number;
    height: number;
    depth: number;
    noiseScale: number;
  };

  // Game entities
  units: Record<EntityId, UnitData>;
  players: Record<EntityId, Player>;

  // Game state
  currentTurn: EntityId; // ID of the current player
  currentPhase: "movement" | "action" | "end";
  selectedUnitId: EntityId | null;
  selectedAbilityId: string | null;

  // Camera state
  camera: {
    rotation: number;
    position: [number, number, number];
    target: [number, number, number];
    zoom: number;
  };

  // Pathfinding and highlighting
  highlightedCells: GridCell[];
  currentPath: GridCell[];

  // Event system for observer pattern
  gameEvents: Record<string, Function[]>;
}

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
          terrain: TerrainType.GRASS, // Default terrain type
          occupiedBy: null,
        });
      }
    }
  }

  return cells;
}

// Create default unit stats based on type
function createDefaultStats(type: UnitType): BaseStats {
  switch (type) {
    case UnitType.WARRIOR:
      return {
        level: 1,
        exp: 0,
        hp: 55,
        maxHp: 55,
        patk: 8,
        matk: 2,
        mp: 5,
        maxMp: 5,
        sp: 40,
        maxSp: 40,
        range: 1,
        def: 20,
        res: 5,
        agi: 4,
        skill: 20,
        luck: 5,
        wis: 1,
        mov: 4,
        jump: 2,
      };
    case UnitType.ARCHER:
      return {
        level: 1,
        exp: 0,
        hp: 75,
        maxHp: 75,
        patk: 6,
        matk: 3,
        mp: 5,
        maxMp: 5,
        sp: 30,
        maxSp: 30,
        range: 5,
        def: 10,
        res: 5,
        agi: 8,
        skill: 25,
        luck: 30,
        wis: 3,
        mov: 5,
        jump: 2,
      };
    case UnitType.MAGE:
      return {
        level: 1,
        exp: 0,
        hp: 60,
        maxHp: 60,
        patk: 2,
        matk: 10,
        mp: 30,
        maxMp: 30,
        sp: 5,
        maxSp: 5,
        range: 3,
        def: 2,
        res: 6,
        agi: 3,
        skill: 3,
        luck: 4,
        wis: 10,
        mov: 3,
        jump: 1,
      };
    default:
      return {
        level: 1,
        exp: 0,
        hp: 80,
        maxHp: 80,
        patk: 5,
        matk: 5,
        mp: 10,
        maxMp: 10,
        sp: 5,
        maxSp: 5,
        range: 1,
        def: 3,
        res: 3,
        agi: 4,
        skill: 4,
        luck: 4,
        wis: 4,
        mov: 4,
        jump: 2,
      };
  }
}

// Create default attributes based on type
function createDefaultAttributes(type: UnitType): UnitAttributes {
  switch (type) {
    case UnitType.WARRIOR:
      return {
        hitRate: 90,
        evasionRate: 5,
        resolve: 40,
      };
    case UnitType.ARCHER:
      return {
        hitRate: 95,
        evasionRate: 20,
        resolve: 5,
      };
    case UnitType.MAGE:
      return {
        hitRate: 85,
        evasionRate: 5,
        resolve: 5,
      };
    default:
      return {
        hitRate: 90,
        evasionRate: 5,
        resolve: 5,
      };
  }
}

// All the actions and derived state for our game
interface GameActions {
  // Terrain actions
  generateTerrain: (
    width: number,
    height: number,
    depth: number,
    noiseScale: number
  ) => void;

  // Unit & Player actions
  createPlayer: (
    name: string,
    faction: "player" | "enemy" | "neutral"
  ) => EntityId;
  createUnit: (
    playerId: EntityId,
    type: UnitType,
    position: [number, number, number],
    name?: string
  ) => EntityId;
  selectUnit: (id: EntityId | null) => void;
  selectAbility: (id: string | null) => void;
  moveUnit: (id: EntityId, position: [number, number, number]) => void;

  // Game flow actions
  dispatchAction: (action: GameAction) => void;
  startTurn: (playerId: EntityId) => void;
  endTurn: () => void;

  // Pathfinding and movement
  calculateReachableCells: (unitId: EntityId) => void;
  findPath: (unitId: EntityId, targetCell: GridCell) => void;
  executePath: () => void;

  // Camera actions
  rotateCamera: (direction: "left" | "right") => void;
  resetCamera: () => void;

  // Event system (Observer pattern)
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  emit: (event: string, ...args: any[]) => void;
}

// Combine state and actions
type GameStore = GameState & GameActions;

// Create the store
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
  players: {},
  currentTurn: "",
  currentPhase: "movement",
  selectedUnitId: null,
  selectedAbilityId: null,
  camera: {
    rotation: 45,
    position: [10, 10, 10],
    target: [0, 0, 0],
    zoom: 0.5,
  },
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

  // Player and Unit actions
  createPlayer: (name, faction) => {
    const id = uuidv4();
    set((state) => ({
      players: {
        ...state.players,
        [id]: {
          id,
          name,
          faction,
          unitIds: [],
          resources: {
            gold: faction === "player" ? 1000 : 500,
          },
        },
      },
    }));

    // If this is the first player, set them as current turn
    if (Object.keys(get().players).length === 0) {
      get().startTurn(id);
    }

    get().emit("playerCreated", id);
    return id;
  },

  createUnit: (
    playerId,
    type,
    position,
    name = `${type}-${uuidv4().slice(0, 4)}`
  ) => {
    const id = uuidv4();
    const stats = createDefaultStats(type);
    const attributes = createDefaultAttributes(type);

    // Create the unit
    set((state) => ({
      units: {
        ...state.units,
        [id]: {
          id,
          name,
          type,
          position,
          stats,
          attributes,
          abilities: [],
          currentState: "idle",
        },
      },
    }));

    // Add the unit to the player's roster
    set((state) => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId],
          unitIds: [...state.players[playerId].unitIds, id],
        },
      },
    }));

    // Update the cell occupation
    const cellIndex = get().terrain.grid.findIndex(
      (cell) =>
        cell.x === position[0] &&
        cell.y === position[1] &&
        cell.z === position[2]
    );

    if (cellIndex !== -1) {
      set((state) => {
        const newGrid = [...state.terrain.grid];
        newGrid[cellIndex] = {
          ...newGrid[cellIndex],
          occupiedBy: id,
        };

        return {
          terrain: {
            ...state.terrain,
            grid: newGrid,
          },
        };
      });
    }

    get().emit("unitCreated", id, playerId);
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

  selectAbility: (id) => {
    set({ selectedAbilityId: id });
    if (id) {
      get().emit("abilitySelected", id);
    } else {
      get().emit("abilityDeselected");
    }
  },

  moveUnit: (id, position) => {
    // Update the unit position
    set((state) => ({
      units: {
        ...state.units,
        [id]: {
          ...state.units[id],
          position,
          currentState: "idle",
        },
      },
      highlightedCells: [],
      currentPath: [],
    }));

    // Update cell occupation
    const { terrain } = get();

    // Find old cell and clear it
    const oldCellIndex = terrain.grid.findIndex(
      (cell) => cell.occupiedBy === id
    );

    if (oldCellIndex !== -1) {
      set((state) => {
        const newGrid = [...state.terrain.grid];
        newGrid[oldCellIndex] = {
          ...newGrid[oldCellIndex],
          occupiedBy: null,
        };

        return {
          terrain: {
            ...state.terrain,
            grid: newGrid,
          },
        };
      });
    }

    // Find new cell and set it
    const newCellIndex = terrain.grid.findIndex(
      (cell) =>
        Math.abs(cell.x - position[0]) < 0.1 &&
        Math.abs(cell.y - position[1]) < 0.1 &&
        Math.abs(cell.z - position[2]) < 0.1
    );

    if (newCellIndex !== -1) {
      set((state) => {
        const newGrid = [...state.terrain.grid];
        newGrid[newCellIndex] = {
          ...newGrid[newCellIndex],
          occupiedBy: id,
        };

        return {
          terrain: {
            ...state.terrain,
            grid: newGrid,
          },
        };
      });
    }

    get().emit("unitMoved", id, position);
  },

  // Game flow actions
  dispatchAction: (action) => {
    switch (action.type) {
      case "MOVE":
        get().moveUnit(action.unitId, action.targetPosition);
        break;
      case "ATTACK":
        // Implement attack logic
        break;
      case "SELECT_UNIT":
        get().selectUnit(action.unitId);
        break;
      case "SELECT_ABILITY":
        get().selectAbility(action.abilityId);
        break;
      case "END_TURN":
        get().endTurn();
        break;
    }
  },

  startTurn: (playerId) => {
    set({
      currentTurn: playerId,
      currentPhase: "movement",
      selectedUnitId: null,
      selectedAbilityId: null,
    });
    get().emit("turnStarted", playerId);
  },

  endTurn: () => {
    const { players, currentTurn } = get();
    const playerIds = Object.keys(players);

    if (playerIds.length === 0) return;

    const currentIndex = playerIds.indexOf(currentTurn);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextIndex];

    set({
      currentPhase: "movement",
      selectedUnitId: null,
      selectedAbilityId: null,
      highlightedCells: [],
      currentPath: [],
    });

    get().emit("turnEnded", currentTurn);
    get().startTurn(nextPlayerId);
  },

  // Pathfinding and movement
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

      // Don't add occupied cells to reachable list (except the starting cell)
      if (!current.cell.occupiedBy || current.cell.occupiedBy === unitId) {
        reachable.push(current.cell);
      }

      // Don't continue pathfinding from occupied cells
      if (current.cell.occupiedBy && current.cell.occupiedBy !== unitId) {
        continue;
      }

      // Find neighbors
      const neighbors = terrain.grid.filter((n) => {
        // Check if it's a valid neighbor (adjacent horizontally, vertically, or diagonally)
        const dx = Math.abs(n.x - current.cell.x);
        const dy = Math.abs(n.y - current.cell.y);
        const dz = Math.abs(n.z - current.cell.z);

        const isAdjacent =
          // Horizontal or vertical movement
          ((dx === 1 && dy === 0 && dz === 0) ||
            (dx === 0 && dy === 1 && dz === 0) ||
            (dx === 0 && dy === 0 && dz === 1) ||
            // Diagonal movement on same level
            (dx === 1 && dy === 0 && dz === 1)) &&
          // Must be traversable
          n.traversable;

        return isAdjacent;
      });

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y},${neighbor.z}`;
        if (visited.has(neighborKey)) continue;

        const heightDifference = neighbor.y - current.cell.y;
        // Jumping up costs more than moving down
        const newJumpCost =
          current.jumpCost + (heightDifference > 0 ? heightDifference : 0);
        const newMovementCost = current.movementCost + 1;

        const totalHeightDifference = Math.abs(neighbor.y - unitCell.y);

        if (
          neighbor.traversable &&
          newMovementCost <= unit.stats.mov &&
          newJumpCost <= unit.stats.jump &&
          totalHeightDifference <= unit.stats.jump
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

    // Use A* algorithm to find path
    // (Using the existing A* implementation)
    const path = aStarPathfinding(unitCell, targetCell, terrain.grid);

    if (path.length > 0) {
      set({ currentPath: path });
      get().emit("pathFound", path);
    }
  },

  executePath: () => {
    const { currentPath, selectedUnitId } = get();

    if (!selectedUnitId || currentPath.length < 2) return;

    const lastCell = currentPath[currentPath.length - 1];
    get().moveUnit(selectedUnitId, [lastCell.x, lastCell.y, lastCell.z]);
    set({ currentPath: [] });
    get().emit("pathExecuted");
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
}));

// A* pathfinding function
function aStarPathfinding(
  start: GridCell,
  target: GridCell,
  grid: GridCell[]
): GridCell[] {
  // A* implementation as before
  // ... (keep the same implementation)
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

    // Get neighbors
    const neighbors = grid.filter((n) => {
      const dx = Math.abs(n.x - current.x);
      const dy = Math.abs(n.y - current.y);
      const dz = Math.abs(n.z - current.z);

      const isAdjacent =
        // Horizontal or vertical movement
        ((dx === 1 && dy === 0 && dz === 0) ||
          (dx === 0 && dy === 1 && dz === 0) ||
          (dx === 0 && dy === 0 && dz === 1) ||
          // Diagonal movement on same level
          (dx === 1 && dy === 0 && dz === 1)) &&
        // Must be traversable and not occupied (or occupied by the target)
        n.traversable &&
        (!n.occupiedBy || n.occupiedBy === target.occupiedBy);

      return isAdjacent;
    });

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

function heuristic(a: GridCell, b: GridCell): number {
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
