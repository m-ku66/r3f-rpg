export type EntityId = string;

// Base stats that any unit would have
export interface BaseStats {
  hp: number;
  maxHp: number;
  movement: number;
  jump: number;
  attack: number;
  defense: number;
}

// Types of units
export enum UnitType {
  WARRIOR = "warrior",
  ARCHER = "archer",
  MAGE = "mage",
  // Add more as needed
}

// Abilities/actions a unit can perform
export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  range: number;
  area: number;
  effect: (target: EntityId) => void;
}

// The actual unit data
export interface UnitData {
  id: EntityId;
  name: string;
  type: UnitType;
  position: [number, number, number];
  stats: BaseStats;
  abilities: Ability[];
  modelPath?: string; // Path to 3D model if using custom models
  textureMap?: string; // Path to texture
  currentState: "idle" | "moving" | "attacking" | "defending" | "dead";
}

// Player type
export interface Player {
  id: EntityId;
  name: string;
  faction: "player" | "enemy" | "neutral";
  unitIds: EntityId[]; // References to units in the global unit store
  resources: {
    gold: number;
    // Other resources
  };
}

// Game cell types
export interface GridCell {
  x: number;
  y: number;
  z: number;
  traversable: boolean;
  terrain: TerrainType;
  occupiedBy: EntityId | null;
}

export enum TerrainType {
  GRASS = "grass",
  WATER = "water",
  MOUNTAIN = "mountain",
  FOREST = "forest",
  // Add more as needed
}

// Game actions
export type GameAction =
  | { type: "MOVE"; unitId: EntityId; targetPosition: [number, number, number] }
  | { type: "ATTACK"; unitId: EntityId; targetId: EntityId; abilityId: string }
  | { type: "END_TURN" }
  | { type: "SELECT_UNIT"; unitId: EntityId | null }
  | { type: "SELECT_ABILITY"; abilityId: string | null };
